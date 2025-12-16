import Dexie, { Table } from 'dexie';

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
    voiceData?: string; // Base64 audio data
    reactions: { emoji: string; userId: string }[];
    replyTo?: string;
    isEdited: boolean;
    isDeleted: boolean;
    readBy: string[];
    createdAt: number;
    updatedAt: number;
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

        this.version(1).stores({
            users: 'id, username, status, lastSeen, createdAt',
            messages: 'id, chatId, senderId, type, createdAt, [chatId+createdAt]',
            chats: 'id, type, createdAt, updatedAt, [type+updatedAt]',
            settings: 'id, key'
        });
    }
}

export const db = new NexusChatDB();

// Helper functions
export const dbHelpers = {
    // User operations
    async getCurrentUser(): Promise<DBUser | undefined> {
        const setting = await db.settings.get('currentUserId');
        if (!setting) return undefined;
        return db.users.get(setting.value);
    },

    async setCurrentUser(userId: string): Promise<void> {
        await db.settings.put({ id: 'currentUserId', key: 'currentUserId', value: userId });
    },

    async createUser(user: Omit<DBUser, 'createdAt' | 'lastSeen' | 'status'>): Promise<DBUser> {
        const newUser: DBUser = {
            ...user,
            status: 'online',
            lastSeen: Date.now(),
            createdAt: Date.now()
        };
        await db.users.add(newUser);
        await this.setCurrentUser(newUser.id);
        return newUser;
    },

    async updateUserStatus(userId: string, status: DBUser['status']): Promise<void> {
        await db.users.update(userId, { status, lastSeen: Date.now() });
    },

    // Chat operations
    async getChatWithLastMessage(chatId: string): Promise<{ chat: DBChat; lastMessage?: DBMessage } | undefined> {
        const chat = await db.chats.get(chatId);
        if (!chat) return undefined;

        const lastMessage = chat.lastMessageId
            ? await db.messages.get(chat.lastMessageId)
            : undefined;

        return { chat, lastMessage };
    },

    async getChatsWithLastMessages(): Promise<Array<{ chat: DBChat; lastMessage?: DBMessage; participants: DBUser[] }>> {
        const chats = await db.chats.orderBy('updatedAt').reverse().toArray();

        return Promise.all(chats.map(async (chat) => {
            const lastMessage = chat.lastMessageId
                ? await db.messages.get(chat.lastMessageId)
                : undefined;

            const participants = await db.users.where('id').anyOf(chat.participants).toArray();

            return { chat, lastMessage, participants };
        }));
    },

    async createChat(chat: Omit<DBChat, 'lastMessageId' | 'unreadCount' | 'isPinned' | 'isMuted' | 'createdAt' | 'updatedAt'>): Promise<DBChat> {
        const newChat: DBChat = {
            ...chat,
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await db.chats.add(newChat);
        return newChat;
    },

    async findDirectChat(userId1: string, userId2: string): Promise<DBChat | undefined> {
        const chats = await db.chats.where('type').equals('direct').toArray();
        return chats.find(chat =>
            chat.participants.includes(userId1) && chat.participants.includes(userId2) && chat.participants.length === 2
        );
    },

    // Message operations
    async getChatMessages(chatId: string, limit = 50, before?: number): Promise<DBMessage[]> {
        let query = db.messages.where('chatId').equals(chatId);

        if (before) {
            query = query.and(msg => msg.createdAt < before);
        }

        return query.reverse().limit(limit).toArray();
    },

    async addMessage(message: DBMessage): Promise<DBMessage> {
        await db.messages.add(message);
        await db.chats.update(message.chatId, {
            lastMessageId: message.id,
            updatedAt: Date.now()
        });
        return message;
    },

    async updateMessage(messageId: string, updates: Partial<DBMessage>): Promise<void> {
        await db.messages.update(messageId, { ...updates, updatedAt: Date.now() });
    },

    async deleteMessage(messageId: string): Promise<void> {
        await db.messages.update(messageId, { isDeleted: true, content: '', updatedAt: Date.now() });
    },

    async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
        const message = await db.messages.get(messageId);
        if (!message) return;

        const existingReactionIndex = message.reactions.findIndex(
            r => r.emoji === emoji && r.userId === userId
        );

        if (existingReactionIndex >= 0) {
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            message.reactions.push({ emoji, userId });
        }

        await db.messages.update(messageId, { reactions: message.reactions });
    },

    async markAsRead(messageId: string, userId: string): Promise<void> {
        const message = await db.messages.get(messageId);
        if (!message || message.readBy.includes(userId)) return;

        await db.messages.update(messageId, {
            readBy: [...message.readBy, userId]
        });
    },

    async searchMessages(query: string, chatId?: string): Promise<DBMessage[]> {
        const lowerQuery = query.toLowerCase();
        let messages = await db.messages.toArray();

        if (chatId) {
            messages = messages.filter(m => m.chatId === chatId);
        }

        return messages.filter(m =>
            m.content.toLowerCase().includes(lowerQuery) && !m.isDeleted
        ).slice(0, 50);
    },

    // Settings
    async getTheme(): Promise<string> {
        const setting = await db.settings.get('theme');
        return setting?.value || 'dark-cyber';
    },

    async setTheme(theme: string): Promise<void> {
        await db.settings.put({ id: 'theme', key: 'theme', value: theme });
    }
};

// Initialize with demo data if empty
export async function initializeDemoData(): Promise<void> {
    const userCount = await db.users.count();
    if (userCount > 0) return;

    // Create demo users
    const demoUsers: DBUser[] = [
        {
            id: 'user-demo-1',
            username: 'CyberNova',
            avatar: 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=CyberNova',
            status: 'online',
            lastSeen: Date.now(),
            createdAt: Date.now() - 86400000 * 7
        },
        {
            id: 'user-demo-2',
            username: 'NeonDrifter',
            avatar: 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=NeonDrifter',
            status: 'away',
            lastSeen: Date.now() - 300000,
            createdAt: Date.now() - 86400000 * 5
        },
        {
            id: 'user-demo-3',
            username: 'PixelPhantom',
            avatar: 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=PixelPhantom',
            status: 'offline',
            lastSeen: Date.now() - 3600000,
            createdAt: Date.now() - 86400000 * 3
        },
        {
            id: 'user-demo-4',
            username: 'SynthWave',
            avatar: 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=SynthWave',
            status: 'online',
            lastSeen: Date.now(),
            createdAt: Date.now() - 86400000 * 2
        }
    ];

    await db.users.bulkAdd(demoUsers);
}
