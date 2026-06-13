// 출시 같은 순간에 모달 컷씬 윈도우를 띄워 픽셀 직원들이 연기하게 하는 연출 감독기 (feat-017).
// FxManager와 동일 패턴 — RuntimeInitializeOnLoadMethod 자동 부트스트랩 + 전용 Overlay Canvas + GameEvents 구독.
// 1차는 새 스프라이트 0장 — 기존 v090 직원을 코드 모션(들기·점프·박수)으로 움직여 '보는 맛'을 낸다.
using System.Collections;
using AICompanyTycoon.Core;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public enum CutsceneTier { Mini, Medium, Big }

    public class CutsceneDirector : MonoBehaviour
    {
        static CutsceneDirector _instance;
        Canvas _canvas;
        RectTransform _root;
        bool _playing;
        int _launchCount; // 세션 한정 — 반복 출시 간략화용(세이브 불필요)

        const float RefW = 1080f;
        const float RefH = 1920f;

        static readonly Color Ink = Hex("1f1912");
        static readonly Color Gold = Hex("f2c14e");
        static readonly Color Mint = Hex("5fc6a6");
        static readonly Color Cream = Hex("fff7df");
        static readonly Color StageFloor = Hex("2b2438");
        static readonly Color StageBack = Hex("3a3152");
        static readonly Color Curtain = Hex("8a3b4a");
        static readonly Color WinFrame = Hex("f6eeda");
        static readonly Color[] Confetti = { Hex("f2c14e"), Hex("56d6e9"), Hex("fff0c8"), Hex("a9e45c"), Hex("dd6f48"), Hex("7b5ed7") };

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Bootstrap()
        {
            if (_instance != null) return;
            var go = new GameObject("CutsceneDirector");
            DontDestroyOnLoad(go);
            go.AddComponent<CutsceneDirector>();
        }

        void Awake()
        {
            if (_instance != null && _instance != this) { Destroy(gameObject); return; }
            _instance = this;
            BuildCanvas();
            GameEvents.ProductLaunched += OnProductLaunched;
        }

        void OnDestroy()
        {
            if (_instance == this) GameEvents.ProductLaunched -= OnProductLaunched;
        }

        void BuildCanvas()
        {
            _canvas = gameObject.AddComponent<Canvas>();
            _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            _canvas.sortingOrder = 230; // 메인 UI(0)·파티클(200) 위 — 모달처럼 덮는다.

            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(RefW, RefH);
            scaler.matchWidthOrHeight = 1f;

            gameObject.AddComponent<GraphicRaycaster>();
            _root = _canvas.GetComponent<RectTransform>();
        }

        // 외부(캡처 테스트 등)에서 직접 출시 컷씬을 띄우는 정적 진입점.
        public static void PlayLaunch() => _instance?.OnProductLaunched(null);

        void OnProductLaunched(string id)
        {
            if (_playing || _root == null) return;
            _launchCount += 1;
            StartCoroutine(PlayLaunchCo());
        }

        IEnumerator PlayLaunchCo()
        {
            _playing = true;
            // 첫 출시는 풀, 3회차+부터 간략화(중 tier).
            bool brief = _launchCount >= 3;
            float hold = brief ? 0.8f : 1.6f;

            // --- 스크림 (입력 차단 + 탭 스킵) ---
            var scrim = UiFactory.Panel(_root, new Color(0.06f, 0.05f, 0.09f, 0.62f));
            scrim.name = "CutsceneScrim";
            Stretch(scrim.GetComponent<RectTransform>());
            var scrimCg = scrim.AddComponent<CanvasGroup>();
            scrimCg.alpha = 0f;
            bool skip = false;
            var skipBtn = scrim.AddComponent<Button>();
            skipBtn.transition = Selectable.Transition.None;
            skipBtn.onClick.AddListener(() => skip = true);

            // --- 윈도우 프레임 (INK 테두리 + 크림 보드) ---
            var win = NewRect("CutsceneWindow", _root, new Vector2(0f, 40f), new Vector2(980f, 760f));
            var winCg = win.gameObject.AddComponent<CanvasGroup>();
            AddImage(win, Ink); // 테두리
            var board = NewRect("Board", win, Vector2.zero, new Vector2(956f, 736f));
            AddImage(board, WinFrame);

            // 타이틀바
            var titleBar = NewRect("TitleBar", board, new Vector2(0f, 320f), new Vector2(956f, 96f));
            AddImage(titleBar, Hex("3f8a7c"));
            var title = UiFactory.Label(titleBar, brief ? "신제품 출시" : "🎉 신제품 출시! 🎉", 46);
            title.color = Cream;
            title.alignment = TextAnchor.MiddleCenter;
            Stretch(title.GetComponent<RectTransform>());

            // --- 미니 무대 (윈도우 안) ---
            var stage = NewRect("Stage", board, new Vector2(0f, -52f), new Vector2(900f, 520f));
            AddImage(stage, StageBack);
            // 스포트라이트 (발표자 뒤 밝은 세로 콘)
            var spot = NewRect("Spotlight", stage, new Vector2(0f, 20f), new Vector2(300f, 480f));
            var spotImg = AddImage(spot, new Color(Gold.r, Gold.g, Gold.b, 0.14f));
            spotImg.raycastTarget = false;
            // 좌우 커튼
            for (int s = -1; s <= 1; s += 2)
            {
                var cur = NewRect("Curtain", stage, new Vector2(s * 410f, 40f), new Vector2(80f, 440f));
                AddImage(cur, Curtain);
                for (int f = 0; f < 3; f++) // 주름
                {
                    var fold = NewRect("fold", cur, new Vector2((f - 1) * 22f, 0f), new Vector2(6f, 440f));
                    AddImage(fold, Hex("6e2c39")).raycastTarget = false;
                }
            }
            // 무대 바닥
            var floor = NewRect("StageFloor", stage, new Vector2(0f, -210f), new Vector2(900f, 100f));
            AddImage(floor, StageFloor);

            // --- 발표 직원 (중앙) — 제품을 머리 위로 든다 ---
            var presenter = MakeActor(stage, "actor_human", new Vector2(0f, -90f), 240f);
            // 제품(노란 박스 + 별) — 발표 직원 머리 위로 띄운다.
            var product = NewRect("Product", stage, new Vector2(0f, 210f), new Vector2(80f, 80f));
            AddImage(product, Ink);
            var prodFace = NewRect("face", product, Vector2.zero, new Vector2(72f, 72f));
            AddImage(prodFace, Gold);
            var star = UiFactory.Label(prodFace, "★", 44);
            star.color = Ink; star.alignment = TextAnchor.MiddleCenter;
            Stretch(star.GetComponent<RectTransform>());
            var productCg = product.gameObject.AddComponent<CanvasGroup>();
            productCg.alpha = 0f;

            // --- 객석 직원 (좌우) — 점프·박수 ---
            var fan1 = MakeActor(stage, "actor_ai", new Vector2(-300f, -120f), 175f);
            var fan2 = MakeActor(stage, "actor_robot", new Vector2(300f, -120f), 175f);

            // 하단 안내
            var hint = UiFactory.Label(board, "탭하여 계속", 30);
            hint.color = Hex("5b4f38");
            var hintRect = hint.GetComponent<RectTransform>();
            hintRect.anchorMin = hintRect.anchorMax = new Vector2(0.5f, 0f);
            hintRect.anchoredPosition = new Vector2(0f, 28f);
            hintRect.sizeDelta = new Vector2(400f, 40f);
            hint.alignment = TextAnchor.MiddleCenter;
            var hintCg = hint.gameObject.AddComponent<CanvasGroup>();
            hintCg.alpha = 0f;

            // ===== 시퀀스 =====
            // 1) 스크림 페이드 + 윈도우 팝인
            yield return Fade(scrimCg, 0f, 1f, 0.18f);
            win.localScale = Vector3.one * 0.7f;
            UiTween.PopIn(win, winCg, 0.22f);
            yield return WaitRT(0.22f);
            if (skip) goto Close;

            // 2) 발표 직원 모션 시작(들어올림) + 제품 등장 + 객석 환호
            var mPresent = StartCoroutine(PresenterLift(presenter, product, productCg));
            var mFan1 = StartCoroutine(FanCheer(fan1, 0f));
            var mFan2 = StartCoroutine(FanCheer(fan2, 0.4f));
            yield return WaitRT(0.25f);
            if (!skip) BurstConfetti(stage, brief ? 16 : 30);

            // 3) 유지(반복 출시면 짧게) — 탭 스킵 감시
            UiTween.FadeIn(hintCg, 0.2f, 0.2f);
            float t = 0f;
            while (t < hold && !skip) { t += Time.unscaledDeltaTime; yield return null; }

            Close:
            // 4) 팝아웃 + 페이드아웃
            yield return Fade(winCg, winCg.alpha, 0f, 0.14f);
            yield return Fade(scrimCg, scrimCg.alpha, 0f, 0.16f);
            Destroy(scrim);
            Destroy(win.gameObject);
            _playing = false;
        }

        // 발표 직원 — 살짝 위아래 + 제품을 머리 위로 들어올리는 반복 모션.
        IEnumerator PresenterLift(RectTransform actor, RectTransform product, CanvasGroup productCg)
        {
            float baseY = actor.anchoredPosition.y;
            float prodBaseY = product.anchoredPosition.y;
            float intro = 0f;
            while (actor != null && product != null)
            {
                intro = Mathf.Min(1f, intro + Time.unscaledDeltaTime * 2.5f);
                productCg.alpha = intro;
                float bob = Mathf.Sin(Time.unscaledTime * 3f) * 8f;
                actor.anchoredPosition = new Vector2(actor.anchoredPosition.x, baseY + Mathf.Max(0f, bob));
                float lift = Mathf.Abs(Mathf.Sin(Time.unscaledTime * 1.6f)) * 22f * intro;
                product.anchoredPosition = new Vector2(product.anchoredPosition.x, prodBaseY + lift);
                product.localRotation = Quaternion.Euler(0, 0, Mathf.Sin(Time.unscaledTime * 4f) * 8f);
                yield return null;
            }
        }

        // 객석 직원 — 점프 + 박수(스케일 펄스). phase로 엇박.
        IEnumerator FanCheer(RectTransform actor, float phase)
        {
            float baseY = actor.anchoredPosition.y;
            Vector3 baseScale = actor.localScale;
            while (actor != null)
            {
                float ph = Time.unscaledTime * 6f + phase * Mathf.PI * 2f;
                float jump = Mathf.Abs(Mathf.Sin(ph)) * 34f;
                actor.anchoredPosition = new Vector2(actor.anchoredPosition.x, baseY + jump);
                float squash = 1f + Mathf.Sin(ph * 2f) * 0.06f;
                actor.localScale = new Vector3(baseScale.x, baseScale.y * squash, 1f);
                yield return null;
            }
        }

        // 무대 위 색종이 — 컷씬 Canvas에 직접(전역 FxManager는 컷씬 뒤라 가려지므로 자체 생성).
        void BurstConfetti(RectTransform stage, int count)
        {
            for (int i = 0; i < count; i++)
            {
                var piece = NewRect("confetti", stage, new Vector2(Random.Range(-120f, 120f), 120f), new Vector2(Random.Range(10f, 20f), Random.Range(10f, 20f)));
                AddImage(piece, Confetti[i % Confetti.Length]).raycastTarget = false;
                StartCoroutine(ConfettiCo(piece));
            }
        }

        IEnumerator ConfettiCo(RectTransform rect)
        {
            var img = rect.GetComponent<Image>();
            float angle = Random.Range(0f, Mathf.PI * 2f);
            float speed = Random.Range(280f, 620f);
            var vel = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle) + 0.4f) * speed;
            var pos = rect.anchoredPosition;
            float life = Random.Range(0.7f, 1.1f);
            float spin = Random.Range(-360f, 360f);
            float elapsed = 0f;
            while (elapsed < life && rect != null)
            {
                float dt = Time.unscaledDeltaTime;
                elapsed += dt;
                vel.y += -1400f * dt;
                pos += vel * dt;
                rect.anchoredPosition = pos;
                rect.localRotation = Quaternion.Euler(0, 0, rect.localEulerAngles.z + spin * dt);
                var c = img.color; c.a = Mathf.Clamp01(1f - elapsed / life); img.color = c;
                yield return null;
            }
            if (rect != null) Destroy(rect.gameObject);
        }

        // ---- 헬퍼 ----
        RectTransform MakeActor(RectTransform parent, string key, Vector2 pos, float size)
        {
            var sprite = IconLibrary.Get(key);
            var rect = NewRect(key, parent, pos, new Vector2(size, size));
            var img = rect.gameObject.AddComponent<Image>();
            img.sprite = sprite;
            img.preserveAspect = true;
            img.raycastTarget = false;
            img.color = sprite != null ? Color.white : new Color(1f, 1f, 1f, 0f);
            // 발이 pos 기준에 서도록 피벗을 하단 중앙으로.
            rect.pivot = new Vector2(0.5f, 0f);
            return rect;
        }

        static RectTransform NewRect(string name, Transform parent, Vector2 anchoredPos, Vector2 size)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(0.5f, 0.5f);
            rect.pivot = new Vector2(0.5f, 0.5f);
            rect.sizeDelta = size;
            rect.anchoredPosition = anchoredPos;
            return rect;
        }

        static Image AddImage(RectTransform rect, Color color)
        {
            var img = rect.gameObject.GetComponent<Image>();
            if (img == null) img = rect.gameObject.AddComponent<Image>();
            img.color = color;
            return img;
        }

        static void Stretch(RectTransform r)
        {
            r.anchorMin = Vector2.zero; r.anchorMax = Vector2.one;
            r.offsetMin = Vector2.zero; r.offsetMax = Vector2.zero;
        }

        IEnumerator Fade(CanvasGroup cg, float from, float to, float dur)
        {
            float t = 0f;
            while (t < dur && cg != null)
            {
                t += Time.unscaledDeltaTime;
                cg.alpha = Mathf.Lerp(from, to, t / dur);
                yield return null;
            }
            if (cg != null) cg.alpha = to;
        }

        static IEnumerator WaitRT(float seconds)
        {
            float t = 0f;
            while (t < seconds) { t += Time.unscaledDeltaTime; yield return null; }
        }

        static Color Hex(string hex, float a = 1f)
        {
            return new Color(
                int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                a);
        }
    }
}
