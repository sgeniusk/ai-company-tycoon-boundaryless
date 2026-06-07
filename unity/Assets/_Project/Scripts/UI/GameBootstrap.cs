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

            Screen = new GameScreen(Context, Save);
            Screen.Build();
            Screen.RefreshAll();
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
