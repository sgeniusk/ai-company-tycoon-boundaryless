# Art Intake — Final Source Art

작성일: 2026-05-21  
상태: planned

## 목적

`v0.55-alpha`에서 임포트/정규화/스크린샷 QA 경로는 준비됐다. 이 문서는 실제 최종 또는 준최종 픽셀아트 원본을 수급하고 게임용 런타임 에셋으로 교체하는 작업만 다룬다.

Art Intake는 `v0.56-alpha` 플레이테스트 슬라이스의 P0가 아니다. 최종 아트가 없어도 플레이 가능한 재미 검증은 진행한다.

현재 아트 요청/투입 게이트는 `npm run qa:asset-handoff`로 확인한다. 이 명령은 `qa:blind-summary`, `qa:blind-issues`, `qa:art-gate`를 순서대로 실행한 뒤 `reports/playtests/v0_56_final_art_handoff_packet.md`를 만든다. 패킷이 `Status: 아트 요청 가능`이 되기 전에는 AGY나 외부 제작자에게 최종 그래픽 에셋 제작 착수를 요청하지 않는다.

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

Run the five real blind-test sessions first, then run `npm run qa:asset-handoff`. After the handoff packet says `Status: 아트 요청 가능`, collect or generate one complete source set, import it through the existing commands, and attach the resulting desktop/mobile screenshots to a QA report under `reports/qa/`.

## Antigravity Handoff

안티그래비티 또는 외부 제작자에게 넘길 구체 브리프는 `docs/ANTIGRAVITY_ART_BRIEF.md`를 기준으로 한다. 실제 전달 패킷은 `reports/playtests/v0_56_final_art_handoff_packet.md`이며, 제작 착수 시점은 `npm run qa:asset-handoff`가 `아트 요청 가능`을 보여준 뒤다.
