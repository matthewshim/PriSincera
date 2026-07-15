# 📚 문서 인덱스 & 거버넌스 가이드

PriSincera 프로젝트의 모든 기획, 디자인, 엔지니어링 문서는 본 인덱스를 통해 체계적으로 탐색할 수 있습니다. 
새로 합류한 개발자나 AI 에이전트는 프로젝트 구조 및 비즈니스 철학을 파악할 때 이 가이드를 가장 먼저 정독하고, 문서의 추가/변경 시 최하단의 **지속 가능한 문서 생성 및 버전 관리 규칙(Index Concept)**을 엄격하게 준수해 주세요.

---

## 📁 core/ (글로벌 공통 규격 & 가이드라인)
전체 플랫폼에 글로벌하게 적용되는 핵심 기획, 공통 디자인 토큰, 인프라 및 보안 아키텍처에 관한 표준 명세서입니다.
*   **⭐ [서비스 개요 (Service Overview)](core/service_overview.md)** (`service_overview.md`): "PriSincera가 무엇인가"를 5분에 파악하는 최상위 진입 문서 — 제품 포트폴리오(Daily Digest·테크 트랙·PaceNote·Builder's Log·Sylphio)와 배움–실행–복기 성장 플라이휠. **신규자 1순위 필독.**
*   **⭐ [전체 아키텍처 개요 (Architecture Overview)](core/architecture_overview.md)** (`architecture_overview.md`): 웹·서버·API·Firestore·GCS·파이프라인(Cloud Run Jobs)·Gemini·배포를 한 장으로 조망하는 시스템 구조도 및 데이터 흐름 맵.
*   **⭐ [온보딩 가이드 (Onboarding)](core/onboarding_guide.md)** (`onboarding_guide.md`): 기획·디자인·개발 **역할별 필독 경로** + 신규 개발자 환경 셋업 체크리스트 + 문서 작성 거버넌스.
*   **[개발·운영 가이드 (Development Guide)](core/development_guide.md)** (`development_guide.md`): 로컬 환경 구축, 깃 브랜치 전략, **Node(Express) `server.mjs` 컨테이너** 기반 GCP Cloud Run 배포 및 긴급 대응 장애 극복 시나리오.
*   **🆕 [운영 런북 (Operations Runbook)](core/operations_runbook.md)** (`operations_runbook.md`): 배치 파이프라인·GCS·Firestore·Gemini **데이터 플레인 장애 대응** — 잡 수동 재실행, 당일 피드 누락 복구, Gemini 할당량 소진, Admin "지금 생성" 진단, 백업 수칙. **운영자 필독.**
*   **🆕 [환경변수·시크릿 레퍼런스 (Environment Reference)](core/environment_reference.md)** (`environment_reference.md`): 웹/파이프라인/로컬이 사용하는 **전체 env·시크릿과 저장 위치**(Secret Manager 매핑·로테이션 포함) 단일 레퍼런스.
*   **[프런트엔드 안정성 체크리스트 (FE Stability)](core/front_end_stability_checklist.md)** (`front_end_stability_checklist.md`): 배포 전후 프런트엔드 장애를 예방하기 위한 렌더링·번들·런타임 진단 점검표.
*   **[데이터 계약 v2 — 웹↔macOS (Data Contract)](data_contract_v2.md)** (`data_contract_v2.md`, *루트*): PaceNote 웹 REST와 데스크톱 IPC가 공유하는 데이터 형상 계약 — 가산적(additive) 설계 원칙.
*   **[디자인 시스템 (Design System)](core/design_system.md)** (`design_system.md`): 8pt 그리드, OLED 흑백 컬러 토큰, 3D WebGL 및 Bento Chrono-Calendar 물리 인터랙션 디자인 표준 가이드라인.
*   **[스크롤 인터랙션 강화 제안서](core/scroll_interaction_proposal.md)** (`scroll_interaction_proposal.md`): 별똥별(Shooting Star) 모티브 기반 메인 페이지 카드 및 오브젝트 스크롤/호버 인터랙션 강화 계획서.
*   **[보안 취약점 점검 보고서 (Security Audit)](core/security_audit.md)** (`security_audit.md`): XSS 방어, CORS 정책, Rate Limiter 적용 등 실질적 라이브 보안 조치 이력 및 권장 수칙.
*   **[인프라 스케일업 계획서 (Scaling)](core/scaling_plan.md)** (`scaling_plan.md`): 트래픽 급증 및 대규모 데이터 적재 시 대처하기 위한 GCP 멀티 리전 클러스터링 및 Firestore 샤딩 계획서.
*   **[동적 OG 이미지 전략 (OG Image)](core/og_image_strategy.md)** (`og_image_strategy.md`): 동적 Open Graph 이미지 생성 자동화 아키텍처 및 이미지 렌더링 규격서.
*   **🆕 [SEO 메타·페이지 타이틀 표준 (SEO Meta Standard)](core/seo_meta_standard.md)** (`seo_meta_standard.md`): 전 카테고리 페이지 타이틀/메타를 일관 표준으로 통일하되 카테고리별 SEO를 유지하는 규격 — SSR(`server.mjs`)·CSR(`useSEO.js`) 이중 소스 정합(SSOT) 공유 모듈 `src/data/seoMeta.mjs`. **active(구현 완료).**
*   **[BI 중심 프리미엄 UX 가이드](core/bi_centered_ux_guide.md)** (`bi_centered_ux_guide.md`): 네온 컬러를 절제하고 명독성과 심미성을 극한으로 끌어올린 하이엔드 다크 테마 디자인 수칙.
*   **[브랜드 아이덴티티 가이드 (Branding)](core/branding.md)** (`branding.md`): Star Prism Identity의 기하학적 철학과 슬로건, 핵심 심볼 활용 규격서.
*   **[비즈니스 모델 기획서 (Business Model)](core/business_model.md)** (`business_model.md`): 전체 비즈니스 비전, 수익 모델(BM) 및 타겟 고객 분석 정의서.
*   **[API 사용량·과금 분석 (API Usage & Cost)](core/api_usage_analysis.md)** (`api_usage_analysis.md`): AI 커밋 매칭 API 호출에 따른 토큰 한도 분석 및 과금 안정성 분석 리포트.
*   **[인증·권한 아키텍처 (Authentication)](core/authentication_architecture.md)** (`authentication_architecture.md`): JWT 및 HTTP-Only 쿠키 미들웨어를 활용한 Admin 대시보드 로그인 인증 보안 흐름도.
*   **[다국어 지원(i18n) 확장 계획서](core/internationalization_plan.md)** (`internationalization_plan.md`): 프론트엔드 다국어 바인딩, Firestore 스키마 다국어화, 글로벌 SEO 전략 및 점진적 3단계 로드맵 계획서.
*   **[모바일 최적화 제안서 (Mobile Optimization)](core/mobile_optimization_proposal.md)** (`mobile_optimization_proposal.md`): 모바일 퍼스트 시대 사용성 극대화를 위한 터치 타겟 접근성, iOS 화면 줌 배제, 마우스 추적 생략 및 콘텐츠 가로 넘침 방지 전면 개선안.

---

## 📁 relearn/ (리런 — 통합 서비스 도메인)
**Daily Digest(배움)** 와 **Pace Note(실행·복기)** 를 하나의 여정으로 묶는 신규 통합 서비스 **리런(ReLearn)** 관련 명세서입니다.
*   **🆕 [리런 통합 서비스 추진 계획서 (Product Strategy)](relearn/product_strategy.md)** (`product_strategy.md`): "제로부터 다시 배우는 러너" — 명칭 확정(리런=Re-Learn+Re-run) + 배움·실행·복기 3-stage 통합 UX + 전환기 무파괴 이행 후 **기존 두 서비스 승계(일몰 게이트 §5-1)** 로드맵. 성장 루프([growth_loop_plan](pacenote/growth_loop_plan.md)) 백엔드 연결의 표면화.
*   **🆕 [배움 스테이지 리디자인 제안서 (Learn Stage Redesign)](relearn/learn_stage_redesign_proposal.md)** (`learn_stage_redesign_proposal.md`): STAGE 01 배움 4채널의 지면 효율·채널 존(Zoning) 구획·정보 생략을 전방위 진단한 리디자인 제안 — Compact-first + Progressive Disclosure. **active(구현 완료).**
*   **🆕 [ReLearn UI 구현 명세서 (UI Specification)](relearn/ui_specification.md)** (`ui_specification.md`): `/relearn` 출하 기준 화면 명세 — 3-stage 루프·오늘|기록 뷰·좌측 레일 2뎁스 채널 앵커·배움 4채널·상태 매트릭스·GA4 퍼널·반응형.

---

## 📁 pacenote/ (PaceNote 서비스 도메인)
사용자가 주차별 성장의 궤도를 스스로 수립하고 개척해나가는 액션 플랫폼 **PaceNote** 관련 명세서입니다.
*   **[PaceNote 제품 전략서 (Product Strategy)](pacenote/product_strategy.md)** (`product_strategy.md`): 마이크로 트래커 기반 액션 플랫폼의 기획 의도, MVP 사양 및 비즈니스 비전.
*   **[PaceNote UI 명세서 (Bento Calendar)](pacenote/ui_specification.md)** (`ui_specification.md`): 분기별 13주 Bento 캘린더, 가로 뷰포트 정중앙 정렬 알고리즘, 디바운스 실시간 자동저장 회고록, 옴니 검색 모달 및 AI 포트폴리오 내보내기 사양.
*   **[PaceNote AI 추천 엔진 명세서](pacenote/ai_recommendation_engine.md)** (`ai_recommendation_engine.md`): Firestore 풀 분리, 고인물 방지 동적 퇴출(Eviction) 알고리즘 및 스스로 진화하는 AI 프롬프트 피드백 루프 사양서.
*   **🆕 [성장 루프 닫기 실행 계획서](pacenote/growth_loop_plan.md)** (`growth_loop_plan.md`): 배움→실행→복기→개인화 플라이휠을 닫는 5-Phase 실행 계획 — `completed`/회고 신호를 추천 엔진·다이제스트로 환류(신규 AI 비용 0). **프로덕트 우선 확장 1순위 베팅.**
*   **[PaceNote macOS 사업계획서](mac_app_business_plan.md)** (`mac_app_business_plan.md`, *루트*): PaceNote를 통합 macOS 데스크톱 앱으로 확장하는 사업계획 — 무인증 로컬 단일 사용자, Mac App Store IAP, 로드맵.

---

## 📁 builders-log/ (Builders' Log 서비스 도메인)
프로덕션 제품의 생생한 기획 및 엔지니어링 제작 과정을 투명하게 공개하는 **Builder's Log** 관련 명세서입니다.
*   **[Builder's Log 퍼블리싱 가이드](builders-log/publishing_guide.md)** (`publishing_guide.md`): 빌더스 로그 연재 시나리오, 작성 톤앤매너 가이드라인 및 관리자 발행 워크플로우.
*   **[Admin 통합 CMS 개발기](builders-log/admin_integration.md)** (`admin_integration.md`): Read-Only 서버리스 환경 극복을 위한 GitHub API 연동 Git-less 원격 커밋 기술, 3중 보안 시크릿 스캐너, Firestore 기반 일별/누적 조회수 정밀 통계 시스템.
*   **[Builder's Log UI 명세서](builders-log/ui_specification.md)** (`ui_specification.md`): 최신 포스트 가로 분할 압축, 하위 포스트 균등 2열 그리드 및 3단계 디바이스 반응형 최적화 카드 디자인 사양서.
*   **[SEO 크롤러 대응 개발기](builders-log/seo_optimization.md)** (`seo_optimization.md`): 정적 사이트맵 충돌 제거를 통한 100% 실시간 동적 사이트맵 동기화, SPA 한계를 뛰어넘는 검색 로봇 전용 개별 메타 태그 서버 사이드 인젝션 아키텍처.
*   **[천체 시뮬레이션 개발기](builders-log/celestial_simulation_strategy.md)** (`celestial_simulation_strategy.md`): 네온 SF 스타필드를 천체물리학적 사실주의로 고도화한 메인 영웅 섹션 WebGL 엔진 개발 로그.
*   **[데일리 다이제스트 v4.0 개편기](builders-log/daily_digest_overhaul.md)** (`daily_digest_overhaul.md`): 디자인 시스템 v4.0을 이메일에 투사하고 Pace Note·Builder's Log를 결합한 메일 아키텍처 개편 개발 로그.

---

## 📁 daily-digest/ (Daily Digest 서비스 도메인)
매일 아침 IT Tech, AI Prompt, 실무 일본어 핵심 가치를 핀터레스트 스타일 아카이브와 14일 잔디밭(Streak)으로 전달하는 **Daily Digest** 관련 명세서입니다.
*   **[Daily Digest UI 명세서 (Chrono-Calendar)](daily-digest/ui_specification.md)** (`ui_specification.md`): Bento Chrono-Calendar 42개 셀 고정 배치, 150ms 호버 디바운스 페치 및 모바일 2-Stage Tap 오터치 방지 UX 명세서.
*   **[콘텐츠 출처·프로비넌스 정책 (Sourcing Policy)](daily-digest/content_sourcing_policy.md)** (`content_sourcing_policy.md`): 콘텐츠 유형별 출처/원문 URL 부여 기준 — IT Tech Signal(실제 RSS 수집·원문 링크) vs Tech Track·어학(AI 생성·출처 없음) 구분, 사실성 고지 의무 및 향후 수집 연동(하이브리드) 거버넌스 결정 정책서.

---

## 📁 sylphio/ (Sylphio 서비스 도메인)
실시간 온디바이스 AI 동시통역 비서 에이전트 **Sylphio** 관련 명세서입니다.
*   **[Sylphio 웹 랜딩 기획 명세서](sylphio/web_landing_plan.md)** (`web_landing_plan.md`): 오로라 에너지 코어 및 실시간 타이핑 번역 시뮬레이터가 결합된 통합 랜딩 페이지 UI/UX 기술 기획서.
*   **[Sylphio API Key 연동 가이드](sylphio/api_key_guide.md)** (`api_key_guide.md`): 구글 제미나이 및 오픈AI API Key 발급부터 Pro 모드 Secure Keychain 연동을 돕는 유저용 상세 매뉴얼.
*   **[Sylphio 개인정보 처리방침 (Privacy)](sylphio/privacy_policy.md)** (`privacy_policy.md`): App Store 심사 무결성 보장을 위한 100% 로컬 데이터 무수집 개인정보 서약서.
*   **[Sylphio 랜딩 검토 보고서](sylphio/landing_review.md)** (`landing_review.md`): macOS 앱 최신 정책 대비 웹 랜딩·API 키 가이드 문구/팩트 정합성 검토 및 수정 제안.
*   **[Sylphio 랜딩 수정 계획서 (v2.1)](sylphio/landing_modification_plan.md)** (`landing_modification_plan.md`): 영어·한국어 무제한 무료 + Pro Lifetime(다국어·요약) 정책을 랜딩/시뮬레이터에 반영하는 수정 계획.

---

## 📁 archive/ (역사적 참고용 통합 아카이브)
서비스 고도화 및 통폐합 마일스톤이 완전히 완수됨에 따라, 과거의 개발 파편들을 고맥락 중심으로 고밀도 병합하여 보관 중인 참고서입니다.
*   **[이메일 발송 엔진 전환 아카이브](archive/email_migration_history.md)** (`email_migration_history.md`): 외부 SaaS(Buttondown) 의존성을 완전 탈피하고 Gmail SMTP 자체 엔진 전환 및 중복 발송 차단용 Firestore 선행 락(Pending Lock) 해결사.
*   **[PriSignal 레거시 아카이브](archive/prisignal_legacy_archive.md)** (`prisignal_legacy_archive.md`): 과거 독립형 IT 큐레이션 웹 시절의 탭 리디자인, 카드 진입 스태거 효과, 구독 CTA 및 소셜 프루프 컴포넌트 변천사.
*   **[PriStudy 레거시 아카이브](archive/pristudy_legacy_archive.md)** (`pristudy_legacy_archive.md`): 과거 어학 마이크로러닝 앱 시절의 초기 MVP 데이터베이스 스키마 및 비즈니스 일어/프롬프트 3단계 확장 기획 기록.
*   **[메인 페이지·파이프라인 진화 아카이브](archive/index_page_evolution.md)** (`index_page_evolution.md`): 초기 메인 레이아웃부터 모바일 GNB 햄버거 메뉴 개선, 서비스 중심 Bento Box 랜딩 리뉴얼, 백엔드 파이프라인(`composer.mjs`) 3단계 모듈화 리팩토링 이력.

---

# 📌 지속 가능한 문서 생성 및 버전 관리 규칙 (Index Concept)

PriSincera 프로젝트는 서비스 고도화와 새로운 도메인 확장이 끊임없이 이루어집니다. 본 프로젝트에 참여하는 모든 기획자, 개발자, 그리고 **AI 에이전트**는 문서 생성, 수정, 폴더 배치 시 아래 명시된 **인덱스 콘셉트(Index Concept) 거버넌스 규칙**을 상시 참조하고 100% 준수해야 합니다.

```
                  [ 규칙 준수 자가 진단 워크플로우 ]
                  
     신규 기획/명세 발생 ──► 1. 도메인 확인 (Core / Service / Archive)
                                  │
                                  ▼
     2. 파일명 규칙 적용 ◄─── 적절한 서브 폴더 선정 (docs/core/, docs/pacenote/ 등)
     (접두사 금지, 스네이크 케이스)
          │
          ▼
     3. 템플릿 작성 (YAML Frontmatter & Revision History 주입)
          │
          ▼
     4. INDEX.md 링크 업데이트 ──► 최종 검증 & Commit / Push
```

### 1. 도메인 중심의 수직적 디렉토리 배치 규칙
*   **단순 수평 계층 분할 금지**: `docs/architecture/`, `docs/design/`, `docs/business/`와 같이 기능의 맥락을 수평적으로 쪼개어 배치하지 마십시오.
*   **서비스 단위 수직 응집 고수**: 신규 명세가 발생하면 해당 문서가 관여하는 비즈니스/도메인을 식별한 뒤 적절한 폴더(`pacenote/`, `builders-log/`, `daily-digest/`) 하위에 응집시키십시오.
*   **글로벌 공통 규격**: 모든 서브 서비스가 의존하거나 플랫폼 전반의 인프라/스타일 가이드는 `core/` 내부에 집적시킵니다.
*   **신규 도메인 신설 수칙**: 기존 폴더에 속하지 않는 신규 서비스(SaaS)가 확장되는 경우에만 `docs/` 최상위에 새로운 영문 소문자/하이픈 기반의 단일 도메인 폴더(예: `docs/zodiac-map/`)를 신설할 수 있습니다.

### 2. 파일명 명명 표준 (Naming Conventions)
*   **`PriSincera_` 접두사 영구 배제**: 저장소 전체가 PriSincera 프로젝트이므로 파일명의 중복 접두사는 불필요한 노이즈(Redundancy)입니다. 과감히 배제하십시오.
*   **소문자 스네이크 케이스(`snake_case`) 사용**: 모든 마크다운 파일명은 공백 없이 영문 소문자와 언더스코어(`_`)로만 구성합니다. (예: `ui_specification.md` 🟢, `UI-Specification.md` 🔴, `PriSincera_UISpec.md` 🔴)
*   **역할 정의형 파일명 매칭**:
    *   `product_strategy.md` : 비즈니스 기획, 로드맵, 목표 타겟 기획서 전용
    *   `ui_specification.md` : 프론트엔드 UI 구성 요소, 애니메이션, 스크롤 인터랙션, 반응형 스펙 전용
    *   `architecture_spec.md` 또는 구체적 모듈명 : 시스템 아키텍처, DB 스키마, 파이프라인 흐름 및 백엔드 설계 전용
    *   `development_guide.md` : 개발 환경 셋업, Git 전략, 로컬 개발 프로세스 전용

### 2.5 문서 제목(H1)·사이드바 라벨 표기 표준 (Title Convention)
admin **「서비스 문서」 사이드바 라벨은 각 문서의 첫 H1(`# …`)에서 자동 추출**됩니다(편집형은 `nav_title` frontmatter 우선). 목록의 스캔성과 인지성을 위해 모든 문서 H1은 아래 단일 포맷을 100% 준수하십시오.

*   **포맷**: `{타입이모지} {한글 제목} ({English, 선택})`
    *   예) `# 🏗️ 전체 아키텍처 개요 (Architecture Overview)`, `# 📘 운영 런북 (Operations Runbook)`
*   **접두사 "PriSincera" 배제**: 파일명과 동일 논리로 제목에도 중복 브랜드 접두사를 넣지 마십시오. (`PriSincera 전체 아키텍처` 🔴 → `전체 아키텍처 개요` 🟢)
*   **한글 主 + 영문 병기**: 한글 제목을 기본으로 하고, 정식 기술 명칭이 있으면 `( )`로 영문을 병기합니다. `[사업계획서]`·`[기획서]` 같은 브라켓 태그는 금지하고 표준 접미어(개요/아키텍처/명세서/계획서/가이드/보고서/정책/런북/레퍼런스/체크리스트)로 표현합니다.
*   **타입 이모지 체계(선행 1개 고정)** — 폴더 그룹이 이미 도메인을 나타내므로 이모지는 **문서 타입**을 인코딩합니다:
    *   🧭 개요·온보딩 · 🏗️ 아키텍처·인프라·데이터계약 · 📐 UI·기능 명세서 · 🗺️ 전략·계획·제안서
    *   📘 가이드·레퍼런스·런북·체크리스트 · 🔍 분석·검토·감사 보고서 · 📜 정책 · ✍️ 빌더스로그 개발기 · 🗄️ 아카이브 · 📚 인덱스
*   **길이**: 사이드바 가독을 위해 이모지 포함 40자 이내 권장. 장문 편집형(개발기)은 본문 H1에 마케팅 톤을 유지하되 `nav_title:` frontmatter로 짧은 라벨(예: `✍️ SEO 크롤러 대응 개발기`)을 별도 부여합니다.

### 3. 활성 스펙의 표준 메타데이터(YAML Frontmatter) 강제화
모든 **활성(Active/Draft)** 문서의 극최상단(1라인)에는 반드시 아래 규격의 YAML Frontmatter 블록을 수록해 문서의 생동성과 영향받는 코드를 명확히 매핑하십시오.

```yaml
---
status: active | draft | archived  # active: 현재 가동 스펙, draft: 기획 중, archived: 레거시 아카이브
domain: Core | PaceNote | BuildersLog | DailyDigest | Sylphio  # 서비스 도메인
nav_title: ✍️ 짧은 사이드바 라벨  # (선택) 편집형 개발기 등 본문 H1과 사이드바 라벨을 분리할 때만
last_updated: YYYY-MM-DD  # 최신 업데이트 날짜
version: vX.Y  # 문서 버전 정보
target_files:  # 이 사양이 지배 및 규제하고 있는 실제 코드 파일 목록 (Clickable Link 권장)
  - src/pages/PaceNoteDashboard.jsx
  - pacenote-api.mjs
---
```

### 4. 개정 내역 테이블 (Revision History) 표준화
YAML 블록이 끝난 직후 헤더 아래에 단순 덮어쓰기를 지양하고 변경 사항을 기록하는 Revision History 테이블을 의무적으로 삽입하십시오.

```markdown
## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-20 | AI Agent | 최초 13주 Bento Grid 캘린더 사양 정의 | PaceNoteWeeklyCalendar |
| v1.1 | 2026-05-21 | AI Agent | Voyage Log(회고) 실시간 자동저장 및 옴니 모달 스펙 추가 | PaceNoteDashboard |
```

### 5. 아카이브(Archive) 보존 수칙
*   **파편화 방지**: 마일스톤이 완료되었거나 통폐합된 구버전 기획서들은 개별 파일로 방치하여 탐색 노이즈를 만들지 마십시오.
*   **역사서 고밀도 병합**: 레거시 파일들은 기존의 대표 아카이브 병합 문서(`email_migration_history.md`, `prisignal_legacy_archive.md`, `pristudy_legacy_archive.md`, `index_page_evolution.md`) 중 가장 알맞은 곳을 찾아 요약본으로 수록한 후 기존 파일을 완전히 제거(`git rm`)하여 저장소의 청결함을 영구적으로 유지하십시오.

### 6. 인덱스 앵커 및 동기화 (Strict Index Syncing)
*   **원클릭 동기화**: 신규 문서를 생성하거나 기존 문서를 `archived` 처리하여 위치를 바꿀 때는, **반드시 이 `docs/INDEX.md` 파일을 동시에 편집**하여 새로운 상대 경로로 링크를 현행화하십시오.
*   **깨진 링크(Dead Link) 원천 차단**: 문서 내부의 파일 상대 경로(예: `[디자인 시스템 (Design System)](core/design_system.md)`) 및 소스 코드 링크(예: `[Header.jsx](../../src/components/layout/Header.jsx)`)가 브라우저 및 에디터에서 클릭 시 실제로 열리는지 반드시 3중 검증해야 합니다.
