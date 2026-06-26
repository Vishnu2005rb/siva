import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../productsData';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO/SEO';
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from '../components/SEO/JsonLd';

export default function Home() {
  const navigate = useNavigate();
  const [heroImageError, setHeroImageError] = useState(false);
  const featuredProducts = products.slice(0, 4);

  const faqs = [
    {
      question: "What is the Bilona ghee method?",
      answer: "The Bilona method is a traditional Indian way of making ghee. Fresh cow milk is boiled and set to curd. The curd is then churned using a wooden churner (Bilona) to obtain butter (makkhan). This butter is then slowly heated to produce aromatic, nutrient-rich, and pure cow ghee."
    },
    {
      question: "Is NK Dairy cow ghee 100% pure and natural?",
      answer: "Yes, NK Dairy cow ghee is 100% pure, natural, and FSSAI certified. We do not use any preservatives, colors, or chemical additives in our ghee-making process."
    },
    {
      question: "Does NK Dairy ship products across India?",
      answer: "Yes, we offer fast doorstep delivery across all states in India. Shipping is free on all orders above ₹500."
    },
    {
      question: "How should I store NK Dairy cow ghee?",
      answer: "NK Dairy cow ghee has a long shelf life. Keep it stored in a cool, dry place away from direct sunlight. There is no need to refrigerate the ghee; it stays fresh at room temperature."
    }
  ];

  return (
    <div>
      <SEO
        title="NK Dairy Products | Buy Premium Pure Cow Ghee Online"
        description="Buy 100% Pure Cow Ghee directly from NK Dairy Products. Premium quality traditional ghee made with natural ingredients. Home delivery across India."
      />
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs} />
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-award"></i> FSSAI Certified • 100% Natural
            </div>
            <h1>
              Pure &amp; Natural<br />
              <span className="hero-highlight">Cow Ghee</span>
            </h1>
            <p>
              Experience the authentic taste of traditionally crafted ghee from NK Dairy Products — rich in nutrients,
              free from preservatives, made with love from Madurai.
            </p>
            <div className="hero-btns">
              <button onClick={() => navigate('/products')} className="btn-primary">
                <i className="fas fa-shopping-bag"></i> Shop Now
              </button>
              <button onClick={() => navigate('/about')} className="btn-outline">
                <i className="fas fa-play-circle"></i> Our Story
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-num">10+</span>
                <span className="stat-label">Years of Trust</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-num">5000+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="stat-num">100%</span>
                <span className="stat-label">Pure Ghee</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-img-wrapper">
              {!heroImageError ? (
                <img
                  src="/images/ghee_500ml.png"
                  alt="NK Dairy Pure Cow Ghee"
                  className="hero-product-img"
                  onError={() => setHeroImageError(true)}
                />
              ) : (
                <div className="pd-img-fallback" style={{ display: 'flex', width: '100%', height: '300px', borderRadius: '15px' }}>
                  <i className="fas fa-jar" style={{ fontSize: '100px' }}></i>
                </div>
              )}
              <div className="hero-img-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="trust-banner">
        <div className="container">
          <div className="trust-item"><i className="fas fa-leaf"></i><span>No Preservatives</span></div>
          <div className="trust-item"><i className="fas fa-certificate"></i><span>Lab Certified</span></div>
          <div className="trust-item"><i className="fas fa-truck"></i><span>Pan India Delivery</span></div>
          <div className="trust-item"><i className="fas fa-undo"></i><span>Easy Returns</span></div>
          <div className="trust-item"><i className="fas fa-shield-alt"></i><span>Secure Payment</span></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="feature-card">
            <div className="feature-icon-wrap"><i className="fas fa-leaf"></i></div>
            <h3>100% Pure</h3>
            <p>Made from fresh cow milk using traditional Bilona method</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap"><i className="fas fa-certificate"></i></div>
            <h3>Certified Quality</h3>
            <p>FSSAI lab tested, certified and approved for safety</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap"><i className="fas fa-truck"></i></div>
            <h3>Home Delivery</h3>
            <p>Fast delivery across India right to your doorstep</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrap"><i className="fas fa-shield-alt"></i></div>
            <h3>Secure Payment</h3>
            <p>100% safe transactions with multiple payment options</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Our Premium Ghee Products</h2>
            <p className="section-subtitle">From small packs to bulk orders — pure ghee for every need</p>
          </div>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <button onClick={() => navigate('/products')} className="btn-secondary">
              <i className="fas fa-th-large"></i> View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p className="section-subtitle">Trusted by thousands of families across India</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "The best ghee I've ever tasted! The aroma is amazing and it reminds me of homemade ghee from my
                grandmother's kitchen. Highly recommended!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div><strong>Priya S.</strong><span>Chennai</span></div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "We order 2L every month for our family. The quality is consistent and delivery is always on time. Pure,
                authentic ghee at a great price!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div><strong>Rajesh K.</strong><span>Madurai</span></div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
              <p>
                "Ordered the 500ml jar — absolutely love it. You can really taste the difference from store-bought ghee.
                Will be a regular customer!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div><strong>Ananya M.</strong><span>Coimbatore</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" style={{ padding: '60px 0', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>Frequently Asked Questions</h2>
            <p className="section-subtitle">Got questions? We have answers about our premium cow ghee</p>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '0 0 10px 0' }}>
                  <i className="fas fa-question-circle" style={{ color: '#ff9800', marginTop: '3px' }}></i>
                  <span>{faq.question}</span>
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6', fontSize: '0.95rem', margin: 0, paddingLeft: '28px' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
