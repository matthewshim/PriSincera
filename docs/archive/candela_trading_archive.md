---
status: archived
domain: Candela
last_updated: 2026-10-17
version: v1.0
target_files:
  - (폐기) src/pages/CandelaLanding.jsx
  - (폐기) src/data/candela/
  - (이관) docs/core/security_spec.md
---

# 🗄️ 캔델라 자동매매 아카이브 (Candela — Automated Trading, Archived)

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-10-17 | AI Agent | **Candela 자동매매 계획 폐기 통합 아카이브** — product_strategy·system_architecture·data_contract·ui_specification·roadmap 5종과 security_spec·incident_response의 **트레이딩 전용** 부분을 요약 수록 후 원본 7종 `git rm`. 레포 전체에 유효한 보안 규범은 [core/security_spec](../core/security_spec.md)로 이관(존치) | docs/candela 전체 |

---

## 0. 왜 아카이브되었나

Candela는 제작자 본인을 위한 **개인 자동매매 시스템 + 공개 사례 연구**로 기획되었으나(2026-08), 2026-10 **의사결정 동반 서비스(Waymark)로 피벗**하며 폐기되었다. 폐기 사유는 [waymark/repositioning_proposal §1](../waymark/repositioning_proposal.md) 참조(브랜드 부적합·규제 마찰·간접적 사용자 가치·실서비스 코드 착수 전 피벗).

본 문서는 거버넌스 §5(역사서 고밀도 병합)에 따라 폐기된 7종 문서의 핵심을 요약 보존한 것이다. **상세 원문은 git 히스토리**에 있다. 실 서비스 코드(랜딩 페이지·fixture 데이터·스키마 테스트)와 Builder's Log ch.14는 함께 제거되었다.

## 1. 포지셔닝 (product_strategy)

"투자 서비스가 아니라 **제작 역량의 증거**" — 수익률이 아닌 아키텍처를 헤드라인으로. 공개 원칙 7조: 무료·금액 비공개·T+1 사후 공개·주간 집계·손실 은폐 금지 등. 성공 기준은 "작동한다는 공개 증거"였다.

## 2. 이원 아키텍처 (system_architecture)

3계층 분리 — **Public Web / Admin 조종석 / Executor Worker**. Admin은 키를 갖지 않고 명령 enum만 큐에 기록, 실적은 git이 아닌 **GCS 적재 + 해시 체인**으로 발행, 일봉 스윙 기반 배치 운영. 전략 로직·주문 집행은 별도 private 저장소(`candela-worker`).

## 3. 데이터 계약 (data_contract)

UI 선행 개발의 최대 위험(더미가 스키마를 결정)을 막는 선행 산출물. 퍼블릭 계약에서 **금액·수량 필드를 스키마 레벨로 배제**(존재하지 않는 필드는 실수로 렌더링할 수 없다), `dataSource` 판별 필드, 해시 체인, Admin/퍼블릭 계층 분리.

## 4. UI 명세 (ui_specification)

픽스처 기반 UI 선행 개발 규범 — **샘플 데이터 노출 차단 게이트 3중**(데이터 소스 선언·빌드 차단·해제 불가 워터마크), 픽스처 3 시나리오(하락장 통과가 게이트), **킬스위치는 목업하지 않는다**.

## 5. 로드맵 (roadmap)

M0~M5 단계와 승격 게이트: 백테스트 → 모의투자 → 실계좌 소액 → 증액. 하지 않기로 한 것 5건(고빈도·레버리지·타인 자금 운용 등) 포함.

## 6. 트레이딩 전용 보안 규칙 (security_spec에서 분리)

레포 전체 규범은 [core/security_spec](../core/security_spec.md)로 이관했고, **자동매매 고유** 규칙만 여기 보존한다.

*   **브로커 키 격리**: 증권사 API 키는 Admin 콘솔이 아닌 Worker + Secret Manager에만. Admin은 조종석이지 엔진이 아니다.
*   **로컬 금지**: 실계좌 키는 Secret Manager에만 두고 Worker를 클라우드에서 실행. 로컬 개발은 모의투자 키로만.
*   **전략 로직 비공개**: 백테스트·전략 코드는 `candela-worker`(private)에서만.
*   **실적 git 발행 금지**: 보유 종목·평단 영구 공개 + 서버 push 권한 상시 보유 방지.
*   **주문 응답 마스킹**: 계좌번호 노출 방지, 로깅 시점 마스킹.
*   **착수 시 통제(S-1~S-8)**: Candela 탭 step-up 재인증(super_admin + TOTP), 유휴 타임아웃, 명령 엔드포인트 전용 rate limit(10회/15분), 번들 분리, 공급망 차단(`npm ci --ignore-scripts`), `candela_audit` append-only 감사 로그.
*   **비기술적 상한선 — 계좌 구조**: 매매 전용 계좌 분리 + 잃어도 되는 금액만 투입. 한국투자증권 오픈API는 출금 기능이 없어 키 탈취 시에도 자산 이동 불가(악의적 매매 손실만 가능). 이 둘이 최악 시나리오를 "그 계좌 잔고"로 한정한다.

## 7. 트레이딩 전용 사고 대응 (incident_response에서 분리)

퍼블릭 저장소 시크릿 커밋 대응은 [core/security_spec §5](../core/security_spec.md)로 이관. **매매 고유** 시나리오만 보존한다. 공통 순서 원칙: 출혈 차단 → 접근 차단 → 원인 규명 → 복구.

*   **A. 키 유출 의심**: ① 킬스위치(`HALT`) ② 증권사 API 키 폐기·재발급 ③ 계좌·이체 비밀번호 변경 ④ Secret Manager 버전 폐기 ⑤ `candela_audit` 대조 ⑥ 경로 규명 ⑦ 모의투자 복귀 후 재개. 킬스위치가 키 폐기보다 먼저인 이유: 출금은 불가하나 악의적 매매 손실은 가능.
*   **C. Admin 세션 탈취**: 킬스위치 → Firebase 세션 전체 revoke → 화이트리스트 점검 → 커밋 이력 대조 → 구글 계정 2FA 재설정.
*   **D. 시스템 오작동**: 킬스위치 → 수동 청산(증권사 앱) → 주문 시퀀스 재구성 → 모의투자 재현 → 최소 2주 관찰 후 복귀.
*   **E. 외부 의존성 장애**: 포지션 보유 중 시스템 다운이 최악(손절 미동작). 시세 단절 시 신규 주문 자동 중단, 수동 청산은 증권사 앱, Worker 배포는 장 시간 외에만.
*   **연 1회 훈련**: 킬스위치 실발동·키 재발급 실측. 최초 훈련은 실계좌 진입 전 완료를 승격 게이트로.

---

## 관련 문서
*   [🗺️ Waymark 재포지셔닝 제안서](../waymark/repositioning_proposal.md) — 피벗 배경·사유
*   [📜 저장소 보안 규범](../core/security_spec.md) — 레포 전체 보안 규범(이관·존치)
*   [📚 문서 인덱스 & 거버넌스](../INDEX.md)
