# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-004 상업 연출. 사운드·모션·아이콘·파티클·테마·한글폰트 코드 완료. **남은 건 에디터 시각 확인 + ④ BGM(오디오 에셋 블로커).**
**현재 목표** — feat-004 비주얼로 상업적 외형. (아이콘/파티클/테마/폰트 완료, BGM/URP만)

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로, asmdef, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance + 36개월
- [x] feat-003 Vertical Slice UI — 세로 uGUI + SceneBuilder + SaveService. Game.unity
- [x] feat-004 사운드(SFX 7종+AudioManager) + 모션(Ticker/Tween). EditMode 21/PlayMode 2
- [x] feat-004 아이콘 — 자원HUD(v071)+도메인/제품(v079)+능력(v080), 슬라이스 51. 897700d
- [x] feat-004 파티클 — FxManager 색종이 버스트(출시/승급/능력/도메인). 748d1a8
- [x] feat-004 테마 — UiTheme 카이로소프트 밝은 팔레트, UiFactory+GameScreen 전면. eb23a22
### 진행 중 (What's In Progress)
- [~] feat-004 한글 폰트 — 레거시 Arial은 한글 없어 OS fallback→자글거림. Noto Sans KR(Resources/Fonts/UiFont, OFL) 도입, UiFactory 로드(레거시 폴백). EditMode 21/21. 에디터 선명도 확인 남음
- [ ] feat-004 남음 — ④ BGM(외부 AI/CC0 루프 = 에셋 블로커) ⑤ URP 2D 파이프라인(후순위)

## 다음 (What's Next)
1. 에디터 ▶ 플레이 시각 확인 — 아이콘 셀 + 테마 색감 + 파티클 + 한글 선명도
2. feat-005 플랫폼 — Android/iOS 빌드 (④ BGM은 오디오 에셋 확보 후)
3. 필요 시 테마 색/폰트 미세조정

## 블로커 / 리스크
- [ ] 시각 미확인 — 아이콘 셀/테마 색/파티클/한글 선명도는 에디터 플레이로 최종 확인. 컴파일/슬라이스/임포트는 통과.
- [ ] BGM 에셋 블로커 — ④ BGM은 AI/CC0 루프 오디오 파일 필요. 확보 전 진행 불가.
- [ ] 폰트 용량 — UiFont(Noto KR) 10MB. 빌드 시 subset로 경량화 여지(추후).
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 ps 확인.

## 내린 결정
- 아이콘 — Resources/Art/UI 임포트+Resources.LoadAll 이름 조회. 셀 이름=데이터 키 규칙이라 매핑 자동. 폴백 null-safe.
- 파티클 — 코드 UI 버스트(FxManager). 자동 부트스트랩+GameEvents(GameScreen 무수정).
- 테마 — UiTheme 정적 팔레트 중앙화. 카이로소프트 밝은 톤. 색 조정은 한 파일.
- 폰트 — Resources/Fonts/UiFont(Noto Sans KR) dynamic 로드, 실패 시 레거시 폴백. TMP는 더 후순위.

## 이번 세션 수정 파일
- 커밋됨 — 897700d(아이콘), 748d1a8(파티클), eb23a22(테마: UiTheme+UiFactory+GameScreen)
- 커밋 예정 — Resources/Fonts/UiFont.ttf(Noto Sans KR, 10MB) + UiFactory.cs(폰트 로드 교체)

## 검증 증거
- [x] 아이콘 — EditMode 21/21, 슬라이스 51. 897700d
- [x] 파티클 — EditMode 21/21. 748d1a8
- [x] 테마 — EditMode 21/21, 컴파일 0. eb23a22
- [x] 폰트 — init.sh EditMode 21/21, TrueTypeFontImporter dynamic 임포트 OK, 컴파일 0
- [~] 에디터 시각 확인 — 남음(GUI). 아이콘 셀+테마+파티클+한글 선명도 한 번에
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources만

## 다음 세션 메모
한글폰트 커밋 후 상태. 에디터 ▶ 플레이로 전체 시각 확인 → 미세조정 → feat-005 플랫폼. ④ BGM은 오디오 에셋 후. 상세는 session-handoff.md.
