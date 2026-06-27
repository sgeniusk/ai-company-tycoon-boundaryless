# 월말 브리핑 + 다박자 시퀀스 (feat-029) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 월이 끝날 때 손익계산서 브리핑 카드로 회사 운영결과를 보여주고, 월 진행을 타임랩스→중간 이벤트→브리핑의 다박자 시퀀스로 묶는다.

**Architecture:** 브리핑 표시 모델을 `MonthBriefing`(헤드리스 TDD)로 분리 → `GameScreen`이 브리핑 모달(BuildResultModal 패턴)을 빌드·표시 → `MonthPayoffCo`를 재구성해 타임랩스를 늘리고 중간에 이벤트를 일시정지로 끼우고 월말 브리핑을 삽입. 코어·세이브 무변경, 새 에셋 0.

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit(EditMode), ScreenshotCaptureTests(PlayMode).

**정본 스펙:** `docs/feat-029-monthly-briefing-design.md`

**파일 구조:**
- Create `Assets/_Project/Scripts/Systems/MonthBriefing.cs` — MonthSummary→표시 모델 순수 헬퍼.
- Create `Assets/_Project/Tests/EditMode/MonthBriefingTests.cs` — 순익·플래그·분위.
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — BuildBriefingModal + ShowBriefing + MonthPayoffCo 재구성 + PlayMonthTransitionCo 이벤트 일시정지.
- Modify `Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs` — 브리핑 캡처.

**검증 베이스라인:** 시작 전 `ps -axo command | grep "[U]nity.app" | grep -i projectpath`. `./init.sh` 현재 170/170. PlayMode는 `-nographics` 빼고.

---

### Task 1: MonthBriefing — 브리핑 표시 모델 (TDD)

**Files:**
- Create: `Assets/_Project/Scripts/Systems/MonthBriefing.cs`
- Test: `Assets/_Project/Tests/EditMode/MonthBriefingTests.cs`

- [ ] **Step 1: 실패 테스트 작성**

`Assets/_Project/Tests/EditMode/MonthBriefingTests.cs`:

```csharp
// 월 정산 결과를 브리핑 카드 표시 모델로 변환하는 헬퍼의 테스트. 순익·조건부 행·분위.
using NUnit.Framework;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MonthBriefingTests
    {
        static MonthSummary S(double rev, double cost, double users = 0, string stage = null, string worldEvent = null, string warning = null)
        {
            var s = new MonthSummary { Month = 3, Revenue = rev, TotalCashCost = cost, BaseCost = 3000, SalaryCost = 4200, ComputeCost = 1800, NewUsers = users, DataGenerated = 1240, StageChangedTo = stage };
            if (worldEvent != null) s.WorldEventTitles.Add(worldEvent);
            if (warning != null) s.Warnings.Add(warning);
            return s;
        }

        [Test]
        public void Net_IsRevenueMinusCost()
        {
            var v = MonthBriefing.Build(S(24500, 9000));
            Assert.AreEqual(15500, v.Net, 0.001);
        }

        [Test]
        public void Loss_NetNegative()
        {
            var v = MonthBriefing.Build(S(1000, 4000));
            Assert.Less(v.Net, 0);
        }

        [Test]
        public void Mood_MatchesJudge()
        {
            var s = S(24500, 9000);
            Assert.AreEqual(MonthMoodJudge.Judge(s), MonthBriefing.Build(s).Mood);
        }

        [Test]
        public void WorldEventFlag_OnlyWhenPresent()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).HasWorldEvent);
            var v = MonthBriefing.Build(S(5000, 3000, worldEvent: "에이전틱 붐"));
            Assert.IsTrue(v.HasWorldEvent);
            Assert.AreEqual("에이전틱 붐", v.WorldEventText);
        }

        [Test]
        public void WarningFlag_OnlyWhenPresent()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).HasWarning);
            Assert.IsTrue(MonthBriefing.Build(S(1000, 9000, warning: "현금 부족")).HasWarning);
        }

        [Test]
        public void PromotedFlag_OnlyWhenStageChanged()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).Promoted);
            Assert.IsTrue(MonthBriefing.Build(S(5000, 3000, stage: "office_datacenter")).Promoted);
        }

        [Test]
        public void Null_SafeDefaults()
        {
            var v = MonthBriefing.Build(null);
            Assert.AreEqual(0, v.Net, 0.001);
            Assert.IsFalse(v.HasWorldEvent);
        }
    }
}
```

