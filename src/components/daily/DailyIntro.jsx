import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DailyIntro.css';

export default function DailyIntro() {
  const navigate = useNavigate();

  return (
    <div className="daily-intro-wrapper">
      
      {/* ── 1. Hero / Vision Section ── */}
      <section className="daily-section daily-intro-hero">
        <div className="daily-section-inner">
          <div className="daily-hero-badge">PriSignal + PriStudy = Daily Digest</div>
          <div className="daily-hero-content">
            <h1 className="daily-hero-quote">
              정보의 홍수 속에서 <span className="accent">시그널</span>을 찾고,<br/>
              단순한 읽기를 넘어 <span className="accent">실무의 무기</span>로.
            </h1>
            <p className="daily-hero-desc">
              PriSincera Daily Digest는 파편화된 IT 트렌드 큐레이션(PriSignal)과<br className="desktop-only" /> 
              실전 압축형 마이크로 러닝(PriStudy)을 하나로 통합한 <strong>고밀도 성장 플랫폼</strong>입니다.<br className="desktop-only" />
              하루 단 5분, 매일 아침 배달되는 인사이트로 당신의 대체 불가능한 경쟁력을 증명하세요.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Core Synergy ── */}
      <section className="daily-section daily-synergy">
        <div className="daily-section-inner">
          <h2 className="daily-section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
            두 가지 서비스의 <span className="accent">완벽한 시너지</span>
          </h2>
          <div className="synergy-grid">
            <div className="synergy-card signal-part">
              <div className="synergy-header">
                <span className="synergy-icon">📡</span>
                <h3 className="synergy-title">PriSignal <span className="sub">IT Trend Curation</span></h3>
              </div>
              <p className="synergy-subtitle">매일 아침 쏟아지는 수많은 뉴스, 무엇을 읽어야 할지 더 이상 고민하지 마세요.</p>
              <ul className="synergy-features">
                <li><strong>글로벌 소스 스캔:</strong> 35개 이상의 글로벌 IT/비즈니스 매체 실시간 모니터링</li>
                <li><strong>AI 노이즈 필터링:</strong> 실무 연관성과 파급력을 기준으로 기사를 Scoring하여 핵심만 선별</li>
                <li><strong>3-Line Insight:</strong> 긴 원문을 읽을 필요 없이, 바쁜 아침 1분 만에 맥락을 파악할 수 있는 3줄 요약과 핵심 통찰(💡) 제공</li>
              </ul>
            </div>
            
            <div className="synergy-plus">+</div>

            <div className="synergy-card study-part">
              <div className="synergy-header">
                <span className="synergy-icon">✏️</span>
                <h3 className="synergy-title">PriStudy <span className="sub">Actionable Learning</span></h3>
              </div>
              <p className="synergy-subtitle">단순히 읽고 끝나는 것이 아니라, 나의 실무에 즉각적으로 적용할 수 있게 설계했습니다.</p>
              <ul className="synergy-features">
                <li><strong>AI Prompt 1-Pick:</strong> 오늘의 트렌드를 업무에 즉시 반영할 수 있도록, 파라미터가 최적화된 복사-붙여넣기용 프롬프트 템플릿 제공</li>
                <li><strong>Business Language:</strong> 글로벌 환경에 대비해, 현지 뉘앙스가 담긴 비즈니스 외국어(일본어) 문장 학습 및 원어민 TTS(음성) 지원</li>
                <li><strong>Streak System:</strong> 학습 완료 시 잔디를 심으며 꾸준한 마이크로 러닝 습관 형성 유도</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 100% Automated Pipeline ── */}
      <section className="daily-section daily-pipeline">
        <div className="daily-section-inner">
          <h2 className="daily-section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
            100% 자동화된 <span className="accent">AI 파이프라인</span>
          </h2>
          <div className="daily-pipeline-container">
            <div className="daily-pipeline-step">
              <div className="step-num">01</div>
              <h3>Data Collection</h3>
              <p>매일 04:00, 글로벌 IT/비즈니스 매체에서 수백 건의 최신 데이터를 백그라운드 수집합니다.</p>
            </div>
            <div className="pipeline-arrow">➔</div>
            <div className="daily-pipeline-step">
              <div className="step-num">02</div>
              <h3>AI Scoring & Curation</h3>
              <p>LLM이 노이즈를 필터링하고 각 기사의 중요도를 점수화(★)하여 가장 영향력 있는 시그널만 선별합니다.</p>
            </div>
            <div className="pipeline-arrow">➔</div>
            <div className="daily-pipeline-step">
              <div className="step-num">03</div>
              <h3>Composer Generation</h3>
              <p>선별된 시그널을 바탕으로 AI 프롬프트와 어학 콘텐츠를 자동 생성하고 웹과 이메일로 동시 발행합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CTA Section ── */}
      <section className="daily-section daily-cta">
        <div className="daily-section-inner" style={{ textAlign: 'center', paddingBottom: '60px' }}>
          <button 
            className="daily-done-btn" 
            onClick={() => {
              navigate('/daily#daily');
              window.scrollTo(0, 0);
            }}
          >
            🚀 오늘의 다이제스트 보러가기
          </button>
        </div>
      </section>

    </div>
  );
}
