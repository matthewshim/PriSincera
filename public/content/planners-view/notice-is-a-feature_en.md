In the third piece I split reversibility into three layers. Code can be rolled back, data does not come back, and the user's memory is harder still. And I wrote that I would look into that layer of memory in the next piece.

An announcement is how we write to that layer. No other product decision gets written directly into a user's head. Only an announcement does that. A user's understanding of what we did and what we intend to do is built almost entirely out of announcements.

So I do not file announcements under notices. An announcement is a feature. The same change becomes a different product when the announcement changes.

## An announcement is harder to undo than code

A deploy can be undone. Switch back to the previous version. An announcement does not work that way.

What has been announced cannot be unread. Taking the announcement down does not erase the reading of it, and a correction does not remove the first version from memory. If anything a correction creates two memories: what was announced, and the fact that it changed.

==A deploy can be rolled back; a promise cannot.==

"Announcement" usually brings release notes to mind, but the range is wider. Maintenance notices, revised terms, price changes, incident reports, end-of-service warnings all write to the same layer. The hardest to undo among them is **an announcement that carries a promise.** An announcement of fact gets updated when the fact changes; an announcement of a promise, when you cannot keep it, is not an update but a reversal.

In practice this asymmetry is usually handled backwards. A deploy gets review, staged rollout and a rollback procedure, while an announcement is written in a hurry and goes straight out. The more irreversible side carries the lighter process.

## You can make a product worse without changing a line of code

There is a case that shows "an announcement is a feature" is not a figure of speech.

In December 2012 Instagram announced revised terms. They would take effect the following month, and one passage read as though users' photos could be used in advertising. The reaction was fast. Users lined up to announce they were leaving.

What matters is that **nothing about the product had changed at that point.** The code was the same, the features were the same, and no photo had been sold. The only thing that changed was a document. Yet the product users experienced got distinctly worse.

Within days the founder reversed the advertising section entirely and restored the version in use since launch. His diagnosis was precise: there had been no intention to sell photos, and still **the wording could be read that way.** It was not the intention but the sentence that changed the product.

The same accident is now repeating because of AI. In 2023 Zoom added a clause to its terms that read as though customer call content could be used to train AI. As the backlash grew it explained that nothing would be used without consent, and when the explanation failed to settle it, it revised the terms again to say customer content would not be used for training at all.

Here too the feature did not change. What changed was wording — and the more telling part is that one explanation was not enough. Clauses about training data have become **the sentences users read most closely.**

## Some things do not come back even when you withdraw them

There is a case in the other direction. In 2011 Netflix raised prices while announcing it would split DVD rental from streaming and give the separated DVD service a new name, Qwikster. For users of both services the monthly bill rose by close to 60%.

The backlash was severe and the company withdrew the Qwikster split in under a month. But **it kept the price increase.** That quarter about 800,000 U.S. subscribers left, and the stock had lost more than half its value since July.

What I notice is that the CEO's apology was aimed at **how it was announced, not at the price.** He maintained the decision itself was necessary while saying the way it was explained had been wrong. The product decision could be withdrawn; the memory already created could not, and that memory showed up in the quarter's numbers.

The layering from the third piece is visible here exactly. The code layer, Qwikster, was reversed; the data layer, the price, was kept; the memory layer had no way back.

## A chatbot's answer is also an announcement

Add an AI feature and the boundary of "announcement" blurs. Announcements do not live only on the announcements page. Every place where the product tells a user about policy, amounts or procedure is an announcement. And sentences nobody wrote now appear in those places.

In February 2024 a small-claims tribunal in Canada found Air Canada liable. A user had asked the website's chatbot about bereavement fares, and the chatbot answered as though a retroactive application after travel was possible. The actual policy was different.

The airline's defense lands precisely on this piece's subject. The argument was that **the chatbot is a separate entity, so the company is not responsible for its answers.** The tribunal did not accept it. A chatbot has an interactive component but is still part of the company's website. Nor could the company show why the page with the correct policy was more trustworthy than the chatbot's answer.

