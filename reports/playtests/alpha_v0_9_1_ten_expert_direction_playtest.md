# 10-Expert Direction Playtest Report — Alpha v0.9.1

Date: 2026-05-15
Build: Vite React alpha, local dev server `http://localhost:5180/`
Scope: Early direction test with no final graphics or sound. Evaluation focuses on core loop clarity, strategic promise, economy feel, and production direction.

## Executive Summary

Current direction score: **72 / 100**

Interpretation: **Positive for an early prototype, not yet positive for a public demo.** The concept is alive: hiring agents, starting an AI product, seeing a release grade, competitors claiming market space, and reacting to hype/GPU events all point toward the intended "boundaryless AI company" fantasy. The largest issue is that the opening economy turns punishing before the player understands their agency. After hiring one agent and launching the first product, cash fell from `₩10,000` to `-₩841` by month 4 while the first product generated only `₩800` monthly revenue against `₩2,841` cost. That creates tension, but too early and too bluntly.

The right next milestone is not final art or sound. The next milestone should make the first 5 minutes feel guided, rewarding, and recoverable.

## What Score Counts As Positive?

- **60-69**: Direction is plausible, but still fragile. Continue only if the core fantasy is unique.
- **70-79**: Positive early prototype. Worth continuing; fix onboarding and loop feel before adding polish.
- **80-89**: Strong vertical-slice direction. Ready to invest in art, sound, UX polish, and broader content.
- **90+**: Rare at this stage. Usually requires a polished demo, distinctive feel, and clear retention hooks.

For this project, because graphics and sound are not final, **70+ is a good signal**. I would treat **80+** as the threshold for "show this widely outside trusted testers."

## Test Method

I ran the local build, validated the harness, and manually played through the opening loop:

- Hired the first available agent, `프롬프트 설계가`.
- Started `AI 글쓰기 비서`.
- Advanced months until release.
- Resolved the first viral event with the conservative option.
- Advanced into the next month to inspect revenue, cost, users, and follow-up events.

Technical verification:

- `npm run validate:data`: passed
- `npm test`: 28 tests passed
- `npm run build`: passed

Note: Port `5174` was occupied by another local prototype, so the current build was tested on `5180`.

## 10 Expert Panel

### 1. Executive Producer

Score: **74**

The milestone is real and testable. The build launches, actions work, and the project is moving toward a 10-minute MVP. The main production risk is sequencing: the team may be tempted to polish office visuals before the first-session loop is satisfying.

P1: Define a "first 5 minutes" script: hire, build, release, event, recovery, next unlock. The player should always know why the next click matters.

### 2. Game Designer

Score: **76**

The strongest design idea is the combination of reusable AI capabilities, products, competitors, and events. It already feels more specific than a generic office tycoon. However, the current first product does not yet demonstrate "boundaryless expansion"; it mostly demonstrates "startup cash burn."

P1: After the first release, immediately tease at least two next paths: another productivity product, capability research into code/vision, or trust-oriented enterprise path.

### 3. Systems Architect

Score: **81**

The data-driven direction is strong. Products, agents, costs, events, assets, and balance are externalized in JSON, and automated validation is present. For an early game, this is unusually healthy.

P2: Keep watching for UI logic becoming too embedded in React components. The simulation layer is the right place for long-term rules.

### 4. QA Lead

Score: **78**

The build is stable under the tested path. Data validation, unit tests, and production build pass. Save/load buttons are present, and locked states explain why actions are unavailable.

P1: Negative cash is allowed, but the game needs explicit recovery guidance before the player feels trapped. If debt is intentional, label it as runway/debt rather than a silent failure state.

### 5. Balance Designer

Score: **62**

The economy is currently the weakest part. Hiring one common agent and launching one starter product creates a fast cash cliff. Monthly base cost plus salary overwhelms starter revenue, and the first viable product does not pay back quickly enough.

P1: Reduce opening burn or raise first-product revenue. A first-time player should survive long enough to make 2-3 strategic decisions before debt pressure becomes central.

### 6. UX Designer

Score: **70**

The screen is readable, and resource changes are visible. The interface has a board-game/prototype charm that works even without final art. The weakness is action priority: a new player sees many panels, but the game does not strongly say "do this first, then this."

P1: Add an opening objective strip with 3 steps: hire agent, start product, advance month until release. Mark each as completed.

### 7. Narrative/Theme Designer

Score: **77**

The fantasy has teeth. "AI 글쓰기 비서", "GPU 가격 폭등", competitor claims, trust, hype, and compute all belong to the same world. The theme is stronger than the visuals right now.

