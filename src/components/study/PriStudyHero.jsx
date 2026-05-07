import React from 'react';

export default function PriStudyHero({ activeTab, onTabChange, token, handleGoogleLogin, userEmail, handleLogout }) {
  return (
    <section className="pristudy-section pristudy-hero">
      <div className="pristudy-section-inner">
        <div className="pristudy-hero-icon">📖</div>
        <h1 className="pristudy-hero-title">
          <span className="accent">Study</span>
        </h1>
        <p className="pristudy-hero-tagline">
          하루 5분, 실무에서 바로 쓰는 비즈니스 일본어
        </p>
        <p className="pristudy-hero-sub">
          매일 1문장, AI가 생성하고 분석한 고품질 플래시카드와 함께 성장하세요.
        </p>
        <div className="pristudy-hero-actions">
          {!token ? (
            <button className="pristudy-cta-btn" onClick={handleGoogleLogin}>
              Google로 1초 만에 시작하기
            </button>
          ) : (
            <div className="pristudy-hero-user-info">
              <button className="pristudy-cta-btn" onClick={() => onTabChange('daily')}>
                <span style={{ fontWeight: 400, opacity: 0.9 }}>{userEmail}</span> 로 학습 이어하기
              </button>
              <button className="pristudy-hero-logout" onClick={handleLogout}>로그아웃</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
