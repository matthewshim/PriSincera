/**
 * Daily Digest HTML 이메일 템플릿 엔진
 *
 * 기존 prisignal-email-template.html + prisignal-email-preview.html의
 * 디자인을 프로그래매틱으로 구현. Buttondown {{ body }} 제약 없이
 * 아티클별 개별 카드를 생성합니다.
 *
 * 사용:
 *   import { renderDailyEmail } from './email-template.mjs';
 *   const html = renderDailyEmail({ date, articles, totalCount, dailyPageUrl, unsubscribeUrl });
 */

const CATEGORY_ICONS = {
  attitude: '🎯',
  priority: '⚡',
  ai: '🤖',
  global: '🌍',
  product: '📦',
};

const CATEGORY_NAMES = {
  attitude: 'Attitude',
  priority: 'Priority',
  ai: 'AI & Future',
  global: 'Global Lens',
  product: 'Product Craft',
};

const CATEGORY_COLORS = {
  attitude: '#C084FC',
  priority: '#7C3AED',
  ai: '#22D3EE',
  global: '#FDE68A',
  product: '#F0ABFC',
};

// ─── Helper ─────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDateKR(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return `${Number(m)}월 ${Number(d)}일 (${days[dt.getDay()]})`;
}

// ─── Card Renderers ─────────────────────────────

/**
 * DM Pick 아티클 카드 (프리미엄 디자인)
 */
