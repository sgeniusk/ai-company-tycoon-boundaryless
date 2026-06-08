# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-005 플랫폼. 세이프에어리어·빌드셋업·실제 빌드(APK 35MB)·아이콘/스플래시 완료. 남은 건 시각 확인 + 최종 픽셀아트(backlog).
**현재 목표** — feat-005 마무리. 추후 할 일은 docs/backlog.md.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0~feat-003 — 셋업/데이터/코어/VS UI (이전 세션)
- [x] feat-004 사운드·모션 + 아이콘(897700d)·파티클(748d1a8)·테마(eb23a22)·한글폰트(e36ccf8)
- [x] feat-005 세이프에어리어(021ac45) + 빌드셋업(733e184) + 실제 Android 빌드(APK 35MB, BuildResult Succeeded)
- [x] feat-005 아이콘/스플래시 — office 배경 임시(app_icon 1024 + splash 2560x1440). SetIcons(Android/iOS)+SplashScreen 배선. 최종 픽셀아트는 docs/backlog.md
### 진행 중 (What's In Progress)
- [~] feat-005 플랫폼 — 빌드·아이콘/스플래시 완료. 남음 — 에디터/실기기 시각 확인(최종 아트는 backlog)
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류, backlog)

## 다음 (What's Next)
1. 에디터 ▶ 플레이 / Device Simulator로 비주얼·세이프에어리어 시각 확인 (Android 폰 불필요)
2. 추후 — docs/backlog.md (픽셀아트 아이콘, 기존 에셋 전부 반영, 실기기/에뮬, BGM, TMP)

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
- [~] 시각 확인 — 남음(에디터/시뮬레이터)
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources/Art/ProjectSettings만

## 다음 세션 메모
feat-005 거의 완료(빌드+아이콘/스플래시). 다음 — 에디터/시뮬레이터 시각 확인. 추후 할 일 전체는 docs/backlog.md(픽셀아트 아이콘/기존 에셋 전부 반영/실기기/BGM/TMP). 상세는 session-handoff.md.
