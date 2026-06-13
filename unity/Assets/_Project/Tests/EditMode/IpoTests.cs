// 상장(IPO) + 월별 주가 — 조건 게이트, 공모가, 주가 결정론·세이브 (feat-015 #4).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class IpoTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh() => SimulationContext.Create(Catalog());

        // 4성 + 신뢰 + 매출 조건을 채운 컨텍스트.
        SimulationContext Eligible()
        {
            var ctx = Fresh();
            ctx.Model.CompanyStageId = "enterprise_ai_vendor"; // 성급 4
            ctx.Model.Trust = 70;
            ctx.Model.Set(ResourceId.Compute, 1e9);
            ctx.Model.Set(ResourceId.Data, 1e9);
            ctx.Model.Set(ResourceId.Cash, 1e6);
            ctx.Products.Launch("foundation_model_v0");
            return ctx;
        }

        [Test]
        public void Ipo_Gated_BelowFourStar()
        {
            var ctx = Fresh();
            Assert.IsFalse(ctx.Ipo.CanIpo());
            StringAssert.Contains("4성", ctx.Ipo.GetLockReason());
        }

        [Test]
        public void Ipo_Gated_LowTrust()
        {
            var ctx = Eligible();
            ctx.Model.Trust = 40;
            Assert.IsFalse(ctx.Ipo.CanIpo());
            StringAssert.Contains("신뢰", ctx.Ipo.GetLockReason());
        }

        [Test]
        public void Ipo_GrantsPublicEquity_AndOfferingCash()
        {
            var ctx = Eligible();
            Assert.IsTrue(ctx.Ipo.CanIpo());
            double valuation = ctx.Equity.GetValuation();
            double expectedCash = System.Math.Round(valuation * 0.2 * IpoService.IpoPremium);
            double cashBefore = ctx.Model.Cash;

            Assert.IsTrue(ctx.Ipo.Ipo(20, ctx.Resources));
            Assert.IsTrue(ctx.Model.IsPublic);
            Assert.AreEqual(80, ctx.Model.FounderEquity, 0.001);
            Assert.AreEqual(100, ctx.Model.SharePrice, 0.001);
            Assert.AreEqual(cashBefore + expectedCash, ctx.Model.Cash, 0.001, "공모가 = 밸류에이션*공모지분*프리미엄.");

            Assert.IsFalse(ctx.Ipo.CanIpo(), "재상장 불가.");
        }

        [Test]
        public void MarketCap_TracksSharePrice_AfterIpo()
        {
            var ctx = Eligible();
            ctx.Ipo.Ipo(10, ctx.Resources);
            ctx.Model.SharePrice = 150; // 주가 +50%
            Assert.AreEqual(ctx.Equity.GetValuation() * 1.5, ctx.Equity.GetMarketCap(), 0.001);
            Assert.AreEqual(ctx.Equity.GetMarketCap() * 0.9, ctx.Equity.GetFounderNetWorth(), 0.001);
        }

        [Test]
        public void SharePrice_MovesMonthly_AndIsDeterministic()
        {
            var a = Eligible();
            var b = Eligible();
            a.Ipo.Ipo(20, a.Resources);
            b.Ipo.Ipo(20, b.Resources);

            // 한 달은 노이즈가 우연히 0일 수 있으니 3개월 누적으로 변동을 본다.
            for (int i = 0; i < 3; i++) { a.Month.AdvanceMonth(); b.Month.AdvanceMonth(); }
            Assert.AreNotEqual(100, a.Model.SharePrice, "상장 후 주가는 시간이 지나면 움직여야 한다.");
            Assert.AreEqual(a.Model.SharePrice, b.Model.SharePrice, 0.0001, "같은 시드·달이면 같은 주가(결정론).");
        }

        [Test]
        public void PreIpo_NoStockMovement()
        {
            var ctx = Fresh();
            ctx.Month.AdvanceMonth();
            Assert.IsFalse(ctx.Model.IsPublic);
            Assert.AreEqual(0, ctx.Model.SharePrice, 0.001, "미상장이면 주가는 0(움직이지 않음).");
        }

        [Test]
        public void Ipo_SaveRoundTrip()
        {
            var ctx = Eligible();
            ctx.Ipo.Ipo(20, ctx.Resources);
            ctx.Model.SharePrice = 137.5;
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-ipo-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.IsTrue(loaded.IsPublic);
            Assert.AreEqual(137.5, loaded.SharePrice, 0.001);
            System.IO.File.Delete(path);
        }
    }
}
