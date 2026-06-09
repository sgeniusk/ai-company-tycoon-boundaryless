// 사무실 직원 스프라이트에 작은 통통 튀는 모션을 주는 컴포넌트 (정지 스프라이트에 생동감). 인스턴스별 위상차.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public class StaffBob : MonoBehaviour
    {
        public float amplitude = 7f; // 픽셀
        public float speed = 2.4f;   // rad/s
        RectTransform _rect;
        float _phase;
        float _baseY;
        bool _ready;

        public void Init(float phase)
        {
            _rect = GetComponent<RectTransform>();
            _phase = phase;
            _baseY = _rect != null ? _rect.anchoredPosition.y : 0f;
            _ready = _rect != null;
        }

        void Update()
        {
            if (!_ready)
            {
                return;
            }

            // Abs(Sin) — 바닥에서 위로 통통 튀는 작은 점프. 위상차로 다 같이 안 움직이게.
            float y = _baseY + Mathf.Abs(Mathf.Sin(Time.time * speed + _phase)) * amplitude;
            var p = _rect.anchoredPosition;
            _rect.anchoredPosition = new Vector2(p.x, y);
        }
    }
}
