import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, dbHelpers, DBUser, DBChat, DBMessage, initializeDemoData } from '../lib/db';
import { socketService } from '../lib/socket';
import { generateId, generateAvatarUrl } from '../lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';

interface ChatContextType {
    // User state
    currentUser: DBUser | null;
    users: DBUser[];
    isLoading: boolean;

    // Chat state
    chats: Array<{ chat: DBChat; lastMessage?: DBMessage; participants: DBUser[] }>;
    activeChat: DBChat | null;
    messages: DBMessage[];

    // UI state
    typingUsers: Map<string, string[]>;
    isConnected: boolean;

    // Actions
    createUser: (username: string) => Promise<DBUser>;
    selectChat: (chatId: string | null) => void;
    createDirectChat: (userId: string) => Promise<DBChat>;
    createGroupChat: (name: string, participantIds: string[]) => Promise<DBChat>;
    sendMessage: (content: string, type?: DBMessage['type'], fileData?: { url: string; name: string; size: number }) => Promise<void>;
    sendVoiceMessage: (audioData: string, duration: number) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    addReaction: (messageId: string, emoji: string) => Promise<void>;
    setTyping: (isTyping: boolean) => void;
    searchMessages: (query: string) => Promise<DBMessage[]>;
    loadMoreMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<DBUser | null>(null);
    const [activeChat, setActiveChat] = useState<DBChat | null>(null);
    const [messages, setMessages] = useState<DBMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Live queries for reactive data
    const users = useLiveQuery(() => db.users.toArray(), []) ?? [];
    const chats = useLiveQuery(() => dbHelpers.getChatsWithLastMessages(), []) ?? [];

    // Initialize app
    useEffect(() => {
        async function init() {
            try {
                await initializeDemoData();
                const user = await dbHelpers.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    socketService.connect(user.id);
                }
            } catch (error) {
                console.error('Failed to initialize:', error);
            } finally {
                setIsLoading(false);
            }
        }
        init();

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Socket event handlers
    useEffect(() => {
        socketService.on('connected', (connected: boolean) => {
            setIsConnected(connected);
        });

        socketService.on('message:new', async (message: DBMessage) => {
            await db.messages.put(message);
            if (message.chatId === activeChat?.id) {
                setMessages(prev => [...prev, message]);
            }
        });

        socketService.on('message:updated', async (message: DBMessage) => {
            await db.messages.put(message);
            setMessages(prev => prev.map(m => m.id === message.id ? message : m));
        });

        socketService.on('message:deleted', async (messageId: string) => {
            await dbHelpers.deleteMessage(messageId);
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, isDeleted: true, content: '' } : m
            ));
        });

