// 멀티 엔딩 판정 — 조건 매칭·우선순위·폴백 검증 (feat-008 #3). 기대값은 React 알고리즘의 Python 교차 산출.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EndingTests
    {
        DataCatalog Catalog()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            return c;
        }

        [Test]
        public void Import_Has24Endings_WithFallback()
        {
            var c = Catalog();
            Assert.AreEqual(24, c.endings.Count);
            var last = c.endings[c.endings.Count - 1];
            Assert.AreEqual("garage_restart", last.id);
            Assert.IsTrue(last.fallback);
        }

        [Test]
        public void Determine_FreshFailure_FallsBackToGarageRestart()
        {
            var c = Catalog();
            var m = new GameModel { CurrentMonth = 2 };
            var ending = EndingService.Determine(m, c, false);
            Assert.AreEqual("garage_restart", ending.id);
        }

        [Test]
        public void Determine_PlatformEscapeNetwork_CrossFixture()
        {
            var c = Catalog();
            // Python 교차 픽스처 — 이 상태에서 매칭은 platform_escape_network(74) > garage_restart(0).
            var m = new GameModel
            {
                CurrentMonth = 120,
                Cash = 180000,
                Users = 170000,
                Hype = 55,
                Automation = 50,
            };
            m.ActiveProducts.AddRange(new[] { "p1", "p2", "p3", "p4", "p5" });
            m.RunModifiers = new RunModifiersState
            {
                WorldLoreId = "bigtech_monopoly",
                MarketConditionId = "platform_gold_rush",
                FounderTraitId = "marketer_founder",
            };
            var ending = EndingService.Determine(m, c, true);
            Assert.AreEqual("platform_escape_network", ending.id);
        }

        [Test]
        public void Determine_GrowthPathRequired_NeverMatchesInUnityVS()
        {
            var c = Catalog();
            foreach (var e in c.endings)
                if (e.growthPathIds.Count > 0)
                {
                    // growth_path 시스템이 없는 Unity VS에서는 해당 엔딩이 절대 안 나와야 한다 (의도된 제약).
                    var m = new GameModel { CurrentMonth = 200, Cash = 99999999, Users = 99999999 };
                    var got = EndingService.Determine(m, c, true);
                    Assert.AreNotEqual(e.id, got.id);
                    return;
                }
            Assert.Inconclusive("growth_path 요구 엔딩이 정본에 없음.");
        }
    }
}
