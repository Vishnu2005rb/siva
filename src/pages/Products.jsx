import React, { useState, useMemo, useEffect } from 'react';
import { products } from '../productsData';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';

export default function Products() {
  const [sizeFilter, setSizeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res && res.success && res.products && res.products.length > 0) {
          const mapped = res.products.map(p => ({
            ...p,
            id: p._id || p.id
          }));
          setProductsList(mapped);
        } else {
          setProductsList(products);
        }
      } catch (error) {
        console.error('Failed to fetch products from backend, using static fallback:', error);
        setProductsList(products);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by Size
    if (sizeFilter !== 'all') {
      result = result.filter(product => product.size.toLowerCase() === sizeFilter.toLowerCase());
    }

    // Sort
    switch (sortFilter) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default sort (original order)
        break;
    }

    return result;
  }, [sizeFilter, sortFilter, searchQuery, productsList]);

  return (
    <section className="products-page">
      <div className="container">
        <div className="section-header">
          <h1>Our Premium Products</h1>
          <p className="section-subtitle">Choose from our selection of 100% pure cow ghee</p>
        </div>

        {/* Filters and Controls */}
        <div
          className="products-filter-controls"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '30px',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}
        >
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', padding: '10px 15px', borderRadius: '5px', width: '300px', maxWidth: '100%' }}>
            <i className="fas fa-search" style={{ color: '#aaa', marginRight: '10px' }}></i>
            <input
              type="text"
              placeholder="Search ghee products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sizeFilter" style={{ fontWeight: '500' }}>Size:</label>
              <select
                id="sizeFilter"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Sizes</option>
                <option value="50ml">50 ml</option>
                <option value="100ml">100 ml</option>
                <option value="200ml">200 ml</option>
                <option value="500ml">500 ml</option>
                <option value="1l">1 L</option>
                <option value="2l">2 L</option>
                <option value="5l">5 L</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sortFilter" style={{ fontWeight: '500' }}>Sort By:</label>
              <select
                id="sortFilter"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  outline: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid" id="productsGrid">
          {filteredAndSortedProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <i className="fas fa-search" style={{ fontSize: '60px', color: '#e0e0e0', marginBottom: '20px' }}></i>
              <h3>No products found</h3>
              <p style={{ color: '#666' }}>Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
