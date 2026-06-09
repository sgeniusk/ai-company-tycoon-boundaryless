// 코드 기반 UI 트윈(DOTween 불필요). 버튼 펀치·페이드인을 코루틴으로 처리한다.
using System.Collections;
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public class UiTween : MonoBehaviour
    {
        static UiTween _runner;

        static UiTween Runner
        {
            get
            {
                if (_runner == null)
                {
                    var go = new GameObject("UiTween");
                    DontDestroyOnLoad(go);
                    _runner = go.AddComponent<UiTween>();
                }
                return _runner;
            }
        }

        public static void Punch(Transform t, float amount = 0.12f, float dur = 0.12f)
        {
            if (t != null) Runner.StartCoroutine(PunchCo(t, amount, dur));
        }

        public static void FadeIn(CanvasGroup cg, float dur = 0.18f, float delay = 0f)
        {
            if (cg != null) Runner.StartCoroutine(FadeCo(cg, dur, delay));
        }

        // 모달 카드 등장 — 스케일 0.92→1 + 페이드 0→1 동시에.
        public static void PopIn(Transform t, CanvasGroup cg, float dur = 0.16f)
        {
            if (t != null) Runner.StartCoroutine(PopInCo(t, cg, dur));
        }

        static IEnumerator PopInCo(Transform t, CanvasGroup cg, float dur)
        {
            float e = 0f;
            if (cg != null) cg.alpha = 0f;
            t.localScale = Vector3.one * 0.92f;
            while (e < dur)
            {
                e += Time.unscaledDeltaTime;
                float k = Mathf.Clamp01(e / dur);
                t.localScale = Vector3.one * Mathf.Lerp(0.92f, 1f, k);
                if (cg != null) cg.alpha = k;
                yield return null;
            }
            t.localScale = Vector3.one;
            if (cg != null) cg.alpha = 1f;
        }

        static IEnumerator PunchCo(Transform t, float amount, float dur)
        {
            float half = Mathf.Max(0.01f, dur * 0.5f);
            float e = 0f;
            while (e < half) { e += Time.unscaledDeltaTime; t.localScale = Vector3.one * (1f + amount * (e / half)); yield return null; }
            e = 0f;
            while (e < half) { e += Time.unscaledDeltaTime; t.localScale = Vector3.one * (1f + amount * (1f - e / half)); yield return null; }
            t.localScale = Vector3.one;
        }

        static IEnumerator FadeCo(CanvasGroup cg, float dur, float delay)
        {
            cg.alpha = 0f;
            if (delay > 0f) yield return new WaitForSeconds(delay);
            float e = 0f;
            while (e < dur) { e += Time.unscaledDeltaTime; cg.alpha = Mathf.Clamp01(e / dur); yield return null; }
            cg.alpha = 1f;
        }
    }
}
