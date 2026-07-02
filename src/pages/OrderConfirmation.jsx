import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);

  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    orderDate: '',
    orderTotal: '0.00',
    paymentMethod: 'N/A',
    deliveryDate: ''
  });

  useEffect(() => {
    // Generate order ID
    const generatedId = 'NK-' + Math.floor(10000 + Math.random() * 90000);

    // Get order date
    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get totals from localStorage
    const savedTotal = localStorage.getItem('orderTotal') || '0.00';
    const savedPayment = localStorage.getItem('paymentMethod') || 'N/A';

    // Calculate delivery date (+4 days)
    const delivDateObj = new Date();
    delivDateObj.setDate(delivDateObj.getDate() + 4);
    const delivDateStr = delivDateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setOrderDetails({
      orderId: generatedId,
      orderDate: dateStr,
      orderTotal: savedTotal,
      paymentMethod: savedPayment,
      deliveryDate: delivDateStr
    });

    // Cleanup stored transaction parameters, but keep them for display during session
    return () => {
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('paymentMethod');
      localStorage.removeItem('orderTotal');
    };
  }, []);

  return (
    <>
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'fadeInModal 0.35s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '40px 30px',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: '460px',
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            animation: 'scaleUpModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '2px solid rgba(255, 152, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <button 
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: '#aaa',
                transition: 'color 0.2s',
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.target.style.color = '#333'}
              onMouseLeave={(e) => e.target.style.color = '#aaa'}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ffb74d, #ff9800)',
              color: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 25px auto',
              fontSize: '2.5rem',
              boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)',
              animation: 'bounceIcon 1.5s infinite ease-in-out'
            }}>
              <i className="fas fa-heart"></i>
            </div>
            
            <h2 style={{ fontSize: '1.8rem', color: '#1a1a1a', marginBottom: '12px', fontWeight: '700' }}>
              Thank You!
            </h2>
            <p style={{ color: '#555555', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
              Thanks for placing your order in our <strong>NK Dairy Products</strong>! We appreciate your trust in us and are already preparing your premium ghee pack.
            </p>
            
            <button 
              onClick={() => setShowPopup(false)}
              className="btn-primary" 
              style={{ 
                padding: '14px 40px', 
                fontSize: '1.05rem', 
                fontWeight: '600',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #ffa726, #fb8c00)',
                border: 'none',
                boxShadow: '0 6px 15px rgba(251, 140, 0, 0.4)',
                cursor: 'pointer',
                color: 'white',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(251, 140, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 15px rgba(251, 140, 0, 0.4)';
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <section className="confirmation-page" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '80px', height: '80px', background: '#d4edda', color: '#28a745', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px auto', fontSize: '2.5rem' }}>
            <i className="fas fa-check"></i>
          </div>
          
          <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#333' }}>Order Confirmed!</h1>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.05rem' }}>
            Thank you for shopping with NK Dairy Products. Your order has been placed successfully.
          </p>

          {/* Order Info Card */}
          <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '25px', marginBottom: '35px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <span style={{ color: '#666' }}>Order ID:</span>
              <strong style={{ color: '#333' }} id="orderId">{orderDetails.orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <span style={{ color: '#666' }}>Order Date:</span>
              <span style={{ color: '#333', fontWeight: '500' }} id="orderDate">{orderDetails.orderDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <span style={{ color: '#666' }}>Total Amount:</span>
              <strong style={{ color: '#ff9800' }} id="orderTotal">₹{orderDetails.orderTotal}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <span style={{ color: '#666' }}>Payment Method:</span>
              <span style={{ color: '#333', fontWeight: '500' }} id="paymentMethod">{orderDetails.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
              <span style={{ color: '#666' }}>Estimated Delivery:</span>
              <span style={{ color: '#28a745', fontWeight: '600' }} id="deliveryDate">{orderDetails.deliveryDate}</span>
            </div>
          </div>

          <button onClick={() => navigate('/products')} className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.05rem' }}>
            <i className="fas fa-shopping-bag" style={{ marginRight: '8px' }}></i> Continue Shopping
          </button>
        </div>
      </section>
    </>
  );
}
