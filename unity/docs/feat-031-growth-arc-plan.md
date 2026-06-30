# feat-031 성장 아크 완성 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1인 창고에서 시작해 첫 영입·오피스 해금·구성 채움으로 성장이 또렷이 보이게 하고, 버튼이 누를 수 있게 보이게 한다.

**Architecture:** 헤드리스 로직(GuidanceService·OfficeService 순수 함수)은 EditMode 테스트로 TDD, 화면 변경(GameScreen·UiFactory·OfficeProps 렌더)은 PlayMode 캡처로 검증한다. 코어/세이브 모델은 무변경(시작값은 데이터+SO 재시드, OfficeLevel은 기존 필드).

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit EditMode, ScreenshotCaptureTests(PlayMode/Metal), JSON 데이터 + DataImporter SO 재시드.

**전제 — 작업 시작 전 1회**
- `ps -axo command | grep "[U]nity.app" | grep -i projectpath` 로 다른 Unity 프로젝트(sam/samgukji 등) 미실행 확인(단일 라이선스).
- 베이스라인 — `cd unity && ./init.sh` 가 **EditMode 177/177** 그린인지 확인.
- 작업 디렉터리는 리포 루트(`/Users/taewookkim/dev/ai-company-tycoon`). 모든 경로는 `unity/` 기준. bash dir이 호출마다 루트로 리셋될 수 있으니 명령은 `cd unity && ...` 로 감싼다.

---

## Task 1 (블록 ①): 진짜 1인 창고 시작 + 첫 영입 가이던스 + 밸런스 검증

**Files:**
- Modify: `../data/resources.json` (talent.initial_value 3→1)
- Modify: `unity/Assets/_Project/Scripts/Systems/GuidanceService.cs` (첫 영입 스텝 추가)
- Modify: `unity/Assets/_Project/Tests/EditMode/SimulationTests.cs:24,36` (talent 기대 3→1)
- Modify: `unity/Assets/_Project/Tests/EditMode/GuidanceTests.cs` (첫 제안 = 영입으로 갱신 + 영입 후 = 제품 출시)
- Modify: `unity/Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs:99` (캡처 오버라이드 3→1)
- Reseed: `DataImporter.ImportAll` (배치모드)

- [ ] **Step 1: 시작 인재 데이터 변경**

`../data/resources.json` 의 talent 블록(51행)에서 `initial_value` 를 1로 바꾼다.

```json
    "talent": {
      "id": "talent",
      "name": "인재",
      "description": "연구원, 엔지니어, 운영 인력을 포함한 팀 규모입니다.",
      "initial_value": 1,
      "min_value": 0,
      "max_value": 999,
      "icon": "🧑‍💻",
```

- [ ] **Step 2: SO 재시드 (DataImporter.ImportAll)**

resources.json → ResourceDef SO + DataCatalog 반영. EditMode 테스트는 SO를 읽으므로 필수.

Run:
```bash
cd unity && UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1)"; \
"$UNITY" -batchmode -nographics -quit -projectPath . -executeMethod DataImporter.ImportAll -logFile -
```
Expected: 로그 끝에 임포트 완료, 종료코드 0. (다른 Unity 점유 중이면 라이선스 막힘 — ps 확인.)

- [ ] **Step 3: 첫 영입 가이던스 스텝 추가 (실패 테스트 먼저)**

`GuidanceTests.cs` 의 기존 `FreshGame_SuggestsFirstProductLaunch` 를 아래로 교체하고, 영입 후 제품 제안 테스트를 추가한다. (1인 시작에선 첫 목표가 영입이다.)

