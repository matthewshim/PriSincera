# How 'Power Users' Can Stagnate AI: Overcoming the 150-Recommendation Pool Limit

A common misconception many makers make when introducing AI is the optimism that **"if AI is simply integrated, it will automatically run excellently."**

Initially, PriSincera's Pace Note personalized goal guide was simple and intuitive. When a user opened the dashboard, it would randomly pull and present goals from a pool of 15 tracks statically hardcoded within the backend (`pacenote-api.mjs`).

However, this method didn't last long. As the number of hardcore users visiting the dashboard daily increased, the "stagnant water" phenomenon occurred, where **"only the same goals appeared repeatedly."** The repetition of standardized data rapidly eroded user motivation.

To inject infinite vitality into this stagnant AI engine and evolve autonomously by converging actual user response data, we decided to break this limit by fully adopting a **"Data-Driven Feedback Flywheel."**

---

## 🚨 The Problem Encountered: The End Brought by Stagnant Recommendations

To overcome hardcoding, we built a pipeline (`pacenote-composer.mjs`) that dynamically creates and supplies new recommended goals daily at midnight, separating it into a database (`config/pacenote_daily_pool`).

While fresh items were now pouring in daily without needing deployment, there was another hidden technical challenge.
To provide users with rich options while ensuring efficient database retrieval and cost-effectiveness, the recommendation pool size had to be capped at **a maximum of 150 items.**

Since 3 new tracks were added daily, an **"Eviction"** moment naturally arrived where 3 existing tracks had to be pushed out and deleted.

What if we simply deleted items in 'oldest first (FIFO)' order? This would result in a significant loss, as excellent, popular tracks that garnered explosive user reactions would be permanently deleted once their creation date passed.
Conversely, what if we only deleted items based on 'least popular (fewest Picks)'? Newly born tracks would have short exposure times, inevitably leading to low cumulative selection rates, resulting in an unfair massacre where they perish immediately after creation.

Ultimately, only initial masterpieces holding vested interests would survive indefinitely, monopolizing the pool, while new ideas would be wiped out. This led to a technical limitation of **"AI Recommendation Stagnation,"** where the recommendation list became perfectly stagnant.

---

## 🏗️ Dynamic Eviction Algorithm for Preventing Stagnation

To overcome this contradiction, we designed a **"Velocity-based multi-dimensional eviction algorithm"** inspired by the laws of physics.

### 1. Velocity (Daily Average Selection Speed) Formula
Timeという変数によって歪められる累積数値を補正するため、アイテムが生成されてプールに存在した生存日数に対する、実際のユーザーが選択した回数を正規化した**Velocity**スコアを毎晩計算します。

To correct for cumulative values distorted by the variable of time, a **Velocity** score is calculated every night, normalizing the actual number of user selections against the number of active days an item has existed in the pool since its creation.

$$Velocity = \frac{Total\ Picks}{Active\ Days}$$

*   $Total\ Picks$: The cumulative number of times the track was selected by users.
*   $Active\ Days$: The number of days elapsed from when the track first entered the database until now.

### 2. New Track Protection Order (Grace Period) & Time-to-Live (TTL)
Based on this Velocity formula, we equipped two additional safety mechanisms to cover the algorithm's blind spots.

*   **Grace Period (7 days)**:
    Newly created tracks with $Active\ Days \le 7$ are **permanently excluded from eviction (protected)**, regardless of their Velocity score, to ensure they have sufficient opportunity to be exposed to users.
*   **Forced Eviction Lifetime (TTL - 45 days)**:
    Even if a track has an overwhelmingly high Velocity score due to explosive popularity, if $Active\ Days \ge 45$ have passed, it is considered a "masterpiece that has successfully completed its mission" and is **forcibly retired from the stage (mandatory eviction)**. This serves as an absolute defensive line to maintain the perpetual freshness of the ecosystem.

Every midnight, the algorithm precisely targets and **evicts the lowest 3 tracks by Velocity score** from among those past their grace period (more than 7 days) at the moment the 150-item cap is exceeded, thus fostering a vibrant self-purifying action within the recommendation ecosystem.

---

## 🔄 Self-Evolving AI Feedback Flywheel

The true beauty of this structure is not limited to merely automating eviction; it lies in the **circular structure** where well-utilized user response data flows back as a foundation for AI learning.

```text
                  [ User Interface: Pace Note Dashboard ]
                                     |
                          (Choose / Complete Data)
                                     v
                       [ Users' Actions Database ]
                                     |
                            (Extract Top Picks)
                                     v
  +--------------------> [ 150 Daily Pool ] <--------------------+
  |                                                             |
  | (Dynamic Few-Shot)                                (Evict Velocity < 0.1)
  |                                                             |
  v                                                             v
[ Gemini API Composer ] <-------------------------------- [ Auto-Eviction Job ]
```

### Dynamic Few-Shot Prompting Technique
Every midnight, when the cron job (`pacenote-composer.mjs`) runs, the algorithm precisely identifies **"the 3 tracks with the highest Velocity scores among those selected at least twice"** from the entire collected database. We call this the **"Hall of Fame."**

Immediately before the AI model (Gemini Flash) names and designs new tracks for deployment the next day, we inject these three actual track data from the Hall of Fame into the system prompt as **"the best trendy recommendation examples that are currently explosively motivating actual users."**

As a result of incorporating this Dynamic Few-Shot technique:
*   Without requiring separate, complex, and costly fine-tuning training, the AI autonomously **identifies and learns real-time trends** regarding what tone, difficulty, and format of goal guides users are responding to and enthusiastic about.
*   An innovative, organic feedback loop is completed, where the quality and attractiveness of newly supplied goals improve progressively over time.

---

## 💡 Conclusion and Future Plans

Systems that simply hardcode static data and leave them unattended eventually become obsolete.
The **"150-item recommendation pool limit and dynamic eviction algorithm"** applied to Pace Note, and the **"feedback flywheel"** that recirculates data into AI prompts, demonstrate the essence of true modern data engineering that constantly moves and improves its own quality.

We will not stop here; we will continue to develop **hyper-personalized hybrid recommendation curation** technology that analyzes specific user completion category preferences and provides optimal custom goals proportional to category weights.

Making is not a one-time deployment. It's about collecting data, refining it, and feeding it back to the AI to let it run autonomously. This is the engineering of breaking limits that PriSincera pursues.