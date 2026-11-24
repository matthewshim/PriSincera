# We Promised Not to Decide for You — Then We Added AI

In ch.14 I wrote down Waymark's one inviolable rule: it never decides for you. Back then it was a declaration. Building the trial turned that single sentence into the clause that cost the most code.

That is because we decided to put AI into the companion. An LLM answers when asked. Ask it which of two options is better and it picks one. Keeping the promise means blocking that default disposition, and blocking it did not end with one line of prompt.

## 1. We Cut Scope, But Not the AI

Before starting, I reread all seven planning documents and cut the scope. Three of ten features moved out. What moved out was the peer-stories layer — taking accounts from people who have made a similar decision, reviewing them, matching them, showing them. That needs an entire pipeline: submission, anonymization, reporting, PII review.

The more decisive reason was that **the place demanding the most work was the emptiest one**. For peer stories, cold start is risk number one. If there are zero stories early on, that slot in the loop rings hollow, and the felt value per unit of effort is the lowest of anything we could build. Standing up a moderation pipeline from zero, alone, was the wrong order.

The companion messages, by contrast, went in **whole, uncut**. It is the one feature we refused to shrink in the middle of shrinking everything. It is what the user actually touches, and if it thins out what remains is a note app for decisions. The result is seven features in, three deferred, and a core that stands with zero moderation and zero cold start.

## 2. Three Paths Through the Same Hard Rules

Companion messages pile into a single timeline, but they come from three sources.

| Path | What | Cost |
| :--- | :--- | :--- |
| Five template tones | No LLM. Emotion and event rules pick the tone; only variables get substituted | Zero, and zero network latency |
| Trial AI | The server calls with our key. Roughly twenty times a month per user | Our cost, capped |
| BYOK | The user connects their own key | User's cost, uncapped |

All three paths pass **the same hard rules and the same guardrails**: never decide for the user, route crisis signals to professional help, and no coaching voice carried over from our other services. The principle has to hold even with the AI switched off, so templates are the default path, not a fallback. When the trial cap runs out or no key is connected, it quietly returns to templates.

One place runs the other way: where the AI speaks first. When you have just logged a decision and opened it, a timeline holding a single template line looks empty. So **only for users who have connected their own key** do we generate one opening line from the decision's context. It is their key, so our cost is zero and the trial cap is untouched. On success the template line is hidden at render time and replaced without duplication; if there is no key or the call fails, we **quietly leave the template in place**. We chose not to tell the user about the failure. A companion that says "the AI call failed" is not keeping you company.

The principle shows up most plainly in how the templates close. All five tones hand the decision back in the same spot.

```
Counsel   Which way is right — in the end, you know best.
Clarify   I helped you sort it, but the decision stays yours.
Verify    Not to push back — just helping your choice stand firmer, by your side.
```

## 3. The Principle Went Into the Tone Rules

At first there were four tones: comfort, counsel, cheer, clarify. Using it, a gap showed. Nothing played the role of pressing on a decision that had already tilted one way. Counsel offers another perspective; making someone test their own premises is a different job. We added **verify** as a fifth tone and split the roles apart.

Then we rewrote the automatic tone selection.

```js
function defaultTone(emotionTags = [], importance = 2) {
  const s = new Set(emotionTags);
  // anxiety or fear in the mix: acknowledge the weight first (safe side on conflict)
  if (s.has('anxiety') || s.has('fear')) return 'comfort';
  if (s.has('confusion')) return 'clarify';
  // confidence, excitement, relief: on a big decision (importance 3), verify instead of "go lightly"
  if (s.has('confidence') || s.has('excitement') || s.has('relief')) {
    return Number(importance) >= 3 ? 'verify' : 'cheer';
  }
  return 'comfort';
}
```

Two lines carry a judgment. The first is that **we do not cheer a big decision just because you feel good about it**. High importance plus confidence or excitement goes to "any premise you missed?" rather than "take it lightly." Cheering is nicer to hear, but picking the nicer line on a big decision is flattery, not company.

The second is that **conflicting emotions resolve to the safer side**. If excitement and anxiety are both logged, it goes to comfort. Acknowledging the weight first does less damage when it is wrong.

