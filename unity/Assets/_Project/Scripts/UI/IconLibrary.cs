// 임포트된 아이콘 아틀라스 스프라이트를 이름으로 조회하는 런타임 라이브러리입니다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public static class IconLibrary
    {
        // Resources/Art/UI 하위에서 로드할 아틀라스 경로 (확장 시 여기 추가).
        static readonly string[] AtlasResourcePaths =
        {
            "Art/UI/v071-commercial-ui-atlas",
            "Art/UI/v079-product-domain-atlas",
            "Art/UI/v080-capability-research-atlas",
            "Art/UI/v072-competitor-logo-atlas",
            "Art/UI/v074-helper-portrait-atlas",
            "Art/UI/v090-workforce-actor-hires", // v076 드롭인 교체 (고해상 256px, 같은 셀 이름)
            "Art/UI/v077-celebration-emblem-atlas",
            "Art/UI/v078-world-reveal-stamp-atlas",
            "Art/UI/v081-office-reaction-atlas",
            "Art/UI/v091-office-objects-hires", // v054 드롭인 교체 (고해상 384x288, 같은 셀 이름)
        };

        static Dictionary<string, Sprite> _cache;

        static void EnsureLoaded()
        {
            if (_cache != null)
            {
                return;
            }

            _cache = new Dictionary<string, Sprite>();
            foreach (var path in AtlasResourcePaths)
            {
                var sprites = Resources.LoadAll<Sprite>(path);
                foreach (var sprite in sprites)
                {
                    if (sprite != null && !_cache.ContainsKey(sprite.name))
                    {
                        _cache[sprite.name] = sprite;
                    }
                }
            }
        }

        // 이름으로 스프라이트를 찾는다. 아직 임포트 전이면 null 을 돌려 호출부가 폴백하게 한다.
        public static Sprite Get(string spriteName)
        {
            if (string.IsNullOrEmpty(spriteName))
            {
                return null;
            }

            EnsureLoaded();
            return _cache.TryGetValue(spriteName, out var sprite) ? sprite : null;
        }

        // 자원 아이콘 — v071 첫 행 셀 이름이 "ui_" + 데이터 키 규칙과 일치한다.
        public static Sprite Resource(ResourceId id)
        {
            return Get("ui_" + ResourceIds.ToKey(id));
        }

        // 도메인 아이콘 — v079 셀 이름이 "domain_" + 도메인 id 규칙과 일치한다.
        public static Sprite Domain(string domainId)
        {
            return Get("domain_" + domainId);
        }

        // 능력 아이콘 — v080 셀 이름이 "cap_" + 능력 id 규칙과 일치한다.
        public static Sprite Capability(string capabilityId)
        {
            return Get("cap_" + capabilityId);
        }

        // 테스트나 핫리로드 후 캐시를 비운다.
        public static void Clear()
        {
            _cache = null;
        }
    }
}
