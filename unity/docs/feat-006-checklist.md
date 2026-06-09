# feat-006 체크리스트 — Claude Design 첫 화면 반영

블록별. 각 블록은 EditMode 그린 + additive(Core/Systems/Save 빈 diff 지향) 후 커밋. 정본·결정은 `feat-006-context-notes.md`.

## Block A — 경쟁사·시장·전국 랭킹 시스템 (헤드리스 + 테스트) ✅ 완료
- [x] data/competitors.json → CompetitorDef 스키마 + 임포터 + SO 12종 (locales/ko.json 표시명 해석)
- [x] React simulation.ts 시장 함수 정독 (getPlayerCompetitiveScore/MarketShare/MarketRankings)
- [x] MarketService — 점유율·경쟁권 순위 계산 (헤드리스, UnityEngine.UI 비의존)
- [x] ScoreboardRanking — DeriveNationalRanking + BuildScoreboardMarquee 포팅
- [x] GameModel에 CompetitorStates + MarketShareHistory 추가 (월 정산 시 append, save v2 마이그레이션)
- [x] EditMode 테스트 — MarketTests 8종 (순위·점유율·진입·마퀴·세이브 라운드트립). 29/29 통과

## Block B — LED 전광판 UI (CD-1)
- [ ] 전광판 패널 — 다크 LED, 도트매트릭스, 글로우, 하드섀도
- [ ] 상단 — `전국 AI 기업 랭킹` 태그 + LIVE 점멸 뱃지 (코루틴 1.4s)
- [ ] 랭크 행 — 골드 `#랭크` + `/ N,NNN사` + ▲/▼/— 델타 색분기
- [ ] 마퀴 — 우→좌 흐름 (코루틴 13s 루프), 클리핑
- [ ] 오피스 씬 상단에 배치, officeFrac 유지
- [ ] EditMode 그린 + 커밋

## Block C — 코어3 자원 HUD + ＋트레이 + 목표 리본 (CD-2)
- [ ] 코어 3 칩 (cash 초록/나머지 골드, 아이콘+값+델타, 임계 빨강)
- [ ] 레벨 크레스트 `N★`
- [ ] ＋트레이 토글 + 보조 5자원 팝오버
- [ ] 목표 리본 좌하단 (이번 달 목표)
- [ ] 꾸미기 버튼 우상단
- [ ] 기존 세로 HUD에서 칩 HUD로 전환

## Block D — 캐릭터·씬 생동감
- [ ] 직원 스프라이트 idle/work 애니메이션 (프레임 사이클 또는 미세 바운스)
- [ ] 패널/모달 등장 트랜지션 (UiTween.FadeIn + 스케일)
- [ ] 탭 전환 페이드
- [ ] (선택) 배경 미세 모션/패럴랙스

## Block E — 메뉴·내비 재구성 (CD-3, office-first)
- [ ] 하단 도크 4코어 탭 (운영·회사·성장·시장) + 다음행동 FAB
- [ ] 보조 메뉴 드로어 그룹
- [ ] 더보기 우상단 칩
- [ ] officeFrac ≥ 0.40 회귀 확인

## 진행 로그
- 2026-06-09 — 계획 수립, reports/ 정본 정독, 추적 문서 작성. 시작 트랙 결정 대기.
