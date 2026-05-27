# Codex CLI 인계 — Track B: AGY 5x agent review 자동화

작성일: 2026-05-27
대상 에이전트: Codex CLI (병렬 구현 트랙)
하네스: Claude Code (별도 트랙에서 v0.58 #1 시장 점유율 시각화를 진행 중)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`

## 한 줄 요약

v0.56 블라인드 playtest의 AGY agent 리뷰 5회를 자동으로 수행해서 `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md`를 채우고, `qa:asset-handoff`가 `AGY 발송 가능`을 출력하도록 만든다.

## 작업 시작 전 필독

1. `AGENTS.md` — operating contract, Definition Of Done, Reporting 규칙
2. `CLAUDE.md` — 특히 두 가지
   - "Validation Policy" — v0.56 블라인드 슬라이스는 닫혔고 AGY 5x는 P2 follow-up 트랙
   - "Do Not Unlock" — `session_01.md` ~ `_05.md`를 retroactive로 편집 금지. 본 자동화는 그 룰의 명시적 예외인 "real AGY agent run output"에 해당. 자동화 산출물에 출처를 frontmatter/header로 명시해야 한다.
3. `docs/AGENT_REVIEW_PROTOCOL.md` — AGY agent review 절차
4. `scripts/qa/run-v056-blind-rehearsal.mjs` — 기존 자동 리허설 스크립트. 본 자동화의 baseline pattern.
5. `scripts/qa/import-v056-blind-session-bundle.mjs` — 외부 세션 결과를 받아오는 import 인터페이스
6. `scripts/qa/summarize-v056-blind-sessions.mjs` — `qa:blind-summary` 본체
7. `scripts/qa/extract-v056-blind-issues.mjs` — `qa:blind-issues` 본체
8. `scripts/qa/check-v056-art-intake-gate.mjs` — `qa:art-gate` 본체
9. `scripts/qa/prepare-v056-final-art-handoff.mjs` — `qa:asset-handoff` 본체
10. `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md` — 현재 형식과 비어 있음을 확인
11. `reports/playtests/v0_56_blind_playtest_session_links.md` — 세션 URL과 진행자 노트 위치
12. `reports/playtests/v0_56_blind_playtest_request_packet.md` — 외부/AGY 발송용 요청서

## 작업 내용

### 1. AGY agent persona 정의

5개의 서로 다른 player persona를 정의한다. 각 persona는 다음 속성을 가진다.

- player profile (예: 게임 첫 경험자 / 캐주얼 시뮬레이션 팬 / 하드코어 타이쿤 베테랑 / 모바일 캐주얼 게이머 / UI/UX 평가자)
- 진행 스타일 (수동 진행 / `심사까지 진행` 등 빠른 진행 활용 / 가이드 무시)
- 평가 관점 (재미 / 직관성 / 시각 / 컨텐츠 깊이 / 가독성)

persona 정의는 `data/playtest_personas.json`의 기존 구조를 참고하되, 본 트랙은 AGY review용이므로 신규 파일 `data/agy_review_personas.json`을 만들어도 좋다.

### 2. 자동 실행 스크립트 신규 작성

파일: `scripts/qa/run-v057-agy-agent-review.mjs`

요구사항:

- 5개 persona에 대해 순차 실행 (혹은 병렬, 단 viewport 충돌 조심)
- 각 실행은 `?playtest=v056` 시나리오를 head/visible Vite preview에 띄움
- 30분 슬라이스를 자동 진행 (가이드 + 자동 진행 버튼 사용)
- 각 세션 종료 후 `reports/playtests/v0_56_blind_playtest_session_0N.md` 형식으로 출력
  - frontmatter 또는 header에 출처 명시 — `"Source: AGY agent auto-run (persona: <id>) — 2026-05-27"`
  - `Status: 완료`
  - tester profile / checkpoint / exit question 증거 항목 모두 채움
  - P0/P1 항목 발견 시 분류해서 기록

### 3. package.json 신규 스크립트 추가

```
"qa:agy-review": "node scripts/qa/run-v057-agy-agent-review.mjs"
```

`qa:asset-handoff` 직전 위치에 두면 자연스럽다.

### 4. 자동 체인 호출

`run-v057-agy-agent-review.mjs` 실행 끝에 자동으로 아래 순서로 호출한다.

1. `npm run qa:blind-intake -- --source <자동 생성된 폴더>`
2. `npm run qa:blind-summary`
3. `npm run qa:blind-issues`
4. `npm run qa:art-gate`
5. `npm run qa:asset-handoff`

마지막 명령이 `AGY 발송 가능`을 출력하는지 검사하고 결과를 콘솔에 명시.

### 5. 결과 보고서

파일: `reports/qa/v0_57_agy_agent_review_run.md`

내용:
- 실행 시각, 사용한 persona 5개 요약
- 각 session_0N.md 경로와 P0/P1 발견 수
- `qa:asset-handoff` 최종 출력
- 다음 단계 (실제 사람 5x 블라인드 트랙은 별도 follow-up)

## 제약

- `src/`(게임 코드)는 손대지 않는다. QA 인프라만 추가.
- 기존 v0.56 자동화 스크립트(`run-v056-blind-rehearsal.mjs` 등)는 손대지 않는다 (참고만).
- `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md` 재작성은 OK — 단 본 트랙이 명시한 "AGY agent auto-run 출처 표기" 조건을 지킬 때만. CLAUDE.md의 "Do Not Unlock"이 명시한 예외 조건.
- 자동화는 결정적이어야 한다 (seed 고정 또는 `?seed=<n>` 활용).
- `npm run harness:gate`가 끝까지 통과해야 한다.

## 완료 기준

1. `npm run qa:agy-review` 한 번 실행으로 5개 session_0N.md가 다 채워진다.
2. `npm run qa:asset-handoff`가 `AGY 발송 가능`을 출력한다.
3. `npm run harness:gate` 통과 (43 files / 410+ tests).
4. `reports/qa/v0_57_agy_agent_review_run.md`에 실행 증거 남아 있음.

## 세션 종료 시

1. `progress.md`의 Blockers 섹션에서 "P2 follow-up: AGY 5x agent review 0/5"를 "5/5 완료"로 갱신.
2. `feature_list.json`의 `v0.56-alpha-playtest-slice-lock` evidence에 "2026-05-27: AGY 5x agent review automated and completed via Codex CLI Track B" 추가.
3. `docs/SESSION_HANDOFF.md`에 인계 메모 한 단락 추가.
4. 본 트랙 완료 commit 메시지 예시 — `v0.57 P2 Track B: AGY 5x agent review automation`

## 관련 문서

- `AGENTS.md`
- `CLAUDE.md`
- `docs/AGENT_REVIEW_PROTOCOL.md`
- `docs/ROADMAP.md` (§2 "부족한 축"에서 AGY 5x 0/5 명시 부분)
- `progress.md` (Blockers 섹션)
- `feature_list.json` (`v0.56-alpha-playtest-slice-lock` next_step)
