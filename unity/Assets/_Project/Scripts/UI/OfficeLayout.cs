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

        // 한 직원+책상이 차지하는 가로 footprint(정규화 폭, 화면폭 대비). 셀 폭이 이보다 크면 겹치지 않는다.
        public const float FootprintWidthNorm = 0.23f;

        // 격자 슬롯 — 겹치지 않는 셀 하나의 위치·크기 (feat-031 ⑤). 앞줄(Front)은 말풍선·열일 연출 대상.
        public struct Slot
        {
            public float XNorm;   // 가로 정규화 위치(0~1, 셀 중앙)
            public float FootY;   // 발높이(앵커 y) — 클수록 뒤(위)
            public float Scale;   // 원근+맞춤 스케일
            public bool Front;    // 맨 앞줄 여부
        }

        // 원근 격자 배치 — count명을 겹치지 않는 셀로 나눠 놓고, 인원이 늘면 셀이 작아져(auto-frame) 전부 화면에 담긴다.
        // 열 분배는 RowPlan(앞쪽가중), 셀 폭은 최다열 기준 균등 → 셀 폭 = U/최다열. 스케일은 셀에 맞춰 축소해 겹침 0.
        // 각 줄은 가운데 정렬해 뒤로 갈수록 좁고 작게 물러난다. jitter 없음(겹침 유발 제거).
        public static Slot[] GridPlan(int count)
        {
            if (count <= 0) return new Slot[0];

            const float margin = 0.06f;
            const float frontFootY = 130f, backFootY = 420f;
            const float perspMin = 0.72f;   // 맨 뒷줄 원근 축소 배수
            const float gap = 0.86f;        // 책상이 셀에서 차지하는 비율(나머지는 통로)

            var plan = RowPlan(count);
            int rows = plan.Length;
            int maxCols = 1;
            foreach (var c in plan) if (c > maxCols) maxCols = c;

            float usable = 1f - 2f * margin;
            float cellW = usable / maxCols;
            // 셀에 맞춰 스케일 축소 — 열이 많아질수록 작아진다(auto-frame). 상한 1.0, 하한 0.4.
            float baseScale = cellW / FootprintWidthNorm * gap;
            if (baseScale > 1f) baseScale = 1f;
            if (baseScale < 0.4f) baseScale = 0.4f;

            var slots = new Slot[count];
            int idx = 0;
            for (int r = 0; r < rows; r++)
            {
                float t = rows > 1 ? (float)r / (rows - 1) : 0f;
                float footY = frontFootY + (backFootY - frontFootY) * t;
                float rowScale = baseScale * (1f - (1f - perspMin) * t);
                int c = plan[r];
                for (int i = 0; i < c; i++)
                {
                    float xnorm = 0.5f + (i - (c - 1) / 2f) * cellW; // 줄 가운데 정렬
                    slots[idx++] = new Slot { XNorm = xnorm, FootY = footY, Scale = rowScale, Front = r == 0 };
                }
            }
            return slots;
        }
    }
}
