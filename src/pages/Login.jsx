import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const { loginUser, loginWithGoogle, showToast } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleRedirect = () => {
    const redirectTo = localStorage.getItem('redirectAfterAuth');
    if (redirectTo) {
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectTo);
    } else {
      navigate(cart.length > 0 ? '/cart' : '/');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const res = await loginUser(email.trim());
    if (res && res.success) {
      setTimeout(() => {
        handleRedirect();
      }, 1200);
    }
  };

  const handleGoogleClick = () => {
    // Check if firebase is available globally from script loads or initialized
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
      showToast('Firebase is not configured yet. Please use email sign-in.', 'error');
    }
  };

  return (
    <section className="auth-section" style={{ padding: '60px 0' }}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo"><i className="fas fa-store"></i></div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login with your registered email</p>

          {/* Google Sign-In Button */}
          <div className="google-signin-wrap" style={{ marginBottom: '20px' }}>
            <button className="btn-social btn-google" onClick={handleGoogleClick} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width="20" height="20" />
              Continue with Google
            </button>
          </div>

          <div className="auth-divider"><span>OR login with email</span></div>

          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
              <input
                type="email"
                id="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary btn-block" style={{ width: '100%', padding: '12px' }}>
              <i className="fas fa-sign-in-alt"></i> Login
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
