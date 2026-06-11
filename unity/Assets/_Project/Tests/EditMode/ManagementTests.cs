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
        public void HireCapacity_IsPurchaseBased_NotStageBased()
        {
            // feat-014 #2 — 정원은 구매형(OfficeLevel). 성급만 올라선 늘지 않는다 (#1의 interim 파생은 구세이브 전용).
            var ctx = Fresh();
            int garage = ctx.Recruit.GetHireCapacity();
            ctx.Model.CompanyStageId = "seed_startup";
            Assert.AreEqual(garage, ctx.Recruit.GetHireCapacity(), "구매 없이 성급만으로 정원이 늘면 안 된다.");
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
        public void OfficeExpand_RaisesCapacity_AndGates()
        {
            var ctx = Fresh();
            Assert.AreEqual(1, ctx.Office.GetCurrent().level);
            Assert.AreEqual(3, ctx.Recruit.GetHireCapacity());

            // 2단계(startup_suite) — min_products 1 미충족이면 잠금.
            StringAssert.Contains("요건", ctx.Office.GetExpandLockReason());

            ctx.Model.Set(ResourceId.Cash, 1e9);
            ctx.Model.ActiveProducts.Add("foundation_model_v0");
            Assert.IsTrue(ctx.Office.CanExpand());
            Assert.IsTrue(ctx.Office.Expand());
            Assert.AreEqual(2, ctx.Model.OfficeLevel);
            Assert.AreEqual(5, ctx.Recruit.GetHireCapacity(), "startup_suite 정원 5명");
        }

        [Test]
        public void Relocate_ChangesMonthlyCostModifier()
        {
            var baseline = Fresh();
            var moved = Fresh();
            Assert.AreEqual("rural_garage", moved.Model.LocationId);

            CompanyLocationDef pangyo = null;
            foreach (var l in moved.Catalog.companyLocations)
                if (l != null && l.id == "pangyo_shared_office") pangyo = l;
            Assert.IsNotNull(pangyo);

            // 두 컨텍스트 동일 상태(이용자 포함)에서 위치만 다르게 — 비용 비교는 직접 주입(이전비 제외).
            baseline.Model.Users = 5000;
            moved.Model.Users = 5000;
            moved.Model.LocationId = "pangyo_shared_office";

            var sBase = baseline.Month.AdvanceMonth();
            var sMoved = moved.Month.AdvanceMonth();
            Assert.AreEqual(sBase.TotalCashCost / 0.82 * 1.18, sMoved.TotalCashCost, 0.5,
                "판교 유지비 모디파이어 1.18이 고정비에 곱해져야 한다 (차고 0.82 대비).");
        }

        [Test]
        public void HumanHireCost_GetsLocationDiscount()
        {
            var ctx = Fresh();
            AgentTypeDef human = null;
            foreach (var a in ctx.Catalog.agentTypes)
                if (a != null && a.kind == "human") { human = a; break; }
            Assert.IsNotNull(human);

            double baseCash = 0;
            foreach (var c in human.hireCost)
                if (c.resource == ResourceId.Cash) baseCash = c.amount;
            double discounted = 0;
            foreach (var c in ctx.Recruit.GetHireCost(human))
                if (c.resource == ResourceId.Cash) discounted = c.amount;
            Assert.AreEqual(System.Math.Round(baseCash * 0.82), discounted, 0.001,
                "차고(할인 0.18)에서 사람 영입비가 깎여야 한다.");
        }

        [Test]
        public void LegacySave_DerivesOfficeLevelFromStage()
        {
            var ctx = Fresh();
            ctx.Model.OfficeLevel = 0; // 구세이브 시뮬레이션 (v5 이하 — 필드 없음)
            ctx.Model.CompanyStageId = "viral_app_company"; // 성급 3
            Assert.AreEqual(8, ctx.Recruit.GetHireCapacity(), "구세이브는 성급 파생 정원(3단계=8명)을 유지해야 한다.");
            Assert.AreEqual(3, ctx.Model.OfficeLevel, "파생 결과가 OfficeLevel로 고정돼야 한다.");
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
