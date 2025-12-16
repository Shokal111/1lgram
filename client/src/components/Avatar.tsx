import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { getInitials } from '../lib/utils';

interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'away' | 'busy';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
};

const statusSizeClasses = {
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2'
};

export default function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
    const { theme } = useTheme();

    const borderColor = theme === 'light-minimal' ? 'border-light-surface' : 'border-[var(--surface)]';

    return (
        <div className={`relative ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold`}
                    style={{
                        background: theme === 'light-minimal'
                            ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                            : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white'
                    }}
                >
                    {getInitials(name)}
                </div>
            )}

            {status && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`
            absolute bottom-0 right-0 rounded-full ${statusSizeClasses[size]} ${borderColor}
            ${status === 'online' ? 'status-online' : ''}
            ${status === 'away' ? 'status-away' : ''}
            ${status === 'busy' ? 'status-busy' : ''}
            ${status === 'offline' ? 'status-offline' : ''}
          `}
                />
            )}
        </div>
    );
}
