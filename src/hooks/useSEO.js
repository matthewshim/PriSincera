import { useEffect } from 'react';

export default function useSEO({ title, description, keywords, ogImage, ogUrl }) {
  useEffect(() => {
    // 1. Title
    const siteTitle = 'PriSincera';
    const fullTitle = title ? `${title} | ${siteTitle}` : 'PriSincera — Sincerity, Prioritized.';
    document.title = fullTitle;

    // Helper to safely set meta tags
    const setMeta = (name, property, content) => {
      let selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let tag = document.querySelector(selector);
      
      if (!tag) {
        tag = document.createElement('meta');
        if (name) tag.setAttribute('name', name);
        if (property) tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    // 2. Standard Meta Tags
    if (description) {
      setMeta('description', null, description);
      setMeta(null, 'og:description', description);
      setMeta('twitter:description', null, description);
    }
    
    // 3. Open Graph & Twitter Title
    setMeta(null, 'og:title', fullTitle);
    setMeta('twitter:title', null, fullTitle);

    // 4. Keywords
    if (keywords) {
      setMeta('keywords', null, keywords);
    }

    // 5. Open Graph Image
    const defaultOgImage = 'https://www.prisincera.com/og-image.png'; // Make sure you have a default OG image
    const finalOgImage = ogImage || defaultOgImage;
    
    setMeta(null, 'og:image', finalOgImage);
    setMeta('twitter:image', null, finalOgImage);
    setMeta('twitter:card', null, 'summary_large_image');

    // 6. Canonical URL
    if (ogUrl) {
      setMeta(null, 'og:url', ogUrl);
      setLink('canonical', ogUrl);
    }

  }, [title, description, keywords, ogImage, ogUrl]);
}
