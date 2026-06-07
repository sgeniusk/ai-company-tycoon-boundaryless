# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — feat-004 비주얼 4커밋 완료. **feat-005 — 세이프에어리어·빌드셋업 완료. 아이콘/실제빌드 남음.**
- 브랜치 / 커밋 — `main`. feat-004=897700d/748d1a8/eb23a22/e36ccf8, 세이프에어리어=021ac45 커밋. 빌드셋업=커밋 예정. push 안 함.

## 이번 세션 한 일
- feat-004 비주얼 4커밋 — 아이콘(슬라이스 51), 파티클(FxManager), 테마(UiTheme 카이로소프트), 한글폰트(Noto Sans KR).
- feat-005 세이프에어리어 — SafeAreaFitter(Screen.safeArea→anchor) + GameScreen 콘텐츠를 safe area에. 021ac45.
- feat-005 빌드셋업 — PlatformSetup(Editor): ApplyMobileSettings(번들 com.gomgomee.aicompanytycoon, companyName Gomgomee, IL2CPP/ARM64/minSdk26/세로) + BuildAndroid(BuildPipeline). ProjectSettings 반영됨.

## 검증 (컴파일/테스트 통과, 실기기 빌드·시각 남음)
- 비주얼·세이프에어리어 — init.sh EditMode 21/21. 아이콘 슬라이스 51, 폰트 dynamic.
- 빌드셋업 — ApplyMobileSettings executeMethod 컴파일 0 + 번들ID 적용 확인(ProjectSettings diff).
- 남음 — 실제 Android 빌드(AICT/Platform/Build Android), 에디터/시뮬레이터 시각 확인.

## 내린 결정
- 비주얼 — 아이콘/파티클/테마/폰트(progress.md). 세이프에어리어 — SafeAreaFitter, 콘텐츠만 safe.
- 빌드 — PlatformSetup이 PlayerSettings 적용 + BuildPipeline. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. 다른 Unity 미실행 확인 — `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`
3. 실제 Android 빌드 — `AICT/Platform/Build Android` 또는 executeMethod PlatformSetup.BuildAndroid (Android SDK/키스토어)
4. 에디터/시뮬레이터 시각 확인 → 아이콘/스플래시(1024 이미지)

## 권장 다음 단계 (Recommended Next Step)
실제 Android 빌드로 feat-005 핵심(실기기 설치) 확인 → 아이콘/스플래시. ④ BGM은 오디오 에셋 후. 빌드 실패 시 Android SDK/NDK 모듈·키스토어 점검. 반복성 큰 부분은 docs/codex-handoff/ 패턴으로 Codex 위임.
