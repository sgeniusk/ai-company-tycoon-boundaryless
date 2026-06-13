// 헤드리스 PlayMode 캡처 — GameBootstrap UI를 1080x1920 RenderTexture로 렌더해 PNG로 저장한다(시각 확인용).
// -nographics 환경에선 Assert.Ignore로 건너뛰므로 EditMode 게이트와 무관하다.
using System.Collections;
using System.IO;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.TestTools;
using AICompanyTycoon.UI;

namespace AICompanyTycoon.Tests.PlayMode
{
    public class ScreenshotCaptureTests
    {
        const int W = 1080;
        const int H = 1920;
        const string CanvasName = "AI Company Tycoon UI";

        static string ShotsDir
        {
            get
            {
                var dir = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Logs", "shots"));
                Directory.CreateDirectory(dir);
                return dir;
            }
        }

        static bool HasGraphics =>
            SystemInfo.graphicsDeviceType != UnityEngine.Rendering.GraphicsDeviceType.Null;

        [UnityTest]
        public IEnumerator Capture_AllStates()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var go = new GameObject("CaptureBootstrap");
            var boot = go.AddComponent<GameBootstrap>();
            yield return null;            // Start() — UI 빌드
            yield return null;            // 레이아웃 안정
            Canvas.ForceUpdateCanvases();
            yield return null;
            Assert.IsNotNull(boot.Screen, "GameScreen이 빌드되어야 한다.");

            var canvasGo = GameObject.Find(CanvasName);
            Assert.IsNotNull(canvasGo, "캔버스를 찾지 못함.");

            // 상태 구동용 버튼 참조를 미리 확보(라벨이 ＋→× 등으로 바뀌어도 참조는 유지).
            var plus = FindButton(canvasGo, "＋");
            var tabProducts = FindButton(canvasGo, "제품");
            var tabCapabilities = FindButton(canvasGo, "연구"); // feat-014 #1 — 탭 라벨 개편
            var tabUpgrades = FindButton(canvasGo, "경영");
            var menuClose = FindButton(canvasGo, "✕");
            var more = FindButton(canvasGo, "더보기");

            // 1) 메인 — office-first 기본 상태
            yield return CaptureCanvas(canvasGo, "01-main.png");

            // 1b) 전광판 마퀴 — 스크롤을 멈추고 뷰포트 안으로 당겨 내용 확인(평소엔 우측에서 진입 중이라 비어 보임)
            var marqueeText = GameObject.Find("MarqueeText");
            var marqueeView = GameObject.Find("MarqueeViewport");
            if (marqueeText != null && marqueeView != null)
            {
                var mq = marqueeView.GetComponent("Marquee") as Behaviour;
                if (mq != null) mq.enabled = false;
                var mrt = marqueeText.GetComponent<RectTransform>();
                mrt.anchoredPosition = new Vector2(16f, mrt.anchoredPosition.y);
                yield return null;
                yield return CaptureCanvas(canvasGo, "01b-marquee.png");
            }

            // 2) ＋트레이 펼침
            if (plus != null)
            {
                plus.onClick.Invoke();
                yield return WaitRealtime(0.25f);
                yield return CaptureCanvas(canvasGo, "02-tray-open.png");
                plus.onClick.Invoke();           // 트레이 닫기
                yield return WaitRealtime(0.15f);
            }

            // 3) 제품 팝업
            if (tabProducts != null)
            {
                tabProducts.onClick.Invoke();
                yield return WaitRealtime(0.4f); // PopIn(0.16s) 여유
                yield return CaptureCanvas(canvasGo, "03-products.png");
            }

            // 4) 능력 팝업
            if (tabCapabilities != null)
            {
                tabCapabilities.onClick.Invoke();
                yield return WaitRealtime(0.4f);
                yield return CaptureCanvas(canvasGo, "04-capabilities.png");
            }

            // 5) 업그레이드 팝업
            if (tabUpgrades != null)
            {
                tabUpgrades.onClick.Invoke();
                yield return WaitRealtime(0.4f);
                yield return CaptureCanvas(canvasGo, "05-upgrades.png");
            }

