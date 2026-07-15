---
status: draft
domain: ReLearn
last_updated: 2026-07-15
version: v1.5
target_files:
  - src/pages/DailyDigest.jsx
  - src/pages/PaceNoteDashboard.jsx
  - src/components/daily/TrackSignalFeed.jsx
  - src/components/pacenote/LoopReport.jsx
  - src/hooks/usePaceNoteData.js
  - src/data/seoMeta.mjs
  - src/components/layout/Header.jsx
---

# 🏃 리런 (ReLearn) — 통합 서비스 리뉴얼 추진 계획

> **한 줄 요지**: 분리된 **Daily Digest(배움)** 와 **Pace Note(실행·복기)** 를 *하나의 여정*으로 묶는 신규 통합 서비스. 명칭 **리런(ReLearn)** 은 "**다시 배우다(Re-Learn) + 다시 달리다(Re-run·러너)**"의 이중 의미로, **"제로부터 다시 배우는 러너"** 뉘앙스를 이름 한 단어로 전달한다.
>
> 태그라인: **"매일 제로에서, 다시 배우고 다시 달린다 — Learn from zero, run again."**

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-09 | AI Agent | 통합 서비스(리런) 명칭 확정 + 추가형 리뉴얼 추진 계획 최초 수립 | ReLearn, DailyDigest, PaceNote |
| v1.1 | 2026-07-15 | AI Agent | **코드 실측 재검토 반영** — Phase B-0(섹션 추출) 신설, SEO SSOT(`seoMeta.mjs`)·i18n(ko/en/ja)·인증 4상태 매트릭스·GA4 퍼널 계측·모바일 축약·Phase E 게이트 기준 보강 | Roadmap, Risks, Metrics |
| v1.2 | 2026-07-15 | AI Agent | **시안 검토 결정: '기록' 뷰(A안)** — 실행 내역·회고 아카이브를 별도 랜딩이 아닌 리런 내 `오늘 \| 기록` 뷰 전환으로 제공. 루프 리포트 지표 타일 = 기록 뷰 드릴다운 진입점. 데이터는 기존 PaceNote timeline 재사용(신규 API 0) | Concept §3, Phase B |
| v1.3 | 2026-07-15 | AI Agent | **배움 채널 대통합(시안 누락 보완)** — ①배움 = 다이제스트 **4채널 전체**(시그널·테크 트랙·AI 프롬프트·어학) + **채널별 궤도 연결 매핑**(트랙=add-orbit 기 구현, 나머지 3채널=`/add` 커스텀 궤도 재사용). 아카이브(과거 날짜)는 기존 `/daily` 존치 | Concept §3, Phase B |
| v1.4 | 2026-07-15 | AI Agent | **§4-1 파이프라인 무영향 검증 명문화** — Phase A~D 잡·cloudbuild·데이터 계약 무접촉 근거(custom- 통계 제외 실측 포함) + 유일한 예외(Phase E 이메일 템플릿) 경계 명시 | §4-1 |
| v1.5 | 2026-07-15 | AI Agent | **착수 전 확정(Phase A 완료)** — 데이터 방침 = **연속 사용·공유(마이그레이션·리셋 불필요)**. 표기 = **전 언어 공통 영문 `ReLearn`**(UI 타이틀·GNB, 이모지 없음 / '리런'은 국문 커뮤니케이션 병용). 라우트 `/relearn` 확정, **GNB 위치 = Sylphio 좌측**. 디자인 = 기존 시스템 완전 준수(신규 컬러 0) | §2, §4-2, Phase A·C |

---

## 1. 배경 — 왜 지금, 왜 통합인가
- 철학상 **배움(Daily Digest) → 실행(Pace Note 궤도) → 복기(Voyage Log)** 는 원래 한 몸(성장 플라이휠)이나, **메뉴가 둘로 분리**돼 사용자가 루프를 체감하지 못한다.
- 백엔드는 이미 연결됨 — [[growth-loop-plan]](Phase 0~4): 완료/회고 신호 → 추천 개인화, 궤도 도메인 → 다이제스트 렌즈, 루프 리포트. **통합 UX = 이 연결을 화면에서 보이게 하는 마지막 표면 작업.**

## 2. 명칭 결정 (Resolved)
> **결정(2026-07-09)**: **리런 (ReLearn)** 채택.

