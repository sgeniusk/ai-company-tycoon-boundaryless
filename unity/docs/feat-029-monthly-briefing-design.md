# feat-029 월말 브리핑 + 다박자 월 진행 시퀀스 설계

월이 끝날 때 회사 운영결과(손익계산서)를 브리핑 카드로 보여주고, 월 진행을 타임랩스→중간 이벤트→브리핑의 다박자 시퀀스로 묶어 "한 달이 펼쳐지고 결산을 받아보는" 체감을 만든다.

## 배경 / 문제

사용자 요청(2026-06-27) — "월간 브리핑 카드를 넣어 회사 운영결과를 보여줘야 한다. HUD 날짜가 천천히 증가하며 타임랩스로 보여주다가, 중간중간 이벤트도 발생하고, 월이 끝날 때 브리핑을 보여주는 흐름." feat-028이 타임랩스(0.9초) + 성과 분위 반응을 넣었지만, ① 운영결과를 정리해 보여주는 브리핑이 없고 ② 흐름이 짧고 이벤트가 타임랩스와 분리돼 있다.

## 데이터 사실 (설계 근거)

- `MonthSummary`(AICompanyTycoon.Systems)에 브리핑 재료가 전부 있다 — `Revenue`, `BaseCost`/`SalaryCost`/`ComputeCost`/`TotalCashCost`, `NewUsers`, `DataGenerated`, `Warnings`, `WorldEventTitles`, `StageChangedTo`. 순익 = `Revenue − TotalCashCost`.
- `MonthMoodJudge`(feat-028)가 같은 summary로 4분위를 판정 — 브리핑 배지에 재사용.
- HUD 날짜 `_monthLabel`은 "N월차"(월 단위). feat-028 타임랩스의 "Day 1→30" 카운터가 "날짜가 천천히 증가"에 해당.
- 월 진행은 `HandleAdvanceMonth` → `MonthPayoffCo`(feat-028 코루틴). 이벤트는 현재 타임랩스 뒤에 트리거된다.

## 사용자 결정 (브레인스토밍)

- 흐름 — **다박자 시퀀스**(타임랩스 중간에 이벤트 팝·일시정지·재개 → 월말 브리핑).
- 브리핑 형식 — **손익계산서 스타일**(매출 − 비용 내역 = 순익 + 보조 지표 + 이벤트).

## 다박자 시퀀스 (MonthPayoffCo 재구성)

코어·세이브 무변경. `AdvanceMonth`는 여전히 즉시 정산(모델 진실)하고, 그 위에 연출 시퀀스를 깐다.
```
"다음 달" → AdvanceMonth(헤드리스, 즉시) → summary
  → 타임랩스 시작 (Day 1→30, ~2초로 늘려 체감 — HUD 날짜 증가감)
      → 중간(Day ~15)에 이번 달 이벤트 발동 시 → 타임랩스 일시정지 → 이벤트 모달 → 선택 완료(_context.Events.Current == null)까지 대기 → 재개
  → 타임랩스 끝(Day 30)
  → RefreshAll + 성과 분위 반응 (feat-028 — 오피스가 몸으로 반응)
  → 월말 브리핑 카드 (손익계산서) ← 신규, 사용자가 "다음 달로"로 닫음
  → 터미널(승패 결과 모달)/투자 제안 (기존)
```
이벤트의 자원 효과는 선택 시 적용(기존), 브리핑은 그달 운영결과(summary, 이벤트 전 정산값)를 보여준다 — 이벤트는 별개 사건으로 시퀀스 중간에 끼는 것이 자연스럽다. feat-028 #3b의 `_advancing` 재진입 가드는 유지된다(시퀀스가 길어질수록 더 중요).

## 브리핑 카드 (손익계산서)

`MonthSummary`에서 직접 파생.
- 헤더 — "N월차 결산" + 분위 배지(대박/호조/평범/부진, `MonthMoodJudge` 재사용)
- 손익 — 매출 / 비용 내역(· 기본 운영비 · 급여 · 연산비) / 총비용 / **순익**(양수 녹색·음수 빨강 강조)
- 보조 지표 — 신규 이용자, 데이터 생성 (2열 메트릭)
- 발생 이벤트 — 세계 이벤트(WorldEventTitles)·경고(Warnings)·승급(StageChangedTo) 있을 때만 행 추가
- 닫기 — "다음 달로" 버튼 → 시퀀스 재개

레이아웃은 게임 픽셀 톤(크림 카드·다크 텍스트)로, 기존 모달(`BuildResultModal`) 스타일 정합.

## 아키텍처 / 파일

- Create `Assets/_Project/Scripts/Systems/MonthBriefing.cs` — `MonthSummary` → 표시 모델(순익·표시 행 목록·분위) 순수 헬퍼. 헤드리스 TDD.
- Test `Assets/_Project/Tests/EditMode/MonthBriefingTests.cs` — 순익 부호·이벤트/경고/승급 행 유무·분위 일치.
- Modify `Assets/_Project/Scripts/UI/GameScreen.cs` — `BuildBriefingModal`(1회 생성, BuildResultModal 패턴) + `ShowBriefing(summary, onClose)`(채움) + `MonthPayoffCo` 재구성(타임랩스 길이↑·이벤트 중간 일시정지·브리핑 삽입).
- 타임랩스(PlayMonthTransitionCo)는 길이 상수만 조정 + 이벤트 일시정지 훅 추가.

**단위 경계** — `MonthBriefing`은 순수 데이터(테스트 가능), `BuildBriefingModal`/`ShowBriefing`은 UI 빌드(캡처 검증), `MonthPayoffCo`는 시퀀스 오케스트레이션. 각각 독립 이해·교체 가능.

## 검증

- EditMode — `MonthBriefingTests`(순익 = Revenue−TotalCashCost, 이벤트/경고/승급 행 조건부 노출, 분위 배지 = MonthMoodJudge). 170 → 약 175.
- PlayMode 캡처 — 타임랩스 중간 이벤트 팝(`37-month-event`) + 브리핑 카드 대박/부진 2종(`38-briefing-great`/`39-briefing-bad`). 단일 라이선스 ps 확인.

## 스코프 / 분담

- Claude — MonthBriefing(로직 TDD), 브리핑 모달 UI·시퀀스 재구성(연출 코드), 검증. 전부 코드(새 에셋 0).
- Codex — 없음(이번 트랙은 기존 UI 팩토리·포즈 재사용).

## 스코프 밖 (다음)

- **분기 보고서·연말 보고서 (상장회사 잠금 해제)** — 사용자 아이디어(2026-06-27). 회사가 IPO(상장, feat-017 Ipo 컷씬·feat-015 시리즈 투자 메커닉 존재)하면 분기·연간 누적 리포트를 잠금 해제하는 후속 트랙. 월 단건 브리핑(feat-029)을 누적·집계한 상위 보고서. 상장 상태 게이트 + 누적 데이터 집계가 선행 설계 필요.
- 누적 추세 그래프(매출·이용자 추이) — 분기/연말 리포트와 함께.
