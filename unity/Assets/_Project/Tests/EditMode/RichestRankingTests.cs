// 세계 부자 순위 + 지분 특별 결말 검증 (feat-015 #5).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class RichestRankingTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh() => SimulationContext.Create(Catalog());

        [Test]
        public void Richest_LowNetWorth_RanksNearBottom()
        {
            var ctx = Fresh();
            var entry = RichestRanking.Derive(ctx.Model, ctx.Equity);
            Assert.AreEqual(entry.total, entry.rank, "자산이 거의 없으면 꼴찌 부근.");
        }

        [Test]
        public void Richest_HugeNetWorth_ReachesNumberOne()
        {
            var ctx = Fresh();
            ctx.Model.IsPublic = true;
            ctx.Model.SharePrice = 100;
            ctx.Model.Set(ResourceId.Cash, RichestRanking.WorldTopWealth * 2); // 세계 1위 기준선 초과
            var entry = RichestRanking.Derive(ctx.Model, ctx.Equity);
            Assert.AreEqual(1, entry.rank, "세계 1위 자산을 넘으면 #1.");
        }

        [Test]
        public void Richest_RankImprovesAsWealthGrows()
        {
            var ctx = Fresh();
            ctx.Model.Set(ResourceId.Cash, 1_000_000);
            int poor = RichestRanking.Derive(ctx.Model, ctx.Equity).rank;
            ctx.Model.Set(ResourceId.Cash, 20_000_000);
            int rich = RichestRanking.Derive(ctx.Model, ctx.Equity).rank;
            Assert.Less(rich, poor, "자산이 늘면 순위(숫자)가 낮아져야 한다.");
        }

        [Test]
        public void Marquee_ShowsRichestRank_OnlyWhenPublic()
        {
            var ctx = Fresh();
            ctx.Market.InitStates();
            var pre = ScoreboardRanking.BuildScoreboardMarquee(ctx.Market, ctx.Model, ctx.Catalog, ctx.Equity);
            Assert.IsFalse(pre.Exists(s => s.Contains("세계 부자")), "미상장이면 부자 순위 미표시.");

            ctx.Model.IsPublic = true;
            ctx.Model.SharePrice = 100;
            var post = ScoreboardRanking.BuildScoreboardMarquee(ctx.Market, ctx.Model, ctx.Catalog, ctx.Equity);
            Assert.IsTrue(post.Exists(s => s.Contains("세계 부자")), "상장 후 부자 순위 표시.");
        }

        [Test]
        public void EquityEnding_LonelyKing_WhenPublicAndHighEquity()
        {
            var m = new GameModel { IsPublic = true, FounderEquity = 95 };
            var special = EquityEnding.Get(m);
            Assert.IsNotNull(special);
            Assert.AreEqual("고독한 제왕", special.Value.Title);
        }

        [Test]
        public void EquityEnding_Bootstrap_WhenNoLoanNoInvestors()
        {
            var m = new GameModel { IsPublic = false, FounderEquity = 100, LoanPrincipal = 0 };
            var special = EquityEnding.Get(m);
            Assert.IsNotNull(special);
            Assert.AreEqual("무차입 자수성가", special.Value.Title);
        }

        [Test]
        public void EquityEnding_SoldOut_WhenHalfEquityGone()
        {
            var m = new GameModel { IsPublic = false, FounderEquity = 45, LoanPrincipal = 3000 };
            var special = EquityEnding.Get(m);
            Assert.IsNotNull(special);
            Assert.AreEqual("지분의 대가", special.Value.Title);
        }
    }
}
