import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBlogBySlug, getAllBlogs } from '../utils/markdown';
import BlogSidebar from '../components/BlogSidebar';
import BlogCard from '../components/BlogCard';
import SEO from '../components/SEO/SEO';
import { BreadcrumbSchema, ArticleSchema, FAQSchema } from '../components/SEO/JsonLd';

export default function BlogDetail() {
  const { slug } = useParams();
  const blog = useMemo(() => getBlogBySlug(slug), [slug]);
  const allBlogs = useMemo(() => getAllBlogs(), []);

  // Scroll to top on slug shift to ensure optimal user experience
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Compute related articles (sharing category or tags, excluding current)
  const relatedArticles = useMemo(() => {
    if (!blog) return [];

    return allBlogs
      .filter(item => item.slug !== blog.slug)
      .map(item => {
        let score = 0;
        if (item.category === blog.category) score += 5;
        // Count matching tags
        const matchingTags = item.tags.filter(tag => blog.tags.includes(tag));
        score += matchingTags.length * 2;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(entry => entry.item);
  }, [blog, allBlogs]);

  if (!blog) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <i className="far fa-frown" style={{ fontSize: '60px', color: '#ccc', marginBottom: '20px' }}></i>
        <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Article Not Found</h2>
        <p style={{ color: '#666', margin: '15px 0' }}>The blog post you are looking for does not exist or has been moved.</p>
        <Link to="/blog" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Back to Blog Feed
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <article className="blog-detail-page" style={{ padding: '40px 0' }}>
      {/* Dynamic SEO Meta Injections */}
      <SEO
        title={`${blog.title} | NK Dairy Products Blog`}
        description={blog.description}
        ogImage={blog.image}
        ogType="article"
        ogTitle={`${blog.title} | NK Dairy Products`}
        ogDescription={blog.description}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: blog.title, url: `/blog/${blog.slug}` }
        ]}
      />
      <ArticleSchema
        title={blog.title}
        description={blog.description}
        image={blog.image}
        date={blog.date}
        author={blog.author}
        slug={blog.slug}
      />
      {blog.faqs && blog.faqs.length > 0 && (
        <FAQSchema faqs={blog.faqs} />
      )}

      <div className="container">
        {/* Breadcrumb Navigation Trail */}
        <nav className="pd-breadcrumbs" style={{ marginBottom: '30px', fontSize: '0.9rem', color: '#666', textAlign: 'left' }}>
          <Link to="/" style={{ color: '#ff9800', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link to="/blog" style={{ color: '#ff9800', textDecoration: 'none' }}>Blog</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ fontWeight: '500', color: '#333' }}>{blog.title}</span>
        </nav>

        {/* Content Layout Grid */}
        <div className="blog-layout">
          {/* Main Article Container */}
          <div className="blog-detail-container">
            <header className="blog-detail-header">
              <div className="blog-detail-header-meta">
                <span><i className="far fa-folder" style={{ color: 'var(--primary-color)', marginRight: '5px' }}></i>{blog.category}</span>
                <span><i className="far fa-calendar-alt" style={{ color: 'var(--primary-color)', marginRight: '5px' }}></i>{formattedDate}</span>
                <span><i className="far fa-clock" style={{ color: 'var(--primary-color)', marginRight: '5px' }}></i>{blog.readTime}</span>
              </div>
              <h1 className="blog-detail-title">{blog.title}</h1>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                Written by: <strong>{blog.author}</strong>
              </div>
            </header>

            {/* Featured Image */}
            <div className="blog-detail-featured-img">
              <img src={blog.image} alt={blog.title} />
            </div>

            {/* Markdown Text Render Area */}
            <div className="blog-markdown-content text-left">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Tag Badges */}
            {blog.tags && blog.tags.length > 0 && (
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '600', color: '#555', marginRight: '5px', display: 'flex', alignItems: 'center' }}><i className="fas fa-tags" style={{ marginRight: '5px' }}></i> Tags:</span>
                {blog.tags.map(tag => (
                  <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="tag-item" style={{ textDecoration: 'none' }}>
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <section className="related-articles-section">
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '25px', color: 'var(--text-dark)', textAlign: 'left' }}>
                  Related Articles
                </h3>
                <div className="blog-grid">
                  {relatedArticles.map(item => (
                    <BlogCard key={item.slug} blog={item} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="blog-sidebar-column">
            <BlogSidebar allBlogs={allBlogs} />
          </div>
        </div>
      </div>
    </article>
  );
}
