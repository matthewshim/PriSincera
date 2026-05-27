# 📐 PriSincera デザインシステム (v4.0: オーラニュートラル＆セマンティックインタラクション)

## 📝 改訂履歴

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v2.0 | 2026-04-30 | Designer | プレミアムダークモード基準にデザインシステムを大規模に再設計 | CSS System |
| v2.5 | 2026-05-19 | Designer | Bento Chrono-Calendar & 3-Tab Workstation Themeの仕様定義 | DailyDigest |
| v2.6 | 2026-05-20 | Designer | PaceNote Bento Weekly Calendar & Voyage Horizonデザイントークン標準確立 | PaceNote |
| v3.0 | 2026-05-27 | AI Agent | 余白最適化(Density)および紫色背景色の漏れを完全に除去(Desaturated Chrono-Neutral)する仕様を明文化 | CSS Layout & Color System |
| v4.0 | 2026-05-27 | AI Agent | **次世代のセマンティックCTAボタン設計仕様(Semantic CTA)および世界最高水準のデザインシステム分析(Linear, Vercel, HIG)を反映** | Global Brand System & UI Refactoring |

> **"Sincerity, Prioritized."**
> 本文書は、PriSinceraウェブサイトが世界最高水準のデザイン品質を達成するための次世代デザインシステムv4.0標準ガイドラインです。 

---

## 0. 🌐 世界最高水準のデザインシステム分析および事前調査 (Preliminary Analysis)

世界中で最も洗練されたプレミアムなデザインシステムを構築したグローバルテクノロジー企業の設計哲学を調査・分析し、PriSincera v4.0の核心的な設計基盤として内在化しました。

### 0-1. Linearの「Dark-First」＆「Intentional Glow」哲学
* **Near-Black & Desaturated Base**: Linearは、完全な純粋な黒(`#000000`)の厳しいコントラストがユーザーの目に引き起こす「光学的残像(Vibration)」と疲労を防ぐため、彩度を極限まで抑え、洗練されたダークグレーの背景(`#0F0F10`)を基調としています。
* **Border Highlights & Glows**: すべての物理的領域は、1pxの極めて薄く半透明なボーダー(`rgba(255,255,255,0.05)`)で構造を形成します。インタラクション時にのみオブジェクトの縁を包み込む微細な「光の反射(Glow)」効果を適用し、静的な画面に生命力と空間の深みを与えます。
* **PriSincera v4.0への内包**: 紫色の背景の漏れを全面的に遮断し、無彩色のダークグレー透明素材(`rgba(10, 10, 10, 0.75)`, `rgba(17, 17, 17, 0.6)`)および半透明の微細なボーダーをシステム標準スキンとして確立します。

### 0-2. Vercelの「Geist」＆APCAコントラスト＆セマンティックCTA哲学
* **APCA (Advanced Perceptual Contrast Algorithm) 志向**: 人間の目が暗いテーマで明るい文字を認識する実際の視覚的厚さとトーンコントラストを精密に計算し、タイポグラフィの階層を分離します。
* **Semantic Button & Structural Ink**: 色彩(Chromatic Color)の無分別な乱用ではなく、構造的な力強さ(Structural Ink)でボタンの階層を整理します。Primaryボタンは強力なトーンコントラストで目的を誘導し、補助ボタンは背景と明確な階層で区別されます。
* **PriSincera v4.0への内包**: 散在していたアドホックなボタンカラー（緑、インディゴ、紫など）を全面的に無効化し、グローバルなセマンティックCTAボタン仕様(`.btn-primary`, `.btn-secondary`, `.btn-glow`)を宣言することで、ユーザーの認知負荷をゼロにします。

