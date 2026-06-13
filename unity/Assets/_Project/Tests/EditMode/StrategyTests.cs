// 전략 활동 — 마케팅·경쟁사 견제 효과, 쿨다운, 세이브 (feat-014 #4).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class StrategyTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Market.InitStates();
            ctx.Model.Set(ResourceId.Cash, 100000);
            return ctx;
        }

        [Test]
        public void Marketing_RaisesHypeAndUsers_AndCosts()
        {
            var ctx = Fresh();
            double cash = ctx.Model.Cash, hype = ctx.Model.Hype, users = ctx.Model.Users;
            Assert.IsTrue(ctx.Strategy.Run(StrategyService.Marketing));
            Assert.AreEqual(cash - StrategyService.MarketingCost, ctx.Model.Cash, 0.001);
            Assert.AreEqual(hype + StrategyService.MarketingHype, ctx.Model.Hype, 0.001);
            Assert.AreEqual(users + StrategyService.MarketingUsers, ctx.Model.Users, 0.001);
        }

        [Test]
        public void Sabotage_CutsTopRivalScore_AtTrustCost()
        {
            var ctx = Fresh();
            var rival = ctx.Strategy.TopRival();
            Assert.IsNotNull(rival, "경쟁사가 있어야 한다.");
            double rivalScoreBefore = rival.score;
            double trustBefore = ctx.Model.Trust;

            Assert.IsTrue(ctx.Strategy.Run(StrategyService.Sabotage));
            Assert.Less(rival.score, rivalScoreBefore, "라이벌 점수가 깎여야 한다.");
            Assert.AreEqual(trustBefore - StrategyService.SabotageTrustHit, ctx.Model.Trust, 0.001);
        }

        [Test]
        public void Cooldown_BlocksReuse_UntilMonthsPass()
        {
            var ctx = Fresh();
            Assert.IsTrue(ctx.Strategy.Run(StrategyService.Marketing));
            Assert.AreEqual(StrategyService.CooldownMonths, ctx.Strategy.GetCooldownRemaining(StrategyService.Marketing));
            Assert.IsFalse(ctx.Strategy.CanRun(StrategyService.Marketing), "쿨다운 중엔 재사용 불가.");
            StringAssert.Contains("재사용 대기", ctx.Strategy.GetLockReason(StrategyService.Marketing));

            // 쿨다운만큼 월을 넘기면 다시 가능.
            ctx.Model.CurrentMonth += StrategyService.CooldownMonths;
            Assert.AreEqual(0, ctx.Strategy.GetCooldownRemaining(StrategyService.Marketing));
            Assert.IsTrue(ctx.Strategy.CanRun(StrategyService.Marketing));
        }

        [Test]
        public void Run_Blocked_WhenCashInsufficient()
        {
            var ctx = Fresh();
            ctx.Model.Set(ResourceId.Cash, 100);
            Assert.IsFalse(ctx.Strategy.CanRun(StrategyService.Marketing));
            StringAssert.Contains("자금", ctx.Strategy.GetLockReason(StrategyService.Marketing));
        }

        [Test]
        public void Cooldown_SaveRoundTrip()
        {
            var ctx = Fresh();
            ctx.Strategy.Run(StrategyService.Sabotage);
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-strategy-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.AreEqual(1, loaded.StrategyCooldowns.Count);
            Assert.AreEqual(StrategyService.Sabotage, loaded.StrategyCooldowns[0].id);
            System.IO.File.Delete(path);
        }
    }
}
