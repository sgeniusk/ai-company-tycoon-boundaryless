# feat-025 Task 4 핸드오프 — 이벤트 결과 환호/낙담 픽셀 애니 프레임 12장 (크로마키 양산)

준비 2026-06-23. Claude(편집장)가 feat-025 "이벤트 결과 픽셀 컷씬"의 **에셋 부분(Task 4)만** Codex에 위임한다. 연출 코드(Task 2·3·5)와 통합 검증(Task 6)은 Claude가 병렬로 직접 구현하므로, 이 작업은 **PNG 에셋 생성·반입에만 한정**한다. 정본 설계는 `docs/feat-025-event-cutscene-design.md`, 구현계획은 `docs/feat-025-event-cutscene-plan.md`(Task 4).

## 스코프 — 반드시 지킬 경계
- ✅ **한다** — `Assets/_Project/Resources/Art/Actors/` 아래 신규 PNG 12장 생성·키잉·반입 + 각 `.png.meta` 미러 생성.
- ❌ **안 한다** — `.cs` 코드 파일 일절 수정 금지. 특히 `CutsceneDirector.cs`·`GameScreen.cs`·`CutsceneFrameAnim.cs`는 **Claude가 동시에 편집 중**이다. 건드리면 충돌난다.
- ❌ **안 한다** — `progress.md`·`feature_list.json` 갱신 금지(Claude가 Task 6에서 통합 갱신).
- 커밋은 **에셋(PNG+.meta)만**, 아래 명령 그대로.

## 양산 대상 (12장, 각 96×96, 투명 PNG)
경로 — `Assets/_Project/Resources/Art/Actors/`

| 캐릭터 | 환호 프레임 A | 환호 프레임 B | 낙담 프레임 A | 낙담 프레임 B |
|---|---|---|---|---|
| human | `actor_human_cheer_a.png` | `actor_human_cheer_b.png` | `actor_human_sad_a.png` | `actor_human_sad_b.png` |
| ai | `actor_ai_cheer_a.png` | `actor_ai_cheer_b.png` | `actor_ai_sad_a.png` | `actor_ai_sad_b.png` |
| robot | `actor_robot_cheer_a.png` | `actor_robot_cheer_b.png` | `actor_robot_sad_a.png` | `actor_robot_sad_b.png` |

2프레임 루프 의도(fps=4로 까딱이게 재생됨, 배선은 Claude 담당) —
- **cheer_a/b** — 팔 올림 두 단계(들기 시작 → 활짝 올림·살짝 점프)로 환호가 통통 튀게.
- **sad_a/b** — 고개·어깨 두 단계(살짝 숙임 → 더 처짐)로 낙담이 흔들리게.

## 레퍼런스 (스타일·구성 정본)
- **환호 베이스** — 기존 `actor_{char}_cheer.png`(현 환호 포즈의 톤·식별 마커).
- **낙담 베이스** — 기존 `actor_{char}_alert.png`(놀람 포즈를 고개 숙인 낙담으로 변형).
- **캐릭터 정체성** — `actor_{char}.png`(idle). 신규 프레임은 이 캐릭터와 **동일 인물**이어야 한다(실루엣·팔레트·마커 유지).
- 팔레트 — outline `#1F1912`, mint `#5FC6A6`, gold `#F4CC70`, AI accent violet `#6F5BB2`. ~16색.

## 생성 (Codex imagegen, reasoning 매우 높게)
캐릭터별로 **1행 4컷 시트**(cheer_a · cheer_b · sad_a · sad_b)를 크로마키 배경으로 한 장에 생성한다(포즈 간 일관성). 스타일 레퍼런스로 위 기존 PNG를 첨부한다.

프롬프트 예(human) —
```
Pixel-art sprite sheet, 1 row × 4 frames, of the SAME human office worker character
as the attached style reference. Frame1: cheering, both arms starting to raise.
Frame2: cheering, both arms raised high with a joyful little hop. Frame3: dejected,
head slightly lowered, shoulders dropping. Frame4: dejected, head down, shoulders
slumped. Full body front view, ~16 colors, thick dark outline #1F1912,
mint #5FC6A6 + gold #F4CC70 accents. pure solid magenta #FF00FF background,
absolutely no white or light-gray anywhere in background, no magenta on the character.
```
ai·robot도 동일 구조(캐릭터 묘사만 교체 — ai = AI agent with monitor face/violet, robot = boxy robot).

**키 색 선택 (딥리서치 — 피사체 주색조에서 먼 색):**
- **human, robot → 마젠타 `#FF00FF`**.
- **ai (violet `#6F5BB2`라 마젠타에 근접) → 녹색 `#00FF00`** 배경·키. ai 프롬프트의 배경 문구를 `pure solid green #00FF00 background, no green on the character`로 바꾼다.
- 생성 후 캐릭터에 키색이 침범 안 했는지 육안 확인.

