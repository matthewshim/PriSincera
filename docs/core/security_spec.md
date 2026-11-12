---
status: active
domain: Core
last_updated: 2026-11-12
version: v2.1
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

# 저장소 보안 규범 (Security Spec)

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-19 | 최초 정의 — 공개 저장소 전제 위험 분석, 즉시 조치 4건 반영, 절대 금지 규칙 확정 | .gitignore, settings.json, server.mjs, admin-api.mjs |
| v1.1 | 2026-08-19 | §3-5~3-10 추가 — 스캐너 단일 소스화·3중 훅·훅 이동성(fail-closed)·라인엔딩·권한 정책 이동·알려진 한계·nginx.conf 삭제 | .githooks, ci/, .claude/settings.json, package.json |
| v1.2 | 2026-08-20 | 퍼블릭 UI 운영 세부(경로·컬렉션·명령 enum·인프라·임계값) 노출 금지 규칙 신설 | 퍼블릭 UI 규범 |
| v2.1 | 2026-11-12 | **§3-2 정정 — 적혀 있던 통제가 실재한 적이 없었다.** "자동 허용에서 `git push` 전량 제거 → 사람 확인을 거친다"와 "`deny`에 `git push *` 등재"는 **작성 시점부터 사실과 달랐다.** 같은 커밋(`be455a2`)이 `.claude/settings.json`을 저장소에 추가했고 그 파일은 **allow에 `git push origin main`·`git push`, deny에는 `--no-verify`·`--force`만** 담고 있었다(현행과 동일). 실제 통제는 '사람 게이트'가 아니라 **훅 전수 검사 + 우회 경로 deny**다. 이 오기 위에 세워져 있던 잔여 위험 판단("push가 막혀 git 경로는 닫혔다")도 함께 정정 | §3-2, INDEX |
| v2.0 | 2026-10-17 | **Candela 종속 제거 — 저장소 전체 보안 규범으로 일반화하여 `docs/candela/`→`docs/core/` 이관.** 트레이딩 전용 규칙(브로커 키·전략 커밋·매매 계좌 분리·킬스위치·step-up)은 아카이브로 분리([candela_trading_archive](../archive/candela_trading_archive.md)). 구 사고 대응 런북 §2(퍼블릭 저장소 시크릿 커밋)를 §5로 흡수 | 문서 전반·도메인·ci/secret-scan.mjs 참조 |

---

## 1. 전제 — 이 저장소는 public이다

`github.com/matthewshim/PriSincera`는 공개 저장소다(비인증 GitHub API 200 응답으로 확인). 이 사실이 이 저장소의 모든 보안 판단을 지배한다.

> **public 저장소는 push된 순간 GitHub 캐시·포크·아카이브 서비스에 남는다. force push로 지워도 복구 가능하다.**
> "커밋 후 정리"는 존재하지 않는 선택지이며, **"커밋 전 차단"만이 유효하다.**

## 2. 절대 금지 규칙 (Never)

| # | 금지 | 이유 |
| :--- | :--- | :--- |
| N-1 | 시크릿·크리덴셜에 **`VITE_` 접두어 사용** | Vite는 `VITE_*` 환경변수를 클라이언트 번들에 문자열로 그대로 박아넣는다. 접두어가 붙는 순간 전 세계 공개와 동의어다 (예외: Firebase 웹 apiKey는 설계상 공개 식별자 — §6) |
| N-2 | 프록시 설정에 **인증 없는 키 주입** | 구 `nginx.conf`의 `/api/subscribe` 패턴(인증 없는 프록시 + 키 주입)은 즉시 자격증명을 연다. 해당 파일은 2026-08-19 삭제됐지만(§3-10) **패턴 자체를 금지**한다 — 되살아날 수 있는 것은 파일이 아니라 발상이다 |
| N-3 | 독점 로직·시크릿·크리덴셜을 **public 저장소에 커밋** | 알파·자산이 영구 공개된다. 민감 코드/값은 private 저장소 + Secret Manager에서만 관리 |
| N-4 | 외부 API 응답 raw dump를 **로그·회고 글에 붙여넣기** | 식별 정보(계정·토큰) 노출. 로깅 시점에 마스킹 필수 |
| N-5 | **원격 악용이 가능한 미조치 항목**을 public 문서에 기술 | 공개 저장소에 "우리 약점 목록"을 올리는 셈. 로컬 접근이 이미 필요한 항목(에이전트 권한 등)은 공개해도 무방하나, 원격에서 찌를 수 있는 미조치 항목은 private 에만 적는다 |
| N-6 | **퍼블릭 UI에 운영 세부 노출** (Admin 경로·인증 방식·컬렉션/큐 이름·명령 enum·엔드포인트·인프라/저장소명·탐지 임계값) | 홍보 가치 0, 정찰 가치만 제공한다. 퍼블릭은 시스템이 *작동함*을 보이되(신뢰 경계·인바운드 없음 등 **속성 서술**은 허용) 공격 표면이 되는 세부는 비노출. N-5의 UI 확장판 |

