# 🕯️ Introduction Before Results: Why Candela's Landing Page Shipped Ahead of the Service

## 1. 💡 Intro: It's Automated Trading, but the First Screen Isn't a Return

Candela is a personal automated trading system built with AI. And yet its landing page opens with no return figure at all. Instead there is a single line — **"Automated trading proven by architecture, not returns."**

That's a deliberate stance. Candela isn't an investment service; it's a **case study** proving that PriSincera actually builds things and runs them. It recommends no stocks and sells no signals. The moment you put returns front and center, the brand takes on a "how to make money" tint — and that isn't the story we want to tell.

> 💡 **In one line**: Candela's product isn't a return. It's public evidence that the system works.

---

## 2. 🧭 Why Build the Landing Page First

After reviewing the whole plan, the first decision was a paradox — **publish the landing page before the actual service (the performance).**

Three reasons:

1. **UI first** — For a public page, the presentation *is* the product. *How* you show performance decides its promotional value, so we lock the screen first and shape the data to that contract.
2. **Cost of undo** — UI costs nothing to change, but altering the schema after wiring a broker tangles real-account history.
3. **An honest wait** — Performance publishes only after at least three months of live-operation data. The "making" in between is logged right here, on Builder's Log.

But there was a trap. What the gate must block is not "a prototype" — it's **fabricated results**. The landing page has no return or MDD figures, so there is nothing to fabricate. So we made the disclosure rule route-specific — **open the intro page, and block the performance and trade-log screens at build time until there's real data.**

> 💡 Intro first, results later — but say plainly, on the page, that it's in progress.

---

## 3. 🔒 What We Show, and What We Hide

On the premise of a public repo and a public web, we split what belongs on the page from what doesn't.

- **Shown (narrative = properties)**: the three-tier separation, the trust boundary that isolates keys and strategy, the property that "no request path leads into the execution layer," the existence of a kill switch, the disclosure principles.
- **Hidden (attack surface = detail)**: concrete paths, command lists, auth policy, infrastructure, detection thresholds. These operational details carry zero promotional value and only reconnaissance value.

The architecture diagram follows the same rule. **No arrow points into the execution worker** — polling, publishing, and orders all flow *outward*, so the absence of any inbound port reads from the picture alone. The box labels use only generic role names (operations console, execution worker, results store).

> 💡 Restraint itself is a trust signal. Stating "we do not disclose the concrete commands and paths" is stronger than listing them.

---

## 4. 🎨 What We Packed Into a Single Page

We pressed a product's worth of information into one page.

- **Hero** — the system's definition + an "in progress · performance opens after live operation" status
- **Key features** — honest results (MDD and the worst month shown), benchmarked, an integrity hash chain, free, delayed-weekly disclosure, backtest-vs-live kept separate
- **Performance dashboard preview** — the layout of the coming screen, as an example. Every value is `—`, marked "example · not a result"
- **Three-tier architecture diagram**
- **The journey** — design → backtest → paper trading → small live account → go public. "You are here" is the design stage
- **FAQ** — not an investment service · not stock picks · integrity · when it opens · free

---

## 5. 🛠️ A Few Things We Learned Building It

Honoring a design system turned out to be more than copying token values.

- **The vanishing-gradient trap** — The hero title used the brand gradient (indigo → lavender → gold), but the gold never showed. The cause was a missing `display: inline-block`. As a full-width block, the text samples only the middle color (lavender) of a wide gradient. Clipping to the text width with `inline-block` brought the gold back — and we wrote that condition into the design-system doc.
- **Vertical on mobile** — The architecture diagram was horizontal on desktop, but on mobile it scrolled sideways and clipped its right half. We switched to a mobile-only vertical reflow SVG, keeping the "no inbound" narrative while fitting the width.
- **Cutting the monotony** — To ease the "row after row of dark cards" feel, we added a gold eyebrow and an icon to each section, and turned the journey into a horizontal stepper on desktop.

> 💡 A norm knows not just the "value" but the "condition." When the condition is missing from the doc, the same mistake repeats — so we put what we learned back into the doc.

---

## 6. 🔭 What's Next

With the intro page standing, next comes filling in what's beneath it. Locking the data contract into code has already begun, followed by fixtures → backtest → paper trading. The performance dashboard opens only after three months of live operation.

Until then, Candela's real content isn't the results — it's **the making** itself.
