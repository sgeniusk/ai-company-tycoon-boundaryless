// AI 비서 가이던스 — 우선순위·seen 소화·기본 진행 폴백 검증 (feat-009).
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class GuidanceTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void FreshGame_SoloFounder_SuggestsFirstHire()
        {
            var ctx = SimulationContext.Create(Catalog());
            Assert.AreEqual(0, ctx.Model.HiredAgentIds.Count, "시작은 사장 1인 — 영입 이력 0이어야 한다.");
            var step = GuidanceService.GetStep(ctx, null);
            Assert.AreEqual("hire_first_employee", step.Id);
            Assert.AreEqual("upgrades", step.TargetTab);
            Assert.AreEqual("primary", step.Tone);
        }

        [Test]
        public void AfterFirstHire_SuggestsFirstProductLaunch()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.HiredAgentIds.Add("dummy_hire");
            var step = GuidanceService.GetStep(ctx, null);
            Assert.AreEqual("launch_first_product", step.Id);
            Assert.AreEqual("products", step.TargetTab);
        }

        [Test]
        public void SeenSuggestion_MovesToNextPriority()
        {
            var ctx = SimulationContext.Create(Catalog());
            var seen = new HashSet<string> { "launch_first_product" };
            var step = GuidanceService.GetStep(ctx, seen);
            Assert.AreNotEqual("launch_first_product", step.Id);
        }

        [Test]
        public void AllSuggestionsSeen_FallsBackToAdvanceMonth()
        {
            var ctx = SimulationContext.Create(Catalog());
            var seen = new HashSet<string> { "hire_first_employee", "launch_first_product", "recover_trust", "research_capability", "add_automation" };
            var step = GuidanceService.GetStep(ctx, seen);
            Assert.AreEqual(GuidanceService.AdvanceId, step.Id);
            Assert.IsNull(step.TargetTab);
            Assert.AreEqual("다음 달", step.ActionLabel);
        }

        [Test]
        public void LowTrust_RaisesWarningStep()
        {
            var ctx = SimulationContext.Create(Catalog());
            ctx.Model.Trust = 5; // 게임오버 임계 부근
            var seen = new HashSet<string> { "hire_first_employee", "launch_first_product" };
            var step = GuidanceService.GetStep(ctx, seen);
            Assert.AreEqual("recover_trust", step.Id);
            Assert.AreEqual("warning", step.Tone);
        }
    }
}
