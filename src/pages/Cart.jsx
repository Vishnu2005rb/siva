import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getSubtotal,
    getTax,
    getDelivery,
    getTotal,
    setIsBuyNow
  } = useCart();
  
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // We are proceeding from normal cart, so isBuyNow must be false
    setIsBuyNow(false);

    if (!user) {
      showToast('Please login to continue', 'error');
      localStorage.setItem('redirectAfterAuth', '/checkout');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <section className="cart-page" style={{ padding: '40px 0' }}>
      <div className="container">
        <h1>Shopping Cart</h1>

        {cart.length === 0 ? (
          <div id="emptyCart" className="empty-cart" style={{ display: 'block', textAlign: 'center', padding: '60px 20px' }}>
            <i className="fas fa-shopping-basket" style={{ fontSize: '70px', color: '#ff9800', marginBottom: '20px' }}></i>
            <h2>Your cart is empty</h2>
            <p style={{ margin: '15px 0', color: '#666' }}>Add some premium cow ghee products to get started!</p>
            <Link to="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <i className="fas fa-shopping-bag"></i> Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
            {/* Cart Items List */}
            <div id="cartItems" className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.image?.startsWith('http') ? item.image : `/${item.image}`}
                      alt={item.name}
                      style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="pd-img-fallback" style={{ display: 'none', width: '80px', height: '80px', borderRadius: '5px' }}>
                      <i className="fas fa-jar"></i>
                    </div>
                  </div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="cart-item-price">
                      ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                      <i className="fas fa-trash"></i> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div id="cartSummary" className="cart-summary" style={{ display: 'block' }}>
              <div className="summary-card" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h2>Order Summary</h2>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>Subtotal</span>
                  <span id="subtotal">₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>Delivery Charges</span>
                  <span id="delivery" style={{ color: 'green', fontWeight: '500' }}>
                    {getDelivery() === 0 ? 'FREE' : `₹${getDelivery()}`}
                  </span>
                </div>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>Tax (0%)</span>
                  <span id="tax">₹{getTax().toFixed(2)}</span>
                </div>
                <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span id="total" style={{ color: '#ff9800' }}>₹{getTotal().toFixed(2)}</span>
                </div>
                <button className="btn-primary btn-block" onClick={handleCheckout} style={{ width: '100%', padding: '12px', fontSize: '1.05rem' }}>
                  Proceed to Checkout <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