| 후보 | 뉘앙스 | 결과 |
| :--- | :--- | :--- |
| **리런 (ReLearn)** | Re-Learn(다시 배우다) + Re-run(다시 달리다·러너). 통합을 이름이 상징 | ✅ **채택** |
| 제로런 (ZeroRun) | "제로부터 다시"의 직역 — 명확하나 직설 | 후보 |
| 데이원 (Day One) | 초심/비기너 마인드 — 러너 직접성 약함 | 후보 |
| 베이스캠프 (Base Camp) | 여정·재정비 — 배움/러너 직접성 약함 | 후보 |

## 3. 통합 서비스 컨셉 (하나의 여정)
분리된 2탭 → **단일 "리런" 진입점**에서 하루의 루프를 3-stage 흐름으로:
```
┌─ 리런 (오늘) ──────────────────────────────────────┐
│  ─ 성장 루프 리포트 (완료율·연속·집중 도메인) ─          │
│  ① 배움   다이제스트 4채널 전체(시그널·트랙·프롬프트·어학) │
│           — 내 궤도 도메인 상단, 채널마다 '궤도로' 연결    │
│  ② 실행   원클릭 '실행의 궤도에 추가' → 오늘 할 일         │
│  ③ 복기   완료 체크 + 한 줄 회고                        │
└────────────────────────────────────────────────────┘
```

**배움 채널 대통합 매핑 (v1.3 — Daily Digest 4채널 전부 포함, 시안 누락 보완):**

| 채널 | 콘텐츠 (기존 다이제스트 탭) | 실행(궤도) 연결 | 구현 |
| :--- | :--- | :--- | :--- |
| 📡 **테크 시그널** | RSS 큐레이션 아티클 + S.I.G.N.A.L. 분석 | "이 아티클 정독하고 메모 남기기" → 궤도 추가 | `/add`(커스텀) 재사용 |
| 🛰️ **테크 트랙** | 수준별 학습+실전 액션 챌린지 | action_challenge → N개 궤도 | `add-orbit` **기 구현** |
| 🤖 **AI 프롬프트** | prompt_snippet(복사) + 비즈니스 컨텍스트 | "이 프롬프트 직접 실행해보기" → 궤도 추가 | `/add` 재사용 |
| 🇯🇵 **어학 (Business JP)** | 오늘의 문장(후리가나·발음·번역·오디오) | "소리 내어 3번 읽기" → 궤도 추가 | `/add` 재사용 |

> 💡 **설계 근거**: PaceNote `buildDefaultWeek`의 기본 궤도 5종("AI 스터디 프롬프트 직접 실행해보기"·"비즈니스 일본어 문장 3번 읽기" 등)이 이미 이 매핑의 **하드코딩판**이다. 대통합 = 이를 "오늘의 실제 콘텐츠에서 동적으로 추가"로 승격(제목에 당일 콘텐츠 문맥 포함). 기본 궤도는 콜드 스타트 폴백으로 유지. **신규 API 0** — 트랙 외 3채널은 기존 `/add`(커스텀 궤도)로 충분.
>
> **아카이브 방침**: 과거 날짜 열람(Chrono-Calendar·Quick Peek)은 기존 `/daily`가 계속 담당 — 리런 배움은 **'오늘'만** + "지난 다이제스트 보기 →" 링크. (기록 뷰는 '나의 실행/복기' 아카이브, `/daily` 아카이브는 '콘텐츠' 아카이브로 역할 분리)
**뷰 구조 (v1.2 — 시안 검토 결정, A안):** 리런은 단일 라우트 안에서 **`오늘 | 기록` 두 뷰**를 전환한다.
- **오늘**: 위 3-stage 루프(당일 실행 화면)
- **기록**: 주차별 항해 기록 아카이브 — 완료 궤도 목록(카테고리 칩) + 회고(statement) 원문. 데이터는 기존 PaceNote `GET /`의 **timeline 그대로 재사용(신규 API 0)**, 주차 카드는 PaceNote 타임라인 컴포넌트의 Phase B-0 추출 대상
- **루프 리포트는 두 뷰 공통 상주**(다리 역할)하며, 각 지표 타일(완료율·연속·복기·집중 도메인)이 **기록 뷰로의 드릴다운 진입점**
- 별도 랜딩(`/relearn/records`)·기존 PaceNote 위임(링크) 안은 기각 — 통합 체감·SEO 표면 최소화 우선

**인증 상태 매트릭스 (v1.1 — 2분법에서 4상태로 정밀화):**

| 상태 | 화면 구성 |
| :--- | :--- |
| 비로그인 | ① 배움만 + 로그인 유도 CTA |
| 로그인 · **콜드 스타트**(궤도 0) | ① 배움 + "첫 궤도 추가" 온보딩. LoopReport는 숨김(현 구현 유지) |
| 로그인 · 궤도 있음 | 풀 루프(리포트 + ①②③ + 개인화 렌즈·추천) |
| 로그인 · **이번 주 미개시** | `add-orbit`의 주차 자동 생성(기 구현)을 그대로 활용 — 별도 안내 없이 첫 추가로 개시 |