function renderDmPickCard(article, index) {
  const icon = CATEGORY_ICONS[article.category] || '📌';
  const catName = CATEGORY_NAMES[article.category] || article.category;
  const catColor = CATEGORY_COLORS[article.category] || '#C084FC';
  const score = article.weightedScore ? article.weightedScore.toFixed(1) : '';
  const tierBadge = article.tier === 1 ? ' 🌟' : '';

  let commentHtml = '';
  if (article.editorComment) {
    commentHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
           style="margin:12px 0 16px;">
      <tr>
        <td style="border-left:3px solid #7C3AED; background:rgba(124,58,237,0.06); padding:10px 14px; border-radius:0 8px 8px 0;">
          <p style="margin:0; font-family:'Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; line-height:1.6; font-style:italic;">
            💬 ${escapeHtml(article.editorComment)}
          </p>
        </td>
      </tr>
    </table>`;
  }

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
       style="margin-bottom:16px; background-color:#111111; border:1px solid rgba(255,255,255,0.05); border-top:1px solid rgba(255,255,255,0.1); border-radius:16px;">
  <tr>
    <td style="padding:20px 22px;">
      <!-- Meta row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding-bottom:10px;">
            <span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:600; color:${catColor}; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.25); border-radius:100px; padding:3px 12px; letter-spacing:0.02em;">
              ${icon} DM Pick · ${escapeHtml(catName)}
            </span>
            <span style="font-family:'Inter',-apple-system,sans-serif; font-size:12px; color:#71717A; margin-left:8px;">
              ★ ${score}${tierBadge} · ${escapeHtml(article.source)}
            </span>
          </td>
        </tr>
      </table>
      <!-- Title -->
      <p style="margin:0 0 8px; font-family:'Pretendard',-apple-system,sans-serif; font-size:16px; font-weight:700; color:#FFFFFF; line-height:1.5;">
        ${index + 1}. ${escapeHtml(article.title)}
      </p>
      <!-- Summary -->
      <p style="margin:0 0 4px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#FAFAFA; line-height:1.7;">
        ${escapeHtml(article.summary || '')}
      </p>
      ${commentHtml}
      <!-- CTA Button -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#7C3AED"
              style="background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:100px; padding:8px 22px;">
            <a href="${escapeHtml(article.url)}"
               style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
              → 원문 읽기
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/**
 * More Signals — 카테고리별 그룹
 */
function renderMoreSignals(articles, dailyPageUrl) {
  const otherArticles = articles.filter(a => !a.isDmPick);
  if (otherArticles.length === 0) return '';
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
       style="margin-top:8px;">
  <tr>
    <td style="padding: 24px; background: rgba(196,181,253,0.05); border: 1px solid rgba(196,181,253,0.1); border-radius: 12px; text-align: center;">
      <p style="margin:0 0 12px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:16px; font-weight:700; color:#C084FC; line-height:1.3;">
        ✨ 더 많은 시그널이 기다리고 있어요!
      </p>
      <p style="margin:0 0 20px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#A1A1AA; line-height:1.5;">
        이 외에도 ${otherArticles.length}개의 유익한 IT Tech Signal 아티클이 준비되어 있습니다. 전체 리스트와 상세 인사이트를 웹에서 바로 확인해 보세요.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td bgcolor="#7C3AED" style="background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:100px; padding:10px 24px;">
            <a href="${escapeHtml(dailyPageUrl)}" style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
              → 더 많은 시그널 보러가기
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/**
 * 데일리 포털 CTA 블록
 */
function renderPortalCTA(dailyPageUrl) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
       style="margin-top:24px;">
  <tr>
    <td align="center" bgcolor="#111111"
        style="background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.15); border-radius:16px; padding:24px;">
      <p style="margin:0 0 14px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#A1A1AA;">
        📡 오늘의 전체 시그널을 확인하세요
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#7C3AED"
              style="background:linear-gradient(135deg,#7C3AED,#A855F7,#C084FC); border-radius:100px; padding:13px 36px;">
            <a href="${escapeHtml(dailyPageUrl)}"
               style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:14px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
              데일리 포털에서 확인하기 →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/**
 * Daily Digest 오늘의 1문장 섹션
 */
function renderStudySection(studyData, date) {
  if (!studyData) return '';

  let html = `
<!-- ═══ PRISTUDY ═══ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding: 24px 32px 24px;">
      <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.25), transparent);"></div>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 24px;">
      <p style="margin:0 0 16px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:17px; font-weight:700; color:#10B981; line-height:1.3;">
        🚀 Skill Up 1-Pick
      </p>
  `;

  // AI 프롬프트 1-Pick
  if (studyData.prompt_snippet) {
    html += `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="background-color:#111111; border:1px solid rgba(34, 211, 238, 0.15); border-radius:16px; margin-bottom: 16px;">
        <tr>
          <td style="padding:20px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:12px;">
                  <span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:600; color:#22D3EE; background:rgba(34, 211, 238, 0.12); border:1px solid rgba(34, 211, 238, 0.25); border-radius:100px; padding:3px 12px; letter-spacing:0.02em;">
                    🤖 AI 프롬프트 1-Pick
                  </span>
                  <span style="font-family:'Inter',-apple-system,sans-serif; font-size:12px; color:#71717A; margin-left:8px;">
                    실무 활용 스니펫
                  </span>
                </td>
              </tr>
            </table>
            <div style="margin:0 0 12px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#FAFAFA; line-height:1.6; padding: 12px; background: rgba(34, 211, 238, 0.05); border: 1px solid rgba(34,211,238,0.1); border-radius: 8px;">
              ${escapeHtml(studyData.prompt_snippet).replace(/\\n/g, '<br>')}
            </div>
            <p style="margin:0; font-family:'Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; line-height:1.6;">
              ${escapeHtml(studyData.explanation || '')}
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  // 비즈니스 일본어 1-Pick
  if (studyData.sentence_jp) {
    html += `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="background-color:#111111; border:1px solid rgba(16,185,129,0.15); border-radius:16px;">
        <tr>
          <td style="padding:20px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:12px;">
                  <span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:600; color:#10B981; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25); border-radius:100px; padding:3px 12px; letter-spacing:0.02em;">
                    🇯🇵 비즈니스 일본어 1-Pick
                  </span>
                  <span style="font-family:'Inter',-apple-system,sans-serif; font-size:12px; color:#71717A; margin-left:8px;">
                    ${escapeHtml(studyData.theme || '오늘의 표현')}
                  </span>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px; font-family:'Pretendard',-apple-system,sans-serif; font-size:17px; font-weight:700; color:#FFFFFF; line-height:1.5;">
              ${escapeHtml(studyData.sentence_jp)}
            </p>
            <p style="margin:0 0 16px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#A1A1AA; line-height:1.6;">
              ${escapeHtml(studyData.sentence_kr)}
            </p>
          </td>
        </tr>
      </table>
    `;
  }

  html += `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
        <tr>
          <td bgcolor="#8B5CF6"
              style="background:linear-gradient(135deg,#8B5CF6,#6D28D9); border-radius:100px; padding:8px 22px;">
            <a href="https://www.prisincera.com/relearn"
               style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
              → 나만의 궤도 기록하기 (Pace Note)
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return html;
}

// ─── Pace Note Section Renderer ─────────────────
function renderPaceNoteSection(paceNotes) {
  if (!paceNotes || paceNotes.length === 0) return '';

  const getPaceCategoryMeta = (category) => {
    const metas = {
      'Mindset': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '🎯' },
      'Health & Wellness': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '🌿' },
      'Branding': { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', icon: '✨' },
      'Networking': { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', icon: '🤝' },
      'Deep Work': { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', icon: '⚡' },
      'Productivity': { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', icon: '📈' },
      'AI & Future': { color: '#22D3EE', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)', icon: '🤖' },
    };
    return metas[category] || { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', icon: '💫' };
  };

  const itemsHtml = paceNotes.map((item, idx) => {
    const cat = getPaceCategoryMeta(item.category);
    const titleText = typeof item.title === 'object' ? (item.title.ko || item.title.en || '') : item.title;
    return `
      <!-- Pace Note Item ${idx + 1} -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:12px; background-color:#111111; border:1px solid rgba(255,255,255,0.05); border-left:3px solid ${cat.color}; border-radius:8px;">
        <tr>
          <td style="padding:16px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:6px;">
                  <span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:600; color:${cat.color}; background:${cat.bg}; border:1px solid ${cat.border}; border-radius:100px; padding:2px 10px; letter-spacing:0.02em;">
                    ${cat.icon} ${escapeHtml(item.category)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="margin:0; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; font-weight:600; color:#FAFAFA; line-height:1.5;">
                    ${escapeHtml(titleText)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
  }).join('');

  return `
<!-- ═══ PACENOTE SECTION ═══ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding: 12px 32px 24px;">
      <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(96,165,250,0.25), transparent);"></div>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 24px;">
      <p style="margin:0 0 4px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:17px; font-weight:700; color:#60A5FA; line-height:1.3;">
        🎯 오늘의 Pace Note 추천
      </p>
      <p style="margin:0 0 16px; font-family:'Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; line-height:1.4;">
        타인의 속도에 휩쓸리지 않고, 오직 자신만의 속도로 성장하는 일일 미션
      </p>
      
      ${itemsHtml}
      
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px; margin-bottom: 8px;">
        <tr>
          <td bgcolor="#4F46E5"
              style="background:linear-gradient(135deg,#4F46E5,#6D28D9); border-radius:100px; padding:8px 22px;">
            <a href="https://www.prisincera.com/relearn"
               style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
              → 페이스노트 캘린더에서 기록하기
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ─── Builder's Log Section Renderer ─────────────
function renderBuilderLogSection(latestBuilderLog) {
  if (!latestBuilderLog) return '';

  const titleText = typeof latestBuilderLog.title === 'object' ? (latestBuilderLog.title.ko || latestBuilderLog.title.en || '') : latestBuilderLog.title;
  const subtitleText = typeof latestBuilderLog.subtitle === 'object' ? (latestBuilderLog.subtitle.ko || latestBuilderLog.subtitle.en || '') : latestBuilderLog.subtitle;
  const descText = typeof latestBuilderLog.description === 'object' ? (latestBuilderLog.description.ko || latestBuilderLog.description.en || '') : latestBuilderLog.description;

  // NEW 배지 연산 (KST 기준 7일 이내)
  let isNew = false;
  try {
    const logDate = new Date(latestBuilderLog.date + 'T00:00:00+09:00');
    const now = new Date();
    const diffTime = Math.abs(now - logDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    isNew = diffDays <= 7;
  } catch (e) {
    // 날짜 파싱 실패 시 무시
  }

  const newBadgeHtml = isNew 
    ? `<span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:700; color:#FFFFFF; background:linear-gradient(135deg,#EC4899,#F43F5E); border-radius:4px; padding:2px 8px; margin-left:8px; vertical-align:middle; letter-spacing:0.05em;">NEW</span>`
    : '';

  // 태그 렌더링
  let tagsHtml = '';
  if (latestBuilderLog.tags && latestBuilderLog.tags.length > 0) {
    tagsHtml = `<div style="margin: 12px 0 16px;">` +
      latestBuilderLog.tags.map(tag => `
        <span style="display:inline-block; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:11px; color:#A1A1AA; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:2px 8px; margin-right:6px; margin-bottom:4px;">
          #${escapeHtml(tag)}
        </span>
      `).join('') + `</div>`;
  }

  // 커밋 로그 터미널 모사
  let commitListHtml = '';
  if (latestBuilderLog.commits && latestBuilderLog.commits.length > 0) {
    commitListHtml = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin:14px 0 16px; padding:12px; background-color:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.03); border-radius:8px;">
        <tr>
          <td>
            <p style="margin:0 0 6px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:11px; font-weight:600; color:#71717A; text-transform:uppercase; letter-spacing:0.05em;">
              📦 Git Shipments
            </p>` +
            latestBuilderLog.commits.map(c => `
              <div style="font-family:'JetBrains Mono','Courier New',monospace; font-size:12px; color:#A1A1AA; line-height:1.5; margin-bottom:4px; word-break:break-all;">
                <span style="color:#A78BFA; font-weight:bold;">[${escapeHtml(c.type)}]</span>
                <span style="color:#71717A;">${escapeHtml(c.hash)}</span> ${escapeHtml(c.msg)}
              </div>
            `).join('') + `
          </td>
        </tr>
      </table>`;
  }

  return `
