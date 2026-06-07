# CHANGELOG — Unity Port

구조·아키텍처 변경만 기록한다.

## 2026-06-07 — P0 부트스트랩
- `unity/` Unity 6000.4.10f1 프로젝트 신설 (모노레포 하위, 사용자 선택).
- 패키지 — URP 17.4.0, com.unity.2d.sprite, Input System 1.19.0, uGUI 2.0.0(TMP), Test Framework 1.6.0.
- 아키텍처 결정 — 코어(Core/Data/Systems/Save)는 헤드리스 순수 C# 레이어, UI/Presentation 분리. 이벤트는 정적 `GameEvents` 허브(Godot EventBus 대응)로 시작.
- 코어 시드 — GameModel(GameState 대응), ResourceId(+데이터 키 매핑), GameEvents, ResourceDef(SO 패턴).
- 하네스 — Unity 전용 CLAUDE/AGENTS/feature_list/progress/session-handoff/init.sh. 루트 React/Godot 하네스 보존.
