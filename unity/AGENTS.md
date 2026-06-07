# AGENTS.md — AI Company Tycoon (Unity Port)

세 CLI(Claude·Codex·agy)가 공유하는 단일 계약이다. Claude 전용은 [CLAUDE.md](CLAUDE.md)를 본다. 이 계약은 `unity/` 하위만 관할하며 루트 레포 React/Godot 하네스는 보존한다.

## 일의 자리 (Roles)
| CLI | 자리 | 맡는 일 | 넘기지 않는 것 |
|---|---|---|---|
| Claude | 편집장·하네스 | 정본·스펙·아키텍처, 영향도 높은 구현, 오케스트레이션 | — |
| Codex | 구현자 | 스펙 구현, 리팩토링, 보일러플레이트 (reasoning 매우 높음) | 아키텍처·정본 결정 |
| agy | 교차검증자 | 적대적 검증, 멀티모달·실기기 QA | 구현 주도 |

흐름 — Claude(스펙) → Codex(구현) → Claude(검증·정본).

## 스택 (Stack)
- Unity 6000.4.10f1, URP 17.4, com.unity.2d.sprite, Input System 1.19, uGUI 2.0(TMP), Test Framework 1.6. 세로 고정 모바일.
- 코드 — `Assets/_Project/Scripts/{Core,Data,Systems,Save,UI,Presentation}` asmdef로 분리. Core/Data/Systems/Save는 UnityEngine.UI 비의존 헤드리스 레이어로 유지.
- 데이터 — `../data/*.json`을 ScriptableObject로 임포트(P1). 원본 JSON은 정답지.

## 시작 워크플로 (Startup Workflow)
코드를 쓰기 전에 (Before writing code):
1. `pwd`로 `unity/` 확인
2. `CLAUDE.md`·이 파일 완독
3. `./init.sh`로 검증
4. `feature_list.json`에서 미완 피처 하나 선택
5. `progress.md`에서 상태·블로커 확인

## 작업 규칙 (Working Rules)
- 한 번에 한 피처. 검증 전 done 금지. 스코프 유지.
- 상태 파일은 요약만. 전체 로그는 docs/reports로.
- push·force·삭제는 사용자 확인 후.

## Codex 위임 규칙 (Delegation)
- Claude가 자기완결적 스펙(파일 경로·시그니처·done 기준·검증 명령)을 먼저 쓴다. "findings 기반으로 알아서"는 금지.
- Codex는 zero-context로 시작하니 Godot 원본 경로와 데이터 스키마를 스펙에 명시한다.
- 위임 후 Claude가 `./init.sh`로 교차검증하고 정본에 반영한다.

## 자율성 — 가정-후-표시 (Assume & Annotate)
되돌릴 수 있는 행동은 묻지 않고 진행하고 가정은 끝에 모아 보고한다. 블로킹 질문은 되돌리기 어려운 결정에만.

## Definition of Done
- [ ] 목표 동작 구현
- [ ] 검증 실제 실행 (`./init.sh` = Unity EditMode 테스트, 또는 문서화된 명령)
- [ ] 압축 증거 기록
- [ ] 표준 시작 경로로 재시작 가능

## 세션 종료 (End of Session)
1. `progress.md`에 상태·블로커·다음 단계·압축 증거 갱신
2. `feature_list.json`에 피처 상태·한 줄 증거 갱신
3. 끊겼거나 크면 `session-handoff.md` 갱신
4. 다음 세션이 `./init.sh`를 바로 돌릴 수 있게 정리

## 출력 (Output)
한국어 우선. 문장은 `:`로 끝내지 않는다. 보고 순서 — 무엇이 / 왜 / 영향 / 모호함 / 다음 이슈.
