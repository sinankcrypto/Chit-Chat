💬 ChitChat – Real-Time Chat Application

ChitChat is a modern real-time chat application built with Django Channels and React. It supports instant messaging, media sharing, real-time notifications, and user presence tracking. The application provides a seamless chatting experience similar to modern messaging platforms.

🚀 Features
🔐 Authentication
Secure User Signup & Login
Email OTP verification during signup
JWT authentication with refresh tokens
Persistent login sessions
💬 Real-Time Chat
One-to-one conversations
Group chat support
Real-time messaging using WebSockets (Django Channels)
📎 Media & File Sharing
Send images, videos, documents, and other files
Automatic rendering based on file type
File upload with progress tracking
😀 Emoji Support
Emoji picker integration
Send emojis along with text messages
🔔 Notifications
Real-time in-app notifications
Browser push notifications when a new message arrives
Notification permission handling
👀 Read Receipts
Messages marked as read when viewed
Smart handling of message visibility in active chat
🟢 User Presence
Track online/offline users
Live presence updates using WebSockets
Presence fetched on page load for accurate state
🔎 User Search
Search users from the chat sidebar
Start new one-to-one conversations
👥 Group Management
Create group chats
Add or remove members
View group information
📜 Message History
Fetch previous messages with pagination
Automatic scrolling to:
First unread message
Last message if all are read
🏗️ Tech Stack
Backend
Python
Django
Django REST Framework
Django Channels
Redis (Channel Layer)
JWT Authentication
Frontend
React (Vite)
JavaScript
TailwindCSS
Real-Time
WebSockets
Django Channels
Notifications
Browser Push Notifications
🧠 Architecture Overview
Frontend (React + Tailwind)
        │
        │ REST API
        ▼
Django REST Framework
        │
        │ WebSocket
        ▼
Django Channels
        │
        ▼
Redis Channel Layer
WebSocket Services
ChatConsumer
Handles real-time messaging
Broadcasts messages to room participants
PresenceConsumer
Tracks user online/offline status
Broadcasts presence updates globally

⚡ Installation
1️⃣ Clone Repository
git clone https://github.com/yourusername/chitchat.git
cd chitchat
2️⃣ Backend Setup
cd backend

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Start Django server:

python manage.py runserver
3️⃣ Redis (Required for WebSockets)

Install Redis and start server:

redis-server
4️⃣ Frontend Setup
cd frontend

npm install
npm run dev
🌐 Environment Variables
Backend
SECRET_KEY=your_secret_key
DEBUG=True
REDIS_URL=redis://127.0.0.1:6379
Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000/ws
🔔 Push Notification Flow
Browser requests notification permission
When a new message arrives:
If chat is not active
A push notification is triggered
Clicking the notification opens the chat
🧪 Future Improvements
Message reactions 👍
Message editing and deletion
Voice notes
Video & voice calls
Infinite message scrolling
Message delivery status (sent / delivered / seen)

👨‍💻 Author

Sinan Muhammed

Full Stack Developer
Skilled in Python, Django, React, SQL, Docker, and Real-Time Systems

⭐ If you like this project, consider giving it a star!
