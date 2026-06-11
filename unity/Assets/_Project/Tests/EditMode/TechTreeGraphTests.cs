// 테크트리 그래프 무결성 — 선행 사이클·미존재 참조·tier 단조성·전 제품 도달 가능성 (feat-012 #3 검증 게이트).
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Tests.EditMode
{
    public class TechTreeGraphTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void PrerequisiteIds_AllExist()
        {
            var c = Catalog();
            var ids = new HashSet<string>();
            foreach (var p in c.products)
                if (p != null) ids.Add(p.id);

            foreach (var p in c.products)
            {
                if (p == null || p.prerequisiteProducts == null) continue;
                foreach (var pre in p.prerequisiteProducts)
                {
                    Assert.IsTrue(ids.Contains(pre), p.id + "의 선행 제품 '" + pre + "'가 카탈로그에 없다.");
                    Assert.AreNotEqual(p.id, pre, p.id + "가 자기 자신을 선행으로 참조한다.");
                }
            }
        }

        [Test]
        public void PrerequisiteGraph_HasNoCycles()
        {
            var c = Catalog();
            var graph = new Dictionary<string, List<string>>();
            foreach (var p in c.products)
                if (p != null) graph[p.id] = p.prerequisiteProducts ?? new List<string>();

            // 0 미방문 / 1 방문 중 / 2 완료 — 방문 중 재진입이면 사이클.
            var state = new Dictionary<string, int>();
            bool Visit(string id)
            {
                if (!graph.ContainsKey(id)) return true;
                if (state.TryGetValue(id, out var s)) return s != 1;
                state[id] = 1;
                foreach (var pre in graph[id])
                    if (!Visit(pre)) return false;
                state[id] = 2;
                return true;
            }

            foreach (var id in graph.Keys)
                Assert.IsTrue(Visit(id), "선행 그래프에 사이클 — " + id + " 경유.");
        }

        [Test]
        public void TierMonotonic_PrerequisiteTierNotHigher()
        {
            var c = Catalog();
            var tiers = new Dictionary<string, int>();
            foreach (var p in c.products)
                if (p != null) tiers[p.id] = p.tier;

            foreach (var p in c.products)
            {
                if (p == null || p.prerequisiteProducts == null) continue;
                Assert.That(p.tier, Is.InRange(1, 4), p.id + " tier 범위 위반.");
                foreach (var pre in p.prerequisiteProducts)
                    if (tiers.TryGetValue(pre, out var preTier))
                        Assert.LessOrEqual(preTier, p.tier,
                            p.id + "(T" + p.tier + ")의 선행 " + pre + "(T" + preTier + ")가 더 깊다 — tier 단조성 위반.");
            }
        }

        [Test]
        public void AllProducts_ReachableAtMaxCapabilities()
        {
            var c = Catalog();

            // 능력 전부 max — 요구 능력이 max를 넘으면 그 자체로 도달 불가.
            var maxLevels = new Dictionary<string, int>();
            foreach (var cap in c.capabilities)
                if (cap != null) maxLevels[cap.id] = cap.maxLevel;

            // 도메인 — max 능력으로 전부 해금 가능해야 한다.
            foreach (var d in c.domains)
            {
                if (d == null || d.unlockedByDefault) continue;
                foreach (var req in d.unlockRequirements)
                {
                    Assert.IsTrue(maxLevels.TryGetValue(req.capabilityId, out var max),
                        d.id + " 해금 요구 능력 '" + req.capabilityId + "'가 없다.");
                    Assert.LessOrEqual(req.level, max,
                        d.id + " 해금 요구 " + req.capabilityId + " Lv." + req.level + "이 max(" + max + ")를 넘는다.");
                }
            }

            // 제품 — 능력 요건 충족 가능 + 선행 체인 고정점 반복으로 전부 출시 가능해야 한다.
            var launched = new HashSet<string>();
            var remaining = new List<ProductDef>();
            foreach (var p in c.products)
            {
                if (p == null) continue;
                if (p.requiredCapabilities != null)
                {
                    foreach (var rc in p.requiredCapabilities)
                    {
                        Assert.IsTrue(maxLevels.TryGetValue(rc.capabilityId, out var max),
                            p.id + " 요구 능력 '" + rc.capabilityId + "'가 없다.");
                        Assert.LessOrEqual(rc.level, max,
                            p.id + " 요구 " + rc.capabilityId + " Lv." + rc.level + "이 max(" + max + ")를 넘는다.");
                    }
                }

                remaining.Add(p);
            }

            bool progressed = true;
            while (progressed)
            {
                progressed = false;
                for (int i = remaining.Count - 1; i >= 0; i--)
                {
                    var p = remaining[i];
                    bool ready = true;
                    if (p.prerequisiteProducts != null)
                        foreach (var pre in p.prerequisiteProducts)
                            if (!launched.Contains(pre)) { ready = false; break; }
                    if (!ready) continue;
                    launched.Add(p.id);
                    remaining.RemoveAt(i);
                    progressed = true;
                }
            }

            var stuck = new List<string>();
            foreach (var p in remaining) stuck.Add(p.id);
            Assert.AreEqual(0, remaining.Count, "선행 체인으로 영원히 출시 불가 — " + string.Join(", ", stuck));
        }
    }
}
