---
status: active
domain: Sylphio
last_updated: 2026-11-15
version: v1.3
target_files:
  - src/pages/SylphioPrivacy.jsx
  - src/locales/ko.json
  - src/locales/en.json
  - src/locales/ja.json
  - src/data/seoMeta.mjs
---

# Sylphio 개인정보 처리방침 (Privacy)

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-02 | 실피오 App Store 심사 및 신뢰 보장을 위한 Zero-Data 개인정보 처리방침 정의 | docs/sylphio/ |
| v1.1 | 2026-07-13 | 하이브리드 STT·정밀 회의록 오디오 업로드·로컬 녹음(.m4a) 저장/동의/삭제·화면 녹화 권한 고지 반영(라이브 정합) | src/pages/SylphioPrivacy.jsx |
| v1.2 | 2026-08-05 | **UI 정합(콘텐츠 불변)** — 페이지를 표준 문서형 2단 레이아웃([design_system §9-11](../core/design_system.md))으로 전환: 폭 1200 활용·TOC 사이드바·외곽 글래스 박스 제거(플랫 프로스). 히어로 태그라인을 랜딩 정본으로 정본화 | src/pages/SylphioPrivacy.jsx, .css |
| v1.3 | 2026-11-15 | **App Store 출시 전 정합화** — 앱 정본(`sylphio_mac/docs/Sylphio_PrivacyPolicy.md`, 2026-11-15 개정판) 10개 섹션 구조로 전면 교체(ko·en·ja). '데이터 무수집' 표현 폐기 → '개발사 서버 무수집'으로 범위 축소. 신규 고지: Google 웹 번역(옵트인), 로컬 Whisper 모델 다운로드, BYOK 3조건·Gemini Files API 48시간, 무료 등급 데이터 활용, 인앱 결제, 아동, 사용자 권리, 방침 변경. 문의처 matthew.shim@prisincera.com. 시행일은 출시일 확정 후 추가 | src/locales/*.json, src/data/seoMeta.mjs |

---

## 정본과 반영 위치

- **정본(단일 진실 원천):** `sylphio_mac/docs/Sylphio_PrivacyPolicy.md` — 앱 내 방침·App Store Connect 개인정보 라벨과 글자 단위로 같아야 한다. 웹은 이 문서를 따르며, 문구를 바꿀 때는 정본을 먼저 고친다.
- **웹 반영본:** `src/locales/{ko,en,ja}.json`의 `sylphio.privacy` (`intro` + `sections[{title, content?, bullets?}]`). 렌더링은 `SylphioPrivacy.jsx` + `SylphioDocShell`이 하며 섹션 수가 바뀌어도 코드 변경이 필요 없다.
- **섹션 구성(10):** 핵심 원칙 · 기기 안에서 처리·저장되는 데이터 · Apple이 처리하는 데이터 · 선택 기능: Google 웹 번역 · 선택 기능: Pro BYOK · 로컬 음성 인식 모델 다운로드 · 아동 · 사용자의 권리 · 방침 변경 · 문의.
- **로케일 차이:** 아동 연령은 정본대로 ko `만 14세`, en·ja `13 (14 in Korea)`. 일본어판은 정본에 원문이 없어 한국어판을 번역했다(원어민 검토 권장).
- **시행일:** 정본의 `[출시일]`이 확정되면 `intro` 마지막 줄에 추가한다. 그 전까지는 `최종 수정: 2026-11-15`만 게시한다.
- **히어로(제목·태그라인·다운로드 버튼·요구사항)는 수정 금지 영역**이라 본문만 바꿨다.
