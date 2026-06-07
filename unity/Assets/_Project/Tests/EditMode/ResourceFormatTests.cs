// 자원 표시 포맷 검증.
using NUnit.Framework;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Tests.EditMode
{
    public class ResourceFormatTests
    {
        [Test]
        public void Cash_FormatsWithKM()
        {
            Assert.AreEqual("$500", ResourceFormat.Format(ResourceId.Cash, 500));
            Assert.AreEqual("$1.5K", ResourceFormat.Format(ResourceId.Cash, 1500));
            Assert.AreEqual("$2.0M", ResourceFormat.Format(ResourceId.Cash, 2_000_000));
        }

        [Test]
        public void Users_FormatsWithKM()
        {
            Assert.AreEqual("0", ResourceFormat.Format(ResourceId.Users, 0));
            Assert.AreEqual("12.0K", ResourceFormat.Format(ResourceId.Users, 12000));
        }

        [Test]
        public void Bounded_ShowsOutOfHundred()
        {
            Assert.AreEqual("50 / 100", ResourceFormat.Format(ResourceId.Trust, 50));
            Assert.AreEqual("0 / 100", ResourceFormat.Format(ResourceId.Hype, 0));
        }
    }
}
