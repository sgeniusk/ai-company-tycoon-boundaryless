// 오피스 게이팅 — 꾸미기 해금이 차고(레벨1)에선 잠기고 확장(레벨2+) 후 열리는지 검증 (feat-031).
using NUnit.Framework;
using AICompanyTycoon.Core;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class OfficeGatingTests
    {
        [Test]
        public void Decoration_LockedAtGarage_UnlockedAfterExpand()
        {
            var m = new GameModel();
            m.OfficeLevel = 1;
            Assert.IsFalse(OfficeService.IsDecorationUnlocked(m), "차고(레벨1)에선 꾸미기 잠김.");
            m.OfficeLevel = 2;
            Assert.IsTrue(OfficeService.IsDecorationUnlocked(m), "확장(레벨2+) 후 꾸미기 해금.");
            m.OfficeLevel = 4;
            Assert.IsTrue(OfficeService.IsDecorationUnlocked(m), "상위 레벨도 해금 유지.");
        }

        [Test]
        public void Decoration_NullOrZeroModel_TreatedAsGarageLocked()
        {
            Assert.IsFalse(OfficeService.IsDecorationUnlocked(null), "모델 null은 차고로 간주 — 잠김.");
            var m = new GameModel();
            m.OfficeLevel = 0; // 손상/구세이브 방어
            Assert.IsFalse(OfficeService.IsDecorationUnlocked(m), "레벨 0은 차고로 클램프 — 잠김.");
        }

        [Test]
        public void FillTier_SoloGarageIsSparse_GrowsWithTeam()
        {
            var m = new GameModel();
            m.OfficeLevel = 1; m.Talent = 1;
            Assert.AreEqual(0, OfficeService.OfficeFillTier(m), "솔로 차고 = 휑한 티어 0.");
            m.Talent = 4;
            Assert.AreEqual(1, OfficeService.OfficeFillTier(m), "팀 형성 = 티어 1.");
            m.OfficeLevel = 4; m.Talent = 9;
            Assert.AreEqual(2, OfficeService.OfficeFillTier(m), "대형 = 가득 티어 2.");
        }
    }
}
