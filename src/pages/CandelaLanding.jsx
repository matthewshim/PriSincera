import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../contexts/LanguageContext';
import './CandelaLanding.css';

/**
 * Candela 서비스 소개 랜딩 (/candela).
 *
 * 실서비스(실적) 전 "소개" 단계 페이지 — 날조 데이터 없음, 아키텍처 서사 중심.
 * 규범: docs/candela/ui_specification.md §2 (소개 랜딩 선공개) · design_system §9-1
 * 운영 세부 비노출: security_spec N-9 (역할 일반명만, 경로·명령·인프라 미표기).
 * 데이터 라우트(/candela/performance·/journal)는 실운용 후(P5) 별도 등록 — G-2가 강제.
 */
export default function CandelaLanding() {
  const { t } = useTranslation();

  useSEO({
    title: t('candela.seo.title'),
    description: t('candela.seo.description'),
    ogUrl: 'https://www.prisincera.com/candela',
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  const principleCount = 6;

  return (
    <div className="cdl-page">
      <header className="cdl-hero">
        <div className="cdl-hero-icon" aria-hidden="true">🕯️</div>
        <h1 className="cdl-hero-title">Candela</h1>
        <p className="cdl-hero-sub">{t('candela.hero.sub')}</p>
        <div className="cdl-status">🚧 {t('candela.hero.status')}</div>
      </header>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.duo.heading')}</h2>
        <div className="cdl-duo">
          <article className="cdl-card">
            <span className="cdl-tag cdl-tag-core">{t('candela.duo.coreTag')}</span>
            <h3 className="cdl-card-title">{t('candela.duo.coreTitle')}</h3>
            <p className="cdl-card-body">{t('candela.duo.coreBody')}</p>
          </article>
          <article className="cdl-card">
            <span className="cdl-tag cdl-tag-web">{t('candela.duo.webTag')}</span>
            <h3 className="cdl-card-title">{t('candela.duo.webTitle')}</h3>
            <p className="cdl-card-body">{t('candela.duo.webBody')}</p>
          </article>
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.features.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.features.desc')}</p>
        <div className="cdl-features">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="cdl-feature" key={i}>
              <h3 className="cdl-feature-title">{t(`candela.features.items.${i}.t`)}</h3>
              <p className="cdl-feature-desc">{t(`candela.features.items.${i}.d`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cdl-section">
        <div className="cdl-sec-headrow">
          <h2 className="cdl-sec-title">{t('candela.preview.heading')}</h2>
          <span className="cdl-badge">{t('candela.preview.badge')}</span>
        </div>
        <p className="cdl-sec-desc">{t('candela.preview.desc')}</p>
        <div className="cdl-card cdl-preview">
          <div className="cdl-preview-chart">
            <svg viewBox="0 0 600 170" className="cdl-preview-svg" role="img" aria-label={t('candela.preview.curveLabel')}>
              <line x1="0" y1="150" x2="600" y2="150" stroke="currentColor" strokeOpacity="0.08" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" strokeOpacity="0.08" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="currentColor" strokeOpacity="0.08" />
              <polyline points="0,150 75,146 150,148 225,138 300,142 375,130 450,133 525,122 600,116" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />
              <polyline points="0,152 75,138 150,120 225,128 300,96 375,106 450,70 525,60 600,40" fill="none" stroke="var(--color-gold)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="cdl-preview-chart-label">{t('candela.preview.curveLabel')}</span>
          </div>
          <div className="cdl-preview-metrics">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="cdl-preview-metric" key={i}>
                <span className="cdl-preview-metric-k">{t(`candela.preview.metrics.${i}`)}</span>
                <span className="cdl-preview-metric-v">&mdash;</span>
              </div>
            ))}
          </div>
          <p className="cdl-preview-note">{t('candela.preview.note')}</p>
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.arch.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.arch.desc')}</p>
        <div className="cdl-diagram">
          <svg className="cdl-svg" viewBox="0 0 720 580" role="img" aria-label={t('candela.arch.caption')}>
            <defs>
              <marker id="cdlAh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
              </marker>
            </defs>

            {/* Tier 1 · Public Web */}
            <rect x="60" y="40" width="330" height="76" rx="12" fill="rgba(165,180,252,0.06)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="80" y="72" fontSize="13" fontWeight="600" fill="currentColor">{t('candela.arch.t1name')}</text>
            <text x="80" y="96" fontSize="11" fill="currentColor" opacity="0.7">{t('candela.arch.t1note')}</text>

            {/* Results store */}
            <rect x="505" y="150" width="155" height="72" rx="12" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="582" y="192" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.store')}</text>

            {/* Tier 2 · Console */}
            <rect x="60" y="234" width="330" height="76" rx="12" fill="rgba(165,180,252,0.06)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="80" y="266" fontSize="13" fontWeight="600" fill="currentColor">{t('candela.arch.t2name')}</text>
            <text x="80" y="290" fontSize="11" fill="currentColor" opacity="0.7">{t('candela.arch.t2note')}</text>

            {/* Command queue */}
            <rect x="95" y="340" width="260" height="44" rx="10" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="225" y="367" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.queue')}</text>

            {/* Trust boundary */}
            <line x1="36" y1="418" x2="684" y2="418" stroke="#E5B25D" strokeWidth="1.4" strokeDasharray="6 5" opacity="0.85" />
            <text x="40" y="410" fontSize="10.5" fill="#E5B25D">{t('candela.arch.boundary')}</text>

            {/* Tier 3 · Worker */}
            <rect x="60" y="446" width="330" height="92" rx="12" fill="rgba(229,178,93,0.05)" stroke="#E5B25D" strokeOpacity="0.55" />
            <text x="80" y="478" fontSize="13" fontWeight="600" fill="currentColor">{t('candela.arch.t3name')}</text>
            <text x="80" y="502" fontSize="11" fill="currentColor" opacity="0.75">{t('candela.arch.t3note')}</text>

            {/* Brokerage */}
            <rect x="505" y="462" width="155" height="60" rx="12" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="582" y="490" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.broker')}</text>
            <text x="582" y="509" fontSize="10.5" fill="currentColor" textAnchor="middle" opacity="0.65">{t('candela.arch.arrOrder')}</text>

            {/* Arrows — 모두 워커에서 나가는 방향(인바운드 없음) */}
            <line x1="225" y1="310" x2="225" y2="340" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAh)" />
            <text x="235" y="330" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.arrCmd')}</text>

            <line x1="150" y1="446" x2="150" y2="386" stroke="currentColor" strokeOpacity="0.6" strokeDasharray="4 3" markerEnd="url(#cdlAh)" />
            <text x="60" y="434" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.arrPoll')}</text>

            <line x1="360" y1="450" x2="553" y2="222" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAh)" />
            <text x="452" y="342" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.arrSnap')}</text>

            <line x1="553" y1="152" x2="392" y2="90" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAh)" />
            <text x="450" y="114" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.arrRead')}</text>

            <line x1="390" y1="492" x2="505" y2="492" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAh)" />
          </svg>

          <svg className="cdl-svg-mobile" viewBox="0 0 360 720" role="img" aria-label={t('candela.arch.caption')}>
            <defs>
              <marker id="cdlAhM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
              </marker>
            </defs>

            {/* Tier 1 Public */}
            <rect x="14" y="16" width="272" height="50" rx="11" fill="rgba(165,180,252,0.06)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="28" y="41" fontSize="12.5" fontWeight="600" fill="currentColor">{t('candela.arch.t1name')}</text>
            <text x="28" y="60" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.t1note')}</text>

            {/* Results store */}
            <rect x="14" y="100" width="196" height="42" rx="10" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="112" y="126" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.store')}</text>

            {/* Tier 2 Console */}
            <rect x="14" y="176" width="272" height="50" rx="11" fill="rgba(165,180,252,0.06)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="28" y="201" fontSize="12.5" fontWeight="600" fill="currentColor">{t('candela.arch.t2name')}</text>
            <text x="28" y="220" fontSize="10" fill="currentColor" opacity="0.7">{t('candela.arch.t2note')}</text>

            {/* Command queue */}
            <rect x="14" y="260" width="196" height="42" rx="10" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="112" y="286" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.queue')}</text>

            {/* Trust boundary */}
            <line x1="8" y1="324" x2="352" y2="324" stroke="#E5B25D" strokeWidth="1.4" strokeDasharray="6 5" opacity="0.85" />
            <text x="12" y="317" fontSize="9.5" fill="#E5B25D">{t('candela.arch.boundary')}</text>

            {/* Tier 3 Worker */}
            <rect x="14" y="342" width="272" height="60" rx="11" fill="rgba(229,178,93,0.05)" stroke="#E5B25D" strokeOpacity="0.55" />
            <text x="28" y="368" fontSize="12.5" fontWeight="600" fill="currentColor">{t('candela.arch.t3name')}</text>
            <text x="28" y="388" fontSize="10" fill="currentColor" opacity="0.75">{t('candela.arch.t3note')}</text>

            {/* Brokerage */}
            <rect x="14" y="426" width="196" height="42" rx="10" fill="rgba(255,255,255,0.03)" stroke="currentColor" strokeOpacity="0.28" />
            <text x="112" y="452" fontSize="12" fontWeight="600" fill="currentColor" textAnchor="middle">{t('candela.arch.broker')}</text>

            {/* Arrows — 모두 워커에서 나가는 방향 */}
            <line x1="100" y1="226" x2="100" y2="260" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAhM)" />
            <text x="106" y="249" fontSize="9" fill="currentColor" opacity="0.7">{t('candela.arch.arrCmd')}</text>

            <line x1="60" y1="342" x2="60" y2="302" stroke="currentColor" strokeOpacity="0.6" strokeDasharray="4 3" markerEnd="url(#cdlAhM)" />
            <text x="26" y="336" fontSize="9" fill="currentColor" opacity="0.7">{t('candela.arch.arrPoll')}</text>

            <line x1="112" y1="100" x2="112" y2="66" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAhM)" />
            <text x="118" y="89" fontSize="9" fill="currentColor" opacity="0.7">{t('candela.arch.arrRead')}</text>

            <line x1="100" y1="402" x2="100" y2="426" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAhM)" />
            <text x="106" y="420" fontSize="9" fill="currentColor" opacity="0.7">{t('candela.arch.arrOrder')}</text>

            <polyline points="250,350 322,350 322,121 210,121" fill="none" stroke="currentColor" strokeOpacity="0.6" markerEnd="url(#cdlAhM)" />
            <text transform="rotate(-90 332 236)" x="332" y="236" fontSize="9" fill="currentColor" opacity="0.7" textAnchor="middle">{t('candela.arch.arrSnap')}</text>
          </svg>
        </div>
        <p className="cdl-caption">{t('candela.arch.caption')}</p>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.control.heading')}</h2>
        <div className="cdl-card">
          <p className="cdl-control-body">{t('candela.control.body')}</p>
          <p className="cdl-control-note">{t('candela.control.note')}</p>
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.principles.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.principles.desc')}</p>
        <div className="cdl-principles">
          {Array.from({ length: principleCount }).map((_, i) => (
            <span className="cdl-principle" key={i}>{t(`candela.principles.items.${i}`)}</span>
          ))}
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.roadmap.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.roadmap.desc')}</p>
        <ol className="cdl-roadmap">
          {Array.from({ length: 5 }).map((_, i) => (
            <li className={`cdl-step${i === 0 ? ' cdl-step-now' : ''}`} key={i}>
              <span className="cdl-step-dot" aria-hidden="true" />
              <div className="cdl-step-body">
                <div className="cdl-step-titlerow">
                  <h3 className="cdl-step-title">{t(`candela.roadmap.steps.${i}.t`)}</h3>
                  {i === 0 && <span className="cdl-step-nowtag">{t('candela.roadmap.now')}</span>}
                </div>
                <p className="cdl-step-desc">{t(`candela.roadmap.steps.${i}.d`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.faq.heading')}</h2>
        <div className="cdl-faq">
          {Array.from({ length: 5 }).map((_, i) => (
            <details className="cdl-faq-item" key={i}>
              <summary className="cdl-faq-q">{t(`candela.faq.items.${i}.q`)}</summary>
              <p className="cdl-faq-a">{t(`candela.faq.items.${i}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cdl-section">
        <div className="cdl-cta">
          <h2 className="cdl-cta-title">{t('candela.cta.heading')}</h2>
          <p className="cdl-cta-desc">{t('candela.cta.desc')}</p>
          <Link to="/builders-log" className="cdl-cta-btn">{t('candela.cta.button')} &rarr;</Link>
        </div>
      </section>

      <footer className="cdl-foot">{t('candela.footer')}</footer>
    </div>
  );
}