- [ ] **Step 2: 실패 확인** — `./init.sh` → FAIL (MonthBriefing 미정의).

- [ ] **Step 3: 최소 구현**

`Assets/_Project/Scripts/Systems/MonthBriefing.cs`:

```csharp
// 월 정산 결과(MonthSummary)를 브리핑 카드 표시 모델로 변환한다. 코어 무의존 순수 함수.
namespace AICompanyTycoon.Systems
{
    public struct MonthBriefingView
    {
        public int Month;
        public double Revenue, BaseCost, SalaryCost, ComputeCost, TotalCost, Net, NewUsers, DataGenerated;
        public MonthMood Mood;
        public bool HasWorldEvent, HasWarning, Promoted;
        public string WorldEventText, WarningText;
    }

    public static class MonthBriefing
    {
        public static MonthBriefingView Build(MonthSummary s)
        {
            var v = new MonthBriefingView();
            if (s == null) return v;
            v.Month = s.Month;
            v.Revenue = s.Revenue;
            v.BaseCost = s.BaseCost; v.SalaryCost = s.SalaryCost; v.ComputeCost = s.ComputeCost;
            v.TotalCost = s.TotalCashCost;
            v.Net = s.Revenue - s.TotalCashCost;
            v.NewUsers = s.NewUsers; v.DataGenerated = s.DataGenerated;
            v.Mood = MonthMoodJudge.Judge(s);
            v.HasWorldEvent = s.WorldEventTitles != null && s.WorldEventTitles.Count > 0;
            v.WorldEventText = v.HasWorldEvent ? s.WorldEventTitles[0] : null;
            v.HasWarning = s.Warnings != null && s.Warnings.Count > 0;
            v.WarningText = v.HasWarning ? s.Warnings[0] : null;
            v.Promoted = !string.IsNullOrEmpty(s.StageChangedTo);
            return v;
        }
    }
}
```

- [ ] **Step 4: 통과 확인** — `./init.sh` → PASS, 170 → 177 (신규 7).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/Systems/MonthBriefing.cs Assets/_Project/Scripts/Systems/MonthBriefing.cs.meta Assets/_Project/Tests/EditMode/MonthBriefingTests.cs Assets/_Project/Tests/EditMode/MonthBriefingTests.cs.meta
git commit -m "feat-029 #1: MonthBriefing 표시 모델 — 순익·조건부 행·분위 (EditMode 7)"
```
(`.meta` 2개 함께 스테이징 확인. ProjectSettings.asset 제외.)

---

### Task 2: 브리핑 모달 UI (BuildBriefingModal + ShowBriefing)

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs`

손익계산서 카드 모달을 만든다. 기존 `BuildResultModal`(스크림+카드+VBox+Label+Button+AddLayout 패턴, line ~3088)을 먼저 읽어 동일 관용구를 쓴다. `FormatNumber`(수치 포맷, ShowMonthlyDopamine에서 사용)·`Clear(Transform)`·`PopInCard`·`UiTheme`·`AddLayout`·`Stretch`는 이미 존재.

- [ ] **Step 1: 필드 + BuildBriefingModal 추가**

GameScreen 필드 영역에 추가:
```csharp
        GameObject _briefingModal;
        Transform _briefingCard;
```

