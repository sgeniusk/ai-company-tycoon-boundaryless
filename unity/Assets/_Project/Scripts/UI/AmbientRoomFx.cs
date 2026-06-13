// 정적 오피스 배경 위 절차 앰비언트 애니 — 모니터 글로우·LED·조명·먼지를 룸별로 연출
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class AmbientRoomFx : MonoBehaviour
    {
        const float CanvasWidth = 240f;
        const float CanvasHeight = 534f;
        const float HalfCanvasWidth = CanvasWidth * 0.5f;
        const float HalfCanvasHeight = CanvasHeight * 0.5f;
        const float FloorY = 384f;
        const float MaxGlowAlpha = 0.4f;
        const int MaxAnimatedChildren = 30;
        const int DistributedFrameBuckets = 3;

        static readonly Color WarmYellow = Hex("f2c14e");
        static readonly Color SoftGold = Hex("f2a93b");
        static readonly Color WarmOrange = Hex("f28a32");
        static readonly Color Mint = Hex("5fd2b4");
        static readonly Color Blue = Hex("56d6e9");
        static readonly Color PaleWhite = Hex("fff0c8");
        static readonly Color Violet = Hex("7b5ed7");
        static readonly Color PlantGreen = Hex("7dc45f");

        readonly List<FxNode> _nodes = new List<FxNode>(MaxAnimatedChildren);
        RectTransform _coverRoot;
        string _roomKey = "office";
        bool _ready;
        bool _visible = true;
        int _frameBucket;

        enum FxKind
        {
            Pulse,
            Flicker,
            Twinkle,
            Blink,
            SequenceBlink,
            Dust,
            Sway,
            Scan
        }

        sealed class FxNode
        {
            public RectTransform Rect;
            public Image Image;
            public FxKind Kind;
            public Color Color;
            public Vector2 BasePosition;
            public float BaseAlpha;
            public float AlphaAmplitude;
            public float Period;
            public float Phase;
            public float Duty;
            public float DriftX;
            public float DriftY;
            public float RotationAmplitude;
            public int SequenceIndex;
            public int SequenceCount;
            public int FrameBucket;
            public bool Distributed;
        }

        public void Init(string roomKey, RectTransform coverRoot)
        {
            _coverRoot = coverRoot;
            _roomKey = NormalizeRoomKey(roomKey);
            Rebuild();
        }

        public void Rebuild()
        {
            Clear();
            _frameBucket = 0;
            _ready = _coverRoot != null;
            if (!_ready)
            {
                return;
            }

            switch (_roomKey)
            {
                case "office_growth":
                    BuildGrowth();
                    break;
                case "office_datacenter":
                    BuildDatacenter();
                    break;
                case "office_landmark":
                    BuildLandmark();
                    break;
                default:
                    BuildOffice();
                    break;
            }
        }

        public void SetVisible(bool visible)
        {
            _visible = visible;
            if (!_visible)
            {
                HideAll();
            }
        }

        void OnDisable()
        {
            HideAll();
        }

        void OnDestroy()
        {
            Clear();
        }

        void Update()
        {
            if (!_ready || !_visible)
            {
                return;
            }

            float time = Time.unscaledTime;
            int currentBucket = _frameBucket;
            _frameBucket = (_frameBucket + 1) % DistributedFrameBuckets;

            for (int i = 0; i < _nodes.Count; i += 1)
            {
                var node = _nodes[i];
                if (node.Distributed && node.FrameBucket != currentBucket)
                {
                    continue;
                }

                UpdateNode(node, time);
            }
        }

        void BuildOffice()
        {
            AddFlicker("PendantStrong", 78f, 78f, 46f, 98f, WarmYellow, 0.07f, 0.26f, 1.0f, 0.3f);
            AddFlicker("PendantSoft", 140f, 78f, 40f, 88f, WarmYellow, 0.05f, 0.18f, 1.0f, 2.1f);
            AddPulse("WindowShimmer", 52f, 90f, 66f, 58f, Mint, 0.06f, 0.13f, 4.0f, 0.2f);
            AddPulse("ShutterFloorSun", 196f, FloorY - 1f, 70f, 22f, WarmYellow, 0.04f, 0.10f, 3.6f, 1.4f);

            int index = 0;
            for (float x = 16f; x <= 160f; x += 14f)
            {
                AddTwinkle("StringLight", x, 150f, 4f, 4f, WarmYellow, 0.03f, 0.25f, 1.25f, index * 0.37f);
                index += 1;
            }

            AddPulse("MonitorGlowA", 55f, 343f, 38f, 22f, Mint, 0.08f, 0.18f, 2.4f, 1.1f);
            AddPulse("MonitorGlowB", 161f, 343f, 38f, 22f, Blue, 0.07f, 0.17f, 2.7f, 2.5f);
            AddDust("DustWindowA", 38f, 108f, 2.5f, PaleWhite, 0.04f, 0.14f, 6.2f, 0.0f, 5f, 8f);
            AddDust("DustWindowB", 70f, 124f, 2.0f, PaleWhite, 0.03f, 0.13f, 5.4f, 1.7f, 4f, 7f);
            AddDust("DustPendant", 112f, 96f, 2.2f, PaleWhite, 0.03f, 0.12f, 6.8f, 3.4f, 6f, 6f);
        }

        void BuildGrowth()
        {
            AddPulse("DaylightLeft", 58f, 84f, 84f, 78f, PaleWhite, 0.05f, 0.15f, 4.2f, 0.1f);
            AddPulse("DaylightRight", 182f, 84f, 84f, 78f, Mint, 0.04f, 0.13f, 4.4f, 1.9f);
            AddPulse("PendantLeft", 54f, 70f, 36f, 72f, WarmYellow, 0.04f, 0.12f, 3.1f, 0.3f);
            AddPulse("PendantCenter", 118f, 70f, 40f, 78f, WarmYellow, 0.05f, 0.14f, 3.0f, 1.4f);
            AddPulse("PendantRight", 182f, 70f, 36f, 72f, WarmYellow, 0.04f, 0.12f, 3.2f, 2.5f);
            AddPulse("NeonPoster", 129f, 228f, 72f, 58f, Mint, 0.10f, 0.23f, 2.6f, 0.8f);
            AddPulse("MonitorGlowA", 43f, FloorY - 41f, 36f, 22f, Mint, 0.08f, 0.17f, 2.4f, 0.5f);
            AddPulse("MonitorGlowB", 121f, FloorY - 41f, 36f, 22f, Blue, 0.08f, 0.17f, 2.6f, 1.7f);
            AddPulse("MonitorGlowC", 203f, FloorY - 41f, 36f, 22f, Mint, 0.08f, 0.17f, 2.8f, 2.9f);
            AddSway("PlantFloorA", 86f, FloorY - 30f, 18f, 34f, PlantGreen, 0.10f, 0.07f, 4.9f, 0.0f, 1.5f, 2.5f);
            AddSway("PlantFloorB", 170f, FloorY - 31f, 20f, 36f, PlantGreen, 0.10f, 0.07f, 5.4f, 1.2f, 1.7f, 2.6f);
            AddSway("PlantWall", 170f, 206f, 16f, 28f, PlantGreen, 0.08f, 0.06f, 4.5f, 2.5f, 1.2f, 2.0f);
        }

        void BuildDatacenter()
        {
            AddRackLeds("RackLeft", 8f, 42f, 70f, 338f, 0);
            AddRackLeds("RackRight", 162f, 42f, 70f, 338f, 10);
            AddScan("DashboardTop", 120f, 73f, 54f, 5f, Mint, 0.07f, 0.18f, 2.2f, 0.0f, 12f);
            AddScan("DashboardBottom", 120f, 119f, 54f, 5f, Blue, 0.06f, 0.17f, 2.5f, 1.3f, 12f);

            AddSequence("SignalTowerA", 117f, 251f, 8f, 8f, Mint, 0.04f, 0.34f, 1.2f, 0, 4);
            AddSequence("SignalTowerB", 117f, 265f, 8f, 8f, WarmYellow, 0.04f, 0.32f, 1.2f, 1, 4);
            AddSequence("SignalTowerC", 117f, 279f, 8f, 8f, Blue, 0.04f, 0.32f, 1.2f, 2, 4);
            AddSequence("SignalTowerD", 117f, 293f, 8f, 8f, WarmOrange, 0.04f, 0.32f, 1.2f, 3, 4);

            AddBlink("StatusTileA", 96f, 162f, 18f, 10f, Mint, 0.03f, 0.22f, 1.5f, 0.10f, 0.55f);
            AddBlink("StatusTileB", 128f, 171f, 18f, 10f, WarmYellow, 0.03f, 0.20f, 1.8f, 0.60f, 0.45f);
            AddBlink("WorldClock", 112f, 220f, 30f, 8f, Blue, 0.03f, 0.18f, 2.2f, 0.35f, 0.50f);
            AddPulse("CoolingGlow", 82f, 211f, 16f, 334f, Mint, 0.04f, 0.14f, 4.6f, 0.4f);
        }

        void BuildLandmark()
        {
            AddPulse("SunsetWindow", 120f, 92f, 220f, 118f, WarmOrange, 0.05f, 0.16f, 6.4f, 0.2f);
            AddPulse("PurpleWindowWash", 120f, 108f, 210f, 82f, Violet, 0.03f, 0.10f, 7.2f, 2.4f);

            AddTwinkle("CityLightA", 28f, 116f, 3f, 3f, WarmYellow, 0.02f, 0.20f, 1.6f, 0.1f);
            AddTwinkle("CityLightB", 64f, 96f, 2.5f, 2.5f, PaleWhite, 0.02f, 0.18f, 1.9f, 1.0f);
            AddTwinkle("CityLightC", 106f, 124f, 3f, 3f, WarmYellow, 0.02f, 0.19f, 1.5f, 2.0f);
            AddTwinkle("CityLightD", 154f, 100f, 2.5f, 2.5f, PaleWhite, 0.02f, 0.18f, 1.8f, 2.9f);
            AddTwinkle("CityLightE", 202f, 120f, 3f, 3f, WarmYellow, 0.02f, 0.20f, 1.7f, 3.8f);

            AddPulse("DownlightA", 30f, 58f, 26f, 64f, SoftGold, 0.04f, 0.12f, 3.8f, 0.0f);
            AddPulse("DownlightB", 74f, 58f, 26f, 64f, SoftGold, 0.04f, 0.12f, 3.8f, 0.8f);
            AddPulse("DownlightC", 118f, 58f, 28f, 68f, SoftGold, 0.05f, 0.13f, 3.8f, 1.6f);
            AddPulse("DownlightD", 162f, 58f, 26f, 64f, SoftGold, 0.04f, 0.12f, 3.8f, 2.4f);
            AddPulse("DownlightE", 206f, 58f, 26f, 64f, SoftGold, 0.04f, 0.12f, 3.8f, 3.2f);

            AddPulse("LogoWallGlow", 120f, 164f, 58f, 34f, Mint, 0.08f, 0.19f, 3.4f, 0.7f);
            AddTwinkle("GoldAward", 38f, 220f, 18f, 20f, SoftGold, 0.06f, 0.25f, 1.3f, 1.5f);
            AddSway("LargePlantLeft", 10f, FloorY - 42f, 22f, 52f, PlantGreen, 0.09f, 0.07f, 6.0f, 0.0f, 1.8f, 2.2f);
            AddSway("LargePlantRight", 224f, FloorY - 44f, 22f, 54f, PlantGreen, 0.09f, 0.07f, 6.4f, 2.0f, 1.8f, 2.2f);
        }

        void AddRackLeds(string prefix, float x, float y, float width, float height, int seedOffset)
        {
            float[] xs = { 0.18f, 0.42f, 0.66f, 0.84f, 0.30f, 0.58f, 0.78f, 0.22f, 0.50f, 0.72f };
            float[] ys = { 0.08f, 0.17f, 0.27f, 0.38f, 0.49f, 0.58f, 0.68f, 0.78f, 0.87f, 0.94f };
            Color[] colors = { Mint, WarmYellow, Blue, Mint, Blue, WarmYellow, Mint, Blue, Mint, WarmYellow };

            for (int i = 0; i < xs.Length; i += 1)
            {
                float cx = x + width * xs[i];
                float cy = y + height * ys[i];
                float phase = 0.11f * (seedOffset + i);
                float period = 0.55f + 0.09f * ((seedOffset + i) % 5);
                float duty = 0.34f + 0.05f * ((seedOffset + i) % 4);
                AddBlink(prefix + i, cx, cy, 3f, 3f, colors[i], 0.02f, 0.36f, period, phase, duty);
            }
        }

        void AddPulse(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase)
        {
            AddNode(name, FxKind.Pulse, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, 0.5f, 0f, 0f, 0f, 0, 0, false);
        }

        void AddFlicker(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase)
        {
            AddNode(name, FxKind.Flicker, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, 0.5f, 0f, 0f, 0f, 0, 0, false);
        }

        void AddTwinkle(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase)
        {
            AddNode(name, FxKind.Twinkle, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, 0.25f, 0f, 0f, 0f, 0, 0, true);
        }

        void AddBlink(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase, float duty)
        {
            AddNode(name, FxKind.Blink, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, duty, 0f, 0f, 0f, 0, 0, true);
        }

        void AddSequence(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, int sequenceIndex, int sequenceCount)
        {
            AddNode(name, FxKind.SequenceBlink, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, 0f, 0.5f, 0f, 0f, 0f, sequenceIndex, sequenceCount, true);
        }

        void AddDust(string name, float cx, float cy, float size, Color color, float baseAlpha, float alphaAmplitude, float period, float phase, float driftX, float driftY)
        {
            AddNode(name, FxKind.Dust, cx, cy, size, size, color, baseAlpha, alphaAmplitude, period, phase, 0.5f, driftX, driftY, 0f, 0, 0, false);
        }

        void AddSway(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase, float driftX, float rotationAmplitude)
        {
            AddNode(name, FxKind.Sway, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, 0.5f, driftX, 0f, rotationAmplitude, 0, 0, false);
        }

        void AddScan(string name, float cx, float cy, float width, float height, Color color, float baseAlpha, float alphaAmplitude, float period, float phase, float driftY)
        {
            AddNode(name, FxKind.Scan, cx, cy, width, height, color, baseAlpha, alphaAmplitude, period, phase, 0.5f, 0f, driftY, 0f, 0, 0, true);
        }

        void AddNode(
            string name,
            FxKind kind,
            float cx,
            float cy,
            float width,
            float height,
            Color color,
            float baseAlpha,
            float alphaAmplitude,
            float period,
            float phase,
            float duty,
            float driftX,
            float driftY,
            float rotationAmplitude,
            int sequenceIndex,
            int sequenceCount,
            bool distributed)
        {
            if (_coverRoot == null || _nodes.Count >= MaxAnimatedChildren)
            {
                return;
            }

            var go = new GameObject("Ambient_" + name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(_coverRoot, false);

            var rect = go.GetComponent<RectTransform>();
            // SafeArea/cover 오프셋은 coverRoot transform에 이미 들어와 있다. 자식은 네이티브 캔버스 좌표만 쓴다.
            rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.sizeDelta = new Vector2(width, height);
            rect.anchoredPosition = CanvasToLocal(cx, cy);

            var image = go.GetComponent<Image>();
            image.raycastTarget = false;
            image.color = WithAlpha(color, 0f);

            var node = new FxNode
            {
                Rect = rect,
                Image = image,
                Kind = kind,
                Color = color,
                BasePosition = rect.anchoredPosition,
                BaseAlpha = Mathf.Clamp(baseAlpha, 0f, MaxGlowAlpha),
                AlphaAmplitude = Mathf.Clamp(alphaAmplitude, 0f, MaxGlowAlpha),
                Period = Mathf.Max(0.01f, period),
                Phase = phase,
                Duty = Mathf.Clamp01(duty),
                DriftX = driftX,
                DriftY = driftY,
                RotationAmplitude = rotationAmplitude,
                SequenceIndex = sequenceIndex,
                SequenceCount = Mathf.Max(1, sequenceCount),
                FrameBucket = _nodes.Count % DistributedFrameBuckets,
                Distributed = distributed
            };

            _nodes.Add(node);
        }

        void UpdateNode(FxNode node, float time)
        {
            float alpha;
            switch (node.Kind)
            {
                case FxKind.Flicker:
                    alpha = FlickerAlpha(node, time);
                    break;
                case FxKind.Twinkle:
                    alpha = TwinkleAlpha(node, time);
                    break;
                case FxKind.Blink:
                    alpha = BlinkAlpha(node, time);
                    break;
                case FxKind.SequenceBlink:
                    alpha = SequenceAlpha(node, time);
                    break;
                case FxKind.Dust:
                    UpdateDust(node, time);
                    return;
                case FxKind.Sway:
                    UpdateSway(node, time);
                    return;
                case FxKind.Scan:
                    UpdateScan(node, time);
                    return;
                default:
                    alpha = PulseAlpha(node, time);
                    break;
            }

            ApplyAlpha(node, alpha);
        }

        void UpdateDust(FxNode node, float time)
        {
            float speed = TwoPi / node.Period;
            float waveX = Mathf.Sin(time * speed + node.Phase);
            float waveY = Mathf.Sin(time * speed * 0.7f + node.Phase * 1.37f);
            node.Rect.anchoredPosition = node.BasePosition + new Vector2(waveX * node.DriftX, waveY * node.DriftY);
            ApplyAlpha(node, PulseAlpha(node, time * 0.8f));
        }

        void UpdateSway(FxNode node, float time)
        {
            float speed = TwoPi / node.Period;
            float sway = Mathf.Sin(time * speed + node.Phase);
            node.Rect.anchoredPosition = node.BasePosition + new Vector2(sway * node.DriftX, 0f);
            node.Rect.localRotation = Quaternion.Euler(0f, 0f, sway * node.RotationAmplitude);
            ApplyAlpha(node, PulseAlpha(node, time));
        }

        void UpdateScan(FxNode node, float time)
        {
            float speed = TwoPi / node.Period;
            float wave = Mathf.Sin(time * speed + node.Phase);
            node.Rect.anchoredPosition = node.BasePosition + new Vector2(0f, wave * node.DriftY);
            ApplyAlpha(node, PulseAlpha(node, time));
        }

        float PulseAlpha(FxNode node, float time)
        {
            float wave = 0.5f + 0.5f * Mathf.Sin(time * TwoPi / node.Period + node.Phase);
            return node.BaseAlpha + node.AlphaAmplitude * wave;
        }

        float FlickerAlpha(FxNode node, float time)
        {
            float fast = 0.5f + 0.5f * Mathf.Sin(time * 8.7f + node.Phase);
            float buzz = 0.5f + 0.5f * Mathf.Sin(time * 17.3f + node.Phase * 1.7f);
            float step = Mathf.Floor((time + node.Phase) * 8f);
            float pseudo = Frac(Mathf.Sin(step * 12.9898f + node.Phase * 78.233f) * 43758.5453f);
            float dip = pseudo < 0.13f ? 0.18f : 1f;
            float mixed = (fast * 0.38f + buzz * 0.32f + dip * 0.30f);
            return node.BaseAlpha + node.AlphaAmplitude * mixed;
        }

        float TwinkleAlpha(FxNode node, float time)
        {
            float wave = 0.5f + 0.5f * Mathf.Sin(time * TwoPi / node.Period + node.Phase);
            float sparkle = wave * wave * wave;
            return node.BaseAlpha + node.AlphaAmplitude * sparkle;
        }

        float BlinkAlpha(FxNode node, float time)
        {
            float cycle = Mathf.Repeat(time / node.Period + node.Phase, 1f);
            return cycle <= node.Duty ? node.BaseAlpha + node.AlphaAmplitude : node.BaseAlpha;
        }

        float SequenceAlpha(FxNode node, float time)
        {
            float cycle = Mathf.Repeat(time / node.Period, 1f);
            int activeIndex = Mathf.FloorToInt(cycle * node.SequenceCount);
            return activeIndex == node.SequenceIndex ? node.BaseAlpha + node.AlphaAmplitude : node.BaseAlpha;
        }

        void ApplyAlpha(FxNode node, float alpha)
        {
            node.Image.color = WithAlpha(node.Color, Mathf.Clamp(alpha, 0f, MaxGlowAlpha));
        }

        void HideAll()
        {
            for (int i = 0; i < _nodes.Count; i += 1)
            {
                var node = _nodes[i];
                if (node.Image != null)
                {
                    node.Image.color = WithAlpha(node.Color, 0f);
                }
            }
        }

        void Clear()
        {
            for (int i = _nodes.Count - 1; i >= 0; i -= 1)
            {
                var node = _nodes[i];
                if (node.Rect == null)
                {
                    continue;
                }

                if (Application.isPlaying)
                {
                    Destroy(node.Rect.gameObject);
                }
                else
                {
                    DestroyImmediate(node.Rect.gameObject);
                }
            }

            _nodes.Clear();
            _ready = false;
        }

        static Vector2 CanvasToLocal(float cx, float cy)
        {
            return new Vector2(cx - HalfCanvasWidth, HalfCanvasHeight - cy);
        }

        static string NormalizeRoomKey(string roomKey)
        {
            switch (roomKey)
            {
                case "office_growth":
                case "office_datacenter":
                case "office_landmark":
                case "office":
                    return roomKey;
                default:
                    return "office";
            }
        }

        static Color WithAlpha(Color color, float alpha)
        {
            color.a = alpha;
            return color;
        }

        static float Frac(float value)
        {
            return value - Mathf.Floor(value);
        }

        static Color Hex(string hex)
        {
            return new Color(
                int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                1f);
        }

        const float TwoPi = Mathf.PI * 2f;
    }
}
