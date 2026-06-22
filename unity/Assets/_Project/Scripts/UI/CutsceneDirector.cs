// 출시·승급·상장 같은 순간에 모달 컷씬을, 능력업·해금엔 코너 미니 윈도우를 띄워 픽셀 직원이 연기하게 하는 연출 감독기 (feat-017).
// FxManager 패턴 — RuntimeInitializeOnLoadMethod 자동 부트스트랩 + 전용 Overlay Canvas + GameEvents 구독.
// 새 스프라이트 0장 — 기존 v090 직원을 코드 모션(들기·점프·박수)으로 움직인다. 모달은 공통 셸 + 종류별 무대.
using System.Collections;
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Systems;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public enum CutsceneTier { Mini, Medium, Big }
    public enum CutsceneKind { Launch, StageUp, Ipo }

    public class CutsceneDirector : MonoBehaviour
    {
        static CutsceneDirector _instance;
        Canvas _canvas;
        RectTransform _root;
        bool _playing;          // 모달 컷씬 1개씩
        int _launchCount;       // 세션 한정 — 반복 출시 간략화용
        readonly Queue<(string label, string actorKey, Color accent)> _miniQueue = new Queue<(string, string, Color)>();
        bool _miniPlaying;

        const float RefW = 1080f;
        const float RefH = 1920f;

        static readonly Color Ink = Hex("1f1912");
        static readonly Color Gold = Hex("f2c14e");
        static readonly Color Mint = Hex("5fc6a6");
        static readonly Color Cream = Hex("fff7df");
        static readonly Color StageBack = Hex("3a3152");
        static readonly Color StageFloorC = Hex("2b2438");
        static readonly Color Curtain = Hex("8a3b4a");
        static readonly Color WinFrame = Hex("f6eeda");
        static readonly Color TealBar = Hex("3f8a7c");
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
            GameEvents.ProductLaunched += OnLaunch;
            GameEvents.CompanyStageChanged += OnStageUp;
            GameEvents.IpoCompleted += OnIpo;
            GameEvents.CapabilityUpgraded += OnCapability;
            GameEvents.DomainUnlocked += OnDomain;
        }

        void OnDestroy()
        {
            if (_instance != this) return;
            GameEvents.ProductLaunched -= OnLaunch;
            GameEvents.CompanyStageChanged -= OnStageUp;
            GameEvents.IpoCompleted -= OnIpo;
            GameEvents.CapabilityUpgraded -= OnCapability;
            GameEvents.DomainUnlocked -= OnDomain;
        }

        void BuildCanvas()
        {
            _canvas = gameObject.AddComponent<Canvas>();
            _canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            _canvas.sortingOrder = 230; // 메인 UI(0)·파티클(200) 위.

            var scaler = gameObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(RefW, RefH);
            scaler.matchWidthOrHeight = 1f;

            gameObject.AddComponent<GraphicRaycaster>();
            _root = _canvas.GetComponent<RectTransform>();
        }

        // --- 이벤트 핸들러 ---
        void OnLaunch(string id) { _launchCount += 1; TryModal(CutsceneKind.Launch, null); }
        void OnStageUp(string stageId) => TryModal(CutsceneKind.StageUp, stageId);
        void OnIpo() => TryModal(CutsceneKind.Ipo, null);
        void OnCapability(string id, int level) => EnqueueMini("LEVEL UP!", "actor_human", Mint);
        void OnDomain(string id) => EnqueueMini("도메인 해금!", "actor_ai", Gold);

        // 이벤트 결과 컷인 — 톤(긍정/부정)에 따라 환호/낙담 코너 미니. Neutral은 호출부에서 생략. 직원 키는 라운드로빈.
        static readonly string[] _eventStaffKeys = { "actor_human", "actor_ai", "actor_robot" };
        int _eventActorCursor;

        void OnEventResult(bool isPositive)
        {
            var key = _eventStaffKeys[_eventActorCursor++ % _eventStaffKeys.Length];
            if (isPositive) EnqueueMini("대박!", key, Mint);
            else EnqueueMini("이런...", key, Hex("8a7f72"));
        }

        // 캡처/외부 진입점.
        public static void PlayLaunch() => _instance?.OnLaunch(null);
        public static void PlayStageUp(string stageId) => _instance?.OnStageUp(stageId);
        public static void PlayIpo() => _instance?.OnIpo();
        public static void PlayMini(string label, string actorKey) => _instance?.EnqueueMini(label, actorKey, Mint);
        // 이벤트 결과 컷인 진입점 — GameScreen onClick에서 톤 판정 후 호출.
        public static void PlayEventResult(bool isPositive) => _instance?.OnEventResult(isPositive);

        void TryModal(CutsceneKind kind, string payload)
        {
            if (_playing || _root == null) return;
            StartCoroutine(PlayModalCo(kind, payload));
        }

        // ======================= 모달 컷씬 (공통 셸 + 종류별 무대) =======================
        IEnumerator PlayModalCo(CutsceneKind kind, string payload)
        {
            _playing = true;
            bool brief = kind == CutsceneKind.Launch && _launchCount >= 3;
            float hold = brief ? 0.8f : 1.6f;
            // 빅 모먼트 판정 — 승급·상장, 또는 첫 출시(아직 간략화 안 된 풀 발표회). 가산 플래시·팝·색종이 밀도용.
            bool bigMoment = kind == CutsceneKind.StageUp || kind == CutsceneKind.Ipo || !brief;

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

            // --- 윈도우 프레임 ---
            var win = NewRect("CutsceneWindow", _root, new Vector2(0f, 40f), new Vector2(980f, 760f));
            var winCg = win.gameObject.AddComponent<CanvasGroup>();
            AddImage(win, Ink);
            var board = NewRect("Board", win, Vector2.zero, new Vector2(956f, 736f));
            AddImage(board, WinFrame);

            // 타이틀바
            var titleBar = NewRect("TitleBar", board, new Vector2(0f, 320f), new Vector2(956f, 96f));
            AddImage(titleBar, TealBar);
            var title = UiFactory.Label(titleBar, TitleFor(kind, brief), 46);
            title.color = Cream;
            title.alignment = TextAnchor.MiddleCenter;
            Stretch(title.GetComponent<RectTransform>());

            // 무대
            var stage = NewRect("Stage", board, new Vector2(0f, -52f), new Vector2(900f, 520f));
            AddImage(stage, StageBack);

            // 종류별 무대 채우기 → 모션 코루틴 핸들 반환
            var motions = new List<Coroutine>();
            switch (kind)
            {
                case CutsceneKind.Launch: PopulateLaunch(stage, motions); break;
                case CutsceneKind.StageUp: PopulateStageUp(stage, payload, motions); break;
                case CutsceneKind.Ipo: PopulateIpo(stage, motions); break;
            }

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

            // ===== 공통 시퀀스 =====
            // 빅 모먼트 오픈 플래시 — 스크림·윈도우 생성 뒤에 띄워 최상단 형제로 번쩍인 뒤 자동 소멸.
            if (bigMoment) StartCoroutine(BigMomentFlash());
            yield return Fade(scrimCg, 0f, 1f, 0.18f);
            // 팝 강화 — 내부 전용 오버슈트(0→1.06→1.0). 공유 UiTween은 손대지 않는다.
            winCg.alpha = 0f;
            yield return PopInOvershoot(win, winCg, 0.26f);
            if (!skip) UiTween.Punch(title.transform, 0.14f, 0.16f); // 타이틀 등장 펀치
            if (!skip)
            {
                BurstConfetti(stage, brief ? 16 : (bigMoment ? 44 : 32));
                UiTween.FadeIn(hintCg, 0.2f, 0.2f);
            }
            float t = 0f;
            while (t < hold && !skip) { t += Time.unscaledDeltaTime; yield return null; }

            yield return Fade(winCg, winCg.alpha, 0f, 0.14f);
            yield return Fade(scrimCg, scrimCg.alpha, 0f, 0.16f);
            Destroy(scrim);
            Destroy(win.gameObject);
            _playing = false;
        }

        string TitleFor(CutsceneKind kind, bool brief)
        {
            switch (kind)
            {
                case CutsceneKind.StageUp: return "🎉 새 오피스로 이사! 🎉";
                case CutsceneKind.Ipo: return "🔔 상장 성공! 🔔";
                default: return brief ? "신제품 출시" : "🎉 신제품 출시! 🎉";
            }
        }

        // ---- 출시 무대 (발표회) ----
        void PopulateLaunch(RectTransform stage, List<Coroutine> motions)
        {
            AddSpotlight(stage);
            AddPresenterGlow(stage, motions); // 발표자 뒤 보이는 빛 원뿔 + 소프트 글로우 (T5 강화)
            AddCurtains(stage);
            AddStageFloor(stage);
            var presenter = MakeActor(stage, "actor_human", new Vector2(0f, -90f), 240f);
            var product = NewRect("Product", stage, new Vector2(0f, 210f), new Vector2(80f, 80f));
            AddImage(product, Ink);
            var face = NewRect("face", product, Vector2.zero, new Vector2(66f, 66f));
            AddImage(face, Gold);
            var star = UiFactory.Label(face, "★", 40);
            star.color = Ink; star.alignment = TextAnchor.MiddleCenter; Stretch(star.GetComponent<RectTransform>());
            var prodCg = product.gameObject.AddComponent<CanvasGroup>();
            prodCg.alpha = 0f;
            var fan1 = MakeActor(stage, "actor_ai", new Vector2(-300f, -120f), 175f);
            var fan2 = MakeActor(stage, "actor_robot", new Vector2(300f, -120f), 175f);
            motions.Add(StartCoroutine(PresenterLift(presenter, product, prodCg)));
            motions.Add(StartCoroutine(FanCheer(fan1, 0f)));
            motions.Add(StartCoroutine(FanCheer(fan2, 0.4f)));
        }

        // ---- 승급 무대 (새 오피스 공개) ----
        void PopulateStageUp(RectTransform stage, string stageId, List<Coroutine> motions)
        {
            // 새 성급 배경을 무대에 깔아 "이사한 오피스"를 보여준다 (StageVisual 4종 재사용).
            var key = StageVisual.BackgroundKey(stageId);
            var tex = Resources.Load<Texture2D>(key) ?? Resources.Load<Texture2D>(StageVisual.FallbackKey);
            if (tex != null)
            {
                var bg = NewRect("StageBg", stage, Vector2.zero, new Vector2(900f, 520f));
                var img = bg.gameObject.AddComponent<Image>();
                img.sprite = Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f));
                img.raycastTarget = false;
                img.type = Image.Type.Simple;
                img.preserveAspect = false;
            }
            // 직원 3종이 새 오피스 앞에서 점프 환호.
            var a = MakeActor(stage, "actor_human", new Vector2(-220f, -150f), 175f);
            var b = MakeActor(stage, "actor_ai", new Vector2(0f, -160f), 185f);
            var c = MakeActor(stage, "actor_robot", new Vector2(220f, -150f), 175f);
            motions.Add(StartCoroutine(FanCheer(a, 0f)));
            motions.Add(StartCoroutine(FanCheer(b, 0.33f)));
            motions.Add(StartCoroutine(FanCheer(c, 0.66f)));
        }

        // ---- 상장 무대 (세리머니) ----
        void PopulateIpo(RectTransform stage, List<Coroutine> motions)
        {
            AddSpotlight(stage);
            AddStageFloor(stage);
            // 종(벨) — 노란 사다리꼴 + 클래퍼.
            var bell = NewRect("Bell", stage, new Vector2(0f, 150f), new Vector2(96f, 86f));
            AddImage(bell, Ink);
            var bellFace = NewRect("bellFace", bell, new Vector2(0f, 4f), new Vector2(80f, 72f));
            AddImage(bellFace, Gold);
            var bellShine = NewRect("shine", bellFace, new Vector2(-16f, 8f), new Vector2(14f, 40f));
            AddImage(bellShine, Cream).raycastTarget = false;
            var clapper = NewRect("clapper", bell, new Vector2(0f, -44f), new Vector2(16f, 16f));
            AddImage(clapper, Ink);
            // 직원 3종 환호 + 종 흔들기 + $ 플로팅.
            var a = MakeActor(stage, "actor_human", new Vector2(-250f, -150f), 175f);
            var b = MakeActor(stage, "actor_ai", new Vector2(0f, -160f), 185f);
            var c = MakeActor(stage, "actor_robot", new Vector2(250f, -150f), 175f);
            motions.Add(StartCoroutine(FanCheer(a, 0f)));
            motions.Add(StartCoroutine(FanCheer(b, 0.3f)));
            motions.Add(StartCoroutine(FanCheer(c, 0.6f)));
            motions.Add(StartCoroutine(BellRing(bell)));
            motions.Add(StartCoroutine(MoneyRain(stage)));
        }

        // ======================= 미니 코너 윈도우 (능력업·해금) =======================
        void EnqueueMini(string label, string actorKey, Color accent)
        {
            if (_root == null) return;
            _miniQueue.Enqueue((label, actorKey, accent));
            if (!_miniPlaying) StartCoroutine(MiniLoop());
        }

        IEnumerator MiniLoop()
        {
            _miniPlaying = true;
            while (_miniQueue.Count > 0)
            {
                var item = _miniQueue.Dequeue();
                yield return PlayMiniCo(item.label, item.actorKey, item.accent);
            }
            _miniPlaying = false;
        }

        IEnumerator PlayMiniCo(string label, string actorKey, Color accent)
        {
            // 하단 한쪽 작은 윈도우 — 스크림 없음, 입력 통과(raycastTarget false).
            float hidden = -120f, shown = 250f;
            var win = NewRect("MiniCutscene", _root, new Vector2(-300f, hidden), new Vector2(360f, 150f));
            AddImage(win, Ink).raycastTarget = false;
            var board = NewRect("miniBoard", win, Vector2.zero, new Vector2(348f, 138f));
            AddImage(board, WinFrame).raycastTarget = false;
            var bar = NewRect("miniBar", board, new Vector2(0f, 50f), new Vector2(348f, 38f));
            AddImage(bar, accent).raycastTarget = false;
            var lab = UiFactory.Label(bar, label, 30);
            lab.color = Ink; lab.alignment = TextAnchor.MiddleCenter; lab.raycastTarget = false;
            Stretch(lab.GetComponent<RectTransform>());
            var actor = MakeActor(board, actorKey, new Vector2(-104f, -64f), 116f);
            // 엄지척 대용 — 상승 삼각형
            var plus = UiFactory.Label(board, "▲", 40);
            plus.color = accent; plus.raycastTarget = false;
            var plusR = plus.GetComponent<RectTransform>();
            plusR.anchorMin = plusR.anchorMax = new Vector2(0.5f, 0.5f);
            plusR.anchoredPosition = new Vector2(78f, -10f);
            plusR.sizeDelta = new Vector2(80f, 60f);
            plus.alignment = TextAnchor.MiddleCenter;

            var bob = StartCoroutine(FanCheer(actor, 0f));

            // 슬라이드 인 → hold → 슬라이드 아웃
            yield return Slide(win, hidden, shown, 0.22f);
            float t = 0f;
            while (t < 1.0f) { t += Time.unscaledDeltaTime; yield return null; }
            yield return Slide(win, shown, hidden, 0.2f);
            if (bob != null) StopCoroutine(bob);
            if (win != null) Destroy(win.gameObject);
        }

        // ======================= 무대 요소 =======================
        void AddSpotlight(RectTransform stage)
        {
            var spot = NewRect("Spotlight", stage, new Vector2(0f, 20f), new Vector2(320f, 480f));
            AddImage(spot, new Color(Gold.r, Gold.g, Gold.b, 0.14f)).raycastTarget = false;
        }

        // 발표자 뒤 보이는 빛 원뿔(상단 좁음→하단 넓음) + 소프트 글로우. 스프라이트 0장 — 반투명 사각형 레이어로 콘·소프트엣지 흉내.
        void AddPresenterGlow(RectTransform stage, List<Coroutine> motions)
        {
            // 1) 발표자 뒤 소프트 글로우 — 동심 레이어로 부드러운 가장자리. 가장 안쪽이 밝다.
            var glowHolder = NewRect("PresenterGlow", stage, new Vector2(0f, 40f), new Vector2(360f, 360f));
            const int rings = 5;
            for (int i = 0; i < rings; i++)
            {
                float k = i / (float)(rings - 1);            // 0 안쪽 → 1 바깥쪽
                float side = Mathf.Lerp(150f, 360f, k);
                float a = Mathf.Lerp(0.30f, 0.04f, k);       // 안쪽 진하고 바깥 옅게
                var ring = NewRect("glowRing", glowHolder, Vector2.zero, new Vector2(side, side));
                AddImage(ring, new Color(Gold.r, Gold.g, Gold.b, a)).raycastTarget = false;
            }

            // 2) 빛 원뿔 — 천장(상단 좁음)에서 무대 바닥(하단 넓음)으로 퍼지는 빔. 사다리꼴을 가로폭이 점증하는 층으로 근사.
            var coneHolder = NewRect("PresenterCone", stage, new Vector2(0f, 30f), new Vector2(360f, 460f));
            const int slabs = 7;
            for (int i = 0; i < slabs; i++)
            {
                float k = i / (float)(slabs - 1);            // 0 상단 → 1 하단
                float slabW = Mathf.Lerp(60f, 300f, k);      // 위 좁고 아래 넓게 (스포트라이트 빔)
                float slabH = 460f / slabs;
                float yTop = 230f - slabH * 0.5f;
                float y = yTop - i * slabH;
                float a = Mathf.Lerp(0.16f, 0.05f, k);       // 위(광원 근처) 진하고 아래로 옅게
                var slab = NewRect("coneSlab", coneHolder, new Vector2(0f, y), new Vector2(slabW, slabH + 2f));
                AddImage(slab, new Color(Cream.r, Cream.g, Cream.b, a)).raycastTarget = false;
            }

            var glowCg = glowHolder.gameObject.AddComponent<CanvasGroup>();
            var coneCg = coneHolder.gameObject.AddComponent<CanvasGroup>();
            motions.Add(StartCoroutine(PresenterGlowPulse(glowCg, coneCg)));
        }

        void AddCurtains(RectTransform stage)
        {
            for (int s = -1; s <= 1; s += 2)
            {
                var cur = NewRect("Curtain", stage, new Vector2(s * 410f, 40f), new Vector2(80f, 440f));
                AddImage(cur, Curtain).raycastTarget = false;
                for (int f = 0; f < 3; f++)
                {
                    var fold = NewRect("fold", cur, new Vector2((f - 1) * 22f, 0f), new Vector2(6f, 440f));
                    AddImage(fold, Hex("6e2c39")).raycastTarget = false;
                }
            }
        }

        void AddStageFloor(RectTransform stage)
        {
            var floor = NewRect("StageFloor", stage, new Vector2(0f, -210f), new Vector2(900f, 100f));
            AddImage(floor, StageFloorC).raycastTarget = false;
        }

        // ======================= 연출 코루틴 (가산) =======================
        // 빅 모먼트 오픈 플래시 — 풀스크린 화이트 1회, 알파 0.5→0, 약 0.12s. 입력 비차단.
        IEnumerator BigMomentFlash()
        {
            if (_root == null) yield break;
            var flash = UiFactory.Panel(_root, new Color(1f, 1f, 1f, 0.5f));
            flash.name = "BigMomentFlash";
            Stretch(flash.GetComponent<RectTransform>());
            var img = flash.GetComponent<Image>();
            if (img != null) img.raycastTarget = false;
            flash.transform.SetAsLastSibling();
            const float dur = 0.12f;
            float t = 0f;
            while (t < dur && flash != null)
            {
                t += Time.unscaledDeltaTime;
                if (img != null) { var c = img.color; c.a = Mathf.Lerp(0.5f, 0f, t / dur); img.color = c; }
                yield return null;
            }
            if (flash != null) Destroy(flash);
        }

        // 발표자 글로우·빛 원뿔 결정적 호흡 펄스 — 광량이 살짝 일렁여 무대 조명을 살린다.
        IEnumerator PresenterGlowPulse(CanvasGroup glowCg, CanvasGroup coneCg)
        {
            while (glowCg != null || coneCg != null)
            {
                float s = Mathf.Sin(Time.unscaledTime * 2.2f);
                if (glowCg != null) glowCg.alpha = 0.85f + s * 0.15f;
                if (coneCg != null) coneCg.alpha = 0.80f + s * 0.20f;
                yield return null;
            }
        }

        // 윈도우 등장 오버슈트 — 0→1.06→1.0. 공유 UiTween을 건드리지 않는 내부 전용 팝.
        IEnumerator PopInOvershoot(RectTransform win, CanvasGroup cg, float dur)
        {
            if (win == null) yield break;
            float up = dur * 0.7f;   // 0→1.06 구간
            float settle = dur - up; // 1.06→1.0 정착
            float t = 0f;
            while (t < up && win != null)
            {
                t += Time.unscaledDeltaTime;
                float k = Mathf.Clamp01(t / up);
                win.localScale = Vector3.one * Mathf.Lerp(0f, 1.06f, k);
                if (cg != null) cg.alpha = k;
                yield return null;
            }
            t = 0f;
            while (t < settle && win != null)
            {
                t += Time.unscaledDeltaTime;
                float k = Mathf.Clamp01(t / settle);
                win.localScale = Vector3.one * Mathf.Lerp(1.06f, 1f, k);
                yield return null;
            }
            if (win != null) win.localScale = Vector3.one;
            if (cg != null) cg.alpha = 1f;
        }

        // ======================= 모션 코루틴 =======================
        IEnumerator PresenterLift(RectTransform actor, RectTransform product, CanvasGroup prodCg)
        {
            float baseY = actor.anchoredPosition.y;
            float prodBaseY = product.anchoredPosition.y;
            float intro = 0f;
            while (actor != null && product != null)
            {
                intro = Mathf.Min(1f, intro + Time.unscaledDeltaTime * 2.5f);
                prodCg.alpha = intro;
                float bob = Mathf.Sin(Time.unscaledTime * 3f) * 8f;
                actor.anchoredPosition = new Vector2(actor.anchoredPosition.x, baseY + Mathf.Max(0f, bob));
                float lift = Mathf.Abs(Mathf.Sin(Time.unscaledTime * 1.6f)) * 22f * intro;
                product.anchoredPosition = new Vector2(product.anchoredPosition.x, prodBaseY + lift);
                product.localRotation = Quaternion.Euler(0, 0, Mathf.Sin(Time.unscaledTime * 4f) * 8f);
                yield return null;
            }
        }

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

        IEnumerator BellRing(RectTransform bell)
        {
            while (bell != null)
            {
                bell.localRotation = Quaternion.Euler(0, 0, Mathf.Sin(Time.unscaledTime * 9f) * 12f);
                yield return null;
            }
        }

        IEnumerator MoneyRain(RectTransform stage)
        {
            float elapsed = 0f;
            while (stage != null && elapsed < 3f)
            {
                elapsed += Time.unscaledDeltaTime;
                if (Mathf.Repeat(elapsed, 0.22f) < Time.unscaledDeltaTime)
                {
                    FloatingText.Spawn(stage, "$", Gold, 44, new Vector2(Random.Range(-260f, 260f), -40f));
                }
                yield return null;
            }
        }

        // ======================= 색종이 =======================
        void BurstConfetti(RectTransform stage, int count)
        {
            for (int i = 0; i < count; i++)
            {
                var piece = NewRect("confetti", stage, new Vector2(Random.Range(-160f, 160f), 140f), new Vector2(Random.Range(10f, 20f), Random.Range(10f, 20f)));
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

        // ======================= 헬퍼 =======================
        RectTransform MakeActor(RectTransform parent, string key, Vector2 pos, float size)
        {
            var sprite = IconLibrary.Get(key);
            var rect = NewRect(key, parent, pos, new Vector2(size, size));
            var img = rect.gameObject.AddComponent<Image>();
            img.sprite = sprite;
            img.preserveAspect = true;
            img.raycastTarget = false;
            img.color = sprite != null ? Color.white : new Color(1f, 1f, 1f, 0f);
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

        IEnumerator Slide(RectTransform rect, float fromY, float toY, float dur)
        {
            float t = 0f;
            while (t < dur && rect != null)
            {
                t += Time.unscaledDeltaTime;
                float e = Mathf.SmoothStep(0f, 1f, t / dur);
                rect.anchoredPosition = new Vector2(rect.anchoredPosition.x, Mathf.Lerp(fromY, toY, e));
                yield return null;
            }
            if (rect != null) rect.anchoredPosition = new Vector2(rect.anchoredPosition.x, toY);
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
