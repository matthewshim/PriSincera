---
status: draft
domain: Core
last_updated: 2026-11-04
version: v0.1
target_files:
  - pipeline/src/lib/subscribers.mjs
  - pipeline/src/lib/mailer.mjs
  - pipeline/src/services/MailService.mjs
  - pipeline/src/pacenote-composer.mjs
  - pacenote-api.mjs
  - study-api.mjs
  - admin-api.mjs
  - server.mjs
  - src/pages/DailyView.jsx
  - src/pages/SylphioPrivacy.jsx
---

# 개인정보·데이터 수명주기 정책 (Privacy & Data Lifecycle)

> PriSincera 웹 서비스가 어떤 개인정보를 어디에 보관하고 언제 지우는지 정리한 문서. §2~§5는 코드에서 확인한 현황이고, §6~§8은 오너 결정을 기다리는 제안이다. Sylphio Mac 앱은 [별도 방침](../sylphio/privacy_policy.md)을 따른다.

## Revision History

| Version | Date | Description | Impact Area |
| :--- | :--- | :--- | :--- |
| v0.1 | 2026-11-04 | 현황 조사와 공백 10건(1건 해결), 보존 기간·삭제 절차 제안 최초 작성 | 전체 개인정보 |

---

## 1. 전제와 한계

- **근거**: 저장소 코드 기준이다. 운영 콘솔과 운영 DB는 조회하지 않았다. 확인이 필요한 항목은 §9에 모았다.
- **법률 검토**: 이 문서는 법률 자문이 아니다. §5의 법 조항은 전문가와 검토할 대상을 표시한 것이며, 위반 여부를 판단한 것이 아니다.
- **컬렉션 구조**: [데이터 모델 ERD](data_model_erd.md)를 따른다.

## 2. 보유 데이터

| 저장 위치 | 개인정보 항목 | 수집 시점 | 현재 삭제 경로 |
| :--- | :--- | :--- | :--- |
| Firebase Auth | Google 계정 식별자, 이메일 | Google 로그인 | 일반 사용자 경로 없음. 관리자 계정만 Admin API로 삭제 |
| `pacenotes/{uid}` | 이메일, 최근 활동 시각, 관심 분야 가중치, 회고 사본(`profile.reflections`) | PaceNote 사용 | 없음 |
| `pacenotes/{uid}/days`, `weeks` | 직접 입력한 궤도 제목, 완료 기록, 회고 원문(`statement`) | PaceNote 사용 | 없음. 항목 단위 제외·수정 API만 있음 |
| `study_progress/{uid}` | 이메일, 학습 완료일, 연속 학습 수 | 학습 완료 처리 | 없음 |
| `subscribers/{emailHash}` | 이메일 원문, 구독 상태·경로·시각 | 데일리 메일 구독 | 없음. 해지해도 상태만 바뀌고 이메일은 남음 |
| `email_logs/daily-{date}` | 수신자 이메일(`results[].to`), 발송 결과 | 메일 발송 | 없음 |
| `failed_emails` | 수신자 이메일, 오류 내용 | 발송 실패 | 없음 |
| `admin_config/settings` | 관리자 이메일, 역할 | 관리자 등록 | Admin API |
| Cloud Run 로그 | 이메일 원문(§5 P-6) | 구독·해지·발송 실패 | 로그 보존 설정을 따름(§9) |
| 브라우저 저장소 | 관리자 토큰·이메일(`sessionStorage`), 언어 설정(`localStorage`) | 관리자 로그인, 언어 변경 | 탭 종료 또는 사용자 삭제 |

코드 검색 범위에서 Google Analytics 같은 외부 분석 스크립트와 `document.cookie` 사용은 찾지 못했다.

`subscribers`의 문서 ID는 이메일 해시지만 이메일 원문이 같은 문서에 있으므로, 이 컬렉션은 가명 처리된 데이터가 아니다.

## 3. 외부 처리자

| 처리자 | 용도 | 전달되는 개인정보 |
| :--- | :--- | :--- |
| Google Cloud·Firebase | 인증, DB, 파일 저장, 서버, 로그 | §2의 데이터 전체 |
| Gmail SMTP | 데일리 메일 발송 | 수신자 이메일, 메일 본문 |
| Gemini API(무료 키) | 콘텐츠 생성, 관리자 글 윤문·번역, 추천 궤도 생성 | 확인 범위에서 없음 |

Gemini에 대해 확인한 내용은 다음과 같다. 추천 궤도 생성([pacenote-composer.mjs](../../pipeline/src/pacenote-composer.mjs))은 추천 풀 항목의 제목과 카테고리만 프롬프트에 넣는다. 사용자가 직접 쓴 궤도와 회고는 프롬프트에 넣지 않는다. 다른 생성 잡은 구독자나 PaceNote 데이터를 프롬프트 재료로 쓰지 않는 것으로 확인했다.

