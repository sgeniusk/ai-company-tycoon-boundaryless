// 오피스 소품을 무대 좌우 끝 바닥에 배치하는 정적 헬퍼.
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

        static readonly PropSpec[] Props =
        {
            new PropSpec("prop_plant", 0.045f, 8f, 82f),
            new PropSpec("prop_cooler", 0.115f, 8f, 84f),
            new PropSpec("prop_vending", 0.895f, 8f, 120f),
            new PropSpec("prop_couch", 0.940f, 6f, 68f),
            new PropSpec("prop_bookshelf", 0.985f, 8f, 120f),
        };

        public static void Populate(Transform stageParent)
        {
            if (stageParent == null)
            {
                return;
            }

            var layerParent = stageParent.parent != null ? stageParent.parent : stageParent;
            if (layerParent.Find("OfficePropsLayer") != null)
            {
                return;
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

            foreach (var prop in Props)
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
