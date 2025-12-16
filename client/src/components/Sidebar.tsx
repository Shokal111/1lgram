import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    Search, Plus, Settings, LogOut, Users, MessageCircle,
    Moon, Sun, Palette, X, User, Hash, Zap
} from 'lucide-react';
import { formatTime, truncate } from '../lib/utils';
import { DBUser } from '../lib/db';
import Avatar from './Avatar';
import NewChatModal from './NewChatModal';

export default function Sidebar() {
    const { currentUser, chats, activeChat, selectChat, users, typingUsers } = useChat();
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

    const getOtherUserId = (chat: typeof chats[0]['chat'], participants: DBUser[]) => {
        if (chat.type === 'group') return null;
        return participants.find(p => p.id !== currentUser?.id)?.id;
    };

    const getChatStatus = (chat: typeof chats[0]['chat'], participants: DBUser[]) => {
        if (chat.type === 'group') return undefined; // or logic for group status
        const otherUser = participants.find(p => p.id !== currentUser?.id);
        return otherUser?.status;
    };

    const glassClass = theme === 'light-minimal' ? 'glass-light' : 'glass';
    const borderClass = theme === 'light-minimal' ? 'border-light-border' : 'border-[var(--border)]';

    return (
        <>
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`w-80 h-full flex flex-col ${glassClass} border-r ${borderClass} relative z-20`}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 relative group cursor-pointer">
                            <div className="absolute inset-0 bg-[#00f3ff] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <Avatar
                                src={currentUser?.avatar}
                                name={currentUser?.username || ''}
                                size="md"
                                status="online"
                            />
                            <div>
                                <h2 className="font-bold text-white tracking-wide uppercase flex items-center gap-2">
                                    {currentUser?.username}
                                    <div className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full animate-pulse shadow-[0_0_5px_#00f3ff]"></div>
                                </h2>
                                <span className="text-[10px] font-mono text-[#00f3ff]/70 uppercase">
                                    Netrunner Lvl 99
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH DATABASE..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-xs font-mono bg-black/40 border border-white/10 focus:border-[#00f3ff]/50 text-white placeholder-gray-600 outline-none transition-all shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <AnimatePresence mode='popLayout'>
                        {filteredChats.length > 0 ? (
                            filteredChats.map(({ chat, lastMessage, participants }, index) => {
                                const otherUserId = getOtherUserId(chat, participants);
                                const isTyping = otherUserId ? typingUsers.get(chat.id)?.includes(otherUserId) : false;
                                const isActive = activeChat?.id === chat.id;
                                const otherUser = participants.find(p => p.id !== currentUser?.id);
                                const isOnline = otherUser?.status === 'online';

                                return (
                                    <motion.button
                                        key={chat.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => selectChat(chat.id)}
                                        className={`
                                            w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all relative overflow-hidden group
                                            ${isActive
                                                ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/50 shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                                                : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                                            }
                                        `}
                                    >
                                        {/* Active Line Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute left-0 top-0 bottom-0 w-1 bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"
                                            />
                                        )}

                                        <div className="relative">
                                            {/* Holographic Ring Animation */}
                                            {isOnline && (
                                                <div className="absolute -inset-1 rounded-full border border-[#00f3ff]/30 animate-[spin_4s_linear_infinite]"
                                                    style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}></div>
                                            )}
                                            {isTyping && (
                                                <div className="absolute -inset-1 rounded-full border-2 border-[#bc13fe] animate-ping opacity-50"></div>
                                            )}

                                            {chat.type === 'group' ? (
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00f3ff] to-[#bc13fe]">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                            ) : (
                                                <Avatar
                                                    src={getChatAvatar(chat, participants)}
                                                    name={getChatName(chat, participants)}
                                                    size="lg"
                                                    status={getChatStatus(chat, participants) as any} // Cast to satisfy type if needed
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 z-10">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {getChatName(chat, participants)}
                                                </span>
                                                {lastMessage && (
                                                    <span className="text-[10px] font-mono text-gray-500">
                                                        {formatTime(lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate font-medium ${isTyping ? 'text-[#bc13fe] animate-pulse' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                                {isTyping ? 'Typing...' : (
                                                    lastMessage
                                                        ? lastMessage.isDeleted
                                                            ? '🚫 Message deleted'
                                                            : truncate(lastMessage.content, 28)
                                                        : 'No messages yet'
                                                )}
                                            </p>
                                        </div>

                                        {chat.unreadCount > 0 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="min-w-[18px] h-[18px] rounded-full bg-[#bc13fe] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_#bc13fe]"
                                            >
                                                {chat.unreadCount}
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                <MessageCircle className="w-10 h-10 mb-2" />
                                <p className="text-xs font-mono">NO ACTIVE SIGNALS</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* New Chat Button */}
                <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
                    <motion.button
                        whileHover={{ scale: 1.02, textShadow: "0 0 8px rgb(255,255,255)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNewChat(true)}
                        className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(188,19,254,0.6)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Plus className="w-4 h-4" />
                        Init New Connection
                    </motion.button>
                </div>
            </motion.div>

            {/* Modals */}
            <AnimatePresence>
                {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
                {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
            </AnimatePresence>
        </>
    );
}

// ... SettingsModal (keeping it simple or same as before, omitted for brevity as main Sidebar logic is updated) 
function SettingsModal({ onClose }: { onClose: () => void }) {
    const { theme, setTheme, themes } = useTheme();
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="w-full max-w-md p-8 bg-black border border-[#00f3ff]/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[#00f3ff]" /> SYSTEM CONFIG
                    </h2>
                    <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
                </div>
                <div className="space-y-4">
                    {themes.map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)}
                            className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all ${theme === t.id ? 'border-[#00f3ff] bg-[#00f3ff]/10' : 'border-white/10 hover:bg-white/5'}`}>
                            <span className="text-2xl">{t.icon}</span>
                            <span className="font-mono text-white flex-1 text-left">{t.name.toUpperCase()}</span>
                            {theme === t.id && <div className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"></div>}
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}
