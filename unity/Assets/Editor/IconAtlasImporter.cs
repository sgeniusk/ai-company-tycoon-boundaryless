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
        public string folder; // public/assets 하위 폴더 (기본 ui, v076만 sprites)
        public int cell;      // 정사각 셀 한 변. 비정사각이면 cellW/cellH 사용.
        public int cellW;     // 0이면 cell 사용
        public int cellH;     // 0이면 cell 사용
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
        new AtlasDef
        {
            // v072 competitor-logo — 32px, 6x2=12. 경쟁사 로고(draw 호출 순서).
            fileName = "v072-competitor-logo-atlas.png",
            cell = 32,
            columns = 6,
            names = new[]
            {
                "comp_chatgody", "comp_cloyi", "comp_jemiinni", "comp_novarun", "comp_automaru", "comp_modelforge",
                "comp_chipspark", "comp_vizionlab", "comp_autonova", "comp_brewchain", "comp_toycloud", "comp_ironoracle",
            },
        },
        new AtlasDef
        {
            // v074 helper-portrait — 96px 단일. 헬퍼 Mina.
            fileName = "v074-helper-portrait-atlas.png",
            cell = 96,
            columns = 1,
            names = new[] { "helper_mina" },
        },
        new AtlasDef
        {
            // v076 workforce-actor — 76px, 3x1. 직원 액터(human/ai/robot). sprites 폴더.
            fileName = "v076-workforce-actor-atlas.png",
            folder = "sprites",
            cell = 76,
            columns = 3,
            names = new[] { "actor_human", "actor_ai", "actor_robot" },
        },
        new AtlasDef
        {
            // v090 workforce-actor 고해상 — 256px, 3x1. v076 드롭인 교체본(같은 셀 이름, IconLibrary 경로로 선택).
            fileName = "v090-workforce-actor-hires.png",
            folder = "sprites",
            cell = 256,
            columns = 3,
            names = new[] { "actor_human", "actor_ai", "actor_robot" },
        },
        new AtlasDef
        {
            // v077 celebration-emblem — 80px, 3x1. synergy/combo/achievement.
            fileName = "v077-celebration-emblem-atlas.png",
            cell = 80,
            columns = 3,
            names = new[] { "celebrate_synergy", "celebrate_combo", "celebrate_achievement" },
        },
        new AtlasDef
        {
            // v078 world-reveal-stamp — 64px, 4x1. city/world/market/founder.
            fileName = "v078-world-reveal-stamp-atlas.png",
            cell = 64,
            columns = 4,
            names = new[] { "world_city", "world_world", "world_market", "world_founder" },
        },
        new AtlasDef
        {
            // v081 office-reaction — 40px, 6x1. 오피스 반응.
            fileName = "v081-office-reaction-atlas.png",
            cell = 40,
            columns = 6,
            names = new[] { "react_codespark", "react_idea", "react_coffee", "react_alert", "react_cheer", "react_gear" },
        },
        new AtlasDef
        {
            // v091 office-objects 고해상 — 384x288 비정사각, 5x5=25칸(0-20 오브젝트, 21-24 빈칸). v054 드롭인 교체본(같은 라인업·칸 순서).
            fileName = "v091-office-objects-hires.png",
            folder = "sprites",
            cellW = 384,
            cellH = 288,
            columns = 5,
            names = new[]
            {
                "obj_desk_monitor", "obj_server_dark", "obj_cabinet_wood", "obj_server_blue", "obj_crate_brown",
                "obj_desk_monitor_b", "obj_server_slate", "obj_cabinet_mint", "obj_crate_low", "obj_crate_red",
                "obj_desk_green", "obj_whiteboard_a", "obj_whiteboard_b", "obj_printer_blue", "obj_server_amber",
                "obj_glassboard_a", "obj_printer_cyan", "obj_desk_papers", "obj_meeting_table", "obj_equipment_blue",
                "obj_glassboard_b", "obj_empty21", "obj_empty22", "obj_empty23", "obj_empty24",
            },
        },
    };

    [MenuItem("AICT/Import Icon Atlases")]
    public static void ImportAll()
    {
        EnsureFolder(DestFolder);
        var assetsRoot = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "public", "assets"));

        var imported = 0;
        foreach (var atlas in Atlases)
        {
            var folder = string.IsNullOrEmpty(atlas.folder) ? "ui" : atlas.folder;
            var src = Path.Combine(assetsRoot, folder, atlas.fileName);
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

        // 정사각이면 cell, 비정사각이면 cellW/cellH 를 쓴다.
        int cw = atlas.cellW > 0 ? atlas.cellW : atlas.cell;
        int ch = atlas.cellH > 0 ? atlas.cellH : atlas.cell;

        importer.textureType = TextureImporterType.Sprite;
        importer.spriteImportMode = SpriteImportMode.Multiple;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.mipmapEnabled = false;
        importer.npotScale = TextureImporterNPOTScale.None; // NPOT(예: 1280x960) 시 스케일 금지 — rect가 어긋나지 않게
        importer.maxTextureSize = 4096;
        importer.spritePixelsPerUnit = ch;

        // 높이는 그리드에서 결정적으로 계산한다(첫 임포트 시 tex.height가 스케일/지연으로 틀어질 수 있음). 아틀라스는 tight-packed.
        int rows = Mathf.CeilToInt(atlas.names.Length / (float)atlas.columns);
        int texHeight = rows * ch;

        var sheet = new List<SpriteMetaData>(atlas.names.Length);
        for (int i = 0; i < atlas.names.Length; i += 1)
        {
            int col = i % atlas.columns;
            int row = i / atlas.columns;
            // PNG 는 좌상단 원점이고 Unity 텍스처 rect 는 좌하단 원점이라 y 를 뒤집는다.
            sheet.Add(new SpriteMetaData
            {
                name = atlas.names[i],
                rect = new Rect(col * cw, texHeight - (row + 1) * ch, cw, ch),
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
