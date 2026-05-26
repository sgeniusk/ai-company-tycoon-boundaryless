# v0.56 Blind Playtest URL Sync

Status: URL 동기화 완료
작성일: 2026-05-24

## URL

- 플레이어 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`
- 진행자 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=1`
- AGY 세션 템플릿 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=<세션번호>`

## 갱신 파일

| File | Changed |
|---|---|
| `v0_56_blind_playtest_request_packet.md` | yes |
| `v0_56_blind_playtest_agy_outbox.md` | yes |

## 다음 행동

1. `npm run qa:blind-preflight`를 같은 `PLAYTEST_BASE_URL`로 실행한다.
2. `npm run qa:blind-readiness`로 세션 파일이 아직 `예정`인지 확인한다.
3. 원격 URL이 맞으면 요청 패킷 또는 AGY outbox를 실제 진행자에게 보낸다.
