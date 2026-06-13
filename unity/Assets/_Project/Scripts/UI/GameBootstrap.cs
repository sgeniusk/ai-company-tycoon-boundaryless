// 게임 시작 시 데이터 카탈로그와 세로형 UI 화면을 연결하는 부트스트랩입니다.
using AICompanyTycoon.Data;
using AICompanyTycoon.Save;
using AICompanyTycoon.Systems;
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public class GameBootstrap : MonoBehaviour
    {
        public SimulationContext Context { get; private set; }
        public SaveService Save { get; private set; }
        public GameScreen Screen { get; private set; }

        DataCatalog _catalog;

        void Start()
        {
            _catalog = Resources.Load<DataCatalog>("DataCatalog");
            if (_catalog == null)
            {
                Debug.LogError("DataCatalog 리소스를 찾을 수 없습니다.");
                return;
            }

            Context = SimulationContext.Create(_catalog);
            Save = new SaveService();
            UiFactory.EnsureEventSystem();
            EnsureCamera();

            Screen = new GameScreen(Context, Save);
            Screen.Build();
            Screen.RefreshAll();
        }

        // 씬에 카메라가 없으면 더미 메인 카메라를 만든다. Screen Space - Overlay UI는 카메라 없이도 그려지지만,
        // 카메라가 하나도 없으면 Unity가 Game 뷰에 "Display 1 No cameras rendering" 안내를 띄운다. 그걸 없앤다.
        void EnsureCamera()
        {
            if (Camera.main != null)
            {
                return;
            }

            var camGo = new GameObject("MainCamera");
            camGo.tag = "MainCamera";
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = UiTheme.ScreenBg;
            cam.cullingMask = 0; // Overlay UI는 카메라 독립이라 아무것도 안 비춰도 된다(경고 제거용).
            cam.depth = -10;
        }

        void OnDestroy()
        {
            if (Screen != null)
            {
                Screen.Dispose();
            }
        }

        public void AdvanceMonth()
        {
            Screen?.HandleAdvanceMonth();
        }

        public void SaveGame()
        {
            Screen?.HandleSave();
        }

        public void LoadGame()
        {
            Screen?.HandleLoad();
        }

        public void NewGame()
        {
            if (_catalog == null)
            {
                return;
            }

            Context = SimulationContext.Create(_catalog);
            Screen?.ReplaceContext(Context);
        }
    }
}
