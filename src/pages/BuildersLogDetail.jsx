import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Premium dark theme for code
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import logMeta from '../data/buildersLogMeta.json';
import { useTranslation } from '../contexts/LanguageContext';
import './BuildersLogDetail.css';

// Utility to separate leading emoji from text to prevent Chrome background-clip bugs on emojis
const renderTitle = (title) => {
  if (!title) return null;
  // Matches standard emojis, including supplementary and pictograph blocks
  const emojiRegex = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F9FF}]+(?:\ufe0f)?)\s*(.*)$/u;
  const match = title.match(emojiRegex);
  if (match) {
    const [, emoji, restOfTitle] = match;
    return (
      <>
        <span className="title-emoji">{emoji}</span>
        <span className="title-text">{restOfTitle}</span>
      </>
    );
  }
  return <span className="title-text">{title}</span>;
};

export default function BuildersLogDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { locale, localize } = useTranslation();
  
  const articleMeta = logMeta.find(m => m.slug === slug);
  const localizedTitle = articleMeta ? localize(articleMeta.title) : "Builder's Log";
  const localizedSubtitle = articleMeta ? localize(articleMeta.subtitle) : '';
  const localizedDescription = articleMeta ? localize(articleMeta.description) : 'PriSincera 기술 블로그 아티클입니다.';

  useSEO({
    title: `${localizedTitle} — Builder's Log`,
    description: localizedDescription,
    keywords: articleMeta && articleMeta.tags ? articleMeta.tags.join(', ') : PAGE_META['/builders-log'].keywords,
    ogUrl: `https://www.prisincera.com/builders-log/${slug}`
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  useEffect(() => {
    if (!articleMeta) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Waterfall loading: Try slug_locale.md first, fall back to slug.md
    const targetFile = locale && locale !== 'ko' ? `/content/logs/${slug}_${locale}.md` : `/content/logs/${slug}.md`;
    
    fetch(`${targetFile}?t=${Date.now()}`)
      .then(async res => {
        const text = await res.text();
        // SPA Fallback check (if 404 is rerouted to index.html)
        if (!res.ok || text.trim().toLowerCase().startsWith('<!doctype html>')) {
          if (locale && locale !== 'ko') {
            // Try default Korean file as fallback
            const fallbackRes = await fetch(`/content/logs/${slug}.md?t=${Date.now()}`);
            const fallbackText = await fallbackRes.text();
            if (!fallbackRes.ok || fallbackText.trim().toLowerCase().startsWith('<!doctype html>')) {
              throw new Error('Failed to fetch article');
            }
            return fallbackText;
          }
          throw new Error('Failed to fetch article');
        }
        return text;
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent(locale === 'ko' ? '아티클을 불러오는데 실패했습니다.' : 'Failed to load article.');
        setLoading(false);
      });

    // Record view count
    fetch(`/api/builderslog/${slug}/view`, { method: 'POST' }).catch(e => console.error(e));
  }, [slug, articleMeta, locale, localize]);

  if (!articleMeta) {
    return (
      <div className="builders-log-detail-wrapper error-state">
        <h2>Article Not Found</h2>
        <Link to="/builders-log" className="back-btn">← Back to Log</Link>
      </div>
    );
  }

  return (
    <div className="builders-log-detail-wrapper">
      <div className="detail-container">
        <div className="detail-header" style={{ '--accent-color': articleMeta.accent }}>
          <Link to="/builders-log" className="back-btn">← Builder's Log</Link>
          <div className="detail-meta">
            <span className="chapter-badge">Chapter {articleMeta.chapterNo}</span>
            <span className="date-badge">{new Date(articleMeta.date).toLocaleDateString()}</span>
          </div>
          <h1 className="detail-title">{renderTitle(localizedTitle)}</h1>
          <h2 className="detail-subtitle">{localizedSubtitle}</h2>
          
          <div className="detail-tags">
            {articleMeta.tags.map(tag => (
              <span key={tag} className="tag-pill">#{tag}</span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="markdown-loading">
            <div className="admin-spinner"></div> {locale === 'ko' ? '아티클을 불러오는 중...' : 'Loading article...'}
          </div>
        ) : (
          <article className="markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </article>
        )}
        
        <div className="detail-footer">
          <Link to="/builders-log" className="back-btn-large">
            {locale === 'ko' ? '다른 여정 살펴보기' : 'Explore other journeys'}
          </Link>
        </div>
      </div>
    </div>
  );
}
