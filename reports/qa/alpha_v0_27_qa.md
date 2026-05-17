# v0.27-alpha QA 보고서

작성일: 2026-05-17

## 범위

제품 아이디어 조합실, 제품 조합 데이터베이스, 기존 제품 리뉴얼 후보 표시 QA.

## 자동 테스트

- `npm test -- src/game/product-ideas.test.ts src/ui/layout-contract.test.ts`
- 결과: 통과
- 파일/테스트: 2 files / 19 tests

- `npm run validate:data`
- 결과: 통과

- `npm run harness:gate`
- 결과: 통과
- 파일/테스트: 31 files / 202 tests
- 추가 확인: 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 스크린샷 QA

대상 URL:

- `http://127.0.0.1:5180/?scenario=launch-impact&menu=products`

확인 화면:

- 데스크톱: 1366x768, `/tmp/ai-company-v027-products.png`
- 모바일: 390x844, `/tmp/ai-company-v027-products-mobile.png`

확인 결과:

- 데스크톱 제품 메뉴에서 `아이디어 조합실`이 우측 관리 콘솔 안에 정상 표시된다.
- 소재/산업, 제품 타입, 파격 옵션 선택 컨트롤이 보인다.
- 조합 결과 카드에 궁합 점수, 비용, 필요 역량, 강점/위험이 표시된다.
- 모바일에서는 제품 메뉴 진입 후 내부 스크롤로 조합실을 확인할 수 있다.

## 위험 및 후속 조치

- P1: 현재 조합 결과는 후보 표시이며 실제 제품 프로젝트 생성까지 연결되지는 않았다.
- P1: 리뉴얼 후보도 아직 실제 개발 프로젝트로 전환되지 않는다.
- P2: 데이터가 많이 늘어났으므로 추후 필터/검색/즐겨찾기 UI가 필요할 수 있다.