`BuildResultModal` 메서드 옆에 추가(BuildResultModal과 같은 스크림+카드 골격, 내용은 ShowBriefing이 동적 생성):
```csharp
        // 월말 브리핑 모달 — 스크림 + 빈 카드(VBox). 내용은 ShowBriefing이 MonthBriefingView로 채운다 (feat-029).
        void BuildBriefingModal(Transform parent)
        {
            _briefingModal = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _briefingModal.name = "BriefingModal";
            Stretch(_briefingModal.GetComponent<RectTransform>());

            var card = UiFactory.Panel(_briefingModal.transform, UiTheme.PanelBg);
            card.name = "BriefingCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.07f, 0.22f);
            rect.anchorMax = new Vector2(0.93f, 0.78f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 10, new RectOffset(26, 26, 24, 24));
            _briefingCard = card.transform;

            _briefingModal.SetActive(false);
        }
```

Call `BuildBriefingModal(_canvas.transform);` next to where `BuildResultModal(_canvas.transform);` is called (in the build sequence around line 142).

- [ ] **Step 2: ShowBriefing + 행 헬퍼 추가**

```csharp
        // 손익계산서 브리핑을 채워 띄운다 — 닫으면 onClose 콜백 (feat-029).
        void ShowBriefing(MonthSummary summary, System.Action onClose)
        {
            if (_briefingCard == null) { onClose?.Invoke(); return; }
            var v = AICompanyTycoon.Systems.MonthBriefing.Build(summary);
            Clear(_briefingCard);

            // 헤더 — "N월차 결산" + 분위 배지
            var header = UiFactory.Label(_briefingCard, v.Month + "월차 결산", 40);
            header.alignment = TextAnchor.MiddleCenter;
            AddLayout(header.gameObject, 56, 0);
            var badge = UiFactory.Label(_briefingCard, MoodLabel(v.Mood), 28);
            badge.alignment = TextAnchor.MiddleCenter;
            badge.color = MoodColor(v.Mood);
            AddLayout(badge.gameObject, 34, 0);

            // 손익
            BriefingRow("매출", "+$" + FormatNumber(v.Revenue), UiTheme.ChipGoldText, 30);
            BriefingRow("· 기본 운영비", "−$" + FormatNumber(v.BaseCost), UiTheme.TextSecondary, 24);
            BriefingRow("· 급여", "−$" + FormatNumber(v.SalaryCost), UiTheme.TextSecondary, 24);
            BriefingRow("· 연산비", "−$" + FormatNumber(v.ComputeCost), UiTheme.TextSecondary, 24);
            BriefingRow("총비용", "−$" + FormatNumber(v.TotalCost), UiTheme.TextSecondary, 28);
            var netColor = v.Net >= 0 ? new Color(0.20f, 0.62f, 0.36f) : new Color(0.84f, 0.28f, 0.22f);
            BriefingRow("순익", (v.Net >= 0 ? "+$" : "−$") + FormatNumber(System.Math.Abs(v.Net)), netColor, 34);

            // 보조 지표
            BriefingRow("신규 이용자", "+" + FormatNumber(v.NewUsers), UiTheme.ScoreboardTag, 26);
            BriefingRow("데이터 생성", "+" + FormatNumber(v.DataGenerated), UiTheme.TextSecondary, 26);

            // 조건부 행
            if (v.Promoted) BriefingRow("승급", "새 오피스로 이사!", new Color(0.20f, 0.62f, 0.36f), 24);
            if (v.HasWorldEvent) BriefingRow("세계 이벤트", v.WorldEventText, UiTheme.ScoreboardLive, 24);
            if (v.HasWarning) BriefingRow("경고", v.WarningText, new Color(0.84f, 0.28f, 0.22f), 24);

            var (btn, _) = UiFactory.Button(_briefingCard, "다음 달로");
            btn.onClick.AddListener(() => { _briefingModal.SetActive(false); onClose?.Invoke(); });
            AddLayout(btn.gameObject, 76, 0);

            _briefingModal.SetActive(true);
            PopInCard(_briefingModal, "BriefingCard");
        }

        // 브리핑 한 행(라벨 좌·값 우)을 _briefingCard에 추가한다.
        void BriefingRow(string label, string value, Color valueColor, int fontSize)
        {
            var row = new GameObject("Row", typeof(RectTransform));
            row.transform.SetParent(_briefingCard, false);
            var hb = UiFactory.HBox(row.transform, 8);
            hb.childForceExpandWidth = true;
            var l = UiFactory.Label(row.transform, label, fontSize);
            l.alignment = TextAnchor.MiddleLeft;
            l.color = UiTheme.TextSecondary;
            var val = UiFactory.Label(row.transform, value, fontSize);
            val.alignment = TextAnchor.MiddleRight;
            val.color = valueColor;
            AddLayout(row, fontSize + 12, 0);
        }

        // 분위 라벨/색.
        string MoodLabel(AICompanyTycoon.Systems.MonthMood m)
        {
            switch (m)
            {
                case AICompanyTycoon.Systems.MonthMood.Great: return "대박";
                case AICompanyTycoon.Systems.MonthMood.Good: return "호조";
                case AICompanyTycoon.Systems.MonthMood.Bad: return "부진";
                default: return "평범";
            }
        }
        Color MoodColor(AICompanyTycoon.Systems.MonthMood m)
        {
            switch (m)
            {
                case AICompanyTycoon.Systems.MonthMood.Great: return new Color(0.20f, 0.62f, 0.36f);
                case AICompanyTycoon.Systems.MonthMood.Good: return UiTheme.TabActive;
                case AICompanyTycoon.Systems.MonthMood.Bad: return new Color(0.84f, 0.28f, 0.22f);
                default: return UiTheme.TextSecondary;
            }
        }
```

