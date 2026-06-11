# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계.
- 현재 상태 — **feat-012 AI 테크트리 완료** (발견의 사다리 + 51종 트리 + 제품 레벨업·채용·경제 정렬). EditMode **90 통과/0 실패/1 보류**.
- 브랜치 / 커밋 — `main`, 로컬 4커밋(447f43c/d5a0e0b/cd91972/cf62d2b) — **origin 푸시 전** (사용자 확인 후).

## 이번 세션 한 일 (2026-06-11 저녁)
- feat-012 전 블록 — #1 노출 상태 머신(ProductVisibilityService, derive-only 5상태)+제품 팝업 도메인 섹션/???티저/미발견 카운터, #2 teaser 36종+tier+category(Codex), #3 선행 체인+미래 제품 15종=51종(Codex)+그래프 무결성 게이트, #4 능력 다음레벨 미리보기+해금 모먼트 토스트/축하+밸런스 패스.
- 밸런스 패스가 경제 구조 결함 노출 → React 동치 방향으로 3건 선반영: **제품 레벨업**(SaveData v4, 매출+35%/Lv), **RecruitService**(반복 인재 채용 — talent 공급원 부재 해소), **비용 공식 정렬**(자동화 할인 연산비 포함·상한 75%, 하이프 성장 *10 증폭 제거).
- 잔여 격차는 **feat-013 등록**(사용자 방향 결정 대기) — 10년 tier4 시뮬은 Inconclusive 보류.

## 검증 (통과)
- EditMode 91종 — ProductVisibility 16·TechTreeGraph 4·도달성 1(보류) 등 신규 21. React 동치(FNV-1a·세계이벤트·엔딩 픽스처) 전부 유지.
- 캡처 — 03 제품(섹션+???떡밥+T뱃지+상태순 정렬), 04 능력(채용 카드+카테고리 헤더+??? 도메인+미발견 카운터).
- 주의 — 경제 공식 정렬은 게임플레이 영향 있음(이용자 성장 ~1/10로 React 수준, 자동화 가치 상승). 기존 테스트는 전부 통과.

## 내린 결정
- 티저 근접 판정에 보유 가드(lv>=1) — 없으면 시작부터 전 도메인 ??? ("입구는 좁게" 보강, 임계 상수 TeaserProximityLevels=2).
- 능력 팝업 도메인 리스트에도 동일 상태 머신(정보 누출 일관성).
- 루트 React `npm run harness:gate`는 신규 제품 15종으로 고정 기대값 2건 깨짐(물리 제품 수 6→9, 골든 시뮬) — React 트랙은 stale이라 보류, 필요 시 별도 수정.
- 세이브 v4(productLevels) — 구세이브는 출시 제품 레벨 1 파생으로 무손실.

## 다음 세션 시작 (Next Session)
1. `cd unity && git pull` + 다른 Unity 미실행 확인(`ps -axo command | grep "[U]nity.app..." | grep -i projectpath`)
2. `./init.sh` 베이스라인(90 통과/1 보류) 확인
3. **feat-013 경제 완주 가능성** — 사용자 방향 결정 필요: A React 시스템 추가 포팅(사무실 확장/산업 시너지 월간 효과) B Unity 데이터 튜닝 C 혼합. 진단 하네스는 TechTreeReachabilityTests(연도 트레이스 내장).
4. 또는 feat-012 #5(문명식 트리 그래프 화면), 실기기 검증, 도감 열람 UI.

## 권장 다음 단계 (Recommended Next Step)
feat-013이 게임 코어 가치("연구가 차오르면 해금"의 실제 도달 가능성) 직결이라 1순위 후보. 단 게임 느낌을 바꾸는 밸런스라 사용자 체크포인트부터.
