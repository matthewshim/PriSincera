/**
 * 꾸준함(practice) 통계 — 일자축 통일 Phase 1
 *
 * completedAt(ISO) 타임스탬프들을 KST 일자로 버킷팅해
 * "압박(끊기면 0) 아닌 격려(쌓임)" 프레이밍의 일 기반 통계를 만든다.
 * 권위 계산은 pacenote-composer 야간 reconcile 1곳에서만 수행한다.
 */

// 하루이틀 걸러도 연속 유지 — 활동일 사이 공백이 이 일수 이하면 이어진 것으로 본다
export const GRACE_MISSED_DAYS = 2;

/** ISO datetime → KST 일자 문자열 'YYYY-MM-DD' (파싱 불가 시 null) */
export function kstDateOf(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

// 'YYYY-MM-DD' 두 날짜의 차이(a - b, 일)
function dayDiff(a, b) {
  return Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
}

/**
 * @param {Iterable<string|null>} kstDates 활동일('YYYY-MM-DD') 목록 — 중복·null 허용
 * @param {string} todayKst 기준일 'YYYY-MM-DD' (KST)
 * @returns {{ monthDays, last7Days, current, best, lastActive }}
 *   monthDays  이번 달 실천 일수 (누적 프레이밍 — 초기 노출 우선)
 *   last7Days  최근 7일(오늘 포함) 중 실천 일수 (빈도 프레이밍)
 *   current    grace 연속 실천 일수 — 공백 ≤ GRACE_MISSED_DAYS 이면 유지
 *   best       역대 최장 grace 연속 일수
 *   lastActive 마지막 실천일 (없으면 null)
 */
export function computePractice(kstDates, todayKst) {
  const dates = [...new Set(kstDates)]
    .filter((d) => d && d <= todayKst)
    .sort()
    .reverse();

  const monthDays = dates.filter((d) => d.slice(0, 7) === todayKst.slice(0, 7)).length;
  const last7Days = dates.filter((d) => dayDiff(todayKst, d) < 7).length;

  let current = 0;
  if (dates.length && dayDiff(todayKst, dates[0]) <= GRACE_MISSED_DAYS) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      if (dayDiff(dates[i - 1], dates[i]) <= GRACE_MISSED_DAYS + 1) current++;
      else break;
    }
  }

  let best = 0, run = 0;
  for (let i = 0; i < dates.length; i++) {
    if (i === 0 || dayDiff(dates[i - 1], dates[i]) <= GRACE_MISSED_DAYS + 1) run++;
    else run = 1;
    best = Math.max(best, run);
  }

  return { monthDays, last7Days, current, best, lastActive: dates[0] || null };
}
