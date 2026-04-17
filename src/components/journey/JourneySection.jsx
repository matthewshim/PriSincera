import { useEffect, useRef, useState, useCallback } from 'react';
import './JourneySection.css';

/**
 * Journey Section — career timeline with scroll-triggered milestones.
 * Dates verified against LinkedIn profile (shimks).
 * Company names replaced with industry/sector labels per user request.
 */

const MILESTONES = [
  {
    year: '2004',
    headline: '성실함으로 시작하다',
    industry: '웹 에이전시',
    description: '인턴의 성실함이 정규직 제안으로. 웹 기획의 첫 걸음.',
    keyword: 'Sincerity',
  },
  {
    year: '2007',
    headline: '게임 산업으로 도약',
    industry: '온라인 게임',
    description: '기획자에서 PM으로. 라이브 서비스 운영의 오너십을 체득하다.',
    keyword: 'Ownership',
  },
  {
    year: '2012',
    headline: '복잡함을 조율하다',
    industry: 'IT 서비스',
    description: '본사와 자회사 사이, 흩어진 요구사항을 하나로 정돈하는 가교 역할.',
    keyword: 'Communication',
  },
  {
    year: '2013',
    headline: '최전선에서 소통하다',
    industry: '디지털 에이전시',
    description: 'C-Level 고객과 직접 마주하며, 전략적 마케팅 기획을 주도.',
    keyword: 'Challenge',
  },
  {
    year: '2014',
    headline: '전략적 파트너가 되다',
    industry: 'HR 플랫폼',
    description: '7년간 경영진의 비전을 프로덕트로 실현. 서비스 기획 총괄.',
    keyword: 'Leadership',
  },
  {
    year: '2022',
    headline: '글로벌을 리딩하다',
    industry: '글로벌 게임사',
    description: '웹서비스개발그룹장으로서 글로벌 서비스 전략 및 LATAM 진출을 주도.',
    keyword: 'Global',
  },
  {
    year: 'Now',
    headline: 'AI와 함께 새로운 장을 열다',
    industry: 'Vibe Studio',
    description: '바이브 코딩으로 프로덕트를 직접 제작. 기획자의 오너십이 AI를 만나다.',
    keyword: 'Innovation',
    isNow: true,
  },
];

const STATS = [
  { target: 20, suffix: '+', label: 'Years' },
  { target: 50, suffix: '+', label: 'Projects' },
  { target: 5, suffix: '+', label: 'Countries' },
];

/**
 * Animates a number from 0 to target over duration.
 */
function useCountUp(target, started, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    let raf;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, started, duration]);

  return value;
}

function StatItem({ target, suffix, label, started }) {
  const count = useCountUp(target, started);
  return (
    <div className="stat-item">
      <div className="stat-number">
        {count}<span className="stat-plus">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function JourneySection() {
  const sectionRef = useRef(null);
  const milestonesRef = useRef([]);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Observe individual milestones for staggered reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
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
    <section className="journey" id="journey" ref={sectionRef}>
      <div className="journey-container">
        <div className="section-label">Journey</div>

        <div className="journey-header">
          <h2 className="journey-title">
            기술은 변해도, <span className="accent">태도는 남습니다.</span>
          </h2>
          <p className="journey-subtitle">
            Waterfall에서 Agile로, 웹에서 AI로 —
            강산이 두 번 변하는 동안 변하지 않은 것.
          </p>
          <div className="journey-stats" ref={statsRef}>
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} started={statsVisible} />
            ))}
          </div>
        </div>

        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div
              className={`milestone${m.isNow ? ' now' : ''}`}
              key={m.year}
              ref={(el) => setMilestoneRef(el, i)}
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
          ))}
        </div>
      </div>
    </section>
  );
}
