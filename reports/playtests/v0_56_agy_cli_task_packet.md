# v0.56 AGY CLI Task Packet

Status: 수동 리뷰 수신 / 직접 CLI 대행 차단
작성일: 2026-05-23
대상: `v0.56-alpha-playtest-slice-lock`

## 목적

Codex 실행 환경에서는 외부 AGY CLI 직접 대행이 정책상 차단되므로, 사용자가 로컬 터미널에서 직접 실행할 수 있는 AGY 작업 패킷을 고정한다.

이 패킷은 실제 블라인드 테스트 세션이 아니다. 실제 세션 파일 5개는 수정하지 않는다.

## 실행 명령

프로젝트 루트에서 아래 명령을 실행한다.

```bash
cd /Users/taewookkim/Downloads/ai-company-tycoon
agy --print-timeout 15m --log-file reports/playtests/v0_56_agy_cli.log --print "$(cat reports/playtests/v0_56_agy_cli_prompt.txt)"
```

## AGY 입력 프롬프트

- 프롬프트 파일: `reports/playtests/v0_56_agy_cli_prompt.txt`
- 기대 산출물: `reports/playtests/v0_56_agy_agent_playtest_review.md`
- AGY 로그: `reports/playtests/v0_56_agy_cli.log`

## 안전 경계

- 실제 세션 파일 5개는 수정하지 않는다.
- `Status: 완료`를 세션 파일에 쓰지 않는다.
- 실제 사람 블라인드 테스트 결과를 만들지 않는다.
- 최종 그래픽 에셋 요청을 열지 않는다.
- `npm run qa:asset-handoff`가 `아트 요청 가능`과 `AGY 발송 가능`을 보여주기 전까지 final graphics remain blocked.

## 수신 후 처리

AGY가 `reports/playtests/v0_56_agy_agent_playtest_review.md`를 만들면 아래를 실행한다.

```bash
npm run qa:blind-readiness
npm run qa:asset-handoff
```

AGY가 실제 세션 파일 묶음을 별도 폴더로 돌려준 경우에만 아래를 실행한다.

```bash
npm run qa:blind-intake -- --source <folder>
```

## 현재 상태

- 실제 AGY 직접 대행: 차단됨
- 실제 AGY 수동 리뷰: 수신됨 (`v0_56_agy_agent_playtest_review.md`)
- 실제 세션: 0/5
- 최종 아트 요청: 대기
