# feat-030 디자인 주도 메인 화면 재설계 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL — superpowers:subagent-driven-development(권장) 또는 superpowers:executing-plans로 task 단위 실행. 스텝은 체크박스(`- [ ]`)로 추적.

**Goal** — 클로드 디자인 최종안(`docs/design/FINAL.md`)을 Unity 메인 화면에 옮긴다. 다크그린 HUD·큰 전광판을 걷어내고 오피스를 주인공으로, 슬림 HUD·자원 색칩·추월 트렌드·스마트 센터버튼·보텀시트·4박자 도파민으로 재설계.

**Architecture** — 점진적 재스킨/재배치. `Scripts/UI/*`(특히 `GameScreen.cs` 3756줄·`UiTheme.cs`)만 변경, 코어/세이브/시뮬 무변경. 4박자 연출(타임랩스 feat-028·브리핑 feat-029·컷씬 feat-026·플로팅 feat-010/019)은 이미 존재 → 재시퀀스·재스킨. 블록마다 GameScreen 빌드 메서드 1~2개를 별도 빌더로 타깃 추출해 파일을 줄인다.

**Tech Stack** — Unity 6(6000.4.10f1), C#, UnityEngine.UI(Legacy Text/Image), 헤드리스 코어 + PlayMode 캡처.

**검증 정책(사용자 결정)** — 코딩 먼저, 검증은 다른 Unity(sam·titan) 종료로 라이선스 풀린 뒤 `./init.sh`(EditMode 베이스 177) + PlayMode 캡처 일괄. **블록은 검증 전 done 처리 안 함** — 코드 후 "검증 대기"로 표시. 각 블록은 자체 커밋하되 push는 사용자 확인 후.

**실행 원칙** — B2~B6의 각 task는 **대상 빌드 메서드를 먼저 Read**한 뒤 정확 diff를 작성한다(미독 코드 추정 금지). 아래는 task 경계·대상·변환·검증을 확정한다.

---

## 파일 구조 (변경 맵)
- `Scripts/UI/UiTheme.cs` — 컬러 토큰·타이포 위계 갱신 (B1)
- `Scripts/UI/GameScreen.cs` — HUD/도크/오피스/시트/시퀀스 재배치 (B2~B6), 빌드 메서드 추출로 축소
- 신규(추출) `Scripts/UI/TopHud.cs` — 슬림 HUD+색칩+트렌드바 빌더 (B2)
- 신규(필요 시) `Scripts/UI/BottomSheet.cs` — 보텀시트 컨테이너 (B5)
- `Scripts/Tests/EditMode/*` — 헤드리스 파생 로직 테스트(트렌드 텍스트·스마트버튼 상태) (B2/B4)
- `Tests/PlayMode/ScreenshotCaptureTests.cs` — 캡처 갱신 (B6)

---

## Block 1 — 컬러/타이포 토큰 (`UiTheme`)

**Files** — Modify `Assets/_Project/Scripts/UI/UiTheme.cs`

목표 — 다크그린 HUD 토큰을 폐기 의미로 재정의하고, 자원 고정색·강조색 1개 토큰을 추가한다. 기존 상수 **이름은 보존**(참조처 다수)하되 값만 최종안 팔레트로 매핑 → 컴파일·EditMode 회귀 0.

- [ ] **Step 1: 자원/강조 토큰 추가** — `UiTheme` 클래스에 신규 상수 블록 추가.

```csharp
// feat-030 최종안 팔레트 — 크림 베이스 + 자원 고정색. 한 화면 강조색은 하나(=센터버튼).
public static readonly Color Cream      = Hex("f5ecdd");
public static readonly Color CreamPanel = Hex("fbf5ea", 0.96f);
public static readonly Color Ink        = Hex("2c2620");
public static readonly Color InkSoft    = Hex("6b6155");
public static readonly Color Line       = Hex("e2d4bc");
public static readonly Color ResCash   = Hex("ee6c3d"); // 현금·CTA(강조색)
public static readonly Color ResCashDk = Hex("d9531f");
public static readonly Color ResUser   = Hex("2fa877"); // 이용자
public static readonly Color ResCap    = Hex("7a66d6"); // 연산력
public static readonly Color RewardGold= Hex("e2a02e"); // 보상·랭킹
```

- [ ] **Step 2: 기존 톤 상수를 최종안으로 재매핑** — 다크그린 헤더/전광판/도크/칩 색을 크림·잉크·자원색으로 값만 교체(이름 유지). 예 — `HeaderBg`→크림, `ScoreboardBg`→반투명 잉크(슬림 트렌드바용), `Button`→`ResCash` 계열, `DockBg`→크림. 각 교체는 한 줄 값 변경.

```csharp
// 예시 (실제 교체 시 각 줄 값만 수정, 이름 보존)
public static readonly Color HeaderBg = Hex("f5ecdd", 0.0f);     // 다크그린 폐기 → 투명/크림
public static readonly Color DockBg   = Hex("f5ecdd", 0.0f);     // 도크 그린 폐기
public static readonly Color Button   = Hex("ee6c3d");           // CTA 코랄
public static readonly Color ScoreboardBg = Hex("2c2620", 0.86f);// 슬림 트렌드바 잉크
```

