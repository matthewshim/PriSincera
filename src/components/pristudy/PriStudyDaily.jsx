import React from 'react';

function formatNavDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}(${days[dt.getDay()]})`;
}
export default function PriStudyDaily({
  showAuth, loading, dailyContent, isFlipped, setIsFlipped,
  playAudio, markCompleted, isTodayCompleted, isMarking,
  progress, last7Days, todayStr, targetDate, handleGoogleLogin, userEmail, handleLogout, navigate
}) {
  return (
    <div className="pristudy-daily-wrapper">


      <div className="pristudy-daily-header">
        <div className="pristudy-daily-date-nav-row">
          {dailyContent?.hasPrev ? (
            <button 
              className="pristudy-nav-btn" 
              onClick={() => {
                const d = new Date(targetDate);
                d.setDate(d.getDate() - 1);
                navigate(`/pristudy/${d.toISOString().slice(0, 10)}`);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="pristudy-nav-btn-label">
                {formatNavDate(new Date(new Date(targetDate).setDate(new Date(targetDate).getDate() - 1)).toISOString().slice(0, 10))}
              </span>
            </button>
          ) : (
            <div className="pristudy-nav-btn disabled" />
          )}
          
          <div className="pristudy-date-center">
            <span className="pristudy-date-day">{new Date(targetDate).getDate()}</span>
            <div className="pristudy-date-month-dow">
              <span className="pristudy-date-month">{new Date(targetDate).getMonth() + 1}월</span>
              <span className="pristudy-date-dow">{['일', '월', '화', '수', '목', '금', '토'][new Date(targetDate).getDay()]}요일</span>
            </div>
          </div>

          {dailyContent?.hasNext && targetDate !== todayStr ? (
            <button 
              className="pristudy-nav-btn next" 
              onClick={() => {
                const d = new Date(targetDate);
                d.setDate(d.getDate() + 1);
                navigate(`/pristudy/${d.toISOString().slice(0, 10)}`);
              }}
            >
              <span className="pristudy-nav-btn-label">
                {formatNavDate(new Date(new Date(targetDate).setDate(new Date(targetDate).getDate() + 1)).toISOString().slice(0, 10))}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <div className="pristudy-nav-btn next disabled" />
          )}
        </div>

        <button 
          className="pristudy-daily-list-btn"
          onClick={() => navigate('/pristudy#daily')}
        >
          Daily List
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="pristudy-empty">데이터를 불러오는 중입니다...</div>
      ) : dailyContent ? (
        <>
          <div className="pristudy-card-container">
            <div className="pristudy-card unified">
              <div className="pristudy-card-face">
                <div className="pristudy-content-header">
                  <span className="pristudy-tag">오늘의 1-Pick</span>
                  <button className="pristudy-audio-btn main-audio" onClick={(e) => playAudio(dailyContent.sentence_jp, e)} title="문장 발음 듣기">
                    🔊 문장 듣기
                  </button>
                </div>

                <div className="pristudy-jp">{dailyContent.sentence_jp}</div>
                <div className="pristudy-furigana">{dailyContent.sentence_furigana}</div>
                {dailyContent.sentence_pronunciation_kr && (
                  <div className="pristudy-pronunciation">{dailyContent.sentence_pronunciation_kr}</div>
                )}
                
                <div className="pristudy-kr">{dailyContent.sentence_kr}</div>
                
                {dailyContent.business_context && (
                  <div className="pristudy-comment-box">
                    <div className="pristudy-comment-title">💡 비즈니스 팁</div>
                    <div className="pristudy-comment">{dailyContent.business_context}</div>
                  </div>
                )}
                
                {dailyContent.vocabulary && dailyContent.vocabulary.length > 0 && (
                  <div className="pristudy-vocab-section">
                    <div className="pristudy-vocab-title">📚 단어장</div>
                    <div className="pristudy-vocab-list">
                      {dailyContent.vocabulary.map((v, i) => (
                        <div key={i} className="pristudy-vocab-card">
                          <div className="pristudy-vocab-info">
                            <span className="pristudy-vocab-word">{v.word}</span>
                            <span className="pristudy-vocab-reading">({v.reading})</span>
                            {v.pronunciation_kr && <span className="pristudy-vocab-pronunciation">[{v.pronunciation_kr}]</span>}
                            <span className="pristudy-vocab-meaning">- {v.meaning}</span>
                          </div>
                          <button className="pristudy-audio-btn vocab-audio" onClick={(e) => playAudio(v.word, e)} title="단어 발음 듣기">🔊</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            className="pristudy-done-btn" 
            onClick={showAuth ? handleGoogleLogin : markCompleted} 
            disabled={!showAuth && (isTodayCompleted || isMarking)}
          >
            {isTodayCompleted ? '🎉 오늘의 학습 완료' : '✅ 다 외웠어요 (잔디 심기)'}
          </button>

          {/* 잔디 심기 컴포넌트 */}
          <section className="pristudy-streak-section">
            <div className="pristudy-streak-header">
              <h2>나의 학습 기록</h2>
              <div className="pristudy-streak-stats">
                <span>현재 연속: <strong>{progress?.current_streak || 0}일</strong></span>
                <span>최장 연속: <strong>{progress?.longest_streak || 0}일</strong></span>
              </div>
            </div>
            
            <div className="pristudy-graph">
              {last7Days.map(date => {
                const isDone = progress?.completed_dates?.includes(date);
                const isToday = date === todayStr;
                const d = new Date(date);
                const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
                const dateLabel = d.getDate();
                
                return (
                  <div 
                    key={date} 
                    className={`pristudy-graph-item ${isDone ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                    title={`${date} ${isDone ? '(완료)' : '(미완료)'}`}
                  >
                    <span className="pristudy-graph-dayname">{dayName}</span>
                    <div className="pristudy-graph-box">
                      {isDone ? '🌿' : ''}
                    </div>
                    <span className="pristudy-graph-date">{dateLabel}일</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, textAlign: 'right' }}>
              * 최근 7일간의 기록입니다.
            </p>
          </section>
        </>
      ) : (
        <div className="pristudy-empty">
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <h2>아직 오늘의 학습 데이터가 준비되지 않았습니다.</h2>
          <p>AI가 매일 새벽 새로운 문장을 생성합니다.</p>
        </div>
      )}
    </div>
  );
}
