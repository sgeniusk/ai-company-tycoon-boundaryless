# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — v0.1 Vertical Slice 완성 + feat-004(사운드·모션)까지 완료·검증. **에디터에서 실제 플레이 확인 — 동작 OK, 외형은 미니멀(아트 미적용, 정상).**
- 브랜치 / 커밋 — `main`, origin/main에 전부 푸시됨(작업 시작 시 `git pull`).

## 완료 (지금까지)
- [x] P0 프로젝트 셋업 (Unity 6000.4.10f1, URP/2D/Input/TMP/Test, 세로, asmdef, 하네스)
- [x] feat-001 데이터 파이프라인 (스키마 9종 + 임포터 + DataCatalog, 120 SO 자산)
- [x] feat-002 코어 시뮬레이션 (GameModel + 10 서비스 + MonthController, balance 재현)
- [x] feat-003 Vertical Slice UI (세로 uGUI + SceneBuilder + SaveService, Game.unity)
- [x] feat-004 일부 — 사운드(SfxGen 절차적 SFX + AudioManager) + 모션(ResourceTicker 카운트업 + UiTween 펀치)

## 검증 증거
| 체크 | 결과 |
|---|---|
| EditMode | 21/21 passed |
| PlayMode | 2/2 passed |
| 에디터 플레이 | Game.unity ▶ 동작 확인(루프·세이브·카운트업·펀치) |
| git | origin/main 전부 푸시 완료 |

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브.
- 데이터 JSON→SO(MiniJson). 월 틱은 비용·매출 같은 틱 정산. UI는 프로그래매틱 레거시 uGUI(TMP는 후속).
- SFX는 코드 생성(소유). 모션은 코드 트윈(DOTween 불필요).

## 블로커 / 운영 (다음 세션이 먼저 처리)
- **외형이 미니멀한 건 정상** — VS는 기능만 된 코드 UI다. `public/assets` 아트 아틀라스가 아직 미연결이라 React/카이로소프트와 달라 보인다. 다음 작업이 외형을 채운다.
- **입력 백엔드 — Both 적용 권장(미적용)** — 에디터 첫 실행 시 새 Input System 경고가 뜬다. 현재 activeInputHandler=0(Old)이라 레거시 UI 클릭은 동작한다. Player Settings ▸ Active Input Handling을 **Both**로 바꾸면 경고가 사라지고 양쪽 동작한다(에디터 닫고 ProjectSettings `activeInputHandler:2`로 바꿔도 됨).
- Unity batchmode 검증은 한 번에 하나만 — 다른 Unity 인스턴스(`titan breacker`, `sam defender logue`) 실행 중이면 라이선스 충돌. 비었는지 확인 후 검증.
- BGM 미정(AI/CC0 루프 → `AudioManager.bgmClip`). DOTween 미설치(필요 시 OpenUPM). URP 2D 파이프라인 에셋 미할당(빌트인 동작).

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. `cat CLAUDE.md AGENTS.md progress.md` 로 컨텍스트 로드
3. 다른 Unity 미실행 확인 후 `./init.sh` (EditMode 21 baseline)
4. `feature_list.json`에서 피처 선택

## 권장 다음 단계 (Recommended Next Step)
**feat-004 — 아이콘 적용부터.** `public/assets`(제품·도메인·능력·UI·경쟁사·헬퍼·브랜드 아틀라스)를 Unity로 임포트해 SpriteAtlas로 묶고, 카드·HUD의 텍스트/이모지를 스프라이트로 교체한다 — 체감 외형 점프가 가장 크다. 이어서 파티클(출시·승급 버스트) → BGM 통합 → URP 2D 파이프라인 에셋 → 카이로소프트식 테마/레이아웃. 반복성 큰 부분은 `docs/codex-handoff/` 패턴으로 Codex(reasoning 매우 높음) 위임, 검증은 Claude가 `./init.sh`로 마감.
