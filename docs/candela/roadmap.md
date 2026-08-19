---
status: draft
domain: Candela
last_updated: 2026-08-19
version: v1.0
target_files:
  - (미구현) candela-worker/ (별도 private 저장소)
  - (미구현) src/pages/CandelaLanding.jsx
---

# 🗺️ 캔델라 로드맵 (Roadmap)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-08-19 | AI Agent | 최초 정의 — M0~M5 단계·승격 게이트·확정 사항·미결 항목 | Candela 전반 |

---

## 0. 확정 사항 (2026-08-19)

| 항목 | 결정 |
| :--- | :--- |
| 명칭 | **Candela** |
| 퍼블릭 경로 | `prisincera.com/candela` (하위 경로) |
| Admin 배치 | 기존 `/admin` 내 Candela 탭 + step-up 재인증 |
| Worker 저장소 | **별도 private 저장소** (`candela-worker`) |
| 실적 발행 | GCS 적재 + 해시 체인 (git 커밋 아님) |
| 전략 성격 | **일봉 스윙** |
| 증권사 | 한국투자증권 오픈API (모의투자 지원이 결정적) |
| 기존 보안 개선 4건 | **적용 완료** — [security_spec §3](security_spec.md) |

## 1. 단계

| 단계 | 범위 | 기간 감 | 완료 게이트 |
| :--- | :--- | :--- | :--- |
| **M0** | 한투 API 계정·모의투자 계좌 개설, `candela-worker` private 저장소 생성, pre-commit 훅·Push Protection 설치 | 1주 | 시크릿 스캐너가 의도적 위반을 실제로 차단하는 것을 확인 |
| **M1** | 시세 수집·저장 + **백테스트 엔진** | 3~4주 | 수수료·거래세·슬리피지 반영, look-ahead bias·상폐 종목 누락 점검 통과 |
| **M2** | 전략 1개 + 모의투자 자동 실행 + 킬스위치 + Admin Candela 탭 | 2~3주 | 킬스위치 실발동 테스트 통과, 감사 로그 기록 확인 |
| **M3** | **관망 기간** — 코드를 건드리지 않고 결과만 관찰 | 4~8주 | 무개입 연속 가동. 사고 0건 |
| **M4** | 실계좌 소액 전환 (매매 전용 계좌 분리) | — | [security_spec §5](security_spec.md) 계좌 분리 완료. `node -e`/`npm i` 권한 재검토 |
| **M5** | 퍼블릭 웹 `/candela` | 2주 | 실적 3개월 이상 축적 |

## 2. 승격 게이트 — 건너뛰지 않는다

```
백테스트 ──► 모의투자(1~2개월) ──► 실계좌 소액 ──► 증액
```

이 순서를 건너뛰면 높은 확률로 돈을 잃는다. **M3(관망)의 유혹이 가장 크다** — 결과가 나쁘면 고치고 싶고, 좋으면 키우고 싶어진다. 둘 다 하지 않는 것이 M3의 목적이다.

## 3. M5를 앞당기지 않는다

실적 3개월치 없는 실적 페이지는 홍보가 되지 않는다. 대신 **M1~M2 기간에 "만드는 과정" 콘텐츠를 [Builder's Log](../builders-log/publishing_guide.md)에 먼저 쌓는다.** [product_strategy §8](product_strategy.md)의 성공 기준대로, 아키텍처 서사가 실적보다 오래 간다.

## 4. 미결 항목

| # | 항목 | 결정 시점 |
| :--- | :--- | :--- |
| Q-1 | 대상 시장 — 국내만 vs 미장 포함 | M0 |
| Q-2 | Worker 구현 언어 — Python(pandas·vectorbt)이 백테스트에 압도적으로 유리. 웹과 언어를 나눌지 | M0 |
| Q-3 | 실적 공개 집계 단위 — 주간 vs 월간 (포지션 역산 방지) | M5 |
| Q-4 | 퍼블릭 페이지 i18n — ko 우선 확정. en·ja 확장 시점 | M5 이후 |
| Q-5 | 상표·도메인 가용성 확인 (Candela) | M0 |

## 5. 하지 않기로 한 것

*   **자동매매의 타인 제공** — 투자자문업·투자일임업 규제 진입. 제품 정의에서 영구 배제
*   **유료 구독·시그널 판매** — 유사투자자문업 신고 대상
*   **실시간 시세 재배포** — 라이선스 위반 소지
*   **분봉 단타** — 상시 웹소켓이 필요해 "가변비용 0" 운영 철학과 충돌. M4 이후 재검토 가능
*   **ML 기반 전략(초기)** — 검증이 불가능해진다. 룰 기반으로 시작

---

## 관련 문서
*   [🗺️ 제품 전략서](product_strategy.md)
*   [🏗️ 시스템 아키텍처](system_architecture.md)
*   [📜 보안 규범](security_spec.md)
*   [📘 사고 대응 런북](incident_response.md)
