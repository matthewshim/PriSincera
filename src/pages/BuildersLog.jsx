import React, { useEffect, useRef } from 'react';
import './BuildersLog.css';

function useScrollReveal(options = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('reveal-active');
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);
  return ref;
}

const chapters = [
  {
    id: 'ch1',
    chapterNo: '01',
    title: 'The Pivot',
    subtitle: 'From Static Portfolio to SaaS Platform',
    description: `개인의 이력을 정적으로 나열하던 포트폴리오의 한계를 넘어, 실제 유저에게 살아있는 가치를 제공하는 플랫폼으로의 전환을 결심했습니다. Cloud Run과 Firebase 기반의 아키텍처를 설계하고, 자동화된 CI/CD 파이프라인을 구축하여 무중단 서비스의 기반을 다졌습니다. 더불어, PriSincera의 '밤 하늘의 별자리를 바라보며 고요히 집중하는 컨셉'에 맞춰, Google Gemini를 활용해 맞춤형 BGM을 직접 기획하고 생성하여 몰입감을 극대화했습니다.`,
    commits: [
      { type: 'feat', hash: 'a2b4c6', msg: '자동화 파이프라인 아키텍처 기반 설계 및 Cloud Build 연동' },
      { type: 'fix', hash: 'b458f1', msg: 'deploy 스크립트 최적화 및 도커 컨테이너 빌드 환경 구축' }
    ],
    accent: 'var(--prism-indigo)'
  },
  {
    id: 'ch2',
    chapterNo: '02',
    title: 'Daily Digest',
    subtitle: 'The Automated Knowledge Pipeline',
    description: `인사이트를 수동으로 전달하던 비효율을 끊어내고, IT Tech Signal, AI Prompt, 비즈니스 일본어를 매일 자동으로 수집 및 스코어링하는 '지식 자동화 파이프라인'을 탄생시켰습니다. 어드민 대시보드와 구독자 관리 시스템이 이때 확립되었습니다.`,
    commits: [
      { type: 'feat', hash: '450c29', msg: 'AI 프롬프트와 비즈니스 일본어 동시 생성 파이프라인 통합' },
      { type: 'feat', hash: '0b8a09', msg: '구독자 시인성 극대화를 위한 Bento 레이아웃 UI 설계' }
    ],
    accent: 'var(--prism-lavender)'
  },
  {
    id: 'ch3',
    chapterNo: '03',
    title: 'Pace Note',
    subtitle: 'Beyond Logging, The Compass of Sailing',
    description: `수동적인 출석 체크에 불과했던 기존 '잔디 심기(Growth Streak)' 기능을 과감히 폐기하고, 유저 스스로 능동적인 목표를 관리하는 Pace Note로 통폐합했습니다. AI 추천 가이드와 커스텀 목표 인사이트를 더해 실질적 성장의 나침반을 완성했습니다.`,
    commits: [
      { type: 'refactor', hash: '9f35ba', msg: 'Growth Streak 완전 제거 및 Pace Note 벤토 대시보드 통합' },
      { type: 'feat', hash: 'c8cb0a', msg: '주차별 상태 동기화 및 AI 추천 가이드 알고리즘 고도화' }
    ],
    accent: 'var(--orbit-cyan)'
  },
  {
    id: 'ch4',
    chapterNo: '04',
    title: 'The Impression',
    subtitle: 'Flagship Premium UI/UX',
    description: `고도화된 백엔드 서비스의 가치를 직관적으로 전달하기 위해 첫인상을 혁신했습니다. 단순한 Grid 레이아웃을 해체하고, 서비스별 독립적인 풀-와이드 플래그십 카드와 3D 동적 인터랙션, 프리미엄 글래스모피즘을 적용하여 최상의 SaaS 브랜드 경험을 제공합니다.`,
    commits: [
      { type: 'feat', hash: '448be7', msg: '메인 랜딩 페이지 최고급 프리미엄 퀄리티 UI/UX 재설계' },
      { type: 'style', hash: 'b121cb', msg: '전역 CTA 버튼 및 컴포넌트 디자인 시스템 (Glassmorphism) 통일' }
    ],
    accent: 'var(--prism-rose)'
  }
];

const ChapterCard = ({ chapter, index }) => {
  const ref = useScrollReveal();
  
  return (
    <div className={`builder-card builder-card-${index}`} ref={ref}>
      <div className="builder-card-glass" style={{ '--accent-color': chapter.accent }}>
        {/* Glow behind the card */}
        <div className="card-glow-bg"></div>
        
        <div className="card-header">
          <div className="chapter-badge">Chapter {chapter.chapterNo}</div>
          <h2 className="chapter-title">{chapter.title}</h2>
          <h3 className="chapter-subtitle">{chapter.subtitle}</h3>
        </div>
        
        <div className="card-body">
          <p className="chapter-desc">{chapter.description}</p>
        </div>
        
        <div className="card-commits">
          <div className="commits-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Key Shipments
          </div>
          <div className="commits-list">
            {chapter.commits.map((commit, i) => (
              <div className="commit-item" key={i}>
                <div className="commit-node" style={{ borderColor: chapter.accent }}></div>
                <div className="commit-content">
                  <div className="commit-meta">
                    <span className="commit-hash">{commit.hash}</span>
                    <span className={`commit-type type-${commit.type}`}>{commit.type}</span>
                  </div>
                  <div className="commit-msg">{commit.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BuildersLog() {
  const headerRef = useScrollReveal();

  useEffect(() => {
    // Show GNB immediately
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  return (
    <div className="builders-log-wrapper">
      <div className="log-container">
        {/* Hero Section */}
        <div className="log-hero-section" ref={headerRef}>
          <div className="hero-tag">BEHIND THE SINCERA</div>
          <h1 className="hero-heading">Builder's <span className="highlight">Log</span></h1>
          <p className="hero-paragraph">
            PriSincera가 단순한 포트폴리오를 넘어 완전한 SaaS 플랫폼으로 거듭나기까지.<br/>
            프로덕트를 설계하고 코드를 쌓아 올린 치열한 항해의 기록을 공유합니다.
          </p>
        </div>

        {/* Bento Grid Timeline */}
        <div className="log-bento-grid">
          {chapters.map((ch, i) => (
            <ChapterCard key={ch.id} chapter={ch} index={i} />
          ))}
        </div>
        
        <div className="log-footer-note">
          <div className="pulse-dot"></div>
          The journey of building continues.
        </div>
      </div>
    </div>
  );
}
