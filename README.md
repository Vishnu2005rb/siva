# NK Groups - Premium Ghee E-Commerce Website

A complete e-commerce website for selling premium ghee products online with authentication, shopping cart, checkout, and payment processing.

## Features

### 🔐 Authentication System
- User registration with validation
- Login/Logout functionality
- Password confirmation
- User session management
- Social login UI (Google & Facebook)

### 🛍️ Shopping Experience
- Product catalog with 8 premium ghee products
- Product filtering by size (500ml, 1L, 2L, 5L)
- Product sorting (price, name)
- Star ratings for products
- Responsive product cards with images

### 🛒 Shopping Cart
- Add to cart functionality
- Update quantities (+/-)
- Remove items
- Cart badge with item count
- Real-time price calculations
- Free delivery on orders above ₹500

### 💳 Checkout & Payment
- Multi-step checkout process
- Shipping information form
- Multiple payment methods:
  - Credit/Debit Card
  - UPI
  - Net Banking
  - Cash on Delivery
- Order summary sidebar
- Tax calculation (5%)
- Delivery charges

### 📦 Order Management
- Order confirmation page
- Unique order ID generation
- Order details display
- Email confirmation notification
- Estimated delivery date

## Pages

1. **index.html** - Home page with hero section, features, and featured products
2. **products.html** - Full product catalog with filters and sorting
3. **cart.html** - Shopping cart with item management
4. **login.html** - User login page
5. **register.html** - User registration page
6. **checkout.html** - Multi-step checkout process
7. **order-confirmation.html** - Order success page

## Files Structure

```
├── index.html              # Home page
├── products.html           # Products catalog
├── cart.html              # Shopping cart
├── login.html             # Login page
├── register.html          # Registration page
├── checkout.html          # Checkout process
├── order-confirmation.html # Order confirmation
├── styles.css             # All styling
├── script.js              # Main JavaScript
├── auth.js                # Authentication logic
├── cart.js                # Cart management
├── products.js            # Product display
├── checkout.js            # Checkout process
├── confirmation.js        # Order confirmation
└── README.md              # This file
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - All functionality
- **LocalStorage** - Data persistence
- **Font Awesome** - Icons

## Design Features

- ✨ Light theme with orange/amber color scheme
- 📱 Fully responsive design
- 🎨 Clean and modern UI
- ⚡ Smooth animations and transitions
- 🔔 Toast notifications
- 💫 Hover effects

## How to Use

1. **Open the website**
   - Open `index.html` in your browser

2. **Browse Products**
   - View featured products on home page
   - Visit Products page for full catalog
   - Filter by size or sort by price/name

3. **Add to Cart**
   - Click "Add" button on any product
   - View cart badge update in navigation

4. **Register/Login**
   - Click "Login" in navigation
   - Register new account or login
   - All data stored in browser LocalStorage

5. **Checkout**
   - View cart and proceed to checkout
   - Fill shipping information
   - Select payment method
   - Place order

6. **Order Confirmation**
   - View order details
   - Get unique order ID
   - See estimated delivery date

## Product Catalog

The website includes 8 premium ghee products:

1. Premium Cow Ghee - 500ml (₹450)
2. Premium Cow Ghee - 1L (₹850)
3. Premium Cow Ghee - 2L (₹1650)
4. Premium Cow Ghee - 5L (₹4000)
5. A2 Desi Cow Ghee - 500ml (₹600)
6. A2 Desi Cow Ghee - 1L (₹1150)
7. Organic Ghee - 500ml (₹550)
8. Organic Ghee - 1L (₹1050)

## Key Features Explained

### Cart Management
- Persistent cart using LocalStorage
- Real-time updates
- Quantity controls
- Price calculations with tax and delivery

### User Authentication
- Client-side authentication
- Secure password storage
- Session management
- Protected checkout (login required)

### Responsive Design
- Mobile-first approach
- Breakpoints: 576px, 768px, 992px
- Flexible grid layouts
- Touch-friendly buttons

### Order Processing
- 3-step checkout flow
- Form validation
- Payment method selection
- Order confirmation with unique ID

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Notes

- This is a front-end demo using LocalStorage
- No actual payment processing
- For production, integrate:
  - Backend API
  - Real payment gateway (Razorpay, Stripe, etc.)
  - Database for users and orders
  - Email service for notifications
  - Order tracking system

## Future Enhancements

- User profile page
- Order history
- Product reviews
- Wishlist functionality
- Admin dashboard
- Real-time inventory
- Email notifications
- OTP verification
- Password reset
- Address book
- Multiple addresses
- Coupon codes
- Product search

## Contact

For NK Groups:
- Phone: +91 1234567890
- Email: info@nkgroups.com
- Location: India

---

**© 2026 NK Groups. All rights reserved.**

Made with ❤️ for premium ghee lovers
