# v0.56 Blind Playtest Preflight

Status: 원격 테스트 준비
작성일: 2026-05-24

## 판정

- 원격 플레이어 URL: OK
- 현재 요청 패킷 URL: 동기화 완료
- 튜토리얼 딜레이: OK
- 실제 세션: 0/5
- 최종 아트 요청: 대기

## 원격 URL

- 환경 변수: `PLAYTEST_BASE_URL`
- 플레이어 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`
- 진행자 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=1`

현재 request packet과 AGY outbox는 위 원격 URL로 동기화되어 있다. 세션 전에는 이 URL이 계속 열리는지만 다시 확인한다.

## 튜토리얼 딜레이 점검

- idea composer waits for activeProducts: OK
- competition tutorial waits for activeProducts: OK

이 점검은 첫 제품 개발 전 `아이디어 조합실` 또는 `경쟁사` 튜토리얼이 추천 첫 제품 카드 위로 끼어들지 않도록 유지하는 preflight다.

## 잠금 확인

- 실제 사람 세션 파일은 아직 0/5 상태여야 한다.
- 최종 그래픽 에셋 요청은 `qa:asset-handoff`가 가능을 내기 전까지 보내지 않는다.
- AGY 에이전트 리뷰는 실제 사람 세션을 대체하지 않는다.

## 다음 행동

1. 원격 테스트를 진행할 때는 `PLAYTEST_BASE_URL=https://...`와 함께 `npm run qa:blind-url-sync`를 먼저 실행한다.
2. 같은 `PLAYTEST_BASE_URL`로 `npm run qa:blind-preflight`를 다시 실행해 URL 동기화와 튜토리얼 딜레이를 확인한다.
3. `qa:blind-readiness`와 `qa:asset-handoff`를 다시 실행해 세션/아트 잠금을 확인한다.
