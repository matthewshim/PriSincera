import { useState, useEffect } from 'react';
import './PaceNoteDashboard.css';

export default function PaceNoteDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = 'PriSincera Pace Note';
    document.body.classList.add('hero-ready');
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setData({
        currentPace: [
          { id: '1', title: 'Cursor AI를 활용해 반복 업무 자동화 스크립트 1개 작성하기', completed: true },
          { id: '2', title: '어제 배운 일본어 비즈니스 표현을 실제 이메일 초안에 적용해보기', completed: false },
        ],
        recommendedPace: [
          { id: '3', title: '프로덕트 경쟁력 분석을 위한 린 캔버스 1장 그려보기', category: 'Product Strategy' },
          { id: '4', title: '해외 트렌드 기사를 읽고 팀 메신저에 짧은 인사이트 공유하기', category: 'Global Trend' },
        ],
        logs: [
          { id: '101', date: '2026-05-04', title: 'AI 툴 활용으로 업무 시간 2시간 단축 완료', category: 'AI & Future', color: '#22D3EE' },
          { id: '102', date: '2026-05-01', title: '매일 5분 비즈니스 일본어 학습 1주일 완주', category: 'Growth', color: '#34D399' },
          { id: '103', date: '2026-04-25', title: '글로벌 프로덕트 사례 분석 리포트 노션에 정리', category: 'Global Trend', color: '#60A5FA' },
          { id: '104', date: '2026-04-18', title: '새로운 기술 트렌드 사내 세미나 발표 진행', category: 'Tech & Dev', color: '#A78BFA' },
          { id: '105', date: '2026-04-10', title: '스타트업 투자 동향 기사 읽고 산업 동향 맵핑', category: 'Startup', color: '#F472B6' },
        ]
      });
      setLoading(false);
    }, 800);

    return () => {
      document.body.classList.remove('hero-ready');
      clearTimeout(timer);
    };
  }, []);

  const toggleComplete = (id) => {
    setData(prev => {
      const newPace = prev.currentPace.map(p => 
        p.id === id ? { ...p, completed: !p.completed } : p
      );
      return { ...prev, currentPace: newPace };
    });
  };

  return (
    <div className="pacenote-page">
      {/* ── Hero Section ── */}
      <section className="pacenote-hero">
        <div className="pacenote-hero-content">
          <div className="pacenote-hero-icon">⛵</div>
          <h1 className="pacenote-title">Pace Note</h1>
          <p className="pacenote-subtitle">남들의 속도에 휩쓸리지 않고, 나만의 호흡과 방향을 잃지 않기 위해 기록합니다.</p>
        </div>
      </section>

      {/* ── Main Content (Bento Layout) ── */}
      <div className="pacenote-container">
        {loading ? (
          <div className="pacenote-loading">
            <div className="pacenote-spinner" />
            <p>나의 항해 일지를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="pacenote-bento-grid">
            
            {/* 1. Pace Tracker (진행 중인 미션) */}
            <div className="pacenote-bento-card tracker-card">
              <div className="pacenote-card-header">
                <h2>이번 주 나의 궤도</h2>
                <span className="pacenote-date-badge">May Week 2</span>
              </div>
              <p className="pacenote-card-desc">조급해하지 않고 이번 주에 집중할 작은 행동들입니다.</p>
              
              <div className="pacenote-tasks">
                {data.currentPace.map((task) => (
                  <label key={task.id} className={`pacenote-task-item ${task.completed ? 'completed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      onChange={() => toggleComplete(task.id)} 
                    />
                    <span className="task-custom-checkbox"></span>
                    <span className="task-text">{task.title}</span>
                  </label>
                ))}
                
                {/* 100% 완료 시 애니메이션 파티클이나 축하 메시지 공간 */}
                {data.currentPace.every(t => t.completed) && (
                  <div className="pacenote-celebration">
                    🎉 이번 주 궤도 안착 완료! 단단한 한 걸음이 되었습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 2. AI-Tailored Pace (AI 추천 미션) */}
            <div className="pacenote-bento-card ai-recommend-card">
              <div className="pacenote-card-header">
                <h2>AI 추천 가이드</h2>
                <span className="pacenote-ai-badge">✨ Gemini</span>
              </div>
              <p className="pacenote-card-desc">이번 주 소비한 시그널을 바탕으로 제안하는 다음 스텝입니다.</p>
              
              <div className="pacenote-recommend-list">
                {data.recommendedPace.map((rec) => (
                  <div key={rec.id} className="pacenote-recommend-item">
                    <div className="pacenote-rec-cat">{rec.category}</div>
                    <div className="pacenote-rec-title">{rec.title}</div>
                    <button className="pacenote-btn-accept">내 궤도에 추가하기</button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Monthly Branding Log (지금까지의 기록) */}
            <div className="pacenote-bento-card logbook-card">
              <div className="pacenote-card-header">
                <h2>My Logbook</h2>
                <button className="pacenote-btn-export">📥 포트폴리오 다운로드</button>
              </div>
              <p className="pacenote-card-desc">지금까지 흔들림 없이 나아온 성장의 발자취입니다.</p>
              
              <div className="pacenote-masonry-grid">
                {data.logs.map((log) => (
                  <div key={log.id} className="pacenote-log-card">
                    <div className="pacenote-log-header">
                      <span className="pacenote-log-date">{log.date}</span>
                      <span className="pacenote-log-cat" style={{ color: log.color, backgroundColor: `${log.color}20` }}>
                        {log.category}
                      </span>
                    </div>
                    <h3 className="pacenote-log-title">{log.title}</h3>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