        socketService.on('user:typing', ({ chatId, userId, isTyping }: { chatId: string; userId: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                const chatTypers = newMap.get(chatId) || [];

                if (isTyping && !chatTypers.includes(userId)) {
                    newMap.set(chatId, [...chatTypers, userId]);
                } else if (!isTyping) {
                    newMap.set(chatId, chatTypers.filter(id => id !== userId));
                }

                return newMap;
            });
        });

        socketService.on('user:status', async ({ userId, status }: { userId: string; status: DBUser['status'] }) => {
            await dbHelpers.updateUserStatus(userId, status);
        });

        return () => {
            socketService.off('connected');
            socketService.off('message:new');
            socketService.off('message:updated');
            socketService.off('message:deleted');
            socketService.off('user:typing');
            socketService.off('user:status');
        };
    }, [activeChat?.id]);

    // Load messages when active chat changes
    useEffect(() => {
        async function loadMessages() {
            if (activeChat) {
                const msgs = await dbHelpers.getChatMessages(activeChat.id);
                setMessages(msgs.reverse());
                socketService.joinChat(activeChat.id);
            } else {
                setMessages([]);
            }
        }
        loadMessages();
    }, [activeChat?.id]);

    const createUser = async (username: string): Promise<DBUser> => {
        const user = await dbHelpers.createUser({
            id: generateId(),
            username,
            avatar: generateAvatarUrl(username)
        });
        setCurrentUser(user);
        socketService.connect(user.id);
        return user;
    };

    const selectChat = (chatId: string | null) => {
        if (activeChat) {
            socketService.leaveChat(activeChat.id);
        }

        if (chatId) {
            const chatData = chats.find(c => c.chat.id === chatId);
            setActiveChat(chatData?.chat || null);
        } else {
            setActiveChat(null);
        }
    };

    const createDirectChat = async (userId: string): Promise<DBChat> => {
        if (!currentUser) throw new Error('No current user');

        // Check if chat already exists
        const existing = await dbHelpers.findDirectChat(currentUser.id, userId);
        if (existing) {
            setActiveChat(existing);
            return existing;
        }

        const chat = await dbHelpers.createChat({
            id: generateId(),
            type: 'direct',
            participants: [currentUser.id, userId],
            createdBy: currentUser.id
        });

        socketService.send('chat:create', chat, () => { });
        setActiveChat(chat);
        return chat;
    };

    const createGroupChat = async (name: string, participantIds: string[]): Promise<DBChat> => {
        if (!currentUser) throw new Error('No current user');

        const chat = await dbHelpers.createChat({
            id: generateId(),
            type: 'group',
            name,
            avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`,
            participants: [currentUser.id, ...participantIds],
            createdBy: currentUser.id
        });

        socketService.send('chat:create', chat, () => { });
        setActiveChat(chat);
        return chat;
    };

    const sendMessage = async (
        content: string,
        type: DBMessage['type'] = 'text',
        fileData?: { url: string; name: string; size: number }
    ): Promise<void> => {
        if (!currentUser || !activeChat) return;

        const message: DBMessage = {
            id: generateId(),
            chatId: activeChat.id,
            senderId: currentUser.id,
            content,
            type,
            fileUrl: fileData?.url,
            fileName: fileData?.name,
            fileSize: fileData?.size,
            reactions: [],
            isEdited: false,
            isDeleted: false,
            readBy: [currentUser.id],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await dbHelpers.addMessage(message);
        setMessages(prev => [...prev, message]);
        socketService.sendMessage(message, () => { });
    };

    const sendVoiceMessage = async (audioData: string, duration: number): Promise<void> => {
        if (!currentUser || !activeChat) return;

        const message: DBMessage = {
            id: generateId(),
            chatId: activeChat.id,
            senderId: currentUser.id,
            content: '🎤 Voice message',
            type: 'voice',
            voiceData: audioData,
            voiceDuration: duration,
            reactions: [],
            isEdited: false,
            isDeleted: false,
            readBy: [currentUser.id],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await dbHelpers.addMessage(message);
        setMessages(prev => [...prev, message]);
        socketService.sendMessage(message, () => { });
    };

    const editMessage = async (messageId: string, content: string): Promise<void> => {
        await dbHelpers.updateMessage(messageId, { content, isEdited: true });
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, content, isEdited: true } : m
        ));
        socketService.send('message:edit', { messageId, content });
    };

    const deleteMessage = async (messageId: string): Promise<void> => {
        await dbHelpers.deleteMessage(messageId);
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, isDeleted: true, content: '' } : m
        ));
        socketService.send('message:delete', messageId);
    };

    const addReaction = async (messageId: string, emoji: string): Promise<void> => {
        if (!currentUser) return;
        await dbHelpers.addReaction(messageId, emoji, currentUser.id);

        const message = await db.messages.get(messageId);
        if (message) {
            setMessages(prev => prev.map(m => m.id === messageId ? message : m));
        }

        socketService.addReaction(messageId, emoji);
    };

    const setTyping = (isTyping: boolean): void => {
        if (activeChat) {
            socketService.sendTyping(activeChat.id, isTyping);
        }
    };

    const searchMessages = async (query: string): Promise<DBMessage[]> => {
        return dbHelpers.searchMessages(query, activeChat?.id);
    };

    const loadMoreMessages = async (): Promise<void> => {
        if (!activeChat || messages.length === 0) return;

        const oldestMessage = messages[0];
        const olderMessages = await dbHelpers.getChatMessages(activeChat.id, 50, oldestMessage.createdAt);

        if (olderMessages.length > 0) {
            setMessages(prev => [...olderMessages.reverse(), ...prev]);
        }
    };

    return (
        <ChatContext.Provider value={{
            currentUser,
            users,
            isLoading,
            chats,
            activeChat,
            messages,
            typingUsers,
            isConnected,
            createUser,
            selectChat,
            createDirectChat,
            createGroupChat,
            sendMessage,
            sendVoiceMessage,
            editMessage,
            deleteMessage,
            addReaction,
            setTyping,
            searchMessages,
            loadMoreMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
