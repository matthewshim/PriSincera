---
status: active
domain: Core / Infra
last_updated: 2026-09-03
version: v1.0
target_files:
  - (인프라 — 코드 아님)
nav_title: 인프라 현황
---

# 🏗️ 인프라 현황 — 웹 서빙 아키텍처 (Infrastructure SSOT)

> **이 문서의 목적**: GCP 프로젝트 `prisincera`의 웹 서빙 아키텍처가 2026-09-02~03 비용 최적화로 **로드밸런서(LB) 방식 → Firebase Hosting rewrite 방식**으로 전환되었다. 이후 AI 도구·개발자가 인프라를 다룰 때 **반드시 이 문서를 정본(SSOT)으로 참조**하여, 삭제된 리소스를 재참조·재생성하거나 도메인/DNS/SSL 설정을 되돌리는 실수를 하지 않도록 한다. 상세 배포·트러블슈팅 절차는 [development_guide §9~§13](development_guide.md), 데이터플레인 장애는 [operations_runbook](operations_runbook.md).

## 0. 요약 (TL;DR)

| 구분 | 변경 전 | 변경 후 |
|---|---|---|
| 웹 트래픽 경로 | 사용자 → **전역 외부 LB**(고정 IP 136.110.131.58) → 서버리스 NEG → Cloud Run `prisincera-web` | 사용자 → **Firebase Hosting**(무료) → rewrite → Cloud Run `prisincera-web` |
| 커스텀 도메인/SSL | 로드밸런서 + Google 관리 인증서 | Firebase Hosting 커스텀 도메인 + 자동 SSL |
| 컨테이너 이미지 보관 | 무제한 누적(81.8GB) | 정리 정책 자동(최근 3개 유지 + 7일 초과 삭제) |
| 월 비용 | 약 ₩44,900 | 약 ₩1,000~1,500 (약 97% 절감) |

**로드밸런서·고정 IP·LB용 SSL 인증서는 전부 삭제되어 더 이상 존재하지 않는다.** Cloudflare/CDN은 **사용하지 않는다**(계획 `cloudflare_supabase_migration_plan.md`는 `deferred`, 코드의 CF 캐시 퍼지는 env 미구성 no-op).

## 1. 기본 정보

- **GCP 프로젝트**: `prisincera` (표시 이름: DailyDigest PaceNote), 조직 prisincera.com
- **주 리전**: `asia-northeast3`(서울)
- **서비스 도메인**: `prisincera.com`, `www.prisincera.com`
- **Cloud Run 서비스**: `prisincera-web`(웹), `billing-killswitch`
- **Cloud Run 잡**: `pacenote-composer`, `prisignal-collector`, `prisignal-composer`, `prisignal-monitor`, `pristudy-composer`, `tech-composer` — **변경 없음**
- **Cloud Scheduler**: 잡 트리거 크론 6개 — **변경 없음**

## 2. 변경 배경

2026년 8월 청구 약 ₩44,874의 62%가 **로드밸런서 최소 시간요금**(LB가 존재하는 것만으로 Forwarding Rule 시간당 과금), 26%가 **Artifact Registry 이미지 누적**(정리 정책 부재)이었다. 이 LB는 CDN·Cloud Armor 없이 **커스텀 도메인 + HTTPS 종단 용도로만** 쓰였으므로, **무료인 Firebase Hosting rewrite로 완전 대체 가능**했다.

> 참고: Cloud Run의 무료 "도메인 매핑(Domain Mapping)"은 `asia-northeast3`(서울) 리전에서 미지원(2026-09 기준)이라 사용할 수 없어, Firebase Hosting 방식을 채택했다.

## 3. 삭제된 리소스 — ⚠️ 절대 참조/재생성 금지

아래는 **2026-09-03 완전 삭제**되었다. 코드·IaC·문서·스크립트에서 참조가 발견되면 **제거 대상**이다.

| 리소스 | 이름 | 비고 |
|---|---|---|
| 전역 외부 애플리케이션 LB | `prisincera-urlmap` | URL 맵·전달 규칙(80/443)·타깃 프록시(`prisincera-https-proxy` 등) 일괄 삭제 |
| 백엔드 서비스 | `prisincera-backend` | LB 삭제와 함께 |
| 고정 외부 IP | `prisincera-ip` = **136.110.131.58** | **해제(release)됨. Google이 타 고객에게 재할당하므로 어디서든 재사용/참조 금지** |
| SSL 인증서 | `prisincera-cert`, `prisincera-cert-v2` | LB용 Google 관리 인증서 |
| Artifact Registry 이미지 | `prisincera-images/prisincera-web` | 미사용으로 패키지째 삭제 |

**남아 있으나 미연결(삭제 안 해도 무방)**: 서버리스 NEG `prisincera-neg`(비용 없음). Cloud Run 서비스/잡·Scheduler·Secret Manager·Cloud DNS 존은 **전부 변경 없음**.

## 4. 현재 아키텍처

### 4.1 트래픽 흐름

```
사용자
  → https://prisincera.com          (DNS A 199.36.158.100 = Firebase Hosting)
  → [앱이 www로 301 리다이렉트]       (Cloud Run 앱의 canonical redirect)
  → https://www.prisincera.com       (DNS CNAME prisincera.web.app)
  → Firebase Hosting (사이트 ID: prisincera)
  → rewrite "**"
  → Cloud Run 서비스 prisincera-web (asia-northeast3)
```

