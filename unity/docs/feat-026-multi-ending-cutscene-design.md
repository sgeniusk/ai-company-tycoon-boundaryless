# feat-026 멀티엔딩 컷씬 설계 — 런 종료 순간의 픽셀 결말 연출

런이 끝나는 순간 엔딩 버킷에 맞는 전체 모달 픽셀 컷씬을 띄워, 지금은 텍스트 결과 모달뿐인 결말에 "보는 맛"을 더한다.

## 배경 / 문제

엔딩 시스템은 헤드리스로 완비돼 있다 — `EndingService.Determine`이 세계관·도시·아키타입·지분 조합으로 24종 결말을 우선순위 매칭하고(feat-008 #3), 도감 갤러리(feat-021)로 수집까지 열람된다. 그러나 **런이 끝나는 순간 플레이어가 보는 것은 `GameScreen.ShowResultModal`의 순수 텍스트 모달**(제목 + flavor + outcome + 지분 결말 한 줄)뿐이다. 클라이맥스의 시각 연출이 비어 있다.

feat-025에서 이벤트·고용 픽셀 컷씬 인프라(`CutsceneDirector.PlayModalCo` 전체 모달 셸 + `PopulateCrisis` 붉은 위기 톤 + `BurstConfetti` + 크로마키 액터 프레임 cheer/sad/surprise)가 완성됐다. 이 인프라를 재사용해 엔딩 순간 컷씬을 가산한다.

## 데이터 사실 (설계 근거)

`../data/endings.json` 24종 조사 결과 —
- **23종이 전부 `status=success`(승리 변형)**. 세계관·도시·아키타입으로만 갈리고 priority로 위세가 다르다 (120 `frontier_demo_empire` 문샷 최상위 → 20 `standard_platform_compounder` 소박한 승리).
- **패배/재시작은 `garage_restart`("다시 차고로", status=any, priority 0) 한 종**. `won=false`면 이 폴백으로 떨어진다.

→ 버킷은 자연히 **승리 위세 단계 + 재시작 하나**로 떨어진다. 재시작 컷씬 톤은 엔딩 텍스트가 같아도 게임 상태(파산 여부)로 가른다.

## 버킷 분류 (4종)

| 버킷 | 판정 조건 | 톤·연출 (재사용 에셋) |
|---|---|---|
| **Legendary (전설)** | `won` && `ending.priority >= 100` | 골드 타이틀바 + 색종이 폭풍(44+) + 스포트라이트 + 3캐릭터 `cheer` 동시 환호 + 별 버스트 |
| **Triumph (성공)** | `won` (그 외) | 틸 타이틀바 + 색종이(32) + `cheer` 1~2명 |
| **Restart (차고로)** | `!won` && 생존(파산 아님) | 무채색 타이틀 + 색종이 없음 + `sad` 포즈 + "다시 해보자" 희망 비트 |
| **Collapse (몰락)** | `!won` && 파산(`cash <= 0`) | 붉은 위기 타이틀바(Crisis 스타일 재사용) + `surprise`→`sad` + 드라마틱, 색종이 없음 |

핵심 원칙 — **새 엔딩 데이터 0종, 새 스프라이트 0장.** Restart/Collapse는 동일 `garage_restart` 텍스트를 쓰되 컷씬 톤만 파산 신호로 갈린다.

`priority >= 100` 경계는 현 데이터에서 상위 3종(frontier_demo_empire 120 / agi_safety_accord 110 / privacy_trust_bastion 100)을 전설로 잡는다. 폴백 엔딩(garage_restart, priority 0)이 `won=true`로 들어오는 경우는 EndingService 구조상 발생하지 않으나, 판정은 `won` 우선이라 안전하다.

## 아키텍처 (코어 무변경, 가산 연출 레이어)

### 1. EndingCutsceneJudge — 헤드리스 버킷 판정 (Claude, 재미/로직 레인)
순수 함수 + EditMode TDD. `EventResultJudge`·feat-025 `IsCrisis` 판정과 같은 패턴.

```csharp
// 엔딩 결말을 컷씬 톤 버킷으로 판정한다. 코어 무의존 순수 함수.
namespace AICompanyTycoon.Systems
{
    public enum EndingBucket { Triumph, Legendary, Restart, Collapse }

    public static class EndingCutsceneJudge
    {
        // ending은 null 가능(폴백 미존재 데이터). won과 파산 신호로 4버킷 판정.
        public static EndingBucket Judge(EndingDef ending, GameModel model, bool won)
        {
            if (won)
                return (ending != null && ending.priority >= 100)
                    ? EndingBucket.Legendary : EndingBucket.Triumph;
            double cash = model != null ? model.Get(ResourceId.Cash) : 0;
            return cash <= 0 ? EndingBucket.Collapse : EndingBucket.Restart;
        }
    }
}
```

테스트 — 4버킷 각 1+ 케이스(전설 경계 priority 100/99, 승리 폴백 ending=null, 파산 cash≤0 vs 생존). 150 → 약 154.

### 2. CutsceneDirector — 엔딩 모달 진입점 (Claude, 연출 코드)
기존 `TryModal`/`PlayModalCo`/`PopulateCrisis`/`BurstConfetti`를 재사용한다.

- `enum CutsceneKind`에 `Ending` 추가 (현 `{ Launch, StageUp, Ipo, FirstHire, SpecialHire, Crisis }`).
- static 진입점 — `public static void PlayEnding(EndingBucket bucket, string title) => _instance?.TryModalEnding(bucket, title);`
  - payload 문자열로 엔딩 타이틀을 넘겨 컷씬 타이틀바에 표시(예 "🏆 프런티어 데모 제국"). bucket은 별도 필드/오버로드로 전달.
- `PopulateEnding(stage, bucket, motions)` — bucket별 분기로 액터·색종이·스포트라이트·플래시 구성. Collapse는 `PopulateCrisis`의 붉은 톤 경로를 공유, Legendary는 `BurstConfetti` 밀도 최대 + 스포트라이트.
- 타이틀바 색 — `PlayModalCo`의 `kind == Crisis ? red : teal` 분기를 `Ending + Collapse` / `Ending + Legendary(gold)` / `Ending(teal)`로 확장.

구현 메모 — bucket을 PlayModalCo에 전달해야 하므로, 엔딩은 `PlayModalCo(kind, payload)` 대신 bucket을 담는 작은 오버로드(또는 인스턴스 필드 `_pendingEndingBucket`)를 둔다. Launch/Hire 경로는 불변.

### 3. GameScreen.ShowResultModal — 트리거 배선
`_resultModal.SetActive(true)` **직전에** 컷씬을 띄운다. 기존 텍스트·도감 기록·지분 결말 로직은 전부 그대로 둔다 (순수 가산).

```csharp
// 멀티 엔딩 (feat-008 #3) ... 기존 ending 판정 블록 다음, _resultModal.SetActive 직전:
var bucket = EndingCutsceneJudge.Judge(ending, _context.Model, won);
CutsceneDirector.PlayEnding(bucket, ending != null ? ending.title : (won ? "🏆 축하합니다!" : "💸 게임 오버"));
_resultModal.SetActive(true);
PopInCard(_resultModal, "ResultCard");
```

컷씬은 스크림(입력 차단) + 탭 스킵 + 자동 닫힘(feat-025 셸 기본)으로 동작하고, 닫히면 뒤에 이미 떠 있던 결과 모달이 드러난다. 모달이 컷씬 뒤에서 먼저 SetActive돼도 컷씬 Overlay(sortingOrder 230)가 위라 순서 어긋남 없음.

## 플로우

```
런 종료 → ShowResultModal
  → EndingService.Determine (기존, 24종 매칭)
  → EndingCutsceneJudge.Judge → 버킷
  → CutsceneDirector.PlayEnding(버킷, 타이틀)   ← 신규 전체화면 컷씬(클라이맥스)
  → _resultModal.SetActive (기존 텍스트: 제목·flavor·"새 결말 도감 기록"·지분결말)
  → 탭/자동으로 컷씬 닫힘 → 결과 모달 노출
```

## 스코프 경계 / YAGNI

- 엔딩 24종 개별 컷씬 아님 — 4버킷으로 묶는다.
- 새 엔딩 데이터·새 스프라이트 0. 기존 cheer/sad/surprise 프레임 + 코드 모션·색종이·스포트라이트로만 구성.
- 도감/지분 결말/엔딩 텍스트는 기존 모달이 그대로 담당 — 컷씬은 연출만.
- 후속(이 스펙 밖) — 원하면 버킷별 전용 크로마키 프레임 Codex 양산으로 교체(feat-025 2단계 패턴). 지금은 골격.

## 검증

- EditMode — `EndingCutsceneJudgeTests` 버킷 4종 판정 + 경계(priority 100/99, cash 0/양수). `./init.sh` 150 → 약 154.
- PlayMode 캡처 — `ScreenshotCaptureTests`에 `Capture_Ending_*` 4종 추가, 버킷별 컷씬 육안 (`26-ending-legendary` ~ `29-ending-collapse`). `-nographics` 빼고 macOS Metal 오프스크린.
- 단일 라이선스 — 검증 전 `ps`로 다른 Unity 미실행 확인.

## 분업

- Claude — EndingCutsceneJudge(로직·TDD), CutsceneDirector PopulateEnding(연출 코드), GameScreen 배선, 검증·정본 반영.
- Codex — (이번 스코프엔 에셋 양산 없음. 후속에서 버킷별 전용 프레임 양산 시 핸드오프.)
