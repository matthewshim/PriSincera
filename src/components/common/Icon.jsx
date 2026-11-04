/**
 * Icon — 천체 테마 인라인 SVG 아이콘 세트 (P2-7 / D-7 ① 결정)
 *
 * [왜 자작인가]
 * 이모지는 OS·플랫폼마다 글리프가 달라 **기능 신호가 흔들린다** — 닫기·확인·경고는
 * 장식이 아니라 어포던스다. 그런데 lucide·phosphor 같은 기성 세트를 그대로 붙이면
 * **그 자체가 AI 생성 티의 전형**(ai_pattern_audit.md §1 B2)이어서 티를 바꿔 끼우는 셈이다.
 * 그래서 브랜드(망원경·별자리·궤도)에 맞춘 자작 세트를 쓴다.
 *
 * [설계 규칙]
 *  1. 선 굵기 1.5 — `--glass-border` 1px 구조선과 `.orbit-ring` 스트로크 언어에 맞춘다.
 *  2. `currentColor` — 색을 갖지 않는다. 쓰는 자리의 텍스트 색·제품 액센트를 그대로 상속한다.
 *  3. 24×24 viewBox · `round` 캡/조인 — 기하학적이되 날카롭지 않게.
 *  4. 채움(fill) 금지 — 천체 모티브는 '선으로 그린 도표'다. 덩어리는 쓰지 않는다.
 *  5. 장식 금지 — 반짝임·그라디언트·그림자를 넣지 않는다(그게 걷어내려는 패턴이다).
 *
 * [사용]
 *   <Icon name="close" />                      // 1em 크기, 현재 텍스트 색
 *   <Icon name="check" size={16} />
 *   <Icon name="warning" label="경고" />       // label 주면 img 역할 + aria-label
 *   label 미지정 시 aria-hidden — 인접 텍스트가 의미를 담당하는 경우.
 */

