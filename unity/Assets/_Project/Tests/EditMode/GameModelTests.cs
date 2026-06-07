// 코어 시드 스모크 테스트 — 프로젝트가 컴파일되고 asmdef/테스트 러너가 동작함을 보장한다.
using NUnit.Framework;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Tests.EditMode
{
    public class GameModelTests
    {
        [Test]
        public void GetSet_RoundTrips()
        {
            var m = new GameModel();
            m.Set(ResourceId.Cash, 12345.0);
            m.Set(ResourceId.Trust, 50.0);
            Assert.AreEqual(12345.0, m.Get(ResourceId.Cash));
            Assert.AreEqual(50.0, m.Get(ResourceId.Trust));
        }

        [Test]
        public void DefaultModel_StartsAtMonthOne_GarageStage()
        {
            var m = new GameModel();
            Assert.AreEqual(1, m.CurrentMonth);
            Assert.AreEqual("garage_prototype", m.CompanyStageId);
        }

        [Test]
        public void ResourceIds_KeyMapping_IsBidirectional()
        {
            foreach (var id in ResourceIds.All)
            {
                var key = ResourceIds.ToKey(id);
                Assert.IsTrue(ResourceIds.TryParse(key, out var parsed), "parse failed for " + key);
                Assert.AreEqual(id, parsed);
            }
            Assert.IsFalse(ResourceIds.TryParse("not_a_resource", out _));
        }
    }
}
