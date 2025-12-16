import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGINS = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

// CORS configuration
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) {
            callback(null, true);
            return;
        }
        if (CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*')) {
            callback(null, true);
        } else {
            console.log(`⚠️ CORS blocked origin: ${origin}`);
            callback(null, true); // Allow anyway for demo purposes
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: CORS_ORIGINS.includes('*') ? '*' : CORS_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// In-memory storage (for demo purposes - in production use a database)
interface User {
    id: string;
    username: string;
    avatar: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    socketId?: string;
}

interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'voice' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    voiceDuration?: number;
    voiceData?: string;
    reactions: { emoji: string; userId: string }[];
    replyTo?: string;
    isEdited: boolean;
    isDeleted: boolean;
    readBy: string[];
    createdAt: number;
    updatedAt: number;
}

interface Chat {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    participants: string[];
    createdBy: string;
}

const users = new Map<string, User>();
const chats = new Map<string, Chat>();
const messages = new Map<string, Message>();
const userSockets = new Map<string, string>(); // userId -> socketId

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/users', (req, res) => {
    res.json(Array.from(users.values()));
});

// Socket.io connection handling
io.on('connection', (socket: any) => {
    const userId = socket.handshake.query.userId as string;

    console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

    // Update user status
    if (userId) {
        userSockets.set(userId, socket.id);

        const user = users.get(userId);
        if (user) {
            user.status = 'online';
            user.socketId = socket.id;
            users.set(userId, user);
        }

        // Broadcast user online status
        socket.broadcast.emit('user:status', { userId, status: 'online' });

        // Send current users list
        socket.emit('users:list', Array.from(users.values()));
    }

    // Handle user registration
    socket.on('user:register', (userData: Omit<User, 'socketId'>, callback) => {
        const user: User = {
            ...userData,
            socketId: socket.id
        };
        users.set(user.id, user);
        userSockets.set(user.id, socket.id);

        console.log(`👤 User registered: ${user.username} (${user.id})`);

        // Broadcast new user to all
        io.emit('users:list', Array.from(users.values()));

        callback(user);
    });

    // Handle chat creation
    socket.on('chat:create', (chatData: Omit<Chat, 'id'>, callback) => {
        const chat: Chat = {
            ...chatData,
            id: uuidv4()
        };
        chats.set(chat.id, chat);

        console.log(`💬 Chat created: ${chat.type} - ${chat.id}`);

        // Notify all participants
        chat.participants.forEach(participantId => {
            const participantSocket = userSockets.get(participantId);
            if (participantSocket) {
                io.to(participantSocket).emit('chat:created', chat);
            }
        });

        callback(chat);
    });

    // Handle joining a chat room
    socket.on('chat:join', (chatId: string) => {
        socket.join(chatId);
        console.log(`📥 User ${userId} joined chat: ${chatId}`);
    });

    // Handle leaving a chat room
    socket.on('chat:leave', (chatId: string) => {
        socket.leave(chatId);
        console.log(`📤 User ${userId} left chat: ${chatId}`);
    });

    // Handle sending messages
    socket.on('message:send', (messageData: Partial<Message>, callback) => {
        const message: Message = {
            id: messageData.id || uuidv4(),
            chatId: messageData.chatId!,
            senderId: messageData.senderId!,
            content: messageData.content || '',
            type: messageData.type || 'text',
            fileUrl: messageData.fileUrl,
            fileName: messageData.fileName,
            fileSize: messageData.fileSize,
            voiceDuration: messageData.voiceDuration,
            voiceData: messageData.voiceData,
            reactions: messageData.reactions || [],
            replyTo: messageData.replyTo,
            isEdited: false,
            isDeleted: false,
            readBy: [messageData.senderId!],
            createdAt: messageData.createdAt || Date.now(),
            updatedAt: Date.now()
        };

        messages.set(message.id, message);

        // Broadcast to chat room (except sender)
        socket.to(message.chatId).emit('message:new', message);

        console.log(`📨 Message sent in chat ${message.chatId}: ${message.content.slice(0, 50)}...`);

        callback(message);
    });

    // Handle message editing
    socket.on('message:edit', ({ messageId, content }: { messageId: string; content: string }) => {
        const message = messages.get(messageId);
        if (message) {
            message.content = content;
            message.isEdited = true;
            message.updatedAt = Date.now();
            messages.set(messageId, message);

            // Broadcast to chat room
            io.to(message.chatId).emit('message:updated', message);

            console.log(`✏️ Message edited: ${messageId}`);
        }
    });

    // Handle message deletion
    socket.on('message:delete', (messageId: string) => {
        const message = messages.get(messageId);
        if (message) {
            message.isDeleted = true;
            message.content = '';
            message.updatedAt = Date.now();
            messages.set(messageId, message);

            // Broadcast to chat room
            io.to(message.chatId).emit('message:deleted', messageId, message.chatId);

            console.log(`🗑️ Message deleted: ${messageId}`);
        }
    });

    // Handle message reactions
    socket.on('message:react', ({ messageId, emoji }: { messageId: string; emoji: string }) => {
        const message = messages.get(messageId);
        if (message && userId) {
            const existingIndex = message.reactions.findIndex(
                r => r.emoji === emoji && r.userId === userId
            );

            if (existingIndex >= 0) {
                message.reactions.splice(existingIndex, 1);
            } else {
                message.reactions.push({ emoji, userId });
            }

            messages.set(messageId, message);

            // Broadcast to chat room
            io.to(message.chatId).emit('message:updated', message);

            console.log(`${emoji} Reaction on message: ${messageId}`);
        }
    });

    // Handle read receipts
    socket.on('message:read', ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        const message = messages.get(messageId);
        if (message && userId && !message.readBy.includes(userId)) {
            message.readBy.push(userId);
            messages.set(messageId, message);

            // Broadcast to chat room
            io.to(chatId).emit('message:updated', message);
        }
    });

    // Handle typing indicator
    socket.on('user:typing', ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
        socket.to(chatId).emit('user:typing', { chatId, userId, isTyping });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${userId} (socket: ${socket.id})`);

        if (userId) {
            const user = users.get(userId);
            if (user) {
                user.status = 'offline';
                user.socketId = undefined;
                users.set(userId, user);
            }
            userSockets.delete(userId);

            // Broadcast user offline status
            socket.broadcast.emit('user:status', { userId, status: 'offline' });
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚀 Nexus Chat Server is running!               ║
  ║                                                   ║
  ║   📍 HTTP:   http://localhost:${PORT}              ║
  ║   🔌 Socket: ws://localhost:${PORT}                ║
  ║                                                   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
  ║   CORS Origins: ${CORS_ORIGINS.join(', ')}             ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export { app, server, io };
