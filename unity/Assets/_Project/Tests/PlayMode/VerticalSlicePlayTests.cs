// VS 런타임 스모크 — GameBootstrap이 화면을 빌드하고 다음 달 진행이 모델·HUD에 반영되는지 확인한다.
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using AICompanyTycoon.UI;

namespace AICompanyTycoon.Tests.PlayMode
{
    public class VerticalSlicePlayTests
    {
        [UnityTest]
        public IEnumerator Bootstrap_BuildsScreen_AndAdvancesMonth()
        {
            var go = new GameObject("TestBootstrap");
            var boot = go.AddComponent<GameBootstrap>();
            yield return null; // Start() 실행 대기

            Assert.IsNotNull(boot.Context, "SimulationContext가 생성되어야 한다.");
            Assert.IsNotNull(boot.Screen, "GameScreen이 빌드되어야 한다.");

            int before = boot.Context.Model.CurrentMonth;
            boot.AdvanceMonth();
            Assert.AreEqual(before + 1, boot.Context.Model.CurrentMonth, "다음 달이 진행되어야 한다.");

            Object.Destroy(go);
            yield return null;
        }

        [UnityTest]
        public IEnumerator Bootstrap_SaveThenLoad_Survives()
        {
            var go = new GameObject("TestBootstrap2");
            var boot = go.AddComponent<GameBootstrap>();
            yield return null;

            boot.AdvanceMonth();
            int month = boot.Context.Model.CurrentMonth;
            boot.SaveGame();
            boot.AdvanceMonth();
            boot.LoadGame();
            Assert.AreEqual(month, boot.Context.Model.CurrentMonth, "불러오기 후 저장 시점 월로 돌아와야 한다.");

            boot.Save.Delete();
            Object.Destroy(go);
            yield return null;
        }
    }
}
