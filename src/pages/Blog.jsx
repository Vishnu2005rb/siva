import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllBlogs } from '../utils/markdown';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import SEO from '../components/SEO/SEO';
import { BreadcrumbSchema } from '../components/SEO/JsonLd';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const allBlogs = useMemo(() => getAllBlogs(), []);

  // State bound to URL search params for seamless SEO crawling & sharing
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';

  const setSearchQuery = (val) => {
    updateParams('search', val);
  };

  const setSelectedCategory = (val) => {
    updateParams('category', val);
  };

  const setSelectedTag = (val) => {
    updateParams('tag', val);
  };

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Filter blog catalog
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter(blog => {
      const matchesSearch = !searchQuery || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = !selectedCategory || 
        blog.category.toLowerCase() === selectedCategory.toLowerCase();
        
      const matchesTag = !selectedTag || 
        blog.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [allBlogs, searchQuery, selectedCategory, selectedTag]);

  return (
    <div className="blog-page" style={{ padding: '40px 0' }}>
      <SEO
        title="NK Dairy Products Blog | Pure Cow Ghee Insights & Recipes"
        description="Explore the official NK Dairy Products blog. Learn about pure cow ghee health benefits, traditional ghee preparation, and delicious Indian ghee recipes."
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' }
        ]}
      />
      
      <div className="container">
        {/* Page Title */}
        <div className="section-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', margin: '0 0 10px 0' }}>Our Insights & Stories</h1>
          <p className="section-subtitle">Learn about healthy living, Bilona ghee, and traditional dairy recipes</p>
        </div>

        {/* Layout Grid */}
        <div className="blog-layout">
          {/* Main Feed Column */}
          <div className="blog-feed-column">
            {/* Filter Reset Alert */}
            {(selectedCategory || selectedTag || searchQuery) && (
              <div style={{ background: '#fff3e0', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                <div>
                  Showing posts in:{' '}
                  {selectedCategory && <span style={{ marginRight: '10px' }}>Category: <strong>{selectedCategory}</strong></span>}
                  {selectedTag && <span style={{ marginRight: '10px' }}>Tag: <strong>#{selectedTag}</strong></span>}
                  {searchQuery && <span>Search: <strong>"{searchQuery}"</strong></span>}
                </div>
                <button
                  onClick={() => setSearchParams({})}
                  style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  Clear Filters <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {filteredBlogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <i className="far fa-folder-open" style={{ fontSize: '60px', color: '#ccc', marginBottom: '20px' }}></i>
                <h3 style={{ fontSize: '1.4rem', color: '#333' }}>No articles found</h3>
                <p style={{ color: '#666', marginTop: '10px' }}>Try resetting your search query or categories.</p>
                <button onClick={() => setSearchParams({})} className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                  View All Articles
                </button>
              </div>
            ) : (
              <div className="blog-grid">
                {filteredBlogs.map(blog => (
                  <BlogCard key={blog.slug} blog={blog} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="blog-sidebar-column">
            <BlogSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              allBlogs={allBlogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
