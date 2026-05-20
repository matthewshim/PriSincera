# 서버리스 환경에서 정적 블로그(Static CMS) 완벽 제어하기: GitHub API와 AI의 만남

현재 운영 중인 퍼스널 브랜딩 사이트의 **'Builder's Log'**는 데이터베이스(Firestore 등)를 거치지 않고, 로컬 파일 시스템(`.md`, `.json`) 및 Git 커밋을 통해 배포되는 **정적 렌더링(Static Asset) 구조**를 채택하고 있습니다. 

정적 사이트는 뛰어난 속도와 최상의 SEO 성능을 자랑하지만, 콘텐츠를 업데이트할 때마다 로컬 개발 환경을 켜고 직접 커밋·푸시해야 하는 번거로움이 있습니다. 본 아티클에서는 기존 관리자 대시보드 웹 인터페이스에서 이러한 독특한 정적 콘텐츠 발행 모델을 **서버리스의 한계를 극복하고 안전하게 자동 제어**하기 위해 구축한 아키텍처와 트러블슈팅 방안을 상세히 공유합니다.

---

## 🏗️ 아키텍처 설계: 서버리스의 한계를 극복하다

Vercel이나 Google Cloud Run과 같은 **서버리스 컨테이너 환경**에 배포된 Admin 백엔드는 디스크가 **읽기 전용(Read-Only)**이거나, 쓰기가 가능하더라도 임시 컨테이너 세션이 종료되면 수정된 로컬 파일이 즉시 휘발됩니다. 즉, 전통적인 CMS처럼 서버 내 로컬 디스크에 직접 `.md` 파일을 영구 생성하는 방식은 불가능합니다.

이 문제를 해결하기 위해 백엔드에 데이터베이스를 도입하는 대신 **GitHub REST API (Octokit)**를 활용하여, Admin 백엔드에서 원격으로 직접 `main` 브랜치에 커밋을 푸시(Git-less Commit)하는 **원격 자동화 파이프라인**을 구축했습니다.

### 🔄 전체 동작 파이프라인 (Data Flow)

┌───────────────────┐
│  Admin Dashboard  │ (아티클 업로드 & Publish 클릭)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Express Backend  │ (Secret 스캔 및 AI 교정 수행)
└─────────┬─────────┘
          │
          ├───────────────► ┌───────────────────┐
          │                 │ GitHub API (Octo) │ (Tree/Blob 원격 생성)
          │                 └─────────┬─────────┘
          │                           │
          │                           ▼
          │                 ┌───────────────────┐
          │                 │ Git Commit & Push │ (main 브랜치 원격 반영)
          │                 └───────────────────┘
          ▼
┌───────────────────┐
│  GitHub Webhook   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    CI/CD Build    │ (Google Cloud Build 정밀 빌드)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Live Deployment │ 🚀 (Cloud Run 실시간 배포 완료)
└───────────────────┘

---

## 💻 프론트엔드: 브라우저 속 직관적인 통합 에디터 UI/UX

개발 환경(IDE)을 전혀 켜지 않고도 브라우저에서 모든 정적 아티클을 제어할 수 있도록 기존 관리자 패널(Admin Panel)을 대폭 확장하여 **통합 에디터 모달**을 구현했습니다.

### 🌟 주요 컴포넌트 기능

*   **메타데이터 통합 뷰어:** 현재 발행된 아티클들의 Chapter 번호, 제목(Title), Slug, 발행일(Date) 정보를 한눈에 관리하고, 직관적으로 추가 및 수정을 처리할 수 있습니다.
*   **마크다운 초안 자동 분석기 (AI Metadata Extractor):** 로컬에서 작성해둔 마크다운 초안(`.md`) 파일만 드래그 앤 드롭으로 업로드하면, AI(Gemini)가 전체 문맥을 스스로 파악하여 `Title`, `Subtitle`, `Slug`, `Tags` 등의 메타데이터 폼을 **알아서 추출해 자동으로 채워줍니다.**
*   **WYSIWYG 마크다운 에디터:** AI가 최적의 톤앤매너로 정교하게 다듬어 준 결과물을 브라우저상에서 실시간으로 확인하고, 필요에 따라 수동으로 미세 교정할 수 있는 유연한 편집 공간을 제공합니다.
*   **실시간 상태 인터랙션 피드백:** 발행 요청 시 백그라운드 연동 단계를 유저가 명확히 인지할 수 있도록 `"AI 분석 중..."` ──► `"GitHub에 커밋 중..."` 등 **실시간 상태 게이지 및 토스트 팝업**을 렌더링하여 고품질의 UX를 선사합니다.

