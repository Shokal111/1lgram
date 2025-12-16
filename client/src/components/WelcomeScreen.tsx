import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkles, Zap, MessageCircle } from 'lucide-react';

export default function WelcomeScreen() {
    const [username, setUsername] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { createUser } = useChat();
    const { theme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || isCreating) return;

        setIsCreating(true);
        try {
            await createUser(username.trim());
        } catch (error) {
            console.error('Failed to create user:', error);
            setIsCreating(false);
        }
    };

    const bgClass = theme === 'light-minimal'
        ? 'bg-light-bg'
        : theme === 'retro-vaporwave'
            ? 'bg-gradient-vapor'
            : 'bg-gradient-cyber';

    const glassClass = theme === 'light-minimal'
        ? 'glass-light'
        : 'glass';

    return (
        <div className={`h-screen w-screen flex items-center justify-center ${bgClass} relative overflow-hidden`}>
            {/* Animated background elements */}
            {theme !== 'light-minimal' && (
                <>
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full"
                                style={{
                                    background: theme === 'retro-vaporwave' ? '#ff6b9d' : '#00ffff',
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    opacity: [0.2, 1, 0.2],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>

                    {/* Glowing orbs */}
                    <motion.div
                        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
                        style={{
                            background: theme === 'retro-vaporwave'
                                ? 'radial-gradient(circle, #ff6b9d 0%, transparent 70%)'
                                : 'radial-gradient(circle, #00ffff 0%, transparent 70%)'
                        }}
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 right-0 bottom-0"
                        style={{
                            background: theme === 'retro-vaporwave'
                                ? 'radial-gradient(circle, #c44dff 0%, transparent 70%)'
                                : 'radial-gradient(circle, #ff00ff 0%, transparent 70%)'
                        }}
                        animate={{
                            x: [0, -100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </>
            )}

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`relative z-10 w-full max-w-md mx-4 p-8 rounded-3xl ${glassClass}`}
            >
                {/* Logo */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="relative inline-block mb-4">
                        <motion.div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto"
                            style={{
                                background: theme === 'light-minimal'
                                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                                    : theme === 'retro-vaporwave'
                                        ? 'linear-gradient(135deg, #ff6b9d, #c44dff)'
                                        : 'linear-gradient(135deg, #00ffff, #7c3aed)'
                            }}
                            animate={{
                                boxShadow: theme === 'light-minimal'
                                    ? ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                                    : theme === 'retro-vaporwave'
                                        ? ['0 0 20px rgba(255, 107, 157, 0.3)', '0 0 40px rgba(255, 107, 157, 0.5)', '0 0 20px rgba(255, 107, 157, 0.3)']
                                        : ['0 0 20px rgba(0, 255, 255, 0.3)', '0 0 40px rgba(0, 255, 255, 0.5)', '0 0 20px rgba(0, 255, 255, 0.3)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <MessageCircle className="w-12 h-12 text-white" />
                        </motion.div>
                        <motion.div
                            className="absolute -top-1 -right-1"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="w-6 h-6" style={{ color: theme === 'light-minimal' ? '#f59e0b' : '#ff00ff' }} />
                        </motion.div>
                    </div>

                    <h1
                        className={`text-4xl font-display font-bold mb-2 ${theme !== 'light-minimal' ? 'neon-text' : ''}`}
                        style={{
                            color: theme === 'light-minimal' ? '#1e293b' : theme === 'retro-vaporwave' ? '#ff6b9d' : '#00ffff'
                        }}
                    >
                        NEXUS CHAT
                    </h1>
                    <p className={theme === 'light-minimal' ? 'text-light-muted' : 'text-cyber-muted'}>
                        The future of communication
                    </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label
                            className={`block text-sm font-medium mb-2 ${theme === 'light-minimal' ? 'text-light-text' : 'text-cyber-text'}`}
                        >
                            Choose your username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username..."
                                className={`
                  w-full px-4 py-3 rounded-xl transition-all duration-300
                  ${theme === 'light-minimal'
                                        ? 'bg-light-surface-2 border border-light-border text-light-text placeholder-light-muted focus:border-light-primary focus:ring-2 focus:ring-light-primary/20'
                                        : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] input-cyber'
                                    }
                `}
                                maxLength={20}
                                required
                            />
                            {username && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <Zap className="w-5 h-5" style={{ color: theme === 'light-minimal' ? '#3b82f6' : '#00ffff' }} />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        disabled={!username.trim() || isCreating}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
              w-full py-4 rounded-xl font-semibold text-lg relative overflow-hidden
              transition-all duration-300 btn-cyber disabled:opacity-50 disabled:cursor-not-allowed
              ${theme === 'light-minimal'
                                ? 'bg-gradient-to-r from-light-primary to-light-secondary text-white'
                                : theme === 'retro-vaporwave'
                                    ? 'bg-gradient-to-r from-vapor-primary to-vapor-secondary text-white'
                                    : 'bg-gradient-to-r from-cyber-primary to-cyber-accent text-cyber-bg'
                            }
            `}
                    >
                        {isCreating ? (
                            <span className="flex items-center justify-center gap-2">
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    ✨
                                </motion.span>
                                Creating...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Enter the Nexus
                            </span>
                        )}
                    </motion.button>
                </form>

                {/* Features */}
                <motion.div
                    className="mt-8 pt-6 border-t"
                    style={{ borderColor: 'var(--border)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                            { icon: '🔒', label: 'Secure' },
                            { icon: '⚡', label: 'Real-time' },
                            { icon: '🎨', label: '3 Themes' },
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                                className={theme === 'light-minimal' ? 'text-light-muted' : 'text-cyber-muted'}
                            >
                                <div className="text-2xl mb-1">{feature.icon}</div>
                                <div className="text-xs">{feature.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
