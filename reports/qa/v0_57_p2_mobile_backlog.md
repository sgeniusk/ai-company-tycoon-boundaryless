# v0.57 P2 Mobile Polish Backlog

작성일: 2026-05-27
출처: v0.57 closed 슬라이스 + ROADMAP 부족한 축 + CSS 스캔
대상 viewport: 390x844 (iPhone 12-15) 기준

## 손댈 후보 (이번 라운드)

### 1. 모바일 패널 접힘 요약을 active panel 전환 지점에 붙인다
- 출처: `docs/ROADMAP.md:118` ("모바일 패널 접힘 요약"), `src/App.css:8794` mobile shell, `src/App.css:9312` mobile one-column panel rules
- 깨지는 위치: 390x844 `?scenario=office-visuals`; 하단 모바일 탭으로 메뉴를 바꾸면 접힌 패널의 핵심 상태가 탭 라벨/상단 상태 4개 안에 남지 않아 다음 클릭 후보를 다시 열어 확인해야 한다.
- 수정 분량: medium
- 예상 변경 파일: `src/components/GameChrome.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- 우선순위 근거: ROADMAP의 명시적 모바일 부족 축이며, "모바일은 깨지지 않는 보조 대응" 정책 안에서 deep redesign 없이 요약 한 줄만 추가할 수 있다.

### 2. launch-impact 보조 섹션을 접었을 때 카드/경쟁사 요약을 남긴다
- 출처: `reports/playtests/v0_56_blind_playtest_session_02.md:83`, `reports/playtests/v0_56_blind_playtest_session_02.md:89`, commit `5b64fe6`, `src/App.css:3154`
- 깨지는 위치: 390x844 `?scenario=reward` 또는 첫 출시 결과 화면; `launch-impact-extras`를 접으면 카드 영향/경쟁사 반응의 세부 정보는 줄지만, 접힌 상태에서 "무슨 영향이 있었는지"를 한눈에 복구하는 compact summary가 없다.
- 수정 분량: small
- 예상 변경 파일: `src/components/LaunchImpactPanel.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- 우선순위 근거: v0.57 P1 #2가 모바일 접힘 토글을 닫았지만, 남은 P2는 접힌 상태의 의미 보존이다. 화면 밀도 완화 효과가 크고 변경 범위가 한 패널로 좁다.

### 3. alpha-run debrief 모바일에서 하이라이트/타임라인 우선순위를 더 명확히 한다
- 출처: `reports/playtests/v0_56_blind_playtest_session_05.md:83`, `reports/playtests/v0_56_blind_playtest_session_05.md:89`, commit `3a0bb62`, `src/App.css:2820`, `src/App.css:9358`
- 깨지는 위치: 390x844 `?scenario=persona20` 또는 `alpha-run-second-reward-picked`; 4-beat 타임라인과 하이라이트 블록이 모두 세로로 쌓여 "오늘 플레이한 핵심 장면"의 1순위가 모바일 첫 화면에서 덜 분리된다.
- 수정 분량: small
- 예상 변경 파일: `src/components/AlphaRunDebrief.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- 우선순위 근거: v0.57 P1 #4가 기본 시각 위계는 올렸으나, 모바일 완주 화면은 재플레이 의지와 직접 연결된다. 한 화면의 섹션 순서/summary만 다듬는 P2로 제한 가능하다.

## 다음 라운드 후보

(우선순위 낮은 모바일 P2 항목들)

### 1. workforce mix 모바일 행의 텍스트 이해도 재검증 후 한 줄 카피를 더 줄인다
- 출처: `reports/playtests/v0_56_blind_playtest_session_01.md:85`, `reports/playtests/v0_56_blind_playtest_session_01.md:91`, commit `a27111d`, `src/App.css:9356`
- 깨지는 위치: 390x844 `?scenario=fresh`/staffing 초반; AI 운용 한도와 로봇 해금 경로가 모바일 한 줄 요약만으로 80% 이상 이해되는지 아직 실제 사용자 검증이 없다.
- 수정 분량: small
- 예상 변경 파일: `src/components/WorkforceMixPanel.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- 분류 근거: v0.57 P1 #1에서 역할 배지/핵심 수치/행 분리가 이미 들어갔으므로, Phase 2 첫 픽업보다는 실제 플레이테스트 증거 이후가 적절하다.

