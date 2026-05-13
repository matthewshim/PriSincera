import React, { useEffect, useRef } from 'react';
import './BuildersLog.css';

function useScrollReveal(options = { threshold: 0.1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold]);
  return ref;
}

const chapters = [
  {
    id: 'ch1',
    title: 'The Pivot',
    subtitle: '개인 포트폴리오에서 SaaS 플랫폼으로',
    description: `초기의 정적인 포트폴리오 사이트의 한계를 직면하고, 개인의 이력을 나열하는 것을 넘어 유저에게 직접적인 가치를 제공하는 '플랫폼'으로의 전환을 결심했습니다. 
이를 위해 Google Cloud Run과 Firebase 기반의 탄탄한 백엔드 아키텍처를 설계하고 자동화된 CI/CD 파이프라인을 구축하여 무중단 서비스의 기반을 다졌습니다.`,
    commits: [
      { hash: 'feat', msg: 'pipeline 기반 아키텍처 설계 및 Cloud Build 연동', id: 'a2b4c6' },
      { hash: 'fix', msg: 'deploy 스크립트 최적화 및 도커라이징 완료', id: 'b458f1' }
    ],
    color: '#3B82F6' // Blue
  },
  {
    id: 'ch2',
    title: 'Daily Digest',
    subtitle: '완전 자동화된 지식 파이프라인의 탄생',
    description: `매일 유용한 인사이트를 전달하기 위해 반복되던 수동 작업의 비효율성을 끊어냈습니다.
어드민 대시보드(Admin Dashboard)를 도입하고, IT Tech Signal, AI Prompt, 비즈니스 일본어를 매일 자동으로 수집 및 스코어링하여 발송하는 '지식 자동화 파이프라인'을 완성했습니다. 벤토(Bento) 레이아웃 적용을 통해 가독성 높은 UI를 제공합니다.`,
    commits: [
      { hash: 'feat', msg: 'AI 프롬프트와 비즈니스 일본어 동시 생성 로직 통합', id: '450c29' },
      { hash: 'feat', msg: 'Admin 대시보드 일별 이메일 발송 추이 차트 추가', id: '55597a' },
      { hash: 'feat', msg: 'Bento 박스 UI 및 인터랙션 애니메이션 적용', id: '0b8a09' }
    ],
    color: '#8B5CF6' // Purple
  },
  {
    id: 'ch3',
    title: 'Pace Note',
    subtitle: '단순한 기록을 넘어, 항해의 나침반으로',
    description: `기존 '잔디 심기(Growth Streak)' 기능이 주는 단순 출석 체크의 한계를 마주하고, 이를 과감히 폐기했습니다.
그 자리에 유저 스스로 능동적인 목표를 설정하고 관리하는 'Pace Note(항해 일지)'를 구축했습니다. Google Auth 연동, 주차별 모달 UI, 그리고 'AI 추천 목표'와 '커스텀 목표 인사이트'를 도입하여 유저의 실질적인 성장을 돕는 도구로 재탄생시켰습니다.`,
    commits: [
      { hash: 'refactor', msg: 'Growth Streak 기능 완전 제거 및 Pace Note로 통폐합', id: '9f35ba' },
      { hash: 'feat', msg: '상단 주차별 로그 UI 도입 및 AI 추천 가이드 고도화', id: 'c8cb0a' },
      { hash: 'feat', msg: '비로그인 프리뷰 및 더미 데이터 주차 동기화', id: 'f12a9b' }
    ],
    color: '#10B981' // Emerald
  },
  {
    id: 'ch4',
    title: 'The Impression',
    subtitle: '첫인상의 혁신, 프리미엄 UI/UX',
    description: `고도화된 백엔드 서비스의 가치를 담아내지 못하는 단조로운 기존 메인 페이지의 한계를 극복하기 위한 여정입니다.
Grid 레이아웃을 해체하고, 서비스별 독립적인 풀-와이드 플래그십 카드를 도입했습니다. CSS 3D 모의 UI와 글래스모피즘 이펙트를 적용하여 역동성을 더했으며, 이력 중심의 수직 타임라인을 브랜드 스토리를 담은 퓨처리스틱 가로형 타임라인으로 진화시켰습니다.`,
    commits: [
      { hash: 'feat', msg: '메인 랜딩 페이지 최고급 프리미엄 퀄리티 UI/UX 재설계', id: '448be7' },
      { hash: 'style', msg: 'CTA 버튼 디자인 통일 (어두운 글래스모피즘)', id: 'b121cb' },
      { hash: 'feat', msg: '메인 페이지 랜딩 서비스 플랫폼화 개편', id: '879f9a' }
    ],
    color: '#F43F5E' // Rose
  }
];

const ChapterBlock = ({ chapter, index }) => {
  const ref = useScrollReveal({ threshold: 0.2 });

  return (
    <div className={`builder-chapter chapter-${index % 2 === 0 ? 'left' : 'right'}`} ref={ref}>
      <div className="chapter-connector">
        <div className="connector-dot" style={{ backgroundColor: chapter.color, boxShadow: `0 0 15px ${chapter.color}` }}></div>
        <div className="connector-line"></div>
      </div>
      
      <div className="chapter-content">
        <div className="chapter-header">
          <span className="chapter-number" style={{ color: chapter.color }}>Chapter {index + 1}</span>
          <h2 className="chapter-title">{chapter.title}</h2>
          <h3 className="chapter-subtitle">{chapter.subtitle}</h3>
        </div>
        
        <p className="chapter-desc">{chapter.description}</p>
        
        <div className="chapter-terminal">
          <div className="terminal-header">
            <div className="term-dots">
              <span className="term-dot close"></span>
              <span className="term-dot min"></span>
              <span className="term-dot max"></span>
            </div>
            <div className="term-title">commit history — {chapter.title.toLowerCase().replace(' ', '-')}</div>
          </div>
          <div className="terminal-body">
            {chapter.commits.map((commit, i) => (
              <div className="commit-row" key={i}>
                <span className="commit-hash">{commit.id}</span>
                <span className={`commit-type type-${commit.hash}`}>{commit.hash}</span>
                <span className="commit-msg">{commit.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BuildersLog() {
  const heroRef = useScrollReveal();

  return (
    <div className="builders-log-page">
      <div className="log-bg-grid"></div>
      <div className="log-bg-glows">
        <div className="glow-orb top-left"></div>
        <div className="glow-orb bottom-right"></div>
      </div>

      <div className="log-hero" ref={heroRef}>
        <div className="hero-badge">THE STORY</div>
        <h1 className="log-hero-title">
          Builder's <span className="text-gradient">Log</span>
        </h1>
        <p className="log-hero-subtitle">Behind the Sincera</p>
        <p className="log-hero-desc">
          단순한 이력을 넘어, 실제 운영 중인 서비스가 어떠한 철학과 기술적 고민을 통해<br />
          설계되고 발전해 왔는지 그 치열한 항해의 기록을 공유합니다.
        </p>
      </div>

      <div className="log-timeline-container">
        <div className="timeline-center-line"></div>
        {chapters.map((ch, i) => (
          <ChapterBlock key={ch.id} chapter={ch} index={i} />
        ))}
      </div>
      
      <div className="log-footer">
        <p>The journey of building continues.</p>
      </div>
    </div>
  );
}
