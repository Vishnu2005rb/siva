import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><i className="fas fa-store"></i> NK Dairy Products</div>
            <p>Pure, authentic cow ghee crafted with traditional methods for over a decade. Trusted by families across India.</p>
            <div className="footer-social">
              <a href="https://wa.me/916381743091" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
              <a href="mailto:nk.dairyproducts@gmail.com"><i className="fas fa-envelope"></i></a>
              <a href="tel:+916381743091"><i className="fas fa-phone"></i></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Products</h4>
            <ul>
              <li><Link to="/products">Ghee 50ml</Link></li>
              <li><Link to="/products">Ghee 100ml</Link></li>
              <li><Link to="/products">Ghee 200ml</Link></li>
              <li><Link to="/products">Ghee 500ml</Link></li>
              <li><Link to="/products">Ghee 1L &amp; 2L</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><i className="fas fa-map-marker-alt"></i> JJ Nagar, Sivagangai East Ring Road, Pandikovil, Madurai, Tamil Nadu</p>
            <p><i className="fas fa-phone"></i> <a href="tel:+916381743091">+91 63817 43091</a></p>
            <p><i className="fas fa-phone"></i> <a href="tel:+917092244067">+91 70922 44067</a></p>
            <p><i className="fas fa-envelope"></i> <a href="mailto:nk.dairyproducts@gmail.com">nk.dairyproducts@gmail.com</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 NK Dairy Products. All rights reserved. | FSSAI Lic. No: 12423012002470</p>
        </div>
      </div>
    </footer>
  );
}