IMPORTANT: 먼저 `BuildResultModal`/`ShowResultModal`·`UiFactory.HBox`·`AddLayout`·`Clear`·`FormatNumber`·`UiTheme`(ChipGoldText/ScoreboardTag/ScoreboardLive/TabActive/TextSecondary/PanelBg/ModalScrim) 실제 시그니처를 읽어 위 코드가 맞는지 확인하고, 다르면 맞춘다. `UiFactory.HBox` 행 안에서 두 라벨을 좌우로 벌리는 정확한 방법(childForceExpandWidth + 각 라벨 flexible)이 기존 코드와 다르면 기존 HBox 사용 예를 따른다.

- [ ] **Step 3: 컴파일 + EditMode** — `ps` 확인 후 `./init.sh` → 177 유지.

- [ ] **Step 4: PlayMode 캡처 — 브리핑 카드 육안**

`ScreenshotCaptureTests`에 캡처 추가 — talent 주입 오피스에서 `gameScreen.ShowBriefing(summary, () => {})`를 대박/부진 summary로 호출하고 `38-briefing-great.png`/`39-briefing-bad.png` 캡처. `ShowBriefing`은 PlayMode 테스트가 호출하려면 `internal`이 어셈블리 경계를 못 넘으니 `public`으로(PlayMoodReaction 선례). summary는 테스트에서 `new MonthSummary { ... }`로 구성. 기존 office-injecting 캡처 패턴 따름.

Run: Unity PlayMode → 브리핑 카드 손익 행·순익 색·분위 배지 육안.

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs
git commit -m "feat-029 #2: 월말 브리핑 카드 — 손익계산서 모달(BuildBriefingModal/ShowBriefing) + 분위 배지"
```

---

### Task 3: 다박자 시퀀스 — 타임랩스 길이↑ + 이벤트 중간 일시정지 + 브리핑 삽입

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (`PlayMonthTransitionCo`, `MonthPayoffCo`)

- [ ] **Step 1: PlayMonthTransitionCo에 이벤트 일시정지 추가**

`PlayMonthTransitionCo()` 시그니처를 `PlayMonthTransitionCo(GameEventDef pendingEvent = null)`로 바꾸고, 타임랩스 길이를 늘리고, p>=0.5에서 이벤트를 한 번 팝·대기. 기존 try 본문의 `float dur = 0.9f, t = 0f;` ~ while 루프를 교체:

```csharp
                float dur = 2.0f, t = 0f;       // 다박자 — 길게 (feat-029)
                bool eventDone = pendingEvent == null;
                while (t < dur)
                {
                    t += Time.unscaledDeltaTime;
                    float p = Mathf.Clamp01(t / dur);
                    ti.color = new Color(0.05f, 0.07f, 0.16f, Mathf.Sin(p * Mathf.PI) * 0.5f);
                    int day = Mathf.Clamp(1 + Mathf.FloorToInt(p * 30f), 1, 30);
                    dayLabel.text = "Day " + day;
                    // 중간(Day ~15)에 이벤트 팝 — 선택 완료까지 대기(틴트는 피크에서 멈춰 긴장 유지)
                    if (!eventDone && p >= 0.5f)
                    {
                        ShowEventModal(pendingEvent);
                        _pendingAlert += UnityEngine.Random.Range(1, 3); // 직원 놀람 (feat-023)
                        while (_context != null && _context.Events != null && _context.Events.Current != null) yield return null;
                        eventDone = true;
                    }
                    yield return null;
                }
