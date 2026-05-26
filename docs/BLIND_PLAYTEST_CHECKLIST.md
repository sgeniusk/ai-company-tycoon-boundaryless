# Blind Playtest Checklist

작성일: 2026-05-21  
대상 마일스톤: `v0.56-alpha`

## 목적

설명 없이 플레이했을 때 첫 20~30분이 게임으로 읽히는지 확인한다. v0.56에서는 사용자 결정(2026-05-26)에 따라 **AGY 에이전트 5회 리뷰**로 검증한다. AGY가 코드/시나리오 URL/관찰 HUD를 직접 읽어 페르소나별 막힘 지점, 카드 영향 체감, 디브리프 가독성을 평가한다. 실제 사람 블라인드 테스트는 P2 후속 트랙으로 분리하고 v0.57 진입을 막지 않는다.

## 테스트 성공 기준

| Time | Success Criteria |
|---:|---|
| 첫 10초 | AI 회사 경영 게임이라는 것을 알아본다. 미나의 첫 안내 또는 가이드 카드에서 차고 AI 회사, 사람+AI 에이전트, 첫 제품 출시 목표를 읽는다. |
| 첫 3분 | `첫 팀원 바로 고용`으로 추천 팀원을 뽑고 `첫 제품 바로 개발` 또는 제품 메뉴 상단 추천 첫 제품 카드로 개발을 시작한다. |
| 첫 10분 | `첫 이슈 바로 해결` 또는 덱의 첫 개발 이슈 카드로 카드 영향 결과를 본 뒤 첫 제품을 출시하고 출시 결과의 다음 행동 리본을 본다. |
| 첫 15분 | 첫 개발 이슈 카드, 가이드의 첫 이슈 빠른 해결, 이슈 해결 결과 리본, 출시 결과, 다음 행동 리본, 첫 보상 바로 선택, 첫 성장 분기 바로 선택, 첫 보상 스포트라이트, 보상 선택 완료 리본, 또는 성장 분기 선택 완료 리본에서 카드/보상/성장 선택이 결과를 바꾼다고 이해한다. |
| 첫 20분 | `인력 조합` 패널에서 사람 직원, AI 에이전트, 로봇 인력 차이를 대충 이해한다. |
| 첫 30분 | `심사까지 진행`으로 연간 심사에 도달하고, 다음 해 지시 선택 완료 리본, 2년차 운영 시작, 추천 연구, 연구 완료 보상, 제품 후보 런치패드, 필요한 연구 경로와 `바로 연구`, 신제품 개발 착수 리본, 첫 이슈 결과, 신제품 출시 결과를 이해하며, 한 판 더 해볼까 하는 반응이 나온다. |

## 테스터 구성

v0.56 검증 (AGY 에이전트 5회, 2026-05-26 격상):

- 세션 01: AGY agent — 첫 10분 페르소나 (첫 화면 인지, 첫 팀원 빠른 고용, 첫 제품 개발 진입)
- 세션 02: AGY agent — 첫 출시 페르소나 (첫 이슈 빠른 해결, 카드 영향 체감, 첫 출시 결과 가독성)
- 세션 03: AGY agent — 보상/성장 페르소나 (보상 3택1 스포트라이트, 성장 분기, 1년차 연간 심사)
- 세션 04: AGY agent — 2년차 신제품 페르소나 (연간 지시, 연구 완료, 제품 후보 런치패드, 신제품 개발 착수)
- 세션 05: AGY agent — 30분 디브리프 페르소나 (두 번째 신제품 이슈/출시, 두 번째 보상, 알파런 디브리프)

실제 사람 5명 테스트는 P2 후속 트랙으로 별도 진행하며 v0.57 진입을 막지 않는다.

## 진행 방식

1. 게임 설명 없이 URL만 제공한다.
2. 플레이 중 질문에 답하지 않고 관찰한다.
3. 막힌 시간, 클릭한 위치, 읽은 문구, 무시한 패널을 기록한다.
4. 첫 제품 출시 전후 반응을 별도로 기록한다.
5. 20~30분 후 짧은 질문만 한다.

