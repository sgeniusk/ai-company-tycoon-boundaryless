// 오피스 깊이 배치 순수 계산 — 밴드 원근 단조성 + 인원 분배 검증.
using NUnit.Framework;
using UnityEngine;
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

        [Test]
        public void GridPlan_CountAndBounds()
        {
            for (int n = 0; n <= 10; n++)
            {
                var slots = OfficeLayout.GridPlan(n);
                Assert.AreEqual(n, slots.Length, "count=" + n);
                foreach (var s in slots)
                {
                    Assert.GreaterOrEqual(s.XNorm, 0.02f, "n=" + n + " 왼쪽 화면 밖");
                    Assert.LessOrEqual(s.XNorm, 0.98f, "n=" + n + " 오른쪽 화면 밖");
                    Assert.Greater(s.Scale, 0f);
                    Assert.LessOrEqual(s.Scale, 1f);
                }
            }
        }

        [Test]
        public void GridPlan_NoHorizontalOverlapWithinRow()
        {
            // 같은 줄(footY 동일) 안에서 이웃 슬롯 간격이 footprint(스케일 반영)보다 커야 겹치지 않는다.
            for (int n = 1; n <= 10; n++)
            {
                var slots = OfficeLayout.GridPlan(n);
                for (int a = 0; a < slots.Length; a++)
                    for (int b = a + 1; b < slots.Length; b++)
                    {
                        if (Mathf.Abs(slots[a].FootY - slots[b].FootY) > 0.5f) continue; // 다른 줄
                        float gap = Mathf.Abs(slots[a].XNorm - slots[b].XNorm);
                        float footprint = OfficeLayout.FootprintWidthNorm * slots[a].Scale;
                        Assert.GreaterOrEqual(gap, footprint - 0.001f, "n=" + n + " 같은 줄 겹침 a=" + a + " b=" + b);
                    }
            }
        }

        [Test]
        public void GridPlan_DepthRecedes_AndAutoFrameShrinks()
        {
            // 뒤로 갈수록(footY 큼) 스케일이 작거나 같다(원근).
            var s8 = OfficeLayout.GridPlan(8);
            for (int i = 0; i < s8.Length; i++)
                for (int j = 0; j < s8.Length; j++)
                    if (s8[i].FootY < s8[j].FootY) Assert.GreaterOrEqual(s8[i].Scale, s8[j].Scale);
            // auto-frame — 인원이 많은(열이 많은) 쪽 앞줄 스케일이 적은 쪽보다 작거나 같다.
            float front3 = FrontScale(OfficeLayout.GridPlan(3));
            float front10 = FrontScale(OfficeLayout.GridPlan(10));
            Assert.LessOrEqual(front10, front3, "인원이 늘면 앞줄도 셀에 맞춰 작아진다");
            // 맨 앞줄 플래그는 최소 footY 슬롯에만.
            var s = OfficeLayout.GridPlan(6);
            float minFoot = float.MaxValue;
            foreach (var x in s) if (x.FootY < minFoot) minFoot = x.FootY;
            foreach (var x in s) Assert.AreEqual(Mathf.Abs(x.FootY - minFoot) < 0.5f, x.Front, "Front 플래그는 맨 앞줄만");
        }

        static float FrontScale(OfficeLayout.Slot[] slots)
        {
            float minFoot = float.MaxValue, scale = 0f;
            foreach (var s in slots) if (s.FootY < minFoot) { minFoot = s.FootY; scale = s.Scale; }
            return scale;
        }
    }
}
