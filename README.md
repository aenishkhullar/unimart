# UniMart

UniMart is a comprehensive full-stack campus marketplace designed tailored for university ecosystems. It provides a professional, secure platform where students can seamlessly buy, sell, and rent items, fostering a sustainable and collaborative campus community.

## 🚀 Live Links

- **Frontend Deployment:** [https://unimart-client.vercel.app](https://unimart-client.vercel.app) *(Placeholders)*
- **Backend Deployment:** [https://unimart-server.onrender.com](https://unimart-server.onrender.com) *(Placeholders)*
- **GitHub Repository:** [https://github.com/aenishkhullar/unimart](https://github.com/aenishkhullar/unimart)

---

## ✨ Features

- **Buy and Sell Marketplace:** A complete listing system for student-to-student commerce.
- **Rental System:** Specialized rental logic with stock management and date-base availability.
- **Buyer Confirmation Flow:** Secure transaction cycle where buyers confirm receipt of items.
- **Seller Return Tracking:** Dashboard for sellers to manage active rentals and track returns.
- **Order Receipt Generation:** Automated professional receipts for all completed transactions.
- **Wishlist:** Personal collection area for saving items for future purchase or rental.
- **Real-time Chat:** Instant messaging between buyers and sellers for seamless communication.
- **Reviews and Ratings:** Peer-to-peer feedback system to build trust within the community.
- **Secure Authentication:** Email OTP-based registration and login for university verification.
- **Help Center:** Dedicated support section with FAQs and platform guidance.
- **Privacy Policy & TOS:** Legally structured policies integrated into the platform.
- **Admin Dashboard:** Centralized panel for platform moderation and oversight.
- **User & Product Management:** Robust tools for managing accounts and listings.
- **Report & Complaint System:** Integrated safety mechanism for reporting issues.
- **Marketplace Stats:** Real-time analytics and statistics for platform performance.
- **Toast Notifications:** Smooth and responsive UI feedback using React Hot Toast.
- **Inventory Management:** Smart handling of sold-out items and restock status.

---

## 🛠 Tech Stack

**Frontend**
- React.js (Vite)
- Vanilla CSS (Custom professional design system)
- React Router DOM (Navigation)
- Socket.io-client (Real-time communication)
- Axios (API requests)
- React Hot Toast (UI notifications)

**Backend**
- Node.js & Express.js
- Socket.io (Real-time engine)
- JWT (Secure Authentication)
- Nodemailer (Email OTP service)
- Multer & Cloudinary (Image handling and storage)
- Bcryptjs (Password encryption)

**Database**
- MongoDB (Mongoose ODM)
- MongoDB Atlas (Cloud hosting)

**Deployment**
- Frontend: Vercel
- Backend: Render

---

## 📁 Folder Structure

```text
unimart/
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application views and routes
│   │   ├── context/       # State management using Context API
│   │   └── assets/        # Stylesheets and media
├── server/                # Node.js backend
│   ├── controllers/       # Business logic for endpoints
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── middleware/        # Auth and security logic
│   └── utils/             # Helper services (Email, Cloudinary)
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/aenishkhullar/unimart.git
cd unimart
```

### 2. Backend Configuration
```bash
cd server
npm install
# Create a .env file based on the Environment Variables section below
npm run dev
```

### 3. Frontend Configuration
```bash
cd client
npm install
# Create a .env file with VITE_API_URL
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_university_email
EMAIL_PASS=your_email_app_password
OTP_EXPIRES_IN_MINUTES=10
FRONTEND_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Deployment

- **Frontend:** Hosted on **Vercel** for optimal performance and edge delivery.
- **Backend:** Hosted on **Render** utilizing a persistent web service.
- **Database:** **MongoDB Atlas** provides a scalable cloud database solution.

---

## 📌 Important Notes

- **API URL:** The frontend uses environment-targeted API endpoints; ensure `VITE_API_URL` is set correctly for your environment.
- **CORS Configuration:** The backend requires the `FRONTEND_URL` to be correctly set in environment variables to allow cross-origin requests.
- **Service Wake-up:** Since the backend is hosted on a free Render instance, it may experience a short delay (30-60 seconds) during the first load after a period of inactivity.

---

## 🔮 Future Improvements

- **Payment Gateway:** Integration of payment processors (Stripe/Razorpay) for direct transactions.
- **Advanced Analytics:** Detailed seller dashboards with sales trends and performance metrics.
- **Enhanced Notifications:** Implementation of browser push notifications and mobile alerts.
- **UI/UX Optimization:** Continuous refinement of mobile responsiveness and interactive elements.
- **AI Recommendations:** Smart product suggestions based on user browsing history.

---

## 👤 Author

**Aenish Khullar**
*Full Stack Developer*
[GitHub Profile](https://github.com/aenishkhullar)
