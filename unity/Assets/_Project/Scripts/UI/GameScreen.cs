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
        readonly Dictionary<string, Button> _tabButtons = new Dictionary<string, Button>();

        Canvas _canvas;
        Text _monthLabel;
        Text _stageLabel;
        Text _summaryLabel;
        Text _statusLabel;
        Button _nextMonthButton;
        Text _nextMonthLabel;

        GameObject _productsPanel;
        GameObject _capabilitiesPanel;
        GameObject _upgradesPanel;
        Transform _productsContent;
        Transform _capabilitiesContent;
        Transform _upgradesContent;

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
            BuildTabs(content);
            BuildContentArea(content);
            BuildMonthSummary(content);
            BuildBottomBar(content);
            BuildEventModal(_canvas.transform);
            Subscribe();
        }

        public void ReplaceContext(SimulationContext context)
        {
            _context = context;
            _lastSummary = null;
            _terminal = false;
            HideEventModal();
            SetStatus("새 회사를 시작했습니다.");
            RefreshAll();
        }

        public void RefreshAll()
        {
            UpdateTopBar();
            UpdateResourceHud();
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

            // 크림 톤 반투명 막 — office가 은은히 비치면서 텍스트는 읽히게 한다.
            var scrim = UiFactory.Panel(parent, new Color(UiTheme.ScreenBg.r, UiTheme.ScreenBg.g, UiTheme.ScreenBg.b, 0.82f));
            scrim.name = "BackgroundScrim";
            Stretch(scrim.GetComponent<RectTransform>());
            scrim.GetComponent<Image>().raycastTarget = false;
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

        void BuildResourceHud(Transform parent)
        {
            var panel = UiFactory.Panel(parent, UiTheme.HudBg);
            panel.name = "ResourceHud";
            AddLayout(panel, 365, 0);
            UiFactory.VBox(panel.transform, 8, new RectOffset(20, 20, 16, 16));

            _resourceValues.Clear();
            foreach (var id in ResourceIds.All)
            {
                var row = new GameObject(ResourceIds.ToKey(id) + "Row", typeof(RectTransform));
                row.transform.SetParent(panel.transform, false);
                UiFactory.HBox(row.transform, 10);
                AddLayout(row, 36, 0);

                // 스프라이트가 임포트돼 있으면 아이콘을 쓰고, 아니면 이름의 이모지 폴백을 쓴다.
                var sprite = IconLibrary.Resource(id);
                var icon = UiFactory.Icon(row.transform, sprite, 30);
                icon.gameObject.SetActive(sprite != null);

                var name = UiFactory.Label(row.transform, sprite != null ? GetResourcePlainName(id) : GetResourceName(id), 25);
                AddLayout(name.gameObject, 34, 1);

                var value = UiFactory.Label(row.transform, "", 25);
                value.alignment = TextAnchor.MiddleRight;
                AddLayout(value.gameObject, 34, 1);
                _resourceValues[id] = value;

                var ticker = value.gameObject.AddComponent<ResourceTicker>();
                ticker.Init(id, value, _context != null ? _context.Model.Get(id) : 0);
                _resourceTickers[id] = ticker;
            }
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
            UpdateTopBar();
        }

        void OnProductLaunched(string productId)
        {
            var product = _context.Catalog.GetProduct(productId);
            SetStatus("제품 출시 - " + (product != null ? product.displayName : productId));
            RefreshLists();
        }

        void OnDomainUnlocked(string domainId)
        {
            var domain = _context.Catalog.GetDomain(domainId);
            SetStatus("도메인 해금 - " + (domain != null ? domain.displayName : domainId));
            RefreshLists();
        }

        void OnCapabilityUpgraded(string capabilityId, int level)
        {
            var capability = _context.Catalog.GetCapability(capabilityId);
            SetStatus("능력 강화 - " + (capability != null ? capability.displayName : capabilityId) + " Lv." + level);
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
    }
}
