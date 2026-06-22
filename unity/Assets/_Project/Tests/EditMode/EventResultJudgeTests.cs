// 이벤트 선택 효과 합 부호로 결과 톤을 판정하는 헬퍼의 테스트.
using NUnit.Framework;
using System.Collections.Generic;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EventResultJudgeTests
    {
        static EventChoice Choice(params (ResourceId, double)[] effs)
        {
            var c = new EventChoice();
            foreach (var (r, a) in effs)
                c.effects.Add(new ResourceAmount { resource = r, amount = a });
            return c;
        }

        [Test]
        public void PositiveSum_IsPositive()
        {
            var c = Choice((ResourceId.Cash, 1000), (ResourceId.Trust, -1));
            Assert.AreEqual(EventResultTone.Positive, EventResultJudge.Judge(c));
        }

        [Test]
        public void NegativeSum_IsNegative()
        {
            var c = Choice((ResourceId.Cash, -500));
            Assert.AreEqual(EventResultTone.Negative, EventResultJudge.Judge(c));
        }

        [Test]
        public void ZeroOrEmpty_IsNeutral()
        {
            Assert.AreEqual(EventResultTone.Neutral, EventResultJudge.Judge(Choice()));
            Assert.AreEqual(EventResultTone.Neutral, EventResultJudge.Judge(null));
        }
    }
}
