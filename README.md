# 🌟 Nexus Chat - Futuristic Real-Time Messenger

![Nexus Chat](https://img.shields.io/badge/Nexus-Chat-00ffff?style=for-the-badge&logo=messenger&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io)

A stunning, cyberpunk-themed real-time messenger with neon aesthetics, glass-morphism, and smooth animations. Built with modern technologies for the ultimate chat experience.

## ✨ Features

### 💬 Core Messaging
- **Real-time 1-on-1 & Group Chats** - Instant message delivery with Socket.io
- **Message Reactions** - Express yourself with emoji reactions
- **Read Receipts** - Double-tick system for message status
- **Typing Indicators** - See when others are typing
- **Edit & Delete Messages** - Full control over your messages
- **Search** - Find chats and messages instantly

### 🎨 Stunning UI/UX
- **3 Unique Themes**:
  - 🌙 **Dark Cyber** - Neon glows with deep purple/cyan gradients
  - ☀️ **Light Minimal** - Clean, bright, professional
  - 🌆 **Retro Vaporwave** - Pink/purple 80s aesthetic
- **Glassmorphism Effects** - Beautiful frosted glass UI elements
- **Particle Effects** - Animated particles on message send
- **Smooth Animations** - Framer Motion powered transitions
- **Custom Scrollbars** - Styled to match each theme
- **Floating Elements** - Modern floating action buttons

### 🎤 Media Features
- **Voice Messages** - Record and playback with waveform visualization
- **File Sharing** - Share images and files with preview
- **Image Gallery** - View shared images in a lightbox
- **Custom Emoji Picker** - Beautifully styled emoji selector

### 💾 Local-First Database
- **IndexedDB Storage** - All data persists locally via Dexie.js
- **Offline Support** - Works without internet (sync when online)
- **No External Backend Required** - Everything runs on your machine

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd nexus-chat

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

### First Time Setup
1. Open http://localhost:5173
2. Create your profile (username & avatar)
3. Start chatting!

## 📁 Project Structure

```
nexus-chat/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities & database
│   │   ├── styles/        # CSS & themes
│   │   └── types/         # TypeScript types
│   ├── public/
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   └── index.ts       # Express + Socket.io server
│   └── package.json
├── shared/                 # Shared types
│   └── types.ts
└── package.json           # Root workspace config
```

## 🌐 Deployment Guide

### Option 1: Render.com (Free & Easy) ⭐ Recommended for beginners

**Backend Deployment:**
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: nexus-chat-backend
   - **Root Directory**: server
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add environment variable: `NODE_ENV=production`
7. Click "Create Web Service"

**Frontend Deployment:**
1. In Render, click "New +" → "Static Site"
2. Connect the same repo
3. Configure:
   - **Name**: nexus-chat-frontend
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. Add environment variable: 
   - `VITE_SOCKET_URL=https://your-backend-url.onrender.com`
5. Click "Create Static Site"

### Option 2: Railway.app (Simple & Fast)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the monorepo
5. Configure environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   ```
6. For frontend, set:
   ```
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```

### Option 3: VPS (Best Performance) 🏆 Recommended for production

**Requirements:**
- VPS (DigitalOcean, Vultr, Linode, Hetzner)
- Ubuntu 22.04 LTS
- Domain name (optional but recommended)

**Step 1: Initial Server Setup**
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

**Step 2: Deploy Application**
```bash
# Create app directory
mkdir -p /var/www/nexus-chat
cd /var/www/nexus-chat

# Clone your repo (or upload files)
git clone https://github.com/yourusername/nexus-chat.git .

# Install dependencies
npm run install:all

# Build frontend
cd client && npm run build && cd ..

# Build backend
cd server && npm run build && cd ..
```

**Step 3: Configure PM2**
```bash
# Start backend with PM2
cd /var/www/nexus-chat/server
pm2 start dist/index.js --name nexus-backend

# Save PM2 config
pm2 save
pm2 startup
```

**Step 4: Configure Nginx**
```bash
# Create Nginx config
nano /etc/nginx/sites-available/nexus-chat
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/nexus-chat/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API & WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/nexus-chat /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Add SSL (if you have a domain)
certbot --nginx -d your-domain.com
```

### Option 4: Share with Friends (ngrok/Cloudflare Tunnel)

**Using ngrok (Quick Testing):**
```bash
# Install ngrok
npm install -g ngrok

# Start your dev servers
npm run dev

# In another terminal, expose the backend
ngrok http 5000
```

Share the ngrok URL with friends. Update the frontend's socket URL if needed.

**Using Cloudflare Tunnel (Free & Permanent):**
1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
2. Login: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create nexus-chat`
4. Configure tunnel:
```yaml
# ~/.cloudflared/config.yml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: chat.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```
5. Run: `cloudflared tunnel run nexus-chat`

## 🔧 Configuration

### Environment Variables

**Client (.env)**
```env
VITE_SOCKET_URL=http://localhost:5000
```

**Server (.env)**
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🎯 Future Improvements

- [ ] **Cloud Sync with Firebase/Supabase** - Sync messages across devices
- [ ] **End-to-End Encryption** - Using Signal Protocol
- [ ] **Push Notifications** - Web Push API integration
- [ ] **Video/Audio Calls** - WebRTC integration
- [ ] **Message Threading** - Reply to specific messages
- [ ] **Bot Framework** - Create custom chat bots
- [ ] **Custom Stickers** - Upload and use custom sticker packs
- [ ] **Channel Support** - Public broadcast channels
- [ ] **Mobile App** - React Native version

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Socket.io | Real-time Communication |
| Dexie.js | IndexedDB Wrapper |
| Express | Backend Server |
| Node.js | Runtime |

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with 💜 and lots of ☕ | 2025
