# 🛒 UniMart – Student Marketplace Platform

A full-stack **MERN marketplace platform** designed for university students to **buy, sell, and rent products** within their campus ecosystem.

---

## 🚀 Features

### 🛍️ Marketplace
- Create, Edit, Delete Listings
- Buy & Rent functionality
- Category-based browsing & filters
- Product Details Page with modern UI

### ⭐ Reviews & Ratings
- Transaction-based review system
- Only verified buyers can review
- Average rating calculation

### 👤 Seller Profile System
- Seller rating & review count
- Seller listings overview
- Trust badges (e.g., Trusted Seller)

### ❤️ Wishlist (Saved Items)
- Save/unsave products
- Dedicated Saved Items page
- Instagram-style bookmark UI

### 💬 Real-Time Chat System
- Product-based conversations
- Socket.IO integration
- Quick replies:
  - No negotiation
  - Fixed price
  - Available today
- Prevent duplicate chats

### 🔐 Authentication & Security
- JWT-based authentication
- Protected routes
- Ownership-based access control

---

## 🧠 Tech Stack

### Frontend
- React (Vite)
- CSS (Custom design system)

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Real-Time
- Socket.IO

### Auth
- JWT (JSON Web Tokens)

---

## 📁 Project Structure

client/ → React frontend  
server/ → Node.js backend  
models/ → Database schemas  
routes/ → API routes  
controllers/ → Business logic 

## ⚙️ Installation

### Clone the repository
git clone https://github.com/your-username/unimart.git

### Backend setup
cd server
npm install
npm run dev

### Frontend setup
cd client
npm install
npm run dev 

### Key Functional Flows
🛒 Buy / Rent Flow
Browse → View Product → Chat Seller → Place Order
⭐ Review Flow
Order Completed → Review available in My Orders → Rating added
💬 Chat Flow
Click "Message Seller" → Conversation created → Real-time messaging

### Current Status
🚧 Work in Progress
Core features implemented:
Marketplace
Reviews
Seller Profiles
Wishlist
Real-time Chat
Upcoming:
Order pricing system (rent + deposit)
Notifications system
Image upload (Cloudinary)
Secure registration (college verification)

## 👨‍💻 Author
Aenish Khullar
