/**
 * remarkHighlight — `==문장==` 을 <mark> 로 바꾸는 remark 플러그인
 *
 * GFM 에는 하이라이트 문법이 없다. 대안으로 rehype-raw 를 넣어 본문에 HTML 을 허용하는
 * 방법이 있으나, 공개 저장소에 글을 커밋하는 구조에서 **임의 HTML 전면 허용**은 표면을
 * 넓힌다. 좁은 문법 하나를 직접 처리하고 의존성은 추가하지 않는다.
 *
 * mdast 에는 mark 노드가 없으므로 emphasis 노드에 data.hName 을 얹어 태그만 바꾼다
 * (mdast-util-to-hast 의 공식 동작).
 */

const HIGHLIGHT = /==([^=\n]+)==/g;

/** 텍스트 한 덩이를 text / mark 노드 배열로 쪼갠다 */
function split(value) {
  const out = [];
  let last = 0;
  HIGHLIGHT.lastIndex = 0;

  let m = HIGHLIGHT.exec(value);
  while (m !== null) {
    if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
    out.push({
      type: 'emphasis',
      data: { hName: 'mark' },
      children: [{ type: 'text', value: m[1] }],
    });
    last = m.index + m[0].length;
    m = HIGHLIGHT.exec(value);
  }

  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

/** 코드 블록·인라인 코드는 건드리지 않는다 */
const SKIP = new Set(['code', 'inlineCode']);

function walk(node) {
  if (!node || !Array.isArray(node.children)) return;

  let changed = false;
  const next = [];

  for (const child of node.children) {
    if (child.type === 'text' && child.value.includes('==')) {
      const parts = split(child.value);
      if (parts.length > 1) { next.push(...parts); changed = true; continue; }
    }
    if (!SKIP.has(child.type)) walk(child);
    next.push(child);
  }

  if (changed) node.children = next;
}

export default function remarkHighlight() {
  return (tree) => { walk(tree); };
}
