# v0.56 Blind Playtest Intake

Status: 수신 대기
작성일: 2026-05-29

## 목적

AGY 또는 실제 진행자가 돌려준 세션 파일을 로컬 블라인드 테스트 기록으로 가져온다. 실제 세션 파일만 받으며, 미완료 파일이나 `P0:`가 비어 있는 파일은 반영하지 않는다.

## 사용법

- 수신 폴더: `미지정`
- 실행: `npm run qa:blind-intake -- --source <folder>`
- 후속 요약: `npm run qa:blind-summary`
- 후속 이슈 큐: `npm run qa:blind-issues`

## 판정

- 가져온 세션: 0
- 거부된 세션: 0
- 원칙: `Status: 완료`와 `P0:` 기록이 있는 세션만 가져온다
- 세션 결과가 없는 파일은 기존 로컬 세션 파일을 건드리지 않는다

## 세션 수신 상태

| Session | Result | 사유 | File |
|---:|---|---|---|
| 01 | 미수신 | 아직 수신 폴더가 지정되지 않음 | `v0_56_blind_playtest_session_01.md` |
| 02 | 미수신 | 아직 수신 폴더가 지정되지 않음 | `v0_56_blind_playtest_session_02.md` |
| 03 | 미수신 | 아직 수신 폴더가 지정되지 않음 | `v0_56_blind_playtest_session_03.md` |
| 04 | 미수신 | 아직 수신 폴더가 지정되지 않음 | `v0_56_blind_playtest_session_04.md` |
| 05 | 미수신 | 아직 수신 폴더가 지정되지 않음 | `v0_56_blind_playtest_session_05.md` |

## 참고 세션 파일

- `v0_56_blind_playtest_session_01.md`
- `v0_56_blind_playtest_session_02.md`
- `v0_56_blind_playtest_session_03.md`
- `v0_56_blind_playtest_session_04.md`
- `v0_56_blind_playtest_session_05.md`

## 특이사항

- AGY 또는 실제 진행자가 세션 파일을 돌려주면 `--source`로 폴더를 지정한다.

## 다음 행동

1. 수신 반영 후 `npm run qa:blind-summary`를 실행한다.
2. 이어서 `npm run qa:blind-issues`를 실행해 P0/P1 큐를 확인한다.
3. 실제 세션 5/5, 열린 P0 0, P0 큐 0, 증거 미기록 0이 될 때까지 최종 그래픽 에셋 요청은 보내지 않는다.
