# Backlog — Unity Port (추후 세션)

progress.md는 현재 진행만 담는다. 여기는 "지금 안 하고 나중에" 따로 빼둔 일들이다.

## 비주얼 — 최종 아트 (추후 세션, 사용자 지정)
- [ ] **픽셀아트 최종 아이콘/스플래시** — 직접 픽셀아트로 제작한 뒤 Codex CLI / Antigravity(agy) CLI로 생성해 가져오고, 보정·보완한다. 현재는 office 배경 crop 임시(`Art/Branding/app_icon.png` 1024, `splash.png` 2560x1440).
- [ ] 카드/HUD 아이콘 최종 픽셀아트 다듬기 — 현재 v071/v079/v080 절차 생성 아틀라스.

## 픽셀 비주얼 후속 (feat-016~018 트랙)
정면 단면 픽셀룸 4종(feat-016) + 컷씬(feat-017) + 폰 cover 고해상도·벽 중하단 디테일(feat-018, 80e9867)에서 남긴 후속. 코어 루프엔 영향 없는 시각 폴리시.
- [ ] **agy 포즈 스프라이트 반입** (사용자 액션) — `docs/agy-handoff/cutscene-poses.md` 스펙 준비됨. agy 비대화형 발사 권한 없음 → 사용자가 agy 대화형 실행 → 컷씬 직원 포즈(발표·환호·승급·종) 스프라이트 → `CutsceneDirector` 코드 모션 드롭인 대체. 컷씬 생동감 ↑.
- [ ] **캡처 하네스 9:16 → 20:9** (Claude/Codex) — `ScreenshotCaptureTests` 기본 W/H(1080x1920, 9:16)가 cover에서 상하 크롭이 커 실게임 프레이밍과 다름. 폰 기본(1080x2400, 20:9)으로 전환하면 실제 보이는 프레임과 일치. 01-main 등 회귀 스샷 기준 갱신 동반.
- [ ] **액터 정합 cover-aware** (Claude, 우선순위 낮음) — 직원 발 정합 FLOOR_Y=384 = 20:9 최적. 19.5:9(아이폰)/21:9서 cover 크롭 비율이 달라 미세 어긋남. `GameScreen` 액터 anchor를 화면 비율 기반(cover scale 역산) 보정으로. 20:9 다수·어긋남 미세라 후순위.
- [ ] **컷씬·벽 미세 폴리시** (선택) — feat-017 스포트라이트 강화, 랜드마크 중앙 추상 벽아트 고급화 등. 현 상태로 충분, 여유 시.

## 기존 에셋 전부 반영 (포팅)
- [x] 게임 화면 배경 — v054 office를 GameScreen 배경에 반영(반투명 막 0.82). 막 강도 시각 조정 남음.
- [~] 직원 캐릭터 — v076 actor(인간/AI/로봇)를 office 배경 위 사무실 씬에 talent 수만큼 배치(GameScreen.BuildOfficeScene). 남음 — office-objects(책상/장비), agents-event-poses 표정, 배치 시각 조정.
- [x] 미반영 UI 아틀라스 — v072/v074/v076/v077/v078/v081 전부 슬라이스 반영(IconAtlasImporter+IconLibrary, 신규 29셀, 총 80). 사용처(경쟁사/헬퍼/축하/월드/반응 화면)는 대응 기능 화면 생길 때 연결.

## 플랫폼
- [ ] 실기기/에뮬레이터 테스트 — Android 폰 확보 또는 Android Studio AVD로 APK 설치, v0.1 핵심 루프 10분 구동 확인. 현재 빌드만 성공, 미설치.
- [ ] iOS 빌드 (Xcode 환경).

## 사운드
- [ ] feat-004 ④ BGM — AI/CC0 루프 오디오 에셋 확보 → `AudioManager.bgmClip`. 현재 절차적 SFX 7종만.

## UI 품질
- [ ] **도감 열람 UI** — feat-008 아키타입 12종·엔딩 24종 크로스런 수집(MetaSave)을 열람하는 전용 화면. 현재 발견 카운트·NEW! 연출만 있고 갤러리 enumeration(잠금/해금 그리드, 설명) 없음. 데이터는 이미 헤드리스 — UI만.
- [ ] TMP 전환 — 더 선명한 텍스트(현재 Noto Sans KR dynamic). 폰트 10MB → 한글 subset 경량화.
