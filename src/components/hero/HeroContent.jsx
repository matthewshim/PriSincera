import React, { useEffect, useRef } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import notesMeta from '../../data/plannersViewMeta.json';
import Icon from '../common/Icon';

/**
 * Hero text content — label, title, subtitle.
 * Animates in sequentially after assembly completes.
 * Calls onIntroComplete when all elements (including SCROLL indicator) are visible.
 */
export default function HeroContent({ visible, onIntroComplete }) {
  const containerRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;

    const label = el.querySelector('.hero-label');
    const words = el.querySelectorAll('.word');
    const role = el.querySelector('.hero-role');
    const ctas = el.querySelector('.hero-ctas');   // 구 `.hero-sub` 자리를 이어받는다
    const scroll = document.getElementById('scrollIndicator');

    /* Collect all timer IDs for cleanup */
    const timers = [];

    /* 인트로 완료 통지 — 타이머 완주와 사용자 조기 스킵 양쪽에서 호출되므로 1회로 제한 */
    let notified = false;
    const done = () => {
      if (notified) return;
      notified = true;
      onIntroComplete?.();
    };

    timers.push(setTimeout(() => label?.classList.add('visible'), 200));
    timers.push(setTimeout(() => {
      words.forEach((w) => {
        const delay = parseInt(w.dataset.delay) || 0;
        timers.push(setTimeout(() => w.classList.add('visible'), delay * 150));
      });
    }, 600));
    timers.push(setTimeout(() => role?.classList.add('visible'), 1300));
    timers.push(setTimeout(() => ctas?.classList.add('visible'), 1750));
    timers.push(setTimeout(() => {
      scroll?.classList.add('visible');
      done();
    }, 2200));

    // [인트로 양보 — ai_pattern_audit §2-4 D3]
    // 스크롤 락 대신, 사용자가 진행 의사를 보이면(휠·터치·키·스크롤) 시퀀스를
    // 즉시 완주시킨다. 기다릴 사람은 연출을 보고, 넘길 사람은 바로 넘긴다.
    const skip = () => {
      timers.forEach(id => clearTimeout(id));
      [label, role, ctas, scroll].forEach(el => el?.classList.add('visible'));
      words.forEach(w => w.classList.add('visible'));
      done();
    };
    const opts = { passive: true, once: true };
    const events = ['wheel', 'touchstart', 'keydown', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, skip, opts));

    return () => {
      timers.forEach(id => clearTimeout(id));
      events.forEach(ev => window.removeEventListener(ev, skip));
    };
  }, [visible, onIntroComplete]);

  return (
    <div className="hero-content" ref={containerRef}>
      <div className="hero-label">{t('home.heroLabel')}</div>
      <h1 className="hero-title">
        <span className="word" data-delay="0">Sincerity,</span>
        <span className="word accent" data-delay="1">Prioritized.</span>
      </h1>
      <p className="hero-role">{t('home.heroRole')}</p>
      {/* CTA 2개 — 구 구조는 히어로에 링크·버튼이 0개라 첫 화면에서 다음 행동이 없었다.
          주 버튼은 결과물로, 보조는 최신 글로 보낸다. 앵커는 `#work`다 — `#proof-of-work`는 없는 id다.
          구 인용 블록("발 아래 꽃, 먼 곳의 별" + 설명 3행)은 BELIEF가 제목·리드로 이미 전부
          담고 있어 제거했다. 옮길 것이 없었다. */}
      <div className="hero-ctas">
        <a href="#work" className="btn-primary hero-cta">
          {t('home.heroCtaWork')}
          <Icon name="arrowDown" size={14} />
        </a>
        <Link to={`/planners-view/${notesMeta[0].slug}`} className="btn-secondary hero-cta">
          {t('home.heroCtaNote')}
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    </div>
  );
}

