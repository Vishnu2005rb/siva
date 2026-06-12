import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderConfirmation() {
  const navigate = useNavigate();

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
  );
}
