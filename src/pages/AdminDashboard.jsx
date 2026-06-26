import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import SEO from '../components/SEO/SEO';

export default function AdminDashboard() {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    size: '50ml',
    category: 'Premium Cow Ghee',
    stock: '100',
    rating: '4.5',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Restrict access to administrators only
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      loadProducts();
    }
  }, [user, navigate]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      if (res && res.success && res.products) {
        setProductsList(res.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      size: product.size || '50ml',
      category: product.category || 'Premium Cow Ghee',
      stock: product.stock !== undefined ? product.stock.toString() : '100',
      rating: product.rating !== undefined ? product.rating.toString() : '4.5',
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setSelectedFile(null);
    setIsEditing(true);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      size: '50ml',
      category: 'Premium Cow Ghee',
      stock: '100',
      rating: '4.5',
      isActive: true
    });
    setSelectedFile(null);
    setIsAdding(true);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('size', formData.size);
      payload.append('category', formData.category);
      payload.append('stock', formData.stock);
      payload.append('rating', formData.rating);
      payload.append('isActive', formData.isActive.toString());
      
      if (selectedFile) {
        payload.append('image', selectedFile);
      }

      let res;
      // Fetch dynamic API base URL to build full endpoint URL since standard api helper works with json payloads
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const baseUrl = isLocal ? 'http://localhost:3000/api' : 'https://nk-dairy-backend.onrender.com/api';
      const token = localStorage.getItem('authToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (isEditing) {
        // Update product via PUT /api/products/:id
        const response = await fetch(`${baseUrl}/products/${currentProduct._id}`, {
          method: 'PUT',
          headers,
          body: payload
        });
        res = await response.json();
      } else {
        // Create product via POST /api/products
        const response = await fetch(`${baseUrl}/products`, {
          method: 'POST',
          headers,
          body: payload
        });
        res = await response.json();
      }

      if (res && res.success) {
        showToast(isEditing ? 'Product updated successfully!' : 'Product created successfully!', 'success');
        setIsEditing(false);
        setIsAdding(false);
        loadProducts();
      } else {
        showToast(res.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast(error.message || 'Network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff9800', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <h3>Loading Admin Control Panel...</h3>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page" style={{ padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
      <SEO
        title="Admin Control Panel | NK Dairy Products"
        description="Administrative settings for NK Dairy Products ghee shop management."
        robots="noindex, nofollow"
      />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0' }}>Manage product listings, pricing, and stock metrics</p>
          </div>
          {!isEditing && !isAdding && (
            <button className="btn-primary" onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-plus"></i> Add New Product
            </button>
          )}
        </div>

        {/* Create/Edit Form Container */}
        {(isEditing || isAdding) && (
          <div className="admin-card">
            <h2 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>
              {isEditing ? `Edit Product: ${currentProduct.name}` : 'Add New Ghee Product'}
            </h2>
            <form onSubmit={handleFormSubmit} className="checkout-form" style={{ background: 'none', padding: 0, boxShadow: 'none' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" style={{ fontWeight: '600' }}>Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price" style={{ fontWeight: '600' }}>Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="description" style={{ fontWeight: '600' }}>Description</label>
                <textarea
                  id="description"
                  name="description"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px' }}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label htmlFor="size" style={{ fontWeight: '600' }}>Size Pack</label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="50ml">50mlPack</option>
                    <option value="100ml">100ml Pack</option>
                    <option value="200ml">200ml Pack</option>
                    <option value="500ml">500ml Pack</option>
                    <option value="1l">1 Liter Pack</option>
                    <option value="2l">2 Liters Pack</option>
                    <option value="5l">5 Liters Pack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="stock" style={{ fontWeight: '600' }}>Stock Count</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rating" style={{ fontWeight: '600' }}>Initial Rating (1-5)</label>
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    required
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '25px' }}>
                <div className="form-group">
                  <label htmlFor="image" style={{ fontWeight: '600' }}>Product Image File (Cloudinary upload)</label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ border: 'none', padding: '5px 0' }}
                  />
                </div>
                <div className="form-group admin-checkbox-group">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActive" style={{ margin: 0, fontWeight: '600', cursor: 'pointer' }}>Active Listing (Visible to Users)</label>
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                  }}
                  style={{ flex: '1', padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                  style={{ flex: '2', padding: '12px', background: 'var(--primary-color)' }}
                >
                  {saving ? (
                    <span><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Saving...</span>
                  ) : (
                    <span><i className="fas fa-save" style={{ marginRight: '8px' }}></i>{isEditing ? 'Update Product' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Desktop Products Table */}
        <div className="admin-table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                <th style={{ padding: '15px 10px' }}>Image</th>
                <th style={{ padding: '15px 10px' }}>Name</th>
                <th style={{ padding: '15px 10px' }}>Pack Size</th>
                <th style={{ padding: '15px 10px' }}>Price</th>
                <th style={{ padding: '15px 10px' }}>Stock</th>
                <th style={{ padding: '15px 10px' }}>Rating</th>
                <th style={{ padding: '15px 10px' }}>Status</th>
                <th style={{ padding: '15px 10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-light)' }}>
                    No products found. Add a product to get started.
                  </td>
                </tr>
              ) : (
                productsList.map(prod => (
                  <tr key={prod._id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '8px', overflow: 'hidden' }}>
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className="pd-img-fallback" style={{ display: prod.image ? 'none' : 'flex', width: '30px', height: '30px', fontSize: '20px' }}><i className="fas fa-jar"></i></div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '600' }}>{prod.name}</td>
                    <td style={{ padding: '12px 10px' }}><span className="pd-size-badge" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>{prod.size.toUpperCase()}</span></td>
                    <td style={{ padding: '12px 10px', color: 'var(--primary-color)', fontWeight: '700' }}>₹{prod.price}</td>
                    <td style={{ padding: '12px 10px' }}>{prod.stock}</td>
                    <td style={{ padding: '12px 10px' }}><i className="fas fa-star" style={{ color: '#ffa000', marginRight: '5px' }}></i>{prod.rating}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        background: prod.isActive ? '#e8f5e9' : '#ffebee',
                        color: prod.isActive ? '#2e7d32' : '#c62828',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {prod.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        className="btn-outline"
                        onClick={() => handleEditClick(prod)}
                        style={{ padding: '6px 15px', fontSize: '0.85rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                      >
                        <i className="fas fa-edit" style={{ marginRight: '5px' }}></i>Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Products List */}
        <div className="admin-mobile-list">
          {productsList.length === 0 ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>
              No products found. Add a product to get started.
            </div>
          ) : (
            productsList.map(prod => (
              <div key={prod._id} className="admin-mobile-card">
                <div className="admin-mobile-card-header">
                  <div className="admin-mobile-card-img">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="pd-img-fallback" style={{ display: prod.image ? 'none' : 'flex', width: '30px', height: '30px', fontSize: '18px' }}>
                      <i className="fas fa-jar"></i>
                    </div>
                  </div>
                  <div className="admin-mobile-card-info">
                    <h4>{prod.name}</h4>
                    <span className="pd-size-badge" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>{prod.size.toUpperCase()}</span>
                  </div>
                  <div className="admin-mobile-card-status">
                    <span style={{
                      background: prod.isActive ? '#e8f5e9' : '#ffebee',
                      color: prod.isActive ? '#2e7d32' : '#c62828',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="admin-mobile-card-details">
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-val price">₹{prod.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stock</span>
                    <span className="detail-val">{prod.stock}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rating</span>
                    <span className="detail-val">
                      <i className="fas fa-star" style={{ color: '#ffa000', marginRight: '3px', fontSize: '11px' }}></i>
                      {prod.rating}
                    </span>
                  </div>
                </div>
                <div className="admin-mobile-card-actions">
                  <button
                    className="btn-outline"
                    onClick={() => handleEditClick(prod)}
                    style={{ width: '100%', padding: '8px 15px', fontSize: '0.85rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}
                  >
                    <i className="fas fa-edit" style={{ marginRight: '5px' }}></i>Edit Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
