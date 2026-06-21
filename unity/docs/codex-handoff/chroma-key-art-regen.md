# 크로마키 아트 재생성 핸드오프 — imagegen 투명 스프라이트 흰배경/헤일로 근본 해결

준비 2026-06-21. 딥리서치(런 w4bn7b024, 23소스/25주장 검증/21확정) 결론 — imagegen 흰배경 스프라이트의 경계 헤일로(잔상)는 후처리로 **완전 제거 불가**, 처음부터 **크로마키(마젠타) 배경 생성 + 키잉**이 근본 해결. 기존 imagegen 투명 스프라이트 전체를 크로마키로 재생성한다. 이게 feat-024.

## 왜 (딥리서치 근거)
- 헤일로 원인 — imagegen은 흰 배경 + 안티앨리어스 경계라 흰색이 경계 픽셀에 베이크인. pixel-art-pipeline의 단순 흰색 투명화(`--transparent-color #FFFFFF`)로는 경계 흰끼(near-white 200~232)가 안 빠진다. 후처리(디헤일로/디컨탬)는 흰끼를 줄이지 0으로는 못 만든다(구조적 한계 — 이미 베이크인).
- **rembg(u2net/isnet neural matte)는 픽셀아트에 부적합** — 반투명 그라데이션 엣지를 만들어 96px·16색·하드 엣지에 독. (가장 중요한 반전 — AI 매트가 default 추천 아님.)
- 정답 — 캐릭터에 없는 색(마젠타/녹색) 배경으로 생성 → 키잉(키색 제거) + 디컨탬(경계 키색 틴트 중화) + 16색 양자화 + 하드 알파(부분알파→0/255). 흰끼 원천 차단.
- 참고 오픈소스 — `aldegad/sprite-gen`(Apache-2.0, 크로마키 키잉 + 안티앨리어스 프린지 제거 + connected-components), `chasereyn/color-to-alpha-gimp`(GIMP Color-to-Alpha 디컨탬 NumPy/Pillow), `univeous/Pixel-Extractor`(색키잉+그리드스냅+K-means 양자화). 전체 결과 `Tools~/pixel_office/feat024/research.json`로 덤프 권장.

## 재생성 인벤토리 (2026-06-21 헤일로 진단, diagnose_white.py 확장본)
투명 스프라이트 37개 중 헤일로>3 = 18개.

**캐릭터 (최우선 — 전 15컷 통째 재생성, 일관성)** — `Resources/Art/Actors/actor_{human,ai,robot}_{,_work,_cheer,_carduse,_alert}.png` (96px). 헤일로 robot_work=235, robot_carduse=175, ai_cheer=153 ... human=40, ai=36 (work 일부 0이나 시트 통째 재생성해야 톤 일관).

**소품 — imagegen(feat-020)** — `prop_{plant,cooler,vending,couch,bookshelf}.png`, `furniture_desk_{wood,white}.png`. 헤일로 furniture_desk_white=10 등 경미~중간. 크로마키 재생성.

**소품 — feat-023(현재 청사진 블록 가공, 거침)** — `prop_{serverRack,whiteboard,coffee,trophy,table,printer}.png`. 헤일로는 낮지만(블록 추출이라) 품질이 feat-020보다 거칠다 → 이번에 imagegen 크로마키로 **고급화 겸 재생성** 권장(이전 양산 마무리 때 imagegen 생략하고 블록 썼던 부분).

**UI 아틀라스 — imagegen(사용 여부 확인 후)** — `UI/v054-office-objects-final.png`(halo 1074), `v090-workforce-actor-hires.png`(116), `v091-office-objects-hires.png`(1305), `v072-competitor-logo-atlas.png`(8). **주의** — v090/v091은 feat-020에서 캐릭터·오브젝트를 Actors 폴더로 드롭인한 뒤의 레거시 원본일 수 있다. `IconLibrary.cs`의 LoadAll 경로("Art/UI", "Art/Actors")로 실제 사용 여부 먼저 확인 → 사용 중이면 재생성, 미사용이면 제거.

