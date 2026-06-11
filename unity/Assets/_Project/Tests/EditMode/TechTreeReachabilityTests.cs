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
            var eventRng = new SeededRng(777); // 이벤트 발동 롤 — 결정론 (실플레이 동치)
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

                double CashCostOf(List<Data.ResourceAmount> cost)
                {
                    double cashCost = 0;
                    foreach (var a in cost)
                        if (a.resource == Core.ResourceId.Cash) cashCost = a.amount;
                    return cashCost;
                }

                bool CashOk(List<Data.ResourceAmount> cost)
                    => ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(cost) >= Buffer();

                // 2단계 페이즈 — 초반 30개월은 수익 엔진(레벨업) 우선, 이후 연구 집중.
                // 비현금 자원(연산/데이터/인재)에 막히면 blocked에 기록해 4)에서 타깃 구매한다.
                var blocked = new HashSet<Core.ResourceId>();
                void NoteBlockers(List<Data.ResourceAmount> cost)
                {
                    foreach (var a in cost)
                        if (a.resource != Core.ResourceId.Cash && ctx.Model.Get(a.resource) < a.amount)
                            blocked.Add(a.resource);
                }

                void DoResearch()
                {
                    bool upgradedAny = true;
                    while (upgradedAny)
                    {
                        upgradedAny = false;
                        foreach (var kv in need)
                        {
                            if (ctx.Capabilities.GetLevel(kv.Key) >= kv.Value) continue;
                            var cost = ctx.Capabilities.GetUpgradeCost(kv.Key);
                            if (cost == null) continue;
                            if (!ctx.Capabilities.CanUpgrade(kv.Key) || !CashOk(cost)) { NoteBlockers(cost); continue; }
                            if (ctx.Capabilities.Upgrade(kv.Key)) upgradedAny = true;
                        }
                    }
                }

                void DoLevelUps(double reserve)
                {
                    bool leveledMore = true;
                    while (leveledMore)
                    {
                        leveledMore = false;
                        foreach (var id in ctx.Model.ActiveProducts)
                        {
                            var cost = ctx.Products.GetLevelUpCost(id);
                            if (cost == null) continue;
                            if (!ctx.Products.CanLevelUp(id) || ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(cost) < reserve)
                            {
                                NoteBlockers(cost);
                                continue;
                            }
                            if (ctx.Products.LevelUp(id)) { leveledMore = true; break; }
                        }
                    }
                }

                bool incomePhase = month < 30;
                if (incomePhase)
                {
                    DoLevelUps(Buffer());
                    DoResearch();
                }
                else
                {
                    DoResearch();
                    DoLevelUps(Buffer() + 6000);
                }

                // 3.9) 자동화 업그레이드 — 영구 비용 할인(연산비 포함, React 정렬 후 가치 상승). 회수 ~15개월이라 상시 구매.
                foreach (var u in ctx.Catalog.automation)
                {
                    if (u == null || ctx.Automation.IsPurchased(u.id)) continue;
                    if (!ctx.Automation.CanPurchase(u.id)) { NoteBlockers(u.cost); continue; }
                    if (ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(u.cost) < Buffer()) continue;
                    ctx.Automation.Purchase(u.id);
                }

                // 4) 막힌 자원만 타깃 구매 — 연산/데이터는 해당 효과 업그레이드, 인재는 hire→채용.
                if (blocked.Contains(Core.ResourceId.Compute) || blocked.Contains(Core.ResourceId.Data))
                {
                    foreach (var u in ctx.Catalog.upgrades)
                    {
                        if (u == null || ctx.Upgrades.IsPurchased(u.id) || !ctx.Upgrades.CanPurchase(u.id)) continue;
                        bool helps = false, harms = false;
                        foreach (var e in u.effects)
                        {
                            if (blocked.Contains(e.resource) && e.amount > 0) helps = true;
                            if (e.resource == Core.ResourceId.Users || e.resource == Core.ResourceId.Hype) harms = true;
                        }
                        if (!helps || harms) continue;
                        if (ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(u.cost) < Buffer()) continue;
                        ctx.Upgrades.Purchase(u.id);
                    }
                }

                if (blocked.Contains(Core.ResourceId.Compute))
                {
                    // GPU 증설 — 연산력 팩 구매 (월 최대 4팩).
                    for (int packs = 0; packs < 4 && ctx.Model.Get(Core.ResourceId.Cash) - ctx.Recruit.GetComputePackCost() >= Buffer(); packs++)
                    {
                        if (!ctx.Recruit.BuyCompute()) break;
                    }
                }

                if (blocked.Contains(Core.ResourceId.Talent))
                {
                    foreach (var uid in new[] { "hire_engineers", "hire_researchers" })
                    {
                        if (ctx.Upgrades.IsPurchased(uid) || !ctx.Upgrades.CanPurchase(uid)) continue;
                        var u = ctx.Catalog.GetUpgrade(uid);
                        if (ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(u.cost) < Buffer()) continue;
                        ctx.Upgrades.Purchase(uid);
                    }

                    // 연구가 소모하는 만큼 따라붙게 다중 채용 (월 최대 4명).
                    for (int hires = 0; hires < 4 && ctx.Model.Get(Core.ResourceId.Cash) >= ctx.Recruit.GetCost() + Buffer(); hires++)
                    {
                        if (!ctx.Recruit.Recruit()) break;
                    }
                }

                // 5) 번영기(현금 20K+ && 목표 체인 완료) — 폭 연구로 확장. 체인 완료 전 인재 누수 방지.
                bool needComplete = true;
                foreach (var kv in need)
                    if (ctx.Capabilities.GetLevel(kv.Key) < kv.Value) { needComplete = false; break; }
                if (needComplete && ctx.Model.Get(Core.ResourceId.Cash) > 20000)
                {
                    foreach (var u in ctx.Catalog.automation)
                    {
                        if (u == null || ctx.Automation.IsPurchased(u.id) || !ctx.Automation.CanPurchase(u.id)) continue;
                        if (ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(u.cost) < 10000) continue;
                        ctx.Automation.Purchase(u.id);
                    }

                    foreach (var cap in ctx.Catalog.capabilities)
                    {
                        if (cap == null) continue;
                        var cost = ctx.Capabilities.GetUpgradeCost(cap.id);
                        if (cost == null || !ctx.Capabilities.CanUpgrade(cap.id)) continue;
                        if (ctx.Model.Get(Core.ResourceId.Cash) - CashCostOf(cost) < 10000) continue;
                        ctx.Capabilities.Upgrade(cap.id);
                    }
                }

                var summary = ctx.Month.AdvanceMonth();

                // 6) 이벤트 — 실플레이 동치 (UI는 월 60% 확률로 발동). 결정론 롤 + 현금 우선/신뢰 보호 선택.
                if (eventRng.NextDouble() < ctx.Catalog.balance.eventTriggerChance && ctx.Events.Current == null)
                {
                    var triggered = ctx.Events.TryTrigger();
                    if (triggered != null && triggered.choices.Count > 0)
                    {
                        string bestId = triggered.choices[0].id;
                        double bestScore = double.MinValue;
                        foreach (var choice in triggered.choices)
                        {
                            double cash = 0, trustDelta = 0;
                            foreach (var e in choice.effects)
                            {
                                if (e.resource == Core.ResourceId.Cash) cash = e.amount;
                                if (e.resource == Core.ResourceId.Trust) trustDelta = e.amount;
                            }
                            // 신뢰가 30 아래로 떨어질 선택은 회피 (저신뢰 페널티·게임오버 가드).
                            double score = ctx.Model.Trust + trustDelta < 30 ? -1e9 + cash : cash + trustDelta * 50;
                            if (score > bestScore) { bestScore = score; bestId = choice.id; }
                        }

                        ctx.Events.Resolve(bestId);
                    }
                }

                if ((month + 1) % 12 == 0)
                {
                    yearTrace.Append("\n").Append(month + 1).Append("개월 — 현금 ")
                        .Append(ctx.Model.Get(Core.ResourceId.Cash).ToString("F0"))
                        .Append(" 매출 ").Append(summary.Revenue.ToString("F0"))
                        .Append(" 비용 ").Append(summary.TotalCashCost.ToString("F0"))
                        .Append(" 이용자 ").Append(ctx.Model.Get(Core.ResourceId.Users).ToString("F0"))
                        .Append(" 데이터 ").Append(ctx.Model.Get(Core.ResourceId.Data).ToString("F0"))
                        .Append(" 연산 ").Append(ctx.Model.Get(Core.ResourceId.Compute).ToString("F0"))
                        .Append(" 인재 ").Append(ctx.Model.Get(Core.ResourceId.Talent).ToString("F0"))
                        .Append(" 출시 ").Append(ctx.Model.ActiveProducts.Count);
                }

                Assert.IsFalse(summary.GameOver,
                    month + 1 + "개월차 게임오버 — 목표 지향 봇 기준 경제가 테크트리 등반을 버티지 못한다." + yearTrace);
                // GameWon이어도 계속 — 이 게이트의 목적은 승리가 아니라 tier 4 트리 도달 측정이다.

                if (ctx.Visibility.GetState(target) >= VisibilityState.Unlocked)
                {
                    reached = true;
                    reachedMonth = month + 1;
                }
            }

            if (!reached)
            {
                // feat-013에서 복원된 Fail 게이트 — 깨지면 경제/트리 밸런스 회귀다 (기준 — 44개월차 해금).
                var sb = new System.Text.StringBuilder();
                sb.Append("120개월 안에 목표 tier 4 제품(").Append(target.id).Append(")이 해금되지 않았다 — 경제/트리 밸런스 회귀.\n");
                sb.Append("최종 현금 ").Append(ctx.Model.Get(Core.ResourceId.Cash).ToString("F0"));
                sb.Append(" | 인재 ").Append(ctx.Model.Get(Core.ResourceId.Talent).ToString("F0"));
                sb.Append(" | 출시 ").Append(ctx.Model.ActiveProducts.Count).Append("종 | 필요 능력 — ");
                foreach (var kv in need)
                    sb.Append(kv.Key).Append(":").Append(ctx.Capabilities.GetLevel(kv.Key)).Append("/").Append(kv.Value).Append(" ");
                sb.Append(yearTrace);
                Assert.Fail(sb.ToString());
            }

            Debug.Log("[TechTreeReachability] " + target.id + " 해금 — " + reachedMonth + "개월차");
        }
    }
}
