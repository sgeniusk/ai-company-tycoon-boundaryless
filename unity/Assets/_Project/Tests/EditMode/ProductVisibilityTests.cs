// 제품·도메인 노출 상태 머신 검증 — 발견의 사다리 5상태 전이와 카운터 (feat-012 #1).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class ProductVisibilityTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh() => SimulationContext.Create(Catalog());

        [Test]
        public void FreshGame_StarterProduct_IsUnlocked()
        {
            var ctx = Fresh();
            var p = ctx.Catalog.GetProduct("foundation_model_v0");
            Assert.AreEqual(VisibilityState.Unlocked, ctx.Visibility.GetState(p));
        }

        [Test]
        public void Launch_MovesStateToLaunched()
        {
            var ctx = Fresh();
            Assert.IsTrue(ctx.Products.Launch("foundation_model_v0"));
            var p = ctx.Catalog.GetProduct("foundation_model_v0");
            Assert.AreEqual(VisibilityState.Launched, ctx.Visibility.GetState(p));
        }

        [Test]
        public void UnlockedDomain_UnmetCapabilities_IsRevealed()
        {
            var ctx = Fresh();
            // frontier_reasoning_model — 도메인(foundation_models)은 기본 해금이지만 language 3 등 요건 미충족.
            var p = ctx.Catalog.GetProduct("frontier_reasoning_model");
            Assert.AreEqual(VisibilityState.Revealed, ctx.Visibility.GetState(p));
        }

        [Test]
        public void FreshGame_NearLockedDomain_IsTeaser()
        {
            var ctx = Fresh();
            // customer_support 요구 language 2 — 보유 language 1은 임계(2) 이내 근접.
            Assert.AreEqual(VisibilityState.Teaser, ctx.Visibility.GetDomainState("customer_support"));
            var p = ctx.Catalog.GetProduct("customer_support_chatbot");
            Assert.AreEqual(VisibilityState.Teaser, ctx.Visibility.GetState(p));
        }

        [Test]
        public void FreshGame_FarDomain_IsHidden_UnownedCapabilityDoesNotTease()
        {
            var ctx = Fresh();
            // robotics 요구 robotics 1 — 보유 0(미보유 가드)이라 근접 아님.
            Assert.AreEqual(VisibilityState.Hidden, ctx.Visibility.GetDomainState("robotics"));
            var p = ctx.Catalog.GetProduct("warehouse_robot_fleet");
            Assert.AreEqual(VisibilityState.Hidden, ctx.Visibility.GetState(p));
            // mobility 요구 agent 2 — 미보유면 레벨 차 2 이내라도 숨김 유지.
            Assert.AreEqual(VisibilityState.Hidden, ctx.Visibility.GetDomainState("mobility"));
        }

        [Test]
        public void CapabilityResearch_PromotesTeaserToUnlockedDomain()
        {
            var ctx = Fresh();
            ctx.Model.Capabilities["language"] = 2;
            ctx.Domains.CheckAll();
            Assert.AreEqual(VisibilityState.Unlocked, ctx.Visibility.GetDomainState("customer_support"));
            var p = ctx.Catalog.GetProduct("customer_support_chatbot");
            Assert.AreEqual(VisibilityState.Unlocked, ctx.Visibility.GetState(p));
        }

        [Test]
        public void CapabilityResearch_RevealsHiddenDomainAsTeaser()
        {
            var ctx = Fresh();
            Assert.AreEqual(VisibilityState.Hidden, ctx.Visibility.GetDomainState("mobility"));
            ctx.Model.Capabilities["agent"] = 1; // mobility 요구 agent 2 — 보유 1이면 근접.
            Assert.AreEqual(VisibilityState.Teaser, ctx.Visibility.GetDomainState("mobility"));
        }

        [Test]
        public void UnmetPrerequisiteProduct_KeepsRevealed_UntilPrerequisiteLaunched()
        {
            var ctx = Fresh();
            var p = ScriptableObject.CreateInstance<ProductDef>();
            p.id = "test_dependent_product";
            p.domain = "foundation_models"; // 기본 해금 도메인
            p.prerequisiteProducts.Add("foundation_model_v0");

            Assert.AreEqual(VisibilityState.Revealed, ctx.Visibility.GetState(p));
            Assert.IsTrue(ctx.Products.Launch("foundation_model_v0"));
            Assert.AreEqual(VisibilityState.Unlocked, ctx.Visibility.GetState(p));
            Object.DestroyImmediate(p);
        }

        [Test]
        public void TeaserText_FallsBackToDefault_WhenFieldEmpty()
        {
            var ctx = Fresh();
            var p = ScriptableObject.CreateInstance<ProductDef>();
            Assert.AreEqual(ProductVisibilityService.DefaultTeaser, ctx.Visibility.GetTeaserText(p));
            p.teaser = "하늘을 나는 무언가의 도면이 책상 위에 있습니다.";
            Assert.AreEqual(p.teaser, ctx.Visibility.GetTeaserText(p));
            Object.DestroyImmediate(p);
        }

        [Test]
        public void TeaserHint_PointsToNearestUnlockingCapability()
        {
            var ctx = Fresh();
            Assert.AreEqual("language", ctx.Visibility.GetTeaserHintCapability("customer_support"));
            Assert.IsNull(ctx.Visibility.GetTeaserHintCapability("robotics"));
        }

        [Test]
        public void SnapshotDiff_DetectsTeaserToRevealedMoment()
        {
            var ctx = Fresh();
            var before = ctx.Visibility.Snapshot();
            ctx.Model.Capabilities["language"] = 2;
            ctx.Domains.CheckAll();
            var discovered = ctx.Visibility.DiffNewlyDiscovered(before);
            Assert.IsTrue(discovered.Exists(p => p.id == "customer_support_chatbot"),
                "language 2 해금으로 customer_support_chatbot가 ???→실명 전환돼야 한다.");
        }

        [Test]
        public void SnapshotDiff_NoChange_ReturnsEmpty()
        {
            var ctx = Fresh();
            var before = ctx.Visibility.Snapshot();
            Assert.AreEqual(0, ctx.Visibility.DiffNewlyDiscovered(before).Count);
        }

        [Test]
        public void PreviewNextLevel_ShowsDomainUnlock()
        {
            var ctx = Fresh();
            // language 1→2면 customer_support 도메인이 열린다.
            var preview = ctx.Visibility.PreviewNextLevel("language");
            Assert.IsTrue(preview.Domains.Exists(d => d.id == "customer_support"));
        }

        [Test]
        public void PreviewNextLevel_ShowsProductUnlock_WhenLastMissingCapability()
        {
            var ctx = Fresh();
            // frontier_reasoning_model 요구 language 3 / code 2 / optimization 1 — language만 남긴 상태.
            // 선행 제품들은 출시 상태로 만들어 둔다 (#3 데이터로 prerequisite 추가됨, 비용 없이 직접 주입).
            var frontier = ctx.Catalog.GetProduct("frontier_reasoning_model");
            foreach (var pre in frontier.prerequisiteProducts)
                ctx.Model.ActiveProducts.Add(pre);
            ctx.Model.Capabilities["language"] = 2;
            ctx.Model.Capabilities["code"] = 2;
            ctx.Model.Capabilities["optimization"] = 1;
            ctx.Domains.CheckAll();
            var preview = ctx.Visibility.PreviewNextLevel("language");
            Assert.IsTrue(preview.Products.Exists(p => p.id == "frontier_reasoning_model"));
        }

        [Test]
        public void CanLaunch_BlocksUntilPrerequisiteProductsLaunched()
        {
            var ctx = Fresh();
            // 능력 max + 자원·신뢰 충분 — 선행 제품 조건만 남긴다.
            foreach (var cap in ctx.Catalog.capabilities)
                if (cap != null) ctx.Model.Capabilities[cap.id] = cap.maxLevel;
            ctx.Domains.CheckAll();
            foreach (var id in Core.ResourceIds.All)
                ctx.Model.Set(id, 1e12);

            ProductDef target = null;
            foreach (var p in ctx.Catalog.products)
                if (p != null && p.prerequisiteProducts != null && p.prerequisiteProducts.Count > 0) { target = p; break; }
            if (target == null)
            {
                Assert.Ignore("선행 제품 데이터가 아직 없다 — feat-012 #3 데이터 웨이브 후 활성화.");
            }

            Assert.IsFalse(ctx.Products.CanLaunch(target.id), target.id + "는 선행 미출시 상태에서 출시 불가여야 한다.");
            foreach (var pre in target.prerequisiteProducts)
                ctx.Model.ActiveProducts.Add(pre);
            Assert.IsTrue(ctx.Products.CanLaunch(target.id), target.id + "는 선행 출시 후 출시 가능해야 한다.");
        }

        [Test]
        public void ProductLevelUp_RaisesRevenue_AndCostScalesWithLevel()
        {
            var ctx = Fresh();
            ctx.Model.Set(Core.ResourceId.Cash, 1e9);
            ctx.Model.Set(Core.ResourceId.Compute, 1e9);
            ctx.Model.Set(Core.ResourceId.Data, 1e9);
            Assert.IsTrue(ctx.Products.Launch("foundation_model_v0"));
            Assert.AreEqual(1, ctx.Products.GetLevel("foundation_model_v0"));

            var costLv1 = ctx.Products.GetLevelUpCost("foundation_model_v0");
            Assert.IsTrue(ctx.Products.LevelUp("foundation_model_v0"));
            Assert.AreEqual(2, ctx.Products.GetLevel("foundation_model_v0"));
            var costLv2 = ctx.Products.GetLevelUpCost("foundation_model_v0");
            Assert.Greater(costLv2[0].amount, costLv1[0].amount, "강화 비용은 레벨에 비례해 올라야 한다 (React 동치).");

            // 매출 +35%/Lv — 월 정산에서 레벨 2 제품의 매출이 기본의 1.35배.
            var summary = ctx.Month.AdvanceMonth();
            var def = ctx.Catalog.GetProduct("foundation_model_v0");
            Assert.AreEqual(def.baseRevenue * 1.35, summary.Revenue, 0.01);
        }

        [Test]
        public void ProductLevel_SaveRoundTrip_AndLegacyDefaultsToOne()
        {
            var ctx = Fresh();
            ctx.Model.ActiveProducts.Add("foundation_model_v0");
            ctx.Model.ProductLevels["foundation_model_v0"] = 3;

            var path = System.IO.Path.Combine(UnityEngine.Application.temporaryCachePath, "test-product-level-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new AICompanyTycoon.Core.GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.AreEqual(3, loaded.ProductLevels["foundation_model_v0"]);

            // 구세이브 동치 — ProductLevels 비어 있어도 출시 제품은 레벨 1.
            var legacy = Fresh();
            legacy.Model.ActiveProducts.Add("foundation_model_v0");
            Assert.AreEqual(1, legacy.Products.GetLevel("foundation_model_v0"));
            System.IO.File.Delete(path);
        }

        [Test]
        public void Recruit_AddsTalent_AndCostGrows()
        {
            var ctx = Fresh();
            ctx.Model.Set(Core.ResourceId.Cash, 1e9);
            double talentBefore = ctx.Model.Get(Core.ResourceId.Talent);
            double costBefore = ctx.Recruit.GetCost();
            Assert.IsTrue(ctx.Recruit.Recruit());
            Assert.AreEqual(talentBefore + 1, ctx.Model.Get(Core.ResourceId.Talent), 0.001);
            Assert.Greater(ctx.Recruit.GetCost(), costBefore, "채용 비용은 보유 인재 증가에 따라 올라야 한다.");
        }

        [Test]
        public void BuyCompute_AddsComputePack()
        {
            var ctx = Fresh();
            ctx.Model.Set(Core.ResourceId.Cash, 1e9);
            double before = ctx.Model.Get(Core.ResourceId.Compute);
            Assert.IsTrue(ctx.Recruit.BuyCompute());
            Assert.AreEqual(before + ctx.Recruit.GetComputePackAmount(), ctx.Model.Get(Core.ResourceId.Compute), 0.001);
        }

        [Test]
        public void Recruit_Blocked_WhenCashInsufficient()
        {
            var ctx = Fresh();
            ctx.Model.Set(Core.ResourceId.Cash, 0);
            Assert.IsFalse(ctx.Recruit.CanRecruit());
            Assert.IsFalse(ctx.Recruit.Recruit());
        }

        [Test]
        public void Counters_ReportDiscoveredTotalAndHidden()
        {
            var ctx = Fresh();
            // foundation_models — 기본 해금 도메인이라 전 제품이 실명(Revealed 이상).
            Assert.GreaterOrEqual(ctx.Visibility.CountTotal("foundation_models"), 2);
            Assert.AreEqual(ctx.Visibility.CountTotal("foundation_models"), ctx.Visibility.CountDiscovered("foundation_models"));
            // 티저 도메인 제품은 발견(실명)으로 세지 않는다.
            Assert.AreEqual(0, ctx.Visibility.CountDiscovered("customer_support"));
            // 숨김 카운터 — 시작 시점에 미발견 제품·분야가 반드시 존재한다 (미지의 영역).
            Assert.Greater(ctx.Visibility.CountHiddenProducts(), 0);
            Assert.Greater(ctx.Visibility.CountHiddenDomains(), 0);
        }
    }
}
