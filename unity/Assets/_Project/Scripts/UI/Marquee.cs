// 전광판 마퀴 — 콘텐츠를 우→좌로 흐르게 한다 (CD-1, 13s 루프). RectMask2D 뷰포트 안에서 클리핑.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class Marquee : MonoBehaviour
    {
        public float duration = 13f;
        RectTransform _content;
        RectTransform _viewport;
        Text _text;
        float _x;
        bool _placed;

        public void Init(RectTransform content, RectTransform viewport, Text text)
        {
            _content = content;
            _viewport = viewport;
            _text = text;
            _placed = false;
        }

        void Update()
        {
            if (_content == null || _viewport == null)
            {
                return;
            }

            float vw = _viewport.rect.width;
            if (vw <= 1f)
            {
                return; // 레이아웃 확정 전
            }

            float cw = _text != null ? Mathf.Max(_text.preferredWidth, 1f) : _content.rect.width;
            if (!_placed)
            {
                _x = vw;
                _placed = true;
            }

            float speed = (vw + cw) / Mathf.Max(1f, duration);
            _x -= speed * Time.deltaTime;
            if (_x < -cw)
            {
                _x = vw;
            }

            _content.anchoredPosition = new Vector2(_x, _content.anchoredPosition.y);
        }
    }
}
