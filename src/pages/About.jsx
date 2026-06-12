import React from 'react';

export default function About() {
  return (
    <section className="about-page" style={{ padding: '40px 0' }}>
      <div className="container">
        <h1>About NK Dairy Products</h1>

        <div className="about-content">
          <div className="about-intro">
            <h2>Our Story</h2>
            <p>
              NK Dairy Products has been producing premium quality ghee for over a decade with a commitment to
              excellence and purity. What started as a small family business has grown into a trusted name in
              quality ghee production.
            </p>
          </div>

          <div className="about-mission">
            <h2>Our Mission</h2>
            <p>
              Our mission is to deliver pure, authentic, and healthy ghee to every household. We believe in
              quality over quantity and maintain the highest standards in our production process. Each batch
              of our ghee is carefully crafted using traditional methods combined with modern hygiene
              standards.
            </p>
          </div>

          <div className="about-quality">
            <h2>Quality Commitment</h2>
            <p>
              We source our milk from trusted farms and use time-honored techniques to produce ghee that's rich
              in taste and nutrition. Every product undergoes rigorous quality checks to ensure you receive
              only the best.
            </p>
          </div>

          <div className="about-features">
            <h2>Why Choose NK Dairy Products?</h2>
            <ul className="features-list">
              <li><i className="fas fa-check"></i> <strong>100% Pure Ghee</strong> - Made from fresh cow milk</li>
              <li><i className="fas fa-check"></i> <strong>Traditional Methods</strong> - Time-tested production techniques</li>
              <li><i className="fas fa-check"></i> <strong>Quality Assured</strong> - Lab tested and certified</li>
              <li><i className="fas fa-check"></i> <strong>Healthy &amp; Nutritious</strong> - Rich in vitamins and antioxidants</li>
              <li><i className="fas fa-check"></i> <strong>Fresh Delivery</strong> - Direct from our production facility</li>
              <li><i className="fas fa-check"></i> <strong>Customer Focused</strong> - Your satisfaction is our priority</li>
            </ul>
          </div>

          <div className="about-values">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-item">
                <i className="fas fa-heart"></i>
                <h3>Purity</h3>
                <p>We maintain absolute purity in every product</p>
              </div>
              <div className="value-item">
                <i className="fas fa-shield-alt"></i>
                <h3>Trust</h3>
                <p>Your trust is our most valuable asset</p>
              </div>
              <div className="value-item">
                <i className="fas fa-leaf"></i>
                <h3>Quality</h3>
                <p>Excellence in every batch</p>
              </div>
              <div className="value-item">
                <i className="fas fa-handshake"></i>
                <h3>Service</h3>
                <p>Customer satisfaction is our goal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
