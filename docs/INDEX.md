# 📚 PriSincera Documentation Index & Governance Guide

PriSincera 프로젝트의 모든 기획, 디자인, 엔지니어링 문서는 본 인덱스를 통해 체계적으로 탐색할 수 있습니다. 
새로 합류한 개발자나 AI 에이전트는 프로젝트 구조 및 비즈니스 철학을 파악할 때 이 가이드를 가장 먼저 정독하고, 문서의 추가/변경 시 최하단의 **지속 가능한 문서 생성 및 버전 관리 규칙(Index Concept)**을 엄격하게 준수해 주세요.

---

## 📁 core/ (글로벌 공통 규격 & 가이드라인)
전체 플랫폼에 글로벌하게 적용되는 핵심 기획, 공통 디자인 토큰, 인프라 및 보안 아키텍처에 관한 표준 명세서입니다.
*   **[개발 관리 & 운영 가이드](core/development_guide.md)** (`development_guide.md`): 로컬 환경 구축, 깃 브랜치 전략, GCP Cloud Run 배포 및 긴급 대응 장애 극복 시나리오.
*   **[글로벌 디자인 시스템](core/design_system.md)** (`design_system.md`): 8pt 그리드, OLED 흑백 컬러 토큰, 3D WebGL 및 Bento Chrono-Calendar 물리 인터랙션 디자인 표준 가이드라인.
*   **[보안 점검 및 대응 조치](core/security_audit.md)** (`security_audit.md`): XSS 방어, CORS 정책, Rate Limiter 적용 등 실질적 라이브 보안 조치 이력 및 권장 수칙.
*   **[인프라 스케일업 로드맵](core/scaling_plan.md)** (`scaling_plan.md`): 트래픽 급증 및 대규모 데이터 적재 시 대처하기 위한 GCP 멀티 리전 클러스터링 및 Firestore 샤딩 계획서.
*   **[동적 OG 이미지 생성 엔진](core/og_image_strategy.md)** (`og_image_strategy.md`): 동적 Open Graph 이미지 생성 자동화 아키텍처 및 이미지 렌더링 규격서.
*   **[BI 중심 프리미엄 UX 수칙](core/bi_centered_ux_guide.md)** (`bi_centered_ux_guide.md`): 네온 컬러를 절제하고 명독성과 심미성을 극한으로 끌어올린 하이엔드 다크 테마 디자인 수칙.
*   **[브랜드 아이덴티티 가이드라인](core/branding.md)** (`branding.md`): Star Prism Identity의 기하학적 철학과 슬로건, 핵심 심볼 활용 규격서.
*   **[통합 비즈니스 모델 기획서](core/business_model.md)** (`business_model.md`): 전체 비즈니스 비전, 수익 모델(BM) 및 타겟 고객 분석 정의서.
*   **[AI API 사용량 및 과금 분석](core/api_usage_analysis.md)** (`api_usage_analysis.md`): AI 커밋 매칭 API 호출에 따른 토큰 한도 분석 및 과금 안정성 분석 리포트.
*   **[Admin 권한 인증 아키텍처](core/authentication_architecture.md)** (`authentication_architecture.md`): JWT 및 HTTP-Only 쿠키 미들웨어를 활용한 Admin 대시보드 로그인 인증 보안 흐름도.

---

## 📁 pacenote/ (PaceNote 서비스 도메인)
사용자가 주차별 성장의 궤도를 스스로 수립하고 개척해나가는 액션 플랫폼 **PaceNote** 관련 명세서입니다.
*   **[PaceNote 제품 전략서](pacenote/product_strategy.md)** (`product_strategy.md`): 마이크로 트래커 기반 액션 플랫폼의 기획 의도, MVP 사양 및 비즈니스 비전.
*   **[PaceNote UI/UX 최종 구현 명세서](pacenote/ui_specification.md)** (`ui_specification.md`): 분기별 13주 Bento 캘린더, 가로 뷰포트 정중앙 정렬 알고리즘, 디바운스 실시간 자동저장 회고록, 옴니 검색 모달 및 AI 포트폴리오 내보내기 사양.
*   **[PaceNote AI 추천 및 피드백 엔진](pacenote/ai_recommendation_engine.md)** (`ai_recommendation_engine.md`): Firestore 풀 분리, 고인물 방지 동적 퇴출(Eviction) 알고리즘 및 스스로 진화하는 AI 프롬프트 피드백 루프 사양서.

