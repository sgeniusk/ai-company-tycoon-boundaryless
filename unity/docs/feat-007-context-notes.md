# feat-007 컨텍스트 노트 — 리플레이성 척추 포팅 (런 모디파이어)

카이로식 1회성 플레이를 깨는 로그라이크 척추를 React판(v0.63~0.67 검증 완료)에서 Unity 헤드리스 코어로 이식한다. 정답지는 `../../src/game/run-modifiers.ts`, 정본 데이터는 `../../data/run_modifiers.json`(4축 — 도시 11/세계관 12/시장 8/창업자 9, tag_effects 40종). 상위 설계는 `../../reports/v0_63_plus_content_roadmap.md`(5-레버 — 다양성·가독성·유의미한 차이·메타·엔딩).

## 스코프 분할
- **feat-007 (이번)** — 척추. 블록 #1 선택 엔진+세이브, #2 월간 틱 훅, #3 연중 세계 이벤트, #4 세계 뽑기 리빌 UI.
- **feat-008 (다음)** — 난이도 티어(`difficulty_tiers.json`), 태그 파생 아키타입(`derivation_rules.json`), 멀티 엔딩(`endings.json`). 데이터 정본은 전부 루트에 이미 존재.

## 블록 분해
### 블록 #1 — 런 모디파이어 기반 (선택 엔진 + 상태 + 세이브)
- `Data/Schema/RunModifierOptionDef.cs` — SO. id/displayName/description/axis/startingResourceDeltas/startingCapabilityDeltas/tags.
- `Data/Schema/RunTagEffectsConfig.cs` — SO 1개. tag→자원 델타 목록(tag_effects 40종).
- `DataImporter.ImportRunModifiers()` — `run_modifiers.json` → `ScriptableObjects/RunModifiers/` + DataCatalog 추가.
- `Core/RunModifiersState.cs` — 순수 C#. seed/4축 id/challengeTier("standard" 예약, feat-008 선마이그레이션 방지)/tags.
- `Systems/RunModifierService.cs` — FNV-1a 해시 시드 결정론 선택(React `hashSeed`/`selectOption` 동일 포팅, salt — city/world/market/founder), 시작 델타 적용(자원 min/max·능력 0/max 클램프), 태그 중복 제거.
- `SaveService` — runModifiers 블록 추가. 구세이브(필드 없음) → 표준 기본값 위생 처리.
- `SimulationContext.Create`에 선택적 입력 — 기본 런은 default_city/standard/steady_market/no_founder = 델타 0, 기존 동작 불변.
### 블록 #2 — 월간 틱 훅 (additive)
- MonthController에 한 단계 추가 — 활성 태그의 tag_effects 합산을 자원에 가산. 표준 런은 태그 없음 = 효과 0(회귀 없음). React `getRunModifierMonthlyEffects` 대응.
### 블록 #3 — 연중 세계 이벤트
- `world_events.json` 26종 임포트 + `WorldEventService` — 시드 파생 결정론으로 매년 1건 예약, `WorldEventHistory`로 중복 방지. React v0.63 #3 대응.
### 블록 #4 — 세계 뽑기 리빌 UI
- 새 런 시작 시 굴린 세계 4축을 보여주는 리빌 연출(uGUI, feat-006 톤·UiTween 재사용). 헤드리스 캡처로 시각 검증.

## 결정
- 결정론 — React와 동일 FNV-1a. 같은 시드면 두 구현이 같은 세계를 굴린다(크로스 체크 가능).
- challengeTier 필드는 #1에서 예약만 하고 항상 "standard"(효과 없음). feat-008에서 활성화.
- 코어/시스템은 UnityEngine.UI 비의존 유지 — EditMode 헤드리스 테스트.
- 검증 — `./init.sh` EditMode(베이스라인 29 + 신규), 표준 런 36개월 플레이스루 불변 확인, 블록 #4는 ScreenshotCaptureTests.

## 진행 기록
- 2026-06-11 — 설계 확정(3트랙 병렬 사용자 승인). 블록 #1 착수.
