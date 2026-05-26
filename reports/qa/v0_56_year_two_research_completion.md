# v0.56 Year-Two Research Completion QA

작성일: 2026-05-21

## 목적

연간 지시가 추천한 연구를 `바로 연구`로 실행한 뒤, 플레이어가 연구 완료를 보상 순간으로 읽고 다음 제품 후보로 이어지는지 검증한다.

## 대상

- URL: `http://127.0.0.1:5201/?scenario=year-two-research-complete`
- 주요 UI: `research-completion-ribbon`
- 상태: 2년차 1월, `신뢰 복리 프로그램` 적용 중, `엔터프라이즈` 연구 완료 직후

## 기대 동작

- 연구 패널 상단에 `연구 완료` 리본이 먼저 보인다.
- 리본은 연구명, 레벨 상승, 사용 자원, 해금 시장, 제품 후보를 보여준다.
- `제품 후보 보기` 버튼이 연구 보상을 다음 제품 행동으로 연결한다.
- 저장/불러오기 후에도 `lastCapabilityUpgrade`가 유지된다.
- 모바일 390×844 첫 화면에서도 `연구 완료` 리본의 시작부가 보인다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 출력: 3 test files / 113 tests passed
- `npm run build`
  - 결과: 통과
  - 출력: TypeScript와 Vite production build 성공
- Headless Chrome desktop capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-research-complete.png`
- Headless Chrome mobile capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-research-complete-mobile.png`

## 남은 리스크

- `제품 후보 보기` 이후 실제 제품 메뉴에서 어떤 후보를 눌러야 하는지까지는 아직 블라인드 테스트 전이다.
- 모바일 기본 높이에서는 리본의 상세 그리드 일부가 접힐 수 있으므로 실제 터치 스크롤에서 제품 후보 버튼까지 확인해야 한다.
