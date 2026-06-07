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

        AssetDatabase.SaveAssets();
        Debug.Log("[PlatformSetup] 모바일 PlayerSettings 적용 — " + BundleId);
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
