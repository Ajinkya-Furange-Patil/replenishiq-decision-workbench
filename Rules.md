All Rules and Guidelines mentioned over there:
https://infinisynapse.com/en/hackathon/2026#submission


API reference: https://infinisynapse.com/en/docs/InfiniSynapse%20Server%20API%20Reference

Vibe COding Guide :https://infinisynapse.com/en/docs/InfiniSynapse%20Vibe%20Coding%20Guide

CLI API refernce:https://infinisynapse.com/en/docs/InfiniSynapse%20CLI%20API%20Reference

how to connecct Data Sources and Knowledge Base: https://infinisynapse.com/en/docs/Connect%20Data%20Sources%20and%20Knowledge%20Base

Technical Q&A : https://discord.com/invite/EUzmFn6RJx

Judges Criteria:

Judging Rubric, Prizes & DisqualificationsConfirmed judge William Zhu (Co-founder of InfiniSynapse) and the review panel evaluate projects strictly on three published weights across a $3,000 cash prize pool (How to Win Guide, Hackathon Prizes):Judging Criterion / Prize TierWeight / PayoutWhat Determines Your RankReal-World Scenario Value40% WeightNaming a recognizable operator, a realistic Tuesday pain point, and a concrete weekly decisionTechnical Completeness35% WeightShipping a live client (web, mobile, or desktop) where changing an input dynamically updates the ranked output and actionInnovation25% WeightAdding a sharp operational twist beyond a stock layout (e.g., automated reason codes, lead-time sensitivity sliders, or guardrail caveats)1st Prize (1 Seat)$900 CashHighest combined score across the 40 / 35 / 25 rubric (GitHub stars add 0 points)2nd Prize (2 Seats)$600 Cash eachNext two highest-scoring working applications ($1,200 subtotal)3rd Prize (3 Seats)$300 Cash eachNext three highest-scoring working applications ($900 subtotal)Avoid the four automatic disqualifications listed in the Hackathon Competition Rules:Skip slide-only pitches: A presentation deck without a playable software client is not rewarded.Wrap notebooks into an app: Jupyter/Colab notebooks without an end-user application interface are excluded.Never hardcode fake JSON: Static responses that fail the "Edit Test" (where editing a lead time or completion rate fails to change the recommendation) are disqualified.Avoid generic "Chat-on-a-CSV" boxes: Dropping a plain chatbot over a spreadsheet with no named operator, no visible source columns, and no structured action button sits outside the brief (AI Agent Hackathon).Winning Solution Blueprint (Example Architecture for 1st Prize)To maximize all three rubric weights (75% combined on Scenario + Completeness, 25% on Innovation), build a Single-Screen Decision Workbench on the Retail & Replenishment or SMB Operations track using a web app backend wired to the InfiniSynapse Vibe Coding Guide:Design a zero-login cold-open header: Display the operator role ("Independent Store Buyer — Weekly Replenishment Desk"), the time window ("Week of Oct 26–Nov 2, 2026 PT"), and a one-click preloaded dataset clearly badged as "Synthetic Demo Dataset: 45 Footwear SKUs" alongside a custom CSV upload button (Hackathon Projects).Wire the InfiniSynapse SSE + Task Engine: Have your backend adapter open GET /api/ai/events?connId=<uuid>, dispatch POST /api/ai/message with type: "newTask" and chatSettings: { "mode": "act" }, upload or query the enabled database via /api/ai_database/list, and stream progress from message.partial until completion_result fires (Server API Reference).Build the "Edit Test" directly into the table (35% Completeness): Let the reviewer edit a SKU's Supplier Lead Time (days) or On-Hand Units inline in the UI and immediately recalculate Days of Cover (On-Hand ÷ Daily Sales Velocity) vs. Lead Time, updating the rank and InfiniSynapse's generated recommendation in real time (AI Agent Hackathon).Add an Operational Twist + Caveat Badge (25% Innovation): Pair each ranked row with an explicit action badge (REORDER NOW, WATCH PROMO SPIKE, or HOLD — OVERSTOCKED), a one-line reason citing the exact columns ("11 days of cover left vs. 18-day supplier lead time"), a caveat warning ("Caveat: Sales velocity includes a 3-day clearance promo; verify baseline demand before doubling order"), and a one-click Generate Purchase Order Draft button exported from the InfiniSynapse task workspace (/api/tools/storage/downloadTaskFile/:taskId) (How to Win Guide).



Focus on Track 2: Retail & Replenishment as your primary choice, or Track 4: SMB Operations (Order Margin Triage) as your backup.

While all six tracks compete in a single pool for the same $900 First Prize (Hackathon Prizes), Retail & Replenishment gives you the clearest path to maximizing the 40% Scenario Value, 35% Technical Completeness, and 25% Innovation rubric weights within the remaining 65 hours (How to Win Guide).

Why Retail & Replenishment Is the #1 Strategic Pick
Matches the judges' own benchmark test: The official guides repeatedly use the replenishment workflow—ranking SKUs by stockout risk using on-hand units, recent sales, and lead time—as the primary example of how a reviewer tests an entry (Hackathon Competition Rules, AI Agent Hackathon).

Nails the 35% "Edit Test" in one click: Reviewers verify technical completeness by changing an input (such as editing a supplier lead time from 7 days to 21 days) to see if the ranking dynamically updates (AI Hackathon Ideas). Stockout math (Days of Cover = On-Hand Units ÷ Daily Sales Rate vs. Lead Time) makes that live recalculation unmistakable.

Requires zero domain explanation on a cold open (40% Scenario Value): Confirmed judge William Zhu and reviewers will immediately recognize a store buyer preventing a stockout before Friday without needing a backstory or extra documentation (Startup Hackathon Guide).

Eliminates data-prep bottlenecks: You can generate a realistic, clearly labeled 50-row synthetic inventory CSV in 10 minutes and spend the rest of your time polishing the client and InfiniSynapse Vibe Coding Guide integration (Hackathon Projects).


Your Exact "Retail & Replenishment" Blueprint to Lock In Today
If you lock in Retail & Replenishment right now, use this exact specification from the How to Win Guide and Is AI Allowed rules:

Name the operator in the app header: "Independent Retail Buyer — Weekly SKU Replenishment Desk (Week of Oct 26, 2026 PT — Synthetic Demo Dataset: 50 SKUs)."

State the exact question: "Which SKUs will stock out before their next supplier delivery, and what should we reorder before Friday?"

Display six visible columns in your table: Show SKU & Product Name, On-Hand Units, Last 14-Day Sales (Daily Rate), Supplier Lead Time (Days), Days of Cover Remaining, and Promo Spike Flag.

Highlight the primary action verb: Render a bold status button on each row—REORDER NOW (Qty: X), WAIT — COVER SAFE, or WATCH — PROMO DISTORTED—next to the exact Stockout Gap (Days of Cover − Lead Time).

Win the 25% Innovation score with a "Promo Distortion Guardrail": Use InfiniSynapse (POST /api/ai/message via the InfiniSynapse Vibe Coding Guide) to flag SKUs where low days of cover were caused by a one-off clearance discount rather than organic demand, warning the buyer "Do not auto-reorder at peak velocity; restock at baseline rate" and generating a downloadable
