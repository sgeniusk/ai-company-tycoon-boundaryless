# feat-028 월 진행 연출 설계 — 타임랩스 전환 + 성과 분위 반응

"다음 달" 한 순간을 살린다. 즉시 정산되던 월 진행에 ① 시간이 흐르는 타임랩스 전환과 ② 성과에 따라 오피스가 다르게 반응하는 분위 연출을 더해, 단조롭던 월 루프에 기대감·정리·다양성을 만든다.

## 배경 / 문제

사용자 피드백(2026-06-26) — "1달이 진행되는 애니메이션이 있으면 좋겠다 / 애니·이벤트신이 단조로워 재미없다." 현재 `GameScreen.HandleAdvanceMonth`는 **즉시** 정산하고 곧장 떠다니는 `+$수익` 텍스트 + 항상 같은 `FanCheer` 점프 + 토스트를 뿌린다. 시간이 흐르는 느낌도, 성과에 따른 반응 차이도 없다.

feat-027로 오피스 구성(빈 바닥·일렬)이 해소돼 화면이 채워졌으므로, 이제 그 위에 동적 연출이 살아난다.

## 데이터 사실 (설계 근거)

- `MonthSummary` 필드 — `Revenue`, `TotalCashCost`, `NewUsers`, `StageChangedTo`(승급 시 성급), `Warnings`(파산 위험 등), `WorldEventTitles`, `GameWon`/`GameOver`. **순익 = Revenue − TotalCashCost**가 핵심 호/불호 신호.
- `ActorAnim` 상태 — `Idle/Work/Cheer/CardUse/Alert` 5종(상수). `PlayOneShot`은 현재 CardUse/Alert만. sad 프레임은 컷씬 전용(오피스 액터 미로드). `GameScreen.TriggerActorOneShot(pose, count)`로 N명에 포즈 발사.
- 월 진행 시각 연출은 `ShowMonthlyDopamine`(수익 플로팅 + react 이모트 + 토스트). 타임랩스·달력·시계 비주얼은 **없음**(신규).

## 3기둥 (코어 무변경, 새 에셋 0)

### 기둥 1 — 월 진행 타임랩스 (`MonthTransition`)
"다음 달" → 정산 결과를 보여주기 **전에** ~0.9초 타임랩스가 오피스 위 제자리에서 돈다.
- **빛 틴트 오버레이** — 오피스 위 임시 Image가 낮→황혼→밤→복귀로 색 스윕(BackgroundScrim 위, 색만 애니).
- **Day 카운터** — 가운데 위 작은 라벨이 "Day 1 → 30" 빠르게 증가(스프라이트 아님).
- **직원 work** — 전 직원 `ActorAnim`을 Work 포즈로 — "한 달치 일이 지나간다".
- 모달 아님·입력 짧게 차단. 끝나면 정산 페이오프로 이어진다.

### 기둥 2 — 성과 기반 분위 반응 (`MonthMoodJudge` + 분위 연출)
`MonthMoodJudge`(헤드리스 순수함수, TDD) — `MonthSummary` → `MonthMood` 4분위.

| 분위 | 판정 (순익 net = Revenue − TotalCashCost) | 오피스 반응 (직원마다 랜덤·스태거, 비동기화) |
|---|---|---|
| **Great(대박)** | 승급(StageChangedTo 있음) or net ≥ 큰 임계 or NewUsers ≥ 큰 임계 | 대부분 Cheer 포즈 + 점프/주먹 펌프 + react_cheer·idea 이모트 + 색종이 |
| **Good(호조)** | net > 0 and 성장 양수 | 일부 Cheer·일부 Work + react_cheer·coffee |
| **Flat(평범)** | net ≈ 0, 변화 미미 | Work/Idle 타이핑 + 가끔 react_coffee |
| **Bad(부진)** | net < 0 or Warnings 있음 | Alert(걱정) 포즈 + 슬럼프 모션 + 긍정 이모트 없음 |

