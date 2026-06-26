# 오피스 구성 재작업 (feat-027) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게임플레이 오피스의 빈 중간 바닥을 채우고, 직원·소품을 깊이 있게 분산해 "비어 보인다"는 피드백을 해소한다.

**Architecture:** 깊이 배치 순수 계산을 `OfficeLayout`(헤드리스 TDD)로 분리 → `GameScreen.RefreshOfficeScene`/`PlaceActorRow`가 다열 원근 군집으로 직원 배치 → `OfficeProps`가 소품·신규 가구를 깊이 존에 분산. 코어·세이브·게임 로직 무변경, 순수 시각 구성. 신규 가구 스프라이트는 Codex 핸드오프(미반입 시 graceful skip).

**Tech Stack:** Unity 6 (6000.4.10f1), C#, NUnit(EditMode), ScreenshotCaptureTests(PlayMode). 기존 소품·액터 프레임 재사용.

**정본 스펙:** `docs/feat-027-office-composition-design.md`

**파일 구조:**
- Create `Assets/_Project/Scripts/UI/OfficeLayout.cs` — 깊이 밴드(footY·scale)·인원 분배 순수 계산.
- Create `Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs` — Band 단조성 + RowPlan 분배.
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — `RefreshOfficeScene`/`PlaceActorRow` 다열 군집 + X jitter.
- Modify `Assets/_Project/Scripts/UI/OfficeProps.cs` — 깊이 존 + 신규 가구 + 러그 우선 그리기.
- Create `docs/codex-handoff/feat027-office-furniture.md` — 신규 가구 5종 크로마키 핸드오프(Codex 별도 실행).

**검증 베이스라인:** 시작 전 `ps -axo command | grep "[U]nity.app" | grep -i projectpath`로 다른 Unity 미실행 확인. `./init.sh` 현재 150/150.

---

### Task 1: OfficeLayout — 깊이 배치 순수 계산 (TDD)

**Files:**
- Create: `Assets/_Project/Scripts/UI/OfficeLayout.cs`
- Test: `Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs`

- [ ] **Step 1: 실패 테스트 작성**

`Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs`:

```csharp
// 오피스 깊이 배치 순수 계산 — 밴드 원근 단조성 + 인원 분배 검증.
using NUnit.Framework;
using AICompanyTycoon.UI;

namespace AICompanyTycoon.Tests.EditMode
{
    public class OfficeLayoutTests
    {
        [Test]
        public void Band_DepthIsMonotonic()
        {
            var f = OfficeLayout.Band(0);
            var m = OfficeLayout.Band(1);
            var b = OfficeLayout.Band(2);
            // 뒤로 갈수록 footY 증가(위)·scale 감소(작게).
            Assert.Less(f.footY, m.footY);
            Assert.Less(m.footY, b.footY);
            Assert.Greater(f.scale, m.scale);
            Assert.Greater(m.scale, b.scale);
        }

        [Test]
        public void RowPlan_SumsToCount()
        {
            for (int n = 0; n <= 10; n++)
            {
                var plan = OfficeLayout.RowPlan(n);
                int sum = 0;
                foreach (var r in plan) sum += r;
                Assert.AreEqual(n, sum, "count=" + n);
            }
        }

        [Test]
        public void RowPlan_SmallCounts()
        {
            CollectionAssert.AreEqual(new int[0], OfficeLayout.RowPlan(0));
            CollectionAssert.AreEqual(new[] { 1 }, OfficeLayout.RowPlan(1));
            CollectionAssert.AreEqual(new[] { 2 }, OfficeLayout.RowPlan(2));
            CollectionAssert.AreEqual(new[] { 2, 1 }, OfficeLayout.RowPlan(3));
            CollectionAssert.AreEqual(new[] { 2, 2 }, OfficeLayout.RowPlan(4));
        }

        [Test]
        public void RowPlan_DepthAppearsAndFrontWeighted()
        {
            // count>=3 이면 밴드 2개 이상(깊이), count>=5 이면 3밴드.
            Assert.GreaterOrEqual(OfficeLayout.RowPlan(3).Length, 2);
            Assert.AreEqual(3, OfficeLayout.RowPlan(5).Length);
            Assert.AreEqual(3, OfficeLayout.RowPlan(10).Length);
            // 앞쪽가중 — 앞 밴드 >= 뒷 밴드.
            for (int n = 1; n <= 10; n++)
            {
                var plan = OfficeLayout.RowPlan(n);
                for (int i = 1; i < plan.Length; i++)
                    Assert.GreaterOrEqual(plan[i - 1], plan[i], "n=" + n + " i=" + i);
            }
            // 각 밴드 <= 4 (앞 밴드는 count=10 일 때만 4).
            CollectionAssert.AreEqual(new[] { 4, 3, 3 }, OfficeLayout.RowPlan(10));
        }
    }
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `./init.sh`
Expected: FAIL — `OfficeLayout` 미정의 컴파일 에러.

- [ ] **Step 3: 최소 구현 작성**

`Assets/_Project/Scripts/UI/OfficeLayout.cs`:

```csharp
// 오피스 깊이 배치 순수 계산 — 밴드(원근 열)별 발높이·스케일, 인원 분배. UnityEngine.UI 비의존(헤드리스 테스트).
namespace AICompanyTycoon.UI
{
    public static class OfficeLayout
    {
        // 깊이 밴드 — index 0 = 앞(아래·크게), 클수록 뒤(위·작게). footY 증가·scale 감소 단조.
        public static (float footY, float scale) Band(int bandIndex)
        {
            switch (bandIndex)
            {
                case 0: return (150f, 1.00f);
                case 1: return (232f, 0.84f);
                default: return (314f, 0.70f);
            }
        }

