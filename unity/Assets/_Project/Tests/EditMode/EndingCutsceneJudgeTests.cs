// 엔딩 결말을 컷씬 톤 버킷으로 가르는 판정 헬퍼의 테스트. won + priority + 파산(cash) 신호.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Systems;

namespace AICompanyTycoon.Tests.EditMode
{
    public class EndingCutsceneJudgeTests
    {
        static EndingDef Ending(int priority)
        {
            var e = ScriptableObject.CreateInstance<EndingDef>();
            e.priority = priority;
            return e;
        }

        [Test]
        public void Won_HighPriority_IsLegendary()
        {
            Assert.AreEqual(EndingBucket.Legendary,
                EndingCutsceneJudge.Judge(Ending(120), new GameModel { Cash = 500000 }, true));
        }

        [Test]
        public void Won_PriorityBoundary100_IsLegendary()
        {
            Assert.AreEqual(EndingBucket.Legendary,
                EndingCutsceneJudge.Judge(Ending(100), new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Won_Priority99_IsTriumph()
        {
            Assert.AreEqual(EndingBucket.Triumph,
                EndingCutsceneJudge.Judge(Ending(99), new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Won_NullEnding_IsTriumph()
        {
            Assert.AreEqual(EndingBucket.Triumph,
                EndingCutsceneJudge.Judge(null, new GameModel { Cash = 1 }, true));
        }

        [Test]
        public void Lost_Solvent_IsRestart()
        {
            Assert.AreEqual(EndingBucket.Restart,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = 50000 }, false));
        }

        [Test]
        public void Lost_Bankrupt_IsCollapse()
        {
            Assert.AreEqual(EndingBucket.Collapse,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = -500 }, false));
        }

        [Test]
        public void Lost_ZeroCash_IsCollapse()
        {
            Assert.AreEqual(EndingBucket.Collapse,
                EndingCutsceneJudge.Judge(Ending(0), new GameModel { Cash = 0 }, false));
        }
    }
}
