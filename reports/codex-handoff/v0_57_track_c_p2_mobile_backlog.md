# Codex CLI 인계 — Track C Phase 1: v0.57 P2 모바일 폴리시 백로그 수집

작성일: 2026-05-27
대상 에이전트: Codex CLI (병렬 구현 트랙)
하네스: Claude Code (별도 트랙에서 v0.58 #1 시장 점유율 시각화 진행 중)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`

## 한 줄 요약

v0.57 코어 폴리시(closed)에서 P2로 미뤄진 모바일 항목을 한 파일로 수집한다. 본 phase에서는 실제 폴리시 코드는 작성하지 않는다. Phase 2에서 사용자가 백로그를 보고 1개 항목을 픽업해 별도 세션으로 진행한다.

## 작업 시작 전 필독

1. `AGENTS.md` — operating contract
2. `CLAUDE.md` — 특히 "Do Not Unlock" + Validation Policy
3. `docs/ROADMAP.md` — §2 "부족한 축"의 모바일 관련 줄, §5 "지금 하지 않을 것"의 "모바일 완성도 깊게 파기"
4. v0.57 모바일 P1 commit 4개 — `a27111d`, `5b64fe6`, `127fd49`, `3a0bb62` — 각 커밋 body에 deferred 표기 있는지 확인
5. `reports/qa/v0_57_*` (있다면) — v0.57 QA 결과에서 P2로 분류된 항목
6. `reports/playtests/v0_56_*` 중 모바일 관련 issue (closed v0.56 슬라이스 잔여 P2)

## 작업 내용

### 1. 수집 출처

다음 5개 출처를 모두 스캔한다.

1. **git log v0.57 commits** — P1 #1~#4 (`a27111d`, `5b64fe6`, `127fd49`, `3a0bb62`) commit body에서 "deferred", "P2", "다음", "후속" 등 키워드
2. **reports/qa/v0_57_\***  — 존재하면 mobile 관련 P2 항목
3. **reports/playtests/v0_56_blind_playtest_session_\***  — closed v0.56 슬라이스 잔여 모바일 P2
4. **ROADMAP.md "부족한 축"** — 모바일 관련 줄 ("모바일 패널 접힘 요약" 등). "모바일 완성도 깊게 파기"는 §5 "지금 하지 않을 것"이므로 **P3로 분류하고 제외 표시**
5. **CSS grep** — `src/App.css`에서 `@media` 안쪽의 `TODO` / `FIXME` / "v0.57" / "후속" 주석

### 2. 산출물

파일: `reports/qa/v0_57_p2_mobile_backlog.md`

구조:

```markdown
# v0.57 P2 Mobile Polish Backlog

작성일: 2026-05-27
출처: v0.57 closed 슬라이스 + ROADMAP 부족한 축 + CSS 스캔
대상 viewport: 390x844 (iPhone 12-15) 기준

## 손댈 후보 (이번 라운드)

### 1. <항목 제목>
- 출처: <commit hash or report path>
- 깨지는 위치: <컴포넌트 + 모바일 viewport 좌표 또는 시나리오>
- 수정 분량: small / medium / large
- 예상 변경 파일: <file paths>
- 우선순위 근거: <왜 이번 라운드에 골랐는지>

### 2. ...

### 3. ...

## 다음 라운드 후보

(우선순위 낮은 모바일 P2 항목들)

## 지금 손대지 않을 것

(ROADMAP §5 "모바일 완성도 깊게 파기"에 해당하는 deep mobile work는 v0.60 공개 웹 알파 후보 단계까지 보류)

## 수집 메타

- 스캔한 commit: <목록>
- 스캔한 리포트: <목록>
- 스캔한 CSS 위치: <목록>
- 백로그 항목 총 개수: <n>
```

### 3. Phase 1 완료 조건

- `reports/qa/v0_57_p2_mobile_backlog.md` 생성
- 손댈 후보 3개, 다음 라운드 후보 N개, 지금 손대지 않을 것 섹션을 채움
- 각 후보 항목은 출처와 깨지는 위치를 구체적으로 명시 (모호한 "전반적으로 개선" 금지)
- `src/`는 손대지 않는다 (백로그만 수집).
- `npm run harness:gate`는 돌릴 필요 없음 (코드 미변경).
- 본 phase의 commit 메시지 예시 — `v0.57 P2 Track C Phase 1: collect mobile polish backlog`

## 제약

- 게임 코드 손대지 않는다.
- v0.57 closed 상태 유지.
- "모바일 완성도 깊게 파기"는 명시적으로 P3로 분류 (ROADMAP §5 정책 준수).

## Phase 2 (이 phase에서는 실행 안 함)

Phase 1 결과를 받은 사용자가 백로그에서 1개 항목을 픽업해서 별도 Codex CLI 세션으로 다음과 같이 진행한다.

- 폴리시 1개 = 1 PR, small/medium 분량
- v0.57 #N 커밋 패턴 그대로 — 좁은 스코프 + layout-contract test 추가
- 본 트랙은 Track A(v0.58 #1)와 같은 CSS 파일을 건드릴 수 있으므로 모바일 미디어 쿼리 안쪽만 건드려 충돌 회피

Phase 2 프롬프트는 Phase 1 결과 확인 후 별도 작성한다.

## 관련 문서

- `AGENTS.md`
- `CLAUDE.md`
- `docs/ROADMAP.md` §2, §5
- `progress.md`
