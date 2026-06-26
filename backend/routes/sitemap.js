const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const activeProducts = await Product.find({ isActive: true });
    const baseUrl = 'https://nk-dairy-products.pages.dev';

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPaths = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/blog', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' }
    ];

    staticPaths.forEach(item => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${item.path}</loc>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Dynamic Product Detail pages
    activeProducts.forEach(product => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/product/${product._id}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Dynamic Blog Detail pages
    const blogsDir = path.join(__dirname, '../../src/content/blogs');
    if (fs.existsSync(blogsDir)) {
      const files = fs.readdirSync(blogsDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const slug = file.replace('.md', '');
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
          xml += '    <changefreq>weekly</changefreq>\n';
          xml += '    <priority>0.8</priority>\n';
          xml += '  </url>\n';
        }
      });
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap XML:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
