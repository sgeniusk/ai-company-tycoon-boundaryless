# v0.34.12-alpha 제작 보고서 — 경쟁사 스카우트 상세 조건

작성일: 2026-05-18

## 목표

스카우트 사건은 있었지만 아직 “어느 경쟁사가 누구를 빼가려 하는지”가 흐릿했다. 이번 목표는 스카우트 사건을 특정 경쟁사의 압박으로 보이게 만들고, 플레이어가 리텐션 보너스나 미션 설득을 누를 때 그 대응이 누구를 상대로 한 방어였는지 기록하는 것이다.

## 이번 구현

- 스카우트 사건에 `sourceCompetitorId`, `sourceCompetitorName`, `offerLabel`, `stakesLabel`을 붙였다.
- 가장 강한 경쟁사의 점유율, 점수, 모멘텀, 공격성을 읽어 스카우트 출처를 고른다.
- 직원 레벨과 현재 유지비를 바탕으로 연봉 배율과 사이닝 보너스 제안 조건을 만든다.
- 에이전트 콘솔 사건 카드에 `staff-incident-source` 블록을 추가했다.
- 인사 대응 결과 기록에도 경쟁사 이름, 제안 조건, 시장 압박을 복사한다.
- 회사 기록 하이라이트의 인사 사건 카드가 스카우트 방어 시 경쟁사 이름과 점유율을 포함한다.
- `staff-incidents` QA 시나리오가 스카우트 출처와 연봉 제안을 검증한다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 인사 사건이 회사 내부 문제에서 경쟁사 압박과 연결되어 시장 서사가 좋아졌다.
- Game Designer Agent: P1 해결. 핵심 인재 육성은 이제 시장 점유율 높은 경쟁사의 타깃이 될 수 있어 장기 육성 긴장이 커진다.
- Systems Architect Agent: P2 양호. 스카우트 출처는 사건 계산 단계에서 만들어지고, 결과 기록과 UI는 같은 데이터를 재사용한다.
- QA Agent: P1 해결. 사건 상세, 대응 기록, 공유 카드, UI 계약, QA 시나리오를 테스트로 고정했다.
- Balance Agent: P2 관찰. 제안 조건은 아직 표시 중심이지만, 추후 실제 경쟁사 스카우트 이벤트 비용/성공률로 확장 가능하다.
- UX Agent: P2 해결. 스카우트 카드에서 경쟁사/연봉/점유율을 별도 블록으로 읽을 수 있다.
- UX Agent 추가 QA: P2 해결. 브라우저 QA 중 결과 카드 하단 문구가 좁은 패널에서 세로로 찢어지는 문제를 발견했고, 카드 레이아웃을 단일 열로 바꿔 수정했다.
- Retention / LTV Agent: P2 양호. 경쟁사에게 핵심 인재를 빼앗기지 않는 서사가 장기 직원 애착을 강화한다.
- Shareability Agent: P2 해결. “제미있니 스카우트 방어” 같은 스크린샷 문구가 회사 기록에 남는다.
- Solo Dev Scope Agent: P2 양호. 별도 이벤트 시스템을 만들지 않고 기존 인사 사건 데이터에 출처만 확장했다.

## 남은 작업

- 스카우트 제안을 실제 경쟁사 이벤트/시장 선점 이벤트와 연결하기.
- 스카우트 미대응 시 특정 직원 충성도 하락 또는 퇴사 확률을 조정하기.
- 직원 카드에 최근 사건 이력 1줄을 남기기.
- 대응 직후 중앙 토스트/팝업으로 결과를 더 강하게 연출하기.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 84 tests
- `npm run harness:gate` 통과, 38 files / 269 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5199/?scenario=staff-incidents&menu=agents`
- 데스크톱 QA: 인사 사건 패널 1개, 스카우트 출처 블록 1개, 대응 버튼 6개, 제안 조건/연봉/점유율 문구 표시, 콘솔 오류 0건, 가로 오버플로 0
- 해결 QA: 리텐션 보너스 클릭 후 최근 인사 대응 패널 1개, 결과 카드 1개, `챗지오디`와 점유율 문구 유지, 결과 카드 단일 열 줄바꿈 확인, 콘솔 오류 0건
- 모바일 QA: 390×844에서 스카우트 출처 블록 1개, 하단 탭 표시, 가로 오버플로 0, 콘솔 오류 0건
- 스크린샷: `/tmp/ai-company-v03412-poaching-offer-desktop.png`, `/tmp/ai-company-v03412-poaching-resolution-desktop.png`, `/tmp/ai-company-v03412-poaching-mobile.png`
