import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import './WorkSection.css';

export default function WorkSection() {
  const { t } = useTranslation();
  const sectionRef = useScrollReveal({ threshold: 0.08 });



  return (
    <section className="work reveal-section" id="work" ref={sectionRef}>
      <div className="work-container">
        <div className="section-label">Services</div>

        <div className="work-header reveal-item" style={{ '--reveal-delay': '0.1s' }}>
          <h2 className="work-title">
            {t('home.servicesTitle')}<br />
            <span className="accent">{t('home.servicesTitleAccent')}</span>
          </h2>
          <p className="work-subtitle">
            {t('home.servicesSubtitle').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="work-grid">
        {/* 1. PriSincera Base Flagship (Core Foundation) */}
        <div
          className="flagship-card reveal-item flagship-glow"
          style={{ '--reveal-delay': '0.2s', '--glow-color': 'rgba(245, 158, 11, 0.4)' }}
          data-accent-color="245,158,11"
        >
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#F59E0B' }}>Platform Foundation & Core Infrastructure</div>
            <h3 className="flagship-title">PriSincera Base</h3>
            <p className="flagship-desc">
              {t('home.serviceBaseDesc').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className="work-card-tags">
              <span className="work-tag">React / Vite</span>
              <span className="work-tag">GCP Cloud Run</span>
              <span className="work-tag">Firebase Core</span>
              <span className="work-tag">AI Pair Programmed</span>
            </div>
            <div className="flagship-cta-wrap">
              <a href="https://github.com/matthewshim/PriSincera" target="_blank" rel="noopener noreferrer" className="btn-primary flagship-cta-btn amber">
                {t('home.serviceBaseCta')}
              </a>
            </div>
          </div>
          <div className="flagship-visual">
            <div className="dynamic-mockup base-mockup">
              <div className="base-engine-container">
                <div className="prism-core">
                  <div className="prism-face front"></div>
                  <div className="prism-face back"></div>
                  <div className="prism-face left"></div>
                  <div className="prism-face right"></div>
                  <div className="prism-face top"></div>
                  <div className="prism-face bottom"></div>
                </div>
                <div className="engine-ring ring-x"></div>
                <div className="engine-ring ring-y"></div>
                <div className="engine-ring ring-z"></div>
              </div>
              <div className="base-terminal">
                <div className="terminal-header">
                  <span className="terminal-title">core-engine.log</span>
                  <span className="terminal-status active">RUNNING</span>
                </div>
                <div className="terminal-lines">
                  <div className="terminal-line">&gt; Client: React 18 + Vite Success</div>
                  <div className="terminal-line">&gt; Cloud Run: Container Active [100%]</div>
                  <div className="terminal-line">&gt; Auth &amp; DB: Firebase Isolated Secure</div>
                </div>
              </div>
            </div>
            <div className="visual-blur-orb amber"></div>
          </div>
        </div>

        {/* 2. Builder's Log Flagship */}
        <div
          className="flagship-card reveal-item flagship-glow"
          style={{ '--reveal-delay': '0.3s', '--glow-color': 'rgba(124, 58, 237, 0.4)' }}
          data-accent-color="124,58,237"
        >
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#8B5CF6' }}>Engineering & Growth Logs</div>
            <h3 className="flagship-title">Builder's Log</h3>
            <p className="flagship-desc">
              {t('home.serviceBuildersDesc').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className="work-card-tags">
              <span className="work-tag">Tech Blog</span>
              <span className="work-tag">Architecture</span>
              <span className="work-tag">Troubleshooting</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/builders-log" className="btn-primary flagship-cta-btn indigo">
                {t('home.serviceBuildersCta')}
              </Link>
            </div>
          </div>
          <div className="flagship-visual">
            <div className="dynamic-mockup builderslog-mockup">
              <div className="mockup-timeline">
                <div className="timeline-line"></div>
                <div className="timeline-node active">
                  <div className="node-dot"></div>
                  <div className="node-info">
                    <div className="node-title">Admin Integration</div>
                    <div className="node-meta">Chapter 3 · May 20</div>
                  </div>
                </div>
                <div className="timeline-node">
                  <div className="node-dot"></div>
                  <div className="node-info">
                    <div className="node-title">Auth Session Isolation</div>
                    <div className="node-meta">Chapter 2 · May 18</div>
                  </div>
                </div>
                <div className="timeline-node">
                  <div className="node-dot"></div>
                  <div className="node-info">
                    <div className="node-title">Pace Note Architecture</div>
                    <div className="node-meta">Chapter 1 · May 15</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="visual-blur-orb indigo"></div>
          </div>
        </div>

        {/* 3. Daily Digest Flagship */}
        <div
          className="flagship-card reveal-item flagship-glow"
          style={{ '--reveal-delay': '0.4s', '--glow-color': 'rgba(34, 211, 238, 0.4)' }}
          data-accent-color="34,211,238"
        >
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: 'var(--orbit-cyan)' }}>Daily Curation & Learning</div>
            <h3 className="flagship-title">Daily Digest</h3>
            <p className="flagship-desc">
              {t('home.serviceDailyDesc').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className="work-card-tags">
              <span className="work-tag">AI Curation</span>
              <span className="work-tag">Microlearning</span>
              <span className="work-tag">Newsletter</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/daily" className="btn-primary flagship-cta-btn cyan">
                {t('home.serviceDailyCta')}
              </Link>
            </div>
          </div>
          <div className="flagship-visual">
            <div className="dynamic-mockup daily-mockup">
              <div className="mockup-header">
                <div className="mockup-dot"></div><div className="mockup-dot"></div><div className="mockup-dot"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-skeleton-title"></div>
                <div className="mockup-skeleton-text"></div>
                <div className="mockup-skeleton-text short"></div>
                <div className="mockup-ai-card">
                  <span className="ai-spark">✨</span>
                  <div className="ai-lines">
                    <div className="ai-line"></div>
                    <div className="ai-line"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="visual-blur-orb cyan"></div>
          </div>
        </div>

        {/* 4. Pace Note Flagship */}
        <div
          className="flagship-card reveal-item flagship-glow"
          style={{ '--reveal-delay': '0.5s', '--glow-color': 'rgba(52, 211, 153, 0.4)' }}
          data-accent-color="52,211,153"
        >
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#34D399' }}>Action & Branding</div>
            <h3 className="flagship-title">Pace Note</h3>
            <p className="flagship-desc">
              {t('home.servicePaceDesc').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className="work-card-tags">
              <span className="work-tag">Action Tracker</span>
              <span className="work-tag">AI Guide</span>
              <span className="work-tag">Timeline</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/pacenote" className="btn-primary flagship-cta-btn green">
                {t('home.servicePaceCta')}
              </Link>
            </div>
          </div>
          <div className="flagship-visual">
            <div className="dynamic-mockup pacenote-mockup">
              <div className="pacenote-grid">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`pace-cell ${[5,6,12,14,18].includes(i) ? 'active' : ''} ${i === 14 ? 'pulse' : ''}`}></div>
                ))}
              </div>
              <div className="pace-floating-card">
                <div className="pace-check">✓</div>
                <div className="pace-card-lines">
                  <div className="pace-line"></div>
                  <div className="pace-line"></div>
                </div>
              </div>
            </div>
            <div className="visual-blur-orb emerald"></div>
          </div>
        </div>

        {/* 5. Sylphio Flagship */}
        <div
          className="flagship-card reveal-item flagship-glow"
          style={{ '--reveal-delay': '0.6s', '--glow-color': 'rgba(0, 242, 254, 0.4)' }}
          data-accent-color="0,242,254"
        >
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#00F2FE' }}>On-Device AI Translation</div>
            <h3 className="flagship-title">Sylphio</h3>
            <p className="flagship-desc">
              {t('home.serviceSylphioDesc').split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
            <div className="work-card-tags">
              <span className="work-tag">On-Device AI</span>
              <span className="work-tag">Real-Time STT</span>
              <span className="work-tag">macOS Native</span>
              <span className="work-tag">Secure Keychain</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/sylphio" className="btn-primary flagship-cta-btn blue">
                {t('home.serviceSylphioCta')}
              </Link>
            </div>
          </div>
          <div className="flagship-visual">
            <div className="dynamic-mockup sylphio-mockup">
              <div className="sylphio-bento-core">
                <div className="sylphio-bento-pulse"></div>
              </div>
            </div>
            <div className="visual-blur-orb blue"></div>
          </div>
        </div>
        </div>

      </div>
    </section>
  );
}
