PriSincera Builder's Log는 기존 `PriSincera_BuildersLog_Publishing_Guide.md`에 정의된 바와 같이, Firestore 데이터베이스를 우회하여 **로컬 파일 시스템(`*.md`, `json`) 및 Git 커밋**을 통해 배포되는 정적 렌더링(Static Asset) 구조를 채택하고 있습니다.

이 문서는 이러한 독특한 콘텐츠 발행 모델을 기존 `AdminDashboard.jsx` 기반의 관리자 웹 인터페이스에서 완벽하게 제어하고 관리할 수 있도록 지원하는 포괄적인 구현 방안을 제안합니다.

---

## 아키텍처 설계

서버리스 환경(Vercel 등)에 배포된 관리자 페이지에서 로컬 파일을 직접 수정하고 저장하는 것은 구조적으로 불가능하거나 데이터의 휘발성을 야기합니다. 따라서 **GitHub REST API (Octokit)**를 활용하여 Admin 백엔드에서 직접 레포지토리(`[REDACTED_REPO_PATH]`)의 `main` 브랜치에 커밋(Commit)을 푸시(Push)하는 방식이 가장 견고하고 효율적인 솔루션입니다.

> **동작 파이프라인:**
> 1.  관리자가 Admin 대시보드에서 아티클을 작성하고 [Publish] 버튼을 클릭합니다.
> 2.  Express 백엔드가 GitHub API를 호출하여 `buildersLogMeta.json` 파일을 덮어쓰고, 신규 `*.md` 파일을 생성하거나 기존 파일을 수정하는 커밋을 전송합니다.
> 3.  GitHub Webhook이 작동하여 Vercel CI/CD 빌드를 트리거합니다.
> 4.  웹사이트에 새로운 아티클이 정적으로 렌더링되고 자동 배포됩니다.

---

## 프론트엔드 구현 방안 (`AdminDashboard.jsx`)

기존 관리자 패널에 Builder's Log 관리를 위한 `builderslog` 탭을 새롭게 추가하여, 직관적인 UI/UX를 제공합니다.

### 사이드바 메뉴 확장

`Daily Digest` 및 `Pace Note` 메뉴 하단에 **`🛠️ Builder's Log`** 섹션을 신설하여 접근성을 높입니다.

### 대시보드 목록 뷰

현재 `buildersLogMeta.json` 파일에 정의된 아티클 목록이 테이블 형태로 렌더링됩니다. 각 아티클의 Chapter, Title, Slug, Date 정보가 표시되며, 수정(Edit) 및 신규 발행(Create) 기능을 위한 버튼이 제공됩니다.

### 통합 에디터 모달

아티클 작성 및 편집을 위한 모달 인터페이스를 제공하며, 다음과 같은 핵심 기능을 포함합니다.

*   **`.md` 파일 자동 분석기:** 로컬 `.md` 초안 파일을 업로드하면 AI가 내용을 분석하여 Title, Subtitle, Slug, Tags 등 메타데이터 폼을 자동으로 생성하고 채워줍니다.
*   **메타데이터 폼:** AI가 제안한 메타데이터를 관리자가 최종적으로 검토하고 수정할 수 있습니다.
*   **마크다운 에디터:** 톤앤매너가 교정된 본문 Markdown을 확인하고 직접 수정할 수 있는 WYSIWYG 또는 텍스트 에어리어를 제공합니다.
*   **상태 관리:** 파일 분석 및 퍼블리싱 과정에서 "AI 분석 중...", "GitHub에 커밋 중..."과 같은 실시간 상태 피드백 UI를 제공하여 사용자 경험을 향상시킵니다.

---

## 백엔드 구현 방안 (`server.js` 또는 `admin/api`)

관리자 인증 미들웨어가 적용된 전용 API 엔드포인트를 신설하여 Builder's Log 콘텐츠 관리를 지원합니다. (필요 패키지: `@octokit/rest`)

*   **`GET /admin/api/builderslog/meta`**
    *   GitHub API 또는 서버 로컬에 존재하는 `src/data/buildersLogMeta.json` 파일의 최신 내용을 반환합니다.
*   **`GET /admin/api/builderslog/content/:slug`**
    *   `public/content/logs/{slug}.md` 파일의 마크다운 텍스트 원문을 반환합니다.
*   **`POST /admin/api/builderslog/analyze`**
    *   **Request Body:** `{ "markdown": "..." }`
    *   **Action:** Gemini AI를 호출하여 업로드된 초안 마크다운의 톤앤매너를 교정하고, 민감 정보를 마스킹하며, 제목/태그 등의 메타데이터를 추출하여 JSON 형태로 반환합니다. 이 결과는 관리자의 휴먼 리뷰를 위해 사용됩니다.
*   **`POST /admin/api/builderslog/publish`**
    *   **Request Body:** `{ "metaArray": [ ... ], "currentSlug": "...", "markdown": "..." }`
    *   **Action:**
        1.  GitHub API를 통해 `src/data/buildersLogMeta.json` 파일의 내용을 업데이트합니다.
        2.  GitHub API를 통해 `public/content/logs/{slug}.md` 파일을 생성 또는 수정합니다.
        3.  이 두 변경 사항을 하나의 커밋(`feat(builders-log): publish {slug}`)으로 묶어서 `main` 브랜치에 푸시합니다.

---

## 보안 및 품질 관리 (AI & Security Workflow)

콘텐츠 생산 프로세스의 투명성과 보안 강화를 위해 **휴먼 리뷰가 결합된 자동화 파이프라인(Human-in-the-Loop)**을 구축했습니다.

