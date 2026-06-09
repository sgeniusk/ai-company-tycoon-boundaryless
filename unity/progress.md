# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-09
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
### 진행 중 (What's In Progress)
- [x] feat-006 — A~E 코드 완료 + **시각 확인 완료**(헤드리스 캡처). 버그 1건 수정·탭 페이드 추가. 남은 건 backlog 아트뿐
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
1. 캡처에서 발견된 스코프 외 데이터 이슈(별도 피처) — 업그레이드 설명 한/영 혼용, 카드 요구조건 원시 키 노출(`min_month`/`min_users`/`min_talent` → 한글화). upgrades 데이터/리스트 렌더 영역.
2. **아트 파이프라인 (진행 중)** — `docs/art-pipeline/`(분업: 이미지 생성 Codex/agy 외주, 캐릭터시트·검증 Claude). 직원 액터 바이블+핸드오프(v090) 완료, 오피스 오브젝트 핸드오프(v091) 완료. 다음 — Codex/agy 생성 또는 기존 v053/v054 임시 임포트(Codex). 발견 — 기존 풍부한 아트(v053 5포즈·v054 오브젝트)가 Unity 미반영, 레퍼런스+임시용.
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

## 이번 세션 수정 파일
- 커밋됨 — 897700d/748d1a8/eb23a22/e36ccf8(feat-004), 021ac45(세이프에어리어), 733e184(빌드셋업), afb07bc(빌드 docs), cb916d4(.utmp)
- 커밋 예정 — PlatformSetup(ApplyBranding) + Art/Branding(app_icon/splash) + ProjectSettings(아이콘/스플래시) + docs/backlog.md
- 빌드 산출물 — Builds/Android/AICompanyTycoon.apk 35MB (gitignore)

## 검증 증거
- [x] feat-004 비주얼 — 각 EditMode 21/21, 아이콘 슬라이스 51, 폰트 dynamic. 4커밋
- [x] feat-005 세이프에어리어/빌드셋업 — EditMode 21/21, 컴파일 0
- [x] feat-005 실제 빌드 — BuildResult Succeeded, APK 35MB(IL2CPP/ARM64)
- [x] feat-005 아이콘/스플래시 — ApplyMobileSettings executeMethod 컴파일 0, SetIcons 적용(경고 없음), splash Sprite 변환
- [x] 기존 에셋 반영 — 게임 배경 office EditMode 21/21. 미반영 아틀라스 6개 ImportAll 슬라이스(총 80셀, 신규 29 셀 수 일치), 컴파일 0
- [x] 시각 확인(feat-006 A~E) — 헤드리스 캡처 7장 육안 대조. office-first·LED 전광판(랭크/마퀴)·코어3 HUD·＋트레이·도크/FAB·팝업/드로어 확인. 폰트(Noto KR 한글 선명)·테마·픽셀 아이콘도 함께 확인. 도구 — ScreenshotCaptureTests(PlayMode, graphics)
- [~] 실기기/노치 세이프에어리어 — 헤드리스는 Screen.safeArea=풀스크린이라 미확인(실기기 남음)
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Tests만(feat-006 수정)

## 다음 세션 메모
feat-005 거의 완료(빌드+아이콘/스플래시). 다음 — 에디터/시뮬레이터 시각 확인. 추후 할 일 전체는 docs/backlog.md(픽셀아트 아이콘/기존 에셋 전부 반영/실기기/BGM/TMP). 상세는 session-handoff.md.