**규칙**: 무료 키는 약관상 입력이 서비스 개선에 쓰일 수 있으므로, 사용자가 쓴 글이나 개인 식별 정보를 무료 키로 보내지 않는다. 필요해지면 먼저 이 문서와 처리방침을 고친다.

## 4. 운영자의 접근 범위

- **Admin API로 볼 수 있는 것**: 구독자 목록과 CSV 내보내기, 사용자별 이메일·최근 활동·궤도 개수, 사용자가 직접 입력한 궤도 제목. 궤도 제목 응답에는 작성자 `uid`가 포함되지 않는다.
- **Admin API로 볼 수 없는 것**: 회고 원문. `admin-api.mjs`에는 `statement`와 `reflections`를 읽는 코드가 없다.
- **API 밖의 접근**: GCP 콘솔 권한자는 Firestore의 회고 원문을 포함해 모든 데이터를 볼 수 있다. Admin API의 제한은 이 경로에 적용되지 않는다.

## 5. 공백 목록

| # | 우선순위 | 공백 | 근거 | 검토 대상 |
| :--- | :--- | :--- | :--- | :--- |
| P-1 | 높음 | 웹 서비스 개인정보 처리방침이 없다. 있는 것은 Sylphio 앱용 `/sylphio/privacy`뿐이며, "데이터 무수집" 내용이라 웹 서비스에 적용할 수 없다. | [App.jsx](../../src/App.jsx) 라우트, `ko.json`의 `privacy` | 개인정보보호법 제30조 |
| P-2 | 높음 | 구독과 로그인 시 수집 항목·목적·보유 기간 안내가 없다. 구독 버튼을 누르면 로그인 이메일이 바로 등록된다. | [DailyView.jsx](../../src/pages/DailyView.jsx) | 개인정보보호법 제15·22조 |
| P-3 | 높음 | 사용자가 자기 데이터를 삭제할 경로가 없다. PaceNote·Study API에 계정 삭제가 없고, Admin의 사용자 삭제는 관리자 계정 전용이다. | `pacenote-api.mjs`, `study-api.mjs`, `admin-api.mjs` | 개인정보보호법 제21·36조 |
| P-4 | 높음 | 해지한 구독자 이메일, 발송 로그의 수신자, 실패 내역을 무기한 보관한다. 자동 파기 코드가 없다. | `subscribers.mjs`, `MailService.mjs` | 개인정보보호법 제21조 |
| P-5 | 해결 | 인증 없이 이메일만으로 다른 사람의 구독을 해지(`POST /api/unsubscribe`)하거나 구독 여부를 조회(`GET /api/subscribe/check`)할 수 있었다. 2026-11-04에 두 API 모두 로그인 토큰의 이메일만 쓰도록 고쳤다. | [server.mjs](../../server.mjs) | 보안 결함 |
| P-10 | 높음 | `POST /api/subscribe`는 아직 인증 없이 임의 이메일을 등록한다. 타인에게 메일이 발송될 수 있고, `already_subscribed` 응답으로 구독 여부도 드러난다. 요청 제한은 IP당 15분 5회다. | [server.mjs](../../server.mjs) | 보안 결함, 개인정보보호법 제15·22조 |
| P-6 | 중간 | 이메일 원문이 로그에 남는다. | `subscribers.mjs`의 구독·재구독·해지 로그, `mailer.mjs`의 실패 로그 | 최소 수집 |
| P-7 | 중간 | 회고가 `days`·`weeks`의 `statement`와 `profile.reflections` 두 곳에 있다. 한 곳만 지우면 야간 재계산이 다시 채우거나 사본이 남는다. | `pacenote-composer.mjs` | 삭제 구현 시 주의 |
| P-8 | 중간 | 메일 하단에 서비스명과 해지 링크는 있지만 연락처가 없다. 메일이 광고성 정보에 해당하는지 판단이 필요하다. | [email-template.mjs](../../pipeline/src/lib/email-template.mjs) | 정보통신망법 제50조 |
| P-9 | 중간 | 저장 리전과 해외 처리자(Gmail, Gemini) 관련 고지 내용이 정리되어 있지 않다. | §3, §9 | 개인정보보호법 제28조의8 |

## 6. 보존 기간 제안 (결정 필요)

아래 기간은 시작점으로 제안한 값이며, 법정 기준이 아니다.

