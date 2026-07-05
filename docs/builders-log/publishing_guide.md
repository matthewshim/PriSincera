---
status: active
domain: BuildersLog
last_updated: 2026-06-29
version: v1.0
target_files:
  - src/data/buildersLogMeta.json
  - src/pages/BuildersLog.jsx
  - src/pages/BuildersLogDetail.jsx
---

# 📘 Builder's Log 퍼블리싱 가이드

본 문서는 PriSincera 웹사이트의 **Builder's Log (테크 블로그)**에 새로운 아티클을 작성하고 퍼블리싱하는 구체적인 워크플로우를 안내합니다. 프론트엔드 라우팅 및 렌더링 엔진(`react-markdown`) 아키텍처가 구축되어 있으므로, 데이터베이스(Firestore)를 거치지 않고 로컬 파일 시스템 제어만으로 즉시 포스팅이 가능합니다.

---

## 1. 아키텍처 개요 (Architecture Overview)
- **렌더링 방식:** 로컬 정적 에셋(Static Asset) 방식
- **본문 저장소:** `public/content/logs/*.md`
- **목록 메타데이터:** `src/data/buildersLogMeta.json`
- **동작 원리:** 사용자가 `/builders-log/:slug`에 접속하면, 프론트엔드(`BuildersLogDetail.jsx`)가 `public/content/logs/{slug}.md` 파일을 Fetch하여 `react-markdown`으로 렌더링하고 코드 신택스 하이라이팅을 적용합니다.

---

## 2. 신규 아티클 퍼블리싱 방법 (Step-by-Step)

다른 개발자나 AI 어시스턴트가 새로운 기술 문서, 트러블슈팅 로그, 디자인 가이드 등을 Builder's Log에 배포할 때는 아래의 3단계를 순서대로 수행하십시오.

### Step 1. 마크다운(.md) 파일 작성 및 저장
1. 배포할 아티클의 내용을 Markdown 형식으로 작성합니다.
   - 팁: 기존 `docs/` 폴더에 있던 아키텍처 문서를 활용할 경우, 일반 독자가 읽기 쉽도록 '스토리텔링' 형식으로 윤문(각색)하는 것을 권장합니다.
2. 작성된 파일을 `public/content/logs/` 디렉토리에 `{slug}.md` 이름으로 저장합니다.
   - 예시: `public/content/logs/sylphio-audio-optimization.md`
   - **주의사항:** 마크다운 내부에 Firebase Admin Key, API Secret 등 보안에 민감한 정보가 포함되지 않도록 반드시 검열하십시오.

### Step 2. 메타데이터(JSON) 등록
`src/data/buildersLogMeta.json` 파일을 열고, 배열의 **가장 앞쪽(최신순)** 또는 순서에 맞게 새로운 객체를 추가합니다.

```json
{
  "id": "ep3",
  "slug": "sylphio-audio-optimization",
  "chapterNo": "03",
  "title": "Sylphio 오디오 최적화: WebRTC와 마이크 입력 제어기",
  "subtitle": "Audio Pipeline & Performance",
  "description": "Sylphio의 음성 인식 엔진을 구축하면서 직면했던 오디오 레이턴시 문제와 노이즈 캔슬링 하드웨어 가속 적용 과정.",
  "date": "2026-06-01",
  "tags": ["WebRTC", "Audio", "Sylphio"],
  "accent": "var(--prism-rose)",
  "commits": [
    { "type": "feat", "hash": "a1b2c3d", "msg": "AudioContext 기반 오디오 파이프라인 통합" }
  ]
}
```
* **필드 설명:**
  * `slug`: Step 1에서 만든 마크다운 파일명 (확장자 제외). 라우팅 URL이 됩니다.
  * `accent`: 카드의 고유 포인트 컬러 (예: `var(--prism-indigo)`, `var(--orbit-cyan)`, `var(--prism-rose)` 등).
  * `commits`: 해당 챕터와 관련된 핵심 Git 커밋 기록 (type은 `feat`, `fix`, `refactor`, `style` 중 택 1).

### Step 3. 커밋 및 자동 배포
수정된 JSON 파일과 새로 생성된 MD 파일을 Git에 커밋하고 `main` 브랜치에 푸시(`git push`)합니다.
CI/CD 파이프라인(Vercel)을 통해 빌드가 완료되면 웹사이트에 즉시 자동 배포됩니다.

---

## 3. 마크다운 작성 규칙 (Markdown Guidelines)

PriSincera 디자인 시스템에 맞춘 프리미엄 다크 모드 뷰어(`BuildersLogDetail.jsx`)를 사용하므로 다음 문법들이 자동으로 최적화되어 렌더링됩니다.

1. **Heading (H1, H2, H3):**
   - H1(`#`)은 제목급 크기로 렌더링되므로, 본문 내 소주제는 H2(`##`)부터 사용하는 것을 권장합니다.
2. **Code Snippet:**
   - 백틱 3개(```)와 함께 언어(예: `javascript`, `python`, `json`)를 명시하면 Atom One Dark 테마의 신택스 하이라이팅이 자동 적용됩니다.
3. **Blockquote (인용문):**
   - `> 인용구` 문법을 사용하면 PriSincera 테마 포인트 컬러 라인이 들어간 아름다운 박스 형태로 표시됩니다.
4. **이미지 (Images):**
   - 이미지 에셋은 `public/images/` 하위에 배치하고 마크다운에서는 `![설명](/images/파일명.png)` 절대 경로 형식으로 호출하십시오.

---

## 4. 메타데이터 태그 및 SEO 처리
`buildersLogMeta.json`에 입력된 데이터는 다음과 같이 작동합니다.
- `title`과 `description`, `tags`는 아티클 진입 시 브라우저 탭 타이틀과 `<meta>` 태그에 동적으로 주입되어 검색 엔진 노출(SEO) 성능을 극대화합니다.
- URL은 항상 `https://www.prisincera.com/builders-log/{slug}` 형태로 유지되므로 외부 플랫폼(LinkedIn 등) 공유 시 링크가 깨지지 않습니다.
