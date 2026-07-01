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

        // 캐릭터가 바라보는 방향 (feat-032) — 정면(정면 액터+책상) / 좌향·우향(측면 워크스테이션) / 후면(뒤에서 본, 깊은 줄).
        public enum Orientation { Front, SideLeft, SideRight, Back }

        // 격자 슬롯 — 겹치지 않는 셀 하나의 위치·크기 (feat-031 ⑤). 앞줄(Front)은 말풍선·열일 연출 대상.
        public struct Slot
        {
            public float XNorm;   // 가로 정규화 위치(0~1, 셀 중앙)
            public float FootY;   // 발높이(앵커 y) — 클수록 뒤(위)
            public float Scale;   // 원근+맞춤 스케일
            public bool Front;    // 맨 앞줄 여부
            public Orientation Orient; // 바라보는 방향 (feat-032 — 다 같이 정면 응시 탈피)
        }

        // 손으로 짠 사무실 평면 배치 (feat-031 ⑤ 재작업) — 기계적 대칭 격자 대신 비대칭 클러스터(pod)·통로·깊이 변주.
        // 성장 순서대로 앞→뒤로 authored. 같은 깊이 티어 안에서만 겹치지 않게 배치(깊이 겹침은 원근으로 자연스럽다).
        // count명이면 앞에서 count개를 보여준다(부분집합도 자연스럽게 보이도록 순서 설계).
        static readonly Slot[] AuthoredFloor =
        {
            // 앞 티어 — 사장은 정면(주인공), 옆은 좌향. 방향 섞어 '다 같이 정면' 탈피.
            new Slot { XNorm = 0.34f, FootY = 150f, Scale = 0.98f, Front = true,  Orient = Orientation.Front },
            new Slot { XNorm = 0.62f, FootY = 162f, Scale = 0.94f, Front = true,  Orient = Orientation.SideLeft },
            // 중간 티어 — 3개, 좌·중·우 통로 두고 비대칭. 좌/우향 마주보게.
            new Slot { XNorm = 0.17f, FootY = 252f, Scale = 0.80f, Front = false, Orient = Orientation.SideRight },
            new Slot { XNorm = 0.46f, FootY = 264f, Scale = 0.77f, Front = false, Orient = Orientation.Front },
            new Slot { XNorm = 0.76f, FootY = 256f, Scale = 0.79f, Front = false, Orient = Orientation.SideLeft },
            // 뒤 티어 — 3개, 앞 티어와 x 어긋나게(브릭). 등 보이며 먼 벽을 향해 일하는 후면 위주 + 측면 하나.
            new Slot { XNorm = 0.29f, FootY = 356f, Scale = 0.64f, Front = false, Orient = Orientation.Back },
            new Slot { XNorm = 0.58f, FootY = 366f, Scale = 0.62f, Front = false, Orient = Orientation.SideLeft },
            new Slot { XNorm = 0.83f, FootY = 352f, Scale = 0.63f, Front = false, Orient = Orientation.Back },
            // 깊은 티어 — 2개, 맨 뒤라 후면.
            new Slot { XNorm = 0.42f, FootY = 432f, Scale = 0.55f, Front = false, Orient = Orientation.Back },
            new Slot { XNorm = 0.68f, FootY = 426f, Scale = 0.55f, Front = false, Orient = Orientation.Back },
        };

        // 손으로 짠 pod 평면에서 앞 count명을 반환 (feat-031 ⑤). 인위적 격자 탈피 — 비대칭 클러스터·통로·깊이.
        public static Slot[] PodPlan(int count)
        {
            if (count <= 0) return new Slot[0];
            if (count > AuthoredFloor.Length) count = AuthoredFloor.Length;
            var slots = new Slot[count];
            for (int i = 0; i < count; i++) slots[i] = AuthoredFloor[i];
            return slots;
        }
    }
}
