// 오피스 소품을 무대 좌우 끝 바닥에 배치하는 정적 헬퍼. 공통 소품(feat-020) + 성급(배경)별 특화 소품(feat-023).
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public static class OfficeProps
    {
        struct PropSpec
        {
            public readonly string SpriteName;
            public readonly float XNorm;
            public readonly float FootY;
            public readonly float Height;

            public PropSpec(string spriteName, float xNorm, float footY, float height)
            {
                SpriteName = spriteName;
                XNorm = xNorm;
                FootY = footY;
                Height = height;
            }
        }

        // 공통 — 모든 성급에 깔리는 좌우 끝 바닥 소품 (feat-020).
        static readonly PropSpec[] BaseProps =
        {
            new PropSpec("prop_plant", 0.045f, 8f, 82f),
            new PropSpec("prop_cooler", 0.115f, 8f, 84f),
            new PropSpec("prop_vending", 0.895f, 8f, 120f),
            new PropSpec("prop_couch", 0.940f, 6f, 68f),
            new PropSpec("prop_bookshelf", 0.985f, 8f, 120f),
        };

        // 성급(배경 키)별 특화 소품 — feat-023 신규 6종. 배경마다 1~2종으로 과밀 회피 + 성급 정체성.
        // 작은 Height로 캐릭터(≈220px)보다 낮게 둬 거친 픽셀을 배경 장식 수준으로 완화한다.
        static PropSpec[] StageProps(string backgroundKey)
        {
            switch (backgroundKey)
            {
                case "Art/Background/office_growth":     // 2~3성 — 기획·회의
                    return new[]
                    {
                        new PropSpec("prop_whiteboard", 0.205f, 8f, 74f),
                        new PropSpec("prop_table", 0.795f, 6f, 46f),
                    };
                case "Art/Background/office_datacenter": // 4성 — 서버·출력
                    return new[]
                    {
                        new PropSpec("prop_serverRack", 0.205f, 8f, 92f),
                        new PropSpec("prop_printer", 0.795f, 8f, 54f),
                    };
                case "Art/Background/office_landmark":    // 5성 — 성취 진열·임원 회의
                    return new[]
                    {
                        new PropSpec("prop_trophy", 0.795f, 8f, 82f),
                        new PropSpec("prop_table", 0.205f, 6f, 46f),
                    };
                default:                                  // 차고·기본 — 단출한 탕비 코너
                    return new[]
                    {
                        new PropSpec("prop_coffee", 0.205f, 8f, 70f),
                    };
            }
        }

        // 성급 변경 시 재호출하면 기존 레이어를 갈아끼운다(backgroundKey null → 기본 office).
        public static void Populate(Transform stageParent, string backgroundKey = null)
        {
            if (stageParent == null)
            {
                return;
            }

            var layerParent = stageParent.parent != null ? stageParent.parent : stageParent;

            var existing = layerParent.Find("OfficePropsLayer");
            if (existing != null)
            {
                Object.Destroy(existing.gameObject); // 성급 승급 시 특화 소품 갱신
            }

            var layer = new GameObject("OfficePropsLayer", typeof(RectTransform));
            layer.transform.SetParent(layerParent, false);
            var layerRect = layer.GetComponent<RectTransform>();
            layerRect.anchorMin = Vector2.zero;
            layerRect.anchorMax = Vector2.one;
            layerRect.offsetMin = Vector2.zero;
            layerRect.offsetMax = Vector2.zero;

            if (layerParent == stageParent.parent)
            {
                layer.transform.SetSiblingIndex(stageParent.GetSiblingIndex());
            }

            foreach (var prop in BaseProps)
            {
                PlaceProp(layer.transform, prop);
            }

            foreach (var prop in StageProps(backgroundKey))
            {
                PlaceProp(layer.transform, prop);
            }
        }

        static void PlaceProp(Transform parent, PropSpec prop)
        {
            var sprite = IconLibrary.Get(prop.SpriteName);
            if (sprite == null)
            {
                return;
            }

            var aspect = sprite.rect.width / sprite.rect.height;
            var item = new GameObject(prop.SpriteName, typeof(RectTransform), typeof(Image));
            item.transform.SetParent(parent, false);
            var rect = item.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(prop.XNorm, 0f);
            rect.pivot = new Vector2(0.5f, 0f);
            rect.sizeDelta = new Vector2(prop.Height * aspect, prop.Height);
            rect.anchoredPosition = new Vector2(0f, prop.FootY);

            var image = item.GetComponent<Image>();
            image.sprite = sprite;
            image.preserveAspect = true;
            image.raycastTarget = false;
        }
    }
}