        // 인원을 밴드(원근 열)별로 분배 — 밴드 수는 인원으로 정하고 앞쪽가중 균등 분배. count>=3이면 깊이(2밴드+)가 나온다.
        // 1→[1] 2→[2] 3→[2,1] 4→[2,2] 5→[2,2,1] 6→[2,2,2] 7→[3,2,2] 8→[3,3,2] 9→[3,3,3] 10→[4,3,3].
        public static int[] RowPlan(int count)
        {
            if (count <= 0) return new int[0];
            int rowCount = count <= 2 ? 1 : count <= 4 ? 2 : 3;
            var plan = new int[rowCount];
            int baseN = count / rowCount, extra = count % rowCount;
            for (int i = 0; i < rowCount; i++)
                plan[i] = baseN + (i < extra ? 1 : 0); // 앞 밴드(낮은 index)가 나머지를 먼저 가져가 앞쪽가중
            return plan;
        }
    }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `./init.sh`
Expected: PASS — 150 → 154 (신규 4 테스트).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/OfficeLayout.cs Assets/_Project/Scripts/UI/OfficeLayout.cs.meta Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs.meta
git commit -m "feat-027 #1: OfficeLayout 깊이 배치 순수 계산 — Band 원근·RowPlan 분배 (EditMode 4)"
```
(Unity가 `.meta`를 자동 생성한다. `git status`로 `.cs.meta` 2개가 생겼는지 확인하고 함께 스테이징한다 — 없으면 인접 `.cs.meta`를 복사해 `guid`만 새 32-hex로 바꾼다. feat-025의 .meta 누락 버그를 반복하지 않는다.)

---

### Task 2: 직원 다열 깊이 군집 (RefreshOfficeScene/PlaceActorRow)

**Files:**
- Modify: `Assets/_Project/Scripts/UI/GameScreen.cs` (`RefreshOfficeScene` line 628~657, `PlaceActorRow` line 660~)

연출 코드(테스트 무관). 목표 — 평평한 한 줄을 `OfficeLayout` 다열 원근 군집으로 교체 + X jitter로 일렬 탈피. EditMode 154 유지(컴파일).

- [ ] **Step 1: RefreshOfficeScene 본문 교체**

`RefreshOfficeScene`의 `Clear(_officeSceneContent);` 다음부터 `FlushActorMoods();` 전까지(현 front/back/busy + 2회 PlaceActorRow 블록, line 636~654)를 다음으로 교체:

```csharp
            int talent = (int)_context.Model.Get(ResourceId.Talent);
            int count = Mathf.Clamp(talent, 0, 10);
            if (count == 0)
            {
                return;
            }

            var kinds = new[] { "actor_human", "actor_ai", "actor_robot" };
            int[] plan = OfficeLayout.RowPlan(count); // plan[0]=앞 밴드

            // 밴드별 시작 시드(앞부터 누적) — 직원 종류·색 변형 안정.
            int[] startSeed = new int[plan.Length];
            for (int b = 1; b < plan.Length; b++) startSeed[b] = startSeed[b - 1] + plan[b - 1];

