// 일하는 직원 머리 위에 톡 떴다가 페이드되는 카이로소프트식 픽셀 말풍선.
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public class SpeechBubble : MonoBehaviour
    {
        // GameScreen/WorkLoop가 뽑아 쓰는 기본 작업 대사. 짧고 톡 튀는 한 호흡짜리만.
        public static readonly string[] WorkPhrases =
        {
            "완벽해!",
            "버그 잡았다!",
            "출시 가자!",
            "오 좋은데?",
            "거의 다 됐어",
            "커밋!",
            "이거 된다!",
            "릴리즈 직전!",
            "배포 완료!",
            "테스트 통과 ✅",
            "여기 한 줄만 더",
        };

        // 본체 살짝 둥글게 보이도록 좌우 여백. 픽셀 하드엣지라 라운드 스프라이트는 안 쓴다.
        const float PadX = 22f;
        const float PadY = 12f;
        const float MinWidth = 64f;
        const float TailSize = 16f;
        const float Rise = 14f;
        const float PopInPortion = 0.18f;
        const float FadePortion = 0.30f;

        float _hold;
        float _duration;
        float _elapsed;
        CanvasGroup _group;
        RectTransform _rect;
        Vector2 _startPos;

        // parent 좌표계의 anchoredPos(보통 직원 머리 위)에 말풍선 하나를 생성한다. 스스로 소멸한다.
        // accent를 주면 본체를 살짝 그쪽으로 틴트한다. hold는 페이드 전 유지 시간(기본 1.2s).
        public static void Spawn(RectTransform parent, Vector2 anchoredPos, string text, Color? accent = null, float hold = 1.2f)
        {
            if (parent == null || string.IsNullOrEmpty(text)) return;

            // 루트 — 스케일/알파를 한 번에 다루는 컨테이너. 픽셀 톤을 위해 자식은 모두 null 스프라이트 솔리드 쿼드.
            var root = new GameObject("SpeechBubble", typeof(RectTransform), typeof(CanvasGroup));
            root.transform.SetParent(parent, false);

            var rootRect = root.GetComponent<RectTransform>();
            rootRect.anchorMin = new Vector2(0.5f, 1f);
            rootRect.anchorMax = new Vector2(0.5f, 1f);
            rootRect.pivot = new Vector2(0.5f, 0f); // 아래 꼬리 끝을 기준으로 위로 자라게
            rootRect.anchoredPosition = anchoredPos;

            // INK 외곽선 — TextPrimary 톤을 더 짙게. 본체보다 살짝 큰 솔리드 쿼드로 테두리처럼 깐다.
            var ink = MakeQuad(rootRect, new Color(0.10f, 0.07f, 0.04f, 0.95f));
            ink.name = "Ink";

            // 본체 — 크림/화이트. accent가 있으면 그쪽으로 살짝만 섞는다.
            var body = new Color(0.99f, 0.97f, 0.90f, 1f);
            if (accent.HasValue)
            {
                var a = accent.Value;
                body = new Color(
                    Mathf.Lerp(body.r, a.r, 0.18f),
                    Mathf.Lerp(body.g, a.g, 0.18f),
                    Mathf.Lerp(body.b, a.b, 0.18f),
                    1f);
            }
            var fill = MakeQuad(rootRect, body);
            fill.name = "Body";

            // 텍스트 — 짙은 갈색, 폰트 26 이상(모바일 하드요건).
            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(rootRect, false);
            var label = labelGo.GetComponent<Text>();
            label.font = UiFactory.LegacyFont;
            label.text = text;
            label.fontSize = UiTheme.FontCaption; // 26
            label.fontStyle = FontStyle.Bold;
            label.color = UiTheme.TextPrimary;
            label.alignment = TextAnchor.MiddleCenter;
            label.horizontalOverflow = HorizontalWrapMode.Overflow;
            label.verticalOverflow = VerticalWrapMode.Overflow;
            label.raycastTarget = false;

            // 본체 크기를 텍스트 폭에 맞춰 자동 산출(좌우/상하 패딩). preferredWidth는 Marquee와 동일 패턴.
            float textW = Mathf.Max(label.preferredWidth, 1f);
            float textH = Mathf.Max(label.preferredHeight, 1f);
            float bodyW = Mathf.Max(textW + PadX * 2f, MinWidth);
            float bodyH = textH + PadY * 2f;

            // 본체 사각 — 꼬리(TailSize) 위에 올린다. 외곽선은 본체보다 2px씩 크게.
            float bodyCenterY = TailSize + bodyH * 0.5f;

            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = new Vector2(0.5f, 0f);
            labelRect.anchorMax = new Vector2(0.5f, 0f);
            labelRect.pivot = new Vector2(0.5f, 0.5f);
            labelRect.sizeDelta = new Vector2(textW + 2f, textH + 2f);
            // 텍스트는 본체 중심에 맞춘다(꼬리 위 본체 정중앙).
            labelRect.anchoredPosition = new Vector2(0f, bodyCenterY);

            SetQuad(fill, new Vector2(bodyW, bodyH), new Vector2(0f, bodyCenterY));
            SetQuad(ink, new Vector2(bodyW + 4f, bodyH + 4f), new Vector2(0f, bodyCenterY));

            // 꼬리 — 45도 회전한 작은 솔리드 사각이 아래쪽 삼각 팁처럼 보인다(안티앨리어싱 없는 하드엣지).
            var tailInk = MakeQuad(rootRect, ink.color);
            tailInk.name = "TailInk";
            SetRotatedQuad(tailInk, TailSize + 4f, new Vector2(0f, TailSize * 0.65f), 45f);
            var tail = MakeQuad(rootRect, body);
            tail.name = "Tail";
            SetRotatedQuad(tail, TailSize, new Vector2(0f, TailSize * 0.7f), 45f);

            // 본체/꼬리가 외곽선 위로 오도록 형제 순서 정리(Ink → TailInk → Body → Tail → Label).
            ink.transform.SetAsFirstSibling();
            tailInk.transform.SetSiblingIndex(1);
            fill.transform.SetSiblingIndex(2);
            tail.transform.SetSiblingIndex(3);
            labelGo.transform.SetAsLastSibling();

            // 전체 박스 높이를 루트 sizeDelta에 반영(레이아웃/디버그용, 모션엔 미사용).
            rootRect.sizeDelta = new Vector2(bodyW + 4f, TailSize + bodyH + 4f);

            var sb = root.AddComponent<SpeechBubble>();
            sb._hold = Mathf.Max(hold, 0.1f);
            sb._duration = sb._hold + 0.45f; // 유지 후 페이드/상승 구간
            sb._elapsed = 0f;
            sb._group = root.GetComponent<CanvasGroup>();
            sb._group.blocksRaycasts = false;
            sb._group.interactable = false;
            sb._group.alpha = 1f;
            sb._rect = rootRect;
            sb._startPos = anchoredPos;
            root.transform.localScale = Vector3.one * 0.7f; // pop-in 시작 스케일
        }

        void Update()
        {
            if (_duration <= 0f) return;
            _elapsed += Time.deltaTime;
            var t = Mathf.Clamp01(_elapsed / _duration);

            // pop-in — 0.7 → 1.08 오버슈트 → 1.0 (초반 ~18%). FloatingText 펀치 감각 차용.
            float scale;
            if (t < PopInPortion)
            {
                scale = Mathf.Lerp(0.7f, 1.08f, t / PopInPortion);
            }
            else
            {
                // 오버슈트를 1.0으로 잦아들게 (다음 ~10% 구간).
                float settle = Mathf.Clamp01((t - PopInPortion) / 0.10f);
                scale = Mathf.Lerp(1.08f, 1f, settle);
            }
            transform.localScale = Vector3.one * scale;

            // 마지막 ~30% — 알파 1→0 + 살짝 상승(rise ~14px). ReactionBubble의 비선형 페이드 차용.
            if (t > 1f - FadePortion)
            {
                float f = (t - (1f - FadePortion)) / FadePortion;
                _group.alpha = Mathf.Lerp(1f, 0f, Mathf.Pow(f, 1.6f));
                _rect.anchoredPosition = _startPos + new Vector2(0f, Mathf.SmoothStep(0f, Rise, f));
            }
            else
            {
                _group.alpha = 1f;
                _rect.anchoredPosition = _startPos;
            }

            if (t >= 1f)
            {
                Destroy(gameObject);
            }
        }

        // null 스프라이트 Image = 하드엣지 솔리드 쿼드(uGUI 기본 흰 박스). 픽셀 톤에 맞다.
        static Image MakeQuad(RectTransform parent, Color color)
        {
            var go = new GameObject("Quad", typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var img = go.GetComponent<Image>();
            img.sprite = null;
            img.color = color;
            img.raycastTarget = false;
            return img;
        }

        static void SetQuad(Image img, Vector2 size, Vector2 anchoredPos)
        {
            var r = img.rectTransform;
            r.anchorMin = new Vector2(0.5f, 0f);
            r.anchorMax = new Vector2(0.5f, 0f);
            r.pivot = new Vector2(0.5f, 0.5f);
            r.sizeDelta = size;
            r.anchoredPosition = anchoredPos;
        }

        static void SetRotatedQuad(Image img, float size, Vector2 anchoredPos, float zRotation)
        {
            SetQuad(img, new Vector2(size, size), anchoredPos);
            img.rectTransform.localRotation = Quaternion.Euler(0f, 0f, zRotation);
        }
    }
}
