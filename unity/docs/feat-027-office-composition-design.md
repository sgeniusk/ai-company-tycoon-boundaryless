# feat-027 오피스 구성 재작업 설계 — 빈 바닥 채우기·깊이 배치·자연 군집

게임플레이 오피스가 "비어 보인다"는 사용자 피드백을 해소한다. 소품·직원을 바닥 구석/한 줄이 아니라 바닥 전체에 깊이감 있게 분산해 화면을 채우고, 그 위에 월 진행 연출(feat-028)이 얹힐 토대를 만든다.

## 배경 / 문제 (코드로 확인)

사용자 피드백 — "너무 화면이 비어 보인다 / 사물이 밑에만 있어 이상하다 / 셋이 나란히 일하는 것도 이상하다." 캡처 `01-main.png`·`01d-office-rich.png`로 확인 — 벽(상단)과 책상(하단) 사이 가장 넓은 **중간 바닥이 통째로 비어 있다.**

원인은 배치 코드다.
- `GameScreen.BuildOfficeScene` — 오피스 밴드는 화면 `0.20~0.74`(중앙 54%). 그 안에서 직원은 바닥(footY 192/292)에만 앉는다.
- `OfficeProps.Populate` — 모든 소품이 바닥 가장자리(FootY ~6-8, XNorm 0.045·0.115·0.895·0.94·0.985)에만. **중간 바닥은 PropSpec이 아예 없다.**
- `RefreshOfficeScene` — `front = min(count, 4)`라 직원 4명 이하면 전부 앞줄 한 줄. 뒷줄은 5명째부터. "거의 평평한 2열"이라 둘이어도 평평. → "셋이 나란히" 불만.

즉 애니메이션 문제가 아니라 **구성/배치 문제**다. 화면을 먼저 채우지 않으면 어떤 연출도 허공에서 논다.

## 분해 (이 스펙의 범위)

전체 "보는 맛" 요청은 둘로 나눈다.
- **feat-027 (이 문서, 토대)** — 오피스 구성 재작업. 깊이 배치·자연 군집·신규 가구. 정적 구성.
- **feat-028 (다음)** — 월 진행 타임랩스 + 성과 분위 반응 + 컷씬 스테이지 다양화. 채워진 오피스 위 동적 연출.

## 해법 — 3갈래

### ① 깊이 존 바닥 레이아웃 (`OfficeLayout` 순수 헬퍼)
오피스 바닥을 앞/중/뒤 **깊이 밴드**로 나눠 각 밴드에 footY·스케일을 준다. 소품·직원이 밴드 전체에 분산돼 중간 바닥이 채워지고 원근 깊이가 생긴다.

```csharp
// 오피스 깊이 배치 순수 계산 — 밴드(원근 열)별 발높이·스케일, 인원 분배. UnityEngine.UI 비의존(헤드리스 테스트).
namespace AICompanyTycoon.UI
{
    public static class OfficeLayout
    {
        // 깊이 밴드 — index 0 = 앞(아래·크게), 클수록 뒤(위·작게). footY 증가·scale 감소 단조.
        // 앞 footY 150 / 중 232 / 뒤 314, scale 1.0 / 0.84 / 0.70.
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
```

판정 — 밴드 footY는 index에 단조 증가·scale은 단조 감소(원근), RowPlan 합 == count, 각 밴드 ≤ 4(앞 밴드는 count=10일 때만 4), count≥3이면 밴드 2개 이상·count≥5면 3밴드(깊이 보장), 앞쪽가중(앞 밴드 ≥ 뒷 밴드). EditMode TDD.

### ② 자연스러운 직원 군집 (`RefreshOfficeScene`/`PlaceActorRow` 재작업)
현 front=min(count,4) 한 줄 로직을 `OfficeLayout.RowPlan`/`Band` 기반 다열 배치로 교체. 뒷줄(높은 index)을 먼저 그려(뒤) 앞줄이 겹쳐 깊이를 준다. X는 밴드 안에서 균등 배치하되 시드 기반으로 **±소량 흩뜨려**(deterministic jitter) 일렬 느낌을 깬다. 3명이면 [2,1] — 앞 2 + 뒤 1 = 작은 삼각 무리.

