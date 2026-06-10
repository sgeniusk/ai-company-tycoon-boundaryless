# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-10
**활성 피처** — feat-006 Claude Design 첫 화면 반영. 블록 A~E **시각 확인 완료**(헤드리스 캡처 하네스로 7장 육안 대조). EditMode 29/29 유지. office-first·전광판·코어3 HUD·생동감·하단 도크 모두 이식+검증.
**현재 목표** — feat-006 핵심 완료. 남은 건 backlog 아트뿐(픽셀아트 아이콘·office-objects·도트매트릭스 텍스처·BGM·실기기). 정본 docs/feat-006-context-notes.md, 체크리스트 docs/feat-006-checklist.md(시각 검증 하네스 사용법 포함).

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
### 진행 중 (What's In Progress)
- [x] feat-006 — A~E 코드 완료 + **시각 확인 완료**(헤드리스 캡처). 버그 1건 수정·탭 페이드 추가. 남은 건 backlog 아트뿐
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
1. **이벤트 한/영 혼용(`data/events.json`)** — 15종 중 13종(`viral_demo`·`gpu_price_spike` 외) name/description/choices 영문. 업그레이드와 같은 부분 번역 패턴이나 서사 분량이 커 별도 작업. (업그레이드 표시명·설명 혼용 + 요구조건 원시 키 노출 `min_month` 등은 해결됨 — 후자는 45b5aa6)
2. **아트 파이프라인 (진행 중)** — `docs/art-pipeline/`(분업: 이미지 생성 Codex/agy 외주, 캐릭터시트·검증 Claude). 직원 액터 바이블+핸드오프(v090) 완료, 오피스 오브젝트 핸드오프(v091) 완료. **v054 오피스 오브젝트는 Unity 임포트·배치 완료(993c470)**. 다음 — 신규 고해상 생성(v090 액터/v091 오브젝트)은 Codex/agy 외주 대기, 기존 v053 5포즈 시트는 임시 임포트 후보(레퍼런스로 보유).
3. 시각 회귀 — 이후 UI/아트 변경 시 `ScreenshotCaptureTests` 재실행해 캡처 대조(체크리스트에 명령). 재시작 전 다른 Unity 미실행 확인.

## 블로커 / 리스크
- [ ] 시각 미확인 — 아이콘 셀/테마 색/파티클/한글/세이프에어리어/스플래시는 에디터·시뮬레이터 확인 남음.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.
- [ ] 임시 아트 — 아이콘/스플래시는 office 배경 임시. 최종 픽셀아트는 추후 세션(backlog).
- [ ] 빌드 산출물 — Builds/ gitignore. APK 35MB 로컬만.

## 내린 결정
- 비주얼 — 아이콘(Resources/Art/UI+LoadAll), 파티클(FxManager 독립), 테마(UiTheme 중앙 팔레트), 폰트(Resources/Fonts/UiFont=Noto KR, 레거시 폴백).
- 세이프에어리어 — SafeAreaFitter가 Screen.safeArea를 anchor로. 콘텐츠만 safe, 배경 전체.
- 빌드 — PlatformSetup(Editor) PlayerSettings + BuildPipeline. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로. Unity 내장 SDK로 빌드 성공.
- 아이콘/스플래시 — office 배경 임시(Art/Branding/app_icon·splash), PlatformSetup.ApplyBranding. 최종 픽셀아트는 backlog.

## 이번 세션 수정 파일 (2026-06-10, 10커밋 — origin/main 푸시 완료)
- feat-006 마무리 — `0bd60f4`(시각확인+꾸미기버그+탭페이드)
- 시각 검증 하네스 — `ScreenshotCaptureTests`(PlayMode, 카메라+RT 1080x1920). 헤드리스로 게임 화면 캡처해 육안 검증
- 아트 파이프라인 — `b3ff541`(캐릭터시트 바이블+핸드오프 v090+검증 하네스)·`367878a`(v091 핸드오프+기존아트 인벤토리)·`08a72d2`(v054 칸이름)
- v054 오피스 오브젝트 — `993c470`(임포터 비정사각+임포트+가구배치)·`714d215`(체크리스트)·`bf78a80`(가구 밴드 하향)
- 한글화 검증·정본반영 — `45b5aa6`(요구조건 키)·`77a5f10`(표시명·설명 재시드, 병렬 Codex 구현→Claude 검증)·`e7913c3`(progress)
- 작업 트리 완전 클린