- 기본 URL `https://prisincera.web.app` / `.firebaseapp.com`도 동일 서비스로 연결.
- 정적 콘텐츠(daily JSON 등)는 **GCS 직접 서빙**(CDN 없음). `server.mjs`가 GCS 프록시.

### 4.2 Firebase Hosting 설정

Cloud Shell `~/fbhosting/`에서 배포. `firebase.json`은 `rewrites: [{ source: "**", run: { serviceId: "prisincera-web", region: "asia-northeast3" } }]`, `.firebaserc`는 default 프로젝트 `prisincera`.

- ⚠️ `public/`은 **비어 있어야 한다**. `index.html` 등 정적 파일을 넣으면 rewrite보다 우선 적용되어 **Cloud Run 앱이 가려진다**. 넣지 말 것.
- 배포: rewrite 유지한 채 `firebase deploy --only hosting --project prisincera`.

### 4.3 커스텀 도메인 (2026-09-03 최종)

| 도메인 | 유형 | 상태 |
|---|---|---|
| prisincera.web.app / .firebaseapp.com | 기본값 | 정상 |
| **prisincera.com** | 커스텀(직접 서빙) | 연결·SSL 정상 |
| **www.prisincera.com** | 커스텀(**직접 서빙 — 리디렉션 아님**) | 연결·SSL 정상 |

⚠️ **www를 "리디렉션"으로 바꾸지 말 것**: Cloud Run 앱이 `prisincera.com → www` canonical 리다이렉트를 수행하므로, Firebase에서 www를 apex로 리디렉션하면 `apex→www→apex…` **무한 루프**(ERR_TOO_MANY_REDIRECTS)가 발생한다. 앱의 canonical 방향을 바꾸려면 Firebase 도메인 설정도 반드시 함께 검토.

### 4.4 Cloud DNS (`prisincera-zone`) — ⚠️ 변경 금지

| 이름 | 유형 | TTL | 값 |
|---|---|---|---|
| prisincera.com. | A | 300 | `199.36.158.100` (Firebase Hosting) |
| www.prisincera.com. | CNAME | 300 | `prisincera.web.app.` |
| prisincera.com. | TXT | 300 | `hosting-site=prisincera` (Firebase 소유권 확인 — **삭제 금지**) |

⚠️ **A 레코드를 `136.110.131.58`로 되돌리지 말 것**(해제된 IP, 우리 소유 아님). TXT 삭제 금지.

## 5. Artifact Registry 정리 정책

저장소 `prisincera-images`(asia-northeast3)에 2026-09-02부터 **실행 모드**로 적용:

1. `delete-older-than-7d` — 업로드 7일 초과 버전 삭제
2. `keep-recent-3` — 패키지별 최신 3개 버전 보호

⚠️ **롤백은 최근 3개 버전까지만 보장**된다. 장기 보존이 필요한 특정 버전이 있으면 별도 태그가 아니라 **정리 정책 자체를 조정**(keep 값 증가 등)해야 한다. 이미지 푸시/배포 플로우 자체는 변경 없으며, 신규 푸시마다 구 버전이 정리되어 저장 비용이 누적되지 않는다.

## 6. 운영/개발 시 체크리스트

**하지 말 것**:
- ❌ 로드밸런서·전달 규칙·백엔드 서비스·고정 IP 재생성(비용 왕복). HTTPS·도메인은 Firebase Hosting이 담당.
- ❌ DNS A 레코드를 `136.110.131.58` 등으로 변경. TXT `hosting-site=prisincera` 삭제.
- ❌ Firebase에서 www를 "리디렉션"으로 변경(§4.3 루프).
- ❌ `~/fbhosting/public/`에 정적 파일 투입(Cloud Run 앱 가려짐).
- ❌ `firebase.json`의 rewrite(`** → prisincera-web`) 제거 후 배포.
- ❌ "옛 이미지로 롤백" 시나리오를 최근 3개 버전 밖으로 설계.

**유지되는 것**:
- ✅ 웹 배포는 기존과 동일: 이미지 빌드 → `prisincera-images` 푸시 → Cloud Run `prisincera-web` 릴리비전 배포. Firebase는 건드릴 필요 없음.
- ✅ 도메인/SSL 장애 확인 위치: **Firebase Console → Hosting → 사이트 `prisincera` → 도메인 목록**.
- ✅ 장애 분기: `prisincera.web.app`은 정상인데 커스텀 도메인만 안 되면 DNS/도메인 설정 문제, 둘 다 안 되면 Cloud Run 문제.

## 7. 비용 요약

| 항목 | 8월 실적 | 이후 예상 |
|---|---|---|
| Networking(LB 최소요금) | ₩27,843 | **₩0** (LB 삭제) |
| Artifact Registry | ₩11,794 | ~₩0 (정리 정책) |
| Cloud Run | ₩3,757 | 유사~감소(scale-to-zero) |
| Scheduler/DNS/Secret 등 | ~₩1,480 | 유사 |
| **합계** | **₩44,874** | **약 ₩1,000~1,500/월** |

---

*작성: 2026-09-03 인프라 변경 1차 기록 기반. 이후 인프라 변경 시 본 문서를 갱신하고 [development_guide](development_guide.md)·[architecture_overview](architecture_overview.md)와 정합을 유지한다.*
