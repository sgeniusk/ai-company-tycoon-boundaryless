# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-07
**활성 피처** — feat-003 완전 마감(컴파일 + EditMode 19 + PlayMode 2). v0.1 Vertical Slice 완성·런타임 검증.
**현재 목표** — VS 플레이 검증 후 feat-004 상업 연출 또는 feat-005 플랫폼 빌드로 진행.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 코어 시드, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO 자산
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance 재현 + 36개월 플레이스루
- [x] feat-003 Vertical Slice UI — 세로 uGUI(UiFactory/GameScreen/GameBootstrap) + SceneBuilder + SaveService/ResourceFormat. Game.unity 생성, EditMode 19/19, 전체 컴파일 통과
### 진행 중 (What's In Progress)
- [ ] (없음 — 다음 피처 선택 대기)
### 다음 (What's Next)
1. VS 플레이 검증 — Game.unity 열고 Play (입력 Old 활성이라 클릭 동작). PlayMode 스모크 테스트로 런타임 배선 확인 중
2. feat-004 상업 연출 — 사운드/DOTween/파티클/카메라/햅틱/로컬라이즈, public/assets 아이콘 SpriteAtlas, URP 2D 파이프라인 에셋
3. feat-005 플랫폼 — Android/iOS 빌드, 세이프에어리어

## 블로커 / 리스크
- [x] 입력 백엔드 — activeInputHandler=0(Old)이라 StandaloneInputModule로 클릭 동작(블로커 아님). 새 Input System 게임플레이가 필요하면 Both(2)로 전환.
- [ ] 운영 규칙 — Unity batchmode 검증은 한 번에 하나만. 다른 Unity 인스턴스 실행 중이면 대기(동시 실행 시 라이선스 단일 인스턴스 핸드셰이크 루프).
- [ ] DOTween 미설치(P5 OpenUPM). URP 2D 파이프라인 에셋 미할당(빌트인 동작).

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브, 패키지 최소 세트.
- 데이터는 JSON→SO 임포트(MiniJson). 자동화 월별효과 데이터화. 월 틱은 비용·매출 같은 틱 정산.
- VS UI는 프로그래매틱 레거시 uGUI(TMP는 P5에서). 화면은 SimulationContext + GameEvents에 배선.

## 이번 세션 수정 파일
- feat-003 — UI/(UiFactory/GameScreen/GameBootstrap + asmdef), Editor/SceneBuilder, Save/(SaveService/SaveData), Core/ResourceFormat, EditMode 테스트 2종, Game.unity.

## 검증 증거
- [x] `SceneBuilder.CreateGameScene` → rc=0, Game.unity 생성
- [x] `./init.sh` → EditMode 19/19 passed, UI 포함 전체 컴파일 통과
- [x] PlayMode 2/2 passed — 부트스트랩→화면빌드→다음달 진행, 저장→불러오기 라운드트립(런타임 배선)
- [x] feat-002/001 — 코어 15/15, 임포트 120 SO 자산
- [x] 스코프 — data/·루트·Schema·코어 미수정(Codex는 UI/Editor만 추가)

## 다음 세션 메모
`cd unity && ./init.sh`(다른 Unity 미실행 시). VS 플레이는 Game.unity 열고 입력 백엔드 Both 설정 후 Play. 이후 feat-004/005.
