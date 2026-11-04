import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '../common/Icon';
import { useTranslation } from '../../contexts/LanguageContext';
import useScrollProgress from '../../hooks/useScrollProgress';
import './JourneySection.css';

/**
 * Journey Section — career timeline with scroll-triggered milestones.
 * Dates verified against LinkedIn profile (shimks).
 * Company names replaced with industry/sector labels per user request.
 */

/* `Years`에는 `+`를 붙이지 않는다 — 2007.03 시작이라 현재 19년 8개월이고,
   19.67은 20으로 반올림되는 값이지만 '20을 넘는다'는 주장은 아직 사실이 아니다.
   2027.03에 만 20년이 된다(main_page_revision_plan.md §12-7). */
/* 경력 수치 — 셋 다 정확한 값이라 `+`를 붙이지 않는다.
   `20`: 2007.03 시작, 현재 19년 8개월(2027.03에 만 20년). `20+`는 아직 사실이 아니다.
   `4`: 아시아(동남아)·유럽·오세아니아·남미.
   `31`: 한 권역 스토어프론트에 연동한 결제 수단. 화면 타일은 34개지만 아그리게이터별로
        중복 노출되는 3건을 뺀 값이다 — 34는 같은 수단을 두 번 센다.
   구 `50+ Projects`는 근거 없는 임의 수치여서 폐기했다.
   정본: docs/core/main_page_revision_plan.md §15-5. */
const STATS = [
  { key: 'years',      target: 20, label: 'Years' },
  { key: 'continents', target: 4,  label: 'Continents' },
  { key: 'payments',   target: 31, label: 'Payment Methods' },
];

/**
 * Animates a number from 0 to target over duration.
 */
function useCountUp(target, started, index = 0) {
  /* 감쇠 설정이면 처음부터 최종값을 들고 있는다 — 전역 CSS 규칙은 CSS 애니메이션만 덮는다. */
  const reduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!started || reduced) return undefined;

    /* 지속 시간을 **값에 비례**시킨다. 구 구조는 1800ms 고정이라 `4`가 ease-out으로
       약 1,080ms에 끝나고 720ms를 멈춰 있었다 — 다섯 값만 지나가 글리치로 읽혔다
       (2026-11-04 오너 지적). 이제 어느 숫자든 스텝 간격이 비슷하다.
       칸별 100ms 스태거로 좌→우로 차오른다 — 통계는 읽는 순서가 실재하는 한 줄이다. */
    const duration = Math.min(1400, Math.max(600, target * 45));
    const delay = index * 100;
    let raf;
    let startTime = null;

    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(step); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, started, reduced, index]);

  return value;
}

function StatItem({ target, label, caption, started, index }) {
  const count = useCountUp(target, started, index);
  return (
    <div className="stat-item">
      {/* 보이는 요소는 전부 기계에서 감추고 아래 한 줄로만 읽힌다 — 구 구조는 `.u-sr-only`와
          `.stat-label`이 겹쳐 **"20 Years, Years"**로 들렸다(2026-11-04 자가 발각). */}
      <div className="stat-label" aria-hidden="true">{label}</div>
      <div className="stat-number" aria-hidden="true">{count}</div>
      <div className="stat-caption" aria-hidden="true">{caption}</div>
      <span className="u-sr-only">{label} {target}, {caption}</span>
    </div>
  );
}

