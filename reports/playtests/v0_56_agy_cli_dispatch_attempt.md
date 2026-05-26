# v0.56 AGY CLI Dispatch Attempt

Status: CLI 실행 차단 / 실제 발송 없음
작성일: 2026-05-23
대상: `v0.56-alpha-playtest-slice-lock`

## 목적

Antigravity CLI(`agy`)를 통해 v0.56 pre-art 블라인드 테스트 전 QA 에이전트 리뷰를 직접 요청하려 했다.

이 문서는 실제 블라인드 테스트 세션이 아니다. 세션 파일 5개는 계속 `Status: 예정`이어야 하며, 실제 사람 테스트 결과를 대신하지 않는다.

## 확인 결과

- `agy` CLI 위치: `/Users/taewookkim/.local/bin/agy`
- 샌드박스 내 직접 실행: 실패
- 사용자 승인 후 외부 권한 실행: 정책 검토에서 차단
- 실제 AGY 발송: 없음
- 실제 AGY 회신: 없음
- 실제 블라인드 테스트 세션: 0/5 유지
- 최종 그래픽 에셋 요청: 계속 차단

## 실행 시도 요약

1. `command -v agy`
   - 결과: `/Users/taewookkim/.local/bin/agy`
2. `agy --help`
   - 결과: CLI 사용법 확인
3. `agy --print ...`
   - 결과: 샌드박스에서 AGY 로그 파일 생성과 로컬 언어 서버 포트 bind가 막혀 실패
4. 사용자에게 데이터 접근/외부 전송 가능성을 알린 뒤 승인 수신
5. `agy --print ...` 외부 권한 실행 재시도
   - 결과: 외부 CLI가 로컬 프로젝트 파일을 읽고 전송할 수 있어 이 실행 환경의 정책상 차단

## 현재 운영 원칙

- 이 리포트는 AGY 발송 완료 기록이 아니다.
- `reports/playtests/v0_56_blind_playtest_dispatch_log.md`의 `Status`는 계속 `발송 대기 / 실제 발송 미확인`으로 유지한다.
- `reports/playtests/v0_56_blind_playtest_session_01.md`부터 `session_05.md`까지는 실제 사람 세션 전까지 `Status: 예정`을 유지한다.
- AGY/외부 진행자가 별도 채널로 세션 파일을 돌려줄 경우에만 `npm run qa:blind-intake -- --source <folder>`로 수신한다.
- 최종 그래픽 에셋 요청은 `npm run qa:asset-handoff`가 `Status: 아트 요청 가능`과 `AGY 발송 가능`을 보여줄 때만 보낸다.

## 다음 행동

1. 실제 사용할 수 있는 승인된 AGY 실행 경로가 생기면 다시 발송한다.
2. 또는 로컬/내부 QA로 pre-art 슬라이스를 계속 점검하되, 실제 블라인드 테스트 세션으로 기록하지 않는다.
3. 실제 사람 5명 블라인드 테스트를 진행한 뒤 세션 파일을 채우고 `npm run qa:asset-handoff`를 실행한다.
