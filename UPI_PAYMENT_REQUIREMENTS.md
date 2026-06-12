# UPI Payment Integration Requirements

This document outlines the detailed requirements, options, and steps to integrate **UPI (Unified Payments Interface)** payments into the **NK Dairy / Ghee E-Commerce Project**.

Currently, the application uses mock/placeholder payments (e.g., just entering a text UPI ID or a fake card number). To implement a real-live payment flow using UPI, you can choose between two main paths:

---

## 🗺️ Comparison of Integration Approaches

| Feature | Option 1: Razorpay Payment Gateway (Automated) | Option 2: Direct UPI QR & Deep-Link (Manual/Free) |
| :--- | :--- | :--- |
| **Transaction Fees** | ~2% per transaction + GST | **0% (Free)** |
| **Verification** | **Automatic & Instant** (System marks order as paid) | **Manual** (Admin verifies using 12-digit UTR/Ref ID) |
| **Customer UX** | Launches Razorpay widget, scans dynamic QR, or opens UPI apps on mobile | Scans a QR code on screen or clicks a button to open UPI apps on mobile |
| **Account Req.** | Registered business / Individual merchant KYC on Razorpay | Any active UPI VPA/ID (e.g., `nkdairy@okaxis`, Google Pay, PhonePe) |
| **Setup Difficulty**| Medium (Requires API keys, backend route, Razorpay SDK) | Easy (Requires a frontend QR Code component, no SDK needed) |

---

## 💰 Cost Analysis & Method Limitations

Here is a breakdown of the three cost categories for implementing payment methods on your website:

### 1. 🟢 Free Method: Direct UPI QR Code & Deep-Linking
* **Transaction Fee**: **0% (Completely Free)**.
* **How it works**: Money goes directly from the customer's bank account to your personal/business UPI ID (e.g., Google Pay/PhonePe merchant QR) without passing through a middleman gateway.
* **Limitations & Drawbacks**:
  * **Manual Reconciliation**: The system cannot automatically know if a payment succeeded. You must ask the user to type their **12-digit UTR/UPI Ref Number** at checkout. You then have to log into your bank app and manually verify if the amount was received before shipping the order.
  * **Risk of Fake Orders**: A user could type a fake 12-digit number or upload a random screenshot. Your admin team must be careful to verify actual receipt of money.
  * **Poor Customer UX**: Customers have to manually copy the UTR/Reference ID from their UPI App and paste it back into your website to finish the checkout.
  * **Not Scalable**: If you get more than 10-20 orders a day, checking each payment manually becomes a major bottleneck.

### 2. 🟡 Low-Cost Method: UPI via Indian Payment Gateways (Razorpay/Cashfree/PhonePe PG)
* **Transaction Fee**: **0% to 2% + GST**. (Under Indian regulations, standard UPI transactions have 0% MDR for UPI-enabled bank accounts, though gateways may charge up to 2% for premium UPI integrations or credit card UPI links).
* **How it works**: Uses a secure payment gateway integration that handles the payment flow and provides instant callbacks.
* **Limitations & Drawbacks**:
  * **KYC Documentation**: You must register a merchant account and submit documents (PAN, Aadhaar, bank statement, GST registration if applicable) for approval.
  * **Settlement Delay**: Payments are held by the gateway and settled to your bank account after **T+1 to T+3 business days**.
  * **Gateway Uptime**: If the payment gateway or bank UPI server goes down, the payment can fail.

### 3. 🔴 High-Cost Method: Credit/Debit Cards, Net Banking & International Cards
* **Transaction Fee**: **2% to 4% + GST** for domestic cards, and up to **4% to 6%** for international cards (such as Stripe or Paypal payments).
* **How it works**: Processed through global payment processors or advanced payment gateway pipelines.
* **Limitations & Drawbacks**:
  * **Highest Costs**: A portion of your profit margin is taken for every single sale.
  * **Chargebacks & Disputes**: Customers can file a dispute/chargeback with their bank, forcing you to pay a dispute penalty (usually ₹500+ per chargeback) and lose the money until resolved.
  * **Refund Processing**: Refunding card payments takes 5–7 banking days, which can frustrate customers.

### How Payment Gateway Transaction Fees Work (Per Transaction)

#### 1. Charges are **Per-Transaction** (Not flat or overall)
* Payment gateways charge a percentage fee for **every single successful purchase** made.
* There is no flat monthly fee or overall charge; if you make no sales, you pay ₹0.
* For standard domestic payment methods (Credit cards, Net banking, Wallets), the fee is typically **2% per transaction**.
* **GST (Goods & Services Tax)**: An 18% GST is charged on the gateway's fee (not on your product price).
  
##### 🧮 Example Fee Calculation:
Suppose a customer buys ghee for **₹1,000**:
1. **Base Fee** (2% of ₹1,000) = **₹20.00**
2. **GST on Fee** (18% of ₹20.00) = **₹3.60**
3. **Total Gateway Charge** (₹20.00 + ₹3.60) = **₹23.60**
4. **Amount Settled to Your Bank Account** = ₹1,000 - ₹23.60 = **₹976.40**

---

#### 2. How is the Gateway "Free" for UPI?
Under the Indian Government's **Zero MDR (Merchant Discount Rate)** mandate, payment service providers and banks are legally prohibited from charging transaction fees on standard UPI payments.
* **Standard UPI (Bank to Bank)**: When a customer pays using their linked bank account via GPay, PhonePe, Paytm, or BHIM, the gateway is forced to pass **100% of the money** to the merchant with **0% fee**.
* **How Gateways Make Money**: 
  1. They charge for other methods like Debit/Credit Cards, Net Banking, and Wallets.
  2. **RuPay Credit Cards on UPI**: A customer can link a Credit Card (RuPay) to their UPI app. Because this uses a credit line rather than a direct bank account transfer, gateways *do* charge a fee (around 1.5% to 2%) for UPI payments made via RuPay credit cards.
  3. Value-added services (like subscription billing, custom checkout pages, or faster settlements).

