---
status: active
domain: Waymark
nav_title: 🗺️ 소개 페이지 UI 명세
last_updated: 2026-10-17
version: v1.0
target_files:
  - src/pages/WaymarkLanding.jsx
  - src/pages/WaymarkLanding.css
  - src/App.jsx
  - src/components/layout/Header.jsx
  - src/components/layout/Header.css
  - src/components/layout/Footer.jsx
  - src/components/work/WorkSection.jsx
  - src/components/work/WorkSection.css
  - src/locales/{ko,en,ja}.json (waymark 네임스페이스·home.serviceWaymark*)
  - src/data/seoMeta.mjs
---

# 🗺️ Waymark 소개 페이지 UI 명세 (UI Specification)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-10-17 | AI Agent | 선공개(pre-launch) 소개 페이지 최초 구현 — 히어로·문제공감·핵심 루프·AI 4모드·경험담 티저·CTA(미니멀 범위). 형제 랜딩 전개 공식 정합, 브랜드=indigo·lavender/✦ 웨이포인트. `/waymark` 라우트·GNB·모바일 벤토·메인 WorkSection 카드·3개국어·SEO 통합 | Waymark 슬롯 전반 |

---

## 0. 위치·목적

`/waymark`는 의사결정 동반 서비스 **Waymark**의 **선공개(pre-launch) 소개 페이지**다. 실서비스(결정 저널 + 먼저 찾아오는 AI 동반자 + 경험담) 착수 전, "무엇을·왜·누구를 위해"를 선언하고 기대감을 심는다. 전환 배경은 [repositioning_proposal](repositioning_proposal.md).

- **대상**: 특정 직군으로 좁히지 않는다 — "크고 작은 결정을 내리는 누구나"(오너 결정 2026-10-17).
- **출시일 비노출**: 특정 일자를 못 박지 않고 "곧 찾아온다"는 기대감으로 표현(오너 결정).
- **원칙 안전성(하드)**: "AI가 **대신 결정하지 않는다** — 갈림길을 비추고 곁에 있을 뿐"을 §모드의 안심 블록에서 명시. 투자·자문식 오해 차단.

## 1. 전개 공식 (형제 랜딩 정합) ★

폰트·컬러뿐 아니라 **정보 전개 방식**을 형제 랜딩(구 CandelaLanding)과 일치시킨다. 이것이 일체감의 핵심이다.

1. **단일 컨테이너 + 섹션 리듬**: `.wm-page`(`max-width: --container`, 상단 110px 보정) 안에서 섹션을 `margin-top: --space-2xl`(64px)로 쌓는다. 섹션별 풀폭 패딩·배경 분할 금지.
2. **섹션 공식**: 모든 콘텐츠 섹션 = `eyebrow → 섹션 타이틀 → 리드 → 콘텐츠`.
   - eyebrow: `--font-mono`·`--fs-070`·`letter-spacing .16em`·대문자·`--text-muted` + `::before` 액센트 헤어라인(22px). (영문 라벨: Why Waymark · How it works · Beside you · Coming)
   - 타이틀: `--fs-140`(문제공감만 `.lg` `--fs-170`)·600·`--text-primary`.
   - 리드: `--fs-085`·`--text-muted`·`--measure` 폭.
3. **정렬**: 콘텐츠 좌측 리딩. **히어로만 중앙**(§9-1). 스테퍼 다이어그램은 좌측 헤더 아래 중앙 배치.
4. **CTA**: 닫는 카드(eyebrow 없음, 액센트 180deg 그라디언트) — `.cdl-cta` 정합.

## 2. 섹션 구성 (미니멀 범위 — 오너 결정)

