import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    ArrowLeft, Users, Zap, Shield, Lock, Terminal,
    Phone, Video, MoreVertical
} from 'lucide-react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow() {
    const { activeChat, messages, currentUser, users, selectChat, typingUsers } = useChat();
    const { theme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);

    const participants = activeChat
        ? users.filter(u => activeChat.participants.includes(u.id))
        : [];

    const otherUser = participants.find(p => p.id !== currentUser?.id);

    const chatName = activeChat?.type === 'group'
        ? (activeChat.name || 'Group Chat')
        : (otherUser?.username || 'Unknown Target');

    const chatAvatar = activeChat?.type === 'group'
        ? activeChat.avatar
        : otherUser?.avatar;

    const isTyping = typingUsers.get(activeChat?.id || '')?.length || 0 > 0;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Empty State (Command Center)
    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-black">
                {/* Background Grid Animation */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, #00f3ff 0%, transparent 50%), linear-gradient(0deg, transparent 24%, rgba(0, 243, 255, .3) 25%, rgba(0, 243, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, .3) 75%, rgba(0, 243, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 243, 255, .3) 25%, rgba(0, 243, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 243, 255, .3) 75%, rgba(0, 243, 255, .3) 76%, transparent 77%, transparent)`,
                        backgroundSize: '50px 50px'
                    }}
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="z-10 bg-black/50 backdrop-blur-xl p-12 rounded-3xl border border-[#00f3ff]/30 shadow-[0_0_50px_rgba(0,243,255,0.2)]"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00f3ff]/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-[#00f3ff] animate-ping opacity-20"></div>
                        <Terminal className="w-12 h-12 text-[#00f3ff]" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 tracking-tighter text-white">
                        NEXUS <span className="text-[#00f3ff]">LINK</span>
                    </h1>
                    <p className="text-gray-400 max-w-md mx-auto mb-8 font-mono">
                        Secure connection established. <br />
                        Select a target from the sidebar to initiate encrypted transmission.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <div className="px-4 py-2 rounded border border-white/10 bg-white/5 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">ENCRYPTED</span>
                        </div>
                        <div className="px-4 py-2 rounded border border-white/10 bg-white/5 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400">ONLINE</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-black/90">
            {/* Header */}
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className="absolute top-0 left-0 right-0 z-20 px-6 py-4 flex items-center justify-between backdrop-blur-lg border-b border-[#00f3ff]/20 bg-black/60"
            >
                <div className="flex items-center gap-4">
                    <button onClick={() => selectChat(null)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-6 h-6 text-[#00f3ff]" />
                    </button>

                    <div className="relative">
                        {activeChat?.type === 'group' ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00f3ff] to-[#bc13fe] flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        ) : (
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f3ff] to-[#bc13fe] rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                                <Avatar src={chatAvatar} name={chatName} size="md" status={otherUser?.status} />
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                            {chatName}
                            {activeChat.isPinned && <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                        </h2>
                        <div className="flex items-center gap-2">
                            {isTyping ? (
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-xs font-mono text-[#00f3ff]"
                                >
                                    Typing...
                                </motion.span>
                            ) : (
                                <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${otherUser?.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-500'}`}></div>
                                    {otherUser?.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#00f3ff]/10 rounded-full transition-colors group">
                        <Phone className="w-5 h-5 text-gray-400 group-hover:text-[#00f3ff]" />
                    </button>
                    <button className="p-2 hover:bg-[#bc13fe]/10 rounded-full transition-colors group">
                        <Video className="w-5 h-5 text-gray-400 group-hover:text-[#bc13fe]" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32 space-y-6 scrollbar-thin scrollbar-thumb-[#00f3ff]/20 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => {
                        const isMine = message.senderId === currentUser?.id;
                        const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== message.senderId);
                        const sender = users.find(u => u.id === message.senderId);

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isMine={isMine}
                                sender={sender}
                                showAvatar={showAvatar}
                            />
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Holographic Toolbar */}
            <div className="absolute bottom-6 left-4 right-4 z-30">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-4xl mx-auto backdrop-blur-xl bg-black/60 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative"
                >
                    {/* Glowing Border Line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent opacity-50"></div>

                    <MessageInput />
                </motion.div>
            </div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-20 mix-blend-overlay"></div>
        </div>
    );
}
