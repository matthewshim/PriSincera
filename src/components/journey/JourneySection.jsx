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
/* 정거장 다섯 → 카드 셋. **순서대로, 겹치지 않게.**

   [왜 진입 1회 스윕을 버렸나] 지면의 활성화 규칙은 둘뿐이고 둘 다 **스크롤 위치가 곧
   상태**다 — 상단 Belief 카드는 뷰포트 중앙에 가장 가까운 카드가 켜지고 멀어지면 꺼지며,
   연대기 카드는 임계 대역을 오르내린다. 둘 다 올라가면 그대로 되돌아간다.
   정거장만 1회 재생 + 완료 상태 유지였다 — 한 지면에 규칙이 둘이었다(오너 결정 2026-11-10).
   되감기·재생 트리거를 따로 맞추느라 들였던 공(관찰자 둘, 띠, 타이머)은 전부 사라진다:
   스크롤 값 하나면 활성화와 리셋이 **같은 식에서 저절로 나온다.** */
/* 정거장 다섯과 카드 셋이 **하나의 진행값을 구간으로 나눠 쓴다.** 기준 요소는 `.timeline`.

   [왜 기준을 합쳤나] 구 구조는 정거장이 `.journey-stops`를, 카드가 `.timeline`을 각각
   쟀다. `useScrollProgress`는 **요소 자신의 높이와 위치**로 값을 내므로, 같은 임계값이
   두 블록에서 서로 다른 스크롤 지점을 가리킨다. 실측(2026-11-10 오너 지적 "겹치는 지점이 있다"):

     차이 = 두 블록 간격 + C1·(vh+Ht) − S5·(vh+Hs)   ← **뷰포트 높이에 선형으로 의존**
     vh  600 → 카드1이 정거장5보다  64px 먼저
     vh  900 →                    208px 먼저
     vh 1400 →                    448px 먼저 (카드1이 정거장 3번 앞으로 끼어든다)

   숫자만 맞추면 다른 화면 높이에서 다시 어긋난다. 한 요소를 기준으로 쓰면 순서가
   **산술로 보장된다** — 간격이나 높이가 바뀌어도 구간의 대소 관계는 그대로다. */
