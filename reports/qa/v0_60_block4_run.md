# v0.60 block #4 QA run - high-risk industry combos

Date: 2026-05-29
Scope: v0.60-alpha-boundaryless-industry-expansion block #4 only

## Summary

Implemented 10 deterministic high-risk / high-reward industry combos by mirroring the block #3 industry synergy path:

- New data: `data/industry_combos.json`
- New derive helper: `src/game/industry-combos.ts` with `getIndustryComboSummary(state)`
- New data export and TypeScript types for industry combos
- Monthly effect aggregation added beside `industrySynergyEffects` in `getMonthlyStrategicEffects`
- Products UI now surfaces active high-risk combos and their `risk_label`
- Data validation now enforces exactly 10 combos, valid `required_domains`, non-empty `risk_label`, tags, resource maps, and at least one negative downside per combo
- Tests added for combo data contract, monthly aggregation, and UI surfacing

No changes were made to `data/product_ideas.json` compatibility rules or existing `data/industry_synergies.json`.

## Combo catalogue

| ID | Required domains | Main reward | Downside / risk |
| --- | --- | --- | --- |
| `full_stack_physical_empire` | manufacturing, logistics, energy | cash +900, users +420, automation +4 | trust -4; supply-chain incidents can damage brand trust |
| `autonomous_mobility_bet` | robotics, mobility, logistics | users +620, cash +520, data +7 | trust -5; safety incidents create public risk |
| `vertical_infra_foundry` | semiconductors, energy, foundation_models | compute +34, cash +640, hype +4 | automation -3; infrastructure concentration creates bottlenecks |
| `robot_factory_subscription` | robotics, manufacturing | cash +560, automation +6, users +260 | compute -22; robot operations consume monthly compute |
| `grid_scale_ai_ops` | enterprise_automation, energy | cash +610, trust +5, automation +3 | data -6; conservative enterprise ops consume data reserves |
| `creator_microfactory_drop` | creator_tools, manufacturing, logistics | hype +8, cash +470, users +360 | trust -3; quality variance can hurt fandom trust |
| `industrial_learning_network` | education, manufacturing, robotics | users +540, trust +4, data +6 | cash -180; field curriculum costs become fixed spend |
| `toy_robot_supply_frenzy` | toys, robotics, logistics | users +580, hype +7, cash +430 | trust -4; child-safety controversy risk |
| `semiconductor_robotics_fab` | semiconductors, robotics, manufacturing | cash +820, compute +18, automation +5 | talent -3; specialized staffing pressure |
| `odd_industry_energy_platform` | odd_industries, energy, logistics | hype +9, cash +500, users +330 | compute -18; unpredictable field ops consume compute |

## simulation.ts change

`src/game/simulation.ts` changed only the block #3-style aggregation path:

- line 3861: `const industryComboEffects = getIndustryComboSummary(state).totalMonthlyEffects;`
- line 3871: `if (Object.keys(industryComboEffects).length > 0) effects.push(industryComboEffects);`

No random tick logic or separate monthly tick path was added.

## Verification

Targeted checks:

```text
npm run validate:data
Data validation passed.

npm test -- --run src/game/boundaryless-expansion.test.ts src/ui/layout-contract.test.ts
Test Files  2 passed (2)
Tests  75 passed (75)
```

Full gate:

```text
npm run harness:gate
Test Files  43 passed (43)
Tests  428 passed (428)
Data validation passed.
tsc && vite build
110 modules transformed.
built in 718ms
```

Final status: PASS at 43 files / 428 tests.
