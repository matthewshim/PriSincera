/**
 * OrbitSection — ReLearn Stage ② 실행: 이번 주 궤도 리스트 + AI 추천
 *
 * Phase B-0 3/3: 프레젠테이션은 리런 시안(v4) 기준 신작, 데이터·뮤테이션은
 * usePaceNoteData(웹 REST ↔ 데스크톱 IPC 단일 계약)를 셸에서 받아 사용한다.
 * (PaceNoteDashboard는 무접촉 — 로직 단일화는 데이터 계층에서 달성)
 *
 * props:
 *   current   — usePaceNoteData().data.current ({ currentPace, recommendedPace, ... })
 *   onToggle  — (taskId) => Promise  (완료 토글)
 *   onAccept  — (taskId) => Promise  (추천 수락)
 *   affinity  — profile.domainAffinity (nullable — 추천 사유 라벨용)
 */
import { useState } from 'react';
import './ReLearnSections.css';

// 성장 루프 affinity 키 정규화 — pacenote-api recordSignal 과 동일 규칙
const affKey = (c) => String(c || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function OrbitSection({ current, onToggle, onAccept, affinity = null }) {
  const [busyId, setBusyId] = useState(null);

  const pace = current?.currentPace || [];
  const recs = current?.recommendedPace || [];
  const done = pace.filter(t => t.completed).length;
  const total = pace.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const run = async (id, fn) => {
    if (busyId) return;
    setBusyId(id);
    try { await fn(id); } catch (e) { console.error('[OrbitSection]', e); }
    finally { setBusyId(null); }
  };

  return (
    <div className="rl-orbit">
      <div className="rl-card">
        <div className="rl-progress-row">
          <div className="rl-progress-track"><div className="rl-progress-fill" style={{ width: `${pct}%` }} /></div>
          <span className="rl-progress-num">{done}/{total} 완료 · {pct}%</span>
        </div>
        <div className="rl-orbit-list">
          {pace.map(task => (
            <div key={task.id} className={`rl-orbit-item ${task.completed ? 'done' : ''}`}>
              <button
                className="rl-orbit-check haptic-trigger"
                onClick={() => run(task.id, onToggle)}
                disabled={busyId === task.id}
                aria-label={task.completed ? '완료 해제' : '완료'}
              >
                {task.completed ? '✓' : ''}
              </button>
              <span className="rl-orbit-t">{task.title}</span>
              {task.category && (
                <span className="rl-orbit-cat" style={{ color: task.color || 'var(--color-indigo)', background: 'rgba(255,255,255,0.05)' }}>
                  {task.category}
                </span>
              )}
            </div>
          ))}
          {pace.length === 0 && (
            <div className="rl-empty">아직 이번 주 궤도가 없어요 — 위 배움에서 “궤도로” 한 번이면 시작됩니다.</div>
          )}
        </div>
      </div>

      {recs.length > 0 && (
        <div className="rl-recs">
          <div className="rl-recs-head">✦ AI 추천 — 다음 궤도</div>
          {recs.map(item => {
            const hasAffinity = affinity && Object.keys(affinity).length > 0;
            const reason = hasAffinity ? (affinity[affKey(item.category)] > 0 ? 'strong' : 'stretch') : null;
            return (
              <div key={item.id} className="rl-rec-item">
                <span className="rl-rec-star" style={{ color: item.color || 'var(--color-indigo)' }}>✦</span>
                <span className="rl-rec-t">{item.title}</span>
                {reason === 'strong' && <span className="rl-rec-reason strong">강점 기반</span>}
                {reason === 'stretch' && <span className="rl-rec-reason stretch">새 도전</span>}
                <button
                  className="rl-rec-add haptic-trigger"
                  onClick={() => run(item.id, onAccept)}
                  disabled={busyId === item.id}
                >
                  {busyId === item.id ? '…' : '＋ 추가'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