            // 5.5) 상장(IPO) 모달 — 4성 상태를 주입하고 경영 탭에서 상장 버튼을 눌러 빅 모먼트 캡처 (feat-015 #4).
            // 반드시 컨텍스트를 갈아치우는 '새 게임' 버튼들보다 먼저 — boot.Context가 화면과 일치할 때.
            if (boot.Context != null && boot.Screen != null)
            {
                var m = boot.Context.Model;
                m.CompanyStageId = "enterprise_ai_vendor"; // 성급 4
                m.Trust = 70;
                m.Compute = 1_000_000;
                m.Data = 1_000_000;
                m.Cash = 1_000_000;
                boot.Context.Products.Launch("foundation_model_v0");
                boot.Screen.RefreshAll();
                yield return WaitRealtime(0.2f);

                if (tabUpgrades != null)
                {
                    tabUpgrades.onClick.Invoke();
                    yield return WaitRealtime(0.3f);
                }

                var ipoButton = FindButton(canvasGo, "상장(IPO) 추진");
                if (ipoButton != null)
                {
                    ipoButton.onClick.Invoke();
                    yield return WaitRealtime(0.4f);
                    yield return CaptureCanvas(canvasGo, "12-ipo.png");
                    // IPO 모달은 인터뷰 모달 공유 — 공모 10% 선택으로 닫는다(이후 캡처는 새 게임으로 리셋됨).
                    var ipoPick = FindButtonByPrefix(canvasGo, "공모 10%");
                    if (ipoPick != null) { ipoPick.onClick.Invoke(); yield return WaitRealtime(0.3f); }

                    // 상장 후 전광판 — 세계 부자 순위가 마퀴에 뜨는지 (feat-015 #5)
                    boot.Screen.RefreshAll();
                    yield return WaitRealtime(0.2f);
                    var mq2Text = GameObject.Find("MarqueeText");
                    var mq2View = GameObject.Find("MarqueeViewport");
                    if (mq2Text != null && mq2View != null)
                    {
                        var mq = mq2View.GetComponent("Marquee") as Behaviour;
                        if (mq != null) mq.enabled = false;
                        var mrt = mq2Text.GetComponent<RectTransform>();
                        mrt.anchoredPosition = new Vector2(16f, mrt.anchoredPosition.y);
                        yield return null;
                        yield return CaptureCanvas(canvasGo, "13-richest-marquee.png");
                    }
                }

                // 5.6) 성급 비주얼 사다리 — 정점(랜드마크) 단계로 승급 이벤트를 발생시켜 배경 스왑 확인 (feat-014 #5)
                if (menuClose != null) { menuClose.onClick.Invoke(); yield return WaitRealtime(0.15f); }
                m.CompanyStageId = "boundaryless_intelligence";
                AICompanyTycoon.Core.GameEvents.RaiseCompanyStageChanged("boundaryless_intelligence");
                yield return WaitRealtime(0.3f);
                yield return CaptureCanvas(canvasGo, "14-stage-landmark.png");
            }

            // 팝업 닫기
            if (menuClose != null)
            {
                menuClose.onClick.Invoke();
                yield return WaitRealtime(0.15f);
            }

            // 6) 더보기 드로어
            if (more != null)
            {
                more.onClick.Invoke();
                yield return WaitRealtime(0.4f);
                yield return CaptureCanvas(canvasGo, "06-more-drawer.png");
            }

            // 6.5) 도파민 연출 — 더보기를 닫고 플로팅 수익/토스트를 직접 띄워 캡처 (feat-010)
            var drawerClose = FindButton(canvasGo, "닫기");
            if (drawerClose != null)
            {
                drawerClose.onClick.Invoke();
                yield return WaitRealtime(0.2f);
            }

            var reactionLayer = GameObject.Find("ReactionLayer");
            var ribbonGo = GameObject.Find("ToastRibbon");
            if (reactionLayer != null && ribbonGo != null)
            {
                FloatingText.Spawn(reactionLayer.transform, "+$2.4K", UiTheme.ChipGoldText, 46, new Vector2(-60f, 40f));
                FloatingText.Spawn(reactionLayer.transform, "+이용자 180", UiTheme.ScoreboardTag, 36, new Vector2(80f, -10f), 0.1f);
                ribbonGo.GetComponent<ToastRibbon>().Enqueue("세계 이벤트 — 공개 모델 깜짝 공개", UiTheme.ScoreboardLive);
                yield return WaitRealtime(0.5f);
                yield return CaptureCanvas(canvasGo, "10-dopamine.png");
            }

