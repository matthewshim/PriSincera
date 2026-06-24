# Data Contract v2 — Pace Note (웹 ↔ macOS 공유 데이터 계약)

> **목적**: macOS 데스크톱 앱 착수 전, 웹에서 먼저 동결하는 단일 데이터 계약. 본 계약을 따르면 데스크톱은 "REST를 IPC/SQLite로 갈아끼우기"만으로 이식된다.
> **상태**: ✅ **v2.3** (2026-06-24, 오빗화 정책 변경: action 항목 N개 → 독립 궤도 N개, 도메인 카테고리, subtask 폐지) · **정본 위치**: `docs/data_contract_v2.md`
> **관련**: [mac_app_business_plan.md](mac_app_business_plan.md) 6장 / 10장(Phase 0)

---

## 0. 설계 원칙

1. **가산(Additive) 우선**: 기존 라이브 웹 스키마(`signal`, `study`)는 **절대 제거/개명하지 않는다**. 신규 필드만 더한다.
2. **`schemaVersion` 명시**: 모든 정적 피드 JSON 최상위에 `schemaVersion`(정수)을 둔다. 클라이언트는 이 값으로 분기/폴백한다.
3. **단일 형상(Single Shape)**: PaceNote 데이터는 웹 REST 응답과 데스크톱 IPC 반환이 **바이트 호환 형상**을 갖는다. 차이는 전송 계층(HTTP+토큰 vs IPC)과 다국어 평탄화 위치뿐.
4. **어학(study)은 웹 전용**: 데스크톱은 `study`를 읽지 않는다. 트랙 피드(`junior_`/`senior_`)만 소비한다.
5. **무인증 단일 사용자(데스크톱)**: 데스크톱은 `uid`/토큰 개념이 없다. 서버의 `pacenotes/{uid}/weeks/{weekId}` 구조는 로컬에서 **단일 사용자의 `weeks` 테이블**로 축약된다.

---

## 1. 피드 계약 (Daily Feed)

### 1.1. 현행 v1 (보존 — 웹 전용, 변경 금지)
경로: `daily/${date}.json` (GCS). 웹은 `GET /api/daily/:date?lang=` 로 받음.

```jsonc
{
  "date": "2026-06-22",
  "signal": {
    "date": "2026-06-22",
    "status": "scored",
    "total": 12,
    "dmPickCount": 3,
    "articles": [ /* Article[] — 현행 구조 그대로 보존 */ ],
    "dm_picks": ["<articleId>", "..."],
    "scoredAt": "2026-06-22T00:10:00.000Z"
  },
  "study": { /* 어학(일/영) — 웹 전용 보존. 데스크톱 미사용 */ }
}
```
> `signal.articles[]`, `study`의 내부 필드는 현행 코드(`composer.mjs`, `study-composer.mjs`)의 산출 형상을 **그대로** 유지한다. v2는 여기에 손대지 않는다.

### 1.2. 신규 v2 트랙 피드 (데스크톱 + 웹 트랙 탭 공용)
경로: `daily/junior_${date}.json`, `daily/senior_${date}.json` (GCS, **신규 추가**).

