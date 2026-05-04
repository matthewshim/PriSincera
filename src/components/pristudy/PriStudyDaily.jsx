import React from 'react';
import AuthModal from './AuthModal';

export default function PriStudyDaily({
  showAuth, loading, dailyContent, isFlipped, setIsFlipped,
  playAudio, markCompleted, isTodayCompleted, isMarking,
  progress, last7Days, todayStr, handleLoginSuccess, userEmail, handleLogout
}) {
  return (
    <div className="pristudy-daily-wrapper">
      {userEmail && (
        <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
          접속 중: {userEmail} <button onClick={handleLogout} style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', marginLeft: 8 }}>로그아웃</button>
        </div>
      )}

      {showAuth ? (
        <AuthModal onSuccess={handleLoginSuccess} />
      ) : loading ? (
        <div className="pristudy-empty">데이터를 불러오는 중입니다...</div>
      ) : dailyContent ? (
        <>
          <div className="pristudy-card-container">
            <div className={`pristudy-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
              {/* 앞면: 일본어 */}
              <div className="pristudy-card-face">
                <span className="pristudy-tag">오늘의 1-Pick</span>
                <div className="pristudy-jp">{dailyContent.sentence_jp}</div>
                <div className="pristudy-furigana">{dailyContent.sentence_furigana}</div>
                
                <button className="pristudy-audio-btn" onClick={playAudio} title="발음 듣기">
                  🔊
                </button>
                <div className="pristudy-flip-hint">화면을 탭하여 뜻과 해설 보기</div>
              </div>

              {/* 뒷면: 해석 및 해설 */}
              <div className="pristudy-card-face pristudy-card-back">
                <span className="pristudy-tag">해석 및 코멘트</span>
                <div className="pristudy-kr">{dailyContent.sentence_kr}</div>
                
                {dailyContent.vocabulary && dailyContent.vocabulary.length > 0 && (
                  <div className="pristudy-vocab">
                    {dailyContent.vocabulary.map((v, i) => (
                      <div key={i} className="pristudy-vocab-item">
                        <span className="pristudy-vocab-word">{v.word}</span>
                        <span>({v.reading})</span>
                        <span style={{ color: 'var(--text-secondary)' }}>- {v.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {dailyContent.business_context && (
                  <div className="pristudy-comment">
                    {dailyContent.business_context}
                  </div>
                )}
                <div className="pristudy-flip-hint" style={{ marginTop: 'auto' }}>다시 탭하여 원문 보기</div>
              </div>
            </div>
          </div>

          <button 
            className="pristudy-done-btn" 
            onClick={markCompleted} 
            disabled={isTodayCompleted || isMarking}
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
                const dateLabel = date.split('-')[2]; // 일만 표시
                return (
                  <div 
                    key={date} 
                    className={`pristudy-graph-day ${isDone ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                    title={`${date} ${isDone ? '(완료)' : '(미완료)'}`}
                  >
                    {dateLabel}
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
