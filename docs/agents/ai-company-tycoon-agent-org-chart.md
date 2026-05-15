# AI Company Tycoon 제작 에이전트 조직도

## 목적

로그라이트 덱빌딩 AI 회사 경영 게임으로 방향을 전환하면서, 제작 하네스도 장르에 맞게 전문화한다. 이 조직도는 기능을 만들 때 어떤 관점이 반드시 검증해야 하는지를 정리한다.

주요 시각 자료: [ai-company-tycoon-agent-org-chart.html](./ai-company-tycoon-agent-org-chart.html)

## 역할 표

| 조직 | 역할 | 입력 | 출력 |
|---|---|---|---|
| Founder/User | 최종 비전과 우선순위 결정 | 아이디어, 플레이 감각, 승인 | 방향 결정, 우선순위 |
| Orchestrator Agent | 작업 분해와 충돌 조정 | 요청, 로드맵, 현재 빌드 | 구현 계획, 통합 판단 |
| Harness Gate | PRD, 테스트, 빌드, UX, 보고서 검증 | 테스트 결과, 보고서, 브라우저 QA | 통과/보류 판정 |
| Product Detail Agent | 모호한 아이디어를 요구사항으로 변환 | 사용자 발화, 벤치마크 | 기능 명세 |
| Benchmark Agent | 참고작에서 재사용 가능한 패턴 추출 | Game Dev Story, 덱빌더, 로그라이트 사례 | 벤치마크 메모 |
| Deck System Engineer | 카드, 손패, 드로우, 보상 구조 설계 | 카드 데이터, 플레이 로그 | 덱 룰, 테스트 |
| Roguelite Meta Engineer | 실패 보상, 영구 해금, 새 런 구조 설계 | 런 결과, 업적, 메타 해금 | 장기 동기 루프 |
| Puzzle Mechanics Engineer | 개발 퍼즐과 제품 완성도 연결 | 프로젝트 상태, 에이전트 능력치 | 퍼즐 점수, 결과 반영 |
| Balance Simulation Engineer | 카드/경제/메타 보상 악용 검증 | 시뮬레이터, 데이터 | 밸런스 보고서 |
| UX Flow Agent | 첫 30초, 메뉴, 경고, 반복 조작 검증 | 화면, QA 시나리오 | UI 개선안 |
| Retention/LTV Agent | 재방문 이유와 장기 목표 검증 | 런 결과, 해금, 플레이테스트 | 리텐션 리스크 |
| QA/Release Agent | 안정성, 저장/로드, 배포 준비 검증 | 테스트, 빌드, 브라우저 | QA 보고서 |

## 하네스 게이트

- 데이터 검증: `npm run validate:data`
- 게임 로직 테스트: `npm test`
- 프로덕션 빌드: `npm run build`
- 상용 준비 통합 게이트: `npm run harness:gate`
- 브라우저 QA: `?scenario=fresh`, `?scenario=project`, `?scenario=deck`, `?scenario=commercial`

## 운영 리듬

1. 사용자가 방향이나 기능을 제안한다.
2. Orchestrator가 버전 범위와 P0/P1 리스크를 정한다.
3. Product Detail, Benchmark, UX가 기능의 이유와 화면 위치를 정리한다.
4. Deck/Meta/Puzzle/Balance 엔지니어가 장르 핵심 루프를 검증한다.
5. Implementation Agent가 작은 단위로 구현한다.
6. QA/Release Agent와 Harness Gate가 테스트, 데이터, 빌드, 보고서를 확인한다.
7. Retention/LTV Agent가 다음 런 이유와 장기 목표를 평가한다.

## 다음 빌드 큐

- v0.12.1: 퍼즐 직접 선택과 카드-퍼즐 시너지.
- v0.12.2: 카드 보상 선택과 덱 압축/삭제.
- v0.12.3: 실패 화면, 런 기록, 메타 해금 화면 강화.
- v0.13.0: 픽셀아트 에셋 파이프라인과 덱 카드 비주얼 규격.