```jsonc
{
  "schemaVersion": 2,
  "date": "2026-06-22",
  "track": "junior",                  // "junior" | "senior"
  "generatedAt": "2026-06-22T00:10:00.000Z",
  "domains": ["ai_llm", "system_design", "devops", "tech_lead"],  // 이 피드에 등장하는 관심 도메인 메타
  "cards": [
    {
      "id": "card-2026-06-22-j-01",
      "track": "junior",
      "domain": "ai_llm",             // 관심사 필터 칩과 매칭되는 키
      "title": "React 19 Server Actions 실전 적용",
      "summary": "…요약 1~2문장…",
      "learning": {                   // ★ v2.2 — 학습 레이어(실전 전 개념 학습)
        "concept": "핵심 개념/원리 설명 (3~4문장)",
        "key_points": ["학습 포인트 1", "학습 포인트 2", "학습 포인트 3"]  // 2~4개
      },
      "tags": ["react", "server-actions", "error-handling"],  // 로컬 재랭킹 가중치 조인 키
      "sourceUrl": "https://…",       // ★ 하이브리드 근거 기사 실제 URL (없으면 생략)
      "sourceName": "Hugging Face Blog",  // ★ 출처 매체명 (없으면 생략)
      "action_challenge": {
        "id": "ac-2026-06-22-j-01",
        "title": "Server Actions 실무 구현 챌린지",
        "tasks": [
          { "seq": 1, "text": "프로젝트에 Server Action 1개 작성" },
          { "seq": 2, "text": "에러 바운더리로 실패 케이스 처리" },
          { "seq": 3, "text": "폼 제출 e2e 동작 확인" }
        ]
      }
    }
  ]
}
```

**필드 규약**
| 필드 | 타입 | 필수 | 비고 |
|---|---|:--:|---|
| `schemaVersion` | int | ✅ | 현재 `2` |
| `track` | `"junior"\|"senior"` | ✅ | |
| `domain` | string | ✅ | 관심사 필터 칩 키(아래 §1.3) |
| `tags` | string[] | ✅ | 로컬 `keyword_weights` 조인용. 빈 배열 허용 |
| `action_challenge.tasks` | Task[] | ✅ | **정확히 3개** |

### 1.3. 관심 도메인 키(고정 enum)
`ai_llm` · `system_design` · `devops` · `tech_lead` (= PM/리더십). 추가 시 본 계약을 개정한다.

### 1.4. 인덱스
경로: `daily/index.json` (보존 + 가산).
```jsonc
{
  "schemaVersion": 2,
  "dates": ["2026-06-22", "2026-06-21"],   // 현행 보존
  "tracks": ["junior", "senior"],          // 신규 가산
  "version": 3,                            // tech-composer 실행마다 증가 (어드민 모니터링 신선도 표시)
  "updatedAt": "2026-06-23T05:04:15.000Z"  // 마지막 갱신 ISO
}
```
> `version`/`updatedAt`은 `tech-composer`의 `updateIndex()`와 어드민 동기화(`sync-daily-gcs`)가 함께 기록한다. 어드민 「테크 트랙」 모니터링 배너의 `index v:` 표기 근거.

---

## 2. PaceNote 계약 (웹 REST ↔ 데스크톱 IPC 공유)

### 2.1. 공유 타입 (TypeScript)
```ts
type Locale = 'ko' | 'en' | 'ja';

// 저장 계층(Firestore/SQLite)의 다국어 원형
type LocalizedText = string | { ko?: string; en?: string; ja?: string };

interface Task {
  id: string;            // 'default-*' | 'custom-<ts>' | 'rec-*' | 'ac-*'(오빗화)
  title: string;         // ⚠️ API/IPC 응답에서는 locale 평탄화된 string
  category: string;      // 'Learning' | 'Productivity' | 'Mindset' | ...
  color: string;         // hex
  completed: boolean;
}

interface WeekData {
  weekId: string;        // ISO week, 예: '2026-W26'
  startDate: string;     // 'YYYY-MM-DD'
  endDate: string;       // 'YYYY-MM-DD'
  currentPace: Task[];
  recommendedPace: Task[];
  statement: string;     // 주간 회고/일기 (<=1000자)
  createdAt: string;     // ISO datetime
}

interface TimelineEntry {
  weekId: string;
  startDate: string;
  endDate: string;
  tasks: Task[];         // 완료된 것만
  statement: string;
}

interface PaceNoteState {  // GET / 의 응답
  current: WeekData;
  timeline: TimelineEntry[];
}
```
> **평탄화 위치**: 웹은 서버가 `req.locale`로 평탄화(`localizeTask`)한다. 데스크톱은 IPC 어댑터가 동일하게 평탄화하여 `title: string`을 반환한다. 즉 프론트가 받는 형상은 양쪽 동일.

