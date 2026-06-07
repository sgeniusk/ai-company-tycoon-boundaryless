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
            label.font = LegacyFont;
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
            image.color = UiTheme.Button;

            var button = go.GetComponent<Button>();
            var colors = button.colors;
            colors.normalColor = UiTheme.Button;
            colors.highlightedColor = UiTheme.ButtonHover;
            colors.pressedColor = UiTheme.ButtonPressed;
            colors.disabledColor = UiTheme.ButtonDisabled;
            button.colors = colors;

            var textGo = new GameObject("Text", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            var textRect = textGo.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = new Vector2(12, 6);
            textRect.offsetMax = new Vector2(-12, -6);

            var label = textGo.GetComponent<Text>();
            label.font = LegacyFont;
            label.text = labelText;
            label.fontSize = 30;
            label.color = UiTheme.ButtonText;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Wrap;
            label.verticalOverflow = VerticalWrapMode.Overflow;

            button.onClick.AddListener(() => UiTween.Punch(go.transform));

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