P2: Give each product release a tiny headline or market reaction. The B-grade review is useful, but a little flavor would make the simulation feel alive.

### 8. Product/Market Expert

Score: **73**

The premise is commercially legible. AI companies really do cross domains through capabilities, and the game can own that niche. The next risk is being too close to a spreadsheet. The simulation needs clearer "why this company is becoming boundaryless" feedback.

P1: When a capability unlocks a product or domain, present it as a market expansion moment, not just a lock disappearing.

### 9. Accessibility Specialist

Score: **69**

Text is readable, locked reasons are explicit, and buttons have clear labels. The dense layout may be tiring, especially because many cards use similar visual weight.

P2: Improve hierarchy in the product list: available actions, locked products, and active products should be visually distinct at a glance.

### 10. Harsh Steam Reviewer

Score: **60**

"I see the idea, but I do not yet feel the fun." The reviewer would likely forgive placeholder graphics if the first 5 minutes created a satisfying loop. Right now, they may hit debt and assume the game is either too harsh or unfinished.

P1: The prototype needs one undeniable satisfying moment before the first hard setback: a launch animation, numbers jumping, a review quote, a new opportunity, or an obvious strategic fork.

## Synthetic Player Archetypes

### New Player

Likely reaction: "I understand I am running an AI company, but I am not sure what the best first move is."

Need: guided first objective and stronger feedback after first product release.

### Tycoon Fan

Likely reaction: "The pieces are here: staff, products, events, competitors, upgrades."

Need: visible compounding and a clearer upgrade ladder.

### Min-Max Player

Likely reaction: "Opening build order probably dominates: hire cheapest product agent, rush first product, then debt-management."

Need: multiple viable first hires or first products with different payoffs.

### Casual Steam Player

Likely reaction: "Lots of text. I need a more obvious win."

Need: one-click clarity and faster reward presentation.

### Accessibility Tester

Likely reaction: "Readable, but dense."

Need: visual grouping, status color, and action priority.

## Key Findings

### P1 — Opening Economy Becomes Negative Too Early

Observed path: after hiring `프롬프트 설계가` and launching `AI 글쓰기 비서`, cash reached `-₩841` by month 4. The player had one active product and 1,024 users, but could not afford the next basic product.

Why it matters: early debt can be exciting later, but at minute 3 it reads as "I made the correct tutorial move and got punished."

Recommendation: Tune the first loop so the player can afford one follow-up action after release. Options:

- Raise `AI 글쓰기 비서` monthly revenue from `₩800` to around `₩1,400-₩1,800`.
- Lower base monthly cost or first-agent upkeep during the first 3 months.
- Add a first-launch grant, seed funding event, or tutorial contract.

### P1 — First 5-Minute Goal Is Not Explicit Enough

The player can infer the correct path, but the UI does not actively lead them. A game without final art and sound needs stronger text-and-state choreography.

Recommendation: Add a visible opening objective strip:

1. Hire one agent.
2. Start one product.
3. Advance months until release.
4. Resolve launch event.
5. Choose next growth path.

### P1 — Direction Needs One Early "Boundaryless" Reveal

The concept promises reusable AI capabilities crossing industries. The current first loop mostly shows product launch and operating cost.

Recommendation: After first release, show a message such as "Language capability can now branch into meetings, support, education." Even if locked, make the future visible.

### P2 — Competitors Are Thematically Good But Too Aggressive-Looking

Competitors claiming multiple products early is exciting, but it can feel like the player is falling behind before they have tools to respond.

Recommendation: In the first 3 months, use competitor claims as foreshadowing rather than pressure. Let the player see "rival preparing" before "rival claimed."

### P2 — Product Completion Feedback Needs More Drama

The B-grade review is useful. But the launch moment should feel like the first emotional payoff.

Recommendation: Add release summary: grade, users gained, hype gained, next unlock, and one line of market reaction.

## Directional Verdict

This project should continue. The core direction is meaningfully better than the raw visuals suggest. The current prototype already has the bones of a distinctive AI-era tycoon: capabilities, products, agents, competitors, trust, hype, compute, and automation all point to one coherent fantasy.

But do not use graphics and sound as the next rescue move. The priority should be:

1. First-session objective guidance.
2. Opening economy recovery.
3. First launch payoff.
4. Early boundaryless expansion reveal.
5. Then art and sound.

If those four design items land, I would expect the direction score to move from **72** to **80-84** even before final production art.

