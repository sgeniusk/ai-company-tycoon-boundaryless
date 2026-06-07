// 출시·승급 같은 순간에 화면 위로 색종이 버스트를 코드로 뿌리는 연출기입니다. ParticleSystem/DOTween 불필요, GameEvents 구독.
using System.Collections;
using AICompanyTycoon.Core;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class FxManager : MonoBehaviour
    {
        static FxManager _instance;
        Canvas _canvas;
        RectTransform _root;

        const float RefWidth = 1080f;
        const float RefHeight = 1920f;

        static readonly Color[] GoldCyan = { Hex("f2c14e"), Hex("56d6e9"), Hex("fff0c8"), Hex("a9e45c") };
        static readonly Color[] Festive = { Hex("f2c14e"), Hex("dd6f48"), Hex("56d6e9"), Hex("a9e45c"), Hex("fff0c8"), Hex("7b5ed7") };
        static readonly Color[] Cool = { Hex("56d6e9"), Hex("7ed6f1"), Hex("dfeaff") };
        static readonly Color[] Warm = { Hex("f2c14e"), Hex("f28a32"), Hex("fff0c8") };

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Bootstrap()
        {
            if (_instance != null)
            {
                return;
            }

            var go = new GameObject("FxManager");
            DontDestroyOnLoad(go);
            go.AddComponent<FxManager>();
        }

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            BuildCanvas();
            Subscribe();
        }

        void OnDestroy()
        {
            if (_instance == this)
            {
                Unsubscribe();
            }
        }

        // UI 위에 겹치는 전용 오버레이 캔버스. 입력은 통과시킨다.
        void BuildCanvas()
        {
            _canvas = gameObject.AddComponent<Canvas>();
            _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            _canvas.sortingOrder = 200;

            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(RefWidth, RefHeight);
            scaler.matchWidthOrHeight = 1f;

            _root = _canvas.GetComponent<RectTransform>();
        }

        void Subscribe()
        {
            GameEvents.ProductLaunched += OnProductLaunched;
            GameEvents.CompanyStageChanged += OnStageChanged;
            GameEvents.CapabilityUpgraded += OnCapabilityUpgraded;
            GameEvents.DomainUnlocked += OnDomainUnlocked;
        }

        void Unsubscribe()
        {
            GameEvents.ProductLaunched -= OnProductLaunched;
            GameEvents.CompanyStageChanged -= OnStageChanged;
            GameEvents.CapabilityUpgraded -= OnCapabilityUpgraded;
            GameEvents.DomainUnlocked -= OnDomainUnlocked;
        }

        void OnProductLaunched(string id) => Burst(0.18f, 26, GoldCyan, 1.0f);
        void OnStageChanged(string id) => Burst(0.06f, 40, Festive, 1.3f);
        void OnCapabilityUpgraded(string id, int level) => Burst(0.0f, 14, Cool, 0.8f);
        void OnDomainUnlocked(string id) => Burst(0.04f, 18, Warm, 0.9f);

        // 외부에서 직접 터뜨리는 정적 진입점.
        public static void Celebrate(float heightFraction = 0.1f, int count = 24, float scale = 1f)
        {
            if (_instance != null)
            {
                _instance.Burst(heightFraction, count, Festive, scale);
            }
        }

        // 화면 중앙에서 heightFraction(위가 +)만큼 띄운 지점에서 count 조각을 방사형으로 뿌린다.
        void Burst(float heightFraction, int count, Color[] palette, float scale)
        {
            if (_root == null || count <= 0)
            {
                return;
            }

            var center = new Vector2(0f, heightFraction * RefHeight);
            for (int i = 0; i < count; i += 1)
            {
                var piece = NewPiece(palette[i % palette.Length], scale);
                StartCoroutine(PieceCo(piece, center, scale));
            }
        }

        RectTransform NewPiece(Color color, float scale)
        {
            var go = new GameObject("fx", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(_root, false);

            var image = go.GetComponent<Image>();
            image.color = color;
            image.raycastTarget = false;

            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
            float size = Random.Range(12f, 24f) * scale;
            rect.sizeDelta = new Vector2(size, size);
            rect.anchoredPosition = Vector2.zero;
            return rect;
        }

        IEnumerator PieceCo(RectTransform rect, Vector2 center, float scale)
        {
            var image = rect.GetComponent<Image>();
            float angle = Random.Range(0f, Mathf.PI * 2f);
            float speed = Random.Range(520f, 1150f) * scale;
            // 위쪽으로 살짝 치우친 방사형 초기 속도.
            var velocity = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle) + 0.5f) * speed;
            var position = center;
            float life = Random.Range(0.55f, 0.85f);
            float gravity = -2300f;
            float spin = Random.Range(-360f, 360f);
            float elapsed = 0f;

            while (elapsed < life)
            {
                float dt = Time.unscaledDeltaTime;
                elapsed += dt;
                velocity.y += gravity * dt;
                position += velocity * dt;
                rect.anchoredPosition = position;
                rect.localRotation = Quaternion.Euler(0f, 0f, rect.localEulerAngles.z + spin * dt);

                var color = image.color;
                color.a = Mathf.Clamp01(1f - elapsed / life);
                image.color = color;
                yield return null;
            }

            Destroy(rect.gameObject);
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
