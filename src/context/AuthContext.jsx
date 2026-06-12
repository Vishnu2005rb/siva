import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show status toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Clear toast after timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load profile on start if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            const sessionUser = {
              id: res.user.id,
              name: res.user.fullname,
              email: res.user.email,
              phone: res.user.phone,
              role: res.user.role,
              provider: 'email'
            };
            setUser(sessionUser);
            localStorage.setItem('user', JSON.stringify(sessionUser));
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const registerUser = async (fullname, email, phone) => {
    try {
      const res = await api.post('/auth/register', { fullname, email, phone });
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        const sessionUser = {
          id: res.user.id,
          name: res.user.fullname,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          provider: 'email'
        };
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        showToast(`Welcome, ${fullname}! ✓`, 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Register failed:', error);
      if (error.data && error.data.exists) {
        showToast('Email already registered! Redirecting to login...', 'error');
        return { success: false, exists: true };
      }
      showToast(error.message || 'Registration failed. Please try again.', 'error');
      return { success: false };
    }
  };

  const loginUser = async (email) => {
    try {
      const res = await api.post('/auth/login', { email });
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        const sessionUser = {
          id: res.user.id,
          name: res.user.fullname,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          provider: 'email'
        };
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        showToast(`Welcome back, ${res.user.fullname}! ✓`, 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      showToast(error.message || 'No account found. Please sign up first.', 'error');
      return { success: false, notFound: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const fullname = googleUser.displayName || 'Google User';
      const email = googleUser.email;
      const phone = googleUser.phoneNumber || '';

      const res = await api.post('/auth/google', { fullname, email, phone });
      if (res.success) {
        localStorage.setItem('authToken', res.token);
        const sessionUser = {
          id: res.user.id,
          name: res.user.fullname,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          provider: 'google'
        };
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        showToast(`Signed in with Google as ${fullname} ✓`, 'success');
        return { success: true };
      }
    } catch (error) {
      console.error('Google login failed:', error);
      showToast('Google Sign-In failed to connect to backend', 'error');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      registerUser,
      loginUser,
      logout,
      loginWithGoogle,
      toast,
      showToast
    }}>
      {children}
      
      {/* Toast Notification UI */}
      {toast && (
        <div
          className="auth-toast"
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 28px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.95rem',
            zIndex: 10000,
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            maxWidth: '420px',
            textAlign: 'center',
            background: toast.type === 'success'
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
            animation: 'slideInToast 0.3s ease-out'
          }}
        >
          {toast.message}
        </div>
      )}
    </AuthContext.Provider>
  );
};