### 0-3. Apple HIG (Human Interface Guidelines)「Material & Vibrancy」
* **Materials Hierarchy**: 背景の上に配置されるカード(Surfaces)は、独自の色調ではなく、ホワイトの不透明度と極めて微細な透明ブラー効果(`backdrop-filter: blur(24px)`)の段階のみで奥行き(Depth)を形成します。これにより、下位レイヤーと上位レイヤー間の色重なりによる歪みを根本的に防止します。
* **PriSincera v4.0への内包**: 既存のカードに存在していた不規則な紫の混合スキンを完全に排除し、無彩色のホワイト透明系(`rgba(255, 255, 255, 0.02)`)および`blur(16px~24px)`の組み合わせで統一します。

---

## 1. 🎨 カラーシステム: 洗練と精緻化

**[開発理由]** テキストを長時間集中して読む必要がある`DailyDigest`の記事や`PaceNote`の週次タイムラインにおいて、背景やカードに紫色の色調が混ざっていると、色干渉現象により可読性が急激に低下します。また、ホバー時にポイントカラーが強調される視覚効果が背景色と希釈され、高級感が損なわれます。
**[v4.0設計標準]** 背景とカードの基調面は、紫色の混合を完全に排除した**純粋な無彩色(Desaturated Neutral OLED Slate)**に精製し、高貴なブランドカラーであるVioletとCyanは、ユーザーのインタラクションの瞬間にのみ「宝石のように鮮やかに」現れるように制限します。

### 1-1. ベース＆サーフェス (OLED Black & Slate)
| Token | Hex / RGBA | 用途および設計意図 |
|-------|-----------|------------------|
| `--bg-void` | `#000000` | 深く純粋なブラック (OLEDフレンドリー、没入感を最大化) |
| `--bg-deep` | `#050505` | 深い背景レイヤー |
| `--bg-surface` | `#0A0A0A` | ダークグレー基本サーフェス |
| `--bg-elevated` | `#111111` / `#171717` | フローティング要素、モーダル、強調カード専用 |
| `--glass-bg` | `rgba(17, 17, 17, 0.6)` | 標準無彩色ダークグレーガラススキン |
| `--glass-border` | `rgba(255, 255, 255, 0.04)` | 精密な1px極細構造線 |
| `--glass-border-hover`| `rgba(255, 255, 255, 0.12)` | ホバー時に活性化する精密構造線 |

### 1-2. タイポグラフィカラー (APCA & Legibility)
| Token | Hex / RGBA | 用途および期待効果 |
|-------|------------|-------------------|
| `--text-primary` | `#FAFAFA` | タイトル、主要本文 (眩しさ防止のためオフホワイトを使用) |
| `--text-secondary`| `#A1A1AA` | 補助テキスト、サブタイトル (視覚的安定性が高いニュートラルグレー) |
| `--text-muted` | `#71717A` | 非活性テキスト、補足説明 (輝度コントラスト最小基準を満たす) |

### 1-3. ブランドアクセント＆グラデーション (The "Aura")
| Token | Hex / Value | 用途 |
|-------|-------------|------|
| `--prism-violet` | `#6D28D9` | メインブランドアクセント (決定的な瞬間用) |
| `--prism-lavender`| `#A78BFA` | サブライティング効果、インタラクションフィードバック |
| `--orbit-cyan` | `#06B6D4` | 情報強調、テクノロジー(Tech)シグナル、リンク色 |
| `--gradient-brand` | `linear-gradient(135deg, #6D28D9, #A78BFA, #FBCFE8)` | **優雅なオーロラグラデーション**。主要Hero要素専用 |
| `--gradient-cta` | `linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(167, 139, 250, 0.1))` | primaryボタン専用の優雅な半透明ブランドグラデーション |

---

## 2. 🔘 セマンティックCTAボタン設計仕様 (Semantic CTA Button System)

**[開発理由]** 既存のコードでは、ボタンごとにインラインで異なる背景色調（緑、紫、インディゴ）と、異なるボーダー厚みが適用されていました。これは、ユーザーの認知行動パターン(Action Mapping)を歪め、ブランドの信頼性を低下させます。
**[v4.0設計標準]** グローバルなセマンティックCTAボタン仕様(`.btn-primary`, `.btn-secondary`, `.btn-glow`)を確立し、全面的に同じ物理法則とビジュアルトークンを継承させます。

