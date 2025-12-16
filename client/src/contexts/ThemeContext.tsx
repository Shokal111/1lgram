import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbHelpers } from '../lib/db';

type Theme = 'dark-cyber' | 'light-minimal' | 'retro-vaporwave';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    themes: { id: Theme; name: string; icon: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: { id: Theme; name: string; icon: string }[] = [
    { id: 'dark-cyber', name: 'Dark Cyber', icon: '🌙' },
    { id: 'light-minimal', name: 'Light Minimal', icon: '☀️' },
    { id: 'retro-vaporwave', name: 'Retro Vaporwave', icon: '🌆' }
];

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark-cyber');

    useEffect(() => {
        dbHelpers.getTheme().then(savedTheme => {
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            }
        });
    }, []);

    useEffect(() => {
        // Remove all theme classes
        document.documentElement.classList.remove('theme-dark-cyber', 'theme-light-minimal', 'theme-retro-vaporwave');
        // Add current theme class
        document.documentElement.classList.add(`theme-${theme}`);

        // Update body background for light theme
        if (theme === 'light-minimal') {
            document.body.style.background = '#f8fafc';
        } else if (theme === 'dark-cyber') {
            document.body.style.background = 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2a 50%, #0a0a0f 100%)';
        } else {
            document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)';
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        dbHelpers.setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
