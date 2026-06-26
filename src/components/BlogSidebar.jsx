import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecentPosts from './RecentPosts';

export default function BlogSidebar({
  searchQuery = '',
  setSearchQuery,
  selectedCategory = '',
  setSelectedCategory,
  selectedTag = '',
  setSelectedTag,
  allBlogs = []
}) {
  const navigate = useNavigate();

  // Aggregate category counts
  const categoriesMap = allBlogs.reduce((acc, blog) => {
    const cat = blog.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Extract all unique tags
  const tagsSet = new Set();
  allBlogs.forEach(blog => {
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  const tags = Array.from(tagsSet);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (setSearchQuery) {
      setSearchQuery(value);
    } else {
      navigate(`/blog?search=${encodeURIComponent(value)}`);
    }
  };

  const handleCategoryClick = (category) => {
    const targetCat = selectedCategory === category ? '' : category;
    if (setSelectedCategory) {
      setSelectedCategory(targetCat);
    } else {
      navigate(`/blog?category=${encodeURIComponent(targetCat)}`);
    }
  };

  const handleTagClick = (tag) => {
    const targetTag = selectedTag === tag ? '' : tag;
    if (setSelectedTag) {
      setSelectedTag(targetTag);
    } else {
      navigate(`/blog?tag=${encodeURIComponent(targetTag)}`);
    }
  };

  return (
    <aside className="blog-sidebar">
      {/* Search Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Search Articles</h3>
        <div className="search-box-container">
          <i className="fas fa-search" style={{ color: '#aaa' }}></i>
          <input
            type="text"
            placeholder="Type keywords..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Categories Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Categories</h3>
        <ul className="category-list">
          <li
            className={`category-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <span>All Categories</span>
            <span className="category-count">{allBlogs.length}</span>
          </li>
          {Object.entries(categoriesMap).map(([category, count]) => (
            <li
              key={category}
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <span>{category}</span>
              <span className="category-count">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts Widget */}
      <div className="sidebar-widget">
        <h3 className="widget-title">Recent Posts</h3>
        <RecentPosts />
      </div>

      {/* Tag Cloud Widget */}
      {tags.length > 0 && (
        <div className="sidebar-widget">
          <h3 className="widget-title">Popular Tags</h3>
          <div className="tag-cloud">
            {tags.map(tag => (
              <span
                key={tag}
                className={`tag-item ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
