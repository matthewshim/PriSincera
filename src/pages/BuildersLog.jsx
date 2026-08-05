import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import useScrollReveal from '../hooks/useScrollReveal';
import logMeta from '../data/buildersLogMeta.json';
import { useTranslation } from '../contexts/LanguageContext';
import './BuildersLog.css';

const ChapterCard = ({ chapter, index }) => {
  const { locale, localize, t } = useTranslation();
  const [revealRef, revealed] = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
  const commits = chapter.commits || [];
  const isFeatured = index === 0;
  // 3D 틸트 제거 — 홈 플래그십(Chapter 11)과 동일 절제 철학. 호버 부유는 CSS로 처리(§6-3 v5.14).

  // 한국어 정독 기준 (분당 150자 내외)으로 읽는 시간(Read Time) 산정
  // 영문은 단어 및 공백으로 인한 문자수 팽창을 고려하여 기준값(Divisor)을 240으로 보정
  const calculateReadTime = (desc, commitsList) => {
    const textLength = (desc || '').length + commitsList.map(c => c.msg).join(' ').length;
    const divisor = locale === 'en' ? 240 : 180;
    const minutes = Math.max(1, Math.round(textLength / divisor));
    return `${minutes} min read`;
  };

  const readTime = calculateReadTime(localize(chapter.description), commits);
  
  return (
    <div 
      className={`builder-card builder-card-${index} ${isFeatured ? 'builder-card-featured' : 'builder-card-grid'}${revealed ? ' revealed' : ''}`} 
      ref={revealRef}
    >
      <Link to={`/builders-log/${chapter.slug}`} className="builder-card-link-wrapper">
        <div
          className="builder-card-glass haptic-trigger"
          style={{ '--accent-color': chapter.accent }}
          data-hover-text="READ"
        >
          <div className="card-glow-bg"></div>
          
          {/* Featured Card 전용 상단 100% 가로 헤더 */}
          {isFeatured && (
            <div className="card-header card-header-featured">
              <div className="chapter-badge">Chapter {chapter.chapterNo}</div>
              <h2 className="chapter-title">{localize(chapter.title)}</h2>
              <h3 className="chapter-subtitle">{localize(chapter.subtitle)}</h3>
              <div className="chapter-meta">
                <span className="meta-item">{new Date(chapter.date).toLocaleDateString()}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item">{readTime}</span>
              </div>
            </div>
          )}
 
          <div className="card-layout-split">
            <div className="card-main-content">
              <div>
                {/* 일반 그리드 카드용 인라인 헤더 */}
                {!isFeatured && (
                  <div className="card-header">
                    <div className="chapter-badge">Chapter {chapter.chapterNo}</div>
                    <h2 className="chapter-title">{localize(chapter.title)}</h2>
                    <h3 className="chapter-subtitle">{localize(chapter.subtitle)}</h3>
                    <div className="chapter-meta">
                      <span className="meta-item">{new Date(chapter.date).toLocaleDateString()}</span>
                      <span className="meta-divider">•</span>
                      <span className="meta-item">{readTime}</span>
                    </div>
                  </div>
                )}
                
                <div className="card-body">
                  <p className="chapter-desc">{localize(chapter.description)}</p>
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
                    <span>{t('buildersLog.recentShipments')}</span>
                  </div>
                  <div className="shipments-list">
                    {commits.slice(0, 3).map((commit, i) => (
                      <div key={i} className="shipment-item">
                        <span className={`shipment-badge badge-${commit.type}`}>
                          {commit.type}
                        </span>
                        <span className="shipment-msg">{localize(commit.msg)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
 
            {isFeatured && (
              <div className="card-visual-content">
                <div className="visual-meta-card">
                  <div className="visual-meta-title">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('buildersLog.keyShipments')}
                  </div>
                  <div className="visual-meta-commits">
                    {commits.slice(0, 3).map((commit, i) => (
                      <div key={i} className="visual-commit-row">
                        <span className="visual-commit-hash">{commit.hash}</span>
                        <span className="visual-commit-msg">{localize(commit.msg)}</span>
                      </div>
                    ))}
                    {commits.length > 3 && (
                      <div className="visual-commit-more">
                        {t('buildersLog.moreShipments').replace('{count}', commits.length - 3)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
 
          <div className="card-footer">
            <span className="read-more-btn">
              {t('buildersLog.readArticle')} <span className="read-more-arrow">→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function BuildersLog() {
  const { t } = useTranslation();
  useSEO({
    title: PAGE_META['/builders-log'].pageTitle,
    description: PAGE_META['/builders-log'].description,
    keywords: PAGE_META['/builders-log'].keywords,
    ogUrl: 'https://www.prisincera.com/builders-log'
  });

  const [headerRef, headerRevealed] = useScrollReveal();
  
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  return (
    <div className="builders-log-wrapper">
      <section 
        className={`log-hero-section${headerRevealed ? ' revealed' : ''}`} 
        ref={headerRef}
      >
        <div className="log-hero-content">
          <div className="log-hero-icon">🛠️</div>
          <h1 className="hero-heading">Builder's Log</h1>
          <p className="hero-paragraph">
            {t('buildersLog.heroParagraph')}
          </p>
        </div>
      </section>

      <div className="log-container">
        <section className="chapters-section">
          {logMeta.length > 0 && (
            <div className="featured-chapter-container">
              <ChapterCard chapter={logMeta[0]} index={0} />
            </div>
          )}
          
          {logMeta.length > 1 && (
            <>
              {/* 데스크톱 전용 2열 지그재그(행 우선) 그리드 */}
              <div className="builders-log-desktop-grid">
                <div className="builders-log-column">
                  {logMeta.slice(1).filter((_, idx) => idx % 2 === 0).map((chapter, idx) => (
                    <ChapterCard key={chapter.id} chapter={chapter} index={1 + (idx * 2)} />
                  ))}
                </div>
                <div className="builders-log-column">
                  {logMeta.slice(1).filter((_, idx) => idx % 2 === 1).map((chapter, idx) => (
                    <ChapterCard key={chapter.id} chapter={chapter} index={2 + (idx * 2)} />
                  ))}
                </div>
              </div>

              {/* 모바일/태블릿 전용 단일 플랫 1열 그리드 */}
              <div className="builders-log-mobile-grid">
                {logMeta.slice(1).map((chapter, index) => (
                  <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
                ))}
              </div>
            </>
          )}
        </section>
        
        <section className="log-footer-note">
          <div className="pulse-dot"></div>
          <p>{t('buildersLog.journeyContinues')}</p>
        </section>
      </div>
    </div>
  );
}
