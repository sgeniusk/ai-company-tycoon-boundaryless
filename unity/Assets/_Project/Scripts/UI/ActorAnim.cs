// 직원 액터의 포즈 스왑 애니메이션 — feat-020 idle↔work↔cheer 위에 feat-023 card_use/alert 원샷을 얹는다. StaffBob(이동 모션)·WorkLoop(이모트)와 함께 동작.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class ActorAnim : MonoBehaviour
    {
        // 포즈 상태 — StaffBob이 이 값을 읽어 이동 모션을 맞춘다.
        public const int Idle = 0;
        public const int Work = 1;
        public const int Cheer = 2;
        public const int CardUse = 3; // 원샷 — 카드 치켜들고 골드 스파클 (해금·강화 모먼트)
        public const int Alert = 4;   // 원샷 — 놀람 + 느낌표 (이벤트 발생)

        Image _img;
        Sprite _idle, _work, _cheer, _cardUse, _alert;
        float _idleDur, _workDur, _cheerDur, _t;
        int _state;

        // 현재 상태와 그 상태에서 흐른 시간 — StaffBob이 모션 강도·엔벨로프(팝·리코일 감쇠)에 쓴다.
        public int State { get { return _state; } }
        public float StateElapsed { get { return _t; } }

        // work·cheer·cardUse·alert가 null이면 그 상태를 idle로 폴백(드롭인 안전). seed로 직원마다 타이밍·위상을 흩뜨린다.
        public void Init(Sprite idle, Sprite work, Sprite cheer, Sprite cardUse, Sprite alert, float seed)
        {
            _img = GetComponent<Image>();
            _idle = idle;
            _work = work;
            _cheer = cheer;
            _cardUse = cardUse;
            _alert = alert;
            // 가끔 앞으로 기울여 타이핑 — idle을 길게, work를 짧게. 직원마다 다르게.
            float f1 = Mathf.Abs(Mathf.Sin(seed * 12.9898f));
            float f2 = Mathf.Abs(Mathf.Sin(seed * 4.1357f + 1.7f));
            _idleDur = 1.2f + f1 * 1.1f;   // 1.2~2.3s
            _workDur = 0.42f + f2 * 0.4f;  // 0.42~0.82s
            _cheerDur = 1.1f;              // 환호 한 박
            _t = seed * 0.5f;              // 위상차
            _state = Idle;
            if (_img != null && _idle != null)
            {
                _img.sprite = _idle;
            }
        }

        // card_use·alert 원샷 재생 — 이벤트 모먼트에 GameScreen이 호출. 스프라이트 없으면 무시(드롭인 안전).
        public void PlayOneShot(int poseState)
        {
            Sprite s = poseState == CardUse ? _cardUse : poseState == Alert ? _alert : poseState == Cheer ? _cheer : null;
            if (s == null || _img == null)
            {
                return;
            }
            _state = poseState;
            _t = 0f;
            _img.sprite = s;
        }

        void Update()
        {
            if (_img == null || _idle == null)
            {
                return;
            }

            _t += Time.deltaTime;
            float dur = DurationFor(_state);
            if (_t < dur)
            {
                return;
            }

            _t = 0f;
            // 원샷(card_use/alert)·cheer는 한 박 뒤 idle로. 보통은 idle↔작업 타이핑, idle에서 가끔 cheer.
            if (_state == CardUse || _state == Alert || _state == Cheer)
            {
                _state = Idle;
            }
            else if (_state == Idle)
            {
                _state = (_cheer != null && Random.value < 0.12f) ? Cheer : Work;
            }
            else
            {
                _state = Idle;
            }
            _img.sprite = SpriteFor(_state);
        }

        float DurationFor(int state)
        {
            switch (state)
            {
                case Work: return _workDur;
                case Cheer: return _cheerDur;
                case CardUse: return 1.0f;
                case Alert: return 0.9f;
                default: return _idleDur;
            }
        }

        Sprite SpriteFor(int state)
        {
            switch (state)
            {
                case Work: return _work != null ? _work : _idle;
                case Cheer: return _cheer != null ? _cheer : _idle;
                case CardUse: return _cardUse != null ? _cardUse : _idle;
                case Alert: return _alert != null ? _alert : _idle;
                default: return _idle;
            }
        }
    }
}
