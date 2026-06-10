# feat-007 체크리스트 — 리플레이성 척추 포팅

정본 설계는 `feat-007-context-notes.md`. 검증 하네스 사용법은 `feat-006-checklist.md`(헤드리스 캡처) 참조.

## 블록 #1 — 런 모디파이어 기반
- [ ] RunModifierOptionDef + RunTagEffectsConfig SO 스키마
- [ ] DataImporter.ImportRunModifiers (40 옵션 + tag_effects 40종, DataCatalog 반영)
- [ ] Core.RunModifiersState (challengeTier "standard" 예약 포함)
- [ ] Systems.RunModifierService — FNV-1a 시드 결정론 선택 + 시작 델타(클램프)
- [ ] SaveService runModifiers 라운드트립 + 구세이브 위생 처리
- [ ] SimulationContext 선택적 입력 (기본 런 동작 불변)
- [ ] EditMode 테스트 — 결정론/기본런 무델타/명시 선택 델타/세이브 마이그레이션
- [ ] `./init.sh` 통과 (베이스라인 29 + 신규)

## 블록 #2 — 월간 틱 훅
- [ ] MonthController에 tag_effects 합산 단계 (additive, 표준 런 효과 0)
- [ ] 36개월 표준 플레이스루 결과 불변 테스트

## 블록 #3 — 연중 세계 이벤트
- [ ] world_events.json 임포트 (26종)
- [ ] WorldEventService — 시드 파생 연 1건 + 히스토리 중복 방지
- [ ] 세이브 필드 + 테스트

## 블록 #4 — 세계 뽑기 리빌 UI
- [ ] 새 런 리빌 연출 (4축 카드, UiTween)
- [ ] ScreenshotCaptureTests 캡처 육안 대조

## 종료 조건
- [ ] feature_list.json / progress.md 갱신 + 커밋
