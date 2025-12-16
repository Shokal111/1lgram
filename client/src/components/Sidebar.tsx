import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    Search, Plus, Settings, LogOut, Users, MessageCircle,
    Moon, Sun, Palette, X, User, Hash
} from 'lucide-react';
import { formatTime, truncate } from '../lib/utils';
import { DBUser } from '../lib/db';
import Avatar from './Avatar';
import NewChatModal from './NewChatModal';

export default function Sidebar() {
    const { currentUser, chats, activeChat, selectChat, users } = useChat();
    const { theme, setTheme, themes } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);

    const filteredChats = chats.filter(({ chat, participants }) => {
        const searchLower = searchQuery.toLowerCase();
        if (chat.type === 'group') {
            return chat.name?.toLowerCase().includes(searchLower);
        }
        const otherUser = participants.find(p => p.id !== currentUser?.id);
        return otherUser?.username.toLowerCase().includes(searchLower);
    });

    const getChatName = (chat: typeof chats[0]['chat'], participants: DBUser[]) => {
        if (chat.type === 'group') return chat.name || 'Group Chat';
        const otherUser = participants.find(p => p.id !== currentUser?.id);
        return otherUser?.username || 'Unknown';
    };

    const getChatAvatar = (chat: typeof chats[0]['chat'], participants: DBUser[]) => {
        if (chat.type === 'group') return chat.avatar;
        const otherUser = participants.find(p => p.id !== currentUser?.id);
        return otherUser?.avatar;
    };

    const getChatStatus = (chat: typeof chats[0]['chat'], participants: DBUser[]) => {
        if (chat.type === 'group') return undefined;
        const otherUser = participants.find(p => p.id !== currentUser?.id);
        return otherUser?.status;
    };

    const glassClass = theme === 'light-minimal' ? 'glass-light' : 'glass';
    const borderClass = theme === 'light-minimal' ? 'border-light-border' : 'border-[var(--border)]';

    return (
        <>
            <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`w-80 h-full flex flex-col ${glassClass} border-r ${borderClass}`}
            >
                {/* Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={currentUser?.avatar}
                                name={currentUser?.username || ''}
                                size="md"
                                status="online"
                            />
                            <div>
                                <h2
                                    className={`font-semibold ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'}`}
                                >
                                    {currentUser?.username}
                                </h2>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'light-minimal'
                                    ? 'hover:bg-light-surface-2'
                                    : 'hover:bg-white/10'
                                }`}
                        >
                            <Settings className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: 'var(--text-muted)' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className={`
                w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all
                ${theme === 'light-minimal'
                                    ? 'bg-light-surface-2 border border-light-border text-light-text placeholder-light-muted focus:border-light-primary'
                                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] input-cyber'
                                }
              `}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-2">
                    <AnimatePresence>
                        {filteredChats.length > 0 ? (
                            filteredChats.map(({ chat, lastMessage, participants }, index) => (
                                <motion.button
                                    key={chat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => selectChat(chat.id)}
                                    className={`
                    w-full p-3 rounded-xl mb-1 flex items-center gap-3 text-left transition-all
                    ${activeChat?.id === chat.id
                                            ? theme === 'light-minimal'
                                                ? 'bg-light-primary/10 border border-light-primary/30'
                                                : 'bg-[var(--primary)]/10 border border-[var(--primary)]/30 neon-border'
                                            : theme === 'light-minimal'
                                                ? 'hover:bg-light-surface-2'
                                                : 'hover:bg-white/5'
                                        }
                  `}
                                >
                                    <div className="relative">
                                        {chat.type === 'group' ? (
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                                style={{
                                                    background: theme === 'light-minimal'
                                                        ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                                        : 'linear-gradient(135deg, var(--primary), var(--secondary))'
                                                }}
                                            >
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                        ) : (
                                            <Avatar
                                                src={getChatAvatar(chat, participants)}
                                                name={getChatName(chat, participants)}
                                                size="lg"
                                                status={getChatStatus(chat, participants)}
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span
                                                className={`font-medium truncate ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                                    }`}
                                            >
                                                {getChatName(chat, participants)}
                                            </span>
                                            {lastMessage && (
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {formatTime(lastMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p
                                            className="text-sm truncate"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {lastMessage
                                                ? lastMessage.isDeleted
                                                    ? '🚫 Message deleted'
                                                    : truncate(lastMessage.content, 30)
                                                : 'No messages yet'
                                            }
                                        </p>
                                    </div>

                                    {chat.unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`
                        min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium flex items-center justify-center
                        ${theme === 'light-minimal'
                                                    ? 'bg-light-primary text-white'
                                                    : 'bg-[var(--primary)] text-[var(--bg)]'
                                                }
                      `}
                                        >
                                            {chat.unreadCount}
                                        </motion.span>
                                    )}
                                </motion.button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center">
                                <MessageCircle className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
                                <p style={{ color: 'var(--text-muted)' }}>
                                    {searchQuery ? 'No chats found' : 'No chats yet'}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* New Chat Button */}
                <div className="p-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewChat(true)}
                        className={`
              w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2
              transition-all btn-cyber
              ${theme === 'light-minimal'
                                ? 'bg-gradient-to-r from-light-primary to-light-secondary text-white'
                                : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[var(--bg)]'
                            }
            `}
                    >
                        <Plus className="w-5 h-5" />
                        New Chat
                    </motion.button>
                </div>
            </motion.div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
            </AnimatePresence>

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChat && (
                    <NewChatModal onClose={() => setShowNewChat(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
    const { theme, setTheme, themes } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`
          w-full max-w-md mx-4 p-6 rounded-2xl
          ${theme === 'light-minimal' ? 'glass-light' : 'glass'}
        `}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2
                        className={`text-xl font-semibold ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                            }`}
                    >
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                            }`}
                    >
                        <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {/* Theme Selection */}
                <div className="mb-6">
                    <label
                        className={`block text-sm font-medium mb-3 ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                            }`}
                    >
                        <Palette className="w-4 h-4 inline mr-2" />
                        Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {themes.map((t) => (
                            <motion.button
                                key={t.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setTheme(t.id)}
                                className={`
                  p-4 rounded-xl text-center transition-all
                  ${theme === t.id
                                        ? theme === 'light-minimal'
                                            ? 'bg-light-primary/20 border-2 border-light-primary'
                                            : 'bg-[var(--primary)]/20 border-2 border-[var(--primary)] neon-border'
                                        : theme === 'light-minimal'
                                            ? 'bg-light-surface-2 border-2 border-transparent hover:border-light-border'
                                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                    }
                `}
                            >
                                <span className="text-2xl mb-2 block">{t.icon}</span>
                                <span
                                    className={`text-xs ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                        }`}
                                >
                                    {t.name}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div
                    className={`p-4 rounded-xl text-center ${theme === 'light-minimal' ? 'bg-light-surface-2' : 'bg-white/5'
                        }`}
                >
                    <p className="text-2xl mb-2">💬</p>
                    <p
                        className={`font-semibold ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                            }`}
                    >
                        Nexus Chat v1.0
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        The future of communication
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
