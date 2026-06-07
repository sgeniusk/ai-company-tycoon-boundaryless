# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-005 플랫폼. 세이프에어리어·빌드셋업 완료. 남은 건 아이콘/스플래시 + 실제 빌드.
**현재 목표** — feat-005 — Android/iOS 빌드 가능 상태로.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0~feat-003 — 셋업/데이터/코어/VS UI (이전 세션)
- [x] feat-004 사운드·모션 + 아이콘(897700d)·파티클(748d1a8)·테마(eb23a22)·한글폰트(e36ccf8)
- [x] feat-005 세이프에어리어 — SafeAreaFitter + GameScreen 콘텐츠를 safe area에(배경 전체). 021ac45
- [x] feat-005 빌드 셋업 — PlatformSetup(번들ID com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로) + Android 빌드 스크립트. ProjectSettings 반영
### 진행 중 (What's In Progress)
- [~] feat-005 플랫폼 — 세이프에어리어·빌드셋업 완료. 남음 — 아이콘/스플래시(1024 이미지), 실제 Android 빌드(메뉴 AICT/Platform/Build Android)
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류)

## 다음 (What's Next)
1. 실제 Android 빌드 — `AICT/Platform/Build Android` 또는 executeMethod PlatformSetup.BuildAndroid (Android SDK/키스토어 환경)
2. 에디터/Device Simulator로 비주얼·세이프에어리어 시각 확인
3. 아이콘/스플래시(1024 이미지) → feat-004 ④ BGM(오디오 에셋 후)

## 블로커 / 리스크
- [ ] 실제 빌드 환경 — Android SDK/NDK(Unity 내장 또는 별도), 키스토어(디버그 자동). 빌드 시 확인.
- [ ] 시각 미확인 — 아이콘 셀/테마 색/파티클/한글/세이프에어리어는 에디터·시뮬레이터 확인 남음.
- [ ] 아이콘 에셋 — 앱 아이콘/스플래시는 1024px 이미지 필요(미확보).
- [ ] BGM 에셋 블로커 — feat-004 ④ BGM 오디오 파일 필요.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.

## 내린 결정
- 비주얼 — 아이콘(Resources/Art/UI+LoadAll), 파티클(FxManager 독립), 테마(UiTheme 중앙 팔레트), 폰트(Resources/Fonts/UiFont=Noto KR, 레거시 폴백).
- 세이프에어리어 — SafeAreaFitter가 Screen.safeArea를 anchor로. 콘텐츠만 safe, 배경 전체.
- 빌드 — PlatformSetup(Editor)이 PlayerSettings 적용 + BuildPipeline.BuildPlayer. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로/minSdk26.
- 모노레포 unity/, 코어 헤드리스 C#, GameEvents 허브.

## 이번 세션 수정 파일
- 커밋됨 — 897700d/748d1a8/eb23a22/e36ccf8(feat-004), 021ac45(세이프에어리어)
- 커밋 예정 — Assets/Editor/PlatformSetup.cs(신규) + ProjectSettings(번들ID/IL2CPP/회사명/세로)

## 검증 증거
- [x] feat-004 비주얼 — 각 EditMode 21/21, 아이콘 슬라이스 51, 폰트 dynamic 임포트. 4커밋
- [x] feat-005 세이프에어리어 — init.sh EditMode 21/21. 021ac45
- [x] feat-005 빌드셋업 — ApplyMobileSettings executeMethod 컴파일 0 + 번들ID com.gomgomee.aicompanytycoon 적용(Android/iOS), companyName Gomgomee
- [~] 실제 빌드/시각 확인 — 남음(빌드 환경/GUI)
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources/ProjectSettings만

## 다음 세션 메모
feat-005 빌드셋업 커밋 후. 실제 Android 빌드(AICT/Platform/Build Android) → 에디터 시각 확인 → 아이콘/스플래시. ④ BGM은 오디오 에셋 후. 상세는 session-handoff.md.
