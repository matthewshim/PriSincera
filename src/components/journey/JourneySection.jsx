import { useEffect, useRef, useState, useCallback } from 'react';
import './JourneySection.css';

/**
 * Journey Section — career timeline with scroll-triggered milestones.
 * Dates verified against LinkedIn profile (shimks).
 * Company names replaced with industry/sector labels per user request.
 */

const MILESTONES = [
  {
    year: 'Past',
    headline: '경험의 축적',
    industry: '20 Years of IT',
    description: '웹 기획부터 글로벌 서비스 리딩까지. 수많은 프로젝트 속에서 "변하지 않는 본질과 태도"의 중요성을 배웠습니다.',
    keyword: 'Experience',
  },
  {
    year: 'Shift',
    headline: 'AI와의 조우',
    industry: 'Vibe Coding',
    description: '기술의 장벽이 무너지고 있습니다. 기획자의 오너십과 AI가 만나, 머릿속 아이디어를 직접 실현하는 메이커의 시대를 맞이했습니다.',
    keyword: 'Innovation',
  },
  {
    year: 'Now',
    headline: '성장을 돕는 도구로',
    industry: 'PriSincera',
    description: '20년의 경험과 AI 기술이 결합되어, 이제는 당신의 일상과 성장을 직접적으로 돕는 실질적인 웹 서비스로 탄생했습니다.',
    keyword: 'Service',
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
            20년의 IT 경험이 AI 기술을 만나,<br />
            당신의 성장을 돕는 도구로 탄생했습니다.
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
