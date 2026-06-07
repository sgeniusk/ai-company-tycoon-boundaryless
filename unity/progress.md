# 진행 로그 — Unity Port

재시작 상태용이다. 전체 이력 아님. 오래된 증거는 CHANGELOG로. (≤120줄)

## 현재 상태 (Current State)
**마지막 갱신** — 2026-06-07
**활성 피처** — feat-002 코어 시뮬레이션 완료·검증 통과. 다음은 feat-003 Vertical Slice 모바일 UI.
**현재 목표** — 헤드리스 코어를 세로 모바일 uGUI에 연결해 실기기에서 도는 VS를 만든다.

## 상태 (Status)
### 완료 (What's Done)
- [x] P0 Project Setup — Unity 6000.4.10f1, URP17.4/2D/Input/TMP/Test, 세로 모드, asmdef, 코어 시드, 하네스
- [x] feat-001 Data Pipeline — 스키마 9종 + 임포터/DataCatalog/MiniJson/테스트. 120 SO 자산 + DataCatalog
- [x] feat-002 Core Simulation — GameModel + 10 서비스 + MonthController 헤드리스. balance 공식 재현 + 36개월 플레이스루. EditMode 15/15 통과
### 진행 중 (What's In Progress)
- [ ] (없음 — feat-003 착수 대기)
### 다음 (What's Next)
1. feat-003 Vertical Slice 모바일 UI — 세로 uGUI(자원 HUD/탭/다음달/요약/이벤트 모달/세이브), GameEvents로 코어 연결. 아키텍처는 Claude, 뷰/프리팹 보일러플레이트는 Codex
2. URP 2D 파이프라인 에셋 생성·할당 (UI 착수 직전)
3. SaveService (GameModel 직렬화 → persistentDataPath)

## 블로커 / 리스크
- [ ] 운영 규칙 — Unity batchmode 검증은 한 번에 하나만. 다른 Unity 인스턴스 실행 중이면 대기한다 (동시 실행 시 라이선스 단일 인스턴스 핸드셰이크 루프, 2026-06-07 확인).
- [ ] DOTween 미설치 — P5 OpenUPM. URP 2D 파이프라인 에셋 미할당(빌트인으로 동작).

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브, 패키지 최소 세트.
- 데이터는 JSON→SO 임포트(MiniJson). 자동화 월별효과는 SO로 데이터화.
- 월 틱 순서는 Unity식으로 정리 — 비용·매출을 같은 틱에서 정산(Godot 시그널 순서 quirk 제거).

## 이번 세션 수정 파일
- feat-002 — Systems/ 13파일(서비스 10 + ThresholdEval/Rng/MonthController/SimulationContext) + SimulationTests + Systems asmdef + Tests asmdef 참조 추가.

## 검증 증거
- [x] `./init.sh` → EditMode 15/15 passed (코어 시뮬레이션 + 데이터 + 모델)
- [x] feat-001 — DataImporter.ImportAll exit 0, 120 SO 자산 + DataCatalog
- [x] 스코프 — data/·루트·Schema 미변경

## 다음 세션 메모
`cd unity && ./init.sh` (다른 Unity 인스턴스 미실행 시). 이후 feat-003 VS UI 착수 — 코어는 `SimulationContext.Create(catalog)`로 진입한다.
