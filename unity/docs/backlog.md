# Backlog — Unity Port (추후 세션)

progress.md는 현재 진행만 담는다. 여기는 "지금 안 하고 나중에" 따로 빼둔 일들이다.

## 비주얼 — 최종 아트 (추후 세션, 사용자 지정)
- [ ] **픽셀아트 최종 아이콘/스플래시** — 직접 픽셀아트로 제작한 뒤 Codex CLI / Antigravity(agy) CLI로 생성해 가져오고, 보정·보완한다. 현재는 office 배경 crop 임시(`Art/Branding/app_icon.png` 1024, `splash.png` 2560x1440).
- [ ] 카드/HUD 아이콘 최종 픽셀아트 다듬기 — 현재 v071/v079/v080 절차 생성 아틀라스.

## 기존 에셋 전부 반영 (포팅)
- [x] 게임 화면 배경 — v054 office를 GameScreen 배경에 반영(반투명 막 0.82). 막 강도 시각 조정 남음.
- [ ] 직원/오브젝트 스프라이트 — `public/assets/sprites`(v053 agents-event-poses, v054 office-objects, v076 workforce-actor).
- [x] 미반영 UI 아틀라스 — v072/v074/v076/v077/v078/v081 전부 슬라이스 반영(IconAtlasImporter+IconLibrary, 신규 29셀, 총 80). 사용처(경쟁사/헬퍼/축하/월드/반응 화면)는 대응 기능 화면 생길 때 연결.

## 플랫폼
- [ ] 실기기/에뮬레이터 테스트 — Android 폰 확보 또는 Android Studio AVD로 APK 설치, v0.1 핵심 루프 10분 구동 확인. 현재 빌드만 성공, 미설치.
- [ ] iOS 빌드 (Xcode 환경).

## 사운드
- [ ] feat-004 ④ BGM — AI/CC0 루프 오디오 에셋 확보 → `AudioManager.bgmClip`. 현재 절차적 SFX 7종만.

## UI 품질
- [ ] TMP 전환 — 더 선명한 텍스트(현재 Noto Sans KR dynamic). 폰트 10MB → 한글 subset 경량화.