---

## ⚙️ 백엔드: 안전한 원격 Git-less 커밋 API 명세

관리자 권한 인증 미들웨어(`requireAdmin`)가 강력하게 걸린 백엔드 전용 API 엔드포인트를 설계하여 실질적인 데이터 핸들링을 수행합니다.

### 📌 API 엔드포인트 명세

| 엔드포인트 | 메서드 | 설명 |
| :--- | :--- | :--- |
| `/api/builderslog/meta` | `GET` | 최신 메타데이터 JSON(`buildersLogMeta.json`) 안전하게 파싱 및 반환 |
| `/api/builderslog/content/:slug` | `GET` | 특정 마크다운 원문 파일(`.md`)을 읽어와 에디터에 주입 |
| `/api/builderslog/analyze` | `POST` | Gemini API 기반 초안 교정, 시크릿 마스킹 및 메타데이터 자동 추출 |
| `/api/builderslog/publish` | `POST` | GitHub API Git Data 서비스를 연동한 원격 Git-less Commit 및 최종 배포 푸시 |

---

## 🔒 보안 및 품질 관리 (AI & Security Workflow)

정적 CMS의 안정성과 소스코드 유출 차단을 위해, 자동화 스캐너와 사람의 직관이 조화롭게 결합된 **Human-in-the-Loop(HITL) 자동 검증 시스템**을 설계했습니다.

```text
[초안 업로드] ──► [AI 교정 & 1차 검열] ──► [관리자 최종 승인 (HITL)] ──► [정규식 Secret 스캐너] ──► [GitHub Secret Scanning]
```

1.  **1단계 (AI 톤앤매너 교정 & Context 검열):** 초안이 업로드되면 AI가 PriSincera 특유의 프리미엄 테크 톤으로 본문을 다듬습니다. 이때 본문 내에 숨어 있는 내부 IP 주소나 실제 유저 개인 정보 등 보안 유출 우려 항목을 문맥적으로 식별하여 즉시 `[REDACTED]` 처리합니다.
2.  **2단계 (Human Review):** AI가 추출해 낸 마크다운 결과물과 JSON 메타데이터 정보를 관리자가 브라우저 UI에서 육안으로 면밀하게 최종 검토합니다.
3.  **3단계 (정규식 기반 로컬 시크릿 스캐너):** 발행 직전, 백엔드 서버에서 강력한 정규표현식 엔진을 가동하여 API Key, AWS Secret, GitHub Access Token 등의 **치명적인 하드코딩 민감 정보 패턴이 본문에 있는지 2차 검열**합니다. 탐지되는 즉시 퍼블리싱 프로세스를 중단(`Abort`)시킵니다.
4.  **4단계 (GitHub Advanced Security):** 최종 푸시 직후, GitHub 자체의 보안 비밀 탐지(Secret Scanning) 기능이 3중으로 작동하여 전체 보안 신뢰도를 완벽히 구축합니다.

> 🛡️ **보안 가이드: Regex Secret Scanner의 주요 방어 필터 패턴 예시**

```javascript
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/,        // GCP/Firebase API Key
  /ghp_[a-zA-Z0-9]{36}/,          // GitHub Personal Access Token
  /xox[baprs]-[a-zA-Z0-9]{10,48}/ // Slack OAuth Token
];
```

---

## 🚀 추가 고도화 및 트러블슈팅 해결 과정

기본적인 발행 파이프라인의 완성에 그치지 않고, 프로덕션 트래픽 환경에서 마주한 한계점과 병목 현상들을 집요하게 해결해 나갔습니다.

### 1. AI API 할당량 초과 방어를 위한 Multi-Fallback 설계

특정 고성능 AI 모델의 API 트래픽 한계(Quota Limits)나 임시 장애 상태로 인해 아티클 퍼블리싱이 차단되는 현상을 근본적으로 해결했습니다. AI 핵심 분석 루프에 **점진적 성능 다운그레이드(Graceful Degradation) 폴백 모델**을 탑재했습니다.

> 💡 **AI Fallback 워크플로우 아키텍처**
> 
> `[gemini-2.5-flash]` ──(실패 시)──► `[gemini-2.0-flash]` ──(실패 시)──► `[gemini-1.5-flash-latest]` ──(완전 장애 시)──► `[수동 복구 모드]`