## 4. We Read the Data Policy Before Writing Code

Before any discussion of sending data out, we settled how it sits inside. The browser never reads the database directly. Database rules deny everything, and all reads and writes go through the server API. The server checks authentication on every request and verifies that the record **belongs to that user**. The point is to structurally remove the path where someone passes another person's id and pulls their decisions.

We did not build a membership system; we attached to the existing one. With no paid plan there is no billing unit to model, so joining on the existing authentication's user identifier was enough instead of standing up a unified account service. What you do not build is also a decision.

Then comes the external model. This is sending someone's decision records outside. So we made it a **blocking precondition** for the trial AI: no code until the provider's official documentation confirms it does not train on the data and does not retain it. We started only after confirming no retention by default, no training, and that zero-data-retention is available to all customers rather than enterprise accounts alone.

We also cut how much goes out. Only the minimal context of that one decision, no identifiers, no other decisions, and PII redacted. The context per call is capped at about one screen's worth.

BYOK split at the research stage. The goal was to keep user keys out of our server, and surveying the providers showed that **only one allows a direct call from the browser**. That one permits it through a dedicated header, so it never touches our server or database at all. The rest are blocked by CORS, so they go through a stateless pass-through: the server holds the key in memory only, forwards it immediately, and neither stores nor logs it. Which means that even within BYOK, **the path differs depending on which key you plug in** — and we chose not to hide that difference from the user. Keys are stored encrypted in the browser and wiped with one click.

And we added a notice: **your privacy depends on your key's provider and tier.** For providers whose free tier trains on input, a warning appears as you enter the key. Better that than claiming a guarantee we cannot make.

Crisis signals are blocked on both sides. Caught on input, the model is never called and the message is replaced with guidance to professional help; after the model returns an answer, the same check runs once more. Guard only one side and one of the two leaks.

## 5. Keeping the One Who Reaches Out From Clinging

Waymark's heart is that it comes to you without you opening it. A feature that reaches out first becomes a clingy app with only a small design mistake. So the **rules for not sending** took more work than the rules for sending.

- **Quiet hours defer, they do not skip.** If the due time falls inside quiet hours, it is not cancelled; it goes out on the first cycle after they end. Silence and omission are different things.
- **No response means it backs off on its own.** Two consecutive non-responses skip one; three stop the active notifications.
- **Closing a decision cancels its remaining schedule.**
- **Delivery is guaranteed across two channels.** Email and web push go out together. Even if push was denied, or the app was never installed to the home screen on iOS, email still arrives.

Those two channels cost a day. Web push arrived silently at first; it only worked once the service worker was left as a raw file the build does not touch and the messages were switched to data-only. In the sending job, a timestamp helper imported from a different module would not serialize, so the write failed. Using the helper from the same instance as the database handle ended it, but until we found the cause the logs said nothing at all.

## 6. We Opened It by Invitation, Not to the Public

Having built it, we did not open it to everyone. Only approved people get in. You apply from the intro page, agree to the terms, and an invitation email goes out once an administrator approves.

The gate lives on the server, not in the screen. Every API lets only approved accounts through. Blocked only in the UI, it is a notice you can route around, not a gate. We also inserted a pass over the whole path — application through trial — before the first approval. If the first approved user sees a broken screen, that person does not come back.

Opening it and using it myself turned up more to fix. The biggest was that input was split in two. There was a field for writing a note and a separate one for asking the AI, but in front of a decision, writing and asking are the same act. We merged them. In Korean and Japanese input, Enter would land mid-composition and send half a sentence; we added a composition guard.

Answers also came out cut off. With one provider the thinking process consumed the tokens, the body hit the ceiling, and the truncated fragment went straight into the bubble. We turn thinking off, retry once if the model does not accept that setting, and if it still hits the ceiling we discard the fragment and fall back to a template. A companion that cuts itself off loses trust faster than one that says something wrong.

The trial is still limited to approved users. The peer-stories layer is not in, and we did not leave a visible hole where it will go. What we are trying to prove right now is one thing: whether reaching out first, being alongside, and not deciding for you actually makes a decision less lonely. Layering a community on before we know that would make it impossible to find out why it did not work.
