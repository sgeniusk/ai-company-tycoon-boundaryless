// 니어미스 파생 검증 — 승리 조건 80% 이상에서만 긴장 한 줄이 나온다 (feat-010 #3).
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class MilestoneTests
    {
        BalanceConfig Balance()
        {
            var c = Resources.Load<DataCatalog>("DataCatalog");
            Assert.IsNotNull(c, "DataCatalog.asset 없음 — DataImporter.ImportAll 먼저 실행해야 한다.");
            Assert.IsNotNull(c.balance);
            return c.balance;
        }

        [Test]
        public void FarFromWin_ReturnsNull()
        {
            var m = new GameModel { Users = 0, Cash = 0, Automation = 0 };
            Assert.IsNull(MilestoneService.GetNearMiss(m, Balance()));
        }

        [Test]
        public void NearUsersWin_ReturnsUsersNearMiss()
        {
            var b = Balance();
            var m = new GameModel { Users = b.successUsersThreshold * 0.85 };
            var near = MilestoneService.GetNearMiss(m, b);
            Assert.IsNotNull(near);
            StringAssert.Contains("이용자", near.Text);
            Assert.AreEqual(0.85, near.Progress, 0.001);
        }

        [Test]
        public void ReachedWin_ReturnsNull_WinCheckOwnsIt()
        {
            var b = Balance();
            var m = new GameModel { Users = b.successUsersThreshold };
            Assert.IsNull(MilestoneService.GetNearMiss(m, b));
        }

        [Test]
        public void PicksClosestCondition()
        {
            var b = Balance();
            var m = new GameModel
            {
                Users = b.successUsersThreshold * 0.82,
                Cash = b.successCashThreshold * 0.93,
            };
            var near = MilestoneService.GetNearMiss(m, b);
            Assert.IsNotNull(near);
            StringAssert.Contains("자금", near.Text);
        }
    }
}
