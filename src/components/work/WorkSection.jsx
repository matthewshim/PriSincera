import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import SubscribeForm from '../prisignal/SubscribeForm';
import '../prisignal/SubscribeForm.css';
import './WorkSection.css';

/**
 * Work Section — Project showcase.
 * Displays PriSincera as a featured project card + PriSignal subscribe banner.
 * Follows the same glassmorphic container pattern as Belief/Journey sections.
 */
export default function WorkSection() {
  const sectionRef = useScrollReveal({ threshold: 0.08 });

  return (
    <section className="work reveal-section" id="work" ref={sectionRef}>
      <div className="work-container">
        <div className="section-label">Work</div>

        <div className="work-header reveal-item" style={{ '--reveal-delay': '0.1s' }}>
          <h2 className="work-title">
            말보다 <span className="accent">만든 것으로</span>
          </h2>
          <p className="work-subtitle">
            직접 기획하고, 직접 만듭니다.
          </p>
        </div>

        <div className="work-grid">
          {/* PriSincera — Featured Project */}
          <div className="work-card featured reveal-item" style={{ '--reveal-delay': '0.2s' }}>
            <div className="work-card-icon">
              <svg viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="20" fill="none" stroke="url(#g-orbit-work)" strokeWidth="1"
                        strokeDasharray="120 6" strokeLinecap="round" className="orbit-ring orbit-spin-slow"/>
                <path d="M22 38 L8 14 L36 14 Z" fill="url(#g-down-work)" stroke="url(#g-edge-work)" strokeWidth="0.8" strokeLinejoin="round"/>
                <path d="M22 6 L36 30 L8 30 Z" fill="url(#g-up-work)" stroke="url(#g-edge-work)" strokeWidth="0.8" strokeLinejoin="round"/>
                <circle cx="22" cy="22" r="1.5" fill="#FFFFFF" opacity="0.9"/>
                <defs>
                  <linearGradient id="g-up-work" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85"/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                  </linearGradient>
                  <linearGradient id="g-down-work" x1="50%" y1="100%" x2="50%" y2="0%">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.75"/>
                    <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2"/>
                  </linearGradient>
                  <linearGradient id="g-edge-work" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                  </linearGradient>
                  <linearGradient id="g-orbit-work" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.7"/>
                    <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="work-card-body">
              <div className="work-card-label">Personal Branding</div>
              <div className="work-card-name">
                PriSincera
                <span className="work-card-tag">prisincera.com</span>
              </div>
              <p className="work-card-desc">
                이 사이트 자체가 브랜딩 결과물입니다.<br />
                기획부터 디자인, 개발, 배포까지 — 20년 경험의 태도와 철학을 담아
                직접 만든 퍼스널 브랜딩 사이트.
              </p>
              <div className="work-card-tags">
                <span className="work-tag">React</span>
                <span className="work-tag">Vite</span>
                <span className="work-tag">Canvas</span>
                <span className="work-tag">GCP Cloud Run</span>
                <span className="work-tag">Vibe Coding</span>
              </div>
            </div>
          </div>
        </div>

        {/* PriSignal — Subscribe Banner */}
        <div className="prisignal-banner reveal-item" style={{ '--reveal-delay': '0.35s' }}>
          <div className="prisignal-banner-header">
            <span className="prisignal-banner-icon">📡</span>
            <div className="prisignal-banner-title-wrap">
              <div className="prisignal-banner-name">PriSignal</div>
              <p className="prisignal-banner-desc">
                노이즈 속에서 시그널을 포착합니다.
              </p>
            </div>
          </div>
          <SubscribeForm variant="inline" />
          <Link to="/prisignal" className="prisignal-detail-link" id="priSignalDetailLink">
            자세히 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

