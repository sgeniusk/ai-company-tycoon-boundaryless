# AI 컴퍼니 타이쿤: 바운더리리스

작은 AI 스타트업을 경계 없는 세계 기업으로 키우는 브라우저 기반 타이쿤 시뮬레이션입니다.

프로토타입은 GitHub와 Vercel에 단계별로 공개할 수 있도록 웹 네이티브 스택으로 다시 시작합니다.

## Current Direction

- 런타임: Vite + React + TypeScript
- 배포: Vercel
- 버전 관리: GitHub, 마일스톤 단위 커밋과 푸시
- 게임 형식: 카이로소프트식 압축 경영 시뮬레이션을 벤치마크한 2D 타이쿤
- 제작 방식: PRD, 데이터 검증, 합성 플레이테스트, 에이전트 리뷰 게이트

기존 Godot 파일은 참고 자료로만 남겨둡니다. 새 작업은 `docs/IMPLEMENTATION_STRATEGY.md`와 `docs/BENCHMARK_GAME_DEV_STORY.md`를 기준으로 진행합니다.

## Quick Start

```bash
npm install
npm run dev
```

Validation:

```bash
npm run validate:data
npm run build
```

## Key Docs

- `docs/PRD.md` - 제품 요구사항과 MVP 정의
- `docs/BENCHMARK_GAME_DEV_STORY.md` - Game Dev Story iOS 기준 벤치마크
- `docs/GAME_PRODUCTION_PREP_HARNESS.md` - 모든 게임 제작 전에 쓰는 준비 하네스
- `docs/SYNTHETIC_PLAYTEST_HARNESS.md` - 12명 합성 테스트 프로토콜
- `docs/AGENT_REVIEW_PROTOCOL.md` - 에이전트 자기검증 역할과 게이트
- `docs/IMPLEMENTATION_STRATEGY.md` - 아키텍처, 스택, 배포 전략
- `docs/MILESTONE_PLAN.md` - 단계별 제작 로드맵

## Core Promise

하나의 AI 능력이 여러 제품과 시장을 열고, 그만큼 새로운 압박도 만든다는 감각이 핵심입니다. 플레이어는 성장의 쾌감과 연산비, 화제성, 신뢰 하락, 조직 복잡도의 위험을 동시에 느껴야 합니다.