진행자 화면에서 체크포인트를 같이 보고 싶으면 URL에 `?playtest=v056&session=1`을 붙인다. 이 HUD는 테스트 진행자용이므로 실제 블라인드 플레이어에게 노출하지 않는다.

외부 진행자나 AGY에게 맡길 때는 먼저 터널 또는 preview URL을 정하고 `PLAYTEST_BASE_URL=https://... npm run qa:blind-url-sync`로 요청 패킷/outbox URL을 동기화한다. 이어서 `npm run qa:blind-session-links`로 세션 01-05 플레이어/관찰 URL 시트를 갱신하고, `npm run qa:blind-live-check`로 링크 구조와 세션 파일 상태를 확인하고, `PLAYTEST_BASE_URL=https://... npm run qa:blind-preflight`로 원격 URL과 튜토리얼 딜레이를 확인한다. 이 sandbox에서는 HTTP 200 증거는 별도 `curl -I`로 남긴다. 그 뒤 `reports/playtests/v0_56_blind_playtest_request_packet.md`를 요청서와 체크리스트로 전달한다. AGY에 붙여 넣을 최종 메시지는 `reports/playtests/v0_56_blind_playtest_agy_outbox.md`에 둔다.

## 종료 질문

1. 처음 봤을 때 무슨 게임 같았나요?
2. 처음 5분 동안 뭘 해야 하는지 알았나요?
3. 제일 재밌었던 순간은?
4. 제일 헷갈렸던 순간은?
5. 다시 해보고 싶은 마음이 있나요?

## P0 판정 기준

다음 중 하나라도 발생하면 `v0.56-alpha`에서 먼저 고친다.

- 첫 3분 안에 `첫 팀원 바로 고용` 또는 추천 첫 제품 개발 버튼을 못 찾는다.
- 첫 10분 안에 첫 이슈 해결 또는 첫 제품 출시로 가지 못한다.
- 카드, 개발 이슈, 결과 리본이 결과를 바꿨다는 느낌이 없다.
- 출시 결과가 왜 좋은지 나쁜지 이해하지 못한다.
- 출시 후 `보상 카드 선택`, `성장 분기 선택`, `다음 달 진행` 중 다음 행동을 고르지 못한다.
- `첫 보상 바로 선택` 또는 `성장 분기 바로 선택`을 보고도 다음에 눌러야 할 행동으로 이해하지 못한다.
- 덱 패널의 `첫 출시 보상 도착` 스포트라이트를 보고도 3장 중 1장을 고르는 순간으로 이해하지 못한다.
- `보상 선택 완료` 리본을 보고도 선택한 카드가 덱에 들어간 것을 이해하지 못한다.
- `성장 분기 선택 완료` 리본을 보고도 다음 달 월간 보너스와 연간 심사 방향을 이해하지 못한다.
- `심사까지 진행`을 보고도 연간 심사로 넘어가는 다음 행동이라고 이해하지 못한다.
- `다음 해 지시 선택 완료` 리본을 보고도 선택한 연간 지시, 월간 보너스, 추천 메뉴, `추천 메뉴 열기`/`2년차 시작` 버튼을 이해하지 못한다.
- `2년차 운영 시작` 카드를 보고도 이번 달 보너스와 연간 지시 효과가 실제로 적용됐다고 이해하지 못한다.
- 연구 메뉴의 `연간 지시 추천 연구` 카드와 `바로 연구` 버튼을 보고도 다음 행동을 고르지 못한다.
- `연구 완료` 리본을 보고도 레벨 상승, 해금 시장, 제품 후보가 보상으로 이어졌다고 이해하지 못한다.
- 제품 메뉴의 `연구가 연 제품 후보` 런치패드를 보고도 해금 시장, 다음 제품 후보, `필요 연구 보기`, 연구 메뉴의 `바로 연구`, 착수 후 `덱 열기`, 신제품 이슈 결과, 신제품 출시 결과를 이해하지 못한다.
- `인력 조합` 패널을 보고도 사람/AI/로봇 차이가 전혀 읽히지 않는다.
- 화면 정보량 때문에 주요 행동을 포기한다.