### 2.2. 엔드포인트 ↔ IPC 커맨드 매핑
현행 REST(`pacenote-api.mjs`)와 데스크톱 IPC(`#[tauri::command]`)는 1:1 대응한다.

| 동작 | 웹 REST (현행) | 데스크톱 IPC (신규) | 요청 | 응답 |
|---|---|---|---|---|
| 조회 | `GET /api/pacenote/` | `get_pacenote()` | — | `PaceNoteState` |
| 커스텀 추가 | `POST /api/pacenote/add` | `add_custom_task(title)` | `{ title: string }` (≤100자) | `{ success, currentPace: Task[] }` |
| 완료 토글 | `POST /api/pacenote/toggle` | `toggle_task(taskId)` | `{ taskId: string }` | `{ success, currentPace: Task[] }` |
| 추천 수락 | `POST /api/pacenote/accept` | `accept_recommendation(taskId)` | `{ taskId: string }` | `{ success, currentPace, recommendedPace }` |
| 회고 저장 | `POST /api/pacenote/diary` | `save_diary(statement)` | `{ statement: string }` (≤1000자) | `{ success, statement }` |
| **오빗화** | `POST /api/pacenote/add-orbit` | `add_orbit_from_signal(card)` | `{ action_challenge: ActionChallenge, domain: string }` | `{ success, added: number, currentPace: Task[] }` |

> **오빗화(Click-to-Orbit) — v2.3 정책**: 데일리 카드의 `action_challenge`의 **각 항목(task)을 각각 1개의 독립 궤도(flat Task)로** 주입한다(항목 N개 → 궤도 N개). 서브태스크/체크리스트 모델은 **폐지**되었다.
>
> - 요청 본문: `{ action_challenge: { id, title, tasks: [{seq,text}…] }, domain: 'ai_llm'|... }`.
> - 서버는 각 task를 `{ id: 'orbit-<ac.id>-<i>', title: task.text, category, color, completed:false }`로 만들어 `currentPace`에 추가한다. **카테고리/색상은 트랙 도메인에 매핑**(ai_llm→AI/LLM·cyan, system_design→System Design·indigo, devops→DevOps·mint, tech_lead→Tech Lead·gold).
> - **자동 주차 생성**: 주차 문서가 없으면 404 대신 기본 주차를 자동 생성 후 주입(`buildDefaultWeek`).
> - **멱등**: 이미 존재하는 `id`는 제외하고 신규만 추가. 전부 중복이면 409.

### 2.3. 인증 차이 (계약상 명시)
| | 웹 | 데스크톱 |
|---|---|---|
| 인증 | `Authorization: Bearer <idToken>` 필수 (`verifyUser`) | **없음** (무인증 단일 사용자) |
| 사용자 식별 | `uid` (Firebase) | 단일 로컬 사용자 (식별자 불필요) |
| 저장소 | Firestore `pacenotes/{uid}/weeks/{weekId}` | 로컬 SQLite `weeks` 테이블 |

---

## 3. 저장 모델 매핑 (Firestore → 로컬 SQLite)

서버의 유저별 도큐먼트 모델을 단일 사용자 로컬 테이블로 축약한다. (데스크톱 단계 구현, 계약상 형상만 고정)

```sql
-- weekId가 PK. uid 컬럼 없음(단일 사용자).
CREATE TABLE weeks (
  week_id     TEXT PRIMARY KEY,   -- '2026-W26'
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL,
  statement   TEXT DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  week_id     TEXT NOT NULL REFERENCES weeks(week_id),
  kind        TEXT NOT NULL,      -- 'current' | 'recommended'
  title       TEXT NOT NULL,      -- 단일 사용자 locale 1종 저장(또는 json)
  category    TEXT, color TEXT,
  completed   INTEGER DEFAULT 0,
  seq         INTEGER
);
CREATE TABLE keyword_weights (    -- 로컬 재랭킹용 (데스크톱 전용)
  keyword TEXT PRIMARY KEY,
  weight  REAL DEFAULT 0
);
```
> `recommendedPace`는 서버에선 풀(`config/pacenote_daily_pool`)에서 채워진다(`replenishRecommendations`). 데스크톱은 동봉된 정적 추천 풀 또는 트랙 피드 기반으로 동일 동작을 로컬 구현한다.

