import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../productsData';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, handleBuyNow } = useCart();
  const { user } = useAuth();
  
  const [detailQty, setDetailQty] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product from backend when ID changes
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res && res.success && res.product) {
          const mapped = {
            ...res.product,
            id: res.product._id
          };
          setProduct(mapped);
        } else {
          // fallback to static
          const staticProd = products.find(p => p.id.toString() === id.toString());
          setProduct(staticProd);
        }
      } catch (error) {
        console.error('Failed to fetch product details, using static fallback:', error);
        const staticProd = products.find(p => p.id.toString() === id.toString());
        setProduct(staticProd);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setDetailQty(1);
    setImageError(false);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff9800', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <h3>Loading Product Details...</h3>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p style={{ margin: '15px 0' }}>The product you are looking for does not exist.</p>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Back to Products
        </Link>
      </div>
    );
  }

  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    if (halfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    return stars;
  };

  const handleQtyChange = (delta) => {
    setDetailQty(prev => Math.max(1, prev + delta));
  };

  // Get related products (excluding current, limited to 4)
  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const features = [
    { icon: 'fa-leaf', label: '100% Pure Cow Ghee' },
    { icon: 'fa-certificate', label: 'Lab Certified Quality' },
    { icon: 'fa-shield-alt', label: 'No Preservatives' },
    { icon: 'fa-truck', label: 'Fast Home Delivery' },
  ];

  return (
    <div className="product-detail-page" style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <div className="pd-breadcrumbs" style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#666' }}>
          <Link to="/" style={{ color: '#ff9800', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/products" style={{ color: '#ff9800', textDecoration: 'none' }}>Products</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span id="breadcrumbName" style={{ fontWeight: '500' }}>{product.name}</span>
        </div>

        {/* Product Detail Layout */}
        <div className="pd-layout" id="productDetailLayout">
          <div className="pd-image-panel">
            <div className="pd-image-main">
              {!imageError ? (
                <img
                  src={product.image?.startsWith('http') ? product.image : `/${product.image}`}
                  alt={product.name}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div id="imgFallback" className="pd-img-fallback" style={{ display: 'flex' }}>
                  <i className="fas fa-jar"></i>
                </div>
              )}
            </div>
            <div className="pd-image-badge">
              <i className="fas fa-award"></i> Premium Quality
            </div>
          </div>

          <div className="pd-info-panel">
            <div className="pd-category">NK Dairy Products · Pure Ghee</div>
            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-rating-row">
              <span className="stars pd-stars">{generateStars(product.rating)}</span>
              <span className="pd-rating-num">{product.rating} / 5</span>
              <span className="pd-reviews">(128 reviews)</span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price">₹{product.price}</span>
              <span className="pd-size-badge">{product.size.toUpperCase()}</span>
            </div>

            <p className="pd-desc">
              Indulge in the rich, golden taste of our traditionally crafted cow ghee. Made from fresh, pure cow milk,
              every jar of <strong>{product.name}</strong> delivers authentic Bilona-method ghee — nutrient-rich,
              aromatic, and naturally preservative-free.
            </p>

            <div className="pd-features">
              {features.map((f, i) => (
                <div key={i} className="pd-feature-tag">
                  <i className="fas f-icon">{<i className={`fas ${f.icon}`} />}</i>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className="pd-quantity-row">
              <label style={{ fontWeight: '600' }}>Quantity:</label>
              <div className="pd-qty-controls">
                <button id="qtyMinus" onClick={() => handleQtyChange(-1)}>
                  <i className="fas fa-minus"></i>
                </button>
                <span id="qtyValue">{detailQty}</span>
                <button id="qtyPlus" onClick={() => handleQtyChange(1)}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="pd-actions">
              <button className="pd-btn-cart" onClick={() => addToCart(product, detailQty)}>
                <i className="fas fa-cart-plus"></i> Add to Cart
              </button>
              <button
                className="pd-btn-buy"
                onClick={() => handleBuyNow(product, detailQty, user, navigate)}
              >
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>

            <div className="pd-meta">
              <div className="pd-meta-item"><i className="fas fa-undo"></i> Easy 7-day returns</div>
              <div className="pd-meta-item"><i className="fas fa-lock"></i> Secure checkout</div>
              <div className="pd-meta-item"><i className="fas fa-truck"></i> Free delivery on orders above ₹500</div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="related-products-section" style={{ marginTop: '60px' }}>
          <div className="section-header" style={{ marginBottom: '30px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Related Products</h2>
            <p className="section-subtitle" style={{ marginLeft: 0 }}>You might also be interested in these sizes</p>
          </div>
          <div className="products-grid" id="relatedProducts">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
