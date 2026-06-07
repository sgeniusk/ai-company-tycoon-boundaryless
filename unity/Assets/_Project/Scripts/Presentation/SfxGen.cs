// 절차적 효과음 합성기 (sfxr/bfxr 계열). 파일 없이 런타임에 AudioClip을 만든다 — 100% 소유라 상업 출시 안전.
using UnityEngine;

namespace AICompanyTycoon.Presentation
{
    public enum SfxWave { Square, Saw, Triangle, Sine, Noise }

    public struct SfxParams
    {
        public SfxWave wave;
        public float startFreq;   // Hz
        public float endFreq;     // 슬라이드 목표(0이면 슬라이드 없음)
        public float attack;      // 초
        public float sustain;     // 초
        public float decay;       // 초
        public float duty;        // square 듀티(0이면 0.5)
        public float volume;      // 0..1(0이면 0.5)
        public float[] arpeggio;  // 음정 배수 단계(있으면 슬라이드 대신 아르페지오)
        public float arpStepTime; // 단계당 초
    }

    public static class SfxGen
    {
        const int Rate = 44100;

        public static AudioClip Generate(SfxParams p, string name = "sfx")
        {
            float total = Mathf.Max(0.02f, p.attack + p.sustain + p.decay);
            int count = Mathf.CeilToInt(total * Rate);
            var data = new float[count];
            var rng = new System.Random(12345); // 결정적 노이즈
            float phase = 0f;
            float duty = p.duty <= 0f ? 0.5f : p.duty;
            float vol = p.volume <= 0f ? 0.5f : p.volume;

            for (int i = 0; i < count; i++)
            {
                float t = (float)i / Rate;

                float env;
                if (t < p.attack) env = p.attack <= 0f ? 1f : t / p.attack;
                else if (t < p.attack + p.sustain) env = 1f;
                else env = p.decay <= 0f ? 0f : Mathf.Clamp01(1f - (t - p.attack - p.sustain) / p.decay);

                float freq = p.startFreq;
                if (p.arpeggio != null && p.arpeggio.Length > 0 && p.arpStepTime > 0f)
                {
                    int step = Mathf.Min(p.arpeggio.Length - 1, (int)(t / p.arpStepTime));
                    freq = p.startFreq * p.arpeggio[step];
                }
                else if (p.endFreq > 0f)
                {
                    freq = Mathf.Lerp(p.startFreq, p.endFreq, t / total);
                }

                phase += freq / Rate;
                if (phase > 1f) phase -= Mathf.Floor(phase);

                float s;
                switch (p.wave)
                {
                    case SfxWave.Square: s = phase < duty ? 1f : -1f; break;
                    case SfxWave.Saw: s = 2f * phase - 1f; break;
                    case SfxWave.Triangle: s = 4f * Mathf.Abs(phase - 0.5f) - 1f; break;
                    case SfxWave.Sine: s = Mathf.Sin(phase * 2f * Mathf.PI); break;
                    case SfxWave.Noise: s = (float)(rng.NextDouble() * 2.0 - 1.0); break;
                    default: s = 0f; break;
                }

                data[i] = s * env * vol;
            }

            var clip = AudioClip.Create(name, count, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }

        public static AudioClip Blip() => Generate(new SfxParams { wave = SfxWave.Square, startFreq = 880, attack = 0.001f, sustain = 0.02f, decay = 0.05f, volume = 0.4f }, "blip");
        public static AudioClip Coin() => Generate(new SfxParams { wave = SfxWave.Square, startFreq = 988, endFreq = 1319, attack = 0.001f, sustain = 0.04f, decay = 0.12f, volume = 0.45f }, "coin");
        public static AudioClip Powerup() => Generate(new SfxParams { wave = SfxWave.Saw, startFreq = 330, endFreq = 880, attack = 0.005f, sustain = 0.08f, decay = 0.16f, volume = 0.4f }, "powerup");
        public static AudioClip Denied() => Generate(new SfxParams { wave = SfxWave.Square, startFreq = 220, endFreq = 110, attack = 0.001f, sustain = 0.05f, decay = 0.1f, volume = 0.4f }, "denied");
        public static AudioClip Tick() => Generate(new SfxParams { wave = SfxWave.Triangle, startFreq = 440, attack = 0.001f, sustain = 0.01f, decay = 0.04f, volume = 0.35f }, "tick");
        public static AudioClip Fanfare() => Generate(new SfxParams { wave = SfxWave.Square, startFreq = 523, attack = 0.005f, sustain = 0.4f, decay = 0.15f, volume = 0.45f, arpeggio = new float[] { 1f, 1.26f, 1.5f, 2f }, arpStepTime = 0.1f }, "fanfare");
        public static AudioClip Stinger() => Generate(new SfxParams { wave = SfxWave.Saw, startFreq = 392, attack = 0.005f, sustain = 0.5f, decay = 0.25f, volume = 0.5f, arpeggio = new float[] { 1f, 1.25f, 1.5f, 2f, 2.5f }, arpStepTime = 0.12f }, "stinger");
    }
}
