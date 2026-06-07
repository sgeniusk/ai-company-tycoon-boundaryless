// 절차적 효과음 생성 검증 — 프리셋이 유효한 AudioClip을 만드는지 확인한다.
using NUnit.Framework;
using UnityEngine;
using AICompanyTycoon.Presentation;

namespace AICompanyTycoon.Tests.EditMode
{
    public class SfxGenTests
    {
        [Test]
        public void Presets_ProduceNonEmptyMonoClips()
        {
            var clips = new[]
            {
                SfxGen.Blip(), SfxGen.Coin(), SfxGen.Powerup(),
                SfxGen.Denied(), SfxGen.Tick(), SfxGen.Fanfare(), SfxGen.Stinger()
            };
            foreach (var c in clips)
            {
                Assert.IsNotNull(c);
                Assert.Greater(c.samples, 0);
                Assert.Greater(c.length, 0f);
                Assert.AreEqual(1, c.channels);
            }
        }

        [Test]
        public void Generate_RespectsDuration()
        {
            var clip = SfxGen.Generate(new SfxParams
            {
                wave = SfxWave.Sine, startFreq = 440, attack = 0.01f, sustain = 0.1f, decay = 0.1f, volume = 0.5f
            }, "dur");
            Assert.AreEqual(0.21f, clip.length, 0.02f);
        }
    }
}
