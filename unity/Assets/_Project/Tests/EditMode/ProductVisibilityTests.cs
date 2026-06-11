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
        public void Counters_ReportDiscoveredTotalAndHidden()
        {
            var ctx = Fresh();
            // foundation_models — 2종 전부 실명(Unlocked/Revealed).
            Assert.AreEqual(2, ctx.Visibility.CountTotal("foundation_models"));
            Assert.AreEqual(2, ctx.Visibility.CountDiscovered("foundation_models"));
            // 티저 도메인 제품은 발견(실명)으로 세지 않는다.
            Assert.AreEqual(0, ctx.Visibility.CountDiscovered("customer_support"));
            // 숨김 카운터 — 시작 시점에 미발견 제품·분야가 반드시 존재한다 (미지의 영역).
            Assert.Greater(ctx.Visibility.CountHiddenProducts(), 0);
            Assert.Greater(ctx.Visibility.CountHiddenDomains(), 0);
        }
    }
}
