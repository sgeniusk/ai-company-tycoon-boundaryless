# 월 진행 연출 (feat-028) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "다음 달" 한 순간에 시간이 흐르는 타임랩스 전환과 성과에 따라 오피스가 다르게 반응하는 분위 연출을 더해, 단조롭던 월 루프를 살린다.

**Architecture:** 분위 판정을 `MonthMoodJudge`(헤드리스 TDD)로 분리 → `GameScreen.PlayMoodReaction`이 분위별로 직원마다 다른 기존 포즈(Cheer/CardUse/Alert)를 배정해 균일 환호를 대체 → `HandleAdvanceMonth`를 코루틴화해 정산 후 타임랩스(빛 틴트+Day 카운터)를 앞에 끼운다. 코어·세이브 무변경, 새 에셋 0(기존 포즈·이모트 재사용).

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit(EditMode), ScreenshotCaptureTests(PlayMode).

**정본 스펙:** `docs/feat-028-month-presentation-design.md`

**파일 구조:**
- Create `Assets/_Project/Scripts/Systems/MonthMoodJudge.cs` — MonthSummary→MonthMood 순수 판정.
- Create `Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs` — 4분위 + 경계.
- Modify `Assets/_Project/Scripts/UI/ActorAnim.cs` — PlayOneShot이 Cheer도 받게(1줄).
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — PlayMoodReaction 추가 + ShowMonthlyDopamine 균일 환호 대체 + PlayMonthTransitionCo + HandleAdvanceMonth 코루틴화.

**검증 베이스라인:** 시작 전 `ps -axo command | grep "[U]nity.app" | grep -i projectpath`. `./init.sh` 현재 161/161. PlayMode는 `-nographics` 빼고 실행.

---

### Task 1: MonthMoodJudge — 월 성과 분위 판정 (TDD)

**Files:**
- Create: `Assets/_Project/Scripts/Systems/MonthMoodJudge.cs`
- Test: `Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs`

- [ ] **Step 1: 실패 테스트 작성**

`Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs`:

```csharp
// 월 정산 결과를 오피스 분위 4분위로 판정하는 헬퍼의 테스트. 순익(Revenue-TotalCashCost)·승급·경고·성장 신호.
using NUnit.Framework;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MonthMoodJudgeTests
    {
        static MonthSummary S(double rev, double cost, double users = 0, string stage = null, params string[] warnings)
        {
            var s = new MonthSummary { Revenue = rev, TotalCashCost = cost, NewUsers = users, StageChangedTo = stage };
            if (warnings != null)
                foreach (var w in warnings) s.Warnings.Add(w);
            return s;
        }

        [Test]
        public void BigProfit_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(20000, 5000)));
        }

        [Test]
        public void Promotion_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(3000, 2000, stage: "office_datacenter")));
        }

        [Test]
        public void BigUserGrowth_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(3000, 2000, users: 90000)));
        }

        [Test]
        public void SmallProfit_IsGood()
        {
            Assert.AreEqual(MonthMood.Good, MonthMoodJudge.Judge(S(3000, 2000)));
        }

        [Test]
        public void BreakEven_IsFlat()
        {
            Assert.AreEqual(MonthMood.Flat, MonthMoodJudge.Judge(S(2000, 2000)));
        }

        [Test]
        public void Loss_IsBad()
        {
            Assert.AreEqual(MonthMood.Bad, MonthMoodJudge.Judge(S(1000, 4000)));
        }

        [Test]
        public void Warning_IsBad()
        {
            Assert.AreEqual(MonthMood.Bad, MonthMoodJudge.Judge(S(9000, 1000, warnings: "현금 부족 경고")));
        }

        [Test]
        public void Null_IsFlat()
        {
            Assert.AreEqual(MonthMood.Flat, MonthMoodJudge.Judge(null));
        }
    }
}
```

- [ ] **Step 2: 실패 확인** — Run `./init.sh` → FAIL (MonthMoodJudge/MonthMood 미정의).

- [ ] **Step 3: 최소 구현**

`Assets/_Project/Scripts/Systems/MonthMoodJudge.cs`:

```csharp
// 월 정산 결과를 오피스 분위 4분위로 판정한다. 코어 무의존 순수 함수 (EventResultJudge 패턴).
namespace AICompanyTycoon.Systems
{
    public enum MonthMood { Flat, Good, Great, Bad }

    public static class MonthMoodJudge
    {
        // 경고/손실은 Bad(우선), 승급·큰 순익·큰 성장은 Great, 그 외 순익 양수는 Good, 나머지는 Flat.
        public static MonthMood Judge(MonthSummary s)
        {
            if (s == null) return MonthMood.Flat;
            if (s.Warnings != null && s.Warnings.Count > 0) return MonthMood.Bad;
            double net = s.Revenue - s.TotalCashCost;
            if (net < 0) return MonthMood.Bad;
            bool promoted = !string.IsNullOrEmpty(s.StageChangedTo);
            if (promoted || net >= 8000 || s.NewUsers >= 80000) return MonthMood.Great;
            if (net > 0) return MonthMood.Good;
            return MonthMood.Flat;
        }
    }
}
```

