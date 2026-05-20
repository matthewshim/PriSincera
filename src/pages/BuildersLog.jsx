import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import logMeta from '../data/buildersLogMeta.json';
import './BuildersLog.css';

function useScrollReveal(options = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('reveal-active');
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);
  return ref;
}

const ChapterCard = ({ chapter, index }) => {
  const ref = useScrollReveal();
  const [isExpanded, setIsExpanded] = useState(false);
  const commits = chapter.commits || [];
  const hasMore = commits.length > 1;
  
  return (
    <div className={`builder-card builder-card-${index}`} ref={ref}>
      <Link to={`/builders-log/${chapter.slug}`} className="builder-card-link-wrapper">
        <div className="builder-card-glass" style={{ '--accent-color': chapter.accent }}>
          <div className="card-glow-bg"></div>
          
          <div className="card-header">
            <div className="chapter-badge">Chapter {chapter.chapterNo}</div>
            <h2 className="chapter-title">{chapter.title}</h2>
            <h3 className="chapter-subtitle">{chapter.subtitle}</h3>
            <div className="chapter-date">{new Date(chapter.date).toLocaleDateString()}</div>
          </div>
          
          <div className="card-body">
            <p className="chapter-desc">{chapter.description}</p>
          </div>
          
          <div className="card-commits" onClick={(e) => {
            // Prevent accidental navigation when clicking anywhere inside the commits block
            e.stopPropagation();
          }}>
            <div className="commits-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Key Shipments
              </div>
              {hasMore && (
                <button 
                  className={`commits-toggle-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {!isExpanded && <span className="more-count">+{commits.length - 1}</span>}
                  <svg 
                    className="chevron-icon" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="commits-list">
              {commits.map((commit, i) => {
                const isExtra = i > 0;
                const isLineHidden = !isExpanded && i === 0 && hasMore;
                return (
                  <div 
                    className={`commit-item ${isExtra ? 'commit-item-extra' : ''} ${isExtra && isExpanded ? 'show' : ''} ${isLineHidden ? 'line-hidden' : ''}`} 
                    key={i}
                  >
                    <div className="commit-node" style={{ borderColor: chapter.accent }}></div>
                    <div className="commit-content">
                      <div className="commit-meta">
                        <span className="commit-hash">{commit.hash}</span>
                        <span className={`commit-type type-${commit.type}`}>{commit.type}</span>
                      </div>
                      <div className="commit-msg">{commit.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <span className="read-more-btn">
              Read Article <span className="read-more-arrow">→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function BuildersLog() {
  useSEO({
    title: 'Builders Log',
    description: "PriSincera의 프로덕트 메이킹과 비즈니스 구축 여정을 기록한 기술 블로그입니다.",
    keywords: 'PriSincera, 빌더스 로그, 개발 일지, 프로덕트, 기술 블로그, 아키텍처',
    ogUrl: 'https://www.prisincera.com/builders-log'
  });

  const headerRef = useScrollReveal();

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  return (
    <div className="builders-log-wrapper">
      <section className="log-hero-section" ref={headerRef}>
        <div className="log-hero-content">
          <div className="log-hero-icon">🛠️</div>
          <h1 className="hero-heading">Builder's Log</h1>
          <p className="hero-paragraph">
            PriSincera가 단순한 포트폴리오를 넘어 완전한 SaaS 플랫폼으로 거듭나기까지.<br/>
            프로덕트를 설계하고 코드를 쌓아 올린 치열한 항해의 기록을 공유합니다.
          </p>
        </div>
      </section>

      <div className="log-container">
        <section className="chapters-section" style={{ marginTop: '20px' }}>
          <div className="log-bento-grid">
            {logMeta.map((chapter, index) => (
              <ChapterCard key={chapter.id} chapter={chapter} index={index} />
            ))}
          </div>
        </section>
        
        <section className="log-footer-note">
          <div className="pulse-dot"></div>
          <p>여정은 계속됩니다.</p>
        </section>
      </div>
    </div>
  );
}
