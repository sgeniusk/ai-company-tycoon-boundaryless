// 오피스 소품을 무대 좌우 끝 바닥에 배치하는 정적 헬퍼. 공통 소품(feat-020) + 성급(배경)별 특화 소품(feat-023).
using UnityEngine;
using UnityEngine.UI;

namespace AICompanyTycoon.UI
{
    public static class OfficeProps
    {
        // feat-030 시안 — 오피스 고정 3레이어. Back=직원 뒤(벽 가구·러그), Front=직원 앞(전경 소품이 하반신 가림).
        public enum PropLayer { Back, Front }

        struct PropSpec
        {
            public readonly string SpriteName;
            public readonly float XNorm;
            public readonly float FootY;
            public readonly float Height;
            public readonly PropLayer Layer; // 일급 속성 — 새 소품은 반드시 지정 (Back/Front)

            public PropSpec(string spriteName, float xNorm, float footY, float height, PropLayer layer = PropLayer.Back)
            {
                SpriteName = spriteName;
                XNorm = xNorm;
                FootY = footY;
                Height = height;
                Layer = layer;
            }
        }

        // 앞 전경 소품(Front 레이어) — 직원·책상 앞에 렌더돼 하반신을 가려 깊이를 준다 (시안 "앞 전경 큰 화분·소파").
        static readonly PropSpec[] FrontProps =
        {
            new PropSpec("prop_plant_big", 0.10f, 60f, 210f, PropLayer.Front), // 전경 좌 큰 화분
            new PropSpec("prop_couch", 0.84f, 50f, 150f, PropLayer.Front),     // 전경 우 소파
        };

        // 공통 — 앞 가장자리 바닥 소품. xNorm은 [0.08,0.86] 안전 범위(pivot 0.5라 0.9 넘으면 스프라이트 절반이 화면 밖 잘림).
        static readonly PropSpec[] BaseProps =
        {
            new PropSpec("prop_plant", 0.08f, 8f, 82f),    // 좌 (couch는 Front 레이어로 이동)
            new PropSpec("prop_cooler", 0.17f, 8f, 84f),   // 좌
            new PropSpec("prop_vending", 0.86f, 8f, 120f), // 우 — 끝이지만 안전 범위
        };

        // 바닥 소품 — 직원 위쪽 빈 바닥 띠를 메운다. footY 내림차순(뒤·작게부터)으로 그려 앞 소품이 겹친다.
        // 뒤 가구는 일정 footY·균등 간격 한 줄로 '벽 근처 정돈'(부유감 제거), 전부 x [0.15,0.85] 안전 범위(잘림 없음).
        static readonly PropSpec[] FloorProps =
        {
            // 뒤 바닥 한 줄(벽 근처) — footY 통일·x 균등. feat-030 — 캐릭터(248) 대비 '콩알' 비례 개선 위해 확대.
            new PropSpec("prop_plant_big", 0.13f, 410f, 132f),     // 좌 키큰 화분
            new PropSpec("prop_partition", 0.39f, 412f, 118f),     // 중좌 칸막이
            new PropSpec("prop_bookshelf", 0.64f, 410f, 134f),     // 중우 책장
            new PropSpec("prop_shelf_low", 0.86f, 408f, 104f),     // 우 수납장
            // 중앙 러그 — 크게·직원 발치(footY 140)에 깔아 앞 책상들이 러그 '위에' 앉도록(겹침 깊이). floor 중 frontmost.
            new PropSpec("prop_rug", 0.50f, 140f, 158f),           // 신규 — 중앙 대형 러그
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

            // 갱신 시 기존 두 레이어 제거 (성급 승급 등)
            DestroyLayer(layerParent, "OfficePropsLayer");
            DestroyLayer(layerParent, "OfficePropsFrontLayer");

            // ── Back 레이어 — 직원 stage '앞 sibling'(낮은 인덱스 = 뒤 렌더). 벽 가구·러그·뒤 소품.
            var back = MakeLayer(layerParent, "OfficePropsLayer");
            if (layerParent == stageParent.parent)
            {
                back.SetSiblingIndex(stageParent.GetSiblingIndex()); // stage를 뒤로 밀어 Back이 먼저(뒤) 렌더
            }
            foreach (var prop in FloorProps) PlaceProp(back, prop);
            foreach (var prop in BaseProps) PlaceProp(back, prop);
            foreach (var prop in StageProps(backgroundKey)) PlaceProp(back, prop);

            // ── Front 레이어 — 직원 stage '뒤 sibling'(높은 인덱스 = 앞 렌더). 전경 소품이 직원 하반신을 가린다 (시안 3레이어).
            var front = MakeLayer(layerParent, "OfficePropsFrontLayer");
            if (layerParent == stageParent.parent)
            {
                front.SetSiblingIndex(stageParent.GetSiblingIndex() + 1); // stage 바로 뒤(앞 렌더)
            }
            foreach (var prop in FrontProps) PlaceProp(front, prop);
        }

        static void DestroyLayer(Transform parent, string name)
        {
            var existing = parent.Find(name);
            if (existing != null) Object.Destroy(existing.gameObject);
        }

        static Transform MakeLayer(Transform parent, string name)
        {
            var layer = new GameObject(name, typeof(RectTransform));
            layer.transform.SetParent(parent, false);
            var r = layer.GetComponent<RectTransform>();
            r.anchorMin = Vector2.zero; r.anchorMax = Vector2.one;
            r.offsetMin = Vector2.zero; r.offsetMax = Vector2.zero;
            return layer.transform;
        }

        static void PlaceProp(Transform parent, PropSpec prop)
        {
            var sprite = IconLibrary.Get(prop.SpriteName);
            if (sprite == null)
            {
                return;
            }

            var aspect = sprite.rect.width / sprite.rect.height;
            float h = prop.Height * 1.25f; // feat-023 — 소품 확대(작다는 피드백)
            var item = new GameObject(prop.SpriteName, typeof(RectTransform), typeof(Image));
            item.transform.SetParent(parent, false);
            var rect = item.GetComponent<RectTransform>();
            rect.anchorMin = rect.anchorMax = new Vector2(prop.XNorm, 0f);
            rect.pivot = new Vector2(0.5f, 0f);
            rect.sizeDelta = new Vector2(h * aspect, h);
            rect.anchoredPosition = new Vector2(0f, prop.FootY);

            var image = item.GetComponent<Image>();
            image.sprite = sprite;
            image.preserveAspect = true;
            image.raycastTarget = false;
        }
    }
}
