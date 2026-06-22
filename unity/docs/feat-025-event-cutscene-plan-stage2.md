# 이벤트·고용 픽셀 컷씬 2단계 — 고용 등장 + 이벤트 발생 당황 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline — 1단계 인프라 재사용으로 작음). Steps use checkbox (`- [ ]`) syntax.

**Goal:** 직원 고용 순간(등장 환영)과 이벤트 발생 순간(당황)에 코너 컷인을 추가한다.

**Architecture:** 1단계 인프라(`EnqueueMini` animKey + `CutsceneFrameAnim`)를 그대로 재사용한다. CutsceneDirector에 진입점 2개 + GameScreen 트리거 2곳만 추가. 고용 등장 = 1단계 `cheer_a/b` 재활용, 이벤트 당황 = 신규 `surprise_a/b`(Codex 양산). 코어(Core/Data/Systems/Save) 무변경.

**Tech Stack:** Unity 6, C#, 1단계 CutsceneFrameAnim, feat-024 크로마키(Codex surprise 6장).

**분담:** 에셋(surprise 6장) = Codex (핸드오프 `docs/codex-handoff/feat025-stage2-surprise-frames.md`). 연출 코드 = Claude. 1단계와 동일 경계 — Codex는 `.cs`/progress/feature_list 무수정.

---

### Task 1: surprise_a/b 에셋 6장 (Codex 병렬)

**Files (아트):** `Assets/_Project/Resources/Art/Actors/actor_{human,ai,robot}_surprise_a.png`, `_surprise_b.png` (6장, 96px)

핸드오프 `docs/codex-handoff/feat025-stage2-surprise-frames.md`대로 Codex가 크로마키 양산. 연출 코드(Task 2~3)와 병렬. 에셋 도착 전 PlayEventTrigger는 정적 폴백(IconLibrary.Get null → CutsceneFrameAnim 미부착, idle 표시).

- [ ] Codex 핸드오프 실행 → `diagnose_halo.py` halo=0 → 반입 → Claude 교차검증(halo 재확인·몽타주 육안).

---

### Task 2: CutsceneDirector 진입점 — PlayHireArrival + PlayEventTrigger

**Files:** Modify `Assets/_Project/Scripts/UI/CutsceneDirector.cs`

1단계 `OnEventResult` 패턴 복제. 진입점 그룹(`PlayEventResult` 아래)에:

```csharp
        public static void PlayHireArrival() => _instance?.OnHireArrival();
        public static void PlayEventTrigger() => _instance?.OnEventTrigger();
```

핸들러(`OnEventResult` 아래)에:

```csharp
        int _hireActorCursor, _triggerActorCursor;

        // 고용 등장 — 새 동료가 환영받으며 등장(1단계 cheer 프레임 재활용). 직원 키 라운드로빈.
        void OnHireArrival()
        {
            var key = _eventStaffKeys[_hireActorCursor++ % _eventStaffKeys.Length];
            EnqueueMini("환영!", key, Mint, key + "_cheer");
        }

        // 이벤트 발생 당황 — 신규 surprise 프레임. 에셋 미반입 시 IconLibrary.Get null → 정적 폴백.
        void OnEventTrigger()
        {
            var key = _eventStaffKeys[_triggerActorCursor++ % _eventStaffKeys.Length];
            EnqueueMini("...?!", key, Hex("d98c4a"), key + "_surprise");
        }
```

- [ ] Step 1: 위 진입점·핸들러 추가.
- [ ] Step 2: `./init.sh` — EditMode 148 유지(연출 코드, 컴파일만).
- [ ] Step 3: Commit `feat-025 #7: CutsceneDirector 고용 등장·이벤트 발생 컷인 진입점`.

---

### Task 3: GameScreen 트리거 — 고용 성공 + 이벤트 발생

**Files:** Modify `Assets/_Project/Scripts/UI/GameScreen.cs`

- **고용 등장** — `_context.Recruit.Hire(captured)` 성공 블록(line ~2621, "새 인재 합류")에 `CutsceneDirector.PlayHireArrival();` 추가. `HireFreelance()` 성공(line ~2652)도 동일.
- **이벤트 발생 당황** — 이벤트가 **새로 발생해 모달이 처음 뜰 때만 1회**. ShowEventModal은 refresh마다 재호출되므로(line ~3007 UpdateEventModalFromContext), 중복 방지 필드 `string _lastTriggeredEventId`로 직전과 다른 이벤트일 때만 PlayEventTrigger. 정확한 배치 지점은 구현 시 ShowEventModal/Update 호출 경로(line 169/180/206/3003~3007)를 읽고 "새 이벤트 진입" 한 곳에만.

- [ ] Step 1: 고용 성공 트리거 추가(Hire + HireFreelance).
- [ ] Step 2: 이벤트 발생 트리거 추가(`_lastTriggeredEventId` 중복 방지).
- [ ] Step 3: `./init.sh` — EditMode 148.
- [ ] Step 4: PlayMode 캡처 — `23-hire-arrival.png`(환영 cheer) / `24-event-trigger.png`(당황 surprise, 에셋 반입 후).
- [ ] Step 5: Commit `feat-025 #8: 고용 성공·이벤트 발생 → 컷인 트리거 + 캡처`.

---

### Task 4: 통합 검증 + 문서

- [ ] 단일 라이선스 확인 → EditMode 148 + PlayMode 캡처(23/24) 육안 + surprise halo=0 재확인.
- [ ] feature_list.json feat-025 evidence에 2단계 추가, progress.md 헤드라인 갱신.
- [ ] Commit `feat-025 #9: 2단계 클로즈아웃 — 고용 등장·이벤트 발생 당황 컷인`.

---

## 다음 단계 (범위 밖)
- 3단계 — 위기 이벤트·특별 인재·첫 직원 전체 모달.
- 멀티엔딩 (별도 트랙).