            // 뒷 밴드부터 그려(뒤) 앞 밴드가 겹쳐 깊이를 준다.
            for (int b = plan.Length - 1; b >= 0; b--)
            {
                var band = OfficeLayout.Band(b);
                bool isFront = b == 0;
                int busyLocal = isFront && plan[b] >= 2 ? plan[b] / 2 : -1; // 앞줄 한 명만 열일 불꽃
                float margin = isFront ? 0.08f : 0.16f;                    // 뒷줄은 더 안쪽으로 모음
                PlaceActorRow(kinds, startSeed[b], plan[b], band.scale, band.footY, margin, allowSpeech: isFront, busyLocal: busyLocal);
            }
```

- [ ] **Step 2: PlaceActorRow에 X jitter 추가**

`PlaceActorRow`에서 xnorm 계산부:
```csharp
                float xnorm = count <= 1 ? 0.5f : marginNorm + (1f - 2f * marginNorm) * ((i + 0.5f) / count);
```
바로 아래에 추가(균등 배치를 시드 기반으로 ±소량 흩뜨려 일렬감 제거):
```csharp
                // 일렬 느낌 제거 — 시드 결정적 지터로 가로 위치를 ±소량 흔든다.
                if (count > 1)
                {
                    float jitter = (((seed * 73856093) & 0x3ff) / 1023f - 0.5f) * 0.05f; // ±0.025
                    xnorm = Mathf.Clamp(xnorm + jitter, marginNorm * 0.5f, 1f - marginNorm * 0.5f);
                }
```

- [ ] **Step 3: 컴파일 + EditMode**

Run: `ps`로 단일 라이선스 확인 후 `./init.sh`
Expected: PASS — 154 유지, 컴파일 에러 없음.

- [ ] **Step 4: PlayMode 캡처 — 깊이 군집 육안**

Run: Unity PlayMode (`-nographics` 빼고). `Capture_AllStates`의 01-main(차고 3명)·01d-office-rich(talent 10) 재캡처.
Expected: `01-main.png`에 3명이 일렬이 아니라 [2,1] 작은 무리, `01d-office-rich.png`에 3밴드 원근 깊이. (중간 바닥 가구는 Task 3에서.)

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/GameScreen.cs
git commit -m "feat-027 #2: 직원 다열 깊이 군집 — OfficeLayout 기반 RefreshOfficeScene + X jitter (일렬 탈피)"
```

---

### Task 3: 중간 바닥 채우기 (OfficeProps 깊이 존 + 신규 가구)

**Files:**
- Modify: `Assets/_Project/Scripts/UI/OfficeProps.cs` (`BaseProps`/`Populate` line 26~105)

목표 — 빈 중간 바닥을 깊이 존 소품으로 채운다. 기존 소품 추가 인스턴스(즉시 효과) + 신규 가구 specs(아트 반입 시 채워짐, 미반입은 graceful skip). 러그는 가장 뒤(backmost)에 그린다.

- [ ] **Step 1: 러그 + 중간 바닥 소품 배열 추가**

`OfficeProps.cs`의 `BaseProps` 정의(line 27~34) 바로 아래에 추가:

```csharp
        // 중앙 바닥 러그 — 가장 뒤(backmost)에 깔아 바닥을 잡아준다. 신규 스프라이트(미반입 시 skip).
        static readonly PropSpec Rug = new PropSpec("prop_rug", 0.5f, 116f, 60f);

        // 중간 바닥 존 — 빈 띠를 메운다. 신규 가구(prop_*) + 기존 소품 추가 인스턴스(즉시 효과). 작은 Height로 원근(뒤·작게).
        static readonly PropSpec[] MidProps =
        {
            new PropSpec("prop_meeting_table", 0.50f, 205f, 86f), // 신규 — 중앙 회의 테이블
            new PropSpec("prop_partition", 0.70f, 198f, 78f),     // 신규 — 우 파티션
            new PropSpec("prop_plant_big", 0.30f, 188f, 104f),    // 신규 — 좌 키큰 화분
            new PropSpec("prop_plant", 0.40f, 176f, 60f),         // 기존 — 중간 화분(추가 인스턴스, 즉시 효과)
            new PropSpec("prop_bookshelf", 0.84f, 196f, 92f),     // 기존 — 우상 수납(추가 인스턴스)
        };
```

- [ ] **Step 2: Populate 그리기 순서에 러그·MidProps 삽입**

`Populate`의 prop 그리기 루프(line 96~104, `foreach (var prop in BaseProps)` 부터)를 다음으로 교체 — 러그(뒤) → MidProps(중간) → BaseProps(앞 가장자리) → StageProps 순으로 그려 앞 소품이 위에 겹친다:

```csharp
            PlaceProp(layer.transform, Rug); // 가장 뒤 — 바닥 러그

            foreach (var prop in MidProps)
            {
                PlaceProp(layer.transform, prop); // 중간 바닥
            }

            foreach (var prop in BaseProps)
            {
                PlaceProp(layer.transform, prop); // 앞 가장자리(위에 겹침)
            }

            foreach (var prop in StageProps(backgroundKey))
            {
                PlaceProp(layer.transform, prop); // 성급 특화
            }
```

- [ ] **Step 3: 컴파일 + EditMode**

Run: `ps` 확인 후 `./init.sh`
Expected: PASS — 154 유지.

- [ ] **Step 4: PlayMode 캡처 — 중간 바닥 채움 육안**

Run: Unity PlayMode. 01-main/01d-office-rich 재캡처.
Expected: 중간 바닥에 기존 소품(추가 화분·수납) 인스턴스가 즉시 보여 빈 띠가 줄어든다. 신규 가구(러그·회의테이블·파티션·키큰화분)는 미반입이라 아직 안 보임(skip) — Task 4 핸드오프 후 Codex 반입 시 채워진다. **footY/Height/XNorm 값은 캡처를 보며 미세 조정**(겹침·과밀 회피).

- [ ] **Step 5: Commit**

```bash
git add Assets/_Project/Scripts/UI/OfficeProps.cs
git commit -m "feat-027 #3: 중간 바닥 채우기 — OfficeProps 깊이 존 + 러그·신규 가구 specs (기존 소품 즉시 효과)"
```

---

### Task 4: 신규 가구 Codex 핸드오프 문서

**Files:**
- Create: `docs/codex-handoff/feat027-office-furniture.md`

신규 가구 5종 스프라이트(`prop_rug`, `prop_meeting_table`, `prop_partition`, `prop_plant_big`, `prop_shelf_low`)를 feat-024 크로마키 파이프라인으로 양산하는 Codex 핸드오프 문서를 작성한다. **이 Task는 문서 작성만** — 실제 생성·반입은 Codex가 별도 실행(에셋=Codex 분담).

- [ ] **Step 1: 핸드오프 문서 작성**

`docs/codex-handoff/feat027-office-furniture.md`에 다음을 포함해 작성 — 기존 핸드오프(`docs/codex-handoff/feat024-character-sheets-gen.md`, `feat025-event-result-frames.md`)의 형식·게이트를 따른다:
  - 목표 — 중간 바닥용 신규 가구 5종(`prop_rug` 넓고 낮은 러그 / `prop_meeting_table` 회의 테이블+의자 / `prop_partition` 낮은 칸막이 / `prop_plant_big` 키 큰 화분 / `prop_shelf_low` 낮은 수납장). 정면 단면 픽셀, feat-020 actor 톤·팔레트 정합.
  - 파이프라인 — codex imagegen(마젠타/녹색 크로마키 배경) → `Tools~/pixel_office/feat024/key_props.py`(종횡비 보존 키잉) → `diagnose_halo.py` halo=0 GATE PASS → `import_props.py`로 `Resources/Art/Actors`(또는 소품 경로) 반입, .meta는 기존 prop_*.meta 미러.
  - 배선 — 스프라이트 이름을 `OfficeProps.cs`의 `Rug`/`MidProps`가 이미 참조(`prop_rug`/`prop_meeting_table`/`prop_partition`/`prop_plant_big`). `prop_shelf_low`는 후속 배치 여유분. 반입되면 자동으로 화면에 나타난다(코드 무수정).
  - 제약 — Codex는 `.cs`/`progress.md`/`feature_list.json` 무수정. 단일 Unity 라이선스(ps 확인).
  - 검증 — 반입 후 Claude가 01-main/01d 재캡처로 중간 바닥 완성 육안.

- [ ] **Step 2: Commit**

```bash
git add docs/codex-handoff/feat027-office-furniture.md
git commit -m "feat-027 #4: 신규 가구 5종 Codex 크로마키 핸드오프 문서"
```

---

### Task 5: 통합 검증 + 문서 갱신

**Files:**
- Modify: `feature_list.json`, `progress.md`

- [ ] **Step 1: 단일 라이선스 확인 + 전체 검증**

Run: `ps -axo command | grep "[U]nity.app" | grep projectpath` → `./init.sh` (154/154) → Unity PlayMode 캡처(01-main/01d/01f).
Expected: EditMode 154/154 + 캡처에 깊이 군집(일렬 탈피) + 중간 바닥 채움(기존 소품 인스턴스) 육안. 신규 가구는 Codex 반입 후 완성(문서에 명시).

- [ ] **Step 2: feature_list.json에 feat-027 등록**

`feat-026` 항목 다음에 추가(기존 형식·쉼표 정합):
```json
    {
      "id": "feat-027",
      "name": "오피스 구성 재작업 — 깊이 배치·자연 군집·중간 바닥 채우기 (P28)",
      "description": "사용자 피드백(2026-06-26) — 게임플레이 오피스가 비어 보임(소품 바닥 구석·직원 일렬·중간 바닥 텅). OfficeLayout 깊이 배치 + 다열 군집 + 중간 바닥 소품/신규 가구로 채운다. 코어 무변경. feat-028(타임랩스·분위)은 이 위에. 정본 docs/feat-027-office-composition-design.md, 계획 docs/feat-027-office-composition-plan.md.",
      "dependencies": ["feat-019", "feat-023"],
      "status": "done",
      "owner": "Claude(배치 로직·통합·검증) + Codex(신규 가구 스프라이트, 핸드오프)",
      "evidence": "코드 골격 완료 — OfficeLayout(Band 원근·RowPlan 분배, EditMode 4 신규 150→154), RefreshOfficeScene 다열 깊이 군집 + X jitter(일렬 탈피), OfficeProps 깊이 존 + 러그·신규 가구 specs(기존 소품 추가 인스턴스 즉시 효과). 코어·세이브 무변경. 캡처 01-main/01d 깊이 군집·중간 바닥 채움 육안. 신규 가구 5종은 Codex 핸드오프 docs/codex-handoff/feat027-office-furniture.md(반입 시 드롭인 완성). 정본 docs/feat-027-office-composition-design.md."
    }
```

- [ ] **Step 3: progress.md 헤드라인 갱신**

"현재 상태" 블록에 feat-027 한 줄 추가 — 오피스 구성 재작업(깊이 배치·자연 군집·중간 바닥), OfficeLayout EditMode 154, 신규 가구 Codex 핸드오프 대기, feat-028(타임랩스·분위) 후속.

- [ ] **Step 4: Commit**

```bash
git add feature_list.json progress.md
git commit -m "feat-027 #5: 클로즈아웃 — 오피스 구성 재작업 코드 골격, EditMode 154 + 깊이 군집·중간바닥 캡처"
```

---

## 자체 검토 메모

- **스펙 커버리지** — ① 깊이 존(설계 §해법①) = Task1 OfficeLayout. ② 자연 군집(§②) = Task2. ③ 중간 바닥 가구(§③) = Task3 + Task4 핸드오프. 검증(§검증) = Task1 TDD + Task2/3/5 캡처. ✅
- **타입 일관성** — `OfficeLayout.Band(int)→(float footY,float scale)`·`RowPlan(int)→int[]` Task1 정의 = Task2 호출 일치. `PropSpec(sprite,xNorm,footY,height)` 기존 생성자 = Task3 사용 일치. 신규 가구 스프라이트 이름(`prop_rug`/`prop_meeting_table`/`prop_partition`/`prop_plant_big`) Task3 specs = Task4 핸드오프 일치.
- **잔여 모호(실행 중 캡처로 결정)** — Band footY(150/232/314)·MidProps footY/Height/XNorm는 시작값이며 겹침·과밀은 캡처 보며 미세 조정. 신규 가구 미반입 시 `PlaceProp`이 sprite null로 graceful skip(기존 패턴 line 110). 러그가 props 레이어(액터 뒤)라 직원 앞이 아닌 바닥에 깔림 — 의도된 배경 채움.
- **분담 경계** — Task1~3·5는 Claude 코드/문서, 신규 가구 *생성*은 Task4 핸드오프로 Codex가 별도 실행(이 계획 범위 밖). 계획은 코드 골격 + 핸드오프까지 전달하고, 가구 반입·최종 캡처는 Codex 실행 후 후속.
