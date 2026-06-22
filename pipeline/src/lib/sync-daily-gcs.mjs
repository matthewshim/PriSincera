/**
 * sync-daily-gcs — 어드민 콘텐츠 수정 → 트랙별 GCS JSON 동기화 (Data Contract v2 §1)
 *
 * 사업계획서 6.2.3(신규) + 6.4.3(동시성/Latency 방어) 구현.
 * - 어드민이 데일리 트랙 콘텐츠/액션 챌린지를 수정하면 트랙 JSON + index를 GCS에 즉시 반영.
 * - 동일 날짜에 대한 동시 요청은 **per-key 직렬 큐**로 순서를 보장(GCS write race 방지).
 * - **낙관적 락(Optimistic Lock)**: expectedVersion 불일치 시 409 충돌로 거부.
 * - Cloudflare 캐시 퍼지는 주입형(purgeCache)으로, 미구성 시 무해한 no-op.
 *
 * writeJSON/readJSON/purgeCache/now를 주입받아 GCS 없이도 단위 테스트 가능.
 */

/**
 * @param {object} deps
 * @param {(path:string, data:object)=>Promise<void>} deps.writeJSON
 * @param {(path:string)=>Promise<object|null>} deps.readJSON
 * @param {(paths:string[])=>Promise<void>} [deps.purgeCache]  생략 시 no-op
 * @param {()=>string} [deps.now]  ISO timestamp 생성기(테스트 주입용)
 */
export function createDailyGcsSync({ writeJSON, readJSON, purgeCache, now }) {
  if (typeof writeJSON !== 'function' || typeof readJSON !== 'function') {
    throw new Error('writeJSON, readJSON는 필수입니다.');
  }
  const ts = now || (() => new Date().toISOString());
  const purge = purgeCache || (async () => {});

  // 직렬 큐: Promise 체인으로 순차 실행.
  // ⚠️ daily/index.json은 모든 날짜가 공유하는 단일 자원이므로, 서로 다른 날짜라도
  //    index를 동시에 read-modify-write하면 lost update가 발생한다. 따라서 날짜별이 아닌
  //    단일 글로벌 키(INDEX_KEY)로 모든 sync를 직렬화하여 index 경합을 원천 차단한다.
  //    (다중 인스턴스 환경의 cross-process 경합은 GCS generation precondition으로 별도 보강 필요 — 미결)
  const chains = new Map();
  const INDEX_KEY = '__daily_index__';

  function enqueue(key, job) {
    const prev = chains.get(key) || Promise.resolve();
    // 이전 작업의 성패와 무관하게 다음 작업을 잇는다(큐가 막히지 않도록)
    const next = prev.catch(() => {}).then(job);
    chains.set(key, next);
    // 큐 정리: 이 작업이 마지막이면 맵에서 제거(메모리 누수 방지).
    // cleanup 분기는 next의 거부를 전파하므로 별도로 swallow하여 unhandledRejection을 막는다.
    // (호출자에게 반환되는 next는 그대로 거부를 전달한다)
    next.finally(() => { if (chains.get(key) === next) chains.delete(key); }).catch(() => {});
    return next;
  }

  /**
   * @param {string} dateStr  'YYYY-MM-DD'
   * @param {object} feeds    { junior: Feed, senior: Feed }  (계약 §1.2 형상)
   * @param {object} [opts]
   * @param {number} [opts.expectedVersion]  낙관적 락 기대 버전(생략 시 검사 생략)
   * @returns {Promise<{ok:true, version:number, purged:string[]}>}
   */
  function syncDailyGcs(dateStr, feeds, opts = {}) {
    return enqueue(INDEX_KEY, async () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) {
        throw new Error(`잘못된 날짜 형식: ${dateStr}`);
      }
      const tracks = ['junior', 'senior'];
      for (const tk of tracks) {
        const f = feeds?.[tk];
        if (!f || !Array.isArray(f.cards)) {
          throw new Error(`'${tk}' 트랙 피드(cards)가 유효하지 않습니다.`);
        }
      }

      // ─── 낙관적 락: 현재 index의 버전과 대조 ───
      let index = await readJSON('daily/index.json');
      if (!index || typeof index !== 'object') index = {};
      const currentVersion = Number(index.version || 0);
      if (opts.expectedVersion != null && Number(opts.expectedVersion) !== currentVersion) {
        const err = new Error(`버전 충돌: expected ${opts.expectedVersion}, actual ${currentVersion}`);
        err.code = 'VERSION_CONFLICT';
        err.status = 409;
        throw err;
      }

      // ─── 트랙 JSON 가산 배포 ───
      const updatedAt = ts();
      const paths = [];
      for (const tk of tracks) {
        const path = `daily/${tk}_${dateStr}.json`;
        await writeJSON(path, { ...feeds[tk], schemaVersion: 2, date: dateStr, track: tk, generatedAt: updatedAt });
        paths.push(path);
      }

      // ─── index 갱신(dates 보존 + tracks 가산 + version 증가) ───
      if (!Array.isArray(index.dates)) index.dates = [];
      if (!index.dates.includes(dateStr)) {
        index.dates.push(dateStr);
        index.dates.sort((a, b) => b.localeCompare(a));
      }
      index.schemaVersion = 2;
      index.tracks = tracks;
      index.version = currentVersion + 1;
      index.updatedAt = updatedAt;
      await writeJSON('daily/index.json', index);
      paths.push('daily/index.json');

      // ─── Cloudflare 캐시 퍼지(비차단·주입형) ───
      await purge(paths);

      return { ok: true, version: index.version, purged: paths };
    });
  }

  return { syncDailyGcs };
}

export default createDailyGcsSync;
