# 🧭 One Source of Truth (SSOT): Unifying Scattered Page Titles & Meta Across Categories

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-14 | Antigravity | Defined the record of unifying page titles/meta into a single source of truth (SSOT) and applying a hero-based brand OG | server.mjs, useSEO.js, shared seoMeta module |

---

## 1. 💡 Intro: Same Page, Different Title

PriSincera is a React/Vite SPA. Two paths coexist for metadata: the **server injects meta tags into the initial HTML (SSR)** for search/social crawlers, while a **client hook updates the tab title and meta in the browser (CSR)**.

The problem was that these two knew nothing about each other and were **each producing their own title strings**. As a result, the very same `/daily` and `/pacenote` pages suffered **"drift" — the title a crawler sees differed from the title in the browser tab.**

Notation was inconsistent too. Some pages used `| PriSincera`, some `— PriSincera`, the real-time interpretation app (Sylphio) pages had **no brand suffix at all**, and detail pages sometimes had a **duplicated** suffix. The goal was clear — **unify every category under one standard while preserving each category's SEO keywords.**

---

## 2. 🔍 The Inconsistencies We Found

### [Issue 1] Drift born from a dual source
* **Finding**: SSR (`server.mjs`) and CSR (the client SEO hook) were each **hardcoding their own titles/descriptions**.
* **Blind spot**: Without a Single Source of Truth, fixing one side left the other stale → crawler view and user tab diverge.

### [Issue 2] Mixed brand suffixes & separators
* Both `|` and `—` were used as the brand separator, and suffix presence varied per page.
* Detail articles even carried a **double** suffix like `{title} | Builder's Log | PriSincera`.

### [Issue 3] One product skipped the client hook entirely
* Most pages refreshed tab title and canonical via the shared hook, but the **three Sylphio pages didn't use it**, so meta updates broke on SPA navigation.

### [Issue 4] A split social card (og:image)
* The server and client **default OG fallbacks pointed to different files**, and even that was a **leftover representative image from a legacy service era**, out of sync with the brand.

---

## 3. 🛠️ The Solution: Converging on a Single Source of Truth

### 1) A route → meta shared module
We defined each category's title, description, and keywords **in one place**, and made **both the server SSR and the client hook consume the same module** — structurally eliminating drift.

```javascript
// Shared SSOT module (consumed by both server and client)
export const SITE = 'PriSincera';

// Brand suffix: home is the exception, otherwise `{title} | PriSincera`
export function brandTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${SITE}` : HOME_TITLE;
}

// route → meta resolver (static match + dynamic override)
export function resolveMeta(pathname, opts = {}) {
  const base = opts.override || PAGE_META[matchStaticPath(pathname)] || PAGE_META['/'];
  return {
    title: brandTitle(base.pageTitle),
    description: base.description,
    keywords: base.keywords || DEFAULT_KEYWORDS,
    ogImage: base.ogImage || DEFAULT_OG_IMAGE,
    canonical: opts.canonical || `${BASE_URL}${cleanPath(pathname)}`,
  };
}
```

### 2) A standardized title format
We unified on `{keyword-rich page name — tagline} | PriSincera` (home excepted). Placing **keywords up front (SEO)** while **restoring the brand suffix (consistency)** catches both birds. e.g., `Sylphio — macOS Real-time AI Interpretation & Minutes | PriSincera`.

### 3) Emitting canonical/keywords and de-duplicating tags
We **always emit a self-referencing canonical**, and **remove duplicate og/twitter/keywords tags left in the static HTML just before injection (dedupe)**, so crawlers read a single, unambiguous signal.

### 4) The placement trap (an engineering lesson)
The most valuable lesson came from a mundane place. A **shared module imported by both server and client** must live at a path **actually included in the build/runtime container** — otherwise the server crashes at runtime. We re-learned, at deploy time, the obvious truth that *"shared" presupposes "reachable from both runtimes."*

---

## 4. 🌐 Multilingual SEO: hreflang & og:locale

With meta unified, we tidied multilingual discoverability too. Every page's SSR now emits **`ko`/`en`/`ja` + `x-default` hreflang alternates** and **`og:locale`/`og:locale:alternate`**.

```javascript
// hreflang alternates (SSR)
export function hreflangLinks(canonical) {
  const lines = LOCALES.map(
    (loc) => `<link rel="alternate" hreflang="${loc}" href="${canonical}?lang=${loc}">`
  );
  lines.push(`<link rel="alternate" hreflang="x-default" href="${canonical}">`);
  return lines.join('\n    ');
}
```

Since every language variant emits the **same hreflang set**, the reciprocal-reference requirement is satisfied.

---

## 5. 🎨 The Social Card: Turning the Hero into an OG

The last piece was the face — the social share card (OG image). With no separate design asset on hand, we **programmatically generated a 1200×630 OG card** from the main hero's **"Star Prism Identity"** (a glass hexagram prism, a gold accent triangle, an orbit ring, a dark starfield with a warm gold ambient glow).

* **How**: Rendered at 2× supersample and downscaled (LANCZOS) via an image library, keeping edges and type crisp.
* **Applied commonly**: We replaced the legacy image and unified on a **single fallback** — so sharing any page surfaces the **same brand identity** as its card.

---

## 6. 📈 Results & Insights

This overhaul earned PriSincera:

1. **No more drift**: The title a crawler reads equals the browser tab title. A single source eliminates the divergence at the root.
2. **SEO and branding together**: Keywords up front plus a brand suffix secures both search visibility and brand recall.
3. **Multilingual discoverability**: hreflang and og:locale give language-specific crawlers friendly signals.
4. **A consistent face**: Share any link and the same prism card appears, gathering a once-scattered brand experience into one.

> We re-learned that good SEO isn't a flashy trick, but **the discipline of reflecting one truth accurately across many surfaces.**
