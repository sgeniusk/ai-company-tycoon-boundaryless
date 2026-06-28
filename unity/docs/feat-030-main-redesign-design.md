# feat-030 — 디자인 주도 메인 화면 재설계 (구현 스펙)

클로드 디자인 시안에서 확정한 최종안(`docs/design/FINAL.md` · `ai-tycoon-final.html`)을 Unity 메인 화면에 옮긴다. 시각 정본은 FINAL.md, 이 문서는 **Unity 구현 전략·블록·검증**을 다룬다.

## 목표 한 줄
다크 그린 HUD·큰 랭킹 전광판을 걷어내고 오피스를 화면의 주인공으로 올린다. 슬림 1줄 HUD·자원별 색·추월 트렌드·스마트 센터버튼·보텀시트로 "내 회사가 알아서 자란다"의 방치형 도파민을 보이게 한다.

## 접근 — 점진적 재스킨/재배치 (재작성 아님)
- 4박자 도파민 연출은 이미 존재한다 — 타임랩스(feat-028 `MonthPayoffCo`)·월말 브리핑(feat-029 `BuildBriefingModal`)·승급/엔딩 컷씬(feat-026 `CutsceneDirector`)·떠오르는 숫자(feat-010/019 `FloatingText`·`ToastRibbon`). 재설계는 대부분 **HUD 다이어트 + 풀블리드 재배치 + 시트화 + 재스킨**이다.
- **코어/세이브/시뮬레이션 무변경.** `Core`/`Data`/`Systems`/`Save`는 손대지 않는다. 변경은 `Scripts/UI/*`(주로 `GameScreen.cs`·`UiTheme.cs`)와 일부 신규 뷰 컴포넌트에 한정.
- `GameScreen.cs`(3756줄)는 이미 과대하다. 블록 진행 중 HUD 빌드를 별도 빌더(예: `HudBuilder`/`TopHud`)로 **타깃 추출**해 파일을 줄인다. 무관한 리팩터는 하지 않는다.

## 현 화면 → 최종안 매핑 (GameScreen.Build 기준)
| 현 메서드 | 최종안 |
|---|---|
| `BuildTopBar`(다크그린) + `BuildResourceHud` + `BuildScoreboard`(큰 전광판/Marquee) | 슬림 1줄 HUD(월차·성급·꾸미기) + 자원별 색칩(▲델타) + 슬림 추월 트렌드바 |
| `BuildOfficeBackground`/`BuildOfficeScene` | 풀블리드 — 확보 공간을 오피스에 양보, 상단에 떠오르는 숫자 무대 확보 |
| `BuildBottomDock` + FAB(`FabPulse`) | 스마트 센터버튼 3상태(출시 코랄펄스 / 보상 골드 / 다음 달 아웃라인) |
| Event/Product/Research/Manage 모달 | 보텀시트(오피스 위로 슬라이드, 배경 유지) |
| `ShowMonthlyDopamine` + `MonthPayoffCo` | 4박자 재시퀀스·재스킨(2x/스킵 유지) |
| `UiTheme` | 컬러 토큰(크림/코랄/민트/보라/골드, 강조색 1개) + 타이포 위계 |

## 블록 (각 블록 = 검증 단위, EditMode 통과 + 캡처)
순서는 토대→체감→무대→상호작용→폴리시.

### B1 — 컬러/타이포 토큰 (`UiTheme`)
다크그린 폐기. 자원 고정색(현금 코랄 `#EE6C3D` · 이용자 민트 `#2FA877` · 연산력 보라 `#7A66D6` · 보상/랭킹 골드 `#E2A02E`), 크림 베이스, 강조색 1개 규칙. 타이포 위계 상수(큰 숫자=임팩트 / 본문 / 버튼). 기존 색 상수 참조처는 새 토큰으로 매핑. EditMode 회귀 0 목표(상수 값 변경 위주).

