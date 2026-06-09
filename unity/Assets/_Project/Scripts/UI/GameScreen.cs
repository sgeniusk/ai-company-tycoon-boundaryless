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
        Text _eventTitle;
        Text _eventDescription;
        Transform _eventChoices;

        MonthSummary _lastSummary;
        string _activeTab = ProductsTab;
        bool _terminal;
        bool _subscribed;

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

            // 노치/홈 인디케이터를 피해 콘텐츠를 safe area 안에 담는다. 배경(root)은 화면 전체를 덮는다.
            var safeArea = new GameObject("SafeArea", typeof(RectTransform), typeof(SafeAreaFitter));
            safeArea.transform.SetParent(root.transform, false);
            Stretch(safeArea.GetComponent<RectTransform>());
            var content = safeArea.transform;
            UiFactory.VBox(content, 18, new RectOffset(28, 28, 28, 28));

            BuildTopBar(content);
            BuildResourceHud(content);
            BuildScoreboard(content);
            BuildGoalRibbon(content);
            BuildOfficeScene(content);
            BuildTabs(content);
            BuildContentArea(content);
            BuildMonthSummary(content);
            BuildBottomBar(content);
            BuildEventModal(_canvas.transform);
            BuildResultModal(_canvas.transform);
            Subscribe();
        }

        public void ReplaceContext(SimulationContext context)
        {
            _context = context;
            _lastSummary = null;
            _terminal = false;
            _prevValues.Clear();
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

            _lastSummary = _context.Month.AdvanceMonth();
            _terminal = _lastSummary.GameOver || _lastSummary.GameWon;
            SetStatus("월간 정산이 완료되었습니다.");

            var balance = _context.Catalog.balance;
            if (!_terminal && balance != null && UnityEngine.Random.value < (float)balance.eventTriggerChance)
            {
                var triggered = _context.Events.TryTrigger();
                if (triggered != null)
                {
                    ShowEventModal(triggered);
                }
            }

            RefreshAll();

            if (_terminal)
            {
                ShowResultModal(_lastSummary.GameWon, _lastSummary.Outcome);
            }
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

        // 사무실 배경(v054)을 전체에 깔고 위에 반투명 막을 얹어 UI 가독성을 확보한다. 에셋이 없으면 단색 배경 유지.
        void BuildOfficeBackground(Transform parent)
        {
            var tex = Resources.Load<Texture2D>("Art/Background/office");
            if (tex == null)
            {
                return;
            }

            var bgGo = new GameObject("OfficeBackground", typeof(RectTransform), typeof(Image));
            bgGo.transform.SetParent(parent, false);
            Stretch(bgGo.GetComponent<RectTransform>());
            var bgImage = bgGo.GetComponent<Image>();
            bgImage.sprite = Sprite.Create(tex, new Rect(0f, 0f, tex.width, tex.height), new Vector2(0.5f, 0.5f));
            bgImage.preserveAspect = false;
            bgImage.raycastTarget = false;

            // 크림 톤 반투명 막 — office가 비치면서 텍스트는 읽히게 한다.
            var scrim = UiFactory.Panel(parent, new Color(UiTheme.ScreenBg.r, UiTheme.ScreenBg.g, UiTheme.ScreenBg.b, 0.55f));
            scrim.name = "BackgroundScrim";
            Stretch(scrim.GetComponent<RectTransform>());
            scrim.GetComponent<Image>().raycastTarget = false;
        }

        // CD-1 전국 AI 기업 랭킹 LED 전광판 — 태그+LIVE 점멸 / #랭크 /총사 ▲델타 / 흐르는 마퀴.
        void BuildScoreboard(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.ScoreboardBg);
            panel.name = "Scoreboard";
            AddLayout(panel, 150, 0);
            UiFactory.VBox(panel.transform, 6, new RectOffset(22, 22, 12, 12));

            // 1행 — 태그 + LIVE 뱃지(점멸)
            var top = new GameObject("ScoreTop", typeof(RectTransform));
            top.transform.SetParent(panel.transform, false);
            UiFactory.HBox(top.transform, 10);
            AddLayout(top, 34, 0);

            var tag = UiFactory.Label(top.transform, "전국 AI 기업 랭킹", 24);
            tag.color = UiTheme.ScoreboardTag;
            tag.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(tag.gameObject, 32, 1);

            var badge = UiFactory.Panel(top.transform, UiTheme.ScoreboardLive);
            badge.name = "LiveBadge";
            badge.AddComponent<CanvasGroup>();
            badge.AddComponent<LiveBlink>();
            AddLayoutFixed(badge, 74, 32);
            var liveText = UiFactory.Label(badge.transform, "LIVE", 20);
            liveText.color = UiTheme.ScoreboardLiveText;
            liveText.alignment = TextAnchor.MiddleCenter;
            liveText.horizontalOverflow = HorizontalWrapMode.Overflow;
            liveText.raycastTarget = false;
            Stretch(liveText.GetComponent<RectTransform>());

            // 2행 — #랭크 / 총사 ▲델타
            var rankRow = new GameObject("ScoreRank", typeof(RectTransform));
            rankRow.transform.SetParent(panel.transform, false);
            UiFactory.HBox(rankRow.transform, 10);
            AddLayout(rankRow, 52, 0);

            _scoreRank = UiFactory.Label(rankRow.transform, "#—", 44);
            _scoreRank.color = UiTheme.ScoreboardRank;
            _scoreRank.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreRank.gameObject, 50, 0);

            _scoreTotal = UiFactory.Label(rankRow.transform, "/ —사", 24);
            _scoreTotal.color = UiTheme.ScoreboardTag;
            _scoreTotal.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreTotal.gameObject, 50, 0);

            _scoreDelta = UiFactory.Label(rankRow.transform, "—", 26);
            _scoreDelta.color = UiTheme.DeltaFlat;
            _scoreDelta.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_scoreDelta.gameObject, 50, 1);

            // 3행 — 마퀴 (RectMask2D 클리핑 + 우→좌 흐름)
            var viewport = new GameObject("MarqueeViewport", typeof(RectTransform), typeof(RectMask2D));
            viewport.transform.SetParent(panel.transform, false);
            AddLayout(viewport, 30, 0);
            var viewportRect = viewport.GetComponent<RectTransform>();

            var contentGo = new GameObject("MarqueeText", typeof(RectTransform), typeof(Text));
            contentGo.transform.SetParent(viewport.transform, false);
            var contentRect = contentGo.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0, 0.5f);
            contentRect.anchorMax = new Vector2(0, 0.5f);
            contentRect.pivot = new Vector2(0, 0.5f);
            contentRect.sizeDelta = new Vector2(2400, 28);

            _scoreMarquee = contentGo.GetComponent<Text>();
            _scoreMarquee.font = UiFactory.LegacyFont;
            _scoreMarquee.fontSize = 22;
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

            var lines = ScoreboardRanking.BuildScoreboardMarquee(_context.Market, _context.Model, _context.Catalog);
            _scoreMarquee.text = string.Join("    ·    ", lines);
        }

        // office 배경 위에 직원 캐릭터(v076)를 세울 사무실 씬 영역. 채우기는 RefreshOfficeScene이 한다.
        void BuildOfficeScene(Transform parent)
        {
            var panel = new GameObject("OfficeScene", typeof(RectTransform));
            panel.transform.SetParent(parent, false);
            var row = UiFactory.HBox(panel.transform, 14);
            row.childAlignment = TextAnchor.LowerCenter;
            AddLayout(panel, 220, 0);
            _officeSceneContent = panel.transform;

            // 리액션 버블 전용 오버레이 — 직원 스프라이트 위에 절대 위치로 띄운다.
            var overlay = new GameObject("ReactionLayer", typeof(RectTransform));
            overlay.transform.SetParent(panel.transform, false);
            var overlayRect = overlay.GetComponent<RectTransform>();
            overlayRect.anchorMin = Vector2.zero;
            overlayRect.anchorMax = Vector2.one;
            overlayRect.offsetMin = Vector2.zero;
            overlayRect.offsetMax = Vector2.zero;
            _reactionLayer = overlay.transform;
        }

        // talent(인재) 수만큼 직원 캐릭터를 세운다. 스프라이트가 없으면(임포트 전) 빈 칸으로 안전.
        void RefreshOfficeScene()
        {
            if (_officeSceneContent == null || _context == null)
            {
                return;
            }

            Clear(_officeSceneContent);
            int talent = (int)_context.Model.Get(ResourceId.Talent);
            int count = Mathf.Clamp(talent, 0, 6);
            var kinds = new[] { "actor_human", "actor_ai", "actor_robot" };
            for (int i = 0; i < count; i += 1)
            {
                var sprite = IconLibrary.Get(kinds[i % kinds.Length]);

                // 레이아웃 셀(HBox가 위치 제어) — 내부 아이콘은 비제어라 StaffBob이 자유롭게 흔든다.
                var cell = new GameObject("ActorCell", typeof(RectTransform));
                cell.transform.SetParent(_officeSceneContent, false);
                var cellLayout = cell.AddComponent<LayoutElement>();
                cellLayout.minWidth = 120;
                cellLayout.preferredWidth = 120;
                cellLayout.minHeight = 132;
                cellLayout.preferredHeight = 132;
                cellLayout.flexibleWidth = 0;
                cellLayout.flexibleHeight = 0;

                var iconGo = new GameObject("Actor", typeof(RectTransform), typeof(Image));
                iconGo.transform.SetParent(cell.transform, false);
                var rect = iconGo.GetComponent<RectTransform>();
                rect.anchorMin = new Vector2(0.5f, 0f);
                rect.anchorMax = new Vector2(0.5f, 0f);
                rect.pivot = new Vector2(0.5f, 0f);
                rect.sizeDelta = new Vector2(120, 120);
                rect.anchoredPosition = Vector2.zero;

                var img = iconGo.GetComponent<Image>();
                img.sprite = sprite;
                img.preserveAspect = true;
                img.raycastTarget = false;
                img.color = sprite != null ? Color.white : new Color(1f, 1f, 1f, 0f);

                if (sprite != null)
                {
                    iconGo.AddComponent<StaffBob>().Init(i * 0.9f);
                }

                cell.SetActive(sprite != null);
            }
        }

        void BuildTopBar(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.HeaderBg);
            panel.name = "TopBar";
            AddLayout(panel, 150, 0);
            UiFactory.VBox(panel.transform, 4, new RectOffset(24, 24, 14, 14));

            var title = UiFactory.Label(panel.transform, "AI Company Tycoon", 42);
            title.color = UiTheme.HeaderText;
            title.alignment = TextAnchor.MiddleLeft;
            AddLayout(title.gameObject, 54, 0);

            var row = new GameObject("StatusRow", typeof(RectTransform));
            row.transform.SetParent(panel.transform, false);
            UiFactory.HBox(row.transform, 18);
            AddLayout(row, 52, 0);

            _monthLabel = UiFactory.Label(row.transform, "1월차", 30);
            _monthLabel.color = UiTheme.HeaderText;
            AddLayout(_monthLabel.gameObject, 48, 1);

            _stageLabel = UiFactory.Label(row.transform, "차고 프로토타입", 28);
            _stageLabel.color = UiTheme.HeaderText;
            _stageLabel.alignment = TextAnchor.MiddleRight;
            AddLayout(_stageLabel.gameObject, 48, 1);
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
            AddLayout(strip, 76, 0);

            _crestLabel = BuildCrest(strip.transform);
            BuildResourceChip(strip.transform, ResourceId.Cash, true);
            BuildResourceChip(strip.transform, ResourceId.Users, true);
            BuildResourceChip(strip.transform, ResourceId.Compute, true);

            (_trayToggle, _trayToggleLabel) = UiFactory.Button(strip.transform, "＋");
            _trayToggle.onClick.AddListener(ToggleTray);
            AddLayoutFixed(_trayToggle.gameObject, 64, 64);

            var decor = UiFactory.Button(strip.transform, "🎨");
            decor.button.onClick.AddListener(() => SetStatus("꾸미기는 곧 추가됩니다."));
            AddLayoutFixed(decor.button.gameObject, 64, 64);

            // 보조 5종 트레이 — 기본 숨김, ＋ 토글로 노출
            _resourceTray = new GameObject("ResourceTray", typeof(RectTransform));
            _resourceTray.transform.SetParent(panel.transform, false);
            var trayBox = UiFactory.HBox(_resourceTray.transform, 8);
            trayBox.childAlignment = TextAnchor.MiddleLeft;
            AddLayout(_resourceTray, 64, 0);
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
            AddLayoutFixed(chip, 70, 64);

            var label = UiFactory.Label(chip.transform, "1★", 28);
            label.color = UiTheme.CrestGold;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(label.gameObject, 60, 1);
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
            AddLayout(chip, core ? 64 : 60, 1);

            var sprite = IconLibrary.Resource(id);
            if (sprite != null)
            {
                UiFactory.Icon(chip.transform, sprite, core ? 30 : 26);
            }
            else
            {
                var nm = UiFactory.Label(chip.transform, GetResourcePlainName(id), 18);
                nm.color = UiTheme.TextSecondary;
                nm.horizontalOverflow = HorizontalWrapMode.Overflow;
                AddLayout(nm.gameObject, 30, 0);
            }

            var value = UiFactory.Label(chip.transform, "", core ? 26 : 22);
            value.color = ChipColor(id, false);
            value.alignment = TextAnchor.MiddleLeft;
            value.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(value.gameObject, 34, 1);
            _resourceValues[id] = value;

            var ticker = value.gameObject.AddComponent<ResourceTicker>();
            ticker.Init(id, value, _context != null ? _context.Model.Get(id) : 0);
            _resourceTickers[id] = ticker;

            var delta = UiFactory.Label(chip.transform, "", 18);
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
            return stage != null ? Mathf.Clamp(stage.order + 1, 1, 6) : 1;
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

        // CD-2 목표 리본 — 골드 좌측 강조 + `이번 달 목표` 태그 + 휴리스틱 목표 문구.
        void BuildGoalRibbon(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.PanelBg);
            panel.name = "GoalRibbon";
            AddLayout(panel, 56, 0);
            var box = UiFactory.HBox(panel.transform, 10);
            box.padding = new RectOffset(14, 16, 8, 8);
            box.childAlignment = TextAnchor.MiddleLeft;

            var accent = UiFactory.Panel(panel.transform, UiTheme.GoalAccent);
            AddLayoutFixed(accent, 6, 38);

            var tag = UiFactory.Label(panel.transform, "이번 달 목표", 18);
            tag.color = UiTheme.GoalAccent;
            tag.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(tag.gameObject, 38, 0);

            _goalRibbonText = UiFactory.Label(panel.transform, "", 24);
            _goalRibbonText.color = UiTheme.TextPrimary;
            _goalRibbonText.horizontalOverflow = HorizontalWrapMode.Overflow;
            AddLayout(_goalRibbonText.gameObject, 38, 1);
        }

        void RefreshGoalRibbon()
        {
            if (_goalRibbonText == null || _context == null)
            {
                return;
            }

            _goalRibbonText.text = GetMonthlyGoalText();
        }

        // guidance 시스템이 없는 Unity 포트용 목표 휴리스틱 — 가장 시급한 다음 행동을 한 줄로.
        string GetMonthlyGoalText()
        {
            var m = _context.Model;
            if (m.ActiveProducts.Count == 0)
            {
                return "첫 제품을 출시해 매출을 만드세요";
            }

            if (m.Cash < 0)
            {
                return "자금이 마이너스 — 비용을 줄이세요";
            }

            var b = _context.Catalog.balance;
            if (b != null && m.Trust < b.gameOverTrustThreshold + 10)
            {
                return "신뢰를 회복해 위기를 넘기세요";
            }

            foreach (var cap in _context.Catalog.capabilities)
            {
                if (cap != null && _context.Capabilities.CanUpgrade(cap.id))
                {
                    return cap.displayName + " 능력을 강화해 보세요";
                }
            }

            return "시장 점유율을 끌어올리세요";
        }

        void BuildTabs(Transform parent)
        {
            var row = new GameObject("Tabs", typeof(RectTransform));
            row.transform.SetParent(parent, false);
            UiFactory.HBox(row.transform, 12);
            AddLayout(row, 82, 0);

            AddTabButton(row.transform, ProductsTab, "제품");
            AddTabButton(row.transform, CapabilitiesTab, "능력");
            AddTabButton(row.transform, UpgradesTab, "업그레이드");
        }

        void BuildContentArea(Transform parent)
        {
            var frame = UiFactory.Panel(parent, UiTheme.PanelBg);
            frame.name = "TabContentFrame";
            AddLayout(frame, 560, 1);

            _productsPanel = CreateScrollPanel(frame.transform, "ProductsPanel", out _productsContent);
            _capabilitiesPanel = CreateScrollPanel(frame.transform, "CapabilitiesPanel", out _capabilitiesContent);
            _upgradesPanel = CreateScrollPanel(frame.transform, "UpgradesPanel", out _upgradesContent);
            SetActiveTab(ProductsTab);
        }

        void BuildMonthSummary(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.PanelBg);
            panel.name = "MonthSummary";
            AddLayout(panel, 180, 0);
            UiFactory.VBox(panel.transform, 8, new RectOffset(20, 20, 14, 14));

            var title = UiFactory.Label(panel.transform, "월 요약", 30);
            AddLayout(title.gameObject, 38, 0);

            _summaryLabel = UiFactory.Label(panel.transform, "아직 월을 넘기지 않았습니다.", 24);
            AddLayout(_summaryLabel.gameObject, 100, 1);
        }

        void BuildBottomBar(Transform parent)
        {
            var panel = new GameObject("BottomBar", typeof(RectTransform));
            panel.transform.SetParent(parent, false);
            UiFactory.HBox(panel.transform, 10);
            AddLayout(panel, 110, 0);

            (_nextMonthButton, _nextMonthLabel) = UiFactory.Button(panel.transform, "다음 달");
            _nextMonthButton.onClick.AddListener(HandleAdvanceMonth);
            AddLayout(_nextMonthButton.gameObject, 96, 1);

            var save = UiFactory.Button(panel.transform, "저장");
            save.button.onClick.AddListener(HandleSave);
            AddLayout(save.button.gameObject, 96, 1);

            var load = UiFactory.Button(panel.transform, "불러오기");
            load.button.onClick.AddListener(HandleLoad);
            AddLayout(load.button.gameObject, 96, 1);

            var fresh = UiFactory.Button(panel.transform, "새 게임");
            fresh.button.onClick.AddListener(() =>
            {
                ReplaceContext(SimulationContext.Create(_context.Catalog));
            });
            AddLayout(fresh.button.gameObject, 96, 1);

            _statusLabel = UiFactory.Label(parent, "", 22);
            _statusLabel.color = UiTheme.TextSecondary;
            AddLayout(_statusLabel.gameObject, 36, 0);
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

            _eventTitle = UiFactory.Label(card.transform, "", 38);
            AddLayout(_eventTitle.gameObject, 70, 0);

            _eventDescription = UiFactory.Label(card.transform, "", 27);
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
            var root = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(ScrollRect));
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

        void AddTabButton(Transform parent, string key, string label)
        {
            var pair = UiFactory.Button(parent, label);
            pair.button.onClick.AddListener(() => SetActiveTab(key));
            AddLayout(pair.button.gameObject, 74, 1);
            _tabButtons[key] = pair.button;
        }

        void SetActiveTab(string tab)
        {
            _activeTab = tab;
            if (_productsPanel != null) _productsPanel.SetActive(tab == ProductsTab);
            if (_capabilitiesPanel != null) _capabilitiesPanel.SetActive(tab == CapabilitiesTab);
            if (_upgradesPanel != null) _upgradesPanel.SetActive(tab == UpgradesTab);

            foreach (var item in _tabButtons)
            {
                var image = item.Value.GetComponent<Image>();
                image.color = item.Key == tab
                    ? UiTheme.TabActive
                    : UiTheme.TabInactive;
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
            SetStatus("회사 단계 상승 - " + (stage != null ? stage.displayName : stageId));
            SpawnReaction("react_cheer");
            UpdateTopBar();
        }

        void OnProductLaunched(string productId)
        {
            var product = _context.Catalog.GetProduct(productId);
            SetStatus("제품 출시 - " + (product != null ? product.displayName : productId));
            SpawnReaction("react_codespark");
            RefreshLists();
        }

        void OnDomainUnlocked(string domainId)
        {
            var domain = _context.Catalog.GetDomain(domainId);
            SetStatus("도메인 해금 - " + (domain != null ? domain.displayName : domainId));
            SpawnReaction("react_idea");
            RefreshLists();
        }

        void OnCapabilityUpgraded(string capabilityId, int level)
        {
            var capability = _context.Catalog.GetCapability(capabilityId);
            SetStatus("능력 강화 - " + (capability != null ? capability.displayName : capabilityId) + " Lv." + level);
            SpawnReaction("react_idea");
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
            SetActiveTab(_activeTab);
        }

        void BuildProductCards()
        {
            Clear(_productsContent);

            var availableIds = new HashSet<string>();
            foreach (var product in _context.Products.GetAvailable())
            {
                if (product != null)
                {
                    availableIds.Add(product.id);
                }
            }

            foreach (var product in _context.Catalog.products)
            {
                if (product == null)
                {
                    continue;
                }

                var active = _context.Products.IsActive(product.id);
                var launchable = availableIds.Contains(product.id);
                var card = AddCard(_productsContent, IconLibrary.Domain(product.domain), product.displayName, product.description);
                AddSmallText(card, "도메인 " + GetDomainName(product.domain) + " | 매출 " + FormatNumber(product.baseRevenue) + " | 이용자 +" + FormatNumber(product.baseUsersPerMonth));
                AddSmallText(card, "출시 비용 " + FormatCosts(product.launchCost));

                if (active)
                {
                    AddSmallText(card, "상태 - 활성 제품");
                    continue;
                }

                if (launchable)
                {
                    var launch = UiFactory.Button(card, "출시");
                    launch.button.onClick.AddListener(() =>
                    {
                        if (_context.Products.Launch(product.id))
                        {
                            RefreshAll();
                        }
                        else
                        {
                            SetStatus("출시 조건을 다시 확인하세요.");
                            RefreshAll();
                        }
                    });
                    AddLayout(launch.button.gameObject, 64, 0);
                }
                else
                {
                    AddSmallText(card, "잠금 사유 - " + GetProductLockReason(product));
                }
            }
        }

        void BuildCapabilityCards()
        {
            Clear(_capabilitiesContent);

            var domainTitle = UiFactory.Label(_capabilitiesContent, "도메인", 32);
            AddLayout(domainTitle.gameObject, 44, 0);

            foreach (var domain in _context.Catalog.domains)
            {
                if (domain == null)
                {
                    continue;
                }

                var state = _context.Domains.IsUnlocked(domain.id) ? "해금됨" : "잠김";
                var card = AddCard(_capabilitiesContent, IconLibrary.Domain(domain.id), domain.displayName + " · " + state, domain.description);
                AddSmallText(card, "요구 능력 " + FormatCapabilityRequirements(domain.unlockRequirements));
            }

            var capabilityTitle = UiFactory.Label(_capabilitiesContent, "능력", 32);
            AddLayout(capabilityTitle.gameObject, 44, 0);

            foreach (var capability in _context.Catalog.capabilities)
            {
                if (capability == null)
                {
                    continue;
                }

                int level = _context.Capabilities.GetLevel(capability.id);
                var card = AddCard(_capabilitiesContent, IconLibrary.Capability(capability.id), capability.displayName + " Lv." + level + "/" + capability.maxLevel, capability.description);
                AddSmallText(card, "강화 비용 " + FormatCosts(_context.Capabilities.GetUpgradeCost(capability.id)));

                var upgrade = UiFactory.Button(card, level >= capability.maxLevel ? "최대 레벨" : "강화");
                upgrade.button.interactable = _context.Capabilities.CanUpgrade(capability.id);
                upgrade.button.onClick.AddListener(() =>
                {
                    if (_context.Capabilities.Upgrade(capability.id))
                    {
                        RefreshAll();
                    }
                    else
                    {
                        SetStatus("강화 조건을 다시 확인하세요.");
                    }
                });
                AddLayout(upgrade.button.gameObject, 64, 0);
            }
        }

        void BuildUpgradeCards()
        {
            Clear(_upgradesContent);

            var upgradeTitle = UiFactory.Label(_upgradesContent, "일반 업그레이드", 32);
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

            var automationTitle = UiFactory.Label(_upgradesContent, "자동화", 32);
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

                var iconTitle = UiFactory.Label(header.transform, title, 30);
                iconTitle.color = UiTheme.TextPrimary;
                AddLayout(iconTitle.gameObject, 40, 1);
            }
            else
            {
                var titleLabel = UiFactory.Label(card.transform, title, 30);
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
            var label = UiFactory.Label(parent, string.IsNullOrEmpty(text) ? "-" : text, 23);
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
            sb.Append("매출 ").Append(FormatMoney(_lastSummary.Revenue)).Append("  ");
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
                        HideEventModal();
                        SetStatus("이벤트 선택을 적용했습니다.");
                        RefreshAll();
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

            _resultMessage = UiFactory.Label(card.transform, "", 27);
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
            _resultTitle.text = won ? "🏆 축하합니다!" : "💸 게임 오버";
            _resultTitle.color = won ? UiTheme.TabActive : new Color(0.84f, 0.28f, 0.22f);
            _resultMessage.text = !string.IsNullOrEmpty(outcome)
                ? outcome
                : (won ? "AI 기업 성장에 성공했습니다." : "회사가 어려운 상황에 처했습니다.");
            _resultModal.SetActive(true);
            PopInCard(_resultModal, "ResultCard");
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
                _nextMonthLabel.text = "다음 달";
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
                parts.Add(threshold.key + " " + FormatNumber(threshold.value));
            }

            return string.Join(", ", parts);
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
