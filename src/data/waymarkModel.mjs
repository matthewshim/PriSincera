// Waymark 데이터 모델 — 컬렉션·열거형 단일 소스(SSOT).
// 접근은 전부 server REST(Bearer) → firebase-admin Firestore. 클라이언트 직접 접근은 firestore.rules가 차단한다.
// 값(키)은 영문 안정 키이며, 사용자 노출 라벨은 i18n에서 매핑한다.
// 참고: docs/waymark/system_architecture.md §3 · functional_spec.md §7-1

/** Firestore 컬렉션 이름 (공유 Firestore라 waymark_ 접두로 네임스페이스) */
export const COLLECTIONS = {
  users: 'waymark_users',
  decisions: 'waymark_decisions',           // 서브컬렉션: messages
  decisionMessages: 'messages',             // decisions/{id}/messages/{mid}
  events: 'waymark_events',                 // 먼저 찾아옴 스케줄
  stories: 'waymark_stories',               // 경험담(검수 전/후)
  storiesPublic: 'waymark_stories_public',  // 승인·익명 공개 뷰(서버 생성, authorUid 제외)
  feedback: 'waymark_feedback',             // 경험담 도움됐어요
  notifications: 'waymark_notifications',
  moderation: 'waymark_moderation',         // 검수 감사 로그
  aiUsage: 'waymark_ai_usage',              // 체험 AI per-user 캡 미터
};

// ── 분류셋 (functional_spec §7-1) — 라벨은 i18n 키 waymark.enum.*
export const DOMAINS = ['career', 'team', 'product', 'relationship', 'money', 'health', 'other'];
export const EMOTIONS = ['anxiety', 'relief', 'excitement', 'fear', 'confidence', 'confusion'];
export const IMPORTANCE = [1, 2, 3];
export const DECISION_STATUS = ['open', 'revisited', 'closed'];
export const OUTCOMES = ['good', 'mixed', 'ongoing'];

// ── 동반 톤 (functional_spec §5) · 먼저 찾아옴 이벤트/채널 (§6)
export const TONES = ['comfort', 'counsel', 'cheer', 'clarify'];
export const EVENT_TYPES = ['nudge', 'checkin', 'midterm', 'retro'];
export const CHANNELS = ['email', 'push'];
export const AI_SOURCES = ['template', 'trial_ai', 'byok'];

// ── 먼저 찾아옴 기본 스케줄(일) — 중요도별 (functional_spec §6-2). cadence 배수와 곱함.
export const CADENCE_FACTORS = { tight: 0.7, normal: 1.0, loose: 1.5 };
export const BASE_SCHEDULE_DAYS = {
  1: { checkin: 3, midterm: null, retro: 21 },
  2: { checkin: 2, midterm: 14, retro: 30 },
  3: { checkin: 1, midterm: 10, retro: 30 },
};

// ── 검증 헬퍼(서버·클라 공용)
export const LIMITS = { title: 80, context: 4000, storyBody: 4000 };
export const isDomain = (v) => DOMAINS.includes(v);
export const isEmotion = (v) => EMOTIONS.includes(v);
export const isImportance = (v) => IMPORTANCE.includes(Number(v));

/**
 * @typedef {Object} Decision
 * @property {string} uid
 * @property {string} title       최대 LIMITS.title
 * @property {string} context     최대 LIMITS.context
 * @property {string[]} options
 * @property {string} chosen
 * @property {string[]} emotionTags  EMOTIONS 하위
 * @property {string} domain         DOMAINS 중 하나
 * @property {1|2|3} importance
 * @property {boolean} reversible
 * @property {'open'|'revisited'|'closed'} status
 * @property {string} [outcome]      OUTCOMES
 * @property {string} [outcomeNote]
 * @property {string[]} [emotionNow]
 * @property {string[]} [tagsKeywords]
 */

/**
 * @typedef {Object} DecisionEvent  // 먼저 찾아옴
 * @property {string} uid
 * @property {string} decisionId
 * @property {'nudge'|'checkin'|'midterm'|'retro'} type
 * @property {string} tone
 * @property {string} scheduledAt
 * @property {'scheduled'|'sent'|'responded'|'skipped'|'canceled'} status
 * @property {string[]} channels     CHANNELS 하위
 */