### 2-1. CTAボタン種類別トークンおよびクラス仕様

```css
/* 1. Primary CTA (.btn-primary) - メイン実行ボタン */
.btn-primary {
  background: var(--gradient-cta);
  color: #FFFFFF;
  border: 1px solid rgba(196, 181, 253, 0.2);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-pill);
  transition: all var(--duration-fast) var(--ease-spring);
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.25), rgba(167, 139, 250, 0.18));
  border-color: rgba(196, 181, 253, 0.35);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}

/* 2. Secondary CTA (.btn-secondary) - 補助/代替ボタン */
.btn-secondary {
  background: rgba(25, 25, 25, 0.65);
  color: var(--crystal-light);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-pill);
  transition: all var(--duration-fast) var(--ease-spring);
}

.btn-secondary:hover {
  background: rgba(35, 35, 35, 0.85);
  border-color: var(--glass-border-hover);
  color: var(--text-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

/* 3. Interactive Glow CTA (.btn-glow) - リアルタイム脈動フィードバックボタン */
.btn-glow {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
  animation: activePulse 4s infinite ease-in-out;
}

@keyframes activePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
  50% { box-shadow: 0 0 15px 0 rgba(34, 211, 238, 0.15); }
}

/* 4. 共通のしっかりとした打鍵感効果 (Active Pressed State) */
.btn-primary:active,
.btn-secondary:active,
.btn-glow:active {
  transform: scale(0.97) translateY(0) !important;
  transition-duration: 70ms !important;
}
```

---

## 3. 📐 ジオメトリ＆空間システム (The 8-Point Grid & Spacing Optimization)

不規則なスペーシング(`6px, 12px, 80px`)を捨て、**厳格な4pt / 8pt Grid System**を導入します。人間の目は数学的比例から無意識的な快適さと高級感を感じます。

| Token | 値 | 用途 |
|-------|----|-------------------------------|
| `--space-xs` | `4px` | 要素間の最小間隔 (アイコンとテキスト) |
| `--space-sm` | `8px` | インライン要素間隔、小さいボタンのパディング |
| `--space-md` | `16px` | コンポーネント内部パディング (Input, Button) |
| `--space-lg` | `24px` | 基本的な大型領域内部パディング |
| `--space-xl` | `32px` | セクション内のグループ間隔 |
| `--space-2xl` | `64px` | 主要セクション間の間隔 |
| `--space-3xl` | `128px` | 大型Hero余白、ページ上下余白 |

### 3-1. 🚀 v4.0 カード＆コンテンツ間隔最適化 (Density)
従来のカードは、テキストのボリュームに対して過剰な内部余白と広いカード間の間隔があり、画面が空っぽに見えたり散漫に見えるという欠点がありました。v4.0では、最適な情報密度を確保するために以下のように規格化します。

* **カード内部余白 (Card Padding)**:
  - デスクトップ/タブレット: 既存の`24px 32px` (`var(--space-lg) var(--space-xl)`)から、縦方向の余白を**`20px 24px`**または**`16px 24px`**にコンパクトに調整します (上下17〜33%縮小)。
  - モバイル: `16px 20px`でスタックおよび情報伝達力を強化します。
* **カード間余白 (Flex/Grid Gap)**:
  - デスクトップ: 既存の`var(--space-lg)` (`24px`)から、**`16px` (`var(--space-md)`)** または**`18px`**に最適化し、関連するカードが幾何学的に一つのグループとして明確に認識されるようにまとめます。
  - タブレット/モバイル: `14px`または`16px`でリフローされ、堅牢な情報フローを保証します。

