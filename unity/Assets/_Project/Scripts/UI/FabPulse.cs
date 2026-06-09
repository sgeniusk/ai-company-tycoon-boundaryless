// 다음 달 FAB 뒤에서 확장·페이드하며 시선을 끄는 펄스 링. Image 스케일을 키우며 알파를 줄인다.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    [RequireComponent(typeof(Image), typeof(RectTransform))]
    public class FabPulse : MonoBehaviour
    {
        public float period = 1.6f;
        public float maxScale = 1.5f;
        Image _img;
        RectTransform _rect;
        float _t;
        Color _base;

        void Awake()
        {
            _img = GetComponent<Image>();
            _rect = GetComponent<RectTransform>();
            _base = _img != null ? _img.color : Color.white;
        }

        void Update()
        {
            if (_rect == null)
            {
                return;
            }

            _t += Time.deltaTime;
            float k = (_t % period) / period; // 0→1 반복
            float s = Mathf.Lerp(1f, maxScale, k);
            _rect.localScale = new Vector3(s, s, 1f);
            if (_img != null)
            {
                var c = _base;
                c.a = _base.a * (1f - k);
                _img.color = c;
            }
        }
    }
}
