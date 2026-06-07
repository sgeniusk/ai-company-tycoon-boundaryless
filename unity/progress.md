# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-08
**활성 피처** — feat-004 상업 연출. 사운드·모션·아이콘 완료(아이콘 커밋 897700d). **파티클 — 출시·승급·능력·도메인 색종이 버스트(FxManager) 코드 완료 + EditMode 21/21. 에디터 시각 확인만 남음.**
**현재 목표** — feat-004 비주얼(아이콘 → 파티클 → BGM → 테마)로 상업적 외형을 입힌다.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO 자산
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance 재현 + 36개월
- [x] feat-003 Vertical Slice UI — 세로 uGUI + SceneBuilder + SaveService. Game.unity
- [x] feat-004 사운드(SFX 7종+AudioManager) + 모션(Ticker/Tween). EditMode 21/PlayMode 2
- [x] feat-004 아이콘 — 자원 HUD(v071)+도메인/제품(v079)+능력(v080), 슬라이스 51 스프라이트. 커밋 897700d
### 진행 중 (What's In Progress)
- [~] feat-004 파티클 — FxManager 색종이 버스트(출시/승급/능력/도메인). 자동 부트스트랩+GameEvents 구독, GameScreen 무수정. 코드+EditMode 21/21, 에디터 시각 확인 남음
- [ ] feat-004 남음 — ④ BGM(외부 AI/CC0 루프 필요 = 에셋 블로커) ⑤ URP 2D 파이프라인 에셋 ⑥ 카이로소프트식 테마

## 다음 (What's Next)
1. 에디터 ▶ 플레이로 아이콘·파티클 시각 확인
2. feat-004 ⑤ URP 2D 파이프라인 에셋 또는 ⑥ 테마 (④ BGM은 오디오 에셋 확보 후)
3. feat-005 플랫폼 — Android/iOS 빌드

## 블로커 / 리스크
- [ ] 시각 미확인 — 아이콘 셀 위치 + 파티클 버스트는 에디터 플레이로 최종 확인 필요(컴파일/슬라이스는 통과).
- [ ] BGM 에셋 블로커 — ④ BGM은 AI/CC0 루프 오디오 파일이 있어야 함(절차적 SFX와 별개). 확보 전 진행 불가.
- [ ] 검증 환경 — 다른 프로젝트 Codex가 Unity 점유 시 batchmode 막힘. 검증 전 `ps ... [U]nity ... projectpath` 확인.
- [ ] 입력 백엔드 — activeInputHandler=0(Old). Both(2) 미적용. URP 2D 파이프라인 에셋 미할당(빌트인).

## 내린 결정
- 아이콘 — Resources/Art/UI 임포트(IconAtlasImporter)+Resources.LoadAll 이름 조회(IconLibrary). 셀 이름=데이터 키 규칙(ui_*/domain_*/cap_*)이라 매핑 자동. 폴백 null-safe.
- 파티클 — 코드 기반 UI 버스트(FxManager). AudioManager식 자동 부트스트랩+GameEvents 구독, UiTween식 unscaledDeltaTime 코루틴. 전용 오버레이 Canvas(sortingOrder 200, raycast off). ParticleSystem/DOTween 불필요.
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브.

## 이번 세션 수정 파일
- 커밋됨(897700d) — IconAtlasImporter.cs, IconLibrary.cs, Resources/Art/UI 3아틀라스+슬라이스, UiFactory.Icon, GameScreen 아이콘 배선
- 커밋 예정 — Assets/_Project/Scripts/UI/FxManager.cs (색종이 버스트 연출기, 신규) + 문서 3종

## 검증 증거
- [x] 아이콘 — EditMode 21/21, ImportAll 슬라이스 51(24/15/12). 커밋 897700d
- [x] 파티클 — `./init.sh` EditMode 21/21, 컴파일 에러 0. FxManager 정상 빌드
- [~] 에디터 시각 확인 — 남음(GUI). 출시/승급 시 버스트, HUD/카드 아이콘 확인 권장
- [x] 스코프 — data/·루트·Core/Systems/Save·Schema 미수정. UI/Editor/Resources만. 파티클은 FxManager 독립(GameScreen 무수정)

## 다음 세션 메모
파티클(FxManager) 커밋 후 상태. 에디터 ▶ 플레이로 아이콘·파티클 확인 → feat-004 ⑤ URP 2D 파이프라인 또는 ⑥ 테마. ④ BGM은 오디오 에셋 확보 후. 상세는 session-handoff.md.
