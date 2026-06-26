// 세로형 모바일 게임 화면을 생성하고 코어 시뮬레이션 이벤트에 구독합니다.
using System;
using System.Collections.Generic;
using System.Text;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using AICompanyTycoon.Systems;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class GameScreen : IDisposable
    {
        const string ProductsTab = "products";
        const string CapabilitiesTab = "capabilities";
        const string UpgradesTab = "upgrades";

        SimulationContext _context;
        readonly SaveService _save;
        readonly MetaSaveService _meta = new MetaSaveService(); // 크로스런 도감 (feat-008 #2/#3)
        readonly Dictionary<ResourceId, Text> _resourceValues = new Dictionary<ResourceId, Text>();
        readonly Dictionary<ResourceId, ResourceTicker> _resourceTickers = new Dictionary<ResourceId, ResourceTicker>();
        readonly Dictionary<ResourceId, Text> _deltaLabels = new Dictionary<ResourceId, Text>();
        readonly Dictionary<ResourceId, double> _prevValues = new Dictionary<ResourceId, double>();
        readonly Dictionary<string, Button> _tabButtons = new Dictionary<string, Button>();

        Canvas _canvas;
        Text _monthLabel;
        Text _stageLabel;
        Text _summaryLabel;
        Text _statusLabel;
        GameObject _resultModal;
        Text _resultTitle;
        Text _resultMessage;
        Text _scoreRank;
        Text _scoreTotal;
        Text _scoreDelta;
        Text _scoreMarquee;
        Marquee _marquee;
        Text _crestLabel;
        Button _trayToggle;
        Text _trayToggleLabel;
        GameObject _resourceTray;
        bool _trayOpen;
        Text _goalRibbonText;
        Button _nextMonthButton;
        Text _nextMonthLabel;

        GameObject _productsPanel;
        GameObject _capabilitiesPanel;
        GameObject _upgradesPanel;
        Transform _productsContent;
        Transform _capabilitiesContent;
        Transform _upgradesContent;
        Transform _officeSceneContent;
        Transform _reactionLayer;

        GameObject _eventModal;
        string _lastTriggeredEventId;   // 이벤트 발생 당황 컷인 중복 방지(같은 이벤트 refresh 재표시 제외).
        Text _eventTitle;
        Text _eventDescription;
        Transform _eventChoices;

        GameObject _menuPopup;
        Text _menuTitle;
        GameObject _moreDrawer;
        bool _menuOpen;

        GameObject _worldRevealModal;  // 세계 뽑기 리빌 (feat-007 블록 #4)
        Transform _worldRevealRows;
        Text _worldRevealSeed;

        GameObject _interviewModal;    // 개업 인터뷰 (feat-015 #2) / 시리즈 투자 제안 (feat-015 #3)
        Text _interviewTitleLabel;
        Text _interviewSpeaker;
        Text _interviewPrompt;
        Transform _interviewChoices;
        List<StartupInterview.Step> _interviewSteps;
        int _interviewIndex;
        System.Action _interviewOnComplete;
        InvestmentRound _pendingInvestment;  // 성급 승급으로 대기 중인 투자 제안
        int _lastRichestRank = -1;           // 세계 부자 순위 등반 토스트용 (세션 한정, 비저장)
        double _expectedRevenue;             // 정산 전 기대수익 스냅샷 (feat-014 #3)
        int _pendingCardUse;                 // 월 정산 중 쌓인 직원 card_use 반응 수 — 리프레시 뒤 적용 (feat-023)
        int _pendingAlert;                   // 월 정산 중 쌓인 직원 alert 반응 수 (feat-023)

        ToastRibbon _toastRibbon;      // 사건 토스트 리본 (feat-010 #4)

        string _pendingTierId = "standard"; // 새 게임 난이도 선택 (feat-008 #1)
        readonly Dictionary<string, Button> _tierButtons = new Dictionary<string, Button>();

        // feat-012 테크트리 — 접힌 도메인 섹션 (UI 전용 상태, 세이브 비대상)
        readonly HashSet<string> _collapsedDomains = new HashSet<string>();

        MonthSummary _lastSummary;
        string _activeTab = ProductsTab;
        bool _terminal;
        bool _subscribed;

        // AI 비서 가이던스 (feat-009) — FAB·목표 리본이 공유하는 현재 제안과 이번 달에 본 제안 집합.
        GuidanceStep _guidanceStep;
        readonly HashSet<string> _seenGuidance = new HashSet<string>();

        public GameScreen(SimulationContext context, SaveService save)
        {
            _context = context;
            _save = save;
        }

        public void Build()
        {
            _canvas = UiFactory.CreateCanvas("AI Company Tycoon UI");
            var root = UiFactory.Panel(_canvas.transform, UiTheme.ScreenBg);
            root.name = "GameScreen";
            Stretch(root.GetComponent<RectTransform>());

            BuildOfficeBackground(root.transform);
            BuildOfficeScene(root.transform); // 풀스크린 스테이지 — 게임 씬 먼저, UI는 위에 뜬다 (feat-011, React v0.96 구도)

            // 노치/홈 인디케이터를 피해 콘텐츠를 safe area 안에 담는다. 배경(root)은 화면 전체를 덮는다.
            var safeArea = new GameObject("SafeArea", typeof(RectTransform), typeof(SafeAreaFitter));
            safeArea.transform.SetParent(root.transform, false);
            Stretch(safeArea.GetComponent<RectTransform>());
            var content = safeArea.transform;
            UiFactory.VBox(content, 14, new RectOffset(28, 28, 24, 24));

            BuildTopBar(content);
            BuildResourceHud(content);
            BuildScoreboard(content);
            BuildStageSpacer(content);   // 가운데는 비워 스테이지(오피스)가 주인공이 되게
            BuildMonthSummary(content);
            BuildGoalRibbon(content);    // AI 비서 리본 — 도크 바로 위 (React 구도)
            BuildStatusLine(content);
            BuildBottomDock(content);    // CD-3 하단 도크 — 탭 + 다음달 FAB + 더보기
            BuildMenuPopup(_canvas.transform);   // 탭 콘텐츠는 오피스 위 팝업으로
            BuildMoreDrawer(_canvas.transform);  // 저장/불러오기/새 게임 드로어
            BuildWorldRevealModal(_canvas.transform); // 세계 뽑기 리빌 (feat-007)
            BuildInterviewModal(_canvas.transform);   // 개업 인터뷰 (feat-015 #2)
            BuildEventModal(_canvas.transform);
            BuildResultModal(_canvas.transform);
            SetActivePanel(_activeTab);
            Subscribe();
        }

        public void ReplaceContext(SimulationContext context)
        {
            _context = context;
            _lastSummary = null;
            _terminal = false;
            _prevValues.Clear();
            _seenGuidance.Clear();
            HideEventModal();
            if (_resultModal != null) _resultModal.SetActive(false);
            SetStatus("새 회사를 시작했습니다.");
            RefreshAll();
        }

        public void RefreshAll()
        {
            UpdateTopBar();
            UpdateResourceHud();
            UpdateResourceDeltas();
            RefreshScoreboard();
            RefreshGoalRibbon();
            RefreshOfficeScene();
            RefreshLists();
            UpdateSummary();
            UpdateEventModalFromContext();
            UpdateNextMonthButton();
        }

        public void HandleAdvanceMonth()
        {
            if (_context == null || _terminal)
            {
                return;
            }

            if (_context.Events.Current != null)
            {
                SetStatus("진행 중인 이벤트를 먼저 선택하세요.");
                UpdateEventModalFromContext();
                return;
            }

            // 증감 계산용 스냅샷
            foreach (var id in ResourceIds.All)
                _prevValues[id] = _context.Model.Get(id);

            var visibilityBefore = _context.Visibility.Snapshot(); // 해금 모먼트 감지 (feat-012 #4)
            var synergiesBefore = SnapshotActiveSynergies();       // 시너지 가동 감지 (feat-013 #1)
            _expectedRevenue = _context.Products.EstimateMonthlyRevenue(); // 기대수익 (feat-014 #3, 정산 전 스냅샷)

            _lastSummary = _context.Month.AdvanceMonth();
            _terminal = _lastSummary.GameOver || _lastSummary.GameWon;
            _seenGuidance.Clear(); // 새 달 — AI 비서 제안을 처음부터 다시 (feat-009)
            SetStatus("월간 정산이 완료되었습니다.");

            var balance = _context.Catalog.balance;
            if (!_terminal && balance != null && UnityEngine.Random.value < (float)balance.eventTriggerChance)
            {
                var triggered = _context.Events.TryTrigger();
                if (triggered != null)
                {
                    ShowEventModal(triggered);
                    _pendingAlert += UnityEngine.Random.Range(1, 3); // 직원 1~2명 놀람 반응 (feat-023)
                }
            }

            RefreshAll();
            ShowMonthlyDopamine(_lastSummary); // 수익 플로팅 + 환호 + 사건 토스트 (feat-010)
            AnnounceDiscoveries(visibilityBefore); // ???→실명 해금 모먼트 (feat-012 #4)
            AnnounceSynergies(synergiesBefore);    // 시너지/콤보 가동 모먼트 (feat-013 #1)
            AnnounceRichestClimb();                // 세계 부자 순위 등반 모먼트 (feat-015 #5)

            if (_terminal)
            {
                ShowResultModal(_lastSummary.GameWon, _lastSummary.Outcome);
            }
            else if (_pendingInvestment != null && (_context.Events == null || _context.Events.Current == null))
            {
                // 이벤트 모달이 없을 때만 — 시리즈 투자 제안을 띄운다 (feat-015 #3).
                var offer = _pendingInvestment;
                _pendingInvestment = null;
                ShowInvestmentOffer(offer);
            }
        }

        // 월 정산 페이오프 연출 — 수익이 보이고, 직원이 환호하고, 사건이 흐른다 (feat-010 #1/#3/#4).
        void ShowMonthlyDopamine(MonthSummary s)
        {
            if (s == null || _reactionLayer == null) return;

            // 수익 플로팅 — 금액이 클수록 크게, 여러 발로.
            if (s.Revenue > 0)
            {
                int pops = s.Revenue >= 5000 ? 3 : s.Revenue >= 1500 ? 2 : 1;
                int size = s.Revenue >= 5000 ? 52 : s.Revenue >= 1500 ? 46 : 40;
                for (int i = 0; i < pops; i++)
                {
                    FloatingText.Spawn(_reactionLayer, "+$" + FormatNumber(s.Revenue), UiTheme.ChipGoldText, size,
                        new Vector2(UnityEngine.Random.Range(-140f, 140f), 40f + i * 14f), i * 0.22f);
                }

                for (int i = 0; i < Mathf.Min(pops, 2); i++)
                {
                    SpawnReaction(i == 0 ? "react_cheer" : "react_coffee");
                }
            }

            if (s.NewUsers > 0)
            {
                FloatingText.Spawn(_reactionLayer, "+이용자 " + FormatNumber(s.NewUsers), UiTheme.ScoreboardTag, 36,
                    new Vector2(UnityEngine.Random.Range(-100f, 100f), -10f), 0.35f);
            }

            // 사건 토스트 — 세계 이벤트가 오피스를 가리지 않고 흐른다.
            if (_toastRibbon != null && s.WorldEventTitles != null)
            {
                foreach (var title in s.WorldEventTitles)
                {
                    _toastRibbon.Enqueue("세계 이벤트 — " + title, UiTheme.ScoreboardLive);
                }
            }

            // 니어미스 — 승리가 가까우면 긴장 한 줄.
            var near = MilestoneService.GetNearMiss(_context.Model, _context.Catalog.balance);
            if (near != null && _toastRibbon != null)
            {
                _toastRibbon.Enqueue(near.Text, UiTheme.GoalAccent);
            }
        }

        // 중앙 빅 축하 — v077 엠블럼 + 라벨이 크게 떴다 사라지고 파티클이 터진다 (feat-010 #3).
        void SpawnCelebration(string emblemName, string text)
        {
            FxManager.Celebrate(0.35f, 30, 1.1f);
            if (_reactionLayer == null) return;

            var go = new GameObject("Celebration", typeof(RectTransform), typeof(CanvasGroup));
            go.transform.SetParent(_reactionLayer, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchoredPosition = new Vector2(0f, 90f);
            UiFactory.VBox(go.transform, 4, new RectOffset());

            var sprite = IconLibrary.Get(emblemName);
            if (sprite != null)
            {
                var icon = UiFactory.Icon(go.transform, sprite, 132);
                icon.raycastTarget = false;
            }

            var label = UiFactory.Label(go.transform, text, 44);
            label.fontStyle = FontStyle.Bold;
            label.color = UiTheme.CrestGold;
            label.alignment = TextAnchor.MiddleCenter;
            var outline = label.gameObject.AddComponent<Outline>();
            outline.effectColor = new Color(0.12f, 0.09f, 0.05f, 0.9f);
            outline.effectDistance = new Vector2(2f, -2f);

            go.AddComponent<ReactionBubble>().Init(2.0f);
            UiTween.PopIn(go.transform, go.GetComponent<CanvasGroup>());
        }

        public void HandleSave()
        {
            if (_context == null)
            {
                return;
            }

            _save.Save(_context.Model);
            SetStatus("저장했습니다.");
            RefreshAll();
        }

        public void HandleLoad()
        {
            if (_context == null)
            {
                return;
            }

            if (!_save.HasSave())
            {
                SetStatus("저장 파일이 없습니다.");
                return;
            }

            if (_save.Load(_context.Model))
            {
                // 구버전 세이브 마이그레이션 — 경쟁사 데이터가 없으면 진입월 기준으로 재초기화
                if (_context.Model.CompetitorStates.Count == 0)
                {
                    _context.Market.InitStates();
                }

                _lastSummary = null;
                _terminal = false;
                HideEventModal();
                SetStatus("불러왔습니다.");
                RefreshAll();
            }
            else
            {
                SetStatus("불러오기에 실패했습니다.");
            }
        }

        public void Dispose()
        {
            Unsubscribe();
            if (_canvas != null)
            {
                UnityEngine.Object.Destroy(_canvas.gameObject);
            }
        }

        Image _officeBgImage; // 성급 비주얼 사다리 — 단계 승급 시 배경 스왑 (feat-014 #5)
        AmbientRoomFx _ambientFx;        // 앰비언트 룸 애니 (feat-019 T4) — 단계 승급 시 룸키 재구성
        RectTransform _ambientCoverRoot; // 네이티브 캔버스(240x534) 좌표계 루트 — CoverMatch가 cover 스케일

        // 사무실 배경을 전체에 깔고 위에 반투명 막을 얹어 UI 가독성을 확보한다. 성급에 따라 배경이 진화한다.
        void BuildOfficeBackground(Transform parent)
        {
            var tex = LoadStageBackground();
            if (tex == null)
            {
                return;
            }

            var bgGo = new GameObject("OfficeBackground", typeof(RectTransform), typeof(Image), typeof(AspectRatioFitter));
            bgGo.transform.SetParent(parent, false);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = bgRect.anchorMax = new Vector2(0.5f, 0.5f);
            bgRect.pivot = new Vector2(0.5f, 0.5f);
            // cover — 화면비와 무관하게 종횡비 유지로 화면을 채운다(정사각 도트 보존, 넘침은 크롭).
            // 풀스트레치(preserveAspect=false + Stretch)는 비정수 non-uniform 스케일이라 폰에서 도트가 직사각으로 뭉개졌다.
            var fitter = bgGo.GetComponent<AspectRatioFitter>();
            fitter.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            fitter.aspectRatio = (float)tex.width / tex.height;
            var bgImage = bgGo.GetComponent<Image>();
            bgImage.sprite = Sprite.Create(tex, new Rect(0f, 0f, tex.width, tex.height), new Vector2(0.5f, 0.5f));
            bgImage.preserveAspect = false;
            bgImage.raycastTarget = false;
            _officeBgImage = bgImage;

            // 그라데이션 스크림 — 오피스 무대(중앙)는 거의 환하게, 상단 HUD·하단 도크 뒤만 어둡게 (feat-019 T2).
            // 균일 0.38은 픽셀 배경 채도를 죽였다. 세로 알파 그라데이션 텍스처로 무대 생기를 살리고 UI 텍스트 대비는 가장자리에서 확보한다.
            var scrimTex = MakeVerticalScrimTexture();
            var scrimGo = new GameObject("BackgroundScrim", typeof(RectTransform), typeof(Image));
            scrimGo.transform.SetParent(parent, false);
            Stretch(scrimGo.GetComponent<RectTransform>());
            var scrimImg = scrimGo.GetComponent<Image>();
            scrimImg.sprite = Sprite.Create(scrimTex, new Rect(0f, 0f, scrimTex.width, scrimTex.height), new Vector2(0.5f, 0.5f));
            scrimImg.type = Image.Type.Simple;
            scrimImg.preserveAspect = false;
            scrimImg.raycastTarget = false;

            // 앰비언트 룸 애니 오버레이 — 스크림 위·직원 아래. 배경 발광요소(모니터·LED·창·조명)에 절차 애니로 생명을 준다 (feat-019 T4).
            var ambientGo = new GameObject("AmbientRoom", typeof(RectTransform));
            ambientGo.transform.SetParent(parent, false);
            _ambientCoverRoot = ambientGo.GetComponent<RectTransform>();
            _ambientCoverRoot.anchorMin = _ambientCoverRoot.anchorMax = new Vector2(0.5f, 0.5f);
            _ambientCoverRoot.pivot = new Vector2(0.5f, 0.5f);
            _ambientCoverRoot.sizeDelta = new Vector2(240f, 534f); // 네이티브 캔버스 — CoverMatch가 배경 cover 높이에 맞춰 스케일
            ambientGo.AddComponent<CoverMatch>().Init(bgRect, 534f);
            _ambientFx = ambientGo.AddComponent<AmbientRoomFx>();
            _ambientFx.Init(CurrentRoomKey(), _ambientCoverRoot);
        }

        // 세로 알파 그라데이션 스크림 텍스처 — 하단(도크·리본)·상단(HUD·스코어보드)은 진하게, 중앙(무대)은 거의 투명 (feat-019 T2).
        Texture2D MakeVerticalScrimTexture()
        {
            const int h = 256;
            var tex = new Texture2D(2, h, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            var c = UiTheme.ScreenBg;
            for (int y = 0; y < h; y += 1)
            {
                float v = y / (float)(h - 1);                       // 0 = 화면 하단, 1 = 화면 상단 (텍스처 bottom-up)
                float aBottom = 1f - Mathf.SmoothStep(0f, 0.22f, v); // v<0.22(하단 도크) 진함
                float aTop = Mathf.SmoothStep(0.74f, 0.98f, v);      // v>0.74(상단 HUD) 진함
                float alpha = Mathf.Lerp(0.05f, 0.52f, Mathf.Max(aBottom, aTop));
                var col = new Color(c.r, c.g, c.b, alpha);
                tex.SetPixel(0, y, col);
                tex.SetPixel(1, y, col);
            }
            tex.Apply();
            return tex;
        }

        // 현재 성급의 룸 키(basename) — AmbientRoomFx 룸 프리셋 선택용 (feat-019 T4).
        string CurrentRoomKey()
        {
            var key = StageVisual.BackgroundKey(_context != null ? _context.Model.CompanyStageId : null);
            int slash = key.LastIndexOf('/');
            return slash >= 0 ? key.Substring(slash + 1) : key;
        }

        // 현재 성급에 맞는 배경 텍스처 — 단계 전용이 없으면 기본 office로 폴백 (feat-014 #5).
        Texture2D LoadStageBackground()
        {
            var key = StageVisual.BackgroundKey(_context != null ? _context.Model.CompanyStageId : null);
            var tex = Resources.Load<Texture2D>(key);
            return tex != null ? tex : Resources.Load<Texture2D>(StageVisual.FallbackKey);
        }

        // 단계 승급 시 배경 스왑. 신규 단계 아트가 있으면 진화, 없으면 기존 유지(드롭인 준비).
        void RefreshStageBackground()
        {
            if (_officeBgImage == null) return;
            var tex = LoadStageBackground();
            if (tex == null) return;
            _officeBgImage.sprite = Sprite.Create(tex, new Rect(0f, 0f, tex.width, tex.height), new Vector2(0.5f, 0.5f));
            if (_ambientFx != null && _ambientCoverRoot != null)
            {
                _ambientFx.Init(CurrentRoomKey(), _ambientCoverRoot); // 룸 변경 시 앰비언트 프리셋 재구성
            }
        }

        // CD-1 전국 AI 기업 랭킹 LED 전광판 — 태그+LIVE 점멸 / #랭크 /총사 ▲델타 / 흐르는 마퀴.
        void BuildScoreboard(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.ScoreboardBg);
            panel.name = "Scoreboard";
            AddLayout(panel, 172, 0);
            UiFactory.VBox(panel.transform, 6, new RectOffset(22, 22, 12, 12));

            // 1행 — 태그 + LIVE 뱃지(점멸)
            var top = new GameObject("ScoreTop", typeof(RectTransform));
            top.transform.SetParent(panel.transform, false);
            UiFactory.HBox(top.transform, 10);
            AddLayout(top, 40, 0);

            var tag = UiFactory.Label(top.transform, "전국 AI 기업 랭킹", 30);
            tag.color = UiTheme.ScoreboardTag;
            tag.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(tag.gameObject, 38, 1);

            var badge = UiFactory.Panel(top.transform, UiTheme.ScoreboardLive);
            badge.name = "LiveBadge";
            badge.AddComponent<CanvasGroup>();
            badge.AddComponent<LiveBlink>();
            AddLayoutFixed(badge, 88, 40);
            var liveText = UiFactory.Label(badge.transform, "LIVE", 26);
            liveText.color = UiTheme.ScoreboardLiveText;
            liveText.alignment = TextAnchor.MiddleCenter;
            liveText.horizontalOverflow = HorizontalWrapMode.Overflow;
            liveText.raycastTarget = false;
            Stretch(liveText.GetComponent<RectTransform>());

            // 2행 — #랭크 / 총사 ▲델타
            var rankRow = new GameObject("ScoreRank", typeof(RectTransform));
            rankRow.transform.SetParent(panel.transform, false);
            UiFactory.HBox(rankRow.transform, 10);
            AddLayout(rankRow, 60, 0);

            _scoreRank = UiFactory.Label(rankRow.transform, "#—", 52);
            _scoreRank.color = UiTheme.ScoreboardRank;
            _scoreRank.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreRank.gameObject, 58, 0);

            _scoreTotal = UiFactory.Label(rankRow.transform, "/ —사", 30);
            _scoreTotal.color = UiTheme.ScoreboardTag;
            _scoreTotal.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreTotal.gameObject, 58, 0);

            _scoreDelta = UiFactory.Label(rankRow.transform, "—", 32);
            _scoreDelta.color = UiTheme.DeltaFlat;
            _scoreDelta.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreDelta.gameObject, 58, 1);

            // 3행 — 마퀴 (RectMask2D 클리핑 + 우→좌 흐름)
            var viewport = new GameObject("MarqueeViewport", typeof(RectTransform), typeof(RectMask2D));
            viewport.transform.SetParent(panel.transform, false);
            AddLayout(viewport, 36, 0);
            var viewportRect = viewport.GetComponent<RectTransform>();

            var contentGo = new GameObject("MarqueeText", typeof(RectTransform), typeof(Text));
            contentGo.transform.SetParent(viewport.transform, false);
            var contentRect = contentGo.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0, 0.5f);
            contentRect.anchorMax = new Vector2(0, 0.5f);
            contentRect.pivot = new Vector2(0, 0.5f);
            contentRect.sizeDelta = new Vector2(2400, 34);

            _scoreMarquee = contentGo.GetComponent<Text>();
            _scoreMarquee.font = UiFactory.LegacyFont;
            _scoreMarquee.fontSize = 28;
            _scoreMarquee.color = UiTheme.ScoreboardMarquee;
            _scoreMarquee.alignment = TextAnchor.MiddleLeft;
            _scoreMarquee.horizontalOverflow = HorizontalWrapMode.Overflow;
            _scoreMarquee.verticalOverflow = VerticalWrapMode.Overflow;
            _scoreMarquee.raycastTarget = false;
            _scoreMarquee.text = "";

            _marquee = viewport.AddComponent<Marquee>();
            _marquee.Init(contentRect, viewportRect, _scoreMarquee);
        }

        // 전광판 값 갱신 — 파생 모듈에서 전국 랭킹 + 마퀴를 읽어 라벨에 반영.
        void RefreshScoreboard()
        {
            if (_scoreRank == null || _context == null || _context.Market == null)
            {
                return;
            }

            var nr = ScoreboardRanking.DeriveNationalRanking(_context.Market, _context.Model);
            var ci = System.Globalization.CultureInfo.InvariantCulture;
            _scoreRank.text = "#" + nr.rank.ToString("N0", ci);
            _scoreTotal.text = "/ " + nr.total.ToString("N0", ci) + "사";
            if (nr.delta > 0)
            {
                _scoreDelta.text = "▲" + nr.delta;
                _scoreDelta.color = UiTheme.DeltaUp;
            }
            else if (nr.delta < 0)
            {
                _scoreDelta.text = "▼" + System.Math.Abs(nr.delta);
                _scoreDelta.color = UiTheme.DeltaDown;
            }
            else
            {
                _scoreDelta.text = "—";
                _scoreDelta.color = UiTheme.DeltaFlat;
            }

            var lines = ScoreboardRanking.BuildScoreboardMarquee(_context.Market, _context.Model, _context.Catalog, _context.Equity);
            _scoreMarquee.text = string.Join("    ·    ", lines);
        }

        // office 배경 위에 직원 캐릭터(actor_*)를 세울 사무실 씬 영역. 가구(뒤) + 직원(앞) 2층.
        // VBox 가운데를 비워 뒤의 풀스크린 스테이지가 보이게 하는 투명 스페이서 (feat-011).
        void BuildStageSpacer(Transform parent)
        {
            var spacer = new GameObject("StageSpacer", typeof(RectTransform));
            spacer.transform.SetParent(parent, false);
            AddLayout(spacer, 200, 1);
        }

        void BuildOfficeScene(Transform parent)
        {
            // 풀스크린 스테이지 — UI 패널 뒤, 화면 중앙 밴드에 절대 배치 (feat-011, React 게임-씬-퍼스트 구도).
            var panel = new GameObject("OfficeScene", typeof(RectTransform));
            panel.transform.SetParent(parent, false);
            var stageRect = panel.GetComponent<RectTransform>();
            stageRect.anchorMin = new Vector2(0f, 0.20f);
            stageRect.anchorMax = new Vector2(1f, 0.74f);
            stageRect.offsetMin = Vector2.zero;
            stageRect.offsetMax = Vector2.zero;

            // 직원 무대 — 2열 원근(뒷줄 작게·위, 앞줄 크게·아래) + 책상 전경 오클루더로 '앉아 일하는' 연출 (feat-019 T1).
            // HBox 대신 전체 스트레치 컨테이너에 수동 배치(깊이·오클루전 제어). RefreshOfficeScene이 talent 수만큼 채운다.
            var stage = new GameObject("OfficeStage", typeof(RectTransform));
            stage.transform.SetParent(panel.transform, false);
            var sRect = stage.GetComponent<RectTransform>();
            sRect.anchorMin = Vector2.zero;
            sRect.anchorMax = Vector2.one;
            sRect.offsetMin = Vector2.zero;
            sRect.offsetMax = Vector2.zero;
            _officeSceneContent = stage.transform; // Clear는 직원·책상만 비운다(오버레이 보존)
            OfficeProps.Populate(stage.transform, StageVisual.BackgroundKey(_context != null ? _context.Model.CompanyStageId : null)); // feat-023 — 성급별 특화 소품

            // 리액션 버블 전용 오버레이 — 최상단(직원 위)에 절대 위치로 띄운다.
            var overlay = new GameObject("ReactionLayer", typeof(RectTransform));
            overlay.transform.SetParent(panel.transform, false);
            var overlayRect = overlay.GetComponent<RectTransform>();
            overlayRect.anchorMin = Vector2.zero;
            overlayRect.anchorMax = Vector2.one;
            overlayRect.offsetMin = Vector2.zero;
            overlayRect.offsetMax = Vector2.zero;
            _reactionLayer = overlay.transform;

            // 사건 토스트 리본 — 오피스 상단에서 세계 이벤트/승급/니어미스가 흐른다 (feat-010 #4).
            _toastRibbon = ToastRibbon.Create(panel.transform);
        }

        // 직원 무대 팔레트 — gen_office.py draw_desk 톤 정합(책상 전경 오클루더용).
        static readonly Color DeskTopCol = new Color(0xE0 / 255f, 0x9A / 255f, 0x6E / 255f);   // WOOD_L
        static readonly Color DeskFrontCol = new Color(0xC6 / 255f, 0x76 / 255f, 0x54 / 255f); // WOOD
        static readonly Color DeskShadeCol = new Color(0x8A / 255f, 0x4E / 255f, 0x36 / 255f); // WOOD_D
        static readonly Color DeskInkCol = new Color(0x1F / 255f, 0x19 / 255f, 0x12 / 255f);   // INK

        // talent(인재) 수만큼 직원을 2열 원근으로 세운다 — 뒷줄(작게·위) 먼저, 앞줄(크게·아래) 뒤에 그려 깊이를 준다 (feat-019 T1).
        void RefreshOfficeScene()
        {
            if (_officeSceneContent == null || _context == null)
            {
                return;
            }

            Clear(_officeSceneContent);
            int talent = (int)_context.Model.Get(ResourceId.Talent);
            int count = Mathf.Clamp(talent, 0, 10);
            if (count == 0)
            {
                return;
            }

            var kinds = new[] { "actor_human", "actor_ai", "actor_robot" };
            int front = Mathf.Min(count, 4);
            int back = count - front;               // 0~6 — 뒷줄
            int busy = front >= 2 ? front / 2 : -1; // 앞줄 한 명은 '열일 불꽃'

            // 뒷줄 먼저(뒤에 렌더) — 작게·위.
            if (back > 0)
            {
                PlaceActorRow(kinds, front, back, 0.88f, 292f, 0.14f, allowSpeech: false, busyLocal: -1); // 거의 평평한 2열 — 원근 완화 + 네이티브 배경 바닥선 정합 (feat-023)
            }
            // 앞줄 — 크게·아래(앞). 책상이 다리를 가려 앉은 연출.
            PlaceActorRow(kinds, 0, front, 1.0f, 192f, 0.08f, allowSpeech: true, busyLocal: busy);

            FlushActorMoods(); // 월 정산 중 쌓인 직원 반응(card_use/alert)을 재생성된 액터에 적용 (feat-023)
        }

        // 한 줄(원근 스케일·바닥선)을 수동 배치 — 각 직원 + 책상 전경 오클루더. busyLocal 인덱스엔 열일 불꽃.
        void PlaceActorRow(string[] kinds, int startSeed, int count, float scale, float footY, float marginNorm, bool allowSpeech, int busyLocal)
        {
            const float baseW = 248f, baseH = 248f; // feat-023 — 캐릭터 2차 확대(여전히 작다는 피드백, 200→248)
            for (int i = 0; i < count; i += 1)
            {
                int seed = startSeed + i;
                string kind = kinds[seed % kinds.Length];
                int variant = ActorPalette.VariantFor(seed);          // 직원별 색 변형 (feat-023)
                var sprite = ActorPalette.Recolored(kind, "", variant);
                float xnorm = count <= 1 ? 0.5f : marginNorm + (1f - 2f * marginNorm) * ((i + 0.5f) / count);

                var actorGo = new GameObject("Actor", typeof(RectTransform), typeof(Image));
                actorGo.transform.SetParent(_officeSceneContent, false);
                var aRect = actorGo.GetComponent<RectTransform>();
                aRect.anchorMin = aRect.anchorMax = new Vector2(xnorm, 0f);
                aRect.pivot = new Vector2(0.5f, 0f);
                aRect.sizeDelta = new Vector2(baseW * scale, baseH * scale);
                aRect.anchoredPosition = new Vector2(0f, footY);

                var img = actorGo.GetComponent<Image>();
                img.sprite = sprite;
                img.preserveAspect = true;
                img.raycastTarget = false;
                img.color = sprite != null ? Color.white : new Color(1f, 1f, 1f, 0f);

                Transform flameRoot = null;
                if (sprite != null)
                {
                    actorGo.AddComponent<StaffBob>().Init(seed * 0.9f);
                    actorGo.AddComponent<WorkLoop>().Init(seed, allowSpeech);
                    actorGo.AddComponent<ActorAnim>().Init(sprite, ActorPalette.Recolored(kind, "_work", variant), ActorPalette.Recolored(kind, "_cheer", variant), ActorPalette.Recolored(kind, "_carduse", variant), ActorPalette.Recolored(kind, "_alert", variant), seed); // idle↔작업 타이핑 + 가끔 환호 + card_use/alert 원샷 + 직원별 색 변형 (feat-020/023)
                    if (i == busyLocal)
                    {
                        actorGo.AddComponent<CrunchFlameFx>().Init(aRect, 1.3f); // 열일 불꽃 — 이미지처럼 극적이게 (feat-019 T3)
                        // 불꽃 루트는 방금 생성된 마지막 자식 — 책상 생성 뒤 맨 앞으로 올려 책상에 안 가리게.
                        flameRoot = _officeSceneContent.GetChild(_officeSceneContent.childCount - 1);
                    }
                }

                // 책상 전경 오클루더 — 액터 다음(앞)에 생성해 하반신을 가린다 = 앉아 일하는 연출.
                CreateDeskOccluder(xnorm, footY, baseW * scale, baseH * scale, seed);

                // 열일 불꽃은 책상보다 앞 — 일하는 직원을 감싸 보이게.
                if (flameRoot != null) flameRoot.SetAsLastSibling();
            }
        }

        // 절차적 책상 전면 — 전면 패널 + 상판 밝은 띠 + 바닥 그림자 + 좌우 잉크 + 작은 모니터. 새 스프라이트 없이 '앉은' 오클루전 (feat-019 T1).
        void CreateDeskOccluder(float xnorm, float footY, float actorW, float actorH, int variant)
        {
            // AI 생성 책상 스프라이트 — 전면이 직원 하반신을 가리고 모니터가 가슴 앞에 (feat-020 #2). 변형 2종 교차.
            var deskSprite = IconLibrary.Get(variant % 2 == 0 ? "furniture_desk_wood" : "furniture_desk_white");
            if (deskSprite != null)
            {
                float dh = actorH * 0.66f; // 책상+모니터 높이 — 얼굴은 위로 노출
                float dw = dh * (deskSprite.rect.width / deskSprite.rect.height);
                var ds = new GameObject("Desk", typeof(RectTransform), typeof(Image));
                ds.transform.SetParent(_officeSceneContent, false);
                var dsr = ds.GetComponent<RectTransform>();
                dsr.anchorMin = dsr.anchorMax = new Vector2(xnorm, 0f);
                dsr.pivot = new Vector2(0.5f, 0f);
                dsr.sizeDelta = new Vector2(dw, dh);
                dsr.anchoredPosition = new Vector2(0f, footY);
                var dsi = ds.GetComponent<Image>();
                dsi.sprite = deskSprite;
                dsi.preserveAspect = true;
                dsi.raycastTarget = false;
                return;
            }

            // 폴백 — 스프라이트 미임포트 시 절차 책상.
            float deskW = actorW * 1.34f;
            float deskH = actorH * 0.40f;

            var desk = new GameObject("Desk", typeof(RectTransform), typeof(Image));
            desk.transform.SetParent(_officeSceneContent, false);
            var dRect = desk.GetComponent<RectTransform>();
            dRect.anchorMin = dRect.anchorMax = new Vector2(xnorm, 0f);
            dRect.pivot = new Vector2(0.5f, 0f);
            dRect.sizeDelta = new Vector2(deskW, deskH);
            dRect.anchoredPosition = new Vector2(0f, footY);
            var dImg = desk.GetComponent<Image>();
            dImg.color = DeskFrontCol;
            dImg.raycastTarget = false;

            AddDeskStrip(desk.transform, DeskTopCol, new Vector2(0f, 1f), new Vector2(1f, 1f), new Vector2(0.5f, 1f), deskH * 0.16f, false);   // 상판 밝은 띠
            AddDeskStrip(desk.transform, DeskShadeCol, new Vector2(0f, 0f), new Vector2(1f, 0f), new Vector2(0.5f, 0f), deskH * 0.12f, false); // 바닥 그림자
            AddDeskStrip(desk.transform, DeskInkCol, new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(0f, 0.5f), 2f, true);              // 좌측 잉크
            AddDeskStrip(desk.transform, DeskInkCol, new Vector2(1f, 0f), new Vector2(1f, 1f), new Vector2(1f, 0.5f), 2f, true);              // 우측 잉크

            // 작은 모니터(워크스테이션 느낌) — 상판 위 한쪽.
            var mon = new GameObject("DeskMon", typeof(RectTransform), typeof(Image));
            mon.transform.SetParent(desk.transform, false);
            var mRect = mon.GetComponent<RectTransform>();
            mRect.anchorMin = mRect.anchorMax = new Vector2(0.72f, 1f);
            mRect.pivot = new Vector2(0.5f, 0f);
            float mW = Mathf.Max(14f, deskW * 0.22f);
            mRect.sizeDelta = new Vector2(mW, mW * 0.74f);
            mRect.anchoredPosition = new Vector2(0f, -1f);
            var monImg = mon.GetComponent<Image>();
            monImg.color = new Color(0x24 / 255f, 0x2D / 255f, 0x35 / 255f); // NAVY_D 베젤
            monImg.raycastTarget = false;
            var scr = new GameObject("MonScreen", typeof(RectTransform), typeof(Image));
            scr.transform.SetParent(mon.transform, false);
            var scrR = scr.GetComponent<RectTransform>();
            scrR.anchorMin = new Vector2(0.14f, 0.16f);
            scrR.anchorMax = new Vector2(0.86f, 0.84f);
            scrR.offsetMin = Vector2.zero;
            scrR.offsetMax = Vector2.zero;
            var scrImg = scr.GetComponent<Image>();
            scrImg.color = new Color(0x5F / 255f, 0xC6 / 255f, 0xA6 / 255f); // MINT 화면
            scrImg.raycastTarget = false;
        }

        // 책상 디테일 띠 헬퍼 — 수평(상판/그림자) 또는 수직(좌우 잉크).
        void AddDeskStrip(Transform parent, Color col, Vector2 aMin, Vector2 aMax, Vector2 pivot, float thickness, bool vertical)
        {
            var go = new GameObject("Strip", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var r = go.GetComponent<RectTransform>();
            r.anchorMin = aMin;
            r.anchorMax = aMax;
            r.pivot = pivot;
            r.sizeDelta = vertical ? new Vector2(thickness, 0f) : new Vector2(0f, thickness);
            r.anchoredPosition = Vector2.zero;
            var img = go.GetComponent<Image>();
            img.color = col;
            img.raycastTarget = false;
        }

        void BuildTopBar(Transform parent)
        {
            // 슬림 톱바 — 게임 타이틀은 빼고 월/단계만. 화면은 오피스 무대가 주인공 (feat-011, React 구도).
            var panel = UiFactory.Panel(parent, UiTheme.HeaderBg);
            panel.name = "TopBar";
            AddLayout(panel, 78, 0);
            UiFactory.VBox(panel.transform, 0, new RectOffset(24, 24, 10, 10));

            var row = new GameObject("StatusRow", typeof(RectTransform));
            row.transform.SetParent(panel.transform, false);
            UiFactory.HBox(row.transform, 18);
            AddLayout(row, 58, 0);

            _monthLabel = UiFactory.Label(row.transform, "1월차", 36);
            _monthLabel.color = UiTheme.HeaderText;
            AddLayout(_monthLabel.gameObject, 54, 1);

            _stageLabel = UiFactory.Label(row.transform, "차고 프로토타입", 34);
            _stageLabel.color = UiTheme.HeaderText;
            _stageLabel.alignment = TextAnchor.MiddleRight;
            AddLayout(_stageLabel.gameObject, 54, 1);
        }

        // CD-2 코어3 자원 HUD — 레벨 크레스트 + cash/users/compute 칩 + ＋트레이(보조 5종) + 꾸미기.
        void BuildResourceHud(Transform parent)
        {
            var panel = new GameObject("ResourceHud", typeof(RectTransform));
            panel.transform.SetParent(parent, false);
            UiFactory.VBox(panel.transform, 8, new RectOffset());

            _resourceValues.Clear();

            // 상단 스트립 — 크레스트 + 코어3 칩 + ＋ + 꾸미기
            var strip = new GameObject("CoreStrip", typeof(RectTransform));
            strip.transform.SetParent(panel.transform, false);
            var stripBox = UiFactory.HBox(strip.transform, 8);
            stripBox.childAlignment = TextAnchor.MiddleLeft;
            AddLayout(strip, 88, 0);

            _crestLabel = BuildCrest(strip.transform);
            BuildResourceChip(strip.transform, ResourceId.Cash, true);
            BuildResourceChip(strip.transform, ResourceId.Users, true);
            BuildResourceChip(strip.transform, ResourceId.Compute, true);

            (_trayToggle, _trayToggleLabel) = UiFactory.Button(strip.transform, "＋");
            _trayToggle.onClick.AddListener(ToggleTray);
            AddLayoutFixed(_trayToggle.gameObject, 72, 72);

            // 꾸미기(준비 중) — 이모지 🎨는 Noto Sans KR에 글리프가 없어 한글 라벨로 둔다.
            var decor = UiFactory.Button(strip.transform, "꾸미기");
            decor.label.fontSize = 26;
            decor.label.horizontalOverflow = HorizontalWrapMode.Overflow;
            decor.button.onClick.AddListener(() => SetStatus("꾸미기는 곧 추가됩니다."));
            AddLayoutFixed(decor.button.gameObject, 112, 72);

            // 보조 5종 트레이 — 기본 숨김, ＋ 토글로 노출
            _resourceTray = new GameObject("ResourceTray", typeof(RectTransform));
            _resourceTray.transform.SetParent(panel.transform, false);
            var trayBox = UiFactory.HBox(_resourceTray.transform, 8);
            trayBox.childAlignment = TextAnchor.MiddleLeft;
            AddLayout(_resourceTray, 72, 0);
            BuildResourceChip(_resourceTray.transform, ResourceId.Data, false);
            BuildResourceChip(_resourceTray.transform, ResourceId.Talent, false);
            BuildResourceChip(_resourceTray.transform, ResourceId.Trust, false);
            BuildResourceChip(_resourceTray.transform, ResourceId.Hype, false);
            BuildResourceChip(_resourceTray.transform, ResourceId.Automation, false);
            _resourceTray.SetActive(false);
        }

        // 레벨 크레스트 칩 (N★). 값은 UpdateResourceHud에서 회사 단계로 갱신.
        Text BuildCrest(Transform parent)
        {
            var chip = UiFactory.Panel(parent, UiTheme.HudChipBg);
            chip.name = "LevelCrest";
            AddOutline(chip, UiTheme.CrestGold);
            UiFactory.HBox(chip.transform, 0);
            AddLayoutFixed(chip, 80, 72);

            var label = UiFactory.Label(chip.transform, "1★", 34);
            label.color = UiTheme.CrestGold;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(label.gameObject, 66, 1);
            return label;
        }

        // 자원 칩 — 아이콘(없으면 이름) + 값(+ticker) + 월 델타. core면 크게, 트레이면 작게.
        void BuildResourceChip(Transform parent, ResourceId id, bool core)
        {
            var chip = UiFactory.Panel(parent, UiTheme.HudChipBg);
            chip.name = ResourceIds.ToKey(id) + "Chip";
            AddOutline(chip, UiTheme.HudChipBorder);
            var box = UiFactory.HBox(chip.transform, 6);
            box.padding = new RectOffset(10, 10, 4, 4);
            AddLayout(chip, core ? 72 : 66, 1);

            var sprite = IconLibrary.Resource(id);
            if (sprite != null)
            {
                UiFactory.Icon(chip.transform, sprite, core ? 36 : 30);
            }
            else
            {
                var nm = UiFactory.Label(chip.transform, GetResourcePlainName(id), 24);
                nm.color = UiTheme.TextSecondary;
                nm.horizontalOverflow = HorizontalWrapMode.Overflow;
                AddLayout(nm.gameObject, 30, 0);
            }

            var value = UiFactory.Label(chip.transform, "", core ? 32 : 28);
            value.color = ChipColor(id, false);
            value.alignment = TextAnchor.MiddleLeft;
            value.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(value.gameObject, 40, 1);
            _resourceValues[id] = value;

            var ticker = value.gameObject.AddComponent<ResourceTicker>();
            ticker.Init(id, value, _context != null ? _context.Model.Get(id) : 0);
            _resourceTickers[id] = ticker;

            var delta = UiFactory.Label(chip.transform, "", 24);
            delta.alignment = TextAnchor.MiddleRight;
            var dl = delta.gameObject.AddComponent<LayoutElement>();
            dl.minHeight = 30;
            dl.preferredWidth = 44;
            dl.flexibleWidth = 0;
            _deltaLabels[id] = delta;
        }

        // ＋트레이 토글 — 보조 5종 노출/숨김. 열 때 표시값을 현재값으로 스냅(숨김 중 ticker 정지 보정).
        void ToggleTray()
        {
            _trayOpen = !_trayOpen;
            if (_resourceTray != null)
            {
                _resourceTray.SetActive(_trayOpen);
            }

            if (_trayToggleLabel != null)
            {
                _trayToggleLabel.text = _trayOpen ? "×" : "＋";
            }

            if (_trayOpen)
            {
                SnapTrayValues();
            }
        }

        void SnapTrayValues()
        {
            if (_context == null)
            {
                return;
            }

            foreach (var id in new[] { ResourceId.Data, ResourceId.Talent, ResourceId.Trust, ResourceId.Hype, ResourceId.Automation })
            {
                if (_resourceTickers.TryGetValue(id, out var t) && _resourceValues.TryGetValue(id, out var lbl))
                {
                    t.Init(id, lbl, _context.Model.Get(id));
                }
            }
        }

        Color ChipColor(ResourceId id, bool critical)
        {
            if (critical)
            {
                return UiTheme.ChipCritical;
            }

            return id == ResourceId.Cash ? UiTheme.ChipCashText : UiTheme.ChipGoldText;
        }

        bool IsCritical(ResourceId id)
        {
            if (_context == null)
            {
                return false;
            }

            var b = _context.Catalog.balance;
            if (id == ResourceId.Cash)
            {
                return _context.Model.Cash < 1000;
            }

            if (id == ResourceId.Trust && b != null)
            {
                return _context.Model.Trust < b.gameOverTrustThreshold;
            }

            return false;
        }

        int GetStarRating()
        {
            if (_context == null)
            {
                return 1;
            }

            var stage = _context.Catalog.GetStage(_context.Model.CompanyStageId);
            int star = stage != null ? Mathf.Clamp(stage.order + 1, 1, 6) : 1;
            // 0성 — 차고 단계에서 첫 제품 출시 전 (feat-015 #2). 첫 출시와 함께 1★을 '획득'하는 도파민.
            if (star == 1 && _context.Model.ActiveProducts.Count == 0) return 0;
            return star;
        }

        static void AddOutline(GameObject go, Color color)
        {
            var img = go.GetComponent<Image>();
            if (img == null)
            {
                return;
            }

            var outline = go.AddComponent<Outline>();
            outline.effectColor = color;
            outline.effectDistance = new Vector2(2, -2);
        }

        // AI 비서 리본 (feat-009) — 미나 포트레이트 + 제안 한 줄. FAB와 같은 GuidanceStep을 비춘다.
        void BuildGoalRibbon(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.PanelBg);
            panel.name = "GoalRibbon";
            AddLayout(panel, 66, 0);
            var box = UiFactory.HBox(panel.transform, 10);
            box.padding = new RectOffset(14, 16, 8, 8);
            box.childAlignment = TextAnchor.MiddleLeft;

            var accent = UiFactory.Panel(panel.transform, UiTheme.GoalAccent);
            AddLayoutFixed(accent, 6, 44);

            // 헬퍼 미나 — "AI 비서가 다음 할 일을 알려준다"는 인상의 닻 (v074 포트레이트).
            UiFactory.Icon(panel.transform, IconLibrary.Get("helper_mina"), 48);

            var tag = UiFactory.Label(panel.transform, "AI 비서", 24);
            tag.color = UiTheme.GoalAccent;
            tag.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(tag.gameObject, 44, 0);

            _goalRibbonText = UiFactory.Label(panel.transform, "", 30);
            _goalRibbonText.color = UiTheme.TextPrimary;
            _goalRibbonText.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_goalRibbonText.gameObject, 44, 1);
        }

        // 가이던스 갱신 — 스텝 한 번 계산해 리본 문구 + FAB 라벨/톤을 함께 바꾼다 (feat-009).
        void RefreshGoalRibbon()
        {
            if (_context == null)
            {
                return;
            }

            _guidanceStep = GuidanceService.GetStep(_context, _seenGuidance);

            if (_goalRibbonText != null)
            {
                _goalRibbonText.text = _guidanceStep.Title;
            }

            if (_nextMonthLabel != null)
            {
                _nextMonthLabel.text = _guidanceStep.ActionLabel;
            }

            if (_nextMonthButton != null)
            {
                var tone = _guidanceStep.Tone == "warning" ? UiTheme.FabWarning
                    : _guidanceStep.Tone == "steady" ? UiTheme.FabSteady
                    : UiTheme.Button;
                var img = _nextMonthButton.GetComponent<Image>();
                if (img != null) img.color = tone;
                var colors = _nextMonthButton.colors;
                colors.normalColor = tone;
                colors.highlightedColor = Color.Lerp(tone, Color.white, 0.15f);
                colors.pressedColor = Color.Lerp(tone, Color.black, 0.15f);
                _nextMonthButton.colors = colors;
            }
        }

        // FAB 탭 — 제안이 있으면 그 메뉴를 열고(이번 달 본 것으로 표시), 없으면 다음 달 진행.
        void HandleGuidanceAction()
        {
            var step = _guidanceStep;
            if (step == null || step.TargetTab == null)
            {
                HandleAdvanceMonth();
                return;
            }

            _seenGuidance.Add(step.Id);
            OpenMenu(step.TargetTab);
        }

        // CD-3 하단 도크 — 대칭 2|FAB|2. [제품][능력] [다음달 FAB] [업그레이드][더보기].
        void BuildBottomDock(Transform parent)
        {
            var dock = UiFactory.Panel(parent, UiTheme.DockBg);
            dock.name = "BottomDock";
            AddLayout(dock, 132, 0);
            var box = UiFactory.HBox(dock.transform, 8);
            box.padding = new RectOffset(14, 14, 14, 14);
            box.childAlignment = TextAnchor.MiddleCenter;

            // feat-014 #1 — [제품·연구·경영]. 탭 키(id)는 세이브·가이던스 호환을 위해 유지, 라벨만 개편.
            AddDockTab(dock.transform, ProductsTab, "제품");
            AddDockTab(dock.transform, CapabilitiesTab, "연구");
            BuildFab(dock.transform);
            AddDockTab(dock.transform, UpgradesTab, "경영");

            var more = UiFactory.Button(dock.transform, "더보기");
            more.button.onClick.AddListener(ToggleMore);
            AddLayout(more.button.gameObject, 96, 1);
        }

        void AddDockTab(Transform parent, string key, string label)
        {
            var pair = UiFactory.Button(parent, label);
            pair.button.onClick.AddListener(() => ToggleMenu(key));
            AddLayout(pair.button.gameObject, 96, 1);
            _tabButtons[key] = pair.button;
        }

        // 중앙 가이던스 FAB — 다른 탭(96w)보다 확실히 크고 골드 펄스 링으로 주목 (사용자 피드백 — 가운데 버튼 차별화).
        void BuildFab(Transform parent)
        {
            var cell = new GameObject("FabCell", typeof(RectTransform));
            cell.transform.SetParent(parent, false);
            AddLayoutFixed(cell, 216, 120);

            var ring = new GameObject("FabRing", typeof(RectTransform), typeof(Image));
            ring.transform.SetParent(cell.transform, false);
            var ringRect = ring.GetComponent<RectTransform>();
            ringRect.anchorMin = new Vector2(0.5f, 0.5f);
            ringRect.anchorMax = new Vector2(0.5f, 0.5f);
            ringRect.pivot = new Vector2(0.5f, 0.5f);
            ringRect.sizeDelta = new Vector2(210, 114);
            var ringImg = ring.GetComponent<Image>();
            ringImg.color = new Color(UiTheme.CrestGold.r, UiTheme.CrestGold.g, UiTheme.CrestGold.b, 0.6f); // 골드 펄스 — 가운데 추천 버튼 강조
            ringImg.raycastTarget = false;
            ring.AddComponent<FabPulse>();

            (_nextMonthButton, _nextMonthLabel) = UiFactory.Button(cell.transform, "다음 달");
            var btnRect = _nextMonthButton.GetComponent<RectTransform>();
            btnRect.anchorMin = new Vector2(0.5f, 0.5f);
            btnRect.anchorMax = new Vector2(0.5f, 0.5f);
            btnRect.pivot = new Vector2(0.5f, 0.5f);
            btnRect.sizeDelta = new Vector2(198, 104);
            _nextMonthLabel.fontSize = 40;
            _nextMonthButton.onClick.AddListener(HandleGuidanceAction); // 가이던스 FAB — 라벨·톤·행동이 제안에 따라 바뀐다 (feat-009)
        }

        // 월 요약 — 오피스 아래 슬림 한 줄 (office-first라 높이 축소).
        void BuildMonthSummary(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.PanelBg);
            panel.name = "MonthSummary";
            AddLayout(panel, 110, 0);
            UiFactory.VBox(panel.transform, 4, new RectOffset(18, 18, 10, 10));

            _summaryLabel = UiFactory.Label(panel.transform, "아직 월을 넘기지 않았습니다.", 28);
            AddLayout(_summaryLabel.gameObject, 84, 1);
        }

        void BuildStatusLine(Transform parent)
        {
            _statusLabel = UiFactory.Label(parent, "", 28);
            _statusLabel.color = UiTheme.TextSecondary;
            _statusLabel.alignment = TextAnchor.MiddleCenter;
            AddLayout(_statusLabel.gameObject, 38, 0);
        }

        // CD-3 탭 콘텐츠 팝업 — 오피스 위에 시트로 뜬다. 닫으면 오피스가 깨끗.
        void BuildMenuPopup(Transform parent)
        {
            _menuPopup = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _menuPopup.name = "MenuPopup";
            Stretch(_menuPopup.GetComponent<RectTransform>());
            var scrim = _menuPopup.AddComponent<Button>();
            scrim.transition = Selectable.Transition.None;
            scrim.onClick.AddListener(CloseMenu);

            var card = UiFactory.Panel(_menuPopup.transform, UiTheme.PanelBg);
            card.name = "MenuCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.04f, 0.12f);
            rect.anchorMax = new Vector2(0.96f, 0.80f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 12, new RectOffset(20, 20, 18, 18));

            var header = new GameObject("MenuHeader", typeof(RectTransform));
            header.transform.SetParent(card.transform, false);
            UiFactory.HBox(header.transform, 10);
            AddLayout(header, 56, 0);
            _menuTitle = UiFactory.Label(header.transform, "제품", 40);
            _menuTitle.color = UiTheme.TextPrimary;
            AddLayout(_menuTitle.gameObject, 52, 1);
            var close = UiFactory.Button(header.transform, "✕");
            close.button.onClick.AddListener(CloseMenu);
            AddLayoutFixed(close.button.gameObject, 64, 52);

            var body = new GameObject("MenuBody", typeof(RectTransform));
            body.transform.SetParent(card.transform, false);
            AddLayout(body, 600, 1);
            _productsPanel = CreateScrollPanel(body.transform, "ProductsPanel", out _productsContent);
            _capabilitiesPanel = CreateScrollPanel(body.transform, "CapabilitiesPanel", out _capabilitiesContent);
            _upgradesPanel = CreateScrollPanel(body.transform, "UpgradesPanel", out _upgradesContent);

            _menuPopup.SetActive(false);
        }

        // 더보기 드로어 — 저장/불러오기/새 게임.
        void BuildMoreDrawer(Transform parent)
        {
            _moreDrawer = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _moreDrawer.name = "MoreDrawer";
            Stretch(_moreDrawer.GetComponent<RectTransform>());
            var scrim = _moreDrawer.AddComponent<Button>();
            scrim.transition = Selectable.Transition.None;
            scrim.onClick.AddListener(CloseMore);

            var card = UiFactory.Panel(_moreDrawer.transform, UiTheme.PanelBg);
            card.name = "MoreCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.14f, 0.30f);
            rect.anchorMax = new Vector2(0.86f, 0.72f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 12, new RectOffset(24, 24, 22, 22));

            var title = UiFactory.Label(card.transform, "더보기", 40);
            title.alignment = TextAnchor.MiddleCenter;
            AddLayout(title.gameObject, 46, 0);

            var save = UiFactory.Button(card.transform, "저장");
            save.button.onClick.AddListener(() => { HandleSave(); CloseMore(); });
            AddLayout(save.button.gameObject, 80, 0);

            var load = UiFactory.Button(card.transform, "불러오기");
            load.button.onClick.AddListener(() => { HandleLoad(); CloseMore(); });
            AddLayout(load.button.gameObject, 80, 0);

            var collection = UiFactory.Button(card.transform, "도감");
            collection.button.onClick.AddListener(() => { CloseMore(); CollectionGallery.Show(_canvas.transform, _context.Catalog, _meta.Data); });
            AddLayout(collection.button.gameObject, 80, 0);

            // 난이도 티어 선택 (feat-008 #1) — 스토리/표준/하드/브루탈. 하드 이상은 월간 헤드윈드.
            var tierRow = new GameObject("TierRow", typeof(RectTransform));
            tierRow.transform.SetParent(card.transform, false);
            UiFactory.HBox(tierRow.transform, 8);
            AddLayout(tierRow, 64, 0);
            _tierButtons.Clear();
            if (_context != null && _context.Catalog != null)
            {
                foreach (var tier in _context.Catalog.difficultyTiers)
                {
                    if (tier == null) continue;
                    var tierId = tier.id;
                    var tb = UiFactory.Button(tierRow.transform, tier.displayName);
                    tb.label.fontSize = 26;
                    tb.button.onClick.AddListener(() => SelectTier(tierId));
                    AddLayout(tb.button.gameObject, 60, 1);
                    _tierButtons[tierId] = tb.button;
                }
                HighlightTierButtons();
            }

            // 새 게임 = 세계 굴리기 — 시드 런으로 4축을 굴리고 리빌을 보여준다 (feat-007 블록 #4, 로그라이크 루프).
            var fresh = UiFactory.Button(card.transform, "새 게임 (세계 굴리기)");
            fresh.button.onClick.AddListener(() =>
            {
                var seed = "run-" + UnityEngine.Random.Range(100000, 999999);
                ReplaceContext(SimulationContext.Create(_context.Catalog, 12345,
                    new RunModifierInput { Seed = seed, ChallengeTierId = _pendingTierId }));
                CloseMore();
                ShowWorldReveal();
            });
            AddLayout(fresh.button.gameObject, 80, 0);

            // 새 게임 (개업 스토리) — 차고 0성 + 개업 인터뷰 3장 (feat-015 #2). 선택이 지분·빚을 가른다.
            var story = UiFactory.Button(card.transform, "새 게임 (개업 스토리)");
            story.button.onClick.AddListener(() =>
            {
                var seed = "run-" + UnityEngine.Random.Range(100000, 999999);
                ReplaceContext(SimulationContext.Create(_context.Catalog, 12345,
                    new RunModifierInput { Seed = seed, ChallengeTierId = _pendingTierId }));
                CloseMore();
                StartInterview();
            });
            AddLayout(story.button.gameObject, 80, 0);

            var close = UiFactory.Button(card.transform, "닫기");
            close.button.onClick.AddListener(CloseMore);
            AddLayout(close.button.gameObject, 72, 0);

            _moreDrawer.SetActive(false);
        }

        // 개업 인터뷰 모달 — 기자 인터뷰 톤의 3장 선택 시퀀스 (feat-015 #2).
        void BuildInterviewModal(Transform parent)
        {
            _interviewModal = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _interviewModal.name = "InterviewModal";
            Stretch(_interviewModal.GetComponent<RectTransform>());

            var card = UiFactory.Panel(_interviewModal.transform, UiTheme.PanelBg);
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.06f, 0.14f);
            rect.anchorMax = new Vector2(0.94f, 0.86f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 14, new RectOffset(26, 26, 24, 24));

            _interviewTitleLabel = UiFactory.Label(card.transform, "개업 인터뷰", UiTheme.FontTitle);
            _interviewTitleLabel.color = UiTheme.TextPrimary;
            AddLayout(_interviewTitleLabel.gameObject, 50, 0);

            _interviewSpeaker = UiFactory.Label(card.transform, "", UiTheme.FontEmphasis);
            _interviewSpeaker.color = UiTheme.GoalAccent;
            AddLayout(_interviewSpeaker.gameObject, 42, 0);

            _interviewPrompt = UiFactory.Label(card.transform, "", UiTheme.FontBody);
            _interviewPrompt.color = UiTheme.TextSecondary;
            AddLayout(_interviewPrompt.gameObject, 110, 1);

            var choices = new GameObject("InterviewChoices", typeof(RectTransform));
            choices.transform.SetParent(card.transform, false);
            UiFactory.VBox(choices.transform, 10, new RectOffset());
            AddLayout(choices, 380, 0);
            _interviewChoices = choices.transform;

            _interviewModal.SetActive(false);
        }

        // 개업 스토리 시작 — 인터뷰 3장 진행. 끝나면 개업 토스트와 함께 0성 차고에서 출발.
        public void StartInterview()
        {
            if (_interviewModal == null || _context == null) return;
            _interviewTitleLabel.text = "개업 인터뷰";
            _interviewSteps = StartupInterview.GetSteps();
            _interviewIndex = 0;
            _interviewOnComplete = () =>
            {
                if (_toastRibbon != null)
                {
                    _toastRibbon.Enqueue("개업! — 차고에서 시작하는 AI 회사", UiTheme.CrestGold);
                }

                SpawnCelebration("celebrate_combo", "개업!");
            };
            ShowInterviewStep();
        }

        // 상장 모달 — 공모 지분 3택(종 치기 빅 모먼트). 인터뷰 모달 재사용 (feat-015 #4).
        void ShowIpoModal()
        {
            if (_interviewModal == null || _context == null || !_context.Ipo.CanIpo()) return;
            _interviewTitleLabel.text = "상장 (IPO)";
            _interviewOnComplete = null;

            var step = new StartupInterview.Step
            {
                Speaker = "증권거래소",
                Prompt = "\"드디어 상장이군요! 공모 지분을 얼마나 내놓으시겠습니까? 시장이 프리미엄을 얹어 값을 매깁니다.\"",
            };
            foreach (double pct in new[] { 10.0, 20.0, 30.0 })
            {
                double captured = pct;
                step.Choices.Add(new StartupInterview.Choice
                {
                    Label = "공모 " + pct.ToString("F0") + "% (+" + FormatMoney(_context.Ipo.GetOfferingCash(pct)) + ")",
                    Description = "지분 " + pct.ToString("F0") + "%를 시장에 풀고 상장 자금을 확보한다.",
                    Apply = ctx =>
                    {
                        if (ctx.Ipo.Ipo(captured, ctx.Resources))
                        {
                            // 세리머니 컷씬이 종 치기·환호·$·폭죽을 담당 (feat-017 #2) — 기존 빅팝·파티클 대체.
                            AICompanyTycoon.Core.GameEvents.RaiseIpoCompleted();
                            if (_toastRibbon != null) _toastRibbon.Enqueue("상장 성공 — 세계 시장 데뷔!", UiTheme.CrestGold);
                        }
                    }
                });
            }

            _interviewSteps = new List<StartupInterview.Step> { step };
            _interviewIndex = 0;
            ShowInterviewStep();
        }

        // 시리즈 투자 제안 — 성급 승급으로 등장하는 일회성 라운드 (feat-015 #3). 같은 인터뷰 모달 재사용.
        void ShowInvestmentOffer(InvestmentRound round)
        {
            if (_interviewModal == null || _context == null || round == null) return;
            _interviewTitleLabel.text = round.Title + " 투자 제안";
            _interviewOnComplete = null;
            _interviewSteps = new List<StartupInterview.Step>
            {
                new StartupInterview.Step
                {
                    Speaker = round.Investor,
                    Prompt = "\"회사 가치를 " + FormatMoney(_context.Equity.GetValuation()) + "로 봅니다. 지분 " + round.EquityPercent.ToString("F0") + "%에 " + FormatMoney(round.CashIn) + " 투자하죠.\"",
                    Choices =
                    {
                        new StartupInterview.Choice
                        {
                            Label = "투자 수락 (지분 " + round.EquityPercent.ToString("F0") + "% / +" + FormatMoney(round.CashIn) + ")",
                            Description = "현금이 들어오고 지분 " + round.EquityPercent.ToString("F0") + "%를 내준다.",
                            Apply = ctx =>
                            {
                                if (ctx.Funding.Accept(round, ctx.Resources))
                                {
                                    if (_toastRibbon != null) _toastRibbon.Enqueue(round.Title + " 유치 — " + FormatMoney(round.CashIn) + "!", UiTheme.CrestGold);
                                    SpawnCelebration("celebrate_combo", round.Title + " 유치!");
                                }
                            }
                        },
                        new StartupInterview.Choice
                        {
                            Label = "거절 (지분 사수)",
                            Description = "지분을 지킨다. 다음 라운드는 없다.",
                            Apply = ctx => ctx.Funding.Decline(round)
                        }
                    }
                }
            };
            _interviewIndex = 0;
            ShowInterviewStep();
        }

        void ShowInterviewStep()
        {
            if (_interviewSteps == null || _interviewIndex >= _interviewSteps.Count)
            {
                _interviewModal.SetActive(false);
                _interviewOnComplete?.Invoke();
                _interviewOnComplete = null;
                RefreshAll();
                return;
            }

            var step = _interviewSteps[_interviewIndex];
            _interviewSpeaker.text = step.Speaker;
            _interviewPrompt.text = step.Prompt;
            Clear(_interviewChoices);
            foreach (var choice in step.Choices)
            {
                var b = UiFactory.Button(_interviewChoices, choice.Label);
                b.label.fontSize = UiTheme.FontBody;
                var captured = choice;
                b.button.onClick.AddListener(() =>
                {
                    captured.Apply?.Invoke(_context);
                    SetStatus(captured.Description);
                    _interviewIndex++;
                    ShowInterviewStep();
                });
                AddLayout(b.button.gameObject, 64, 0);

                var desc = AddSmallText(_interviewChoices, choice.Description);
                AddLayout(desc.gameObject, 34, 0);
            }

            _interviewModal.SetActive(true);
            _interviewModal.transform.SetAsLastSibling();
            var interviewCard = _interviewModal.transform.GetChild(0);
            UiTween.PopIn(interviewCard, interviewCard.GetComponent<CanvasGroup>());
        }

        // 세계 뽑기 리빌 — 굴린 4축(도시/세계관/시장/창업자)을 v078 스탬프와 함께 보여준다 (feat-007 블록 #4).
        void BuildWorldRevealModal(Transform parent)
        {
            _worldRevealModal = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _worldRevealModal.name = "WorldRevealModal";
            Stretch(_worldRevealModal.GetComponent<RectTransform>());

            var card = UiFactory.Panel(_worldRevealModal.transform, UiTheme.PanelBg);
            card.name = "WorldRevealCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.08f, 0.16f);
            rect.anchorMax = new Vector2(0.92f, 0.84f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 14, new RectOffset(26, 26, 24, 24));

            var title = UiFactory.Label(card.transform, "새로운 세계", 42);
            title.fontStyle = FontStyle.Bold;
            title.alignment = TextAnchor.MiddleCenter;
            AddLayout(title.gameObject, 52, 0);

            _worldRevealSeed = UiFactory.Label(card.transform, "", 28);
            _worldRevealSeed.alignment = TextAnchor.MiddleCenter;
            _worldRevealSeed.color = UiTheme.TextSecondary;
            AddLayout(_worldRevealSeed.gameObject, 30, 0);

            var rows = new GameObject("Rows", typeof(RectTransform));
            rows.transform.SetParent(card.transform, false);
            UiFactory.VBox(rows.transform, 12, new RectOffset(0, 0, 0, 0));
            var rowsLayout = rows.AddComponent<LayoutElement>();
            rowsLayout.flexibleHeight = 1;
            _worldRevealRows = rows.transform;

            var start = UiFactory.Button(card.transform, "이 세계로 시작!");
            start.button.onClick.AddListener(() => _worldRevealModal.SetActive(false));
            AddLayout(start.button.gameObject, 84, 0);

            _worldRevealModal.SetActive(false);
        }

        // 리빌 모달을 현재 런 상태로 채워 연다. 표준 런이면 보여줄 게 없어 열지 않는다 (React shouldShowWorldReveal 대응).
        public void ShowWorldReveal()
        {
            if (_worldRevealModal == null || _context == null) return;
            var run = _context.Model.RunModifiers;
            if (run == null || run.IsDefaultRun()) return;

            Clear(_worldRevealRows);
            var tier = _context.Catalog.GetDifficultyTier(run.ChallengeTier);
            _worldRevealSeed.text = "시드 " + run.Seed
                + (tier != null && tier.id != RunModifiersState.DefaultChallengeTier ? " · 난이도 " + tier.displayName : "");
            AddWorldRevealRow("world_city", "시작 도시", _context.Catalog.GetRunOption("start_cities", run.StartCityId));
            AddWorldRevealRow("world_world", "세계관", _context.Catalog.GetRunOption("world_lore", run.WorldLoreId));
            AddWorldRevealRow("world_market", "시장 상황", _context.Catalog.GetRunOption("market_conditions", run.MarketConditionId));
            AddWorldRevealRow("world_founder", "창업자", _context.Catalog.GetRunOption("founder_traits", run.FounderTraitId));

            // 파생 아키타입 (feat-008 #2) — 태그 조합이 만든 숨은 정체성. 신규 발견은 도감에 기록 + 토스트.
            var derived = ArchetypeService.GetDerived(run, _context.Catalog);
            var fresh = ArchetypeService.GetNewlyDiscovered(_meta.Data.discoveredArchetypeIds, derived);
            foreach (var archetype in derived)
            {
                bool isNew = fresh.Contains(archetype.id);
                AddArchetypeRevealRow(archetype, isNew);
            }
            if (fresh.Count > 0)
            {
                _meta.RecordArchetypes(fresh);
                FxManager.Celebrate(0.4f, 26, 1.0f);
                if (_toastRibbon != null)
                {
                    foreach (var id in fresh)
                    {
                        var rule = _context.Catalog.GetArchetype(id);
                        _toastRibbon.Enqueue("새 아키타입 발견 — " + (rule != null ? rule.displayName : id), UiTheme.CrestGold);
                    }
                }
            }

            _worldRevealModal.SetActive(true);
            PopInCard(_worldRevealModal, "WorldRevealCard");
        }

        // 아키타입 리빌 행 — 축하 엠블럼 + 제목(신규는 NEW! 골드) + 효과 요약 (feat-008 #2).
        void AddArchetypeRevealRow(ArchetypeDef archetype, bool isNew)
        {
            var row = new GameObject("ArchetypeRow", typeof(RectTransform));
            row.transform.SetParent(_worldRevealRows, false);
            UiFactory.HBox(row.transform, 14);
            var rowLayout = row.AddComponent<LayoutElement>();
            rowLayout.minHeight = 96;
            rowLayout.preferredHeight = 96;

            UiFactory.Icon(row.transform, IconLibrary.Get("celebrate_synergy"), 64);

            var texts = new GameObject("Texts", typeof(RectTransform));
            texts.transform.SetParent(row.transform, false);
            UiFactory.VBox(texts.transform, 2, new RectOffset(0, 0, 4, 4));
            var textsLayout = texts.AddComponent<LayoutElement>();
            textsLayout.flexibleWidth = 1;

            var headline = UiFactory.Label(texts.transform, "아키타입 — " + archetype.displayName + (isNew ? "  NEW!" : ""), 30);
            headline.fontStyle = FontStyle.Bold;
            headline.color = isNew ? UiTheme.CrestGold : UiTheme.TextPrimary;
            AddLayout(headline.gameObject, 38, 0);

            var desc = UiFactory.Label(texts.transform, archetype.yieldsSummary, 24);
            desc.color = UiTheme.TextSecondary;
            AddLayout(desc.gameObject, 0, 1);
        }

        void AddWorldRevealRow(string stampName, string axisLabel, RunModifierOptionDef option)
        {
            var row = new GameObject("RevealRow", typeof(RectTransform));
            row.transform.SetParent(_worldRevealRows, false);
            UiFactory.HBox(row.transform, 14);
            var rowLayout = row.AddComponent<LayoutElement>();
            rowLayout.minHeight = 108;
            rowLayout.preferredHeight = 108;

            UiFactory.Icon(row.transform, IconLibrary.Get(stampName), 72);

            var texts = new GameObject("Texts", typeof(RectTransform));
            texts.transform.SetParent(row.transform, false);
            UiFactory.VBox(texts.transform, 2, new RectOffset(0, 0, 4, 4));
            var textsLayout = texts.AddComponent<LayoutElement>();
            textsLayout.flexibleWidth = 1;

            var name = option != null ? option.displayName : "?";
            var headline = UiFactory.Label(texts.transform, axisLabel + " — " + name, 32);
            headline.fontStyle = FontStyle.Bold;
            AddLayout(headline.gameObject, 42, 0);

            var desc = UiFactory.Label(texts.transform, option != null ? option.description : "", 27);
            desc.color = UiTheme.TextSecondary;
            AddLayout(desc.gameObject, 0, 1);
        }

        void BuildEventModal(Transform parent)
        {
            _eventModal = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _eventModal.name = "EventModal";
            Stretch(_eventModal.GetComponent<RectTransform>());

            var card = UiFactory.Panel(_eventModal.transform, UiTheme.PanelBg);
            card.name = "EventCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.08f, 0.24f);
            rect.anchorMax = new Vector2(0.92f, 0.78f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 18, new RectOffset(28, 28, 28, 28));

            _eventTitle = UiFactory.Label(card.transform, "", 42);
            AddLayout(_eventTitle.gameObject, 70, 0);

            _eventDescription = UiFactory.Label(card.transform, "", 32);
            AddLayout(_eventDescription.gameObject, 170, 0);

            var choiceHost = new GameObject("Choices", typeof(RectTransform));
            choiceHost.transform.SetParent(card.transform, false);
            UiFactory.VBox(choiceHost.transform, 12, new RectOffset());
            AddLayout(choiceHost, 220, 1);
            _eventChoices = choiceHost.transform;

            HideEventModal();
        }

        GameObject CreateScrollPanel(Transform parent, string name, out Transform content)
        {
            var root = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(ScrollRect), typeof(CanvasGroup));
            root.transform.SetParent(parent, false);
            Stretch(root.GetComponent<RectTransform>());
            root.GetComponent<Image>().color = Color.clear;

            var viewport = new GameObject("Viewport", typeof(RectTransform), typeof(Image), typeof(RectMask2D));
            viewport.transform.SetParent(root.transform, false);
            Stretch(viewport.GetComponent<RectTransform>());
            viewport.GetComponent<Image>().color = Color.clear;

            var contentGo = new GameObject("Content", typeof(RectTransform), typeof(VerticalLayoutGroup), typeof(ContentSizeFitter));
            contentGo.transform.SetParent(viewport.transform, false);
            var contentRect = contentGo.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0, 1);
            contentRect.anchorMax = new Vector2(1, 1);
            contentRect.pivot = new Vector2(0.5f, 1);
            contentRect.offsetMin = new Vector2(16, 0);
            contentRect.offsetMax = new Vector2(-16, 0);

            var group = contentGo.GetComponent<VerticalLayoutGroup>();
            group.spacing = 14;
            group.padding = new RectOffset(0, 0, 16, 16);
            group.childAlignment = TextAnchor.UpperLeft;
            group.childControlWidth = true;
            group.childControlHeight = true;
            group.childForceExpandWidth = true;
            group.childForceExpandHeight = false;

            var fitter = contentGo.GetComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var scroll = root.GetComponent<ScrollRect>();
            scroll.viewport = viewport.GetComponent<RectTransform>();
            scroll.content = contentRect;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;

            content = contentGo.transform;
            return root;
        }

        // 도크 탭 토글 — 같은 탭이 열려 있으면 닫고, 아니면 그 탭으로 연다.
        void ToggleMenu(string tab)
        {
            if (_menuOpen && _activeTab == tab)
            {
                CloseMenu();
                return;
            }

            OpenMenu(tab);
        }

        void OpenMenu(string tab)
        {
            // 제안 메뉴를 (도크 탭으로라도) 열어 봤으면 이번 달 제안은 소화한 것으로 — FAB가 다음 우선순위로 넘어간다.
            if (_guidanceStep != null && _guidanceStep.TargetTab == tab)
            {
                _seenGuidance.Add(_guidanceStep.Id);
            }

            bool wasOpen = _menuOpen;
            _activeTab = tab;
            _menuOpen = true;
            CloseMore();
            if (_menuPopup != null)
            {
                _menuPopup.SetActive(true);
                if (!wasOpen)
                {
                    PopInCard(_menuPopup, "MenuCard");   // 새로 열 때만 카드 팝인
                }
            }

            if (_menuTitle != null)
            {
                _menuTitle.text = TabTitle(tab);
            }

            SetActivePanel(tab);
            if (wasOpen)
            {
                FadeActivePanel();   // 이미 열린 상태에서 탭만 바꾸면 콘텐츠 크로스페이드 (Block D 탭 전환 페이드)
            }
            UpdateDockHighlight();
        }

        // 탭 전환 시 활성 콘텐츠 패널만 살짝 페이드인한다(카드 전체 재팝인 없이).
        void FadeActivePanel()
        {
            var panel = _activeTab == ProductsTab ? _productsPanel
                : _activeTab == CapabilitiesTab ? _capabilitiesPanel
                : _upgradesPanel;
            if (panel == null)
            {
                return;
            }

            var cg = panel.GetComponent<CanvasGroup>();
            if (cg != null)
            {
                UiTween.FadeIn(cg, 0.16f);
            }
        }

        void CloseMenu()
        {
            _menuOpen = false;
            RefreshGoalRibbon(); // 제안 메뉴를 닫으면 FAB가 다음 제안(또는 다음 달)으로 갱신 (feat-009)
            if (_menuPopup != null)
            {
                _menuPopup.SetActive(false);
            }

            UpdateDockHighlight();
        }

        // 팝업 안에서 어느 콘텐츠 패널을 보일지만 토글 (팝업 가시성과 분리 — RefreshLists에서도 호출).
        void SetActivePanel(string tab)
        {
            _activeTab = tab;
            if (_productsPanel != null) _productsPanel.SetActive(tab == ProductsTab);
            if (_capabilitiesPanel != null) _capabilitiesPanel.SetActive(tab == CapabilitiesTab);
            if (_upgradesPanel != null) _upgradesPanel.SetActive(tab == UpgradesTab);
        }

        void UpdateDockHighlight()
        {
            foreach (var item in _tabButtons)
            {
                bool active = _menuOpen && item.Key == _activeTab;
                var colors = item.Value.colors;
                colors.normalColor = active ? UiTheme.TabActive : UiTheme.Button;
                colors.selectedColor = colors.normalColor;
                item.Value.colors = colors;
            }
        }

        string TabTitle(string tab)
        {
            if (tab == ProductsTab) return "제품";
            if (tab == CapabilitiesTab) return "연구";
            return "경영";
        }

        void ToggleMore()
        {
            if (_moreDrawer == null)
            {
                return;
            }

            bool open = !_moreDrawer.activeSelf;
            if (open)
            {
                CloseMenu();
                _moreDrawer.SetActive(true);
                PopInCard(_moreDrawer, "MoreCard");
            }
            else
            {
                _moreDrawer.SetActive(false);
            }
        }

        void CloseMore()
        {
            if (_moreDrawer != null)
            {
                _moreDrawer.SetActive(false);
            }
        }

        // 난이도 티어 선택 — 선택 버튼만 골드 강조 (feat-008 #1).
        void SelectTier(string tierId)
        {
            _pendingTierId = tierId;
            HighlightTierButtons();
        }

        void HighlightTierButtons()
        {
            foreach (var pair in _tierButtons)
            {
                if (pair.Value == null) continue;
                var active = pair.Key == _pendingTierId;
                var img = pair.Value.GetComponent<Image>();
                if (img != null) img.color = active ? UiTheme.TabActive : UiTheme.Button;
                var colors = pair.Value.colors;
                colors.normalColor = active ? UiTheme.TabActive : UiTheme.Button;
                colors.selectedColor = colors.normalColor;
                pair.Value.colors = colors;
            }
        }

        void Subscribe()
        {
            if (_subscribed)
            {
                return;
            }

            GameEvents.ResourceChanged += OnResourceChanged;
            GameEvents.ResourcesUpdated += UpdateResourceHud;
            GameEvents.MonthAdvanced += OnMonthAdvanced;
            GameEvents.CompanyStageChanged += OnCompanyStageChanged;
            GameEvents.ProductLaunched += OnProductLaunched;
            GameEvents.DomainUnlocked += OnDomainUnlocked;
            GameEvents.CapabilityUpgraded += OnCapabilityUpgraded;
            GameEvents.LogMessage += OnLogMessage;
            _subscribed = true;
        }

        void Unsubscribe()
        {
            if (!_subscribed)
            {
                return;
            }

            GameEvents.ResourceChanged -= OnResourceChanged;
            GameEvents.ResourcesUpdated -= UpdateResourceHud;
            GameEvents.MonthAdvanced -= OnMonthAdvanced;
            GameEvents.CompanyStageChanged -= OnCompanyStageChanged;
            GameEvents.ProductLaunched -= OnProductLaunched;
            GameEvents.DomainUnlocked -= OnDomainUnlocked;
            GameEvents.CapabilityUpgraded -= OnCapabilityUpgraded;
            GameEvents.LogMessage -= OnLogMessage;
            _subscribed = false;
        }

        void OnResourceChanged(ResourceId id, double oldValue, double newValue)
        {
            UpdateResourceHud();
        }

        void OnMonthAdvanced(int month)
        {
            UpdateTopBar();
        }

        void OnCompanyStageChanged(string stageId)
        {
            var stage = _context.Catalog.GetStage(stageId);
            var stageName = stage != null ? stage.displayName : stageId;
            SetStatus("회사 단계 상승 - " + stageName);
            SpawnCelebration("celebrate_achievement", "단계 승급!"); // 빅 모먼트 (feat-010 #3)
            SpawnReaction("react_cheer");
            if (_toastRibbon != null) _toastRibbon.Enqueue("단계 승급 — " + stageName, UiTheme.CrestGold);
            UpdateTopBar();

            // 시리즈 투자 권유 (feat-015 #3) — 승급한 성급의 라운드가 있으면 대기열에. 정산 끝에 모달로 뜬다.
            var offer = _context.Funding.GetOffer(stageId);
            if (offer != null) _pendingInvestment = offer;

            // 성급 비주얼 사다리 (feat-014 #5) — 데이터센터·랜드마크 본사로 배경 진화.
            RefreshStageBackground();
            // 성급별 특화 소품 갱신 (feat-023) — 서버랙/화이트보드/트로피 등이 배경 따라 바뀐다.
            if (_officeSceneContent != null)
            {
                OfficeProps.Populate(_officeSceneContent, StageVisual.BackgroundKey(stageId));
            }
        }

        void OnProductLaunched(string productId)
        {
            var product = _context.Catalog.GetProduct(productId);
            SetStatus("제품 출시 - " + (product != null ? product.displayName : productId));
            if (_context.Model.ActiveProducts.Count == 1)
            {
                SpawnCelebration("celebrate_combo", "첫 제품 출시!"); // 첫 매출 직전의 빅 모먼트 (feat-010 #3)
            }
            SpawnReaction("react_codespark");
            RefreshLists();
        }

        void OnDomainUnlocked(string domainId)
        {
            var domain = _context.Catalog.GetDomain(domainId);
            var domainName = domain != null ? domain.displayName : domainId;
            SetStatus("도메인 해금 - " + domainName);
            if (_toastRibbon != null)
            {
                _toastRibbon.Enqueue("새 분야 개척 — " + domainName + "!", UiTheme.GoalAccent); // feat-012 #4
            }

            SpawnReaction("react_idea");
            _pendingCardUse++; // 직원이 카드 치켜드는 자축 — 새 분야 개척 (feat-023)
            RefreshLists();
        }

        void OnCapabilityUpgraded(string capabilityId, int level)
        {
            var capability = _context.Catalog.GetCapability(capabilityId);
            SetStatus("능력 강화 - " + (capability != null ? capability.displayName : capabilityId) + " Lv." + level);
            SpawnReaction("react_idea");
            _pendingCardUse++; // 직원이 카드 치켜드는 자축 — 능력 강화 (feat-023)
            RefreshAll();
        }

        void OnLogMessage(string message)
        {
            SetStatus(message);
        }

        void UpdateTopBar()
        {
            if (_context == null)
            {
                return;
            }

            _monthLabel.text = _context.Model.CurrentMonth + "월차";
            var stage = _context.Catalog.GetStage(_context.Model.CompanyStageId);
            _stageLabel.text = stage != null ? stage.displayName : _context.Model.CompanyStageId;
        }

        void UpdateResourceHud()
        {
            if (_context == null)
            {
                return;
            }

            foreach (var id in ResourceIds.All)
            {
                if (_resourceTickers.TryGetValue(id, out var ticker))
                {
                    ticker.SetTarget(_context.Model.Get(id));
                }

                if (_resourceValues.TryGetValue(id, out var value))
                {
                    value.color = ChipColor(id, IsCritical(id));
                }
            }

            if (_crestLabel != null)
            {
                _crestLabel.text = GetStarRating() + "★";
            }
        }

        void RefreshLists()
        {
            if (_context == null)
            {
                return;
            }

            BuildProductCards();
            BuildCapabilityCards();
            BuildUpgradeCards();
            SetActivePanel(_activeTab);
        }

        // feat-012 테크트리 — 도메인 섹션 + 발견의 사다리(숨김→???→실명→해금→출시) 렌더.
        void BuildProductCards()
        {
            Clear(_productsContent);

            // 해금 도메인 먼저, ??? 티저 도메인은 뒤로 — 지금 할 수 있는 일이 위에 온다.
            var knownDomains = new HashSet<string>();
            var teaserDomains = new List<DomainDef>();
            foreach (var domain in _context.Catalog.domains)
            {
                if (domain == null)
                {
                    continue;
                }

                knownDomains.Add(domain.id);
                var domainState = _context.Visibility.GetDomainState(domain.id);
                if (domainState == VisibilityState.Hidden)
                {
                    continue; // 숨김 도메인은 섹션 자체가 없다 — 푸터 카운터로만 존재를 암시.
                }

                if (domainState == VisibilityState.Teaser)
                {
                    teaserDomains.Add(domain);
                    continue;
                }

                BuildDomainSection(domain, domainState);
            }

            foreach (var domain in teaserDomains)
            {
                BuildDomainSection(domain, VisibilityState.Teaser);
            }

            // 안전망 — 카탈로그 도메인에 속하지 않는 제품 (도메인 비우거나 미등록).
            foreach (var product in _context.Catalog.products)
            {
                if (product == null || knownDomains.Contains(product.domain))
                {
                    continue;
                }

                var state = _context.Visibility.GetState(product);
                if (state == VisibilityState.Hidden)
                {
                    continue;
                }

                if (state == VisibilityState.Teaser)
                {
                    AddTeaserCard(product);
                }
                else
                {
                    AddProductCard(product, state);
                }
            }

            AddUndiscoveredFooter();
        }

        void BuildDomainSection(DomainDef domain, VisibilityState domainState)
        {
            bool teaserDomain = domainState == VisibilityState.Teaser;
            bool collapsed = _collapsedDomains.Contains(domain.id);

            string arrow = collapsed ? "▶ " : "▼ ";
            string title = teaserDomain
                ? arrow + "??? 미지의 분야"
                : arrow + domain.displayName + " · 발견 " + _context.Visibility.CountDiscovered(domain.id) + "/" + _context.Visibility.CountTotal(domain.id);

            var header = UiFactory.Button(_productsContent, title);
            var headerBg = teaserDomain ? UiTheme.SectionTeaserBg : UiTheme.SectionBg;
            header.button.GetComponent<Image>().color = headerBg;
            var colors = header.button.colors;
            colors.normalColor = headerBg;
            colors.highlightedColor = headerBg;
            colors.pressedColor = headerBg;
            header.button.colors = colors;
            header.label.alignment = TextAnchor.MiddleLeft;
            header.label.fontSize = UiTheme.FontEmphasis;
            header.button.onClick.AddListener(() =>
            {
                if (!_collapsedDomains.Add(domain.id))
                {
                    _collapsedDomains.Remove(domain.id);
                }

                BuildProductCards();
            });
            AddLayout(header.button.gameObject, 58, 0);

            if (collapsed)
            {
                return;
            }

            // 지금 할 수 있는 것 먼저 — 상태 내림차순(출시>해금>실명>티저), 같으면 tier 얕은 순.
            var rows = new List<(ProductDef product, VisibilityState state)>();
            foreach (var product in _context.Catalog.products)
            {
                if (product == null || product.domain != domain.id)
                {
                    continue;
                }

                var state = _context.Visibility.GetState(product);
                if (state != VisibilityState.Hidden)
                {
                    rows.Add((product, state));
                }
            }

            rows.Sort((a, b) => a.state != b.state ? b.state.CompareTo(a.state) : a.product.tier.CompareTo(b.product.tier));

            foreach (var (product, state) in rows)
            {
                if (state == VisibilityState.Teaser)
                {
                    AddTeaserCard(product);
                }
                else
                {
                    AddProductCard(product, state);
                }
            }
        }

        void AddProductCard(ProductDef product, VisibilityState state)
        {
            var card = AddCard(_productsContent, IconLibrary.Domain(product.domain), product.displayName, product.description);
            AddSmallText(card, "도메인 " + GetDomainName(product.domain) + " | 매출 " + FormatNumber(product.baseRevenue) + " | 이용자 +" + FormatNumber(product.baseUsersPerMonth) + " | T" + product.tier);
            AddSmallText(card, "출시 비용 " + FormatCosts(product.launchCost));

            if (state == VisibilityState.Launched)
            {
                // 제품 레벨업 (feat-012 #4) — 매출 +35%/Lv. 매출 엔진이 강화로 자란다.
                int productLevel = _context.Products.GetLevel(product.id);
                AddSmallText(card, "상태 - 활성 제품 Lv." + productLevel + "/" + product.maxLevel);
                // 예상 월매출 (feat-014 #3) — 레벨·신뢰·로스터 보너스 반영 derive.
                AddSmallText(card, "예상 월매출 " + FormatMoney(_context.Products.EstimateProductRevenue(product.id)));
                if (productLevel < product.maxLevel)
                {
                    AddSmallText(card, "강화 비용 " + FormatCosts(_context.Products.GetLevelUpCost(product.id)));
                    var levelUp = UiFactory.Button(card, "제품 강화");
                    levelUp.button.interactable = _context.Products.CanLevelUp(product.id);
                    levelUp.button.onClick.AddListener(() =>
                    {
                        if (_context.Products.LevelUp(product.id))
                        {
                            SetStatus("제품 강화 - " + product.displayName + " Lv." + _context.Products.GetLevel(product.id));
                            SpawnReaction("react_cheer");
                            RefreshAll();
                        }
                        else
                        {
                            SetStatus("강화 비용을 다시 확인하세요.");
                        }
                    });
                    AddLayout(levelUp.button.gameObject, 64, 0);
                }

                return;
            }

            if (state == VisibilityState.Unlocked)
            {
                // 해금(요건 충족) — 출시 버튼. 신뢰/비용 부족이면 비활성 + 사유 표기.
                bool launchable = _context.Products.CanLaunch(product.id);
                if (!launchable)
                {
                    AddSmallText(card, "잠금 사유 - " + GetProductLockReason(product));
                }

                var launch = UiFactory.Button(card, "출시");
                launch.button.interactable = launchable;
                launch.button.onClick.AddListener(() =>
                {
                    var synergiesBefore = SnapshotActiveSynergies(); // 출시가 콤보를 완성할 수 있다 (feat-013 #1)
                    if (_context.Products.Launch(product.id))
                    {
                        RefreshAll();
                        AnnounceSynergies(synergiesBefore);
                    }
                    else
                    {
                        SetStatus("출시 조건을 다시 확인하세요.");
                        RefreshAll();
                    }
                });
                AddLayout(launch.button.gameObject, 64, 0);
                return;
            }

            // Revealed — 실명 공개 + 잠금 + 부족 요건.
            AddSmallText(card, "잠금 사유 - " + GetProductLockReason(product));
        }

        // ??? 티저 카드 — 떡밥 한 줄 + 힌트. 상세/출시 없음 (feat-012 발견의 사다리).
        void AddTeaserCard(ProductDef product)
        {
            var card = UiFactory.Panel(_productsContent, UiTheme.TeaserCardBg);
            UiFactory.VBox(card.transform, 8, new RectOffset(18, 18, 16, 16));

            var title = UiFactory.Label(card.transform, "??? — 잠김", UiTheme.FontEmphasis);
            title.fontStyle = FontStyle.Bold;
            title.color = UiTheme.TeaserText;
            AddLayout(title.gameObject, 42, 0);

            var teaser = AddSmallText(card.transform, _context.Visibility.GetTeaserText(product));
            teaser.fontStyle = FontStyle.Italic;

            var hintCapability = _context.Visibility.GetTeaserHintCapability(product.domain);
            if (!string.IsNullOrEmpty(hintCapability))
            {
                AddSmallText(card.transform, "힌트 — " + GetCapabilityName(hintCapability) + " 연구를 진행해 보세요");
            }
        }

        // 팝업 푸터 — 미발견 수치로 "아직 못 본 게 있다"를 보여준다.
        void AddUndiscoveredFooter()
        {
            int hiddenProducts = _context.Visibility.CountHiddenProducts();
            int hiddenDomains = _context.Visibility.CountHiddenDomains();
            if (hiddenProducts <= 0 && hiddenDomains <= 0)
            {
                return;
            }

            var text = "미지의 영역 — 미발견 제품 " + hiddenProducts + "종";
            if (hiddenDomains > 0)
            {
                text += " · 미지의 분야 " + hiddenDomains + "곳";
            }

            var footer = AddSmallText(_productsContent, text);
            footer.alignment = TextAnchor.MiddleCenter;
            AddLayout(footer.gameObject, 44, 0);
        }

        void BuildCapabilityCards()
        {
            Clear(_capabilitiesContent);

            var domainTitle = UiFactory.Label(_capabilitiesContent, "도메인", 36);
            AddLayout(domainTitle.gameObject, 44, 0);

            // feat-012 — 도메인 리스트에도 같은 노출 상태 머신 적용 (제품 팝업과 정보 누출 일관성).
            // 해금 도메인 먼저, ??? 티저는 뒤로.
            int hiddenDomains = 0;
            var teaserDomainIds = new List<string>();
            foreach (var domain in _context.Catalog.domains)
            {
                if (domain == null)
                {
                    continue;
                }

                var domainState = _context.Visibility.GetDomainState(domain.id);
                if (domainState == VisibilityState.Hidden)
                {
                    hiddenDomains++;
                    continue;
                }

                if (domainState == VisibilityState.Teaser)
                {
                    teaserDomainIds.Add(domain.id);
                    continue;
                }

                var card = AddCard(_capabilitiesContent, IconLibrary.Domain(domain.id), domain.displayName + " · 해금됨", domain.description);
                AddSmallText(card, "요구 능력 " + FormatCapabilityRequirements(domain.unlockRequirements));
            }

            foreach (var domainId in teaserDomainIds)
            {
                var teaserCard = AddCard(_capabilitiesContent, "??? · 미지의 분야", null);
                teaserCard.GetComponent<Image>().color = UiTheme.TeaserCardBg;
                var hintCapability = _context.Visibility.GetTeaserHintCapability(domainId);
                if (!string.IsNullOrEmpty(hintCapability))
                {
                    AddSmallText(teaserCard, "힌트 — " + GetCapabilityName(hintCapability) + " 연구를 진행해 보세요");
                }
            }

            if (hiddenDomains > 0)
            {
                var counter = AddSmallText(_capabilitiesContent, "미지의 분야 " + hiddenDomains + "곳이 더 있습니다");
                counter.alignment = TextAnchor.MiddleCenter;
                AddLayout(counter.gameObject, 40, 0);
            }

            // feat-012 — category 그룹 헤더 (데이터의 category 4값 + 미분류 폴백).
            var categoryOrder = new[] { "research", "applied", "industry", "business", "" };
            var categoryNames = new Dictionary<string, string>
            {
                { "research", "연구 능력" },
                { "applied", "응용 능력" },
                { "industry", "산업 능력" },
                { "business", "비즈니스 능력" },
                { "", "능력" }
            };

            foreach (var category in categoryOrder)
            {
                bool headerAdded = false;
                foreach (var capability in _context.Catalog.capabilities)
                {
                    if (capability == null)
                    {
                        continue;
                    }

                    var capabilityCategory = capability.category ?? "";
                    bool matches = capabilityCategory == category
                        || (category == "" && !categoryNames.ContainsKey(capabilityCategory));
                    if (!matches)
                    {
                        continue;
                    }

                    if (!headerAdded)
                    {
                        var title = UiFactory.Label(_capabilitiesContent, categoryNames[category], 36);
                        AddLayout(title.gameObject, 44, 0);
                        headerAdded = true;
                    }

                    AddCapabilityCard(capability);
                }
            }
        }

        void AddCapabilityCard(CapabilityDef capability)
        {
            int level = _context.Capabilities.GetLevel(capability.id);
            var card = AddCard(_capabilitiesContent, IconLibrary.Capability(capability.id), capability.displayName + " Lv." + level + "/" + capability.maxLevel, capability.description);
            AddSmallText(card, "강화 비용 " + FormatCosts(_context.Capabilities.GetUpgradeCost(capability.id)));

            // feat-012 #4 — "다음 레벨이 여는 것" 미리보기. 연구 동기를 카드에서 직접 보여준다.
            if (level < capability.maxLevel)
            {
                var preview = _context.Visibility.PreviewNextLevel(capability.id);
                if (!preview.IsEmpty)
                {
                    var parts = new List<string>();
                    if (preview.Domains.Count > 0)
                    {
                        parts.Add("새 분야 " + preview.Domains.Count + "곳 해금");
                    }

                    foreach (var product in preview.Products)
                    {
                        parts.Add(product.displayName + " 해금");
                    }

                    var previewText = AddSmallText(card, "다음 Lv." + (level + 1) + " — " + string.Join(" · ", parts));
                    previewText.color = UiTheme.GoalAccent;
                }
            }

            var upgrade = UiFactory.Button(card, level >= capability.maxLevel ? "최대 레벨" : "강화");
            upgrade.button.interactable = _context.Capabilities.CanUpgrade(capability.id);
            upgrade.button.onClick.AddListener(() =>
            {
                var before = _context.Visibility.Snapshot();
                var synergiesBefore = SnapshotActiveSynergies(); // 도메인 해금이 시너지를 완성할 수 있다 (feat-013 #1)
                if (_context.Capabilities.Upgrade(capability.id))
                {
                    RefreshAll();
                    AnnounceDiscoveries(before);
                    AnnounceSynergies(synergiesBefore);
                }
                else
                {
                    SetStatus("강화 조건을 다시 확인하세요.");
                }
            });
            AddLayout(upgrade.button.gameObject, 64, 0);
        }

        // 세계 부자 순위 등반 — 상장 후 순위가 오르면 토스트 (feat-015 #5).
        void AnnounceRichestClimb()
        {
            if (_context == null || !_context.Model.IsPublic) return;
            var rich = RichestRanking.Derive(_context.Model, _context.Equity);
            if (_lastRichestRank > 0 && rich.rank < _lastRichestRank && _toastRibbon != null)
            {
                int climbed = _lastRichestRank - rich.rank;
                _toastRibbon.Enqueue("세계 부자 #" + rich.rank + " — " + climbed + "계단 상승!", UiTheme.CrestGold);
            }

            _lastRichestRank = rich.rank;
        }

        // 산업 시너지/콤보 가동 모먼트 — 포트폴리오 완성이 눈에 보이는 페이오프가 된다 (feat-013 #1).
        HashSet<string> SnapshotActiveSynergies()
        {
            var ids = new HashSet<string>();
            foreach (var def in IndustrySynergyService.GetActive(_context.Model, _context.Catalog))
                ids.Add(def.id);
            return ids;
        }

        void AnnounceSynergies(HashSet<string> before)
        {
            if (before == null || _context == null)
            {
                return;
            }

            foreach (var def in IndustrySynergyService.GetActive(_context.Model, _context.Catalog))
            {
                if (before.Contains(def.id))
                {
                    continue;
                }

                bool isCombo = !string.IsNullOrEmpty(def.riskLabel);
                if (_toastRibbon != null)
                {
                    _toastRibbon.Enqueue((isCombo ? "콤보 가동 — " : "시너지 가동 — ") + def.title + "!",
                        isCombo ? UiTheme.ScoreboardRank : UiTheme.ScoreboardTag);
                }

                SpawnCelebration("celebrate_combo", def.title + " 가동!");
            }
        }

        // ???→실명 해금 모먼트 — 토스트 + 빅 축하 (feat-012 #4).
        void AnnounceDiscoveries(Dictionary<string, VisibilityState> before)
        {
            if (before == null || _context == null)
            {
                return;
            }

            var discovered = _context.Visibility.DiffNewlyDiscovered(before);
            if (discovered.Count == 0)
            {
                return;
            }

            if (_toastRibbon != null)
            {
                if (discovered.Count > 3)
                {
                    _toastRibbon.Enqueue("새 제품 " + discovered.Count + "종 발견!", UiTheme.CrestGold);
                }
                else
                {
                    foreach (var product in discovered)
                    {
                        _toastRibbon.Enqueue("새 제품 발견 — " + product.displayName + "!", UiTheme.CrestGold);
                    }
                }
            }

            SpawnCelebration("celebrate_combo", "새 제품 발견!");
        }

        static string AgentKindLabel(string kind)
            => kind == "human" ? "사람" : kind == "robot" ? "로봇" : "AI";

        static string AgentRarityLabel(string rarity)
            => rarity == "uncommon" ? "고급" : rarity == "rare" ? "희귀" : rarity == "epic" ? "전설" : "일반";

        // 경영정보 — 회사 가치·내 지분·내 자산·주주 명부 (feat-015 #1). 지분 가치가 자라는 게 보이는 카드.
        void BuildEquitySection()
        {
            var title = UiFactory.Label(_upgradesContent, "경영정보", 36);
            AddLayout(title.gameObject, 44, 0);

            // 상장 후엔 시가총액·주가로 진화 (feat-015 #4).
            bool isPublic = _context.Model.IsPublic;
            var card = AddCard(_upgradesContent,
                (isPublic ? "시가총액 " : "회사 가치 ") + FormatMoney(_context.Equity.GetMarketCap()),
                isPublic ? "상장 기업입니다. 주가가 매달 움직입니다." : "월매출·이용자·현금으로 평가한 기업 가치입니다. 매달 자랍니다.");
            var equityLine = AddSmallText(card, "내 지분 " + _context.Model.FounderEquity.ToString("F0") + "% | 내 자산 " + FormatMoney(_context.Equity.GetFounderNetWorth()));
            equityLine.color = UiTheme.GoalAccent;

            if (isPublic)
            {
                AddSmallText(card, "주가 지수 " + _context.Model.SharePrice.ToString("F1") + " (상장가 100 기준)");
            }
            else
            {
                // 상장 — 4성 빅 모먼트 (feat-015 #4).
                var ipoReason = _context.Ipo.GetLockReason();
                AddSmallText(card, ipoReason == null ? "상장 준비 완료 — 종을 울릴 시간입니다." : "상장 조건 — " + ipoReason);
                if (ipoReason == null)
                {
                    var ipo = UiFactory.Button(card, "상장(IPO) 추진");
                    ipo.button.onClick.AddListener(ShowIpoModal);
                    AddLayout(ipo.button.gameObject, 64, 0);
                }
            }

            if (_context.Model.Shareholders.Count == 0)
            {
                AddSmallText(card, "주주 — 창업자 단독 (100%)");
            }
            else
            {
                foreach (var sh in _context.Model.Shareholders)
                {
                    AddSmallText(card, "· " + sh.name + " — " + sh.equity.ToString("F0") + "%");
                }
            }

            // 융자 카드 (feat-015 #3) — 한도 안에서 대출, 보유 현금으로 상환.
            var loanCard = AddCard(_upgradesContent, "은행 융자",
                "예상 월매출 기준 한도 안에서 빌리고, 여유가 생기면 갚습니다.");
            if (_context.Model.LoanPrincipal > 0)
            {
                AddSmallText(loanCard, "대출 잔액 " + FormatMoney(_context.Model.LoanPrincipal) + " | 월 이자 " + FormatMoney(_context.Loan.GetMonthlyInterest()));
            }
            else
            {
                AddSmallText(loanCard, "대출 잔액 없음 (무차입 경영)");
            }

            AddSmallText(loanCard, "신용 한도 " + FormatMoney(_context.Loan.GetLimit()) + " | 추가 가능 " + FormatMoney(_context.Loan.GetAvailable()));

            double borrowAmount = _context.Loan.SuggestedBorrow();
            if (borrowAmount >= 1000)
            {
                var borrow = UiFactory.Button(loanCard, FormatMoney(borrowAmount) + " 대출");
                borrow.button.onClick.AddListener(() =>
                {
                    if (_context.Loan.Borrow(borrowAmount))
                    {
                        SetStatus("대출 실행 - " + FormatMoney(borrowAmount));
                        RefreshAll();
                    }
                });
                AddLayout(borrow.button.gameObject, 60, 0);
            }

            double repayAmount = _context.Loan.MaxRepay();
            if (repayAmount >= 1)
            {
                var repay = UiFactory.Button(loanCard, FormatMoney(repayAmount) + " 상환");
                repay.button.onClick.AddListener(() =>
                {
                    if (_context.Loan.Repay(repayAmount))
                    {
                        SetStatus("대출 상환 - " + FormatMoney(repayAmount));
                        RefreshAll();
                    }
                });
                AddLayout(repay.button.gameObject, 60, 0);
            }
        }

        // 인재 섹션 — 로스터 현황 + 채용 후보 3택1 (feat-014 #1).
        void BuildTalentSection()
        {
            var title = UiFactory.Label(_upgradesContent, "인재", 36);
            AddLayout(title.gameObject, 44, 0);

            var office = _context.Recruit.GetOffice();
            int capacity = _context.Recruit.GetHireCapacity();
            var rosterCard = AddCard(_upgradesContent, "우리 팀 " + _context.Model.HiredAgentIds.Count + "/" + capacity + "명",
                (office != null ? office.displayName : "사무실") + " 기준 정원입니다. 회사가 성장하면 자리가 늘어납니다.");

            foreach (var agentId in _context.Model.HiredAgentIds)
            {
                var agent = _context.Catalog.GetAgentType(agentId);
                if (agent == null)
                {
                    continue;
                }

                AddSmallText(rosterCard, "· " + agent.displayName + " — " + agent.role + " (" + AgentKindLabel(agent.kind) + ")");
            }

            // 로스터 8축 개발력 환산 요약 (feat-014 #3) — 0이 아닌 보너스만 표시.
            var m = _context.Model;
            var cat = _context.Catalog;
            var parts = new List<string>();
            double research = RosterBonus.GetResearchDiscount(m, cat);
            double engineering = RosterBonus.GetEngineeringDiscount(m, cat);
            double revBonus = RosterBonus.GetRevenueBonus(m, cat);
            double userBonus = RosterBonus.GetUserBonus(m, cat);
            double ops = RosterBonus.GetOpsCostReduction(m, cat);
            double autonomy = RosterBonus.GetComputeReduction(m, cat);
            double trustTrickle = RosterBonus.GetMonthlyTrust(m, cat);
            double hypeTrickle = RosterBonus.GetMonthlyHype(m, cat);
            if (research > 0) parts.Add("연구비 -" + (research * 100).ToString("F0") + "%");
            if (engineering > 0) parts.Add("제품강화 -" + (engineering * 100).ToString("F0") + "%");
            if (revBonus > 0) parts.Add("매출 +" + (revBonus * 100).ToString("F0") + "%");
            if (userBonus > 0) parts.Add("이용자 +" + (userBonus * 100).ToString("F0") + "%");
            if (ops > 0) parts.Add("고정비 -" + (ops * 100).ToString("F0") + "%");
            if (autonomy > 0) parts.Add("연산 -" + (autonomy * 100).ToString("F0") + "%");
            if (trustTrickle > 0) parts.Add("월 신뢰 +" + trustTrickle.ToString("F1"));
            if (hypeTrickle > 0) parts.Add("월 화제성 +" + hypeTrickle.ToString("F1"));
            if (parts.Count > 0)
            {
                var bonus = AddSmallText(rosterCard, "팀 개발력 — " + string.Join(" · ", parts));
                bonus.color = UiTheme.GoalAccent;
            }

            var candidatesTitle = AddSmallText(_upgradesContent, "이번 후보 — 마음에 드는 인재를 영입하세요");
            AddLayout(candidatesTitle.gameObject, 40, 0);

            foreach (var candidate in _context.Recruit.GetCandidates())
            {
                var card = AddCard(_upgradesContent, IconLibrary.Capability("language"),
                    candidate.displayName + " · " + AgentRarityLabel(candidate.rarity), candidate.role + " (" + AgentKindLabel(candidate.kind) + ")");
                AddSmallText(card, "연구 " + candidate.statResearch + " | 개발 " + candidate.statEngineering + " | 제품 " + candidate.statProduct + " | 운영 " + candidate.statOperations);
                if (!string.IsNullOrEmpty(candidate.quirk))
                {
                    var quirk = AddSmallText(card, candidate.quirk);
                    quirk.fontStyle = FontStyle.Italic;
                }

                AddSmallText(card, "영입 비용 " + FormatCosts(_context.Recruit.GetHireCost(candidate)));
                var reason = _context.Recruit.GetHireLockReason(candidate);
                if (reason != null)
                {
                    AddSmallText(card, "잠금 사유 - " + reason);
                }

                var hire = UiFactory.Button(card, "영입");
                hire.button.interactable = reason == null;
                var captured = candidate;
                hire.button.onClick.AddListener(() =>
                {
                    int beforeCount = _context.Model.HiredAgentIds.Count;
                    if (_context.Recruit.Hire(captured))
                    {
                        SetStatus("새 인재 합류 — " + captured.displayName);
                        if (_toastRibbon != null)
                        {
                            _toastRibbon.Enqueue("새 동료 — " + captured.displayName + " 합류!", UiTheme.ScoreboardTag);
                        }

                        SpawnReaction("react_cheer");
                        // 3단계 — 첫 직원(정원 0→1)·특별 인재(epic)는 전체 모달, 그 외는 코너 컷인(2단계). 캐릭터는 kind 매핑.
                        string hireActorKey = captured.kind == "ai_agent" ? "actor_ai" : captured.kind == "robot" ? "actor_robot" : "actor_human";
                        if (beforeCount == 0) CutsceneDirector.PlayFirstHire(hireActorKey);
                        else if (captured.rarity == "epic") CutsceneDirector.PlaySpecialHire(hireActorKey);
                        else CutsceneDirector.PlayHireArrival();
                        RefreshAll();
                    }
                    else
                    {
                        SetStatus("영입 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(hire.button.gameObject, 64, 0);
            }

            // 프리랜서 계약 — 정원 없는 반복 talent 공급 (로스터 인재와 달리 능력치 보너스 없음).
            var freelanceCard = AddCard(_upgradesContent, "프리랜서 계약", "단기 계약으로 인력을 충원합니다. 능력치 보너스는 없지만 자리를 차지하지 않습니다.");
            AddSmallText(freelanceCard, "보유 인재 " + FormatNumber(_context.Model.Get(ResourceId.Talent)) + " | 계약 비용 " + FormatMoney(_context.Recruit.GetFreelanceCost()));
            if (!_context.Recruit.CanHireFreelance())
            {
                AddSmallText(freelanceCard, "잠금 사유 - 자금 부족 (보유 " + FormatMoney(_context.Model.Get(ResourceId.Cash)) + ")");
            }

            var freelance = UiFactory.Button(freelanceCard, "계약");
            freelance.button.interactable = _context.Recruit.CanHireFreelance();
            freelance.button.onClick.AddListener(() =>
            {
                if (_context.Recruit.HireFreelance())
                {
                    SetStatus("프리랜서가 합류했습니다.");
                    SpawnReaction("react_coffee");
                    RefreshAll();
                }
                else
                {
                    SetStatus("계약 비용을 다시 확인하세요.");
                }
            });
            AddLayout(freelance.button.gameObject, 64, 0);
        }

        // 전략 섹션 — 자본으로 하는 경영 액션 (feat-014 #4). 마케팅 + 경쟁사 견제(리스크).
        void BuildStrategySection()
        {
            var title = UiFactory.Label(_upgradesContent, "전략 활동", 36);
            AddLayout(title.gameObject, 44, 0);

            AddStrategyAction(StrategyService.Marketing, "마케팅 캠페인",
                "현금을 들여 화제성과 신규 이용자를 끌어올립니다.",
                "효과 — 화제성 +" + (int)StrategyService.MarketingHype + " · 이용자 +" + (int)StrategyService.MarketingUsers,
                "캠페인 집행");

            var rivalName = _context.Strategy.TopRivalName(_context.Catalog);
            AddStrategyAction(StrategyService.Sabotage, "경쟁사 견제",
                "1위 라이벌의 기세를 꺾습니다. 들키면 신뢰가 흔들립니다 (리스크).",
                "대상 — " + (rivalName ?? "없음") + " | 신뢰 -" + (int)StrategyService.SabotageTrustHit + " (점수 -" + (int)(StrategyService.SabotageScoreCut * 100) + "%)",
                "견제 실행");
        }

        void AddStrategyAction(string id, string name, string desc, string effect, string buttonLabel)
        {
            var card = AddCard(_upgradesContent, name, desc);
            AddSmallText(card, effect);
            AddSmallText(card, "비용 " + FormatMoney(_context.Strategy.GetCost(id)));
            var reason = _context.Strategy.GetLockReason(id);
            if (reason != null)
            {
                AddSmallText(card, "잠금 사유 - " + reason);
            }

            var button = UiFactory.Button(card, buttonLabel);
            button.button.interactable = reason == null;
            button.button.onClick.AddListener(() =>
            {
                if (_context.Strategy.Run(id))
                {
                    SetStatus(name + " 실행됨");
                    SpawnReaction(id == StrategyService.Sabotage ? "react_idea" : "react_cheer");
                    if (_toastRibbon != null)
                    {
                        _toastRibbon.Enqueue(name + " — 실행!", id == StrategyService.Sabotage ? UiTheme.ScoreboardLive : UiTheme.ScoreboardTag);
                    }

                    RefreshAll();
                }
                else
                {
                    SetStatus("실행 조건을 다시 확인하세요.");
                }
            });
            AddLayout(button.button.gameObject, 64, 0);
        }

        // 시설 섹션 — 사무실 확장 + 본사 이전 + GPU 증설 (feat-014 #2).
        void BuildFacilitySection()
        {
            var title = UiFactory.Label(_upgradesContent, "시설", 36);
            AddLayout(title.gameObject, 44, 0);

            // 사무실 확장 — 정원·월간 보너스가 한 단계씩 자란다.
            var office = _context.Office.GetCurrent();
            var nextOffice = _context.Office.GetNext();
            var officeCard = AddCard(_upgradesContent, "사무실 — " + (office != null ? office.displayName : "차고"),
                office != null ? office.description : "");
            AddSmallText(officeCard, "정원 " + (office != null ? office.hireCapacity : 3) + "명");
            if (nextOffice != null)
            {
                AddSmallText(officeCard, "다음 — " + nextOffice.displayName + " (정원 " + nextOffice.hireCapacity + "명) | 비용 " + FormatCosts(nextOffice.cost));
                AddSmallText(officeCard, "요구 조건 " + FormatThresholds(nextOffice.unlockRequirements));
                var expandReason = _context.Office.GetExpandLockReason();
                if (expandReason != null)
                {
                    AddSmallText(officeCard, "잠금 사유 - " + expandReason);
                }

                var expand = UiFactory.Button(officeCard, "확장");
                expand.button.interactable = expandReason == null;
                expand.button.onClick.AddListener(() =>
                {
                    var synergiesBefore = SnapshotActiveSynergies();
                    if (_context.Office.Expand())
                    {
                        var moved = _context.Office.GetCurrent();
                        SetStatus("사무실 확장 - " + (moved != null ? moved.displayName : ""));
                        if (_toastRibbon != null)
                        {
                            _toastRibbon.Enqueue("사무실 확장 — " + (moved != null ? moved.displayName : "") + "!", UiTheme.CrestGold);
                        }

                        SpawnCelebration("celebrate_combo", "사무실 확장!");
                        RefreshAll();
                        AnnounceSynergies(synergiesBefore);
                    }
                    else
                    {
                        SetStatus("확장 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(expand.button.gameObject, 64, 0);
            }
            else
            {
                AddSmallText(officeCard, "최대 단계 — 바운더리리스 캠퍼스");
            }

            // 본사 이전 — 유지비와 인재 풀이 갈린다.
            var location = _context.Office.GetLocation();
            var hqCard = AddCard(_upgradesContent, "본사 — " + (location != null ? location.displayName : "강원 산골 차고"),
                location != null ? location.description : "");
            if (location != null)
            {
                AddSmallText(hqCard, "유지비 x" + location.monthlyCostModifier.ToString("F2") + " | 인재 풀 — " + location.talentPool);
            }

            foreach (var target in _context.Catalog.companyLocations)
            {
                if (target == null || (location != null && target.id == location.id))
                {
                    continue;
                }

                var row = AddSmallText(hqCard, "→ " + target.displayName + " (" + target.region + ") | 유지비 x" + target.monthlyCostModifier.ToString("F2") + " | 이전 비용 " + FormatCosts(target.cost));
                var reason = _context.Office.GetRelocateLockReason(target);
                if (reason != null)
                {
                    row.text += " | " + reason;
                    continue;
                }

                var move = UiFactory.Button(hqCard, target.displayName + "로 이전");
                var captured = target;
                move.button.onClick.AddListener(() =>
                {
                    if (_context.Office.Relocate(captured))
                    {
                        SetStatus("본사 이전 - " + captured.displayName);
                        if (_toastRibbon != null)
                        {
                            _toastRibbon.Enqueue("본사 이전 — " + captured.displayName + "!", UiTheme.CrestGold);
                        }

                        SpawnCelebration("celebrate_combo", "본사 이전!");
                        RefreshAll();
                    }
                    else
                    {
                        SetStatus("이전 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(move.button.gameObject, 60, 0);
            }

            var computeCard = AddCard(_upgradesContent, "GPU 증설", "데이터센터에 연산력을 증설합니다. 연구와 제품 강화에 필요합니다.");
            AddSmallText(computeCard, "보유 연산력 " + FormatNumber(_context.Model.Get(ResourceId.Compute)) + " TOPS | 증설 +" + FormatNumber(_context.Recruit.GetComputePackAmount()) + " TOPS | 비용 " + FormatMoney(_context.Recruit.GetComputePackCost()));
            if (!_context.Recruit.CanBuyCompute())
            {
                AddSmallText(computeCard, "잠금 사유 - 자금 부족 (보유 " + FormatMoney(_context.Model.Get(ResourceId.Cash)) + ")");
            }

            var computeButton = UiFactory.Button(computeCard, "증설");
            computeButton.button.interactable = _context.Recruit.CanBuyCompute();
            computeButton.button.onClick.AddListener(() =>
            {
                if (_context.Recruit.BuyCompute())
                {
                    SetStatus("연산력을 증설했습니다.");
                    SpawnReaction("react_idea");
                    RefreshAll();
                }
                else
                {
                    SetStatus("증설 비용을 다시 확인하세요.");
                }
            });
            AddLayout(computeButton.button.gameObject, 64, 0);
        }

        // 경영 탭 (feat-014 #1) — ① 인재(채용 3택1+로스터) ② 시설(GPU 증설, 사무실은 #2) ③ 전략·투자(기존 업그레이드/자동화).
        void BuildUpgradeCards()
        {
            Clear(_upgradesContent);

            BuildEquitySection();
            BuildTalentSection();
            BuildFacilitySection();
            BuildStrategySection();

            var upgradeTitle = UiFactory.Label(_upgradesContent, "전략·투자", 36);
            AddLayout(upgradeTitle.gameObject, 44, 0);

            foreach (var upgrade in _context.Catalog.upgrades)
            {
                if (upgrade == null)
                {
                    continue;
                }

                var purchased = _context.Upgrades.IsPurchased(upgrade.id);
                var card = AddCard(_upgradesContent, upgrade.displayName + (purchased ? " · 보유" : ""), upgrade.description);
                AddSmallText(card, "비용 " + FormatCosts(upgrade.cost));
                AddSmallText(card, "요구 조건 " + FormatThresholds(upgrade.requirements));

                var buy = UiFactory.Button(card, purchased ? "구매 완료" : "구매");
                buy.button.interactable = _context.Upgrades.CanPurchase(upgrade.id);
                buy.button.onClick.AddListener(() =>
                {
                    if (_context.Upgrades.Purchase(upgrade.id))
                    {
                        SetStatus("업그레이드를 구매했습니다.");
                        RefreshAll();
                    }
                    else
                    {
                        SetStatus("구매 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(buy.button.gameObject, 64, 0);
            }

            var automationTitle = UiFactory.Label(_upgradesContent, "자동화", 36);
            AddLayout(automationTitle.gameObject, 44, 0);

            foreach (var automation in _context.Catalog.automation)
            {
                if (automation == null)
                {
                    continue;
                }

                var purchased = _context.Automation.IsPurchased(automation.id);
                var card = AddCard(_upgradesContent, automation.displayName + (purchased ? " · 보유" : ""), automation.description);
                AddSmallText(card, "비용 " + FormatCosts(automation.cost));
                AddSmallText(card, "자동화 +" + FormatNumber(automation.automationGain) + " | " + automation.monthlyBenefitText);
                AddSmallText(card, "요구 조건 " + FormatThresholds(automation.requirements));

                var buy = UiFactory.Button(card, purchased ? "구매 완료" : "구매");
                buy.button.interactable = _context.Automation.CanPurchase(automation.id);
                buy.button.onClick.AddListener(() =>
                {
                    if (_context.Automation.Purchase(automation.id))
                    {
                        SetStatus("자동화를 구매했습니다.");
                        RefreshAll();
                    }
                    else
                    {
                        SetStatus("구매 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(buy.button.gameObject, 64, 0);
            }
        }

        Transform AddCard(Transform parent, string title, string body)
        {
            return AddCard(parent, null, title, body);
        }

        Transform AddCard(Transform parent, Sprite icon, string title, string body)
        {
            var card = UiFactory.Panel(parent, UiTheme.CardBg);
            UiFactory.VBox(card.transform, 8, new RectOffset(18, 18, 16, 16));

            if (icon != null)
            {
                var header = new GameObject("CardHeader", typeof(RectTransform));
                header.transform.SetParent(card.transform, false);
                UiFactory.HBox(header.transform, 10);
                AddLayout(header, 42, 0);

                UiFactory.Icon(header.transform, icon, 34);

                var iconTitle = UiFactory.Label(header.transform, title, 34);
                iconTitle.color = UiTheme.TextPrimary;
                AddLayout(iconTitle.gameObject, 40, 1);
            }
            else
            {
                var titleLabel = UiFactory.Label(card.transform, title, 34);
                titleLabel.color = UiTheme.TextPrimary;
                AddLayout(titleLabel.gameObject, 42, 0);
            }

            if (!string.IsNullOrEmpty(body))
            {
                AddSmallText(card.transform, body);
            }

            return card.transform;
        }

        Text AddSmallText(Transform parent, string text)
        {
            var label = UiFactory.Label(parent, string.IsNullOrEmpty(text) ? "-" : text, 29);
            label.color = UiTheme.TextSecondary;
            return label;
        }

        void UpdateSummary()
        {
            if (_lastSummary == null)
            {
                _summaryLabel.text = "아직 월을 넘기지 않았습니다.";
                return;
            }

            var sb = new StringBuilder();
            sb.Append(_lastSummary.Month).Append("월 정산  ");
            sb.Append("비용 ").Append(FormatMoney(_lastSummary.TotalCashCost)).Append("  ");
            // 기대 vs 실제 매출 (feat-014 #3) — 정산 전 예상과 실제가 다르면 둘 다 표기.
            if (_expectedRevenue > 0 && System.Math.Abs(_expectedRevenue - _lastSummary.Revenue) > 1)
            {
                sb.Append("매출 ").Append(FormatMoney(_lastSummary.Revenue)).Append(" (예상 ").Append(FormatMoney(_expectedRevenue)).Append(")  ");
            }
            else
            {
                sb.Append("매출 ").Append(FormatMoney(_lastSummary.Revenue)).Append("  ");
            }
            sb.Append("신규 이용자 +").Append(FormatNumber(_lastSummary.NewUsers));
            if (_lastSummary.Warnings != null && _lastSummary.Warnings.Count > 0)
            {
                sb.Append("\n경고 - ").Append(string.Join(", ", _lastSummary.Warnings));
            }

            if (!string.IsNullOrEmpty(_lastSummary.StageChangedTo))
            {
                var stage = _context.Catalog.GetStage(_lastSummary.StageChangedTo);
                sb.Append("\n단계 상승 - ").Append(stage != null ? stage.displayName : _lastSummary.StageChangedTo);
            }

            if (!string.IsNullOrEmpty(_lastSummary.Outcome))
            {
                sb.Append("\n결과 - ").Append(_lastSummary.Outcome);
            }

            _summaryLabel.text = sb.ToString();
        }

        void UpdateEventModalFromContext()
        {
            if (_context != null && _context.Events.Current != null)
            {
                ShowEventModal(_context.Events.Current);
            }
            else
            {
                HideEventModal();
            }
        }

        void ShowEventModal(GameEventDef ev)
        {
            if (ev == null)
            {
                HideEventModal();
                return;
            }

            _eventModal.SetActive(true);
            PopInCard(_eventModal, "EventCard");
            // 이벤트 발생 당황 컷인 — 새 이벤트가 처음 뜰 때만(refresh 재표시 중복 방지).
            if (ev.id != _lastTriggeredEventId)
            {
                _lastTriggeredEventId = ev.id;
                // 3단계 — 위협적 이벤트(최악 선택 합 ≤ -2000)는 전체 위기 모달, 그 외는 당황 코너(2단계).
                if (AICompanyTycoon.Systems.EventResultJudge.IsCrisis(ev.choices, -2000))
                    CutsceneDirector.PlayCrisis("actor_human");
                else
                    CutsceneDirector.PlayEventTrigger();
            }
            _eventTitle.text = ev.displayName;
            _eventDescription.text = ev.description;
            Clear(_eventChoices);

            foreach (var choice in ev.choices)
            {
                var captured = choice;
                var button = UiFactory.Button(_eventChoices, captured.text);
                button.button.onClick.AddListener(() =>
                {
                    if (_context.Events.Resolve(captured.id))
                    {
                        var tone = AICompanyTycoon.Systems.EventResultJudge.Judge(captured);
                        HideEventModal();
                        SetStatus("이벤트 선택을 적용했습니다.");
                        RefreshAll();
                        if (tone != AICompanyTycoon.Systems.EventResultTone.Neutral)
                            CutsceneDirector.PlayEventResult(tone == AICompanyTycoon.Systems.EventResultTone.Positive);
                    }
                });
                AddLayout(button.button.gameObject, 76, 0);

                if (!string.IsNullOrEmpty(captured.description))
                {
                    AddSmallText(_eventChoices, captured.description);
                }
            }

            UpdateNextMonthButton();
        }

        void HideEventModal()
        {
            if (_eventModal != null)
            {
                _eventModal.SetActive(false);
            }

            UpdateNextMonthButton();
        }

        // 승리/패배 결과 전용 모달 — 게임 종료 시 오버레이로 표시한다.
        void BuildResultModal(Transform parent)
        {
            _resultModal = UiFactory.Panel(parent, UiTheme.ModalScrim);
            _resultModal.name = "ResultModal";
            Stretch(_resultModal.GetComponent<RectTransform>());

            var card = UiFactory.Panel(_resultModal.transform, UiTheme.PanelBg);
            card.name = "ResultCard";
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.08f, 0.28f);
            rect.anchorMax = new Vector2(0.92f, 0.74f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 22, new RectOffset(32, 32, 36, 32));

            _resultTitle = UiFactory.Label(card.transform, "", 54);
            _resultTitle.alignment = TextAnchor.MiddleCenter;
            AddLayout(_resultTitle.gameObject, 74, 0);

            _resultMessage = UiFactory.Label(card.transform, "", 32);
            _resultMessage.alignment = TextAnchor.MiddleCenter;
            _resultMessage.color = UiTheme.TextSecondary;
            AddLayout(_resultMessage.gameObject, 110, 1);

            var btn = UiFactory.Button(card.transform, "새 게임 시작");
            btn.button.onClick.AddListener(() =>
            {
                _resultModal.SetActive(false);
                ReplaceContext(SimulationContext.Create(_context.Catalog));
            });
            AddLayout(btn.button.gameObject, 84, 0);

            _resultModal.SetActive(false);
        }

        // 현재 오피스 액터 중 무작위 n명에게 원샷 포즈(card_use/alert)를 재생 — 이벤트 모먼트 반응 (feat-023).
        void TriggerActorOneShot(int poseState, int n)
        {
            if (_officeSceneContent == null || n <= 0) return;
            var anims = _officeSceneContent.GetComponentsInChildren<ActorAnim>();
            if (anims == null || anims.Length == 0) return;
            n = Mathf.Min(n, anims.Length);
            for (int i = 0; i < n; i++)
            {
                int j = UnityEngine.Random.Range(i, anims.Length);
                var tmp = anims[i]; anims[i] = anims[j]; anims[j] = tmp; // 부분 셔플 — 무작위 비복원 추출
                anims[i].PlayOneShot(poseState);
            }
        }

        // 월 정산 중 쌓인 직원 반응을 액터가 재생성된 뒤 적용 — RefreshOfficeScene 끝에서 호출 (feat-023).
        void FlushActorMoods()
        {
            if (_pendingCardUse > 0)
            {
                TriggerActorOneShot(ActorAnim.CardUse, Mathf.Min(_pendingCardUse, 2));
                _pendingCardUse = 0;
            }
            if (_pendingAlert > 0)
            {
                TriggerActorOneShot(ActorAnim.Alert, Mathf.Min(_pendingAlert, 2));
                _pendingAlert = 0;
            }
        }

        // 직원 위에 감정 이모트 버블을 랜덤 위치에 띄운다. 스프라이트 미임포트 시 조용히 무시.
        void SpawnReaction(string spriteName)
        {
            if (_reactionLayer == null) return;
            var sprite = IconLibrary.Get(spriteName);
            if (sprite == null) return;

            var go = new GameObject("Reaction_" + spriteName, typeof(RectTransform), typeof(Image), typeof(CanvasGroup));
            go.transform.SetParent(_reactionLayer, false);

            var img = go.GetComponent<Image>();
            img.sprite = sprite;
            img.raycastTarget = false;
            img.SetNativeSize();

            // 오피스 씬 하단 중앙 기준, 랜덤 가로 오프셋
            var rect = go.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(40f, 40f);
            var xOffset = UnityEngine.Random.Range(-60f, 60f);
            rect.anchoredPosition = new Vector2(xOffset, 30f);

            var bubble = go.AddComponent<ReactionBubble>();
            bubble.Init(1.6f);
        }

        void ShowResultModal(bool won, string outcome)
        {
            if (_resultModal == null) return;

            // 멀티 엔딩 (feat-008 #3) — 세계/창업자/성과 조합으로 결말이 갈린다. 신규 결말은 도감 기록.
            var ending = EndingService.Determine(_context.Model, _context.Catalog, won);
            if (ending != null)
            {
                bool isNew = !_meta.Data.discoveredEndingIds.Contains(ending.id);
                _meta.RecordEnding(ending.id);
                _resultTitle.text = ending.title;
                _resultTitle.color = won ? UiTheme.TabActive : new Color(0.84f, 0.28f, 0.22f);
                var body = ending.flavor;
                if (!string.IsNullOrEmpty(outcome)) body += "\n\n" + outcome;
                if (isNew) body += "\n\n새 결말이 도감에 기록되었습니다 (" + _meta.Data.discoveredEndingIds.Count + "/" + _context.Catalog.endings.Count + ")";
                body = AppendEquityEnding(body);
                _resultMessage.text = body;
            }
            else
            {
                _resultTitle.text = won ? "🏆 축하합니다!" : "💸 게임 오버";
                _resultTitle.color = won ? UiTheme.TabActive : new Color(0.84f, 0.28f, 0.22f);
                var body = !string.IsNullOrEmpty(outcome)
                    ? outcome
                    : (won ? "AI 기업 성장에 성공했습니다." : "회사가 어려운 상황에 처했습니다.");
                _resultMessage.text = AppendEquityEnding(body);
            }

            // feat-026: 결과 모달 직전 엔딩 버킷 컷씬(전체화면 클라이맥스). 닫히면 뒤의 결과 모달이 드러난다.
            var endingBucket = EndingCutsceneJudge.Judge(ending, _context.Model, won);
            CutsceneDirector.PlayEnding(endingBucket, _resultTitle.text);
            _resultModal.SetActive(true);
            PopInCard(_resultModal, "ResultCard");
        }

        // 지분 형태에 따른 Unity 전용 특별 결말 한 줄 (feat-015 #5). 멀티 엔딩과 별개로 덧붙는다.
        string AppendEquityEnding(string body)
        {
            var special = EquityEnding.Get(_context.Model);
            if (special == null) return body;
            var s = special.Value;
            string line = "💎 " + s.Title + " — " + s.Flavor;
            return string.IsNullOrEmpty(body) ? line : body + "\n\n" + line;
        }

        // 모달 카드를 스케일+페이드로 등장시킨다. CanvasGroup이 없으면 추가.
        void PopInCard(GameObject modal, string cardName)
        {
            if (modal == null)
            {
                return;
            }

            var card = modal.transform.Find(cardName);
            if (card == null)
            {
                return;
            }

            var cg = card.GetComponent<CanvasGroup>();
            if (cg == null)
            {
                cg = card.gameObject.AddComponent<CanvasGroup>();
            }

            UiTween.PopIn(card, cg);
        }

        // 이전 달 대비 자원 증감을 HUD 우측에 +/- 색상으로 표시한다.
        void UpdateResourceDeltas()
        {
            if (_context == null || _prevValues.Count == 0)
            {
                foreach (var kv in _deltaLabels) kv.Value.text = "";
                return;
            }

            foreach (var id in ResourceIds.All)
            {
                if (!_deltaLabels.TryGetValue(id, out var label)) continue;
                if (!_prevValues.TryGetValue(id, out var prev)) { label.text = ""; continue; }
                var delta = _context.Model.Get(id) - prev;
                if (Math.Abs(delta) < 0.5) { label.text = ""; continue; }
                label.text = FormatDelta(id, delta);
                label.color = delta > 0
                    ? new Color(0.18f, 0.68f, 0.30f)
                    : new Color(0.84f, 0.22f, 0.18f);
            }
        }

        string FormatDelta(ResourceId id, double delta)
        {
            var sign = delta > 0 ? "+" : "-";
            var abs = Math.Abs(delta);
            return id == ResourceId.Cash
                ? sign + "$" + FormatNumber(abs)
                : sign + FormatNumber(abs);
        }

        void UpdateNextMonthButton()
        {
            if (_nextMonthButton == null || _context == null)
            {
                return;
            }

            bool pendingEvent = _context.Events.Current != null;
            _nextMonthButton.interactable = !_terminal && !pendingEvent;
            if (_terminal)
            {
                _nextMonthLabel.text = "종료";
            }
            else if (pendingEvent)
            {
                _nextMonthLabel.text = "이벤트 대기";
            }
            else
            {
                // 평상시 라벨은 가이던스 제안 (feat-009). 제안이 없으면 "다음 달".
                _nextMonthLabel.text = _guidanceStep != null ? _guidanceStep.ActionLabel : "다음 달";
            }
        }

        string GetProductLockReason(ProductDef product)
        {
            if (!string.IsNullOrEmpty(product.domain) && !_context.Domains.IsUnlocked(product.domain))
            {
                return "도메인 미해금 " + GetDomainName(product.domain);
            }

            foreach (var requirement in product.requiredCapabilities)
            {
                int have = _context.Capabilities.GetLevel(requirement.capabilityId);
                if (have < requirement.level)
                {
                    return "능력 부족 " + GetCapabilityName(requirement.capabilityId) + " Lv." + have + "/" + requirement.level;
                }
            }

            // feat-012 테크트리 — 선행 제품 미출시.
            if (product.prerequisiteProducts != null)
            {
                foreach (var prerequisite in product.prerequisiteProducts)
                {
                    if (!string.IsNullOrEmpty(prerequisite) && !_context.Products.IsActive(prerequisite))
                    {
                        var prerequisiteDef = _context.Catalog.GetProduct(prerequisite);
                        return "선행 제품 필요 " + (prerequisiteDef != null ? prerequisiteDef.displayName : prerequisite);
                    }
                }
            }

            if (_context.Model.Trust < product.trustRequirement)
            {
                return "신뢰 부족 " + FormatNumber(_context.Model.Trust) + "/" + FormatNumber(product.trustRequirement);
            }

            if (!_context.Resources.CanAfford(product.launchCost))
            {
                return "비용 부족 " + FormatCosts(product.launchCost);
            }

            return "출시할 수 없습니다.";
        }

        string GetResourcePlainName(ResourceId id)
        {
            var def = _context.Catalog.GetResource(ResourceIds.ToKey(id));
            return def != null && !string.IsNullOrEmpty(def.displayName) ? def.displayName : id.ToString();
        }

        string GetResourceName(ResourceId id)
        {
            var def = _context.Catalog.GetResource(ResourceIds.ToKey(id));
            var icon = def != null && !string.IsNullOrEmpty(def.icon) ? def.icon + " " : "";
            return icon + GetResourcePlainName(id);
        }

        string GetDomainName(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return "없음";
            }

            var domain = _context.Catalog.GetDomain(id);
            return domain != null ? domain.displayName : id;
        }

        string GetCapabilityName(string id)
        {
            var capability = _context.Catalog.GetCapability(id);
            return capability != null ? capability.displayName : id;
        }

        string FormatCosts(List<ResourceAmount> costs)
        {
            if (costs == null || costs.Count == 0)
            {
                return "없음";
            }

            var parts = new List<string>();
            foreach (var cost in costs)
            {
                parts.Add(ResourceFormat.Format(cost.resource, cost.amount));
            }

            return string.Join(", ", parts);
        }

        string FormatCapabilityRequirements(List<CapabilityLevel> requirements)
        {
            if (requirements == null || requirements.Count == 0)
            {
                return "없음";
            }

            var parts = new List<string>();
            foreach (var req in requirements)
            {
                parts.Add(GetCapabilityName(req.capabilityId) + " Lv." + req.level);
            }

            return string.Join(", ", parts);
        }

        string FormatThresholds(List<Threshold> thresholds)
        {
            if (thresholds == null || thresholds.Count == 0)
            {
                return "없음";
            }

            var parts = new List<string>();
            foreach (var threshold in thresholds)
            {
                parts.Add(FormatThreshold(threshold.key, threshold.value));
            }

            return string.Join(", ", parts);
        }

        // 요구조건 min_* 키를 한글로. 자원 키는 GetResourcePlainName 재사용, 개수형 키(개월/제품/능력/도메인)는 별도 표기.
        string FormatThreshold(string key, double value)
        {
            switch (key)
            {
                case "min_month":
                    return FormatNumber(value) + "개월차 이상";
                case "min_products":
                    return "제품 " + FormatNumber(value) + "개 이상";
                case "min_capabilities":
                    return "능력 " + FormatNumber(value) + "개 이상";
                case "min_domains":
                    return "도메인 " + FormatNumber(value) + "개 이상";
            }

            var resourceKey = !string.IsNullOrEmpty(key) && key.StartsWith("min_") ? key.Substring(4) : key;
            if (ResourceIds.TryParse(resourceKey, out var resource))
            {
                return GetResourcePlainName(resource) + " " + FormatNumber(value) + "↑";
            }

            // 미지의 키라도 원시 min_ 접두사는 노출하지 않는다.
            return resourceKey + " " + FormatNumber(value);
        }

        string FormatMoney(double value)
        {
            return ResourceFormat.Format(ResourceId.Cash, value);
        }

        string FormatNumber(double value)
        {
            if (value >= 1000000) return (value / 1000000.0).ToString("0.0") + "M";
            if (value >= 1000) return (value / 1000.0).ToString("0.0") + "K";
            return ((long)value).ToString();
        }

        void SetStatus(string text)
        {
            if (_statusLabel != null)
            {
                _statusLabel.text = text;
            }
        }

        static void Clear(Transform parent)
        {
            if (parent == null)
            {
                return;
            }

            for (int i = parent.childCount - 1; i >= 0; i--)
            {
                UnityEngine.Object.Destroy(parent.GetChild(i).gameObject);
            }
        }

        static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        static void AddLayout(GameObject go, float minHeight, float flexibility)
        {
            var layout = go.GetComponent<LayoutElement>();
            if (layout == null)
            {
                layout = go.AddComponent<LayoutElement>();
            }

            layout.minHeight = minHeight;
            layout.preferredHeight = minHeight;
            layout.flexibleWidth = flexibility;
            layout.flexibleHeight = flexibility;
        }

        // 고정 크기 레이아웃 (LIVE 뱃지처럼 늘어나면 안 되는 요소).
        static void AddLayoutFixed(GameObject go, float width, float height)
        {
            var layout = go.GetComponent<LayoutElement>();
            if (layout == null)
            {
                layout = go.AddComponent<LayoutElement>();
            }

            layout.minWidth = width;
            layout.preferredWidth = width;
            layout.minHeight = height;
            layout.preferredHeight = height;
            layout.flexibleWidth = 0;
            layout.flexibleHeight = 0;
        }
    }
}
