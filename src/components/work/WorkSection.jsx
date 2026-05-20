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

        {/* 1. PriSincera Base Flagship (Core Foundation) */}
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.2s', '--glow-color': 'rgba(245, 158, 11, 0.4)' }}>
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#F59E0B' }}>Platform Foundation & Core Infrastructure</div>
            <h3 className="flagship-title">PriSincera Base</h3>
            <p className="flagship-desc">
              기획자의 온전한 오너십과 AI 페어 프로그래밍(Vibe Coding)의 시너지를 증명하는 초경량 엔지니어링 코어입니다.<br />
              React/Vite 클라이언트 아키텍처와 무중단 서버리스 GCP Cloud Run 컨테이너, 다중 Firebase 보안 인프라가 유기적으로 결합된 고성능 아키텍처의 결정체입니다.
            </p>
            <div className="work-card-tags">
              <span className="work-tag">React / Vite</span>
              <span className="work-tag">GCP Cloud Run</span>
              <span className="work-tag">Firebase Core</span>
              <span className="work-tag">AI Pair Programmed</span>
            </div>
            <div className="flagship-cta-wrap">
              <a href="https://github.com/matthewshim/PriSincera" target="_blank" rel="noopener noreferrer" className="flagship-cta-btn amber">
                ⚡ 오픈 소스 및 시스템 아키텍처 살펴보기
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
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.3s', '--glow-color': 'rgba(124, 58, 237, 0.4)' }}>
          <div className="flagship-content">
            <div className="flagship-label" style={{ color: '#8B5CF6' }}>Engineering & Growth Logs</div>
            <h3 className="flagship-title">Builder's Log</h3>
            <p className="flagship-desc">
              Vibe coding과 GCP 서버리스 기반으로 설계해 나가는 PriSincera의 집요한 개발 여정기입니다.<br />
              어려운 백엔드 트러블슈팅, AI 파이프라인 확장기, 보안 감사 등 날것의 성장 기록들을 생생히 공유합니다.
            </p>
            <div className="work-card-tags">
              <span className="work-tag">Tech Blog</span>
              <span className="work-tag">Architecture</span>
              <span className="work-tag">Troubleshooting</span>
            </div>
            <div className="flagship-cta-wrap">
              <Link to="/builders-log" className="flagship-cta-btn indigo">
                🚀 개발 여정 및 엔지니어링 성장기 읽기
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
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.4s', '--glow-color': 'rgba(34, 211, 238, 0.4)' }}>
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

        {/* 4. Pace Note Flagship */}
        <div className="flagship-card reveal-item flagship-glow" style={{ '--reveal-delay': '0.5s', '--glow-color': 'rgba(52, 211, 153, 0.4)' }}>
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

      </div>
    </section>
  );
}
