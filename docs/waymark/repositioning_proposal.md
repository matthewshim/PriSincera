---
status: active
domain: Waymark
nav_title: 🗺️ 재포지셔닝 제안서
last_updated: 2026-10-17
version: v0.4
target_files:
  - (제거 완료) src/pages/CandelaLanding.jsx·.css
  - (제거 완료) src/data/candela/
  - (제거 완료) src/App.jsx candela 라우트
  - (제거 완료) src/locales/{ko,en,ja}.json candela 네임스페이스·serviceCandela*
  - (제거 완료) src/components/layout/Header.jsx·.css / work/WorkSection.jsx·.css Candela 엔트리
  - (예정) docs/waymark/product_strategy.md·roadmap.md·ui_specification.md
---

# 🗺️ Waymark 재포지셔닝 제안서 (Candela → Waymark)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v0.1 | 2026-10-17 | AI Agent | 최초 작성 — 자동매매/모의투자 → "결정 동반 서비스" 전환 제안. 전환 근거·서비스 개요·ReLearn 차별화 정의(A안)·명칭 검토·전환 범위·결정 대기 항목 | Candela 슬롯 전반 |
| v0.2 | 2026-10-17 | AI Agent | 명칭 방향 확정(오너 선택: "결정의 순간") 반영 — §4 후보를 Crux·Kairos·Cusp·Resolve 등으로 좁히고 태그라인 예시 추가 | §4 명칭 |
| v0.3 | 2026-10-17 | AI Agent | **명칭 확정: Waymark** — 문서 전반 "새 서비스"→Waymark 치환, §4 확정 반영, §0·§5 docs/waymark 명시 | 문서 전반·§4·§6 |
| v0.4 | 2026-10-17 | AI Agent | **라이브 Candela 제거 + docs 이관 완료 반영** — 폴더 `docs/candela/`→`docs/waymark/` 이관, 트레이딩 문서 7종 아카이브([candela_trading_archive](../archive/candela_trading_archive.md)), 레포 보안 규범 core 이관, Builder's Log ch.14 언퍼블리시. status active 승격 | 문서 위치·§0·§5·§6 |

---

## 0. 이 문서의 위치

Candela 슬롯(네 번째 제품)을 **주식 모의투자·자동매매 사례 연구**에서 **의사결정 동반 서비스 Waymark**로 전환하는 검토·의사결정 문서다. 명칭(**Waymark**)이 확정되었고(2026-10-17), 라이브 Candela(랜딩·라우트·GNB·메인 카드·i18n·스키마·게이트)와 Builder's Log ch.14가 **제거 완료**되었다. 기존 `docs/candela/*`(자동매매)는 [아카이브](../archive/candela_trading_archive.md)로 통합됐고, 레포 전체 보안 규범은 [core/security_spec](../core/security_spec.md)로 이관됐다. 이 폴더(`docs/waymark/`)에 정식 문서 세트(product_strategy·roadmap·ui_specification)를 순차 신설한다.

> **상태**: 명칭=**Waymark** 확정 · 라이브 Candela 제거·docs 이관 완료. 다음은 정식 문서 세트 작성과 Waymark 소개 페이지 재설계(§5·§6).

## 1. 전환 근거 — 왜 모의투자를 접는가

| 문제 | 설명 |
| :--- | :--- |
| 브랜드 부적합 | 사이트의 축은 "Sincerity, Prioritized" · 진심 · 태도 · 성장. 자동매매는 아무리 포장해도 "돈 버는 법" 색이 묻는다. Candela 페이지가 *"수익률이 아니라 아키텍처"*라며 그 색을 **지우려 그렇게 애썼다는 것 자체가** 개념-브랜드 불일치 신호였다. |
| 규제·윤리 마찰 | 투자자문업 경계. FAQ로 "투자서비스 아님"을 방어하던 상시 부담. |
| 간접적 사용자 가치 | "제작자 본인 봇의 기록"이라 남이 쓸 수 없는 전시물. 실운용 3개월 후에야 의미가 생기는 긴 대기형. |
| 피벗 타이밍 | 아직 실서비스 코드를 짓기 전. 기획서 원칙("UI는 고쳐도 잃는 게 없다")대로 지금이 가장 싸게 방향을 트는 시점. |

