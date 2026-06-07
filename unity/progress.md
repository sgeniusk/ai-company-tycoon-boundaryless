# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-07
**활성 피처** — feat-004 상업 연출 진행 중. 사운드·모션 완료, 에디터 플레이 확인. 다음 = 아이콘 적용.
**현재 목표** — feat-004 비주얼(아이콘 → 파티클 → BGM → 테마)로 상업적 외형을 입힌다.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 코어 시드, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson. 120 SO 자산
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController. balance 재현 + 36개월 플레이스루
- [x] feat-003 Vertical Slice UI — 세로 uGUI + SceneBuilder + SaveService. Game.unity, EditMode 19/19
- [x] feat-004 사운드(절차적 SFX 7종 + AudioManager) + 모션(ResourceTicker 카운트업, UiTween 펀치). EditMode 21/21 + PlayMode 2/2. 에디터 플레이 확인(동작 OK)
### 진행 중 (What's In Progress)
- [ ] feat-004 상업 연출 — 남음(우선순위 순) — ① 아이콘 적용(public/assets → SpriteAtlas) ② 파티클(출시·승급) ③ BGM 통합 ④ URP 2D 파이프라인 에셋 ⑤ 카메라·카이로소프트식 테마
### 다음 (What's Next)
1. feat-004 아이콘 적용 — public/assets 아틀라스를 임포트해 카드·HUD 텍스트/이모지를 스프라이트로. 외형 점프 가장 큼
2. 파티클 + BGM 통합
3. feat-005 플랫폼 — Android/iOS 빌드, 세이프에어리어

## 블로커 / 리스크
- [ ] 외형 미니멀 — VS는 기능만 된 코드 UI. 아트 미적용이라 React/카이로소프트와 달라 보이는 게 정상. ①번 작업이 해소.
- [ ] 입력 백엔드 — 현재 activeInputHandler=0(Old), 레거시 UI 클릭 동작. 경고 제거 + 양쪽 동작하려면 Active Input Handling을 Both(2)로 (다음 세션 적용 권장, 미적용).
- [ ] 운영 규칙 — Unity batchmode 검증은 한 번에 하나만. 다른 Unity 인스턴스 실행 중이면 대기.
- [ ] BGM 미정(AI/CC0). DOTween 미설치(필요 시 OpenUPM). URP 2D 파이프라인 에셋 미할당(빌트인 동작).

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브, 패키지 최소 세트.
- 데이터는 JSON→SO 임포트(MiniJson). 자동화 월별효과 데이터화. 월 틱은 비용·매출 같은 틱 정산.
- VS UI는 프로그래매틱 레거시 uGUI(TMP는 후속). SFX 코드 생성, 모션 코드 트윈(DOTween 불필요).

## 이번 세션 수정 파일 (커밋됨)
- feat-004 사운드 — Presentation/(SfxGen, AudioManager) + SfxGenTests.
- feat-004 모션 — UI/(UiTween, ResourceTicker) + GameScreen/UiFactory 배선.
- feat-003 — UI/(UiFactory/GameScreen/GameBootstrap), Editor/SceneBuilder, Save/, Core/ResourceFormat, PlayMode 테스트, Game.unity.

## 검증 증거
- [x] `./init.sh` → EditMode 21/21 passed (UI 포함 전체 컴파일)
- [x] PlayMode 2/2 passed — 부트스트랩→화면→다음달, 저장→불러오기
- [x] 에디터 ▶ 플레이 — 루프·세이브·카운트업·펀치·효과음 동작 확인
- [x] git — origin/main 전부 푸시, 로컬=원격
- [x] 스코프 — data/·루트·Schema·코어 미수정

## 다음 세션 메모
`cd unity && git pull` → (다른 Unity 미실행 시) `./init.sh` → 아이콘 적용부터. 상세는 session-handoff.md.
