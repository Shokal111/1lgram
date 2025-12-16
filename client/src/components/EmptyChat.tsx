import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { MessageCircle, Zap, Sparkles } from 'lucide-react';

export default function EmptyChat() {
    const { theme } = useTheme();

    const bgClass = theme === 'light-minimal'
        ? 'bg-light-bg'
        : '';

    return (
        <div className={`flex-1 flex flex-col items-center justify-center ${bgClass} relative overflow-hidden`}>
            {/* Decorative elements */}
            {theme !== 'light-minimal' && (
                <>
                    <motion.div
                        className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
                        style={{
                            background: theme === 'retro-vaporwave'
                                ? 'radial-gradient(circle, #ff6b9d 0%, transparent 70%)'
                                : 'radial-gradient(circle, #00ffff 0%, transparent 70%)'
                        }}
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute w-48 h-48 rounded-full blur-3xl opacity-10 right-1/4 top-1/3"
                        style={{
                            background: theme === 'retro-vaporwave'
                                ? 'radial-gradient(circle, #c44dff 0%, transparent 70%)'
                                : 'radial-gradient(circle, #7c3aed 0%, transparent 70%)'
                        }}
                        animate={{
                            x: [0, -30, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </>
            )}

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center relative z-10"
            >
                {/* Icon */}
                <motion.div
                    className="relative inline-block mb-6"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div
                        className={`
              w-24 h-24 rounded-3xl flex items-center justify-center mx-auto
              ${theme === 'light-minimal'
                                ? 'bg-gradient-to-br from-light-primary/20 to-light-secondary/20'
                                : 'bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20'
                            }
            `}
                    >
                        <MessageCircle
                            className="w-12 h-12"
                            style={{ color: 'var(--primary)' }}
                        />
                    </div>
                    <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Sparkles
                            className="w-6 h-6"
                            style={{ color: theme === 'light-minimal' ? '#f59e0b' : 'var(--secondary)' }}
                        />
                    </motion.div>
                </motion.div>

                {/* Text */}
                <h2
                    className={`text-2xl font-display font-bold mb-2 ${theme !== 'light-minimal' ? 'neon-text' : ''
                        }`}
                    style={{ color: 'var(--text)' }}
                >
                    Select a chat to start messaging
                </h2>
                <p
                    className="max-w-md mx-auto mb-6"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Choose a conversation from the sidebar or start a new chat to connect with others
                </p>

                {/* Features */}
                <div className="flex justify-center gap-6">
                    {[
                        { icon: '🔒', label: 'End-to-End Secure' },
                        { icon: '⚡', label: 'Real-time Sync' },
                        { icon: '🎨', label: 'Custom Themes' },
                    ].map((feature, i) => (
                        <motion.div
                            key={feature.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className={`
                px-4 py-2 rounded-xl
                ${theme === 'light-minimal'
                                    ? 'bg-light-surface-2'
                                    : 'bg-white/5'
                                }
              `}
                        >
                            <span className="text-xl">{feature.icon}</span>
                            <p
                                className="text-xs mt-1"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {feature.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
