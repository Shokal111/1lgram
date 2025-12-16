import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect(userId: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            query: { userId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to Nexus Chat server');
            this.emit('connected', true);
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            this.emit('connected', false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);

        if (this.socket) {
            this.socket.on(event, callback as any);
        }
    }

    off(event: string, callback?: Function): void {
        if (callback) {
            this.listeners.get(event)?.delete(callback);
            this.socket?.off(event, callback as any);
        } else {
            this.listeners.delete(event);
            this.socket?.off(event);
        }
    }

    private emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach(callback => callback(data));
    }

    send(event: string, data: any, callback?: Function): void {
        if (this.socket?.connected) {
            if (callback) {
                this.socket.emit(event, data, callback);
            } else {
                this.socket.emit(event, data);
            }
        } else {
            console.warn('⚠️ Socket not connected, message not sent');
        }
    }

    joinChat(chatId: string): void {
        this.send('chat:join', chatId);
    }

    leaveChat(chatId: string): void {
        this.send('chat:leave', chatId);
    }

    sendMessage(message: any, callback: Function): void {
        this.send('message:send', message, callback);
    }

    sendTyping(chatId: string, isTyping: boolean): void {
        this.send('user:typing', { chatId, isTyping });
    }

    markAsRead(messageId: string, chatId: string): void {
        this.send('message:read', { messageId, chatId });
    }

    addReaction(messageId: string, emoji: string): void {
        this.send('message:react', { messageId, emoji });
    }
}

export const socketService = new SocketService();
