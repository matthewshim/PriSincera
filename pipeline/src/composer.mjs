#!/usr/bin/env node
/**
 * PriSignal Composer — 매주 일요일 08:00 KST 실행
 *
 * 1. 주간 후보 풀 로드 (7일치 누적)
 * 2. Gemini Flash로 SIGNAL 스코어링
 * 3. Tier 가중치 적용 + 다양성 보장 선정 (3~5개)
 * 4. 에디터 코멘트 + 에디터 노트 자동 생성
 * 5. Markdown 뉴스레터 조립
 * 6. Buttondown API로 예약 발송 생성 (월요일 08:00 KST)
 * 7. 발행 이력 GCS 저장
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { scoreArticles, generateComments, generateEditorNote } from './lib/gemini.mjs';
import { applyTierWeights, selectArticles, assembleNewsletter } from './lib/scoring.mjs';
import {
  readJSON, writeJSON, getCandidatesPath, getIssuePath,
  getLastIssueNumber, setLastIssueNumber, getNextMondaySendTime,
} from './lib/storage.mjs';
import { scheduleEmail } from './lib/buttondown.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════');
  console.log('🤖 PriSignal Composer 시작');
  console.log(`   시각: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════');

  // 설정 로드
  const configPath = join(__dirname, '..', 'config', 'sources.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const settings = config.settings;

  // 1. 주간 후보 풀 로드
  const candidatesPath = getCandidatesPath();
  const candidatesData = await readJSON(candidatesPath);

  if (!candidatesData || !candidatesData.articles || candidatesData.articles.length === 0) {
    console.error('❌ 후보 풀이 비어있습니다. Collector가 정상 실행되었는지 확인하세요.');
    // 이전 주 후보에서 보충 시도 (Backfill)
    console.log('[Composer] 이전 주 후보 풀에서 보충을 시도합니다...');
    // 간단한 backfill: 현재는 빈 상태로 기본 뉴스레터 발송
    await sendFallbackNewsletter(settings);
    return;
  }

  const candidates = candidatesData.articles;
  console.log(`[Composer] 후보 풀 로드: ${candidates.length}개 아티클`);

  // 2. AI 스코어링
  console.log('\n--- Phase 1: SIGNAL 스코어링 ---');
  const scored = await scoreArticles(candidates);

  // 3. Tier 가중치 적용 + 선정
  console.log('\n--- Phase 2: 선정 ---');
  const weighted = applyTierWeights(scored);
  const selected = selectArticles(weighted, settings);

  if (selected.length === 0) {
    console.error('❌ 선정된 아티클이 없습니다.');
    await sendFallbackNewsletter(settings);
    return;
  }

  // 4. 에디터 코멘트 생성
  console.log('\n--- Phase 3: 에디터 코멘트 생성 ---');
  const withComments = await generateComments(selected);

  // 5. 에디터 노트 + 제목 생성
  console.log('\n--- Phase 4: 에디터 노트 생성 ---');
  const { editorNote, closingRemark, subject } = await generateEditorNote(withComments);

  // 6. 뉴스레터 조립
  const issueNumber = (await getLastIssueNumber()) + 1;
  const issueStr = String(issueNumber).padStart(3, '0');

  const body = assembleNewsletter({
    issueNumber,
    editorNote,
    articles: withComments,
    closingRemark,
  });

  const emailSubject = `📡 PriSignal #${issueStr} — ${subject}`;

  console.log(`\n[Composer] 뉴스레터 조립 완료:`);
  console.log(`   제목: ${emailSubject}`);
  console.log(`   아티클: ${withComments.length}개`);
  console.log(`   본문 길이: ${body.length}자`);

  // 7. Buttondown 예약 발송
  console.log('\n--- Phase 5: 예약 발송 ---');
  const publishDate = getNextMondaySendTime();
  const emailResult = await scheduleEmail(emailSubject, body, publishDate);

  // 8. 발행 이력 저장
  const targetDate = candidatesPath.replace('candidates/', '').replace('.json', '');
  await writeJSON(getIssuePath(targetDate), {
    issueNumber,
    subject: emailSubject,
    buttondownEmailId: emailResult.id,
    publishDate,
    articleCount: withComments.length,
    articles: withComments.map(a => ({
      id: a.id,
      title: a.title,
      url: a.url,
      source: a.source,
      category: a.category,
      tier: a.tier,
      weightedScore: a.weightedScore,
    })),
    createdAt: new Date().toISOString(),
  });

  await setLastIssueNumber(issueNumber);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Composer 완료 (${elapsed}초)`);
  console.log(`   이슈: #${issueStr}`);
  console.log(`   아티클: ${withComments.length}개`);
  console.log(`   발송 예정: ${publishDate}`);
  console.log(`   Buttondown ID: ${emailResult.id}`);
  console.log('═══════════════════════════════════════');
}

/**
 * 후보가 없거나 선정이 실패한 경우의 폴백 뉴스레터 발송.
 * "절대 건너뛰지 않는다" 원칙을 보장합니다.
 */
async function sendFallbackNewsletter(settings) {
  console.log('[Fallback] 폴백 뉴스레터를 생성합니다...');

  const issueNumber = (await getLastIssueNumber()) + 1;
  const issueStr = String(issueNumber).padStart(3, '0');

  const body = [
    '✍️ **에디터 노트**\n',
    '이번 주는 시그널 수집 과정에서 기술적인 이슈가 있었습니다.',
    '다음 주에는 더 신선하고 깊이 있는 시그널들로 돌아오겠습니다.\n',
    '---\n',
    '💬 **이번 주의 한 마디**\n',
    '때로는 멈춰서 방향을 재확인하는 것도 중요한 시그널입니다.\n',
    '---\n',
    '🔗 [prisincera.com에서 더 보기](https://www.prisincera.com/prisignal)',
  ].join('\n');

  const subject = `📡 PriSignal #${issueStr} — 잠시 재정비`;
  const publishDate = getNextMondaySendTime();

  const emailResult = await scheduleEmail(subject, body, publishDate);
  await setLastIssueNumber(issueNumber);

  console.log(`[Fallback] ✅ 폴백 뉴스레터 예약 완료: ${emailResult.id}`);
}

main().catch(err => {
  console.error('❌ Composer 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
});