- [ ] **Step 4: 통과 확인** — Run `./init.sh` → PASS, 161 → 169 (신규 8).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/Systems/MonthMoodJudge.cs Assets/_Project/Scripts/Systems/MonthMoodJudge.cs.meta Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs Assets/_Project/Tests/EditMode/MonthMoodJudgeTests.cs.meta
git commit -m "feat-028 #1: MonthMoodJudge 월 성과 분위 판정 — 순익/승급/경고/성장 4분위 (EditMode 8)"
```
(Unity가 `.meta` 자동 생성 — `git status`로 `.cs.meta` 2개 확인 후 함께 스테이징. 없으면 인접 `.cs.meta` 복사 후 `guid`만 새 32-hex로. ProjectSettings.asset은 스테이징 금지.)

---

### Task 2: 성과 분위 반응 (ActorAnim Cheer 원샷 + PlayMoodReaction)

**Files:**
- Modify: `Assets/_Project/Scripts/UI/ActorAnim.cs` (`PlayOneShot`, line 49~59)
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (`ShowMonthlyDopamine` line 232~, 신규 `PlayMoodReaction`)

연출 코드, 테스트 무관. EditMode 169 유지. 균일 `react_cheer` 환호를 분위별 직원 다양 반응으로 대체.

- [ ] **Step 1: ActorAnim.PlayOneShot이 Cheer도 받게**

`ActorAnim.cs` line 51:
```csharp
            Sprite s = poseState == CardUse ? _cardUse : (poseState == Alert ? _alert : null);
```
교체:
```csharp
            Sprite s = poseState == CardUse ? _cardUse : poseState == Alert ? _alert : poseState == Cheer ? _cheer : null;
```
(`_cheer` 필드는 이미 존재 — DurationFor/SpriteFor가 Cheer를 다룸. 이제 원샷으로도 트리거 가능.)

- [ ] **Step 2: GameScreen에 PlayMoodReaction 추가**

`ShowMonthlyDopamine` 메서드 바로 위(또는 아래)에 추가:
```csharp
        // 월 성과 분위에 맞춰 오피스 직원마다 다른 포즈·이모트를 배정한다 — 단조로운 균일 환호 대체 (feat-028).
        // 기존 포즈(Cheer 홉·CardUse 팝·Alert 리코일) 재사용 — 각자 StaffBob 모션이 달라 다양성이 난다.
        void PlayMoodReaction(AICompanyTycoon.Systems.MonthMood mood)
        {
            if (_officeSceneContent == null) return;
            var anims = _officeSceneContent.GetComponentsInChildren<ActorAnim>();
            if (anims == null || anims.Length == 0) return;

            foreach (var a in anims)
            {
                switch (mood)
                {
                    case AICompanyTycoon.Systems.MonthMood.Great:
                        a.PlayOneShot(UnityEngine.Random.value < 0.5f ? ActorAnim.Cheer : ActorAnim.CardUse);
                        break;
                    case AICompanyTycoon.Systems.MonthMood.Good:
                        if (UnityEngine.Random.value < 0.6f) a.PlayOneShot(ActorAnim.Cheer);
                        break;
                    case AICompanyTycoon.Systems.MonthMood.Bad:
                        a.PlayOneShot(ActorAnim.Alert);
                        break;
                    // Flat — 기본 ambient(idle/work) 유지
                }
            }

            // 이모트 — 분위별, 일부 직원 위에만(Bad는 없음).
            string primary = mood == AICompanyTycoon.Systems.MonthMood.Great ? "react_idea"
                : mood == AICompanyTycoon.Systems.MonthMood.Good ? "react_cheer"
                : mood == AICompanyTycoon.Systems.MonthMood.Flat ? "react_coffee" : null;
            if (primary != null)
            {
                int n = mood == AICompanyTycoon.Systems.MonthMood.Great ? 3 : 1;
                for (int i = 0; i < n; i++) SpawnReaction(i == 0 ? primary : "react_cheer");
            }
        }
