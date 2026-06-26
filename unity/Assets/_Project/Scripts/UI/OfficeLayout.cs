// 오피스 깊이 배치 순수 계산 — 밴드(원근 열)별 발높이·스케일, 인원 분배. UnityEngine.UI 비의존(헤드리스 테스트).
namespace AICompanyTycoon.UI
{
    public static class OfficeLayout
    {
        // 깊이 밴드 — index 0 = 앞(아래·크게), 클수록 뒤(위·작게). footY 증가·scale 감소 단조.
        public static (float footY, float scale) Band(int bandIndex)
        {
            switch (bandIndex)
            {
                case 0: return (150f, 1.00f);
                case 1: return (232f, 0.84f);
                default: return (314f, 0.70f);
            }
        }

        // 인원을 밴드(원근 열)별로 분배 — 밴드 수는 인원으로 정하고 앞쪽가중 균등 분배. count>=3이면 깊이(2밴드+)가 나온다.
        // 1→[1] 2→[2] 3→[2,1] 4→[2,2] 5→[2,2,1] 6→[2,2,2] 7→[3,2,2] 8→[3,3,2] 9→[3,3,3] 10→[4,3,3].
        public static int[] RowPlan(int count)
        {
            if (count <= 0) return new int[0];
            int rowCount = count <= 2 ? 1 : count <= 4 ? 2 : 3;
            var plan = new int[rowCount];
            int baseN = count / rowCount, extra = count % rowCount;
            for (int i = 0; i < rowCount; i++)
                plan[i] = baseN + (i < extra ? 1 : 0); // 앞 밴드(낮은 index)가 나머지를 먼저 가져가 앞쪽가중
            return plan;
        }
    }
}
