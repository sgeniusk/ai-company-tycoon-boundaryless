# 핸드오프 — v090 직원 액터 고해상 교체본 생성 + Unity 임포트

대상 — 이미지 생성 CLI(Codex/agy) + Unity 단순 코딩(Codex). 자족적 스펙이다. 정본 바이블은 `unity/docs/art-pipeline/character-sheet.md`, 외주 계약은 `docs/ANTIGRAVITY_ART_BRIEF.md`. 산출물은 Claude(편집장)가 바이블 체크리스트로 검증·수정한다.

## 목표
기존 직원 액터 `v076`(76px, 3프레임, 절차 생성)을 **같은 실루엣·팔레트로 디테일·해상도만 올린** 드롭인 교체본 `v090`으로 만든다. 게임 오피스 씬에서 인간/AI/로봇이 즉시 구분돼야 한다. 카이로소프트보다 세밀한 픽셀아트.

---

## Part A — 이미지 생성 (Codex/agy CLI)

### 산출 파일
- `public/assets/sprites/v090-workforce-actor-hires.png` — RGBA, 투명 배경
- 아틀라스 **768×256**, 프레임 **256×256** 3개 가로 배열
- 셀 순서 (좌→우, v076과 동일) — `actor_human`, `actor_ai`, `actor_robot`

### 각 프레임 사양 (바이블 §3 식별 마커 필수)
1. **actor_human** — 다크 헤어 보브 + 피부 얼굴(점눈) + **민트 베스트 + 크림 셔츠 + 골드 타이클립** + 한 손에 blueDark 태블릿 + blueDark 바지. 따뜻한 사무직.
2. **actor_ai** — **blueDark 모니터 얼굴 + 민트 사각 눈 + 골드 입** + **골드 안테나 구** + **바이올렛 몸통** + **좌우 분리 부유 민트/화이트 사각 손**. 떠 있는 비서.
3. **actor_robot** — **steelLight 박스 헤드 + 민트(좌)/오렌지(우) 비대칭 눈** + **레드 경고등** + steel 박스 바디(blue 가슴패널) + **steel 클로 손**. 양산형 로봇.

### 팔레트 (엄수 — 바이블 §정본 팔레트 20색만, 중간 음영 보간만 허용)
```
line #1F1912  gold #F4CC70  mint #5FC6A6  mintDark #2B6B4F
cream #FFF7DF white #F6FAEF blue #335F7A  blueDark #1C303F
slate #485662 slateDark #242D35 steel #8A9AA0 steelLight #CDDADB
orange #E89043 red #D64838 skin #F5B884 skinShade #C67654
hair #282622 violet #6F5BB2 violetDark #3F3771
```

### 스타일/구성 규칙
- 두꺼운 다크 아웃라인(`#1F1912`), 정면-약간 등각, 좌우 대칭(인간만 태블릿으로 약한 비대칭)
- 발끝이 바닥 **그림자 타원**(`#2A241B` 반투명)에 닿음. 그림자 중심 y ≈ 230/256
- 프레임 중앙 정렬, 캐릭터 높이 ≈ 프레임의 78~85%, 상하 여백 균등
- 투명 배경. 안티에일리어싱은 최소(픽셀 경계 또렷)

### 생성 방법 (택1, 결과가 체크리스트를 통과하면 무방)
- **img2img/레퍼런스 기반** — `unity/docs/art-pipeline/ref/char-ref-8x.png`(기존 3종 8배 확대)를 스타일/실루엣 레퍼런스로 넣고 디테일만 상향. **가장 일관성 높음, 권장.**
- **절차 생성 상향** — `scripts/assets/generate-v076-workforce-actor-atlas.mjs`를 256px로 포팅하고 음영/하이라이트 단계를 늘림. 결정적·팔레트 정확하지만 디테일 한계.
- **순수 프롬프트 생성** — 위 사양으로 프롬프트. 팔레트/투명배경/앵커 일관성 검증 필수.

### 자가 검증 (반입 전)
- 768×256 RGBA, 3프레임 정확히 분할, 투명 배경
- 64px로 줄여도 3종 실루엣 구분
- 스포이드로 핵심 색(민트/골드/바이올렛/레드/스틸) 정본과 근사
- 발 베이스라인 3프레임 일치

---

## Part B — Unity 임포트 배선 (Codex 단순 코딩)

### B-1. 임포터에 v090 정의 추가
`unity/Assets/Editor/IconAtlasImporter.cs`의 `Atlases` 배열에 추가 (v076과 별개 신규 엔트리, **기존 v076 유지** — 폴백 안전).
```csharp
new AtlasDef
{
    fileName = "v090-workforce-actor-hires.png",
    folder = "sprites",
    cell = 256,
    columns = 3,
    names = new[] { "actor_human", "actor_ai", "actor_robot" },
},
```
> 주의 — 스프라이트 이름이 v076과 같다(`actor_*`). `IconLibrary`는 첫 등록 우선(`!_cache.ContainsKey`)이라 **배열에서 v090을 v076보다 먼저** 두면 고해상본이 우선된다. v090 엔트리를 v076 엔트리 위에 배치할 것.

### B-2. IconLibrary 로드 경로 추가
`unity/Assets/_Project/Scripts/UI/IconLibrary.cs`의 `AtlasResourcePaths`에 `"Art/UI/v090-workforce-actor-hires"`를 **v076보다 앞**에 추가.

### B-3. 임포트 실행
Unity 에디터 메뉴 `AICT > Import Icon Atlases` 1회 (배치모드 `-executeMethod IconAtlasImporter.ImportAll`도 가능).

### B-4. 검증 (필수)
- `unity/init.sh` — EditMode 29/29 유지(코드 변경이 슬라이스 정의뿐이라 그린이어야)
- 시각 — `ScreenshotCaptureTests`(PlayMode, graphics) 재실행 → `Logs/shots/01-main.png`에서 오피스 직원이 고해상 v090으로 보이는지. 사용법은 `unity/docs/feat-006-checklist.md` '시각 검증 하네스'
- 다른 Unity 미실행 확인 후 실행 (`ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity "`)

### 스코프
- 건드릴 파일 — `IconAtlasImporter.cs`(정의 1개 추가), `IconLibrary.cs`(경로 1줄), 신규 PNG. 그 외 금지.
- Core/Data/Systems/Save·게임 로직 불침습. `RefreshOfficeScene`은 키 동일이라 변경 불필요.

## 합격 기준 (Claude 검증)
바이블 `character-sheet.md` §일관성 체크리스트 전부 통과 + EditMode 29/29 + 오피스 캡처에서 3종 즉시 구분. 미달 시 Claude가 색 보정/재배치 또는 재생성 지시.
