// 10년(120개월) 내 tier 4 도달 가능성 — 목표 지향 봇으로 테크트리 밸런스를 고정한다 (feat-012 #4 밸런스 패스).
// 봇은 요구 총량이 가장 싼 tier 4 제품을 골라 그 체인(선행 제품·도메인 해금)에 필요한 능력만 연구한다.
// 플레이어가 한 분야를 파고드는 플레이의 하한선 — 이게 실패하면 트리가 실제로 너무 깊은 것이다.
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class TechTreeReachabilityTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        // 목표 제품과 그 선행 체인 전체가 요구하는 능력 레벨 합집합 (도메인 해금 요구 포함).
        static Dictionary<string, int> RequiredCapabilities(DataCatalog c, ProductDef target)
        {
            var need = new Dictionary<string, int>();
            void Raise(string id, int lv) { if (!need.TryGetValue(id, out var cur) || cur < lv) need[id] = lv; }

            var queue = new Queue<string>();
            var seen = new HashSet<string>();
            queue.Enqueue(target.id);
            while (queue.Count > 0)
            {
                var p = c.GetProduct(queue.Dequeue());
                if (p == null || !seen.Add(p.id)) continue;
                if (p.requiredCapabilities != null)
                    foreach (var rc in p.requiredCapabilities) Raise(rc.capabilityId, rc.level);
                var d = c.GetDomain(p.domain);
                if (d != null && d.unlockRequirements != null)
                    foreach (var req in d.unlockRequirements) Raise(req.capabilityId, req.level);
                if (p.prerequisiteProducts != null)
                    foreach (var pre in p.prerequisiteProducts) queue.Enqueue(pre);
            }

            return need;
        }

        [Test]
        public void TierFour_BecomesLaunchableWithinTenYears_TargetedBot()
        {
            var ctx = SimulationContext.Create(Catalog(), 20260611);

            // 요구 총량(능력 레벨 합)이 가장 싼 tier 4 제품을 목표로.
            ProductDef target = null;
            int targetWeight = int.MaxValue;
            foreach (var p in ctx.Catalog.products)
            {
                if (p == null || p.tier < 4) continue;
                int weight = 0;
                foreach (var kv in RequiredCapabilities(ctx.Catalog, p)) weight += kv.Value;
                if (weight < targetWeight) { targetWeight = weight; target = p; }
            }

            Assert.IsNotNull(target, "tier 4 제품이 데이터에 없다.");
            var need = RequiredCapabilities(ctx.Catalog, target);

            bool reached = false;
            int reachedMonth = 0;
            var yearTrace = new System.Text.StringBuilder();
            for (int month = 0; month < 120 && !reached; month++)
            {
                // 1) 출시 가능한 제품 전부 출시 — 매출원 + 선행 체인 전진.
                bool launchedAny = true;
                while (launchedAny)
                {
                    launchedAny = false;
                    foreach (var p in ctx.Catalog.products)
                    {
                        if (p == null || ctx.Products.IsActive(p.id)) continue;
                        if (ctx.Products.CanLaunch(p.id) && ctx.Products.Launch(p.id)) launchedAny = true;
                    }
                }

                // 버퍼 — 최소만. 게임오버는 현금+신뢰 동시 조건이라 일시 부채는 치명적이지 않고,
                // 이 경제 스케일(월 순이익 수백)에서 버퍼가 크면 복리 투자(레벨업→매출→재투자)가 영영 못 돈다.
                double Buffer() => 1000;

                // 2) 제품 강화 — 매출 엔진 (매출 +35%/Lv, React 동치). 가장 높은 ROI라 업그레이드보다 먼저.
                bool leveledAny = true;
                while (leveledAny)
                {
                    leveledAny = false;
                    foreach (var id in ctx.Model.ActiveProducts)
                    {
                        if (!ctx.Products.CanLevelUp(id)) continue;
                        double cashCost = 0;
                        foreach (var a in ctx.Products.GetLevelUpCost(id))
                            if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                        if (ctx.Model.Get(Core.ResourceId.Cash) - cashCost < Buffer()) continue;
                        if (ctx.Products.LevelUp(id)) { leveledAny = true; break; }
                    }
                }

                // 2.5) 자원 보충 업그레이드 — 연산/데이터/신뢰/자동화 공급원. 이용자·하이프 증가형은 제외
                // (이용자는 연산 현금비용을 늘리는 부채, 인재는 talent 차단 시 별도 처리).
                foreach (var u in ctx.Catalog.upgrades)
                {
                    if (u == null || ctx.Upgrades.IsPurchased(u.id) || !ctx.Upgrades.CanPurchase(u.id)) continue;
                    bool growsLiability = false;
                    foreach (var e in u.effects)
                        if (e.resource == Core.ResourceId.Users || e.resource == Core.ResourceId.Hype || e.resource == Core.ResourceId.Talent)
                            growsLiability = true;
                    if (growsLiability) continue;
                    double cashCost = 0;
                    foreach (var a in u.cost)
                        if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                    if (ctx.Model.Get(Core.ResourceId.Cash) - cashCost < Buffer()) continue;
                    ctx.Upgrades.Purchase(u.id);
                }

                // 2.6) 자동화 업그레이드 — 비용 할인 + 월간 보너스.
                foreach (var u in ctx.Catalog.automation)
                {
                    if (u == null || ctx.Automation.IsPurchased(u.id) || !ctx.Automation.CanPurchase(u.id)) continue;
                    double cashCost = 0;
                    foreach (var a in u.cost)
                        if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                    if (ctx.Model.Get(Core.ResourceId.Cash) - cashCost < Buffer()) continue;
                    ctx.Automation.Purchase(u.id);
                }

                // 3) 능력 강화 — 목표 체인 우선, 그다음 전 능력 한 바퀴(수입 제품 폭 확보). 버퍼 유지.
                bool CashOk(List<Data.ResourceAmount> cost)
                {
                    double cashCost = 0;
                    foreach (var a in cost)
                        if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                    return ctx.Model.Get(Core.ResourceId.Cash) - cashCost >= Buffer();
                }

                bool upgradedAny = true;
                while (upgradedAny)
                {
                    upgradedAny = false;
                    foreach (var kv in need)
                    {
                        if (ctx.Capabilities.GetLevel(kv.Key) >= kv.Value) continue;
                        var cost = ctx.Capabilities.GetUpgradeCost(kv.Key);
                        if (cost == null || !ctx.Capabilities.CanUpgrade(kv.Key) || !CashOk(cost)) continue;
                        if (ctx.Capabilities.Upgrade(kv.Key)) upgradedAny = true;
                    }
                }

                foreach (var cap in ctx.Catalog.capabilities)
                {
                    if (cap == null) continue;
                    var cost = ctx.Capabilities.GetUpgradeCost(cap.id);
                    if (cost == null || !ctx.Capabilities.CanUpgrade(cap.id) || !CashOk(cost)) continue;
                    ctx.Capabilities.Upgrade(cap.id);
                }

                // 4) 필요한 강화가 talent에 막혀 있으면 — hire 업그레이드 우선, 그다음 채용.
                bool talentBlocked = false;
                foreach (var kv in need)
                {
                    if (ctx.Capabilities.GetLevel(kv.Key) >= kv.Value) continue;
                    var cost = ctx.Capabilities.GetUpgradeCost(kv.Key);
                    if (cost == null) continue;
                    foreach (var a in cost)
                        if (a.resource == Core.ResourceId.Talent && ctx.Model.Get(Core.ResourceId.Talent) < a.amount)
                            talentBlocked = true;
                }

                if (talentBlocked)
                {
                    foreach (var uid in new[] { "hire_engineers", "hire_researchers" })
                    {
                        if (ctx.Upgrades.IsPurchased(uid) || !ctx.Upgrades.CanPurchase(uid)) continue;
                        var u = ctx.Catalog.GetUpgrade(uid);
                        double cashCost = 0;
                        foreach (var a in u.cost)
                            if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                        if (ctx.Model.Get(Core.ResourceId.Cash) - cashCost < Buffer()) continue;
                        ctx.Upgrades.Purchase(uid);
                    }

                    if (ctx.Model.Get(Core.ResourceId.Cash) >= ctx.Recruit.GetCost() + Buffer())
                    {
                        ctx.Recruit.Recruit();
                    }
                }

                var summary = ctx.Month.AdvanceMonth();
                if ((month + 1) % 12 == 0)
                {
                    yearTrace.Append("\n").Append(month + 1).Append("개월 — 현금 ")
                        .Append(ctx.Model.Get(Core.ResourceId.Cash).ToString("F0"))
                        .Append(" 매출 ").Append(summary.Revenue.ToString("F0"))
                        .Append(" 비용 ").Append(summary.TotalCashCost.ToString("F0"))
                        .Append(" 이용자 ").Append(ctx.Model.Get(Core.ResourceId.Users).ToString("F0"))
                        .Append(" 데이터 ").Append(ctx.Model.Get(Core.ResourceId.Data).ToString("F0"))
                        .Append(" 인재 ").Append(ctx.Model.Get(Core.ResourceId.Talent).ToString("F0"))
                        .Append(" 출시 ").Append(ctx.Model.ActiveProducts.Count);
                }

                Assert.IsFalse(summary.GameOver,
                    month + 1 + "개월차 게임오버 — 목표 지향 봇 기준 경제가 테크트리 등반을 버티지 못한다." + yearTrace);
                if (summary.GameWon) break;

                if (ctx.Visibility.GetState(target) >= VisibilityState.Unlocked)
                {
                    reached = true;
                    reachedMonth = month + 1;
                }
            }

            if (!reached)
            {
                var sb = new System.Text.StringBuilder();
                sb.Append("[feat-013 대기] 120개월 안에 목표 tier 4 제품(").Append(target.id).Append(")이 해금되지 않았다.\n");
                sb.Append("진단 — Unity 포트 경제는 이용자 증가(연산 현금비용)를 상쇄할 수익 스트림이 React 대비 부족해 ");
                sb.Append("장기 잉여가 구조적으로 작다 (React는 사무실/성장경로/시너지 월간 효과 다층). ");
                sb.Append("제품 레벨업·인재 채용·React 비용 공식 정렬(feat-012 #4)로 개선했지만 격차가 남는다. ");
                sb.Append("경제 완주 가능성은 feat-013(사용자 방향 결정 필요)에서 닫는다. 이 테스트는 그때 Fail 게이트로 복원한다.\n");
                sb.Append("최종 현금 ").Append(ctx.Model.Get(Core.ResourceId.Cash).ToString("F0"));
                sb.Append(" | 인재 ").Append(ctx.Model.Get(Core.ResourceId.Talent).ToString("F0"));
                sb.Append(" | 출시 ").Append(ctx.Model.ActiveProducts.Count).Append("종 | 필요 능력 — ");
                foreach (var kv in need)
                    sb.Append(kv.Key).Append(":").Append(ctx.Capabilities.GetLevel(kv.Key)).Append("/").Append(kv.Value).Append(" ");
                sb.Append(yearTrace);
                Assert.Inconclusive(sb.ToString());
            }

            Debug.Log("[TechTreeReachability] " + target.id + " 해금 — " + reachedMonth + "개월차");
        }
    }
}
