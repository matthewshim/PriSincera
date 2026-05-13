import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DailyIntro.css';

export default function DailyIntro() {
  const navigate = useNavigate();
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <div className="daily-intro-wrapper">
      
      {/* ── 1. Hero Section ── */}
      <section className="intro-hero reveal-on-scroll">
        <div className="intro-hero-content">
          <div className="hero-glow-badge">Daily Digest</div>
          <h1 className="hero-title">
            하루 5분, <br className="mobile-only" />
            <span className="accent-gradient">당신의 성장을 증명하는</span><br />
            고밀도 인사이트
          </h1>
          <p className="hero-desc">
            매일 아침 배달되는 글로벌 트렌드 큐레이션, 실무 적용을 위한 AI 프롬프트, <br className="desktop-only"/>
            그리고 비즈니스 어학까지. 읽고 끝나는 지식이 아닌, 실무의 무기로 만드세요.
          </p>
        </div>
      </section>

      {/* ── 2. Bento Box Value Props ── */}
      <section className="intro-bento-section">
        <div className="bento-grid">
          
          {/* Curation (Large) */}
          <div className="bento-card card-curation reveal-on-scroll">
            <div className="bento-content">
              <span className="bento-icon">📡</span>
              <h3 className="bento-title">노이즈를 지우고<br/>시그널만 남기다</h3>
              <p className="bento-desc">
                매일 35개 이상의 글로벌 IT/비즈니스 매체를 AI가 실시간 모니터링합니다.<br/>
                실무 연관성과 파급력을 기준으로 <strong>가장 중요한 기사만 Scoring하여</strong> 바쁜 아침 1분 만에 파악할 수 있는 3줄 요약으로 제공합니다.
              </p>
            </div>
            <div className="bento-visual visual-scan">
              <div className="scan-line"></div>
              <div className="scan-content">
                <div className="skeleton-line w-80"></div>
                <div className="skeleton-line w-60"></div>
                <div className="skeleton-line highlight">핵심 통찰 💡</div>
                <div className="skeleton-line w-90"></div>
              </div>
            </div>
          </div>

          {/* AI Prompt (Medium) */}
          <div className="bento-card card-prompt reveal-on-scroll delay-1">
            <div className="bento-content">
              <span className="bento-icon">🤖</span>
              <h3 className="bento-title">읽고 끝내지 마세요.<br/>업무에 바로 붙여넣는 프롬프트</h3>
              <p className="bento-desc">
                오늘의 트렌드 뉴스를 내 실무에 즉시 적용할 수 있도록, <strong>파라미터가 최적화된 복사-붙여넣기용 AI 프롬프트</strong> 템플릿을 함께 제안합니다.
              </p>
            </div>
            <div className="bento-visual visual-code">
              <div className="code-header">
                <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
              </div>
              <div className="code-body">
                <code><span className="keyword">Prompt</span> <span className="string">"Act as a Data Analyst..."</span></code>
                <code><span className="keyword">Focus</span> <span className="string">[User Retention]</span></code>
                <div className="typing-cursor"></div>
              </div>
            </div>
          </div>

          {/* Business Language (Medium) */}
          <div className="bento-card card-lang reveal-on-scroll delay-2">
            <div className="bento-content">
              <span className="bento-icon">🇯🇵</span>
              <h3 className="bento-title">글로벌 비즈니스의<br/>무기가 되는 한 문장</h3>
              <p className="bento-desc">
                매일 단 한 문장, 밀도 높은 비즈니스 어학. <strong>현지 뉘앙스와 원어민 TTS 음성</strong>을 통해 글로벌 커뮤니케이션 능력을 예리하게 다듬어 줍니다.
              </p>
            </div>
            <div className="bento-visual visual-wave">
              <div className="wave-bars">
                <div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div><div className="bar"></div>
              </div>
            </div>
          </div>



        </div>
      </section>

      {/* ── 3. Pipeline Section ── */}
      <section className="intro-pipeline reveal-on-scroll">
        <h2 className="section-heading">100% 자동화된 백그라운드 AI 파이프라인</h2>
        <div className="pipeline-steps">
          <div className="step-item">
            <div className="step-circle">01</div>
            <h4>Data Collection</h4>
            <p>매일 새벽, 신뢰도 높은 글로벌 소스의 최신 아티클 수집</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-item">
            <div className="step-circle">02</div>
            <h4>LLM Scoring & Filter</h4>
            <p>노이즈 제거 후 실무 파급력을 바탕으로 핵심 시그널(★) 선별</p>
          </div>
          <div className="step-arrow">➔</div>
          <div className="step-item">
            <div className="step-circle">03</div>
            <h4>Insights Generation</h4>
            <p>선별된 정보에 AI 프롬프트와 어학 콘텐츠를 결합하여 자동 발행</p>
          </div>
        </div>
      </section>

      {/* ── 4. CTA ── */}
      <section className="intro-cta reveal-on-scroll">
        <button 
          className="cta-button" 
          onClick={() => {
            navigate('/daily#daily');
            window.scrollTo(0, 0);
          }}
        >
          🚀 오늘의 다이제스트 보러가기
        </button>
      </section>

    </div>
  );
}
