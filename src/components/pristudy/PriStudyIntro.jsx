import React from 'react';

const values = [
  {
    icon: '⏱️',
    title: '하루 5분, 마이크로러닝',
    desc: '매일 단 한 문장. 부담 없이 출퇴근길에 읽고 들으며 조금씩, 확실하게 실력을 쌓아갑니다.',
  },
  {
    icon: '💼',
    title: '실무 투입 가능 100%',
    desc: '단순한 회화가 아닙니다. 이메일, 회의, 협상 등 실제 비즈니스 현장에서 원어민들이 즐겨 쓰는 세련된 표현만 엄선합니다.',
  },
  {
    icon: '🤖',
    title: 'AI 트렌드 큐레이션',
    desc: '최신 IT/테크, 경제, 경영 트렌드를 반영한 비즈니스 상황을 AI가 매일 새벽 분석하고 생성하여 가장 유용한 문장을 제안합니다.',
  },
  {
    icon: '🌱',
    title: '자기 주도 성장 (잔디 심기)',
    desc: '매일 학습을 완료하면 대시보드에 잔디가 심어집니다. 나의 연속 학습 기록(Streak)을 보며 동기를 부여하고 성장을 시각화하세요.',
  },
];

export default function PriStudyIntro() {
  return (
    <div className="pristudy-intro-wrapper">
      <section className="pristudy-section pristudy-value">
        <div className="pristudy-section-inner">
          <h2 className="pristudy-section-title">왜 <span className="accent">PriStudy</span>인가?</h2>
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

      <section className="pristudy-section pristudy-feature">
        <div className="pristudy-section-inner">
          <div className="pristudy-feature-content">
            <h2 className="pristudy-section-title">100% 자동화 파이프라인</h2>
            <p className="pristudy-feature-desc">
              PriStudy는 <strong>매일 새벽 4시</strong>, AI 파이프라인이 전 세계 비즈니스 이슈를 스캔합니다.<br/>
              이를 바탕으로 오늘의 학습 주제를 선정하고, <strong>Gemini Composer</strong>가<br/> 
              일본어 원문, 한국어 해석, 요미가나, 핵심 단어장, 그리고 비즈니스 코멘트까지<br/> 
              완벽하게 구성된 플래시카드 데이터를 자동 생성합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
