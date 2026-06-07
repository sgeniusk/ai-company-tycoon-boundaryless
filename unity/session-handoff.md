# 세션 핸드오프 — Unity Port 부트스트랩

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계. P0 완료, P1 착수 준비.
- 현재 상태 — `unity/` 프로젝트 + 패키지 + 하네스 + 코어 시드 완료.
- 브랜치 / 커밋 — main (미커밋, 사용자 확인 후 커밋)

## 이번 세션 완료
- [x] Unity 6 프로젝트 생성 + 패키지(URP/2D/Input/TMP/Test) + 세로 설정
- [x] asmdef 구조 + 코어 시드(GameModel/ResourceId/GameEvents/ResourceDef) + 스모크 테스트
- [x] Unity 전용 하네스 6종 + .gitignore

## 검증 증거
| 체크 | 명령 / 경로 | 결과 | 메모 |
|---|---|---|---|
| 프로젝트 생성 | batchmode createProject | exit 0 | ProjectSettings + Library |
| 패키지 | HarnessSetup.Setup | OK | URP17.4 / input1.19 / ugui2.0 / test1.6 |
| 테스트 | ./init.sh | progress.md 참고 | EditMode 스모크 |

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 허브 시작, 패키지 최소 세트.

## 블로커 / 리스크
- DOTween 미설치(P5 OpenUPM). URP 2D 파이프라인 에셋 미할당(기본 빌트인으로 동작, UI/빌드 직전 할당).

## 다음 세션 시작 (Next Session)
1. `cd unity && cat CLAUDE.md AGENTS.md`
2. `./init.sh`로 검증
3. feat-001 착수 — 아래 권장 단계 참고

## 권장 다음 단계 (Recommended Next Step)
feat-001 데이터 파이프라인. Claude가 SO 스키마(ProductDef / CapabilityDef / DomainDef / UpgradeDef / AutomationDef / GameEventDef / CompanyStageDef / BalanceConfig) 스펙을 확정한 뒤, JSON→SO Editor 임포터 + DataCatalog 구현을 Codex(reasoning 매우 높음)에 위임한다. 원본은 `../data/*.json`, 정답지는 `../scripts/systems/*.gd`다.
