// 레거시 유니티 UI 요소를 일관된 모바일 화면 구성으로 만드는 헬퍼입니다.
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public static class UiFactory
    {
        static Font _uiFont;

        // 한글 글리프가 있는 Noto Sans KR(Resources/Fonts/UiFont)을 쓰고, 없으면 내장 레거시 폰트로 폴백한다.
        public static Font LegacyFont
        {
            get
            {
                if (_uiFont == null)
                {
                    _uiFont = Resources.Load<Font>("Fonts/UiFont");
                    if (_uiFont == null)
                    {
                        _uiFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                    }
                }

                return _uiFont;
            }
        }

        static Font _displayFont;
        // feat-030 시안 — 큰 숫자·성급·결산용 임팩트 폰트(Black Han Sans). 없으면 본문 폰트로 폴백.
        public static Font DisplayFont
        {
            get
            {
                if (_displayFont == null)
                {
                    _displayFont = Resources.Load<Font>("Fonts/BlackHanSans-Regular");
                    if (_displayFont == null) _displayFont = LegacyFont;
                }
                return _displayFont;
            }
        }

        static Font _bodyFont;
        // feat-030 시안 — 본문·라벨 폰트(Gowun Dodum). 없으면 UiFont 폴백.
        public static Font BodyFont
        {
            get
            {
                if (_bodyFont == null)
                {
                    _bodyFont = Resources.Load<Font>("Fonts/GowunDodum-Regular");
                    if (_bodyFont == null) _bodyFont = LegacyFont;
                }
                return _bodyFont;
            }
        }

        static Font _buttonFont;
        // feat-030 시안 — 버튼·게임 액션 폰트(Jua). 없으면 본문 폰트 폴백.
        public static Font ButtonFont
        {
            get
            {
                if (_buttonFont == null)
                {
                    _buttonFont = Resources.Load<Font>("Fonts/Jua-Regular");
                    if (_buttonFont == null) _buttonFont = BodyFont;
                }
                return _buttonFont;
            }
        }

        public static Canvas CreateCanvas(string name)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = go.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = go.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 1f;

            return canvas;
        }

        public static EventSystem EnsureEventSystem()
        {
            var existing = Object.FindAnyObjectByType<EventSystem>();
            if (existing != null)
            {
                return existing;
            }

            var go = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            return go.GetComponent<EventSystem>();
        }

        public static GameObject Panel(Transform parent, Color color)
        {
            var go = new GameObject("Panel", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = color;
            return go;
        }

        public static Text Label(Transform parent, string text, int fontSize)
        {
            var go = new GameObject("Label", typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var label = go.GetComponent<Text>();
            label.font = BodyFont; // feat-030 — 본문·라벨 Gowun Dodum
            label.text = text;
            label.fontSize = fontSize;
            label.color = UiTheme.TextPrimary;
            label.alignment = TextAnchor.MiddleLeft;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            return label;
        }

        public static (Button button, Text label) Button(Transform parent, string labelText)
        {
            var go = new GameObject("Button", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = UiTheme.ButtonSurface; // feat-030 — secondary 중립 버튼 면(또렷한 탄). primary CTA는 StyleCtaButton 코랄.

            // feat-030 — 색은 Image에만 싣고 ColorBlock은 흰색 틴트(1.0). 둘 다 색이면 곱해져 코랄이 붉게 죽는다.
            var button = go.GetComponent<Button>();
            var colors = button.colors;
            colors.normalColor = Color.white;
            colors.highlightedColor = new Color(1f, 1f, 1f, 1f);
            colors.pressedColor = new Color(0.86f, 0.86f, 0.86f, 1f);
            colors.disabledColor = new Color(0.62f, 0.6f, 0.56f, 1f);
            colors.colorMultiplier = 1f;
            button.colors = colors;

            var textGo = new GameObject("Text", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            var textRect = textGo.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = new Vector2(12, 6);
            textRect.offsetMax = new Vector2(-12, -6);

            var label = textGo.GetComponent<Text>();
            label.font = ButtonFont; // feat-030 — 버튼·게임 액션 Jua
            label.text = labelText;
            label.fontSize = 34; // 모바일 가독 — 버튼 라벨 기본 크기 (feat-009)
            label.color = UiTheme.Ink; // feat-030 — 중립 버튼은 잉크 텍스트. 코랄 CTA는 StyleCtaButton이 라이트로.
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Overflow;

            button.onClick.AddListener(() => UiTween.Punch(go.transform));

            // feat-031 — secondary 알약 눌림 단서. 잉크 드롭 섀도로 입체감을 준다.
            // Shadow는 정점 알파에 effectColor 알파를 곱하므로, FlattenDockButton(Image 알파 0)이 적용된 도크 버튼은 섀도도 자동 투명 = 평면 유지.
            var shadow = go.AddComponent<Shadow>();
            shadow.effectColor = new Color(UiTheme.Ink.r, UiTheme.Ink.g, UiTheme.Ink.b, 0.28f);
            shadow.effectDistance = new Vector2(0f, -3f);

            return (button, label);
        }

        public static VerticalLayoutGroup VBox(Transform parent, float spacing, RectOffset padding)
        {
            var group = parent.gameObject.AddComponent<VerticalLayoutGroup>();
            group.spacing = spacing;
            group.padding = padding ?? new RectOffset();
            group.childAlignment = TextAnchor.UpperLeft;
            group.childControlWidth = true;
            group.childControlHeight = true;
            group.childForceExpandWidth = true;
            group.childForceExpandHeight = false;
            return group;
        }

        public static HorizontalLayoutGroup HBox(Transform parent, float spacing)
        {
            var group = parent.gameObject.AddComponent<HorizontalLayoutGroup>();
            group.spacing = spacing;
            group.padding = new RectOffset();
            group.childAlignment = TextAnchor.MiddleLeft;
            group.childControlWidth = true;
            group.childControlHeight = true;
            group.childForceExpandWidth = false;
            group.childForceExpandHeight = true;
            return group;
        }

        // 정사각 아이콘 이미지. sprite 가 null 이면 투명하게 둬 임포트 전에도 깨지지 않는다.
        public static Image Icon(Transform parent, Sprite sprite, float size)
        {
            var go = new GameObject("Icon", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);

            var image = go.GetComponent<Image>();
            image.sprite = sprite;
            image.preserveAspect = true;
            image.raycastTarget = false;
            image.color = sprite != null ? Color.white : new Color(1f, 1f, 1f, 0f);

            var layout = go.AddComponent<LayoutElement>();
            layout.minWidth = size;
            layout.preferredWidth = size;
            layout.minHeight = size;
            layout.preferredHeight = size;
            layout.flexibleWidth = 0;
            layout.flexibleHeight = 0;

            return image;
        }
    }
}