- [ ] **Step 3: 타이포 위계 주석/상수 확인** — `FontCaption~FontDisplay`는 유지(최소 26 규칙). 큰 숫자 임팩트용 별칭 주석만 추가(폰트 패밀리는 Unity 폰트 에셋 의존이라 B-후속, 여기선 위계 상수 유지).

- [ ] **Step 4: 컴파일 확인(라이선스 풀린 뒤)** — `./init.sh` EditMode 177 회귀 0 기대(색 값만 변경). 검증 대기로 표시.

- [ ] **Step 5: 커밋** — `git add UiTheme.cs && git commit -m "feat-030 #1: 최종안 컬러/타이포 토큰 — 다크그린 폐기·자원 고정색·강조색 1개"`

---

## Block 2 — HUD 다이어트 (슬림 HUD + 색칩 + 트렌드바)

**Files** — Read 후 Modify `GameScreen.cs`(`BuildTopBar`·`BuildResourceHud`·`BuildScoreboard`·`UpdateTopBar`·`UpdateResourceHud`·`RefreshScoreboard`), Create `Scripts/UI/TopHud.cs`, Test `Tests/EditMode/TopHudTests.cs`

- [ ] **Step 1: 대상 메서드 Read** — `BuildTopBar`/`BuildResourceHud`/`BuildScoreboard`와 갱신 짝을 읽어 현 RectTransform 레이아웃·참조 필드(`_scoreRank`·`_scoreMarquee` 등) 파악.
- [ ] **Step 2(TDD): 추월 트렌드 텍스트 파생 헤드리스 테스트** — 순위·이번달 델타·추월까지 계단 수를 한 줄 문자열로 만드는 순수 함수 `TopHud.BuildTrendLine(rank, monthlyDelta, stepsToOvertake)`의 실패 테스트 작성. 예 입력(935, +123, 2) → `"#935  ▲ 추월 중 · 이번 달 +123 · 추월까지 2계단"`.
- [ ] **Step 3: 실패 확인(검증 대기)** — `./init.sh` 라이선스 후. 기대 — 컴파일 실패(함수 없음).
- [ ] **Step 4: `TopHud` 빌더 구현** — 슬림 1줄 HUD(월차·성급·꾸미기) + 자원 색칩 3개(아이콘·라벨·값·▲델타, 색=`ResCash/ResUser/ResCap`) + 슬림 트렌드바(`BuildTrendLine`)를 빌드/갱신하는 정적·인스턴스 메서드. `BuildScoreboard`의 큰 패널·Marquee는 제거하거나 트렌드바로 축소.
- [ ] **Step 5: GameScreen 배선** — `Build()`의 `BuildTopBar`+`BuildResourceHud`+`BuildScoreboard` 3호출을 `TopHud` 1빌더로 교체, `RefreshAll()`의 갱신 3호출을 `TopHud` 갱신으로 교체. 제거된 필드 정리.
- [ ] **Step 6: 검증(대기)** — EditMode(TopHudTests 통과 + 177 회귀 0) + PlayMode 캡처 `01-main`(슬림 HUD·색칩·트렌드바 육안).
- [ ] **Step 7: 커밋** — `feat-030 #2: HUD 다이어트 — 슬림 HUD+자원 색칩+추월 트렌드바, 큰 전광판 제거`

---

## Block 3 — 풀블리드 오피스 + 떠오르는 숫자 무대

**Files** — Read 후 Modify `GameScreen.cs`(`BuildStageSpacer`·`BuildOfficeScene`·`BuildOfficeBackground`·`ShowMonthlyDopamine`의 `FloatingText.Spawn` 좌표), 관련 `OfficeProps.cs`(3레이어)

- [ ] **Step 1: Read** — 오피스 스테이지/스페이서 배치와 `_reactionLayer`(플로팅 부모) 좌표계 파악.
- [ ] **Step 2: 오피스 영역 확장** — HUD 슬림화로 확보한 세로 공간을 오피스 스테이지에 양보(스페이서/앵커 조정). 오피스가 화면 대부분 차지.
- [ ] **Step 3: 떠오르는 숫자 무대 재배치** — `FloatingText.Spawn` 좌표를 오피스 상단 전경 여백으로 이동(직원 안 가림). 추월 토스트 위치 정리.
- [ ] **Step 4: 오피스 3레이어 합류** — `OfficeProps`에 `Layer`(Back/Front) 반영, 전경 소품이 직원 하반신 가리되 상단 숫자 무대는 비움(FINAL.md 오피스 3레이어 절 참조). 신규 전경 에셋 필요 시 Codex 핸드오프로 분기.
- [ ] **Step 5: 검증(대기)** — 캡처 `01-main`·`01d-office-rich`(풀블리드·전경 깊이·숫자 무대 비가림).
- [ ] **Step 6: 커밋** — `feat-030 #3: 풀블리드 오피스 + 떠오르는 숫자 무대 + 3레이어 합류`

