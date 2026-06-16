import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import './JourneySection.css';

/**
 * Journey Section — career timeline with scroll-triggered milestones.
 * Dates verified against LinkedIn profile (shimks).
 * Company names replaced with industry/sector labels per user request.
 */

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
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const milestonesRef = useRef([]);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

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
            entry.target.classList.add('revealed');
            
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
            {t('home.journeyTitle')}<span className="accent">{t('home.journeyTitleAccent')}</span>
          </h2>
          <p className="journey-subtitle">
            {t('home.journeySubtitle').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
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
              style={{ '--reveal-delay': `${0.1 + i * 0.1}s` }}
              data-accent-color={m.rgb}
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