```csharp
        [Test]
        public void FreshGame_SoloFounder_SuggestsFirstHire()
        {
            var ctx = SimulationContext.Create(Catalog());
            Assert.AreEqual(0, ctx.Model.HiredAgentIds.Count, "시작은 사장 1인 — 영입 이력 0이어야 한다.");
            var step = GuidanceService.GetStep(ctx, null);
            Assert.AreEqual("hire_first_employee", step.Id);
            Assert.AreEqual("upgrades", step.TargetTab);
            Assert.AreEqual("primary", step.Tone);
        }

        [Test]
        public void AfterFirstHire_SuggestsFirstProductLaunch()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.HiredAgentIds.Add("dummy_hire"); // 첫 영입 완료 가정
            var step = GuidanceService.GetStep(ctx, null);
            Assert.AreEqual("launch_first_product", step.Id);
            Assert.AreEqual("products", step.TargetTab);
        }
```

- [ ] **Step 4: 테스트 실패 확인**

Run: `cd unity && ./init.sh`
Expected: FAIL — `FreshGame_SoloFounder_SuggestsFirstHire` 가 "launch_first_product"(현재 첫 스텝) 를 받아 AreEqual 실패.

- [ ] **Step 5: GuidanceService 에 첫 영입 스텝 추가 (최우선)**

`GuidanceService.cs` 의 `BuildSteps` 에서, 1) 첫 제품 블록(39행) **바로 앞**에 영입 스텝을 넣는다. 사장 1인(영입 이력 0)일 때만.

```csharp
            // 0) 첫 영입 — 1인 창고 출발. 팀을 꾸리는 게 첫 목표 (feat-031).
            if (m.HiredAgentIds.Count == 0)
                steps.Add(new GuidanceStep
                {
                    Id = "hire_first_employee",
                    Title = "첫 직원을 영입해 팀을 꾸리세요",
                    ActionLabel = "직원 영입",
                    TargetTab = "upgrades",
                    Tone = "primary",
                });

            // 1) 첫 제품 — 매출 0이면 게임이 굴러가지 않는다.
            if (m.ActiveProducts.Count == 0 && ctx.Products != null && ctx.Products.GetAvailable().Count > 0)
```

- [ ] **Step 6: SimulationTests 시작값 기대 갱신**

`SimulationTests.cs:24` 와 비용 공식(36행 부근)의 3을 1로 바꾼다.

```csharp
            Assert.AreEqual(1, ctx.Model.Talent, 0.001);
```
```csharp
            double expected = (b.baseMonthlyCashCost + 1 * b.salaryPerTalent) * OfficeService.GetLocationCostModifier(ctx.Model, ctx.Catalog);
```

- [ ] **Step 7: 캡처 오버라이드 갱신**

`ScreenshotCaptureTests.cs:99` 의 `boot.Context.Model.Talent = 3;` 를 1인 시작 반영으로 바꾸고 캡처 파일명을 솔로로 단다(98행 위 주석도 갱신).

```csharp
                // 1f) 1인 창고 출발(feat-031) — 사장 혼자인 휑한 시작 화면 정합
                boot.Context.Model.Talent = 1;
                boot.Screen.RefreshAll();
                yield return WaitRealtime(0.5f);
                yield return CaptureCanvas(canvasGo, "01f-office-solo.png");
```

- [ ] **Step 8: EditMode 전체 통과 확인**

Run: `cd unity && ./init.sh`
Expected: PASS — 177개(또는 +1 신규 테스트 포함). 특히 `FreshGame_SoloFounder_SuggestsFirstHire`·`AfterFirstHire_SuggestsFirstProductLaunch`·`SimulationTests` 그린.

- [ ] **Step 9: 완주 가능성(밸런스) 재확인**

`TechTreeReachabilityTests.TierFour_BecomesLaunchableWithinTenYears_TargetedBot` 가 Step 8 의 `./init.sh` 에 포함돼 그린이어야 한다(봇 승리 ≥ tier4 해금월·≤ 90개월).
- 만약 FAIL(승리 90개월 초과 또는 게임오버) — 1인 시작이 초반 생산을 너무 늦춘 것. 레버 순서로 미세 조정 후 Step 2 재시드·Step 8 재실행:
  1. `../data/resources.json` cash.initial_value 10000 → 12000(첫 영입 후 운영 여유).
  2. 그래도 실패면 `../data/balance.json` recruit_base_cost 2500 → 2000(첫 영입 가속).