const PATHS = {
  /* 닫기 — 교차하는 두 선 */
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  /* 확인 — 체크. 상승하는 획이 길다(완료의 방향성) */
  check: <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />,
  /* 경고 — 삼각형 + 수직 획·점 */
  warning: <><path d="M12 3.5L22 20.5H2L12 3.5z" /><path d="M12 10v4.5" /><path d="M12 17.6v.1" /></>,
  /* 다음 — 수평 획 + 꺾쇠 */
  arrowRight: <><path d="M4 12h15" /><path d="M13.5 6.5L19.5 12l-6 5.5" /></>,
  /* 왼쪽 화살표 — 이전/뒤로. arrowRight의 거울상이다(같은 제스처는 같은 형태) */
  arrowLeft: <><path d="M20 12H4" /><path d="M10.5 5.5L4 12l6.5 6.5" /></>,
  /* 아래 화살표 — 같은 지면 아래로 스크롤. arrowRight를 90도 돌린 형태(같은 제스처는 같은 형태) */
  arrowDown: <><path d="M12 4v15" /><path d="M5.5 13.5L12 19.5l6.5-6" /></>,
  /* 밖으로 — 외부 링크(새 탭). 상자를 벗어나는 사선 화살표 */
  external: <><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h4.5" /></>,
  /* 순환 — 궤도 호 2개 + 진행 방향 꺾쇠 (Learn·Run·Reflect 루프) */
  loop: <><path d="M20 12a8 8 0 0 1-13.2 6.1" /><path d="M4 12a8 8 0 0 1 13.2-6.1" /><path d="M17.5 2.5v3.6h-3.6" /><path d="M6.5 21.5v-3.6h3.6" /></>,
  /* 문서 — 모서리 접힌 시트 */
  document: <><path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8L14 3.5z" /><path d="M14 3.5V8h4.5" /></>,
  /* 메일 — 봉투 + 접힘선 */
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M3.8 6.4L12 12.6l8.2-6.2" /></>,
  /* 내려받기 — 하강 획 + 받침 */
  download: <><path d="M12 3.5v11" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></>,
  /* 잠금 — 섀클 + 본체 */
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  /* 해제 — 섀클이 열린 상태 */
  unlock: <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 7.6-1.7" /></>,
  /* 키 — API 키. 고리 + 축 + 이빨 */
  key: <><circle cx="7.5" cy="16.5" r="3.5" /><path d="M10 14L20 4" /><path d="M16.5 4.5l3 3" /><path d="M14 7l2.5 2.5" /></>,
  /* 방패 — 개인정보 보호 */
  shield: <path d="M12 3l7.5 3v6c0 4.3-3 7.7-7.5 9-4.5-1.3-7.5-4.7-7.5-9V6L12 3z" />,

  /* ── 제품 기능 아이콘 ── */
  /* 마이크 — 캡슐 + 받침. 실시간 음성 입력 */
  mic: <><rect x="9.5" y="2.5" width="5" height="11" rx="2.5" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" /><path d="M12 18v3.5" /></>,
  /* 노트북 — 화면 + 받침 */
  laptop: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2.5 19h19" /></>,
  /* 코어 — 중심 + 궤도 노드. 'AI 엔진'을 뇌가 아니라 **천체 모형**으로 표현한다
     (뇌 그림은 선화로 그리면 뭉개지고, 브랜드 모티브와도 어긋난다) */
  core: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="3.5" r="1.2" /><circle cx="19.4" cy="16.2" r="1.2" /><circle cx="4.6" cy="16.2" r="1.2" /></>,
  /* 차트 — 막대 3개. 요약·분석 */
  chart: <><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8.5 20v-6" /><path d="M13 20V9.5" /><path d="M17.5 20v-8.5" /></>,
  /* 모니터 — 화면 + 스탠드. 화면 전체 자막 */
  monitor: <><rect x="3" y="4" width="18" height="12.5" rx="1.5" /><path d="M9 20h6" /><path d="M12 16.5V20" /></>,
  /* 헤드폰 — 헤드밴드 + 이어컵 */
  headphones: <><path d="M4.5 14.5v-2a7.5 7.5 0 0 1 15 0v2" /><rect x="2.5" y="14" width="4" height="6.5" rx="2" /><rect x="17.5" y="14" width="4" height="6.5" rx="2" /></>,
  /* 팔레트 — 자막 커스텀 */
  palette: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.6 1.2-2.3 2.6-2.3h1.3a3 3 0 0 0 3-3A8.5 8.5 0 0 0 12 3.5z" /><circle cx="8.3" cy="9.6" r="1.1" /><circle cx="13" cy="7.8" r="1.1" /></>,

  /* ── 섹션·제품 아이덴티티 ──
     천체 모티브를 공통 어휘로 쓴다: 궤도(원)·별(4갈래)·호(arc). 사물 그림을 최소화한다. */
  /* 나침반 — Waymark 브랜드. 궤도 + 바늘 */
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9z" /></>,
  /* 별 — 4갈래 성휘(✦). 추천·강조 */
  star: <path d="M12 3.2l2.1 6.7 6.7 2.1-6.7 2.1L12 20.8l-2.1-6.7L3.2 12l6.7-2.1L12 3.2z" />,
  /* 궤도 — 행성계(🪐). 리런 루프의 중심 */
  orbit: <><circle cx="12" cy="12" r="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-20 12 12)" /></>,
  /* 책 — 읽기(📖 Planner's View·Builder's Log) */
  book: <><path d="M12 6.2v14" /><path d="M12 6.2C10.3 4.8 7.9 4.2 4.5 4.3v13c3.4-.1 5.8.5 7.5 1.9" /><path d="M12 6.2c1.7-1.4 4.1-2 7.5-1.9v13c-3.4-.1-5.8.5-7.5 1.9" /></>,
  /* 공구 — 만드는 과정(🛠 Builder's Log) */
  tools: <><path d="M14.2 6.6a3.8 3.8 0 0 1 5.2 5.2l-2.1-2.1-3.1 3.1" /><path d="M9.8 10.2L4 16v4h4l5.8-5.8" /><path d="M14.2 6.6l-4.4 3.6" /></>,
  /* 위성 — 트랙 시그널(🛰) */
  satellite: <><rect x="9.5" y="9.5" width="5" height="5" rx="1" transform="rotate(45 12 12)" /><path d="M4.5 12H2" /><path d="M22 12h-2.5" /><path d="M12 4.5V2" /><path d="M12 22v-2.5" /></>,
  /* 안테나 — 신호 수신(📡) */
  antenna: <><path d="M3.5 20.5L12 12" /><path d="M8.2 15.8a8 8 0 0 1 0-11.3 8 8 0 0 1 11.3 0" /><path d="M11 13a4.2 4.2 0 0 1 0-6 4.2 4.2 0 0 1 6 0" /></>,
  /* 프롬프트 — 터미널 꺾쇠 + 커서(🤖 대체. 로봇 그림보다 정확하다) */
  prompt: <><rect x="3" y="4.5" width="18" height="15" rx="1.5" /><path d="M7.5 10l2.5 2-2.5 2" /><path d="M12.5 14.5h4" /></>,
  /* 신문 — 시그널 아티클(📰) */
  news: <><rect x="3" y="5.5" width="18" height="13" rx="1.5" /><path d="M6.5 9.5h7" /><path d="M6.5 12.5h7" /><path d="M6.5 15.5h4" /><path d="M16.5 9.5h1" /></>,
  /* 달력 — 날짜(📅) */
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="1.5" /><path d="M3.5 10h17" /><path d="M8 3.5v4" /><path d="M16 3.5v4" /></>,
  /* 사람 — 계정(👤) */
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  /* 더하기 — 신규 생성(➕) */
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  /* 두 사람 — 구독자·집단(👥) */
  users: <><circle cx="9.5" cy="8.5" r="3.4" /><path d="M3 20.5a6.6 6.6 0 0 1 13.2 0" /><path d="M16.2 5.6a3.4 3.4 0 0 1 0 5.8" /><path d="M17.6 15.6a6.6 6.6 0 0 1 3.4 4.9" /></>,
  /* 버림 — 삭제(🗑) */
  trash: <><path d="M4.5 7h15" /><path d="M9.5 7V4.5h5V7" /><path d="M6.5 7l1 13h9l1-13" /><path d="M10.5 10.5v6" /><path d="M13.5 10.5v6" /></>,
  /* 상승체 — 더 빠른 궤적(🚀). 분사 대신 뒤로 늘어지는 궤적선으로 속도를 표시한다 */
  rocket: <><path d="M13.5 3.5c3.5 1.5 6 5 7 10l-5 2.5-4.5-4.5L13.5 3.5z" /><path d="M11 11.5L4.5 18l1.5 1.5L12.5 13" /><path d="M6.5 14.5L3.5 20.5l6-3" /></>,
  /* 탐색 — 렌즈 + 손잡이(🔍) */
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" /></>,
  /* 고리 — 연결(🔗). 맞물린 두 호 */
  link: <><path d="M10 14a3.5 3.5 0 0 1 0-5l3-3a3.5 3.5 0 0 1 5 5l-1.5 1.5" /><path d="M14 10a3.5 3.5 0 0 1 0 5l-3 3a3.5 3.5 0 0 1-5-5L7.5 11.5" /></>,
  /* 묶음 — 파일 모음(📁) */
  folder: <><path d="M3.5 7.5h6l2 2.5h9v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-11z" /></>,
  /* 나감 — 이탈·해지(🚪) */
  exit: <><path d="M14.5 3.5h-8a1.5 1.5 0 0 0-1.5 1.5v14a1.5 1.5 0 0 0 1.5 1.5h8" /><path d="M11 12h9.5" /><path d="M17 8.5l3.5 3.5-3.5 3.5" /></>,
  /* 시계 — 예정 시각(⏱) */
  timer: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9.5V13l2.5 2" /><path d="M9.5 2.5h5" /></>,
  /* 지구 — 로케일(🌐) */
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.3 8.4 12S9.6 5.8 12 3.5z" /></>,

  /* ── Waymark 의사결정 루프 ── */
  /* 펜 — 기록(✎) */
  pen: <><path d="M4 20l1-4.2L16.3 4.5a2.4 2.4 0 0 1 3.4 3.4L8.4 19.2 4 20z" /><path d="M14.8 6l3.4 3.4" /></>,
  /* 발자취 — 지나온 길(👣) */
  trail: <><circle cx="7" cy="18" r="2.2" /><circle cx="12" cy="12" r="2.2" /><circle cx="17" cy="6" r="2.2" /><path d="M8.7 16.5l1.8-2.6" /><path d="M13.7 10.5l1.8-2.6" /></>,
  /* 순환 — 되돌아보기(↻) */
  cycle: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4.5V8h-3.5" /></>,
  /* 맞손 — 위로·동반(🫶) */
  care: <><path d="M12 20.5s-7.5-4.3-7.5-9.3a4 4 0 0 1 7.5-1.9 4 4 0 0 1 7.5 1.9c0 5-7.5 9.3-7.5 9.3z" /></>,
  /* 퍼즐 — 함께 생각하기(🧩) */
  puzzle: <><path d="M9.5 4.5h5v2a2 2 0 1 0 2.5 2h2v5h-2a2 2 0 1 0-2.5 2v2h-5v-2a2 2 0 1 0-2.5-2H4.5v-5h2A2 2 0 1 0 9.5 6.5v-2z" /></>,
  /* 불꽃 — 응원·연속 기록(🔥) */
  flame: <><path d="M12 21c3.6 0 6-2.4 6-5.6 0-4.2-4.3-5.9-3.4-12.4-3 1.5-5.3 4.5-5.3 7.3 0 1.2.4 2 .4 2.6 0 1-.8 1.6-1.6 1.6-1 0-1.7-.8-2-1.8-.7 1-1.1 2.2-1.1 3.4C5 18.5 8 21 12 21z" /></>,
  /* 분류 — 정리하기(🗂) */
  sort: <><path d="M3.5 7.5h17" /><path d="M6 11.5h12" /><path d="M8.5 15.5h7" /><path d="M11 19.5h2" /></>,
  /* 통찰 — 인사이트(💡). 전구가 아니라 '빛나는 점 + 발산 획'으로(천체 어휘) */
  insight: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.6" /><path d="M12 18.4V21" /><path d="M3 12h2.6" /><path d="M18.4 12H21" /><path d="M6 6l1.9 1.9" /><path d="M16.1 16.1L18 18" /><path d="M18 6l-1.9 1.9" /><path d="M7.9 16.1L6 18" /></>,
  /* 과녁 — 실행 과제(🎯) */
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
};

