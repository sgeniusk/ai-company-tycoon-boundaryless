# Product Requirements Document

## Product

**AI Company Tycoon: Boundaryless**

Browser-based management simulation where the player grows a small AI startup into a company that crosses industry boundaries by turning reusable AI capabilities into products, domains, infrastructure, and automated operations.

## Product Thesis

Most tycoon games are bound to one industry. AI companies are interesting because a single capability can expand into many industries: writing, coding, education, design, support, enterprise automation, vehicles, robotics, healthcare, media, and more.

The MVP should prove this fantasy in 10 minutes:

1. Build an AI capability.
2. Launch products using that capability.
3. Products generate users, data, revenue, hype, and risk.
4. Growth creates compute pressure and trust problems.
5. New capabilities unlock new domains.
6. Automation makes the company compound faster.

## Audience

- Tycoon and management sim players who enjoy optimization loops.
- Startup/AI-curious players who enjoy modern technology themes.
- Casual Steam/web players who want visible progress within 5 minutes.
- Strategy players who want trade-offs rather than idle clicking.

## Marketable Hook

**A tycoon game where AI capabilities break industry boundaries.**

Instead of buying more factories of the same kind, the player builds reusable AI primitives that unlock new product categories. Language can become a writing app, tutor, support agent, enterprise assistant, legal tool, or media engine. Code can become developer tools, internal automation, app generation, or autonomous software teams.

## Comparable References

- Game Dev Story: readable company growth fantasy and compact management loop.
- Startup Company: product/company scaling theme.
- Universal Paperclips: compounding abstraction and existential scale.
- Plague Inc.: simple global feedback loops that become strategic.
- Reigns: event choices with visible consequences.
- Mini Metro: clarity, pressure, and elegant escalation.

The target is not to copy any one of these. The target is a readable, replayable company-growth loop with a uniquely AI-native expansion model.

## Core Fantasy

The player should think:

- "This one capability can become many businesses."
- "Growth is exciting, but compute cost is terrifying."
- "Hype gets users, but trust gets enterprise money."
- "Automation is turning the company into a machine."
- "There is no clean boundary between industries anymore."

## Core Loop

1. Inspect company state.
2. Choose a product, capability upgrade, hiring/infrastructure move, or safety/marketing investment.
3. Advance the month.
4. Receive revenue, users, data, costs, pressure, and possible events.
5. Use new resources to unlock more capabilities and domains.
6. Repeat until success, failure, or the 10-minute MVP arc ends.

## Strategic Tensions

- Growth vs trust
- Hype vs safety
- Revenue vs compute cost
- Research vs marketing
- Automation vs control
- Consumer scale vs enterprise reliability
- Short-term cash vs long-term capability unlocks

## MVP Scope

The first playable MVP covers 10 simulated months and should take about 10 minutes.

Required features:

- Dashboard UI with resources, products, capabilities, and timeline.
- Launchable products loaded from JSON.
- Capability requirements and locked-state explanations.
- Monthly simulation with revenue, users, data, cost, hype decay, trust recovery, and compute pressure.
- Capability upgrades that unlock new domains or products.
- At least 6 monthly events with choices and effects.
- Automation upgrades that visibly reduce pressure or increase compounding.
- Success and failure states.
- Save/load after the core loop is stable.
- Debug validation for data integrity and core invariants.
- Synthetic playtest report after each playable milestone.

## Out Of Scope For MVP

- 3D office, character animation, or factory-style visual simulation.
- Multiplayer.
- Full Steam demo progression.
- Real AI API integration.
- User-generated content.
- Large domain set such as vehicles, medicine, robotics, law, finance, and entertainment all at once.

These can be added after the MVP proves the core loop.

## Success Conditions

The MVP is successful if a first-time player can, within 10 minutes:

- Launch at least 2 products.
- Understand why at least 1 product is locked.
- Upgrade at least 1 capability.
- See at least 1 new domain or product path open.
- Experience at least 2 meaningful events.
- Feel compute or trust pressure.
- Reach a clear success, failure, or near-miss trajectory.

Quantitative MVP targets:

- 10-month run completes without crash.
- At least 3 viable strategies exist: hype growth, trust enterprise, automation efficiency.
- No dominant strategy wins without counterpressure.
- A new player understands the first click within 30 seconds.
- Resource changes are visible immediately after every action.

## Key Resources

- Cash: spending power and runway.
- Users: scale and market traction.
- Compute: infrastructure capacity and pressure.
- Data: fuel for research and model improvement.
- Talent: human team capacity.
- Trust: unlocks enterprise and stabilizes reputation.
- Hype: accelerates adoption but creates risk.
- Automation: compounds efficiency and long-term leverage.

## Data Model

All tunable gameplay data should live in JSON:

- Resources
- Products
- Capabilities
- Domains
- Events
- Upgrades
- Automation upgrades
- Balance coefficients
- Starting state
- Synthetic playtest personas

The app may contain formulas, but content and balancing values should be data-driven.

## User Experience

The first screen is the game dashboard, not a marketing landing page.

The dashboard should show:

- Month and company stage.
- Resource strip.
- Main action area for products and capability upgrades.
- Locked reasons in plain language.
- Timeline of recent changes.
- Clear "Next Month" button.
- Warnings for low cash, low trust, and compute pressure.

The UI should be dense but readable, like an operational company dashboard rather than a decorative landing page.

## Risks

- Scope explosion from the "AI can do anything" premise.
- Spreadsheet feel without emotional feedback.
- Too many resources before the player understands the loop.
- AI theme becoming cosmetic instead of mechanical.
- Balance snowball where one strategy dominates.
- Synthetic testing being mistaken for real user testing.

## Production Rule

Every milestone must ship a small playable improvement and pass:

1. Data validation.
2. Build validation.
3. Agent review.
4. Synthetic playtest.
5. P0/P1 issue resolution.