## 가공 (키잉 + 양자화) — feat-024 도구 재사용
시트 4컷을 슬라이스·키잉한다. feat-024가 캐릭터/소품에 쓴 `key_props.py`(종횡비 보존)를 쓴다. **먼저 `--help`로 실제 인자를 확인**하고 호출(zero-context 보정):
```bash
cd unity
python3 "Tools~/pixel_office/feat024/key_props.py" --help
python3 "Tools~/pixel_office/feat024/key_props.py" "Tools~/pixel_office/feat024/raw_react_human_sheet.png" \
  --names "actor_human_cheer_a,actor_human_cheer_b,actor_human_sad_a,actor_human_sad_b" --key magenta
python3 "Tools~/pixel_office/feat024/key_props.py" "Tools~/pixel_office/feat024/raw_react_ai_sheet.png" \
  --names "actor_ai_cheer_a,actor_ai_cheer_b,actor_ai_sad_a,actor_ai_sad_b" --key green
python3 "Tools~/pixel_office/feat024/key_props.py" "Tools~/pixel_office/feat024/raw_react_robot_sheet.png" \
  --names "actor_robot_cheer_a,actor_robot_cheer_b,actor_robot_sad_a,actor_robot_sad_b" --key magenta
```
키잉은 (a) 키색 거리 임계로 알파 분류 (b) 경계 키색 틴트 디컨탬 (c) 16색 양자화 + 하드 알파(부분알파 전부 0/255). 이 양자화가 헤일로를 구조적으로 0으로 만든다. `key_chroma.py`(정사각 96px 전용)도 대안.

## 검증 게이트
```bash
# 1) 헤일로 0 — 핵심 게이트
python3 "Tools~/pixel_office/feat024/diagnose_halo.py" --dir "Tools~/pixel_office/feat024" --glob actor_ --thr 198
#    Expected: 모든 신규 프레임 halo=0. >0이면 양자화/키잉 재실행.

# 2) 단일 라이선스 — 다른 Unity 미실행 확인 (init.sh 전에 필수)
ps -axo command | grep "[U]nity.app" | grep projectpath

# 3) EditMode — 에셋 교체라 코어·테스트 무관, 148/148 유지 확인
./init.sh
```
육안 — 키 배경 대비 시트로 4컷 환호/낙담 동작이 자연스러운지 확인.

## 반입 (.meta 미러 필수)
`import_props.py`의 NAMES를 위 12 프레임으로 바꿔 `Resources/Art/Actors`에 반입한다(`import_to_resources.py`도 대안). **신규 PNG마다 `.png.meta`를 생성**하되 기존 `actor_human.png.meta`를 미러한다(Point 필터·Sprite 타입·투명·동일 import 설정). GUID는 신규라 새로 부여돼도 무방(기존 에셋 교체가 아니라 신규 추가).

## 커밋 (에셋만)
```bash
git add Assets/_Project/Resources/Art/Actors/actor_*_cheer_*.png Assets/_Project/Resources/Art/Actors/actor_*_sad_*.png
git add Assets/_Project/Resources/Art/Actors/actor_*_cheer_*.png.meta Assets/_Project/Resources/Art/Actors/actor_*_sad_*.png.meta
git commit -m "feat-025 #4: 환호/낙담 애니 프레임 12장 크로마키 생성 (3캐릭터×2반응×2프레임, halo=0)"
```

## 산출물 위치
- raws·가공 중간물 — `Tools~/pixel_office/feat024/`(gitignore, imagegen 비결정적이라 재현 불가).
- 정본 — `Assets/_Project/Resources/Art/Actors/actor_*_{cheer,sad}_{a,b}.png` + `.meta`.

## 새 세션 시작 (체크리스트)
1. `cd unity` + ps로 다른 Unity 미실행 확인 + `./init.sh` 베이스라인(EditMode 148/148).
2. 이 문서 + `AGENTS.md`의 '아트 생성 표준 — 크로마키 배경 의무' 섹션 읽기.
3. `key_props.py --help`·`import_props.py` 내부 NAMES 구조 확인(zero-context 보정).
4. 캐릭터별 imagegen 시트(human/robot 마젠타, ai 녹색) → `key_props.py` 키잉 → `diagnose_halo.py` halo=0.
5. `import_props.py` 반입 + `.meta` 미러 → 육안 → **에셋만** 커밋 → 결과 요약 보고(생성 12장, halo 수치, 미해결 이슈).
