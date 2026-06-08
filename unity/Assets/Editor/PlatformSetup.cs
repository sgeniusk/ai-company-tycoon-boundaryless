// Android/iOS 빌드용 PlayerSettings(번들 ID·제품명·방향·백엔드)와 빌드 진입점을 모은 에디터 도구입니다.
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class PlatformSetup
{
    const string BundleId = "com.gomgomee.aicompanytycoon";
    const string Product = "AI Company Tycoon";
    const string Company = "Gomgomee";
    const string GameScene = "Assets/_Project/Scenes/Game.unity";
    const string IconPath = "Assets/_Project/Art/Branding/app_icon.png";
    const string SplashPath = "Assets/_Project/Art/Branding/splash.png";

    [MenuItem("AICT/Platform/Apply Mobile Settings")]
    public static void ApplyMobileSettings()
    {
        PlayerSettings.companyName = Company;
        PlayerSettings.productName = Product;
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, BundleId);
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, BundleId);

        // 세로 고정
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        PlayerSettings.allowedAutorotateToPortrait = true;
        PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
        PlayerSettings.allowedAutorotateToLandscapeLeft = false;
        PlayerSettings.allowedAutorotateToLandscapeRight = false;

        // Android — IL2CPP + ARM64(스토어 64bit 요건), 최소 SDK 26
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;

        ApplyBranding();

        AssetDatabase.SaveAssets();
        Debug.Log("[PlatformSetup] 모바일 PlayerSettings 적용 — " + BundleId);
    }

    // 앱 아이콘/스플래시 적용 (임시 — office 배경 활용. 최종 픽셀아트는 추후 세션에 교체).
    static void ApplyBranding()
    {
        var icon = AssetDatabase.LoadAssetAtPath<Texture2D>(IconPath);
        if (icon != null)
        {
            var icons = new[] { icon };
            PlayerSettings.SetIcons(NamedBuildTarget.Android, icons, IconKind.Application);
            PlayerSettings.SetIcons(NamedBuildTarget.iOS, icons, IconKind.Application);
        }
        else
        {
            Debug.LogWarning("[PlatformSetup] 앱 아이콘 없음 — " + IconPath);
        }

        // 스플래시 배경은 Sprite여야 하므로 임포트 타입을 보장한 뒤 배선한다.
        var splashImporter = AssetImporter.GetAtPath(SplashPath) as TextureImporter;
        if (splashImporter != null && splashImporter.textureType != TextureImporterType.Sprite)
        {
            splashImporter.textureType = TextureImporterType.Sprite;
            splashImporter.SaveAndReimport();
        }

        var splash = AssetDatabase.LoadAssetAtPath<Sprite>(SplashPath);
        if (splash != null)
        {
            PlayerSettings.SplashScreen.show = true;
            PlayerSettings.SplashScreen.background = splash;
            PlayerSettings.SplashScreen.backgroundColor = new Color(0.906f, 0.863f, 0.757f, 1f);
        }
    }

    [MenuItem("AICT/Platform/Build Android (APK)")]
    public static void BuildAndroid()
    {
        ApplyMobileSettings();

        if (!File.Exists(GameScene))
        {
            SceneBuilder.CreateGameScene();
        }

        var outDir = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Builds", "Android"));
        Directory.CreateDirectory(outDir);

        var options = new BuildPlayerOptions
        {
            scenes = new[] { GameScene },
            locationPathName = Path.Combine(outDir, "AICompanyTycoon.apk"),
            target = BuildTarget.Android,
            targetGroup = BuildTargetGroup.Android,
            options = BuildOptions.None,
        };

        var report = BuildPipeline.BuildPlayer(options);
        var summary = report.summary;
        Debug.Log("[PlatformSetup] Android 빌드 — " + summary.result + " / " + summary.totalSize + " bytes / " + summary.outputPath);
        if (summary.result != BuildResult.Succeeded)
        {
            throw new System.Exception("Android 빌드 실패 — " + summary.result);
        }
    }
}
