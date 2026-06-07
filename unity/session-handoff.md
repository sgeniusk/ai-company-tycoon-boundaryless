# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — feat-004 비주얼(아이콘/파티클/테마/한글폰트) 4커밋 완료. **feat-005 플랫폼 착수 — 세이프에어리어 완료. 빌드 셋업/아이콘 남음.**
- 브랜치 / 커밋 — `main`. feat-004=897700d/748d1a8/eb23a22/e36ccf8 커밋. 세이프에어리어=커밋 예정. push 안 함.

## 이번 세션 한 일
- feat-004 비주얼 4커밋 — 아이콘(슬라이스 51, Resources/Art/UI+IconLibrary), 파티클(FxManager 독립), 테마(UiTheme 카이로소프트 팔레트), 한글폰트(Noto Sans KR로 레거시 Arial fallback 자글거림 해결).
- feat-005 세이프에어리어 — SafeAreaFitter(Screen.safeArea→anchor) + GameScreen 콘텐츠를 safe area에. 배경은 전체.

## 검증 (컴파일/테스트 통과, 시각 남음)
- init.sh EditMode 21/21 — 비주얼 4종 + 세이프에어리어 각각 통과. 아이콘 슬라이스 51, 폰트 dynamic 임포트.
- 남음 — 에디터/Device Simulator로 시각 확인(아이콘 셀, 테마 색, 파티클, 한글, safe area).

## feat-005 다음 블록
- 번들ID/제품명 PlayerSettings (번들ID는 사용자 결정 — 예 com.gomgomee.aicompanytycoon)
- 빌드 스크립트(Editor BuildPipeline) — Android/iOS 모듈 설치됨
- 아이콘/스플래시 (PlayerSettings + 이미지)
- ④ BGM(feat-004)은 오디오 에셋 블로커

## 내린 결정
- 비주얼 — 아이콘/파티클/테마/폰트 (progress.md). 세이프에어리어 — SafeAreaFitter, 콘텐츠만 safe.
- 모노레포 unity/, 코어 헤드리스 C#, GameEvents 허브.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. 다른 Unity 미실행 확인 — `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`
3. 에디터/시뮬레이터 시각 확인 → feat-005 빌드 셋업(번들ID 확정 후)
4. 검증 — `./init.sh`

## 권장 다음 단계 (Recommended Next Step)
번들ID 확정 → PlatformSetup(PlayerSettings)+빌드스크립트+아이콘 → Android 빌드 시도. 시각 확인 병행. ④ BGM은 오디오 에셋 후. 반복성 큰 부분은 docs/codex-handoff/ 패턴으로 Codex 위임.
