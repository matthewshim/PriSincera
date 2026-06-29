---
status: active
domain: Core
last_updated: 2026-06-29
version: v2.0
target_files:
  - server.mjs
  - Dockerfile
  - cloudbuild.yaml
  - package.json
---

# 📘 PriSincera — 개발 관리 & 운영 가이드

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-04-30 | Developer | GCP Cloud Run 배포, CI/CD 및 DNS 관리 가이드 최초 구축 | Infrastructure |
| v1.1 | 2026-05-21 | AI Agent | 도메인 중심(DDD) 폴더 구조 개편에 따른 표준 프론트매터 및 개정 내역 주입 | Documentation |
| v1.2 | 2026-06-09 | Antigravity | Cloud Run Jobs 관리 및 CI/CD IAM 권한 위임(actAs) 설정 가이드 추가 | cloudbuild.yaml, Infrastructure |
| v1.3 | 2026-06-10 | Antigravity | PriStudy Composer 스케줄 시간 변경(04:00 -> 07:30 KST) 및 재시도 옵션 반영 | Infrastructure, scheduler |
| **v2.0** | **2026-06-29** | **AI Agent** | **아키텍처 현행화: Nginx 정적 서빙 → Node(Express) `server.mjs` 컨테이너 전환 반영. 디렉토리맵·Dockerfile·API 라우트·Cloud Build 11스텝·잡 6종(tech-composer 포함) 전면 갱신. 운영 런북/환경변수 레퍼런스 분리** | server.mjs, Dockerfile, cloudbuild.yaml |

> ⚠️ **v2.0 중요 변경**: 프로덕션 Cloud Run 컨테이너는 더 이상 **Nginx 정적 서버가 아니라 Node.js(Express) `server.mjs`** 입니다. 정적 `dist/` 서빙 + API 라우터 마운트(`/api/*`, `/admin/api/*`)를 한 프로세스가 담당합니다. 리포지토리의 `nginx.conf`는 **레거시(미사용)** 이며 Dockerfile이 COPY하지 않습니다.