모든 최신 모델의 한도가 초과되어 완벽하게 먹통이 되더라도, 시스템 전체 크래시 대신 초안 원본을 원형 그대로 보존하여 배포 단계를 살려두는 **수동 퍼블리싱 모드**로 안전하게 우회하도록 예외 처리했습니다.

### 2. API 할당량 물리적 분리 (Quota 200% 확보)

매일 대규모 웹 트래픽을 처리하는 백그라운드 자동 수집/Composer 파이프라인과 관리자 대시보드의 아티클 퍼블리싱 기능이 단일 API Key를 공유할 시, 자정 무렵 데이터 수집 단계에서 API 할당량이 고갈되어 아티클 업로드가 마비되는 문제가 있었습니다. 

이를 해결하기 위해 두 핵심 서비스의 **Google Cloud Platform(GCP) 프로젝트를 아예 물리적으로 분리**하고, 각각 독자적인 API 할당량을 부여하여 시스템 전체의 AI 연산 용량을 2배로 넓히고 간섭 현상을 완전히 차단했습니다.

### 3. 클라우드 환경의 Read-Only 파일 시스템 한계 극복 (`EACCES` 오류 해결)

Cloud Run 등 서버리스 도커 환경은 파일 쓰기가 차단된 **Read-Only 파일 시스템** 환경이 기본 설정입니다. 이때문에 백엔드 파일 서버에 물리적으로 임시 저장한 후 커밋하려는 시도는 `EACCES: permission denied` 시스템 에러를 발생시켰습니다.

이를 물리적 디스크를 전혀 사용하지 않고 **100% 메모리 상에서 처리되는 GitHub REST API의 로우레벨 Git 데이터 워크플로우**로 전면 전환하여 영구 해결했습니다.

> 🛠️ **엔지니어링 팁: 실제 적용된 100% 원격 Git-less 핵심 구현 코드**

```javascript
// 1. 현재 브랜치(main)의 최신 Commit SHA와 Base Tree SHA를 원격으로 조회
const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
const commitSha = ref.data.object.sha;
const commit = await octokit.rest.git.getCommit({ owner, repo, commit_sha: commitSha });
const treeSha = commit.data.tree.sha;

// 2. 메모리 상에서 저장하고자 하는 두 파일의 Git Blob 데이터를 생성 (파일 시스템 쓰기 우회)
const metaBlob = await octokit.rest.git.createBlob({
  owner, repo, content: JSON.stringify(metaArray, null, 2), encoding: 'utf-8'
});
const markdownBlob = await octokit.rest.git.createBlob({
  owner, repo, content: finalMarkdown, encoding: 'utf-8'
});

// 3. Base Tree를 기반으로 원격 저장소상에 파일 경로에 매핑된 신규 Tree 객체 생성
const newTree = await octokit.rest.git.createTree({
  owner, repo, base_tree: treeSha,
  tree: [
    { path: 'src/data/buildersLogMeta.json', mode: '100644', type: 'blob', sha: metaBlob.data.sha },
    { path: `public/content/logs/${currentSlug}.md`, mode: '100644', type: 'blob', sha: markdownBlob.data.sha }
  ]
});

// 4. 생성된 Tree를 가지고 Git Commit 및 Branch Reference 갱신
const newCommit = await octokit.rest.git.createCommit({
  owner, repo, message: `feat(builders-log): publish ${currentSlug} via Admin`,
  tree: newTree.data.sha, parents: [commitSha]
});
await octokit.rest.git.updateRef({
  owner, repo, ref: `heads/${branch}`, sha: newCommit.data.sha
});
```

### 4. Firestore 기반 정밀한 일별/누적 조회수 트래커 고도화

기존의 아티클 조회수 증가는 단순한 단일 카운터 증감 방식이었으나, 통계 분석의 고도화를 위해 **`totalViews` (누적 합산)**와 **`dailyViews` (일일 통계용 Map)** 데이터 스키마로 분리 설계했습니다.

```text
builderslog_stats (Collection)
   └─ [article_slug] (Document)
         ├─ totalViews: 1420
         └─ dailyViews (Map)
               ├─ 2026-05-18: 45
               ├─ 2026-05-19: 78
               └─ 2026-05-20: 32  <-- KST 타임존 동기화 처리
```

대한민국 표준시(KST)를 기준으로 한 일별 트래픽 맵을 관리함으로써, 누적 추이뿐 아니라 오늘 배포된 새로운 아티클의 단기 트래픽 변동 추세를 관리자 대시보드 그래프에서 즉각적이고 정밀하게 파악할 수 있는 데이터 가치를 확보하였습니다.
