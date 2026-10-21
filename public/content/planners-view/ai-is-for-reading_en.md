In the last piece I wrote that shipping is not the submission of an answer but the submission of a hypothesis, and said I would spend a few pieces looking into that "after launch." The first question is this. What do we read the flood of signals with? I think this is where AI earns its keep. And yet most organizations have attached AI only to the building side.

## AI on the building side has already become table stakes

In 2023 GitHub published the results of a controlled experiment measuring Copilot's effect. On a task implementing an HTTP server in JavaScript, the group using Copilot finished 55.8% faster than the group without it. It is an impressive number. But read that number from an organization's point of view and it tells a different story.

Your competitors run the same models at a similar price. ==When everyone gets the same speed from the same tool, that speed is not an advantage but table stakes.== You fall behind by not using it, and you do not get ahead by using it.

And the structure from the previous piece layers onto this. When building speeds up, a product's time moves past launch. Which means the stretch most organizations have attached AI to is the stretch shrinking fastest in a product's lifetime.

## The reading side is still done by hand

Think about what starts arriving the day after launch. Store reviews, customer inquiries, error logs, community posts, social reactions. Operate globally and you multiply all of it by the number of languages.

One distinction is needed here. The signal arriving after launch splits into structured and unstructured. Structured metrics — response time, drop-off rate, payment success rate — already have dashboards. What is empty is the unstructured side: reviews, inquiries, community posts, the things people wrote in their own words. And the side that tells you what went wrong and why is usually the unstructured one. Metrics tell you what fell; they do not tell you why.

How this actually gets read is much the same everywhere. Someone skims a few dozen reviews and gathers up what caught their eye. Inquiries get summarized by whoever handles them, from impression. That impression becomes a report, and the report becomes the basis for the next decision.

This is not laziness. A person cannot read a hundred thousand items. Hence the paradox I wrote about last time: at the moment the most information begins arriving, we read the least of it. It is not that there is nobody to read — there is no way to read.

## Reading signal is the task where AI's weaknesses cost the least

Two properties make AI uncomfortable on the building side. It produces wrong answers confidently, and it does not guarantee the same output for the same input. In code both are fatal. Wrong code becomes an incident, and behavior that does not reproduce cannot be debugged.

On the reading side those same properties bill at a completely different rate. Misclassify a hundred items while sorting a hundred thousand reviews and the distribution barely moves. It corrects in the next aggregation, and a little wobble in classification does not overturn the top three complaints. The weakness is unchanged; what it costs is orders of magnitude lower.

The strengths, meanwhile, carry over intact: exhaustive coverage and multiple languages. Simple arithmetic shows why these two are decisive. Say a signal appears in only 0.2% of a hundred thousand reviews — that is two hundred items. But when a person reads fifty as a sample, the expected number of times that signal shows up is 0.1. It is effectively invisible.

==The most expensive signal after launch usually appears in only a small minority, and a minority is the first thing a sample loses.== A payment failure on one device model, a string that breaks in one language, a phrase that draws anger in one market. All of them minorities, all of them critical.

## But the moment you trust the summary, the minority disappears again

So asking a model to "summarize the reviews" walks right back into the trap you just avoided. Summarization is fundamentally an operation that converges on the majority. It tells you what was mentioned most, and what was mentioned most is what you already knew.

Summaries carry a second bias as well. Models are good at rendering things into familiar categories, which means they push a complaint they have never seen into one they have. Yet right after launch, the most urgent signal is usually the one nobody has seen before. So you have to ask alongside it: how many items fit no category well? A sudden swelling of the unclassifiable pile is itself the earliest alarm.

What you need is not a summary but classification and frequency. How many of what, and where they cluster — which language, which version, which device. And from those numbers you have to be able to descend to the actual source text. The AI review summaries Amazon added to product pages starting in 2023 come close to this shape. They do not stop at a summary sentence; you can press an attribute that makes up the summary and go down to the actual reviews that said it.

==A summary you cannot trace back to the source is not a report but a rumor.== If there is no way to check when a number looks strange, that number stops supporting the decision and starts pushing it.

## Change the classification and you can no longer compare against yesterday's numbers

Attach AI to the reading side and you soon meet a problem. Adjust the prompt a little, or move the model to a new version, and the same data yields a different classification. Then last week's numbers and this week's cannot be set side by side. Whether complaints fell or the classification changed is indistinguishable.

In operation this matters more than it sounds. The point of reading the time after launch is not absolute values but change. Is it up from yesterday? Down from the last version? When the baseline wobbles, change becomes invisible.

So the classifier has to be treated like a product. Version the taxonomy and the prompt, and when you raise a version, re-run the historical data through the new one so the time series lines up. And periodically have a person read a sample directly and compare it against the model's classification. It looks like a chore, but numbers that skip this step cannot serve as the basis for a decision.

## So the classification has to be settled before you ship

In the previous piece I wrote that three things should be settled before you ship. What will tell us we were right? If we were wrong, what signal will show it? And if we were wrong, how do we roll it back? The second one is precisely this classification.

Build the classification after shipping and you will build the one that fits the result. Ambiguous signals go into "other," and nobody opens "other." Write down before shipping what complaints would appear if this feature failed, and you only have to watch the count on that line go up. Feed the same model the same data and an organization with criteria and one without will see entirely different things.

AI cannot settle those criteria for you. Knowing what to look at is knowledge held by the person who designed the product; the model can only classify a hundred thousand items by that standard. That is the exact line of the division of labor.

## In closing

See AI as a productivity tool and you attach it to the building side; see it as a sense organ and you attach it to the reading side. Everyone is already doing the former, so it makes no difference; the latter is still mostly empty.

AI on the building side lets you ship faster. AI on the reading side lets you know whether what you shipped was right. If shipping is the submission of a hypothesis, which side it earns its keep on is clear.

In the next piece I will move to the question after this one. When you learn you were wrong, what does being able to roll back actually require?