> **최종 업데이트**: 2026-06-29  
> **작성 배경**: PriSincera 웹사이트의 소스 버전 관리(Git/GitHub), GCP Cloud Run 배포,  
> CI/CD 파이프라인, 커스텀 도메인 연결까지의 전체 개발 운영 프로세스를 기록합니다.

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 디렉토리 구조](#3-프로젝트-디렉토리-구조)
4. [Git 버전 관리](#4-git-버전-관리)
5. [개발 환경 설정](#5-개발-환경-설정)
6. [개발 워크플로우](#6-개발-워크플로우)
7. [GCP Cloud Run 설정](#7-gcp-cloud-run-설정)
8. [빌드 & 배포 프로세스](#8-빌드--배포-프로세스)
9. [커스텀 도메인 & DNS 설정](#9-커스텀-도메인--dns-설정)
10. [DNS 트러블슈팅](#10-dns-트러블슈팅)
11. [SSL 인증서](#11-ssl-인증서)
12. [유지보수 & 점검](#12-유지보수--점검)
13. [긴급 상황 대응](#13-긴급-상황-대응)
14. [명령어 레퍼런스](#14-명령어-레퍼런스)

---

## 1. 프로젝트 개요

```
[GitHub 소스 저장소]  ←→  [로컬 개발 환경]
        │ push to main
        ▼
[Cloud Build]  ── trigger ──→  Docker 이미지 빌드
        │                           │
        │                    Artifact Registry 푸시
        │                           │
        ▼                           ▼
[Cloud Run]  ←── Deploy ── [Artifact Registry]
        │  (Nginx 컨테이너)
        ▼
[HTTPS Load Balancer + Cloud CDN]
        │
        ▼
prisincera.com (커스텀 도메인)
```

| 항목 | 값 |
|------|-----|
| **프로젝트명** | PriSincera |
| **GCP 프로젝트 ID** | `prisincera` |
| **GCP 리전** | `asia-northeast3` (서울) |
| **Cloud Run 서비스** | `prisincera-web` |
| **Cloud Run URL** | https://prisincera-web-1094711522476.asia-northeast3.run.app |
| **Load Balancer IP** | `136.110.131.58` |
| **커스텀 도메인** | https://www.prisincera.com |
| **리다이렉트** | `prisincera.com` → `www.prisincera.com` (301) |
| **GitHub 저장소** | https://github.com/matthewshim/PriSincera.git |
| **기본 브랜치** | `main` |
| **로컬 프로젝트 경로** | `d:\prisincera\www` |

---

## 2. 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| **프론트엔드** | React | 19.1.x | UI 프레임워크 |
| **라우팅** | React Router DOM | 7.5.x | SPA 클라이언트 라우팅 |
| **빌드** | Vite | 6.3.x | 빌드 도구 & 개발 서버 |
| **웹 서버** | **Express** | **5.1.x** | **`server.mjs` — 정적 `dist/` 서빙 + API 라우터 마운트** |
| **API 모듈** | `pacenote-api` · `admin-api` · `builderslog-api` · `study-api` | — | 라우터 단위 분리 (server.mjs가 마운트) |
| **DB / 정적** | Firestore · GCS | — | 사용자 데이터(Firestore) + 정적 피드(GCS `daily/*.json`) |
| **AI** | Gemini (`@google/genai`) | — | 콘텐츠 생성·커밋 매칭. 무료 티어 ([api_usage_analysis](api_usage_analysis.md)) |
| **호스팅** | GCP Cloud Run | — | **Node(Express) 컨테이너** 서빙 (~~Nginx 아님~~) |
| **CI/CD** | Cloud Build | — | 자동 빌드 & 배포 (web + 파이프라인 잡) |
| **이미지 저장** | Artifact Registry | — | Docker 이미지 저장 (`web`, `pipeline`) |
| **로드밸런서** | HTTPS Load Balancer | — | SSL 종단 & 글로벌 CDN |
| **버전 관리** | Git + GitHub | — | 소스 코드 버전 관리 |
| **런타임** | Node.js | 20 (alpine) | 빌드 & 프로덕션 서버 런타임 |

---

## 3. 프로젝트 디렉토리 구조

```
d:\prisincera\www\
│
├── 📁 src/                     # ── React 소스 코드 ──
│   ├── App.jsx                 # 루트 컴포넌트 (React Router — lazy 라우트)
│   ├── main.jsx                # 엔트리 포인트
│   ├── 📁 components/          # 재사용 UI (layout, daily, admin, pacenote, prisignal …)
│   ├── 📁 hooks/               # 커스텀 React 훅 (usePaceNoteData 등)
│   ├── 📁 data/                # 빌드 시 번들되는 정적 데이터 (buildersLogMeta.json 등)
│   ├── 📁 pages/               # 페이지 컴포넌트
│   │   ├── Home.jsx            #   메인 랜딩
│   │   ├── DailyDigest.jsx     #   /daily (시그널·테크 트랙·어학)
│   │   ├── PaceNoteDashboard.jsx #  /pacenote (주차 캘린더·실행 궤도)
│   │   ├── BuildersLog.jsx / BuildersLogDetail.jsx # /builders-log
│   │   ├── AdminDashboard.jsx  #   /admin (콘텐츠·구독·서비스 문서 등)
│   │   └── Sylphio*.jsx        #   /sylphio 랜딩·API 키 가이드
│   └── 📁 styles/              # 글로벌 CSS
│
├── 📄 server.mjs               # ★ 프로덕션 웹 서버(Express): dist 서빙 + API 마운트 + GCS 프록시
├── 📄 pacenote-api.mjs         # /api/pacenote/* 라우터 (Firebase Auth)
├── 📄 admin-api.mjs            # /admin/api/* 라우터 (관리자)
├── 📄 builderslog-api.mjs      # /api/builderslog/* 라우터
├── 📄 study-api.mjs            # 어학(Language Dojo) 라우터
│
├── 📁 pipeline/                # ── 배치 파이프라인 (Cloud Run Jobs) ──
│   ├── 📁 src/                 #   잡 진입점: collector·composer·study-composer·
│   │   │                       #              tech-composer·pacenote-composer·monitor
│   │   ├── 📁 lib/             #   코어 (rss, gemini, storage, firestore, mailer, subscribers)
│   │   ├── 📁 templates/       #   AI 프롬프트 템플릿 (tech-prompt.txt 등)
│   │   └── 📁 tests/           #   단위/통합 테스트
│   ├── 📁 config/              #   소스 설정 (sources.json, tech-sources.json)
│   ├── Dockerfile              #   파이프라인 이미지 빌드
│   └── setup-infra.sh          #   인프라 셋업 스크립트
│
├── 📁 docs/                    # ── 프로젝트 문서 허브 (Admin > 서비스 문서) ──
├── 📁 public/                  # ── 정적 에셋 (content/logs 마크다운 포함) ──
├── 📁 dist/                    # ── Vite 빌드 출력 (gitignore) ──
│
├── 📄 index.html               # Vite 진입 HTML
├── 📄 vite.config.js           # Vite 설정
├── 📄 package.json             # 의존성 + scripts(dev/build/preview/start)
├── 📄 Dockerfile               # 멀티스테이지 빌드 (Node 빌드 → Node 서버 `server.mjs`)
├── 📄 nginx.conf               # ⚠️ 레거시(미사용) — Dockerfile이 COPY하지 않음
├── 📄 cloudbuild.yaml          # Cloud Build CI/CD (web + 파이프라인 잡 11스텝)
└── 📄 .dockerignore            # Docker 빌드 컨텍스트 제외 (docs/*.md는 예외 포함)
```

---

## 4. Git 버전 관리

### 4-1. 저장소 정보

| 항목 | 값 |
|------|-----|
| **원격 저장소** | `origin` → `https://github.com/matthewshim/PriSincera.git` |
| **기본 브랜치** | `main` |
| **호스팅** | GitHub (Public) |

### 4-2. `.gitignore` 정책

Git에서 관리하지 않는(추적 제외) 파일과 그 이유:

| 패턴 | 대상 | 제외 이유 |
|------|------|-----------|
| `node_modules/` | npm 패키지 | `npm install`로 복원 가능. 용량 방대 |
| `dist/` | Vite 빌드 결과물 | `npm run build`로 언제든 재생성 |
| `.firebase/` | Firebase 배포 캐시 | 로컬 상태 파일, 공유 불필요 |
| `.firebaserc` | Firebase 프로젝트 연결 | 환경마다 다를 수 있으므로 수동 설정 |
| `.env` / `.env.*` | 환경 변수 | API 키 등 민감 정보 포함 가능 |
| `.vscode/` / `.idea/` | 에디터 설정 | 개인 개발 환경 설정 |
| `scripts/` | 개발 도구 스크립트 | 내부 개발용, 배포 불필요 |
| `sound/` | 사운드 원본 파일 | 용량 큼, `public/audio/`에 배포용 복사본 존재 |
| `*.log` | 로그 파일 | 디버그 용도, 공유 불필요 |

### 4-3. 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

#### 커밋 메시지 형식

```
<type>: <subject>
```

#### 타입 목록

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: add zodiac constellation starfield` |
| `fix` | 버그 수정 | `fix: resolve mobile nav overlap` |
| `style` | 디자인/CSS 변경 (로직 변경 없음) | `style: update hero gradient colors` |
| `refactor` | 코드 구조 개선 (기능 변경 없음) | `refactor: extract starfield into custom hook` |
| `docs` | 문서 추가/수정 | `docs: add Firebase deployment guide` |
| `chore` | 설정, 빌드, 패키지 등 | `chore: update vite to 6.3.x` |
| `perf` | 성능 최적화 | `perf: lazy-load constellation data` |

#### 커밋 이력 (최근)

```
36d9217 feat: redesign BGM/constellation toggles with Celestial Controls UI
630d980 feat: PriSincera website initial release - React + Vite SPA with
        Star Prism CI, zodiac constellation starfield, BGM, Firebase Hosting
```

### 4-4. 브랜치 전략

현재는 **`main` 단일 브랜치**로 운영 중이며, 프로젝트 규모가 커지면 아래 전략을 적용합니다.

#### 현재 (단일 브랜치)

```
main ──●──●──●──●──●──  (개발 + 프로덕션)
```

- 소규모 프로젝트에 적합
- 모든 변경이 곧바로 `main`에 반영
- 배포는 `main` 브랜치 기준으로 수행

#### 향후 확장 시 (Feature Branch)

```
main ──●────────●────────●──  (프로덕션)
        \      /  \      /
  feat/  ●──●─┘    ●──●─┘
```

| 브랜치 | 용도 | 네이밍 예시 |
|--------|------|-------------|
| `main` | 프로덕션 (배포 대상) | — |
| `feat/*` | 새 기능 개발 | `feat/about-page` |
| `fix/*` | 버그 수정 | `fix/mobile-menu-overlap` |
| `hotfix/*` | 긴급 수정 | `hotfix/ssl-redirect` |

### 4-5. 일상 Git 운영

#### 개발 시작 전 — 최신 소스 동기화

```bash
git pull origin main
```

#### 작업 완료 후 — 커밋 & 푸시

```bash
# 1. 변경 파일 확인
git status

# 2. 스테이징
git add .
# 또는 특정 파일만
git add src/components/hero/HeroSection.jsx

# 3. 커밋
git commit -m "feat: add new hero animation"

# 4. 푸시
git push origin main
```

#### 실수로 커밋한 경우 — 되돌리기

```bash
# 마지막 커밋 취소 (변경 내용은 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (변경 내용도 되돌림) ⚠️ 주의
git reset --hard HEAD~1

# 특정 파일 변경 취소
git checkout -- src/components/hero/HeroSection.jsx
```

#### 원격 저장소 충돌 시

```bash
# 1. 원격 변경 내용 가져오기
git fetch origin

# 2. 리베이스로 정리 (깔끔한 이력 유지)
git rebase origin/main

# 3. 충돌 발생 시 → 수동 해결 후
git add .
git rebase --continue

# 4. 푸시 (리베이스 후에는 --force 필요할 수 있음)
git push origin main --force-with-lease
```

### 4-6. 새 환경에서 프로젝트 클론

```bash
# 1. 저장소 클론
git clone https://github.com/matthewshim/PriSincera.git
cd PriSincera

# 2. 의존성 설치
npm install

# 3. .firebaserc 생성 (gitignore 대상이므로 수동 생성)
echo '{ "projects": { "default": "prisincera" } }' > .firebaserc

# 4. Firebase CLI 로그인
firebase login
firebase use prisincera

# 5. 개발 서버 실행으로 정상 동작 확인
npm run dev
```

---

## 5. 개발 환경 설정

### 5-1. 필수 도구

| 도구 | 설치 방법 | 용도 |
|------|-----------|------|
| **Node.js** (LTS) | https://nodejs.org | JS 런타임, npm 패키지 매니저 |
| **Git** | https://git-scm.com | 버전 관리 |
| **Firebase CLI** | `npm install -g firebase-tools` | Firebase 배포 |
| **VS Code** (권장) | https://code.visualstudio.com | 코드 에디터 |

### 5-2. 개발 서버 실행

```bash
npm run dev
```

- **로컬 URL**: http://localhost:3000
- Vite HMR(Hot Module Replacement)로 코드 수정 시 즉시 반영
- `vite.config.js`에서 `port: 3000`, `open: true` 설정

### 5-3. npm 스크립트

| 스크립트 | 명령어 | 설명 |
|----------|--------|------|
| `dev` | `npm run dev` | Vite 개발 서버 실행 (HMR, localhost:3000) |
| `build` | `npm run build` | 프로덕션 빌드 → `dist/` 생성 |
| `preview` | `npm run preview` | 빌드 결과물 로컬 프리뷰 |
| `start` | `npm start` | **프로덕션 서버 기동 (`node server.mjs`) — 빌드 후 dist 서빙 + API** |

---

## 6. 개발 워크플로우

### 6-1. 전체 흐름도

```
┌─────────────┐    ┌──────────────┐    ┌──────────────────────────────────────┐
│  코드 수정   │ →  │  로컬 테스트  │ →  │  Git 커밋 & 푸시                      │
│  (VS Code)  │    │  (npm run    │    │  (git push origin main)              │
│             │    │    dev)      │    │         │                            │
└─────────────┘    └──────────────┘    │         ▼ (자동)                     │
                                       │  Cloud Build → Docker → Cloud Run   │
                                       └──────────────────────────────────────┘
```

> **💡 핵심 변경**: `git push origin main` 한 번으로 **자동 빌드 & 배포**가 완료됩니다.  
> 별도의 `npm run build`나 `firebase deploy`가 필요 없습니다.

### 6-2. 표준 작업 순서

```bash
# ① 최신 소스 동기화
git pull origin main

# ② 코드 수정 & 로컬 테스트
npm run dev

# ③ 변경 사항 커밋
git add .
git commit -m "feat: 작업 내용 설명"

# ④ GitHub에 푸시 → 자동 빌드 & 배포 (Cloud Build 트리거)
git push origin main
```

> 푸시 후 약 **3~4분** 내에 프로덕션에 자동 반영됩니다.  
> 빌드 상태는 [Cloud Build 콘솔](https://console.cloud.google.com/cloud-build/builds?project=prisincera)에서 확인 가능합니다.

### 6-3. 수동 배포 (긴급 시)

Cloud Build 트리거 없이 수동으로 배포해야 하는 경우:

```bash
# gcloud CLI로 직접 빌드 & 배포
gcloud builds submit --tag asia-northeast3-docker.pkg.dev/prisincera/prisincera-images/web:latest

gcloud run deploy prisincera-web \
    --image asia-northeast3-docker.pkg.dev/prisincera/prisincera-images/web:latest \
    --region asia-northeast3
```

---

## 7. GCP Cloud Run 설정

### 7-1. 인프라 구성

| 구성 요소 | 리소스명 | 설명 |
|----------|---------|------|
| **Cloud Run 서비스** | `prisincera-web` | Node(Express) `server.mjs` 컨테이너 (포트 8080) |
| **Artifact Registry** | `prisincera-images` | Docker 이미지 저장소 |
| **Cloud Build 트리거** | `deploy-to-cloud-run` | GitHub main 푸시 시 웹 서비스 자동 빌드 |
| **Cloud Build 트리거** | `deploy-pipeline` | GitHub main 푸시 시 파이프라인 이미지 빌드 |
| **Network Endpoint Group** | `prisincera-neg` | Cloud Run → LB 연결 |
| **Backend Service** | `prisincera-backend` | LB 백엔드 |
| **URL Map** | `prisincera-urlmap` | 요청 라우팅 |
| **HTTPS 프록시** | `prisincera-https-proxy` | SSL 종단 |
| **고정 IP** | `prisincera-ip` | `136.110.131.58` |
| **SSL 인증서** | `prisincera-cert` | Google 관리형 자동 인증서 |

### 7-2. Dockerfile (멀티스테이지 빌드)

```dockerfile
# ── Stage 1: Vite SPA 빌드 ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
RUN npm run build

# ── Stage 2: Node(Express) 프로덕션 서버 ──
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.mjs admin-api.mjs study-api.mjs pacenote-api.mjs ./
COPY pipeline/ ./pipeline/
COPY src/data/ ./src/data/
COPY public/content/ ./public/content/
COPY package*.json ./
RUN npm ci --omit=dev && npm install --prefix pipeline --omit=dev && npm cache clean --force
RUN addgroup -g 1001 -S nodejs && adduser -S prisincera -u 1001 -G nodejs
USER prisincera                 # 비루트 실행
EXPOSE 8080
CMD ["node", "server.mjs"]      # ← Nginx 아님: Express 서버가 dist 서빙 + API 마운트
```

> Stage 2가 `server.mjs`와 API 모듈, `pipeline/`(서버에서 일부 lib 재사용), 번들 데이터(`src/data/`)·블로그 마크다운(`public/content/`)을 함께 복사한다는 점에 유의. `VITE_FIREBASE_API_KEY`는 빌드 인자로 주입됩니다.

### 7-3. SPA 서빙 (server.mjs — nginx.conf는 레거시)

> ⚠️ 과거에는 Nginx가 정적 서빙을 담당했으나, **현재는 `server.mjs`(Express)가 SPA 폴백·압축·API를 모두 처리**합니다. 리포지토리의 `nginx.conf`는 빌드/배포에 쓰이지 않는 **레거시 파일**입니다.

| 책임 | 구현 (server.mjs) | 설명 |
|------|------|------|
| 포트 | `process.env.PORT` (기본 8080) | Cloud Run 주입 |
| SPA 폴백 | `express.static(dist)` + `*` → `index.html` | 클라이언트 라우팅 폴백 |
| 압축 | `compression` 미들웨어 | 텍스트 리소스 gzip |
| 보안 헤더 | `helmet` | CSP/XFO 등 |
| API | `/api/*`, `/admin/api/*` 라우터 마운트 | 아래 §7-3a |

### 7-3a. API 라우트 (server.mjs 마운트 — 2026-06-29 현행)

| 경로 (prefix) | 라우터 모듈 | 인증 | 용도 |
|------|------|------|------|
| `/api/daily/*` | server.mjs 내장 | — | 데일리 피드 GCS 프록시(`:date`, `index`), 트랙 피드(junior/senior) |
| `/api/pacenote/*` | `pacenote-api.mjs` | Firebase idToken | 주차 데이터·실행 궤도 CRUD |
| `/admin/api/*` | `admin-api.mjs` | 관리자 | 콘텐츠 생성 트리거·구독·통계·잡 실행 |
| `/api/builderslog/*` | `builderslog-api.mjs` | (조회 공개) | Builder's Log 조회수·발행 |
| 어학(Language Dojo) | `study-api.mjs` | — | 어학 콘텐츠 |
| `POST /api/subscribe` | server.mjs | — | 이메일 구독 |
| `GET /api/unsubscribe` | server.mjs | HMAC | `UNSUBSCRIBE_SECRET` 토큰 검증 후 해지 |

> 전체 환경변수·시크릿은 [environment_reference](environment_reference.md), 인증 흐름은 [authentication_architecture](authentication_architecture.md) 참조.

### 7-4. 캐시 정책 (nginx.conf)

| 대상 | Cache-Control | TTL | 비고 |
|------|---------------|-----|------|
| JS / CSS | `public, max-age=31536000, immutable` | 1년 | Vite 해시 파일명 → 변경 시 새 URL |
| 오디오 (`/audio/`) | `public, max-age=31536000` | 1년 | 용량이 큰 파일 장기 캐시 |
| 이미지 | `public, max-age=86400` | 1일 | 로고 등 변경 가능성 고려 |

### 7-5. 보안 헤더 (nginx.conf)

| 헤더 | 값 | 용도 |
|------|-----|------|
| `X-Content-Type-Options` | `nosniff` | MIME 타입 스니핑 방지 |
| `X-Frame-Options` | `DENY` | 클릭재킹 방지 |
| `X-XSS-Protection` | `1; mode=block` | XSS 필터 활성화 |

### 7-6. Cloud Build 파이프라인 (`cloudbuild.yaml`)

```
git push main → Cloud Build 트리거 (cloudbuild.yaml, 총 11스텝)
  [Part 1] 웹 (prisincera-web)
  ├── Step 0: npm ci + npm audit (critical 취약점 점검)
  ├── Step 1: web Docker 이미지 빌드 (VITE_FIREBASE_API_KEY 주입)
  ├── Step 2: Artifact Registry 푸시 (SHA + latest)
  └── Step 3: Cloud Run 배포 + --set-secrets(GEMINI_API_KEY←GEMINI_ADMIN_API_KEY, GITHUB_TOKEN)
  [Part 2] 파이프라인 (Cloud Run Jobs)
  ├── Step 4~5: pipeline 이미지 빌드 & 푸시
  └── Step 6~11: jobs update ×6
        prisignal-collector · prisignal-composer · prisignal-monitor
        pristudy-composer · pacenote-composer · tech-composer
```

> ⚠️ **잡 갱신(Step 6~11)은 빌드 후반** — 코드 변경 후 잡을 수동 실행하려면 **Cloud Build SUCCESS를 먼저 확인**하세요(옛 이미지로 돌 수 있음). 잡 운영은 [operations_runbook](operations_runbook.md).

Cloud Run 배포 설정:

| 설정 | 값 | 설명 |
|------|-----|------|
| `min-instances` | `1` | 콜드 스타트 방지 |
| `max-instances` | `5` | 최대 스케일 |
| `memory` | `512Mi` | 인스턴스 메모리 |
| `concurrency` | `80` | 인스턴스당 동시 요청 수 |

### 7-7. Cloud Run Jobs 및 IAM 서비스 계정 권한 (2026-06-09 추가)

PriSignal의 데일리 수집 및 메일 발송 파이프라인 등 배치성 백그라운드 작업들은 별도의 **Cloud Run Jobs**로 실행되며, Cloud Scheduler를 통해 스케줄링됩니다.

#### 1) 대상 Job 리스트 (cloudbuild.yaml Step 6~11 — 총 6종)
- `prisignal-collector` (`src/collector.mjs`): RSS 피드 수집. timeout 300s / retry 2.
- `prisignal-composer` (`src/composer.mjs`): 스코어링·DM픽·뉴스레터 발송·GCS 배포. timeout 1800s / retry 0.
- `pristudy-composer` (`src/study-composer.mjs`): 어학(Language Dojo) 문장·프롬프트 생성. 1800s / retry 0.
- **`tech-composer`** (`src/tech-composer.mjs`): 수준별 테크 트랙 하이브리드 피드(주니어/시니어). 1800s / retry 0.
- `pacenote-composer` (`src/pacenote-composer.mjs`): PaceNote 추천 궤도 풀 갱신. 1800s / retry 0.
- `prisignal-monitor` (`src/monitor.mjs`): 주간 발송/파이프라인 모니터링. 120s / retry 1.

> **스케줄(KST)은 Cloud Scheduler에서 관리**(리포지토리에 cron 정의 없음). 기준 시각은 [architecture_overview](architecture_overview.md) §4, 잡 수동 재실행·장애 복구는 [operations_runbook](operations_runbook.md) 참조.

#### 2) 서비스 계정 및 최소 권한
모든 Job은 최소 권한 원칙에 따라 커스텀 파이프라인 서비스 계정(`prisignal-pipeline@prisincera.iam.gserviceaccount.com`)을 할당받아 실행됩니다.

#### 3) CI/CD 배포를 위한 필수 IAM 권한 (중요)
Cloud Build 파이프라인(`cloudbuild.yaml`)에서 `gcloud run jobs update` 명령어를 통해 배치 Job들을 자동으로 갱신(Update)하려면, **Cloud Build 실행 계정이 대상 Job의 서비스 계정을 대신해 동작할 수 있는 권한**이 사전에 바인딩되어 있어야 합니다.
- **필수 역할**: Service Account User (`roles/iam.serviceAccountUser`)
- **대상**: 배치 Job 전용 서비스 계정 (`prisignal-pipeline@prisincera.iam.gserviceaccount.com`)
- **구성원**: 기본 Compute Engine 서비스 계정 (예: `[PROJECT_NUMBER]-compute@developer.gserviceaccount.com` 또는 활성 Cloud Build 서비스 계정)

이 권한이 누락되면 Cloud Build 시 아래와 같은 `PERMISSION_DENIED` 오류가 발생하여 파이프라인 전체 배포가 차단됩니다.
> `PERMISSION_DENIED: Permission 'iam.serviceaccounts.actAs' denied on service account...`

**해결 및 예방 명령어 (CLI):**
```bash
gcloud iam service-accounts add-iam-policy-binding \
  prisignal-pipeline@prisincera.iam.gserviceaccount.com \
  --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## 8. 빌드 & 배포 프로세스

### 8-1. 일상 배포 (자동)

```bash
git push origin main    # 이것만으로 자동 빌드 & 배포!
```

Cloud Build가 자동으로:
1. Docker 이미지 빌드 (~2분)
2. Artifact Registry에 푸시
3. Cloud Run에 새 리비전 배포 (~30초)

배포 상태 확인:
- [Cloud Build 콘솔](https://console.cloud.google.com/cloud-build/builds?project=prisincera)
- [Cloud Run 콘솔](https://console.cloud.google.com/run/detail/asia-northeast3/prisincera-web/revisions?project=prisincera)

### 8-2. 롤백 (이전 배포 버전으로 복원)

**방법 1 — Cloud Run 콘솔 (GUI)**
1. [Cloud Run 콘솔](https://console.cloud.google.com/run/detail/asia-northeast3/prisincera-web/revisions?project=prisincera)
2. 이전 리비전 → **"트래픽 관리"** → 100% 라우팅

**방법 2 — CLI (이미지 태그 기반)**
```bash
# 이전 이미지로 즉시 롤백
gcloud run deploy prisincera-web \
    --image asia-northeast3-docker.pkg.dev/prisincera/prisincera-images/web:<이전_SHA> \
    --region asia-northeast3
```

**방법 3 — Git으로 소스 복원 후 자동 재배포**
```bash
git log --oneline -10              # 커밋 이력 확인
git revert <commit-hash>           # 해당 커밋 되돌리기
git push origin main               # 자동 재배포 트리거
```

---

## 9. 커스텀 도메인 & DNS 설정

### 9-1. 도메인 정보

| 항목 | 값 |
|------|-----|
| **도메인** | `prisincera.com` / `www.prisincera.com` |
| **정식(canonical) URL** | `https://www.prisincera.com` |
| **등록 업체** | Squarespace (구 Google Domains) |
| **DNS 관리** | Google Cloud DNS (`prisincera-zone`) |
| **연결 방식** | GCP HTTPS Load Balancer → Cloud Run |
| **리다이렉트** | `prisincera.com` → `www.prisincera.com` (Nginx 301) |

### 9-2. Load Balancer를 통한 도메인 연결

Cloud Run `asia-northeast3`(서울) 리전은 직접 도메인 매핑이 미지원이므로,  
Global HTTPS Load Balancer를 통해 커스텀 도메인을 연결합니다.

```
prisincera.com / www.prisincera.com (A 레코드)
    → 136.110.131.58 (고정 IP)
    → HTTPS Load Balancer (SSL 종단)
    → Backend Service
    → Serverless NEG
    → Cloud Run (prisincera-web)

* prisincera.com 접속 시 Nginx에서 www.prisincera.com으로 301 리다이렉트
```

### 9-3. DNS 레코드 설정

#### Apex 도메인 (`prisincera.com`)

| 타입 | 호스트 | 값 | TTL |
|:----:|--------|-----|:---:|
| TXT | `@` | `hosting-site=prisincera` | 300 |
| A | `@` | `136.110.131.58` | 300 |

#### WWW 서브도메인 (`www.prisincera.com`)

| 타입 | 호스트 | 값 | TTL |
|:----:|--------|-----|:---:|
| A | `www` | `136.110.131.58` | 300 |

> ⚠️ DNS는 **Google Cloud DNS** (`prisincera-zone`)에서 관리됩니다.  
> Squarespace DNS UI가 아닌 `gcloud dns record-sets` 명령어로 변경해야 합니다.

#### Google 레코드

| 타입 | 호스트 | 값 | TTL |
|:----:|--------|-----|:---:|
| MX | `@` | `smtp.google.com` (우선순위 1) | 1시간 |

---

## 10. DNS 트러블슈팅

### 10-1. Cloud DNS 주의사항

| 문제 | 원인 | 해결 |
|------|------|------|
| **Squarespace 변경 미반영** | 네임서버가 Google Cloud DNS를 사용 | `gcloud dns record-sets` 명령어로 변경 |
| **CNAME + A 공존 불가** | DNS 표준: 같은 호스트에 CNAME과 A 동시 불가 | Apex(`@`)와 `www` 모두 A 레코드 사용 |
| **전파 지연** | DNS 레코드 변경 후 전파에 시간 소요 | TTL 300초(5분), 일반적으로 즉시 반영 |
| **네임서버 불일치** | 외부 네임서버 사용 중일 수 있음 | `ns1~ns4.squarespace.com` 확인 |

### 10-2. DNS 전파 확인

```bash
# A 레코드 확인
nslookup prisincera.com

# Google DNS로 확인
nslookup prisincera.com 8.8.8.8

# 레코드 타입별 확인
nslookup -type=A prisincera.com
nslookup -type=CNAME www.prisincera.com
nslookup -type=TXT prisincera.com
```

**온라인 도구:**
- [DNS Checker](https://dnschecker.org) — 글로벌 전파 상태
- [whatsmydns](https://www.whatsmydns.net) — 지역별 DNS 확인

### 10-3. 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| 소유권 확인 실패 | TXT 레코드 미전파 또는 오타 | `nslookup -type=TXT`로 확인, 정확한 값 재입력 |
| DNS 레코드 미감지 | 기존 레코드 충돌 | 기존 A 레코드 삭제 → GCP IP만 남김 |
| ERR_CONNECTION_REFUSED | A 레코드 IP 불일치 | `136.110.131.58` 확인 |
| CSS/JS 깨짐 | Docker 빌드 실패 | Cloud Build 로그 확인 |
| 502 Bad Gateway | Cloud Run 응답 실패 | Cloud Run 로그 확인, Nginx 설정 점검 |

---

## 11. SSL 인증서

GCP HTTPS Load Balancer는 **Google 관리형 SSL 인증서**를 자동 발급/갱신합니다.

| 상태 | 의미 |
|------|------|
| PROVISIONING | 인증서 발급 중 (DNS 전파 대기) |
| ACTIVE | 인증서 발급 완료, HTTPS 활성 |
| FAILED_NOT_VISIBLE | DNS가 GCP IP를 가리키지 않음 → 전파 대기 필요 |

인증서 상태 확인:
```bash
gcloud compute ssl-certificates describe prisincera-cert --global --format='table(name,managed.status,managed.domainStatus)'
```

별도의 인증서 관리가 필요 없습니다.

---

## 12. 유지보수 & 점검

### 12-1. 정기 점검 체크리스트

| 주기 | 점검 항목 | 방법 |
|------|-----------|------|
| **수시** | 사이트 접속 정상 여부 | 브라우저에서 https://prisincera.com 확인 |
| **수시** | Git 동기화 상태 | `git status`, `git log --oneline -3` |
| **월 1회** | GCP 사용량 & 비용 | [GCP 결제 콘솔](https://console.cloud.google.com/billing) |
| **월 1회** | Cloud Run 로그 확인 | [Cloud Run 로그](https://console.cloud.google.com/run/detail/asia-northeast3/prisincera-web/logs?project=prisincera) |
| **월 1회** | npm 보안 취약점 | `npm audit` |
| **분기 1회** | npm 패키지 업데이트 | `npm outdated` → `npm update` |
| **분기 1회** | gcloud CLI 업데이트 | `gcloud components update` |
| **분기 1회** | DNS 레코드 정상 여부 | `nslookup prisincera.com` |
| **분기 1회** | SSL 인증서 상태 | `gcloud compute ssl-certificates describe prisincera-cert --global` |
| **연 1회** | 도메인 갱신 확인 | Squarespace 대시보드에서 자동갱신/결제 확인 |

### 12-2. 패키지 업데이트

```bash
# 업데이트 가능한 패키지 확인
npm outdated

# 호환 범위 내 업데이트
npm update

# 메이저 업데이트 (주의: 호환성 확인 필요)
npm install react@latest react-dom@latest
```

업데이트 후 반드시 `npm run dev`로 로컬 테스트를 수행합니다.

---

## 13. 긴급 상황 대응

### 🚨 사이트 접속 불가

```
1. Cloud Run URL 직접 접속 시도
   https://prisincera-web-1094711522476.asia-northeast3.run.app
   ├─ 접속 가능 → DNS 또는 Load Balancer 문제
   │   ├─ nslookup prisincera.com → A 레코드 확인
   │   └─ LB 상태 확인: GCP Console → Load Balancing
   └─ 접속 불가 → Cloud Run 문제
       ├─ Cloud Run 로그 확인
       └─ gcloud run deploy 재시도
```

### 🚨 잘못된 코드 배포

```bash
# 방법 1: Cloud Run 콘솔에서 이전 리비전으로 롤백
# 방법 2: 이전 Docker 이미지로 즉시 롤백
gcloud run deploy prisincera-web \
    --image asia-northeast3-docker.pkg.dev/prisincera/prisincera-images/web:<이전_SHA> \
    --region asia-northeast3

# 방법 3: Git으로 복원 후 자동 재배포
git log --oneline -5
git revert <commit-hash>
git push origin main    # 자동 재배포 트리거
```

### 🚨 Git 푸시 충돌

```bash
git pull --rebase origin main
# 충돌 파일 수동 해결 후
git add .
git rebase --continue
git push origin main
```

### 🚨 도메인 만료 방지

- Squarespace 대시보드에서 **자동 갱신** 활성화
- 결제 수단 유효성 주기적 확인
- 만료일 알림 설정 권장

---

## 14. 명령어 레퍼런스

### Git

| 명령어 | 설명 |
|--------|------|
| `git status` | 현재 변경 상태 확인 |
| `git pull origin main` | 최신 소스 가져오기 |
| `git add .` | 모든 변경 파일 스테이징 |
| `git commit -m "메시지"` | 커밋 |
| `git push origin main` | GitHub에 푸시 |
| `git log --oneline -10` | 최근 10개 커밋 확인 |
| `git diff` | 수정 내용 비교 |
| `git stash` | 현재 변경 임시 저장 |
| `git stash pop` | 임시 저장 복원 |
| `git reset --soft HEAD~1` | 마지막 커밋 취소 (변경 유지) |
| `git revert <hash>` | 특정 커밋 되돌리기 (이력 보존) |

### npm

| 명령어 | 설명 |
|--------|------|
| `npm install` | 의존성 설치 |
| `npm run dev` | 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과물 미리보기 |
| `npm audit` | 보안 취약점 점검 |
| `npm outdated` | 업데이트 가능 패키지 확인 |

### GCP (gcloud)

| 명령어 | 설명 |
|--------|------|
| `gcloud auth login` | GCP 로그인 |
| `gcloud config set project prisincera` | 프로젝트 설정 |
| `gcloud run services list` | Cloud Run 서비스 목록 |
| `gcloud run deploy prisincera-web --image <TAG>` | 수동 배포 |
| `gcloud run revisions list --service=prisincera-web` | 리비전 이력 |
| `gcloud builds list --limit=5` | 최근 빌드 이력 |
| `gcloud builds submit --tag <TAG>` | 수동 빌드 |
| `gcloud compute ssl-certificates describe prisincera-cert --global` | SSL 상태 확인 |
| `gcloud compute addresses describe prisincera-ip --global` | 고정 IP 확인 |

### Firebase (레거시, 참고용)

| 명령어 | 설명 |
|--------|------|
| `firebase hosting:disable` | 호스팅 비활성화 |
| `firebase deploy` | 호스팅 재활성화 (롤백 시) |

---

> 💡 **이 문서는 프로젝트의 개발 환경 또는 인프라 변경 시 업데이트해야 합니다.**  
> Git 브랜치 전략 변경, GCP 설정 변경, 도메인 이전, 빌드 도구 변경 등이 발생하면 이 문서에 반영하세요.

*최종 업데이트: 2026-06-10*
