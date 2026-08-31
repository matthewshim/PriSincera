/**
 * toc — 마크다운 본문에서 목차(TOC)를 뽑는 공용 유틸
 *
 * BuildersLogDetail·PlannersView가 동일한 앵커 규칙을 쓰도록 단일 소스로 둔다.
 * (두 문서형 페이지가 각자 slugify를 들고 있으면 앵커 규칙이 조용히 갈라진다)
 */

// 헤딩 텍스트 → 앵커 id. 한글·가나·한자 보존, 그 외 연속 문자는 '-'로. (rehype-slug 동일 전략, 무의존)
export const slugify = (str) =>
  String(str).trim().toLowerCase()
    .replace(/[#*`]/g, '')
    .replace(/[^\w가-힣぀-ヿ一-鿿]+/g, '-') /* i18n-ok: 정규식 유니코드 범위(한글·가나·CJK 보존), UI 텍스트 아님 */
    .replace(/^-+|-+$/g, '');

// react-markdown children(문자열·배열·엘리먼트)에서 순수 텍스트 추출 (헤딩 id 계산용)
export const nodeText = (children) => {
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(nodeText).join('');
  if (children.props && children.props.children) return nodeText(children.props.children);
  return '';
};

// 본문 마크다운에서 H2/H3만 뽑아 TOC 구성. 코드펜스(```) 내부는 제외.
export const buildToc = (md) => {
  const out = [];
  let inFence = false;
  for (const line of String(md).split('\n')) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[#*`]/g, '').trim();
    out.push({ level: m[1].length, text, id: slugify(text) });
  }
  return out;
};
