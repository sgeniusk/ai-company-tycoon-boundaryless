# Art Intake — Final Source Art

작성일: 2026-05-21  
상태: planned

## 목적

`v0.55-alpha`에서 임포트/정규화/스크린샷 QA 경로는 준비됐다. 이 문서는 실제 최종 또는 준최종 픽셀아트 원본을 수급하고 게임용 런타임 에셋으로 교체하는 작업만 다룬다.

Art Intake는 `v0.56-alpha` 플레이테스트 슬라이스의 P0가 아니다. 최종 아트가 없어도 플레이 가능한 재미 검증은 진행한다.

## 필요한 원본

| Asset | Required Source | Runtime Output | Import Command |
|---|---:|---:|---|
| Character event-pose sheet | 1152×9600 RGBA PNG | 576×4800 PNG | `npm run assets:v053 -- --source <character-source>` |
| Office object sheet | 2560×1920 RGBA PNG | 1280×960 PNG | `npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>` |
| Isometric office backdrop | 5120×2880 RGBA PNG | 2560×1440 PNG | `npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>` |

## Acceptance Checklist

- Character sheet preserves the 3-column, 25-row event-pose contract.
- Character rows still cover `idle`, `work`, `card_use`, `cheer`, and `alert`.
- Feet anchors remain stable at the office-scene display scale.
- Office object sheet preserves the existing object frame contract.
- Backdrop frames the office without hiding the actor focus panel, command HUD, or QA inspector.
- `npm run qa:office-visuals:screenshots` produces desktop and mobile screenshots after import.
- QA compares actor anchors, object depth, backdrop framing, command HUD fit, and text overlap against the v0.55 baseline.

## Non-Goals

- Do not block `v0.56-alpha` on final art.
- Do not add new gameplay systems during art intake.
- Do not change manifest frame contracts unless a separate migration plan is written.

## Next Action

Collect or generate one complete source set, import it through the existing commands, and attach the resulting desktop/mobile screenshots to a QA report under `reports/qa/`.
