import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Register() {
  const navigate = useNavigate();
  const { registerUser, loginWithGoogle, showToast } = useAuth();
  const { cart } = useCart();

  const [form, setForm] = useState({
    fullname: '',
    email: '',
    phone: ''
  });

  const handleRedirect = () => {
    const redirectTo = localStorage.getItem('redirectAfterAuth');
    if (redirectTo) {
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectTo);
    } else {
      navigate(cart.length > 0 ? '/cart' : '/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname.trim() || !form.email.trim() || !form.phone.trim()) return;

    const res = await registerUser(form.fullname.trim(), form.email.trim(), form.phone.trim());
    if (res && res.success) {
      setTimeout(() => {
        handleRedirect();
      }, 1200);
    } else if (res && res.exists) {
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    }
  };

  const handleGoogleClick = () => {
    if (window.firebase && window.firebase.auth) {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      window.firebase.auth().signInWithPopup(provider)
        .then(function(result) {
          loginWithGoogle(result.user);
          setTimeout(() => {
            handleRedirect();
          }, 1200);
        })
        .catch(function(error) {
          if (error.code === 'auth/popup-closed-by-user') {
            showToast('Google Sign-In cancelled.', 'error');
          } else {
            showToast('Google Sign-In failed: ' + error.message, 'error');
          }
        });
    } else {
      showToast('Firebase is not configured yet. Please use email registration.', 'error');
    }
  };

  return (
    <section className="auth-section" style={{ padding: '60px 0' }}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo"><i className="fas fa-store"></i></div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Sign up for free and start shopping</p>

          {/* Google Sign-In Button */}
          <div className="google-signin-wrap" style={{ marginBottom: '20px' }}>
            <button className="btn-social btn-google" onClick={handleGoogleClick} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width="20" height="20" />
              Continue with Google
            </button>
          </div>

          <div className="auth-divider"><span>OR register with details</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="fullname"><i className="fas fa-user"></i> Full Name</label>
              <input
                type="text"
                id="fullname"
                required
                placeholder="Enter your full name"
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
              <input
                type="email"
                id="email"
                required
                placeholder="Enter your email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="phone"><i className="fas fa-phone"></i> Phone Number</label>
              <input
                type="tel"
                id="phone"
                required
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary btn-block" style={{ width: '100%', padding: '12px' }}>
              <i className="fas fa-user-plus"></i> Sign Up
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
