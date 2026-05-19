# Builder's Log Publishing Pipeline - Admin 통합 방안 보고서

현재 가이드라인(`PriSincera_BuildersLog_Publishing_Guide.md`)에 따르면 Builder's Log는 Firestore 데이터베이스를 거치지 않고 **로컬 파일 시스템(`*.md`, `json`)과 Git 커밋**을 통해 배포되는 정적 렌더링(Static Asset) 구조를 가지고 있습니다.

이를 기존 `AdminDashboard.jsx` 웹 인터페이스에서 완벽히 통제하고 관리하기 위한 구현 방안을 제안합니다.

---

## 1. 아키텍처 설계 (Architecture Design)

서버리스(Vercel 등) 환경에 배포된 Admin 페이지에서 로컬 파일을 직접 수정하고 저장하는 것은 불가능하거나 휘발성(Ephemeral)을 띄게 됩니다. 따라서 **GitHub REST API (Octokit)**를 활용하여 Admin 백엔드에서 직접 레포지토리(`matthewshim/PriSincera`)의 `main` 브랜치에 커밋(Commit)을 푸시(Push)하는 방식이 가장 이상적입니다.

* **동작 파이프라인:**
  1. 관리자가 Admin 대시보드에서 아티클 작성 및 [Publish] 버튼 클릭
  2. Express 백엔드가 GitHub API를 호출하여 `buildersLogMeta.json` 덮어쓰기 + `*.md` 파일 생성/수정 커밋 전송
  3. GitHub Webhook이 작동하여 Vercel CI/CD 빌드 트리거
  4. 웹사이트에 새 아티클 정적 렌더링 및 자동 배포

---

## 2. Frontend 구현 방안 (`AdminDashboard.jsx`)

기존 어드민 패널에 `builderslog` 탭을 신규 추가합니다.

* **사이드바 메뉴 추가:**
  - `Daily Digest`, `Pace Note` 메뉴 아래에 **`🛠️ Builder's Log`** 섹션 신설
* **대시보드 목록 뷰 (List View):**
  - 기존 `buildersLogMeta.json`을 테이블 형태로 렌더링 (Chapter, Title, Slug, Date 표시)
  - 수정(Edit), 신규 발행(Create) 버튼 제공
* **통합 에디터 모달 (Editor Modal):**
  - **.md 파일 자동 분석기:** 로컬 `.md` 초안 파일을 업로드하면 AI가 분석하여 Title, Subtitle, Slug, Tags 등 메타데이터 폼을 자동 생성 및 채움
  - **메타데이터 폼:** AI가 채워준 메타데이터를 관리자가 휴먼 리뷰(Human Review) 및 수정 가능
  - **마크다운 에디터:** 톤앤매너가 교정된 본문 Markdown을 확인하고 직접 수정할 수 있는 텍스트 에어리어
  - **상태 관리:** 파일 분석 및 퍼블리싱 시 "AI 분석 중...", "GitHub에 커밋 중..." 상태 피드백 UI 제공

---

## 3. Backend 구현 방안 (`server.js` 또는 `admin/api`)

Admin 인증 미들웨어가 적용된 API 엔드포인트를 신설합니다. (필요 패키지: `@octokit/rest`)

* **`GET /admin/api/builderslog/meta`**
  - GitHub API 또는 서버 로컬에 존재하는 `src/data/buildersLogMeta.json` 파일의 최신 내용을 반환
* **`GET /admin/api/builderslog/content/:slug`**
  - `public/content/logs/{slug}.md` 파일의 마크다운 텍스트 원문을 반환
* **`POST /admin/api/builderslog/analyze`**
  - **Request Body:** `{ markdown: "..." }`
  - **Action:** Gemini AI를 호출하여 업로드된 초안 마크다운의 톤앤매너 교정, 민감정보 마스킹, 제목/태그 등 메타데이터를 추출해 JSON 형태로 반환 (휴먼 리뷰용)
* **`POST /admin/api/builderslog/publish`**
  - **Request Body:** `{ metaArray: [ ... ], currentSlug: "...", markdown: "..." }`
  - **Action:** 
    1. GitHub API를 통해 `src/data/buildersLogMeta.json` 파일의 내용을 업데이트
    2. GitHub API를 통해 `public/content/logs/{slug}.md` 파일을 생성 또는 수정
    3. 두 변경 사항을 하나의 커밋(`feat(builders-log): publish {slug}`)으로 묶어서 `main` 브랜치에 Push

---

## 4. 보안 및 품질 관리 (AI & Security Workflow)

콘텐츠 생산 프로세스 개선과 보안 강화를 위해 **휴먼 리뷰가 결합된 자동화 파이프라인(Human-in-the-Loop)**을 구축합니다.

* **1단계: AI 분석 및 톤앤매너 교정 (Analyze Phase)**
  - 관리자가 `.md` 초안 파일을 업로드하면 `POST /analyze` 엔드포인트를 통해 Gemini API가 즉시 텍스트를 교정합니다.
  - "PriSincera 특유의 프리미엄 SaaS 톤 유지" 및 "코드 내 포함된 IP, 실제 유저 데이터 등 문맥적 보안 사항 `[REDACTED]` 처리"가 적용된 결과와 추천 메타데이터(제목, 슬러그 등)를 화면에 미리 채워줍니다.
* **2단계: 관리자 최종 검토 (Human Review)**
  - AI가 작성한 본문과 추출한 데이터를 관리자가 브라우저에서 직접 읽어보고 필요시 수정합니다.
* **3단계: 정규식 기반 시크릿 스캐너 (Publish Phase)**
  - 배포(`POST /publish`) 직전, Firebase API Key, AWS Secret, 토큰 등 치명적인 민감 정보 패턴을 백엔드 정규식(Regex)으로 1차 차단하여 커밋을 중단(Abort)시킵니다.
* **4단계: GitHub Secret Scanning (안전망)**
  - GitHub 푸시 직후 레포지토리 단에서 지원하는 보안 스캐닝을 통해 2중으로 검열합니다.

---

## 5. 진행 마일스톤 (Milestone)

1. **Phase 1: 인프라 준비**
   - GitHub Personal Access Token (PAT) 발급 및 `.env` 환경 변수(`GITHUB_TOKEN`) 등록
   - 백엔드에 Octokit 연동 테스트
2. **Phase 2: 백엔드 API 개발**
   - 위에서 정의한 3개의 CRUD API 구현 및 에러 핸들링
3. **Phase 3: 프론트엔드 통합**
   - `AdminDashboard.jsx`에 UI/UX 구축 및 에디터 폼 바인딩
4. **Phase 4: 배포 테스트**
   - 어드민 패널에서 실제 테스트 아티클 발행 후 Vercel 자동 빌드 모니터링