### B2 — HUD 다이어트
톱바+자원+전광판 3블록 → ① 슬림 1줄 HUD(월차·성급·꾸미기) ② 자원별 색칩 3개(아이콘·라벨·값·▲델타) ③ 슬림 추월 트렌드바(`#N ▲ 추월 중 · 추월까지 N계단`, Marquee는 트렌드바에 흡수하거나 축소). `BuildScoreboard`의 큰 패널 제거. 가장 큰 체감 블록.

### B3 — 풀블리드 오피스 + 떠오르는 숫자 무대
오피스 스테이지를 화면 대부분으로 확장(HUD 슬림화로 확보한 공간). `FloatingText` 스폰 영역을 오피스 상단 전경 여백으로 재배치(직원 안 가리게). 추월 토스트 위치 정리. 오피스 3레이어 깊이(`PropSpec.Layer` Back/Front)는 이 블록과 합류 — 전경 소품이 직원 하반신 가리되 떠오르는 숫자 무대는 비운다.

### B4 — 스마트 센터버튼 3상태
FAB를 `GuidanceService` 제안에 따라 ① 추천 액션(코랄+펄스, 예 제품 출시) ② 즉시 보상(골드, 예 투자 수령) ③ 할 일 없음(채도 낮춘 아웃라인, 다음 달)로 분기. 색·모양·라벨이 상태를 즉시 읽히게. 도크 4슬롯(제품/연구 · 경영/더보기) 정리. `FabPulse` 재사용.

### B5 — 모달 → 보텀시트
Event/Product/Research/Manage를 풀스크린 모달에서 **보텀시트**로(오피스 위로 슬라이드, 스크림 뒤 오피스 유지). 제품 시트는 테크트리 리스트(출시됨/출시 가능/잠김 + 예상 이용자·매출). 기존 모달 빌드/표시 로직 재사용, 컨테이너만 시트화.

### B6 — 4박자 재시퀀스 + 폴리시 + 클로즈아웃
타임랩스(Day N/30·낮→밤·2x/스킵) → 이벤트 선택 → 손익 브리핑 시트(순익 틱업) → 승급 컷인(오피스 비주얼 변화)의 시퀀스를 최종안 스킨에 맞춰 정리. 전체 상태 캡처(`Capture_AllStates`) 갱신 + progress/feature_list 클로즈아웃.

## 검증
- 사용자 결정 — **코딩 먼저, 검증은 라이선스 풀린 뒤 일괄.** 다른 Unity(sam·titan) 종료 시 `./init.sh`(EditMode 베이스라인 177) → 블록별 회귀 확인 → PlayMode 캡처(`Logs/shots/`)로 육안.
- 블록은 검증 전 done 처리하지 않는다. 코드 작성 후 "검증 대기" 상태로 표시.
- 회귀 안전 — 코어/세이브/시뮬 무변경, 변경은 UI 레이어. 기존 EditMode(MonthBriefing·OfficeLayout·Guidance 등)는 헤드리스라 UI 재스킨에 영향 없어야 한다.

## 스코프 경계
- 변경 — `Scripts/UI/*`(특히 `GameScreen.cs`·`UiTheme.cs`) + 신규 뷰 컴포넌트, 캡처, progress/feature_list/docs.
- 불변 — `Core`/`Data`/`Systems`/`Save`/`*.json` 콘텐츠/시뮬 로직. 루트 레포(React/Godot) 파일.
- 에셋 필요 시(예 새 아이콘·전경 소품) Codex 크로마키 핸드오프. 분담 — 에셋=Codex / 재미·연출 코드=Claude.

## 리스크
- `GameScreen.cs` 과대 — 블록마다 작은 추출로 완화, 한 번에 대수술 금지.
- 라이선스 점유로 검증 지연 — 블록을 작게 끊어 검증 부채 누적 최소화.
- 4박자 재스킨이 feat-028/029 시퀀스 가드(`_advancing`)를 건드리지 않게 — B6은 컨테이너/스킨만, 코루틴 제어 흐름 보존.
