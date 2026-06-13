// 직원 액터의 idle↔작업 포즈를 번갈아 스왑해 타이핑 애니메이션을 만든다 (feat-020). StaffBob(통통)·WorkLoop(이모트) 위에 얹힌다.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class ActorAnim : MonoBehaviour
    {
        Image _img;
        Sprite _idle, _work;
        float _idleDur, _workDur, _t;
        bool _showWork;

        // idle/work 스프라이트로 초기화. work가 null이면 idle 고정(드롭인 안전). seed로 직원마다 타이밍·위상을 흩뜨린다.
        public void Init(Sprite idle, Sprite work, float seed)
        {
            _img = GetComponent<Image>();
            _idle = idle;
            _work = work;
            // 가끔 앞으로 기울여 타이핑 — idle을 길게, work를 짧게. 직원마다 다르게.
            float f1 = Mathf.Abs(Mathf.Sin(seed * 12.9898f));
            float f2 = Mathf.Abs(Mathf.Sin(seed * 4.1357f + 1.7f));
            _idleDur = 1.2f + f1 * 1.1f;   // 1.2~2.3s
            _workDur = 0.42f + f2 * 0.4f;  // 0.42~0.82s
            _t = seed * 0.5f;              // 위상차
            _showWork = false;
            if (_img != null && _idle != null)
            {
                _img.sprite = _idle;
            }
        }

        void Update()
        {
            if (_img == null || _work == null || _idle == null)
            {
                return;
            }

            _t += Time.deltaTime;
            float dur = _showWork ? _workDur : _idleDur;
            if (_t >= dur)
            {
                _t -= dur;
                _showWork = !_showWork;
                _img.sprite = _showWork ? _work : _idle;
            }
        }
    }
}