**제외 (불투명/절차 — 재생성 불필요)** — 배경 `office*.png`(불투명 전체 이미지, 헤일로 무관), UI atlas `v071/v076~v081`(절차 생성, halo=0).

## 크로마키 재생성 파이프라인
1. **생성 (Codex imagegen, reasoning 높음)** — 캐릭터당 5포즈를 한 장 시트로(feat-023 시트 방식 — 포즈 간 일관성 100%). 프롬프트 끝에 `pure solid magenta #FF00FF background, absolutely no white or light-gray anywhere in background`. 스타일 레퍼런스는 현 actor_*.png(톤·식별 마커).
   - **키 색 선택** (딥리서치 — 피사체 주색조에서 먼 색) — human(베이지/녹색조끼)·robot(스틸)은 마젠타 OK. **AI는 violet #6F5BB2라 마젠타에 근접** → AI만 **녹색 #00FF00 키** 사용 검토(violet과 충분히 멂). 생성 후 캐릭터에 키색이 침범 안 했는지 육안 확인.
2. **키잉 + 디컨탬 (`Tools~/pixel_office/feat024/key_chroma.py` 신설)** — (a) 키색 거리 임계로 알파 분류(키색 근처→투명), (b) 경계 키색 틴트 디컨탬(인접 캐릭터색 복원 — _decontam_demo 로직 차용), (c) connected-components로 주 피사체만 남김, (d) **16색 양자화 + 하드 알파**(부분알파 전부 0 또는 255 — 픽셀아트 하드엣지 보장). 이 양자화가 헤일로를 구조적으로 0으로 만든다.
3. **슬라이스** — 시트→포즈별 96px (feat-023 `slice_sheet.py` 재사용).
4. **반입** — `Resources/Art/Actors` 드롭인(PNG만 교체, .meta 보존 GUID 안정 — `import_to_resources.py` 재사용).

## 검증 (게이트)
- **헤일로 진단 halo=0** — 재생성 후 `diagnose_white.py`(near-white 198+ 경계 카운트)로 모든 재생성 스프라이트가 **halo=0** 확인. 이게 통과 핵심.
- `./init.sh` EditMode 145/145(코어 무관 — 에셋 교체) + PlayMode 캡처 01d-office-rich·20-pose-sheet 인게임 흰끼 없음 육안 + 녹색배경 대비 시트.
- 단일 라이선스 — `ps -axo command | grep "[U]nity.app...Unity " | grep -i projectpath` 다른 Unity 미실행 확인.

## 미커밋 변경 상태 (이 세션 2026-06-21 — 새 세션이 알아야)
- **유지·이미 커밋함** — 캐릭터 200→248·소품 ×1.25 확대(GameScreen.cs PlaceActorRow baseW/baseH, OfficeProps.cs PlaceProp ×1.25), 가운데 FAB 골드펄스+확대(GameScreen.cs BuildFab) — 사용자 피드백 "캐릭터·도구 작다"+"가운데 버튼 차별화". **재생성과 무관하니 유지.** 단 인게임 검증(캡처)은 미실행 — 새 세션에서 캡처로 크기 적정성 재확인.
- **폐기됨(재생성이 대체)** — actor_human.png 흰점 톤다운/디헤일로 실험본. 백업 `Tools~/pixel_office/feat023/_actor_human_backup.png`. 재생성 시 전 캐릭터 교체되니 무의미 → 새 세션은 그냥 크로마키 재생성본으로 덮어쓴다.

## 새 세션 시작 (Next Session)
1. `cd unity` + ps로 다른 Unity 미실행 확인 + `./init.sh` 베이스라인(EditMode 145/145)
2. 이 문서 + `AGENTS.md`의 '아트 생성 표준(크로마키)' 섹션 읽기
3. **feat-024 크로마키 재생성 — 캐릭터 15컷부터**: Codex imagegen 마젠타/녹색 시트 → `key_chroma.py` 키잉+양자화 → 슬라이스 → 반입 → `diagnose_white.py` halo=0 게이트
4. 통과 후 소품(feat-020+feat-023) → UI atlas(사용 확인 후) 순차
5. 인게임 캡처 검증 + progress/feature_list 갱신 + 커밋
