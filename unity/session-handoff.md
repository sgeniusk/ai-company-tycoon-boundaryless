# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — feat-004 사운드·모션·아이콘·파티클·테마·한글폰트 코드 완료. **남은 건 에디터 시각 확인 + ④ BGM(오디오 에셋 블로커).**
- 브랜치 / 커밋 — `main`. 아이콘=897700d, 파티클=748d1a8, 테마=eb23a22 커밋됨. 한글폰트=커밋 예정. push 안 함(로컬).

## 이번 세션 한 일 (feat-004 비주얼)
- 아이콘 — IconAtlasImporter+IconLibrary+UiFactory.Icon+GameScreen. v071/v079/v080 슬라이스 51. 폴백 null-safe. 897700d.
- 파티클 — FxManager 색종이 버스트(출시/승급/능력/도메인). 자동 부트스트랩+GameEvents(GameScreen 무수정). 748d1a8.
- 테마 — UiTheme 카이로소프트 밝은 팔레트. UiFactory+GameScreen 전면. eb23a22.
- 한글 폰트 — 레거시 Arial은 한글이 없어 OS fallback→자글거림. Noto Sans KR(Resources/Fonts/UiFont, 10MB, OFL) 도입, UiFactory.LegacyFont가 로드(실패 시 레거시 폴백). 커밋 예정.

## 검증 (컴파일/테스트 통과, 시각 남음)
- init.sh EditMode 21/21 — 아이콘/파티클/테마/폰트 각각 통과, 컴파일 에러 0. 아이콘 슬라이스 51. 폰트 TrueTypeFontImporter dynamic 임포트.
- 남음 — 에디터 ▶ 플레이로 시각 확인(아이콘 셀, 테마 색, 파티클, 한글 선명도). batchmode 불가.

## 내린 결정
- 아이콘 Resources/Art/UI + LoadAll. 파티클 FxManager 독립. 테마 UiTheme 중앙화. 폰트 Resources/Fonts/UiFont(Noto KR) dynamic, 레거시 폴백.
- 모노레포 unity/, 코어 헤드리스 C#, GameEvents 허브.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull`
2. 다른 Unity 미실행 확인 — `ps -axo command | grep "[U]nity.app/Contents/MacOS/Unity " | grep -i projectpath`
3. 에디터 ▶ 플레이 — HUD/카드 아이콘 + 카이로소프트 색감 + 파티클 + 한글 선명도 확인
4. 색/폰트 미세조정(UiTheme.cs / 폰트 크기) → feat-005 플랫폼(Android/iOS) 착수

## 권장 다음 단계 (Recommended Next Step)
에디터 시각 확인 → 필요 시 UiTheme 색·폰트 조정 → feat-005 플랫폼. ④ BGM은 AI/CC0 루프 오디오 에셋 확보 후 AudioManager.bgmClip(에셋 블로커). ⑤ URP 후순위. 폰트 10MB는 추후 한글 subset로 경량화 가능. 반복성 큰 부분은 docs/codex-handoff/ 패턴으로 Codex 위임.
