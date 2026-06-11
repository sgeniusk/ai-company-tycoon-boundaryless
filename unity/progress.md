# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-11
**활성 피처** — **로그라이크 트랙 완결.** feat-007(척추)·feat-008(난이도·아키타입 도감·멀티 엔딩 24종)·feat-009(가독성+가이던스 FAB)·feat-010(도파민)·feat-011(풀스크린 스테이지 구도) 전부 완료. **EditMode 66/66** + PlayMode 캡처 11장.
**현재 목표** — 다음 후보는 ① 실기기/에뮬레이터 검증(APK 준비됨, 도파민·가독성 체감 확인) ② 트렌드 콘텐츠 웨이브(Codex 위임) ③ 도감 열람 UI(아키타입 12·엔딩 24 컬렉션 화면 — 데이터·기록은 이미 동작).

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
- [x] feat-007 #2~#4 — #2 월간 tag_effects 틱 훅(MonthController 3.5단계, 표준 런 무효과 동치 테스트) #3 WorldEventDef 30종+WorldEventService(시드 파생 연 1건 2~10년차, 세계관 태그 편향, 히스토리 중복 방지, **React 교차 픽스처 일치**, WorldEventTests 6) #4 세계 뽑기 리빌 모달(더보기 "새 게임 (세계 굴리기)" → 4축 v078 스탬프 카드+시드+PopIn, 07 캡처)
- [x] 아트 v091 — 오피스 오브젝트 고해상(384x288) Codex 절차 향상 반입 + v090/v091 임포터 드롭인 교체(같은 셀 이름, IconLibrary 경로 스왑). 캡처 01/08/09 검증
- [x] feat-009 — 사용자 피드백 대응. A 가독성 전면 패스(UiTheme 폰트 위계 상수 + 66개소 폰트·높이 상향, 패널 알파 0.80→0.93, 텍스트 대비 강화) B AI 비서 가이던스(GuidanceService 헤드리스 + FAB 라벨·톤·행동이 제안에 따라 변경 + 미나 리본, seen 집합으로 잠금 없음). GuidanceTests 4, EditMode 50/50
- [x] feat-010 — 키우기 게임식 도파민(사용자 방향). FloatingText 수익 플로팅(금액 스케일)+직원 환호, WorkLoop 상시 작업 이모트, SpawnCelebration 승급·첫출시 빅팝+파티클, MilestoneService 니어미스(헤드리스, MilestoneTests 4), ToastRibbon 사건 큐(오피스 비가림). EditMode 54/54 + 캡처 10-dopamine 검증
- [x] feat-011 — 첫 화면 구도 정렬(사용자 피드백 "React판과 비주얼 달라 판단 어려움"). 오피스 풀스크린 스테이지(UI 뒤 절대 배치)+가운데 스페이서, 톱바 슬림(타이틀 제거), 리본 도크 위 재배치, 스크림 0.38, 액터·가구 확대. React 레퍼런스 스샷 docs/art-pipeline/ref/react-fresh-mobile-reference.png 보존
- [x] feat-008 — 로그라이크 심화 3블록. #1 난이도 티어 4종(헤드윈드+더보기 선택 UI) #2 아키타입 12종 파생 엔진(React tag-derivation 동일)+월간 보너스 훅+MetaSave 크로스런 도감+리빌 NEW! 발견 연출 #3 멀티 엔딩 24종(EndingService 조건·우선순위·폴백, Python 교차 픽스처 일치)+결과 모달 결말·도감 카운트. EditMode 66/66
### 진행 중 (What's In Progress)
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
0. **feat-012 AI 테크트리 (설계 확정, ready)** — 분류·떡밥·해금. 정본 docs/feat-012-context-notes.md. #1 노출 상태 머신+섹션 UI(Claude)부터, #2/#3 데이터 웨이브는 Codex 핸드오프.
1. **실기기/에뮬레이터 검증** — APK 재빌드(AICT/Platform/Build Android) 후 10분 핵심 루프 + 가독성·도파민 체감 + 노치 세이프에어리어.
2. **도감 열람 UI** — MetaSave에 아키타입·엔딩 발견 기록은 동작 중. 더보기에 컬렉션 화면(12 아키타입/24 엔딩, 미발견 실루엣) 추가가 자연스러운 다음 단계.
3. **트렌드 콘텐츠 웨이브** — 이벤트 15종에 2025~26 AI 트렌드 이벤트 추가(에이전트 열풍/추론 비용/오픈웨이트/전력 병목/규제). 데이터 전용, Codex 위임 후보.
4. **리빌 모달 폴리시** — 행 레이아웃 다듬기 + 새 게임 확인 다이얼로그(진행 중 런 보호) 검토.
5. 시각 회귀 — 이후 UI/아트 변경 시 `ScreenshotCaptureTests` 재실행해 캡처 대조(체크리스트에 명령). 재시작 전 다른 Unity 미실행 확인.

