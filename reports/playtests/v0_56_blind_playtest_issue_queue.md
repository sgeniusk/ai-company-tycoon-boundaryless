# v0.56 Blind Playtest Issue Queue

Status: P1 튜닝 후보
작성일: 2026-05-27

## 판정

- 실제 세션: 5/5
- P0 큐: 0
- P1 큐: 5
- 상태 미인정: 0
- 최종 그래픽 에셋 전에는 P0 큐가 0이어야 한다
- P1 원칙: P1 큐는 후속 튜닝 후보로 유지하되, P0/증거 게이트를 통과하면 에셋 투입을 막지 않음
- 요약 게이트: `npm run qa:blind-summary`

## 세션 상태

| Session | Status | File |
|---:|---|---|
| 01 | 완료 | `v0_56_blind_playtest_session_01.md` |
| 02 | 완료 | `v0_56_blind_playtest_session_02.md` |
| 03 | 완료 | `v0_56_blind_playtest_session_03.md` |
| 04 | 완료 | `v0_56_blind_playtest_session_04.md` |
| 05 | 완료 | `v0_56_blind_playtest_session_05.md` |

## 수정 큐

| Session | Severity | Issue | 다음 수정 후보 | 제일 헷갈렸던 순간 | File |
|---:|---|---|---|---|---|
| 01 | P1 | 인력 조합 패널의 AI 운용 한도 및 로봇 해금 경로 텍스트 밀도. | 인력 조합 텍스트 단순화. | AI 운용 한도 텍스트가 첫 10분 안에는 완전히 소화되지 않는다. | `v0_56_blind_playtest_session_01.md` |
| 02 | P1 | launch-impact 결과 패널의 모바일 정보 밀도. | 모바일 결과 패널 섹션 토글. | 카드 영향과 경쟁사 반응이 한 화면에 몰려 모바일에서는 살짝 빽빽할 수 있다. | `v0_56_blind_playtest_session_02.md` |
| 03 | P1 | `심사까지 진행`의 다수 월 자동 진행 중 시각적 진행 표시 강화. | 자동 진행 시각 표시 보강. | `심사까지 진행` 후 여러 달이 자동 진행될 때 진행 표시가 더 강하면 좋겠다. | `v0_56_blind_playtest_session_03.md` |
| 04 | P1 | 연구 트리 전체 진행도 시각화. | 연구 트리 시각화. | 연구 트리 전체 진행도가 한 화면에서 잘 보이지 않는다. | `v0_56_blind_playtest_session_04.md` |
| 05 | P1 | 모바일 디브리프 패널의 4-beat 타임라인과 하이라이트 블록 시각적 위계 보강. | 모바일 디브리프 시각 위계 보강. | 모바일에서는 4-beat 타임라인과 하이라이트 블록 위계가 조금 평평해 보일 수 있다. | `v0_56_blind_playtest_session_05.md` |

## 다음 행동

1. 실제 세션 완료 후 `Status: 완료`, `P0`, `P1`, 종료 질문을 채운다.
2. `npm run qa:blind-summary`와 `npm run qa:blind-issues`를 함께 실행한다.
3. P0 큐가 있으면 최종 그래픽 에셋 투입 전에 코드/문구/흐름 수정을 먼저 한다.
4. P1 큐는 v0.56 후속 튜닝 후보로 남기고, 에셋 투입 여부는 요약 게이트의 P0/증거 판정으로 결정한다.
