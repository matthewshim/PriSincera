Across this series I spent four pieces on what becomes scarce in an age when execution has gotten cheap. Planning, the ability to handle failure, an eye for essentials, and attitude. All of them were about individual judgment.

But move the same premise up to the level of the organization and it produces a far more expensive misreading. What AI automates is tasks, and organizations read that as jobs having shrunk. I think this one-notch gap is where the most money has been lost over the past two years.

For more than twenty years I have worked as a web planner, as a PM, in service and business planning, and for the last few years running web services — watching, up close, how organizations divide work and place people. Today I want to write about what is visible from that seat.

## Published numbers cannot be taken at face value

Let me be clear about one thing first. AI's productivity gains are real. I do not doubt that.

The most widely cited evidence is "Generative AI at Work," submitted by Brynjolfsson, Li, and Raymond to the National Bureau of Economic Research in 2023. It tracked 5,179 customer support agents at a large software company, and issues resolved per hour rose 14% on average.

But the other half of the same study matters more. **That average 14% was not an even 14%.** Among novice and lower-skilled agents it reached 34%, while among experienced agents almost no improvement was measured. The researchers attributed this to the model spreading the practices of capable agents across the organization. Which means it carries the good performer's method over to the weaker one, and has nothing new to give the good performer.

I have never run a contact center myself. So I cannot vouch for this study from my own experience, and I do not need to. The structure is clear enough on its own: what rose was the floor, and multiplying the average by headcount erases that fact. I should add that customer support is a relatively standardized job. These numbers cannot be carried over unchanged to less standardized work.

Perceived speed is another problem. In a randomized controlled trial METR published in 2025, experienced developers working on real tasks in their own repositories predicted beforehand that they would be 24% faster, felt afterward that they had been 20% faster, and were measured at **19% slower**. The time spent writing prompts, waiting, and verifying does not register in perception.

==Plan headcount on perceived productivity and you have not measured anything; you have signed off on a feeling.==

That said, the number should not be quoted as it stands. In February 2026 METR stated that its 2025 estimates likely do not apply to current models, and acknowledged that its follow-up results carry too much selection bias to be reliable. So what I take from the study is not the magnitude of 19% but **the structure: expectation, perception, and measurement can point in different directions.** That structure does not disappear as models improve.

For the same reason, the MIT-side report that 95% of enterprise generative AI pilots produced no impact on earnings needs careful handling. It is a working paper and its methodology drew objections. If we filter a company's success figures as claims, we owe the same standard to failure figures. Doubting only one side is not verification; it is bias.

## AI replaces tasks, not jobs

That covers the measurement problem; now the structural one. What I want to say in this piece comes down to a single sentence.

AI replaces tasks, not jobs — yet headcount planning is still done job by job.

A job is not the sum of its tasks. It is more than the sum. There are clearly repeatable tasks that suit automation well, but between them sit exception handling, contextual judgment, accountability, and tacit knowledge that never made it into any document. In a survey of 2,000 hiring managers, 40% said AI had failed to replace their organization's tacit knowledge. That is what they meant.

So this happens. Automate 70% of a team's tasks and cut 70% of the headcount, and **you discover too late that the remaining 30% was the hardest work in the organization.** The tasks that automate easily are generally the easy ones. The proportions look the same, but difficulty tilts the other way.

Salesforce reduced customer support from 9,000 people to 5,000, saying AI agents handle about half of all inquiries. Read it in reverse and the other half is still human work — and if that half was the easy half, the difficulty of the remaining 5,000 people's work went up.

## The order you fold it in determines the result

From here on this is my own view. In the seat of running web services, adopting AI is not optional. Deciding not to use it becomes a competitiveness problem within a few quarters. So the real question is not whether to use it but **in what order to fold it in.**

The most common mistake I see is starting from the tool. Look for where to put a good new tool and you only see the places the tool fits well, never whether those places matter to the organization.

The question itself has to change. Not "how many people can we cut from this team" but "which of this team's tasks get automated, and how does the difficulty of what remains change." In the first, the number is fixed first and the reasoning is attached later. In the second, the reasoning comes first and the number follows. The order changes the outcome.

So I recommend the reverse sequence: break the job into tasks first, sort those tasks by character, then attach AI in the way that suits each character. The axis for sorting is not difficulty but **the cost of being wrong.**

The first tier is **tasks where exhaustive coverage matters, that repeat, and that require almost no judgment.** Sorting inquiries and reviews by type, first-pass translation, summarizing long documents, drafting standard replies. Here I think you should fold it in aggressively. A person cannot read everything, and when the model is wrong it corrects in the next aggregation. This is where AI's weaknesses cost the least.

The second tier is **tasks that need judgment but whose results can be verified.** Finding holes in the logic of a spec, checking the tone of an announcement across languages, extending QA test cases, tracking changes in competing services. Here I think the right structure is AI producing drafts and candidates while a person decides. One condition attaches, though: the output has to arrive in a form a person can verify. Unverifiable output looks convenient but leaves accountability floating.

The third tier is **tasks where accountability attaches.** Pricing policy, compensation plans, the final call on external communication during an incident. Here I think it is better not to touch it — not because it is technically impossible, but because these are matters where it must be clear who answers for a mistake.

Draw this map and role names turn out to match task character less than you would expect. In the work of raising a service's value, of deciding what not to build, human judgment determines almost the entire result. In the repetitive work of development, by contrast, the efficiency is clearest, because tests and type systems grade the result automatically. But summarize that as "planning is human, development is AI" and you are back to job-level thinking. There are plenty of first-tier tasks inside planning, and inside development there are third-tier tasks like choosing a data model, among the most expensive decisions to reverse. What draws the boundary is not the role but **whether the task has a grader.**

