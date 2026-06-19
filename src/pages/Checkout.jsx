import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
// Helper to dynamically load the Razorpay Checkout script if it hasn't loaded yet
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { getCheckoutItems, getSubtotal, getTax, getDelivery, getTotal, clearCart } = useCart();
  const { user } = useAuth();

  const checkoutItems = getCheckoutItems();

  // Form step: 'shipping' or 'payment'
  const [step, setStep] = useState('shipping');

  // Shipping details state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  // Load user information on mount if logged in
  useEffect(() => {
    if (user) {
      const names = user.name.split(' ');
      setShippingInfo(prev => ({
        ...prev,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Processing loader state
  const [isProcessing, setIsProcessing] = useState(false);

  // If no items, send back to products/cart (skip during processing redirects)
  useEffect(() => {
    if (checkoutItems.length === 0 && !isProcessing) {
      navigate('/cart');
    }
  }, [checkoutItems, isProcessing, navigate]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Move to payment step
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Set order totals in localStorage matching confirmation.js needs
    localStorage.setItem('orderTotal', getTotal().toFixed(2));
    localStorage.setItem('paymentMethod', paymentMethod.toUpperCase());
    localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

    // Show processing overlay
    setIsProcessing(true);

    try {
      // Step 1: Create the pending database order first to prevent lost orders
      const orderPayload = {
        items: checkoutItems.map(item => ({
          id: item.id || item._id,
          price: item.price,
          quantity: item.quantity,
          size: item.size
        })),
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod.toLowerCase(),
        paymentDetails: {},
        subtotal: getSubtotal(),
        deliveryCharges: getDelivery(),
        tax: getTax(),
        totalAmount: getTotal()
      };

      const dbOrderRes = await api.post('/orders', orderPayload);
      if (!dbOrderRes.success) {
        alert(dbOrderRes.message || 'Failed to place order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Step 2: Handle Cash on Delivery (COD) bypass
      if (paymentMethod === 'cod') {
        localStorage.setItem('lastOrderId', dbOrderRes.orderId);
        clearCart();
        navigate('/order-confirmation');
        return;
      }

      // Step 3: Handle Razorpay Online Payment Flow
      if (paymentMethod === 'razorpay') {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert('Failed to load Razorpay SDK. Please check your internet connection and try again.');
          setIsProcessing(false);
          return;
        }

        let razorpayOrderRes;
        try {
          // Request Razorpay Order ID from backend
          razorpayOrderRes = await api.post('/payment/create-order', {
            amount: getTotal(),
            items: checkoutItems.map(item => ({
              id: item.id || item._id,
              quantity: item.quantity,
              price: item.price
            }))
          });
        } catch (createErr) {
          console.error('Error creating Razorpay order:', createErr);
          alert('Network error while initializing payment. Please try again.');
          setIsProcessing(false);
          return;
        }

        if (!razorpayOrderRes.success) {
          alert(razorpayOrderRes.message || 'Failed to initialize payment.');
          setIsProcessing(false);
          return;
        }

        // Configure and open Razorpay Checkout modal
        const options = {

          // Razorpay Live Key from Cloudflare ENV
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrderRes.amount,
          currency: razorpayOrderRes.currency,
          name: 'NK Dairy Products',
          description: 'Premium Cow Ghee Order',
          order_id: razorpayOrderRes.order_id,
          handler: async function (response) {
            setIsProcessing(true);
            try {
              // Verify payment signature on the backend
              const verifyRes = await api.post('/payment/verify', {
                dbOrderId: dbOrderRes.order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.success) {
                localStorage.setItem('lastOrderId', dbOrderRes.orderId);
                clearCart();
                navigate('/order-confirmation');
              } else {
                alert(verifyRes.message || 'Payment signature verification failed.');
                setIsProcessing(false);
              }
            } catch (verifyErr) {
              console.error('Verification network error:', verifyErr);
              alert('Network error occurred during payment verification. Please check dashboard.');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            contact: shippingInfo.phone
          },
          notes: {
            dbOrderId: dbOrderRes.order._id
          },
          theme: {
            color: '#ff9800'
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              alert('Payment cancelled by user.');
            }
          }
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', function (response) {
          setIsProcessing(false);
          alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
        });

        rzp.open();
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(error.message || 'An unexpected network error occurred.');
      setIsProcessing(false);
    }
  };

  if (checkoutItems.length === 0) return null;

  return (
    <section className="checkout-page" style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Checkout Header */}
        <div className="checkout-progress" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
          <div className={`step ${step === 'shipping' ? 'active' : ''}`} id="step1" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            <span style={{ background: step === 'shipping' ? '#ff9800' : '#ddd', color: 'white', padding: '5px 10px', borderRadius: '50%', marginRight: '8px' }}>1</span>
            Shipping Info
          </div>
          <div className={`step ${step === 'payment' ? 'active' : ''}`} id="step2" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
            <span style={{ background: step === 'payment' ? '#ff9800' : '#ddd', color: 'white', padding: '5px 10px', borderRadius: '50%', marginRight: '8px' }}>2</span>
            Payment Method
          </div>
        </div>

        <div className="checkout-content">
          {/* Shipping Form Panel */}
          {step === 'shipping' && (
            <div id="shippingForm" style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginBottom: '20px' }}>Shipping Address</h2>
              <form onSubmit={handleShippingSubmit} id="addressForm" className="checkout-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    required
                    placeholder="Street Address, Apartment, Suite, Unit"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      required
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pincode">Pin Code</label>
                    <input
                      type="text"
                      id="pincode"
                      required
                      value={shippingInfo.pincode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    required
                    readOnly
                    value={shippingInfo.country}
                  />
                </div>

                <button type="submit" className="btn-primary btn-block" style={{ width: '100%', padding: '12px' }}>
                  Continue to Payment <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                </button>
              </form>
            </div>
          )}

          {/* Payment Form Panel */}
          {step === 'payment' && (
            <div id="paymentForm" style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginBottom: '20px' }}>Select Payment Method</h2>
              <form onSubmit={handlePlaceOrder} className="checkout-form">

                {/* Method Radios */}
                <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                  <label className="payment-option-label" style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'razorpay' ? '#fff9f0' : 'white', borderColor: paymentMethod === 'razorpay' ? '#ff9800' : '#ddd' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      style={{ marginRight: '12px', accentColor: '#ff9800' }}
                    />
                    <i className="fas fa-wallet" style={{ fontSize: '1.2rem', color: '#ff9800', marginRight: '10px' }}></i>
                    <span>Online Payment (Razorpay UPI / Card / Netbanking)</span>
                  </label>

                  <label className="payment-option-label" style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'cod' ? '#fff9f0' : 'white', borderColor: paymentMethod === 'cod' ? '#ff9800' : '#ddd' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ marginRight: '12px', accentColor: '#ff9800' }}
                    />
                    <i className="fas fa-money-bill-wave" style={{ fontSize: '1.2rem', color: '#ff9800', marginRight: '10px' }}></i>
                    <span>Cash on Delivery (COD)</span>
                  </label>
                </div>

                {/* Info panels based on selection */}
                {paymentMethod === 'razorpay' && (
                  <div className="payment-details-panel" style={{ background: '#fafafa', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                      <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#ff9800' }}></i>
                      You can pay instantly and securely using UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, or Net Banking via **Razorpay Secure Checkout**.
                    </p>
                  </div>
                )}

                {/* COD Info */}
                {paymentMethod === 'cod' && (
                  <div className="payment-details-panel" style={{ background: '#fff9f0', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #ffe8cc', color: '#a05000' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                    Please pay in cash when the delivery person arrives at your address.
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="button" className="btn-outline" onClick={() => setStep('shipping')} style={{ flex: '1', padding: '12px' }}>
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Back
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: '2', padding: '12px' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> Place Order (₹{getTotal().toFixed(2)})
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sidebar Order Summary */}
          <div className="checkout-summary">
            <div className="summary-card" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>

              {/* Checkout Items */}
              <div id="orderItems" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                {checkoutItems.map(item => (
                  <div key={item.id} className="order-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                    <div className="order-item-image" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: '5px' }}>
                      <img src={item.image?.startsWith('http') ? item.image : `/${item.image}`} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }} />
                      <div className="pd-img-fallback" style={{ display: 'none', width: '40px', height: '40px' }}><i className="fas fa-jar"></i></div>
                    </div>
                    <div className="order-item-info" style={{ flex: '1' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{item.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0 0' }}>Qty: {item.quantity}</p>
                    </div>
                    <div className="order-item-price" style={{ fontWeight: '500' }}>₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '0.95rem' }}>
                <span>Subtotal</span>
                <span id="summarySubtotal">₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '0.95rem' }}>
                <span>Delivery</span>
                <span id="summaryDelivery" style={{ color: 'green' }}>
                  {getDelivery() === 0 ? 'FREE' : `₹${getDelivery()}`}
                </span>
              </div>
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '0.95rem' }}>
                <span>Tax (0%)</span>
                <span id="summaryTax">₹{getTax().toFixed(2)}</span>
              </div>
              <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span id="summaryTotal" style={{ color: '#ff9800' }}>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay loader */}
      {isProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '60px', marginBottom: '20px', color: '#ff9800' }}></i>
            <h2>Processing your payment...</h2>
            <p>Please wait while we confirm your order</p>
          </div>
        </div>
      )}
    </section>
  );
}
