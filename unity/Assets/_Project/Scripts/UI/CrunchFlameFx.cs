// 열일·크런치 직원을 감싸는 픽셀 불꽃 오버레이 — 켜져 있는 동안 계속 타오르는 지속 루프.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    // target(직원 셀) 위에 같은 부모로 불꽃 클러스터를 올리고, 직원보다 살짝 앞에서 일렁인다.
    // 결정적 Time.time 기반 — 각 혀가 자기 위상으로 솟고 흔들리며, 수명이 끝나면 같은 사이클 안에서 바닥부터 재생성된다.
    // Update 내 할당 0 — 혀 풀을 Init에서 한 번만 만들고 재사용한다.
    public class CrunchFlameFx : MonoBehaviour
    {
        // 따뜻한 그라데이션 — 바닥 RED → ORANGE → YELLOW → 끝 CREAM. 위로 갈수록 밝아진다.
        static readonly Color FlameRed = Hex("d64838");
        static readonly Color FlameOrange = Hex("e89043");
        static readonly Color FlameYellow = Hex("f4cc70");
        static readonly Color FlameCream = Hex("fbf0cf");

        const float FadeOutDuration = 0.32f;

        // 한 혀의 결정적 파라미터 묶음. Update는 이 캐시만 읽고 자식 rect/Image만 갱신한다.
        struct Tongue
        {
            public RectTransform Rect;
            public Image Image;
            public float Phase;       // 0~1 수명 위상 오프셋 (혀마다 분산)
            public float RiseRate;    // 초당 수명 진행 (1이면 1초에 한 사이클)
            public float LaneX;       // 좌우 기준 위치 (하반신 좌·우에서 솟음)
            public float PeakHeight;  // 이 혀가 솟는 최고 높이
            public float WobbleAmp;   // 좌우 흔들 진폭
            public float WobbleRate;  // 좌우 흔들 속도
            public float WobblePhase; // 좌우 흔들 위상
            public float BaseWidth;   // 바닥에서의 폭
            public float FlickerRate; // 알파 깜빡 속도
            public float FlickerPhase;
        }

        RectTransform _root;
        Tongue[] _tongues;
        float _intensity = 1f;
        bool _ready;
        bool _stopping;
        float _stopStartTime;

        // target 셀 기준으로 불꽃을 띄운다. 같은 부모에 sibling으로 붙어 직원보다 한 칸 앞에서 그려진다.
        public void Init(RectTransform target, float intensity = 1f)
        {
            if (target == null)
            {
                _ready = false;
                return;
            }

            _intensity = Mathf.Clamp(intensity, 0.35f, 2.5f);

            BuildRoot(target);
            BuildTongues(target);

            _ready = _tongues != null && _tongues.Length > 0;
            _stopping = false;
        }

        // 페이드아웃 후 소멸. 다시 Init하지 않는 한 이 인스턴스는 끝난다.
        public void Stop()
        {
            if (_stopping)
            {
                return;
            }

            _stopping = true;
            _stopStartTime = Time.time;

            // 풀이 없으면(=Init 실패) 즉시 정리.
            if (!_ready)
            {
                DestroySelf();
            }
        }

        void BuildRoot(RectTransform target)
        {
            var go = new GameObject("CrunchFlame", typeof(RectTransform));
            _root = go.GetComponent<RectTransform>();

            var parent = target.parent;
            if (parent != null)
            {
                // 같은 부모 — 직원 셀과 동일 좌표계. HBox 같은 레이아웃이 재배치하지 못하게 ignoreLayout.
                _root.SetParent(parent, false);
                var ignore = go.AddComponent<LayoutElement>();
                ignore.ignoreLayout = true;

                // target 바로 다음 sibling = 직원보다 한 칸 앞에 그려짐(uGUI는 sibling index 큰 쪽이 위).
                int idx = target.GetSiblingIndex();
                _root.SetSiblingIndex(idx + 1);
            }
            else
            {
                _root.SetParent(target, false);
            }

            // target과 같은 크기·위치로 정렬해 셀 위에 정확히 오버레이.
            _root.anchorMin = target.anchorMin;
            _root.anchorMax = target.anchorMax;
            _root.pivot = target.pivot;
            _root.sizeDelta = target.sizeDelta;
            _root.anchoredPosition = target.anchoredPosition;
            _root.localScale = Vector3.one;
        }

        void BuildTongues(RectTransform target)
        {
            // 개수는 intensity로 8~14개 스케일. 결정적 시드 — 같은 셀이면 같은 모양.
            int count = Mathf.Clamp(Mathf.RoundToInt(8f + _intensity * 4f), 8, 14);

            // 셀 폭/높이 추정 — 0이면(레이아웃 미확정) 기본 액터 셀 크기로 폴백.
            float cellW = target.sizeDelta.x > 1f ? target.sizeDelta.x : 150f;
            float cellH = target.sizeDelta.y > 1f ? target.sizeDelta.y : 164f;

            // 위상 분산용 결정적 RNG — Init 단계에서만 쓰고 Update에서는 안 쓴다.
            var rng = new System.Random(unchecked(target.GetInstanceID() * 73856093) ^ count);

            _tongues = new Tongue[count];
            for (int i = 0; i < count; i += 1)
            {
                var go = new GameObject("flameTongue", typeof(RectTransform), typeof(Image));
                go.transform.SetParent(_root, false);

                var image = go.GetComponent<Image>();
                image.raycastTarget = false;

                var rect = go.GetComponent<RectTransform>();
                // 바닥 가운데 기준 — pivot 아래로 두면 위로 솟는 느낌이 자연스럽다.
                rect.anchorMin = new Vector2(0.5f, 0f);
                rect.anchorMax = new Vector2(0.5f, 0f);
                rect.pivot = new Vector2(0.5f, 0f);

                // 좌우에서 솟아 가운데로 모이게 — 바닥은 넓게 퍼지고 중심으로 약간 당긴다.
                float spread = (float)(rng.NextDouble() * 2.0 - 1.0); // -1~1
                float laneX = spread * cellW * 0.34f;

                // 얼굴은 안 가리게 peak를 중간 높이(셀의 ~62%)까지만. 가운데 혀가 가장 높다.
                float centerBias = 1f - Mathf.Abs(spread) * 0.45f; // 가운데일수록 1, 가장자리는 낮게
                // intensity로 높이를 키우되, 얼굴(상단 1/3)을 덮지 않게 셀의 68%로 상한을 둔다.
                float peak = Mathf.Min(cellH * (0.34f + 0.28f * centerBias) * _intensity, cellH * 0.68f);

                _tongues[i] = new Tongue
                {
                    Rect = rect,
                    Image = image,
                    Phase = (float)rng.NextDouble(),
                    RiseRate = 0.9f + (float)rng.NextDouble() * 0.7f,
                    LaneX = laneX,
                    PeakHeight = peak,
                    WobbleAmp = (8f + (float)rng.NextDouble() * 14f) * _intensity,
                    WobbleRate = 4.5f + (float)rng.NextDouble() * 3.5f,
                    WobblePhase = (float)(rng.NextDouble() * Mathf.PI * 2.0),
                    BaseWidth = (16f + (float)rng.NextDouble() * 12f) * Mathf.Lerp(0.8f, 1.25f, _intensity / 2.5f),
                    FlickerRate = 9f + (float)rng.NextDouble() * 7f,
                    FlickerPhase = (float)(rng.NextDouble() * Mathf.PI * 2.0),
                };

                // 첫 프레임부터 깨지지 않게 초기 상태 1회 적용.
                ApplyTongue(ref _tongues[i], 1f);
            }
        }

        void Update()
        {
            if (!_ready)
            {
                return;
            }

            float groupAlpha = 1f;
            if (_stopping)
            {
                float k = (Time.time - _stopStartTime) / FadeOutDuration;
                if (k >= 1f)
                {
                    DestroySelf();
                    return;
                }

                groupAlpha = 1f - k;
            }

            float t = Time.time;
            for (int i = 0; i < _tongues.Length; i += 1)
            {
                // 결정적 수명 위상 — 0에서 1로 갔다가 다시 0(바닥)으로 재생성되는 톱니파.
                float life = Repeat01(t * _tongues[i].RiseRate + _tongues[i].Phase);
                ApplyTongue(ref _tongues[i], life, groupAlpha);
            }
        }

        // 한 혀의 한 사이클(life 0=바닥 갓 생성, 1=정점에서 소멸 직전)을 rect/Image에 반영.
        void ApplyTongue(ref Tongue tongue, float life, float groupAlpha = 1f)
        {
            // 솟음 — 바닥(0)에서 peak까지 약간 감속하며 올라간다.
            float ease = 1f - (1f - life) * (1f - life);
            float y = ease * tongue.PeakHeight;

            // 좌우 흔들 — sin wobble. 위로 갈수록 흔들림이 커진다(불혀가 휘는 느낌).
            float wobble = Mathf.Sin(Time.time * tongue.WobbleRate + tongue.WobblePhase)
                           * tongue.WobbleAmp * (0.35f + life * 0.65f);
            // 위로 갈수록 가운데로 모임 — laneX를 life에 따라 0쪽으로 당긴다.
            float x = Mathf.Lerp(tongue.LaneX, tongue.LaneX * 0.25f, life) + wobble;

            // 위로 갈수록 작아짐 + 스케일 wobble. 바닥에서 크고 정점에서 작게.
            float shrink = Mathf.Lerp(1f, 0.32f, life);
            float scaleWobble = 1f + 0.14f * Mathf.Sin(Time.time * (tongue.WobbleRate * 1.3f) + tongue.WobblePhase);
            float w = tongue.BaseWidth * shrink * scaleWobble;
            float h = tongue.BaseWidth * 1.5f * shrink * scaleWobble; // 세로로 길쭉한 혀

            tongue.Rect.anchoredPosition = new Vector2(x, y);
            tongue.Rect.sizeDelta = new Vector2(w, h);

            // 색 — 높이(life)에 따라 RED→ORANGE→YELLOW→CREAM 4단 그라데이션.
            var color = SampleFlame(life);

            // 알파 flicker — 위상 분산된 sin으로 일렁임. 생성/소멸 끝에서 부드럽게 페이드.
            float flicker = 0.78f + 0.22f * Mathf.Sin(Time.time * tongue.FlickerRate + tongue.FlickerPhase);
            float edgeFade = Mathf.Clamp01(life * 5f) * Mathf.Clamp01((1f - life) * 3.2f + 0.15f);
            color.a = flicker * edgeFade * groupAlpha;

            tongue.Image.color = color;
        }

        // life 0~1을 4색 따뜻한 그라데이션으로 보간. 밝은 사각이 겹쳐 가산 느낌을 낸다.
        static Color SampleFlame(float life)
        {
            if (life < 0.34f)
            {
                return Color.Lerp(FlameRed, FlameOrange, life / 0.34f);
            }

            if (life < 0.7f)
            {
                return Color.Lerp(FlameOrange, FlameYellow, (life - 0.34f) / 0.36f);
            }

            return Color.Lerp(FlameYellow, FlameCream, (life - 0.7f) / 0.3f);
        }

        // 0~1 톱니파 — Mathf.Repeat의 할당 없는 결정적 버전.
        static float Repeat01(float v)
        {
            float frac = v - Mathf.Floor(v);
            return frac < 0f ? frac + 1f : frac;
        }

        void DestroySelf()
        {
            _ready = false;
            if (_root != null)
            {
                Destroy(_root.gameObject);
                _root = null;
            }

            Destroy(this);
        }

        void OnDestroy()
        {
            // 컴포넌트가 외부에서 파괴될 때 떠 있는 불꽃 루트도 같이 정리.
            if (_root != null)
            {
                Destroy(_root.gameObject);
                _root = null;
            }
        }

        static Color Hex(string hex)
        {
            return new Color(
                int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                1f);
        }
    }
}