- 조정 시 design 문서 "검증" 절에 조정값을 기록한다.

- [ ] **Step 10: 커밋**

```bash
cd unity && git add ../data/resources.json Assets/_Project/Scripts/Systems/GuidanceService.cs \
  Assets/_Project/Tests/EditMode/SimulationTests.cs Assets/_Project/Tests/EditMode/GuidanceTests.cs \
  Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs Assets/_Project/Resources
git commit -m "feat-031 ①: 진짜 1인 창고 시작 + 첫 영입 가이던스 + 밸런스 재확인"
```

---

## Task 2 (블록 ②): 오피스 게이팅 노출 분리 — 꾸미기 칩 + 시설 카드 명료화

**Files:**
- Modify: `unity/Assets/_Project/Scripts/Systems/OfficeService.cs` (IsDecorationUnlocked 추가)
- Modify: `unity/Assets/_Project/Tests/EditMode/` 신규 또는 기존 Office 테스트 (IsDecorationUnlocked 검증)
- Modify: `unity/Assets/_Project/Scripts/UI/GameScreen.cs:977-982` (꾸미기 칩 게이팅) + `:3075-3078` (다음 오피스 잠긴 목표 표기)

배경 — 시설 탭(`BuildFacilitySection`, 3064~)은 이미 요구조건·잠금 사유·확장 버튼 게이팅을 한다. "시연용 노출" 문제는 HUD 상단의 `✦ 꾸미기` 버튼이 진척과 무관하게 항상 활성처럼 보이고 클릭하면 "곧 추가됩니다" 플레이스홀더라는 점이다. 이를 조건 해금으로 바꾼다.

- [ ] **Step 1: 꾸미기 해금 조건 헤드리스 함수 (실패 테스트 먼저)**

새 테스트 파일 `unity/Assets/_Project/Tests/EditMode/OfficeGatingTests.cs` 를 만든다.

```csharp
// 오피스 게이팅 — 꾸미기 해금이 차고(레벨1)에선 잠기고 확장(레벨2+) 후 열리는지 검증 (feat-031).
using NUnit.Framework;
using AICompanyTycoon.Core;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class OfficeGatingTests
    {
        [Test]
        public void Decoration_LockedAtGarage_UnlockedAfterExpand()
        {
            var m = new GameModel();
            m.OfficeLevel = 1;
            Assert.IsFalse(OfficeService.IsDecorationUnlocked(m), "차고(레벨1)에선 꾸미기 잠김.");
            m.OfficeLevel = 2;
            Assert.IsTrue(OfficeService.IsDecorationUnlocked(m), "확장(레벨2+) 후 꾸미기 해금.");
        }
    }
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd unity && ./init.sh`
Expected: FAIL — `OfficeService.IsDecorationUnlocked` 미정의로 컴파일 에러.

- [ ] **Step 3: OfficeService 에 해금 함수 추가**

`OfficeService.cs` 의 클래스 안(예 — `GetLocationCostModifier` 위)에 정적 순수 함수를 추가한다.

```csharp
        // 꾸미기 해금 — 차고를 벗어나 첫 사무실 확장(레벨2+)을 한 뒤 열린다 (feat-031 — 시연용 노출과 조건 해금 분리).
        public static bool IsDecorationUnlocked(GameModel m)
        {
            int level = m != null && m.OfficeLevel > 0 ? m.OfficeLevel : 1;
            return level >= 2;
        }
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd unity && ./init.sh`
Expected: PASS — `Decoration_LockedAtGarage_UnlockedAfterExpand` 그린.

- [ ] **Step 5: HUD 꾸미기 칩 게이팅 (BuildTopBar)**

`GameScreen.cs:977-982` 의 꾸미기 버튼을 해금 상태에 따라 분기한다.