export default function Icon({ name, size, label, className = '', strokeWidth = 1.5 }) {
  const d = PATHS[name];
  if (!d) {
    if (import.meta.env?.DEV) console.warn(`[Icon] 알 수 없는 아이콘: ${name}`);
    return null;
  }
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' };
  return (
    <svg
      className={`ui-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size || '1em'}
      height={size || '1em'}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
    >
      {d}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);
export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(PATHS, name);

/**
 * IconOrGlyph — 값이 **아이콘 이름이면 SVG**, 아니면 **그대로 출력**한다.
 *
 * [필요한 이유] 콘텐츠 상세 히어로의 아이콘은 두 출처를 가진다(design_system §9-1 v5.21):
 *   ① 섹션 기본 아이콘(`SECTION_ICON`) — 우리가 통제하는 UI 요소 → SVG
 *   ② **글 제목 선두의 이모지를 승격한 것** — 작성자가 고른 콘텐츠 → 이모지 유지
 * ②를 SVG로 강제하면 아이콘 세트에 없는 이모지는 사라진다. 콘텐츠는 콘텐츠로 둔다
 * (ai_pattern_remediation_plan.md P2-7의 'C. 콘텐츠·강조 이모지는 유지 허용').
 */
export function IconOrGlyph({ value, size, label, className }) {
  if (hasIcon(value)) return <Icon name={value} size={size} label={label} className={className} />;
  return <>{value}</>;
}
