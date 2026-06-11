// 태그 파생 아키타입 — 파생 결정론·월간 보너스·신규 발견·메타 도감 검증 (feat-008 #2).
using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class ArchetypeTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void Import_Has12Archetypes_8Bonus()
        {
            var c = Catalog();
            Assert.AreEqual(12, c.archetypes.Count);
            int bonus = 0;
            foreach (var a in c.archetypes) if (a.yieldsKind == "bonus") bonus++;
            Assert.AreEqual(8, bonus);
        }

        [Test]
        public void Derive_ChipWarEngineerRun_YieldsChipWarLocalizer()
        {
            var c = Catalog();
            // chip_war(export_controls, compute_regional) + engineer_founder(builder_bias) 조합.
            var run = RunModifierService.Select(c, new RunModifierInput
            {
                WorldLoreId = "chip_war",
                FounderTraitId = "engineer_founder",
            });
            var derived = ArchetypeService.GetDerived(run, c);
            var ids = derived.ConvertAll(a => a.id);
            CollectionAssert.Contains(ids, "chip_war_localizer");
        }

        [Test]
        public void Derive_StandardRun_YieldsNothing()
        {
            var c = Catalog();
            var run = RunModifierService.Select(c, null);
            Assert.AreEqual(0, ArchetypeService.GetDerived(run, c).Count);
        }

        [Test]
        public void MonthlyEffects_BonusRuleOnly()
        {
            var c = Catalog();
            var rule = c.GetArchetype("data_alchemist");
            Assert.IsNotNull(rule);
            var run = new RunModifiersState { Tags = new List<string>(rule.requires) };
            var effects = ArchetypeService.GetMonthlyEffects(run, c);
            // data_alchemist — data +3 (정본 derivation_rules.json).
            bool found = false;
            foreach (var e in effects)
                if (e.resource == ResourceId.Data && System.Math.Abs(e.amount - 3) < 0.001) found = true;
            Assert.IsTrue(found, "data_alchemist 월간 보너스(data +3)가 파생되어야 한다.");
        }

        [Test]
        public void MetaSave_RecordsOnceAndPersists()
        {
            var path = Path.Combine(Application.temporaryCachePath, "aict_test_meta.json");
            var meta = new MetaSaveService(path);
            meta.Delete();
            Assert.AreEqual(2, meta.RecordArchetypes(new[] { "frontier_garage", "data_alchemist" }));
            Assert.AreEqual(0, meta.RecordArchetypes(new[] { "frontier_garage" }), "중복 기록은 추가되지 않아야 한다.");
            Assert.AreEqual(1, meta.RecordEnding("garage_restart"));

            var reloaded = new MetaSaveService(path);
            CollectionAssert.Contains(reloaded.Data.discoveredArchetypeIds, "data_alchemist");
            CollectionAssert.Contains(reloaded.Data.discoveredEndingIds, "garage_restart");
            reloaded.Delete();
        }
    }
}