### 2. `심사까지 진행` 자동 진행을 모바일에서도 진행 중 상태로 보여준다
- 출처: `reports/playtests/v0_56_blind_playtest_session_03.md:89`, commit `127fd49`
- 깨지는 위치: 390x844 flow/growth-picked 이후; 버튼을 누르기 전 월 수는 보이지만, 여러 달이 한 번에 넘어가는 동안의 진행 중 피드백은 아직 약하다.
- 수정 분량: medium
- 예상 변경 파일: `src/game/guidance.ts`, `src/components/GameChrome.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- 분류 근거: 모바일 전용이라기보다 진행 피드백 전반의 문제라 Track C 첫 라운드에서는 패널 밀도 문제보다 뒤로 둔다.

### 3. 실제 모바일 블라인드 세션에서 패널 접힘 후보를 재랭킹한다
- 출처: `docs/ROADMAP.md:113`, `docs/ROADMAP.md:117`, `docs/ROADMAP.md:118`
- 깨지는 위치: 390x844 실제 플레이 세션 전반; 자동/AGY 리허설 기준으로는 후보가 잡혔지만 실제 사람 5명 모바일 증거는 아직 없다.
- 수정 분량: small
- 예상 변경 파일: `reports/playtests/`, `reports/qa/`
- 분류 근거: 코드 변경이 아니라 증거 수집 트랙이다. Phase 2에서 UI 하나를 고치기 전후로 비교 자료가 필요할 때 실행한다.

## 지금 손대지 않을 것

(ROADMAP §5 "모바일 완성도 깊게 파기"에 해당하는 deep mobile work는 v0.60 공개 웹 알파 후보 단계까지 보류)

### 1. 모바일 완성도 깊게 파기
- 출처: `docs/ROADMAP.md:242`
- 깨지는 위치: 390x844 전체 앱의 터치 타깃, 스크롤, 정보 밀도, 애니메이션, 패널 전환을 한 번에 재설계하는 범위
- 분류: P3
- 보류 근거: ROADMAP §5의 "지금 하지 않을 것"이며, 이번 Track C는 v0.57 P2 백로그 수집/소규모 후보 선정만 한다.

### 2. 모바일을 1차 플랫폼 수준으로 끌어올리는 전면 반응형 재설계
- 출처: `docs/ROADMAP.md:24`, `docs/ROADMAP.md:26`
- 깨지는 위치: 390x844 전체 플레이 루프; 현재 우선순위는 웹 알파와 Steam 인디 후보이고 모바일은 깨지지 않는 보조 대응이다.
- 분류: P3
- 보류 근거: 후보 1~3처럼 좁은 패널 단위로 나눌 수 없는 범위라 v0.57 P2 라운드의 변경 단위가 아니다.

## 수집 메타

- 스캔한 commit: `a27111d`, `5b64fe6`, `127fd49`, `3a0bb62`
- 스캔한 리포트: `reports/qa/v0_57_*` 없음, `reports/playtests/v0_56_blind_playtest_session_01.md`, `reports/playtests/v0_56_blind_playtest_session_02.md`, `reports/playtests/v0_56_blind_playtest_session_03.md`, `reports/playtests/v0_56_blind_playtest_session_04.md`, `reports/playtests/v0_56_blind_playtest_session_05.md`
- 스캔한 CSS 위치: `src/App.css` media blocks at `@media (max-width: 700px)` and `@media (max-width: 520px)`; relevant anchors `src/App.css:2820`, `src/App.css:3154`, `src/App.css:8794`, `src/App.css:9312`, `src/App.css:9534`; no `TODO`/`FIXME`/`v0.57`/`후속` comments found inside media blocks
- 백로그 항목 총 개수: 8