> ⚠️ **중복 페치 금지 원칙**: 셸이 배움·실행 stage를 함께 그리므로 `profile`·`orbit-ids`·트랙 피드는 **셸 레벨에서 1회 페치 후 하위로 전달**(또는 [usePaceNoteData](../../src/hooks/usePaceNoteData.js) 등 훅 공유). stage마다 각자 호출하지 않는다.

## 4. 추진 전략 — 추가형(Additive), 무파괴
> **핵심 제약**: 기존 카테고리(Daily Digest·Pace Note)는 **그대로 두고**, 신규 버전을 **병렬 추가**한다.
- 신규 라우트 **`/relearn`** + 네비 진입점 추가(데스크톱 `nav-links` + **모바일 Bento 오버레이**, 별도 마크업 2곳) — 기존 `/daily`·`/pacenote` **URL·SEO 완전 보존**
- **재사용 실측 (v1.1 교정)** — "셸만 신규·리라이트 0"은 부분적으로만 성립:

  | 조각 | 실태 | 재사용 |
  | :--- | :--- | :--- |
  | [TrackSignalFeed](../../src/components/daily/TrackSignalFeed.jsx) · [LoopReport](../../src/components/pacenote/LoopReport.jsx) · ChronoRibbon | 독립 컴포넌트 | ✅ 즉시 조합 |
  | 배움(시그널·어학 카드) | [DailyDigest.jsx](../../src/pages/DailyDigest.jsx)에 탭·구독·Quick Peek과 한 덩어리 | ⚠️ **추출 필요(Phase B-0)** |
  | 실행(궤도 리스트·토글·회고) | PaceNoteDashboard(~1,900줄 모놀리식)에 내장. 데이터 계층은 [usePaceNoteData](../../src/hooks/usePaceNoteData.js) 기존재 | ⚠️ **추출 필요(Phase B-0)** |

  → 추출한 섹션 컴포넌트는 **기존 페이지도 함께 사용**하도록 치환(로직 단일화) — 중복이 아니라 부채 감소.
- 검증 후에만 기존 메뉴 → 신규 점진 유도(전환은 마지막·선택)

### 4-1. 파이프라인 무영향 검증 (v1.4 — 개발·오픈 시 기존 백엔드 보호)

**Phase A~D는 배치 파이프라인(Cloud Run Jobs 6종)에 구조적으로 무영향** — 근거:

| 검증 항목 | 결과 |
| :--- | :--- |
| 방향 분리 | 파이프라인 = 콘텐츠 **생성(쓰기)** 경로, 리런 = 기존 API **읽기** + 기존 사용자 쓰기 API 재사용. 접점 파일 없음 |
| 코드 접점 | 신규 API 0 · 신규 잡 0 · `cloudbuild.yaml` 변경 0 · 스케줄 변경 0 · Phase B-0 추출도 `src/`(프론트)만 |
| **추천 통계 오염 방지** | '궤도로'가 만드는 `custom-` 궤도는 [pacenote-composer](../../pipeline/src/pacenote-composer.mjs)의 풀 통계에서 **명시적 제외**(`!task.id.startsWith('custom-')`) — 리런發 대량 추가가 velocity·퇴출·HOF를 왜곡하지 않음 (profile affinity 반영은 성장 루프의 의도된 동작) |
| 배포 격리 | 잡 이미지(`pipeline:$SHA`)는 web 이미지와 별도 — 리런 빌드 실패 시에도 기존 잡은 기존 이미지로 정상 가동 지속 |
| 트래픽 | 읽기 증가는 웹 서비스 몫(GCS 정적 피드 비용 ≈ 0 + rate limiter) — 잡 실행과 무관 |
| 데이터 계약 | Data Contract v2 additive 원칙 유지, 스키마 변경 없음 |

> ⚠️ **유일한 예외 — Phase E**: 이메일 다이제스트 CTA(`/daily` 지향)를 `/relearn`으로 바꾸는 경우에만 `pipeline/src/lib`(이메일 템플릿) 수정이 발생한다. 링크 URL 변경뿐이지만 **전 로드맵에서 유일한 파이프라인 코드 접점**이므로, Phase E 착수 시 별도 브랜치·회귀(발송 테스트) 필수.

