# v0.56 Blind Playtest Request Packet

Status: 준비됨 / 발송 전
작성일: 2026-05-23
대상: `v0.56-alpha-playtest-slice-lock`

## 목적

최종 그래픽 에셋 투입 전에 실제 사람 5명이 설명 없이 첫 20~30분을 플레이했을 때, 게임의 첫 목표와 보상 흐름이 읽히는지 확인한다.

이 문서는 외부 진행자나 AGY에게 그대로 넘길 요청서와 체크리스트다. 세션 결과는 실제 플레이 후에만 채운다.

AGY에 붙여 넣을 최종 발송문은 `reports/playtests/v0_56_blind_playtest_agy_outbox.md`에 따로 둔다. 이 outbox 파일은 실제 발송 여부를 표시하며, 세션 결과를 대신하지 않는다.

## AGY 전달 문구

아래 조건으로 AI Company Tycoon: Boundaryless v0.56 블라인드 플레이테스트 5회를 진행해 주세요.

- 플레이어에게 게임 설명 금지
- 플레이 중 질문에 답하지 않기
- 플레이어 화면에는 관찰 HUD를 보여주지 않기
- 각 세션은 20~30분 진행
- 막힌 시간, 클릭한 위치, 읽은 문구, 무시한 패널 기록
- 종료 후 5개 질문 답변 기록
- 각 세션 파일의 `Status`는 실제 플레이가 끝난 뒤에만 `완료`로 변경
- `P0:`에는 `없음` 또는 구체적인 P0를 반드시 기록
- `P1:`에는 후속 튜닝 후보를 기록

## URL

외부 진행자나 AGY에 보내기 전에는 아래 로컬 URL을 그대로 쓰지 않는다. 터널 또는 preview 배포 주소를 정한 뒤:

```bash
PLAYTEST_BASE_URL=https://<remote-preview-url> npm run qa:blind-url-sync
```

이 명령이 출력한 플레이어 URL과 진행자 URL을 이 섹션과 AGY outbox에 동기화한 뒤 preflight를 실행한다.

```bash
PLAYTEST_BASE_URL=https://<remote-preview-url> npm run qa:blind-preflight
npm run qa:blind-session-links
```

세션 01-05별 진행자 관찰 URL은 `reports/playtests/v0_56_blind_playtest_session_links.md`에서 한 번에 확인한다.

플레이어 시작 URL:

```text
https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh
```

진행자 관찰 URL:

```text
https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh&playtest=v056&session=1
```

진행자 관찰 URL은 체크포인트 확인용이다. 실제 블라인드 플레이어에게는 보여주지 않는다.

## 세션 파일

| Session | 요청 대상 | 기록 파일 |
|---:|---|---|
| 01 | 개발자 본인, 화면 녹화와 자기 해설 | `v0_56_blind_playtest_session_01.md` |
| 02 | 게임을 좋아하는 지인 A | `v0_56_blind_playtest_session_02.md` |
| 03 | 게임을 좋아하는 지인 B | `v0_56_blind_playtest_session_03.md` |
| 04 | 개발자/기획자 성향 지인 | `v0_56_blind_playtest_session_04.md` |
| 05 | 경영/시뮬레이션 게임을 잘 모르는 사람 | `v0_56_blind_playtest_session_05.md` |

## 진행자 체크리스트

세션 전:

- 로컬 서버가 `npm run dev -- --port 5201`로 켜져 있는지 확인
- 외부 세션이면 `PLAYTEST_BASE_URL`로 `npm run qa:blind-preflight`를 실행하고 원격 URL을 동기화
- 플레이어 화면이 `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`인지 확인
- 진행자만 `?playtest=v056&session=<번호>` URL을 열기
- 해당 세션 파일이 아직 `Status: 예정`인지 확인

세션 중:

- 첫 10초: AI 회사 경영 게임으로 보이는지 기록
- 첫 3분: 추천 첫 제품 카드와 `첫 제품 개발 시작` 버튼을 찾는지 기록
- 첫 10분: 첫 제품 출시와 다음 행동 리본을 보는지 기록
- 첫 15분: 첫 개발 이슈, 결과 리본, 카드/보상/성장 선택을 결과 변화로 이해하는지 기록
- 첫 20분: 사람 직원, AI 에이전트, 로봇 인력 차이를 설명할 수 있는지 기록
- 첫 30분: 연간 지시, 2년차 시작, 추천 연구, 연구 완료, 제품 후보, 필요 연구, 신제품 개발 착수, 첫 이슈 결과, 신제품 출시 결과 흐름을 다음 목표로 이해하는지 기록

세션 후:

- 종료 질문 5개 답변 기록
- `P0:`를 비워 두지 않기
- P1은 후속 튜닝 후보로 적되, P0/증거 게이트가 통과하면 최종 아트 투입 자체를 막지 않음
- 세션 파일 저장 후 `npm run qa:blind-summary` 실행

## 종료 질문

1. 처음 봤을 때 무슨 게임 같았나요?
2. 처음 5분 동안 뭘 해야 하는지 알았나요?
3. 제일 재밌었던 순간은?
4. 제일 헷갈렸던 순간은?
5. 다시 해보고 싶은 마음이 있나요?

## 완료 게이트

`npm run qa:blind-summary`가 아래 상태가 될 때까지 최종 그래픽 에셋 투입은 시작하지 않는다.

- 실제 세션: 5/5
- 열린 P0: 0
- P0 미기록: 0
- 상태 미인정: 0
- 증거 미기록: 0
- 아트 투입 판정: 가능

P1은 후속 튜닝 backlog로 남길 수 있다. 에셋 요청은 위 게이트가 열린 뒤 `docs/ANTIGRAVITY_ART_BRIEF.md`를 기준으로 진행한다.
