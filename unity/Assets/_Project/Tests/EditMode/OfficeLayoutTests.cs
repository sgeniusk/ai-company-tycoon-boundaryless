// 오피스 깊이 배치 순수 계산 — 밴드 원근 단조성 + 인원 분배 검증.
using NUnit.Framework;
using AICompanyTycoon.UI;

namespace AICompanyTycoon.Tests.EditMode
{
    public class OfficeLayoutTests
    {
        [Test]
        public void Band_DepthIsMonotonic()
        {
            var f = OfficeLayout.Band(0);
            var m = OfficeLayout.Band(1);
            var b = OfficeLayout.Band(2);
            // 뒤로 갈수록 footY 증가(위)·scale 감소(작게).
            Assert.Less(f.footY, m.footY);
            Assert.Less(m.footY, b.footY);
            Assert.Greater(f.scale, m.scale);
            Assert.Greater(m.scale, b.scale);
        }

        [Test]
        public void RowPlan_SumsToCount()
        {
            for (int n = 0; n <= 10; n++)
            {
                var plan = OfficeLayout.RowPlan(n);
                int sum = 0;
                foreach (var r in plan) sum += r;
                Assert.AreEqual(n, sum, "count=" + n);
            }
        }

        [Test]
        public void RowPlan_SmallCounts()
        {
            CollectionAssert.AreEqual(new int[0], OfficeLayout.RowPlan(0));
            CollectionAssert.AreEqual(new[] { 1 }, OfficeLayout.RowPlan(1));
            CollectionAssert.AreEqual(new[] { 2 }, OfficeLayout.RowPlan(2));
            CollectionAssert.AreEqual(new[] { 2, 1 }, OfficeLayout.RowPlan(3));
            CollectionAssert.AreEqual(new[] { 2, 2 }, OfficeLayout.RowPlan(4));
        }

        [Test]
        public void RowPlan_DepthAppearsAndFrontWeighted()
        {
            // count>=3 이면 밴드 2개 이상(깊이), count>=5 이면 3밴드.
            Assert.GreaterOrEqual(OfficeLayout.RowPlan(3).Length, 2);
            Assert.AreEqual(3, OfficeLayout.RowPlan(5).Length);
            Assert.AreEqual(3, OfficeLayout.RowPlan(10).Length);
            // 앞쪽가중 — 앞 밴드 >= 뒷 밴드.
            for (int n = 1; n <= 10; n++)
            {
                var plan = OfficeLayout.RowPlan(n);
                for (int i = 1; i < plan.Length; i++)
                    Assert.GreaterOrEqual(plan[i - 1], plan[i], "n=" + n + " i=" + i);
            }
            // 각 밴드 <= 4 (앞 밴드는 count=10 일 때만 4).
            CollectionAssert.AreEqual(new[] { 4, 3, 3 }, OfficeLayout.RowPlan(10));
        }
    }
}
