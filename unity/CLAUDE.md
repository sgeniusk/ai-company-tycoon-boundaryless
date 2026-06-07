# CLAUDE.md — AI Company Tycoon (Unity Port)

세션 시작 시 Claude Code가 읽는 Unity 포트 전용 기억이다. 에이전트-중립 규칙은 [AGENTS.md](AGENTS.md)를 본다.
루트 레포의 React/Godot 하네스(`../CLAUDE.md` 등)는 건드리지 않는다. 이 하네스는 `unity/` 하위만 관할한다.

## Project identity
Godot 4 프로토타입을 Unity 6(6000.4.10f1) 기반 2D 모바일(Android/iOS) 상업 타이쿤으로 재설계한다.
- 로직 원본 — `../scripts/*.gd` (시스템 설계의 정답지)
- 재사용 콘텐츠 — `../data/*.json` (한국어 1차), `../public/assets/*.png`
- 느낌 레퍼런스 — `../src/`(React 빌드)와 카이로소프트 "게임 개발 스토리"
- 아트 방향 — 카이로소프트식 깔끔한 2D. 단 2D에 얽매이지 않는다(2.5D/깊이 허용).

**v0.1 성공 기준** — 세로 모바일 화면 한 개에서 월 진행·제품 출시·능력 업·이벤트·세이브로 핵심 루프가 실기기에서 10분 끊김 없이 도는 Vertical Slice.

## 역할 경계 — 멀티 CLI 분업
| CLI | 자리 | 맡는 일 |
|---|---|---|
| Claude (나) | 편집장·하네스 엔지니어 | 정본·스펙·아키텍처, 영향도 높은 코드 직접 구현, 오케스트레이션 |
| Codex CLI | 구현자 | 잘 정의된 단순·반복 코딩, 리팩토링, 보일러플레이트. reasoning=매우 높음으로 실행 |
| Antigravity (agy) | 교차검증자 | 다른 모델 적대적 검증, 멀티모달·실기기 QA (선택) |

기본 흐름 — 나(스펙·아키텍처) → Codex(구현) → 나(검증·정본 반영). 영향도·중요도 높은 작업은 내가 직접 한다.

## Context Budget
점진적 공개를 쓴다. 시작 시 이 파일·`feature_list.json`·`progress.md`만 읽는다. Godot 원본(`../scripts`)·데이터(`../data`)는 해당 피처 작업 때만 연다. 루트 상태 파일은 작게 유지하고 오래된 증거는 `CHANGELOG.md`로 옮긴다.

## Startup Workflow
1. `pwd`로 `unity/`인지 확인
2. 이 파일 완독
3. 선택 피처에 필요한 Godot 원본/데이터만 읽기
4. `./init.sh`로 검증 (Unity EditMode 테스트)
5. `feature_list.json`에서 미완 피처 하나 선택
6. `progress.md`에서 상태·블로커·다음 단계 확인

## 자율성 — 가정-후-표시
되돌릴 수 있는 행동(파일 생성, 브랜치 내 작업)은 기본값으로 진행하고 가정은 끝에 모아 보고한다. 블로킹 질문은 되돌리기 어려운 결정(push·삭제·외부 발행·비용)에만.

## Working Rules
- 한 번에 한 피처. 검증 안 돌리고 done 금지.
- 스코프 유지 — 현재 피처 무관 파일 수정 금지. 루트 레포 React/Godot 파일은 보존.
- 종료 전 `progress.md`·`feature_list.json` 갱신.
- push·force·삭제는 사용자 확인 후.
- 코어(Core/Data/Systems/Save)는 UnityEngine.UI 비의존 헤드리스 레이어로 유지해 EditMode 테스트가 가능하게 한다.

## Writing style
- 한국어 우선. 문장은 `:`로 끝내지 않는다 — 종결은 `.`, `?`, `!`만.
- 비-자명한 새 C#/문서 파일은 한 줄 한국어 헤더로 시작.

## Definition of Done
- [ ] 목표 동작 구현
- [ ] `./init.sh`(EditMode 테스트) 또는 문서화된 검증 실제 실행
- [ ] `feature_list.json`/`progress.md`에 압축 증거 기록
- [ ] 표준 시작 경로로 재시작 가능

## When editing — 보고 순서
무엇이 바뀜 / 왜 / 영향 모듈 / 남은 모호함 / 다음 이슈 제안(`[모듈]` 프리픽스). 큰 구조 변경은 `CHANGELOG.md`에 기록한다.
