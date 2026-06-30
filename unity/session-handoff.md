# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계. 핵심 루프·시스템·연출 완비, 지금은 **비주얼/UX 격상 + 디자인 주도 재설계** 국면.
- 현재 상태 — **feat-029까지 완결, origin 푸시 완료.** main = `f06a9d4`. EditMode **177/177**.
- 브랜치 — `main` (origin 동기화됨). push는 사용자 확인 후.

## ★ 현재 — feat-030 시안 전 항목 구현 완료 (2026-06-29, 로컬 13커밋 미푸시)
- 클로드 디자인 최종안(`docs/design/FINAL.md`·`ai-tycoon-final.html`)을 사용자 피드백 루프로 **레이아웃까지 충실 구현 완료.**
- **구현·검증·커밋(각 EditMode 177/177 + 캡처 예외0)** — 슬림 HUD(월차·단계·성급/꾸미기)·콤팩트 자원 색칩(좌측 색바+라벨/값)·**원형** 스마트 FAB 3상태·보텀시트(메뉴·브리핑·이벤트)·버튼 2티어·컬러 팔레트·풀블리드 오피스(줌1.15·벽가구 확대·**피부색 따뜻하게**·**고정 3레이어** PropSpec.Layer Back/Front)·손익 브리핑 **바닥 시트+순익 틱업**(NumberTickUp)·타이포 3종(Black Han Sans/Gowun Dodum/Jua)·트렌드바 문구·**온보딩 첫 60초**(AI 비서 첫 출근)·세로 폰 비율 고정(PortraitFrame 레터박스)·상태줄 제거.
- 커밋 `8719987`~`42ecea7`(13개). 코어/세이브/시뮬 무변경(Scripts/UI/* + 폰트 3종 Resources/Fonts + 인간 스프라이트 피부 리맵).
- **미푸시** — `git push`는 사용자 확인 후. 무관 변경 `ProjectSettings.asset`(activeInputHandler)은 커밋 제외 유지.
- **푸시 완료** — `203ed19 → 944aa6c`(14커밋). 무관 변경 `ProjectSettings.asset`(activeInputHandler)은 커밋·푸시 제외.

## ★ 다음 세션 조정 항목 (2026-06-30 사용자 피드백 — "이대로 조정하며 진행")
사용자 평 = "많이 게임같아졌어." 디자인 방향은 OK. 아래는 게임성·진정성 조정 (디자인 재작업 아님).
1. **버튼 affordance** — 간혹 "누를 수 있는 버튼" 같지 않을 때가 있음. 눌림 단서(그림자·테두리·press 상태) 보강. 특히 중립/secondary 알약 톤이 흐려 평면처럼 보이는 지점.
2. **사무실 업그레이드 = 조건 해금** — 현재 풀 오피스·업그레이드 노출은 **시안 시연용**. 원래는 진행하다 **조건 충족 시 해금**되는 흐름이어야 함. 디자인 자체는 사용자도 "나쁘지 않다". 게이팅 로직과 시안 노출을 분리할 것.
3. **시작 상태 = 1인 창고** — 게임 처음엔 **주인공 사장 1명만 창고에서** 시작해야 함(현 풀 오피스는 후반/시연 상태). 온보딩·초기 오피스 구성이 이 '창고 1인' 출발을 반영하도록.

## (이전) 다음 — 실기기 폰 해상도 체감 QA → feat-030 클로즈아웃(done). 잔여 디테일은 사용자 피드백 대기.

## 이번 세션 한 일 (2026-06-28) — 디자인 임포트
- **클로드 시안 3종 검토** — 브라우저 렌더로 텍스트·구성 추출. UIUX 시안(진단+메인 4종 A/B/C/D+센터버튼+온보딩+4박자+컬러시스템) / 메인 추천안(A+D+B 합성) / 프로토타입(러프 인터랙션).
- **최종안 빌드·검증** — `ai-tycoon-final.html` 단일 self-contained. 슬림 1줄 HUD·자원별 색칩·추월 트렌드바·풀블리드 오피스(게임 합성 오피스 크롭 임베드)·AI 리본·스마트 센터버튼 3상태·보텀시트(제품 테크트리)·도파민 4박자(타임랩스 2x/스킵→이벤트→결산 틱업→승급 컷인). frontend-design 스킬·Black Han Sans/Gowun Dodum/Jua. 메인·시트·4박자·버튼 전부 playwright 동작 확인, 캡처 `docs/design/shots/final-01~06`.
- **정착** — 소스 3종 임포트 + 최종안 + `FINAL.md`(구현 스펙) `docs/design/`에. progress.md 갱신.

## 이전 세션 한 일 (2026-06-27)
- **feat-026 멀티엔딩 컷씬** — 결말 4버킷(전설/성공/차고로/몰락) 가산 연출. EditMode 157.
- **feat-027 오피스 구성 재작업** — OfficeLayout 깊이 군집 + 신규 가구 5종(Codex imagegen 크로마키, 내가 오케스트레이션) + 중간 바닥 채움. EditMode 161.
- **feat-028 월 진행 연출** — 타임랩스(낮→밤+Day 카운터) + 성과 분위 반응(MonthMoodJudge 4분위 → 직원 다양 포즈). EditMode 170.
- **feat-029 월말 브리핑 + 다박자 시퀀스** — 손익계산서 브리핑 카드(ContentSizeFitter) + 타임랩스→중간 이벤트 일시정지→브리핑. EditMode 177.
- **오피스 배치 실기 수정 2건** — 가구 잘림(우측 x>0.9 절반 화면 밖)·산만 → 안전 x[0.08,0.86]·뒤 가구 한 줄·대형 중앙 러그(책상이 러그 위에). 커밋 `f869c8e`/`f06a9d4`.
- 전부 설계→계획→**서브에이전트 주도 TDD(각 task 스펙+품질 2단 리뷰)**→검증→push. 코어·세이브 무변경.

## 분업·검증 (불변)
- **분업** — 에셋 양산 = Codex 핸드오프(`docs/codex-handoff/`, 크로마키 파이프라인 `Tools~/pixel_office/feat024/`), 재미·연출 코드 = Claude. Codex는 .cs/progress/feature_list 못 건드림.
- **검증** — `./init.sh`(EditMode), PlayMode 캡처는 `-nographics` 빼고(`Capture_AllStates` 등 → `Logs/shots/`). **단일 Unity 라이선스** — 검증 전 `ps -axo command | grep "[U]nity.app" | grep -i projectpath`로 다른 프로젝트(sam/samgukji) 미실행 확인.
- 픽셀 함정 — 런타임 비균일 scale 금지(도트 뭉갬), 소품 pivot 0.5라 xNorm>0.9면 절반 잘림.

## 다음 세션 시작 (Next Session)
1. `pwd`로 `unity/` 확인 → 이 파일·CLAUDE.md·progress.md·`docs/design/README.md` 읽기.
2. `ps`로 다른 Unity 미실행 확인 → `./init.sh` 베이스라인 **177/177**.
3. 사용자가 붙여넣는 **3개 시안 HTML 수령** → 디자인 주도 재설계 brainstorming 시작.
