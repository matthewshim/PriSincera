In the first piece I wrote that three things should be settled before you ship. What will tell us we were right? If we were wrong, what signal will show it? And if we were wrong, how do we roll it back? The second piece covered the second question, so now the third.

What does being able to undo actually require? I held that question for a long time before realizing the order was backwards. Reversibility is not insurance you arrange after building fast. You can only build fast if you can undo.

Yet in most organizations reversibility gets filed under stability. It goes into the incident-response document and never onto the roadmap. The conversation about going faster and the conversation about being able to undo happen in different meetings. I think that separation is what makes both of them fail.

This matters more given the premise of this series. When AI collapses the cost of building, the number of changes goes up — and when changes go up, so does the number of things that need undoing, by the same multiple. But the machinery for undoing does not grow on its own. **Raise production capacity while leaving recovery capacity where it was, and that gap becomes your incident rate.**

## Without the ability to undo, nobody gets bold

First, a distinction. Undoing means two things: rolling back when something breaks, and withdrawing when a hypothesis turns out wrong. The first is urgent in minutes; the second is a decision that plays out over days or weeks. The machinery they need is almost the same, so this piece treats them together.

In the first piece I wrote that submitting hypotheses means shipping small and often. Yet many organizations cannot take that advice. I do not think the reason is a shortage of courage.

Where you cannot undo, deploying becomes frightening. Fright reduces the count, and in place of frequency you pack more into each release. Pack more in and you cannot separate what caused the problem; without separation incidents grow larger; larger incidents make the next deploy more frightening. The loop tightens on its own.

A common misreading follows. We look at teams that ship often and call them bold. To me the order is reversed. They do not ship often because they are bold; they can afford boldness because they can undo. An organization that cannot undo is not lacking courage; it is lacking the machinery to undo.

==What sets your speed is not how fast you can build, but how fast you can undo it when you were wrong.==

## The attempt to undo can make things worse

Without preparation, undoing gets improvised in a hurry — and improvisation sometimes makes the situation worse. There is a well-known case.

On August 1, 2012, the U.S. brokerage Knight Capital deployed new order-routing code to seven of eight servers. The remaining one still held code from 2003, and the new code had reused that old code's flag. When the market opened, that one server poured out orders through old logic with no quantity limits.

Then comes the decisive moment. While searching for the cause, the engineers **removed the new code from the seven servers where it had deployed correctly.** The judgment was to roll back; the result was the opposite. In that instant all eight servers were running the old logic, and the problem became eight times larger. Within 45 minutes losses passed 460 million dollars, and the firm was effectively finished that day.

The lesson I draw is not to take more backups. It is that undoing cannot be designed after the incident. In an urgent moment the most plausible action can be the most dangerous one, and getting that judgment right inside half an hour is hard. An undo you did not decide in advance is not an undo; it is one more change.

## Reversibility is not equally hard at every layer

And "we can undo it" is a looser phrase than it sounds, because the difficulty depends entirely on what you are undoing. I look at it in three layers.

The code layer can be undone. Deploy the previous version. The data layer is different. If you changed a schema, deleted records, or paid out compensation, rolling back the deploy does not bring that data back. The layer of user memory is harder still. If you published an announcement and people read it, taking the announcement down does not unread it.

A case shows the weight of the data layer. On January 31, 2017, a GitLab engineer deleted the production database directory on what they believed was a replica. They stopped within seconds, but roughly 300 gigabytes were gone. What came next matters more. Of five prepared backup and replication methods, **almost none worked as expected.** About six hours of production data was permanently lost.

==Code can be rolled back, but data and the user's memory cannot.== So one more question joins the design conversation. Which layer does this change touch? If it touches only code, you can be bold. If it touches data or memory, it needs a different speed.

This layering explains the limits of A/B testing precisely. An A/B test is a release format in which undoing is the default state rather than an after-the-fact measure. That is why it works best at the code layer. Shift the traffic back and you are done.

At the data layer it does not work. A/B a compensation payout and you can shift the traffic back, but what was paid out stays paid.

At the memory layer a distinction is needed. Time-limited deals and targeted coupons — leaving the list price alone while varying a conditional benefit — happen constantly and cause no problem. The end time is announced in advance, so withdrawing it is not an undo but a scheduled ending.

The problem is splitting the list price itself across users in the same situation. In 2000 Amazon ran a five-day test on 68 DVD titles, varying the discount between 20 and 40 percent according to cookies. Returning customers ended up paying more, shoppers discovered it first, and Amazon apologized and refunded the difference to 6,896 people.