### 3-2. ボーダー半径 (滑らかな曲線)
| Token | 値 | 用途 |
|-------|----|--------------------------|
| `--radius-sm` | `6px` | チェックボックス、小さなタグ |
| `--radius-md` | `12px` | 通常のカード、アクションボタン |
| `--radius-lg` | `24px` | Bento Gridの大型パネル、モーダルウィンドウ |
| `--radius-full`| `9999px` | Pill型CTAボタン |

---

## 4. 🔠 タイポグラフィ＆多言語最適化

グローバルレベルのタイポグラフィは、「どのデバイスでも完璧に、そして美しく読めること」を目標とします。

### 4-1. 言語別カスタムフォントスタック
多言語環境(English, Korean, Japanese)における完璧な審美性と可読性保証のため、各言語別カスタムフォントスタックをバインディングし、レンダリング品質を最適化します。
* **英語 (English)**: `Inter`, `Geist`, `SF Pro Display`などをスタックの先頭に配置し、数字とアルファベットのモダンな比率および幾何学的造形美を最大限に引き出します。
* **韓国語 (Korean)**: `Pretendard Variable`, `Pretendard`を全面導入し、字間/行間の不均衡を克服し、ダークモード上でも明確にスキャンされるように最適化します。
* **日本語 (Japanese)**: `Hiragino Sans`, `Hiragino Kaku Gothic ProN` (macOS/iOS最適化) および `Yu Gothic`, `Meiryo` (Windows最適化)を順番に配置し、レンダリング時の歪みやデフォルト書体の粗さを防ぎ、可読性を確保します。

### 4-2. 動的タイポグラフィスケール (Fluid & Harmonious)
単純なピクセル単位ではなく、幾何学的スケールに基づいたフォントシステムを適用します。

| 役割 | フォント | サイズ | line-height | letter-spacing |
|------|------|--------|-------------|----------------|
| **Display (Hero)** | `--font-display` | `clamp(2.5rem, 6vw, 4.5rem)` | `1.1` | `-0.03em` |
| **Heading 1** | `--font-display` | `clamp(2rem, 4vw, 3rem)` | `1.2` | `-0.02em` |
| **Heading 2** | `--font-display` | `1.5rem ~ 2rem` | `1.3` | `-0.01em` |
| **Body Large** | `--font-body` | `1.125rem` (18px) | `1.6` | `0` |
| **Body Base** | `--font-body` | `1rem` (16px) | `1.6` | `0` |
| **Caption/Tag** | `--font-mono` | `0.75rem` (12px) | `1.4` | `0.05em` |

---

## 5. 🪞 エレベーション＆グラスモーフィズム 3.0

透明度の高い紫色の背景に依存していた1世代を超え、**精密な1pxボーダー(Border)と多重影(Multi-layer Shadow)**を活用したハイエンドなグラスモーフィズムを提案します。

### 5-1. プレミアムカードサーフェス (The "Jewel" Effect)
既存の`--glass-bg`の色混入を減らし、純粋なホワイト透明度を使用します。

```css
.premium-card {
  /* 背景: 無彩色のホワイトの極微な透明度 */
  background: rgba(255, 255, 255, 0.02);
  
  /* 高級感のあるブラー処理 */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  
  /* ボーダー: 上部にのみ微細に明るい光を受ける感じのハイライトボーダー */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  
  /* 多重の影で浮遊感(Depth)を生成 */
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 24px 40px -8px rgba(0, 0, 0, 0.3);
    
  transition: transform var(--duration-fast) var(--ease-spring), border-color var(--duration-fast);
}

.premium-card:hover {
  background: rgba(255, 255, 255, 0.035);
  /* ホバー時にのみブランドカラーがほのかに現れる */
  border-color: rgba(167, 139, 250, 0.3); 
  transform: translateY(-2px);
}
```

---

## 6. ⚡ インタラクション＆アニメーション

プレミアムUIの核心は「物理法則に従う自然なインタラクション」です。

