/**
 * HeroLatestNote — 최신 연재로 가는 상시 CTA (스크롤 추종형)
 *
 * 하나의 요소가 히어로 하단 중앙 → 우하단으로 **수평 이동**해 고정된다. 사라졌다 다른 자리에
 * 나타나면 시선이 끊겨 인지되지 않으므로(1차 시도 실패), 같은 스트립이 계속 움직인다.
 *
 * 부드러움을 위한 두 가지 결정
 * 1) **React 상태를 거치지 않는다.** 스크롤마다 리렌더가 돌면 프레임과 어긋나 끊긴다.
 *    rAF 안에서 style.transform 을 직접 쓴다.
 * 2) **레이아웃을 읽지도 쓰지도 않는다.** 요소 폭을 재지 않고 translateX 의 % 가 자기 폭을
 *    기준으로 한다는 성질을 이용해 calc 로 보간한다 — 합성 레이어에서만 처리된다.
 *
 *      left: 50% 기준,  T(p) = -(50 + 50p)% + (50p)vw - (dock·p)px
 *      p=0 → translateX(-50%)                 : 화면 중앙
 *      p=1 → translateX(50vw - dock - 100%)   : 우측 끝에서 dock 만큼 안쪽
 *
 * 수직 이동은 하지 않는다(출발·도착 높이 동일) — 대각선 이동이 어색하다는 환류 반영.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import notesMeta from '../../data/plannersViewMeta.json';
import seriesMeta from '../../data/plannersViewSeries.json';
import { useTranslation } from '../../contexts/LanguageContext';
import './HeroLatestNote.css';

/** SCROLL 인디케이터(2200ms) 직후 — 리빌 시퀀스의 마지막 박자 */
const REVEAL_DELAY = 2400;
/** 이동이 끝나 고정되는 지점 (scrollY / 뷰포트높이) — 값이 클수록 늦게 도착 */
const DOCK_AT = 0.85;
/** 도착 시 화면 우측에서 띄울 거리 */
const DOCK_RIGHT_DESKTOP = 32;
const DOCK_RIGHT_MOBILE = 16;

export default function HeroLatestNote({ visible }) {
  const { t, localize } = useTranslation();
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    const id = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(id);
  }, [visible]);

  // 스크롤 추종 — rAF 로 프레임에 정렬하고, React 재조정을 거치지 않는다
  useEffect(() => {
    let raf = 0;

    const apply = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;

      const vh = window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, (window.scrollY / vh) / DOCK_AT));
      const dock = window.innerWidth <= 768 ? DOCK_RIGHT_MOBILE : DOCK_RIGHT_DESKTOP;

      el.style.transform =
        `translateX(calc(${-(50 + 50 * p)}% + ${50 * p}vw - ${dock * p}px))`;
      el.classList.toggle('is-docked', p >= 0.995);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [revealed]);

  const note = notesMeta[0];
  if (!note) return null;

  const seriesDef = note.series ? seriesMeta.find((s) => s.id === note.series.id) : null;
  const title = localize(note.title);

  // 라벨 자리는 절대 비우지 않는다 — 시리즈가 없으면 섹션명으로 폴백
  const label = seriesDef ? localize(seriesDef.title) : "Planner's View";

  // 편수는 '몇 번째'가 아니라 '몇 편 중 최신'으로 읽히게 한다
  const seriesCount = note.series
    ? notesMeta.filter((n) => n.series && n.series.id === note.series.id).length
    : 0;
  const partLabel = seriesCount > 1 ? t('home.latestPart', { n: seriesCount }) : '';

  return createPortal(
    <Link
      ref={ref}
      to={`/planners-view/${note.slug}`}
      className={`hero-latest${revealed ? ' revealed' : ''}`}
      aria-label={`${t('home.latestNote')}: ${title}`}
    >
      <span className="hero-latest-dot" aria-hidden="true"></span>

      <span className="hero-latest-meta">
        {/* 시리즈명만 줄어들고(말줄임), 편수 표기는 끝까지 남는다 */}
        <span className="hero-latest-series">{label}</span>
        {partLabel && <span className="hero-latest-part">{partLabel}</span>}
      </span>

      <span className="hero-latest-div" aria-hidden="true"></span>

      <span className="hero-latest-title">{title}</span>

      {/* 가는 선 SVG — 히어로의 별자리·아틀라스 아이콘과 같은 획 어휘 */}
      <svg className="hero-latest-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>,
    document.body
  );
}
