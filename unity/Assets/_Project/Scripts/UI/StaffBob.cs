// 사무실 직원 스프라이트의 이동 기반 모션 — 포즈 상태(ActorAnim)에 따라 통통·타이핑 기울임·환호 홉·카드 팝·놀람 리코일을 준다. 인스턴스별 위상차. 비균일 scale 금지(픽셀 보존, feat-018 교훈).
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public class StaffBob : MonoBehaviour
    {
        public float amplitude = 7f; // 픽셀
        public float speed = 2.4f;   // rad/s
        RectTransform _rect;
        ActorAnim _anim;             // 같은 GameObject의 포즈 상태 — 추가 순서 무관하게 지연 획득
        bool _animResolved;
        float _phase;
        float _baseX, _baseY;
        bool _ready;

        public void Init(float phase)
        {
            _rect = GetComponent<RectTransform>();
            _phase = phase;
            if (_rect != null)
            {
                _baseX = _rect.anchoredPosition.x;
                _baseY = _rect.anchoredPosition.y;
            }
            _ready = _rect != null;
        }

        void Update()
        {
            if (!_ready)
            {
                return;
            }
            if (!_animResolved)
            {
                _anim = GetComponent<ActorAnim>();
                _animResolved = true;
            }

            int st = _anim != null ? _anim.State : ActorAnim.Idle;
            float e = _anim != null ? _anim.StateElapsed : 0f;
            float t = Time.time;
            float ox = 0f, oy = 0f;

            switch (st)
            {
                case ActorAnim.Work: // 빠르고 얕은 앞 기울임 — 타이핑 리듬
                    oy = Mathf.Abs(Mathf.Sin(t * 6.2f + _phase)) * amplitude * 0.42f;
                    ox = Mathf.Sin(t * 6.2f + _phase) * 1.6f;
                    break;
                case ActorAnim.Cheer: // 큰 홉 — 신나게 점프
                    oy = Mathf.Abs(Mathf.Sin(t * 4.6f + _phase)) * amplitude * 1.7f;
                    break;
                case ActorAnim.CardUse: // 위로 팝 후 유지 — 카드를 치켜든 느낌 (e로 빠른 상승 엔벨로프)
                    oy = amplitude * 1.5f * (1f - Mathf.Exp(-e * 11f)) + Mathf.Abs(Mathf.Sin(t * 3.5f)) * 1.5f;
                    break;
                case ActorAnim.Alert: // 좌우 리코일 셰이크 — e에 따라 감쇠
                    oy = Mathf.Abs(Mathf.Sin(t * speed + _phase)) * amplitude * 0.3f;
                    ox = Mathf.Sin(e * 52f) * amplitude * 0.85f * Mathf.Exp(-e * 4.2f);
                    break;
                default: // idle — 통통 + 미세 좌우 sway
                    oy = Mathf.Abs(Mathf.Sin(t * speed + _phase)) * amplitude;
                    ox = Mathf.Sin(t * 0.85f + _phase) * 1.3f;
                    break;
            }

            _rect.anchoredPosition = new Vector2(_baseX + ox, _baseY + oy);
        }
    }
}
