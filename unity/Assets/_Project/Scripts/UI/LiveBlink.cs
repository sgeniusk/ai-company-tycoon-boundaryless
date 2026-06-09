// LIVE 뱃지를 steps 방식으로 점멸시키는 컴포넌트 (CD-1 전광판). CanvasGroup 알파를 1↔dim 하드 토글.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    [RequireComponent(typeof(CanvasGroup))]
    public class LiveBlink : MonoBehaviour
    {
        public float period = 1.4f;
        public float dimAlpha = 0.4f;
        CanvasGroup _cg;
        float _t;

        void Awake()
        {
            _cg = GetComponent<CanvasGroup>();
        }

        void Update()
        {
            if (_cg == null)
            {
                return;
            }

            _t += Time.deltaTime;
            // steps(2) — 부드러운 보간 없이 켜짐/흐려짐을 하드 토글한다.
            bool on = (_t % period) < period * 0.5f;
            _cg.alpha = on ? 1f : dimAlpha;
        }
    }
}
