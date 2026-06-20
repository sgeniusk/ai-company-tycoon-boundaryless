# feat-023 양산 핸드오프 — §1 오피스 확장(새 포즈2·소품6·배경2)을 feat-020 품질로 생성하는 Codex imagegen + pixel-art-pipeline + MJ 지침

준비 2026-06-15. 클로드 디자인 §1 오피스 확장 초안(`Tools~/pixel_office/feat023/ai-2/`)을 컨셉 청사진으로 확정한 뒤의 양산 단계 설계다. 초안의 26×34 블록은 구성·색·마커의 정본 청사진일 뿐, 실제 게임 에셋은 feat-020과 동일한 파이프라인(Codex imagegen → pixel-art-pipeline)으로 다시 만든다.

## 양산 대상 (feat-020에 없는 신규만)
feat-020이 이미 만든 것 — 캐릭터 idle/work/cheer 3포즈, 소품 cooler/plant/bookshelf/couch/vending, 배경 office/growth/datacenter/landmark. 아래 신규만 생성한다.

| 분류 | 신규 항목 | 비고 |
|---|---|---|
| 포즈 | card_use, alert (× human/ai/robot = 6컷) | character-sheet.md 5포즈 완성 |
| 소품 | serverRack, whiteboard, coffee, trophy, table, printer (6종) | plant·cooler는 feat-020 보유 |
| 배경 | garageNight, datacenter(확장) | garageNight=차고 야간 신규, datacenter=기존 office_datacenter 개선 검토 |

## 청사진 (추출 블록 = 정확한 구성·색·마커 레퍼런스)
`Tools~/pixel_office/feat023/extracted/`(gitignore) — `chars/{char}_{pose}_6x.png`, `props/{name}_6x.png`, `bg/{name}_3x.png`. 초안 JS 캔버스 코드를 `extract_blocks.py`로 결정적 PIL 추출한 것. 색은 정본 20색 그대로.
포즈 구성 (초안 JS 좌표 기준) —
- **card_use** — 한 손을 머리 위로 들고 그 위에 골드 스파클 플래시(goldFlash). 인간·AI·로봇 공통으로 위로 든 손.
- **alert** — 양팔을 바깥으로 벌린 놀란 자세 + 머리 옆 작은 레드 느낌표(alertMark). 로봇은 경고등이 한 칸 커짐.

## 생성 (Codex imagegen) — feat-020 방식
스타일 레퍼런스 + 구성 레퍼런스 + 텍스트 프롬프트를 함께 준다.
- **스타일 레퍼런스** — feat-020 결과물 `Resources/Art/Actors/actor_{human,ai,robot}.png`(96px 톤·디테일·식별 마커).
- **구성 레퍼런스** — 추출 블록 `extracted/chars/{char}_{pose}_6x.png`(포즈·팔 위치·마커·색).
- **포즈 프롬프트 (영문)** — "Pixel-art [human office worker / AI agent with monitor face / boxy robot] in [card_use / alert] pose, full body front view, pure #FFFFFF background, ~16 colors, thick dark outline (#1F1912), mint #5FC6A6 + gold #F4CC70 accents. Keep the SAME character identity as the style reference. Pose: [card_use → one arm raised overhead with a small gold sparkle above the hand / alert → both arms out to the sides, startled stance, a tiny red exclamation mark near the head]."
- **소품 프롬프트** — "Pixel-art [server rack / whiteboard on stand / coffee machine / trophy display case / meeting table / multifunction printer], front three-quarter view, pure #FFFFFF background, ~16 colors, thick dark outline, mint+gold accents, same palette as references." 구성 레퍼런스 `extracted/props/{name}_6x.png`.
- **배경 프롬프트** — "Front cross-section pixel-art room, [a garage workshop at night with window moonlight and warm worklight / an expanded server datacenter with rack rows and mint·gold indicators], floor left open for compositing characters, ~16 colors, mint+gold." 구성 레퍼런스 `extracted/bg/{name}_3x.png` + feat-020 `office*.png`. imagegen은 정사각 고정이라 빈 룸을 생성한 뒤 합성으로 20:9 만든다(아래).

