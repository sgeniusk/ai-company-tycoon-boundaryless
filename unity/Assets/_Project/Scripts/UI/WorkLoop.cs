// 직원 액터가 턴 사이에도 일하는 코믹 워크루프 — 주기적으로 작업 이모트를 머리 위에 띄운다 (feat-010 #2).
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class WorkLoop : MonoBehaviour
    {
        static readonly string[] DefaultEmotes = { "react_codespark", "react_gear", "react_idea", "react_coffee" };

        string[] _emotes = DefaultEmotes;
        float _timer;
        int _seedOffset;
        bool _allowSpeech = true;

        public void Init(int seedOffset, bool allowSpeech = true)
        {
            _seedOffset = seedOffset;
            _allowSpeech = allowSpeech;
            // 직원마다 위상이 어긋나게 — 동시에 모두 뜨면 기계적으로 보인다.
            _timer = 1.2f + (seedOffset % 5) * 0.9f + Random.Range(0f, 2f);
        }

        void Update()
        {
            _timer -= Time.deltaTime;
            if (_timer > 0f) return;
            _timer = Random.Range(3.5f, 7.5f);
            // 매 사이클 — 작업 이모트 / 말풍선("완벽해!") / 직원별 리워드 플로팅("+아이디어") 중 하나 (feat-019 T3).
            float r = Random.value;
            if (_allowSpeech && r < 0.30f) SpawnSpeech();
            else if (r < 0.52f) SpawnRewardFloat();
            else SpawnEmote();
        }

        void SpawnEmote()
        {
            var sprite = IconLibrary.Get(_emotes[(Random.Range(0, 97) + _seedOffset) % _emotes.Length]);
            if (sprite == null) return;

            var go = new GameObject("WorkEmote", typeof(RectTransform), typeof(Image), typeof(CanvasGroup));
            go.transform.SetParent(transform, false);

            var img = go.GetComponent<Image>();
            img.sprite = sprite;
            img.raycastTarget = false;
            img.preserveAspect = true;

            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.5f, 1f);
            rect.anchorMax = new Vector2(0.5f, 1f);
            rect.pivot = new Vector2(0.5f, 0f);
            rect.sizeDelta = new Vector2(36f, 36f);
            rect.anchoredPosition = new Vector2(Random.Range(-14f, 14f), -6f);

            go.AddComponent<ReactionBubble>().Init(1.4f);
        }

        // 가끔 말풍선 — 카이로소프트식 "완벽해!" 한마디 (feat-019 T3).
        void SpawnSpeech()
        {
            var rect = transform as RectTransform;
            if (rect == null) return;
            var phrases = SpeechBubble.WorkPhrases;
            if (phrases == null || phrases.Length == 0) return;
            var phrase = phrases[(Random.Range(0, 97) + _seedOffset) % phrases.Length];
            SpeechBubble.Spawn(rect, new Vector2(Random.Range(-8f, 8f), 6f), phrase);
        }

        // 직원별 작은 리워드 플로팅 — 일하는 직원이 결과물을 뽑아내는 느낌 (feat-019 T3).
        void SpawnRewardFloat()
        {
            var rect = transform as RectTransform;
            if (rect == null) return;
            string[] rewards = { "+아이디어", "+코드", "+디자인", "+버그수정", "+1" };
            var txt = rewards[(Random.Range(0, 97) + _seedOffset) % rewards.Length];
            FloatingText.Spawn(rect, txt, UiTheme.ScoreboardTag, 26,
                new Vector2(Random.Range(-10f, 10f), 28f), 0f);
        }
    }
}