| 데이터 | 제안 | 이유 |
| :--- | :--- | :--- |
| 활성 구독자 | 해지까지 | 발송에 필요 |
| 해지한 구독자 | 해지 후 30일 뒤 문서 삭제 | 실수 해지 복구 여유. 이후 보관할 목적이 없음 |
| `email_logs.results[]` | 90일 뒤 필드 삭제, 발송 수 집계는 유지 | 발송 장애 조사에는 최근 기록이면 충분 |
| `failed_emails` | 90일 뒤 삭제 | 위와 같음 |
| PaceNote·학습 데이터 | 계정 삭제 요청 시 즉시 삭제 | 서비스 제공 목적 종료 |
| 장기 미사용 계정 | 결정 필요: 기간을 두어 안내 후 삭제, 또는 삭제 요청 시까지 보관 | 회고는 사용자 자산이라 자동 삭제의 위험이 큼 |
| Cloud Run 로그 | 프로젝트 기본 설정 유지, P-6 해결 후 재검토 | 이메일을 로그에서 빼면 위험이 크게 줄어듦 |
| Firestore 백업 | 90일 뒤 삭제 | 삭제 요청 후에도 백업에 무기한 남지 않도록 |

## 7. 삭제 절차

### 7-1. 구현 전 수동 절차

처리방침에 문의처(현재 Sylphio 방침에 쓰는 `support@prisincera.com`)를 공개하고 요청을 받아 운영자가 처리한다.

1. 요청자가 계정 소유자인지 확인한다. 로그인된 계정의 이메일에서 온 요청인지 본다.
2. `pacenotes/{uid}`를 서브컬렉션(`days`, `weeks`)까지 삭제한다.
3. `study_progress/{uid}`를 삭제한다.
4. `subscribers`에서 해당 이메일 문서를 삭제한다.
5. Firebase Auth 계정을 삭제한다.
6. 처리일과 처리 범위를 요청자에게 회신한다. 요청자 이메일은 처리 기록에 꼭 필요한 범위만 남긴다.

`email_logs`·`failed_emails`의 수신자 기록과 백업은 §6의 기간 만료로 사라지므로, 회신에 이 점을 함께 적는다.

### 7-2. 자동화 설계

`DELETE /api/account`를 인증 필수로 추가하고, 위 2~5번을 같은 순서로 수행한다. Auth 계정을 마지막에 지워야 중간에 실패해도 사용자가 다시 시도할 수 있다. `pacenotes`는 `recursiveDelete`로 서브컬렉션까지 지운다. 야간 재계산 잡은 `listDocuments()`로 대상을 고르므로, 삭제 뒤 문서가 되살아나지 않는지 테스트한다.

파기는 일일 잡으로 처리한다. `subscribers`는 `status`와 `unsubscribedAt`으로 조회하며, 복합 인덱스가 필요할 수 있다.

## 8. 실행 항목

| # | 작업 | 해결 공백 | 필요한 것 |
| :--- | :--- | :--- | :--- |
| 1 | `POST /api/subscribe`를 로그인 토큰의 이메일만 쓰도록 변경. 해지·조회 API는 2026-11-04 완료 | P-5(해결), P-10 | 코드 변경 |
| 2 | 로그의 이메일을 해시 또는 마스킹으로 교체 | P-6 | 코드 변경 |
| 3 | §6 보존 기간과 장기 미사용 계정 처리 결정 | P-4 | 오너 결정 |
| 4 | 웹 서비스 처리방침 작성·공개, 구독·로그인 화면에 안내 추가 | P-1, P-2, P-9 | 오너 결정, 법률 검토 |
| 5 | 수동 삭제 절차를 운영 런북에 등록 | P-3 | 처리방침 공개와 함께 |
| 6 | 파기 잡과 `DELETE /api/account` 구현 | P-3, P-4, P-7 | 3번 결정 후 |
| 7 | 메일 하단 연락처·광고 표시 판단 | P-8 | 법률 검토 |

## 9. 콘솔에서 확인할 항목

아래는 코드로 알 수 없어 미확인 상태다. 모두 읽기 전용 명령이다.

| 항목 | 확인 방법 | 왜 필요한가 |
| :--- | :--- | :--- |
| Firestore 리전 | `gcloud firestore databases describe` | 처리방침의 보관 위치 |
| 옛 구독자 파일 잔존 | `gcloud storage ls gs://prisincera-prisignal-data/subscribers/` | 이관 후 남은 이메일 원본 파기. `server.mjs` 머리말의 "GCS fallback"은 현재 코드와 맞지 않음 |
| 백업 잔존 | `gcloud storage ls gs://prisincera-prisignal-data/backups/` | 백업 안의 개인정보 관리 |
| 버킷 수명주기 규칙 | `gcloud storage buckets describe gs://prisincera-prisignal-data` | 백업 자동 만료 가능 여부 |
| 로그 보존 기간 | `gcloud logging buckets list` | §2의 로그 보존 기간 |

## 관련 문서

- [데이터 모델 ERD](data_model_erd.md)
- [저장소 보안 규범](security_spec.md)
- [운영 런북](operations_runbook.md)
- [인증·권한 아키텍처](authentication_architecture.md)
