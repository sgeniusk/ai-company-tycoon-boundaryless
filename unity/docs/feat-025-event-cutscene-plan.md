# 이벤트 결과 픽셀 컷씬 (feat-025 1단계 MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이벤트 선택의 결과(자원 +/-)를 픽셀 캐릭터가 환호/낙담으로 연기하는 코너 컷인을 추가한다.

**Architecture:** 코어(시뮬) 무변경. 판정 헬퍼(EventResultJudge, 헤드리스 EditMode TDD) → CutsceneDirector.PlayEventResult(코너 컷인, 기존 EnqueueMini 패턴 확장) → GameScreen onClick 트리거. 골격은 기존 cheer 포즈 + 코드 모션으로 먼저 동작시키고, 그 뒤 새 픽셀 애니 프레임(imagegen)으로 교체한다.

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit(EditMode), ScreenshotCaptureTests(PlayMode), feat-024 크로마키 파이프라인(codex imagegen → key_chroma.py → diagnose_halo.py).

**확정 결정 (설계 열린 질문 해소):**
- 판정 — choice.effects의 amount 합 부호. >0 환호, <0 낙담, =0 컷인 생략.
- 캐릭터 — 코너 미니 1명(랜덤 직원 actorKey). 환호/낙담 애니는 3종 다 준비.
- 시그널 — GameEvents 신설 없이 CutsceneDirector.PlayEventResult static 직접 호출.
- 프레임 — 2프레임 루프.

---

### Task 1: 결과 판정 헬퍼 (EventResultJudge)

**Files:**
- Create: `Assets/_Project/Scripts/Systems/EventResultJudge.cs`
- Test: `Assets/_Project/Tests/EditMode/EventResultJudgeTests.cs`

- [ ] **Step 1: Write the failing test**

```csharp
// 이벤트 선택 효과 합 부호로 결과 톤을 판정하는 헬퍼의 테스트.
using NUnit.Framework;
using System.Collections.Generic;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EventResultJudgeTests
    {
        static EventChoice Choice(params (ResourceId, double)[] effs)
        {
            var c = new EventChoice();
            foreach (var (r, a) in effs)
                c.effects.Add(new ResourceAmount { resource = r, amount = a });
            return c;
        }

        [Test]
        public void PositiveSum_IsPositive()
        {
            var c = Choice((ResourceId.Cash, 1000), (ResourceId.Reputation, -1));
            Assert.AreEqual(EventResultTone.Positive, EventResultJudge.Judge(c));
        }

        [Test]
        public void NegativeSum_IsNegative()
        {
            var c = Choice((ResourceId.Cash, -500));
            Assert.AreEqual(EventResultTone.Negative, EventResultJudge.Judge(c));
        }

        [Test]
        public void ZeroOrEmpty_IsNeutral()
        {
            Assert.AreEqual(EventResultTone.Neutral, EventResultJudge.Judge(Choice()));
            Assert.AreEqual(EventResultTone.Neutral, EventResultJudge.Judge(null));
        }
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./init.sh` (또는 Unity EditMode 필터 EventResultJudgeTests)
Expected: FAIL — `EventResultJudge` / `EventResultTone` 미정의 컴파일 에러.

- [ ] **Step 3: Write minimal implementation**

```csharp
// 이벤트 선택 효과(자원 델타) 합의 부호로 컷씬 결과 톤을 판정한다. 코어 무의존 순수 함수.
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public enum EventResultTone { Neutral, Positive, Negative }

    public static class EventResultJudge
    {
        public static EventResultTone Judge(EventChoice choice)
        {
            if (choice == null || choice.effects == null) return EventResultTone.Neutral;
            double sum = 0;
            foreach (var e in choice.effects) sum += e.amount;
            if (sum > 0) return EventResultTone.Positive;
            if (sum < 0) return EventResultTone.Negative;
            return EventResultTone.Neutral;
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./init.sh`
Expected: PASS — 145 → 148 (신규 3 테스트).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/Systems/EventResultJudge.cs Assets/_Project/Tests/EditMode/EventResultJudgeTests.cs
git commit -m "feat-025 #1: 이벤트 결과 판정 헬퍼 — effects 합 부호로 톤 판정 (EditMode 3)"
```

---

### Task 2: CutsceneDirector.PlayEventResult — 코너 컷인 골격 (기존 포즈)

**Files:**
- Modify: `Assets/_Project/Scripts/UI/CutsceneDirector.cs` (enum CutsceneKind, static 진입점, OnEventResult 핸들러)

골격은 새 스프라이트 없이 기존 `EnqueueMini`(actorKey + accent)를 재사용한다. 환호 = Mint accent + "대박!" 라벨, 낙담 = 회색 accent + "이런..." 라벨. 캐릭터는 랜덤 직원(actor_human/ai/robot).

- [ ] **Step 1: static 진입점 + 핸들러 추가**

`CutsceneDirector.cs`의 static 진입점 그룹(`PlayMini` 아래, line 97 부근)에 추가:

```csharp
        // 이벤트 결과 컷인 — 톤(긍정/부정)에 따라 환호/낙담 코너 미니. EventResultTone.Neutral은 호출부에서 생략.
        public static void PlayEventResult(bool isPositive) => _instance?.OnEventResult(isPositive);
