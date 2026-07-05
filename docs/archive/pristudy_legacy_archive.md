---
status: archived
domain: Core
last_updated: 2026-05-21
version: v1.0
---

# 🗄️ PriStudy 레거시 아카이브

이 문서는 과거 독립적인 마이크로 어학 학습 플랫폼으로 기획 및 MVP 구축을 시도했던 **PriStudy**의 서비스 철학, 초기 MVP 데이터베이스 스펙, 그리고 다국어(어학) 트랙 확장 전략 수립 및 최종 Daily Digest 서비스 내로의 핵심 기능 통합 이력을 종합 기록한 유산 문서입니다.

---

## 1. 서비스 비전 및 마이크로러닝 철학

* **핵심 가치**: "졸업은 배움의 끝이 아닌, 진짜 생존을 위한 진화의 시작이다." 바쁜 직장인의 한계를 극복하기 위해 하루 단 한 문장을 깊이 있게 내 것으로 만드는 **마이크로러닝(Micro-learning)** 모델 구축.
* **주요 타겟**: 퇴근 후 긴 학습을 병행하기 힘든 25~45세 IT 기획자, 개발자, 주니어 비즈니스 전문가.
* **통합 이력 (2026-05)**:
  독립 앱 개발 대신 사용자의 인지 피로를 낮추고 매일 아침 IT 트렌드 뉴스(Signal)와 공부를 하나의 뷰포트에서 결합해 섭취하는 **Daily Digest** 플랫폼의 학습 서브트랙(`AI Prompt 1-Pick`, `Business Japanese 1-Pick`)으로 통합 완료되었습니다.

---

## 2. 초기 MVP 기획 및 Firestore 스키마 명세

독립 서비스 출시를 준비하며 설계했던 초기 MVP 버전의 관계형 정보 모델 및 Firestore 비정규화 데이터 스키마입니다.

### 2-1. Firestore Collection: `study_contents`
매일 하나씩 시딩(Seeding)되는 학습 콘텐츠의 구조입니다.

```json
{
  "contentId": "study_20260429_ja",
  "date": "2026-04-29",
  "category": "language",
  "subCategory": "japanese",
  "title": "비즈니스 거절 메일의 격식 있는 표현",
  "expression": "ご期待에 添えず 申し訳ございません。",
  "reading": "ごきたいに そえず もうしわけございません。",
  "pronunciation": "고키타이니 소에즈 모우시와케고자이마센",
  "meaning": "기대에 부응하지 못해 죄송합니다.",
  "nuance": "상대방의 제안이나 기대를 격식 있게 정중하게 거절할 때 쓰이는 극존칭 표현입니다.",
  "examples": [
    {
      "japanese": "慎重に 検討いたしましたが、今回は ご期待に 添えず 申し訳ございません。",
      "korean": "신중하게 검토하였으나, 이번에는 기대에 부응하지 못해 죄송합니다."
    }
  ],
  "aiCommentary": "添う는 '부응하다'의 뜻으로, 비즈니스 거절 시 죄송함을 한층 극대화하는 성숙한 표현입니다.",
  "ttsUrl": "gs://prisincera-study-data/tts/20260429_ja.mp3"
}
```

---

## 3. 학습 습관화 시스템 (Streak / 잔디 심기 UX)

꾸준한 학습 동기부여를 위해 GitHub의 Contribution Graph를 벤치마킹한 **14일 연속 학습 대시보드(Streak Board)**를 기획하였습니다.
* **동작 원리**: 사용자가 당일의 학습 텍스트 및 TTS 재생 발음을 청취한 뒤, 페이지 최하단의 **'오늘의 잔디 심기 완료'** 버튼을 클릭하면 불꽃/폭죽 이펙트(Confetti)와 함께 녹색 도트 인디케이터에 은은한 충전 모션이 인가됨.
* **GCP Firebase Auth**: Google Auth 및 Firestore `users/{uid}/study_streaks` 문서 세트를 연동해 연속 달성일수(Streak Count)와 누적 리워드 레벨을 브라우저에 상시 유지하도록 상태 흐름을 구축했습니다.

---

## 4. 다국어 확장 로드맵 (Phase 3 Expansion Strategy)

MVP 출시 성공 이후를 상정하고 설계했던 비즈니스 다국어 교육 확장 제안 사양입니다.
* **비즈니스 영어 트랙 (Global English Track)**: 실무 콜드 이메일 프레임워크 및 글로벌 테크 기업의 리더십 피드백 뉘앙스 비교 모듈 추가 기획.
* **실무 AI 프롬프트 스니펫 (AI Prompting Track)**: Gemini/ChatGPT의 역할을 사전에 정의하여 업무 효율을 10배 높이는 Few-shot 프롬프트 조립 구조화 템플릿 공급 계획.
* **확장 콘텐츠 검증**: AI 파이프라인(`study-composer.mjs`)에 어학원 검수 가중치 메타 필드를 추가하여, Gemini가 생성한 원문의 2차 필터링 파이프라인을 두어 번역 및 독음의 신뢰성을 보장하는 다국어 시딩 자동화 아키텍처를 수립했습니다.
