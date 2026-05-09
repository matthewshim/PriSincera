import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DailyIntro.css';

const values = [
  {
    icon: '📡',
    title: 'Daily IT Curation',
    desc: '매일 새벽, AI가 35개 이상의 글로벌 IT/비즈니스 소스에서 수백 개의 뉴스를 스캔하고 가장 중요한 핵심 인사이트를 요약합니다.',
  },
  {
    icon: '🤖',
    title: 'AI Prompt 1-Pick',
    desc: '최신 트렌드와 직결된 실무 프롬프트를 제안합니다. 바로 복사해서 쓸 수 있는 스니펫과 파라미터 해설로 업무 효율을 극대화하세요.',
  },
  {
    icon: '🇯🇵',
    title: 'Business Japanese',
    desc: '하루 단 한 문장, 밀도 높은 비즈니스 일본어. 현지 뉘앙스, 요미가나, 원어민 발음(TTS) 지원으로 글로벌 커뮤니케이션 능력을 기릅니다.',
  },
  {
    icon: '🌱',
    title: 'Microlearning & Streak',
    desc: '출퇴근길 하루 5분 투자로 세 가지 지식을 모두 습득하세요. 매일 잔디를 심으며 당신만의 꾸준한 성장을 시각화할 수 있습니다.',
  }
];

export default function DailyIntro() {
  const navigate = useNavigate();

  return (
    <div className="daily-intro-wrapper">
      
      {/* ── 1. Hero / Vision Section ── */}
      <section className="daily-section daily-intro-hero">
        <div className="daily-section-inner">
          <div className="daily-hero-content">
            <h1 className="daily-hero-quote">
              "노이즈 속에서 시그널을 찾아내고,<br/>배움을 넘어 실무로 연결하다."
            </h1>
            <p className="daily-hero-desc">
              가벼운 정보 소비를 넘어선 프로페셔널을 위한 <strong>고밀도 데일리 다이제스트</strong>.<br/>
              하루 5분, IT 인사이트와 실무 지식(프롬프트, 일본어)으로 당신의 경쟁력을 증명하세요.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Value Proposition ── */}
      <section className="daily-section daily-value">
        <div className="daily-section-inner">
          <h2 className="daily-section-title">왜 <span className="accent">Daily Digest</span>인가?</h2>
          <div className="daily-value-grid">
            {values.map((v, i) => (
              <div className="daily-value-card" key={i}>
                <div className="daily-value-card-icon">{v.icon}</div>
                <div className="daily-value-card-title">{v.title}</div>
                <p className="daily-value-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 100% Automated Pipeline ── */}
      <section className="daily-section daily-pipeline">
        <div className="daily-section-inner">
          <h2 className="daily-section-title">100% 자동화된 <span className="accent">AI 파이프라인</span></h2>
          <div className="daily-pipeline-container">
            <div className="daily-pipeline-step">
              <div className="step-num">01</div>
              <h3>Data Collection</h3>
              <p>매일 04:00, 글로벌 IT/비즈니스 매체에서 수백 건의 데이터를 수집합니다.</p>
            </div>
            <div className="pipeline-arrow">➔</div>
            <div className="daily-pipeline-step">
              <div className="step-num">02</div>
              <h3>AI Scoring & Curation</h3>
              <p>PriSincera AI가 노이즈를 필터링하고 가장 중요한 시그널을 점수화하여 선별합니다.</p>
            </div>
            <div className="pipeline-arrow">➔</div>
            <div className="daily-pipeline-step">
              <div className="step-num">03</div>
              <h3>Composer Generation</h3>
              <p>선별된 시그널을 바탕으로 AI 프롬프트와 비즈니스 일본어 학습 콘텐츠를 자동 생성합니다.</p>
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
