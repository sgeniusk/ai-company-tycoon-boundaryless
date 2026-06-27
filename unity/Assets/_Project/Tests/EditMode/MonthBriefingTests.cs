// 월 정산 결과를 브리핑 카드 표시 모델로 변환하는 헬퍼의 테스트. 순익·조건부 행·분위.
using NUnit.Framework;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MonthBriefingTests
    {
        static MonthSummary S(double rev, double cost, double users = 0, string stage = null, string worldEvent = null, string warning = null)
        {
            var s = new MonthSummary { Month = 3, Revenue = rev, TotalCashCost = cost, BaseCost = 3000, SalaryCost = 4200, ComputeCost = 1800, NewUsers = users, DataGenerated = 1240, StageChangedTo = stage };
            if (worldEvent != null) s.WorldEventTitles.Add(worldEvent);
            if (warning != null) s.Warnings.Add(warning);
            return s;
        }

        [Test]
        public void Net_IsRevenueMinusCost()
        {
            var v = MonthBriefing.Build(S(24500, 9000));
            Assert.AreEqual(15500, v.Net, 0.001);
        }

        [Test]
        public void Loss_NetNegative()
        {
            var v = MonthBriefing.Build(S(1000, 4000));
            Assert.Less(v.Net, 0);
        }

        [Test]
        public void Mood_MatchesJudge()
        {
            var s = S(24500, 9000);
            Assert.AreEqual(MonthMoodJudge.Judge(s), MonthBriefing.Build(s).Mood);
        }

        [Test]
        public void WorldEventFlag_OnlyWhenPresent()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).HasWorldEvent);
            var v = MonthBriefing.Build(S(5000, 3000, worldEvent: "에이전틱 붐"));
            Assert.IsTrue(v.HasWorldEvent);
            Assert.AreEqual("에이전틱 붐", v.WorldEventText);
        }

        [Test]
        public void WarningFlag_OnlyWhenPresent()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).HasWarning);
            var v = MonthBriefing.Build(S(1000, 9000, warning: "현금 부족"));
            Assert.IsTrue(v.HasWarning);
            Assert.AreEqual("현금 부족", v.WarningText);
        }

        [Test]
        public void PromotedFlag_OnlyWhenStageChanged()
        {
            Assert.IsFalse(MonthBriefing.Build(S(5000, 3000)).Promoted);
            Assert.IsTrue(MonthBriefing.Build(S(5000, 3000, stage: "office_datacenter")).Promoted);
        }

        [Test]
        public void Null_SafeDefaults()
        {
            var v = MonthBriefing.Build(null);
            Assert.AreEqual(0, v.Net, 0.001);
            Assert.IsFalse(v.HasWorldEvent);
        }
    }
}
