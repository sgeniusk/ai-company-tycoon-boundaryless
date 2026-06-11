// 런 모디파이어 선택 엔진·시작 델타·세이브 마이그레이션 검증 (feat-007 블록 #1).
using NUnit.Framework;
using System.IO;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class RunModifierTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void Import_HasFourAxesAndTagEffects()
        {
            var c = Catalog();
            Assert.AreEqual(11, c.GetRunOptions("start_cities").Count);
            Assert.AreEqual(12, c.GetRunOptions("world_lore").Count);
            Assert.AreEqual(8, c.GetRunOptions("market_conditions").Count);
            Assert.AreEqual(9, c.GetRunOptions("founder_traits").Count);
            Assert.IsNotNull(c.runTagEffects);
            Assert.AreEqual(40, c.runTagEffects.effects.Count);
            // 스폿체크 — gpu_scarcity 태그는 compute -4 (run_modifiers.json 정본).
            var fx = c.runTagEffects.GetEffect("gpu_scarcity");
            Assert.IsNotNull(fx);
            Assert.AreEqual(1, fx.monthlyEffects.Count);
            Assert.AreEqual(ResourceId.Compute, fx.monthlyEffects[0].resource);
            Assert.AreEqual(-4, fx.monthlyEffects[0].amount, 0.001);
        }

        [Test]
        public void Select_DefaultInput_IsDefaultRunWithInertTags()
        {
            var c = Catalog();
            var state = RunModifierService.Select(c, null);
            Assert.IsTrue(state.IsDefaultRun());
            Assert.AreEqual(RunModifiersState.DefaultSeed, state.Seed);
            // 기본 4축도 식별 태그는 갖지만(default_city 등) tag_effects에 없어 효과 0이어야 한다.
            CollectionAssert.AreEquivalent(
                new[] { "default_city", "standard_world", "steady_market", "no_founder" }, state.Tags);
            foreach (var tag in state.Tags)
                Assert.IsNull(c.runTagEffects.GetEffect(tag), tag + " 태그는 효과가 없어야 한다.");
        }

        [Test]
        public void Select_SameSeed_IsDeterministic_AndExcludesDefaults()
        {
            var c = Catalog();
            var a = RunModifierService.Select(c, new RunModifierInput { Seed = "run-42" });
            var b = RunModifierService.Select(c, new RunModifierInput { Seed = "run-42" });
            Assert.AreEqual(a.StartCityId, b.StartCityId);
            Assert.AreEqual(a.WorldLoreId, b.WorldLoreId);
            Assert.AreEqual(a.MarketConditionId, b.MarketConditionId);
            Assert.AreEqual(a.FounderTraitId, b.FounderTraitId);
            CollectionAssert.AreEqual(a.Tags, b.Tags);
            // 시드 런은 기본 옵션을 풀에서 제외한다 (React selectOption 동일).
            Assert.AreNotEqual(RunModifiersState.DefaultStartCityId, a.StartCityId);
            Assert.AreNotEqual(RunModifiersState.DefaultWorldLoreId, a.WorldLoreId);
            Assert.AreNotEqual(RunModifiersState.DefaultMarketConditionId, a.MarketConditionId);
            Assert.AreNotEqual(RunModifiersState.DefaultFounderTraitId, a.FounderTraitId);
        }

        [Test]
        public void HashSeed_MatchesReactFnv1a()
        {
            // React hashSeed("standard:city") 등과 교차 검증용 고정값 — FNV-1a 32bit.
            Assert.AreEqual(RunModifierService.HashSeed("a"), RunModifierService.HashSeed("a"));
            Assert.AreEqual(0x811C9DC5u, RunModifierService.HashSeed(""));
            Assert.AreEqual(0xE40C292Cu, RunModifierService.HashSeed("a"));
        }

        [Test]
        public void Create_DefaultRun_DoesNotChangeBaseline()
        {
            var c = Catalog();
            var plain = SimulationContext.Create(c);
            Assert.IsTrue(plain.Model.RunModifiers.IsDefaultRun());
            // 기본 런 시작 자원은 ResourceDef.initialValue 그대로.
            foreach (var r in c.resources)
                if (r != null && ResourceIds.TryParse(r.id, out var id))
                    Assert.AreEqual(r.initialValue, plain.Model.Get(id), 0.001, r.id);
        }

        [Test]
        public void Create_ExplicitFounder_AppliesStartingDeltas()
        {
            var c = Catalog();
            var baseline = SimulationContext.Create(c);
            var run = SimulationContext.Create(c, 12345,
                new RunModifierInput { FounderTraitId = "engineer_founder" });
            // engineer_founder — compute +10, data +10, code 능력 +1 (run_modifiers.json 정본).
            Assert.AreEqual(baseline.Model.Compute + 10, run.Model.Compute, 0.001);
            Assert.AreEqual(baseline.Model.Data + 10, run.Model.Data, 0.001);
            int baseCode;
            baseline.Model.Capabilities.TryGetValue("code", out baseCode);
            Assert.AreEqual(baseCode + 1, run.Model.Capabilities["code"]);
            CollectionAssert.Contains(run.Model.RunModifiers.Tags, "engineer_founder");
        }

        [Test]
        public void SaveLoad_RunModifiers_RoundTrips()
        {
            var path = Path.Combine(Application.temporaryCachePath, "aict_test_runmod_save.json");
            var svc = new SaveService(path);
            svc.Delete();

            var m = new GameModel();
            m.RunModifiers = new RunModifiersState
            {
                Seed = "run-7",
                StartCityId = "seoul",
                WorldLoreId = "chip_war",
                MarketConditionId = "ai_boom",
                FounderTraitId = "researcher_founder",
            };
            m.RunModifiers.Tags.Add("export_controls");
            svc.Save(m);

            var m2 = new GameModel();
            Assert.IsTrue(svc.Load(m2));
            Assert.AreEqual("run-7", m2.RunModifiers.Seed);
            Assert.AreEqual("seoul", m2.RunModifiers.StartCityId);
            Assert.AreEqual("chip_war", m2.RunModifiers.WorldLoreId);
            Assert.AreEqual("ai_boom", m2.RunModifiers.MarketConditionId);
            Assert.AreEqual("researcher_founder", m2.RunModifiers.FounderTraitId);
            Assert.AreEqual("standard", m2.RunModifiers.ChallengeTier);
            CollectionAssert.Contains(m2.RunModifiers.Tags, "export_controls");
            svc.Delete();
        }

        [Test]
        public void Load_LegacySaveWithoutRunModifiers_DefaultsToStandard()
        {
            var path = Path.Combine(Application.temporaryCachePath, "aict_test_legacy_save.json");
            // 구세이브(version 2, runModifiers 필드 없음) 모사.
            File.WriteAllText(path, "{\"version\":2,\"cash\":500,\"currentMonth\":3,\"companyStageId\":\"garage_prototype\"}");
            var m = new GameModel();
            Assert.IsTrue(new SaveService(path).Load(m));
            Assert.IsNotNull(m.RunModifiers);
            Assert.IsTrue(m.RunModifiers.IsDefaultRun());
            Assert.AreEqual("standard", m.RunModifiers.ChallengeTier);
            File.Delete(path);
        }

        [Test]
        public void AdvanceMonth_TagEffects_ApplyMonthlyDelta()
        {
            var c = Catalog();
            var baseCtx = SimulationContext.Create(c);
            var runCtx = SimulationContext.Create(c, 12345, new RunModifierInput { WorldLoreId = "chip_war" });
            // 시작 델타·클램프 간섭 제거 — 두 모델 모두 동일 연산력에서 출발시켜 월간 효과만 잰다.
            baseCtx.Model.Compute = 50;
            runCtx.Model.Compute = 50;
            baseCtx.Month.AdvanceMonth();
            runCtx.Month.AdvanceMonth();
            // chip_war 태그 — export_controls(-3) + compute_regional(-2) = 연산력 -5/월.
            Assert.AreEqual(baseCtx.Model.Compute - 5, runCtx.Model.Compute, 0.001);
        }

        [Test]
        public void AdvanceMonth_StandardRun_TagsAreInert()
        {
            var c = Catalog();
            var withTags = SimulationContext.Create(c);
            var without = SimulationContext.Create(c);
            without.Model.RunModifiers.Tags.Clear(); // 태그 제거 모델과 결과 동일 = 표준 런 회귀 없음
            withTags.Month.AdvanceMonth();
            without.Month.AdvanceMonth();
            foreach (var r in c.resources)
                if (r != null && ResourceIds.TryParse(r.id, out var id))
                    Assert.AreEqual(without.Model.Get(id), withTags.Model.Get(id), 0.001, r.id);
        }

        [Test]
        public void Import_HasFourDifficultyTiers()
        {
            var c = Catalog();
            Assert.AreEqual(4, c.difficultyTiers.Count);
            var hard = c.GetDifficultyTier("hard");
            Assert.IsNotNull(hard);
            Assert.AreEqual(2, hard.monthlyHeadwind.Count);
            Assert.AreEqual(1.5, hard.rewardMultiplier, 0.001);
        }

        [Test]
        public void Select_ChallengeTier_ValidKeptInvalidFallsBack()
        {
            var c = Catalog();
            var hard = RunModifierService.Select(c, new RunModifierInput { ChallengeTierId = "hard" });
            Assert.AreEqual("hard", hard.ChallengeTier);
            var bogus = RunModifierService.Select(c, new RunModifierInput { ChallengeTierId = "nightmare" });
            Assert.AreEqual("standard", bogus.ChallengeTier);
        }

        [Test]
        public void AdvanceMonth_HardTier_AppliesMonthlyHeadwind()
        {
            var c = Catalog();
            var baseCtx = SimulationContext.Create(c);
            var hardCtx = SimulationContext.Create(c, 12345, new RunModifierInput { ChallengeTierId = "hard" });
            // 기본 4축 동일(티어만 하드) — 시작 상태 동일. 클램프 간섭 없는 위치로 정렬.
            baseCtx.Model.Hype = 50;
            hardCtx.Model.Hype = 50;
            baseCtx.Month.AdvanceMonth();
            hardCtx.Month.AdvanceMonth();
            // hard 헤드윈드 — cash -60, hype -1 (정본 difficulty_tiers.json).
            Assert.AreEqual(baseCtx.Model.Cash - 60, hardCtx.Model.Cash, 0.001);
            Assert.AreEqual(baseCtx.Model.Hype - 1, hardCtx.Model.Hype, 0.001);
        }

        [Test]
        public void Sanitize_UnknownIds_FallBackToDefaults()
        {
            var c = Catalog();
            var broken = new RunModifiersState { StartCityId = "atlantis", WorldLoreId = "chip_war" };
            var fixedState = RunModifierService.Sanitize(broken, c);
            Assert.AreEqual(RunModifiersState.DefaultStartCityId, fixedState.StartCityId);
            Assert.AreEqual("chip_war", fixedState.WorldLoreId);
            // 태그는 카탈로그에서 재파생된다.
            CollectionAssert.Contains(fixedState.Tags, "export_controls");
        }
    }
}