```

`OnCapability`/`OnDomain` 핸들러(line 90~91) 부근에 추가:

```csharp
        static readonly string[] _staffKeys = { "actor_human", "actor_ai", "actor_robot" };
        int _eventActorCursor;

        void OnEventResult(bool isPositive)
        {
            var key = _staffKeys[_eventActorCursor++ % _staffKeys.Length];
            if (isPositive) EnqueueMini("대박!", key, Mint);
            else EnqueueMini("이런...", key, Hex("8a7f72"));
        }
```

- [ ] **Step 2: 컴파일 확인**

Run: `./init.sh`
Expected: PASS — 148 유지(연출 코드, 테스트 무관). 컴파일 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add Assets/_Project/Scripts/UI/CutsceneDirector.cs
git commit -m "feat-025 #2: CutsceneDirector.PlayEventResult — 환호/낙담 코너 컷인 골격(기존 포즈)"
```

---

### Task 3: GameScreen 트리거 — 이벤트 선택 onClick에서 결과 컷인 호출

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (ShowEventModal onClick, line 3015 부근)

- [ ] **Step 1: onClick 핸들러에 판정 + 컷인 호출 추가**

`ShowEventModal`의 onClick 람다(현 `if (_context.Events.Resolve(captured.id)) { ... }` 블록)를 다음으로 교체:

```csharp
                button.button.onClick.AddListener(() =>
                {
                    if (_context.Events.Resolve(captured.id))
                    {
                        var tone = AICompanyTycoon.Systems.EventResultJudge.Judge(captured);
                        HideEventModal();
                        SetStatus("이벤트 선택을 적용했습니다.");
                        RefreshAll();
                        if (tone != AICompanyTycoon.Systems.EventResultTone.Neutral)
                            CutsceneDirector.PlayEventResult(tone == AICompanyTycoon.Systems.EventResultTone.Positive);
                    }
                });
```

- [ ] **Step 2: 컴파일 + EditMode 확인**

Run: `./init.sh`
Expected: PASS — 148 유지.

- [ ] **Step 3: PlayMode 캡처로 컷인 동작 확인**

새 캡처 테스트를 `ScreenshotCaptureTests.cs`에 추가 — CutsceneDirector.PlayEventResult(true)/(false)를 직접 호출하고 코너 컷인을 캡처. (기존 `Capture_*` 패턴 따라 `Capture_EventResult` 작성, 산출 `22-event-result.png`.)

Run: Unity PlayMode (`-nographics` 빼고)
Expected: PASS — `Logs/shots/22-event-result.png`에 코너 컷인(환호 캐릭터 + "대박!") 렌더.

- [ ] **Step 4: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs
git commit -m "feat-025 #3: 이벤트 선택 onClick → 결과 컷인 트리거 + PlayMode 캡처"
```

---

### Task 4: 새 픽셀 애니 프레임 생성 (환호/낙담 × 3캐릭터 × 2프레임)

**Files:**
- Create (아트): `Resources/Art/Actors/actor_{char}_cheer_a.png`, `actor_{char}_cheer_b.png`, `actor_{char}_sad_a.png`, `actor_{char}_sad_b.png` (char = human/ai/robot, 총 12장)
- Tooling: `Tools~/pixel_office/feat024/key_chroma.py`, `diagnose_halo.py`, `import_to_resources.py` (재사용)

이 Task는 TDD가 아니라 feat-024 크로마키 절차다.

- [ ] **Step 1: 레퍼런스 시트 생성** — 현 actor_{char}_cheer.png(환호)·alert.png(놀람을 낙담 베이스로)를 캐릭터별 묶어 `ref_react_{char}.png` 생성.

- [ ] **Step 2: codex imagegen 발사 (stdin 파이프)** — 캐릭터별 환호 2프레임 + 낙담 2프레임 시트를 마젠타 배경으로 생성:

```bash
cd unity
echo '<프롬프트: actor_human 환호 2프레임(팔 올림 A/B) + 낙담 2프레임(고개 숙임 A/B), 1행 4컷, magenta #FF00FF 배경, 캐릭터에 마젠타 금지, 흰색 자제>' \
  | codex exec -s workspace-write -i 'Tools~/pixel_office/feat024/ref_react_human.png' \
  > /tmp/codex_react_human.log 2>&1
# ai/robot 동일 (ai는 violet이지만 마젠타와 충분히 멂 → 마젠타 키 OK, 의상 확인)
```

- [ ] **Step 3: 키잉 + halo=0 게이트** — feat-024 `key_props.py`(종횡비 보존) 또는 `key_chroma.py` 변형으로 4컷 슬라이스·키잉:

```bash
python3 Tools~/pixel_office/feat024/key_props.py Tools~/pixel_office/feat024/raw_react_human_sheet.png \
  --names "actor_human_cheer_a,actor_human_cheer_b,actor_human_sad_a,actor_human_sad_b" --key magenta
