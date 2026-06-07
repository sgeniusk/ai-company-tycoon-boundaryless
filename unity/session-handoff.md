# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — v0.1 VS + feat-004 사운드·모션 완료. **feat-004 아이콘 적용 코드 완료 + 검증 통과(EditMode 21/21, 슬라이스 51 스프라이트). 에디터 시각 확인만 남음.**
- 브랜치 / 커밋 — `main`, origin/main 동기화(HEAD d3356a2). 아이콘 변경은 **미커밋**(시각 확인 후 커밋 예정).

## 이번 세션 한 일 (아이콘 적용 1·2차)
- 정답지 — public/assets/ui/v07x-*-atlas.png(48px 균일 그리드). generate-*.mjs drawings 배열이 셀 순서. v071 0-7=자원((int)ResourceId), v079 0-14=도메인(domains.json 순), v080 0-11=능력(capabilities.json 순). 전부 데이터 순서 일치.
- 신규 IconAtlasImporter.cs — 3장을 Resources/Art/UI로 복사+Grid 슬라이스, 셀에 ui_*/domain_*/cap_* 이름. AICT 메뉴 / executeMethod.
- 신규 IconLibrary.cs — Resources.LoadAll로 이름→Sprite. Resource/Domain/Capability 헬퍼.
- UiFactory.Icon — 정사각 아이콘. GameScreen — 자원 HUD + 제품·도메인·능력 카드 배선 + GetResourcePlainName.
- 폴백 안전 — 스프라이트 없으면 null → 아이콘 숨기고 텍스트/이모지 유지.

## 검증 (통과)
- `./init.sh` — EditMode 21/21, 컴파일 에러 0, spritesheet 경고 0. 새 4파일 정상 빌드.
- IconAtlasImporter.ImportAll — exit0. 3 PNG 복사 + .meta 슬라이스 51 스프라이트(24/15/12), 이름 일치.
- 남음 — 에디터 ▶ 플레이로 아이콘 시각 확인(셀 위치·외형). GUI라 batchmode 불가.

## 내린 결정
- 모노레포 unity/ 하위, 코어 헤드리스 순수 C#, 이벤트 정적 GameEvents 허브.
- 아이콘 — Resources/Art/UI 임포트 + Resources.LoadAll 이름 조회. 셀 이름은 데이터 키 규칙(ui_*/domain_*/cap_*)이라 매핑 자동.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. 다른 Unity 미실행 확인 — `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`
3. 에디터 ▶ 플레이 — 자원 HUD·제품·도메인·능력 카드 아이콘 확인
4. 좋으면 커밋(신규 .cs/.meta + Resources/Art + 수정 4파일) → ③ 파티클 착수

## 권장 다음 단계 (Recommended Next Step)
에디터 시각 확인 후 커밋. 이어서 feat-004 ③ 파티클(출시·승급 버스트) → ④ BGM → ⑤ URP 2D 파이프라인 에셋 → ⑥ 카이로소프트식 테마. 반복성 큰 부분은 docs/codex-handoff/ 패턴으로 Codex 위임, 검증은 Claude가 ./init.sh로 마감.
