# UniMart

A full-stack campus marketplace built for university ecosystems. UniMart provides a secure, professional platform where students can buy, sell, and rent items — fostering a sustainable and collaborative campus community.

**Live Application:** [www.unimart.study](https://www.unimart.study)  
**Repository:** [github.com/aenishkhullar/unimart](https://github.com/aenishkhullar/unimart)

---

## Overview

UniMart is designed specifically for the university environment, enabling peer-to-peer commerce within a trusted, verified student community. The platform handles the full transaction lifecycle — from listing and discovery to purchase confirmation, rental management, and receipt generation.

---

## Features

**Marketplace**
- Buy and sell listings with full item management and inventory tracking
- Rental system with stock management and date-based availability
- Wishlist for saving items for future consideration

**Transactions**
- Buyer confirmation flow for secure transaction completion
- Seller return tracking dashboard for active rental oversight
- Automated order receipt generation for all completed transactions

**Communication**
- Real-time chat between buyers and sellers via WebSocket
- Reviews and ratings system for peer-to-peer trust

**Authentication and Security**
- Email OTP-based registration and login for university verification
- JWT-secured sessions with encrypted password storage

**Administration**
- Admin dashboard for platform moderation and oversight
- User and product management tools
- Report and complaint system for issue escalation
- Real-time marketplace analytics and statistics

**Platform**
- Help center with FAQs and platform guidance
- Privacy policy and terms of service integrated into the platform
- Toast notifications for responsive UI feedback

---

## Tech Stack

**Frontend**
- React.js (Vite)
- Vanilla CSS with a custom design system
- React Router DOM
- Socket.io-client
- Axios
- React Hot Toast

**Backend**
- Node.js and Express.js
- Socket.io
- JWT authentication
- Resend for OTP email delivery
- Multer and Cloudinary for image handling
- Bcryptjs for password encryption

**Database**
- MongoDB with Mongoose ODM
- MongoDB Atlas for cloud hosting

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```
unimart/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Application views and routes
│       ├── context/         # State management (Context API)
│       └── assets/          # Stylesheets and media
└── server/                  # Node.js backend
    ├── controllers/         # Business logic for endpoints
    ├── models/              # Mongoose schemas
    ├── routes/              # API route definitions
    ├── middleware/          # Authentication and security
    └── utils/               # Helper services (Email, Cloudinary)
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A MongoDB Atlas account
- A Cloudinary account
- A Resend account for email delivery

### 1. Clone the Repository

```bash
git clone https://github.com/aenishkhullar/unimart.git
cd unimart
```

### 2. Configure and Run the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_sender_email
OTP_EXPIRES_IN_MINUTES=10
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Configure and Run the Frontend

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

---

## Deployment Notes

- **CORS:** The `FRONTEND_URL` environment variable on the backend must match the deployed frontend origin exactly.
- **API URL:** Set `VITE_API_URL` in the frontend environment to point to the correct backend deployment URL.
- **Cold Starts:** The backend is hosted on a free Render instance and may take 30–60 seconds to respond after a period of inactivity.

---

## Roadmap

- Payment gateway integration (Stripe / Razorpay)
- Advanced seller analytics with sales trends and performance metrics
- Browser push notifications and mobile alerts
- Mobile responsiveness and UI/UX refinements
- AI-powered product recommendations based on browsing history

---

## Author

**Aenish Khullar** — Full Stack Developer  
[GitHub Profile](https://github.com/aenishkhullar)