기존 컴포넌트(`StaffBob`/`WorkLoop`/`ActorAnim`/`CrunchFlameFx`)는 그대로 부착. busy(열일 불꽃)는 앞 밴드 한 명에만.

### ③ 신규 중간 바닥 가구 (Codex 크로마키 + `OfficeProps` 재작업)
`OfficeProps`의 PropSpec에 **깊이 존**을 추가(밴드별 footY·scale 적용)하고, 빈 중간 바닥을 메울 신규 가구를 배치한다.

신규 스프라이트(Codex 핸드오프, feat-024 크로마키 파이프라인) —
- `prop_rug` — 중앙 바닥 러그/카펫(넓고 낮게, 바닥을 잡아주는 앵커). 가장 뒤에 그려 직원·가구 아래 깔림.
- `prop_meeting_table` — 회의 테이블+의자(중간 밴드).
- `prop_partition` — 낮은 칸막이/파티션(중간 밴드 구분).
- `prop_plant_big` — 키 큰 화분(중간 밴드 악센트).
- `prop_shelf_low` — 낮은 수납장(중간 밴드 필러).

배치 — 러그는 중앙 바닥(z-back), 회의 테이블·파티션·키큰화분·수납장은 중간 밴드에 좌우로 분산, 기존 소품은 앞 밴드 가장자리 유지. 신규 가구는 성급 무관 공통 + 성급별 1~2종 교체 가능.

## 아키텍처 / 파일

- Create `Assets/_Project/Scripts/UI/OfficeLayout.cs` — 깊이 밴드·인원 분배 순수 계산.
- Create `Assets/_Project/Tests/EditMode/OfficeLayoutTests.cs` — Band 단조성 + RowPlan 분배 검증.
- Modify `Assets/_Project/Scripts/UI/OfficeProps.cs` — 깊이 존 PropSpec(footY/scale) + 신규 가구, 중간 바닥 배치. 러그 z-back 우선 그리기.
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — `RefreshOfficeScene`/`PlaceActorRow`를 `OfficeLayout` 다열 군집 + X jitter로 재작업.
- Create `docs/codex-handoff/feat027-office-furniture.md` — 신규 가구 스프라이트 5종 크로마키 핸드오프.

**시퀀싱** — Claude가 기존 소품으로 깊이 배치 골격을 먼저 세워 동작·검증(신규 가구 specs는 `IconLibrary.Get` null이면 조용히 스킵 — 기존 패턴). Codex가 신규 가구 양산·반입하면 드롭인으로 채워진다.

코어·세이브·게임 로직 무변경. 순수 시각 구성.

## 분담

- Claude — OfficeLayout(순수 로직·TDD), OfficeProps 깊이 존 재작업, GameScreen 군집 배치, 통합·검증·정본 반영.
- Codex — 신규 가구 스프라이트 5종 크로마키 양산(핸드오프 문서대로, .cs 무수정).

## 검증

- EditMode — `OfficeLayoutTests`(Band footY 단조 증가·scale 단조 감소, RowPlan 합·밴드수·깊이 보장). 150 → 약 155.
- PlayMode 캡처 — `01-main`(차고 3명)·`01d-office-rich`(다수)·`01f-office-few` 재캡처. **채워진 중간 바닥·원근 깊이 군집·신규 가구** 육안 before/after 대조. 신규 가구 반입 전(골격)·후(완성) 2회.
- 단일 라이선스 — 검증 전 `ps`로 다른 Unity 미실행 확인.

## 스코프 밖 (feat-028)

- 월 진행 타임랩스(낮→밤 스윕 + Day 카운터 + work 포즈).
- 성과 분위 반응(MonthMoodJudge 4분위 → 직원별 다양한 포즈·모션·이모트).
- 모션 라이브러리(FanCheer 독점 깨기 — FistPump/Wiggle/Slump).
- 컷씬 모달 스테이지(28~31 같은) 다양화.
- 월간 브리핑 카드.