### 1단계: AI 분석 및 톤앤매너 교정 (Analyze Phase)

관리자가 `.md` 초안 파일을 업로드하면 `POST /analyze` 엔드포인트를 통해 Gemini API가 즉시 텍스트를 교정합니다. 이 과정에서 "PriSincera 특유의 프리미엄 SaaS 톤 유지" 및 "코드 내 포함된 IP, 실제 유저 데이터 등 문맥적 보안 사항 `[REDACTED]` 처리"가 적용된 결과와 추천 메타데이터(제목, 슬러그 등)가 화면에 미리 채워집니다.

### 2단계: 관리자 최종 검토 (Human Review)

AI가 생성한 본문과 추출 데이터를 관리자가 브라우저에서 직접 읽어보고 필요에 따라 수정합니다.

### 3단계: 정규식 기반 시크릿 스캐너 (Publish Phase)

배포(`POST /publish`) 직전, 백엔드에서 정규식(Regex)을 사용하여 Firebase API Key, AWS Secret, 토큰 등 치명적인 민감 정보 패턴을 1차적으로 감지하고, 해당 패턴이 발견될 경우 커밋을 중단(Abort)시킵니다.

### 4단계: GitHub 시크릿 스캐닝 (안전망)

GitHub 푸시 직후, GitHub 자체의 보안 스캐닝 기능을 통해 2중으로 민감 정보를 검열하여 최종적인 안전망을 확보합니다.

---

## 진행 마일스톤

이 프로젝트의 주요 진행 단계는 다음과 같습니다.

### Phase 1: 인프라 준비

*   GitHub Personal Access Token (PAT) 발급 및 `.env` 환경 변수(`GITHUB_TOKEN`) 등록
*   백엔드에 Octokit 연동 테스트

### Phase 2: 백엔드 API 개발

*   위에서 정의한 Builder's Log 관련 CRUD API 구현 및 에러 핸들링

### Phase 3: 프론트엔드 통합

*   `AdminDashboard.jsx`에 UI/UX 구축 및 에디터 폼 바인딩

### Phase 4: 배포 테스트

*   관리자 패널에서 실제 테스트 아티클 발행 후 Vercel 자동 빌드 모니터링

---

## 추가 구현 및 개선 사항 (최근 업데이트)

최근 고도화를 통해 기획 초기에 제안된 기본 기능을 넘어 **데이터 분석 및 UI/UX 성능**이 대폭 향상되었습니다.

### 아티클 조회수 추적 고도화 (Firestore 기반)

단순 누적 방식에서 벗어나, `totalViews`(누적)와 `dailyViews`(일일별 Map: `YYYY-MM-DD`) 구조를 분리하여 데이터베이스 스키마를 고도화했습니다. 이를 통해 API를 통해 KST 타임존 기준으로 오늘 발생한 트래픽만 별도로 카운팅 및 랭킹 산정이 가능해졌습니다.

### 관리자 대시보드 UI/UX 통일 (성과 가시성)

Builder's Log의 조회수 성과 테이블을 기존 '데일리 메일 발송 차트'와 **완전히 동일한 다크 글래스모피즘 컨테이너 규칙(Padding, Border-radius, 여백 등)**으로 일치시켰습니다. 테이블 항목을 `[일일 조회수 (오늘)]`과 `[누적 조회수]`로 분리 노출하여 단기/장기 트렌드 파악이 직관적으로 가능해졌습니다.

### AI 모델 다중 우회(Fallback) 시스템 및 수동 전환(Graceful Degradation) 도입

특정 모델의 할당량(Quota) 초과 시 서버가 마비되는 것을 방지하기 위해, `gemini-2.5-flash` → `2.0-flash` → `1.5-flash` 순으로 순차 재시도하는 강력한 Fallback 루프를 `admin-api.mjs`와 파이프라인 코어(`lib/gemini.mjs`) 전체에 구축했습니다. 모든 AI 모델이 한도를 초과해 실패하더라도 시스템이 에러를 뱉는 대신, 사용자가 작성한 마크다운 원본을 유지한 채 **'수동 퍼블리싱 모드'**로 부드럽게 전환됩니다.

### API 할당량(Quota) 분리 설계 (사용량 2배 확장)

매일 밤 대규모 트래픽을 처리하는 백그라운드 파이프라인(Daily Digest, Pace Note, PriStudy)은 기존 `prisincera` 프로젝트 키(`GEMINI_API_KEY`)를 전담으로 사용합니다. Admin 대시보드의 Builder's Log 퍼블리싱 기능은 완전히 독립된 신규 GCP 프로젝트(`Article Publishing`)의 전용 키(`GEMINI_ADMIN_API_KEY`)를 할당받아, 전체 시스템의 API 한도 제약을 물리적으로 2배 확보했습니다.

### GitHub API 원격 커밋 (EACCES 에러 완벽 해결)

Cloud Run 컨테이너의 파일 시스템이 읽기 전용(Read-Only) 환경임을 고려하여, 로컬 파일 시스템 저장 대신 `@octokit/rest`를 활용한 100% 원격 GitHub 트리/블랍 생성 방식을 채택했습니다. 구글 클라우드 `Secret Manager`를 통해 `GITHUB_TOKEN` (Personal Access Token)을 암호화하여 환경 변수로 주입함으로써, Admin 패널에서 클릭 한 번으로 무중단 라이브 배포가 가능해졌습니다.