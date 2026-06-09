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
            var tabCapabilities = FindButton(canvasGo, "능력");
            var tabUpgrades = FindButton(canvasGo, "업그레이드");
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
