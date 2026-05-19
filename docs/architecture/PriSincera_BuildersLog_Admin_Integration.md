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
  - **메타데이터 폼:** Title, Subtitle, Slug, Accent Color, Tags(배열), Commits(배열)
  - **마크다운 에디터:** 본문 Markdown을 작성할 수 있는 텍스트 에어리어 (추후 렌더링 프리뷰 탭 지원)
  - **상태 관리:** API 호출 시 "GitHub에 커밋 및 배포 중..." 로딩 스피너 UI 제공

---

## 3. Backend 구현 방안 (`server.js` 또는 `admin/api`)

Admin 인증 미들웨어가 적용된 API 엔드포인트를 신설합니다. (필요 패키지: `@octokit/rest`)

* **`GET /admin/api/builderslog/meta`**
  - GitHub API 또는 서버 로컬에 존재하는 `src/data/buildersLogMeta.json` 파일의 최신 내용을 반환
* **`GET /admin/api/builderslog/content/:slug`**
  - `public/content/logs/{slug}.md` 파일의 마크다운 텍스트 원문을 반환
* **`POST /admin/api/builderslog/publish`**
  - **Request Body:** `{ meta: { ... }, markdown: "..." }`
  - **Action:** 
    1. GitHub API를 통해 `src/data/buildersLogMeta.json` 파일의 내용을 업데이트
    2. GitHub API를 통해 `public/content/logs/{slug}.md` 파일을 생성 또는 수정
    3. 두 변경 사항을 하나의 커밋(`feat(builders-log): publish {slug}`)으로 묶어서 `main` 브랜치에 Push

---

## 4. 진행 마일스톤 (Milestone)

1. **Phase 1: 인프라 준비**
   - GitHub Personal Access Token (PAT) 발급 및 `.env` 환경 변수(`GITHUB_TOKEN`) 등록
   - 백엔드에 Octokit 연동 테스트
2. **Phase 2: 백엔드 API 개발**
   - 위에서 정의한 3개의 CRUD API 구현 및 에러 핸들링
3. **Phase 3: 프론트엔드 통합**
   - `AdminDashboard.jsx`에 UI/UX 구축 및 에디터 폼 바인딩
4. **Phase 4: 배포 테스트**
   - 어드민 패널에서 실제 테스트 아티클 발행 후 Vercel 자동 빌드 모니터링
