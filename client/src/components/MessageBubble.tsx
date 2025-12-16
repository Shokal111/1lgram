import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    Check, CheckCheck, Edit3, Trash2, Smile, Play, Pause,
    Download, X, MoreVertical
} from 'lucide-react';
import { formatMessageTime, formatDuration, formatFileSize } from '../lib/utils';
import { DBMessage, DBUser } from '../lib/db';
import Avatar from './Avatar';

interface MessageBubbleProps {
    message: DBMessage;
    sender?: DBUser;
    isMine: boolean;
    showAvatar: boolean;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export default function MessageBubble({ message, sender, isMine, showAvatar }: MessageBubbleProps) {
    const { currentUser, editMessage, deleteMessage, addReaction } = useChat();
    const { theme } = useTheme();
    const [showActions, setShowActions] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleEdit = async () => {
        if (editContent.trim() && editContent !== message.content) {
            await editMessage(message.id, editContent.trim());
        }
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await deleteMessage(message.id);
        setShowActions(false);
    };

    const handleReaction = async (emoji: string) => {
        await addReaction(message.id, emoji);
        setShowReactions(false);
    };

    const handlePlayVoice = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // If message is deleted
    if (message.isDeleted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
                <div
                    className={`
            px-4 py-2 rounded-2xl italic
            ${theme === 'light-minimal' ? 'bg-light-surface-2 text-light-muted' : 'bg-white/5 text-[var(--text-muted)]'}
          `}
                >
                    🚫 Message deleted
                </div>
            </motion.div>
        );
    }

    const bubbleStyles = isMine
        ? theme === 'light-minimal'
            ? 'bg-light-primary text-white rounded-br-sm'
            : 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-[var(--bg)] rounded-br-sm'
        : theme === 'light-minimal'
            ? 'bg-white border border-light-border text-light-text rounded-bl-sm'
            : 'bg-[var(--surface-2)] text-[var(--text)] rounded-bl-sm';

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => {
                    setShowActions(false);
                    setShowReactions(false);
                }}
            >
                {/* Avatar for received messages */}
                {!isMine && showAvatar && (
                    <div className="mr-2 flex-shrink-0">
                        <Avatar src={sender?.avatar} name={sender?.username || ''} size="sm" />
                    </div>
                )}
                {!isMine && !showAvatar && <div className="w-10" />}

                <div className={`relative max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* Actions Menu */}
                    <AnimatePresence>
                        {showActions && isMine && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={`
                  absolute -left-24 top-1/2 -translate-y-1/2 flex items-center gap-1
                  ${theme === 'light-minimal' ? 'bg-white shadow-lg' : 'bg-[var(--surface)]'} 
                  rounded-lg p-1
                `}
                            >
                                <button
                                    onClick={() => setShowReactions(!showReactions)}
                                    className={`p-1.5 rounded-md ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Smile className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`p-1.5 rounded-md ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'
                                        }`}
                                >
                                    <Edit3 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`p-1.5 rounded-md ${theme === 'light-minimal' ? 'hover:bg-red-50' : 'hover:bg-red-500/20'
                                        }`}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Reactions */}
                    <AnimatePresence>
                        {showReactions && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className={`
                  absolute ${isMine ? '-left-2' : '-right-2'} -top-12
                  flex items-center gap-1 px-2 py-1 rounded-full
                  ${theme === 'light-minimal' ? 'bg-white shadow-lg' : 'bg-[var(--surface)]'}
                `}
                            >
                                {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className="text-xl hover:scale-125 transition-transform p-1"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Message Bubble */}
                    <div className={`px-4 py-2 rounded-2xl ${bubbleStyles}`}>
                        {/* Voice Message */}
                        {message.type === 'voice' && message.voiceData && (
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <button
                                    onClick={handlePlayVoice}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isMine
                                            ? 'bg-white/20 text-white'
                                            : theme === 'light-minimal'
                                                ? 'bg-light-primary/20 text-light-primary'
                                                : 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                        }
                  `}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <div className="flex-1">
                                    <div className="flex gap-0.5 h-8 items-center">
                                        {[...Array(20)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 rounded-full"
                                                style={{
                                                    height: `${20 + Math.random() * 80}%`,
                                                    background: isMine ? 'rgba(255,255,255,0.6)' : 'var(--primary)',
                                                    opacity: 0.5 + Math.random() * 0.5
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs opacity-70">
                                        {formatDuration(message.voiceDuration || 0)}
                                    </span>
                                </div>
                                <audio
                                    ref={audioRef}
                                    src={message.voiceData}
                                    onEnded={() => setIsPlaying(false)}
                                />
                            </div>
                        )}

                        {/* Image Message */}
                        {message.type === 'image' && message.fileUrl && (
                            <div className="relative">
                                <img
                                    src={message.fileUrl}
                                    alt="Shared image"
                                    className="max-w-full rounded-lg cursor-pointer max-h-64 object-cover"
                                    onClick={() => setShowImageModal(true)}
                                />
                            </div>
                        )}

                        {/* File Message */}
                        {message.type === 'file' && message.fileUrl && (
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${isMine ? 'bg-white/20' : theme === 'light-minimal' ? 'bg-light-surface-2' : 'bg-white/10'}
                  `}
                                >
                                    <span className="text-2xl">📄</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{message.fileName}</p>
                                    <p className="text-xs opacity-70">
                                        {formatFileSize(message.fileSize || 0)}
                                    </p>
                                </div>
                                <a
                                    href={message.fileUrl}
                                    download={message.fileName}
                                    className={`
                    p-2 rounded-lg
                    ${isMine ? 'hover:bg-white/20' : theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'}
                  `}
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            </div>
                        )}

                        {/* Text Message */}
                        {message.type === 'text' && (
                            isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                        className="flex-1 bg-transparent border-b border-current outline-none"
                                        autoFocus
                                    />
                                    <button onClick={handleEdit}>
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsEditing(false)}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            )
                        )}

                        {/* Meta Info */}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/70' : ''}`}>
                            {message.isEdited && (
                                <span className="text-[10px] opacity-60">edited</span>
                            )}
                            <span className="text-[10px] opacity-60">
                                {formatMessageTime(message.createdAt)}
                            </span>
                            {isMine && (
                                <span className="ml-1">
                                    {message.readBy.length > 1 ? (
                                        <CheckCheck className="w-3.5 h-3.5" style={{ color: isMine ? 'white' : 'var(--primary)' }} />
                                    ) : (
                                        <Check className="w-3.5 h-3.5 opacity-70" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Reactions Display */}
                    {message.reactions.length > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`
                flex flex-wrap gap-1 mt-1
                ${isMine ? 'justify-end' : 'justify-start'}
              `}
                        >
                            {Object.entries(
                                message.reactions.reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([emoji, count]) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className={`
                    px-2 py-0.5 rounded-full text-sm flex items-center gap-1
                    ${theme === 'light-minimal' ? 'bg-light-surface-2' : 'bg-white/10'}
                    ${message.reactions.some(r => r.emoji === emoji && r.userId === currentUser?.id)
                                            ? 'ring-1 ring-[var(--primary)]'
                                            : ''
                                        }
                  `}
                                >
                                    <span>{emoji}</span>
                                    {count > 1 && <span className="text-xs opacity-70">{count}</span>}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Image Modal */}
            <AnimatePresence>
                {showImageModal && message.fileUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                        onClick={() => setShowImageModal(false)}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
                            onClick={() => setShowImageModal(false)}
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={message.fileUrl}
                            alt="Full size"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
