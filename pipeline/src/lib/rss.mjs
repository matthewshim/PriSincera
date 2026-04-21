/**
 * RSS Feed Parser — 다중 소스 RSS 피드를 병렬로 가져와 파싱합니다.
 */
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'PriSignal/1.0 (https://www.prisincera.com)' },
  customFields: { item: [['dc:creator', 'creator'], ['content:encoded', 'contentEncoded']] },
});

/**
 * 단일 RSS 피드를 가져와 정규화된 아티클 배열을 반환합니다.
 * @param {Object} source - sources.json의 소스 객체
 * @returns {Promise<Array>} 정규화된 아티클 배열
 */
export async function fetchFeed(source, maxPerSource = 5) {
  try {
    const feed = await parser.parseURL(source.rss);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return (feed.items || [])
      .filter(item => {
        if (!item.link) return false;
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        // 날짜 정보가 없으면 포함 (최신으로 간주)
        return !pubDate || pubDate >= oneDayAgo;
      })
      .slice(0, maxPerSource) // 소스당 최대 N개만 수집 (최신순)
      .map(item => ({
        id: hashUrl(item.link),
        title: (item.title || '').trim(),
        url: item.link.trim(),
        summary: cleanSummary(item.contentSnippet || item.content || item.contentEncoded || ''),
        source: source.name,
        category: source.category,
        tier: source.tier,
        lang: source.lang,
        publishedAt: item.pubDate || now.toISOString(),
        collectedAt: now.toISOString(),
      }));
  } catch (err) {
    console.warn(`[RSS] ⚠ ${source.name} 수집 실패: ${err.message}`);
    return [];
  }
}

/**
 * 모든 활성 소스에서 병렬로 RSS 피드를 수집합니다.
 * @param {Array} sources - sources.json의 소스 배열
 * @returns {Promise<Array>} 전체 수집된 아티클 배열
 */
export async function fetchAllFeeds(sources) {
  const activeSources = sources.filter(s => s.active);
  console.log(`[RSS] ${activeSources.length}개 소스에서 수집 시작...`);

  const results = await Promise.allSettled(
    activeSources.map(source => fetchFeed(source))
  );

  const articles = [];
  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`[RSS] 수집 완료: 성공 ${successCount}, 실패 ${failCount}, 아티클 ${articles.length}개`);
  return articles;
}

/**
 * 기존 후보 풀과 비교하여 중복을 제거합니다.
 */
export function deduplicateArticles(newArticles, existingArticles = []) {
  const existingIds = new Set(existingArticles.map(a => a.id));
  const deduped = newArticles.filter(a => !existingIds.has(a.id));
  console.log(`[RSS] 중복 제거: ${newArticles.length} → ${deduped.length}개 (${newArticles.length - deduped.length}개 제외)`);
  return deduped;
}

/** URL을 해시하여 고유 ID를 생성합니다. */
function hashUrl(url) {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'art_' + Math.abs(hash).toString(36);
}

/** HTML 태그 제거 및 요약 정리 (최대 500자) */
function cleanSummary(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}