            // 7) 세계 굴리기 리빌 — 새 게임 버튼으로 시드 런을 굴려 리빌 모달 캡처 (feat-007 블록 #4)
            var rollNew = FindButton(canvasGo, "새 게임 (세계 굴리기)");
            if (rollNew != null)
            {
                rollNew.onClick.Invoke();
                yield return WaitRealtime(0.4f);
                yield return CaptureCanvas(canvasGo, "07-world-reveal.png");
            }

            // 8) 개업 인터뷰 — 개업 스토리 새 게임으로 인터뷰 모달 캡처 (feat-015 #2)
            var revealClose = FindButton(canvasGo, "이 세계로 시작!");
            if (revealClose != null)
            {
                revealClose.onClick.Invoke();
                yield return WaitRealtime(0.2f);
            }

            if (more != null)
            {
                more.onClick.Invoke();
                yield return WaitRealtime(0.2f);
            }

            var storyNew = FindButton(canvasGo, "새 게임 (개업 스토리)");
            if (storyNew != null)
            {
                storyNew.onClick.Invoke();
                yield return WaitRealtime(0.4f);
                yield return CaptureCanvas(canvasGo, "11-interview.png");
            }

            Object.Destroy(go);
            yield return null;
        }

        // 액터 퍼레이드 — 직원 3종을 중립 배경에 크게 격리 렌더해 캐릭터시트 일관성 대조용으로 뜬다.
        // 신규 아트(v090 등) 반입 후 docs/art-pipeline/ref/char-ref-8x.png와 before/after 비교.
        [UnityTest]
        public IEnumerator Capture_ActorParade()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var canvasGo = new GameObject("ActorParade", typeof(RectTransform), typeof(Canvas));
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var bg = new GameObject("BG", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(canvasGo.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bg.GetComponent<Image>().color = new Color(0.98f, 0.969f, 0.875f, 1f); // cream

            var keys = new[] { "actor_human", "actor_ai", "actor_robot" };
            float[] cx = { 0.2f, 0.5f, 0.8f };
            for (int i = 0; i < keys.Length; i++)
            {
                var sprite = IconLibrary.Get(keys[i]);
                var go2 = new GameObject(keys[i], typeof(RectTransform), typeof(Image));
                go2.transform.SetParent(canvasGo.transform, false);
                var rect = go2.GetComponent<RectTransform>();
                rect.anchorMin = new Vector2(cx[i], 0.5f);
                rect.anchorMax = new Vector2(cx[i], 0.5f);
                rect.pivot = new Vector2(0.5f, 0.5f);
                rect.sizeDelta = new Vector2(360, 360);
                var img = go2.GetComponent<Image>();
                img.sprite = sprite;
                img.preserveAspect = true;
                img.color = sprite != null ? Color.white : new Color(1f, 0f, 0f, 0.3f); // 누락 시 빨강 표시
            }

            Canvas.ForceUpdateCanvases();
            yield return null;
            yield return CaptureCanvas(canvasGo, "08-actor-parade.png");

            Object.Destroy(canvasGo);
            yield return null;
        }

        // 오브젝트 퍼레이드 — v054 오피스 오브젝트 21종을 그리드로 렌더해 슬라이스/임포트 검증.
        [UnityTest]
        public IEnumerator Capture_ObjectParade()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var canvasGo = new GameObject("ObjectParade", typeof(RectTransform), typeof(Canvas));
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var bg = new GameObject("BG", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(canvasGo.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bg.GetComponent<Image>().color = new Color(0.98f, 0.969f, 0.875f, 1f);

            var keys = new[]
            {
                "obj_desk_monitor", "obj_server_dark", "obj_cabinet_wood", "obj_server_blue",
                "obj_crate_brown", "obj_desk_monitor_b", "obj_server_slate", "obj_cabinet_mint",
                "obj_crate_low", "obj_crate_red", "obj_desk_green", "obj_whiteboard_a",
                "obj_whiteboard_b", "obj_printer_blue", "obj_server_amber", "obj_glassboard_a",
                "obj_printer_cyan", "obj_desk_papers", "obj_meeting_table", "obj_equipment_blue",
                "obj_glassboard_b",
            };
            int cols = 4;
            for (int i = 0; i < keys.Length; i++)
            {
                var sprite = IconLibrary.Get(keys[i]);
                var go2 = new GameObject(keys[i], typeof(RectTransform), typeof(Image));
                go2.transform.SetParent(canvasGo.transform, false);
                var rect = go2.GetComponent<RectTransform>();
                float fx = 0.13f + (i % cols) * 0.25f;
                float fy = 0.9f - (i / cols) * 0.15f;
                rect.anchorMin = new Vector2(fx, fy);
                rect.anchorMax = new Vector2(fx, fy);
                rect.pivot = new Vector2(0.5f, 0.5f);
                rect.sizeDelta = new Vector2(240, 180);
                var img = go2.GetComponent<Image>();
                img.sprite = sprite;
                img.preserveAspect = true;
                img.color = sprite != null ? Color.white : new Color(1f, 0f, 0f, 0.3f);
            }

            Canvas.ForceUpdateCanvases();
            yield return null;
            yield return CaptureCanvas(canvasGo, "09-object-parade.png");

            Object.Destroy(canvasGo);
            yield return null;
        }

        static IEnumerator WaitRealtime(float seconds)
        {
            float t = 0f;
            while (t < seconds)
            {
                t += Time.unscaledDeltaTime;
                yield return null;
            }
        }

        // 라벨 텍스트가 정확히 일치하는 첫 버튼을 찾는다(비활성 포함).
        static Button FindButton(GameObject root, string exactLabel)
        {
            foreach (var b in root.GetComponentsInChildren<Button>(true))
            {
                var t = b.GetComponentInChildren<Text>(true);
                if (t != null && t.text == exactLabel)
                {
                    return b;
                }
            }
            return null;
        }

        static Button FindButtonByPrefix(GameObject root, string prefix)
        {
            foreach (var b in root.GetComponentsInChildren<Button>(true))
            {
                var t = b.GetComponentInChildren<Text>(true);
                if (t != null && t.text != null && t.text.StartsWith(prefix))
                {
                    return b;
                }
            }
            return null;
        }

        // 현재 활성 캔버스를 전용 카메라+RenderTexture로 렌더해 PNG로 저장한다.
        static IEnumerator CaptureCanvas(GameObject canvasGo, string fileName)
        {
            var canvas = canvasGo.GetComponent<Canvas>();

            // CanvasScaler를 꺼 캔버스를 1:1 매핑한다(기준 해상도 1080x1920이라 scaleFactor=1과 동일).
            var scaler = canvasGo.GetComponent("CanvasScaler") as Behaviour;
            bool prevScalerEnabled = scaler != null && scaler.enabled;
            if (scaler != null) scaler.enabled = false;

            var camGo = new GameObject("CaptureCamera");
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.04f, 0.05f, 0.06f, 1f);
            cam.cullingMask = ~0;
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 100f;

            var rt = new RenderTexture(W, H, 24, RenderTextureFormat.ARGB32);
            rt.Create();
            cam.targetTexture = rt;

            var prevMode = canvas.renderMode;
            var prevCam = canvas.worldCamera;
            var prevPlane = canvas.planeDistance;
            canvas.renderMode = RenderMode.ScreenSpaceCamera;
            canvas.worldCamera = cam;
            canvas.planeDistance = 10f;

            Canvas.ForceUpdateCanvases();
            yield return null;
            yield return null;
            cam.Render();

            var prevActive = RenderTexture.active;
            RenderTexture.active = rt;
            var tex = new Texture2D(W, H, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, W, H), 0, 0);
            tex.Apply();
            RenderTexture.active = prevActive;

            var path = Path.Combine(ShotsDir, fileName);
            File.WriteAllBytes(path, tex.EncodeToPNG());
            Debug.Log("[Capture] 저장: " + path);

            // 캔버스/스케일러 원복
            canvas.renderMode = prevMode;
            canvas.worldCamera = prevCam;
            canvas.planeDistance = prevPlane;
            if (scaler != null) scaler.enabled = prevScalerEnabled;

            cam.targetTexture = null;
            Object.Destroy(tex);
            rt.Release();
            Object.Destroy(rt);
            Object.Destroy(camGo);
            yield return null;
        }
    }
}