```

- [ ] **Step 3: ShowMonthlyDopamine의 균일 환호를 분위 반응으로 교체**

`ShowMonthlyDopamine`에서 수익 플로팅 직후의 균일 환호 블록(현재):
```csharp
                for (int i = 0; i < Mathf.Min(pops, 2); i++)
                {
                    SpawnReaction(i == 0 ? "react_cheer" : "react_coffee");
                }
```
이 블록을 삭제하고, 대신 메서드 안(수익 플로팅 `if (s.Revenue > 0){...}` 블록을 빠져나온 직후)에 추가:
```csharp
            // 분위 기반 직원 반응 — 균일 환호 대체 (feat-028).
            PlayMoodReaction(AICompanyTycoon.Systems.MonthMoodJudge.Judge(s));
```
(수익 플로팅·이용자 플로팅·세계 이벤트 토스트·니어미스는 그대로 둔다. `react_cheer/react_coffee`를 뿌리던 부분만 PlayMoodReaction이 대신한다.)

IMPORTANT: 먼저 `ShowMonthlyDopamine` 전체를 읽어 정확한 블록 위치를 확인하고, 균일 SpawnReaction만 제거·교체한다. ShowMonthlyDopamine은 RefreshAll 뒤 호출돼 액터가 이미 재생성된 상태라 PlayMoodReaction이 직접 트리거해도 안전(feat-023 _pending 함정 무관).

- [ ] **Step 4: 컴파일 + EditMode** — `ps` 확인 후 `./init.sh` → PASS 169 유지.

- [ ] **Step 5: PlayMode 캡처 — 분위 반응 육안**

`ScreenshotCaptureTests`에 분위 4종 캡처를 추가(기존 캡처 패턴). talent 주입된 오피스에서 `PlayMoodReaction(MonthMood.Great/Good/Flat/Bad)`를 직접 호출하고 `32-mood-great.png`~`35-mood-bad.png` 캡처(직원 포즈·이모트가 분위별로 다른지). 정확한 헬퍼·talent 주입은 기존 `Capture_*`(예: 01d-office-rich가 talent10 주입) 패턴을 따른다.

Run: Unity PlayMode → `Logs/shots/32-mood-*.png` 4종 — Great(다수 환호/카드+idea), Good(일부 환호), Flat(ambient+coffee), Bad(놀람 Alert, 이모트 없음) 육안.

- [ ] **Step 6: Commit**

```bash
git add Assets/_Project/Scripts/UI/ActorAnim.cs Assets/_Project/Scripts/UI/GameScreen.cs Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs
git commit -m "feat-028 #2: 성과 분위 반응 — ActorAnim Cheer 원샷 + PlayMoodReaction(분위별 직원 다양 포즈), 균일 환호 대체"
```

---

### Task 3: 월 진행 타임랩스 + HandleAdvanceMonth 코루틴화

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (`HandleAdvanceMonth` line 174~229, 신규 `PlayMonthTransitionCo`/`MonthPayoffCo`)

목표 — 정산 결과를 보여주기 전에 ~0.9초 타임랩스(빛 틴트 낮→밤 + Day 카운터)를 끼운다. 기존 페이오프 순서·로직은 보존하고 앞에 전환만 추가.

- [ ] **Step 1: 타임랩스 코루틴 추가**

GameScreen에 추가(`HandleAdvanceMonth` 근처):
```csharp
        // 월 진행 타임랩스 — 오피스 위에 빛 틴트(낮→밤→낮) 스윕 + "Day 1→30" 카운터. ~0.9초, 입력 차단. 새 에셋 0 (feat-028).
        System.Collections.IEnumerator PlayMonthTransitionCo()
        {
            if (_canvas == null) yield break;

            var tintGo = new GameObject("MonthTint", typeof(RectTransform), typeof(UnityEngine.UI.Image));
            tintGo.transform.SetParent(_canvas.transform, false);
            var tr = tintGo.GetComponent<RectTransform>();
            tr.anchorMin = Vector2.zero; tr.anchorMax = Vector2.one; tr.offsetMin = Vector2.zero; tr.offsetMax = Vector2.zero;
            var ti = tintGo.GetComponent<UnityEngine.UI.Image>();
            ti.color = new Color(0.05f, 0.07f, 0.16f, 0f);
            ti.raycastTarget = true; // 입력 차단

            var dayLabel = UiFactory.Label(_canvas.transform, "Day 1", 44);
            dayLabel.color = new Color(1f, 1f, 1f, 0.92f);
            dayLabel.alignment = TextAnchor.MiddleCenter;
            var dr = dayLabel.GetComponent<RectTransform>();
            dr.anchorMin = dr.anchorMax = new Vector2(0.5f, 0.62f);
            dr.sizeDelta = new Vector2(360f, 70f);
            dr.anchoredPosition = Vector2.zero;

            float dur = 0.9f, t = 0f;
            while (t < dur)
            {
                t += Time.unscaledDeltaTime;
                float p = Mathf.Clamp01(t / dur);
                ti.color = new Color(0.05f, 0.07f, 0.16f, Mathf.Sin(p * Mathf.PI) * 0.5f); // 0→0.5→0
                int day = Mathf.Clamp(1 + Mathf.FloorToInt(p * 30f), 1, 30);
                dayLabel.text = "Day " + day;
                yield return null;
            }
            Destroy(tintGo);
            Destroy(dayLabel.gameObject);
        }
