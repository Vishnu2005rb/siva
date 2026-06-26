import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description,
  robots = 'index, follow',
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = 'https://res.cloudinary.com/ds0td5fre/image/upload/v1781690574/ghee_1l_qpbrwy.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage
}) {
  const defaultTitle = 'NK Dairy Products | Buy Premium Pure Cow Ghee Online';
  const defaultDesc = 'Buy 100% Pure Cow Ghee directly from NK Dairy Products. Premium quality traditional ghee made with natural ingredients. Home delivery across India.';
  const currentTitle = title || defaultTitle;
  const currentDesc = description || defaultDesc;
  
  // Calculate dynamic canonical URL
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://nk-dairy-products.pages.dev');

  return (
    <Helmet>
      {/* General Meta */}
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:title" content={ogTitle || currentTitle} />
      <meta property="og:description" content={ogDescription || currentDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={ogType} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || currentTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || currentDesc} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
    </Helmet>
  );
}
