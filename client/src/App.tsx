import React from 'react';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ParticleBackground from './components/ParticleBackground';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
    const { currentUser, isLoading } = useChat();
    const { theme } = useTheme();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        return <WelcomeScreen />;
    }

    return (
        <div className="h-screen w-screen flex overflow-hidden relative bg-black">
            {/* Particle Background Layer */}
            {theme !== 'light-minimal' && <ParticleBackground />}

            {/* Main Application Layout */}
            <div className="flex w-full h-full relative z-10">
                {/* Sidebar - Always visible on Desktop, togglable on Mobile (handled internally or via responsive logic) */}
                <div className="h-full relative z-20 shadow-2xl">
                    <Sidebar />
                </div>

                {/* Chat Area - Occupies remaining space */}
                <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black text-[#00f3ff]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative"
            >
                <div className="w-24 h-24 rounded-full border-4 border-[#00f3ff] border-t-transparent animate-spin mx-auto mb-6 shadow-[0_0_20px_#00f3ff]"></div>
                <h2 className="text-3xl font-black tracking-widest animate-pulse">
                    NEXUS<span className="text-[#bc13fe]">OS</span>
                </h2>
                <p className="font-mono text-sm mt-2 opacity-70">INITIALIZING NEURAL LINK...</p>
            </motion.div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </ThemeProvider>
    );
}

export default App;
