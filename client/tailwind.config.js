/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Dark Cyber Theme
                cyber: {
                    bg: '#0a0a0f',
                    surface: '#12121a',
                    primary: '#00ffff',
                    secondary: '#ff00ff',
                    accent: '#7c3aed',
                    text: '#e0e0e0',
                    muted: '#6b7280',
                    border: 'rgba(0, 255, 255, 0.2)',
                    glow: 'rgba(0, 255, 255, 0.5)',
                },
                // Light Minimal Theme
                light: {
                    bg: '#f8fafc',
                    surface: '#ffffff',
                    primary: '#3b82f6',
                    secondary: '#8b5cf6',
                    accent: '#06b6d4',
                    text: '#1e293b',
                    muted: '#64748b',
                    border: '#e2e8f0',
                },
                // Retro Vaporwave Theme
                vapor: {
                    bg: '#1a1a2e',
                    surface: '#16213e',
                    primary: '#ff6b9d',
                    secondary: '#c44dff',
                    accent: '#00d4ff',
                    text: '#ffeeff',
                    muted: '#8892b0',
                    border: 'rgba(255, 107, 157, 0.3)',
                    glow: 'rgba(255, 107, 157, 0.5)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'slide-up': 'slide-up 0.3s ease-out',
                'slide-down': 'slide-down 0.3s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'typing': 'typing 1.4s infinite',
                'ripple': 'ripple 0.6s ease-out',
                'particle': 'particle 1s ease-out forwards',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px var(--glow-color, rgba(0, 255, 255, 0.3))'
                    },
                    '50%': {
                        boxShadow: '0 0 40px var(--glow-color, rgba(0, 255, 255, 0.6))'
                    },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'typing': {
                    '0%': { opacity: '0.2' },
                    '20%': { opacity: '1' },
                    '100%': { opacity: '0.2' },
                },
                'ripple': {
                    '0%': { transform: 'scale(0)', opacity: '1' },
                    '100%': { transform: 'scale(4)', opacity: '0' },
                },
                'particle': {
                    '0%': {
                        transform: 'translateY(0) scale(1)',
                        opacity: '1'
                    },
                    '100%': {
                        transform: 'translateY(-100px) scale(0)',
                        opacity: '0'
                    },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'cyber': '0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.1)',
                'cyber-lg': '0 0 30px rgba(0, 255, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.2)',
                'vapor': '0 0 20px rgba(255, 107, 157, 0.3), 0 0 40px rgba(196, 77, 255, 0.1)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
