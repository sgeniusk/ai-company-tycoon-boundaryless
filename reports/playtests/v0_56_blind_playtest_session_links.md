# v0.56 Blind Playtest Session Links

Status: 세션 링크 준비
작성일: 2026-05-24

## 공통 URL

- 플레이어 공통 URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`
- 진행자 관찰 URL 형식: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=<세션번호>`
- request packet / AGY outbox URL: 동기화 완료
- 세션 파일 상태: 모두 Status: 예정

## 세션별 링크

| Session | Record status | Player URL | Facilitator observer URL | Record file |
|---:|---|---|---|---|
| 01 | Status: 예정 | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh` | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=1` | `v0_56_blind_playtest_session_01.md` |
| 02 | Status: 예정 | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh` | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=2` | `v0_56_blind_playtest_session_02.md` |
| 03 | Status: 예정 | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh` | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=3` | `v0_56_blind_playtest_session_03.md` |
| 04 | Status: 예정 | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh` | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=4` | `v0_56_blind_playtest_session_04.md` |
| 05 | Status: 예정 | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh` | `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=5` | `v0_56_blind_playtest_session_05.md` |

## 진행자 주의

- 플레이어에게 관찰 HUD를 보여주지 않는다.
- 플레이어에게 게임 설명을 하지 않는다.
- 진행자만 해당 세션의 observer URL을 열고 체크포인트를 기록한다.
- 세션이 끝난 뒤에만 해당 파일을 `Status: 완료`로 바꾼다.
- `P0:`는 `없음` 또는 구체적인 P0로 반드시 채운다.

## 발송 전 명령

```bash
PLAYTEST_BASE_URL=https://librarian-matches-engaged-compact.trycloudflare.com npm run qa:blind-preflight
npm run qa:blind-readiness
npm run qa:asset-handoff
```

`qa:asset-handoff`는 실제 세션 5/5와 P0/evidence 게이트가 열릴 때까지 계속 `AGY 발송 금지`를 보여야 한다.