```csharp
            var decor = UiFactory.Button(row.transform, "✦ 꾸미기");
            decor.label.fontSize = 24;
            decor.label.horizontalOverflow = HorizontalWrapMode.Overflow;
            bool decorUnlocked = _context != null && Systems.OfficeService.IsDecorationUnlocked(_context.Model);
            if (decorUnlocked)
            {
                decor.button.onClick.AddListener(() => SetStatus("꾸미기는 곧 추가됩니다."));
            }
            else
            {
                decor.label.text = "🔒 꾸미기";
                decor.label.color = UiTheme.InkSoft;
                decor.button.interactable = false;
                decor.button.onClick.AddListener(() => SetStatus("사무실을 확장하면 꾸미기가 열립니다."));
            }
            AddLayoutFixed(decor.button.gameObject, 124, 46);
            FlattenDockButton(decor.button, decor.label);
```

- [ ] **Step 6: 시설 카드 — 다음 오피스를 '잠긴 목표'로 표기 (BuildFacilitySection)**

`GameScreen.cs:3077-3078` 의 다음 오피스 줄에 잠금 표식을 단다(요건 미충족일 때 🔒).

```csharp
                bool nextLocked = _context.Office.GetExpandLockReason() != null;
                string nextMark = nextLocked ? "🔒 " : "▸ ";
                AddSmallText(officeCard, nextMark + "다음 — " + nextOffice.displayName + " (정원 " + nextOffice.hireCapacity + "명) | 비용 " + FormatCosts(nextOffice.cost));
                AddSmallText(officeCard, "해금 조건 — " + FormatThresholds(nextOffice.unlockRequirements));
```

- [ ] **Step 7: 캡처 검증 (꾸미기 잠김/해금)**

PlayMode 캡처로 ① 시작 화면 꾸미기 칩이 `🔒 꾸미기`(흐림·비활성)인지, ② 레벨2 확장 후 `✦ 꾸미기`(활성)인지 확인한다. 기존 `Capture_AllStates` 의 메인 캡처(01-main)에 잠긴 칩이 보인다. 단일 라이선스 확인 후 실행.

Run:
```bash
cd unity && UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1)"; \
"$UNITY" -batchmode -projectPath . -runTests -testPlatform PlayMode -testResults Logs/playmode-results.xml -logFile - 2>&1 | tail -20; \
ls -la Logs/shots/01-main.png
```
Expected: `Logs/shots/01-main.png` 갱신, 상단 꾸미기 칩에 자물쇠. 육안 확인.

- [ ] **Step 8: 커밋**

```bash
cd unity && git add Assets/_Project/Scripts/Systems/OfficeService.cs \
  Assets/_Project/Tests/EditMode/OfficeGatingTests.cs Assets/_Project/Scripts/UI/GameScreen.cs
git commit -m "feat-031 ②: 오피스 게이팅 노출 분리 — 꾸미기 조건 해금 + 다음 오피스 잠긴 목표 표기"
```

---

## Task 3 (블록 ③): 성장이 보이는 오피스 구성 — 소품 밀도 연동

**Files:**
- Modify: `unity/Assets/_Project/Scripts/Systems/OfficeService.cs` (OfficeFillTier 헤드리스 함수)
- Modify: `unity/Assets/_Project/Tests/EditMode/OfficeGatingTests.cs` (티어 경계 테스트)
- Modify: `unity/Assets/_Project/Scripts/UI/OfficeProps.cs` (Populate 에 fillTier — 솔로 차고 휑하게)
- Modify: `unity/Assets/_Project/Scripts/UI/GameScreen.cs:755,2228` (호출처에 티어 전달)

- [ ] **Step 1: 밀도 티어 헤드리스 함수 (실패 테스트 먼저)**

`OfficeGatingTests.cs` 에 티어 경계 테스트를 추가한다.

```csharp
        [Test]
        public void FillTier_SoloGarageIsSparse_GrowsWithTeam()
        {
            var m = new GameModel();
            m.OfficeLevel = 1; m.Talent = 1;
            Assert.AreEqual(0, OfficeService.OfficeFillTier(m), "솔로 차고 = 휑한 티어 0.");
            m.Talent = 4;
            Assert.AreEqual(1, OfficeService.OfficeFillTier(m), "팀 형성 = 티어 1.");
            m.OfficeLevel = 4; m.Talent = 9;
            Assert.AreEqual(2, OfficeService.OfficeFillTier(m), "대형 = 가득 티어 2.");
        }
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd unity && ./init.sh`
Expected: FAIL — `OfficeService.OfficeFillTier` 미정의.

