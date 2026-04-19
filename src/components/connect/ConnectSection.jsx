import useScrollReveal from '../../hooks/useScrollReveal';
import './ConnectSection.css';

/**
 * Connect Section — Conversation invitation, not a sales pitch.
 * LinkedIn + Email CTA buttons with gradient glow background.
 */
export default function ConnectSection() {
  const sectionRef = useScrollReveal({ threshold: 0.12 });

  return (
    <section className="connect reveal-section" id="connect" ref={sectionRef}>
      <div className="connect-container">
        <div className="section-label">Connect</div>

        <div className="connect-content">
          <h2 className="connect-title reveal-item" style={{ '--reveal-delay': '0.1s' }}>
            함께 <span className="accent">이야기합시다.</span>
          </h2>
          <p className="connect-subtitle reveal-item" style={{ '--reveal-delay': '0.2s' }}>
            비즈니스든, 커리어든, 태도에 대한 것이든 —<br />
            편하게 연결해 주세요.
          </p>

          <div className="connect-cta reveal-item" style={{ '--reveal-delay': '0.35s' }}>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/shimks"
              target="_blank"
              rel="noopener noreferrer"
              className="connect-btn primary"
              id="connectLinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>

            {/* Email */}
            <a
              href="mailto:matthew.shim@prisincera.com"
              className="connect-btn secondary"
              id="connectEmail"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