## 2. 신규 서비스 개요 (기획서 '한결(가칭)' 기준)

결정을 많이 내리는 사람(IT 기획·PO·PM·리더)을 위한 **결정 저널 + 먼저 찾아오는 AI 동반자 + 경험담**.

- **핵심 루프**: 결정 기록 → (서비스가) **먼저 찾아감** → **경험담**(겪어 본 이의 이야기) → **다시 보기(회고)**
- **AI 모드**: 위로 · 조언 · 응원 · 정리 (정서 동반, 결정을 대신 내리지 않음)
- **핵심 가치**: 먼저 · 내게 맞게 · 살아있게
- **타깃 = 제작자 본인의 집단**(20년차 기획·PO·PM·리더) → 만드는 사람이 곧 쓰는 사람(진정성)
- **체급**: 풀 SaaS(PWA·Supabase·AI·알림·콘텐츠, 기능 19·화면 15+), '27.3 출시 목표 — 전시 페이지가 아닌 **운영 제품**
- 정본 기획서는 별도(오너 제공 `서비스 기획서 — 한결 (가칭).md`), 확정 시 `product_strategy.md`로 이관.

## 3. ReLearn 차별화 정의 (A안) — 이 피벗의 최대 쟁점 ★

Waymark도 "성찰·AI·루프"라 **ReLearn과 겹칠 위험**이 있다. PriSincera는 이미 비슷한 두 성찰 서비스(Daily Digest·Pace Note)를 *"사용자가 루프를 체감 못 한다"*는 이유로 **ReLearn으로 통합**한 전례가 있다(builders-log ch.13). **세 번째 성찰 서비스**를 더하려면 경계가 분명해야 한다.

### 3-1. 경계 — 한 문장

> **"ReLearn은 성장을 돕고, Waymark은 결정을 지킨다."**
> (ReLearn=매일 더 나아지려는 사람의 배움·실행 루프 / Waymark=큰 결정을 내리는 리더가 그 순간 혼자가 아니게 하는 동반자. EN: *ReLearn helps you grow; it stays with you as you decide.*)

### 3-2. 7축 대조

| 축 | ReLearn | Waymark |
| :--- | :--- | :--- |
| 단위 | 하루·주 (반복 리듬) | 개별 **결정** (사건 기반) |
| 핵심 동사 | 배우다·실행하다·복기하다 | 결정하다·버티다·다시 보다 |
| 주도권 | 내가 찾아감(습관) | **서비스가 먼저 찾아옴** |
| AI 역할 | 배움·실행 회고 코치 | **정서 동반자**(위로·조언·응원·정리) |
| 타인 자산 | 큐레이션된 지식 | 겪어 본 사람의 **경험담** |
| 정서 결 | 성장·모멘텀 | 결정의 **외로움·무게** |
| 타깃 상태 | "더 나아지고 싶은 러너" | "결정을 짊어진 **리더**" |

### 3-3. 포지셔닝 맵

세로축 = 다루는 것(지식·실행 ↔ 판단·정서), 가로축 = 리듬(반복 일상 ↔ 생겨나는 결정).
- **ReLearn** = 「반복 일상 × 지식·실행」, **Waymark** = 「생겨나는 결정 × 판단·정서」 → **대각선 반대 사분면**(겹치지 않음).

### 3-4. 왜 합치지 않는가 (ReLearn 통합 전례에 대한 답)

ReLearn 통합은 **쪼개진 하나의 플라이휠(배움→실행→복기)을 합친 것**이고(같은 단위·같은 사용자 상태), Waymark 추가는 **분명히 다른 둘째 루프를 더하는 것**이다(단위·상태·메커니즘이 다름). 경계만 지키면 전철을 밟지 않는다.

### 3-5. 드리프트 방지 하드룰

1. Waymark은 **일상 배움·큐레이션을 하지 않는다**(ReLearn의 일).
2. ReLearn은 **결정 동반·먼저 찾아오는 정서 알림을 하지 않는다**(Waymark의 일).
3. 애매한 기능은 **'단위'로 판정**: 반복 습관→ReLearn, 개별 결정→Waymark.
4. **AI 톤 분리**: ReLearn=성장 코치 / Waymark=정서 동반자. 같은 말투 금지.
5. **연결(통합 아님)은 MVP 이후** — 정체성이 서기 전에 엮으면 다시 "비슷한 둘"로 뭉개진다.

