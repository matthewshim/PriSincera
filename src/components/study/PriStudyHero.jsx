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
          하루 5분, 성장을 증명하는 실무 지식 1-Pick
        </p>
        <p className="pristudy-hero-sub">
          비즈니스 언어부터 AI 프롬프트까지, 매일 하나의 고밀도 지식을 내 것으로 만드세요.
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
