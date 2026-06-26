# 멀티엔딩 컷씬 (feat-026) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 런이 끝나는 순간 엔딩 버킷(전설/성공/차고로/몰락)에 맞는 전체 모달 픽셀 컷씬을 띄워, 텍스트뿐이던 결말에 시각 클라이맥스를 가산한다.

**Architecture:** 코어 무변경. 헤드리스 판정 헬퍼(`EndingCutsceneJudge`, EditMode TDD) → feat-025 모달 컷씬 인프라(`CutsceneDirector.PlayModalCo` 셸 + `MakeActor`/`BurstConfetti`/`AddSpotlight`/`FanCheer`/`CutsceneFrameAnim` 재사용)에 `Ending` 종류 추가 → `GameScreen.ShowResultModal`에서 결과 모달 직전에 컷씬 호출(순수 가산). 새 엔딩 데이터·새 스프라이트 0.

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit(EditMode), ScreenshotCaptureTests(PlayMode). 기존 cheer/sad/surprise 크로마키 액터 프레임(feat-024/025) 재사용.

**정본 스펙:** `docs/feat-026-multi-ending-cutscene-design.md`

**파일 구조:**
- Create: `Assets/_Project/Scripts/Systems/EndingCutsceneJudge.cs` — 엔딩→버킷 순수 판정 + `EndingBucket` enum.
- Create: `Assets/_Project/Tests/EditMode/EndingCutsceneJudgeTests.cs` — 버킷 4종·경계 테스트.
- Modify: `Assets/_Project/Scripts/UI/CutsceneDirector.cs` — `CutsceneKind.Ending`, `PlayEnding` 진입점, `PopulateEnding`/`EndingActor`/`EndingBarColor`, 타이틀·somber 배선.
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` — `ShowResultModal`에서 버킷 판정 + `PlayEnding` 호출.
- Modify: `Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs` — `Capture_AllStates`에 엔딩 버킷 4종 캡처 추가.
- Modify: `feature_list.json`, `progress.md` — feat-026 등록·증거.

**검증 베이스라인:** 시작 전 `ps -axo command | grep "[U]nity.app" | grep projectpath`로 다른 Unity 미실행 확인. `./init.sh` 현재 150/150.

---

### Task 1: EndingCutsceneJudge — 헤드리스 버킷 판정 (TDD)

**Files:**
- Create: `Assets/_Project/Scripts/Systems/EndingCutsceneJudge.cs`
- Test: `Assets/_Project/Tests/EditMode/EndingCutsceneJudgeTests.cs`

- [ ] **Step 1: 실패 테스트 작성**

`Assets/_Project/Tests/EditMode/EndingCutsceneJudgeTests.cs`:

```csharp
// 엔딩 결말을 컷씬 톤 버킷으로 가르는 판정 헬퍼의 테스트. won + priority + 파산(cash) 신호.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EndingCutsceneJudgeTests
    {
        static EndingDef Ending(int priority)
        {
            var e = ScriptableObject.CreateInstance<EndingDef>();
            e.priority = priority;
            return e;
        }

        [Test]
        public void Won_HighPriority_IsLegendary()
        {
            Assert.AreEqual(EndingBucket.Legendary,
                EndingCutsceneJudge.Judge(Ending(120), new GameModel { Cash = 500000 }, true));
        }

        [Test]
        public void Won_PriorityBoundary100_IsLegendary()
        {
            Assert.AreEqual(EndingBucket.Legendary,
                EndingCutsceneJudge.Judge(Ending(100), new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Won_Priority99_IsTriumph()
        {
            Assert.AreEqual(EndingBucket.Triumph,
                EndingCutsceneJudge.Judge(Ending(99), new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Won_NullEnding_IsTriumph()
        {
            Assert.AreEqual(EndingBucket.Triumph,
                EndingCutsceneJudge.Judge(null, new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Lost_Solvent_IsRestart()
        {
            Assert.AreEqual(EndingBucket.Restart,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = 50000 }, false));
        }

        [Test]
        public void Lost_Bankrupt_IsCollapse()
        {
            Assert.AreEqual(EndingBucket.Collapse,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = -500 }, false));
        }

        [Test]
        public void Lost_ZeroCash_IsCollapse()
        {
            Assert.AreEqual(EndingBucket.Collapse,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = 0 }, false));
        }
    }
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `./init.sh`
Expected: FAIL — `EndingCutsceneJudge` / `EndingBucket` 미정의 컴파일 에러.

- [ ] **Step 3: 최소 구현 작성**

`Assets/_Project/Scripts/Systems/EndingCutsceneJudge.cs`:

```csharp
// 엔딩 결말을 컷씬 톤 버킷으로 판정한다. 코어 무의존 순수 함수 (EventResultJudge 패턴).
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public enum EndingBucket { Triumph, Legendary, Restart, Collapse }

    public static class EndingCutsceneJudge
    {
        // 승리는 위세(priority>=100=전설/그 외 성공), 패배는 파산 여부(cash<=0=몰락/그 외 차고로)로 가른다.
        // ending은 null 가능(폴백 미존재 데이터) — won이 우선이라 안전.
        public static EndingBucket Judge(EndingDef ending, GameModel model, bool won)
        {
            if (won)
                return (ending != null && ending.priority >= 100)
                    ? EndingBucket.Legendary : EndingBucket.Triumph;
            double cash = model != null ? model.Get(ResourceId.Cash) : 0;
            return cash <= 0 ? EndingBucket.Collapse : EndingBucket.Restart;
        }
    }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `./init.sh`
Expected: PASS — 150 → 157 (신규 7 테스트).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/Systems/EndingCutsceneJudge.cs Assets/_Project/Tests/EditMode/EndingCutsceneJudgeTests.cs
git commit -m "feat-026 #1: 엔딩 컷씬 버킷 판정 헬퍼 — won/priority/파산 신호로 4버킷 (EditMode 7)"
```

---

### Task 2: CutsceneDirector — Ending 종류 + 버킷 무대

**Files:**
- Modify: `Assets/_Project/Scripts/UI/CutsceneDirector.cs`

기존 `PlayModalCo` 셸·헬퍼(`MakeActor`, `BurstConfetti`, `AddSpotlight`, `AddPresenterGlow`, `AddStageFloor`, `FanCheer`, `CutsceneFrameAnim`, `Gold`, `TealBar`, `Hex`)를 재사용한다. 변경은 `Ending` 종류에만 작용하고 기존 종류 동작은 바이트 동일 유지.

- [ ] **Step 1: using 추가 (없으면)**

`CutsceneDirector.cs` 상단 using 블록에 `AICompanyTycoon.Systems`가 없으면 추가한다(이미 있으면 건너뜀):

```csharp
using AICompanyTycoon.Systems;
```

- [ ] **Step 2: enum에 Ending 추가**

line 14 `public enum CutsceneKind { Launch, StageUp, Ipo, FirstHire, SpecialHire, Crisis }` 를:

```csharp
    public enum CutsceneKind { Launch, StageUp, Ipo, FirstHire, SpecialHire, Crisis, Ending }
```

- [ ] **Step 3: 엔딩 상태 필드 + 진입점 추가**

`PlayCrisis`(line 133) 바로 아래에 추가:

```csharp
        // 엔딩 컷씬 진입점 (feat-026). bucket=톤 버킷, title=결과 모달과 동일 결말 타이틀.
        EndingBucket _endingBucket;
        string _endingTitle;
        public static void PlayEnding(EndingBucket bucket, string title) => _instance?.TryEnding(bucket, title);

        void TryEnding(EndingBucket bucket, string title)
        {
            if (_playing || _root == null) return;
            _endingBucket = bucket;
            _endingTitle = title;
            StartCoroutine(PlayModalCo(CutsceneKind.Ending, null));
        }
```

- [ ] **Step 4: PlayModalCo — somber 억제 + 타이틀바 색**

`PlayModalCo` 안에서 두 곳을 고친다.

(a) bigMoment 계산부(line 148 부근). 기존:
```csharp
            bool bigMoment = kind == CutsceneKind.StageUp || kind == CutsceneKind.Ipo || !brief;
```
바로 아래에 추가:
```csharp
            // feat-026: 엔딩 비축하 버킷(차고로/몰락)은 플래시·색종이 억제.
            bool endingSomber = kind == CutsceneKind.Ending
                && (_endingBucket == EndingBucket.Restart || _endingBucket == EndingBucket.Collapse);
            if (endingSomber) bigMoment = false;
```

(b) 타이틀바 색(line 170). 기존:
```csharp
            AddImage(titleBar, kind == CutsceneKind.Crisis ? Hex("c0392b") : TealBar);
```
교체:
```csharp
            Color barColor = TealBar;
            if (kind == CutsceneKind.Crisis) barColor = Hex("c0392b");
            else if (kind == CutsceneKind.Ending) barColor = EndingBarColor(_endingBucket);
            AddImage(titleBar, barColor);
```

(c) 색종이 분기(line 213). 기존:
```csharp
                if (kind != CutsceneKind.Crisis) BurstConfetti(stage, brief ? 16 : (bigMoment ? 44 : 32));
```
교체:
```csharp
                if (kind != CutsceneKind.Crisis && !endingSomber) BurstConfetti(stage, brief ? 16 : (bigMoment ? 44 : 32));
```

- [ ] **Step 5: TitleFor에 Ending 케이스 추가**

`TitleFor`(line 226) switch에 `case CutsceneKind.Crisis` 아래 추가:

```csharp
                case CutsceneKind.Ending: return string.IsNullOrEmpty(_endingTitle) ? "결말" : _endingTitle;
```

- [ ] **Step 6: Populate 스위치에 Ending 배선**

`PlayModalCo`의 종류별 무대 switch(line 182~190)에서 `case CutsceneKind.Crisis` 아래 추가:

```csharp
                case CutsceneKind.Ending: PopulateEnding(stage, _endingBucket, motions); break;
```

- [ ] **Step 7: PopulateEnding + EndingActor + EndingBarColor 추가**

`PopulateCrisis`(line 328~344) 메서드 바로 아래에 추가:

```csharp
        // ---- 엔딩 무대 (feat-026) ---- 버킷 톤에 맞춘 결말. 전설=3인 환호+글로우, 성공=2인 환호, 차고로=낙담, 몰락=놀람+경고.
        void PopulateEnding(RectTransform stage, EndingBucket bucket, List<Coroutine> motions)
        {
            AddStageFloor(stage);
            switch (bucket)
            {
                case EndingBucket.Legendary:
                    AddSpotlight(stage);
                    AddPresenterGlow(stage, motions);
                    EndingActor(stage, "actor_human", new Vector2(-220f, -150f), 185f, "_cheer", motions, 0f);
                    EndingActor(stage, "actor_ai",    new Vector2(0f, -160f),   195f, "_cheer", motions, 0.33f);
                    EndingActor(stage, "actor_robot", new Vector2(220f, -150f), 185f, "_cheer", motions, 0.66f);
                    break;
                case EndingBucket.Triumph:
                    AddSpotlight(stage);
                    EndingActor(stage, "actor_human", new Vector2(-150f, -130f), 200f, "_cheer", motions, 0f);
                    EndingActor(stage, "actor_ai",    new Vector2(150f, -130f),  200f, "_cheer", motions, 0.4f);
                    break;
                case EndingBucket.Restart:
                    EndingActor(stage, "actor_human", new Vector2(0f, -90f), 240f, "_sad", motions, -1f);
                    break;
                case EndingBucket.Collapse:
                    EndingActor(stage, "actor_human", new Vector2(0f, -90f), 240f, "_surprise", motions, -1f);
                    var warn = UiFactory.Label(stage, "!", 110);
                    warn.color = Hex("e24b3a");
                    var wr = warn.GetComponent<RectTransform>();
                    wr.anchorMin = wr.anchorMax = new Vector2(0.5f, 0.5f);
                    wr.anchoredPosition = new Vector2(150f, 90f);
                    wr.sizeDelta = new Vector2(120f, 150f);
                    warn.alignment = TextAnchor.MiddleCenter;
                    break;
            }
        }

        // 직원 1명을 지정 반응 프레임(_cheer/_sad/_surprise)으로 세운다. 프레임 미반입 시 정적 포즈. cheerDelay<0 이면 점프 모션 생략.
        RectTransform EndingActor(RectTransform stage, string key, Vector2 pos, float size, string react, List<Coroutine> motions, float cheerDelay)
        {
            var actor = MakeActor(stage, key, pos, size);
            var fa = IconLibrary.Get(key + react + "_a");
            var fb = IconLibrary.Get(key + react + "_b");
            if (fa != null && fb != null)
                actor.gameObject.AddComponent<CutsceneFrameAnim>().Init(actor.GetComponent<Image>(), new[] { fa, fb }, 4f);
            if (cheerDelay >= 0f) motions.Add(StartCoroutine(FanCheer(actor, cheerDelay)));
            return actor;
        }

        // 엔딩 버킷별 타이틀바 색 — 전설 골드 / 몰락 붉음 / 차고로 무채색 / 성공 틸.
        Color EndingBarColor(EndingBucket bucket)
        {
            switch (bucket)
            {
                case EndingBucket.Legendary: return Gold;
                case EndingBucket.Collapse:  return Hex("c0392b");
                case EndingBucket.Restart:   return Hex("6b6357");
                default:                     return TealBar;
            }
        }
```

- [ ] **Step 8: 컴파일 + EditMode 확인**

Run: `./init.sh`
Expected: PASS — 157 유지(연출 코드, 테스트 무관). 컴파일 에러 없음.

- [ ] **Step 9: Commit**

```bash
git add Assets/_Project/Scripts/UI/CutsceneDirector.cs
git commit -m "feat-026 #2: CutsceneDirector Ending 종류 — 버킷별 무대·타이틀바 색·somber 억제 (기존 셸 재사용)"
```

---

### Task 3: GameScreen — 결과 모달 직전 엔딩 컷씬 트리거

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (`ShowResultModal`, line 3174~3204)

`ShowResultModal`은 이미 `var ending = EndingService.Determine(...)`(line 3179)를 메서드 스코프에 두고, if/else 양쪽에서 `_resultTitle.text`를 채운다. 그 뒤 `_resultModal.SetActive(true)` 직전에 컷씬을 띄운다(순수 가산 — 기존 텍스트·도감·지분결말 로직 불변).

- [ ] **Step 1: SetActive 직전에 버킷 판정 + 호출 추가**

`ShowResultModal` 안 `_resultModal.SetActive(true);`(line 3202) 바로 위에 추가:

```csharp
            // feat-026: 결과 모달 직전 엔딩 버킷 컷씬(전체화면 클라이맥스). 닫히면 뒤의 결과 모달이 드러난다.
            var endingBucket = EndingCutsceneJudge.Judge(ending, _context.Model, won);
            CutsceneDirector.PlayEnding(endingBucket, _resultTitle.text);
```

(`EndingCutsceneJudge`는 `AICompanyTycoon.Systems` — GameScreen은 이미 같은 네임스페이스의 `EndingService`를 무자격 호출하므로 using 존재. 추가 import 불필요.)

- [ ] **Step 2: 컴파일 + EditMode 확인**

Run: `./init.sh`
Expected: PASS — 157 유지.

- [ ] **Step 3: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs
git commit -m "feat-026 #3: ShowResultModal — 결과 모달 직전 엔딩 버킷 컷씬 트리거 (가산)"
```

---

### Task 4: PlayMode 캡처 — 엔딩 버킷 4종 육안

**Files:**
- Modify: `Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs` (`Capture_AllStates`, line 366~374)

기존 `Capture_AllStates`의 위기 모달 캡처(27-crisis, line 366~372) 다음, `Object.Destroy(go);`(line 374) 직전에 엔딩 4종을 이어 캡처한다. `using AICompanyTycoon.Systems;`가 파일 상단에 없으면 추가한다.

- [ ] **Step 1: 엔딩 버킷 4종 캡처 추가**

line 372(`yield return WaitRealtime(2.2f);` — 위기 다음) 과 line 374(`Object.Destroy(go);`) 사이에 삽입:

```csharp
            // 28) 엔딩 전설 (feat-026) — 골드 타이틀·3인 환호·색종이 폭풍.
            CutsceneDirector.PlayEnding(EndingBucket.Legendary, "🏆 프런티어 데모 제국");
            yield return WaitRealtime(0.6f);
            var cs11 = GameObject.Find("CutsceneDirector");
            if (cs11 != null && cs11.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs11, "28-ending-legendary.png");
            yield return WaitRealtime(2.2f);

            // 29) 엔딩 성공 (feat-026) — 틸 타이틀·2인 환호.
            CutsceneDirector.PlayEnding(EndingBucket.Triumph, "표준 세계의 복리 플랫폼");
            yield return WaitRealtime(0.6f);
            var cs12 = GameObject.Find("CutsceneDirector");
            if (cs12 != null && cs12.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs12, "29-ending-triumph.png");
            yield return WaitRealtime(2.2f);

            // 30) 엔딩 차고로 (feat-026) — 무채색 타이틀·낙담(sad)·색종이 없음.
            CutsceneDirector.PlayEnding(EndingBucket.Restart, "다시 차고로");
            yield return WaitRealtime(0.6f);
            var cs13 = GameObject.Find("CutsceneDirector");
            if (cs13 != null && cs13.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs13, "30-ending-restart.png");
            yield return WaitRealtime(2.2f);

            // 31) 엔딩 몰락 (feat-026) — 붉은 타이틀·놀람(surprise)·경고 기호·색종이 없음.
            CutsceneDirector.PlayEnding(EndingBucket.Collapse, "다시 차고로");
            yield return WaitRealtime(0.6f);
            var cs14 = GameObject.Find("CutsceneDirector");
            if (cs14 != null && cs14.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs14, "31-ending-collapse.png");
            yield return WaitRealtime(2.2f);
```

- [ ] **Step 2: 상단 using 확인**

`ScreenshotCaptureTests.cs` 상단에 `using AICompanyTycoon.Systems;`가 없으면 추가(`EndingBucket` 참조용).

- [ ] **Step 3: PlayMode 실행 + 캡처 육안**

Run: Unity PlayMode (`-nographics` 빼고, macOS Metal 오프스크린). 다른 Unity 미실행 확인 후.
Expected: `Logs/shots/28-ending-legendary.png`~`31-ending-collapse.png` 4장 — 전설(골드바·3인·색종이) / 성공(틸·2인) / 차고로(무채색·낙담·색종이 없음) / 몰락(붉은바·놀람·경고 기호·색종이 없음) 육안 확인.

- [ ] **Step 4: Commit**

```bash
git add Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs
git commit -m "feat-026 #4: 엔딩 버킷 4종 PlayMode 캡처 (28~31-ending)"
```

---

### Task 5: 통합 검증 + 문서 갱신

**Files:**
- Modify: `feature_list.json`, `progress.md`

- [ ] **Step 1: 단일 라이선스 확인 + 전체 검증**

Run:
```bash
ps -axo command | grep "[U]nity.app" | grep projectpath   # 다른 Unity 미실행 확인
./init.sh                                                  # EditMode 157/157
```
이어 Unity PlayMode 캡처(Task 4) 28~31 육안 재확인.
Expected: EditMode 157/157 + 캡처 4종 정상.

- [ ] **Step 2: feature_list.json에 feat-026 등록**

`feat-025` 항목 다음에 추가:
```json
    { "id": "feat-026", "status": "done", "name": "멀티엔딩 컷씬 — 런 종료 버킷 연출 (P27)" }
```
(기존 항목 형식·쉼표에 맞춘다.)

- [ ] **Step 3: progress.md 헤드라인 갱신**

"현재 상태" 블록에 feat-026 완결 한 줄 추가 — 4버킷(전설/성공/차고로/몰락) 가산 연출, EndingCutsceneJudge(EditMode 157) + CutsceneDirector Ending 종류 + ShowResultModal 가산 트리거, 코어 무변경, 캡처 28~31. 정본 `docs/feat-026-multi-ending-cutscene-design.md`.

- [ ] **Step 4: Commit**

```bash
git add feature_list.json progress.md
git commit -m "feat-026 #5: 클로즈아웃 — 멀티엔딩 컷씬 4버킷, EditMode 157 + 캡처 28~31"
```

---

## 자체 검토 메모

- **스펙 커버리지** — 버킷 4종(설계 §버킷 분류) = Task1 판정 + Task2 무대. 가산 트리거(설계 §아키텍처 3) = Task3. 검증(설계 §검증) = Task4·5. 새 데이터·스프라이트 0(설계 §스코프) — Task 전체가 기존 에셋·헬퍼만 사용, 신규 생성 없음. ✅
- **타입 일관성** — `EndingBucket`(Systems) enum 순서 `{ Triumph, Legendary, Restart, Collapse }` 전 Task 동일. `Judge(EndingDef, GameModel, bool)` 시그니처 Task1 정의 = Task3 호출 일치. `PlayEnding(EndingBucket, string)` Task2 정의 = Task3·Task4 호출 일치. `EndingActor(..., float cheerDelay)` 음수=모션 생략 규약 Task2 내부 일관. ✅
- **잔여 모호 (실행 중 결정 가능)** — 컷씬이 결과 모달보다 Overlay 위(sortingOrder 230)라 모달이 뒤에서 먼저 떠도 순서 어긋남 없음(설계 명시). 비축하 버킷은 `BurstConfetti` 미호출 + bigMoment=false로 `BigMomentFlash`도 생략됨. `_cheer/_sad/_surprise` 프레임은 feat-024/025에서 3캐릭터 전부 반입 완료 — 미반입 시 정적 포즈 폴백(EndingActor 가드).
