# NK Dairy & Ghee E-Commerce Platform

A premium, full-stack MERN (MongoDB, Express, React, Node.js) e-commerce application for selling premium dairy and ghee products. Built with **Vite + React** for a state-driven, dynamic user interface, and **Express + Mongoose** on the backend for robust, secure processing and administration.

---

## 🌟 Modern Upgrades (Vanilla HTML vs. MERN Stack)

The project has been migrated from a static, client-only demo using LocalStorage to a fully integrated **MERN stack** solution:
* **Dynamic Frontend**: Migrated from individual HTML files to a single-page React app (React 19, React Router v7) with state management contexts (`AuthContext`, `CartContext`).
* **Robust Backend**: Node/Express server providing production-ready REST APIs.
* **Persistent Database**: Switched to MongoDB Atlas/Mongoose for reliable product, user, and order storage.
* **Payment Ready**: Integrated APIs for both automated **Razorpay gateway verification** and zero-fee **Direct UPI QR/UTR** flows.
* **Admin Control**: Added an interactive administration dashboard to manage inventories, active statuses, track orders, and view sales details.
* **Automated Asset Seeding**: Support for Cloudinary product asset uploading and database seeding.

---

## 🏗️ Architecture & Stack

### Frontend (Client)
- **Vite & React 19** – Ultrafast development and client rendering
- **React Router Dom (v7)** – Declarative component-based routing
- **Context API** – Global contexts for authentication status and cart state
- **CSS3 & custom animations** – Modern layout styling (importing `styles.css`)
- **Font Awesome Icons** – Premium aesthetic components
- **Firebase SDK** – Initialized configuration setup

### Backend (Server)
- **NodeJS & Express** – REST API routing and middleware pipelines
- **Mongoose (MongoDB)** – Object modeling for user, order, and product schemas
- **JWT & bcryptjs** – State-free session tokens and secure password hashing
- **Cloudinary & Multer** – Cloud-based media uploads for product management
- **Nodemailer** – SMTP-triggered transactional email alerts
- **Razorpay SDK** – Webhook-ready dynamic order APIs

---

## 📁 Directory Structure

```
├── backend/
│   ├── config/              # Configuration (Cloudinary, etc.)
│   ├── middleware/          # JWT authorization and role checks
│   ├── models/              # Mongoose schemas (User, Product, Order)
│   ├── routes/              # Express API endpoints
│   ├── .env                 # Server secrets & DB configuration
│   ├── server.js            # Main backend application entry point
│   ├── seedProducts.js      # Populates catalog from static templates
│   └── fetchDataToMarkdown.js # Generates offline DATABASE_DATA.md logs
│
├── src/
│   ├── assets/              # Icons and general media files
│   ├── components/          # Reusable layout UI (Navbar, Footer, Floating WhatsApp)
│   ├── context/             # Global states (AuthContext, CartContext)
│   ├── pages/               # React pages (Home, Products, Detail, Admin, Checkout)
│   ├── utils/               # Axios/fetch backend handlers
│   ├── main.jsx             # React DOM bootstrapper
│   └── App.jsx              # Routing map and context providers
│
├── legacy_vanilla/          # Archived original HTML/JS/CSS client demo
├── styles.css               # Core CSS layout rules
├── index.html               # Main Vite HTML loader entry
├── vite.config.js           # Vite server settings
└── README.md                # This file
```

---

## 🚀 Installation & Local Setup

### 📋 Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** (Local Community Server or MongoDB Atlas cloud connection URI)

---

### 1️⃣ Backend Server Configuration

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory using the following keys:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_secret
   FRONTEND_URL=http://localhost:5173

   # Email Alerts (Optional SMTP config)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM="NK Dairy Products <noreply@nkdairy.com>"

   # Payments
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Cloudinary Media Storage (Optional)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Seed the database with the default ghee catalog:
   ```bash
   node seedProducts.js
   ```
5. Run the server in development mode:
   ```bash
   npm run dev
   ```

---

### 2️⃣ Frontend Setup

1. Return to the project root directory:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at: `http://localhost:5173`

---

## 💳 Payment Integrations (UPI Options)

The system is configured to support two modes of UPI payment processing (detailed in [UPI_PAYMENT_REQUIREMENTS.md](file:///c:/Users/sathy/OneDrive/Desktop/siva/siva%20product/UPI_PAYMENT_REQUIREMENTS.md)):

### Option 1: Razorpay Payment Gateway (Automated)
- **Flow**: Launches the Razorpay checkout overlay. Customers pay via dynamic QR code, card, net banking, or auto-selected UPI app.
- **Verification**: Automatic backend verification through signature validations. The database updates order status instantly.
- **Setup**: Requires adding `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`.

### Option 2: Direct UPI QR Code & Deep-Linking (Manual / Free)
- **Flow**: Mobile users open GPay, PhonePe, or Paytm via deep links. Desktop users scan a dynamically rendered QR code.
- **Verification**: Zero gateway MDR transaction fee. Customers input their 12-digit **UTR (UPI Ref Number)** in checkout. Admins verify this code inside the dashboard.
- **Setup**: Define merchant VPA ID and name inside the checkout configurations.

---

## 📊 Database Models & Seeding

### Seeding Catalog
Run `node backend/seedProducts.js` to clear and re-initialize product collections. 

### Current Catalog Inventory
The catalog is defined inside `DATABASE_DATA.md` and contains the following pre-configured options:
* Premium Cow Ghee - 50ml (₹40)
- Premium Cow Ghee - 100ml (₹80)
- Premium Cow Ghee - 200ml (₹150)
- Premium Cow Ghee - 500ml (₹375)
- Premium Cow Ghee - 1L (₹750)
- Premium Cow Ghee - 2L (₹1500)
- Premium Cow Ghee - 5L (₹3750)

To update the offline product catalog preview, run:
```bash
node backend/fetchDataToMarkdown.js
```

---

## 🔐 Administrative Access

The application features a secure, dedicated Admin Dashboard at the `/admin` path:
* **Analytics Bar**: Quick metrics showing total sales, completed orders, pending orders, and total registered users.
* **Product Manager**: Active toggling (Active/Inactive) of products in store catalog, updating inventory stock, and creating products with custom image urls.
* **Order Tracking**: Order lifecycle updates (Pending ➔ Processing ➔ Out for Delivery ➔ Delivered / Cancelled) along with manual UTR verification logs for direct UPI.

---

## 📞 Business Information & Support

For queries or custom business orders:
- **Email**: info@nkgroups.com
- **Phone**: +91 1234567890
- **Location**: India

---

**© 2026 NK Groups. All rights reserved.**
*Pure premium ghee crafted with care for health and taste.*
