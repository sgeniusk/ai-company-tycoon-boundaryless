// public/assets 아이콘 아틀라스를 Unity Resources 스프라이트로 복사하고 셀을 슬라이스하는 에디터 도구.
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class IconAtlasImporter
{
    // Resources 하위라야 런타임 Resources.LoadAll 로 접근 가능하다.
    const string DestFolder = "Assets/_Project/Resources/Art/UI";

    // 아틀라스 한 장의 정의 — 파일명, 셀 픽셀 크기, 열 수, 셀 순서대로의 스프라이트 이름.
    struct AtlasDef
    {
        public string fileName;
        public int cell;
        public int columns;
        public string[] names;
    }

    // 셀 순서는 generate-*.mjs 의 drawers 배열 순서가 정답지다 (좌->우, 위->아래).
    // v071 commercial-ui — 48px, 8열x3행. 0-7 자원(ResourceId 순), 8-23 공용 액션 아이콘.
    static readonly AtlasDef[] Atlases =
    {
        new AtlasDef
        {
            fileName = "v071-commercial-ui-atlas.png",
            cell = 48,
            columns = 8,
            names = new[]
            {
                "ui_cash", "ui_users", "ui_compute", "ui_data",
                "ui_talent", "ui_trust", "ui_hype", "ui_automation",
                "ui_company", "ui_launch", "ui_deck", "ui_agent",
                "ui_research", "ui_shop", "ui_trophy", "ui_log",
                "ui_calendar", "ui_spark", "ui_save", "ui_load",
                "ui_globe", "ui_chart", "ui_warning", "ui_crest",
            },
        },
        new AtlasDef
        {
            // v079 product-domain — 48px, 5x3. 셀 0-14 = 도메인 15종(domains.json 순서).
            fileName = "v079-product-domain-atlas.png",
            cell = 48,
            columns = 5,
            names = new[]
            {
                "domain_foundation_models", "domain_personal_productivity", "domain_creator_tools",
                "domain_developer_tools", "domain_customer_support", "domain_education",
                "domain_enterprise_automation", "domain_semiconductors", "domain_mobility",
                "domain_robotics", "domain_odd_industries", "domain_toys",
                "domain_manufacturing", "domain_logistics", "domain_energy",
            },
        },
        new AtlasDef
        {
            // v080 capability-research — 48px, 6x2. 셀 0-11 = 능력 12종(capabilities.json 순서).
            fileName = "v080-capability-research-atlas.png",
            cell = 48,
            columns = 6,
            names = new[]
            {
                "cap_language", "cap_code", "cap_vision", "cap_audio", "cap_video", "cap_agent",
                "cap_enterprise", "cap_safety", "cap_optimization", "cap_robotics", "cap_manufacturing", "cap_logistics",
            },
        },
    };

    [MenuItem("AICT/Import Icon Atlases")]
    public static void ImportAll()
    {
        EnsureFolder(DestFolder);
        var sourceRoot = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "public", "assets", "ui"));

        var imported = 0;
        foreach (var atlas in Atlases)
        {
            var src = Path.Combine(sourceRoot, atlas.fileName);
            if (!File.Exists(src))
            {
                Debug.LogWarning("[IconAtlasImporter] 원본 없음 - " + src);
                continue;
            }

            var destAssetPath = DestFolder + "/" + atlas.fileName;
            var destFull = Path.GetFullPath(Path.Combine(Application.dataPath, "..", destAssetPath));
            File.Copy(src, destFull, true);
            AssetDatabase.ImportAsset(destAssetPath, ImportAssetOptions.ForceSynchronousImport);
            Slice(destAssetPath, atlas);
            imported += 1;
        }

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[IconAtlasImporter] 아이콘 아틀라스 임포트 완료 - " + imported + "장.");
    }

    // 텍스처를 Sprite(Multiple)로 설정하고 셀마다 이름 붙은 스프라이트를 만든다.
    static void Slice(string assetPath, AtlasDef atlas)
    {
        var importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
        if (importer == null)
        {
            Debug.LogWarning("[IconAtlasImporter] TextureImporter 없음 - " + assetPath);
            return;
        }

        importer.textureType = TextureImporterType.Sprite;
        importer.spriteImportMode = SpriteImportMode.Multiple;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.mipmapEnabled = false;
        importer.spritePixelsPerUnit = atlas.cell;

        var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(assetPath);
        int rows = Mathf.CeilToInt(atlas.names.Length / (float)atlas.columns);
        int texHeight = tex != null ? tex.height : rows * atlas.cell;

        var sheet = new List<SpriteMetaData>(atlas.names.Length);
        for (int i = 0; i < atlas.names.Length; i += 1)
        {
            int col = i % atlas.columns;
            int row = i / atlas.columns;
            // PNG 는 좌상단 원점이고 Unity 텍스처 rect 는 좌하단 원점이라 y 를 뒤집는다.
            sheet.Add(new SpriteMetaData
            {
                name = atlas.names[i],
                rect = new Rect(col * atlas.cell, texHeight - (row + 1) * atlas.cell, atlas.cell, atlas.cell),
                alignment = (int)SpriteAlignment.Center,
                pivot = new Vector2(0.5f, 0.5f),
            });
        }

#pragma warning disable 618
        importer.spritesheet = sheet.ToArray();
#pragma warning restore 618
        EditorUtility.SetDirty(importer);
        importer.SaveAndReimport();
    }

    // 중첩 폴더를 AssetDatabase 기준으로 차례로 만든다.
    static void EnsureFolder(string path)
    {
        if (AssetDatabase.IsValidFolder(path))
        {
            return;
        }

        var parent = Path.GetDirectoryName(path).Replace("\\", "/");
        var leaf = Path.GetFileName(path);
        if (!AssetDatabase.IsValidFolder(parent))
        {
            EnsureFolder(parent);
        }

        AssetDatabase.CreateFolder(parent, leaf);
    }
}
