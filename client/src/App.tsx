import React from 'react';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import EmptyChat from './components/EmptyChat';
import ParticleBackground from './components/ParticleBackground';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
    const { currentUser, isLoading, activeChat } = useChat();
    const { theme } = useTheme();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        return <WelcomeScreen />;
    }

    return (
        <div className="h-screen w-screen flex overflow-hidden relative">
            {/* Particle Background */}
            {theme !== 'light-minimal' && <ParticleBackground />}

            {/* Main Content */}
            <div className="flex w-full h-full relative z-10">
                {/* Sidebar */}
                <Sidebar />

                {/* Chat Area */}
                <AnimatePresence mode="wait">
                    {activeChat ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col"
                        >
                            <ChatWindow />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <EmptyChat />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-cyber">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-cyber-primary/30 border-t-cyber-primary animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl">💬</span>
                    </div>
                </div>
                <h2 className="text-2xl font-display font-bold text-cyber-primary neon-text">
                    NEXUS CHAT
                </h2>
                <p className="text-cyber-muted mt-2">Initializing...</p>
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
