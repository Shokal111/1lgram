// Shared types between client and server

export interface User {
    id: string;
    username: string;
    avatar: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: number;
    createdAt: number;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'voice' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    voiceDuration?: number;
    reactions: MessageReaction[];
    replyTo?: string;
    isEdited: boolean;
    isDeleted: boolean;
    readBy: string[];
    createdAt: number;
    updatedAt: number;
}

export interface MessageReaction {
    emoji: string;
    userId: string;
}

export interface Chat {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    participants: string[];
    createdBy: string;
    lastMessage?: Message;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface TypingStatus {
    chatId: string;
    userId: string;
    isTyping: boolean;
}

// Socket.io Events
export interface ServerToClientEvents {
    'message:new': (message: Message) => void;
    'message:updated': (message: Message) => void;
    'message:deleted': (messageId: string, chatId: string) => void;
    'message:reaction': (messageId: string, reaction: MessageReaction) => void;
    'user:status': (userId: string, status: User['status']) => void;
    'user:typing': (status: TypingStatus) => void;
    'chat:created': (chat: Chat) => void;
    'chat:updated': (chat: Chat) => void;
    'users:list': (users: User[]) => void;
    'error': (message: string) => void;
}

export interface ClientToServerEvents {
    'message:send': (message: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'readBy' | 'isEdited' | 'isDeleted'>, callback: (message: Message) => void) => void;
    'message:edit': (messageId: string, content: string) => void;
    'message:delete': (messageId: string) => void;
    'message:react': (messageId: string, emoji: string) => void;
    'message:read': (messageId: string, chatId: string) => void;
    'user:register': (user: Omit<User, 'status' | 'lastSeen' | 'createdAt'>, callback: (user: User) => void) => void;
    'user:typing': (chatId: string, isTyping: boolean) => void;
    'chat:create': (chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'lastMessage' | 'unreadCount'>, callback: (chat: Chat) => void) => void;
    'chat:join': (chatId: string) => void;
    'chat:leave': (chatId: string) => void;
}

export type Theme = 'dark-cyber' | 'light-minimal' | 'retro-vaporwave';