<!-- ═══ BUILDERS LOG SECTION ═══ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding: 24px 32px 24px;">
      <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(236,72,153,0.25), transparent);"></div>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 24px;">
      <p style="margin:0 0 4px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:17px; font-weight:700; color:#FBCFE8; line-height:1.3;">
        🛠️ Builder's Log (최근 빌드 로그)
      </p>
      <p style="margin:0 0 16px; font-family:'Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; line-height:1.4;">
        서비스 가치를 위해 메이커들이 매일 밤하늘에 수놓은 제품 개발 진척 상황
      </p>
      
      <!-- Builder's Log Card -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="background-color:#111111; border:1px solid rgba(255,255,255,0.05); border-top:1px solid rgba(255,255,255,0.1); border-radius:16px;">
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:10px;">
                  <span style="display:inline-block; font-family:'Inter',-apple-system,sans-serif; font-size:11px; font-weight:600; color:#A78BFA; background:rgba(167,139,250,0.1); border:1px solid rgba(167,139,250,0.2); border-radius:100px; padding:3px 12px; letter-spacing:0.02em; vertical-align:middle;">
                    🚀 Ch. ${escapeHtml(latestBuilderLog.chapterNo)}
                  </span>
                  ${newBadgeHtml}
                  <span style="font-family:'Inter',-apple-system,sans-serif; font-size:12px; color:#71717A; margin-left:8px; vertical-align:middle;">
                    ${escapeHtml(latestBuilderLog.date)}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <h3 style="margin:0 0 6px; font-family:'Pretendard',-apple-system,sans-serif; font-size:16px; font-weight:700; color:#FFFFFF; line-height:1.4;">
                    ${escapeHtml(titleText)}
                  </h3>
                  <p style="margin:0 0 12px; font-family:'Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; line-height:1.5;">
                    ${escapeHtml(subtitleText)}
                  </p>
                  <p style="margin:0; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#E4E4E7; line-height:1.6;">
                    ${escapeHtml(descText)}
                  </p>
                  
                  ${tagsHtml}
                  ${commitListHtml}
                  
                  <!-- Read Button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
                    <tr>
                      <td bgcolor="#7C3AED"
                          style="background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:100px; padding:8px 22px;">
                        <a href="https://www.prisincera.com/builderslog/${escapeHtml(latestBuilderLog.slug)}"
                           style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FFFFFF; text-decoration:none; display:inline-block;">
                          → 제작기 읽기
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ─── Main Render ─────────────────────────────────