- [ ] **Step 3: OfficeFillTier 추가**

`OfficeService.cs` 에 정적 순수 함수를 추가한다(IsDecorationUnlocked 아래).

```csharp
        // 오피스 구성 밀도 티어 — 0(솔로 차고·휑하게) / 1(팀 형성) / 2(가득). 성장이 화면에 보이게 (feat-031).
        public static int OfficeFillTier(GameModel m)
        {
            int talent = (int)(m != null ? m.Get(ResourceId.Talent) : 0);
            int level = m != null && m.OfficeLevel > 0 ? m.OfficeLevel : 1;
            if (level >= 4 || talent >= 8) return 2;
            if (level >= 2 || talent >= 3) return 1;
            return 0;
        }
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd unity && ./init.sh`
Expected: PASS — `FillTier_SoloGarageIsSparse_GrowsWithTeam` 그린.

- [ ] **Step 5: OfficeProps — FloorProps 를 가구/러그로 분리하고 fillTier 도입**

`OfficeProps.cs` 의 `FloorProps`(47-56행)를 가구 한 줄과 러그로 나눈다.

```csharp
        // 뒤 벽 가구 한 줄 — '회사가 자리잡은' 인상. 솔로 차고(tier0)에선 생략해 휑하게, 성장할수록 채운다 (feat-031).
        static readonly PropSpec[] BackFurnitureProps =
        {
            new PropSpec("prop_plant_big", 0.13f, 410f, 132f),
            new PropSpec("prop_partition", 0.39f, 412f, 118f),
            new PropSpec("prop_bookshelf", 0.64f, 410f, 134f),
            new PropSpec("prop_shelf_low", 0.86f, 408f, 104f),
        };

        // 중앙 러그 — 항상 깔린다(코지). 직원 발치, floor 중 frontmost.
        static readonly PropSpec RugProp = new PropSpec("prop_rug", 0.50f, 140f, 158f);
```

- [ ] **Step 6: Populate 시그니처에 fillTier + 밀도 분기**

`OfficeProps.cs` 의 `Populate`(91행)와 Back 레이어 배치(110-111행)를 바꾼다.

```csharp
        // 성급 변경 시 재호출하면 기존 레이어를 갈아끼운다. fillTier 0(솔로 차고)~2(가득)로 소품 밀도가 자란다 (feat-031).
        public static void Populate(Transform stageParent, string backgroundKey = null, int fillTier = 2)
        {
            if (stageParent == null)
            {
                return;
            }

            var layerParent = stageParent.parent != null ? stageParent.parent : stageParent;

            DestroyLayer(layerParent, "OfficePropsLayer");
            DestroyLayer(layerParent, "OfficePropsFrontLayer");

            var back = MakeLayer(layerParent, "OfficePropsLayer");
            if (layerParent == stageParent.parent)
            {
                back.SetSiblingIndex(stageParent.GetSiblingIndex());
            }
            // 러그는 항상. 벽 가구는 티어만큼(0→0개, 1→2개, 2→전부), 탕비 소품도 티어만큼(0→1, 1→2, 2→전부).
            PlaceProp(back, RugProp);
            int furnitureCount = fillTier <= 0 ? 0 : (fillTier == 1 ? 2 : BackFurnitureProps.Length);
            for (int i = 0; i < furnitureCount; i++) PlaceProp(back, BackFurnitureProps[i]);
            int baseCount = fillTier <= 0 ? 1 : (fillTier == 1 ? 2 : BaseProps.Length);
            for (int i = 0; i < baseCount; i++) PlaceProp(back, BaseProps[i]);
            foreach (var prop in StageProps(backgroundKey)) PlaceProp(back, prop);

            var front = MakeLayer(layerParent, "OfficePropsFrontLayer");
            if (layerParent == stageParent.parent)
            {
                front.SetSiblingIndex(stageParent.GetSiblingIndex() + 1);
            }
            // 전경 소품도 솔로 차고(tier0)에선 한 개만(좌 큰 화분), 그 이상은 전부.
            int frontCount = fillTier <= 0 ? 1 : FrontProps.Length;
            for (int i = 0; i < frontCount; i++) PlaceProp(front, FrontProps[i]);
        }
```

