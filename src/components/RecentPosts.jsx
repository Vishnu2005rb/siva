import React from 'react';
import { Link } from 'react-router-dom';
import { getAllBlogs } from '../utils/markdown';

export default function RecentPosts() {
  const allBlogs = getAllBlogs();
  const recentBlogs = allBlogs.slice(0, 3);

  if (recentBlogs.length === 0) return null;

  return (
    <div className="recent-posts-list">
      {recentBlogs.map(blog => {
        const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return (
          <Link key={blog.slug} to={`/blog/${blog.slug}`} className="recent-post-item">
            <div className="recent-post-img">
              <img src={blog.image} alt={blog.title} loading="lazy" />
            </div>
            <div className="recent-post-info">
              <h4 className="recent-post-title">{blog.title}</h4>
              <span className="recent-post-date">{formattedDate}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
