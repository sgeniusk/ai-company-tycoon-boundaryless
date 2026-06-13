// 직원 액터의 idle↔작업 포즈를 번갈아 스왑해 타이핑 애니메이션을 만든다 (feat-020). StaffBob(통통)·WorkLoop(이모트) 위에 얹힌다.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class ActorAnim : MonoBehaviour
    {
        Image _img;
        Sprite _idle, _work, _cheer;
        float _idleDur, _workDur, _cheerDur, _t;
        int _state; // 0=idle, 1=work(타이핑), 2=cheer(환호)

        // idle/work/cheer 스프라이트로 초기화. work·cheer가 null이면 그 상태를 건너뛴다(드롭인 안전). seed로 직원마다 타이밍·위상을 흩뜨린다.
        public void Init(Sprite idle, Sprite work, Sprite cheer, float seed)
        {
            _img = GetComponent<Image>();
            _idle = idle;
            _work = work;
            _cheer = cheer;
            // 가끔 앞으로 기울여 타이핑 — idle을 길게, work를 짧게. 직원마다 다르게.
            float f1 = Mathf.Abs(Mathf.Sin(seed * 12.9898f));
            float f2 = Mathf.Abs(Mathf.Sin(seed * 4.1357f + 1.7f));
            _idleDur = 1.2f + f1 * 1.1f;   // 1.2~2.3s
            _workDur = 0.42f + f2 * 0.4f;  // 0.42~0.82s
            _cheerDur = 1.1f;              // 환호 한 박(작은 성취 자축)
            _t = seed * 0.5f;              // 위상차
            _state = 0;
            if (_img != null && _idle != null)
            {
                _img.sprite = _idle;
            }
        }

        void Update()
        {
            if (_img == null || _idle == null)
            {
                return;
            }

            _t += Time.deltaTime;
            float dur = _state == 2 ? _cheerDur : (_state == 1 ? _workDur : _idleDur);
            if (_t < dur)
            {
                return;
            }

            _t -= dur;
            // idle에서 가끔 환호(작은 성취 자축), 보통은 idle↔작업 타이핑 반복.
            if (_state == 2) _state = 0;
            else if (_state == 0) _state = (_cheer != null && Random.value < 0.12f) ? 2 : 1;
            else _state = 0;
            _img.sprite = _state == 2 ? _cheer : (_state == 1 && _work != null ? _work : _idle);
        }
    }
}
