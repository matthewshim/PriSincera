import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../contexts/LanguageContext';
import './WaymarkLanding.css';
import Icon from '../components/common/Icon';

/**
 * Waymark 서비스 소개 랜딩 (/waymark).
 *
 * 의사결정 동반 서비스(결정 저널 + 먼저 찾아오는 AI 동반자 + 경험담)의 선공개(pre-launch) 소개 페이지.
 * Candela(자동매매) 슬롯에서 피벗 — 배경: docs/waymark/repositioning_proposal.md
 * 전개 규범: 단일 컨테이너 + margin-top 섹션 리듬, 좌측 리딩(히어로만 중앙), CTA 닫는 카드.
 *   섹션 형식은 **의도적으로 불균질**하다(P3-1) — 선언 / 스테퍼 / 대화 / 카드 4종.
 *   eyebrow→타이틀→리드 삼단 공식을 전 섹션에 반복하면 AI 템플릿 티가 난다.
 * 브랜드 액센트 = indigo→lavender · 모티브 = 🧭 나침반(길잡이). design_system §9-1 준수.
 * 원칙 안전성: "AI가 대신 결정하지 않는다 — 갈림길을 비추고 곁에 있을 뿐".
 */

// 전 언어 공통 고정 영문/숫자 라벨 (i18n 비대상)
const STEP_NOS = ['01', '02', '03', '04'];
const STEP_ICONS = ['pen', 'star', 'trail', 'cycle'];
const TONE_IDX = [0, 1, 2, 3];
const DEMO_TURNS = [0, 1];

export default function WaymarkLanding() {
  const { t } = useTranslation();

  useSEO({
    title: t('waymark.seo.title'),
    description: t('waymark.seo.description'),
    ogUrl: 'https://www.prisincera.com/waymark',
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  return (
    <div className="wm-page">

      {/* HERO — 중앙(§9-1): 아이콘 → 타이틀(그라디언트 클립) → 서브카피(1행 로케일 + 2행 고정 EN — 형제 히어로와 동일 활자) → CTA → 기대 칩 */}
      <header className="wm-hero">
        <h1 className="wm-hero-title">Waymark</h1>
        <p className="wm-hero-sub">{t('waymark.hero.sub')}</p>
        <div className="wm-hero-cta">
          <Link to="/builders-log/introducing-waymark" className="wm-btn wm-btn-primary">{t('waymark.hero.ctaPrimary')}<Icon name="arrowRight" size={15} /></Link>
          <a href="#wmLoop" className="wm-btn wm-btn-ghost">{t('waymark.hero.ctaGhost')}</a>
        </div>
        <div className="wm-chip"><span className="wm-chip-dot" aria-hidden="true"></span> {t('waymark.hero.chip')}</div>
      </header>

      {/* 문제 공감 — 선언 블록. eyebrow·리드를 떼고 한 문장을 크게 세운다(P3-1 형식 ①/4) */}
      <section className="wm-section">
        <h2 className="wm-stmt">{t('waymark.empathy.title')}</h2>
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
              <div className="wm-step-node" aria-hidden="true"><Icon name={STEP_ICONS[i]} size={22} /></div>
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
        {/* 추상 모드명 4카드보다 실제 한 번의 주고받음이 설득력이 높다(P3-2) */}
        <div className="wm-demo">
          <div className="wm-demo-entry">
            <p className="wm-demo-meta">
              <span className="u-badge">{t('waymark.modes.demo.entryLabel')}</span>
              <span className="wm-demo-date">{t('waymark.modes.demo.entryDate')}</span>
            </p>
            <p className="wm-demo-said">{t('waymark.modes.demo.entry')}</p>
          </div>
          <p className="wm-demo-gap">{t('waymark.modes.demo.gap')}</p>
          {DEMO_TURNS.map((i) => (
            <div className="wm-demo-turn" key={i}>
              <span className="wm-demo-mode">{t(`waymark.modes.demo.turns.${i}.mode`)}</span>
              <p className="wm-demo-said">{t(`waymark.modes.demo.turns.${i}.msg`)}</p>
            </div>
          ))}
        </div>

        {/* 네 가지 결 — 그리드가 아닌 정의 목록(이름 → 뜻) */}
        <dl className="wm-tones">
          {TONE_IDX.map((i) => (
            <Fragment key={i}>
              <dt>{t(`waymark.modes.items.${i}.t`)}</dt>
              <dd>{t(`waymark.modes.items.${i}.d`)}</dd>
            </Fragment>
          ))}
        </dl>
        <div className="wm-reassure">{t('waymark.modes.reassure')}</div>
      </section>

      {/* CTA — 닫는 카드 */}
      <section className="wm-section">
        <div className="wm-cta">
          <h2>{t('waymark.cta.title')}</h2>
          <p>{t('waymark.cta.desc')}</p>
          <Link to="/builders-log/introducing-waymark" className="wm-btn wm-btn-primary">{t('waymark.cta.btn')}<Icon name="arrowRight" size={15} /></Link>
          <p className="wm-cta-soon">{t('waymark.cta.soon')}</p>
        </div>
      </section>

    </div>
  );
}
