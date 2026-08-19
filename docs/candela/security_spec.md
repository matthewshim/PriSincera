---
status: active
domain: Candela
last_updated: 2026-08-19
version: v1.1
target_files:
  - .gitignore
  - .gitattributes
  - .claude/settings.json
  - .githooks/
  - ci/secret-scan.mjs
  - ci/install-hooks.mjs
  - ci/design-check.mjs
  - src/data/secretPatterns.mjs
  - server.mjs
  - admin-api.mjs
  - firestore.rules
---

# 📜 캔델라 보안 규범 (Security Spec)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-19 | AI Agent | 최초 정의 — 공개 저장소 전제 위험 분석 9건, 즉시 조치 4건 반영, 절대 금지 규칙·계좌 분리 원칙 확정 | .gitignore, settings.json, server.mjs, admin-api.mjs |
| v1.1 | 2026-08-19 | AI Agent | §3-5~3-10 추가 — 스캐너 단일 소스화·3중 훅·훅 이동성(fail-closed)·라인엔딩·권한 정책 이동·알려진 한계·nginx.conf 삭제. N-7·N-8 금지 규칙 신설 | .githooks, ci/, .claude/settings.json, package.json |

---

## 1. 전제 — 이 저장소는 public이다

`github.com/matthewshim/PriSincera`는 공개 저장소다(비인증 GitHub API 200 응답으로 확인). 이 사실이 Candela의 모든 보안 판단을 지배한다.

> **public 저장소는 push된 순간 GitHub 캐시·포크·아카이브 서비스에 남는다. force push로 지워도 복구 가능하다.**
> "커밋 후 정리"는 존재하지 않는 선택지이며, **"커밋 전 차단"만이 유효하다.**

## 2. 절대 금지 규칙 (Never)

| # | 금지 | 이유 |
| :--- | :--- | :--- |
| N-1 | Candela 관련 값에 **`VITE_` 접두어 사용** | Vite는 `VITE_*` 환경변수를 클라이언트 번들에 문자열로 그대로 박아넣는다. `VITE_KIS_APP_KEY`는 전 세계 공개와 동의어다 |
| N-2 | 프록시 설정에 **브로커 토큰 주입** | 구 `nginx.conf`의 `/api/subscribe` 패턴(인증 없는 프록시 + 키 주입)을 Candela에 복제하면 즉시 계좌가 열린다. 해당 파일은 2026-08-19 삭제됐지만(§3-10) **패턴 자체를 금지**한다 — 되살아날 수 있는 것은 파일이 아니라 발상이다 |
| N-3 | 전략 로직·백테스트 코드를 **public 저장소에 커밋** | 알파 소실 = 수익 소멸. `candela-worker`(private)에서만 관리 |
| N-4 | 실적을 **git 커밋으로 발행** | 보유 종목·평단 영구 공개 + 서버가 push 권한 상시 보유 |
| N-5 | Admin 콘솔에 **증권사 API 키 보유** | Admin은 조종석이지 엔진이 아니다. 키는 Worker + Secret Manager |
| N-6 | 주문 응답 raw dump를 **로그·회고 글에 붙여넣기** | 계좌번호 노출. 로깅 시점에 마스킹 필수 |
| N-7 | **원격 악용이 가능한 미조치 항목**을 public 문서에 기술 | 공개 저장소에 "우리 약점 목록"을 올리는 셈. 로컬 접근이 이미 필요한 항목(에이전트 권한 등)은 공개해도 무방하나, 원격에서 찌를 수 있는 미조치 항목은 `candela-worker`(private)에만 적는다 |
| N-8 | 브로커 API 키를 **로컬 머신에 배치** | Windows 데스크톱·macOS 노트북 2대를 오가는 환경이다. 실계좌 키는 Secret Manager에만 두고 Worker를 클라우드에서 실행한다. 로컬 개발은 **모의투자 키로만** 한다 |

## 3. 적용 완료 조치 (2026-08-19)

Candela 착수 전, 기존 저장소에 이미 존재하던 4건을 선반영했다.

### 3-1. `.claude/` gitignore 등재 + 시크릿 패턴 확장
`.claude/`는 untracked였을 뿐 차단되지 않아 `git add -A` 한 번이면 커밋될 수 있었다(내부 경로·GCP 빌드 ID·트리거 UUID 노출). [.gitignore](../../.gitignore)에 등재하고(→ §3-8에서 `.claude/*` + `!settings.json` 분할로 재조정), `.env` 단일 항목을 `.env.*` 와일드카드로 확장해 `.env.candela` 같은 파생 파일명까지 차단했다. `*.key`·`*.pem`·`*secret*.json`·`serviceAccount*.json`도 추가했다.