## 기록 위치

블라인드 테스트 결과는 `reports/playtests/` 아래에 `v0_56_blind_playtest_<date>.md` 형식으로 저장한다.

## v0.56 준비된 기록 파일

이번 마일스톤의 실제 테스트 기록은 아래 파일에 채운다. 현재 상태는 `예정`이며, 실제 세션 전에는 결과를 채우지 않는다.

- 운영 계획: `reports/playtests/v0_56_blind_playtest_plan.md`
- 세션 01: `reports/playtests/v0_56_blind_playtest_session_01.md`
- 세션 02: `reports/playtests/v0_56_blind_playtest_session_02.md`
- 세션 03: `reports/playtests/v0_56_blind_playtest_session_03.md`
- 세션 04: `reports/playtests/v0_56_blind_playtest_session_04.md`
- 세션 05: `reports/playtests/v0_56_blind_playtest_session_05.md`
- 요청 패킷: `reports/playtests/v0_56_blind_playtest_request_packet.md`
- AGY 발송문: `reports/playtests/v0_56_blind_playtest_agy_outbox.md`
- 발송 로그: `reports/playtests/v0_56_blind_playtest_dispatch_log.md`
- 발송 준비 점검: `reports/playtests/v0_56_blind_playtest_readiness.md`
- 원격 URL 동기화: `reports/playtests/v0_56_blind_playtest_url_sync.md`
- 세션별 링크 시트: `reports/playtests/v0_56_blind_playtest_session_links.md`
- 라이브 링크 구조 점검: `reports/playtests/v0_56_blind_playtest_live_check.md`
- 원격/튜토리얼 preflight: `reports/playtests/v0_56_blind_playtest_preflight.md`
- 회신 세션 수신: `reports/playtests/v0_56_blind_playtest_intake.md`
- 요약 게이트: `reports/playtests/v0_56_blind_playtest_summary.md`
- 이슈 큐: `reports/playtests/v0_56_blind_playtest_issue_queue.md`
- 최종 아트 게이트: `reports/playtests/v0_56_final_art_intake_gate.md`
- 최종 아트 요청 패킷: `reports/playtests/v0_56_final_art_handoff_packet.md`

발송 전에는 `npm run qa:blind-url-sync`로 원격 URL을 요청 패킷/outbox에 맞추고, `npm run qa:blind-session-links`로 세션별 링크 시트를 만들고, `npm run qa:blind-live-check`로 링크 구조와 세션 상태를 점검하고, `npm run qa:blind-preflight`로 원격 URL과 첫 프로젝트 전 튜토리얼 딜레이를 확인하고, `npm run qa:blind-readiness`로 요청 패킷, AGY 발송문, 세션 파일 `예정` 상태, 요약 게이트 대기 상태를 확인한다. AGY나 진행자가 세션 파일 묶음을 돌려주면 `npm run qa:blind-intake -- --source <folder>`로 먼저 수신한다. 이 수신 명령은 정확한 파일명, `Status: 완료`, 비어 있지 않은 `P0:`가 있는 파일만 가져오며, 빠진 세션은 기존 파일을 건드리지 않는다. 실제 세션을 채운 뒤 각 기록 파일의 `Status`를 정확히 `완료`로 바꾸고, 테스터 프로필, `날짜/시간`, `환경`, 6개 체크포인트 관찰 칸, 종료 질문 5개 답변을 채운 다음 `npm run qa:asset-handoff`를 실행한다. 이 명령은 요약 게이트, 이슈 큐, 최종 아트 게이트, 최종 아트 요청 패킷을 모두 갱신한다. 최종 그래픽 에셋 요청은 `reports/playtests/v0_56_final_art_handoff_packet.md`가 `Status: 아트 요청 가능`과 `AGY 발송 가능`을 보여줄 때만 보낸다.
