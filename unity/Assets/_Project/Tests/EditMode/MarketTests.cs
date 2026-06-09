// 경쟁사·시장 점유율·전국 랭킹 파생 검증 (scoreboard-ranking.test.ts 케이스 이식).
using System.IO;
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MarketTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void NewGame_InitialCompetitors_OnlyEntered()
        {
            var ctx = SimulationContext.Create(Catalog());
            Assert.AreEqual(8, ctx.Model.CompetitorStates.Count, "월1 시작 경쟁사는 진입월<=1인 8사여야 한다.");
        }

        [Test]
        public void PlayerMarketShare_WithinZeroToHundred()
        {
            var ctx = SimulationContext.Create(Catalog());
            int share = ctx.Market.PlayerMarketShare();
            Assert.GreaterOrEqual(share, 0);
            Assert.LessOrEqual(share, 100);
        }

        [Test]
        public void NationalRanking_RankWithinField()
        {
            var ctx = SimulationContext.Create(Catalog());
            var nr = ScoreboardRanking.DeriveNationalRanking(ctx.Market, ctx.Model);
            Assert.GreaterOrEqual(nr.rank, 1);
            Assert.LessOrEqual(nr.rank, nr.total);
            Assert.GreaterOrEqual(nr.total, 2140);
        }

        [Test]
        public void StrongerPlayer_RanksBetter()
        {
            var weak = SimulationContext.Create(Catalog());
            int weakRank = ScoreboardRanking.DeriveNationalRanking(weak.Market, weak.Model).rank;

            var strong = SimulationContext.Create(Catalog());
            strong.Model.Users = 500000;
            strong.Model.Hype = 200;
            strong.Model.Trust = 100;
            strong.Model.Automation = 50;
            strong.Model.ActiveProducts.Add("foundation_model_v0");
            strong.Model.Capabilities["language"] = 5;
            int strongRank = ScoreboardRanking.DeriveNationalRanking(strong.Market, strong.Model).rank;

            Assert.Less(strongRank, weakRank, "강한 플레이어가 더 좋은(낮은) 순위여야 한다.");
        }

        [Test]
        public void AdvanceMonth_PushesMarketShareHistory()
        {
            var ctx = SimulationContext.Create(Catalog());
            int before = ctx.Model.MarketShareHistory.Count;
            ctx.Month.AdvanceMonth();
            Assert.AreEqual(before + 1, ctx.Model.MarketShareHistory.Count);
        }

        [Test]
        public void AnnualChallenger_EntersAtMonth12()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Cash = 9999999; // 게임오버로 멈추지 않게
            int initial = ctx.Model.CompetitorStates.Count;
            for (int i = 0; i < 12; i++)
            {
                ctx.Month.AdvanceMonth();
            }

            Assert.Greater(ctx.Model.CompetitorStates.Count, initial, "12월 도전자 진입으로 경쟁사 수가 늘어야 한다.");
        }

        [Test]
        public void Marquee_HasRivalAndShareLines()
        {
            var ctx = SimulationContext.Create(Catalog());
            var marquee = ScoreboardRanking.BuildScoreboardMarquee(ctx.Market, ctx.Model, ctx.Catalog);
            Assert.Greater(marquee.Count, 0);
            Assert.IsTrue(marquee.Exists(line => line.Contains("전국 점유율")));
            Assert.IsTrue(marquee.Exists(line => line.Contains("라이벌")));
        }

        [Test]
        public void Save_RoundTrips_CompetitorStates()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Month.AdvanceMonth();
            var path = Path.Combine(Application.temporaryCachePath, "market_test_save.json");
            var save = new SaveService(path);
            save.Save(ctx.Model);

            var loaded = SimulationContext.Create(Catalog());
            Assert.IsTrue(save.Load(loaded.Model));
            Assert.AreEqual(ctx.Model.CompetitorStates.Count, loaded.Model.CompetitorStates.Count);
            Assert.AreEqual(ctx.Model.MarketShareHistory.Count, loaded.Model.MarketShareHistory.Count);
            save.Delete();
        }
    }
}
