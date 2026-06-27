// 월 정산 결과를 오피스 분위 4분위로 판정하는 헬퍼의 테스트. 순익(Revenue-TotalCashCost)·승급·경고·성장 신호.
using NUnit.Framework;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MonthMoodJudgeTests
    {
        static MonthSummary S(double rev, double cost, double users = 0, string stage = null, params string[] warnings)
        {
            var s = new MonthSummary { Revenue = rev, TotalCashCost = cost, NewUsers = users, StageChangedTo = stage };
            if (warnings != null)
                foreach (var w in warnings) s.Warnings.Add(w);
            return s;
        }

        [Test]
        public void BigProfit_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(20000, 5000)));
        }

        [Test]
        public void Promotion_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(3000, 2000, stage: "office_datacenter")));
        }

        [Test]
        public void BigUserGrowth_IsGreat()
        {
            Assert.AreEqual(MonthMood.Great, MonthMoodJudge.Judge(S(3000, 2000, users: 90000)));
        }

        [Test]
        public void SmallProfit_IsGood()
        {
            Assert.AreEqual(MonthMood.Good, MonthMoodJudge.Judge(S(3000, 2000)));
        }

        [Test]
        public void BreakEven_IsFlat()
        {
            Assert.AreEqual(MonthMood.Flat, MonthMoodJudge.Judge(S(2000, 2000)));
        }

        [Test]
        public void Loss_IsBad()
        {
            Assert.AreEqual(MonthMood.Bad, MonthMoodJudge.Judge(S(1000, 4000)));
        }

        [Test]
        public void Warning_IsBad()
        {
            Assert.AreEqual(MonthMood.Bad, MonthMoodJudge.Judge(S(9000, 1000, warnings: "현금 부족 경고")));
        }

        [Test]
        public void Null_IsFlat()
        {
            Assert.AreEqual(MonthMood.Flat, MonthMoodJudge.Judge(null));
        }
    }
}