### 3-2. AI 에이전트 자동 push 권한 회수
`.claude/settings.json`에 `PowerShell(git push origin main)`과 포괄적 `Bash(git commit *)`이 사전 허용되어 있었다. 로컬에 브로커 키가 존재하는 상태에서는 에이전트가 시크릿을 커밋·푸시하는 경로에 **사람 게이트가 없다**는 뜻이다.

*   자동 허용에서 `git commit`·`git push` 규칙 전량 제거 → 이제 사람 확인을 거친다
*   `permissions.deny`에 `git push *`·`git remote set-url *` 등재 — deny는 allow보다 우선하므로 광범위 규칙으로 되살아나지 않는다

> **잔여 항목**: `Bash(node -e ' *)`·`Bash(npm i *)`는 임의 코드 실행·패키지 설치를 허용한다. push가 막혀 git 경로는 닫혔으나 네트워크 경로는 열려 있다. **브로커 키가 로컬 머신에 놓이는 시점(M4)에 재검토한다.**

### 3-3. `trust proxy` 설정
Cloud Run은 모든 요청이 프런트엔드 프록시를 거치므로, `trust proxy` 없이는 `req.ip`가 전부 프록시 IP로 잡혀 **rate limit이 IP별이 아닌 전역 단일 버킷**으로 동작했다. [server.mjs](../../server.mjs)에 `app.set('trust proxy', 1)`을 추가했다(`true`가 아닌 홉 수 1 고정 — `X-Forwarded-For` 위조 우회 차단).

### 3-4. 시크릿 스캐너 보강 + 문서 경로 데니얼리스트
[admin-api.mjs](../../admin-api.mjs)의 `/admin/api/docs/save`와 `/admin/api/builderslog/publish`는 **public 저장소 `main`에 직접 커밋하고 자동 배포까지 트리거**한다. 기존 스캐너는 `ghp_`·`AIza`·Slack·PEM만 탐지했다.

*   두 경로가 `DOC_SECRET_PATTERNS` **단일 집합을 공유**하도록 통합 (탐지 강도가 갈리면 안 된다)
*   추가 패턴: fine-grained GitHub PAT, AWS Access Key ID, **증권 종합계좌번호(8-2 형식)**
*   브로커 API 키(한투 `APP_KEY`/`APP_SECRET`)는 고유 접두어가 없어 값만으로 식별이 불가능하다 → **"키 이름 = 긴 문자열" 대입 형태**를 탐지하는 패턴으로 우회
*   `DOC_PATH_DENYLIST` 신설 — `docs/candela/private/` 이하는 웹 편집기로 저장 불가

### 3-5. 시크릿 스캐너 단일 소스화 + 로컬 훅 (2026-08-19)

기존 스캐너는 admin 웹 편집기 경로에서만 동작했고 **로컬 `git commit`에는 아무 검사가 없었다.** 자동 커밋을 켜려면 이 구멍이 먼저 막혀야 한다.

*   **[src/data/secretPatterns.mjs](../../src/data/secretPatterns.mjs)** — 패턴 단일 소스(SSOT). `admin-api.mjs`와 로컬 훅이 동일 집합을 공유한다. `src/data/`에 둔 이유는 Dockerfile이 컨테이너로 복사하는 경로이기 때문(`ci/`는 아니다).
*   **[ci/secretPatterns.test.mjs](../../ci/secretPatterns.test.mjs)** — positive 15·negative 9 케이스. **훅 설치보다 먼저 통과시켰다** — 검증되지 않은 스캐너를 훅에 걸면 "검사하고 있다"는 잘못된 안심만 생기고, 그건 검사가 아예 없는 것보다 나쁘다.
*   **3중 훅** — `pre-commit`(스테이징 blob) · `commit-msg`(메시지) · `pre-push`(푸시 범위 재검사)
*   **인코딩** — 이 저장소의 `.env`가 187바이트 중 NUL 25바이트를 포함하는 혼합 인코딩이었다. UTF-8로만 읽는 스캐너는 UTF-16 영역을 **아예 보지 못한다**. `scanBuffer()`가 양쪽 해석으로 검사한다.
*   **오탐 대응** — 줄 끝에 `secret-scan:ignore` 마커.

### 3-6. 훅 이동성 — fail-open 차단 (2026-08-19)

