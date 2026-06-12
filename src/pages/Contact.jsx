import React from 'react';

export default function Contact() {
  return (
    <section className="contact-page" style={{ padding: '40px 0' }}>
      <div className="container">
        <h1>Contact Us</h1>
        <p className="section-subtitle">We'd love to hear from you. Get in touch with us!</p>
        
        <div className="contact-info-centered">
          <div className="contact-box-item">
            <i className="fas fa-phone-alt"></i>
            <div className="contact-details">
              <h3>Phone Numbers</h3>
              <p><a href="tel:+916381743091">+91 6381743091</a></p>
              <p><a href="tel:+917092244067">+91 7092244067</a></p>
            </div>
          </div>

          <div className="contact-box-item">
            <i className="fas fa-map-marker-alt"></i>
            <div className="contact-details">
              <h3>Address</h3>
              <p>JJ Nagar, Sivagangai East Ring Road,</p>
              <p>Pandikovil, Madurai,</p>
              <p>Tamil Nadu, India</p>
            </div>
          </div>

          <div className="contact-box-item">
            <i className="fas fa-envelope"></i>
            <div className="contact-details">
              <h3>Email</h3>
              <p><a href="mailto:nk.dairyproducts@gmail.com">nk.dairyproducts@gmail.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
