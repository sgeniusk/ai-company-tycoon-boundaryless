# 핸드오프 — v091 오피스 오브젝트 고해상 생성 + Unity 임포트·배치

대상 — 이미지 생성(Codex/agy) + Unity 코딩(Codex). 자족 스펙. 정본 바이블 `unity/docs/art-pipeline/character-sheet.md`, 외주 계약 `docs/ANTIGRAVITY_ART_BRIEF.md`. 산출물은 Claude가 캡처 하네스로 검증·수정한다.

## 배경 — 기존 아트 인벤토리 (중요)
기존 React 소스에 **이미 오피스 오브젝트 시트가 존재**하나 Unity에 미반영이다.
- `public/assets/sprites/v054-office-objects-final.png` — 런타임 1280×960 (소스 2560×1920, 2x 다운샘플)
- 슬라이스 — **5열 × 5행 = 25칸, 칸 256×192(비정사각)** (소스 512×384). 슬라이스 정의는 `scripts/assets/import-v054-office-art.mjs`
- 내용 — 책상(모니터/노트북)·서랍장·서버랙·화이트보드·프린터·회의테이블·녹색스크린 등 ~21종(일부 빈 칸). 캐릭터와 동일 팔레트/등각/그림자
- 시각 — `unity/docs/art-pipeline/ref/existing-v054-objects.png`

**판단** — 기존 v054는 카이로소프트 수준이라 **최종 목표(카이로소프트보다 세밀)에는 못 미침**. 그러나 (a) 생성 레퍼런스(실루엣·구도·팔레트 앵커), (b) 임시 임포트로 휑한 오피스를 즉시 채우는 용도로 가치 있음. 두 경로 모두 아래에 둔다.

## 목표
오피스 씬의 휑함을 채울 등각 오브젝트 세트. 캐릭터 3종과 같은 가족 룩(다크 아웃라인, 청록/골드 액센트, 그림자 접점). 책상에 직원이 앉는 그림이 읽혀야 함.

---

## 경로 1 (빠름·임시) — 기존 v054 임포트 (Codex 단순 코딩)
신규 생성 없이 기존 아트를 Unity로. 휑함 즉시 완화.

### 1-A. IconAtlasImporter 비정사각 셀 지원 (하네스 — Claude 리뷰 필요)
현 `unity/Assets/Editor/IconAtlasImporter.cs`의 `AtlasDef`는 `cell`(정사각) 한 값 + 슬라이스 루프가 정사각 가정이다. **`cellW`/`cellH` 분리** 추가(기존 `cell`은 둘 다로 폴백). 영향: 기존 정사각 아틀라스 무변경.
```csharp
// AtlasDef에 추가
public int cellW;   // 0이면 cell 사용
public int cellH;   // 0이면 cell 사용
// 슬라이스 루프: int cw = atlas.cellW>0?atlas.cellW:atlas.cell; int ch = atlas.cellH>0?atlas.cellH:atlas.cell;
//   rect = new Rect(col*cw, texHeight-(row+1)*ch, cw, ch);
//   rows 계산도 cellH 기준
```

### 1-B. v054 정의 추가 + 칸 이름 (Claude 확정 — `ref/v054-objects-grid.png` 인덱스 기준)
0-20 오브젝트, 21-24 빈 칸. 좌→우·위→아래.
```csharp
new AtlasDef {
    fileName = "v054-office-objects-final.png",
    folder = "sprites",   // public/assets/sprites
    cellW = 256, cellH = 192, columns = 5,
    names = new[] {
      "obj_desk_monitor",  "obj_server_dark",   "obj_cabinet_wood",  "obj_server_blue",   "obj_crate_brown",   // 0-4
      "obj_desk_monitor_b","obj_server_slate",  "obj_cabinet_mint",  "obj_crate_low",     "obj_crate_red",     // 5-9
      "obj_desk_green",    "obj_whiteboard_a",  "obj_whiteboard_b",  "obj_printer_blue",  "obj_server_amber",  // 10-14
      "obj_glassboard_a",  "obj_printer_cyan",  "obj_desk_papers",   "obj_meeting_table", "obj_equipment_blue",// 15-19
      "obj_glassboard_b",  "obj_empty21",       "obj_empty22",       "obj_empty23",       "obj_empty24",       // 20-24
    },
},
```
> 빈 칸(21-24)은 슬라이스되더라도 투명이라 사용처에서 무시. 배치(1-C)는 책상(0/5/10/17)·서버(1/3/6/14)·화이트보드(11/12)·회의테이블(18) 위주로.

### 1-C. IconLibrary 경로 + 오피스 배치
- `IconLibrary.AtlasResourcePaths`에 `"Art/UI/v054-office-objects-final"` 추가
- `GameScreen.BuildOfficeScene`/`RefreshOfficeScene`에 오브젝트 레이어 추가 — 직원 뒤(원근 상단)에 책상·장비 몇 개 배치. **배치 구도는 Claude가 캡처 보며 조정**(등각 깊이·겹침 주의)

---

## 경로 2 (고품질·목표) — 신규 고해상 생성 (Codex/agy)
카이로소프트보다 세밀한 버전. v054를 레퍼런스로 디테일 상향.
- 산출 — `public/assets/sprites/v091-office-objects-hires.png`, RGBA 투명
- 그리드 — 칸 384×288(또는 256×192의 1.5x), 5열×N행, v054와 동일 오브젝트 라인업
- 팔레트 — 바이블 정본 20색(+음영 보간). 캐릭터와 같은 다크 아웃라인·그림자
- 레퍼런스 — `ref/existing-v054-objects.png`로 실루엣/구도 유지, 디테일(목재 결·금속 하이라이트·화면 글로우)만 상향
- 필수 오브젝트 — 개발 책상(모니터/노트북), 서버랙, 화이트보드, GPU 장비, 의자, 차고 소품(공구함/박스), 회의 테이블

---

## 검증 (Claude)
- EditMode `unity/init.sh` 29/29
- 시각 — `ScreenshotCaptureTests` 재실행, `Logs/shots/01-main.png`에서 오피스가 채워졌는지 + 직원과 겹침/가림 없는지. 필요 시 `Capture_ActorParade`式 오브젝트 퍼레이드 추가
- 일관성 — 캐릭터 팔레트/아웃라인/그림자와 한 가족인지

## 스코프
- 경로1 — `IconAtlasImporter.cs`(비정사각 확장+v054 정의), `IconLibrary.cs`(경로), `GameScreen.cs`(오피스 배치). Core/Data/Systems/Save 불침습
- 경로2 — 추가로 신규 PNG. 임포터 정의의 fileName만 교체
