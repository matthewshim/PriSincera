# 🪐 Two Services, One Journey: How We Unified Daily Digest & Pace Note into ReLearn

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-07-22 | Antigravity | Defined the full record of succeeding Daily Digest & Pace Note into the unified growth-loop service ReLearn | ReLearn, DailyDigest, PaceNote, Admin |

---

## 1. 💡 Intro: One Philosophy, Two Menus

PriSincera's growth philosophy was always a single sentence — **learning becomes action, and action, through reflection, personalizes the next round of learning.** Daily Digest (daily knowledge curation) and Pace Note (weekly action & reflection tracker) were designed as the front and rear wheels of this flywheel.

The problem was that to the user, these two appeared as **two completely separate menus.** You could read a great article in the Digest, but there was no path to turn it into action; you could complete an Orbit, but nowhere on screen could you feel that the experience fed back into the next day's learning.

Ironically, **the backend was already connected.** The Growth Loop pipeline (Phases 0–4) was already feeding completion and reflection signals back into the recommendation engine and the digest lens. Only one thing remained — **the final surface-level work of lifting this invisible connection up onto the screen.**

> 💡 **In one line**: The essence of this unification wasn't building new features — it was dressing an already-existing data flywheel in a "single journey" UI.

---

## 2. 🏷️ Naming: Re-Learn, and Re-run

We settled on **ReLearn** as the name of the unified service. It carries a double meaning — "**Re-Learn**" and "**Re-run** (as in *runner*)" — packed into one word, so that the name itself symbolizes the service's target: *"a Learner & Runner starting over from zero."*

> **Tagline**: "Learn from zero, run again — every day, from zero."

We considered candidates like ZeroRun, Day One, and Base Camp, but only ReLearn had a name that explains the very event of "unification" itself.

---

## 3. 🧭 The Strategic Call: Not Coexistence, but Succession

The most important decision wasn't technical — it was **positioning.**

We started with an "Additive" strategy: leave the two existing services untouched and add ReLearn in parallel. But as we refined the plan, we redefined it — **ReLearn is the *successor* to both services, and "additive" is not a permanent parallel state but a non-destructive transitional migration strategy.**

Three principles emerged from this redefinition:

1. **No sunset without a parity gate** — The old menus come down only after the entire feature-parity checklist (P1–P6) is resolved: in-house unsubscribe, archive browsing, and the disposal/migration verdicts for the calendar and omni-search.
2. **Removing exposure ≠ deleting URLs** — Content detail URLs like `/daily/:date` are SEO assets accumulated over months. Even when pulled from the menu, the URLs are preserved permanently, and old paths succeed to the new addresses via server-side 301.
3. **Switching over comes last, after verification** — We open the new `/relearn` route first, confirm stability, and only then swap the entry points.

---

## 4. 🛠️ Architecture: Zero New APIs, Zero New Jobs

For a project of this scope, the number I'm proudest of isn't a flashy new feature — it's **zero.**

### 1) Directional separation — no contact with the pipeline

The batch pipeline (Cloud Run Jobs) is the path that **creates (writes)** content, while ReLearn merely **reads** existing APIs and reuses existing user-write APIs. Zero new APIs, zero new jobs, zero changes to `cloudbuild.yaml`. Even if ReLearn's build fails, the dawn pipeline keeps running on its existing image.

### 2) Preventing recommendation-stat contamination

ReLearn's core UX — the "to Orbit" one-click — can create custom orbits (`custom-`) in bulk. To keep this from distorting the recommendation pool's velocity and eviction stats, we explicitly exclude custom orbits from the pipeline's stat aggregation.

```javascript
// pacenote-composer — custom orbits from ReLearn are excluded from pool stats
const poolTasks = weekTasks.filter(task => !task.id.startsWith('custom-'));
```

### 3) Dismantling the monolith — extraction as debt repayment

The learning cards were bundled into the old DailyDigest page, and the action/reflection logic into a ~1,900-line PaceNoteDashboard, each as one big lump. To assemble them into the ReLearn shell, we first had to **extract them into section components (Phase B-0)** — and here we set a principle: **the extracted components are swapped in so the existing pages consume them too.** It was consolidation, not copying, so the unification itself worked in the direction of reducing code debt.

### 4) No duplicate fetching

Since the shell draws the learning and action stages together, the profile, orbits, and track feed are **fetched once at the shell level** and passed down. The moment each stage calls on its own, the same API ends up being hit three times per screen.

---

## 5. 🔄 One Journey: Today | Records, and the 3-Stage Loop

ReLearn's screen toggles between **`Today | Records`** within a single route.

```
┌─ ReLearn (Today) ────────────────────────────────────┐
│  ─ Growth Loop Report (completion · streak · domain) ─ │
│  ① Learn   4 digest channels (Signal·Track·Prompt·JP) │
│  ② Run     one-click "Add to Orbit" → today's task     │
│  ③ Reflect check-off + one-line reflection             │
└──────────────────────────────────────────────────────┘
```

- **All four learning channels** connect to Orbits. The Tech Track's action challenge uses the existing `add-orbit`; the other three channels (Signal, AI Prompt, Language) reuse the existing custom-orbit API — again, zero new APIs.
- **The Loop Report resides in both views** as a bridge. Tapping a completion / streak / focus-domain tile drills down to the corresponding week in the Records view.
- Authentication state is precisely branched into a **four-state matrix** — logged out / cold start / has orbits / week not yet started — so each state shows a screen with a clear next action.

There was a fun discovery too. Pace Note's five default orbits ("Try running the AI study prompt yourself," "Read the business Japanese sentence three times"…) were essentially a **hardcoded version** of this channel-to-orbit mapping. The unification promoted them to "add dynamically from today's actual content," and the default orbits remained as the cold-start fallback.

---

## 6. 🌅 Executing Succession: A Three-Step Sunset

Once the parity gate was cleared, succession was executed in three steps.

| Phase | Content |
| :--- | :--- |
| **Phase 1** | Built ReLearn's own archive detail (`/relearn/daily/:date`) — removed the last dependency on past-date browsing and switched all internal links to the new paths |
| **Phase 2** | Swapped entry points — moved the GNB, home, and email entries to ReLearn, and migrated SEO for the old paths (`/daily`, `/pacenote`) via **server-side 301** |
| **Phase 3** | Tidied the old pages' code, routes, meta, and doc status — two large page components retired from the repository |

We finished the surrounding alignment too. The home service section merged the two Daily·Pace cards into a single ReLearn flagship card; the Admin console was reorganized for the ReLearn regime (groups 4→3, tabs 10→8); and the daily newsletter succeeded its branding to "📬 ReLearn Daily."

---

## 7. 🎯 Closing: Unification Was Subtraction

If I compress what I learned from this grand unification into one sentence — **good unification is subtraction, not addition.**

- New APIs, new jobs, new color tokens: all **zero**
- Two monolithic pages → dismantled into reusable section components (debt repayment)
- Two menus → one journey, yet URLs and SEO assets 100% preserved
- The growth flywheel that already existed in the backend, finally made visible on screen

PriSincera's product portfolio is now a three-product lineup: **ReLearn (the growth loop) · Builder's Log (the making-of) · Sylphio (on-device interpretation)**. Every day, from zero, we learn again and run again. 🏃
