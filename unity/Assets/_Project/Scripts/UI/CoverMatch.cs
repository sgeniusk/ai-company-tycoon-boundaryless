// 앰비언트 오버레이를 배경 cover 렌더 크기에 맞춰 스케일한다 — 네이티브 캔버스(240x534) 로컬좌표를 화면 cover에 정합 (feat-019 T4).
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public class CoverMatch : MonoBehaviour
    {
        RectTransform _self;
        RectTransform _src;     // 배경 이미지 RectTransform(AspectRatioFitter cover 적용된 실제 렌더 사각)
        float _nativeH = 534f;  // 네이티브 캔버스 세로 픽셀

        public void Init(RectTransform src, float nativeH)
        {
            _self = GetComponent<RectTransform>();
            _src = src;
            _nativeH = nativeH > 0f ? nativeH : 534f;
            Apply();
        }

        void LateUpdate()
        {
            Apply();
        }

        void Apply()
        {
            if (_self == null || _src == null)
            {
                return;
            }

            // 배경이 cover로 채운 실제 높이 / 네이티브 534 = 1 네이티브픽셀당 화면 스케일. 자식은 raw 캔버스 좌표만 쓴다.
            float s = _src.rect.height / _nativeH;
            if (s > 0.0001f)
            {
                _self.localScale = new Vector3(s, s, 1f);
            }
        }
    }
}
