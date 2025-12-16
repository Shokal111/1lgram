import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Search, X } from 'lucide-react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Objects': ['🎁', '🎈', '🎉', '🎊', '🎀', '🎗️', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🎮', '🎲', '🎯', '🎭', '🎨', '🎧', '🎤', '🎸', '🎹', '🎺', '🎻'],
    'Nature': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🦀', '🐚'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥖', '🥨', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🫔', '🥫', '🍝', '🍜']
};

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Smileys');

    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
    const filteredEmojis = searchQuery
        ? allEmojis.filter(e => e.includes(searchQuery))
        : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`
        absolute bottom-full left-0 mb-2 w-80 rounded-2xl overflow-hidden shadow-xl z-50
        ${theme === 'light-minimal' ? 'bg-white border border-light-border' : 'bg-[var(--surface)] border border-[var(--border)]'}
      `}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search emoji..."
                        className={`
              w-full pl-10 pr-4 py-2 rounded-xl text-sm
              ${theme === 'light-minimal'
                                ? 'bg-light-surface-2 text-light-text placeholder-light-muted'
                                : 'bg-[var(--surface-2)] text-[var(--text)] placeholder-[var(--text-muted)]'
                            }
            `}
                    />
                </div>
            </div>

            {/* Categories */}
            {!searchQuery && (
                <div className="flex gap-1 p-2 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
                    {Object.keys(EMOJI_CATEGORIES).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeCategory === category
                                    ? theme === 'light-minimal'
                                        ? 'bg-light-primary text-white'
                                        : 'bg-[var(--primary)] text-[var(--bg)]'
                                    : theme === 'light-minimal'
                                        ? 'text-light-muted hover:bg-light-surface-2'
                                        : 'text-[var(--text-muted)] hover:bg-white/5'
                                }
              `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji Grid */}
            <div className="p-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                    {filteredEmojis.map((emoji, index) => (
                        <motion.button
                            key={`${emoji}-${index}`}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelect(emoji)}
                            className={`
                w-8 h-8 flex items-center justify-center rounded-lg text-xl
                ${theme === 'light-minimal' ? 'hover:bg-light-surface-2' : 'hover:bg-white/10'}
              `}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </div>

                {filteredEmojis.length === 0 && (
                    <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                        No emoji found
                    </div>
                )}
            </div>
        </motion.div>
    );
}
