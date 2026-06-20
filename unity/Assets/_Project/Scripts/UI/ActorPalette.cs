// 직원 액터 스프라이트를 시드 기반으로 재색해 직원마다 다른 의상/바디 색을 준다 (feat-023 다양성). 색상대(hue band)만 이동 — 피부·아웃라인·금속은 보존. (kind,pose,변형) 캐시로 월마다 재생성 안 함.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public static class ActorPalette
    {
        public const int VariantCount = 6; // 0=원본 + 5 재색

        static readonly Dictionary<string, Sprite> _cache = new Dictionary<string, Sprite>();

        // human {조끼, 바지, 머리}, ai {바디}, robot {섀시} 의 변형별 hue 이동량.
        static readonly float[][] HumanShifts =
        {
            new[] { 0f, 0f, 0f },
            new[] { 0.45f, 0.20f, 0.35f },
            new[] { -0.25f, 0.40f, 0.55f },
            new[] { 0.18f, -0.30f, 0.15f },
            new[] { 0.60f, 0.10f, 0.50f },
            new[] { -0.40f, 0.55f, 0.30f },
        };
        static readonly float[][] AiShifts =
        {
            new[] { 0f }, new[] { 0.26f }, new[] { -0.32f }, new[] { 0.50f }, new[] { 0.13f }, new[] { -0.50f },
        };
        static readonly float[][] RobotShifts =
        {
            new[] { 0f }, new[] { 0.32f }, new[] { -0.26f }, new[] { 0.50f }, new[] { 0.16f }, new[] { -0.46f },
        };

        // 시드 → 변형 id. 인접 시드(같은 줄 이웃)가 다른 변형이 되게 흩뜨린다. 결정적.
        public static int VariantFor(int seed)
        {
            int v = (seed * 5 + 1) % VariantCount;
            return v < 0 ? v + VariantCount : v;
        }

        // kind+pose 스프라이트를 변형 색으로. 변형 0·스프라이트 없음·미지원 kind면 원본 그대로.
        public static Sprite Recolored(string kind, string poseSuffix, int variant)
        {
            string key = kind + poseSuffix + "#" + variant;
            if (_cache.TryGetValue(key, out var cached))
            {
                return cached;
            }

            var baseSprite = IconLibrary.Get(kind + poseSuffix);
            float[] shifts = ShiftsFor(kind, variant);
            Sprite result = baseSprite;
            if (baseSprite != null && variant > 0 && shifts != null)
            {
                result = BuildRecolored(baseSprite, kind, shifts);
            }
            _cache[key] = result;
            return result;
        }

        static float[] ShiftsFor(string kind, int variant)
        {
            float[][] table =
                kind == "actor_human" ? HumanShifts :
                kind == "actor_ai" ? AiShifts :
                kind == "actor_robot" ? RobotShifts : null;
            if (table == null || variant < 0 || variant >= table.Length)
            {
                return null;
            }
            return table[variant];
        }

        static Sprite BuildRecolored(Sprite baseSprite, string kind, float[] shifts)
        {
            var srcTex = baseSprite.texture;
            int w = srcTex.width, h = srcTex.height;
            Color32[] pixels;
            try
            {
                pixels = srcTex.GetPixels32();
            }
            catch
            {
                return baseSprite; // isReadable 아니면 원본 폴백
            }

            for (int i = 0; i < pixels.Length; i++)
            {
                pixels[i] = RecolorPixel(pixels[i], kind, shifts);
            }

            var tex = new Texture2D(w, h, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Point,
                wrapMode = TextureWrapMode.Clamp,
            };
            tex.SetPixels32(pixels);
            tex.Apply();
            return Sprite.Create(tex, new Rect(0, 0, w, h), new Vector2(0.5f, 0.5f), baseSprite.pixelsPerUnit);
        }

        // 픽셀의 색상대를 보고 의상/바디 영역이면 hue를 이동. 피부(주황대)·아웃라인(무채색)·금속(저채도)은 건드리지 않는다.
        static Color32 RecolorPixel(Color32 c, string kind, float[] shifts)
        {
            if (c.a < 40)
            {
                return c;
            }
            Color.RGBToHSV(new Color(c.r / 255f, c.g / 255f, c.b / 255f), out float hue, out float sat, out float val);
            float dh = 0f;
            if (kind == "actor_human")
            {
                if (hue > 0.33f && hue < 0.50f && sat > 0.12f && val > 0.25f) dh = shifts[0];        // 조끼(녹색대)
                else if (hue > 0.48f && hue < 0.65f && sat > 0.10f && val < 0.45f) dh = shifts[1];   // 바지(청색·어두움)
                else if (sat > 0.06f && val < 0.42f && (hue < 0.12f || hue > 0.85f)) dh = shifts[2]; // 머리(갈색대·어두움)
            }
            else if (kind == "actor_ai")
            {
                if (hue > 0.60f && hue < 0.82f && sat > 0.12f) dh = shifts[0]; // violet 바디
            }
            else if (kind == "actor_robot")
            {
                if (hue > 0.54f && hue < 0.68f && sat > 0.20f) dh = shifts[0]; // 섀시(채도 있는 청색만 — 금속 그레이 보존)
            }

            if (Mathf.Abs(dh) < 0.0001f)
            {
                return c;
            }
            float nh = Mathf.Repeat(hue + dh, 1f);
            Color nc = Color.HSVToRGB(nh, sat, val);
            return new Color32((byte)(nc.r * 255f), (byte)(nc.g * 255f), (byte)(nc.b * 255f), c.a);
        }
    }
}
