# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — feat-004 비주얼 4커밋 완료. **feat-005 — 세이프에어리어·빌드셋업·빌드(35MB)·아이콘/스플래시 완료. 시각확인 + 최종 픽셀아트(backlog) 남음.**
- 브랜치 / 커밋 — `main`. feat-004(4)+세이프에어리어(021ac45)+빌드셋업(733e184) 커밋. push 안 함.

## 이번 세션 한 일
- feat-004 비주얼 4커밋 — 아이콘(슬라이스 51), 파티클(FxManager), 테마(UiTheme 카이로소프트), 한글폰트(Noto Sans KR).
- feat-005 세이프에어리어(021ac45) + 빌드셋업(733e184: PlatformSetup, 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64/세로).
- feat-005 실제 Android 빌드 — BuildAndroid로 AICompanyTycoon.apk 35MB(IL2CPP/ARM64) BuildResult Succeeded. Unity 내장 Android SDK/NDK 사용.

## 검증 (통과 — 빌드 성공, 시각/실기기 남음)
- 비주얼·세이프에어리어 — init.sh EditMode 21/21. 아이콘 슬라이스 51, 폰트 dynamic.
- 빌드셋업 — ApplyMobileSettings 컴파일 0 + 번들ID 적용.
- 실제 빌드 — APK 35MB Succeeded(유효 zip). 빌드 산출물 Builds/ gitignore.
- 남음 — 에디터/시뮬레이터/실기기 시각 확인.

## 내린 결정
- 비주얼 — 아이콘/파티클/테마/폰트(progress.md). 세이프에어리어 SafeAreaFitter.
- 빌드 — PlatformSetup PlayerSettings + BuildPipeline. 번들 com.gomgomee.aicompanytycoon, IL2CPP/ARM64. Unity 내장 SDK로 빌드 OK.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. 다른 Unity 미실행 확인 — `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`
3. 에디터/시뮬레이터/실기기 시각 확인 (APK 설치)
4. feat-005 아이콘/스플래시(1024 이미지) → PlayerSettings 아이콘 슬롯

## 권장 다음 단계 (Recommended Next Step)
에디터 ▶ 플레이 / Device Simulator로 시각 확인(Android 폰 불필요). 추후 할 일(픽셀아트 아이콘/기존 에셋 전부 반영/실기기/BGM/TMP)은 docs/backlog.md. 재빌드 AICT/Platform/Build Android. 반복성 큰 부분은 docs/codex-handoff/ 패턴으로 Codex 위임.