- [ ] **Step 7: 호출처 2곳에 티어 전달**

`GameScreen.cs:755` 와 `:2228` 의 `OfficeProps.Populate(...)` 에 fillTier 인자를 더한다.

755행:
```csharp
            OfficeProps.Populate(stage.transform, StageVisual.BackgroundKey(_context != null ? _context.Model.CompanyStageId : null), _context != null ? Systems.OfficeService.OfficeFillTier(_context.Model) : 2);
```
2228행:
```csharp
                OfficeProps.Populate(_officeSceneContent, StageVisual.BackgroundKey(stageId), _context != null ? Systems.OfficeService.OfficeFillTier(_context.Model) : 2);
```

- [ ] **Step 8: 캡처 검증 (솔로 휑함 vs 성장 가득)**

PlayMode 캡처 — `01f-office-solo.png`(인재 1, fillTier 0 → 가구 없고 러그+화분만, 휑함)와 `01d-office-rich.png`(다인 → 가득) 대비. 단일 라이선스 확인 후 실행.

Run:
```bash
cd unity && UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1)"; \
"$UNITY" -batchmode -projectPath . -runTests -testPlatform PlayMode -testResults Logs/playmode-results.xml -logFile - 2>&1 | tail -20; \
ls -la Logs/shots/01f-office-solo.png Logs/shots/01d-office-rich.png
```
Expected: 두 캡처 생성. 01f 는 휑한 차고(가구 줄 없음), 01d 는 가득. 육안 대비 확인.

- [ ] **Step 9: 커밋**

```bash
cd unity && git add Assets/_Project/Scripts/Systems/OfficeService.cs \
  Assets/_Project/Tests/EditMode/OfficeGatingTests.cs Assets/_Project/Scripts/UI/OfficeProps.cs \
  Assets/_Project/Scripts/UI/GameScreen.cs
git commit -m "feat-031 ③: 성장이 보이는 오피스 구성 — 소품 밀도 인재/레벨 연동(솔로 차고 휑하게)"
```

---

## Task 4 (블록 ④): 버튼 affordance — secondary 알약 눌림 단서

**Files:**
- Modify: `unity/Assets/_Project/Scripts/UI/UiFactory.cs:125-162` (Button 에 드롭 섀도)

설계 — `UiFactory.Button` 면(Image)에 잉크 드롭 섀도를 더해 입체감(=누를 수 있는 단서)을 준다. `Shadow` 는 그래픽 정점 알파에 effectColor 알파를 곱하므로, `FlattenDockButton`(Image 알파 0)이 적용된 도크 버튼은 섀도도 자동으로 투명 → 평면 유지된다. 추가 분기 불필요.

- [ ] **Step 1: Button 에 드롭 섀도 추가**

`UiFactory.cs` 의 `Button`(159행 `button.onClick.AddListener(... Punch ...)` 바로 다음, `return` 앞)에 추가한다.

```csharp
            // feat-031 — secondary 알약 눌림 단서. 잉크 드롭 섀도로 입체감.
            // Shadow는 정점 알파에 effectColor 알파를 곱하므로 FlattenDockButton(알파0)은 자동 평면 유지.
            var shadow = go.AddComponent<UnityEngine.UI.Shadow>();
            shadow.effectColor = new Color(UiTheme.Ink.r, UiTheme.Ink.g, UiTheme.Ink.b, 0.28f);
            shadow.effectDistance = new Vector2(0f, -3f);
```

- [ ] **Step 2: 컴파일·EditMode 회귀 확인**