```
(기존 capture 테스트 `Capture_MonthTimelapse`는 `PlayMonthTransitionCo()` 무인자 호출 — 기본값 null이라 그대로 동작. 시그니처에 `using` 없으면 `GameEventDef`는 `AICompanyTycoon.Data` — 파일 상단 using 확인, 없으면 풀네임 `AICompanyTycoon.Data.GameEventDef`.)

- [ ] **Step 2: MonthPayoffCo 재구성 — 이벤트 롤을 앞으로, 브리핑 삽입**

`MonthPayoffCo`의 try 본문(line 271~304)을 교체 — 이벤트를 전환 전에 굴려 전환 중간에 끼우고, 비터미널 달은 월말 브리핑을 띄워 닫을 때까지 대기:

```csharp
            try
            {
                var balance = _context.Catalog.balance;
                AICompanyTycoon.Data.GameEventDef triggered =
                    (!_terminal && balance != null && UnityEngine.Random.value < (float)balance.eventTriggerChance)
                        ? _context.Events.TryTrigger() : null;

                yield return PlayMonthTransitionCo(triggered);

                SetStatus("월간 정산이 완료되었습니다.");
                RefreshAll();
                ShowMonthlyDopamine(_lastSummary);
                AnnounceDiscoveries(visibilityBefore);
                AnnounceSynergies(synergiesBefore);
                AnnounceRichestClimb();

                if (_terminal)
                {
                    ShowResultModal(_lastSummary.GameWon, _lastSummary.Outcome);
                }
                else
                {
                    bool briefingClosed = false;
                    ShowBriefing(_lastSummary, () => briefingClosed = true);
                    while (!briefingClosed) yield return null;

                    if (_pendingInvestment != null && (_context.Events == null || _context.Events.Current == null))
                    {
                        var offer = _pendingInvestment;
                        _pendingInvestment = null;
                        ShowInvestmentOffer(offer);
                    }
                }
            }
            finally
            {
                _advancing = false;
            }
```

IMPORTANT: 먼저 현재 MonthPayoffCo 전체(try/finally)를 읽어 위 교체가 기존 호출(SetStatus·RefreshAll·ShowMonthlyDopamine·Announce 3종·ShowResultModal·ShowInvestmentOffer)을 빠짐없이 보존하는지 확인한다. 바뀐 것 — ① 이벤트 트리거가 전환 전 롤 + 전환 중간 팝(기존은 전환 후) ② 비터미널 달에 브리핑 카드 + 닫기 대기 추가. `_pendingAlert`는 PlayMonthTransitionCo 안에서 누적돼 RefreshAll의 RefreshOfficeScene이 FlushActorMoods로 적용(기존 메커니즘 유지).

- [ ] **Step 3: 컴파일 + EditMode** — `ps` 확인 후 `./init.sh` → 177 유지.

- [ ] **Step 4: PlayMode 캡처 — 시퀀스 육안**

전체 PlayMode 스위트 실행(`-testPlatform PlayMode`, 필터 없이) → 9+개 통과 + 회귀 없음 확인. 타임랩스(36)·브리핑(38/39) 캡처 재확인.

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs
git commit -m "feat-029 #3: 다박자 시퀀스 — 타임랩스 2초 + 이벤트 중간 일시정지 + 월말 브리핑 삽입"
```

