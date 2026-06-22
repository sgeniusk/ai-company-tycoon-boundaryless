# feat-025 2단계 Task 1 핸드오프 — 이벤트 발생 당황(surprise) 픽셀 애니 프레임 6장

준비 2026-06-23. feat-025 **2단계**의 에셋 부분만 Codex에 위임한다. 연출 코드(CutsceneDirector 진입점·GameScreen 트리거)는 Claude가 병렬로 직접 한다. 1단계 핸드오프 `docs/codex-handoff/feat025-event-result-frames.md`와 **절차 동일** — 그 문서를 먼저 읽고 그대로 따른다(여기는 차이점만).

## 스코프 — 반드시 지킬 경계
- ✅ **한다** — `Assets/_Project/Resources/Art/Actors/` 아래 신규 PNG 6장 + `.png.meta` 미러.
- ❌ **안 한다** — `.cs` 코드 수정 금지(`CutsceneDirector.cs`·`GameScreen.cs`는 Claude가 동시 편집 중). `progress.md`·`feature_list.json` 갱신 금지.
- 커밋은 에셋(PNG+.meta)만.

## 양산 대상 (6장, 각 96×96, 투명 PNG)
경로 — `Assets/_Project/Resources/Art/Actors/`

| 캐릭터 | 당황 프레임 A | 당황 프레임 B |
|---|---|---|
| human | `actor_human_surprise_a.png` | `actor_human_surprise_b.png` |
| ai | `actor_ai_surprise_a.png` | `actor_ai_surprise_b.png` |
| robot | `actor_robot_surprise_a.png` | `actor_robot_surprise_b.png` |

2프레임 당황 루프(fps=4) —
- **surprise_a** — 살짝 놀람(눈 크게 뜨고 어깨 움찔, 몸 약간 굳음).
- **surprise_b** — 크게 놀람(상체 뒤로 젖히고 양손 들썩, 입 벌림). A→B로 놀람이 커지는 2단계.

## 레퍼런스 (스타일·구성)
- **놀람 베이스** — 기존 `actor_{char}_alert.png`(이미 놀란 포즈 — 강도만 2프레임으로 키운다).
- **캐릭터 정체성** — `actor_{char}.png`(idle). 동일 인물 유지.
- **톤 일관** — 1단계 신규 `actor_{char}_cheer_a.png`/`actor_{char}_sad_a.png`(같은 컷씬 프레임군이라 명도·아웃라인 톤 맞춤).

## 생성 (Codex imagegen, reasoning 매우 높게)
1단계와 동일. 캐릭터별 **1행 2컷 시트**(surprise_a · surprise_b)를 크로마키 배경으로. 키 색 — **human·robot = 마젠타 `#FF00FF`**, **ai = 녹색 `#00FF00`**(violet 근접 회피).

프롬프트 예(human, 마젠타) —
```
Pixel-art sprite sheet, 1 row × 2 frames, of the SAME human office worker character
as the attached style reference. Frame1: startled, eyes wide open, a slight flinch,
body slightly stiff. Frame2: very startled, leaning back, both hands raised, mouth open.
Full body front view, ~16 colors, thick dark outline #1F1912, mint #5FC6A6 + gold #F4CC70
accents. pure solid magenta #FF00FF background, absolutely no white or light-gray anywhere
in background, no magenta on the character.
```
ai는 배경 문구를 `pure solid green #00FF00 background, no green on the character`로 교체.

## 가공·검증·반입 (1단계와 동일 도구)
```bash
cd unity
python3 "Tools~/pixel_office/feat024/key_props.py" "Tools~/pixel_office/feat024/raw_surprise_human_sheet.png" \
  --names "actor_human_surprise_a,actor_human_surprise_b" --key magenta
# ai는 --key green, robot은 --key magenta
python3 "Tools~/pixel_office/feat024/diagnose_halo.py" --dir Assets/_Project/Resources/Art/Actors --glob actor_ --thr 198
#   → 새 6장 halo=0 GATE PASS 확인 (robot 내부 흰색 카운트는 헤일로 아님)
```
반입 — `import_props.py`로 Resources/Art/Actors, `.meta`는 기존 `actor_human.png.meta` 미러(Point·Sprite·투명).

## 커밋 (에셋만)
```bash
git add Assets/_Project/Resources/Art/Actors/actor_*_surprise_*.png Assets/_Project/Resources/Art/Actors/actor_*_surprise_*.png.meta
git commit -m "feat-025 #2-1: 이벤트 발생 당황 surprise 프레임 6장 크로마키 (3캐릭터×2프레임, halo=0)"
```

## 산출물 위치
- raws·중간물 — `Tools~/pixel_office/feat024/`(gitignore).
- 정본 — `Assets/_Project/Resources/Art/Actors/actor_*_surprise_{a,b}.png` + `.meta`.

## 새 세션 체크리스트
1단계 핸드오프(`feat025-event-result-frames.md`)의 체크리스트와 동일. cd unity + 단일 라이선스(ps) + `key_props.py --help` 확인 → imagegen(human/robot 마젠타, ai 녹색) → 키잉 → halo=0 → 반입 → 에셋만 커밋 → 생성 6장·halo 수치 요약 보고.
