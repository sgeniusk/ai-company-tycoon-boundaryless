// 지분·밸류에이션 — 파생 공식, 지분 양도 불변식, 세이브 v7 (feat-015 #1).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EquityTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh() => SimulationContext.Create(Catalog());

        [Test]
        public void Valuation_FollowsFormula()
        {
            var ctx = Fresh();
            // 시작 — 매출 0, 이용자 0, 현금 10000 → 밸류에이션 10000.
            Assert.AreEqual(10000, ctx.Equity.GetValuation(), 0.001);

            Assert.IsTrue(ctx.Products.Launch("foundation_model_v0"));
            var def = ctx.Catalog.GetProduct("foundation_model_v0");
            double expected = def.baseRevenue * EquityService.RevenueMultiple + ctx.Model.Cash;
            Assert.AreEqual(expected, ctx.Equity.GetValuation(), 0.001,
                "출시 후 — 예상 월매출*배수 + 현금 (이용자 0).");
        }

        [Test]
        public void FounderNetWorth_ScalesWithEquity()
        {
            var ctx = Fresh();
            double full = ctx.Equity.GetFounderNetWorth();
            Assert.AreEqual(ctx.Equity.GetValuation(), full, 0.001, "지분 100%면 자산 = 회사 가치.");

            Assert.IsTrue(ctx.Equity.GrantEquity("엔젤 투자자", "angel", 25, 20000, ctx.Resources));
            Assert.AreEqual(75, ctx.Model.FounderEquity, 0.001);
            Assert.AreEqual(ctx.Equity.GetValuation() * 0.75, ctx.Equity.GetFounderNetWorth(), 0.001);
        }

        [Test]
        public void GrantEquity_KeepsInvariant_AndPaysCash()
        {
            var ctx = Fresh();
            double cashBefore = ctx.Model.Cash;
            Assert.IsTrue(ctx.Equity.GrantEquity("엔젤", "angel", 10, 8000, ctx.Resources));
            Assert.AreEqual(cashBefore + 8000, ctx.Model.Cash, 0.001);
            Assert.AreEqual(100, ctx.Model.FounderEquity + ctx.Equity.GetOutsideEquity(), 0.001, "지분 합 100 불변식");

            // 잔여 지분을 넘는 양도는 거부.
            Assert.IsFalse(ctx.Equity.GrantEquity("욕심쟁이", "angel", 95, 1, ctx.Resources));
            Assert.AreEqual(90, ctx.Model.FounderEquity, 0.001);
        }

        [Test]
        public void Interview_AngelChoice_GrantsEquityAndCash()
        {
            var ctx = Fresh();
            var steps = StartupInterview.GetSteps();
            Assert.AreEqual(3, steps.Count, "개업 인터뷰는 3장이다 (엔젤/공동창업/은행).");

            double cashBefore = ctx.Model.Cash;
            steps[0].Choices.Find(c => c.Id == "big").Apply(ctx);
            Assert.AreEqual(75, ctx.Model.FounderEquity, 0.001);
            Assert.AreEqual(cashBefore + 20000, ctx.Model.Cash, 0.001);
        }

        [Test]
        public void Interview_CofounderChoice_AddsTalentForEquity()
        {
            var ctx = Fresh();
            double talentBefore = ctx.Model.Talent;
            StartupInterview.GetSteps()[1].Choices.Find(c => c.Id == "accept").Apply(ctx);
            Assert.AreEqual(95, ctx.Model.FounderEquity, 0.001);
            Assert.AreEqual(talentBefore + 1, ctx.Model.Talent, 0.001);
        }

        [Test]
        public void Interview_BankLoan_AddsCash_AndMonthlyInterest()
        {
            var baseline = Fresh();
            var loaned = Fresh();
            StartupInterview.GetSteps()[2].Choices.Find(c => c.Id == "take").Apply(loaned);
            Assert.AreEqual(StartupInterview.LoanOfferAmount, loaned.Model.LoanPrincipal, 0.001);
            Assert.AreEqual(baseline.Model.Cash + StartupInterview.LoanOfferAmount, loaned.Model.Cash, 0.001);

            var sBase = baseline.Month.AdvanceMonth();
            var sLoaned = loaned.Month.AdvanceMonth();
            Assert.AreEqual(StartupInterview.LoanOfferAmount * 0.015, sLoaned.TotalCashCost - sBase.TotalCashCost, 0.001,
                "대출 원금의 월 1.5%가 고정비에 붙어야 한다.");
        }

        [Test]
        public void Loan_BorrowWithinLimit_AndRepay()
        {
            var ctx = Fresh();
            // 매출 0 — 한도는 최소 보장(4000).
            Assert.AreEqual(LoanService.MinLimit, ctx.Loan.GetLimit(), 0.001);
            Assert.IsFalse(ctx.Loan.CanBorrow(5000), "한도 초과 대출은 거부.");

            double cashBefore = ctx.Model.Cash;
            Assert.IsTrue(ctx.Loan.Borrow(3000));
            Assert.AreEqual(3000, ctx.Model.LoanPrincipal, 0.001);
            Assert.AreEqual(cashBefore + 3000, ctx.Model.Cash, 0.001);
            Assert.AreEqual(1000, ctx.Loan.GetAvailable(), 0.001);

            Assert.IsTrue(ctx.Loan.Repay(2000));
            Assert.AreEqual(1000, ctx.Model.LoanPrincipal, 0.001);
            Assert.AreEqual(cashBefore + 1000, ctx.Model.Cash, 0.001);
        }

        [Test]
        public void Loan_LimitGrowsWithRevenue()
        {
            var ctx = Fresh();
            ctx.Model.Set(ResourceId.Compute, 1e9);
            ctx.Model.Set(ResourceId.Data, 1e9);
            ctx.Model.Set(ResourceId.Cash, 1e9);
            Assert.IsTrue(ctx.Products.Launch("foundation_model_v0"));
            double expected = ctx.Products.EstimateMonthlyRevenue() * LoanService.RevenueLimitMultiple;
            Assert.AreEqual(expected, ctx.Loan.GetLimit(), 0.001, "한도는 예상 월매출*6.");
        }

        [Test]
        public void Funding_OfferOnStage_PricesByValuation_OneShot()
        {
            var ctx = Fresh();
            // seed_startup 라운드 — 지분 8%, 현금 = 밸류에이션*8%.
            var offer = ctx.Funding.GetOffer("seed_startup");
            Assert.IsNotNull(offer);
            Assert.AreEqual(8, offer.EquityPercent, 0.001);
            Assert.AreEqual(System.Math.Round(ctx.Equity.GetValuation() * 0.08), offer.CashIn, 0.001);

            double cashBefore = ctx.Model.Cash;
            Assert.IsTrue(ctx.Funding.Accept(offer, ctx.Resources));
            Assert.AreEqual(92, ctx.Model.FounderEquity, 0.001);
            Assert.AreEqual(cashBefore + offer.CashIn, ctx.Model.Cash, 0.001);

            // 일회성 — 같은 성급은 다시 제안 안 함.
            Assert.IsNull(ctx.Funding.GetOffer("seed_startup"));
        }

        [Test]
        public void Funding_Decline_StillMarksOffered()
        {
            var ctx = Fresh();
            var offer = ctx.Funding.GetOffer("viral_app_company");
            Assert.IsNotNull(offer);
            ctx.Funding.Decline(offer);
            Assert.AreEqual(100, ctx.Model.FounderEquity, 0.001, "거절은 지분 불변.");
            Assert.IsNull(ctx.Funding.GetOffer("viral_app_company"), "거절해도 일회성.");
        }

        [Test]
        public void Funding_SaveRoundTrip()
        {
            var ctx = Fresh();
            ctx.Funding.MarkOffered("seed_startup");
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-funding-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.Contains("seed_startup", loaded.InvestmentRoundsOffered);
            System.IO.File.Delete(path);
        }

        [Test]
        public void Loan_SaveRoundTrip()
        {
            var ctx = Fresh();
            ctx.Model.LoanPrincipal = 6000;
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-loan-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.AreEqual(6000, loaded.LoanPrincipal, 0.001);
            System.IO.File.Delete(path);
        }

        [Test]
        public void Equity_SaveRoundTrip_AndLegacyDefaults100()
        {
            var ctx = Fresh();
            ctx.Equity.GrantEquity("공동창업자", "cofounder", 5, 0, ctx.Resources);
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-equity-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.AreEqual(95, loaded.FounderEquity, 0.001);
            Assert.AreEqual(1, loaded.Shareholders.Count);
            Assert.AreEqual("공동창업자", loaded.Shareholders[0].name);
            System.IO.File.Delete(path);

            // 구세이브(v6 이하 — founderEquity 필드 없음 = 0) → 100% 마이그레이션.
            var legacy = new Save.SaveData { founderEquity = 0 };
            System.IO.File.WriteAllText(path, JsonUtility.ToJson(legacy));
            var migrated = new GameModel();
            Assert.IsTrue(new Save.SaveService(path).Load(migrated));
            Assert.AreEqual(100, migrated.FounderEquity, 0.001);
            System.IO.File.Delete(path);
        }
    }
}
