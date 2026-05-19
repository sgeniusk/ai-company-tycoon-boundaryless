# v0.47-alpha 제작 보고서 — 시트 프리뷰와 깊이 정렬

작성일: 2026-05-19

## 목표

고밀도 픽셀 시트를 실제 게임 화면에 넣은 뒤, 다음 AI 생성 시트 교체 때 빠르게 검수할 수 있는 화면 내 프리뷰와 아이소메트릭 겹침 정렬을 만든다.

## 구현

- `asset_manifest.json` 버전을 `0.47-alpha`로 올렸다.
- 캐릭터/오브젝트 시트에 `density`와 `preview_frames`를 추가했다.
- `GameStage`가 QA 시나리오 라벨을 받아 `OfficeSpriteSheetInspector`를 조건부 렌더링한다.
- `OfficeSpriteSheetInspector`는 현재 atlas에서 대표 프레임을 같은 slicing 함수로 잘라 보여준다.
- 사무실 구획, 장식 프롭, 액터에 y좌표 기반 `zIndex`를 적용했다.
- 모바일에서는 프리뷰를 작게 접어 사무실 조작 UI를 보호한다.

## 에이전트 리뷰

- Executive Producer: P1 없음. 다음 에셋 교체 검수 비용을 줄이는 작업이다.
- Game Designer: P1 없음. 사무실 앞뒤 관계가 이전보다 안정적으로 읽힌다.
- Systems Architect: P1 없음. 프리뷰 프레임은 manifest 데이터이며, 렌더링은 기존 slicing 경로를 재사용한다.
- QA Agent: P1 없음. 대표 atlas 프레임을 화면 안에서 확인할 수 있어 경로/슬롯 오류를 더 빨리 잡을 수 있다.
- UX Agent: P2. QA 시나리오 전용 프리뷰라 일반 플레이 화면은 어지럽히지 않는다. 모바일도 압축 표시한다.
- Solo Dev Scope Agent: P1 없음. 새 외부 에셋 없이 검수 체계를 보강했다.

## 다음 작업

1. 실제 AI 생성 캐릭터 시트를 `v046-agents-hires.png` 규격으로 교체한다.
2. 프리뷰 프레임에서 실루엣, 투명 배경, 기준점, 행 순서를 검수한다.
3. 겹침이 어색한 액터/장식 좌표를 아이소메트릭 바닥 그리드 기준으로 보정한다.