export default function JourneySection() {
  const { t } = useTranslation();
  const exp = t('home.experience');

  /* 경험 5단 등장 리빌 — 항목별로 관찰한다. 바로 아래 연대기 카드가 이미 스크롤 연동이라,
     여기까지 연동하면 한 섹션에 진행 막대가 둘이 되어 경쟁한다(§9-14 v6.9의 교훈).
     감쇠 설정이면 처음부터 최종 상태로 둔다 — 전역 CSS 규칙은 CSS 애니메이션만 덮는다. */
  const expRefs = useRef([]);
  const expReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [expShown, setExpShown] = useState([]);

  useEffect(() => {
    const n = Array.isArray(exp) ? exp.length : 0;
    if (!n) return undefined;
    if (expReduced) { setExpShown(Array(n).fill(true)); return undefined; }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number(entry.target.dataset.expIndex);
          setExpShown((prev) => {
            if (prev[idx]) return prev;
            const next = prev.length ? [...prev] : Array(n).fill(false);
            next[idx] = true;
            return next;
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -15% 0px' },
    );
    for (const el of expRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [exp, expReduced]);
  const [sectionRef, progress] = useScrollProgress();
  const milestonesRef = useRef([]);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [revealedMilestones, setRevealedMilestones] = useState([false, false, false]);

  const MILESTONES = [
    {
      year: 'Past',
      headline: t('home.milestone1.headline'),
      industry: '20 Years of IT',
      description: t('home.milestone1.desc'),
      keyword: 'Experience',
      rgb: '229,178,93',
    },
    {
      year: 'Shift',
      headline: t('home.milestone2.headline'),
      industry: 'Vibe Coding',
      description: t('home.milestone2.desc'),
      keyword: 'Innovation',
      rgb: '199,210,254',
    },
    {
      year: 'Now',
      headline: t('home.milestone3.headline'),
      industry: 'PriSincera',
      description: t('home.milestone3.desc'),
      keyword: 'Service',
      isNow: true,
      rgb: '165,180,252',
    },
  ];

  // Observe individual milestones for staggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            
            setRevealedMilestones((prev) => {
              if (prev[index]) return prev;
              
              const rect = entry.target.getBoundingClientRect();
              const color = entry.target.getAttribute('data-accent-color');
              window.dispatchEvent(
                new CustomEvent('trigger-shooting-star', {
                  detail: {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    color: color,
                  },
                })
              );

              const next = [...prev];
              next[index] = true;
              return next;
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    milestonesRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Observe stats for count-up trigger
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setMilestoneRef = useCallback((el, i) => {
    milestonesRef.current[i] = el;
  }, []);

  return (
    <section className="journey" id="journey">
      <div className="journey-container">
        <div className="section-label">Journey</div>

        <div className="journey-header">
          <h2 className="journey-title">
            {t('home.journeyTitle')}<span className="accent">{t('home.journeyTitleAccent')}</span>
          </h2>
          <p className="journey-subtitle">
            {t('home.journeySubtitle').split('\n').map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {/* 마지막 줄 뒤 <br />는 문단 아래에 빈 줄을 만든다 — CSS margin과 이중으로 벌어졌다 */}
                {idx < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <div className="journey-stats" ref={statsRef}>
            {STATS.map((stat, i) => (
              <StatItem
                key={stat.key}
                {...stat}
                caption={t(`home.statCaption.${stat.key}`)}
                index={i}
                started={statsVisible}
              />
            ))}
          </div>
        </div>

        {/* 경험 5단 — 회사가 아니라 **경험**이 단위다(오너 결정 2026-11-04).
            6개 회사를 도메인으로 묶으니 5단이 됐고, 회사명·직책을 쓰지 않아도 문장이 성립한다.
            검증이 필요한 사람은 끝의 LinkedIn 링크로 간다. 정본: main_page_revision_plan §12-4. */}
        <ol className="journey-exp">
          {(Array.isArray(exp) ? exp : []).map((e, i) => (
            <li
              className={`exp-item${expShown[i] ? ' is-in' : ''}`}
              key={e.years}
              data-exp-index={i}
              ref={(el) => { expRefs.current[i] = el; }}
            >
              <div className="exp-years u-eyebrow">{e.years}</div>
              <div className="exp-body">
                <h3 className="exp-title">{e.title}</h3>
                <p className="exp-did">{e.did}</p>
                <p className="exp-learned">{e.learned}</p>
              </div>
            </li>
          ))}
        </ol>
        <a
          className="exp-more"
          href="https://www.linkedin.com/in/shimks"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('home.experienceMore')}
          <Icon name="external" size={13} />
        </a>

        <div className="timeline" ref={sectionRef} style={{ '--scroll-progress': progress }}>
          {MILESTONES.map((m, i) => {
            const isActive = i === 0 ? progress >= 0.12 : i === 1 ? progress >= 0.36 : progress >= 0.60;
            const isRevealed = revealedMilestones[i];
            return (
              <div
                className={`milestone${m.isNow ? ' now' : ''}${isActive ? ' active' : ''}${isRevealed ? ' revealed' : ''}`}
                key={m.year}
                ref={(el) => setMilestoneRef(el, i)}
                style={{ '--reveal-delay': `${0.1 + i * 0.1}s` }}
                data-accent-color={m.rgb}
                data-index={i}
              >
                <div className="milestone-dot" />
                <div className="milestone-card">
                  <div className="milestone-year">{m.year}</div>
                  <div className="milestone-headline">{m.headline}</div>
                  <div className="milestone-industry">{m.industry}</div>
                  <p className="milestone-desc">{m.description}</p>
                  <span className="milestone-keyword">{m.keyword}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Base 강등 착지 — 메이커십 각주(오픈소스 증거): 이 사이트조차 기획자가 AI로 직접 빌드 */}
        <div className="journey-maker-note">
            {/* 설명 문단을 걷었다 — "소스가 공개돼 있다"는 링크 문구가 이미 말하는 것이라
                한 줄을 더 읽히게 할 이유가 없었다(2026-11-04 오너 판단). */}
          <a
            href="https://github.com/matthewshim/PriSincera"
            target="_blank"
            rel="noopener noreferrer"
            className="maker-note-link"
          >
            {t('home.serviceBaseCta')}
            <Icon name="external" size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
