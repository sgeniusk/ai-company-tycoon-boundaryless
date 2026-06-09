# 아트 파이프라인 체크리스트 — 최종 소스 아트 (멀티세션)

분업 — 이미지 생성은 Codex/agy CLI 외주, 캐릭터시트·검증·일관성 수정은 Claude. 단순 임포터 코딩은 Codex. 정본 바이블 `character-sheet.md`, 외주 계약 `../../../docs/ANTIGRAVITY_ART_BRIEF.md`.

## 워크플로 (자산 1종당)
1. Claude — 캐릭터시트/스펙으로 핸드오프 작성 (`../codex-handoff/`)
2. Codex/agy — 이미지 생성 → `public/assets/...`
3. Codex — Unity 임포터 배선 (단순 코딩)
4. Claude — 캡처 하네스로 게임 내 검증 + 일관성 체크리스트 대조 + 색/배치 수정
5. Claude — EditMode 29/29 + 커밋

## 자산별 상태
### 직원 액터 (캐릭터)
- [x] 캐릭터시트 바이블 작성 — `character-sheet.md` (팔레트 20색·3종 식별마커·2단계 프레임 타깃)
- [x] 시각 레퍼런스 — `ref/char-ref-8x.png`(기존 8배), `ref/palette.png`
- [x] 검증 하네스 — `ScreenshotCaptureTests.Capture_ActorParade`(3종 격리 캡처 → `Logs/shots/08-actor-parade.png`)
- [x] Tier1 생성 핸드오프 — `../codex-handoff/v090-actor-hires-gen.md`
- [ ] **Tier1 생성 (외주 대기)** — v090 고해상 idle 3종 (256px). Codex/agy
- [ ] Tier1 Unity 임포트 (Codex) — IconAtlasImporter v090 정의 + IconLibrary 경로
- [ ] Tier1 Claude 검증 — 퍼레이드/오피스 캡처 대조, 일관성 수정
- [ ] Tier2 — 5포즈 애니 시트(1152×9600 계약). 후속 (Unity 애니 통합 필요)

### 오피스 오브젝트 (책상/장비)
- [ ] 캐릭터시트格 스펙 — ANTIGRAVITY_ART_BRIEF §오피스 오브젝트 계약(2560×1920) 기반 바이블 항목
- [ ] 생성 핸드오프
- [ ] 생성 (외주) — 책상·의자·화이트보드·서버랙·GPU·차고 소품
- [ ] Unity 배치 — office-objects를 오피스 씬에 (현재 휑함)
- [ ] 검증

### 오피스 배경 (backdrop)
- [ ] 현재 `Resources/Art/Background/office.png`(v054, 반투명 막). 고해상 교체(5120×2880→2560×1440) 검토
- [ ] 생성 핸드오프 / 생성 / 검증

### 앱 아이콘 / 스플래시 (브랜딩)
- [ ] 현재 office 배경 crop 임시(`Art/Branding/app_icon.png` 1024, `splash.png` 2560x1440)
- [ ] 최종 픽셀아트 아이콘/스플래시 생성 핸드오프 (캐릭터 3종 활용 가능)
- [ ] PlatformSetup.ApplyBranding 재적용 + 검증

### 카드/HUD 아이콘
- [ ] 현재 v071/v079/v080 절차 생성 아틀라스(48px). 고해상 다듬기 검토 (우선순위 낮음)

### 전광판 도트매트릭스 텍스처 (feat-006 backlog)
- [ ] LED 전광판 도트매트릭스/스캔라인 텍스처 (현재 단색 LED)

## 사운드 (병렬, 별개 트랙)
- [ ] feat-004 ④ BGM — AI/CC0 루프 오디오. 현재 절차적 SFX 7종만

## 진행 로그
- 2026-06-09 — 분업 확정(이미지 생성 외주, Claude 캐릭터시트·검증). 직원 액터 캐릭터시트 바이블 + 시각 레퍼런스 + Capture_ActorParade 하네스 + v090 Tier1 핸드오프 작성. 생성 외주 대기.
