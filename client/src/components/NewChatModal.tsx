import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, User, Users, Plus, Check } from 'lucide-react';
import Avatar from './Avatar';

interface NewChatModalProps {
    onClose: () => void;
}

export default function NewChatModal({ onClose }: NewChatModalProps) {
    const { currentUser, users, createDirectChat, createGroupChat } = useChat();
    const { theme } = useTheme();
    const [mode, setMode] = useState<'direct' | 'group'>('direct');
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    const toggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleCreateChat = async () => {
        if (isCreating) return;
        setIsCreating(true);

        try {
            if (mode === 'direct' && selectedUsers.length === 1) {
                await createDirectChat(selectedUsers[0]);
            } else if (mode === 'group' && selectedUsers.length > 0 && groupName.trim()) {
                await createGroupChat(groupName.trim(), selectedUsers);
            }
            onClose();
        } catch (error) {
            console.error('Failed to create chat:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const canCreate = mode === 'direct'
        ? selectedUsers.length === 1
        : selectedUsers.length > 0 && groupName.trim();

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
          w-full max-w-md mx-4 rounded-2xl overflow-hidden
          ${theme === 'light-minimal' ? 'glass-light' : 'glass'}
        `}
            >
                {/* Header */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className={`text-xl font-semibold ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                }`}
                        >
                            New Chat
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                                }`}
                        >
                            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setMode('direct');
                                setSelectedUsers([]);
                            }}
                            className={`
                flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
                ${mode === 'direct'
                                    ? theme === 'light-minimal'
                                        ? 'bg-light-primary text-white'
                                        : 'bg-[var(--primary)] text-[var(--bg)]'
                                    : theme === 'light-minimal'
                                        ? 'bg-light-surface-2 text-light-text'
                                        : 'bg-white/5 text-[var(--text)]'
                                }
              `}
                        >
                            <User className="w-4 h-4" />
                            Direct
                        </button>
                        <button
                            onClick={() => {
                                setMode('group');
                                setSelectedUsers([]);
                            }}
                            className={`
                flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all
                ${mode === 'group'
                                    ? theme === 'light-minimal'
                                        ? 'bg-light-primary text-white'
                                        : 'bg-[var(--primary)] text-[var(--bg)]'
                                    : theme === 'light-minimal'
                                        ? 'bg-light-surface-2 text-light-text'
                                        : 'bg-white/5 text-[var(--text)]'
                                }
              `}
                        >
                            <Users className="w-4 h-4" />
                            Group
                        </button>
                    </div>
                </div>

                {/* Group Name Input */}
                {mode === 'group' && (
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className={`
                w-full px-4 py-2.5 rounded-xl text-sm
                ${theme === 'light-minimal'
                                    ? 'bg-light-surface-2 border border-light-border text-light-text placeholder-light-muted'
                                    : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)]'
                                }
              `}
                        />
                    </div>
                )}

                {/* User List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {otherUsers.length > 0 ? (
                        otherUsers.map((user) => (
                            <motion.button
                                key={user.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                    if (mode === 'direct') {
                                        setSelectedUsers([user.id]);
                                    } else {
                                        toggleUser(user.id);
                                    }
                                }}
                                className={`
                  w-full p-3 rounded-xl flex items-center gap-3 transition-all mb-1
                  ${selectedUsers.includes(user.id)
                                        ? theme === 'light-minimal'
                                            ? 'bg-light-primary/10 border border-light-primary/30'
                                            : 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                                        : theme === 'light-minimal'
                                            ? 'hover:bg-light-surface-2'
                                            : 'hover:bg-white/5'
                                    }
                `}
                            >
                                <Avatar
                                    src={user.avatar}
                                    name={user.username}
                                    size="lg"
                                    status={user.status}
                                />
                                <div className="flex-1 text-left">
                                    <p
                                        className={`font-medium ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                            }`}
                                    >
                                        {user.username}
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {user.status === 'online' ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                                {selectedUsers.includes(user.id) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${theme === 'light-minimal' ? 'bg-light-primary' : 'bg-[var(--primary)]'}
                    `}
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Users className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No users available</p>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <motion.button
                        whileHover={{ scale: canCreate ? 1.02 : 1 }}
                        whileTap={{ scale: canCreate ? 0.98 : 1 }}
                        onClick={handleCreateChat}
                        disabled={!canCreate || isCreating}
                        className={`
              w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2
              transition-all btn-cyber disabled:opacity-50 disabled:cursor-not-allowed
              ${theme === 'light-minimal'
                                ? 'bg-gradient-to-r from-light-primary to-light-secondary text-white'
                                : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[var(--bg)]'
                            }
            `}
                    >
                        <Plus className="w-5 h-5" />
                        {isCreating ? 'Creating...' : 'Create Chat'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