핵심 — 지금은 결과 무관 **같은 FanCheer 점프** 하나가 단조로움의 근원. 이제 ① 달마다 분위가 다르고 ② 직원마다 다른 걸 해서 두 축으로 깨진다. 오피스가 "이번 달 잘됐는지"를 몸으로 말해준다.

구현 — `GameScreen`에 분위별 풀에서 각 `ActorAnim`에 포즈를 배정하는 `PlayMoodReaction(MonthMood)` 추가. `ActorAnim.PlayOneShot`을 Cheer도 받도록 소폭 확장(현재 CardUse/Alert만). 기존 `ShowMonthlyDopamine`의 균일 `react_cheer` 환호를 분위 기반으로 대체.

### 기둥 3 — 모션 라이브러리 (FanCheer 독점 깨기)
현재 환호 모션이 `FanCheer`(사인 점프) 하나뿐. `StaffBob`(상태-인지 이동 모션)에 분위·포즈별 변형 2~3종 추가 — 주먹 펌프(cheer), 좌우 흔들(good), 슬럼프 처짐(bad). 비균일 scale 금지(픽셀 보존, feat-018 교훈) — 이동(translation)·회전만. 컷씬(feat-025 미니)도 끌어 쓸 수 있게 분리.

## 아키텍처 / 파일

- Create `Assets/_Project/Scripts/Systems/MonthMoodJudge.cs` — `MonthSummary → MonthMood` 순수 판정(Systems, 헤드리스).
- Test `Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs` — 4분위 + 경계.
- Create `Assets/_Project/Scripts/UI/MonthTransition.cs` — 타임랩스 코루틴(빛 틴트·Day 카운터). 오피스 위 오버레이.
- Modify `Assets/_Project/Scripts/UI/ActorAnim.cs` — `PlayOneShot`이 Cheer도 받게(원샷 환호).
- Modify `Assets/_Project/Scripts/UI/StaffBob.cs` — 분위·포즈별 모션 변형(주먹 펌프·흔들·슬럼프).
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — `HandleAdvanceMonth`를 코루틴화(정산 → 타임랩스 yield → RefreshAll → 분위 반응 → 이벤트/해금). `PlayMoodReaction(MonthMood)` 추가. 기존 균일 cheer 대체.

**플로우**
```
"다음 달" → AdvanceMonth(헤드리스, 기존) → summary
  → MonthTransition 타임랩스(~0.9초, 입력 차단)
  → RefreshAll
  → MonthMoodJudge.Judge(summary) → 분위
  → PlayMoodReaction(분위) — 직원별 다양한 포즈·모션·이모트 (기존 ShowMonthlyDopamine 균일 cheer 대체, 수익 플로팅은 유지)
  → 이벤트/해금/시너지/결과 모달 (기존, 타임랩스 뒤)
```

`HandleAdvanceMonth`는 코루틴화하되 기존 순서·로직(이벤트 트리거·도감·결과 모달)은 보존하고 타임랩스를 앞에, 분위 반응을 cheer 자리에 끼운다.

## 검증

- EditMode — `MonthMoodJudgeTests` 4분위 + 경계(net 부호·승급·Warnings·NewUsers 임계). 161 → 약 167.
- PlayMode 캡처 — 타임랩스 중간 프레임(밤 틴트 + Day 카운터) + 분위 4종 오피스 반응(`32~36` 신규). 단일 라이선스 ps 확인.

## 스코프 / 분담

- Claude — MonthMoodJudge(로직 TDD), MonthTransition/StaffBob/ActorAnim/GameScreen(연출 코드), 검증. 전부 코드(새 에셋 0).
- Codex — 없음(이번 트랙은 기존 포즈·이모트 재사용).

## 스코프 밖 (다음)

- 월간 브리핑 카드(원래 요청 #1) — 타임랩스→브리핑→반응 순서가 자연스러우니 다음 트랙 1순위.
- 분위별 전용 신규 프레임(sad 오피스 포즈 등) 양산 — 현재는 기존 포즈 재사용 골격.
