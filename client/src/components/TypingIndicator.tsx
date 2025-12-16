import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface TypingIndicatorProps {
    usernames: string[];
}

export default function TypingIndicator({ usernames }: TypingIndicatorProps) {
    const { theme } = useTheme();

    const text = usernames.length === 1
        ? `${usernames[0]} is typing`
        : usernames.length === 2
            ? `${usernames[0]} and ${usernames[1]} are typing`
            : `${usernames[0]} and ${usernames.length - 1} others are typing`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
        >
            <div
                className={`
          px-4 py-2 rounded-2xl rounded-bl-sm inline-flex items-center gap-2
          ${theme === 'light-minimal'
                        ? 'bg-light-surface-2'
                        : 'bg-[var(--surface-2)]'
                    }
        `}
            >
                <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className={`
                w-2 h-2 rounded-full
                ${theme === 'light-minimal' ? 'bg-light-muted' : 'bg-[var(--text-muted)]'}
              `}
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
                <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                >
                    {text}
                </span>
            </div>
        </motion.div>
    );
}