---

## Block 4 — 스마트 센터버튼 3상태

**Files** — Read 후 Modify `GameScreen.cs`(`BuildBottomDock`·FAB 라벨/색 배선·`GuidanceService` 연동), `FabPulse.cs`, Test `Tests/EditMode/SmartFabTests.cs`

- [ ] **Step 1: Read** — 현 FAB 빌드·`GuidanceService` 제안→FAB 라벨 배선 파악.
- [ ] **Step 2(TDD): 버튼 상태 선택 헤드리스 테스트** — 제안/보상 대기/유휴 입력 → `Action`/`Reward`/`Idle` 상태를 고르는 순수 함수 실패 테스트. 예 — 보상 대기 true → `Reward`.
- [ ] **Step 3: 실패 확인(대기).**
- [ ] **Step 4: 구현** — 상태별 색(`ResCash`+펄스 / `RewardGold` / 채도낮춤 아웃라인)·라벨(출시·수령·다음 달)·펄스 on/off. 도크 4슬롯(제품/연구·경영/더보기) 정리.
- [ ] **Step 5: 검증(대기)** — EditMode(SmartFabTests + 회귀 0) + 캡처(3상태).
- [ ] **Step 6: 커밋** — `feat-030 #4: 스마트 센터버튼 3상태(출시·보상·다음 달)`

---

## Block 5 — 모달 → 보텀시트

**Files** — Read 후 Modify `GameScreen.cs`(`BuildEventModal`·제품/연구/경영 모달·`ShowEventModal` 등), Create `Scripts/UI/BottomSheet.cs`

- [ ] **Step 1: Read** — 현 모달 빌드/표시 패턴(스크림·패널) 파악.
- [ ] **Step 2: `BottomSheet` 컨테이너** — 하단 슬라이드업 + 스크림(오피스 유지) + grab/닫기. 풀스크린 패널을 시트 컨테이너로 감싸는 재사용 헬퍼.
- [ ] **Step 3: 모달 시트화** — 제품(테크트리: 출시됨/출시 가능/잠김 + 예상 이용자·매출)·연구·경영·이벤트 모달을 `BottomSheet`로 전환. 내부 콘텐츠 로직 재사용, 컨테이너만 교체.
- [ ] **Step 4: 검증(대기)** — 캡처 `03-products`·이벤트 시트(오피스 배경 유지).
- [ ] **Step 5: 커밋** — `feat-030 #5: 모달→보텀시트 통합(오피스 배경 유지)`

---

## Block 6 — 4박자 재시퀀스 + 폴리시 + 클로즈아웃

**Files** — Read 후 Modify `GameScreen.cs`(`MonthPayoffCo`·`ShowMonthlyDopamine`·`BuildBriefingModal`), `Tests/PlayMode/ScreenshotCaptureTests.cs`, `progress.md`, `feature_list.json`

- [ ] **Step 1: Read** — `MonthPayoffCo` 코루틴 제어 흐름·`_advancing` 가드 파악(feat-028/029 시퀀스 보존 필수).
- [ ] **Step 2: 재스킨** — 타임랩스(Day N/30·낮→밤·2x/스킵)·이벤트·브리핑(순익 틱업)·승급 컷인을 최종안 토큰/시트 스킨에 맞춤. **코루틴 제어 흐름·byte-identical 페이오프 보존**, 컨테이너/색만 변경.
- [ ] **Step 3: 캡처 갱신** — `Capture_AllStates` 신규 메인·시트·4박자 상태 반영.
- [ ] **Step 4: 검증(대기)** — EditMode 177 회귀 0 + PlayMode 4박자 캡처(`36`·`38/39`·`16` 갱신).
- [ ] **Step 5: 클로즈아웃** — `progress.md`·`feature_list.json`(feat-030 done+증거) 갱신.
- [ ] **Step 6: 커밋** — `feat-030 #6: 4박자 재시퀀스·폴리시 + 클로즈아웃`

---

## Self-Review
- **스펙 커버리지** — FINAL.md 6요소(HUD 다이어트·자원 색·트렌드·풀블리드·스마트버튼·시트·4박자) 모두 B1~B6에 매핑됨. 오피스 3레이어는 B3에 합류.
- **타입 일관성** — `TopHud.BuildTrendLine`(B2)·`BottomSheet`(B5)·스마트버튼 상태 enum(B4)은 각 블록 내에서 정의·사용. `ResCash/ResUser/ResCap/RewardGold`(B1) 토큰을 B2/B4가 소비.
- **검증 부채** — 라이선스 점유로 모든 EditMode/PlayMode 스텝은 "검증 대기". 블록을 작게 끊어 부채 누적 최소화. 코어 무변경이라 회귀면적 작음.
- **미독 코드** — B2~B6 Step 1에서 대상 메서드를 Read한 뒤 정확 diff 작성(추정 금지).
