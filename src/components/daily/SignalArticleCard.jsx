/**
 * SignalArticleCard — IT Tech Signal 아티클 카드 (3D Tilt 프리미엄 카드)
 *
 * ReLearn Phase B-0 추출: DailyDigest 내부 컴포넌트를 파일로 분리 (동작·마크업 동일).
 * 카테고리 칩 색상은 공유 모듈 categoryStyles 사용.
 */
import React from 'react';
import { getCategoryStyles } from './categoryStyles';
import '../../pages/DailyDigest.css';

const SignalArticleCard = ({ article, compact }) => {
  const cardRef = React.useRef(null);
  const [tiltStyle, setTiltStyle] = React.useState({});

  const handleMouseMove = (e) => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / xc;
    const dy = (y - yc) / yc;

    // 최대 5~6도 묵직한 3D Tilt + 공중부유(-4px) + scale3d(1.01) (디자인 시스템 4.5 규격 준수)
    const tiltX = (dy * -5).toFixed(2);
    const tiltY = (dx * 5).toFixed(2);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)'
    });
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`signal-article-card premium-3d-card haptic-trigger ${article.isDmPick ? 'dm-featured-card' : ''}${compact ? ' compact' : ''}`}
      ref={cardRef}
      onMouseMove={compact ? undefined : handleMouseMove}
      onMouseLeave={compact ? undefined : handleMouseLeave}
      style={compact ? undefined : tiltStyle}
      data-hover-text="VIEW"
    >
      {!compact && article.og_image && (
        <div className="signal-article-image">
          <img src={article.og_image} alt={article.title} loading="lazy" />
        </div>
      )}
      <div className="signal-article-body">
        <div className="signal-article-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {article.isDmPick && (
            <span className="dm-pick-badge">
              ✦ DM Pick
            </span>
          )}
          {article.category && <span className="signal-article-category" style={getCategoryStyles(article.category)}>{article.category}</span>}

          <div className="signal-article-meta-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {article.weightedScore && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#FCD34D' }}>★</span> {Number(article.weightedScore).toFixed(1)} {article.tier === 1 && '🌟'}
              </span>
            )}
            {article.weightedScore && article.source && <span style={{ opacity: 0.3 }}>|</span>}
            {article.source && <span className="article-source-name">{article.source}</span>}
          </div>
        </div>
        <h3>{article.title}</h3>
        {article.insight && <div className="signal-insight">💡 {article.insight}</div>}
        {!compact && <p>{article.summary}</p>}
        <span className="signal-link">원문 읽기 →</span>
      </div>
    </a>
  );
};

export default SignalArticleCard;