## 3. 적용 완료 조치

저장소에 이미 적용되어 가동 중인 하드닝이다.

### 3-1. `.claude/` gitignore 등재 + 시크릿 패턴 확장
`.claude/`는 untracked였을 뿐 차단되지 않아 `git add -A` 한 번이면 커밋될 수 있었다(내부 경로·GCP 빌드 ID·트리거 UUID 노출). [.gitignore](../../.gitignore)에 등재하고(→ §3-8에서 `.claude/*` + `!settings.json` 분할로 재조정), `.env` 단일 항목을 `.env.*` 와일드카드로 확장해 파생 파일명까지 차단했다. `*.key`·`*.pem`·`*secret*.json`·`serviceAccount*.json`도 추가했다.

### 3-2. AI 에이전트 git 경로 — 게이트는 사람이 아니라 훅이다

**[v2.1 정정]** 이 절은 "자동 허용에서 `git push` 전량 제거 → 이제 사람 확인을 거친다"와 "`permissions.deny`에 `git push *` 등재"로 적혀 있었다. **그 통제는 실재한 적이 없다.** 이 문서를 처음 커밋한 `be455a2`(2026-08-19)가 같은 커밋에서 `.claude/settings.json`을 저장소에 추가했는데, 그 파일은 그때부터 지금까지 **allow에 `Bash(git push origin main)`·`Bash(git push)`** 를 담고 있고 deny에 `git push *`는 없다. 하드닝 작업 중의 중간 상태를 적고, 최종 상태를 적지 않은 것이다. 같은 절의 "(gitignore 대상이라 저장소에는 없다)"도 같은 커밋이 `!settings.json` 예외로 추적을 시작하면서 함께 무효가 됐다.

**실제 구조** — 에이전트의 git 경로는 열려 있고, 게이트는 사람 확인이 아니라 **기계 검사**다.

| 층 | 수단 | 막는 것 |
| :--- | :--- | :--- |
| 내용 | `.githooks/` 3중 훅(`pre-commit`·`commit-msg`·`pre-push`) + `ci/secret-scan.mjs` | 시크릿이 담긴 커밋·푸시 자체 |
| 우회 | deny: `--no-verify`/`-n`, `git config core.hooksPath` | 훅 무력화 |
| 범위 | deny: `git add -A`/`-u`/`.`/`--all`, `git commit -a` | 무관한 변경·예상 못한 신규 파일 쓸어담기(경로 지정 add만 허용) |
| 복구 불가 | deny: `git push --force`/`-f`, `git remote set-url` | 히스토리 파괴·원격 바꿔치기 |

allow는 `git push origin main`·`git push`처럼 **정확한 형태만** 열려 있고, 위험한 변형은 deny가 받는다. deny가 allow보다 우선하므로 광범위 allow 규칙이 생겨도 되살아나지 않는다.

**이 설계가 타당한 이유** — 사람 확인은 매 커밋마다 요구하면 실제로는 통과 의례가 되고, 검사하는 것은 사람의 눈이 아니라 패턴 스캐너다. 반면 훅은 피로하지 않는다. 따라서 통제는 "푸시 전에 사람이 본다"가 아니라 "푸시되는 내용을 기계가 전수 검사하고, 그 검사를 끄는 경로를 막는다"로 두는 편이 강하다.

> **잔여 항목**: `Bash(node -e ' *)`·`Bash(npm i *)`는 임의 코드 실행·패키지 설치를 허용한다. **git 경로도 열려 있으므로**(훅이 내용을 검사할 뿐 경로를 닫지는 않는다) 남은 방어는 전적으로 스캐너의 패턴 적중률에 달려 있다 — 패턴이 못 잡는 형태의 시크릿은 커밋·푸시된다. 민감 키가 로컬 머신에 놓이는 작업을 시작하는 시점에 `src/data/secretPatterns.mjs` 적중 범위부터 재검토한다.

