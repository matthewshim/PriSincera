/**
 * 캔델라 데이터 소스 선언 (G-1) — 단일 진실 원천.
 *
 * 정본: docs/candela/ui_specification.md §2 (게이트 3중)
 *
 * 이 값 하나가 아래 셋의 유일 근거다:
 *   - G-2 빌드 차단: 'fixture' 인데 App.jsx 에 퍼블릭 /candela 라우트가 등록되면 빌드 실패
 *   - G-3 워터마크: 렌더 데이터의 dataSource 가 'fixture' 면 해제 불가 배너
 *   - G-4 live 전환 검증: 'live' 전환 시 실적 스냅샷 존재·최신성 확인
 *
 * 실데이터 3개월 확보 + 승격 게이트 통과(P5) 전에는 'live' 로 바꾸지 않는다.
 */
export const CANDELA_DATA_SOURCE = 'fixture'; // 'fixture' | 'live'

export const isLive = () => CANDELA_DATA_SOURCE === 'live';
export const isFixtureSource = () => CANDELA_DATA_SOURCE === 'fixture';