And once you have broken things apart, two facts emerge that bear directly on headcount planning. The first is this. ==Hand tasks to AI and what remains for people does not get easier; it gets harder.== Hand over classification and a person's work shifts to designing the criteria and verifying the results. Hand over first-pass translation and it rises to judging tone and local context.

All of it demands a higher level of skill than before. So I think the right reading of task automation is **not a headcount cut but a rise in the capability required.** The same number of people will handle more work, true. But they will not be fine at a lower level of skill.

The second is that **automatable tasks are not evenly distributed across jobs.** For some jobs 80% of the tasks sit in the first tier; for others it is under 20%. Yet viewed as an organizational average the two look like the same number. It is exactly the shape of the customer support study above. Averages erase distributions.

So the way I keep up with the trend is not bringing tools in quickly but **drawing the task map first.** Models change every few months; which tier our organization's tasks belong to changes far more slowly. Without the map, every new tool means starting over.

Looking back, it is a strange thing. Decomposing tasks and estimating their difficulty is a planner's basic craft, and it is what I have done for more than twenty years. Yet when it comes to designing an organization we leave that tool in the drawer and judge by the crudest units available: number of jobs, number of people. That is why someone who has spent a career in planning has the most to say in this conversation.

## Which is why many of these decisions get reversed

The gap is already showing up in outcomes. Since 2025 there has been a run of headcount reductions attributed to AI. Amazon cut roughly 14,000 corporate roles while citing automation by generative AI and agents, and Salesforce cut 4,000 from customer support. Klarna introduced AI support, froze hiring, and reduced headcount by 22% in a little over two years.

One of these needs to be read as a different kind of decision. IBM often gets sorted into the same bucket, but what its CEO said was a projection that 30% of back-office non-customer-facing roles — HR and finance, some 26,000 people — could be replaced over five years. The figure works out to about 7,800, but it was **a hiring freeze and unfilled vacancies, not layoffs**, and the savings went into hiring programmers and salespeople, so total headcount rose. Very different decisions are mixed into the same bucket.

Reversals are appearing too. Klarna's CEO announced in 2025 that the company was hiring human agents again, acknowledging that AI support was cheaper but also lower in quality. I think it shows where a productivity metric with no quality metric ends up. Cost lands in the quarterly statements immediately while quality decline surfaces quarters later as churn, so narrow your measurement window and automation always looks like the winner. Forrester projected that about half of AI-attributed reductions will be reversed.

Forrester also found that AI was used as the explanation for reductions even in cases where it had not actually replaced anyone. I do not think it is my place to guess at motives. What I pay attention to is **the fact that the explanation and the reality diverged** — and that divergence happens where there is no measurement.

The cost I consider most expensive, though, appears nowhere in any of this. When a person moves, the context, relationships, and know-how they hold move with them. Why a feature was designed that way, which customer is sensitive and why. It is not in any document; it is only in that person.

==Rehiring restores the headcount but does not restore the organization's memory.== It does not show up in the financial statements, which is why it is hard to weigh when the decision is made.

## In closing

The four pieces in this series were all about individuals. This one is about organizations, but the conclusion returns to the same place.

AI is not a failed technology. The gains at the tool level are real, and I use them every day. But the equation "AI's effect equals payroll savings" is not something the technology supports. That equation is not a problem of technology but of measurement and judgment.

In the first piece I wrote that the more common technology becomes, the scarcer planning becomes. The more common automation becomes, what grows scarce is **the eye that reads a job as a set of tasks.** No tool does that for you.

Reduced to a sentence: I think the most expensive mistake of the AI era is not failing to use AI, but changing the organization first on the strength of expectations nobody verified.

## 출처

- [Brynjolfsson, Li, Raymond — Generative AI at Work, NBER Working Paper 31161 (2023)](https://www.nber.org/papers/w31161)
- [METR — Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity (July 2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [METR — Experiment design update: limits of applying the 2025 estimates today (Feb 2026)](https://metr.org/blog/2026-02-24-uplift-update/)
- [Fortune — MIT report: 95% of enterprise generative AI pilots show no impact on earnings (Aug 2025)](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo)
- [The Register — Forrester: half of AI-attributed layoffs will be reversed (Oct 2025)](https://theregister.com/2025/10/29/forrester_ai_rehiring)
- [Entrepreneur — Klarna's CEO reverses course and rehires human agents (May 2025)](https://www.entrepreneur.com/business-news/klarna-ceo-reverses-course-by-hiring-more-humans-not-ai/491396)
- [Al Jazeera — IBM freezes hiring, projects 7,800 back-office roles (May 2023)](https://www.aljazeera.com/economy/2023/5/3/ibm-to-freeze-hiring-as-ceo-expects-ai-to-replace-7800-jobs)
- [Yahoo Finance — Amazon cuts about 14,000 corporate roles (Oct 2025)](https://finance.yahoo.com/news/amazon-cuts-14-000-corporate-123834043.html)
- [CO/AI — Salesforce cuts 4,000 support jobs as AI handles 50% of customer service (Sept 2025)](https://getcoai.com/news/salesforce-cuts-4k-support-jobs-as-ai-handles-50-of-customer-service)

Figures a company reports about itself have not been verified by a third party, so they are safest read as claims.