> **교훈**: 보안 문서가 **실재하지 않는 통제를 적으면 실제보다 안전하다고 믿게 된다.** 이 오기는 3개월 가까이 남아 있었고, 2026-11-12에 에이전트가 "push가 막혀 있다"고 보고하면서 드러났다. 조치 문서를 쓸 때는 *하려던 것*이 아니라 *커밋된 최종 상태*를 적고, 권한은 문서가 아니라 `.claude/settings.json`의 allow/deny로 확인한다.

### 3-3. `trust proxy` 설정
Cloud Run은 모든 요청이 프런트엔드 프록시를 거치므로, `trust proxy` 없이는 `req.ip`가 전부 프록시 IP로 잡혀 **rate limit이 IP별이 아닌 전역 단일 버킷**으로 동작했다. [server.mjs](../../server.mjs)에 `app.set('trust proxy', 1)`을 추가했다(`true`가 아닌 홉 수 1 고정 — `X-Forwarded-For` 위조 우회 차단).

### 3-4. 시크릿 스캐너 보강 + 문서 경로 데니얼리스트
[admin-api.mjs](../../admin-api.mjs)의 `/admin/api/docs/save`와 `/admin/api/builderslog/publish`는 **public 저장소 `main`에 직접 커밋하고 자동 배포까지 트리거**한다. 기존 스캐너는 `ghp_`·`AIza`·Slack·PEM만 탐지했다.

*   두 경로가 `DOC_SECRET_PATTERNS` **단일 집합을 공유**하도록 통합 (탐지 강도가 갈리면 안 된다)
*   추가 패턴: fine-grained GitHub PAT, AWS Access Key ID 등
*   고유 접두어가 없는 키는 값만으로 식별이 불가능하다 → **"키 이름 = 긴 문자열" 대입 형태**를 탐지하는 패턴으로 우회
*   `DOC_PATH_DENYLIST` — 민감 경로 이하는 웹 편집기로 저장 불가

### 3-5. 시크릿 스캐너 단일 소스화 + 로컬 훅
기존 스캐너는 admin 웹 편집기 경로에서만 동작했고 **로컬 `git commit`에는 아무 검사가 없었다.**

*   **[src/data/secretPatterns.mjs](../../src/data/secretPatterns.mjs)** — 패턴 단일 소스(SSOT). `admin-api.mjs`와 로컬 훅이 동일 집합을 공유한다. `src/data/`에 둔 이유는 Dockerfile이 컨테이너로 복사하는 경로이기 때문(`ci/`는 아니다).
*   **[ci/secretPatterns.test.mjs](../../ci/secretPatterns.test.mjs)** — positive/negative 케이스. **훅 설치보다 먼저 통과시켰다** — 검증되지 않은 스캐너를 훅에 걸면 "검사하고 있다"는 잘못된 안심만 생기고, 그건 검사가 아예 없는 것보다 나쁘다.
*   **3중 훅** — `pre-commit`(스테이징 blob) · `commit-msg`(메시지) · `pre-push`(푸시 범위 재검사)
*   **인코딩** — 혼합 인코딩(UTF-8/UTF-16·NUL 포함) 파일을 UTF-8로만 읽는 스캐너는 UTF-16 영역을 **아예 보지 못한다**. `scanBuffer()`가 양쪽 해석으로 검사한다.
*   **오탐 대응** — 줄 끝에 `secret-scan:ignore` 마커.

### 3-6. 훅 이동성 — fail-open 차단
`.git/hooks`는 clone되지 않는다. **새 환경에서 훅의 기본값은 '부재'이고, 부재한 훅은 아무 소리 없이 통과한다.** 여러 머신(Windows 데스크톱 ↔ macOS 노트북)을 오가는 환경에서는 이게 예외가 아니라 기본 상태다.

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

### 3-7. 라인 엔딩 정규화
`.gitattributes`가 없고 Windows 쪽 `core.autocrlf=true`였다. 이 상태로 훅을 두면 워킹트리에서 CRLF가 되어 shebang이 `#!/usr/bin/env node\r`로 해석되고 **`env: 'node\r': No such file or directory`로 훅이 죽는다 — 그 실패는 조용하다.** `.githooks/** text eol=lf`로 고정했다.