## 4. 명칭 — 확정: Waymark

**기존 메뉴 규칙**: 형제 제품명은 전부 영문/라틴/조어(Builder's Log·ReLearn·Sylphio·Candela)이며 메타포·이중의미를 품는다. 한국어 제품명은 0. → '한결'(한국어)은 이 규칙을 깨고 en·ja에서 막힌다. **'한결같음'의 뜻은 한국어 태그라인/보이스로 보존하고, 제품명은 형제 규칙으로** 세우는 방향.

**명칭 확정 (2026-10-17): Waymark**

- **구성**: Way + Mark — "갈림길(결정 지점)의 이정표." ReLearn식 합성어 느낌을 유지하면서 형제 규칙(영문 조어·메타포)에 정합.
- **선정 이유**: ① 결정의 순간을 공간 은유로 또렷이 담음 ② GNB에서 ReLearn/Sylphio와 구별이 좋음(Re- 중복·상표 충돌 없음) ③ **"AI가 대신 결정한다"는 오해 없음** — 지점을 비출 뿐, 선택은 사용자 몫.
- **태그라인(한결같음·동반 보존)**: *"결정의 갈림길에서, 곁에."* / EN *"At every fork, beside you."*
- **검토 후 기각**: Crux·Kairos(짧고 또렷하나 합성어 느낌 약함) · Resolve(ReLearn과 Re- 중복·상표) · Deside(오타 오인) · CoDecide("AI 공동 결정" 오해로 원칙 충돌).
- **신규 도메인**: 정식 문서 세트는 `docs/waymark/`로 생성한다(§5).

## 5. 전환 범위 (진행 현황)

| 영역 | 조치 | 상태 |
| :--- | :--- | :--- |
| docs | `docs/waymark/` 도메인 폴더 신설·본 문서 이관. 기존 `docs/candela/*` 아카이브 통합, 보안 규범 core 이관, INDEX 갱신 | ✅ 완료 |
| docs(정식 세트) | product_strategy·roadmap·ui_specification 신설, 기획서 이관 | ⏳ 예정 |
| 코드(제거) | `CandelaLanding.*`·라우트·`candela` i18n·GNB·모바일·WorkSection Candela 엔트리·fixture/스키마/게이트 제거 | ✅ 완료 |
| 코드(신설) | Waymark 소개 페이지·라우트·i18n·GNB·메인 카드 | ⏳ 예정 |
| 브랜드 | 촛불·골드 Candela 정체성 → **Waymark** 정체성(색·메타포) 재설계 | ⏳ 예정 |
| Builder's Log | 발행된 ch.14(자동매매 소개) **언퍼블리시**(오너 결정) + "왜 자동매매에서 결정 저널로 피벗했나"를 다음 챕터로(권장) | ✅ 언퍼블리시 완료 / ⏳ 피벗 챕터 예정 |

## 6. 결정 현황

- [x] **전환 방향 승인** (모의투자 → 결정 동반 서비스) — 2026-10-17
- [x] **서비스 명칭** 확정 → **Waymark** (2026-10-17)
- [x] **라이브 Candela 제거 + docs 이관** — 2026-10-17
- [ ] **ReLearn 차별화** 경계 문장 오너 최종 승인 (§3-1 — 정의 완료, 승인 대기)
- [ ] 정식 문서 세트(product_strategy·roadmap·ui_specification) 착수
- [ ] Builder's Log 피벗 챕터 작성 여부

---

## 관련 문서
*   [📚 문서 인덱스 & 거버넌스](../INDEX.md)
*   [🗺️ 리런 제품 전략서](../relearn/product_strategy.md) — 차별화 대상
*   [✍️ Builder's Log 퍼블리싱 가이드](../builders-log/publishing_guide.md)
*   [🗄️ 캔델라 자동매매 아카이브](../archive/candela_trading_archive.md) — 폐기된 트레이딩 계획
