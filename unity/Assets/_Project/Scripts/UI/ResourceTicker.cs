// 자원 값 카운트업 — 표시값이 목표값을 매 프레임 부드럽게 따라가며 ResourceFormat으로 갱신한다.
using UnityEngine;
using UnityEngine.UI;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.UI
{
    public class ResourceTicker : MonoBehaviour
    {
        ResourceId _id;
        Text _label;
        double _shown;
        double _target;
        bool _ready;

        public void Init(ResourceId id, Text label, double value)
        {
            _id = id;
            _label = label;
            _shown = value;
            _target = value;
            _ready = true;
            if (_label != null) _label.text = ResourceFormat.Format(_id, _shown);
        }

        public void SetTarget(double value)
        {
            _target = value;
        }

        void Update()
        {
            if (!_ready || _label == null) return;

            double diff = _target - _shown;
            if (System.Math.Abs(diff) < 0.5)
            {
                if (_shown != _target)
                {
                    _shown = _target;
                    _label.text = ResourceFormat.Format(_id, _shown);
                }
                return;
            }

            double step = diff * Mathf.Clamp01(Time.deltaTime * 6f);
            if (System.Math.Abs(step) < 1.0) step = diff > 0 ? 1.0 : -1.0;
            _shown += step;
            _label.text = ResourceFormat.Format(_id, _shown);
        }
    }
}