```

- [ ] **Step 2: 페이오프를 코루틴으로 분리하고 전환을 앞에 끼운다**

현재 `HandleAdvanceMonth`(line 174~229)에서 `_lastSummary = _context.Month.AdvanceMonth();`(line 196)와 `_terminal = ...`(197) 다음의 **나머지 전부**(line 199~228 — SetStatus, 이벤트 트리거, RefreshAll, ShowMonthlyDopamine, Announce 3종, terminal/investment)를 잘라 새 코루틴 `MonthPayoffCo`로 옮긴다. `HandleAdvanceMonth`는 그 자리에서 `StartCoroutine(MonthPayoffCo(visibilityBefore, synergiesBefore));`로 끝낸다.

`HandleAdvanceMonth`의 line 196~197 다음(기존 199~228 자리)을:
```csharp
            _lastSummary = _context.Month.AdvanceMonth();
            _terminal = _lastSummary.GameOver || _lastSummary.GameWon;
            _seenGuidance.Clear();
            StartCoroutine(MonthPayoffCo(visibilityBefore, synergiesBefore));
        }

        // 정산 후 페이오프 — 타임랩스 전환을 앞에 끼우고 기존 순서(이벤트·도파민·해금·결과)를 보존 (feat-028).
        System.Collections.IEnumerator MonthPayoffCo(
            System.Collections.Generic.Dictionary<string, AICompanyTycoon.Systems.VisibilityState> visibilityBefore,
            System.Collections.Generic.HashSet<string> synergiesBefore)
        {
            yield return PlayMonthTransitionCo();

            SetStatus("월간 정산이 완료되었습니다.");

            var balance = _context.Catalog.balance;
            if (!_terminal && balance != null && UnityEngine.Random.value < (float)balance.eventTriggerChance)
            {
                var triggered = _context.Events.TryTrigger();
                if (triggered != null)
                {
                    ShowEventModal(triggered);
                    _pendingAlert += UnityEngine.Random.Range(1, 3);
                }
            }

            RefreshAll();
            ShowMonthlyDopamine(_lastSummary);
            AnnounceDiscoveries(visibilityBefore);
            AnnounceSynergies(synergiesBefore);
            AnnounceRichestClimb();

            if (_terminal)
            {
                ShowResultModal(_lastSummary.GameWon, _lastSummary.Outcome);
            }
            else if (_pendingInvestment != null && (_context.Events == null || _context.Events.Current == null))
            {
                var offer = _pendingInvestment;
                _pendingInvestment = null;
                ShowInvestmentOffer(offer);
            }
        }
```

IMPORTANT: 먼저 현재 `HandleAdvanceMonth` 전체(174~229)를 읽어 line 199~228이 위 코드와 정확히 일치하는지 확인하고, 그 구간만 `MonthPayoffCo` 본문으로 옮긴다. `SetStatus("월간 정산이 완료되었습니다.")`가 원래 AdvanceMonth 직후(199)에 있었으면 코루틴 안 전환 뒤로 옮긴다. `visibilityBefore`/`synergiesBefore`/`_expectedRevenue`는 AdvanceMonth 전(190~194)에서 계산돼 그대로 둔다(코루틴엔 visibility/synergies만 인자로 전달, _expectedRevenue는 필드라 무관). `using` 없이 풀네임으로 썼으니 추가 import 불필요하나, 파일 상단에 `using AICompanyTycoon.Systems;`가 있으면 풀네임을 줄여도 된다.

- [ ] **Step 3: 컴파일 + EditMode** — `ps` 확인 후 `./init.sh` → PASS 169 유지.

- [ ] **Step 4: PlayMode 캡처 — 타임랩스 육안**

`ScreenshotCaptureTests`에 타임랩스 중간 프레임 캡처 추가 — `PlayMonthTransitionCo`를 시작하고 ~0.45초 후(밤 틴트 피크 + Day 카운터 중간값) `36-month-timelapse.png` 캡처. 코루틴 직접 구동이 어려우면 틴트+Day 라벨을 직접 만들어 캡처하는 대체 패턴을 쓴다.

Run: Unity PlayMode → `36-month-timelapse.png`에 어두운 틴트 + "Day 15" 류 카운터 육안.

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs
git commit -m "feat-028 #3: 월 진행 타임랩스 — 빛 틴트 낮→밤 + Day 카운터, HandleAdvanceMonth 코루틴화(전환→페이오프)"
```

