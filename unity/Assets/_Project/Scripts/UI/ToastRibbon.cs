// 오피스를 가리지 않는 사건 토스트 리본 — 세계 이벤트/승급/니어미스가 큐로 흐른다 (feat-010 #4, React v0.95 사건 시야 보호 대응).
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class ToastRibbon : MonoBehaviour
    {
        struct Entry
        {
            public string Text;
            public Color Accent;
        }

        readonly Queue<Entry> _queue = new Queue<Entry>();
        GameObject _current;
        CanvasGroup _currentGroup;
        float _phase;     // 0~끝 진행 시간
        const float SlideIn = 0.22f;
        const float Hold = 2.2f;
        const float FadeOut = 0.3f;

        // 오피스 패널 상단 밴드에 리본 호스트를 만든다.
        public static ToastRibbon Create(Transform officePanel)
        {
            var go = new GameObject("ToastRibbon", typeof(RectTransform));
            go.transform.SetParent(officePanel, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.03f, 1f);
            rect.anchorMax = new Vector2(0.97f, 1f);
            rect.pivot = new Vector2(0.5f, 1f);
            rect.sizeDelta = new Vector2(0f, 64f);
            rect.anchoredPosition = new Vector2(0f, -6f);
            return go.AddComponent<ToastRibbon>();
        }

        public void Enqueue(string text, Color accent)
        {
            if (string.IsNullOrEmpty(text)) return;
            _queue.Enqueue(new Entry { Text = text, Accent = accent });
        }

        void Update()
        {
            if (_current == null)
            {
                if (_queue.Count == 0) return;
                ShowNext();
                return;
            }

            _phase += Time.deltaTime;
            if (_phase < SlideIn)
            {
                var t = _phase / SlideIn;
                _currentGroup.alpha = t;
                _current.transform.localScale = new Vector3(1f, Mathf.SmoothStep(0.6f, 1f, t), 1f);
            }
            else if (_phase < SlideIn + Hold)
            {
                _currentGroup.alpha = 1f;
                _current.transform.localScale = Vector3.one;
            }
            else if (_phase < SlideIn + Hold + FadeOut)
            {
                _currentGroup.alpha = 1f - (_phase - SlideIn - Hold) / FadeOut;
            }
            else
            {
                Destroy(_current);
                _current = null;
            }
        }

        void ShowNext()
        {
            var entry = _queue.Dequeue();
            _phase = 0f;

            _current = new GameObject("Toast", typeof(RectTransform), typeof(Image), typeof(CanvasGroup));
            _current.transform.SetParent(transform, false);
            var rect = _current.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var bg = _current.GetComponent<Image>();
            bg.color = new Color(0.07f, 0.12f, 0.11f, 0.92f);
            bg.raycastTarget = false;
            _currentGroup = _current.GetComponent<CanvasGroup>();
            _currentGroup.alpha = 0f;

            var box = UiFactory.HBox(_current.transform, 10);
            box.padding = new RectOffset(16, 16, 8, 8);
            box.childAlignment = TextAnchor.MiddleLeft;

            var accent = UiFactory.Panel(_current.transform, entry.Accent);
            accent.GetComponent<Image>().raycastTarget = false;
            var al = accent.AddComponent<LayoutElement>();
            al.minWidth = 6;
            al.preferredWidth = 6;
            al.minHeight = 40;
            al.flexibleWidth = 0;

            var label = UiFactory.Label(_current.transform, entry.Text, 28);
            label.color = new Color(0.99f, 0.96f, 0.89f);
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.raycastTarget = false;
            var ll = label.gameObject.AddComponent<LayoutElement>();
            ll.minHeight = 44;
            ll.flexibleWidth = 1;
        }
    }
}
