// Unity 하네스 부트스트랩 — 패키지 설치와 모바일 프로젝트 설정을 배치모드/메뉴에서 수행한다.
using System.Threading;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

public static class HarnessSetup
{
    // VS(Vertical Slice)에 필요한 최소 패키지. 폴리시(Localization/Cinemachine/DOTween)는 P5에서 추가한다.
    static readonly string[] PackagesToAdd =
    {
        "com.unity.render-pipelines.universal", // URP + 2D Renderer
        "com.unity.2d.sprite",                  // 스프라이트 에디터
        "com.unity.ugui",                       // uGUI + TextMeshPro
        "com.unity.inputsystem",                // 터치 입력
        "com.unity.test-framework",             // NUnit / 테스트 러너 (init.sh 검증)
    };

    [MenuItem("Harness/Setup (Packages + Mobile Settings)")]
    public static void Setup()
    {
        AddPackages();
        ConfigureMobile();
    }

    // 배치모드 -executeMethod HarnessSetup.AddPackages 로 호출한다.
    public static void AddPackages()
    {
        Debug.Log("[Harness] Adding packages: " + string.Join(", ", PackagesToAdd));
        AddAndRemoveRequest req = Client.AddAndRemove(packagesToAdd: PackagesToAdd);
        while (!req.IsCompleted) Thread.Sleep(100);
        if (req.Status == StatusCode.Success)
            Debug.Log("[Harness] Packages resolved OK.");
        else
            Debug.LogError("[Harness] Package add FAILED: " + (req.Error != null ? req.Error.message : "unknown"));
    }

    // 모바일 세로 고정 + 식별 정보. URP 파이프라인 에셋 생성/할당은 시각 검증이 필요해 별도 단계로 둔다.
    public static void ConfigureMobile()
    {
        PlayerSettings.productName = "AI Company Tycoon";
        PlayerSettings.companyName = "Boundaryless";
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        PlayerSettings.allowedAutorotateToPortrait = true;
        PlayerSettings.allowedAutorotateToLandscapeLeft = false;
        PlayerSettings.allowedAutorotateToLandscapeRight = false;
        PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
        AssetDatabase.SaveAssets();
        Debug.Log("[Harness] Mobile settings set (portrait, names, Android minSdk 26).");
    }
}
