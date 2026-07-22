---
status: active
domain: Core
last_updated: 2026-07-22
version: v1.1
target_files:
  - package.json
  - cloudbuild.yaml
  - docs/INDEX.md
---

# 🧭 온보딩 가이드 (Onboarding)

> 신규 합류자가 **"어디부터 읽고, 어떻게 환경을 세팅할지"** 를 한 번에 해결하는 문서. 역할별 필독 경로 + 개발 환경 셋업 체크리스트.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-24 | AI Agent | 역할별 필독 경로 + dev 셋업 체크리스트 최초 정의 | Onboarding |
| v1.1 | 2026-07-22 | AI Agent | **리런 통합 반영** — 기획자 경로에 relearn 전략·UI 명세 편입(구 PaceNote 전략서는 근거 문서로 격하), admin 재편 정본 안내, 유령 `builderslog-api.mjs` 참조 제거 | §1, §4 |

---

## 0. 모두의 공통 필독 (Day 1)

1. [service_overview](service_overview.md) — 서비스가 무엇인가 (5분)
2. [architecture_overview](architecture_overview.md) — 전체 기술 구조 (10분)
3. [design_system](design_system.md) — 비주얼 언어/토큰 (디자인·개발 공통)

> 그다음, 아래 본인 역할 경로를 따라 읽으세요. 문서는 모두 본 **Admin > 서비스 문서** 메뉴에서 **열람·인라인 수정·수정 이력 확인**이 가능합니다. (수정 시 GitHub main에 커밋되어 약 3~4분 후 배포 반영, 편집자·이력 자동 기록 — 본문 글로벌 캐시 모델은 유지)

## 1. 역할별 필독 경로

### 🧭 기획자 (Product / Planner)
| 순서 | 문서 | 목적 |
| :--- | :--- | :--- |
| 1 | [business_model](business_model.md) | 수익 모델·타깃·비용 철학 |
| 2 | [relearn/product_strategy](../relearn/product_strategy.md) | **플래그십 리런** 통합 전략·승계 로드맵 |
| 3 | [relearn/ui_specification](../relearn/ui_specification.md) | 리런 출하 화면 명세 (3-stage 루프) |
| 4 | [daily-digest/content_sourcing_policy](../daily-digest/content_sourcing_policy.md) | 콘텐츠 출처·사실성 정책 |
| 5 | [pacenote/product_strategy](../pacenote/product_strategy.md) · [growth_loop_plan](../pacenote/growth_loop_plan.md) | 실행·복기 도메인 근거 전략(리런에 승계) + 성장 루프 데이터층 |
| 6 | [admin_console_specification](admin_console_specification.md) | 운영 콘솔 메뉴·기능 구조 |

### 🎨 디자이너 (Design)
| 순서 | 문서 | 목적 |
| :--- | :--- | :--- |
| 1 | [design_system](design_system.md) | 컬러·타이포·글래스·인터랙션 토큰 |
| 2 | [branding](branding.md) | 브랜드 아이덴티티 |
| 3 | [bi_centered_ux_guide](bi_centered_ux_guide.md) | 하이엔드 다크 UX 수칙 |
| 4 | 각 도메인 `ui_specification.md` | 화면별 구현 스펙 |

### 💻 개발자 (Engineering)
| 순서 | 문서 | 목적 |
| :--- | :--- | :--- |
| 1 | [development_guide](development_guide.md) | 로컬 셋업·Git·배포·장애 대응 |
| 2 | [architecture_overview](architecture_overview.md) | 시스템 전반 |
| 3 | [authentication_architecture](authentication_architecture.md) | 인증 흐름 |
| 4 | [api_usage_analysis](api_usage_analysis.md) | AI 비용·무료 티어·할당량 |
| 5 | [data_contract_v2](../data_contract_v2.md) | 웹↔데스크톱 데이터 계약 |
| 6 | [front_end_stability_checklist](front_end_stability_checklist.md) | 프론트 안정성 점검 |

## 2. 신규 개발자 환경 셋업 체크리스트

```bash
# 1) 클론 & 의존성
git clone <repo>
cd www
npm install                 # 웹(루트)
cd pipeline && npm install  # 파이프라인(선택)

# 2) 환경변수 (로컬 개발)
#   - GEMINI_API_KEY        : 무료 Gemini 키 (GCP Secret Manager에 운영 키 보관)
#   - GOOGLE_APPLICATION_CREDENTIALS : GCS/Firestore 로컬 접근(서비스 계정 키)
#   - GCS_BUCKET            : 기본 prisincera-prisignal-data

# 3) 로컬 실행
npm run dev                 # Vite 개발 서버(프론트)
npm run build && npm start  # 프로덕션 빌드 후 server.mjs 기동

# 4) 파이프라인 단발 실행(선택)
cd pipeline
npm run tech:compose        # 테크 트랙 피드 생성 (node src/tech-composer.mjs)
```

### 배포 흐름
- **`main` 푸시 → Cloud Build(`cloudbuild.yaml`) 자동 트리거 → Cloud Run(web) + Cloud Run Jobs 갱신.**
- ⚠️ 잡 이미지 갱신(`jobs update`)은 빌드 **후반** 단계 — 배포가 끝나기 전에 잡을 수동 실행하면 옛 이미지로 돌 수 있음.
- 브랜치 전략·긴급 대응: [development_guide](development_guide.md).

## 3. 문서 작성 거버넌스 (기여 시 필독)
새 문서를 만들거나 수정할 때는 [INDEX.md](../INDEX.md)의 거버넌스 규칙을 준수하세요:
- 도메인 폴더 배치(`core/`·`pacenote/` 등), snake_case 파일명, 접두사 금지
- YAML Frontmatter(`status/domain/last_updated/version/target_files`) + Revision History 테이블
- 문서 추가/이동 시 **INDEX.md 동시 갱신**(깨진 링크 3중 검증)

## 4. "막히면" — 빠른 위치 안내
| 찾는 것 | 위치 |
| :--- | :--- |
| 화면/컴포넌트 | `src/pages/`, `src/components/` |
| 웹 서버·API | `server.mjs`, `pacenote-api.mjs`, `admin-api.mjs`, `study-api.mjs` (Builder's Log 조회수는 server.mjs 인라인, 발행은 admin-api) |
| 배치 파이프라인 | `pipeline/src/` (`lib/`, `templates/`, `config/`) |
| CI/CD·인프라 | `cloudbuild.yaml`, `pipeline/setup-infra.sh` |
| 전체 문서 | 본 **Admin > 서비스 문서** 또는 `docs/INDEX.md` |
