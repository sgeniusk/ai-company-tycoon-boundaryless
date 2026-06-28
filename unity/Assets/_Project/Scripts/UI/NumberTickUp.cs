// 숫자 라벨을 from→to로 틱업시키는 뷰 컴포넌트 — 월말 순익 도파민 (feat-030, 시안 손익 시트 틱업).
using System;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class NumberTickUp : MonoBehaviour
    {
        Text _label;
        float _from, _to, _t, _dur;
        Func<float, string> _fmt;

        // unscaledDeltaTime을 쓴다 — 브리핑 중 timeScale이 0이어도 동작.
        public void Init(Text label, float from, float to, Func<float, string> fmt, float dur = 0.9f)
        {
            _label = label;
            _from = from;
            _to = to;
            _fmt = fmt;
            _dur = Mathf.Max(0.05f, dur);
            _t = 0f;
            if (_label != null && _fmt != null) _label.text = _fmt(_from);
        }

        void Update()
        {
            if (_label == null || _fmt == null) { Destroy(this); return; }
            _t += Time.unscaledDeltaTime;
            float p = Mathf.Clamp01(_t / _dur);
            float e = 1f - Mathf.Pow(1f - p, 3f); // easeOutCubic
            _label.text = _fmt(Mathf.Lerp(_from, _to, e));
            if (p >= 1f) Destroy(this);
        }
    }
}
