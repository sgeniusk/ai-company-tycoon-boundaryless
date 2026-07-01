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
        public void PodPlan_CountAndBounds()
        {
            for (int n = 0; n <= 10; n++)
            {
                var slots = OfficeLayout.PodPlan(n);
                Assert.AreEqual(n, slots.Length, "count=" + n);
                foreach (var s in slots)
                {
                    // footprint 반영해도 화면 밖으로 넘지 않아야(잘림 방지).
                    float half = OfficeLayout.FootprintWidthNorm * s.Scale * 0.5f;
                    Assert.GreaterOrEqual(s.XNorm - half, 0.0f, "n=" + n + " 왼쪽 화면 밖");
                    Assert.LessOrEqual(s.XNorm + half, 1.0f, "n=" + n + " 오른쪽 화면 밖");
                    Assert.Greater(s.Scale, 0f);
                    Assert.LessOrEqual(s.Scale, 1f);
                }
            }
        }

        [Test]
        public void PodPlan_NoHorizontalOverlapWithinTier()
        {
            // 같은 깊이 티어(footY 근접) 안에서만 가로 겹침을 금지한다. 깊이 겹침(뒷 티어가 앞 티어 뒤)은 원근으로 자연스럽다.
            var slots = OfficeLayout.PodPlan(10); // 전체가 겹치지 않으면 부분집합도 안 겹친다
            for (int a = 0; a < slots.Length; a++)
                for (int b = a + 1; b < slots.Length; b++)
                {
                    if (Mathf.Abs(slots[a].FootY - slots[b].FootY) > 40f) continue; // 다른 티어
                    float gap = Mathf.Abs(slots[a].XNorm - slots[b].XNorm);
                    float footprint = OfficeLayout.FootprintWidthNorm * Mathf.Max(slots[a].Scale, slots[b].Scale);
                    Assert.GreaterOrEqual(gap, footprint - 0.001f, "같은 티어 가로 겹침 a=" + a + " b=" + b);
                }
        }

        [Test]
        public void PodPlan_IsAsymmetric_NotCenteredGrid()
        {
            // 인위적 대칭 격자 탈피 — 앞 티어 두 책상이 중앙 거울대칭(합=1.0)이 아니어야 한다.
            var slots = OfficeLayout.PodPlan(2);
            float mirrorSum = slots[0].XNorm + slots[1].XNorm;
            Assert.Greater(Mathf.Abs(mirrorSum - 1.0f), 0.03f, "앞 티어가 거울대칭이면 격자처럼 인위적");
            // 성장 순서 안정 — PodPlan(n)은 PodPlan(n+1)의 접두사.
            var s3 = OfficeLayout.PodPlan(3);
            var s4 = OfficeLayout.PodPlan(4);
            for (int i = 0; i < 3; i++) Assert.AreEqual(s3[i].XNorm, s4[i].XNorm, 0.0001f, "성장은 접두사 확장이어야 안정적");
        }

        [Test]
        public void PodPlan_FrontFlagOnFrontTierOnly()
        {
            var s = OfficeLayout.PodPlan(6);
            float minFoot = float.MaxValue;
            foreach (var x in s) if (x.FootY < minFoot) minFoot = x.FootY;
            foreach (var x in s) Assert.AreEqual(x.FootY - minFoot < 40f, x.Front, "Front 플래그는 맨 앞 티어만");
        }
    }
}