---

### Task 4: 통합 검증 + 문서 갱신

**Files:**
- Modify: `feature_list.json`, `progress.md`

- [ ] **Step 1: 전체 검증** — `ps` → `./init.sh`(177/177) → PlayMode 캡처(38/39 브리핑 + 36 타임랩스 + 회귀 01/32~35).

- [ ] **Step 2: feature_list.json에 feat-029 등록** — `feat-028` 다음에 추가(형식 정합):
```json
    {
      "id": "feat-029",
      "name": "월말 브리핑 + 다박자 월 진행 시퀀스 (P30)",
      "description": "사용자 요청(2026-06-27) — 월말에 회사 운영결과를 손익계산서 브리핑 카드로. 타임랩스→중간 이벤트 일시정지→브리핑 다박자 시퀀스. 코어 무변경, 새 에셋 0. 분기/연말 보고서는 상장 후속. 정본 docs/feat-029-monthly-briefing-design.md, 계획 docs/feat-029-monthly-briefing-plan.md.",
      "dependencies": ["feat-028"],
      "status": "done",
      "owner": "Claude(판정·UI·시퀀스·검증, 서브에이전트 주도)",
      "evidence": "완료(EditMode 177/177 + PlayMode + 캡처 38/39 브리핑·36 타임랩스). #1 MonthBriefing(MonthSummary→표시 모델, 순익=Revenue-TotalCashCost·조건부 행·MonthMoodJudge 분위, 헤드리스 7 신규 170→177) #2 BuildBriefingModal/ShowBriefing 손익계산서 카드(매출−비용내역=순익+보조지표+조건부 이벤트/경고/승급+분위 배지, BuildResultModal 패턴) #3 MonthPayoffCo 재구성(타임랩스 2초 + 이벤트 전환 중간 일시정지 p>=0.5 선택 대기 + 비터미널 월말 브리핑 닫기 대기, _advancing 가드·byte-identical 페이오프 보존). 코어·세이브 무변경. 정본 docs/feat-029-monthly-briefing-design.md."
    }
```

- [ ] **Step 3: progress.md 헤드라인 갱신** — feat-029 완료 한 줄(브리핑+다박자 시퀀스, EditMode 177, 다음 — 상장 분기/연말 보고서 또는 베타).

- [ ] **Step 4: Commit**

```bash
git add feature_list.json progress.md
git commit -m "feat-029 #4: 클로즈아웃 — 월말 브리핑 + 다박자 시퀀스, EditMode 177 + 캡처 36/38/39"
```

---

## 자체 검토 메모

- **스펙 커버리지** — 다박자 시퀀스(§시퀀스) = Task3. 브리핑 카드(§브리핑) = Task1(모델)+Task2(UI). 검증(§검증) = Task1 TDD + Task2/3 캡처. 상장 분기/연말은 스코프 밖(설계 §스코프 밖). ✅
- **타입 일관성** — `MonthBriefingView`/`MonthBriefing.Build(MonthSummary)` Task1 = Task2 호출 일치. `MonthMood`(feat-028) 재사용. `PlayMonthTransitionCo(GameEventDef)` Task3 시그니처 = MonthPayoffCo 호출 + 무인자 capture 호환. `ShowBriefing(MonthSummary, Action)` Task2 정의 = Task3 호출 일치. `GameEventDef`(AICompanyTycoon.Data) = ShowEventModal 인자 타입 일치. ✅
- **잔여 모호(실행 중 결정)** — 타임랩스 2초·이벤트 팝 p>=0.5는 시작값(반복 체감 캡처 후 튜닝). UiFactory.HBox 좌우 배치·UiTheme 색 상수는 기존 코드 확인 후 정합. 터미널(승패) 달은 브리핑 생략하고 결과 모달로(설계 — 두 모달 중복 회피). 브리핑은 비터미널만.
