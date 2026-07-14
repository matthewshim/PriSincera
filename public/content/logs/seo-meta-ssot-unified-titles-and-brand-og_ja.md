# 🧭 唯一の真実(SSOT)：カテゴリごとにばらついたページタイトル・メタの統一記

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-14 | Antigravity | ページタイトル・メタを単一の真実(SSOT)へ統一し、ヒーローベースのブランドOGを適用した記録を定義 | server.mjs, useSEO.js, seoMeta 共有モジュール |

---

## 1. 💡 導入：同じページ、違うタイトル

PriSinceraはReact/ViteベースのSPAです。検索・ソーシャルクローラー向けに**サーバーが初期HTMLへメタタグを注入(SSR)**し、ブラウザでは**クライアントフックがタブタイトルとメタを更新(CSR)**する2つの経路が併存しています。

問題は、この2つが互いの存在を知らずに**それぞれ独自のタイトル文字列を生成していた**ことでした。その結果、同じ `/daily` や `/pacenote` ページで**クローラーが見るタイトルとブラウザタブのタイトルが食い違う「ドリフト」**が発生していました。

表記ルールもばらばらでした。あるページは `| PriSincera`、あるページは `— PriSincera`、リアルタイム通訳アプリ(Sylphio)のページには**ブランド接尾辞が全くなく**、詳細記事では接尾辞が**重複**することさえありました。目標は明確でした — **全カテゴリを1つの標準へ統一しつつ、各カテゴリのSEOキーワードはそのまま活かす。**

---

## 2. 🔍 見つかった不一致

### [不一致 1] 二重ソースが生んだドリフト
* **発見**：SSR(`server.mjs`)とCSR(クライアントSEOフック)が**それぞれタイトル/説明をハードコード**していました。
* **盲点**：単一の真実(Single Source of Truth)がないため、片方を直しても他方は古い値のまま → クローラービューとユーザータブが食い違います。

### [不一致 2] ブランド接尾辞・区切り文字の混在
* ブランド区切りに `|` と `—` が混在し、接尾辞の有無もページごとに異なっていました。
* 詳細記事では `{タイトル} | Builder's Log | PriSincera` のように接尾辞が**二重**に付くケースまでありました。

### [不一致 3] 特定プロダクトだけクライアントフック未使用
* ほとんどのページは共有フックでタブタイトル・canonicalを更新していましたが、**Sylphioの3ページだけがこのフックを使っておらず**、SPA遷移時にメタ更新が途切れていました。

### [不一致 4] ソーシャルカード(og:image)の二元化
* サーバーとクライアントの**デフォルトOG画像フォールバックが別ファイル**を指しており、しかもそれは**レガシーサービス時代の代表画像**が残ったもので、ブランドと乖離していました。

---

## 3. 🛠️ 解決策：単一の真実(SSOT)への収束

### 1) route → meta 共有モジュール
カテゴリごとのタイトル・説明・キーワードを**一箇所に定義**し、**サーバーSSRとクライアントフックが同じモジュールを消費**するようにしました。これでドリフトを構造的に遮断します。

```javascript
// 共有SSOTモジュール（サーバー・クライアント共通消費）
export const SITE = 'PriSincera';

// ブランド接尾辞：ホームのみ例外、それ以外は `{タイトル} | PriSincera`
export function brandTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${SITE}` : HOME_TITLE;
}

// route → メタリゾルバ（静的マッチ + 動的override）
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

### 2) 標準タイトルフォーマット
`{キーワード型ページ名 — タグライン} | PriSincera`（ホームは例外）に統一しました。**キーワードを前方に配置(SEO)**しつつ**ブランド接尾辞を復元(一貫性)**することで、二兎を得ます。例：`Sylphio — macOS リアルタイムAI通訳・議事録 | PriSincera`。

### 3) canonical・keywordsの出力と重複タグの整理
自己参照の**canonicalを常に出力**し、静的HTMLに残って**重複していたog/twitter/keywordsタグを注入直前に除去(dedupe)**して、クローラーが単一の明確なシグナルだけを読むようにしました。

### 4) 配置場所の罠（エンジニアリングの教訓）
最も価値ある教訓は地味な場所から来ました。サーバーとクライアントが**共にインポートする共有モジュール**は、**ビルド成果物コンテナに実際に含まれるパス**へ置かないと、ランタイムでクラッシュします。*「共有」の前提は「両方のランタイムから到達可能」* という当たり前の事実を、デプロイ段階で再確認しました。

---

## 4. 🌐 多言語SEO：hreflang & og:locale

メタが統一できたので、多言語の発見性(discoverability)も整えました。全ページのSSRで**`ko`/`en`/`ja` + `x-default` のhreflang代替リンク**と**`og:locale`/`og:locale:alternate`**を出力します。

```javascript
// hreflang 代替リンク (SSR)
export function hreflangLinks(canonical) {
  const lines = LOCALES.map(
    (loc) => `<link rel="alternate" hreflang="${loc}" href="${canonical}?lang=${loc}">`
  );
  lines.push(`<link rel="alternate" hreflang="x-default" href="${canonical}">`);
  return lines.join('\n    ');
}
```

すべての言語バリアントが**同一のhreflangセット**を出力するため、相互(reciprocal)参照の要件を満たします。

---

## 5. 🎨 ソーシャルカード：ヒーローをOGへ

最後の仕上げは「顔」、すなわちソーシャル共有カード(OG画像)でした。別途のデザインアセットが無かったため、**メインヒーローの「Star Prism Identity」**（グラスの六芒星プリズム・ゴールドのアクセント三角形・オービットリング・ダークな星空 + 下部のゴールドアンビエント）を**1200×630のOGカードとしてプログラムで生成**しました。

* **生成方法**：画像ライブラリで2倍スーパーサンプルしてからダウンスケール(LANCZOS)し、エッジとタイポを鮮明に。
* **共通適用**：レガシー画像を差し替え、**単一フォールバック**に統一 → どのページを共有しても**同じブランドアイデンティティ**がカードとして表示されます。

---

## 6. 📈 結果とインサイト

今回の改修でPriSinceraは次を得ました：

1. **ドリフトの消滅**：クローラーが読むタイトル = ブラウザタブのタイトル。単一ソースが両者の食い違いを根本から断ちます。
2. **SEOとブランディングの両立**：キーワード前方配置 + ブランド接尾辞で、検索露出とブランド想起を同時に確保します。
3. **多言語の発見性**：hreflang・og:localeで言語別クローラーに親和的なシグナルを提供します。
4. **一貫した顔**：どのリンクを共有しても同じプリズムカードが現れ、散らばっていたブランド体験を1つに束ねます。

> 良いSEOとは派手なトリックではなく、**1つの真実を複数の表面に正確に反映する規律**だと、改めて学びました。
