# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-11
**활성 피처** — feat-007 리플레이성 척추 포팅(런 모디파이어, React v0.63 이식). **블록 #1 완료** — 4축 선택 엔진(FNV-1a 시드 결정론, React 크로스 호환)+시작 델타+세이브 마이그레이션. EditMode 38/38(베이스라인 29+신규 9). 정본 docs/feat-007-context-notes.md, 체크리스트 docs/feat-007-checklist.md.
**현재 목표** — 3트랙 병렬(2026-06-11 사용자 승인) — ① feat-007 블록 #2(월간 틱 훅)~#4(리빌 UI), ② 콘텐츠 한글화·트렌드(events 15종 한글화 완료), ③ 아트 파이프라인(v090 생성 완료, Unity 임포트 남음). feat-008(난이도·태그 파생·멀티 엔딩)은 feature_list에 등록만.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0~feat-003 — 셋업/데이터/코어/VS UI (이전 세션)
- [x] feat-004 사운드·모션 + 아이콘(897700d)·파티클(748d1a8)·테마(eb23a22)·한글폰트(e36ccf8)
- [x] feat-005 세이프에어리어(021ac45) + 빌드셋업(733e184) + Android 빌드(APK 35MB) + 아이콘/스플래시(office 임시)
- [x] feat-006 Block A — 경쟁사·시장점유율·전국랭킹 헤드리스 (CompetitorDef 12사 + MarketService + ScoreboardRanking, EditMode 29/29). DataImporter.ImportAll로 DataCatalog 반영
- [x] feat-006 Block B — LED 전광판 UI (LiveBlink 점멸 + Marquee 흐름 + #랭크/총사/델타)
- [x] feat-006 Block C — 코어3 칩 HUD + ＋트레이 + 목표 리본 + 크레스트 (세로 8-리스트 대체)
- [x] feat-006 Block D — 직원 통통 모션(StaffBob) + 모달 팝인(UiTween.PopIn)
- [x] feat-006 Block E — 하단 도크(2|FAB|2) + 다음달 FAB 펄스 + 탭 팝업(MenuPopup) + 더보기 드로어, office-first(office flex 1)
- [x] 데이터 한글화(업그레이드/자동화) — 업그레이드 15종·자동화 3종 표시명·설명(+monthly_benefit)을 정본 JSON+SO 한글 재시드. 근본원인은 정본 `data/upgrades.json`·`automation_upgrades.json`이 앞 일부만 번역된 부분 번역(임포터·SO는 정상 미러링, "다른 영문 소스" 아님). 블래스트 반경 0(C#/테스트/루트 영문 의존 없음), products/domains/capabilities/resources/stages는 이미 완전 한글 확인. SO 18개 raw-UTF-8 재시드(DataCatalog는 GUID 참조라 무변경). **Unity 검증 완료** — EditMode 29/29 + 05-upgrades.png 한글 표시명·설명 렌더 확인. 커밋 77a5f10(Claude 검증·정본반영)
- [x] 아트 — v054 오피스 오브젝트 21종 Unity 임포트(IconAtlasImporter 비정사각 cellW/cellH) + 오피스 가구 배치(가구 백row+직원 front 2층, ReactionLayer Clear 잠재버그 수정). 커밋 993c470. EditMode 29/29 + 오브젝트 퍼레이드(09)·오피스 캡처 검증
- [x] 이벤트 한글화 — events.json 13종 name/description/choices 한글화(Codex 위임, 핸드오프 docs/codex-handoff/events-localization.md) + ImportAll SO 재시드. 용어는 resources.json 한글 표시명 일치 확인. 15종 전부 한글
- [x] feat-007 블록 #1 — RunModifierOptionDef/RunTagEffectsConfig SO + ImportRunModifiers(40 옵션+tag_effects 40종) + Core.RunModifiersState + Systems.RunModifierService(React selectOption 동일 FNV-1a) + SaveData v3(구세이브 기본값 마이그레이션) + SimulationContext 선택적 runInput(기본 런 동작 불변). RunModifierTests 9종
- [x] 아트 v090 — 직원 액터 고해상(256px) 절차 생성 반입(Codex 외주, generate-v090-workforce-actor-hires.mjs, 결정성 SHA 동일 확인). 바이블 식별 마커 육안 확인 완료
### 진행 중 (What's In Progress)
- [ ] feat-007 — 블록 #2 월간 틱 훅(additive), #3 연중 세계 이벤트(world_events.json 26종), #4 세계 뽑기 리빌 UI
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
1. **feat-007 블록 #2** — MonthController에 tag_effects 합산 단계(표준 런 효과 0, 회귀 없음) + 36개월 표준 플레이스루 불변 테스트.
2. **v090 Unity 임포트** — IconAtlasImporter v090 정의(256px 셀) + 오피스 씬 액터 교체(Codex 단순 코딩 후보). 반입 후 Capture_ActorParade(08)로 검증. v091 신규 고해상 오브젝트 생성은 미발사(agy 비대화형 권한 이슈 — 아래 블로커).
3. **트렌드 콘텐츠 웨이브** — 이벤트 15종에 2025~26 AI 트렌드 이벤트 추가(에이전트 열풍/추론 비용/오픈웨이트/전력 병목/규제). 데이터 전용, Codex 위임 후보.
4. 시각 회귀 — 이후 UI/아트 변경 시 `ScreenshotCaptureTests` 재실행해 캡처 대조(체크리스트에 명령). 재시작 전 다른 Unity 미실행 확인.

## 블로커 / 리스크
- [ ] agy 비대화형 발사 — `--dangerously-skip-permissions`가 권한 분류기에 거부됨. v091 신규 고해상 이미지 생성은 사용자가 대화형 agy로 직접 돌리거나 권한 허용 후 재시도. v090은 Codex 절차 생성으로 대체 완료.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.
- [ ] 임시 아트 — 아이콘/스플래시는 office 배경 임시. 최종 픽셀아트는 추후 세션(backlog).
- [ ] 빌드 산출물 — Builds/ gitignore. APK 35MB 로컬만.

## 내린 결정
- 비주얼 — 아이콘(Resources/Art/UI+LoadAll), 파티클(FxManager 독립), 테마(UiTheme 중앙 팔레트), 폰트(Resources/Fonts/UiFont=Noto KR, 레거시 폴백).
- 세이프에어리어 — SafeAreaFitter가 Screen.safeArea를 anchor로. 콘텐츠만 safe, 배경 전체.
- 빌드 — PlatformSetup(Editor) PlayerSettings + BuildPipeline. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로. Unity 내장 SDK로 빌드 성공.
- 아이콘/스플래시 — office 배경 임시(Art/Branding/app_icon·splash), PlatformSetup.ApplyBranding. 최종 픽셀아트는 backlog.

## 이번 세션 수정 파일 (2026-06-11, 3트랙 병렬 — feat-007 착수)
- 계획 — 3트랙 병렬 사용자 승인(① feat-007 리플레이성 ② 콘텐츠 한글화·트렌드 ③ 아트). feat-007/008 feature_list 등록, 설계 docs/feat-007-context-notes.md
- 한글화 — events.json 13종(Codex 위임, 핸드오프 docs/codex-handoff/events-localization.md) + ImportAll SO 재시드. 업그레이드/자동화 .asset은 동일 한글의 유니티 정규 \uXXXX 재직렬화만(의미 무변)
- feat-007 블록 #1 — RunModifiersState/RunModifierOptionDef/RunTagEffectsConfig/RunModifierService/ImportRunModifiers/SaveData v3/SimulationContext runInput + RunModifierTests 9종
- 아트 — v090 액터 고해상 절차 생성 반입(Codex, public/assets/sprites/v090-workforce-actor-hires.png)

## 검증 증거
- [x] 베이스라인 — 작업 전 init.sh EditMode 29/29
- [x] feat-007 블록 #1 — ImportAll exit0(컴파일 0, RunModifiers SO 40+tag_effects 40) + init.sh EditMode **38/38**(신규 RunModifierTests 9 — 결정론/기본런 불변/명시 델타/세이브 라운드트립/구세이브 마이그레이션/위생 처리/FNV-1a 고정값)
- [x] 기본 런 회귀 없음 — Create(기본 입력) 시작 자원 = ResourceDef.initialValue 전체 일치 테스트
- [x] events 한글화 — 15종 전부 한글(영문 잔존 0, 스크립트 확인), 자원 용어 resources.json 일치, SO displayName 한글 재시드 확인(hallucination_scandal 등)
- [x] v090 — 768×256 RGBA, 결정성(SHA 2회 동일, Codex 보고), 바이블 식별 마커 육안 확인(민트 베스트/모니터 얼굴+안테나/비대칭 눈+경고등)
- [ ] v090 Unity 임포트·퍼레이드 캡처 — 다음 세션(IconAtlasImporter 256px 정의 후 Capture_ActorParade)

## 다음 세션 메모 (할일 정리 — 2026-06-11)
1. **feat-007 블록 #2** — MonthController tag_effects 합산 훅(additive, 표준 런 0) + 36개월 플레이스루 불변 테스트. 이어서 #3 세계 이벤트, #4 리빌 UI. 정본 docs/feat-007-context-notes.md.
2. **v090 Unity 임포트** — IconAtlasImporter 256px 정의 + 오피스 액터 교체(Codex 단순 코딩 후보) + Capture_ActorParade(08) 검증.
3. **v091 신규 고해상** — agy 비대화형 발사가 권한 거부됨(블로커 참조). 사용자 대화형 agy 또는 권한 허용 후 재시도.
4. **트렌드 콘텐츠 웨이브** — 2025~26 AI 트렌드 이벤트 확장(에이전트/추론 비용/오픈웨이트/전력 병목/규제). 데이터 전용, Codex 위임 후보.

**검증 하네스 (필독)** — 시각 검증은 `ScreenshotCaptureTests`(PlayMode, **`-nographics` 빼고** 실행, macOS Metal 오프스크린). 산출 `Logs/shots/*.png`. 사용법 `docs/feat-006-checklist.md`. **시작 전 `ps`로 다른 Unity(titan breaker/sam defender 등) 미실행 확인** — 단일 라이선스 트랩.

**분업** — 이미지 생성·단순 데이터/코딩은 Codex/agy 외주, 캐릭터시트·하네스·검증·정본반영은 Claude.