---

## 📁 builders-log/ (Builders' Log 서비스 도메인)
프로덕션 제품의 생생한 기획 및 엔지니어링 제작 과정을 투명하게 공개하는 **Builder's Log** 관련 명세서입니다.
*   **[Builders' Log 퍼블리싱 시나리오](builders-log/publishing_guide.md)** (`publishing_guide.md`): 빌더스 로그 연재 시나리오, 작성 톤앤매너 가이드라인 및 관리자 발행 워크플로우.
*   **[Builders' Log Admin 통합 CMS](builders-log/admin_integration.md)** (`admin_integration.md`): Read-Only 서버리스 환경 극복을 위한 GitHub API 연동 Git-less 원격 커밋 기술, 3중 보안 시크릿 스캐너, Firestore 기반 일별/누적 조회수 정밀 통계 시스템.
*   **[Builders' Log UI/UX 구현 명세서](builders-log/ui_specification.md)** (`ui_specification.md`): 최신 포스트 가로 분할 압축, 하위 포스트 균등 2열 그리드 및 3단계 디바이스 반응형 최적화 카드 디자인 사양서.

---

## 📁 daily-digest/ (Daily Digest 서비스 도메인)
매일 아침 IT Tech, AI Prompt, 실무 일본어 핵심 가치를 핀터레스트 스타일 아카이브와 14일 잔디밭(Streak)으로 전달하는 **Daily Digest** 관련 명세서입니다.
*   **[Daily Digest UI/UX 구현 명세서](daily-digest/ui_specification.md)** (`ui_specification.md`): Bento Chrono-Calendar 42개 셀 고정 배치, 150ms 호버 디바운스 페치 및 모바일 2-Stage Tap 오터치 방지 UX 명세서.

---

## 📁 archive/ (역사적 참고용 통합 아카이브)
서비스 고도화 및 통폐합 마일스톤이 완전히 완수됨에 따라, 과거의 개발 파편들을 고맥락 중심으로 고밀도 병합하여 보관 중인 참고서입니다.
*   **[자체 이메일 발송 엔진 및 중복 방지 아카이브](archive/email_migration_history.md)** (`email_migration_history.md`): 외부 SaaS(Buttondown) 의존성을 완전 탈피하고 Gmail SMTP 자체 엔진 전환 및 중복 발송 차단용 Firestore 선행 락(Pending Lock) 해결사.
*   **[PriSignal 레거시 이력 보관소](archive/prisignal_legacy_archive.md)** (`prisignal_legacy_archive.md`): 과거 독립형 IT 큐레이션 웹 시절의 탭 리디자인, 카드 진입 스태거 효과, 구독 CTA 및 소셜 프루프 컴포넌트 변천사.
*   **[PriStudy 레거시 이력 보관소](archive/pristudy_legacy_archive.md)** (`pristudy_legacy_archive.md`): 과거 어학 마이크로러닝 앱 시절의 초기 MVP 데이터베이스 스키마 및 비즈니스 일어/프롬프트 3단계 확장 기획 기록.
*   **[메인 Landing Page 및 파이프라인 진화사](archive/index_page_evolution.md)** (`index_page_evolution.md`): 초기 메인 레이아웃부터 모바일 GNB 햄버거 메뉴 개선, 서비스 중심 Bento Box 랜딩 리뉴얼, 백엔드 파이프라인(`composer.mjs`) 3단계 모듈화 리팩토링 이력.

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

### 3. 활성 스펙의 표준 메타데이터(YAML Frontmatter) 강제화
모든 **활성(Active/Draft)** 문서의 극최상단(1라인)에는 반드시 아래 규격의 YAML Frontmatter 블록을 수록해 문서의 생동성과 영향받는 코드를 명확히 매핑하십시오.

```yaml
---
status: active | draft | archived  # active: 현재 가동 스펙, draft: 기획 중, archived: 레거시 아카이브
domain: Core | PaceNote | BuildersLog | DailyDigest  # 서비스 도메인
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
*   **깨진 링크(Dead Link) 원천 차단**: 문서 내부의 파일 상대 경로(예: `[Common Component](core/design_system.md)`) 및 소스 코드 링크(예: `[Header.jsx](../../src/components/layout/Header.jsx)`)가 브라우저 및 에디터에서 클릭 시 실제로 열리는지 반드시 3중 검증해야 합니다.
