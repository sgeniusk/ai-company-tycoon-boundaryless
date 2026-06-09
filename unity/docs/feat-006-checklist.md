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
- [x] 시각 확인(헤드리스 캡처) — LED 가독·LIVE 뱃지·#1,965/2,140사·마퀴 내용(`라이벌 '챗지오디' 추월까지 1105계단 · 전국 점유율 8% · 현재 단계` ) 확인. 점멸(LiveBlink)·흐름(Marquee)은 컴포넌트 구동(코드+EditMode). 증거 — `Logs/shots/01-main.png`·`01b-marquee.png`
- 남음(backlog) — 도트매트릭스/스캔라인 텍스처, 모바일 컴팩트 푸트프린트

## Block C — 코어3 자원 HUD + ＋트레이 + 목표 리본 (CD-2) ✅ 코드 완료 (시각 확인 대기)
- [x] 코어 3 칩 (cash 초록/나머지 골드, 아이콘+값+델타, 임계 빨강) — 청록 Outline 보더
- [x] 레벨 크레스트 `N★` (회사 단계 order 기반)
- [x] ＋트레이 토글 + 보조 5자원 (인라인 행, 열 때 값 스냅) — 팝오버 대신 인라인(레이아웃-스택 안정성)
- [x] 목표 리본 (이번 달 목표, guidance 없어 휴리스틱 — 첫제품/자금/신뢰/능력강화/점유율)
- [x] 꾸미기 버튼 (🎨, 준비 중 status 플레이스홀더 — Unity엔 꾸미기 시스템 없음)
- [x] 기존 세로 8-리스트 HUD → 컴팩트 칩 스트립으로 전환. EditMode 29/29
- [x] 시각 확인(헤드리스 캡처) — 크레스트 `1★`·코어3칩(자금/이용자/연산력)·청록 보더·＋트레이 보조5종(데이터/인재/신뢰/화제성/자동화)·목표 리본(`이번 달 목표 — 첫 제품 출시`) 확인. 증거 — `Logs/shots/02-tray-open.png`
- [x] 버그 수정 — 꾸미기 버튼 `🎨` 이모지가 Noto Sans KR에 글리프 없어 빈 박스로 깨짐 → 한글 `"꾸미기"` 라벨로 교체(92x64, 18pt)
- 분기 메모 — CD-2의 '오피스 위 떠있는 팝오버/좌하단 리본'은 Block E(free-float 레이아웃)로. 지금은 스택 내 컴팩트화

## Block D — 캐릭터·씬 생동감 ✅ 코드 완료 (검증 대기 — 타 프로젝트 Unity 점유)
- [x] 직원 스프라이트 통통 모션 (StaffBob — Abs(Sin) 바운스, 인스턴스별 위상차). 레이아웃-셀+내부아이콘 구조로 HBox와 충돌 방지
- [x] 모달 등장 팝인 (UiTween.PopIn — 스케일 0.92→1 + 페이드, 이벤트/결과 모달)
- [x] 탭 전환 페이드 — 메뉴 팝업에서 탭 변경 시 활성 콘텐츠 패널만 FadeIn(0.16s). 새로 열 때만 카드 PopIn, 탭 전환은 카드 재팝인 대신 콘텐츠 크로스페이드(OpenMenu wasOpen 분기 + 패널 CanvasGroup + FadeActivePanel)
- [ ] (선택) 배경 미세 모션/패럴랙스 (backlog)
- [x] 검증 — EditMode 29/29 (라이선스 해제 후 실행 완료)

## Block E — 메뉴·내비 재구성 (CD-3, office-first) ✅ 코드 완료 (시각 확인 대기)
React 8메뉴 IA를 Unity 단순 구조(3 콘텐츠 탭)에 맞춰 충실 적응.
- [x] 하단 도크 — 대칭 2|FAB|2 ([제품][능력] [다음달 FAB] [업그레이드][더보기])
- [x] 다음달 FAB — 중앙 큰 버튼 + 펄스 링(FabPulse 확장·페이드)
- [x] 탭 콘텐츠 = 오피스 위 팝업(MenuPopup) — 닫으면 오피스 깨끗. 스크림 클릭/✕로 닫기
- [x] 더보기 드로어 — 저장/불러오기/새 게임 (BottomBar 보조 액션 이전)
- [x] office-first — OfficeScene flex 1로 남는 세로 공간 차지(주인공). 월요약 슬림화(180→96)
- [x] 도크 탭 하이라이트(colors.normalColor), 팝업 PopIn 등장
- [x] EditMode 29/29, 컴파일 정상
- [x] 시각 확인(헤드리스 캡처) — office-first 오피스 지배(원근 바닥+직원3종)·하단 도크 2|FAB|2·다음달 FAB(펄스 링)·탭 팝업(스크림 딤, 제품/능력/업그레이드)·더보기 드로어(저장/불러오기/새 게임/닫기) 확인. 증거 — `Logs/shots/03~06`. FAB 펄스(FabPulse)는 컴포넌트 구동
- 분기 메모 — React의 4코어탭(운영·회사·성장·시장)+7메뉴 드로어는 Unity 콘텐츠가 3탭뿐이라 [제품·능력·업그레이드]로 적응. 꾸미기는 Block C에서 플레이스홀더 처리.

## 시각 검증 하네스 (헤드리스 스크린샷)
`Assets/_Project/Tests/PlayMode/ScreenshotCaptureTests.cs` — GameBootstrap UI를 전용 카메라+RenderTexture(1080x1920, CanvasScaler off→1:1)로 렌더해 PNG로 저장한다. `GameObject.Find`로 도크/＋/탭 버튼 onClick을 구동해 상태별(메인·마퀴·트레이·제품/능력/업그레이드 팝업·더보기 드로어) 7장을 뜬다. 그래픽 없으면 `Assert.Ignore`라 EditMode 게이트(-nographics)와 무관하다.
```bash
UNITY="$(ls -d /Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity | sort -V | tail -1)"
# -nographics 빼야 렌더됨. 산출 → Logs/shots/*.png (gitignore)
"$UNITY" -batchmode -projectPath "$PWD" -runTests -testPlatform PlayMode \
  -testFilter "AICompanyTycoon.Tests.PlayMode.ScreenshotCaptureTests" \
  -testResults "$PWD/Logs/playmode-results.xml" -logFile "$PWD/Logs/playmode-capture.log"
```

## 진행 로그
- 2026-06-09 — 계획 수립, reports/ 정본 5종 정독, 추적 문서 작성.
- 2026-06-09 — 전광판 트랙 Block A(랭킹시스템) + B(LED 전광판) 완료, EditMode 29/29.
- 2026-06-09 — Block C(코어3 칩 HUD+트레이+목표리본) + D(직원 통통+모달 팝인) 완료. A~D 6커밋.
- 2026-06-09 — Block E(하단 도크+FAB 펄스+탭 팝업+더보기 드로어, office-first) 완료. EditMode 29/29. feat-006 A~E 전 블록 코드 완료. 시각 확인만 남음.
- 2026-06-09 — 헤드리스 캡처 하네스 구축 → A~E **시각 확인 완료**(7장 육안 대조). 버그 1건 수정(꾸미기 🎨 두부→한글), Block D 탭 전환 페이드 추가. EditMode 29/29 유지. feat-006 핵심 완료(남은 건 backlog 아트뿐).
