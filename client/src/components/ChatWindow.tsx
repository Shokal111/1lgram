import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    ArrowLeft, MoreVertical, Phone, Video, Search,
    Users
} from 'lucide-react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { DBUser } from '../lib/db';

export default function ChatWindow() {
    const { activeChat, messages, currentUser, users, selectChat, typingUsers } = useChat();
    const { theme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const participants = activeChat
        ? users.filter(u => activeChat.participants.includes(u.id))
        : [];

    const otherUser = participants.find(p => p.id !== currentUser?.id);

    const chatName = activeChat?.type === 'group'
        ? activeChat.name
        : otherUser?.username || 'Unknown';

    const chatAvatar = activeChat?.type === 'group'
        ? activeChat.avatar
        : otherUser?.avatar;

    const chatStatus = activeChat?.type === 'group'
        ? `${participants.length} members`
        : otherUser?.status === 'online' ? 'Online' : 'Offline';

    const typingInChat = typingUsers.get(activeChat?.id || '') || [];
    const typingUsernames = typingInChat
        .filter(id => id !== currentUser?.id)
        .map(id => users.find(u => u.id === id)?.username || 'Someone');

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle scroll for scroll button
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const glassClass = theme === 'light-minimal' ? 'glass-light' : 'glass';

    return (
        <div className={`flex-1 flex flex-col h-full ${glassClass}`}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--border)' }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => selectChat(null)}
                        className={`p-2 rounded-lg md:hidden ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text)' }} />
                    </button>

                    {activeChat?.type === 'group' ? (
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background: theme === 'light-minimal'
                                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                    : 'linear-gradient(135deg, var(--primary), var(--secondary))'
                            }}
                        >
                            <Users className="w-5 h-5 text-white" />
                        </div>
                    ) : (
                        <Avatar
                            src={chatAvatar}
                            name={chatName}
                            size="md"
                            status={otherUser?.status}
                        />
                    )}

                    <div>
                        <h3
                            className={`font-semibold ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                }`}
                        >
                            {chatName}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {typingUsernames.length > 0
                                ? `${typingUsernames.join(', ')} typing...`
                                : chatStatus
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <Phone className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                        className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <Video className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                        className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <Search className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button
                        className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>
            </motion.div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-2"
            >
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => {
                        const sender = users.find(u => u.id === message.senderId);
                        const isMine = message.senderId === currentUser?.id;
                        const showAvatar = !isMine && (
                            index === 0 ||
                            messages[index - 1].senderId !== message.senderId
                        );

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                sender={sender}
                                isMine={isMine}
                                showAvatar={showAvatar}
                            />
                        );
                    })}
                </AnimatePresence>

                {/* Typing Indicator */}
                {typingUsernames.length > 0 && (
                    <TypingIndicator usernames={typingUsernames} />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        className={`
              absolute bottom-24 right-6 p-3 rounded-full shadow-lg
              ${theme === 'light-minimal'
                                ? 'bg-light-primary text-white'
                                : 'bg-[var(--primary)] text-[var(--bg)]'
                            }
            `}
                    >
                        <ArrowLeft className="w-5 h-5 rotate-[270deg]" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Message Input */}
            <MessageInput />
        </div>
    );
}
