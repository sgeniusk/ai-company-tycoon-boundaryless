# Alpha v0.14.2 제작 보고서 — 콘텐츠 기반 추천과 필터

작성일: 2026-05-16

## 요약

v0.14.2는 늘어난 콘텐츠를 실제 플레이 기반으로 정리하는 버전이다. 고용 후보와 아이템이 많아질수록 단순 목록은 읽기 어려워지므로, 현재 캠페인 단계에 맞는 추천과 필터를 먼저 만들었다.

## 구현 내용

- `content-foundation` 모듈 추가.
- 캠페인 콘텐츠 단계 5종: 차고 기반, 초기 스타트업, 스케일업, 기업/산업 확장, 경계 없는 프런티어.
- 고용 후보별 종류, 해금 단계, 추천 여부, 추천 사유 계산.
- 아이템별 해금 단계, 추천 여부, 사무실 배치 가능성 계산.
- 회사 화면에 `기반 다지기` 요약 카드 추가.
- 고용 화면에 현재 기반 설명, 추천 고용 후보, 사람/AI/로봇 필터 추가.
- 상점 화면에 추천 아이템과 카테고리 필터 추가.
- `?scenario=foundation` QA 시나리오 추가.

## 하네스 관점

- Executive Producer: v0.14 콘텐츠 확장이 실제 메뉴 사용성으로 이어졌다.
- Game Designer: 현재 단계에 맞는 추천이 생겨 다음 행동이 더 명확해졌다.
- Systems Architect: 추천 계산은 순수 모듈로 분리했고 UI는 결과만 렌더링한다.
- UX Agent: 고용과 상점 메뉴가 필터를 갖춰 장기 콘텐츠를 스캔할 수 있다.
- Solo Dev Scope Agent: 추천은 데이터와 기존 체크 함수를 재사용해 유지비를 낮췄다.

## 검증

- `npm test -- src/game/content-foundation.test.ts src/game/content.test.ts src/game/asset-manifest.test.ts`: 통과, 17 tests.
- `npm test -- src/game/qa-scenarios.test.ts src/game/content-foundation.test.ts`: 통과, 23 tests.
- `npm run harness:gate`: 통과, 132 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5173/?scenario=foundation`에서 1366x768 렌더링 확인.

## 배포 정책

이번 버전은 기반 증분이므로 Vercel 배포는 하지 않았다. 큰 버전업 때만 공개 배포한다.

## 다음 액션

1. 추천된 고용 후보와 아이템을 제품 개발, 산업 확장, 엔딩 분기에 더 직접적으로 연결한다.
2. 상점과 고용 후보를 “초반 추천 세트”, “산업 확장 세트”처럼 프리셋 묶음으로 보여준다.
3. 연간 승급 심사와 대회 이벤트를 추가해 10년 캠페인의 중간 목표를 촘촘하게 만든다.