/**
 * Daily Digest Daily 이메일 HTML을 렌더링합니다.
 *
 * @param {Object} params
 * @param {string} params.date - "2026-04-29" 형식
 * @param {Array}  params.articles - 전체 아티클 (isDmPick 플래그 포함)
 * @param {number} params.totalCount - 전체 아티클 수
 * @param {string} params.dailyPageUrl - 데일리 포털 URL
 * @param {string} params.unsubscribeUrl - 구독 해지 URL (개인화)
 * @param {Object} [params.studyData] - Daily Digest 오늘의 1문장 데이터
 * @param {Array}  [params.paceNotes] - 오늘의 Pace Note 추천 배열
 * @param {Object} [params.latestBuilderLog] - 최신 빌더스 로그 메타데이터 객체
 * @returns {string} 완전한 HTML 이메일 문자열
 */
export function renderDailyEmail({ date, articles, totalCount, dailyPageUrl, unsubscribeUrl, studyData, paceNotes, latestBuilderLog }) {
  const dateKR = formatDateKR(date);
  const dmPicks = articles.filter(a => a.isDmPick);
  const otherArticles = articles.filter(a => !a.isDmPick);
  const categoryCount = new Set(articles.map(a => a.category)).size;

  // DM Pick 카드
  const dmPickCards = dmPicks.map((a, i) => renderDmPickCard(a, i)).join('');

  // More Signals
  const moreSignalsHtml = renderMoreSignals(articles, dailyPageUrl);

  // Daily Digest Section
  const studyHtml = renderStudySection(studyData, date);

  // Pace Note Section
  const paceNotesHtml = renderPaceNoteSection(paceNotes);

  // Builder's Log Section
  const builderLogHtml = renderBuilderLogSection(latestBuilderLog);

  // Portal CTA
  const portalCTA = renderPortalCTA(dailyPageUrl);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <!--
    ═══════════════════════════════════════════════════════════
    Daily Digest — Cloud Run 자체 발송 이메일 템플릿
    ═══════════════════════════════════════════════════════════
  -->
  <style>
    /* Reset */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0; outline: none; text-decoration: none;
    }
    body {
      margin: 0; padding: 0;
      width: 100% !important; height: 100% !important;
    }
    /* Dark Mode Override */
    @media (prefers-color-scheme: light) {
      .email-body-outer { background-color: #050505 !important; }
      .email-container { background-color: transparent !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#050505; font-family:'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         class="email-body-outer"
         style="background-color:#050505;">
    <tr>
      <td align="center" style="padding: 0;">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
               class="email-container"
               style="max-width:600px; width:100%;">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td align="center" style="padding: 48px 24px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <span style="font-size:32px; line-height:1;">✨</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:28px; font-weight:700; color:#FFFFFF; letter-spacing:-0.02em;">
                      Pri<span style="color:#C084FC;">Sincera</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <p style="margin:0; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; color:#71717A; line-height:1.5; letter-spacing:0.02em;">
                      Daily Insights & Study
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Date + Stats -->
          <tr>
            <td align="center" style="padding: 0 24px 12px;">
              <p style="margin:0 0 20px; font-family:'Pretendard',-apple-system,sans-serif; font-size:14px; color:#A1A1AA; text-align:center;">
                ${dateKR}, 오늘 하루 성장을 위한 시그널과 배움을 전해드립니다.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-top:1px solid rgba(255,255,255,0.1); border-radius:12px;">
                <tr>
                  <td style="padding:14px 20px; text-align:center;">
                    <span style="font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#FAFAFA;">
                      📊 전체 ${totalCount}건
                    </span>
                  </td>
                  <td style="padding:14px 0; width:1px;">
                    <div style="width:1px; height:16px; background:rgba(196,181,253,0.15);"></div>
                  </td>
                  <td style="padding:14px 20px; text-align:center;">
                    <span style="font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#22D3EE;">
                      ⭐ DM Pick ${dmPicks.length}
                    </span>
                  </td>
                  <td style="padding:14px 0; width:1px;">
                    <div style="width:1px; height:16px; background:rgba(196,181,253,0.15);"></div>
                  </td>
                  <td style="padding:14px 20px; text-align:center;">
                    <span style="font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:600; color:#C084FC;">
                      📂 카테고리 ${categoryCount}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gradient divider -->
          <tr>
            <td style="padding: 8px 32px 24px;">
              <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent);"></div>
            </td>
          </tr>

          <!-- ═══ DM PICK SECTION ═══ -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin:0 0 16px; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:17px; font-weight:700; color:#22D3EE; line-height:1.3;">
                📰 IT Tech Signal
              </p>
              ${dmPickCards}
            </td>
          </tr>

          <!-- Divider between DM picks and More Signals -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height:1px; margin:8px 0 24px; background:linear-gradient(90deg, transparent, rgba(196,181,253,0.15), transparent);"></div>
            </td>
          </tr>

          <!-- ═══ MORE SIGNALS ═══ -->
          <tr>
            <td style="padding: 0 24px;">
              ${moreSignalsHtml}
            </td>
          </tr>

          <tr>
            <td style="padding: 0;">
              ${studyHtml}
            </td>
          </tr>

          ${paceNotesHtml ? `
          <tr>
            <td style="padding: 0;">
              ${paceNotesHtml}
            </td>
          </tr>` : ''}

          ${builderLogHtml ? `
          <tr>
            <td style="padding: 0;">
              ${builderLogHtml}
            </td>
          </tr>` : ''}

          <!-- ═══ PORTAL CTA ═══ -->
          <tr>
            <td style="padding: 0 24px 12px;">
              ${portalCTA}
            </td>
          </tr>

          <!-- Gradient divider -->
          <tr>
            <td style="padding: 12px 32px 0;">
              <div style="height:1px; background: linear-gradient(90deg, transparent, rgba(196,181,253,0.1), transparent);"></div>
            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding: 32px 24px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <!-- Visit Site -->
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="https://www.prisincera.com"
                       style="font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:13px; color:#A1A1AA; text-decoration:none;">
                      ✦ prisincera.com
                    </a>
                  </td>
                </tr>
                <!-- Tagline -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin:0; font-size:12px; color:#71717A; line-height:1.6;">
                      20년차 PO의 기준으로 설계된 AI 큐레이션 뉴스레터
                    </p>
                  </td>
                </tr>
                <!-- Unsubscribe -->
                <tr>
                  <td align="center">
                    <p style="margin:0; font-size:11px; color:#4A3D6E;">
                      더 이상 받고 싶지 않으시면
                      <a href="${escapeHtml(unsubscribeUrl)}"
                         style="color:#71717A; text-decoration:underline;">구독을 해지</a>할 수 있습니다.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ Brand Footer ═══ -->
          <tr>
            <td align="center" style="padding: 8px 24px 40px;">
              <p style="margin:0; font-family:'Inter','Pretendard',-apple-system,sans-serif; font-size:11px; color:#4A3D6E; letter-spacing:0.05em;">
                © 2026 PriSincera · Sincerity, Prioritized.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Container -->

      </td>
    </tr>
  </table>
  <!-- /Wrapper -->

</body>
</html>`;
}

export { CATEGORY_ICONS, CATEGORY_NAMES, CATEGORY_COLORS, escapeHtml, formatDateKR };