python3 Tools~/pixel_office/feat024/diagnose_halo.py --dir Tools~/pixel_office/feat024 --glob actor_human_ --thr 198
```
Expected: GATE PASS (경계 헤일로 0 / semi 0 / 키색잔여 0).

- [ ] **Step 4: 반입** — `import_props.py`의 NAMES를 12 프레임으로 바꿔 Resources/Art/Actors 반입(.meta GUID 보존, 신규는 actor_human.png.meta 미러 생성).

- [ ] **Step 5: 검증 시트 육안 + Commit**

```bash
git add Assets/_Project/Resources/Art/Actors/actor_*_cheer_*.png Assets/_Project/Resources/Art/Actors/actor_*_sad_*.png
git commit -m "feat-025 #4: 환호/낙담 애니 프레임 12장 크로마키 생성 (3캐릭터×2반응×2프레임, halo=0)"
```

---

### Task 5: CutsceneFrameAnim 컴포넌트 + 컷인 배선 (새 프레임 교체)

**Files:**
- Create: `Assets/_Project/Scripts/UI/CutsceneFrameAnim.cs`
- Modify: `Assets/_Project/Scripts/UI/CutsceneDirector.cs` (PlayMiniCo의 MakeActor → 프레임 애니로, 또는 OnEventResult 전용 경로)

- [ ] **Step 1: CutsceneFrameAnim 작성**

```csharp
// 컷씬 전용 — Image의 sprite를 프레임 배열로 루프 재생한다(오피스 직원 ActorAnim과 분리). 비균일 scale 미사용(픽셀 보존).
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class CutsceneFrameAnim : MonoBehaviour
    {
        Image _img;
        Sprite[] _frames;
        float _fps = 4f, _t;
        int _i;

        public void Init(Image img, IReadOnlyList<Sprite> frames, float fps = 4f)
        {
            _img = img;
            _frames = new Sprite[frames.Count];
            for (int k = 0; k < frames.Count; k++) _frames[k] = frames[k];
            _fps = fps; _i = 0; _t = 0f;
            if (_frames.Length > 0 && _img != null) _img.sprite = _frames[0];
        }

        void Update()
        {
            if (_frames == null || _frames.Length < 2 || _img == null) return;
            _t += Time.unscaledDeltaTime;
            if (_t >= 1f / _fps)
            {
                _t = 0f;
                _i = (_i + 1) % _frames.Length;
                _img.sprite = _frames[_i];
            }
        }
    }
}
```

- [ ] **Step 2: OnEventResult가 프레임 애니 컷인을 쓰도록 배선**

`CutsceneDirector`에 환호/낙담 전용 컷인 코루틴을 추가(EnqueueMini 변형) — MakeActor로 만든 Image에 `CutsceneFrameAnim` 부착, 프레임은 `IconLibrary.Get($"{key}_cheer_a")`, `_cheer_b`(또는 `_sad_a/b`). `OnEventResult`를 EnqueueMini 대신 이 경로로 교체. (정확한 코루틴은 PlayMiniCo를 복제해 actor 부분만 프레임 애니로 바꾼다.)

- [ ] **Step 3: 컴파일 + EditMode**

Run: `./init.sh`
Expected: PASS — 148 유지.

- [ ] **Step 4: PlayMode 캡처 — 새 프레임 애니 컷인 육안**

Run: Unity PlayMode
Expected: `22-event-result.png`에 새 환호/낙담 프레임 캐릭터 렌더(이전 기존 포즈 → 새 프레임).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/CutsceneFrameAnim.cs Assets/_Project/Scripts/UI/CutsceneDirector.cs
git commit -m "feat-025 #5: CutsceneFrameAnim 프레임 루프 + 이벤트 결과 컷인을 새 애니 프레임으로 배선"
```

---

### Task 6: 통합 검증 + 문서 갱신

**Files:**
- Modify: `feature_list.json`, `progress.md`

- [ ] **Step 1: 단일 라이선스 확인 + 전체 검증**

Run: `ps -axo command | grep "[U]nity.app" | grep projectpath` (다른 Unity 미실행 확인) → `./init.sh` → Unity PlayMode 캡처.
Expected: EditMode 148/148 + PlayMode (신규 Capture_EventResult 포함) + `22-event-result.png` 환호/낙담 컷인 육안.

- [ ] **Step 2: feature_list.json에 feat-025 등록 + progress.md 갱신**

feat-025 항목 추가(status done, evidence — 1단계 MVP 이벤트 결과 컷인 + 환호/낙담 애니, EditMode 148/148 + PlayMode + 캡처). progress.md 헤드라인 갱신.

- [ ] **Step 3: Commit**

```bash
git add feature_list.json progress.md
git commit -m "feat-025 #6: 1단계 MVP 클로즈아웃 — 이벤트 결과 픽셀 컷씬, EditMode 148/148 + 캡처"
```

---

## 다음 단계 (이 plan 범위 밖)
- 2단계 — 고용 등장 컷인 + 이벤트 발생 당황 애니
- 3단계 — 위기 이벤트·특별 인재·첫 직원 전체 모달
- 멀티엔딩 트랙 (별도)
