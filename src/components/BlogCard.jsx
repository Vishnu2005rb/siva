import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogCard({ blog }) {
  if (!blog) return null;
  const { title, description, date, readTime, image, slug } = blog;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link to={`/blog/${slug}`} className="blog-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="blog-card-image">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <span><i className="far fa-calendar-alt"></i> {formattedDate}</span>
          <span><i className="far fa-clock"></i> {readTime}</span>
        </div>
        <h3 className="blog-card-title">{title}</h3>
        <p className="blog-card-desc">{description}</p>
        <span className="blog-card-link">
          Read More <i className="fas fa-arrow-right"></i>
        </span>
      </div>
    </Link>
  );
}
