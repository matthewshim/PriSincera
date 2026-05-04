import React from 'react';

export default function PriStudyHero({ activeTab, onTabChange }) {
  return (
    <section className="pristudy-section pristudy-hero">
      <div className="pristudy-section-inner">
        <div className="pristudy-hero-icon">📖</div>
        <h1 className="pristudy-hero-title">
          Pri<span className="accent">Study</span>
        </h1>
        <p className="pristudy-hero-tagline">
          하루 5분, 실무에서 바로 쓰는 비즈니스 일본어
        </p>
        <p className="pristudy-hero-sub">
          매일 1문장, AI가 생성하고 분석한 고품질 플래시카드와 함께 성장하세요.
        </p>
        {activeTab === 'intro' && (
          <button className="pristudy-cta-btn" onClick={() => onTabChange('daily')}>
            오늘의 스터디 시작하기
          </button>
        )}
      </div>
    </section>
  );
}
