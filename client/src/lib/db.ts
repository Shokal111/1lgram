import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export interface DBUser {
    id: string;
    username: string;
    avatar: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: number;
    createdAt: number;
}

export interface DBMessage {
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
    expiresAt?: number; // Self-destruct timer
}

export interface DBChat {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    participants: string[];
    createdBy: string;
    lastMessageId?: string;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface DBSettings {
    id: string;
    key: string;
    value: string;
}

class NexusChatDB extends Dexie {
    users!: Table<DBUser, string>;
    messages!: Table<DBMessage, string>;
    chats!: Table<DBChat, string>;
    settings!: Table<DBSettings, string>;

    constructor() {
        super('NexusChatDB');
        // Version 2: Added expiresAt to messages
        this.version(2).stores({
            users: 'id, username, status, lastSeen, createdAt',
            messages: 'id, chatId, senderId, type, createdAt, [chatId+createdAt]',
            chats: 'id, type, createdAt, updatedAt, [type+updatedAt]',
            settings: 'id, key'
        });
    }

    async seed() {
        // Check if already seeded (by checking specific demo user)
        const demoUserExists = await this.users.get('u-neon-killer');
        if (demoUserExists) return;

        console.log('🌱 Seeding NexusDB with advanced cyberpunk data...');

        // Clear existing to ensure clean slate for demo
        await this.messages.clear();
        await this.chats.clear();
        await this.users.clear();

        // 1. Create Current User
        const meId = 'current-user';
        await this.users.add({
            id: meId,
            username: 'kult1337',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kult1337&backgroundColor=b6e3f4',
            status: 'online',
            lastSeen: Date.now(),
            createdAt: Date.now()
        });
        await this.settings.put({ id: 'currentUserId', key: 'currentUserId', value: meId });

        // 2. Create Demo Users
        const users = [
            { id: 'u-neon-killer', username: 'NeonKiller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NeonKiller&backgroundColor=c0aede', status: 'online' },
            { id: 'u-shadow-byte', username: 'ShadowByte', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowByte&backgroundColor=ffdfbf', status: 'busy' },
            { id: 'u-volt-queen', username: 'VoltQueen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoltQueen&backgroundColor=ffd5dc', status: 'away' },
            { id: 'u-net-runner', username: 'NetRunner_01', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NetRunner&backgroundColor=c0aede', status: 'offline' },
            { id: 'u-glitch-god', username: 'GlitchGod', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GlitchGod&backgroundColor=d1d4f9', status: 'online' }
        ];

        for (const u of users) {
            await this.users.add({ ...u, lastSeen: Date.now(), createdAt: Date.now() } as DBUser);
        }

        // 3. Create Chats & Messages

        // Chat 1: NeonKiller (Active conversion)
        const chat1Id = uuidv4();
        const time1 = Date.now();

        await this.messages.bulkAdd([
            { id: uuidv4(), chatId: chat1Id, senderId: 'u-neon-killer', content: 'Yo, did you see the new neural link update? 🧠', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time1 - 3600000, updatedAt: time1 },
            { id: uuidv4(), chatId: chat1Id, senderId: meId, content: 'Yeah, total game changer. The latency is practically zero.', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: ['u-neon-killer'], createdAt: time1 - 3500000, updatedAt: time1 },
            { id: uuidv4(), chatId: chat1Id, senderId: 'u-neon-killer', content: 'I\'m thinking of hacking the mainframe tonight. You in? 🌆', type: 'text', reactions: [{ emoji: '🔥', userId: meId }], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time1 - 3400000, updatedAt: time1 },
            { id: uuidv4(), chatId: chat1Id, senderId: meId, content: 'Always. Meet at the virtual plaza?', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: ['u-neon-killer'], createdAt: time1 - 100000, updatedAt: time1 },
            { id: uuidv4(), chatId: chat1Id, senderId: 'u-neon-killer', content: 'See you there. Don\'t be late. 🕶️', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [], createdAt: time1 - 50000, updatedAt: time1 }
        ]);

        await this.chats.add({
            id: chat1Id, type: 'direct', participants: [meId, 'u-neon-killer'], createdBy: 'system',
            unreadCount: 1, lastMessageId: 'latest', isPinned: true, isMuted: false, createdAt: time1, updatedAt: time1
        });

        // Chat 2: ShadowByte (Tech support / serious)
        const chat2Id = uuidv4();
        const time2 = Date.now() - 86400000; // Yesterday

        await this.messages.bulkAdd([
            { id: uuidv4(), chatId: chat2Id, senderId: 'u-shadow-byte', content: 'The encryption keys are ready.', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time2 - 10000, updatedAt: time2 },
            { id: uuidv4(), chatId: chat2Id, senderId: 'u-shadow-byte', content: 'Secure transfer initiating... 10%... 50%... 100%', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time2 - 5000, updatedAt: time2 },
            { id: uuidv4(), chatId: chat2Id, senderId: 'u-shadow-byte', content: 'Download complete. Delete this message.', type: 'text', reactions: [{ emoji: '👀', userId: meId }], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time2, updatedAt: time2 }
        ]);

        await this.chats.add({
            id: chat2Id, type: 'direct', participants: [meId, 'u-shadow-byte'], createdBy: 'system',
            unreadCount: 0, lastMessageId: 'latest', isPinned: false, isMuted: true, createdAt: time2, updatedAt: time2
        });

        // Chat 3: Cyberpunk Elite (Group)
        const chat3Id = uuidv4();
        const time3 = Date.now() - 100000;

        await this.messages.bulkAdd([
            { id: uuidv4(), chatId: chat3Id, senderId: 'u-volt-queen', content: 'Anyone checking the crypto markets? 📉', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time3 - 200000, updatedAt: time3 },
            { id: uuidv4(), chatId: chat3Id, senderId: 'u-glitch-god', content: 'Buy the dip! It\'s just a glitch in the matrix.', type: 'text', reactions: [{ emoji: '🚀', userId: 'u-volt-queen' }], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time3 - 150000, updatedAt: time3 },
            { id: uuidv4(), chatId: chat3Id, senderId: 'u-net-runner', content: 'I lost 50k credits last night...', type: 'text', reactions: [{ emoji: '💀', userId: 'u-glitch-god' }], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time3 - 100000, updatedAt: time3 },
            { id: uuidv4(), chatId: chat3Id, senderId: 'u-volt-queen', content: 'Ouch. F in the chat.', type: 'text', reactions: [], isEdited: false, isDeleted: false, readBy: [meId], createdAt: time3 - 50000, updatedAt: time3 }
        ]);

        await this.chats.add({
            id: chat3Id, type: 'group', name: 'Cyberpunk Elite', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=EliteGroup', participants: [meId, 'u-volt-queen', 'u-glitch-god', 'u-net-runner'], createdBy: 'system',
            unreadCount: 3, lastMessageId: 'latest', isPinned: false, isMuted: false, createdAt: time3, updatedAt: time3
        });

        console.log('✅ Seeding complete!');
    }
}

export const db = new NexusChatDB();

// Initialize
db.open().then(() => db.seed()).catch(err => console.error(err));

// Helper functions (kept same structure for compatibility)
export const dbHelpers = {
    async getCurrentUser() {
        const setting = await db.settings.get('currentUserId');
        if (!setting) return undefined;
        return db.users.get(setting.value);
    },
    async setCurrentUser(userId: string) {
        await db.settings.put({ id: 'currentUserId', key: 'currentUserId', value: userId });
    },
    async createUser(user: Omit<DBUser, 'createdAt' | 'lastSeen' | 'status'>) {
        const newUser = { ...user, status: 'online' as const, lastSeen: Date.now(), createdAt: Date.now() };
        await db.users.add(newUser);
        await this.setCurrentUser(newUser.id);
        return newUser;
    },
    async getChatsWithLastMessages() {
        const chats = await db.chats.orderBy('updatedAt').reverse().toArray();
        return Promise.all(chats.map(async (chat) => {
            // Find actual last message using index or query
            const lastMsg = await db.messages.where('chatId').equals(chat.id).reverse().first();
            const participants = await db.users.where('id').anyOf(chat.participants).toArray();
            return { chat, lastMessage: lastMsg, participants };
        }));
    },
    async getChatMessages(chatId: string, limit = 50) {
        return db.messages.where('chatId').equals(chatId).reverse().limit(limit).toArray();
    },
    async addMessage(message: DBMessage) {
        await db.messages.add(message);
        await db.chats.update(message.chatId, { updatedAt: Date.now(), lastMessageId: message.id });
        return message;
    },
    async markAsRead(messageId: string, userId: string) {
        const message = await db.messages.get(messageId);
        if (message && !message.readBy.includes(userId)) {
            await db.messages.update(messageId, { readBy: [...message.readBy, userId] });
        }
    },
    async createChat(chat: any) {
        const newChat = { ...chat, unreadCount: 0, isPinned: false, isMuted: false, createdAt: Date.now(), updatedAt: Date.now() };
        await db.chats.add(newChat);
        return newChat;
    }
    // ... add manual implementations for others if needed key helpers used in context
};