## 블로커 / 리스크
- [ ] agy 비대화형 발사 — `--dangerously-skip-permissions`가 권한 분류기에 거부됨. 이미지 외주는 Codex 절차 생성으로 대체 검증(v090/v091 모두 성공).
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.
- [ ] 임시 아트 — 아이콘/스플래시는 office 배경 임시. 최종 픽셀아트는 추후 세션(backlog).
- [ ] 빌드 산출물 — Builds/ gitignore. APK 35MB 로컬만.

## 내린 결정
- 비주얼 — 아이콘(Resources/Art/UI+LoadAll), 파티클(FxManager 독립), 테마(UiTheme 중앙 팔레트), 폰트(Resources/Fonts/UiFont=Noto KR, 레거시 폴백).
- 세이프에어리어 — SafeAreaFitter가 Screen.safeArea를 anchor로. 콘텐츠만 safe, 배경 전체.
- 빌드 — PlatformSetup(Editor) PlayerSettings + BuildPipeline. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로. Unity 내장 SDK로 빌드 성공.
- 아이콘/스플래시 — office 배경 임시(Art/Branding/app_icon·splash), PlatformSetup.ApplyBranding. 최종 픽셀아트는 backlog.

## 이번 세션 수정 파일 (2026-06-11, 3트랙 병렬 — feat-007 완료)
- 계획 — 3트랙 병렬 사용자 승인. feat-007/008 feature_list 등록, 설계 docs/feat-007-context-notes.md
- 한글화 — `f8d8aa8` events.json 13종(Codex 위임) + ImportAll SO 재시드
- feat-007 — `f085d0e` 블록 #1(4축 선택 엔진+세이브) / `6c57b24` 블록 #2+#3(틱 훅+세계 이벤트) / 블록 #4(리빌 모달) 마감 커밋
- 아트 — `580baec` v090 생성 / `530b536` v090 임포트 / v091 생성+임포트(마감 커밋). 전부 Codex 절차 생성 외주→Claude 검증

## 검증 증거
- [x] 베이스라인 29/29 → 블록 #1 후 38/38 → #2·#3 후 **46/46** (RunModifierTests 11 + WorldEventTests 6)
- [x] React 동치 — FNV-1a 고정값 + 세계 이벤트 스케줄 교차 픽스처(we-test 시드, Python 산출=C# 결과) 일치
- [x] 표준 런 회귀 없음 — 시작 자원 initialValue 일치 + 태그 무효과 동치 테스트
- [x] 세이브 — v3 라운드트립 + 구세이브(v2) 기본값 마이그레이션 + worldEventHistory
- [x] 시각 — PlayMode 캡처 10장. 07-world-reveal(4축 스탬프+시드+시작 델타 HUD 반영), 08 액터 퍼레이드(v090 식별 마커), 09 오브젝트 퍼레이드(v091 21종 슬라이스 정확), 01 메인(오피스 일관성)
- [x] events 한글화 — 15종 전부 한글, 자원 용어 resources.json 일치, SO 재시드 확인

## 다음 세션 메모 (할일 정리 — 2026-06-11)
1. **feat-008** — 난이도 티어·태그 파생 아키타입·멀티 엔딩(React v0.65~0.67 이식). 블록 분해는 feat-007 패턴 재사용, 데이터 정본 루트에 존재(difficulty_tiers/derivation_rules/endings.json).
2. **트렌드 콘텐츠 웨이브** — 2025~26 AI 트렌드 이벤트 확장(에이전트/추론 비용/오픈웨이트/전력 병목/규제). 데이터 전용, Codex 위임 후보.
3. **리빌 모달 폴리시** — 행 레이아웃 다듬기, 새 게임 확인 다이얼로그(진행 중 런 보호).
4. **backlog** — BGM, 실기기, 최종 아이콘/스플래시, 도트매트릭스 전광판 텍스처, TMP.

**검증 하네스 (필독)** — 시각 검증은 `ScreenshotCaptureTests`(PlayMode, **`-nographics` 빼고** 실행, macOS Metal 오프스크린). 산출 `Logs/shots/*.png`. 사용법 `docs/feat-006-checklist.md`. **시작 전 `ps`로 다른 Unity(titan breaker/sam defender 등) 미실행 확인** — 단일 라이선스 트랩.

**분업** — 이미지 생성·단순 데이터/코딩은 Codex/agy 외주, 캐릭터시트·하네스·검증·정본반영은 Claude.