| # | 섹션 | 핵심 | i18n 키 |
| :--- | :--- | :--- | :--- |
| 1 | **Hero**(중앙) | ✦ 웨이포인트 + `Waymark`(그라디언트 클립) + 서브(1행 로케일 + 2행 고정 EN 태그라인) + CTA 2 + 기대 칩 | `waymark.hero.*` |
| 2 | **문제 공감** | "큰 결정일수록 곁이 필요하다" — 보편적 톤 | `waymark.empathy.*` |
| 3 | **핵심 루프** | 기록 → 먼저 찾아옴 → 경험담 → 다시 보기 (가로 스테퍼, 모바일 세로) | `waymark.loop.*` (steps[4]) |
| 4 | **AI 4모드** | 위로·조언·응원·정리 + **안심 블록**(결정 대행 아님) | `waymark.modes.*` (items[4]) |
| 5 | **경험담 티저** | "곧 함께 쌓인다" — 콘텐츠·수집 없음(미니멀) | `waymark.teaser.*` |
| 6 | **CTA** | Builder's Log 피벗 챕터로 유도 + 기대 마무리 | `waymark.cta.*` |

> **고정 영문/숫자 라벨**(i18n 비대상, JSX 리터럴): 스텝 번호 `01~04`·아이콘 `✎ ✦ 👣 ↻`, 모드 영문 `Comfort·Counsel·Cheer·Clarify`·아이콘 `🫶 🧩 🔥 🗂️`. 모드 영문 서브라벨은 `locale==='en'`일 때 중복이라 숨긴다.

## 3. 브랜드·비주얼

- **액센트**: indigo `#A5B4FC` → lavender `#C7D2FE`(토큰 `--color-indigo`·`--prism-lavender`). 글로우·스텝 노드·CTA·헤어라인·칩에 사용.
- **히어로 타이틀**: §9-1대로 `--gradient-brand`(indigo→lavender→gold) 텍스트 클립·`display: inline-block` 유지(개별 제품 액센트와 무관하게 타이틀은 브랜드 그라디언트 공통).
- **모티브**: ✦ **웨이포인트(길잡이 별)** — 나침반(Planner's View)·촛불(구 Candela)과 충돌 회피. 메인 카드 비주얼은 별 + 궤도 링.
- **원칙**: 네이비/퍼플 배경 틴트 금지, 틴트 알파 0.045·0.06·0.16·0.18, `--fs-*` 토큰만(px 금지 — prebuild 차단).

## 4. 사이트 통합

| 지점 | 내용 |
| :--- | :--- |
| 라우트 | `App.jsx` — `const WaymarkLanding = lazy(...)` + `<Route path="waymark">` |
| GNB(데스크톱) | ReLearn 다음·Sylphio 앞 **4번째**(구 Candela 공석). 브랜드 리터럴 `Waymark` |
| 모바일 벤토 | `waymark-indigo-theme` 카드(5번), ✦ 미니 별. `Header.css` 테마 블록 |
| 메인 WorkSection | 플래그십 카드(인덱스 3, 액센트 `165,180,252`), Sylphio 인덱스 3→4로 조정. **제품 4→5 → 개수 카피 "다섯/five/五つ" 복귀** |
| 푸터 | NAVIGATE에 Waymark 추가(ReLearn↔Sylphio 사이) |
| i18n | `waymark` 네임스페이스(ko·en·ja) + `home.serviceWaymark{Tag,Desc,Cta}` |
| SEO | `seoMeta.mjs` `/waymark` 엔트리(SSR) + `useSEO`(CSR, 로케일별 `t()`) |

## 5. 미착수(다음)

- **CTA 대상 — Builder's Log 피벗 챕터**: 현재 `/builders-log`(목록)로 연결. "왜 자동매매에서 결정 저널로 피벗했나" 챕터를 작성하면 해당 퍼머링크로 교체.
- **정식 문서 세트**: `product_strategy.md`·`roadmap.md`(기획서 이관) — 실서비스 착수 시.
- **브랜드 OG 이미지**: `/waymark` 전용 og 이미지(`og-waymark.png`) 미제작(현재 기본 OG 폴백).

---

## 관련 문서
*   [🗺️ Waymark 재포지셔닝 제안서](repositioning_proposal.md) — 전환 배경·ReLearn 차별화·명칭
*   [🎨 디자인 시스템](../core/design_system.md) — §9-1 히어로·토큰 정본
*   [📚 문서 인덱스 & 거버넌스](../INDEX.md)
