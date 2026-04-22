import { useState, useCallback } from 'react';

/**
 * PriSignal FAQ — ⑦ Frequently asked questions accordion.
 */
const faqs = [
  {
    q: 'PriSignal은 무엇인가요?',
    a: 'PriSignal은 PriSincera가 운영하는 주간 인사이트 큐레이션 뉴스레터입니다. 20년차 프로덕트 오너의 기준으로 설계된 AI 시스템이, 매주 글로벌 소스에서 의미 있는 시그널을 포착하고 코멘트와 함께 전합니다.',
  },
  {
    q: '시그널은 어떻게 선정되나요?',
    a: '매일 35개 글로벌 소스에서 자동 수집된 아티클을 SIGNAL 6가지 기준(Substance, Impact, Gap, Now, Actionable, Lens)으로 AI가 평가합니다. 여기에 채널 신뢰등급(Tier 1/2/3) 가중치를 적용하여 매주 3~5개의 핵심 시그널만 최종 선정됩니다.',
  },
  {
    q: '얼마나 자주 발송되나요?',
    a: '매주 월요일 오전 8시에 발송됩니다. 한 주를 시작하기 전, 커피 한 잔과 함께 5분이면 읽을 수 있는 분량입니다.',
  },
  {
    q: '구독은 무료인가요?',
    a: '네, 완전히 무료입니다. 이메일 주소만 입력하면 바로 구독이 시작됩니다.',
  },
  {
    q: '해지는 어떻게 하나요?',
    a: '매 이메일 하단의 "구독 해지" 링크를 클릭하면 즉시 해지됩니다. 별도의 절차나 이유 없이 원클릭으로 가능합니다.',
  },
  {
    q: '어떤 주제를 다루나요?',
    a: 'Attitude(태도와 리더십), Priority(우선순위와 전략), AI & Future(AI와 미래 기술), Global Lens(글로벌 인사이트), Product Craft(프로덕트 실전 노하우) 5가지 카테고리의 시그널을 다룹니다.',
  },
];

export default function PriSignalFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = useCallback((i) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section className="prisignal-section prisignal-faq" id="priSignalFAQ">
      <div className="prisignal-section-inner">
        <h2 className="prisignal-faq-title">자주 묻는 <span className="accent">질문</span></h2>
        <div className="prisignal-faq-list">
          {faqs.map((faq, i) => (
            <div
              className={`prisignal-faq-item${openIndex === i ? ' open' : ''}`}
              key={i}
            >
              <button
                className="prisignal-faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                id={`faq-${i}`}
              >
                {faq.q}
                <svg
                  className="prisignal-faq-chevron"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 6 L8 10 L12 6" />
                </svg>
              </button>
              <div className="prisignal-faq-answer">
                <p className="prisignal-faq-answer-inner">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
