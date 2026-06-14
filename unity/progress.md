# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-14
**활성 피처** — **feat-022 트렌드 콘텐츠 웨이브 완료** — 2025-26 AI 트렌드 월드 이벤트 12종 추가(30→42, 에이전틱붐/추론비용붕괴/전력병목/오픈웨이트규제/칩수출규제/온디바이스/정렬연구 등). Codex가 data/world_events.json 작성(기존 태그풀만·연차 2-10), Claude가 DataImporter.ImportAll로 신규 12 WorldEvent SO 재생성+DataCatalog 갱신, WorldEventTests 카운트(30→42)만 갱신 — 시드 교차 픽스처·ApplyDue는 React 트윈 FNV-1a Python 포팅으로 옛 30종 재현 검증 후 불변 확인(Unity 실측 FIXTURE 덤프가 포팅 산출과 글자 일치). EditMode 145/145, 데이터+SO+테스트카운트만·코어 로직 무변경. 정본 docs/feat-022-context-notes.md. **단일 라이선스 함정 — 다른 프로젝트(sam defender 등) Unity 점유 시 import/검증 batchmode 막힘. ps로 확인·종료 후 진행.**

**직전 feat-021 도감 열람 UI 완료** — 크로스런 수집 그리드 갤러리(더보기→도감), 3탭(아키타입12·엔딩24 잠금/해금 + 시너지/콤보20 공개). CollectionGallery.cs(818줄) + GameScreen 버튼1개, 코어 무변경. EditMode 145/145 + PlayMode 5/5. 정본 docs/feat-021-context-notes.md. (직전 feat-020 오피스 아트 AI 재생성·feat-019 연출 격상은 완료 리스트 참조.) **함정 — Codex 위임 시 'unity/ 밖 금지' 명시(루트 progress 사고), 단일 Unity 라이선스(ps 확인).**

