/**
 * ReflectionSection — ReLearn Stage ③ 복기: 한 줄 항해 일지 (디바운스 자동 저장)
 *
 * Phase B-0 3/3: 프레젠테이션은 리런 시안(v4) 기준 신작, 저장은 usePaceNoteData의
 * saveDiary(기존 /diary API — 성장 루프 회고 신호 적재 포함)를 셸에서 받아 사용.
 *
 * props:
 *   statement — 현재 저장된 회고 (usePaceNoteData().data.current.statement)
 *   onSave    — (text) => Promise  (saveDiary)
 */
import { useState, useEffect, useRef } from 'react';
import './ReLearnSections.css';

const MAX_LEN = 1000;   // pacenote-api /diary 제한과 동일
const DEBOUNCE_MS = 1200;

export default function ReflectionSection({ statement = '', onSave }) {
  const [text, setText] = useState(statement);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const timerRef = useRef(null);
  const lastSavedRef = useRef(statement);

  // 서버에서 새 statement가 오면 동기화 (편집 중이 아닐 때만)
  useEffect(() => {
    setText(prev => (prev === lastSavedRef.current ? statement : prev));
    lastSavedRef.current = statement;
  }, [statement]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleChange = (e) => {
    const next = e.target.value.slice(0, MAX_LEN);
    setText(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (next === lastSavedRef.current) return;
      setStatus('saving');
      try {
        await onSave(next);
        lastSavedRef.current = next;
        setStatus('saved');
      } catch (err) {
        console.error('[ReflectionSection] save 실패:', err);
        setStatus('error');
      }
    }, DEBOUNCE_MS);
  };

  return (
    <div className="rl-card rl-reflect">
      <textarea
        className="rl-reflect-area"
        value={text}
        onChange={handleChange}
        placeholder="오늘의 실행을 한 줄로 — 이 기록이 내일의 배움과 추천을 바꿉니다."
        maxLength={MAX_LEN}
        spellCheck={false}
      />
      <div className="rl-reflect-foot">
        <span className={`rl-reflect-save ${status}`}>
          {status === 'saving' && '● 저장 중…'}
          {status === 'saved' && '● 자동 저장됨'}
          {status === 'error' && '● 저장 실패 — 잠시 후 다시 시도됩니다'}
          {status === 'idle' && (text ? '● 저장됨' : '')}
        </span>
        <span className="rl-reflect-count">{text.length}/{MAX_LEN}</span>
      </div>
    </div>
  );
}
