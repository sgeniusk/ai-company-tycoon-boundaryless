// 산업 시너지/콤보 — 활성 판정(해금 ∪ 출시 도메인)과 월간 효과 적용 검증 (feat-013 #1, React 동치).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class IndustrySynergyTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void Catalog_HasSynergiesAndCombos()
        {
            var c = Catalog();
            Assert.AreEqual(10, c.industrySynergies.Count, "industry_synergies.json 10종");
            Assert.AreEqual(10, c.industryCombos.Count, "industry_combos.json 10종");
            foreach (var s in c.industryCombos)
                Assert.IsFalse(string.IsNullOrEmpty(s.riskLabel), s.id + " 콤보는 risk_label 필수");
        }

        [Test]
        public void FreshGame_NoActiveSynergies()
        {
            var ctx = SimulationContext.Create(Catalog());
            Assert.AreEqual(0, IndustrySynergyService.GetActive(ctx.Model, ctx.Catalog).Count,
                "기본 해금 2도메인만으로 활성되는 시너지가 없어야 표준 런 기준선이 보존된다.");
        }

        [Test]
        public void ActiveDomains_IncludeLaunchedProductDomains()
        {
            var ctx = SimulationContext.Create(Catalog());
            // 도메인 해금 없이 제품만 출시 상태로 주입해도 그 도메인이 포트폴리오에 든다 (React 동치).
            ctx.Model.ActiveProducts.Add("warehouse_robot_fleet"); // robotics
            var domains = IndustrySynergyService.GetActiveDomainIds(ctx.Model, ctx.Catalog);
            Assert.IsTrue(domains.Contains("robotics"));
        }

        [Test]
        public void RoboticsManufacturing_ActivatesCell_AndPaysMonthlyCash()
        {
            var baseline = SimulationContext.Create(Catalog());
            var withSynergy = SimulationContext.Create(Catalog());
            withSynergy.Model.UnlockedDomains.Add("robotics");
            withSynergy.Model.UnlockedDomains.Add("manufacturing");

            var active = IndustrySynergyService.GetActive(withSynergy.Model, withSynergy.Catalog);
            Assert.IsTrue(active.Exists(s => s.id == "robotics_manufacturing_cell"));
            // 같은 포트폴리오가 콤보(robot_factory_subscription)도 가동한다.
            Assert.IsTrue(active.Exists(s => s.id == "robot_factory_subscription"));

            baseline.Month.AdvanceMonth();
            withSynergy.Month.AdvanceMonth();
            // 제품·능력이 같으므로 한 달 후 현금 차이는 시너지(120)+콤보(560) 월간 효과뿐이다.
            Assert.AreEqual(680.0, withSynergy.Model.Cash - baseline.Model.Cash, 0.01);
            Assert.AreEqual(8.0, withSynergy.Model.Automation - baseline.Model.Automation, 0.01);
        }

        [Test]
        public void ComboPortfolio_PaysCombinedEffects()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.UnlockedDomains.Add("manufacturing");
            ctx.Model.UnlockedDomains.Add("logistics");
            ctx.Model.UnlockedDomains.Add("energy");
            var active = IndustrySynergyService.GetActive(ctx.Model, ctx.Catalog);
            Assert.IsTrue(active.Exists(s => s.id == "full_stack_physical_empire"),
                "제조+물류+에너지 — 풀스택 물리 제국 콤보가 가동돼야 한다.");
        }
    }
}