### 3-8. 권한 정책의 이동
`.claude/` 통째 gitignore는 과했다. deny 규칙과 경로 제한이 새 머신으로 이동하지 않기 때문이다.

*   `.claude/settings.json` → **커밋** (OS 중립 공유 정책: deny 규칙, 경로 지정 add 허용)
*   `.claude/settings.local.json` → gitignore (머신별 절대경로, 누적된 일회성 명령 규칙)

**전체 스테이징(`git add -A`·`.`·`-u`)과 `git commit -a`를 deny**했다. 경로를 지정한 add만 허용한다 — 병행 작업 중인 무관한 변경분과 예상 못한 신규 파일을 쓸어 담는 경로이기 때문이다. 스캐너는 휴리스틱이지만 경로 제한은 구조적이다.

### 3-9. `nginx.conf` 삭제
프로덕션 컨테이너는 `node server.mjs`를 실행하며 Dockerfile이 `nginx.conf`를 COPY하지 않는다 — 즉 **가동에 관여하지 않는 죽은 파일**이었다. 그런데 내용은 위험했다: CSP 헤더가 없고(현행 `server.mjs`는 helmet으로 CSP·HSTS를 설정한다), `/api/subscribe`·`/api/archive`가 **인증 없이** 키를 주입했다. 되살아나면 보안 등급이 내려가고 "프록시에서 키 주입" 발상의 참조 구현으로 재사용될 위험이 있었다. 코드·빌드 참조 0건을 전수 확인한 뒤 삭제했다(git 히스토리가 아카이브 역할). **N-2는 유지된다 — 파일은 사라져도 발상은 사라지지 않는다.**

## 4. 알려진 한계

정직하게 기록한다. 이 층들은 위험을 낮추지 제거하지 않는다.

| 한계 | 실질 영향 | 보완 |
| :--- | :--- | :--- |
| 접두어 없는 시크릿은 `이름 = 값` 형태로만 탐지 | 산문 속에 값만 붙여넣으면 통과 | 경로 제한(구조적) + GitHub 서버 측 탐지 |
| deny 규칙은 **접두어 매칭** — `--no-verify`처럼 옵션이 뒤에 붙으면 우회됨 | pre-commit 우회 가능 | **`pre-push` 훅**이 push 직전 범위를 재검사해 포착 |
| `git -c core.hooksPath=... commit` 형태의 우회 | 훅 전체 무력화 | `pre-push`도 함께 우회되면 남는 건 GitHub 측 탐지뿐 |
| GitHub Secret Scanning은 **알려진 제공자 형식만** 탐지 | `SMTP_PASS` 등 커스텀 키는 못 잡음 | 로컬 훅이 1차 방어선 |

## 5. 사고 대응 — 퍼블릭 저장소에 시크릿 커밋

**force push로 지워도 복구 가능하다.** GitHub 캐시·포크·아카이브 서비스에 남는다. 따라서 "지우기"는 대응이 아니다. 순서 원칙: **출혈 차단 → 접근 차단 → 원인 규명 → 복구.**

| 순서 | 조치 |
| :--- | :--- |
| 1 | **해당 시크릿을 유출된 것으로 간주** — 즉시 폐기·재발급(해당 제공자 콘솔에서 무효화). 되돌릴 수 없는 전제이므로 "의심"만으로 실행한다 |
| 2 | Secret Manager/환경변수의 해당 버전 폐기 및 신규 버전 등록 |
| 3 | 그 다음에 히스토리 정리 (`git filter-repo`) — 부수 작업이지 대응이 아니다 |
| 4 | GitHub Support에 캐시 삭제 요청 |
| 5 | 차단 실패 원인 분석 — pre-commit 훅 미설치? 패턴 미탐지? 훅 우회(`--no-verify`)? |
| 6 | 스캐너 패턴 보강 후 본 문서 갱신 |

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
*   [보안 취약점 점검 보고서](security_audit.md)
*   [인증·권한 아키텍처](authentication_architecture.md)
*   [운영 런북](operations_runbook.md) — 데이터 플레인 장애 대응
*   [Candela 자동매매 아카이브](../archive/candela_trading_archive.md) — 폐기된 트레이딩 계획의 트레이딩 전용 보안·사고 대응 원형
