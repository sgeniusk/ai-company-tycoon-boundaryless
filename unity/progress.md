# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-004 상업 연출. 사운드·모션·아이콘·파티클·테마 코드 완료. **남은 건 에디터 시각 확인 + ④ BGM(오디오 에셋 블로커).**
**현재 목표** — feat-004 비주얼로 상업적 외형을 입힌다. (아이콘 → 파티클 → 테마 완료, BGM/URP만 남음)

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO 자산
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance 재현 + 36개월
- [x] feat-003 Vertical Slice UI — 세로 uGUI + SceneBuilder + SaveService. Game.unity
- [x] feat-004 사운드(SFX 7종+AudioManager) + 모션(Ticker/Tween). EditMode 21/PlayMode 2
- [x] feat-004 아이콘 — 자원 HUD(v071)+도메인/제품(v079)+능력(v080), 슬라이스 51. 커밋 897700d
- [x] feat-004 파티클 — FxManager 색종이 버스트(출시/승급/능력/도메인). 커밋 748d1a8
### 진행 중 (What's In Progress)
- [~] feat-004 카이로소프트 테마 — UiTheme 중앙 팔레트(크림 배경/틸 헤더/흰 카드/그린 버튼/골드 강조/진한 텍스트), UiFactory+GameScreen 전면 적용. 코드+EditMode 21/21. 에디터 색감 확인 남음
- [ ] feat-004 남음 — ④ BGM(외부 AI/CC0 루프 = 에셋 블로커) ⑤ URP 2D 파이프라인 에셋(후순위)

## 다음 (What's Next)
1. 에디터 ▶ 플레이 시각 확인 — 아이콘 셀 위치 + 테마 색감/대비 + 출시·승급 파티클
2. feat-005 플랫폼 — Android/iOS 빌드, 세이프에어리어 (④ BGM은 오디오 에셋 확보 후)
3. 필요 시 테마 미세조정(색감은 시각 확인 후)

## 블로커 / 리스크
- [ ] 시각 미확인 — 아이콘 셀 매핑 + 테마 색 대비 + 파티클은 에디터 플레이로 최종 확인 필요. 컴파일/슬라이스는 통과.
- [ ] BGM 에셋 블로커 — ④ BGM은 AI/CC0 루프 오디오 파일 필요(절차적 SFX와 별개). 확보 전 진행 불가.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 `ps ... [U]nity ... projectpath` 확인.
- [ ] 입력 백엔드 — activeInputHandler=0(Old). Both(2) 미적용.

## 내린 결정
- 아이콘 — Resources/Art/UI 임포트(IconAtlasImporter)+Resources.LoadAll 이름 조회(IconLibrary). 셀 이름=데이터 키 규칙이라 매핑 자동. 폴백 null-safe.
- 파티클 — 코드 UI 버스트(FxManager). 자동 부트스트랩+GameEvents 구독(GameScreen 무수정). ParticleSystem/DOTween 불필요.
- 테마 — UiTheme 정적 팔레트로 색 중앙화. 카이로소프트식 밝은 톤. UiFactory(라벨/버튼)+GameScreen(패널/탭/텍스트) 전면 적용. 색 조정은 한 파일에서.
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브.

## 이번 세션 수정 파일
- 커밋됨 — 897700d(아이콘: IconAtlasImporter/IconLibrary/Art/UiFactory.Icon/GameScreen), 748d1a8(파티클: FxManager)
- 커밋 예정 — UiTheme.cs(신규 팔레트) + UiFactory.cs(라벨/버튼 색) + GameScreen.cs(패널/탭/텍스트 색)

## 검증 증거
- [x] 아이콘 — EditMode 21/21, 슬라이스 51(24/15/12). 커밋 897700d
- [x] 파티클 — EditMode 21/21. 커밋 748d1a8
- [x] 테마 — `./init.sh` EditMode 21/21, 컴파일 에러 0. UiTheme/UiFactory/GameScreen 정상 빌드
- [~] 에디터 시각 확인 — 남음(GUI). 아이콘 셀+테마 색감+파티클 한 번에 확인 권장
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources만

## 다음 세션 메모
테마 커밋 후 상태. 에디터 ▶ 플레이로 아이콘·테마 색감·파티클 시각 확인 → 필요 시 UiTheme 색 미세조정 → feat-005 플랫폼. ④ BGM은 오디오 에셋 확보 후. 상세는 session-handoff.md.
