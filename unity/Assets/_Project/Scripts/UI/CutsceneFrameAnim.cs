// 컷씬 전용 — Image의 sprite를 프레임 배열로 루프 재생한다(오피스 직원 ActorAnim과 분리). 비균일 scale 미사용(픽셀 보존).
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class CutsceneFrameAnim : MonoBehaviour
    {
        Image _img;
        Sprite[] _frames;
        float _fps = 4f, _t;
        int _i;

        public void Init(Image img, IReadOnlyList<Sprite> frames, float fps = 4f)
        {
            _img = img;
            _frames = new Sprite[frames.Count];
            for (int k = 0; k < frames.Count; k++) _frames[k] = frames[k];
            _fps = fps; _i = 0; _t = 0f;
            if (_frames.Length > 0 && _img != null) _img.sprite = _frames[0];
        }

        void Update()
        {
            if (_frames == null || _frames.Length < 2 || _img == null) return;
            _t += Time.unscaledDeltaTime;
            if (_t >= 1f / _fps)
            {
                _t = 0f;
                _i = (_i + 1) % _frames.Length;
                _img.sprite = _frames[_i];
            }
        }
    }
}
