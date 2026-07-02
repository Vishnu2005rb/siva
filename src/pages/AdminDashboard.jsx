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
  
  // Tabs and orders state
  const [activeTab, setActiveTab] = useState('products');
  const [ordersList, setOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [statusUpdating, setStatusUpdating] = useState(null);
  
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
      if (activeTab === 'products') {
        loadProducts();
      } else if (activeTab === 'orders') {
        loadOrders();
      }
    }
  }, [user, navigate, activeTab]);

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

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders');
      if (res && res.success && res.orders) {
        setOrdersList(res.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res && res.success) {
        showToast('Order status updated successfully!', 'success');
        setOrdersList(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: newStatus, deliveryDate: newStatus === 'delivered' ? new Date() : order.deliveryDate } 
            : order
        ));
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showToast(error.message || 'Error updating order status', 'error');
    } finally {
      setStatusUpdating(null);
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
            <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0' }}>
              {activeTab === 'products' ? 'Manage product listings, pricing, and stock metrics' : 'Monitor sales, payment statuses, and fulfill shipments'}
            </p>
          </div>
          {activeTab === 'products' && !isEditing && !isAdding && (
            <button className="btn-primary" onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-plus"></i> Add New Product
            </button>
          )}
        </div>

        {/* Tab Selection Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '30px',
          gap: '20px'
        }}>
          <button
            onClick={() => { setActiveTab('products'); setIsEditing(false); setIsAdding(false); }}
            style={{
              padding: '12px 20px',
              fontSize: '1.05rem',
              fontWeight: '600',
              color: activeTab === 'products' ? 'var(--primary-color)' : 'var(--text-light)',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'products' ? '3px solid var(--primary-color)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <i className="fas fa-jar" style={{ marginRight: '8px' }}></i> Products Management
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setIsEditing(false); setIsAdding(false); }}
            style={{
              padding: '12px 20px',
              fontSize: '1.05rem',
              fontWeight: '600',
              color: activeTab === 'orders' ? 'var(--primary-color)' : 'var(--text-light)',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid var(--primary-color)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            <i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i> Orders Management
          </button>
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
        {activeTab === 'products' && (
          <>
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
          </>
        )}

        {/* Orders Management View */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders Filter Bar */}
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 25px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Customer Orders</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '500' }}>Filter:</span>
                <select
                  value={ordersFilter}
                  onChange={(e) => setOrdersFilter(e.target.value)}
                  style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', fontWeight: '500', minWidth: '150px' }}
                >
                  <option value="all">All Orders</option>
                  <option value="completed_payment">Paid Payments</option>
                  <option value="pending_payment">Pending Payments</option>
                  <option value="razorpay">Razorpay Online</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="pending_status">Pending Status</option>
                  <option value="confirmed_status">Confirmed Status</option>
                  <option value="processing_status">Processing Status</option>
                  <option value="shipped_status">Shipped Status</option>
                  <option value="delivered_status">Delivered Status</option>
                  <option value="cancelled_status">Cancelled Status</option>
                </select>
              </div>
            </div>

            {ordersLoading ? (
              <div style={{ padding: '50px 0', textAlign: 'center' }}>
                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #ff9800', borderRadius: '50%', width: '35px', height: '35px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                <p style={{ color: 'var(--text-light)' }}>Fetching order records...</p>
              </div>
            ) : (
              (() => {
                const filteredOrders = ordersList.filter(order => {
                  if (ordersFilter === 'all') return true;
                  if (ordersFilter === 'completed_payment') return order.paymentStatus === 'completed';
                  if (ordersFilter === 'pending_payment') return order.paymentStatus === 'pending';
                  if (ordersFilter === 'razorpay') return order.paymentMethod === 'razorpay' || order.paymentMethod === 'RAZORPAY';
                  if (ordersFilter === 'cod') return order.paymentMethod === 'cod' || order.paymentMethod === 'COD';
                  if (ordersFilter === 'pending_status') return order.orderStatus === 'pending';
                  if (ordersFilter === 'confirmed_status') return order.orderStatus === 'confirmed';
                  if (ordersFilter === 'processing_status') return order.orderStatus === 'processing';
                  if (ordersFilter === 'shipped_status') return order.orderStatus === 'shipped';
                  if (ordersFilter === 'delivered_status') return order.orderStatus === 'delivered';
                  if (ordersFilter === 'cancelled_status') return order.orderStatus === 'cancelled';
                  return true;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-light)' }}>
                      <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '15px' }}></i>
                      <h3>No Orders Found</h3>
                      <p>There are no orders matching the selected filter criteria.</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Desktop Orders View */}
                    <div className="admin-table-container">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                            <th style={{ padding: '15px 10px', width: '110px' }}>Order ID</th>
                            <th style={{ padding: '15px 10px', width: '180px' }}>Customer</th>
                            <th style={{ padding: '15px 10px' }}>Products Ordered</th>
                            <th style={{ padding: '15px 10px', width: '100px' }}>Amount</th>
                            <th style={{ padding: '15px 10px', width: '140px' }}>Payment Info</th>
                            <th style={{ padding: '15px 10px', width: '160px' }}>Fulfillment Status</th>
                            <th style={{ padding: '15px 10px', width: '120px' }}>Order Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #f0f0f0', verticalAlign: 'top', transition: 'background 0.2s' }}>
                              {/* Order ID */}
                              <td style={{ padding: '15px 10px' }}>
                                <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>{order.orderId}</strong>
                              </td>
                              
                              {/* Customer Details */}
                              <td style={{ padding: '15px 10px' }}>
                                <div style={{ fontWeight: '600', color: '#333' }}>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>
                                  <i className="fas fa-envelope" style={{ width: '15px', color: '#aaa' }}></i> {order.shippingAddress.email}<br/>
                                  <i className="fas fa-phone" style={{ width: '15px', color: '#aaa', marginTop: '3px' }}></i> {order.shippingAddress.phone}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '6px', lineHeight: '1.4', background: '#fafafa', padding: '6px 8px', borderRadius: '4px', border: '1px solid #eee' }}>
                                  <strong>Address:</strong><br/>
                                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </div>
                              </td>

                              {/* Products List */}
                              <td style={{ padding: '15px 10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: idx < order.items.length - 1 ? '8px' : '0', borderBottom: idx < order.items.length - 1 ? '1px dashed #f0f0f0' : 'none' }}>
                                      <div style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #eee', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                                        {item.product && item.product.image ? (
                                          <img src={item.product.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                          <i className="fas fa-jar" style={{ color: '#ccc' }}></i>
                                        )}
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                                          Size: <span style={{ color: '#444', fontWeight: '500' }}>{item.size || 'N/A'}</span> | 
                                          Qty: <strong style={{ color: '#111' }}>{item.quantity}</strong>
                                        </div>
                                      </div>
                                      <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#555' }}>
                                        ₹{item.price * item.quantity}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              {/* Amount */}
                              <td style={{ padding: '15px 10px' }}>
                                <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '1.05rem' }}>₹{order.totalAmount}</div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                  (Subtotal: ₹{order.subtotal || order.totalAmount})
                                </span>
                              </td>

                              {/* Payment Info */}
                              <td style={{ padding: '15px 10px' }}>
                                <span className={`payment-method-badge ${order.paymentMethod ? order.paymentMethod.toLowerCase() : ''}`} style={{
                                  display: 'inline-block',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  background: '#e1f5fe',
                                  color: '#0288d1',
                                  textTransform: 'uppercase'
                                }}>
                                  {order.paymentMethod}
                                </span>
                                <div style={{ marginTop: '8px' }}>
                                  <span style={{
                                    background: order.paymentStatus === 'completed' ? '#e8f5e9' : order.paymentStatus === 'failed' ? '#ffebee' : '#fff3e0',
                                    color: order.paymentStatus === 'completed' ? '#2e7d32' : order.paymentStatus === 'failed' ? '#c62828' : '#e65100',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                                    {order.paymentStatus}
                                  </span>
                                </div>
                                {order.paymentDetails && order.paymentDetails.transactionId && (
                                  <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '6px', fontFamily: 'monospace' }}>
                                    TXID: {order.paymentDetails.transactionId}
                                  </div>
                                )}
                              </td>

                              {/* Fulfillment Dropdown */}
                              <td style={{ padding: '15px 10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                  <select
                                    value={order.orderStatus}
                                    disabled={statusUpdating === order._id}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-color)',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      background: 
                                        order.orderStatus === 'delivered' ? '#e8f5e9' :
                                        order.orderStatus === 'cancelled' ? '#ffebee' :
                                        order.orderStatus === 'shipped' ? '#e0f2f1' : '#fffde7',
                                      color: 
                                        order.orderStatus === 'delivered' ? '#2e7d32' :
                                        order.orderStatus === 'cancelled' ? '#c62828' :
                                        order.orderStatus === 'shipped' ? '#00695c' : '#f57f17'
                                    }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                  {statusUpdating === order._id && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                      <i className="fas fa-spinner fa-spin"></i> Updating...
                                    </span>
                                  )}
                                  {order.orderStatus === 'delivered' && order.deliveryDate && (
                                    <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontStyle: 'italic' }}>
                                      Delivered on:<br/>
                                      {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Order Date */}
                              <td style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#555' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                                  {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Orders View */}
                    <div className="admin-mobile-list">
                      {filteredOrders.map(order => (
                        <div key={order._id} className="admin-mobile-card" style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '12px', background: 'white', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</span>
                              <h4 style={{ margin: '2px 0 0 0', color: 'var(--text-dark)', fontSize: '1.05rem', fontWeight: '700' }}>{order.orderId}</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontWeight: '600', color: '#222', fontSize: '0.95rem' }}>
                              Customer: {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                              <i className="fas fa-phone" style={{ marginRight: '6px', color: '#888' }}></i>{order.shippingAddress.phone} | <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#888' }}></i>{order.shippingAddress.email}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '6px', background: '#fafafa', padding: '8px', borderRadius: '6px', border: '1px solid #eee', lineHeight: '1.4' }}>
                              <strong>Ship to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </div>
                          </div>

                          <div style={{ marginBottom: '15px', borderBottom: '1px solid #f5f5f5', paddingBottom: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>Items Details:</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ fontSize: '0.88rem' }}>
                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginLeft: '6px' }}>({item.size})</span>
                                    <span style={{ fontSize: '0.8rem', color: '#555', marginLeft: '8px' }}>x{item.quantity}</span>
                                  </div>
                                  <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#333' }}>
                                    ₹{item.price * item.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total Paid Amount:</span>
                              <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '1.15rem', marginTop: '2px' }}>₹{order.totalAmount}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className={`payment-method-badge ${order.paymentMethod ? order.paymentMethod.toLowerCase() : ''}`} style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                background: '#e1f5fe',
                                color: '#0288d1',
                                textTransform: 'uppercase'
                              }}>
                                {order.paymentMethod}
                              </span>
                              <div style={{ marginTop: '6px' }}>
                                <span style={{
                                  background: order.paymentStatus === 'completed' ? '#e8f5e9' : '#fff3e0',
                                  color: order.paymentStatus === 'completed' ? '#2e7d32' : '#e65100',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600'
                                }}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '5px', fontWeight: '500' }}>Update Fulfillment Status:</label>
                            <select
                              value={order.orderStatus}
                              disabled={statusUpdating === order._id}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: 
                                  order.orderStatus === 'delivered' ? '#e8f5e9' :
                                  order.orderStatus === 'cancelled' ? '#ffebee' :
                                  order.orderStatus === 'shipped' ? '#e0f2f1' : '#fffde7',
                                color: 
                                  order.orderStatus === 'delivered' ? '#2e7d32' :
                                  order.orderStatus === 'cancelled' ? '#c62828' :
                                  order.orderStatus === 'shipped' ? '#00695c' : '#f57f17'
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