**직전 feat-019 오피스 연출 격상(카이로소프트 너머 "보는 맛").** 6트랙 — T1 2열 원근 착석(GameScreen 수동배치 + 절차 책상 전경 오클루더로 '앉아 일하는' 연출, 새 스프라이트0)+gen_office.py BG 떠있는 책상 제거, T2 세로 그라데이션 스크림(무대 0.05 환하게·UI뒤 0.52 어둡게 — 균일 0.38이 채도 죽이던 문제 해소), T3 SpeechBubble 말풍선("완벽해!")+직원별 리워드 플로팅("+아이디어")+CrunchFlame 열일불꽃(WorkLoop 분기·불꽃 책상앞 frontmost·intensity 1.3), T4 AmbientRoomFx 룸별 절차 애니(모니터글로우·LED·조명·먼지, Codex 5.5 xhigh)+CoverMatch cover정합, T5 컷씬 스포트라이트/빅플래시/팝, T6 하네스 기본 20:9. **3-way 분업** — Claude(GameScreen 통합·검증) + Codex(AmbientRoomFx) + dynamic workflow(SpeechBubble/CrunchFlame/컷씬/하네스 + 적대 리뷰가 불꽃 얼굴침범 결함 자동수정). 검증 EditMode **145/145** + PlayMode **5/5** + 캡처 01d-office-rich(2열·책상·불꽃·말풍선·리워드 한프레임)·15-cutscene-launch(스포트라이트). 곁다리 UiTween PopIn/Punch/Fade 파괴대상 가드(세이브/로드 PlayMode 테스트 복구). 정본 docs/feat-019-context-notes.md. **로컬 미푸시(사용자 확인 후).**
**현재 목표** — feat-021 도감 열람 UI 완료. 비주얼(feat-019/020) + 도감까지 마감. 다음 후보 ① 실기기 검증(경제 체감·APK) ② 밸런스 티어 정합 ③ 멀티 엔딩 콘텐츠/베타 준비.

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
- [x] feat-012 — AI 테크트리(분류·떡밥·해금). #1 ProductVisibilityService 5상태 발견의 사다리(derive-only)+제품 팝업 도메인 섹션/???티저/미발견 카운터 #2 teaser 36종+tier+category(Codex) #3 선행 체인+미래 제품 15종=51종(Codex)+TechTreeGraphTests 4종 게이트+CanLaunch 선행 조건 #4 능력 다음레벨 미리보기+해금 모먼트 연출+밸런스 패스. 밸런스 패스 부산물 — 제품 레벨업 포팅(SaveData v4)·RecruitService·React 비용 공식 정렬(자동화 할인 전체 적용+하이프 *10 제거). 정본 docs/feat-012-context-notes.md
- [x] feat-013 — 경제 완주 가능성(a8cc105). 산업 시너지 10+콤보 10 포팅(IndustrySynergyService, 도메인 포트폴리오 월간 보상+가동 토스트) + 이용자 수익화(revenue_per_1000_users=55, additive) + GPU 증설(BuyCompute, 연산력 반복 공급원) + 연산력 소모 React 정렬(신규 이용자 기반) + **도메인 해금 순서 버그 수정**(다중 요건 도메인 영구 미해금 — CheckAll로). TechTreeReachabilityTests Fail 게이트 그린 — tier4 44개월, 승리 ~30개월대
- [x] feat-014 #5 배경 아트 — Codex 절차 생성 완료. `scripts/assets/generate-feat014-stage-backgrounds.mjs`가 node-canvas 없이 raw `Uint8Array` RGBA + zlib deflate PNG 직접 인코딩으로 `office_growth.png` / `office_datacenter.png` / `office_landmark.png` 3장(각 2560x1440 RGBA)을 `Resources/Art/Background/`에 생성. **→ feat-016에서 전면 폐기·교체.**
- [x] feat-016 오피스 비주얼 전면 재작업 — 사용자 피드백("떠있는 등각 판때기가 전혀 사무실 같지 않다") 해소. **정면 단면 픽셀룸 4종** 절차 생성(`Tools~/pixel_office/gen_office.py` — 네이티브 180x320 세로 캔버스에 PIL 도트 → 6x nearest 업스케일 1080x1920, v090 직원 팔레트 정합). 차고(콘크리트·셔터·형광등) / 스타트업(통창 스카이라인·민트 카펫) / 데이터센터(서버랙 LED·대시보드·테크타일) / 랜드마크(일몰 파노라마·골드/보라 대리석·로고월). **드롭인 교체** — `Resources/Art/Background/office{,_growth,_datacenter,_landmark}.png` 4장 + meta Point필터·무압축(기존 2560>2048 다운스케일 흐림도 해소). StageVisual/BuildOfficeScene 코드 무변경. 검증 — EditMode 145/145 + PlayMode 캡처 01-main(차고)·14-stage-landmark(랜드마크) 실게임 UI 합성 확인(직원이 룸 안 러그 위에서 일하는 그림, 바닥 빈 영역은 안내·미나리본·버튼이 덮음). 원본 백업 `Tools~/pixel_office/backup_orig/`. 정본 docs/feat-016-context-notes.md.
- [x] feat-017 픽셀 컷씬 시스템(골격) — 출시 시 전용 모달 컷씬 윈도우. `Scripts/UI/CutsceneDirector.cs`(FxManager 패턴 — RuntimeInitializeOnLoadMethod + Overlay Canvas sortingOrder 230 + GameEvents.ProductLaunched 구독). 발표회 무대(타이틀+커튼+스포트라이트+무대바닥) + 발표 직원(머리 위 제품 별박스, 들썩) + 객석 로봇 2종(점프+박수 스쿼시) + 자체 색종이. 탭 스킵 + 자동 닫힘, 반복 출시 3회+ 간략화, tier enum(Mini/Medium/Big, 출시=Medium) 골격. 아트는 v090 재사용+코드 모션(새 스프라이트 0장). 검증 — EditMode 145/145 + 캡처 15-cutscene-launch.png. 정본 docs/feat-017-context-notes.md, agy 포즈 핸드오프 docs/agy-handoff/cutscene-poses.md. **후속 — agy 포즈 스프라이트, 스포트라이트 강화, 승급·상장·미니 tier 확장.**
- [x] 곁다리 — "No cameras rendering"(Game.unity 카메라 0개) 해소. GameBootstrap.EnsureCamera()가 더미 메인 카메라 런타임 보장(cullingMask 0, Overlay UI 독립). EnsureEventSystem 패턴.
- [x] feat-018 픽셀 배경 폰 고품질 — cover(AspectRatioFitter EnvelopeParent, 도트 정사각) + 240x534→1440x3204(20:9) 고해상도 + meta 4096 + FLOOR_Y 384 정합. **후속 폴리시(같은 커밋군)** — 20:9로 길어진 직원 머리 위(y150~310) 빈 벽을 4종 디테일로 채움(차고 전구줄·선반·포스터·포스트잇·스텐실 / 성장 액자갤러리·네온포스터·선반·코르크 / 데이터센터 세계시계·상태타일·LED신호탑 / 랜드마크 골드어워드액자·픽처라이트·추상아트·트로피선반·대형화분). gen_office.py 데코 헬퍼 9종(draw_frame/shelf/trophy/potted/string_lights/poster/sticky_notes/status_tile/led_tower), C# 무변경. EditMode 145/145 + PlayMode 01c-phone-2400. 정본 docs/feat-018-context-notes.md
- [x] feat-019 오피스 연출 격상 — 카이로소프트 너머 "보는 맛". T1 2열 원근 착석(절차 책상 전경 오클루더, 새 스프라이트0)+BG 책상 제거, T2 그라데이션 스크림(무대 환하게·UI뒤 어둡게), T3 말풍선+직원별 리워드+열일 불꽃, T4 AmbientRoomFx 룸 애니(Codex 5.5 xhigh)+CoverMatch, T5 컷씬 스포트라이트, T6 하네스 20:9. 3-way 분업(Claude 통합+Codex+dynamic workflow 적대리뷰). EditMode 145/145 + PlayMode 5/5. UiTween 가드 곁다리. 정본 docs/feat-019-context-notes.md
- [x] feat-020 오피스 아트 전면 AI 재생성 — 절차 픽셀아트 졸업. Codex imagegen + pixel-art-pipeline. ① 캐릭터 3종 idle/작업(Resources/Art/Actors 드롭인+ActorAnim 타이핑) ② 책상 2종(CreateDeskOccluder 스프라이트) ③ 배경 4종(compose_room.py FLOOR_Y 합성→office*.png) ④ 소품 5종(OfficeProps 좌우 끝). feat-019 런타임 유지. EditMode 145/145 + PlayMode 5/5 + 01d/14-stage 인게임. 사용자 '훨씬 나아졌다'. 커밋 24892dd/94cb765/44f8b08/3e750d7. 정본 docs/feat-020-art-regen-plan.md
- [x] feat-021 도감 열람 UI — 크로스런 수집 그리드 갤러리(더보기→도감). 아키타입12·엔딩24 잠금/해금(실루엣+???+조건힌트) + 시너지/콤보20 전부공개(콤보 리스크뱃지). 신규 CollectionGallery.cs(818줄)+GameScreen 버튼1개, DataCatalog/MetaSave 읽기·코어 무변경. EditMode 145/145+PlayMode 5/5+캡처 19/19b/19c. Codex 구현+Claude 검증. 정본 docs/feat-021-context-notes.md
- [x] feat-022 트렌드 콘텐츠 웨이브 — 2025-26 AI 트렌드 월드 이벤트 12종 추가(30→42, 에이전틱/추론비용/전력병목/오픈웨이트/칩규제/온디바이스 등). Codex가 data/world_events.json(기존 태그풀·연차 2-10), Claude가 ImportAll로 신규 12 SO 재생성 + WorldEventTests 카운트(42)만 갱신(시드 픽스처·ApplyDue 불변 — React 트윈 FNV-1a 포팅 검증, Unity 실측 일치). EditMode 145/145, 코어 로직 무변경. 정본 docs/feat-022-context-notes.md
### 진행 중 (What's In Progress)
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
1. **feat-012 #5 — 문명식 트리 그래프 화면** (설계 노트의 후속 블록).
2. **실기기/에뮬레이터 검증** — APK 재빌드 후 10분 핵심 루프. feat-013으로 경제 체감이 크게 변함(이용자 수익·GPU 증설·시너지 토스트) — 우선순위 상승.
3. **도감 열람 UI** — 아키타입 12/엔딩 24 + 시너지/콤보 20종 컬렉션 화면(미발견 실루엣).
4. **밸런스 체감 튜닝** — 봇 기준 승리 ~30개월대로 빨라짐. 난이도 티어(feat-008)와의 정합 점검 후보 (ARPU 55·GPU 팩 가격이 레버).
5. **트렌드 콘텐츠 웨이브** — 2025~26 AI 트렌드 이벤트(데이터 전용, Codex 후보).
6. 시각 회귀 — UI/아트 변경 시 `ScreenshotCaptureTests` 재실행. 재시작 전 다른 Unity 미실행 확인.

