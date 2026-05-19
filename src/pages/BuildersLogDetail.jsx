import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Premium dark theme for code
import useSEO from '../hooks/useSEO';
import logMeta from '../data/buildersLogMeta.json';
import './BuildersLogDetail.css';

export default function BuildersLogDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  const articleMeta = logMeta.find(m => m.slug === slug);

  useSEO({
    title: articleMeta ? `${articleMeta.title} | Builder's Log` : 'Builder\'s Log',
    description: articleMeta ? articleMeta.description : 'PriSincera 기술 블로그 아티클입니다.',
    keywords: articleMeta && articleMeta.tags ? articleMeta.tags.join(', ') : 'PriSincera, 기술블로그',
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
    
    // Fetch markdown content from public folder
    fetch(`/content/logs/${slug}.md`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch article');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent('아티클을 불러오는데 실패했습니다.');
        setLoading(false);
      });

    // Record view count
    fetch(`/api/builderslog/${slug}/view`, { method: 'POST' }).catch(e => console.error(e));
  }, [slug, articleMeta]);

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
          <h1 className="detail-title">{articleMeta.title}</h1>
          <h2 className="detail-subtitle">{articleMeta.subtitle}</h2>
          
          <div className="detail-tags">
            {articleMeta.tags.map(tag => (
              <span key={tag} className="tag-pill">#{tag}</span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="markdown-loading">
            <div className="admin-spinner"></div> 아티클을 불러오는 중...
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
            다른 여정 살펴보기
          </Link>
        </div>
      </div>
    </div>
  );
}
