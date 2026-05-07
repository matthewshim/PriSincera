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
    desc: '글로벌 비즈니스 이메일, 현지 기업 문화, 그리고 AI 활용 프롬프트까지. 내일 당장 실무에 적용할 수 있는 핵심 지식만 다루어 깊이를 더합니다.',
  },
  {
    icon: '🤖',
    title: 'Signal 시너지 (AI 큐레이션)',
    desc: 'Signal이 분석한 최신 IT/경제 트렌드 뉴스에서 실무 문장을 직접 발췌하여, 가장 유용하고 맥락 있는 1-Pick을 제안합니다.',
  },
  {
    icon: '🌱',
    title: '자기 주도 성장 (멀티 트랙 & 잔디 심기)',
    desc: '언어부터 AI 프롬프트까지 관심 있는 과목(트랙)을 넘나들며 학습하세요. 매일 대시보드에 잔디가 심어지며 연속 기록(Streak)이 시각화됩니다.',
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
    title: '핵심 문장 & 프롬프트 추출',
    time: '05:00 KST',
    desc: 'Gemini Composer가 가장 유용한 1-Pick을 선정하고, 해석, 핵심 어휘 및 비즈니스 실무 활용 코멘트를 자동 생성합니다.'
  },
  {
    num: '03',
    title: '과목별 플래시카드 렌더링',
    time: '06:00 KST',
    desc: '원어민 TTS 음성 및 코드(프롬프트) 스니펫과 함께 트랙별 플래시카드로 렌더링되어 구독자에게 제공됩니다.'
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
              <h3>원문/템플릿 & 발음</h3>
              <p>텍스트 원문, 프롬프트 템플릿, 원어민 TTS 음성 지원</p>
            </div>
            <div className="pristudy-ux-arrow">➔</div>
            <div className="pristudy-ux-item">
              <div className="pristudy-ux-icon">💡</div>
              <h3>실무 맥락 (Context)</h3>
              <p>단순 직역을 넘어선 실무 뉘앙스와 20년차 PO의 코멘트</p>
            </div>
            <div className="pristudy-ux-arrow">➔</div>
            <div className="pristudy-ux-item">
              <div className="pristudy-ux-icon">🌿</div>
              <h3>멀티 트랙 잔디 심기</h3>
              <p>다양한 관심 과목을 동시에 달성하는 연속성(Streak) 확보</p>
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
