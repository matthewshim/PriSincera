/**
 * DailyWeekStrip — 아카이브 상세 주간 달력 네비 (히어로 정합 2026-07-22)
 *
 * 이전/다음 pill 2개를 대체하는 월~일 7칸 주간 스트립 (PaceNote Bento Weekly 선례 계승).
 * 다이제스트 존재 여부는 /api/daily/index(상위에서 페치)로 판정 — 신규 API 0.
 * 좌우 화살표 = 주 단위 이동(그 방향에 아카이브가 더 없으면 비활성).
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackRelearn } from '../relearn/funnel';

const DOW_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

const parse = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toISO = (dt) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
const addDays = (dt, n) => {
  const d = new Date(dt);
  d.setDate(d.getDate() + n);
  return d;
};
/** 해당 날짜가 속한 주의 월요일 */
const mondayOf = (dt) => addDays(dt, -((dt.getDay() + 6) % 7));

export default function DailyWeekStrip({ date, dates }) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = 현재 날짜가 속한 주
  useEffect(() => { setWeekOffset(0); }, [date]);  // 날짜 이동 시 그 날짜의 주로 복귀

  const available = new Set(dates || []);
  const weekStart = addDays(mondayOf(parse(date)), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = addDays(weekStart, i);
    const iso = toISO(dt);
    return { iso, dow: DOW_LABELS[i], num: dt.getDate() };
  });

  // 화살표: 그 방향에 아카이브 날짜가 더 존재할 때만 활성 (dates는 최신순)
  const newest = dates?.[0] || null;
  const oldest = dates?.length ? dates[dates.length - 1] : null;
  const canPrev = !!oldest && oldest < days[0].iso;
  const canNext = !!newest && newest > days[6].iso;

  // 주 범위 라벨: "7월 21일 – 27일" (월이 걸치면 각각 표기)
  const first = parse(days[0].iso), last = parse(days[6].iso);
  const label = first.getMonth() === last.getMonth()
    ? `${first.getMonth() + 1}월 ${first.getDate()}일 – ${last.getDate()}일`
    : `${first.getMonth() + 1}월 ${first.getDate()}일 – ${last.getMonth() + 1}월 ${last.getDate()}일`;

  return (
    <nav className="rl-week" aria-label="주간 아카이브 달력">
      <div className="rl-week-head">
        <button
          className="rl-week-arrow haptic-trigger"
          onClick={() => setWeekOffset(o => o - 1)}
          disabled={!canPrev}
          aria-label="이전 주"
        >←</button>
        <span className="rl-week-label">{label}</span>
        <button
          className="rl-week-arrow haptic-trigger"
          onClick={() => setWeekOffset(o => o + 1)}
          disabled={!canNext}
          aria-label="다음 주"
        >→</button>
      </div>
      <div className="rl-week-days">
          {days.map(d => {
            const isCurrent = d.iso === date;
            const has = available.has(d.iso);
            if (isCurrent) {
              return (
                <span key={d.iso} className="rl-week-day on" aria-current="date">
                  <span className="rl-week-dow">{d.dow}</span>
                  <span className="rl-week-num">{d.num}</span>
                </span>
              );
            }
            if (has) {
              return (
                <Link
                  key={d.iso}
                  className="rl-week-day haptic-trigger"
                  to={`/relearn/daily/${d.iso}`}
                  onClick={() => trackRelearn('relearn_daily_jump', { zone: 'week_strip' })}
                >
                  <span className="rl-week-dow">{d.dow}</span>
                  <span className="rl-week-num">{d.num}</span>
                </Link>
              );
            }
            return (
              <span key={d.iso} className="rl-week-day off" aria-disabled="true">
                <span className="rl-week-dow">{d.dow}</span>
                <span className="rl-week-num">{d.num}</span>
              </span>
            );
          })}
      </div>
    </nav>
  );
}