`.git/hooks`는 clone되지 않는다. **새 환경에서 훅의 기본값은 '부재'이고, 부재한 훅은 아무 소리 없이 통과한다.** Windows 데스크톱 ↔ macOS 노트북을 오가는 환경에서는 이게 예외가 아니라 기본 상태다.

```
.githooks/                      훅 스크립트 — 저장소로 이동
package.json prepare            npm install 시 core.hooksPath 설정
.claude/settings.json           SessionStart · PreToolUse — settings.json도 git으로 이동
.githooks/post-merge            pull 이후 자가 치유
ci/design-check.mjs             hooksPath 미설정이면 빌드 실패 (fail-closed)
```

핵심은 **`.claude/settings.json`이 git으로 따라온다**는 점이다. `SessionStart` 훅이 세션마다 활성화를 시도하고, `PreToolUse` 훅이 `git commit`·`git push` 직전에 한 번 더 확인해 활성화에 실패하면 툴 호출 자체를 차단한다. 진입점은 모두 `ci/install-hooks.mjs`를 부르며 이미 활성이면 무출력으로 통과한다(멱등).

`post-merge`만으로는 부족한 이유는 **닭-달걀**이다 — 그 훅 자체가 `core.hooksPath`가 이미 설정돼야 실행된다. 최초 활성화는 반드시 git 바깥의 진입점이 맡아야 한다.

prebuild 게이트는 최후 백스톱이다. 저장소를 통해 이동하고 실패 시 배포가 막히므로 **"훅 없는 환경에서는 배포가 불가능하다"**가 성립한다. Docker 빌드 컨텍스트는 `.dockerignore`가 `.git`을 빼므로 자동으로 건너뛴다.

> **잔여 구멍**: Claude Code를 쓰지 않고 순수 터미널에서 `npm` 명령 없이 바로 커밋하는 경로. 빌드 전 커밋은 검사를 받지 않는다.

### 3-7. 라인 엔딩 정규화 (2026-08-19)

`.gitattributes`가 없고 Windows 쪽 `core.autocrlf=true`였다. 이 상태로 훅을 두면 워킹트리에서 CRLF가 되어 shebang이 `#!/usr/bin/env node\r`로 해석되고 **`env: 'node\r': No such file or directory`로 훅이 죽는다 — 그 실패는 조용하다.** `.githooks/** text eol=lf`로 고정했다.

### 3-8. 권한 정책의 이동 (2026-08-19)

`.claude/` 통째 gitignore는 과했다. deny 규칙과 경로 제한이 새 머신으로 이동하지 않기 때문이다.

*   `.claude/settings.json` → **커밋** (OS 중립 공유 정책: deny 규칙, 경로 지정 add 허용)
*   `.claude/settings.local.json` → gitignore (머신별 절대경로, 누적된 일회성 명령 규칙)

**전체 스테이징(`git add -A`·`.`·`-u`)과 `git commit -a`를 deny**했다. 경로를 지정한 add만 허용한다 — 병행 작업 중인 무관한 변경분과 예상 못한 신규 파일을 쓸어 담는 경로이기 때문이다. 스캐너는 휴리스틱이지만 경로 제한은 구조적이다.

### 3-9. 알려진 한계

정직하게 기록한다. 이 층들은 위험을 낮추지 제거하지 않는다.

| 한계 | 실질 영향 | 보완 |
| :--- | :--- | :--- |
| 접두어 없는 시크릿은 `이름 = 값` 형태로만 탐지 | 산문 속에 값만 붙여넣으면 통과 | 경로 제한(구조적) + GitHub 서버 측 탐지 |
| deny 규칙은 **접두어 매칭** — `git commit -m "x" --no-verify`처럼 옵션이 뒤에 붙으면 우회됨 | pre-commit 우회 가능 | **`pre-push` 훅**이 push 직전 범위를 재검사해 포착 |
| `git -c core.hooksPath=... commit` 형태의 우회 | 훅 전체 무력화 | `pre-push`도 함께 우회되면 남는 건 GitHub 측 탐지뿐 |
| GitHub Secret Scanning은 **알려진 제공자 형식만** 탐지 | `SMTP_PASS`·한투 키는 못 잡음 | 로컬 훅이 1차 방어선 |

### 3-10. `nginx.conf` 삭제 (2026-08-19)

프로덕션 컨테이너는 `node server.mjs`를 실행하며 Dockerfile이 `nginx.conf`를 COPY하지 않는다 — 즉 **가동에 관여하지 않는 죽은 파일**이었다. 그런데 내용은 위험했다.

