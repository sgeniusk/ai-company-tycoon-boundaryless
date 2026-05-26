# v0.56 플레이테스트 슬라이스 QA — 사건 화면화 1차

작성일: 2026-05-21

## 범위

- `office-visuals`가 v0.56 플레이테스트 슬라이스에서 경쟁사 사건 1개와 직원 사건 1개를 화면 사건으로 보여주는지 확인한다.
- 최종 아트 교체가 아니라, 현재 게임 화면에서 사건 압박이 로그 밖으로 드러나는지를 검수한다.

## 변경 요약

- `office-visuals` 시나리오에 `talent_poach` 경쟁사 이벤트를 고정했다.
- 같은 시나리오에서 직원 번아웃과 스카우트 위험이 함께 발생하도록 직원 상태를 조정했다.
- 메인 이벤트 스택에 `직원 화면 사건`과 `경쟁사 화면 사건` 패널을 추가했다.
- 직원 사건 패널은 대응 선택지를 직접 제공한다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 2개 테스트 파일 / 64개 테스트 통과
- `npm run build`
  - 결과: 통과
  - 요약: TypeScript와 Vite production build 성공
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=office-visuals`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-office-incidents.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 40개 테스트 파일 / 305개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 사건 패널이 실제 플레이 중 흐름을 적당히 긴장시키는지, 과하게 가리는지는 블라인드 테스트가 필요하다.
- 모바일은 아직 “깨지지 않는 수준”으로만 본다. v0.56의 주 검증 환경은 데스크톱 웹이다.