---

## 4. 하위호환 / 사이드이펙트 가드 (6.4 연계)

1. **구버전 피드 클라이언트**: v1(`signal`/`study`)이 그대로 있으므로 기존 웹은 무영향. 신규 트랙 파일은 별도 경로라 구버전이 아예 요청하지 않음.
2. **파싱 방어**: 트랙 피드 소비부는 `cards?.map`, `action_challenge?.tasks ?? []` 등 옵셔널 체이닝/기본값 매퍼 적용.
3. **인증 경로 보존**: 웹 PaceNote는 `fetchWithAuth`(토큰 주입·만료 재시도)를 그대로 유지. `usePaceNoteData` 훅 도입 시 웹 회귀 테스트로 검증.

---

## 5. 미결 항목 확정 결과 (2026-06-22 동결)

- [x] **오빗화 API**: 신규 `POST /api/pacenote/add-orbit` 엔드포인트 + IPC `add_orbit_from_signal`. (§2.2 반영)
- [x] **트랙 피드 `tags` 어휘**: 통제 어휘 미적용. **자유 태그 + 소문자 정규화**(`tag.toLowerCase().trim()`). `keyword_weights` 조인도 동일 정규화 기준.
- [x] **데스크톱 `title` 저장**: 단일 사용자이므로 **locale 1종 평탄화 저장**(`{ko,en,ja}` 미보존). 표시 언어 변경은 데스크톱 단계에서 재생성으로 처리.
- [x] **`action_challenge.tasks` 다국어화**: **ko 단일 생성**. 타깃이 국내 IT 종사자이므로 1종으로 시작, 글로벌 확장 시 본 계약 개정.

> 4건 확정 완료 → 본 계약은 **v2.0 Frozen**. 워크스트림 A/B/C 구현의 기준 스펙으로 사용한다. 변경 시 버전을 올리고 변경 이력을 아래에 남긴다.

### 5.1. 변경 이력 (Changelog)

| 버전 | 날짜 | 변경 | 영향 |
| :--- | :--- | :--- | :--- |
| v2.0 | 2026-06-22 | 미결 4건 확정, 계약 동결(Frozen) | — |
| v2.1 | 2026-06-23 | 구현 반영: ① `Subtask` 타입 + `Task.subtasks?` 가산 ② `POST /toggle-subtask`(IPC `toggle_subtask`) 추가 ③ add-orbit 오빗 id `orbit-<ac.id>` 확정 + **주차 미존재 시 자동 생성**(404 제거) ④ 트랙 `index.json`에 `version`/`updatedAt` 기록(tech-composer) | §2.1, §2.2, §1.4 |
| v2.2 | 2026-06-24 | 하이브리드(출처 정책 경로 C): 트랙 카드에 ① **`learning`**(concept + key_points 2~4개) 학습 레이어 가산 ② 실제 RSS 근거 기사의 **`sourceUrl`/`sourceName`** 채움(코드 주입). [학습 → 실전 → 원문] 흐름 | §1.2 |
| v2.3 | 2026-06-24 | 오빗화 정책 변경: `action_challenge`의 **각 항목을 독립 궤도 N개**로 주입(부모+subtask 모델 폐지), **카테고리를 트랙 도메인에 매핑**(req에 `domain` 추가), `POST /toggle-subtask` 및 `Subtask` 타입 제거 | §2.1, §2.2 |
