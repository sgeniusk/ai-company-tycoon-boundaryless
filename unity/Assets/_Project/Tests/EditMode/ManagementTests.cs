// 경영 탭 — 채용 3택1(결정론·정원·로스터)과 인재 보너스 환산 검증 (feat-014 #1).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class ManagementTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        SimulationContext Fresh() => SimulationContext.Create(Catalog());

        [Test]
        public void Catalog_HasAgentTypesAndOffices()
        {
            var c = Catalog();
            Assert.AreEqual(22, c.agentTypes.Count, "agent_types.json 22종");
            Assert.AreEqual(6, c.officeExpansions.Count, "office_expansions.json 6단계");
            foreach (var a in c.agentTypes)
                Assert.IsTrue(a.hireCost.Count > 0, a.id + " hire_cost 필수");
        }

        [Test]
        public void Candidates_AreDeterministic_AndDistinct()
        {
            var a = Fresh();
            var b = Fresh();
            var ca = a.Recruit.GetCandidates();
            var cb = b.Recruit.GetCandidates();
            Assert.AreEqual(RecruitService.CandidateCount, ca.Count);
            for (int i = 0; i < ca.Count; i++)
                Assert.AreEqual(ca[i].id, cb[i].id, "같은 시드·회차면 같은 후보판이어야 한다.");
            for (int i = 0; i < ca.Count; i++)
                for (int j = i + 1; j < ca.Count; j++)
                    Assert.AreNotEqual(ca[i].id, ca[j].id, "한 판에 같은 후보 중복 금지.");
        }

        [Test]
        public void Hire_AddsRosterAndTalent_AndRefreshesCandidates()
        {
            var ctx = Fresh();
            ctx.Model.Set(ResourceId.Cash, 1e9);
            var before = ctx.Recruit.GetCandidates();
            var pick = before[0];
            double talentBefore = ctx.Model.Talent;

            Assert.IsTrue(ctx.Recruit.Hire(pick));
            Assert.Contains(pick.id, ctx.Model.HiredAgentIds);
            Assert.AreEqual(talentBefore + 1, ctx.Model.Talent, 0.001);

            // 다음 후보판 — 회차가 바뀌고 이미 영입한 인재는 빠진다.
            foreach (var candidate in ctx.Recruit.GetCandidates())
                Assert.AreNotEqual(pick.id, candidate.id, "영입한 인재가 후보에 다시 나오면 안 된다.");
        }

        [Test]
        public void Hire_Blocked_WhenRosterFull()
        {
            var ctx = Fresh();
            ctx.Model.Set(ResourceId.Cash, 1e9);
            int capacity = ctx.Recruit.GetHireCapacity();
            Assert.AreEqual(3, capacity, "차고 사무실 정원은 3명이어야 한다 (성급 1 파생).");

            for (int i = 0; i < capacity; i++)
            {
                var candidates = ctx.Recruit.GetCandidates();
                Assert.IsTrue(ctx.Recruit.Hire(candidates[0]), i + "번째 영입 실패");
            }

            Assert.IsTrue(ctx.Recruit.IsRosterFull());
            var blocked = ctx.Recruit.GetCandidates();
            if (blocked.Count > 0)
            {
                Assert.IsFalse(ctx.Recruit.CanHire(blocked[0]));
                StringAssert.Contains("사무실이 좁습니다", ctx.Recruit.GetHireLockReason(blocked[0]));
            }
        }

        [Test]
        public void HireCapacity_GrowsWithCompanyStage()
        {
            var ctx = Fresh();
            int garage = ctx.Recruit.GetHireCapacity();
            ctx.Model.CompanyStageId = "seed_startup";
            int seed = ctx.Recruit.GetHireCapacity();
            Assert.Greater(seed, garage, "성급이 오르면 정원이 늘어야 한다 (interim 파생).");
        }

        [Test]
        public void RosterBonus_DiscountsResearchCashCost()
        {
            var ctx = Fresh();
            var baselineCost = ctx.Capabilities.GetUpgradeCost("language");
            double baseCash = 0;
            foreach (var a in baselineCost)
                if (a.resource == ResourceId.Cash) baseCash = a.amount;

            // research 스탯이 있는 인재를 강제 등록 — 연구 현금 비용이 내려간다.
            AgentTypeDef researcher = null;
            foreach (var a in ctx.Catalog.agentTypes)
                if (a != null && a.statResearch >= 3) { researcher = a; break; }
            Assert.IsNotNull(researcher, "research 3+ 인재가 데이터에 있어야 한다.");
            ctx.Model.HiredAgentIds.Add(researcher.id);

            var discounted = ctx.Capabilities.GetUpgradeCost("language");
            double discountedCash = 0;
            foreach (var a in discounted)
                if (a.resource == ResourceId.Cash) discountedCash = a.amount;
            Assert.Less(discountedCash, baseCash, "로스터 research 합이 연구 현금 비용을 할인해야 한다.");
        }

        [Test]
        public void Roster_SaveRoundTrip_AndLegacyEmpty()
        {
            var ctx = Fresh();
            ctx.Model.HiredAgentIds.Add("garage_junior_dev");
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "test-roster-save.json");
            var save = new Save.SaveService(path);
            save.Save(ctx.Model);
            var loaded = new GameModel();
            Assert.IsTrue(save.Load(loaded));
            Assert.Contains("garage_junior_dev", loaded.HiredAgentIds);
            System.IO.File.Delete(path);

            Assert.AreEqual(0, Fresh().Model.HiredAgentIds.Count, "새 게임 로스터는 비어 있다.");
        }
    }
}