---

## 💳 Option 1: Razorpay Payment Gateway (Automated)
*Recommended for professional e-commerce operations. It handles the secure processing, validation, and real-time order status updates.*

### 📋 Prerequisites & Accounts Needed
1. **Razorpay Merchant Account**: Register at [Razorpay](https://razorpay.com/).
2. **KYC Verification**: Submit business details (PAN card, bank account, business type) to activate live payments. For testing, you can use **Test Mode** without full KYC.
3. **API Keys**:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   *(These are added to the backend [backend/.env](file:///c:/Users/sathy/OneDrive/Desktop/siva/siva%20product/backend/.env))*

### ⚙️ Technical Packages to Install
* **Backend**:
  `razorpay` (Node SDK for orders and verification), `crypto` (standard library to verify signatures).
* **Frontend**:
  Add Razorpay Checkout script dynamically in the React frontend:
  `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

### 🔄 The Razorpay UPI Integration Flow
1. **Create Order (Backend)**: When the user clicks "Place Order" in [Checkout.jsx](file:///c:/Users/sathy/OneDrive/Desktop/siva/siva%20product/src/pages/Checkout.jsx), the frontend makes an API call: `POST /api/payments/razorpay-order` sending the total amount. The backend uses the Razorpay SDK to create an order:
   ```javascript
   const order = await razorpay.orders.create({
     amount: totalAmount * 100, // Amount in paise (e.g. ₹500 = 50000 paise)
     currency: "INR",
     receipt: `receipt_order_${Date.now()}`
   });
   ```
2. **Open Checkout (Frontend)**: The frontend receives the Razorpay `order_id` and configures the Razorpay JS Checkout Options:
   ```javascript
   const options = {
     key: "YOUR_RAZORPAY_KEY_ID",
     amount: order.amount,
     currency: "INR",
     order_id: order.id,
     name: "NK Dairy Products",
     handler: async function (response) {
       // Sends response.razorpay_payment_id, razorpay_order_id, razorpay_signature
       // to backend verification endpoint to finalize order.
     },
     prefill: {
       name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
       email: shippingInfo.email,
       contact: shippingInfo.phone
     },
     theme: { color: "#ff9800" } // Theme matched to Ghee branding
   };
   ```
3. **Verify Payment (Backend)**: The backend verifies the cryptographic signature:
   ```javascript
   const generated_signature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(order_id + "|" + payment_id)
     .digest('hex');
   ```
   If signatures match, order status is marked as **Paid / Processing**, stock is decremented, and the order is completed.

---

## 📲 Option 2: Direct UPI QR & Deep-Linking (Manual / Free)
*Best for getting started quickly with zero transaction charges. The customer pays directly to your UPI ID.*

### 📋 Prerequisites & Accounts Needed
1. **UPI VPA (Virtual Payment Address)**: Any active UPI address like `nkdairy@upi`, `yourphone@okaxis`, `ownername@ybl`.
2. **Frontend QR Code Library**: 
   Install `qrcode.react` to generate QR codes dynamically on the frontend.
   ```bash
   npm install qrcode.react
   ```

### ⚙️ Technical Integration Flow
1. **Generate UPI Payment URI**: Standardized UPI URI format:
   ```text
   upi://pay?pa=MERCHANT_UPI_ID&pn=MERCHANT_NAME&am=AMOUNT&tn=ORDER_ID&cu=INR
   ```
   *Example*: `upi://pay?pa=nkdairy@ybl&pn=NK%20Dairy&am=750.00&tn=Order_NK1004&cu=INR`
   
2. **Render Payment Methods (Frontend)**:
   - **For Mobile Users**: Display a clickable button `Pay via UPI Apps`. When clicked, it opens their default UPI App (Google Pay, PhonePe, Paytm) prefilled with your UPI ID, Amount, and Order Note.
   - **For Desktop Users**: Convert the UPI URI into a **QR Code** on screen using `qrcode.react`. The user scans it using their mobile UPI app.

3. **Verify & Complete Payment**:
   - Since there is no automatic bank API notification, you display an input field asking the user to:
     * *“Enter the 12-Digit UPI Ref No / Transaction ID (UTR) after payment”*
   - Once submitted, the backend saves the order with the status `payment_pending` and saves the UTR.
   - An administrator checks the bank account to verify receipt of payment matching that UTR, then updates the order status to `processing`/`completed` from an admin panel.

---

## 🔑 Summary of Credentials & Settings Needed

If you choose **Option 1 (Razorpay)**, you need to set the following in [backend/.env](file:///c:/Users/sathy/OneDrive/Desktop/siva/siva%20product/backend/.env):
```env
RAZORPAY_KEY_ID=rzp_test_...         # Your test/live Key ID
RAZORPAY_KEY_SECRET=...             # Your test/live Secret Key
```

If you choose **Option 2 (Direct UPI)**, you will need to add your merchant details in the frontend configurations:
```javascript
const MERCHANT_UPI_ID = "yourname@bank"; // e.g. GPay/PhonePe business UPI VPA
const MERCHANT_NAME = "NK Dairy Products";
```

---

## 📈 Next Step Recommendation
* **For Testing**: We can implement the **Direct UPI QR Code with UTR Entry** first, as it does not require live credentials and works immediately.
* **For Launching**: When you go live, switching to **Razorpay** is recommended to automate order processing and provide a premium, smooth checkout experience without manual verification.
