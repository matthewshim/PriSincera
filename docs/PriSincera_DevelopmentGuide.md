# 📘 PriSincera — 개발 관리 & 운영 가이드

> **최종 업데이트**: 2026-04-16  
> **작성 배경**: PriSincera 웹사이트의 소스 버전 관리(Git/GitHub), 빌드, Firebase Hosting 배포,  
> 커스텀 도메인 연결까지의 전체 개발 운영 프로세스를 기록합니다.

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 디렉토리 구조](#3-프로젝트-디렉토리-구조)
4. [Git 버전 관리](#4-git-버전-관리)
5. [개발 환경 설정](#5-개발-환경-설정)
6. [개발 워크플로우](#6-개발-워크플로우)
7. [Firebase Hosting 설정](#7-firebase-hosting-설정)
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
                                │
                          npm run build
                                │
                                ▼
                          dist/ 폴더 생성
                                │
                         firebase deploy
                                │
                                ▼
                ┌───────────────────────────────┐
                │   Firebase Hosting CDN        │
                │   ├─ prisincera.web.app       │
                │   └─ prisincera.com           │
                └───────────────────────────────┘
```

| 항목 | 값 |
|------|-----|
| **프로젝트명** | PriSincera |
| **Firebase 프로젝트 ID** | `prisincera` |
| **기본 호스팅 URL** | https://prisincera.web.app |
| **커스텀 도메인** | https://prisincera.com |
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
| **호스팅** | Firebase Hosting | — | 정적 파일 호스팅 & CDN |
| **버전 관리** | Git + GitHub | — | 소스 코드 버전 관리 |
| **런타임** | Node.js | LTS | 개발 환경 런타임 |

---

## 3. 프로젝트 디렉토리 구조

```
d:\prisincera\www\
│
├── 📁 src/                     # ── React 소스 코드 ──
│   ├── App.jsx                 # 루트 컴포넌트
│   ├── main.jsx                # 엔트리 포인트
│   ├── 📁 components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── 📁 common/          #   공통 컴포넌트
│   │   ├── 📁 hero/            #   히어로 섹션
│   │   ├── 📁 layout/          #   레이아웃 (헤더, 푸터 등)
│   │   └── 📁 philosophy/      #   철학 섹션
│   ├── 📁 hooks/               # 커스텀 React 훅
│   ├── 📁 pages/               # 페이지 컴포넌트
│   └── 📁 styles/              # 글로벌 CSS 스타일
│
├── 📁 public/                  # ── 정적 에셋 (빌드 시 dist로 복사) ──
│   └── 📁 audio/               #   BGM 등 오디오 파일
│
├── 📁 dist/                    # ── Vite 빌드 출력 (gitignore) ──
├── 📁 docs/                    # ── 프로젝트 문서 ──
├── 📁 ci/                      # ── CI/브랜딩 관련 ──
│
├── 📁 scripts/                 # 개발 스크립트 (gitignore)
├── 📁 sound/                   # 사운드 원본 소스 (gitignore)
│
├── 📄 index.html               # Vite 진입 HTML
├── 📄 vite.config.js           # Vite 설정
├── 📄 package.json             # 프로젝트 & 의존성 정의
├── 📄 package-lock.json        # 의존성 잠금 파일
├── 📄 firebase.json            # Firebase Hosting 설정
├── 📄 .firebaserc              # Firebase 프로젝트 연결 (gitignore)
└── 📄 .gitignore               # Git 추적 제외 목록
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
| `dev` | `npm run dev` | Vite 개발 서버 실행 (HMR) |
| `build` | `npm run build` | 프로덕션 빌드 → `dist/` 생성 |
| `preview` | `npm run preview` | 빌드 결과물 로컬 프리뷰 |

---

## 6. 개발 워크플로우

### 6-1. 전체 흐름도

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────────┐
│  코드 수정   │ →  │  로컬 테스트  │ →  │  Git 커밋    │ →  │  빌드 & 배포   │
│  (VS Code)  │    │  (npm run    │    │  & 푸시      │    │  (firebase     │
│             │    │    dev)      │    │  (git push)  │    │    deploy)     │
└─────────────┘    └──────────────┘    └──────────────┘    └────────────────┘
```

### 6-2. 표준 작업 순서

```bash
# ① 최신 소스 동기화
git pull origin main

# ② 코드 수정 & 로컬 테스트
npm run dev

# ③ 변경 사항 커밋
git add .
git commit -m "feat: 작업 내용 설명"

# ④ GitHub에 푸시
git push origin main

# ⑤ 프로덕션 빌드
npm run build

# ⑥ Firebase 배포
firebase deploy
```

> **💡 Tip**: 커밋/푸시와 배포를 분리하는 이유  
> - Git 커밋 = 소스 코드 기록 (빌드 결과물 제외)  
> - Firebase 배포 = 빌드된 `dist/`를 CDN에 업로드  
> - 소스 코드 버전과 배포 버전을 독립적으로 관리할 수 있습니다.

### 6-3. 미리보기 배포 (본 서비스에 영향 없음)

```bash
npm run build
firebase hosting:channel:deploy preview
```

고유한 미리보기 URL이 생성됩니다. 확인 후 문제 없으면 프로덕션 배포를 진행합니다.

---

## 7. Firebase Hosting 설정

### 7-1. `firebase.json` 상세

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/scripts/**",
      "**/sound/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [ ... ]
  }
}
```

| 설정 | 값 | 설명 |
|------|-----|------|
| `public` | `"dist"` | Vite 빌드 출력 폴더. 이 폴더만 Firebase에 업로드 |
| `ignore` | 배열 | 배포 제외 목록 |
| `rewrites` | `** → /index.html` | SPA 라우팅. 모든 경로를 `index.html`로 fallback |

### 7-2. 캐시 정책

| 대상 | Cache-Control | TTL | 비고 |
|------|---------------|-----|------|
| JS / CSS | `public, max-age=31536000, immutable` | 1년 | Vite 해시 파일명 → 변경 시 새 URL |
| 오디오 (`/audio/**`) | `public, max-age=31536000` | 1년 | 용량이 큰 파일 장기 캐시 |
| 이미지 | `public, max-age=86400` | 1일 | 로고 등 변경 가능성 고려 |

### 7-3. 보안 헤더

| 헤더 | 값 | 용도 |
|------|-----|------|
| `X-Content-Type-Options` | `nosniff` | MIME 타입 스니핑 방지 |
| `X-Frame-Options` | `DENY` | 클릭재킹 방지 |
| `X-XSS-Protection` | `1; mode=block` | XSS 필터 활성화 |

### 7-4. `.firebaserc`

```json
{
  "projects": {
    "default": "prisincera"
  }
}
```

> ⚠️ `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.  
> 새 환경에서 `firebase use prisincera`로 재설정하거나, 위 내용으로 파일을 수동 생성합니다.

---

## 8. 빌드 & 배포 프로세스

### 8-1. 일상 배포

```bash
npm run build       # dist/ 폴더 생성
firebase deploy     # Firebase CDN에 업로드
```

성공 시 출력:
```
✔ Deploy complete!
Hosting URL: https://prisincera.web.app
```

### 8-2. 롤백 (이전 배포 버전으로 복원)

**방법 1 — Firebase Console (GUI)**
1. [Firebase Console](https://console.firebase.google.com) → Hosting
2. **Release History** 탭 → 원하는 버전 → **"Rollback"**

**방법 2 — CLI**
```bash
firebase hosting:releases:list     # 배포 이력 확인
```

**방법 3 — Git으로 소스 복원 후 재배포**
```bash
git log --oneline -10              # 커밋 이력 확인
git checkout <commit-hash> .       # 해당 시점 소스로 복원
npm run build
firebase deploy
```

---

## 9. 커스텀 도메인 & DNS 설정

### 9-1. 도메인 정보

| 항목 | 값 |
|------|-----|
| **도메인** | `prisincera.com` |
| **등록 업체** | Squarespace (구 Google Domains) |
| **DNS 관리** | Squarespace DNS |

### 9-2. Firebase에 커스텀 도메인 연결

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 선택 → **Hosting**
2. **"커스텀 도메인 추가"** → `prisincera.com` 입력
3. 소유권 확인용 **TXT 레코드** 추가 안내를 따름
4. 소유권 확인 완료 후, **A 레코드** 설정

### 9-3. DNS 레코드 설정

> ⚠️ 아래 IP는 Firebase Console에서 안내하는 **실제 값**을 사용합니다.

#### Apex 도메인 (`prisincera.com`)

| 타입 | 호스트 | 값 | TTL |
|:----:|--------|-----|:---:|
| TXT | `@` | *(Firebase 소유권 확인 값)* | 3600 |
| A | `@` | *(Firebase 안내 IP #1)* | 3600 |
| A | `@` | *(Firebase 안내 IP #2)* | 3600 |

#### WWW 서브도메인 (`www.prisincera.com`)

| 타입 | 호스트 | 값 | TTL |
|:----:|--------|-----|:---:|
| CNAME | `www` | `prisincera.web.app` | 3600 |

---

## 10. DNS 트러블슈팅

### 10-1. Squarespace DNS 주의사항

| 문제 | 원인 | 해결 |
|------|------|------|
| **기존 레코드 충돌** | Squarespace 자체 호스팅 A/CNAME 레코드가 존재 | 충돌 레코드 삭제 후 Firebase 레코드 추가 |
| **CNAME + A 공존 불가** | DNS 표준: 같은 호스트에 CNAME과 A 동시 불가 | Apex(`@`)는 A 레코드, `www`는 CNAME |
| **전파 지연** | DNS 레코드 변경 후 전파에 시간 소요 | TTL 3600 설정, 최대 48시간 대기 |
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
| DNS 레코드 미감지 | 기존 레코드 충돌 | 기존 A 레코드 삭제 → Firebase 레코드만 남김 |
| ERR_CONNECTION_REFUSED | A 레코드 IP 불일치 | Firebase Console에서 IP 재확인 |
| CSS/JS 깨짐 | `npm run build` 누락 | `npm run build` → `firebase deploy` 재실행 |

---

## 11. SSL 인증서

Firebase Hosting은 Let's Encrypt SSL 인증서를 **자동 발급/갱신**합니다.

| 상태 | 아이콘 | 의미 |
|------|--------|------|
| Needs setup | 🔄 | DNS 레코드 미설정 |
| Pending | 🔄 | 인증서 발급 중 (수분~24시간) |
| Connected | ✅ | 연결 완료, HTTPS 활성 |

별도의 인증서 관리가 필요 없습니다.

---

## 12. 유지보수 & 점검

### 12-1. 정기 점검 체크리스트

| 주기 | 점검 항목 | 방법 |
|------|-----------|------|
| **수시** | 사이트 접속 정상 여부 | 브라우저에서 https://prisincera.com 확인 |
| **수시** | Git 동기화 상태 | `git status`, `git log --oneline -3` |
| **월 1회** | Firebase 사용량 | Firebase Console → Usage |
| **월 1회** | npm 보안 취약점 | `npm audit` |
| **분기 1회** | npm 패키지 업데이트 | `npm outdated` → `npm update` |
| **분기 1회** | Firebase CLI 업데이트 | `npm update -g firebase-tools` |
| **분기 1회** | DNS 레코드 정상 여부 | `nslookup prisincera.com` |
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
1. https://prisincera.web.app 접속 시도
   ├─ 접속 가능 → DNS 문제 → nslookup으로 레코드 확인
   └─ 접속 불가 → Firebase 문제
       ├─ https://status.firebase.google.com 확인
       └─ firebase deploy 재시도
```

### 🚨 잘못된 코드 배포

```bash
# 방법 1: Firebase Console에서 이전 버전 롤백
# 방법 2: Git으로 복원 후 재배포
git log --oneline -5
git revert <commit-hash>
npm run build
firebase deploy
git push origin main
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

### Firebase

| 명령어 | 설명 |
|--------|------|
| `firebase login` | Firebase 로그인 |
| `firebase login --reauth` | 재인증 (토큰 만료 시) |
| `firebase use` | 현재 프로젝트 확인 |
| `firebase use prisincera` | 프로젝트 전환 |
| `firebase deploy` | 전체 배포 |
| `firebase deploy --only hosting` | 호스팅만 배포 |
| `firebase serve` | 로컬에서 Firebase 설정 테스트 |
| `firebase hosting:channel:deploy preview` | 미리보기 채널 배포 |
| `firebase hosting:releases:list` | 배포 이력 |
| `firebase hosting:disable` | 호스팅 일시 중지 |

---

> 💡 **이 문서는 프로젝트의 개발 환경 또는 인프라 변경 시 업데이트해야 합니다.**  
> Git 브랜치 전략 변경, Firebase 설정 변경, 도메인 이전, 빌드 도구 변경 등이 발생하면 이 문서에 반영하세요.