### 6-1. スプリング物理ベースのトランジション
従来の単調な`ease-out`に代わる、テンションのあるスプリング効果をデフォルト値として使用します。

```css
:root {
  /* アプリケーション全体で使われるしっかりとしたスプリング曲線 */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  
  --duration-fast: 200ms;
  --duration-normal: 400ms;
}
```

### 6-2. マイクロインタラクション
* **Button Active State**: クリック時に`transform: scale(0.97)`を適用し、物理的なボタンを押すようなリアルな打鍵感を付与します。
* **Spotlight Glow**: カードホバー時、単にボーダー色が変わるだけでなく、カード内部のマウスカーソル位置に追従する光の反射(Glow)効果をグローバルカードシステムに統合します。

---

## 7. 🧩 主要レイアウトパターン (The Unified Bento Grid)

現在`PaceNoteDashboard`と`BuildersLog`に断片化されている**Bento Grid**を、メインの公式UIパターンに昇格させます。

1. **Gaps**: グリッド間隔は常に`var(--space-lg)` (24px) または `var(--space-md)` (16px) を維持。
2. **Spans**: 12カラムグリッド体制を標準とし、情報階層に応じて`span 8`、`span 4` (非対称2:1) または `span 7`、`span 5`など、ダイナミックな組み合わせを使用。
3. **Internal Padding**: Bentoカード内部は上部左寄せを基本としつつ、余白は常に`var(--space-lg)` (24px) または `var(--space-xl)` (32px) で固定し、視覚的な窮屈さを根本的に解消します。

---

## 8. 🌌 3D WebGL & 物理システム (Phase 2.0)

PriSinceraの空間デザインは、2D平面を超え、Three.jsベースの3D WebGL領域へと拡張されました。HTML DOM要素との視覚的統一性を保つため、以下の3D専用パラメータ(Token)を厳格に遵守します。

### 8-1. グラスモーフィズム 3.0 (MeshTransmissionMaterial)
3D上のガラス(クリスタル)オブジェクトは、単純な透明度を超え、「屈折」と「散乱」をシミュレーションする必要があります。
* **Transmission (透過率)**: `1.0` (完全透明)
* **Thickness (厚み)**: `0.5 ~ 0.8` (薄く鋭利なガラス)
* **Chromatic Aberration (色収差)**: `0.15` (過度でない煌めく散乱)
* **Iridescence (虹色反射)**: `1.0` (光の角度に応じた高級感のある虹色反射)
* **Attenuation Color (内部屈折色)**: `#6D28D9` (ブランドメインカラー)

### 8-2. ボリュームライティング＆空間
* **Point Light (内部発光)**: Intensity `0.5 ~ 0.8`, Color `#A78BFA` (ほのかなラベンダー)
* **Ambient Light**: Intensity `0.4` (OLEDブラック背景とのコントラストを維持するための低い照度)
* **Star Field (宇宙背景)**: `#C4B5FD` (紫色の星) と `#7C3AED` (ブランドカラーの塵) の組み合わせで奥行き感を演出。

### 8-3. スプリング物理エンジン (Lerp & Damping)
3Dと2Dインタラクションの打鍵感を統一するため、線形的な移動ではなく**減速(Damping)**ベースの補間を使用します。
* **マウス磁性(Magnetic Hover)**: `lerp(current, target, 0.05)` (毎フレーム5%ずつ目標値に移動、滑らかなテンション)
* **スクロール前進(Zoom-in)**: スクロール`progress`値に比例してZ軸を移動させますが、即座に反応せず`lerp`を経由して乗り物酔い(Motion Sickness)を防止します。

---

## 9. 🗓️ Bento Chrono-Calendar & テーマ別ワークステーションシステム (v2.5)

Daily Digestアーカイブ改編と3-Tabワークスペースのリニューアル過程で確立された**Bento Chrono-Calendar**と**3-Tabワークステーションテーマシステム**の標準ガイドラインです。他の開発者やAIが即座に理解し、コードに移植できるよう、実装パターンと詳細設計トークンを完全に規格化します。