---

### Task 4: 통합 검증 + 문서 갱신

**Files:**
- Modify: `feature_list.json`, `progress.md`

- [ ] **Step 1: 단일 라이선스 확인 + 전체 검증**

Run: `ps ...` → `./init.sh`(169/169) → Unity PlayMode 캡처(32~36 + 회귀 01-main/01d).
Expected: EditMode 169/169 + 분위 4종·타임랩스 캡처 육안 + 월 진행 회귀 없음.

- [ ] **Step 2: feature_list.json에 feat-028 등록**

`feat-027` 항목 다음에 추가:
```json
    {
      "id": "feat-028",
      "name": "월 진행 연출 — 타임랩스 전환 + 성과 분위 반응 (P29)",
      "description": "사용자 피드백(2026-06-26) — 월 진행이 즉시·단조로움. 타임랩스(빛 틴트 낮→밤 + Day 카운터) + MonthMoodJudge 4분위 → 직원별 다양 포즈로 균일 환호 대체. 코어 무변경, 새 에셋 0. 정본 docs/feat-028-month-presentation-design.md, 계획 docs/feat-028-month-presentation-plan.md.",
      "dependencies": ["feat-023", "feat-027"],
      "status": "done",
      "owner": "Claude(판정·연출코드·검증, 서브에이전트 주도)",
      "evidence": "완료(EditMode 169/169 + PlayMode 캡처 32~36). #1 MonthMoodJudge(순익/승급/경고/성장 4분위, 헤드리스 8 신규 161→169) #2 ActorAnim Cheer 원샷 + PlayMoodReaction(분위별 직원 다양 포즈·이모트, 균일 환호 대체) #3 PlayMonthTransitionCo 타임랩스(빛 틴트 낮→밤 + Day 카운터) + HandleAdvanceMonth 코루틴화(전환→기존 페이오프 보존). 코어·세이브 무변경. 정본 docs/feat-028-month-presentation-design.md."
    }
```

- [ ] **Step 3: progress.md 헤드라인 갱신** — feat-028 완료 한 줄(타임랩스+분위, EditMode 169, 코어 무변경, 다음 — 월간 브리핑/베타).

- [ ] **Step 4: Commit**

```bash
git add feature_list.json progress.md
git commit -m "feat-028 #4: 클로즈아웃 — 월 진행 타임랩스 + 성과 분위 반응, EditMode 169 + 캡처 32~36"
```

---

## 자체 검토 메모

- **스펙 커버리지** — 기둥1 타임랩스(§기둥1) = Task3. 기둥2 분위 반응(§기둥2) = Task1(판정)+Task2(연출). 기둥3 모션 라이브러리(§기둥3) = Task2가 기존 5포즈(Idle/Work/Cheer/CardUse/Alert)의 서로 다른 StaffBob 모션을 분위 풀로 활용해 달성(신규 모션 코드 없이 YAGNI — 기존 포즈 모션이 이미 5종 구별됨). 검증 = Task1 TDD + Task2/3/4 캡처. ✅
- **타입 일관성** — `MonthMood{Flat,Good,Great,Bad}`·`MonthMoodJudge.Judge(MonthSummary)→MonthMood` Task1 정의 = Task2 호출 일치. `ActorAnim.Cheer/CardUse/Alert` 상수 = Task2 PlayOneShot 인자 일치. `MonthPayoffCo(Dictionary<string,VisibilityState>, HashSet<string>)` Task3 시그니처 = HandleAdvanceMonth의 visibilityBefore/synergiesBefore 타입 일치. PlayMonthTransitionCo·MonthPayoffCo 반환 `IEnumerator`. ✅
- **잔여 모호(실행 중 결정)** — 타임랩스 0.9초·틴트 알파 0.5·Day 30은 시작값(반복 체감은 실기/캡처 후 튜닝). react 이모트는 가용분(react_cheer/coffee/idea) 사용. HandleAdvanceMonth 코루틴화는 line 199~228을 그대로 옮기는 것이 핵심 — 순서·로직 불변, 전환만 앞에. 터미널(승리/패배) 달은 결과 모달이 페이오프 끝에서 뜸(타임랩스 후).
