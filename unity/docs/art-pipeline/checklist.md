# 아트 파이프라인 체크리스트 — 최종 소스 아트 (멀티세션)

분업 — 이미지 생성은 Codex/agy CLI 외주, 캐릭터시트·검증·일관성 수정은 Claude. 단순 임포터 코딩은 Codex. 정본 바이블 `character-sheet.md`, 외주 계약 `../../../docs/ANTIGRAVITY_ART_BRIEF.md`.

## 기존 아트 인벤토리 (2026-06-09 발견 — Unity 미반영)
React 소스(`public/assets/sprites`)에 풍부한 아트가 있으나 Unity 포트엔 office 배경만 반영됨. 신규 생성의 **레퍼런스(실루엣·팔레트 앵커)** 이자 **임시 임포트** 후보.
- `v053-agents-event-poses-final.png` 576×4800 — **5포즈(idle/work/card_use/cheer/alert) × 캐릭터 × 3프레임 = 75프레임 @192px**. 브리프 캐릭터시트 계약 그대로. 시각 `ref/existing-v053-poses-sample.png`
- `v054-office-objects-final.png` 1280×960 — 오피스 오브젝트 25칸(256×192, ~21종). 시각 `ref/existing-v054-objects.png`
- 판단 — 기존은 카이로소프트 수준. 북극성("카이로소프트보다 세밀")엔 못 미쳐 **최종 목표 아님**. 레퍼런스+임시용.

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
- [ ] Tier2 — 5포즈 애니 시트(1152×9600 계약). **기존 v053(576×4800)이 레퍼런스로 존재**. 후속 (Unity 포즈/애니 통합 + 고해상 생성)

### 오피스 오브젝트 (책상/장비)
- [x] 생성/임포트 핸드오프 — `../codex-handoff/v091-office-objects-gen.md` (경로1 기존 v054 임포트 + 경로2 신규 고해상)
- [x] **임포터 비정사각 셀 확장** (Claude — 하네스) — IconAtlasImporter cellW/cellH + npotScale=None/maxTextureSize=4096. 커밋 993c470
- [x] v054 칸 이름 확정 — `ref/v054-objects-grid.png` 기준 21종(0-20) + 빈칸 4
- [x] 경로1 임포트 — v054 → Resources, IconLibrary 경로. 오브젝트 퍼레이드 21종 정상(`Logs/shots/09-object-parade.png`)
- [x] Unity 배치 — BuildOfficeScene 2층(가구 백row + 직원). 책상/서버/화이트보드/서류책상 4종. 캡처 확인
- [ ] 경로2 신규 고해상 생성 (외주) — v054 레퍼런스로 디테일 상향. 여전히 외주 대기
- [~] 배치 미세조정 — 가구-직원 간격(office-first 큰 floor). 밴드 하향안은 라이선스 점유로 미검증, 보류

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
