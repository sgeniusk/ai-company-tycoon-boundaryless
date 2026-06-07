// 세이브/로드 라운드트립 검증.
using NUnit.Framework;
using System.IO;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Save;

namespace AICompanyTycoon.Tests.EditMode
{
    public class SaveServiceTests
    {
        [Test]
        public void SaveLoad_RoundTrips()
        {
            var path = Path.Combine(Application.temporaryCachePath, "aict_test_save.json");
            var svc = new SaveService(path);
            svc.Delete();

            var m = new GameModel { Cash = 12345, Users = 678, CurrentMonth = 7, CompanyStageId = "seed_startup" };
            m.Capabilities["language"] = 3;
            m.Capabilities["vision"] = 1;
            m.UnlockedDomains.Add("personal_productivity");
            m.ActiveProducts.Add("p1");

            svc.Save(m);
            Assert.IsTrue(svc.HasSave());

            var m2 = new GameModel();
            Assert.IsTrue(svc.Load(m2));
            Assert.AreEqual(12345, m2.Cash, 0.001);
            Assert.AreEqual(678, m2.Users, 0.001);
            Assert.AreEqual(7, m2.CurrentMonth);
            Assert.AreEqual("seed_startup", m2.CompanyStageId);
            Assert.AreEqual(3, m2.Capabilities["language"]);
            Assert.AreEqual(1, m2.Capabilities["vision"]);
            Assert.Contains("p1", m2.ActiveProducts);
            Assert.Contains("personal_productivity", m2.UnlockedDomains);

            svc.Delete();
            Assert.IsFalse(svc.HasSave());
        }
    }
}
