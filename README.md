# 💬 ChitChat – Real-Time Chat Application

A modern real-time chat application built with **Django Channels + React**, supporting instant messaging, media sharing, notifications, user presence tracking, and group conversations.

---

## 🚀 Features

### 🔐 Authentication

* Secure signup & login
* Email OTP verification
* JWT authentication with refresh tokens
* Persistent login sessions

### 💬 Real-Time Chat

* One-to-one conversations
* Group chats
* Real-time messaging using **WebSockets (Django Channels)**

### 📎 Media & File Sharing

* Send images, videos, documents, and files
* Automatic rendering based on file type
* File upload with progress tracking

### 😀 Messaging Experience

* Emoji picker integration
* Read receipts for viewed messages
* Smart unread message navigation
* Automatic scrolling to unread/latest messages

### 🔔 Notifications

* Real-time in-app notifications
* Browser push notifications for new messages
* Notification permission handling

### 🟢 User Presence

* Online/offline user tracking
* Live presence updates using WebSockets
* Presence synchronization on page load

### 🔎 Search & Conversations

* Search users from chat sidebar
* Start one-to-one conversations instantly

### 👥 Group Management

* Create group chats
* Add or remove members
* View group details

### 📜 Message History

* Persistent chat history
* Paginated message loading

---

## 🛠️ Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* Django Channels
* Redis (Channel Layer)
* JWT Authentication

### Frontend

* React (Vite)
* JavaScript
* Tailwind CSS

### Real-Time

* WebSockets
* Django Channels

### Notifications

* Browser Push Notifications

---

## 🧱 Architecture Overview

```text
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
```

### WebSocket Services

#### ChatConsumer

* Handles real-time messaging
* Broadcasts messages to room participants

#### PresenceConsumer

* Tracks online/offline status
* Broadcasts presence updates globally

---

## ⚡ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/chitchat.git
cd chitchat
```

### 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

### 3️⃣ Redis Setup

```bash
redis-server
```

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Environment Variables

### Backend

```env
SECRET_KEY=your_secret_key
DEBUG=True
REDIS_URL=redis://127.0.0.1:6379
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

---

## 🔔 Push Notification Flow

1. Browser requests notification permission
2. When a new message arrives:

   * If the chat is inactive → trigger notification
   * Clicking notification opens the conversation

---

## 🧪 Future Improvements

* Message reactions 👍
* Message editing & deletion
* Voice notes
* Video & voice calling
* Infinite message scrolling
* Delivery status (sent / delivered / seen)

---

## 👨‍💻 Author

**Sinan Muhammed**
Full Stack Developer

Skilled in **Python, Django, React, SQL, Docker, and Real-Time Systems**

---

⭐ If you like this project, consider giving it a star!
