// 크로스런 수집 도감 모달 UI입니다.
using System.Collections.Generic;
using System.Text;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class CollectionGallery : MonoBehaviour
    {
        const string CategoryArchetype = "archetype";
        const string CategoryEnding = "ending";
        const string CategorySynergy = "synergy";

        DataCatalog _catalog;
        MetaData _meta;
        Transform _gridContent;
        Transform _detailContent;
        Text _countLabel;
        readonly Dictionary<string, Button> _tabButtons = new Dictionary<string, Button>();
        string _activeCategory = CategoryArchetype;

        public static void Show(Transform canvasParent, DataCatalog catalog, MetaData meta)
        {
            if (canvasParent == null)
            {
                return;
            }

            var root = UiFactory.Panel(canvasParent, UiTheme.ModalScrim);
            root.name = "CollectionGallery";
            var gallery = root.AddComponent<CollectionGallery>();
            gallery.Initialize(catalog, meta);
        }

        void Initialize(DataCatalog catalog, MetaData meta)
        {
            _catalog = catalog;
            _meta = meta ?? new MetaData();
            Build();
            SelectCategory(CategoryArchetype);
        }

        void Build()
        {
            Stretch(GetComponent<RectTransform>());

            var scrim = gameObject.AddComponent<Button>();
            scrim.transition = Selectable.Transition.None;
            scrim.onClick.AddListener(Close);

            var card = UiFactory.Panel(transform, UiTheme.PanelBg);
            card.name = "CollectionCard";
            var cardButton = card.AddComponent<Button>();
            cardButton.transition = Selectable.Transition.None;
            var rect = card.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.02f, 0.10f);
            rect.anchorMax = new Vector2(0.98f, 0.90f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            UiFactory.VBox(card.transform, 12, new RectOffset(20, 20, 18, 18));

            BuildHeader(card.transform);
            BuildTabs(card.transform);

            _countLabel = UiFactory.Label(card.transform, "", UiTheme.FontCaption);
            _countLabel.color = UiTheme.TextSecondary;
            _countLabel.alignment = TextAnchor.MiddleCenter;
            AddLayout(_countLabel.gameObject, 34, 0);

            BuildGridScroll(card.transform);
            BuildDetailScroll(card.transform);
        }

        void BuildHeader(Transform parent)
        {
            var header = new GameObject("CollectionHeader", typeof(RectTransform));
            header.transform.SetParent(parent, false);
            UiFactory.HBox(header.transform, 10);
            AddLayout(header, 64, 0);

            var title = UiFactory.Label(header.transform, "도감", UiTheme.FontTitle);
            title.color = UiTheme.TextPrimary;
            title.alignment = TextAnchor.MiddleLeft;
            AddLayout(title.gameObject, 60, 1);

            var close = UiFactory.Button(header.transform, "✕");
            close.label.fontSize = UiTheme.FontEmphasis;
            close.button.onClick.AddListener(Close);
            AddLayoutFixed(close.button.gameObject, 70, 60);
        }

        void BuildTabs(Transform parent)
        {
            var row = new GameObject("CollectionTabs", typeof(RectTransform));
            row.transform.SetParent(parent, false);
            UiFactory.HBox(row.transform, 8);
            AddLayout(row, 88, 0);

            AddTab(row.transform, CategoryArchetype);
            AddTab(row.transform, CategoryEnding);
            AddTab(row.transform, CategorySynergy);
        }

        void AddTab(Transform parent, string category)
        {
            var tab = UiFactory.Button(parent, "");
            tab.label.fontSize = UiTheme.FontCaption;
            tab.label.lineSpacing = 0.9f;
            var captured = category;
            tab.button.onClick.AddListener(() => SelectCategory(captured));
            AddLayout(tab.button.gameObject, 82, 1);
            _tabButtons[category] = tab.button;
        }

        void BuildGridScroll(Transform parent)
        {
            var root = new GameObject("CollectionGridScroll", typeof(RectTransform), typeof(Image), typeof(ScrollRect));
            root.transform.SetParent(parent, false);
            root.GetComponent<Image>().color = Color.clear;
            AddLayout(root, 720, 1);

            var viewport = new GameObject("Viewport", typeof(RectTransform), typeof(Image), typeof(RectMask2D));
            viewport.transform.SetParent(root.transform, false);
            Stretch(viewport.GetComponent<RectTransform>());
            viewport.GetComponent<Image>().color = Color.clear;

            var content = new GameObject("GridContent", typeof(RectTransform), typeof(GridLayoutGroup), typeof(ContentSizeFitter));
            content.transform.SetParent(viewport.transform, false);
            var contentRect = content.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0, 1);
            contentRect.anchorMax = new Vector2(1, 1);
            contentRect.pivot = new Vector2(0.5f, 1);
            contentRect.offsetMin = new Vector2(16, 0);
            contentRect.offsetMax = new Vector2(-16, 0);

            var grid = content.GetComponent<GridLayoutGroup>();
            grid.cellSize = new Vector2(300, 220);
            grid.spacing = new Vector2(16, 16);
            grid.padding = new RectOffset(0, 0, 14, 18);
            grid.childAlignment = TextAnchor.UpperCenter;
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = 3;

            var fitter = content.GetComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var scroll = root.GetComponent<ScrollRect>();
            scroll.viewport = viewport.GetComponent<RectTransform>();
            scroll.content = contentRect;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;

            _gridContent = content.transform;
        }

        void BuildDetailScroll(Transform parent)
        {
            var root = new GameObject("CollectionDetailPanel", typeof(RectTransform), typeof(Image), typeof(ScrollRect));
            root.transform.SetParent(parent, false);
            root.GetComponent<Image>().color = UiTheme.CardBg;
            AddLayout(root, 390, 0);

            var viewport = new GameObject("Viewport", typeof(RectTransform), typeof(Image), typeof(RectMask2D));
            viewport.transform.SetParent(root.transform, false);
            Stretch(viewport.GetComponent<RectTransform>());
            viewport.GetComponent<Image>().color = Color.clear;

            var content = new GameObject("DetailContent", typeof(RectTransform), typeof(VerticalLayoutGroup), typeof(ContentSizeFitter));
            content.transform.SetParent(viewport.transform, false);
            var contentRect = content.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0, 1);
            contentRect.anchorMax = new Vector2(1, 1);
            contentRect.pivot = new Vector2(0.5f, 1);
            contentRect.offsetMin = new Vector2(18, 0);
            contentRect.offsetMax = new Vector2(-18, -14);

            var group = content.GetComponent<VerticalLayoutGroup>();
            group.spacing = 8;
            group.padding = new RectOffset(0, 0, 14, 14);
            group.childAlignment = TextAnchor.UpperLeft;
            group.childControlWidth = true;
            group.childControlHeight = true;
            group.childForceExpandWidth = true;
            group.childForceExpandHeight = false;

            var fitter = content.GetComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var scroll = root.GetComponent<ScrollRect>();
            scroll.viewport = viewport.GetComponent<RectTransform>();
            scroll.content = contentRect;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;

            _detailContent = content.transform;
        }

        void SelectCategory(string category)
        {
            _activeCategory = category;
            RefreshTabs();
            RefreshGrid();
            ShowFirstDetail();
        }

        void RefreshTabs()
        {
            foreach (var pair in _tabButtons)
            {
                pair.Value.GetComponentInChildren<Text>().text = TabLabel(pair.Key);
                SetButtonTint(pair.Value, pair.Key == _activeCategory ? UiTheme.TabActive : UiTheme.TabInactive);
            }

            if (_countLabel != null)
            {
                _countLabel.text = CategoryCountText(_activeCategory);
            }
        }

        void RefreshGrid()
        {
            Clear(_gridContent);

            if (_activeCategory == CategoryArchetype)
            {
                BuildArchetypeGrid();
                return;
            }

            if (_activeCategory == CategoryEnding)
            {
                BuildEndingGrid();
                return;
            }

            BuildSynergyGrid();
        }

        void BuildArchetypeGrid()
        {
            if (_catalog == null || _catalog.archetypes == null || _catalog.archetypes.Count == 0)
            {
                AddEmptyCell("아키타입 없음");
                return;
            }

            foreach (var def in _catalog.archetypes)
            {
                if (def == null) continue;
                var item = def;
                bool discovered = IsDiscoveredArchetype(def.id);
                string title = discovered ? SafeText(def.displayName, def.id) : "???";
                string subtitle = discovered ? "아키타입" : "힌트 보기";
                var button = AddGalleryCell("ArchetypeCell_" + SafeName(def.id), title, subtitle,
                    IconLibrary.Get("celebrate_synergy"), discovered, "");
                button.onClick.AddListener(() => ShowArchetypeDetail(item));
            }
        }

        void BuildEndingGrid()
        {
            if (_catalog == null || _catalog.endings == null || _catalog.endings.Count == 0)
            {
                AddEmptyCell("엔딩 없음");
                return;
            }

            foreach (var def in _catalog.endings)
            {
                if (def == null) continue;
                var item = def;
                bool discovered = IsDiscoveredEnding(def.id);
                string title = discovered ? SafeText(def.title, def.id) : "???";
                string subtitle = discovered ? "엔딩" : EndingHintShort(def);
                var button = AddGalleryCell("EndingCell_" + SafeName(def.id), title, subtitle,
                    IconLibrary.Get("world_world"), discovered, "");
                button.onClick.AddListener(() => ShowEndingDetail(item));
            }
        }

        void BuildSynergyGrid()
        {
            var items = AllSynergies();
            if (items.Count == 0)
            {
                AddEmptyCell("시너지 없음");
                return;
            }

            foreach (var def in items)
            {
                if (def == null) continue;
                var item = def;
                string risk = string.IsNullOrEmpty(def.riskLabel) ? "" : def.riskLabel;
                var button = AddGalleryCell("SynergyCell_" + SafeName(def.id), SafeText(def.title, def.id),
                    "전략 참고", SynergyIcon(def), true, risk);
                button.onClick.AddListener(() => ShowSynergyDetail(item));
            }
        }

        Button AddGalleryCell(string name, string title, string subtitle, Sprite icon, bool revealed, string badge)
        {
            var cell = UiFactory.Panel(_gridContent, revealed ? UiTheme.CardBg : UiTheme.SectionTeaserBg);
            cell.name = name;
            var button = cell.AddComponent<Button>();
            SetButtonTint(button, revealed ? UiTheme.CardBg : UiTheme.SectionTeaserBg);

            var group = UiFactory.VBox(cell.transform, 8, new RectOffset(10, 10, 12, 10));
            group.childAlignment = TextAnchor.UpperCenter;
            group.childForceExpandHeight = false;

            var iconImage = UiFactory.Icon(cell.transform, icon, 78);
            if (!revealed && iconImage.sprite != null)
            {
                iconImage.color = new Color(0.05f, 0.05f, 0.05f, 0.88f);
            }

            var nameLabel = UiFactory.Label(cell.transform, title, UiTheme.FontCaption);
            nameLabel.alignment = TextAnchor.MiddleCenter;
            nameLabel.color = revealed ? UiTheme.TextPrimary : UiTheme.HeaderText;
            AddLayout(nameLabel.gameObject, 58, 0);

            if (!string.IsNullOrEmpty(badge))
            {
                AddBadge(cell.transform, badge, UiTheme.ScoreboardRank, 34);
            }
            else
            {
                var subLabel = UiFactory.Label(cell.transform, subtitle, UiTheme.FontCaption);
                subLabel.alignment = TextAnchor.MiddleCenter;
                subLabel.color = revealed ? UiTheme.TextSecondary : UiTheme.TeaserText;
                AddLayout(subLabel.gameObject, 34, 0);
            }

            return button;
        }

        void AddEmptyCell(string text)
        {
            var cell = UiFactory.Panel(_gridContent, UiTheme.TeaserCardBg);
            cell.name = "EmptyCell";
            UiFactory.VBox(cell.transform, 8, new RectOffset(12, 12, 18, 12));
            var label = UiFactory.Label(cell.transform, text, UiTheme.FontBody);
            label.alignment = TextAnchor.MiddleCenter;
        }

        void ShowFirstDetail()
        {
            if (_activeCategory == CategoryArchetype)
            {
                if (_catalog != null && _catalog.archetypes != null)
                {
                    foreach (var def in _catalog.archetypes)
                    {
                        if (def != null)
                        {
                            ShowArchetypeDetail(def);
                            return;
                        }
                    }
                }
            }
            else if (_activeCategory == CategoryEnding)
            {
                if (_catalog != null && _catalog.endings != null)
                {
                    foreach (var def in _catalog.endings)
                    {
                        if (def != null)
                        {
                            ShowEndingDetail(def);
                            return;
                        }
                    }
                }
            }
            else
            {
                var synergies = AllSynergies();
                if (synergies.Count > 0)
                {
                    ShowSynergyDetail(synergies[0]);
                    return;
                }
            }

            ShowEmptyDetail("표시할 항목이 없습니다.");
        }

        void ShowArchetypeDetail(ArchetypeDef def)
        {
            Clear(_detailContent);
            bool discovered = def != null && IsDiscoveredArchetype(def.id);
            if (def == null)
            {
                ShowEmptyDetail("아키타입 정보가 없습니다.");
                return;
            }

            if (!discovered)
            {
                AddDetailTitle("???");
                AddDetailText("아직 발견하지 못한 아키타입입니다.", UiTheme.FontBody, UiTheme.TextPrimary);
                AddDetailText("힌트: " + ArchetypeHint(def), UiTheme.FontBody, UiTheme.TextSecondary);
                return;
            }

            AddDetailTitle(SafeText(def.displayName, def.id));
            AddDetailText(SafeText(def.description, "설명 없음"), UiTheme.FontBody, UiTheme.TextPrimary);
            AddDetailText("요구 태그: " + JoinOrNone(def.requires), UiTheme.FontCaption, UiTheme.TextSecondary);
            AddDetailText("보상: " + SafeText(def.yieldsSummary, "없음"), UiTheme.FontCaption, UiTheme.TextSecondary);
            AddDetailText("월간 효과: " + FormatEffects(def.monthlyEffects), UiTheme.FontCaption, UiTheme.TextSecondary);
        }

        void ShowEndingDetail(EndingDef def)
        {
            Clear(_detailContent);
            if (def == null)
            {
                ShowEmptyDetail("엔딩 정보가 없습니다.");
                return;
            }

            bool discovered = IsDiscoveredEnding(def.id);
            if (!discovered)
            {
                AddDetailTitle("???");
                AddDetailText("아직 확인하지 못한 엔딩입니다.", UiTheme.FontBody, UiTheme.TextPrimary);
                AddDetailText("힌트: " + EndingHint(def), UiTheme.FontBody, UiTheme.TextSecondary);
                return;
            }

            AddDetailTitle(SafeText(def.title, def.id));
            AddDetailText(SafeText(def.flavor, "설명 없음"), UiTheme.FontBody, UiTheme.TextPrimary);
            AddDetailText("조건: " + EndingConditions(def), UiTheme.FontCaption, UiTheme.TextSecondary);
            AddDetailText("메타 보너스: +" + def.metaRewardBonus, UiTheme.FontCaption, UiTheme.TextSecondary);
        }

        void ShowSynergyDetail(IndustrySynergyDef def)
        {
            Clear(_detailContent);
            if (def == null)
            {
                ShowEmptyDetail("시너지 정보가 없습니다.");
                return;
            }

            AddDetailTitle(SafeText(def.title, def.id));
            if (!string.IsNullOrEmpty(def.riskLabel))
            {
                AddBadge(_detailContent, "리스크: " + def.riskLabel, UiTheme.ScoreboardRank, 42);
            }

            AddDetailText(SafeText(def.description, "설명 없음"), UiTheme.FontBody, UiTheme.TextPrimary);
            AddDetailText("요구 도메인: " + FormatDomains(def.requiredDomains), UiTheme.FontCaption, UiTheme.TextSecondary);
            AddDetailText("월간 효과: " + FormatEffects(def.monthlyEffects), UiTheme.FontCaption, UiTheme.TextSecondary);
            AddDetailText("태그: " + JoinOrNone(def.tags), UiTheme.FontCaption, UiTheme.TextSecondary);
        }

        void ShowEmptyDetail(string text)
        {
            Clear(_detailContent);
            AddDetailTitle("도감");
            AddDetailText(text, UiTheme.FontBody, UiTheme.TextSecondary);
        }

        void AddDetailTitle(string text)
        {
            var label = UiFactory.Label(_detailContent, text, UiTheme.FontEmphasis);
            label.color = UiTheme.TextPrimary;
            label.alignment = TextAnchor.MiddleLeft;
        }

        void AddDetailText(string text, int fontSize, Color color)
        {
            var label = UiFactory.Label(_detailContent, text, fontSize);
            label.color = color;
            label.alignment = TextAnchor.UpperLeft;
        }

        void AddBadge(Transform parent, string text, Color color, float height)
        {
            var badge = UiFactory.Panel(parent, color);
            badge.name = "Badge";
            AddLayout(badge, height, 0);

            var label = UiFactory.Label(badge.transform, text, UiTheme.FontCaption);
            label.color = UiTheme.HeaderText;
            label.alignment = TextAnchor.MiddleCenter;
            Stretch(label.GetComponent<RectTransform>());
        }

        bool IsDiscoveredArchetype(string id)
        {
            return _meta != null
                && _meta.discoveredArchetypeIds != null
                && !string.IsNullOrEmpty(id)
                && _meta.discoveredArchetypeIds.Contains(id);
        }

        bool IsDiscoveredEnding(string id)
        {
            return _meta != null
                && _meta.discoveredEndingIds != null
                && !string.IsNullOrEmpty(id)
                && _meta.discoveredEndingIds.Contains(id);
        }

        string TabLabel(string category)
        {
            if (category == CategoryArchetype) return "아키타입\n" + CategoryCountText(category);
            if (category == CategoryEnding) return "엔딩\n" + CategoryCountText(category);
            return "시너지\n" + CategoryCountText(category);
        }

        string CategoryCountText(string category)
        {
            if (category == CategoryArchetype)
            {
                int total = _catalog != null && _catalog.archetypes != null ? _catalog.archetypes.Count : 0;
                return "발견 " + CountDiscoveredArchetypes() + "/총 " + total;
            }

            if (category == CategoryEnding)
            {
                int total = _catalog != null && _catalog.endings != null ? _catalog.endings.Count : 0;
                return "발견 " + CountDiscoveredEndings() + "/총 " + total;
            }

            return AllSynergies().Count + "종";
        }

        int CountDiscoveredArchetypes()
        {
            if (_catalog == null || _catalog.archetypes == null)
            {
                return 0;
            }

            int count = 0;
            foreach (var def in _catalog.archetypes)
            {
                if (def != null && IsDiscoveredArchetype(def.id)) count += 1;
            }

            return count;
        }

        int CountDiscoveredEndings()
        {
            if (_catalog == null || _catalog.endings == null)
            {
                return 0;
            }

            int count = 0;
            foreach (var def in _catalog.endings)
            {
                if (def != null && IsDiscoveredEnding(def.id)) count += 1;
            }

            return count;
        }

        List<IndustrySynergyDef> AllSynergies()
        {
            var result = new List<IndustrySynergyDef>();
            if (_catalog == null)
            {
                return result;
            }

            if (_catalog.industrySynergies != null)
            {
                foreach (var def in _catalog.industrySynergies)
                {
                    if (def != null) result.Add(def);
                }
            }

            if (_catalog.industryCombos != null)
            {
                foreach (var def in _catalog.industryCombos)
                {
                    if (def != null) result.Add(def);
                }
            }

            return result;
        }

        Sprite SynergyIcon(IndustrySynergyDef def)
        {
            if (def != null && def.requiredDomains != null && def.requiredDomains.Count > 0)
            {
                var sprite = IconLibrary.Domain(def.requiredDomains[0]);
                if (sprite != null) return sprite;
            }

            return IconLibrary.Get("celebrate_combo") ?? IconLibrary.Get("celebrate_synergy");
        }

        string ArchetypeHint(ArchetypeDef def)
        {
            if (def == null || def.requires == null || def.requires.Count == 0)
            {
                return "런 태그 조합을 바꿔 보세요.";
            }

            int count = Mathf.Min(2, def.requires.Count);
            var parts = new List<string>();
            for (int i = 0; i < count; i++)
            {
                parts.Add(def.requires[i]);
            }

            string suffix = def.requires.Count > count ? " 외" : "";
            return string.Join(", ", parts) + suffix + " 태그를 노려보세요.";
        }

        string EndingHintShort(EndingDef def)
        {
            if (def == null) return "힌트 보기";
            if (def.minMonth > 0) return def.minMonth + "개월차";
            return StatusLabel(def.conditionStatus);
        }

        string EndingHint(EndingDef def)
        {
            var parts = new List<string>();
            parts.Add(StatusLabel(def.conditionStatus));
            if (def.minMonth > 0) parts.Add(def.minMonth + "개월차 이상");
            if (def.minProducts > 0) parts.Add("제품 " + def.minProducts + "개 이상");
            if (def.minResources != null && def.minResources.Count > 0) parts.Add("특정 자원 기준");
            return string.Join(", ", parts);
        }

        string EndingConditions(EndingDef def)
        {
            var parts = new List<string>();
            parts.Add(StatusLabel(def.conditionStatus));
            if (def.minMonth > 0) parts.Add(def.minMonth + "개월차 이상");
            if (def.minProducts > 0) parts.Add("제품 " + def.minProducts + "개 이상");
            if (def.minResources != null && def.minResources.Count > 0) parts.Add("자원 " + FormatEffects(def.minResources));
            AddListCondition(parts, "도시", def.startCityIds);
            AddListCondition(parts, "세계관", def.worldLoreIds);
            AddListCondition(parts, "시장", def.marketConditionIds);
            AddListCondition(parts, "창업자", def.founderTraitIds);
            AddListCondition(parts, "난이도", def.challengeTierIds);
            AddListCondition(parts, "아키타입", def.archetypeIds);
            if (def.fallback) parts.Add("기본 결말");
            return parts.Count == 0 ? "없음" : string.Join(" / ", parts);
        }

        void AddListCondition(List<string> parts, string label, List<string> values)
        {
            if (values == null || values.Count == 0)
            {
                return;
            }

            parts.Add(label + " " + string.Join(", ", values));
        }

        string StatusLabel(string status)
        {
            if (status == "success") return "성공 결말";
            if (status == "failure") return "실패 결말";
            return "모든 결과";
        }

        string FormatDomains(List<string> domainIds)
        {
            if (domainIds == null || domainIds.Count == 0)
            {
                return "없음";
            }

            var parts = new List<string>();
            foreach (var id in domainIds)
            {
                if (_catalog != null)
                {
                    var domain = _catalog.GetDomain(id);
                    if (domain != null)
                    {
                        parts.Add(domain.displayName);
                        continue;
                    }
                }

                parts.Add(id);
            }

            return string.Join(", ", parts);
        }

        string FormatEffects(List<ResourceAmount> effects)
        {
            if (effects == null || effects.Count == 0)
            {
                return "없음";
            }

            var builder = new StringBuilder();
            for (int i = 0; i < effects.Count; i++)
            {
                if (i > 0) builder.Append(", ");
                builder.Append(ResourceFormat.Format(effects[i].resource, effects[i].amount));
            }

            return builder.ToString();
        }

        string JoinOrNone(List<string> values)
        {
            if (values == null || values.Count == 0)
            {
                return "없음";
            }

            return string.Join(", ", values);
        }

        string SafeText(string text, string fallback)
        {
            return string.IsNullOrEmpty(text) ? fallback : text;
        }

        string SafeName(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return "unknown";
            }

            return value.Replace(" ", "_").Replace("/", "_").Replace(":", "_");
        }

        void Close()
        {
            Destroy(gameObject);
        }

        static void SetButtonTint(Button button, Color normal)
        {
            var colors = button.colors;
            colors.normalColor = normal;
            colors.highlightedColor = Color.Lerp(normal, Color.white, 0.16f);
            colors.pressedColor = Color.Lerp(normal, Color.black, 0.12f);
            colors.selectedColor = normal;
            button.colors = colors;

            var image = button.GetComponent<Image>();
            if (image != null)
            {
                image.color = normal;
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
                Destroy(parent.GetChild(i).gameObject);
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
