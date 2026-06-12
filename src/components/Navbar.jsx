import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand" style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <i className="fas fa-store"></i>
          <span>NK Dairy Products</span>
        </Link>
        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
              Contact
            </NavLink>
          </li>
        </ul>
        <div className="nav-actions">
          <Link to="/cart" className="cart-icon" style={{ textDecoration: 'none' }}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">{getCartItemCount()}</span>
          </Link>
          <button onClick={handleUserClick} className="btn-login">
            {user ? user.name : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
}
