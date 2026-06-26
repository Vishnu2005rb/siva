import React from 'react';
import { Helmet } from 'react-helmet-async';

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'NK Dairy Products',
    'url': 'https://nk-dairy-products.pages.dev',
    'logo': 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+91 1234567890',
      'contactType': 'customer service',
      'areaServed': 'IN',
      'availableLanguage': ['en', 'ta']
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'NK Dairy Products',
    'image': 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg',
    'telephone': '+91 1234567890',
    'url': 'https://nk-dairy-products.pages.dev',
    'logo': 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'NK Groups Dairy, Madurai Road',
      'addressLocality': 'Madurai',
      'addressRegion': 'Tamil Nadu',
      'postalCode': '625001',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '9.9252',
      'longitude': '78.1198'
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      'opens': '08:00',
      'closes': '20:00'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function ProductSchema({ name, description, price, image, size, rating, count = 128, stock = 100 }) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://nk-dairy-products.pages.dev';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'image': image,
    'description': description,
    'sku': `NK-GHEE-${(size || 'DEFAULT').toUpperCase()}`,
    'brand': {
      '@type': 'Brand',
      'name': 'NK Dairy Products'
    },
    'offers': {
      '@type': 'Offer',
      'url': currentUrl,
      'priceCurrency': 'INR',
      'price': price,
      'priceValidUntil': '2030-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  if (rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': rating,
      'reviewCount': count,
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items = [] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${typeof window !== 'undefined' ? window.location.origin : 'https://nk-dairy-products.pages.dev'}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function FAQSchema({ faqs = [] }) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question || '',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer || ''
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function ArticleSchema({ title, description, image, date, author = 'NK Dairy Products', slug }) {
  const currentUrl = `https://nk-dairy-products.pages.dev/blog/${slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'image': [image],
    'datePublished': date,
    'dateModified': date,
    'author': [{
      '@type': 'Organization',
      'name': author,
      'url': 'https://nk-dairy-products.pages.dev'
    }],
    'publisher': {
      '@type': 'Organization',
      'name': 'NK Dairy Products',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg'
      }
    },
    'description': description,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': currentUrl
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
