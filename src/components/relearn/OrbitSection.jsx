/**
 * OrbitSection — ReLearn Stage ② 실행: 이번 주 궤도 리스트 + AI 추천
 *
 * Phase B-0 3/3: 프레젠테이션은 리런 시안(v4) 기준 신작, 데이터·뮤테이션은
 * usePaceNoteData(웹 REST ↔ 데스크톱 IPC 단일 계약)를 셸에서 받아 사용한다.
 * (구 PaceNote 대시보드의 궤도 UI를 승계 — 데이터 계층은 usePaceNoteData로 단일화)
 *
 * props:
 *   current   — usePaceNoteData().data.current ({ currentPace, recommendedPace, ... })
 *   onToggle  — (taskId) => Promise  (완료 토글)
 *   onAccept  — (taskId) => Promise  (추천 수락)
 *   onAdd     — (title) => Promise   (커스텀 궤도 자유 입력 — 패리티 P1, /add 100자 제한)
 *   affinity  — profile.domainAffinity (nullable — 추천 사유 라벨용)
 */
import { useEffect, useMemo, useState } from 'react';
import './ReLearnSections.css';

const ADD_MAX = 100; // pacenote-api /add 제한과 동일

// 성장 루프 affinity 키 정규화 — pacenote-api recordSignal 과 동일 규칙
const affKey = (c) => String(c || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export default function OrbitSection({ current, onToggle, onAccept, onAdd, onExclude, onRestore, affinity = null }) {
  const [busyId, setBusyId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title || !onAdd || adding) return;
    setAdding(true);
    try {
      await onAdd(title);
      setNewTitle('');
    } catch (e) { console.error('[OrbitSection] add 실패:', e); }
    finally { setAdding(false); }
  };

  // 제외(excluded)된 궤도는 목록·진행률에서 숨기되 데이터는 보존 — 하단 접기에서 복원 가능
  const allPace = current?.currentPace || [];
  const pace = allPace.filter(t => !t.excluded);
  const excludedPace = allPace.filter(t => t.excluded);
  const recs = current?.recommendedPace || [];

  // ── 궤도 검색 모달 (PaceNote 옴니 검색 승계): 추천 풀 검색 + 커스텀 추가 결합 ──
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const filteredRecs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recs;
    return recs.filter(r =>
      (r.title || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q)
    );
  }, [recs, query]);
  const navigable = useMemo(() => {
    const items = [];
    if (query.trim()) items.push({ id: '__custom__', title: query.trim(), isCustom: true });
    filteredRecs.forEach(r => items.push(r));
    return items;
  }, [query, filteredRecs]);
  useEffect(() => { setFocusIdx(0); }, [navigable.length]);
  const closeSearch = () => { setSearchOpen(false); setQuery(''); };
  const pickItem = async (item) => {
    if (!item) return;
    if (item.isCustom) { if (onAdd) await onAdd(item.title); }
    else if (onAccept) await onAccept(item.id);
    closeSearch();
  };
  const onSearchKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(p => (navigable.length ? (p + 1) % navigable.length : 0)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(p => (navigable.length ? (p - 1 + navigable.length) % navigable.length : 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); pickItem(navigable[focusIdx]); }
    else if (e.key === 'Escape') { closeSearch(); }
  };
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
              {!task.completed && onExclude && (
                <button
                  className="rl-orbit-del haptic-trigger"
                  title="목록에서 제외 (데이터는 보존되며 아래 '제외된 궤도'에서 복원 가능)"
                  aria-label="목록에서 제외"
                  onClick={() => onExclude(task.id)}
                >×</button>
              )}
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

        {/* 커스텀 궤도 자유 입력 (패리티 P1 — PaceNote 승계) */}
        {onAdd && (
          <div className="rl-add-row">
            <input
              className="rl-add-input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value.slice(0, ADD_MAX))}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="나만의 궤도 직접 추가 (예: 사이드 프로젝트 30분 진행하기)"
              maxLength={ADD_MAX}
            />
            <button className="rl-add-btn haptic-trigger" onClick={handleAdd} disabled={adding || !newTitle.trim()}>
              {adding ? '추가 중…' : '＋ 추가'}
            </button>
            <button className="rl-osearch-btn haptic-trigger" onClick={() => setSearchOpen(true)} title="누적 추천 궤도 검색">
              🔍 검색
            </button>
          </div>
        )}

        {/* ── 제외된 궤도 (복원 가능 — 데이터 보존) ── */}
        {excludedPace.length > 0 && (
          <details className="rl-fold rl-excluded-fold">
            <summary className="rl-fold-summary">제외된 궤도 {excludedPace.length}개 보기</summary>
            <div className="rl-excluded-list">
              {excludedPace.map(task => (
                <div key={task.id} className="rl-excluded-item">
                  <span className="rl-excluded-t">{task.title}</span>
                  {onRestore && (
                    <button className="rl-excluded-restore haptic-trigger" onClick={() => onRestore(task.id)}>
                      ↩ 복원
                    </button>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* ── 궤도 검색 모달 ── */}
        {searchOpen && (
          <div className="rl-osearch-backdrop" onClick={closeSearch}>
            <div className="rl-osearch-modal" role="dialog" aria-label="궤도 검색" onClick={e => e.stopPropagation()}>
              <div className="rl-osearch-inputrow">
                <span className="rl-osearch-ic">✨</span>
                <input
                  className="rl-osearch-input"
                  autoFocus
                  value={query}
                  onChange={e => { setQuery(e.target.value.slice(0, ADD_MAX)); }}
                  onKeyDown={onSearchKey}
                  placeholder="추천 궤도 검색 또는 새 궤도 입력 — ↑↓ 이동 · Enter 추가 · Esc 닫기"
                />
              </div>
              <div className="rl-osearch-list">
                {navigable.map((item, i) => (
                  <button
                    key={item.id}
                    className={`rl-osearch-item ${i === focusIdx ? 'focus' : ''}`}
                    onMouseEnter={() => setFocusIdx(i)}
                    onClick={() => pickItem(item)}
                  >
                    {item.isCustom
                      ? <><span className="rl-osearch-tag custom">새 궤도</span><span className="rl-osearch-t">"{item.title}" 직접 추가</span></>
                      : <><span className="rl-osearch-tag" style={{ color: item.color || 'var(--color-indigo)' }}>{item.category || '추천'}</span><span className="rl-osearch-t">{item.title}</span></>}
                  </button>
                ))}
                {navigable.length === 0 && <div className="rl-osearch-empty">검색 결과가 없어요 — 입력한 문장은 Enter로 새 궤도가 됩니다.</div>}
              </div>
            </div>
          </div>
        )}
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
