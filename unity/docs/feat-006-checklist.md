# feat-006 체크리스트 — Claude Design 첫 화면 반영

블록별. 각 블록은 EditMode 그린 + additive(Core/Systems/Save 빈 diff 지향) 후 커밋. 정본·결정은 `feat-006-context-notes.md`.

## Block A — 경쟁사·시장·전국 랭킹 시스템 (헤드리스 + 테스트) ✅ 완료
- [x] data/competitors.json → CompetitorDef 스키마 + 임포터 + SO 12종 (locales/ko.json 표시명 해석)
- [x] React simulation.ts 시장 함수 정독 (getPlayerCompetitiveScore/MarketShare/MarketRankings)
- [x] MarketService — 점유율·경쟁권 순위 계산 (헤드리스, UnityEngine.UI 비의존)
- [x] ScoreboardRanking — DeriveNationalRanking + BuildScoreboardMarquee 포팅
- [x] GameModel에 CompetitorStates + MarketShareHistory 추가 (월 정산 시 append, save v2 마이그레이션)
- [x] EditMode 테스트 — MarketTests 8종 (순위·점유율·진입·마퀴·세이브 라운드트립). 29/29 통과

## Block B — LED 전광판 UI (CD-1) ✅ 코드 완료 (시각 확인 대기)
- [x] 전광판 패널 — 다크 그린 LED(ScoreboardBg #101f1d), 하드 배치 (도트매트릭스 텍스처는 backlog)
- [x] 상단 — `전국 AI 기업 랭킹` 태그(청록) + LIVE 점멸 뱃지 (LiveBlink, 1.4s steps)
- [x] 랭크 행 — 골드 `#랭크`(44pt) + `/ N,NNN사` + ▲/▼/— 델타 색분기(초록/로즈/회색)
- [x] 마퀴 — 우→좌 흐름 (Marquee 컴포넌트, 13s, RectMask2D 클리핑)
- [x] 오피스 씬 상단(ResourceHud 아래)에 배치
- [x] EditMode 29/29 그린
- [ ] 에디터 ▶ 시각 확인 — LED 가독·LIVE 점멸·마퀴 흐름 (사용자 Play)
- 남음(backlog) — 도트매트릭스/스캔라인 텍스처, 모바일 컴팩트 푸트프린트

## Block C — 코어3 자원 HUD + ＋트레이 + 목표 리본 (CD-2) ✅ 코드 완료 (시각 확인 대기)
- [x] 코어 3 칩 (cash 초록/나머지 골드, 아이콘+값+델타, 임계 빨강) — 청록 Outline 보더
- [x] 레벨 크레스트 `N★` (회사 단계 order 기반)
- [x] ＋트레이 토글 + 보조 5자원 (인라인 행, 열 때 값 스냅) — 팝오버 대신 인라인(레이아웃-스택 안정성)
- [x] 목표 리본 (이번 달 목표, guidance 없어 휴리스틱 — 첫제품/자금/신뢰/능력강화/점유율)
- [x] 꾸미기 버튼 (🎨, 준비 중 status 플레이스홀더 — Unity엔 꾸미기 시스템 없음)
- [x] 기존 세로 8-리스트 HUD → 컴팩트 칩 스트립으로 전환. EditMode 29/29
- [ ] 에디터 ▶ 시각 확인 — 칩 가독·트레이 토글·목표 리본
- 분기 메모 — CD-2의 '오피스 위 떠있는 팝오버/좌하단 리본'은 Block E(free-float 레이아웃)로. 지금은 스택 내 컴팩트화

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