The damages were a little over 800 Canadian dollars, and a small-claims decision is not binding elsewhere. But a line was drawn. What the chatbot said is what the company said.

==The people who write announcements are no longer only people.== I wrote above that an announcement is harder to undo than code — and now those hard-to-undo sentences are generated automatically, without review. The place that most needs the process an announcement deserves is the place that has the least of it.

So when attaching a generative feature I think the right move is to first settle **the list of things the model must not say.** Amounts, durations, exceptions to policy, legal notices. Have it fetch a fixed value or hand the case to a person. This is not solved by a better model. It fails rarely, but when the rare failure is a promise the cost is the same.

## Announcements fail in three shapes

The failures I have seen repeatedly take three shapes.

The first is being late. When users discover a change first and the talk has already started in the community, an announcement that goes out after that changes in character. ==An announcement that goes out after users found it themselves is not a notice but an explanation.== The same sentences, in the reverse order, spend trust instead of building it.

The second is being vague. As the text passes through several departments' reviews it gets safer, and the safer it gets the less it says about what happened. If a user reads the announcement and still does not know what changes for them, that announcement might as well not have been published.

The third is over-promising. It is writing something you cannot keep into a layer you cannot undo. Being specific about timing and scope buys trust immediately, and those two are the items that change most often. I think it is safer to write **what you will not do rather than what you will.** The latter changes less.

## Ship more often and you announce more often

Return to the premise of this series and one more problem appears. When AI collapses the cost of building and releases get more frequent, the things that need announcing grow by the same multiple.

But an announcement is one of the rare instruments that loses effect as you use it more. Announce every change and users stop reading announcements, and an announcement nobody reads does not work when a change finally matters. So in an organization that ships often, **what not to announce** has to be designed alongside. Without a threshold for announcing, the whole system defeats itself.

Where to use AI splits along the third piece's layers too. Drafting the text, translating it, checking terminology against past announcements — these need judgment but their results can be verified, so fold them in. But **what to announce, what not to announce, and whether to apologize are decisions with accountability attached.** Hand those over and there is nobody clearly answerable when something goes wrong.

Translation needs particular care. Covering every language has gotten cheap, but the right intensity of an apology and the acceptable level of indirection differ by market. Wording that is appropriate in one language reads as dodging responsibility in another. That judgment has to be a person's.

Finally, measurement. The second piece asked what we read post-launch signals with; announcements have to be read too. **Whether an announcement worked is measured by inquiries that stopped, not by views.** If the same question keeps arriving after you published, the announcement was published but not delivered.

## In closing

See an announcement as a notice and you write it after the change is done; see it as a feature and you write it while designing the change. I recommend the latter, because what you can announce affects what you can build. A change you cannot explain is usually a change that was not finished being designed.

So I look at a draft announcement before shipping. Writing the draft surfaces what the change means to a user, and when the sentences will not come out right, that itself is a signal. It adds one more to the three pre-launch questions from the first piece: how will we explain this?

Who writes it changes too. As a notice, the person who finished building the change writes it last; as a feature, the person who decided the change writes it. I think the latter is right, because they are the only one who can explain why it was done that way.

In the next piece I want to reach the last question. What do we ship, and when? The argument that an operating calendar is not a schedule but a strategy.

## Sources

- [NPR — Netflix kills Qwikster, price hike lives on (Oct 2011)](https://www.npr.org/sections/thetwo-way/2011/10/10/141209082/netflix-kills-qwikster-price-hike-lives-on)
- [NPR — Instagram reverts to original ad terms after uproar (Dec 2012)](https://www.npr.org/sections/alltechconsidered/2012/12/20/167760242/instagram-reverts-to-original-ad-terms-after-uproar)
- [The Record — Zoom revises terms again to say it doesn't use customer data to train AI models (Aug 2023)](https://therecord.media/zoom-ai-terms-of-service-update)
- [AI & Society — Air Canada's chatbot and the responsibility gap (Moffatt v Air Canada, 2024 BCCRT 149)](https://link.springer.com/article/10.1007/s00146-024-02096-7)
