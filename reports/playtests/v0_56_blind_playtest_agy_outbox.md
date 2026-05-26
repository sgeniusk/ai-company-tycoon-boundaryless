# v0.56 Blind Playtest AGY Outbox

Status: 발송 준비 / 실제 발송 미확인
작성일: 2026-05-23
받는 곳: AGY
관련 패킷: `reports/playtests/v0_56_blind_playtest_request_packet.md`

## 보낼 메시지

AI Company Tycoon: Boundaryless v0.56의 실제 블라인드 플레이테스트 5회를 진행해 주세요.

목표는 최종 그래픽 에셋 투입 전에, 실제 사람이 설명 없이 첫 20~30분을 플레이했을 때 첫 목표와 보상 흐름이 읽히는지 확인하는 것입니다.

중요 운영 원칙:

- 플레이어에게 게임 설명 금지
- 플레이 중 질문에 답하지 않기
- 관찰 HUD는 진행자에게만 노출
- 플레이어 시작 URL은 `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`
- 진행자 관찰 URL은 `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=<세션번호>`
- 외부 세션 전에는 `PLAYTEST_BASE_URL=https://<remote-preview-url> npm run qa:blind-url-sync`로 위 URL을 동기화하고, `PLAYTEST_BASE_URL=https://<remote-preview-url> npm run qa:blind-preflight`로 원격 URL을 확인
- 세션 01-05별 관찰 URL은 `reports/playtests/v0_56_blind_playtest_session_links.md`를 기준으로 사용
- 실제 세션 전에는 결과를 채우지 말아 주세요
- 각 세션이 끝난 뒤에만 해당 파일의 상태 줄을 `Status: 완료`로 변경
- `P0:`는 반드시 `없음` 또는 구체적인 P0로 작성
- `P1:`은 후속 튜닝 후보로 작성

세션 파일:

- `reports/playtests/v0_56_blind_playtest_session_01.md`
- `reports/playtests/v0_56_blind_playtest_session_02.md`
- `reports/playtests/v0_56_blind_playtest_session_03.md`
- `reports/playtests/v0_56_blind_playtest_session_04.md`
- `reports/playtests/v0_56_blind_playtest_session_05.md`

완료 후 확인:

```bash
npm run qa:blind-summary
```

최종 그래픽 에셋 투입은 요약이 아래 상태일 때만 시작합니다.

- 실제 세션: 5/5
- 열린 P0: 0
- P0 미기록: 0
- 상태 미인정: 0
- 증거 미기록: 0
- 아트 투입 판정: 가능

P1은 후속 튜닝 backlog로 남겨도 되지만, P0와 필수 증거 누락은 먼저 닫아야 합니다.

전체 요청서와 체크리스트는 `reports/playtests/v0_56_blind_playtest_request_packet.md`를 기준으로 봐 주세요.

## 발송 전 체크

- `npm run dev -- --port 5201`로 로컬 서버 준비
- 외부 진행이면 `PLAYTEST_BASE_URL`을 지정하고 `npm run qa:blind-preflight` 실행
- 플레이어 URL과 진행자 URL 분리
- 세션 파일 5개가 아직 `Status: 예정`인지 확인
- 실제 발송 후 이 파일의 Status를 `발송 완료`로 바꿀 수 있음