### 4-2. 기 확보 데이터 처리 방침 (v1.5 확정)

> **결정: 연속 사용(공유) — 마이그레이션·리셋 모두 불필요.**

리런은 별도 저장소를 갖지 않고 기존 데이터를 **같은 API로 읽고 쓰는 셸**이므로 옮길 데이터 자체가 없다:

| 기 확보 데이터 | 처리 |
| :--- | :--- |
| `pacenotes/{uid}/weeks` (궤도·완료·회고) | **공유** — 리런 ②실행·③복기·기록 뷰가 동일 문서 사용. 리런↔PaceNote 양방향 즉시 반영 |
| `profile` (성장 루프: 완료율·streak·affinity) | **공유** — 기 적재분 덕에 **오픈 첫날부터 루프 리포트가 의미 있는 수치**로 시작 |
| GCS 피드·어학·트랙 콘텐츠 | 읽기 전용 소비 |
| 구독자·어학 진도 등 | 무접촉 |

- 분리/리셋 안 기각: 별도 컬렉션·이중 유지보수·기록 뷰 공백 + **대통합 취지와 모순**. "제로부터 다시"는 매일의 마음가짐(브랜딩)이지 데이터 초기화가 아님.

### 4-3. 표기·진입점 확정 (v1.5)
- **UI 타이틀·GNB 라벨 = 전 언어 공통 영문 `ReLearn`** (이모지 없음). '리런'은 국문 문서·커뮤니케이션에서 병용.
- 라우트 `/relearn` 확정. **GNB 배치 = Sylphio 좌측** (Builder's Log · Daily Digest · Pace Note · **ReLearn** · Sylphio). 태그라인 등 부속 카피는 각 언어 번역.

## 5. 추진 로드맵 (Phase Gate)

### ☐ Phase A — 확정·설계
- [ ] 명칭·태그라인 확정 (✅ 리런 결정) + **다국어 표기 확정**(en: ReLearn / ja 표기·태그라인 번역 — 사이트는 ko/en/ja 완전 다국어)
- [ ] IA·와이어프레임(3-stage) + **인증 4상태 매트릭스**(§3) 화면 분기 확정
- [ ] **모바일 축약 스펙**: 3-stage 세로 스택이 길어지므로 stage 아코디언 또는 앵커 탭
- [ ] **`relearn-theme` 액센트 토큰** 정의 — [Header.jsx](../../src/components/layout/Header.jsx)가 경로별 테마 클래스(`daily-theme`/`pacenote-theme`) 적용 중, 동일 패턴 확장
- **DoD**: 화면 구조·컴포넌트 매핑표·i18n 키 목록 확정.

### ☐ Phase B-0 — 섹션 컴포넌트 추출 (v1.1 신설)
- [ ] 배움 카드 섹션(시그널·어학)을 DailyDigest에서 컴포넌트로 추출
- [ ] 궤도 리스트 섹션(리스트·완료 토글·회고 입력)을 PaceNoteDashboard에서 추출([usePaceNoteData](../../src/hooks/usePaceNoteData.js) 재사용)
- [ ] **기존 페이지가 추출 컴포넌트를 사용하도록 치환**(동작 동일성 회귀 확인)
- **DoD**: 기존 `/daily`·`/pacenote` 화면·기능 무변화 상태에서 추출 완료(순수 리팩토링).

### ☐ Phase B — 통합 셸 구축
- [ ] `/relearn` 신규 라우트 + `ReLearn.jsx` 셸 (추출 컴포넌트 조합, 데이터는 셸 레벨 1회 페치)
- [ ] 상단 LoopReport + ① 배움 + ② 실행 + ③ 복기 배치
- [ ] **`오늘 | 기록` 뷰 전환(v1.2 A안)**: 기록 뷰 = 주차 타임라인+회고 아카이브(기존 timeline 데이터), 리포트 지표 타일 드릴다운 연결
- [ ] **배움 4채널 구성(v1.3)**: 시그널·트랙·프롬프트·어학 + 채널 필터 칩. 트랙 외 3채널에 '궤도로 추가'(`/add` 재사용, 당일 콘텐츠 문맥 제목) + "지난 다이제스트 보기 →" 링크
- [ ] **SEO SSOT 등록**: [seoMeta.mjs](../../src/data/seoMeta.mjs) `PAGE_META['/relearn']`(타이틀·설명·OG) + 동적 사이트맵 포함 — 누락 시 SEO 표준([seo_meta_standard](../core/seo_meta_standard.md)) 위반 상태로 출시됨
- **DoD**: 3-stage가 한 화면에서 동작, 기존 라우트 무손상, SSR/CSR 메타 방출 확인.

### ☐ Phase C — 진입점·온보딩
- [ ] 네비 진입점 **2곳** 추가: 데스크톱 `nav-links` + **모바일 Bento 오버레이**(별도 마크업) — 기존 메뉴 유지, **라벨 `ReLearn`(전 언어 공통·이모지 없음), Sylphio 좌측 배치**(v1.5)
- [ ] 통합 온보딩(첫 방문 시 루프 개념 1-스텝 안내) — 3개 국어
- **DoD**: 데스크톱·모바일 양쪽 진입점 노출, 기존 진입점 병존.

### ☐ Phase D — 개인화 표면화·퍼널 계측
- [ ] Phase 2/3 추천·렌즈·리포트를 통합 화면에 노출(추천 사유 라벨·내 궤도 배지)
- [ ] **GA4 이벤트 스키마 정의·계측**(react-ga4 기존재): `relearn_learn_view → relearn_orbit_add → relearn_complete_toggle → relearn_reflect_save` 퍼널 — 이것이 §7 "루프 완주율"의 측정 수단
- **DoD**: 로그인 유저가 개인화된 하루 루프를 한 화면에서 완주 + 퍼널 데이터 수집 개시.

### ☐ Phase E — (선택) 점진 전환
- [ ] **게이트 기준(수치)**: 리런 경유 궤도 추가/완료율이 기존 경로 대비 **동등 이상** + 이탈률 악화 없음 + 퍼널 완주율 유의미 — 충족 시에만 진행
- [ ] 기존 `/daily`·`/pacenote` → `/relearn` 유도(배너→리다이렉트 순) + **이메일 다이제스트 CTA 링크**(`/daily` 지향) 템플릿도 전환 대상에 포함
- **DoD**: 전환율·이탈 모니터링 후 결정.

## 6. 리스크 & 대응
| 리스크 | 대응 |
| :--- | :--- |
| 정보 과부하(두 서비스 합침) | 3-stage 단계 노출 · 비로그인은 배움만 · 모바일 아코디언 축약 |
| 기존 URL/SEO 손실 | 기존 라우트 **완전 보존**(추가형) |
| **모놀리식 추출 리스크** (v1.1) | Phase B-0을 **순수 리팩토링**으로 분리 — 기존 페이지 동작 동일성 회귀 후 셸 착수 |
| 중복 유지보수 | 추출 컴포넌트를 기존 페이지도 사용(로직 단일화) — 셸은 조합만 |
| **중복 API 페치** (v1.1) | 셸 레벨 1회 페치 + 훅 공유(§3 원칙) |
| **SEO 표준 위반 출시** (v1.1) | Phase B DoD에 `PAGE_META`·사이트맵 등록 포함 |
| **i18n 누락** (v1.1) | Phase A에서 3개 국어 키 목록 확정, C 온보딩까지 적용 |
| 로그인 상태별 혼선 | **인증 4상태 매트릭스**(§3)로 화면 분기 명세 |

## 7. 성공 지표 (+ 측정 수단)
- 루프 **완주율**(배움→실행→복기 한 세션 내) ↑ — **GA4 퍼널**(`relearn_learn_view → orbit_add → complete_toggle → reflect_save`)로 측정
- **재방문(D7/D30)** ↑ — 통합이 습관 형성에 기여하는가
- 궤도 추가·완료율 ↑, 다이제스트 궤도 연결 카드 CTR ↑
- Phase E 게이트: 위 수치가 기존 경로 대비 **동등 이상**일 때만 전환 착수(§5-E)

## 8. 후속 문서 동기화 (출시 시점)
- [ ] [service_overview](../core/service_overview.md) 제품 포트폴리오에 리런 추가
- [ ] [architecture_overview](../core/architecture_overview.md) 라우트 맵에 `/relearn` 반영
- [ ] 상세 화면 스펙은 `relearn/ui_specification.md` **별도 문서**로 신설(INDEX 동기화)

## 9. 참조
- 성장 루프(백엔드 연결): [[growth-loop-plan]]
- SEO 메타 표준(SSOT): [seo_meta_standard](../core/seo_meta_standard.md)
- Daily Digest UI/정책: [content_sourcing_policy](../daily-digest/content_sourcing_policy.md) · [ui_specification](../daily-digest/ui_specification.md)
- PaceNote 전략·추천: [product_strategy](../pacenote/product_strategy.md) · [ai_recommendation_engine](../pacenote/ai_recommendation_engine.md)
- 디자인 시스템: [design_system](../core/design_system.md)
