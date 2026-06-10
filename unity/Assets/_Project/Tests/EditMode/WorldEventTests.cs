// 연중 세계 이벤트 — 시드 파생 스케줄 결정론·발동·중복 방지 검증 (feat-007 블록 #3).
// 교차 픽스처는 React 알고리즘(FNV-1a)을 정본 데이터에 적용해 Python으로 산출한 기대값이다.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class WorldEventTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        static RunModifiersState Run(string seed, string world)
        {
            return new RunModifiersState { Seed = seed, WorldLoreId = world };
        }

        [Test]
        public void Import_Has30WorldEvents()
        {
            Assert.AreEqual(30, Catalog().worldEvents.Count);
        }

        [Test]
        public void Schedule_MatchesCrossLanguageFixture()
        {
            var c = Catalog();
            // seed "we-test" + open_source_heaven — React/Python 산출 기대 스케줄.
            var osh = WorldEventService.GetSchedule(Run("we-test", "open_source_heaven"), c);
            Assert.AreEqual("platform_fee_hike", osh[0].Def.id);
            Assert.AreEqual(2, osh[0].Year);
            Assert.AreEqual("privacy_crackdown", osh[1].Def.id);
            // 같은 시드, 다른 세계관이면 스케줄이 달라진다.
            var cw = WorldEventService.GetSchedule(Run("we-test", "chip_war"), c);
            Assert.AreEqual("export_control_tightening", cw[0].Def.id);
        }

        [Test]
        public void Schedule_IsDeterministic_YearlyUniqueEligible()
        {
            var c = Catalog();
            var a = WorldEventService.GetSchedule(Run("run-7", "agi_overhang"), c);
            var b = WorldEventService.GetSchedule(Run("run-7", "agi_overhang"), c);
            Assert.AreEqual(a.Count, b.Count);
            var seen = new System.Collections.Generic.HashSet<string>();
            for (int i = 0; i < a.Count; i++)
            {
                Assert.AreEqual(a[i].Def.id, b[i].Def.id);
                Assert.IsTrue(seen.Add(a[i].Def.id), "이벤트 중복 — " + a[i].Def.id);
                Assert.GreaterOrEqual(a[i].Year, 2);
                Assert.LessOrEqual(a[i].Year, 10);
                Assert.AreEqual(a[i].Year * 12, a[i].Month);
                Assert.GreaterOrEqual(a[i].Year, a[i].Def.yearMin);
                Assert.LessOrEqual(a[i].Year, a[i].Def.yearMax);
            }
        }

        [Test]
        public void ApplyDue_AppliesOnceAtDueMonth()
        {
            var c = Catalog();
            var ctx = SimulationContext.Create(c);
            var m = ctx.Model;
            m.RunModifiers = Run("we-test", "open_source_heaven");
            m.CurrentMonth = 24;
            m.Cash = 10000;
            m.Users = 1000;

            var titles = WorldEventService.ApplyDue(m, c, ctx.Resources);
            // platform_fee_hike — cash -2600, users -200 (정본 world_events.json).
            Assert.AreEqual(1, titles.Count);
            Assert.AreEqual(10000 - 2600, m.Cash, 0.001);
            Assert.AreEqual(1000 - 200, m.Users, 0.001);
            CollectionAssert.Contains(m.WorldEventHistory, "platform_fee_hike");

            // 같은 달 재호출 — 중복 발동 없음.
            var again = WorldEventService.ApplyDue(m, c, ctx.Resources);
            Assert.AreEqual(0, again.Count);
            Assert.AreEqual(10000 - 2600, m.Cash, 0.001);
        }

        [Test]
        public void AdvanceMonth_FiresWorldEventAtYearBoundary()
        {
            var c = Catalog();
            var ctx = SimulationContext.Create(c);
            ctx.Model.RunModifiers = Run("we-test", "open_source_heaven");
            ctx.Model.CurrentMonth = 23;
            ctx.Model.Cash = 100000; // 게임오버 방지 여유
            var s = ctx.Month.AdvanceMonth();
            Assert.AreEqual(24, ctx.Model.CurrentMonth);
            Assert.AreEqual(1, s.WorldEventTitles.Count);
            CollectionAssert.Contains(ctx.Model.WorldEventHistory, "platform_fee_hike");
        }

        [Test]
        public void SaveLoad_WorldEventHistory_RoundTrips()
        {
            var path = System.IO.Path.Combine(Application.temporaryCachePath, "aict_test_worldevent_save.json");
            var svc = new AICompanyTycoon.Save.SaveService(path);
            svc.Delete();
            var m = new GameModel();
            m.WorldEventHistory.Add("platform_fee_hike");
            svc.Save(m);
            var m2 = new GameModel();
            Assert.IsTrue(svc.Load(m2));
            CollectionAssert.Contains(m2.WorldEventHistory, "platform_fee_hike");
            svc.Delete();
        }
    }
}
