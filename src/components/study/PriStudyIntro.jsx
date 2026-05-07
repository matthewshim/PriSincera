import React from 'react';
import { useNavigate } from 'react-router-dom';

const values = [
  {
    icon: '⏱️',
    title: '하루 5분, 마이크로러닝',
    desc: '매일 단 한 문장. 부담 없이 출퇴근길에 읽고 들으며 조금씩, 확실하게 실력을 쌓아갑니다.',
  },
  {
    icon: '💼',
    title: '실무 투입 가능 100%',
    desc: '이메일, 회의, 협상 등 실제 비즈니스 현장에서 쓰이는 세련된 표현과 일본 특유의 기업 문화(혼네와 다테마에 등)까지 다루어 깊이를 더합니다.',
  },
  {
    icon: '🤖',
    title: 'Signal 시너지 (AI 큐레이션)',
    desc: 'Signal이 분석한 최신 IT/경제 트렌드 뉴스에서 실무 문장을 직접 발췌하여, 가장 유용하고 맥락 있는 1-Pick을 제안합니다.',
  },
  {
    icon: '🌱',
    title: '자기 주도 성장 (잔디 심기)',
    desc: '매일 학습을 완료하면 대시보드에 잔디가 심어집니다. 나의 연속 학습 기록(Streak)을 시각화하여 강력한 동기를 부여하세요.',
  },
];

const processSteps = [
  {
    num: '01',
    title: '글로벌 뉴스 수집',
    time: '04:00 KST',
    desc: 'AI 파이프라인이 전 세계 주요 비즈니스/IT 매체의 이슈를 실시간으로 스캔합니다.'
  },
  {
    num: '02',
    title: '핵심 문장 추출 & 분석',
    time: '05:00 KST',
    desc: 'Gemini Composer가 가장 유용한 1문장을 선정하고, 해석, 요미가나, 비즈니스 코멘트를 자동 생성합니다.'
  },
  {
    num: '03',
    title: '플래시카드 렌더링',
    time: '06:00 KST',
    desc: '고품질 원어민 TTS 음성과 함께 데일리 플래시카드로 렌더링되어 구독자에게 서비스됩니다.'
  }
];

export default function PriStudyIntro() {
  const navigate = useNavigate();

  return (
    <div className="pristudy-intro-wrapper">
      
      {/* ── 1. Hero / Vision Section ── */}
      <section className="pristudy-section pristudy-hero">
        <div className="pristudy-section-inner">
          <div className="pristudy-hero-content">
            <h1 className="pristudy-hero-quote">
              "졸업은 배움의 끝이 아닌,<br/>진짜 생존을 위한 진화의 시작이다."
            </h1>
            <p className="pristudy-hero-desc">
              가벼운 앱테크식 어학이 아닌, 프로페셔널을 위한 <strong>고밀도 지식 섭취</strong>.<br/>
              하루 단 하나의 핵심 문장(Daily 1-Pick)으로 당신만의 성장을 증명하세요.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Value Proposition ── */}
      <section className="pristudy-section pristudy-value">
        <div className="pristudy-section-inner">
          <h2 className="pristudy-section-title">왜 <span className="accent">Study</span>인가?</h2>
          <div className="pristudy-value-grid">
            {values.map((v, i) => (
              <div className="pristudy-value-card" key={i}>
                <div className="pristudy-value-card-icon">{v.icon}</div>
                <div className="pristudy-value-card-title">{v.title}</div>
                <p className="pristudy-value-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. UX & Learning Structure ── */}
      <section className="pristudy-section pristudy-ux">
        <div className="pristudy-section-inner">
          <h2 className="pristudy-section-title">오늘의 <span className="accent">1-Pick</span> 학습 구조</h2>
          <div className="pristudy-ux-container">
            <div className="pristudy-ux-item">
              <div className="pristudy-ux-icon">📝</div>
              <h3>원문 & 발음</h3>
              <p>한자, 요미가나, 원어민 TTS 음성 지원</p>
            </div>
            <div className="pristudy-ux-arrow">➔</div>
            <div className="pristudy-ux-item">
              <div className="pristudy-ux-icon">💡</div>
              <h3>비즈니스 맥락</h3>
              <p>단순 직역을 넘어선 뉘앙스와 에디터 코멘트</p>
            </div>
            <div className="pristudy-ux-arrow">➔</div>
            <div className="pristudy-ux-item">
              <div className="pristudy-ux-icon">🌿</div>
              <h3>잔디 심기</h3>
              <p>GitHub 잔디처럼 시각화되는 성취감과 연속성</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Pipeline Steps ── */}
      <section className="pristudy-section pristudy-feature">
        <div className="pristudy-section-inner">
          <div className="pristudy-feature-content">
            <h2 className="pristudy-section-title">100% 자동화 파이프라인</h2>
            <div className="pristudy-pipeline-steps">
              {processSteps.map((step, idx) => (
                <div className="pristudy-pipeline-step" key={idx}>
                  <div className="pristudy-step-header">
                    <span className="pristudy-step-num">{step.num}</span>
                    <span className="pristudy-step-time">{step.time}</span>
                  </div>
                  <h3 className="pristudy-step-title">{step.title}</h3>
                  <p className="pristudy-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA Section ── */}
      <section className="pristudy-section pristudy-cta">
        <div className="pristudy-section-inner" style={{ textAlign: 'center', paddingBottom: '60px' }}>
          <button 
            className="pristudy-done-btn" 
            style={{ maxWidth: '400px', margin: '0 auto' }}
            onClick={() => navigate('/study#daily')}
          >
            🚀 오늘의 1-Pick 학습 시작하기
          </button>
        </div>
      </section>

    </div>
  );
}
