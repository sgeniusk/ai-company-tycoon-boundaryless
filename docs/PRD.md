# PRD - AI 컴퍼니 타이쿤: 바운더리리스

## 제품

**AI Company Tycoon: Boundaryless**

작은 AI 스타트업을 시작해, 재사용 가능한 AI 능력을 제품, 산업 분야, 인프라, 자동화 운영으로 확장하며 경계 없는 회사로 키우는 브라우저 기반 경영 시뮬레이션입니다.

## 언어 기준

MVP의 기본 언어는 한국어입니다. 개발 문서 일부는 영문 용어를 병기할 수 있지만, 플레이어가 보는 UI, 제품명, 자원명, 상태 메시지는 한국어를 우선합니다.

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

## 벤치마크 기준

- Game Dev Story iOS: 작은 회사, 직원 운용, 제품 개발, 평가 점수, 판매량, 사무실 확장을 짧은 모바일 루프로 압축한 1차 벤치마크.
- Startup Company: product/company scaling theme.
- Universal Paperclips: compounding abstraction and existential scale.
- Plague Inc.: simple global feedback loops that become strategic.
- Reigns: event choices with visible consequences.
- Mini Metro: clarity, pressure, and elegant escalation.

1차 감각 기준은 Game Dev Story입니다. 단, 복제 대상은 아트/IP가 아니라 다음 구조입니다.

- 작은 조직이 점점 큰 회사가 되는 압축 성장감.
- 직원/능력/제품/시장 조합을 통한 결과 예측.
- 출시 후 리뷰, 판매, 순위, 수상 같은 즉각적 피드백.
- 짧게 눌러도 다음 결과가 궁금한 "한 달만 더" 루프.
- 메뉴는 단순하지만 숫자와 상태 변화는 풍부한 모바일 경영 시뮬레이션 감각.

자세한 벤치마크는 `docs/BENCHMARK_GAME_DEV_STORY.md`를 따릅니다.

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
- Hireable AI agent archetypes with stats, upkeep, and visual identity hooks.
- Shop items for office/company bonuses and agent equipment.
- Fictional rival AI companies with market share, product-space claims, and competitive events.
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
- Agent types
- Items
- Competitors
- Rival events
- Locale dictionaries
- Events
- Upgrades
- Automation upgrades
- Balance coefficients
- Starting state
- Synthetic playtest personas

The app may contain formulas, but content and balancing values should be data-driven.

## User Experience

첫 화면은 랜딩 페이지가 아니라 바로 플레이 가능한 회사 운영 화면입니다.

화면은 카이로소프트식 모바일 경영 게임처럼 작고 읽기 쉬운 정보 덩어리로 구성합니다. 첫 MVP 화면은 다음을 보여줘야 합니다.

- 현재 개월차와 회사 단계.
- 자금, 이용자, 연산력, 데이터, 인재, 신뢰, 화제성, 자동화.
- 출시 가능한 제품과 잠긴 제품의 이유.
- 연구 가능한 AI 능력.
- 최근 회사 기록.
- 명확한 "다음 달" 버튼.
- 자금 부족, 신뢰 하락, 연산력 압박 경고.

UI는 장식적인 웹 대시보드가 아니라, iOS 경영 시뮬레이션처럼 작고 빠르게 읽히는 조작 화면이어야 합니다.

### 메뉴 구성

알파 기준 메뉴는 다음 7개로 정리합니다.

- 회사: 현재 단계, 해금 분야, 활성 제품, 핵심 요약.
- 제품: 개발 가능/잠김 제품, 개발 비용, 진행률, 월 매출, 시장 반응.
- 에이전트: 고용 팀, 장비 장착, AI 에이전트 종류, 능력치, 외형 특색, 선호 아이템.
- 연구: 언어, 코드, 비전, 에이전트 등 AI 능력 업그레이드.
- 상점: 사무실 아이템, 에이전트 장비, 연구/안전/마케팅 물건, 자동화 투자.
- 경쟁: 경쟁사 랭킹, 시장 점유율, 선점 제품, 경쟁사 프로필.
- 기록: 회사 이벤트, 출시 결과, 저장/운영 로그.

메뉴는 기능을 숨기기 위한 장치가 아니라, 작은 화면에서 카이로소프트식 경영 게임처럼 정보를 덩어리별로 넘겨보게 하는 구조입니다.

## Risks

- Scope explosion from the "AI can do anything" premise.
- Spreadsheet feel without emotional feedback.
- Too many resources before the player understands the loop.
- AI theme becoming cosmetic instead of mechanical.
- Balance snowball where one strategy dominates.
- Rival companies feeling cosmetic if their claims do not affect product decisions.
- Localization debt if UI text remains hardcoded after the locale foundation.
- Synthetic testing being mistaken for real user testing.

## Production Rule

Every milestone must ship a small playable improvement and pass:

1. Data validation.
2. Build validation.
3. Agent review.
4. Synthetic playtest.
5. P0/P1 issue resolution.
