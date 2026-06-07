# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-005 플랫폼 착수. feat-004 비주얼(아이콘/파티클/테마/한글폰트) 4커밋 완료. feat-005 세이프에어리어 완료, 빌드 셋업/아이콘 남음.
**현재 목표** — feat-005 — Android/iOS 빌드 가능 상태로. (세이프에어리어 → 번들ID/빌드스크립트 → 아이콘/스플래시)

## 상태 (Status)
### 완료 (What's Done)
- [x] P0~feat-003 — 셋업/데이터/코어/VS UI (이전 세션)
- [x] feat-004 사운드·모션 + 아이콘(897700d)·파티클(748d1a8)·테마(eb23a22)·한글폰트(e36ccf8). EditMode 21/21
- [x] feat-005 세이프에어리어 — SafeAreaFitter(Screen.safeArea→anchor) + GameScreen 콘텐츠를 safe area에(배경은 전체)
### 진행 중 (What's In Progress)
- [~] feat-005 플랫폼 — 세이프에어리어 완료. 빌드 모듈(Android/iOS) 설치 확인. 남음 — 번들ID 설정, 빌드 스크립트(BuildPipeline), 아이콘/스플래시
- [ ] feat-004 ④ BGM — 외부 AI/CC0 루프 오디오 에셋 블로커(보류)

## 다음 (What's Next)
1. feat-005 — 번들ID/제품명 PlayerSettings + 빌드 스크립트(Editor) + 아이콘/스플래시. 번들ID는 사용자 결정 필요(예: com.gomgomee.aicompanytycoon)
2. 에디터/Device Simulator로 세이프에어리어·비주얼 시각 확인
3. 실제 Android 빌드 시도(환경/키스토어)

## 블로커 / 리스크
- [ ] 번들ID 미정 — feat-005 빌드 셋업은 앱 식별자(com.회사.앱) 필요. 사용자 결정.
- [ ] 시각 미확인 — 아이콘 셀/테마 색/파티클/한글/세이프에어리어는 에디터·시뮬레이터 확인 남음.
- [ ] BGM 에셋 블로커 — feat-004 ④ BGM 오디오 파일 필요.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.

## 내린 결정
- 비주얼 — 아이콘(Resources/Art/UI+LoadAll), 파티클(FxManager 독립), 테마(UiTheme 중앙 팔레트), 폰트(Resources/Fonts/UiFont=Noto KR, 레거시 폴백).
- 세이프에어리어 — SafeAreaFitter가 Screen.safeArea를 anchor로. 콘텐츠만 safe, 배경은 전체.
- 모노레포 unity/, 코어 헤드리스 C#, GameEvents 허브.

## 이번 세션 수정 파일
- 커밋됨 — 897700d/748d1a8/eb23a22/e36ccf8(feat-004 비주얼)
- 커밋 예정 — SafeAreaFitter.cs(신규) + GameScreen.cs(safe area 배선)

## 검증 증거
- [x] feat-004 비주얼 — 각 EditMode 21/21, 아이콘 슬라이스 51, 폰트 dynamic 임포트. 4커밋
- [x] feat-005 세이프에어리어 — init.sh EditMode 21/21, 컴파일 0
- [~] 시각 확인 — 남음(GUI/시뮬레이터)
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources만

## 다음 세션 메모
feat-005 진행 중. 세이프에어리어 커밋 후 — 번들ID 정하면 PlayerSettings+빌드스크립트+아이콘. 에디터 시각 확인. 상세는 session-handoff.md.
