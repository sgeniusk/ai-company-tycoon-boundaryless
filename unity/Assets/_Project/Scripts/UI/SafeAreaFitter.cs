// 노치·홈 인디케이터를 피해 RectTransform을 Screen.safeArea 영역에 맞추는 컴포넌트입니다.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    [RequireComponent(typeof(RectTransform))]
    public class SafeAreaFitter : MonoBehaviour
    {
        RectTransform _rect;
        Rect _appliedSafe;
        Vector2Int _appliedScreen;

        void Awake()
        {
            _rect = GetComponent<RectTransform>();
            Apply();
        }

        void Update()
        {
            // 화면 회전·크기·safe area 변화가 있을 때만 다시 맞춘다.
            if (Screen.safeArea != _appliedSafe || Screen.width != _appliedScreen.x || Screen.height != _appliedScreen.y)
            {
                Apply();
            }
        }

        void Apply()
        {
            if (_rect == null || Screen.width == 0 || Screen.height == 0)
            {
                return;
            }

            var safe = Screen.safeArea;
            var anchorMin = safe.position;
            var anchorMax = safe.position + safe.size;
            anchorMin.x /= Screen.width;
            anchorMin.y /= Screen.height;
            anchorMax.x /= Screen.width;
            anchorMax.y /= Screen.height;

            _rect.anchorMin = anchorMin;
            _rect.anchorMax = anchorMax;
            _rect.offsetMin = Vector2.zero;
            _rect.offsetMax = Vector2.zero;

            _appliedSafe = safe;
            _appliedScreen = new Vector2Int(Screen.width, Screen.height);
        }
    }
}