### 9-1. クロノカレンダーグリッド仕様 (レイアウトシフト防止)
* **CLS(Cumulative Layout Shift)制御**: 月変更時(Prev/Next Navigation)に画面の高さが揺れるのを防ぐため、すべての年/月に関係なく常に6週間分の**42個のグリッドセル(Grid Cells)**を維持します。前月の残りの日と翌月の開始日はダミーセルでパディングしますが、不透明度(`opacity: 0.2` または `0.05`)で視覚的階層を区別します。
* **グリッドレイアウト**: `display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;`
* **セル状態定義 (Cell States)**:
  * **未発行日(Inactive)**: マウスおよびポインターイベントを完全に遮断 (`pointer-events: none`)、薄く透明化(`rgba(255, 255, 255, 0.15)`)。
  * **発行日(Active)**: ポインター活性化、グラスモーフィズムスキン(`background: rgba(255,255,255,0.025)`, `border: 1px solid rgba(255,255,255,0.06)`)。
  * **当日表示(Today)**: ゴールドボーダーアクセント(`border: 1px solid rgba(251, 191, 36, 0.4)`)、当日テキスト可視化(`.today-badge { color: #FBBF24 }`)。
* **Active Hotspot & Pulse Glow**:
  * 発行日の中央下部に4pxの円形ドット(`.hotspot-dot`)と12px半径のぼやけたオーラ(`.hotspot-glow`)をオーバーレイします。
  * `.hotspot-glow`は、`scale(1.0)` -> `scale(1.4)`へ2秒周期の滑らかなキーフレーム脈拍アニメーション(`hotspotPulse`)を継続的に実行します。
  * **マウスホバー**: セル自体は`scale(1.08)`の物理バウンス効果(`--ease-spring`)、ボーダーは紫色(`rgba(167, 139, 250, 0.4)`)に輝き、内部の`.hotspot-dot`は`scale(1.5)`に拡張され白色(`#ffffff`)にモーフィング変換されます。

### 9-2. 150msホバーデバウンス＆遅延ロードアーキテクチャ
* **API呼び出し過負荷防止**: アーカイブメインへの進入時、大容量の全記事リストを一度に取得する代わりに、発行日インデックス(`/api/daily/index`)のみを軽量に1回フェッチします。
* **デバウンス遅延ロード (Debounce Lazy Load)**:
  * マウスがアクティブな日付を通過するたびにAPIをトリガーしないよう、`150ms`のデバウンシングタイマーを適用します。
  * マウス進入時(`onMouseEnter`)に以前のタイマーを即座に`clearTimeout`し、`150ms`間カーソルが留まった場合にのみバックグラウンドで`/api/daily/{date}`を呼び出し、右側のクイックピーク詳細情報を動的にバインディングします。

### 9-3. 3-タブワークステーションのセグメント化＆アンビエントモーフィング
詳細ページ(`/daily/{date}`)で、IT Tech、AI Workstation、Language Dojoの3つのワークスペースを即座にスキャンするためのベルトレイアウトです。
* **Segmented Belt**: `display: flex; gap: 16px; justify-content: center; width: 100%;`
* **ベルトボタンインタラクション**: ホバー時、アイコンは微細に回転(`rotate(3deg) scale(1.12)`)し、アクティブ状態になると`translateY(-2px)`とともに個別のテーマカラーがほのかなグローで広がります。
* **バックライトオーラモーフィング (Ambient Morphing Backdrop)**:
  * コンテナ(`.daily-feed-container`)の背面に`filter: blur(140px)`が適用された大きな仮想要素(`::before`)を配置します。
  * タブが切り替わるたびに、テーマの代表光(代表色)を背景グラデーションとして滑らかにフェード変換させます。
    * **IT Tech (Signal)**: ラベンダーオーラ (`rgba(167, 139, 250, 0.08)`)
    * **AI Workstation (Prompt)**: シアンオーラ (`rgba(6, 182, 212, 0.08)`)
    * **Language Dojo (Japanese)**: ローズオーラ (`rgba(251, 207, 232, 0.08)`)
  * トランジションフィルター: `transition: background 0.8s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.8s ease-in-out;`

