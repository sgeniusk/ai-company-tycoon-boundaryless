// 코지 배경 드롭인 후 Unity가 변경 PNG를 재임포트 안 하는 stale 캐시를 강제 갱신한다 (feat-023). -executeMethod ReimportBackgrounds.Run
using UnityEditor;
using UnityEngine;

public static class ReimportBackgrounds
{
    public static void Run()
    {
        string[] paths =
        {
            "Assets/_Project/Resources/Art/Background/office.png",
            "Assets/_Project/Resources/Art/Background/office_growth.png",
            "Assets/_Project/Resources/Art/Background/office_datacenter.png",
            "Assets/_Project/Resources/Art/Background/office_landmark.png",
        };
        foreach (var p in paths)
        {
            AssetDatabase.ImportAsset(p, ImportAssetOptions.ForceUpdate | ImportAssetOptions.ForceSynchronousImport);
            Debug.Log("[ReimportBackgrounds] " + p);
        }
        AssetDatabase.Refresh();
        Debug.Log("[ReimportBackgrounds] done");
    }
}
