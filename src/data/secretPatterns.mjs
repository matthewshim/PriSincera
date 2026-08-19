/**
 * 시크릿 탐지 패턴 — 단일 소스(SSOT).
 *
 * 소비처
 *   - admin-api.mjs : /admin/api/docs/save · /admin/api/builderslog/publish (public repo 직접 커밋)
 *   - ci/secret-scan.mjs : pre-commit · commit-msg 훅
 *
 * 배치 이유: `src/data/`는 Dockerfile이 컨테이너로 복사하는 경로다(`ci/`는 아니다).
 * 서버와 로컬 훅이 동일 패턴을 쓰려면 여기 있어야 한다.
 *
 * 전제: 이 저장소는 public이다. push된 시크릿은 force push로도 회수되지 않으므로
 * "커밋 전 차단"만이 유효한 방어다. 오탐으로 한 번 막히는 비용 < 미탐 한 번의 비용.
 */

/** 이 문자열이 포함된 줄은 검사에서 제외한다 (패턴 자체를 논하는 문서·테스트용). */
export const IGNORE_MARKER = 'secret-scan:ignore';

export const SECRET_PATTERNS = [
  { name: 'Google/Firebase API Key', re: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'GitHub PAT (classic)', re: /gh[pousr]_[A-Za-z0-9]{36}/ },
  { name: 'GitHub PAT (fine-grained)', re: /github_pat_[A-Za-z0-9_]{50,}/ },
  { name: 'Slack Token', re: /xox[baprs]-[A-Za-z0-9-]{10,48}/ },
  { name: 'AWS Access Key ID', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Private Key Block', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'GCP Service Account JSON', re: /"type"\s*:\s*"service_account"/ },
  { name: '증권 종합계좌번호 (8-2)', re: /\b\d{8}-\d{2}\b/ }, // i18n-ok: 개발자용 진단 라벨(터미널·서버 로그) — UI 미노출

  // 접두어가 없는 시크릿(한투 APP_KEY/APP_SECRET, SMTP_PASS, UNSUBSCRIBE_SECRET 등)은
  // 값만으로 식별이 불가능하다. "키 이름 = 긴 문자열" 대입 형태를 대신 잡는다.
  // 한계: 산문 속에 값만 덜렁 붙여넣으면 통과한다 → 경로 제한(10-6)이 구조적 보완.
  {
    name: '시크릿 대입 (키 이름 = 긴 값)', // i18n-ok: 개발자용 진단 라벨(터미널·서버 로그) — UI 미노출
    re: /(?:APP_?KEY|APP_?SECRET|API_?KEY|API_?SECRET|ACCESS_?TOKEN|AUTH_?TOKEN|CLIENT_?SECRET|PRIVATE_?KEY|PASSWORD|PASSWD|SMTP_PASS|UNSUBSCRIBE_SECRET|KIS_[A-Z_]+)["'`\s]*[:=]\s*["'`]?[A-Za-z0-9+/=_\-]{20,}/i,
  },
];

/**
 * 바이트 버퍼를 UTF-8 / UTF-16LE 양쪽으로 해석해 반환한다.
 *
 * 실측 근거: 이 저장소의 `.env`가 187바이트 중 NUL 25바이트를 포함하는 혼합 인코딩이었다.
 * UTF-8로만 읽는 스캐너는 UTF-16 영역의 시크릿을 **아예 보지 못한다**(패턴 매칭 자체가 안 됨).
 */
export function decodeCandidates(buf) {
  const out = [buf.toString('utf8')];
  if (buf.includes(0)) out.push(buf.toString('utf16le'));
  return out;
}

/**
 * 텍스트에서 시크릿 패턴을 찾는다.
 * @returns {{pattern: string, line: number, excerpt: string}[]} 탐지 목록 (값 자체는 반환하지 않음)
 */
export function scanText(text) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(IGNORE_MARKER)) continue;
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(line)) {
        hits.push({
          pattern: name,
          line: i + 1,
          // 값이 로그·터미널에 남지 않도록 마스킹해서 위치만 알린다.
          excerpt: line.trim().slice(0, 24).replace(/[A-Za-z0-9+/=_-]{8,}/g, '<redacted>'),
        });
        break; // 한 줄당 1건이면 충분 — 위치 특정이 목적
      }
    }
  }
  return hits;
}

/** 버퍼를 인코딩 양쪽으로 해석해 스캔한다. */
export function scanBuffer(buf) {
  const seen = new Set();
  const hits = [];
  for (const text of decodeCandidates(buf)) {
    for (const h of scanText(text)) {
      const key = `${h.pattern}:${h.line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(h);
    }
  }
  return hits;
}