## 블로커 / 리스크
- [ ] **루트 React harness:gate 깨짐** — feat-012 #3이 정본 products.json에 15종 추가하며 React 고정 기대값 2건 실패(물리 산업 제품 수 6→9 고정 테스트, 골든 시뮬 경쟁사 선점 분기). React 트랙은 stale이라 보류 — 재개 시 기대값 갱신 필요.
- [ ] 경제 변경 폭 큼(cf62d2b+a8cc105) — 이용자 성장 ~1/10, 이용자 수익화, GPU 증설, 시너지 보상. 봇 기준 승리 ~30개월대로 빨라져 실기기 체감·난이도 정합 재확인 필요.
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
- [x] `node scripts/assets/generate-feat014-stage-backgrounds.mjs` 재실행 동일 SHA — growth `ded546ad8a2d285bb433781c640c54a952ade519e8780f962a472678e3ad5a0e`, datacenter `1d861b787f6583f1ce10907689fad545843d05bf6428e55e91fbd07af922ef4d`, landmark `97df3ac802e187d60fd00fe0a687c42c7510fd8a4eabc6a7a2882737a8134987`.
- [x] `file unity/Assets/_Project/Resources/Art/Background/office_*.png` — 3장 모두 PNG image data, 2560 x 1440, 8-bit/color RGBA, non-interlaced.
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