### 9-4. 2段階モバイルタップUXフロー (モバイル誤タッチ防止)
* **モバイルグリッドリフロー**: 768px未満のメディアクエリ適用時、デスクトップの6:4分割グリッドを`grid-template-columns: 1fr`の縦1列へと変換します。
* **Accidental Navigation防止**: モバイルでのタッチミスによる詳細分析ページへの直接離脱の疲労を解消するため、2段階検証フローを適用します。
  1. **1段階目 (1st Tap)**: モバイルでカレンダーのアクティブな日付をタッチすると、移動する代わりに下部の**Quick Peek要約パネル**にデータをバインディングした後、当該クイックピーク位置へ`scrollIntoView({ behavior: 'smooth' })`でスムーズなスクロールを開始します。
  2. **2段階目 (2nd Tap)**: クイックピークカード内部に強調配置された**「全体コンテンツを詳しく見る →」**アクションボタンを2回目のタッチで最終詳細画面(`/daily/{date}`)へ遷移させます。

---

### 9-5. ⛵ PaceNote Bento Weekly Calendar & Voyage Horizon (v2.6)

PaceNoteサービス(`/pacenote`)の週次タイムライン運用方式を最大化するために設計された**四半期別13週目ベントマトリックス(Chrono-Quarterly Bento Matrix)**デザインシステムガイドラインです。

* **Chrono-Quarterly Bento Layout**: 1年52週をグレゴリオ暦の月ではなく、四半期別(Q1~Q4)の**4つのBentoボックス**で視覚化します。1つの四半期は正確に**13週**と一致するため、`4 x 3 + 1`形式の均一で美麗なBento格子グリッドを維持します。
  * **デスクトップ**: `display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;` (Q1~Q4が2x2対称配置)
  * **モバイル/タブレット**: `grid-template-columns: 1fr;`でリフローされ、縦スタック型のBentoレイアウトに整列。
* **週次セルビジュアル状態スペック (Weekly Cell States)**:
  1. **過去完了週 (Past Completed)**: 透明度の高いグラスモーフィズムスキン(`background: rgba(0, 0, 0, 0.25)`, `border: 1px solid rgba(255, 255, 255, 0.06)`)。該当週のリアルタイムタスク達成度(完了したタスク / 総タスク)に比例した下部マイクロゲージバー(`cell-progress-fill`)を搭載。
  2. **現在開拓週 (Current Active)**: サイバーシアンネオンオーラボーダー(`#22D3EE`)。2秒周期でボーダーが滑らかにパルシングする外郭グローアニメーション(`pulseAura`)と中央の脈動ドットインジケーター(`pulse-indicator`)を連動。
  3. **未来待機週 (Future Locked)**: ディム処理(`opacity: 0.25`)、ポインターおよびクリック遮断(`disabled`)、点線ボーダー(`border-style: dashed`)、鍵アイコン(`🔒`)表示。
* **0ラグデバウンスホバーピーク (150ms)**:
  * マウスホバー時、`150ms`間カーソルが停止した場合にのみ、軌道詳細要約オーバーレイパネル(`weekly-hover-peek-panel`)を滑らかにスライドアップ(`peekSlideUp`)させ、レンダリング負荷を予防します。
* **CLS防止および空間正規化**:
  * 各13週の格子カードは、固定高さ(`height: 62px`)と一定の最小高さを確保し、週が更新されたり探索する際にレイアウトシフトが全く発生しないように空間を保護します。

---
*最終更新日: 2026-05-27 (v4.0 世界最高水準デザインシステム分析およびセマンティックCTAボタン体系設計を追加)*