## 가공 (pixel-art-pipeline)
- 캐릭터·소품 — `pixel-art-pipeline/scripts/downsample.py raw.png proc.png --size 96 --colors 16 --transparent-color "#FFFFFF" --preview`. 소품은 종횡비 보존(feat-020 책상 방식, 144×96 등).
- 배경 — feat-020 #3 방식. `Tools~/pixel_office/feat020/compose_room.py`를 재사용해 정사각 룸을 1440×3204에 합성(룸 하단을 FLOOR_Y 텍스처 y2304에 맞추고 천장색 위·바닥행 아래 확장).

## Midjourney 키 이미지 (미적 앵커 1컷, 양산 아님)
"Cozy doll-house front cross-section of a small AI startup office, pixel art finer than Kairosoft, mint #5FC6A6 + gold #F4CC70 accents, thick dark outline, human + AI-agent + robot employees mixed, warm slightly-messy startup mood, 20:9 vertical game composition." — 톤·구도 기준 프레임 1컷만. 확장 데이터센터 배경 + 업무·환호·경보 직원(초안 §D 확정).

## Unity 통합 지점 (feat-020 패턴)
- **포즈** — `Resources/Art/Actors/actor_{char}_carduse.png`·`actor_{char}_alert.png` + 단일 스프라이트 .meta(v090 미러 — Point·Sprite·투명). `ActorAnim`/`WorkLoop`에 card_use·alert 상태 추가 배선(Codex 단순 코딩). work 스프라이트 없을 때 idle 폴백 패턴 동일.
- **소품** — `Resources/Art/Actors/prop_{name}.png` + `OfficeProps`에 등록(룸 좌우 끝·바닥 배치). feat-020 prop 5종과 동일 슬롯 규칙.
- **배경** — compose 결과를 `Resources/Art/Background/office_garage_night.png` 등 신규 슬롯 또는 기존 office_datacenter 개선 교체. StageVisual 슬롯 검토.

## 검증
EditMode 145/145 + PlayMode 캡처(01d-office-rich / 신규 배경 stage 캡처) + character-sheet.md 일관성 체크리스트(팔레트·마커·실루엣·앵커). 시작 전 `ps`로 다른 Unity 미실행 확인(단일 라이선스).

## 배치 톤 — 게임화면 UIUX 목업 참고 (사용자 결정 2026-06-15)
사용자가 클로드 디자인 '게임 화면 UI/UX 인게임 목업'을 목표 레이아웃으로 제시. **단 실제 Unity(01d-office-rich)는 이미 목업보다 빽빽**(벽 액자 5~6·2열 캐릭터 꽉·소품 5종). 따라서 양산 후 배치는 '무작정 더 채우기'가 아니라 **목업의 깔끔·정돈 톤**으로.
- `OfficeProps.cs` 현재 — 소품 5종(plant/cooler/vending/couch/bookshelf)을 좌우 끝(xNorm 0.045~0.985) 바닥에만. 신규 6종은 벽면(serverRack 좌벽·whiteboard 우벽)·바닥 가장자리로 **다양화하되 과밀 회피**.
- 현 게임의 어수선한 벽 데코(feat-018 9종)는 솎아 목업의 모던·명확 톤에 맞춤.
- 목업 레이아웃 — 상단 HUD(레벨·자금·에이전트·에너지 + 랭킹 LIVE 티커·꾸미기) + 정면 단면 룸(우드 플로어·워크스테이션 그리드, 다음 달마다 에이전트 영입 착석) + 하단 4탭 도크(운영·회사·성장·메뉴 + 중앙 골드 '다음 달'). 룸 위쪽 여백은 배경 디테일로 적당히 채우되 과밀 금지.

## 산출물 위치
raws·가공 중간물은 `Tools~/pixel_office/feat023/`(gitignore, AI 생성은 비결정적이라 재현 불가). 정본은 `Resources/Art/*`의 가공본. 청사진 추출기 `extract_blocks.py`는 결정적이라 보존.
