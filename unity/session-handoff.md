# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — v0.1 Vertical Slice 완성 + feat-004(사운드·모션)까지 완료·검증.
- 브랜치 / 커밋 — main (origin/main에 푸시됨, HEAD 8833992).

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
| 임포트 | 120 SO 자산 + DataCatalog |
| git | origin/main 푸시 완료 (8833992) |

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브.
- 데이터 JSON→SO(MiniJson). 월 틱은 비용·매출 같은 틱 정산. UI는 프로그래매틱 레거시 uGUI(TMP는 후속).
- SFX는 코드 생성(소유). 모션은 코드 트윈(DOTween 불필요).

## 블로커 / 운영
- Unity batchmode 검증은 한 번에 하나만 — 다른 Unity 인스턴스 실행 중이면 대기(라이선스 단일 인스턴스).
- BGM 미정 — AI/CC0 루프 파일을 받아 `AudioManager.bgmClip`에 할당해야 함.
- DOTween 미설치(필요 시 OpenUPM). URP 2D 파이프라인 에셋 미할당(빌트인 동작).

## 다음 세션 시작 (Next Session)
1. `cd unity && cat CLAUDE.md AGENTS.md progress.md`
2. 다른 Unity 미실행 확인 후 `./init.sh`
3. `feature_list.json`에서 feat-004 잔여 또는 feat-005 선택

## 권장 다음 단계 (Recommended Next Step)
feat-004 잔여 — 아이콘 적용(`public/assets` 아틀라스 → SpriteAtlas로 카드·HUD 스프라이트), 파티클(출시·승급 버스트), BGM(AI/CC0), URP 2D 파이프라인 에셋. 또는 feat-005 플랫폼 빌드(Android/iOS). 플레이는 `Game.unity` 열고 ▶.
