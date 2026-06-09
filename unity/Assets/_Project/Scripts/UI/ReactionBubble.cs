// 오피스 씬에서 직원 위에 잠깐 떴다가 위로 올라가며 사라지는 이모트 버블.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    [RequireComponent(typeof(Image), typeof(CanvasGroup))]
    public class ReactionBubble : MonoBehaviour
    {
        float _duration;
        float _elapsed;
        CanvasGroup _group;
        RectTransform _rect;
        Vector2 _startPos;

        public void Init(float duration = 1.6f)
        {
            _duration = duration;
            _elapsed = 0f;
            _group = GetComponent<CanvasGroup>();
            _rect = GetComponent<RectTransform>();
            _startPos = _rect.anchoredPosition;
        }

        void Update()
        {
            if (_duration <= 0f) return;
            _elapsed += Time.deltaTime;
            var t = Mathf.Clamp01(_elapsed / _duration);

            // 위로 30px 떠오르면서 알파가 줄어든다.
            _rect.anchoredPosition = _startPos + new Vector2(0, Mathf.Lerp(0f, 30f, t));
            _group.alpha = Mathf.Lerp(1f, 0f, Mathf.Pow(t, 1.8f));

            if (t >= 1f)
            {
                Destroy(gameObject);
            }
        }
    }
}
