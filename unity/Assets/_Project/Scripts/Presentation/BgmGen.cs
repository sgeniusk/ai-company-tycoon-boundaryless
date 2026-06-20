// 절차적 BGM 루프 합성기 — cozy 타이쿤 분위기. 파일 없이 런타임 생성(100% 소유, CC0 에셋 블로커 우회).
// 코드 진행 Cmaj7-Am7-Fmaj7-G7를 베이스·아르페지오·패드 3레이어로 가산 합성한 8.x초 루프.
using UnityEngine;

namespace AICompanyTycoon.Presentation
{
    public static class BgmGen
    {
        const int Rate = 44100;
        const float C4 = 261.63f;                       // C4 기준 주파수

        static float Semi(int n) => Mathf.Pow(2f, n / 12f);  // 반음 → 주파수 배수(12-TET)

        public static AudioClip LoopTrack()
        {
            // 코드 화음 톤(C 루트 기준 반음) — Cmaj7 / Am7 / Fmaj7 / G7
            int[][] chords =
            {
                new[] { 0, 4, 7, 11 },
                new[] { -3, 0, 4, 7 },
                new[] { -7, -3, 0, 5 },
                new[] { -5, -1, 2, 5 },
            };
            int[] bassRoot = { 0, -3, -7, -5 };          // C A F G

            const float chordTime = 2.4f;
            int barSamples = Mathf.CeilToInt(chordTime * Rate);
            int total = barSamples * chords.Length;
            var data = new float[total];

            for (int ci = 0; ci < chords.Length; ci++)
            {
                int baseIdx = ci * barSamples;
                var chord = chords[ci];

                // 베이스 — 코드당 2펄스, 루트 2옥타브 아래 삼각파
                float bassFreq = C4 * Semi(bassRoot[ci] - 24);
                int half = barSamples / 2;
                for (int rep = 0; rep < 2; rep++)
                {
                    AddNote(data, baseIdx + rep * half, half, bassFreq, SfxWave.Triangle, 0.22f, 0.02f, 0.6f);
                }

                // 아르페지오 — 화음 톤 순환, 8분음표, 사인
                const int steps = 8;
                int stepLen = barSamples / steps;
                for (int s = 0; s < steps; s++)
                {
                    float f = C4 * Semi(chord[s % chord.Length]);
                    AddNote(data, baseIdx + s * stepLen, stepLen, f, SfxWave.Sine, 0.14f, 0.06f, 0.5f);
                }

                // 패드 — 화음 톤 한 옥타브 아래로 길게(부드러운 삼각, 화음감)
                foreach (var tone in chord)
                {
                    AddNote(data, baseIdx, barSamples, C4 * Semi(tone) * 0.5f, SfxWave.Triangle, 0.05f, 0.25f, 0.55f);
                }
            }

            // 가산 합성 피크 정규화(클리핑 방지)
            float peak = 0f;
            for (int i = 0; i < total; i++) peak = Mathf.Max(peak, Mathf.Abs(data[i]));
            if (peak > 0.95f)
            {
                float g = 0.95f / peak;
                for (int i = 0; i < total; i++) data[i] *= g;
            }

            var clip = AudioClip.Create("bgm_cozy", total, 1, Rate, false);
            clip.SetData(data, 0);
            return clip;
        }

        // data에 한 노트를 가산한다. atkFrac=어택 비율, relStart=릴리스 시작 비율(부드러운 엔벨로프로 클릭 방지).
        static void AddNote(float[] data, int start, int len, float freq, SfxWave wave, float vol, float atkFrac, float relStart)
        {
            if (len <= 0) return;
            float phase = 0f;
            int atk = Mathf.Max(1, (int)(len * atkFrac));
            int rel = Mathf.Clamp((int)(len * relStart), atk, len - 1);
            for (int i = 0; i < len; i++)
            {
                int idx = start + i;
                if (idx < 0 || idx >= data.Length) break;

                float env;
                if (i < atk) env = (float)i / atk;
                else if (i > rel) env = Mathf.Clamp01(1f - (float)(i - rel) / Mathf.Max(1, len - rel));
                else env = 1f;

                phase += freq / Rate;
                if (phase > 1f) phase -= Mathf.Floor(phase);

                float s;
                switch (wave)
                {
                    case SfxWave.Triangle: s = 4f * Mathf.Abs(phase - 0.5f) - 1f; break;
                    case SfxWave.Sine: s = Mathf.Sin(phase * 2f * Mathf.PI); break;
                    case SfxWave.Square: s = phase < 0.5f ? 1f : -1f; break;
                    default: s = 0f; break;
                }

                data[idx] += s * env * vol;
            }
        }
    }
}