What to notice here is that the refund was not the whole of the undo. The money came back, but the memory of learning that prices can differ per person could not be returned. That is why I think the time-limited deal is the better design. It converts an experiment that could be irreversible into a conditional benefit, testing price without touching the memory layer.

## Reversible and irreversible decisions need different speeds

The most compact statement of this distinction is in Amazon's 2015 letter to shareholders. Bezos divides decisions into irreversible one-way doors and reversible two-way doors, saying the former should be made slowly and with deliberation while the latter should be made quickly by small groups.

His added warning matters more. As organizations grow, there is **a tendency to apply the one-way-door process to most decisions.** Attach heavy process to two-way doors and attempts go down; when attempts go down, so does what you learn.

It happens in the other direction too — treating a one-way door like a two-way door. Push a data migration or a compensation payout through the same process as an ordinary deploy and there is no way back when it is wrong. Organizations that mix the two and run them at one speed pay on both sides.

## Undoing contains not only technology but authority and words

I think "we can undo it" holds three things at once: technology, authority, and words.

Technology is the part most discussed. Flags that separate a feature from the code so it can be switched off, gradual rollout that reaches some users first, a reverse procedure for data changes. With these three, undoing is a matter of decision; without them it is a matter of labor.

AI adds a variable here. A rollback judgment is made by someone who knows what the change touched. Code a person wrote is known by the person who wrote it. But put generated code in after only reviewing it, and whoever must decide at three in the morning whether to revert understands it less well. Changes get faster while the basis for the undo decision gets thinner.

Once agents start executing directly, the problem crosses layers. If an agent modifies data, sends a message to a customer, or approves compensation, a code-layer rollback does not bring it back. So when granting an agent authority, I think you should first decide which layer it is allowed to reach. The three layers above are the ruler for drawing that line.

Authority is discussed less but matters as much. Having the technology to undo is useless if the person who must undo lacks the authority. ==A rollback that has to climb an approval chain is not undo machinery; it is an undo request form.== Whether the on-call engineer can revert alone at three in the morning is the real test. And it has to come with an agreement that nobody will be blamed if that judgment was wrong. Punish the undo and nobody undoes; they hold out instead, and it breaks bigger.

The hypothesis side fails a little differently. Incidents grow because you cannot undo them; hypotheses drag on because the decision to undo never gets made. It was already announced, it is tied to quarterly targets, and someone championed it. **It is not rare for the flag to take three seconds to switch off while those three seconds fail to happen for two months.**

This is pride blocking the undo, not technology. So I recommend writing the conditions for abandoning a hypothesis as numbers before you ship. Agree on the conditions in advance and abandoning stops being somebody's defeat and becomes a scheduled step.

Words are the part prepared last. How do you tell users that you undid something? GitLab livestreamed its recovery from that incident, and the postmortem has become one of the most cited records in the industry. An organization that did not hide an incident did not lose trust over it. Handle an undo quietly and from then on undoing itself becomes a thing to hide.

## In closing

If shipping is the submission of a hypothesis, then submitting hypotheses often means being able to discard wrong ones cheaply. Undoing is the machinery that lowers the cost of discarding. That is why I file reversibility under speed rather than stability.

One thing to add. Building reversibility is itself a task AI helps with well. Drafting reverse migrations, tracing the blast radius of a change, assembling a postmortem. These need judgment but their results can be verified, so they fall squarely into the second tier from the previous piece. AI can make the undoing side cheaper, not only the building side faster.

That said, you cannot make everything reversible. Data and the user's memory never fully come back. So what you actually have to do is not make every change reversible but **know in advance which changes are irreversible.** Knowing that, you can reserve the heavy process for the irreversible side.

In the next piece I want to look into that layer of memory. What do we announce, and how? The argument that an announcement is not a notice but a feature.

## Sources

- [U.S. SEC — In the Matter of Knight Capital Americas LLC, Administrative Proceeding 34-70694 (2013)](https://www.sec.gov/litigation/admin/2013/34-70694.pdf)
- [GitLab — Postmortem of database outage of January 31 (Feb 2017)](https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/)
- [Amazon — 2015 Letter to Shareholders, Type 1 / Type 2 decisions](https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF)
- [CNN — Amazon apologizes for random DVD price test (Sept 2000)](https://www.cnn.com/2000/TECH/computing/09/28/amazon.reut/)
