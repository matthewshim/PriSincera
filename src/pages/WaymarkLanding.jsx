import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../contexts/LanguageContext';
import './WaymarkLanding.css';

/**
 * Waymark 서비스 소개 랜딩 (/waymark).
 *
 * 의사결정 동반 서비스(결정 저널 + 먼저 찾아오는 AI 동반자 + 경험담)의 선공개(pre-launch) 소개 페이지.
 * Candela(자동매매) 슬롯에서 피벗 — 배경: docs/waymark/repositioning_proposal.md
 * 전개 규범: 형제 랜딩(구 CandelaLanding) 정합 — 단일 컨테이너 + margin-top 섹션 리듬,
 *   섹션 공식(eyebrow → 타이틀 → 리드 → 콘텐츠), 좌측 리딩(히어로만 중앙), CTA 닫는 카드.
 * 브랜드 액센트 = indigo→lavender · 모티브 = 🧭 나침반(길잡이). design_system §9-1 준수.
 * 원칙 안전성: "AI가 대신 결정하지 않는다 — 갈림길을 비추고 곁에 있을 뿐".
 */

// 전 언어 공통 고정 영문/숫자 라벨 (i18n 비대상)
const STEP_NOS = ['01', '02', '03', '04'];
const STEP_ICONS = ['✎', '✦', '👣', '↻'];
const MODE_EN = ['Comfort', 'Counsel', 'Cheer', 'Clarify'];
const MODE_ICONS = ['🫶', '🧩', '🔥', '🗂️'];

export default function WaymarkLanding() {
  const { t, locale } = useTranslation();

  useSEO({
    title: t('waymark.seo.title'),
    description: t('waymark.seo.description'),
    ogUrl: 'https://www.prisincera.com/waymark',
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  const heroSub = t('waymark.hero.sub').split('\n');

  return (
    <div className="wm-page">

      {/* HERO — 중앙(§9-1): 아이콘 → 타이틀(그라디언트 클립) → 서브카피(1행 로케일 + 2행 고정 EN) → CTA → 기대 칩 */}
      <header className="wm-hero">
        <div className="wm-hero-icon" aria-hidden="true">🧭</div>
        <h1 className="wm-hero-title">Waymark</h1>
        <p className="wm-hero-sub">
          {heroSub[0]}
          {heroSub[1] && <span className="en">{heroSub[1]}</span>}
        </p>
        <div className="wm-hero-cta">
          <Link to="/builders-log" className="wm-btn wm-btn-primary">{t('waymark.hero.ctaPrimary')} <span aria-hidden="true">→</span></Link>
          <a href="#wmLoop" className="wm-btn wm-btn-ghost">{t('waymark.hero.ctaGhost')}</a>
        </div>
        <div className="wm-chip"><span className="wm-chip-dot" aria-hidden="true"></span> {t('waymark.hero.chip')}</div>
      </header>

      {/* 문제 공감 */}
      <section className="wm-section">
        <p className="wm-eyebrow">Why Waymark</p>
        <h2 className="wm-sec-title lg">{t('waymark.empathy.title')}</h2>
        <div className="wm-prose">
          <p>{t('waymark.empathy.p1')}</p>
          <p>{t('waymark.empathy.p2')}</p>
        </div>
      </section>

      {/* 핵심 루프 — 가로 스테퍼(모바일 세로) */}
      <section className="wm-section" id="wmLoop">
        <p className="wm-eyebrow">How it works</p>
        <h2 className="wm-sec-title">{t('waymark.loop.title')}</h2>
        <p className="wm-sec-desc">{t('waymark.loop.desc')}</p>
        <div className="wm-steps">
          {STEP_NOS.map((no, i) => (
            <div className={`wm-step${i === 1 ? ' mark' : ''}`} key={no}>
              <div className="wm-step-node" aria-hidden="true">{STEP_ICONS[i]}</div>
              <div className="wm-step-txt">
                <div className="wm-step-k">{no}</div>
                <h3>{t(`waymark.loop.steps.${i}.t`)}</h3>
                <p>{t(`waymark.loop.steps.${i}.d`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI 4모드 */}
      <section className="wm-section">
        <p className="wm-eyebrow">Beside you</p>
        <h2 className="wm-sec-title">{t('waymark.modes.title')}</h2>
        <p className="wm-sec-desc">{t('waymark.modes.desc')}</p>
        <div className="wm-mode-grid">
          {MODE_EN.map((en, i) => (
            <div className="wm-mode" key={en}>
              <div className="wm-mode-top">
                <div className="wm-mode-ico" aria-hidden="true">{MODE_ICONS[i]}</div>
                <h3>
                  {t(`waymark.modes.items.${i}.t`)}
                  {locale !== 'en' && <span className="en">{en}</span>}
                </h3>
              </div>
              <p>{t(`waymark.modes.items.${i}.d`)}</p>
            </div>
          ))}
        </div>
        <div className="wm-reassure">{t('waymark.modes.reassure')}</div>
      </section>

      {/* 경험담 티저 */}
      <section className="wm-section">
        <p className="wm-eyebrow">Coming</p>
        <h2 className="wm-sec-title">{t('waymark.teaser.title')}</h2>
        <p className="wm-sec-desc">{t('waymark.teaser.desc')}</p>
      </section>

      {/* CTA — 닫는 카드 */}
      <section className="wm-section">
        <div className="wm-cta">
          <h2>{t('waymark.cta.title')}</h2>
          <p>{t('waymark.cta.desc')}</p>
          <Link to="/builders-log" className="wm-btn wm-btn-primary">{t('waymark.cta.btn')} <span aria-hidden="true">→</span></Link>
          <p className="wm-cta-soon">{t('waymark.cta.soon')}</p>
        </div>
      </section>

    </div>
  );
}
