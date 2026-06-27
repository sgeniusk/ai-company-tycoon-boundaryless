// 헤드리스 PlayMode 캡처 — GameBootstrap UI를 1080x2400 RenderTexture로 렌더해 PNG로 저장한다(시각 확인용).
// -nographics 환경에선 Assert.Ignore로 건너뛰므로 EditMode 게이트와 무관하다.
using System.Collections;
using System.IO;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.TestTools;
using AICompanyTycoon.Systems;
using AICompanyTycoon.UI;

namespace AICompanyTycoon.Tests.PlayMode
{
    public class ScreenshotCaptureTests
    {
        // 기본 캡처 해상도를 20:9(1080x2400)로 둔다 — 실폰(20:9) 프레이밍과 일치시켜 휑함/세이프영역 회귀를 실측한다(feat-019 T6).
        // 명시적으로 다른 해상도를 넘기는 시나리오(예: 01c-phone-2400)는 그대로 동작한다.
        const int W = 1080;
        const int H = 2400;
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
            // 1c) 폰 해상도(20:9) cover 검증 — 배경 도트 정사각 + 액터 정합 (feat-018)
            yield return CaptureCanvas(canvasGo, "01c-phone-2400.png", 1080, 2400);

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

            // 1d) 풍성한 오피스 — talent를 높여 2열 원근(앞줄 4 + 뒷줄)·책상 오클루전·열일 불꽃·앰비언트를 보고, 말풍선·리워드를 주입해 상시 juice를 한 프레임에 검증 (feat-019).
            if (boot.Context != null && boot.Screen != null)
            {
                boot.Context.Model.Talent = 10;
                boot.Screen.RefreshAll();
                yield return WaitRealtime(1.0f); // 워크루프·불꽃 일렁임 안정
                var anyActor = GameObject.Find("Actor");
                if (anyActor != null)
                {
                    var ar = anyActor.GetComponent<RectTransform>();
                    SpeechBubble.Spawn(ar, new Vector2(0f, 6f), "완벽해!");
                    FloatingText.Spawn(ar, "+아이디어", UiTheme.ScoreboardTag, 26, new Vector2(0f, 28f), 0f);
                }
                yield return WaitRealtime(0.35f); // 말풍선·리워드가 살아있을 때 캡처
                yield return CaptureCanvas(canvasGo, "01d-office-rich.png");

                // 1f) 적은 직원(평소·초반) — 큰 캐릭터가 휑하지 않은지, 코지 배경 정합 (feat-023)
                boot.Context.Model.Talent = 3;
                boot.Screen.RefreshAll();
                yield return WaitRealtime(0.5f);
                yield return CaptureCanvas(canvasGo, "01f-office-few.png");
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

                // 5.6) 성급 비주얼 사다리 — 성급별 배경 + 특화 소품 스왑 확인 (feat-014 #5 + feat-023 소품)
                if (menuClose != null) { menuClose.onClick.Invoke(); yield return WaitRealtime(0.15f); }

                // 성장 성급 — whiteboard/table 특화 소품 (feat-023)
                m.CompanyStageId = "viral_app_company";
                AICompanyTycoon.Core.GameEvents.RaiseCompanyStageChanged("viral_app_company");
                yield return WaitRealtime(0.3f);
                yield return CaptureCanvas(canvasGo, "14c-stage-growth.png");

                // 데이터센터 성급 — serverRack/printer 특화 소품 (feat-023)
                m.CompanyStageId = "ai_platform_giant";
                AICompanyTycoon.Core.GameEvents.RaiseCompanyStageChanged("ai_platform_giant");
                yield return WaitRealtime(0.3f);
                yield return CaptureCanvas(canvasGo, "14b-stage-datacenter.png");

                // 랜드마크 성급 — trophy/table 특화 소품
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

                // 6b) 도감 갤러리 — 더보기에서 도감 열기 (feat-021). 도감 버튼이 더보기를 닫고 갤러리를 띄운다.
                var galleryBtn = FindButton(canvasGo, "도감");
                if (galleryBtn != null)
                {
                    galleryBtn.onClick.Invoke();
                    yield return WaitRealtime(0.45f);
                    yield return CaptureCanvas(canvasGo, "19-collection.png");
                    var synTab = FindButtonByPrefix(canvasGo, "시너지");
                    if (synTab != null) { synTab.onClick.Invoke(); yield return WaitRealtime(0.3f); yield return CaptureCanvas(canvasGo, "19b-collection-synergy.png"); }
                    var endTab = FindButtonByPrefix(canvasGo, "엔딩");
                    if (endTab != null) { endTab.onClick.Invoke(); yield return WaitRealtime(0.3f); yield return CaptureCanvas(canvasGo, "19c-collection-ending.png"); }
                    var galClose = FindButton(canvasGo, "✕");
                    if (galClose != null) { galClose.onClick.Invoke(); yield return WaitRealtime(0.2f); }
                }
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

            // 15) 출시 컷씬 (feat-017) — 전역 CutsceneDirector가 별도 Overlay Canvas에 모달 발표회를 띄운다.
            AICompanyTycoon.Core.GameEvents.RaiseProductLaunched("foundation_model_v0");
            yield return WaitRealtime(0.6f); // 윈도우 팝인 + 제품 들어올림 + 색종이 절정
            var cutsceneGo = GameObject.Find("CutsceneDirector");
            if (cutsceneGo != null && cutsceneGo.GetComponent<Canvas>() != null)
            {
                yield return CaptureCanvas(cutsceneGo, "15-cutscene-launch.png");
            }
            yield return WaitRealtime(2.2f); // 자동 닫힘까지 대기(테스트 정리)

            // 16) 승급 컷씬 (feat-017 #1) — 새 오피스 공개(랜드마크 배경 재사용).
            AICompanyTycoon.Core.GameEvents.RaiseCompanyStageChanged("boundaryless_intelligence");
            yield return WaitRealtime(0.6f);
            var cs2 = GameObject.Find("CutsceneDirector");
            if (cs2 != null && cs2.GetComponent<Canvas>() != null)
            {
                yield return CaptureCanvas(cs2, "16-cutscene-stageup.png");
            }
            yield return WaitRealtime(2.2f);

            // 17) 상장 컷씬 (feat-017 #2) — 세리머니.
            AICompanyTycoon.Core.GameEvents.RaiseIpoCompleted();
            yield return WaitRealtime(0.7f);
            var cs3 = GameObject.Find("CutsceneDirector");
            if (cs3 != null && cs3.GetComponent<Canvas>() != null)
            {
                yield return CaptureCanvas(cs3, "17-cutscene-ipo.png");
            }
            yield return WaitRealtime(2.2f);

            // 18) 미니 코너 컷씬 (feat-017 #3) — 능력업.
            AICompanyTycoon.Core.GameEvents.RaiseCapabilityUpgraded("cap_demo", 2);
            yield return WaitRealtime(0.4f);
            var cs4 = GameObject.Find("CutsceneDirector");
            if (cs4 != null && cs4.GetComponent<Canvas>() != null)
            {
                yield return CaptureCanvas(cs4, "18-cutscene-mini.png");
            }
            yield return WaitRealtime(1.4f);

            // 22) 이벤트 결과 컷인 (feat-025) — 선택 결과 톤(긍정)에 따라 환호 코너 미니. 골격은 기존 포즈, Task 5에서 새 프레임으로 교체.
            CutsceneDirector.PlayEventResult(true);
            yield return WaitRealtime(0.4f);
            var cs5 = GameObject.Find("CutsceneDirector");
            if (cs5 != null && cs5.GetComponent<Canvas>() != null)
            {
                yield return CaptureCanvas(cs5, "22-event-result.png");
            }
            yield return WaitRealtime(1.4f);

            // 23) 고용 등장 컷인 (feat-025 2단계) — cheer 재활용 환영.
            CutsceneDirector.PlayHireArrival();
            yield return WaitRealtime(0.4f);
            var cs6 = GameObject.Find("CutsceneDirector");
            if (cs6 != null && cs6.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs6, "23-hire-arrival.png");
            yield return WaitRealtime(1.4f);

            // 24) 이벤트 발생 당황 컷인 (feat-025 2단계) — surprise 프레임(에셋 반입 후, 미반입 시 정적 폴백).
            CutsceneDirector.PlayEventTrigger();
            yield return WaitRealtime(0.4f);
            var cs7 = GameObject.Find("CutsceneDirector");
            if (cs7 != null && cs7.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs7, "24-event-trigger.png");
            yield return WaitRealtime(1.4f);

            // 25) 첫 직원 모달 (feat-025 3단계) — 전체 모달 cheer 환영.
            CutsceneDirector.PlayFirstHire("actor_human");
            yield return WaitRealtime(0.6f);
            var cs8 = GameObject.Find("CutsceneDirector");
            if (cs8 != null && cs8.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs8, "25-first-hire.png");
            yield return WaitRealtime(2.2f);

            // 26) 특별 인재 모달 (feat-025 3단계) — 발표자 글로우 강조.
            CutsceneDirector.PlaySpecialHire("actor_ai");
            yield return WaitRealtime(0.6f);
            var cs9 = GameObject.Find("CutsceneDirector");
            if (cs9 != null && cs9.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs9, "26-special-hire.png");
            yield return WaitRealtime(2.2f);

            // 27) 위기 모달 (feat-025 3단계) — 붉은 경고 타이틀·surprise 프레임·색종이 없음.
            CutsceneDirector.PlayCrisis("actor_human");
            yield return WaitRealtime(0.6f);
            var cs10 = GameObject.Find("CutsceneDirector");
            if (cs10 != null && cs10.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs10, "27-crisis.png");
            yield return WaitRealtime(2.2f);

            // 28) 엔딩 전설 (feat-026) — 골드 타이틀·3인 환호·색종이 폭풍.
            CutsceneDirector.PlayEnding(EndingBucket.Legendary, "🏆 프런티어 데모 제국");
            yield return WaitRealtime(0.6f);
            var cs11 = GameObject.Find("CutsceneDirector");
            if (cs11 != null && cs11.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs11, "28-ending-legendary.png");
            yield return WaitRealtime(2.2f);

            // 29) 엔딩 성공 (feat-026) — 틸 타이틀·2인 환호.
            CutsceneDirector.PlayEnding(EndingBucket.Triumph, "표준 세계의 복리 플랫폼");
            yield return WaitRealtime(0.6f);
            var cs12 = GameObject.Find("CutsceneDirector");
            if (cs12 != null && cs12.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs12, "29-ending-triumph.png");
            yield return WaitRealtime(2.2f);

            // 30) 엔딩 차고로 (feat-026) — 무채색 타이틀·낙담(sad)·색종이 없음.
            CutsceneDirector.PlayEnding(EndingBucket.Restart, "다시 차고로");
            yield return WaitRealtime(0.6f);
            var cs13 = GameObject.Find("CutsceneDirector");
            if (cs13 != null && cs13.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs13, "30-ending-restart.png");
            yield return WaitRealtime(2.2f);

            // 31) 엔딩 몰락 (feat-026) — 붉은 타이틀·놀람(surprise)·경고 기호·색종이 없음.
            CutsceneDirector.PlayEnding(EndingBucket.Collapse, "다시 차고로");
            yield return WaitRealtime(0.6f);
            var cs14 = GameObject.Find("CutsceneDirector");
            if (cs14 != null && cs14.GetComponent<Canvas>() != null)
                yield return CaptureCanvas(cs14, "31-ending-collapse.png");
            yield return WaitRealtime(2.2f);

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

        // 포즈 시트 — 캐릭터 3종 × 포즈 5종(idle/work/cheer/card_use/alert)을 그리드로 렌더해 feat-023 15포즈 반입을 검증.
        // IconLibrary 이름(actor_{char}[_suffix])으로 로드 — 누락 시 빨강. AI는 violet 정본인지 함께 확인.
        [UnityTest]
        public IEnumerator Capture_PoseSheet()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var canvasGo = new GameObject("PoseSheet", typeof(RectTransform), typeof(Canvas));
            canvasGo.GetComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;

            var bg = new GameObject("BG", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(canvasGo.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bg.GetComponent<Image>().color = new Color(0.98f, 0.969f, 0.875f, 1f); // cream

            var chars = new[] { "actor_human", "actor_ai", "actor_robot" };
            var suffixes = new[] { "", "_work", "_cheer", "_carduse", "_alert" }; // 행 = 포즈
            float[] cx = { 0.2f, 0.5f, 0.8f };
            for (int row = 0; row < suffixes.Length; row++)
            {
                for (int col = 0; col < chars.Length; col++)
                {
                    var key = chars[col] + suffixes[row];
                    var sprite = IconLibrary.Get(key);
                    var go2 = new GameObject(key, typeof(RectTransform), typeof(Image));
                    go2.transform.SetParent(canvasGo.transform, false);
                    var rect = go2.GetComponent<RectTransform>();
                    float fy = 0.9f - row * 0.18f;
                    rect.anchorMin = new Vector2(cx[col], fy);
                    rect.anchorMax = new Vector2(cx[col], fy);
                    rect.pivot = new Vector2(0.5f, 0.5f);
                    rect.sizeDelta = new Vector2(220, 220);
                    var img = go2.GetComponent<Image>();
                    img.sprite = sprite;
                    img.preserveAspect = true;
                    img.color = sprite != null ? Color.white : new Color(1f, 0f, 0f, 0.35f); // 누락 시 빨강
                }
            }

            Canvas.ForceUpdateCanvases();
            yield return null;
            yield return CaptureCanvas(canvasGo, "20-pose-sheet.png");

            Object.Destroy(canvasGo);
            yield return null;
        }

        // 변형 시트 — 캐릭터 3종 × 색 변형 6종(ActorPalette)을 그리드로 렌더해 직원별 색 다양성을 검증 (feat-023).
        [UnityTest]
        public IEnumerator Capture_VarietySheet()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var canvasGo = new GameObject("VarietySheet", typeof(RectTransform), typeof(Canvas));
            canvasGo.GetComponent<Canvas>().renderMode = RenderMode.ScreenSpaceOverlay;

            var bg = new GameObject("BG", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(canvasGo.transform, false);
            var bgRect = bg.GetComponent<RectTransform>();
            bgRect.anchorMin = Vector2.zero;
            bgRect.anchorMax = Vector2.one;
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bg.GetComponent<Image>().color = new Color(0.98f, 0.969f, 0.875f, 1f);

            var chars = new[] { "actor_human", "actor_ai", "actor_robot" };
            for (int row = 0; row < chars.Length; row++)
            {
                for (int v = 0; v < ActorPalette.VariantCount; v++)
                {
                    var sprite = ActorPalette.Recolored(chars[row], "", v);
                    var go2 = new GameObject(chars[row] + "_v" + v, typeof(RectTransform), typeof(Image));
                    go2.transform.SetParent(canvasGo.transform, false);
                    var rect = go2.GetComponent<RectTransform>();
                    float fx = 0.12f + v * 0.152f;
                    float fy = 0.8f - row * 0.3f;
                    rect.anchorMin = new Vector2(fx, fy);
                    rect.anchorMax = new Vector2(fx, fy);
                    rect.pivot = new Vector2(0.5f, 0.5f);
                    rect.sizeDelta = new Vector2(180, 180);
                    var img = go2.GetComponent<Image>();
                    img.sprite = sprite;
                    img.preserveAspect = true;
                    img.color = sprite != null ? Color.white : new Color(1f, 0f, 0f, 0.35f);
                }
            }

            Canvas.ForceUpdateCanvases();
            yield return null;
            yield return CaptureCanvas(canvasGo, "21-variety-sheet.png");

            Object.Destroy(canvasGo);
            yield return null;
        }

        // 오브젝트 퍼레이드 — feat-024 소품 13종(prop_*/furniture_*)을 그리드로 렌더해 크로마키 재생성/임포트 검증. (이전 v054/v091 obj_* atlas는 prop_* 개별 전환 후 제거됨.)
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
                "furniture_desk_white", "furniture_desk_wood", "prop_bookshelf", "prop_couch",
                "prop_vending", "prop_cooler", "prop_plant", "prop_coffee",
                "prop_printer", "prop_serverRack", "prop_table", "prop_trophy",
                "prop_whiteboard",
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

        // 분위 반응 캡처 — feat-028 PlayMoodReaction 4종(Great/Good/Flat/Bad)을 각각 캡처한다.
        // talent=8 주입 후 분위별로 PlayMoodReaction을 호출해 직원 포즈 다양성을 시각 확인한다.
        [UnityTest]
        public IEnumerator Capture_MoodReactions()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var go = new GameObject("CaptureBootstrap");
            var boot = go.AddComponent<GameBootstrap>();
            yield return null;
            yield return null;
            Canvas.ForceUpdateCanvases();
            yield return null;
            Assert.IsNotNull(boot.Screen, "GameScreen이 빌드되어야 한다.");

            var canvasGo = GameObject.Find(CanvasName);
            Assert.IsNotNull(canvasGo, "캔버스를 찾지 못함.");

            // talent=8 로 2열 직원 배치
            boot.Context.Model.Talent = 8;
            boot.Screen.RefreshAll();
            yield return WaitRealtime(0.6f);

            // Great
            boot.Screen.PlayMoodReaction(AICompanyTycoon.Systems.MonthMood.Great);
            yield return WaitRealtime(0.3f);
            yield return CaptureCanvas(canvasGo, "32-mood-great.png");

            boot.Screen.RefreshAll();
            yield return WaitRealtime(0.4f);

            // Good
            boot.Screen.PlayMoodReaction(AICompanyTycoon.Systems.MonthMood.Good);
            yield return WaitRealtime(0.3f);
            yield return CaptureCanvas(canvasGo, "33-mood-good.png");

            boot.Screen.RefreshAll();
            yield return WaitRealtime(0.4f);

            // Flat
            boot.Screen.PlayMoodReaction(AICompanyTycoon.Systems.MonthMood.Flat);
            yield return WaitRealtime(0.3f);
            yield return CaptureCanvas(canvasGo, "34-mood-flat.png");

            boot.Screen.RefreshAll();
            yield return WaitRealtime(0.4f);

            // Bad
            boot.Screen.PlayMoodReaction(AICompanyTycoon.Systems.MonthMood.Bad);
            yield return WaitRealtime(0.3f);
            yield return CaptureCanvas(canvasGo, "35-mood-bad.png");

            Object.Destroy(go);
            yield return null;
        }

        // 월 진행 타임랩스 캡처 — feat-028 PlayMonthTransitionCo를 직접 구동해 중간 프레임(~0.45s, Day~15 + 틴트 최고조)을 캡처한다.
        [UnityTest]
        public IEnumerator Capture_MonthTimelapse()
        {
            if (!HasGraphics)
            {
                Assert.Ignore("그래픽 디바이스 없음 — 캡처 스킵(-nographics).");
            }

            var go = new GameObject("CaptureBootstrap");
            var boot = go.AddComponent<GameBootstrap>();
            yield return null;
            yield return null;
            Canvas.ForceUpdateCanvases();
            yield return null;
            Assert.IsNotNull(boot.Screen, "GameScreen이 빌드되어야 한다.");

            var canvasGo = GameObject.Find(CanvasName);
            Assert.IsNotNull(canvasGo, "캔버스를 찾지 못함.");

            // GameBootstrap(MonoBehaviour)을 통해 코루틴 실행 — GameScreen은 MonoBehaviour가 아니므로 경유한다.
            boot.StartCoroutine(boot.Screen.PlayMonthTransitionCo());
            yield return WaitRealtime(0.45f); // ~0.45s — 틴트 최고조 + Day~15 카운터 중간점
            yield return CaptureCanvas(canvasGo, "36-month-timelapse.png");
            yield return WaitRealtime(0.55f); // 전환 완전히 끝난 뒤 정리

            Object.Destroy(go);
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
        static IEnumerator CaptureCanvas(GameObject canvasGo, string fileName, int w = W, int h = H)
        {
            var canvas = canvasGo.GetComponent<Canvas>();

            // CanvasScaler를 꺼 캔버스를 1:1 매핑한다(비활성 시 scaleFactor=1 — 기준 해상도와 무관하게 RenderTexture wxh로 직접 캡처).
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

            var rt = new RenderTexture(w, h, 24, RenderTextureFormat.ARGB32);
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
            var tex = new Texture2D(w, h, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, w, h), 0, 0);
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
