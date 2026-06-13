// 성급 비주얼 사다리 — 단계별 배경 키 매핑 (feat-014 #5). 텍스처 없이 키 로직만 검증.
using NUnit.Framework;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class StageVisualTests
    {
        [Test]
        public void Garage_And_Seed_UseDefaultOffice()
        {
            Assert.AreEqual("Art/Background/office", StageVisual.BackgroundKey("garage_prototype"));
            Assert.AreEqual("Art/Background/office", StageVisual.BackgroundKey("seed_startup"));
        }

        [Test]
        public void GrowthStages_UseExpandedOffice()
        {
            Assert.AreEqual("Art/Background/office_growth", StageVisual.BackgroundKey("viral_app_company"));
            Assert.AreEqual("Art/Background/office_growth", StageVisual.BackgroundKey("enterprise_ai_vendor"));
        }

        [Test]
        public void Giant_UsesDataCenter_AndApex_UsesLandmark()
        {
            Assert.AreEqual("Art/Background/office_datacenter", StageVisual.BackgroundKey("ai_platform_giant"));
            Assert.AreEqual("Art/Background/office_landmark", StageVisual.BackgroundKey("boundaryless_intelligence"));
        }

        [Test]
        public void UnknownStage_FallsBackToDefault()
        {
            Assert.AreEqual("Art/Background/office", StageVisual.BackgroundKey("nonexistent_stage"));
            Assert.AreEqual("Art/Background/office", StageVisual.BackgroundKey(null));
        }
    }
}
