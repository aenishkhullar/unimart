# UniMart – Campus Marketplace Platform

UniMart is a full-stack campus marketplace built using the MERN stack that allows students to buy, sell, and rent items within their university. It provides a secure and efficient ecosystem for student-to-student transactions, specialized for the unique needs of a campus environment.

## Features

- Buy & Sell system: Complete marketplace for students to list items for sale with category filtering and search.
- Rental system: Specialized rental logic with date-based availability, deposit handling, and automated stock management.
- Buyer confirmation system: Secure flow where buyers confirm receipt of items to facilitate transaction completion.
- Seller order completion & return tracking: Dashboard for sellers to manage orders, mark items as delivered, and track rental returns.
- Email OTP authentication: Secure registration and login using Nodemailer to verify university email addresses.
- Admin dashboard: Centralized moderation interface with real-time marketplace statistics and user management.
- Report & moderation system: Built-in reporting for items or users, allowing admins to maintain platform safety.
- Wishlist: Personal collection of saved items for later viewing.
- Real-time chat system: Instant messaging between buyers and sellers integrated with Socket.io for seamless negotiation.

## Tech Stack

- Frontend: React (Vite), Context API, CSS (Custom Design System)
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Authentication: JWT (JSON Web Tokens) + Email OTP (Nodemailer)
- Others: Socket.io (Real-time Chat), Cloudinary (Image Hosting), Multer (File Handling)

## Folder Structure

- client/
  - public/: Static assets.
  - src/
    - components/: Reusable UI components.
    - context/: State management using React Context API.
    - pages/: Main application views.
    - assets/: Stylesheets and local images.
- server/
  - controllers/: Business logic for API endpoints.
  - models/: Mongoose schemas and database models.
  - routes/: API route definitions.
  - middleware/: Authentication and configuration logic.
  - utils/: Helper functions and service configurations.

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/aenishkhullar/unimart.git
cd unimart
```

2. Backend Setup
- Navigate to the server folder: `cd server`
- Install dependencies: `npm install`
- Create a .env file and add your configuration.
- Run the server: `npm run dev`

3. Frontend Setup
- Navigate to the client folder: `cd client`
- Install dependencies: `npm install`
- Run the application: `npm run dev`

## Environment Variables

The following environment variables are required in the server/.env file:

- MONGO_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT signing
- EMAIL_USER: Nodemailer email service address
- EMAIL_PASS: Nodemailer email service password
- CLOUDINARY_CLOUD_NAME: Cloudinary account name
- CLOUDINARY_API_KEY: Cloudinary API key
- CLOUDINARY_API_SECRET: Cloudinary API secret

## Usage

- Buying/Renting: Browse products, use the wishlist to save items, and initiate a chat with the seller.
- Listing: Users can list products for sale or rent directly from their profile.
- Order Management: Sellers use the dashboard to track requests, confirm orders, and manage inventory.
- Admin: Access the admin panel to view platform stats and handle reports.

## Future Improvements

- Payment integration: Automated payment processing for sales and rentals.
- Mobile responsiveness: Dedicated mobile app or PWA for a better on-site experience.
- Real-time notifications: Push notifications for messages and order status updates.

## Author Section

Aenish Khullar
Role: Full Stack Developer
