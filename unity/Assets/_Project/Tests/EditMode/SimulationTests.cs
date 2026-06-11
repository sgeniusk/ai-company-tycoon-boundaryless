// 코어 시뮬레이션 검증 — balance.json 공식 재현, 액션 서비스, 한 게임 끝까지 시뮬레이션.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class SimulationTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void NewGame_InitialResources_FromData()
        {
            var ctx = SimulationContext.Create(Catalog());
            Assert.AreEqual(10000, ctx.Model.Cash, 0.001);
            Assert.AreEqual(3, ctx.Model.Talent, 0.001);
            Assert.AreEqual(1, ctx.Capabilities.GetLevel("language"));
            Assert.IsTrue(ctx.Domains.IsUnlocked("personal_productivity"));
            Assert.AreEqual(1, ctx.Model.CurrentMonth);
        }

        [Test]
        public void AdvanceMonth_AppliesCostFormula()
        {
            var ctx = SimulationContext.Create(Catalog());
            var b = ctx.Catalog.balance;
            // users 0 -> compute cost 0, automation 0. 위치 모디파이어 — 시작 본사(강원 산골 차고) 0.82 (feat-014 #2).
            double expected = (b.baseMonthlyCashCost + 3 * b.salaryPerTalent) * OfficeService.GetLocationCostModifier(ctx.Model, ctx.Catalog);
            double before = ctx.Model.Cash;
            var s = ctx.Month.AdvanceMonth();
            Assert.AreEqual(expected, s.TotalCashCost, 0.001);
            Assert.AreEqual(before - expected, ctx.Model.Cash, 0.001);
            Assert.AreEqual(2, ctx.Model.CurrentMonth);
        }

        [Test]
        public void HypeDecays_Monthly()
        {
            var ctx = SimulationContext.Create(Catalog());
            double h0 = ctx.Model.Hype;
            ctx.Month.AdvanceMonth();
            Assert.AreEqual(System.Math.Max(0, h0 - ctx.Catalog.balance.monthlyHypeDecay), ctx.Model.Hype, 0.001);
        }

        [Test]
        public void TrustRecovers_BelowThreshold()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Trust = 40; // 임계값 50 미만
            ctx.Month.AdvanceMonth();
            Assert.AreEqual(40 + ctx.Catalog.balance.trustRecoveryAmount, ctx.Model.Trust, 0.001);
        }

        [Test]
        public void Resource_Clamps_TrustWithinZeroToHundred()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Resources.Add(ResourceId.Trust, 1000);
            Assert.AreEqual(100, ctx.Model.Trust, 0.001);
            ctx.Resources.Add(ResourceId.Trust, -1000);
            Assert.AreEqual(0, ctx.Model.Trust, 0.001);
        }

        [Test]
        public void Capability_UpgradeLanguage_UnlocksCustomerSupport()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Cash = 999999;
            ctx.Model.Data = 99999;
            Assert.IsTrue(ctx.Capabilities.CanUpgrade("language"));
            Assert.IsTrue(ctx.Capabilities.Upgrade("language"));
            Assert.AreEqual(2, ctx.Capabilities.GetLevel("language"));
            Assert.IsTrue(ctx.Domains.IsUnlocked("customer_support"));
        }

        [Test]
        public void Product_LaunchAvailable_ThenMonthlyRevenue()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Cash = 999999;
            ctx.Model.Compute = 99999;
            ctx.Model.Data = 99999;
            var avail = ctx.Products.GetAvailable();
            Assert.IsTrue(avail.Count > 0, "출시 가능한 제품이 있어야 한다.");
            int launched = 0;
            foreach (var p in avail) if (ctx.Products.Launch(p.id)) launched++;
            Assert.Greater(launched, 0);
            var s = ctx.Month.AdvanceMonth();
            Assert.Greater(s.Revenue, 0.0);
        }

        [Test]
        public void WinCondition_ByCash()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Cash = ctx.Catalog.balance.successCashThreshold + 20000; // 월 비용 차감 후에도 임계값 초과
            var s = ctx.Month.AdvanceMonth();
            Assert.IsTrue(s.GameWon);
        }

        [Test]
        public void GameOver_ByCashAndTrust()
        {
            var ctx = SimulationContext.Create(Catalog());
            var b = ctx.Catalog.balance;
            ctx.Model.Cash = b.gameOverCashThreshold - 5000;
            ctx.Model.Trust = b.gameOverTrustThreshold - 5; // 신뢰 회복 후에도 임계값 미만
            var s = ctx.Month.AdvanceMonth();
            Assert.IsTrue(s.GameOver);
        }

        [Test]
        public void FullPlaythrough_36Months_NoCrash()
        {
            var ctx = SimulationContext.Create(Catalog(), 42);
            int months = 0;
            for (int i = 0; i < 36; i++)
            {
                foreach (var p in ctx.Products.GetAvailable()) ctx.Products.Launch(p.id);
                var s = ctx.Month.AdvanceMonth();
                months++;
                if (s.GameOver || s.GameWon) break;
            }
            Assert.GreaterOrEqual(months, 1);
            Assert.GreaterOrEqual(ctx.Model.CurrentMonth, 2);
        }
    }
}