const STOP_AT = [0.02, 0.10, 0.18, 0.26, 0.34];
const CARD_AT = [0.38, 0.55, 0.72];

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

  /* ── 경험 5단 = 가로 5정거장 (오너 결정 2026-11-10) ──
     활성화는 **스크롤 위치가 쥔다.** 막대·점·본문이 전부 `stopFill`(0~1) 하나에서 나오고,
     올라가면 같은 식이 거꾸로 돌아 저절로 되감긴다 — 되감기용 장치가 따로 없다.
     [왜 이 방식인가] 지면의 활성화 규칙이 둘 다 이것이다: 상단 Belief 개념 카드는
     뷰포트 중앙에 가장 가까운 카드가 켜지고 멀어지면 꺼지며, 바로 아래 연대기 카드는
     `useScrollProgress` 임계 0.12/0.36/0.60을 오르내린다. 정거장만 "진입 1회 재생 후
     완료 유지"면 한 지면에 규칙이 둘이 된다(오너 지적).
     카드와 **같은 훅·같은 대역**을 쓴다 — 1·3·5번째 정거장이 카드 1·2·3번과 같은 지점에서
     켜진다. 구 구조(관찰자 둘·재생 띠·타이머 10여 개·linear() 이징)는 전부 사라졌다. */
  const expList = Array.isArray(exp) ? exp : [];
  const stopLast = expList.length - 1;
  /* 카드와 **같은 측정값**을 쓴다 — 기준이 하나라 두 블록이 어긋날 수 없다 */
  const [sectionRef, progress] = useScrollProgress();
  /* 호버는 스크롤을 **일시적으로** 덮는다. 손을 떼면 스크롤이 다시 가져간다. */
  const [hoverStop, setHoverStop] = useState(null);

  /* 막대 폭과 점 점등을 **한 배열에서** 낸다. 구 구조는 막대가 선형 보간,
     점이 `floor(fill * stopLast)`로 각각 계산해서 STOP_AT이 고르지 않게 바뀌는 순간
     조용히 어긋났다 — 지금은 고르지만, 어긋나는 쪽으로 고칠 수 있는 코드를 남기지 않는다. */
  const stopEnd = Math.min(stopLast, STOP_AT.length - 1);
  let stopReached = -1;
  for (let i = 0; i <= stopEnd; i += 1) {
    if (progress >= STOP_AT[i]) stopReached = i;
  }
  /* 막대는 **점 단위로만** 선다. 구 구조는 정거장 사이를 선형으로 메워서, 스크롤 중간이면
     막대 끝이 점과 점 사이 허공에 떠 있었다 — 점·제목·본문은 전부 이산인데 막대만 연속이라
     "어디까지 켜진 건지" 모호했다(2026-11-10 오너 지적).
     이제 폭이 0 / 0.25 / 0.5 / 0.75 / 1 다섯 값만 갖고, 사이는 CSS 전이가 메운다 —
     막대가 **다음 점까지 건너가는 동작**이 되고, 멈춘 자리는 항상 점 위다. */
  const stopFill = stopEnd > 0 && stopReached > 0 ? stopReached / stopEnd : 0;
  const stopActive = hoverStop !== null ? hoverStop : Math.max(stopReached, 0);
  const stopsLive = stopReached >= 0 || hoverStop !== null;

  const onStopKey = useCallback((e) => {
    if (stopLast < 1) return;
    const n = stopLast + 1;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (stopActive + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (stopActive - 1 + n) % n;
    if (next === null) return;
    e.preventDefault();
    setHoverStop(next);
    document.getElementById(`journey-stop-${next}`)?.focus();
  }, [stopActive, stopLast]);

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
            검증이 필요한 사람은 끝의 LinkedIn 링크로 간다. 정본: main_page_revision_plan §12-4.
            다섯 본문을 **전부 DOM에 남긴다** — 크롤러와 SSR 폴백이 경력 483자를 그대로 읽는다. */}
        <div
          className={`journey-stops${stopsLive ? ' is-live' : ''}`}
          style={{ '--stops-fill': stopFill }}
        >
          <div className="journey-stops-rail">
            <span className="journey-stops-prog" aria-hidden="true" />
            {/* 섹션 아이브로우와 같은 말을 쓴다 — eyebrow는 번역하지 않는 분류 신호다(§9-15).
                  '전체 경력은 LinkedIn에서'를 라벨로 쓰면 스크린리더에 링크처럼 들린다. */}
            <div
              className="journey-stops-track"
              role="tablist"
              aria-label="Journey"
              onMouseLeave={() => setHoverStop(null)}
            >
              {expList.map((e, i) => (
                <button
                  type="button"
                  className="journey-stop"
                  key={e.years}
                  id={`journey-stop-${i}`}
                  role="tab"
                  aria-selected={stopActive === i}
                  aria-controls={`journey-stop-panel-${i}`}
                  tabIndex={stopActive === i ? 0 : -1}
                  data-state={stopsLive && stopActive === i ? 'on' : (i <= stopReached ? 'done' : 'off')}
                  onMouseEnter={() => setHoverStop(i)}
                  onClick={() => setHoverStop(i)}
                  onKeyDown={onStopKey}
                >
                  <span className="journey-stop-dot" aria-hidden="true" />
                  <span className="journey-stop-years">{e.years}</span>
                  <span className="journey-stop-title">{e.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div
            className="journey-stop-panels"
            data-last={stopActive === stopLast ? 'true' : 'false'}
          >
            {expList.map((e, i) => (
              <div
                className={`journey-stop-panel${stopsLive && stopActive === i ? ' is-on' : ''}`}
                key={e.years}
                id={`journey-stop-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`journey-stop-${i}`}
                aria-hidden={stopActive === i ? undefined : 'true'}
              >
                <p className="journey-stop-did">{e.did}</p>
                <p className="journey-stop-learned">{e.learned}</p>
              </div>
            ))}
          </div>
        </div>
        <a
          className="exp-more"
          href="https://www.linkedin.com/in/shimks"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('home.experienceMore')}
          <Icon name="external" size={13} />
        </a>

        {/* `--scroll-progress` 인라인 style은 걷었다 — 유일한 소비자였던 진행선을
            지웠다(위 CSS 주석). `progress`는 아래 `isActive` 판정에 그대로 쓰인다. */}
        <div className="timeline" ref={sectionRef}>
          {MILESTONES.map((m, i) => {
            /* 정거장이 모두 켜진 뒤(STOP_AT의 끝 0.34)에 시작한다 — 같은 진행값이라 어긋날 수 없다 */
            const isActive = progress >= (CARD_AT[i] ?? 1);
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
