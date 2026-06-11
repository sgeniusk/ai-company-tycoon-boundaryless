// 오피스 위로 떠오르며 사라지는 수익/이용자 플로팅 숫자 (feat-010 #1, 키우기 게임식 페이오프).
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class FloatingText : MonoBehaviour
    {
        float _delay;
        float _duration;
        float _rise;
        float _elapsed;
        CanvasGroup _group;
        RectTransform _rect;
        Vector2 _start;

        // parent의 중앙 기준 pos에서 떠오르는 텍스트를 생성한다. delay로 연속 팝 스태거.
        public static void Spawn(Transform parent, string text, Color color, int fontSize, Vector2 pos,
            float delay = 0f, float rise = 110f, float duration = 1.5f)
        {
            if (parent == null) return;

            var go = new GameObject("Float_" + text, typeof(RectTransform), typeof(CanvasGroup), typeof(Text), typeof(Outline));
            go.transform.SetParent(parent, false);

            var label = go.GetComponent<Text>();
            label.font = UiFactory.LegacyFont;
            label.text = text;
            label.fontSize = fontSize;
            label.fontStyle = FontStyle.Bold;
            label.color = color;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;

            // 바쁜 오피스 배경 위에서도 읽히게 다크 아웃라인.
            var outline = go.GetComponent<Outline>();
            outline.effectColor = new Color(0.12f, 0.09f, 0.05f, 0.9f);
            outline.effectDistance = new Vector2(2f, -2f);

            var rect = go.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(10f, 10f);
            rect.anchoredPosition = pos;

            var ft = go.AddComponent<FloatingText>();
            ft._delay = delay;
            ft._duration = duration;
            ft._rise = rise;
            ft._group = go.GetComponent<CanvasGroup>();
            ft._rect = rect;
            ft._start = pos;
            ft._group.alpha = delay > 0f ? 0f : 1f;
        }

        void Update()
        {
            if (_delay > 0f)
            {
                _delay -= Time.deltaTime;
                if (_delay > 0f) return;
                _group.alpha = 1f;
            }

            _elapsed += Time.deltaTime;
            var t = Mathf.Clamp01(_elapsed / _duration);

            // 시작은 살짝 펀치 스케일, 이후 떠오르며 페이드.
            var punch = t < 0.18f ? Mathf.Lerp(0.7f, 1.12f, t / 0.18f) : Mathf.Lerp(1.12f, 1f, (t - 0.18f) / 0.25f);
            transform.localScale = Vector3.one * Mathf.Max(punch, 1f);
            _rect.anchoredPosition = _start + new Vector2(0f, Mathf.SmoothStep(0f, _rise, t));
            _group.alpha = t < 0.7f ? 1f : Mathf.Lerp(1f, 0f, (t - 0.7f) / 0.3f);

            if (t >= 1f)
            {
                Destroy(gameObject);
            }
        }
    }
}