Run: `cd unity && ./init.sh`
Expected: PASS — 회귀 0(177+신규). UI 변경이라 EditMode 수치는 불변.

- [ ] **Step 3: 캡처 검증 (입체 버튼 vs 평면 도크)**

PlayMode 캡처 — 시설/영입 카드의 secondary 버튼(영입·확장)이 드롭 섀도로 떠 보이고, 하단 도크/꾸미기(Flatten)는 평면 유지인지 확인. 단일 라이선스 확인 후 실행.

Run:
```bash
cd unity && UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity 2>/dev/null | sort -V | tail -1)"; \
"$UNITY" -batchmode -projectPath . -runTests -testPlatform PlayMode -testResults Logs/playmode-results.xml -logFile - 2>&1 | tail -20; \
ls -la Logs/shots/05-upgrades.png
```
Expected: `05-upgrades.png`(또는 영입/시설이 보이는 캡처)에서 버튼이 입체로, 도크는 평면. 육안 확인.

- [ ] **Step 4: 커밋**

```bash
cd unity && git add Assets/_Project/Scripts/UI/UiFactory.cs
git commit -m "feat-031 ④: 버튼 affordance — secondary 알약 잉크 드롭 섀도(도크는 평면 유지)"
```

---

## Task 5: 클로즈아웃 — 정본·증거 갱신

**Files:**
- Modify: `unity/progress.md`, `unity/feature_list.json`, `unity/docs/feat-031-growth-arc-design.md`(검증 결과)

- [ ] **Step 1: 최종 EditMode + PlayMode 일괄 재확인**

Run: `cd unity && ./init.sh` (EditMode 그린) + 위 PlayMode 캡처 일괄.
Expected: EditMode 그린(블록 추가분 포함), 캡처 예외 0.

- [ ] **Step 2: progress.md 갱신**

상단 "현재 상태" 에 feat-031 완료 줄 추가 — 1인 시작·첫 영입 가이던스·꾸미기 조건 해금·소품 밀도 연동·버튼 섀도, EditMode 수치, 밸런스(완주 창) 결과, 캡처 파일명.

- [ ] **Step 3: feature_list.json feat-031 status/evidence 갱신**

`status` `planned` → `done`, `evidence` 에 블록별 커밋 해시·EditMode 수치·캡처·완주 가능성 결과 기록.

- [ ] **Step 4: design 문서 검증 절 갱신**

`docs/feat-031-growth-arc-design.md` "검증" 에 실제 EditMode 수치·완주 월(wonMonth)·조정한 밸런스 레버(있으면) 기록.

- [ ] **Step 5: 클로즈아웃 커밋**

```bash
cd unity && git add progress.md feature_list.json docs/feat-031-growth-arc-design.md
git commit -m "docs(feat-031): 성장 아크 완성 클로즈아웃 — 증거·밸런스 결과 기록"
```

- [ ] **Step 6: 푸시 — 사용자 확인 후**

`git push` 는 사용자 확인 후. 무관 변경 `ProjectSettings/ProjectSettings.asset`(activeInputHandler)은 커밋·푸시에서 제외 유지.

---

## 자기 검토 (작성자 체크)

- **스펙 커버리지** — ①(Task1) ②(Task2) ③(Task3) ④(Task4) ⑤검증(각 Task 캡처 + Task5) 전부 매핑됨.
- **타입 일관성** — `OfficeService.IsDecorationUnlocked(GameModel)`·`OfficeService.OfficeFillTier(GameModel)`·`OfficeProps.Populate(Transform, string, int)` 시그니처가 정의 Task와 사용 Task에서 일치.
- **placeholder 스캔** — 모든 코드 스텝에 실제 코드 포함, "적절히 처리" 류 없음. 밸런스 조정만 조건부(완주 테스트 FAIL 시)로 명시된 레버 순서 제공.
- **스코프** — 새 에셋 0, 코어 로직 무변경(시작값=데이터, OfficeLevel=기존 필드). 단일 피처로 적정.