## 검증 증거
- [x] feat-004 비주얼 — 각 EditMode 21/21, 아이콘 슬라이스 51, 폰트 dynamic. 4커밋
- [x] feat-005 세이프에어리어/빌드셋업 — EditMode 21/21, 컴파일 0
- [x] feat-005 실제 빌드 — BuildResult Succeeded, APK 35MB(IL2CPP/ARM64)
- [x] feat-005 아이콘/스플래시 — ApplyMobileSettings executeMethod 컴파일 0, SetIcons 적용(경고 없음), splash Sprite 변환
- [x] 기존 에셋 반영 — 게임 배경 office EditMode 21/21. 미반영 아틀라스 6개 ImportAll 슬라이스(총 80셀, 신규 29 셀 수 일치), 컴파일 0
- [x] 시각 확인(feat-006 A~E) — 헤드리스 캡처 7장 육안 대조. office-first·LED 전광판(랭크/마퀴)·코어3 HUD·＋트레이·도크/FAB·팝업/드로어 확인. 폰트(Noto KR 한글 선명)·테마·픽셀 아이콘도 함께 확인. 도구 — ScreenshotCaptureTests(PlayMode, graphics)
- [~] 실기기/노치 세이프에어리어 — 헤드리스는 Screen.safeArea=풀스크린이라 미확인(실기기 남음)
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Tests만(feat-006 수정)

## 다음 세션 메모 (할일 정리 — 2026-06-10)
feat-006 완료 + 한글화(요구조건·표시명) 검증·반영 + v054 오피스 오브젝트 임포트·배치 완료. 모두 origin/main 푸시됨, 트리 클린.

**우선순위 할일**
1. **events.json 한/영 혼용** — 15종 중 13종(`viral_demo`·`gpu_price_spike` 외) name/description/choices 영문. 업그레이드와 같은 부분 번역 패턴. 데이터 로컬라이즈라 Codex 위임 후보(Claude 검증). 서사 분량 큼.
2. **신규 고해상 아트 생성 (외주)** — v090 직원 액터 / v091 오피스 오브젝트. 핸드오프 준비됨(`docs/codex-handoff/`), Codex/agy 이미지 생성 대기. 반입되면 Claude가 `Capture_ActorParade`(08)·`Capture_ObjectParade`(09)·오피스 캡처로 일관성 검증·수정. 정본 바이블 `docs/art-pipeline/character-sheet.md`.
3. **v053 5포즈 시트** — 임시 임포트 후보(레퍼런스 `ref/existing-v053-poses-sample.png` 보유). Tier2 애니 통합은 후속.
4. **backlog** — BGM(외부 오디오), 실기기/노치 세이프에어리어, 최종 픽셀아트 아이콘/스플래시, 도트매트릭스 전광판 텍스처, TMP. 상세 `docs/backlog.md`·`docs/art-pipeline/checklist.md`.

**검증 하네스 (필독)** — 시각 검증은 `ScreenshotCaptureTests`(PlayMode, **`-nographics` 빼고** 실행, macOS Metal 오프스크린). 산출 `Logs/shots/*.png`. 사용법 `docs/feat-006-checklist.md`. **시작 전 `ps`로 다른 Unity(titan breaker/sam defender 등) 미실행 확인** — 단일 라이선스 트랩.

**분업** — 이미지 생성·단순 데이터/코딩은 Codex/agy 외주, 캐릭터시트·하네스·검증·정본반영은 Claude.
