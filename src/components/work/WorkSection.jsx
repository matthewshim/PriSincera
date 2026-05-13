import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import './WorkSection.css';

export default function WorkSection() {
  const sectionRef = useScrollReveal({ threshold: 0.08 });

  return (
    <section className="work reveal-section" id="work" ref={sectionRef}>
      <div className="work-container">
        <div className="section-label">Services</div>

        <div className="work-header reveal-item" style={{ '--reveal-delay': '0.1s' }}>
          <h2 className="work-title">
            단순한 포트폴리오를 넘어<br />
            <span className="accent">성장을 돕는 도구로</span>
          </h2>
          <p className="work-subtitle">
            기획에서 개발까지, 유저의 실질적인 성장을 돕기 위해 만든 서비스들입니다.
          </p>
        </div>

        {/* 1. Daily Digest Flagship */}
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.2s', '--glow-color': 'rgba(34, 211, 238, 0.4)' }}>
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: 'var(--orbit-cyan)' }}>Daily Curation & Learning</div>
            <h3 className="flagship-title">Daily Digest</h3>
            <p className="flagship-desc">
              하루 5분, IT 트렌드 인사이트와 AI 프롬프트, 비즈니스 일본어 학습까지.<br />
              정보의 홍수 속에서 꼭 필요한 시그널만 모아 매일 아침 전해드립니다.
            </p>
            <div className="work-card-tags">
              <span className="work-tag">AI Curation</span>
              <span className="work-tag">Microlearning</span>
              <span className="work-tag">Newsletter</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/daily" className="flagship-cta-btn">
                ✨ 하루 5분, 다이제스트 무료 구독
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

        {/* 2. Pace Note Flagship */}
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.3s', '--glow-color': 'rgba(52, 211, 153, 0.4)' }}>
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#34D399' }}>Action & Branding</div>
            <h3 className="flagship-title">Pace Note</h3>
            <p className="flagship-desc">
              조급함을 덜어주고 나만의 궤도를 만들어가는 마이크로 행동 트래커.<br />
              매일의 작은 인사이트를 실천 과제로 만들고, 흔들림 없는 성장을 기록하세요.
            </p>
            <div className="work-card-tags">
              <span className="work-tag">Action Tracker</span>
              <span className="work-tag">AI Guide</span>
              <span className="work-tag">Timeline</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/pacenote" className="flagship-cta-btn green">
                ⛵ 3초 만에 로그인하고 나만의 궤도 만들기
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

        {/* 3. PriSincera Foundation (Tone down) */}
        <div className="work-card foundation-card reveal-item" style={{ '--reveal-delay': '0.4s', marginTop: '40px' }}>
          <div className="work-card-body" style={{ width: '100%' }}>
            <div className="work-card-label">Platform Foundation</div>
            <div className="work-card-name" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              PriSincera Base
            </div>
            <p className="work-card-desc" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              이 플랫폼 자체가 "vibe coding"과 "기획자의 오너십"을 증명하는 결과물입니다.
            </p>
            <div className="work-card-tags">
              <span className="work-tag">React / Vite</span>
              <span className="work-tag">GCP Cloud Run</span>
              <span className="work-tag">Firebase</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
