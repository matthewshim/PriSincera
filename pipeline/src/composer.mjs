#!/usr/bin/env node
/**
 * PriSignal Composer — 매일 07:00 KST 실행
 *
 * [Daily Model v3 — 자체 발송]
 * 1. 오늘의 데일리 JSON 로드 (Collector 결과)
 * 2. Gemini Flash로 전체 아티클 SIGNAL 스코어링
 * 3. Tier 가중치 적용
 * 4. 상위 5개 DM 픽 선정
 * 5. DM 픽에 에디터 코멘트 생성
 * 6. 스코어링된 데일리 JSON 갱신 (dm_picks 포함)
 * 7. Gmail SMTP로 전체 구독자에게 HTML 이메일 발송
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { scoreArticles, generateComments } from './lib/gemini.mjs';
import { applyTierWeights, selectTopN } from './lib/scoring.mjs';
import { getTodayKST } from './lib/storage.mjs';
import { getDailySignal, saveDailySignal } from './repositories/DailyRepository.mjs';
import { filterAndCapArticles, mapEditorComments } from './services/ScoringService.mjs';
import { dispatchDailyEmail, isEmailAlreadySent } from './services/MailService.mjs';
import { getActiveSubscribers } from './lib/subscribers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const startTime = Date.now();
  const todayStr = process.env.TARGET_DATE || getTodayKST();

  console.log('═══════════════════════════════════════');
  console.log('🤖 PriSignal Composer v2 (Daily) 시작');
  console.log(`   날짜: ${todayStr}`);
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 설정 로드
  const configPath = join(__dirname, '..', 'config', 'sources.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const settings = config.settings;

  // 1. 오늘 데일리 데이터 로드
  const dailyData = await getDailySignal(todayStr);

  if (!dailyData || !dailyData.articles || dailyData.articles.length === 0) {
    console.log('[Composer] 오늘 수집된 아티클이 없습니다.');
    // 빈 데일리를 scored 상태로 업데이트 (페이지에서 빈 상태 표시)
    await saveDailySignal(todayStr, {
      date: todayStr,
      status: 'scored',
      total: 0,
      articles: [],
      dm_picks: [],
      scoredAt: new Date().toISOString(),
    });
    console.log('[Composer] 빈 데일리 상태 갱신. DM 발송 스킵. 종료.');
    return;
  }

  const candidates = dailyData.articles;
  console.log(`[Composer] 오늘 아티클: ${candidates.length}개`);

  // 2. AI 스코어링 (전체 아티클)
  console.log('\n--- Phase 1: SIGNAL 스코어링 ---');
  const scored = await scoreArticles(candidates);

  // 3. Tier 가중치 적용
  console.log('\n--- Phase 2: 가중치 + 선정 ---');
  const weighted = applyTierWeights(scored);

  // 4. 상위 5개 DM 픽 선정
  const dmPicks = selectTopN(weighted, settings.dmPickCount || 5);

  if (dmPicks.length === 0) {
    console.error('❌ DM 픽 선정 실패.');
    await saveAndExit(todayStr, weighted, []);
    return;
  }

  // 5. DM 픽에 에디터 코멘트 생성
  console.log('\n--- Phase 3: 에디터 코멘트 ---');
  const dmWithComments = await generateComments(dmPicks);
  const dmPickIds = dmWithComments.map(a => a.id);

  // 6. 품질 필터링 — 카테고리별 최소 보장 + 점수 필터 + 카테고리별 캡
  const { filteredArticles, catSummary } = filterAndCapArticles(weighted, dmPickIds);
  console.log(`[Composer] 품질 필터: ${weighted.length}개 → ${filteredArticles.length}개`);
  console.log(`[Composer] 카테고리별: ${catSummary}`);

  // 7. 스코어링된 데일리 데이터 갱신
  const finalArticles = mapEditorComments(filteredArticles, dmWithComments, dmPickIds);

  await saveDailySignal(todayStr, {
    date: todayStr,
    status: 'scored',
    total: finalArticles.length,
    dmPickCount: dmWithComments.length,
    articles: finalArticles,
    dm_picks: dmPickIds,
    scoredAt: new Date().toISOString(),
  });

  console.log(`[Composer] 데일리 데이터 갱신 완료: ${finalArticles.length}개 (DM 픽 ${dmWithComments.length}개)`);

  // 8. Gmail SMTP 자체 발송
  console.log('\n--- Phase 4: 이메일 발송 (Gmail SMTP) ---');

  // 정규 발송 시간(KST 08:00) 트리거 오차를 고려해 07:50 이후면 발송 허용 (테스트 시 FORCE_DISPATCH=true로 우회)
  const now = new Date();
  const kstHours = (now.getUTCHours() + 9) % 24;
  const kstMinutes = now.getUTCMinutes();
  const isTooEarly = kstHours < 7 || (kstHours === 7 && kstMinutes < 50);

  if (isTooEarly && process.env.FORCE_DISPATCH !== 'true') {
    console.log(`[Composer] ⏰ 현재 시간(${kstHours}시 ${kstMinutes}분)은 정규 발송 시간(08:00 KST) 전입니다. 발송 대기...`);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Composer v3 완료 (${elapsed}초) — 발송 시간 대기 스킵`);
    return;
  }

  // 오늘 이미 발송했는지 확인
  const alreadySent = await isEmailAlreadySent(todayStr);
  if (alreadySent) {
    console.log(`[Composer] 🛑 이미 오늘(${todayStr}) 메일이 발송되었습니다. 중복 발송을 방지합니다.`);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Composer v3 완료 (${elapsed}초) — 중복 발송 스킵`);
    return;
  }

  // 구독자 목록 조회
  const subscribers = await getActiveSubscribers();
  console.log(`[Composer] 활성 구독자: ${subscribers.length}명`);

  // PriStudy 데일리 문장 로드 (오늘자)
  const { getStudyContent } = await import('./repositories/StudyRepository.mjs');
  const studyData = await getStudyContent(todayStr);
  if (studyData) {
    console.log(`[Composer] PriStudy 오늘의 1문장 로드 완료`);
  }

  let emailResult = { sent: 0, total: 0 };
  
  if (subscribers.length > 0) {
    emailResult = await dispatchDailyEmail(todayStr, finalArticles, subscribers, studyData);
  } else {
    console.log('[Composer] 구독자가 없습니다. 이메일 발송 스킵.');
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Composer v3 완료 (${elapsed}초)`);
  console.log(`   날짜: ${todayStr}`);
  console.log(`   전체 아티클: ${finalArticles.length}개`);
  console.log(`   DM 픽: ${dmWithComments.length}개`);
  console.log(`   발송: ${emailResult.sent}/${emailResult.total}건 성공`);
  console.log('═══════════════════════════════════════');
}

/** 스코어링까지만 저장하고 종료 */
async function saveAndExit(todayStr, articles, dmPicks) {
  await saveDailySignal(todayStr, {
    date: todayStr,
    status: 'scored',
    total: articles.length,
    dmPickCount: 0,
    articles: articles.sort((a, b) => b.weightedScore - a.weightedScore),
    dm_picks: dmPicks,
    scoredAt: new Date().toISOString(),
  });
  console.log('[Composer] 스코어링만 저장 완료. DM 발송 스킵.');
}



main().catch(err => {
  console.error('❌ Composer 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
