// JSON 임포트 결과 DataCatalog 자산의 핵심 계약을 검증하는 EditMode 테스트.
using System.Collections.Generic;
using System.IO;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using MiniJSON;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;

namespace AICompanyTycoon.Tests.EditMode
{
    public class DataImportTests
    {
        private const string CatalogPath = "Assets/_Project/Resources/DataCatalog.asset";

        [Test]
        public void DataCatalog_ContainsExpectedImportedCounts()
        {
            var catalog = LoadCatalog();

            Assert.AreEqual(8, catalog.resources.Count);
            Assert.AreEqual(12, catalog.capabilities.Count);
            Assert.AreEqual(15, catalog.domains.Count);
            Assert.AreEqual(6, catalog.stages.Count);
            Assert.AreEqual(GetJsonArrayLength("products.json", "products"), catalog.products.Count);
            Assert.AreEqual(GetJsonArrayLength("upgrades.json", "upgrades"), catalog.upgrades.Count);
            Assert.AreEqual(GetJsonArrayLength("automation_upgrades.json", "automation_upgrades"), catalog.automation.Count);
            Assert.AreEqual(GetJsonArrayLength("events.json", "events"), catalog.events.Count);
            Assert.Greater(catalog.products.Count, 0);
            Assert.Greater(catalog.upgrades.Count, 0);
            Assert.Greater(catalog.automation.Count, 0);
            Assert.Greater(catalog.events.Count, 0);
        }

        [Test]
        public void DataCatalog_MapsRequiredSampleFields()
        {
            var catalog = LoadCatalog();

            var language = catalog.GetCapability("language");
            Assert.IsNotNull(language);
            Assert.AreEqual(5, language.maxLevel);
            Assert.AreEqual(5, language.upgradeCosts.Count);

            var creatorTools = catalog.GetDomain("creator_tools");
            Assert.IsNotNull(creatorTools);
            Assert.IsTrue(creatorTools.unlockRequirements.Exists(item => item.capabilityId == "vision" && item.level == 1));

            Assert.IsNotNull(catalog.balance);
            Assert.AreEqual(400, catalog.balance.baseMonthlyCashCost);

            var automatedMarketing = catalog.GetAutomation("automated_marketing");
            Assert.IsNotNull(automatedMarketing);
            Assert.IsTrue(automatedMarketing.monthlyEffects.Exists(item => item.resource == ResourceId.Hype && item.amount == 2));

            Assert.IsNotNull(catalog.GetProduct("foundation_model_v0"));
        }

        private static DataCatalog LoadCatalog()
        {
            var catalog = AssetDatabase.LoadAssetAtPath<DataCatalog>(CatalogPath);
            Assert.IsNotNull(catalog, "Run DataImporter.ImportAll before EditMode tests.");

            var runtimeCatalog = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(runtimeCatalog, "DataCatalog must be loadable from Resources.");
            return catalog;
        }

        private static int GetJsonArrayLength(string fileName, string key)
        {
            var path = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data", fileName));
            var root = Json.Deserialize(File.ReadAllText(path)) as Dictionary<string, object>;
            Assert.IsNotNull(root, fileName + " root must be an object.");
            Assert.IsTrue(root.ContainsKey(key), fileName + " must contain " + key + ".");
            var list = root[key] as List<object>;
            Assert.IsNotNull(list, key + " must be an array.");
            return list.Count;
        }
    }
}
