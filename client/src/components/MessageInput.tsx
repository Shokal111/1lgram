import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useFileUpload } from '../hooks/useFileUpload';
import {
    Send, Smile, Paperclip, Mic, X, Image, FileText,
    StopCircle, Trash2
} from 'lucide-react';
import { formatDuration, formatFileSize, isImageFile } from '../lib/utils';
import EmojiPicker from './EmojiPicker';

export default function MessageInput() {
    const { sendMessage, sendVoiceMessage, setTyping } = useChat();
    const { theme } = useTheme();
    const [content, setContent] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        isRecording,
        duration,
        startRecording,
        stopRecording,
        cancelRecording
    } = useVoiceRecorder();

    const {
        files,
        selectFiles,
        removeFile,
        clearFiles,
        getFileData
    } = useFileUpload();

    const handleTyping = useCallback(() => {
        setTyping(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 2000);
    }, [setTyping]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        handleTyping();

        // Auto-resize textarea
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
    };

    const handleSend = async () => {
        // Send files first
        if (files.length > 0) {
            for (const upload of files) {
                const fileData = await getFileData(upload.file);
                await sendMessage(
                    upload.file.name,
                    upload.type === 'image' ? 'image' : 'file',
                    fileData
                );
            }
            clearFiles();
        }

        // Send text message
        if (content.trim()) {
            await sendMessage(content.trim());
            setContent('');
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
        }

        setTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleVoiceRecord = async () => {
        if (isRecording) {
            const result = await stopRecording();
            if (result) {
                await sendVoiceMessage(result.audioData, result.duration);
            }
        } else {
            try {
                await startRecording();
            } catch (error) {
                console.error('Failed to start recording:', error);
            }
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    const canSend = content.trim() || files.length > 0;

    return (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {/* File Previews */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-3 flex gap-2 overflow-x-auto pb-2"
                    >
                        {files.map((upload, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className={`
                  relative flex-shrink-0 rounded-xl overflow-hidden
                  ${theme === 'light-minimal' ? 'bg-light-surface-2' : 'bg-white/5'}
                `}
                            >
                                {upload.type === 'image' ? (
                                    <img
                                        src={upload.preview}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 flex flex-col items-center justify-center p-2">
                                        <FileText
                                            className="w-8 h-8 mb-1"
                                            style={{ color: 'var(--text-muted)' }}
                                        />
                                        <span
                                            className="text-[10px] truncate w-full text-center"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {upload.file.name.slice(0, 10)}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Recording UI */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`
              mb-3 p-4 rounded-xl flex items-center justify-between
              ${theme === 'light-minimal' ? 'bg-light-surface-2' : 'bg-white/5'}
            `}
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-3 h-3 rounded-full bg-red-500"
                            />
                            <span
                                className={`font-mono ${theme === 'light-minimal' ? 'text-light-text' : 'text-[var(--text)]'
                                    }`}
                            >
                                {formatDuration(duration)}
                            </span>
                            <div className="voice-waveform">
                                {[...Array(8)].map((_, i) => (
                                    <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={cancelRecording}
                                className={`p-2 rounded-lg ${theme === 'light-minimal' ? 'hover:bg-light-surface' : 'hover:bg-white/10'
                                    }`}
                            >
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                            <button
                                onClick={handleVoiceRecord}
                                className={`
                  p-2 rounded-lg
                  ${theme === 'light-minimal'
                                        ? 'bg-light-primary text-white'
                                        : 'bg-[var(--primary)] text-[var(--bg)]'
                                    }
                `}
                            >
                                <StopCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="flex items-end gap-2">
                {/* Emoji Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className={`p-2.5 rounded-xl transition-colors ${showEmoji
                                ? theme === 'light-minimal'
                                    ? 'bg-light-primary/20 text-light-primary'
                                    : 'bg-[var(--primary)]/20 text-[var(--primary)]'
                                : theme === 'light-minimal'
                                    ? 'hover:bg-light-surface-2 text-light-muted'
                                    : 'hover:bg-white/10 text-[var(--text-muted)]'
                            }`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                        {showEmoji && (
                            <EmojiPicker
                                onSelect={handleEmojiSelect}
                                onClose={() => setShowEmoji(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Attachment Button */}
                <button
                    onClick={selectFiles}
                    className={`p-2.5 rounded-xl transition-colors ${theme === 'light-minimal'
                            ? 'hover:bg-light-surface-2 text-light-muted'
                            : 'hover:bg-white/10 text-[var(--text-muted)]'
                        }`}
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Text Input */}
                <div
                    className={`
            flex-1 px-4 py-2.5 rounded-xl flex items-center
            ${theme === 'light-minimal'
                            ? 'bg-light-surface-2 border border-light-border'
                            : 'bg-[var(--surface-2)] border border-[var(--border)]'
                        }
          `}
                >
                    <textarea
                        ref={inputRef}
                        value={content}
                        onChange={handleContentChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className={`
              flex-1 bg-transparent resize-none outline-none max-h-[150px]
              ${theme === 'light-minimal'
                                ? 'text-light-text placeholder-light-muted'
                                : 'text-[var(--text)] placeholder-[var(--text-muted)]'
                            }
            `}
                    />
                </div>

                {/* Send / Voice Button */}
                {canSend ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className={`
              p-2.5 rounded-xl btn-cyber
              ${theme === 'light-minimal'
                                ? 'bg-light-primary text-white'
                                : 'bg-[var(--primary)] text-[var(--bg)]'
                            }
            `}
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVoiceRecord}
                        className={`
              p-2.5 rounded-xl transition-colors
              ${isRecording
                                ? 'bg-red-500 text-white'
                                : theme === 'light-minimal'
                                    ? 'hover:bg-light-surface-2 text-light-muted'
                                    : 'hover:bg-white/10 text-[var(--text-muted)]'
                            }
            `}
                    >
                        <Mic className="w-5 h-5" />
                    </motion.button>
                )}
            </div>
        </div>
    );
}