*   CSP 헤더가 없다 (현행 `server.mjs`는 helmet으로 CSP·HSTS를 설정한다)
*   `/api/subscribe`·`/api/archive`가 **인증 없이** `proxy_set_header Authorization "Token $BUTTONDOWN_API_KEY"`로 키를 주입한다

되살아나면 보안 등급이 내려가고, 무엇보다 Candela 작업 중 "프록시에서 키 주입" 발상의 참조 구현으로 재사용될 위험이 있었다. 코드·빌드 참조 0건을 전수 확인한 뒤 삭제했다(git 히스토리가 아카이브 역할을 하므로 별도 보관 불필요).

> 금지 규칙 **N-2는 유지된다.** 파일은 사라져도 발상은 사라지지 않는다.

## 4. 착수 시 적용 (M0~M2)

| # | 항목 | 내용 |
| :--- | :--- | :--- |
| S-1 | **pre-commit 훅** | `DOC_SECRET_PATTERNS`를 재사용한 로컬 스캐너. public 저장소에서 유일하게 유효한 방어선 |
| S-2 | **GitHub Secret Scanning + Push Protection** | 서버 측 최후 방어선. public 저장소는 무료 |
| S-3 | **step-up 재인증** | Candela 탭 진입은 `super_admin` 전용. 상태 변경 명령은 TOTP(Firebase MFA) 재인증 → 15분 단기 토큰. 조회는 마찰 없음 |
| S-4 | **유휴 타임아웃** | `browserSessionPersistence`는 탭이 열려 있으면 토큰이 자동 갱신되어 무기한 유지된다. Candela 탭에 10분 유휴 → step-up 재요구 |
| S-5 | **명령 엔드포인트 전용 rate limit** | 기존 `adminLimiter`(100회/15분)는 주문 명령에 과대. 10회/15분으로 별도 적용 |
| S-6 | **번들 분리** | Candela 관리 화면은 `React.lazy` 코드 스플리팅. 퍼블릭 방문자 번들에 매매 로직·엔드포인트가 실리지 않게 한다 |
| S-7 | **공급망 차단** | Worker는 의존성 최소화 + `npm ci --ignore-scripts` + lockfile 고정 + Dependabot. postinstall 스크립트 하나로 `.env`가 유출된다 |
| S-8 | **감사 로그** | `candela_audit` append-only. Firestore rules에서 클라이언트 write/delete 전면 차단 |
| ~~S-9~~ | ~~`nginx.conf` 정리~~ | ✅ 2026-08-19 삭제 완료 — §3-10 |

## 5. 가장 효과적인 통제 — 기술이 아닌 것

위 전부를 지켜도 사고 확률은 0이 되지 않는다. **확실한 상한선은 계좌 구조다.**

1.  **매매 전용 계좌를 분리하고, 잃어도 되는 금액만 넣는다.** 최대 손실이 기술 실패와 무관하게 고정된다.
2.  한국투자증권 오픈API에는 **출금 기능이 없다.** 키가 완전히 탈취돼도 자산 이동은 불가하며, 악의적 매매로 인한 손실만 가능하다.

이 둘을 결합하면 최악의 시나리오가 **"그 계좌 잔고"**로 한정된다. 앞의 기술적 통제 전부보다 확실하다.

## 6. 기존 방어 (현행 유지)

실측 확인된 양호 항목 — 훼손하지 않는다.

*   helmet CSP + HSTS preload, `referrerPolicy: strict-origin-when-cross-origin`
*   CORS origin 고정 (`https://www.prisincera.com`)
*   `router.use(requireAdmin)` — admin 라우터 전역 적용
*   Firebase ID 토큰 검증 + Firestore `admin_config` 화이트리스트 + `super_admin` 역할 분리
*   `adminApp` 별도 Firebase 인스턴스로 세션 물리 격리
*   Firestore **기본 deny** — 신규 컬렉션 자동 차단
*   `isDocPathSafe` 경로 화이트리스트 (`docs/**.md`, `..`·백슬래시·NUL 차단)
*   컨테이너 non-root 실행

> `VITE_FIREBASE_API_KEY`가 클라이언트 번들에 실리지만, Firebase 웹 apiKey는 설계상 공개 식별자이므로 유출이 아니다. 실제 보호는 Firestore rules와 서버 화이트리스트가 담당한다. **현행 유지가 맞다.**

---

## 관련 문서
*   [🏗️ 시스템 아키텍처](system_architecture.md)
*   [📘 사고 대응 런북](incident_response.md)
*   [🔍 보안 취약점 점검 보고서](../core/security_audit.md)
*   [🏗️ 인증·권한 아키텍처](../core/authentication_architecture.md)
