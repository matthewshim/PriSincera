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
  const commits = chapter.commits || [];
  const isFeatured = index === 0;
  
  // 한국어 정독 기준 (분당 150자 내외)으로 읽는 시간(Read Time) 산정
  const calculateReadTime = (desc, commitsList) => {
    const textLength = (desc || '').length + commitsList.map(c => c.msg).join(' ').length;
    const minutes = Math.max(1, Math.round(textLength / 180));
    return `${minutes} min read`;
  };

  const readTime = calculateReadTime(chapter.description, commits);
  
  return (
    <div 
      className={`builder-card builder-card-${index} ${isFeatured ? 'builder-card-featured' : 'builder-card-grid'}`} 
      ref={ref}
    >
      <Link to={`/builders-log/${chapter.slug}`} className="builder-card-link-wrapper">
        <div className="builder-card-glass" style={{ '--accent-color': chapter.accent }}>
          <div className="card-glow-bg"></div>
          
          <div className="card-layout-split">
            <div className="card-main-content">
              <div>
                <div className="card-header">
                  <div className="chapter-badge">Chapter {chapter.chapterNo}</div>
                  <h2 className="chapter-title">{chapter.title}</h2>
                  <h3 className="chapter-subtitle">{chapter.subtitle}</h3>
                  <div className="chapter-meta">
                    <span className="meta-item">{new Date(chapter.date).toLocaleDateString()}</span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">{readTime}</span>
                  </div>
                </div>
                
                <div className="card-body">
                  <p className="chapter-desc">{chapter.description}</p>
                </div>
              </div>

              {chapter.tags && chapter.tags.length > 0 && (
                <div className="card-tags">
                  {chapter.tags.map((tag, i) => (
                    <span key={i} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Inline Recent Shipments (Static, no longer absolute hover!) */}
              {!isFeatured && commits.length > 0 && (
                <div className="card-shipments-static-panel">
                  <div className="shipments-header">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shipments-icon">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Recent Shipments</span>
                  </div>
                  <div className="shipments-list">
                    {commits.slice(0, 3).map((commit, i) => (
                      <div key={i} className="shipment-item">
                        <span className={`shipment-badge badge-${commit.type}`}>
                          {commit.type}
                        </span>
                        <span className="shipment-msg">{commit.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isFeatured && (
              <div className="card-visual-content">
                <div className="visual-glow-sphere" style={{ background: `radial-gradient(circle, ${chapter.accent} 0%, transparent 70%)` }}></div>
                <div className="visual-meta-card">
                  <div className="visual-meta-title">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Key Shipments
                  </div>
                  <div className="visual-meta-commits">
                    {commits.slice(0, 3).map((commit, i) => (
                      <div key={i} className="visual-commit-row">
                        <span className="visual-commit-hash">{commit.hash}</span>
                        <span className="visual-commit-msg">{commit.msg}</span>
                      </div>
                    ))}
                    {commits.length > 3 && (
                      <div className="visual-commit-more">+{commits.length - 3} more shipments</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-footer">
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
          {logMeta.length > 0 && (
            <div className="featured-chapter-container">
              <ChapterCard chapter={logMeta[0]} index={0} />
            </div>
          )}
          
          {logMeta.length > 1 && (
            <div className="builders-log-grid">
              {logMeta.slice(1).map((chapter, index) => (
                <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
              ))}
            </div>
          )}
        </section>
        
        <section className="log-footer-note">
          <div className="pulse-dot"></div>
          <p>여정은 계속됩니다.</p>
        </section>
      </div>
    </div>
  );
}
