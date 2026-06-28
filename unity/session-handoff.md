# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계. 핵심 루프·시스템·연출 완비, 지금은 **비주얼/UX 격상 + 디자인 주도 재설계** 국면.
- 현재 상태 — **feat-029까지 완결, origin 푸시 완료.** main = `f06a9d4`. EditMode **177/177**.
- 브랜치 — `main` (origin 동기화됨). push는 사용자 확인 후.

## ★ 다음 세션 1순위 — feat-030 잔여 블록 (메인 재설계 구현 중)
- **확정 = 추천안(A 슬림HUD + D 추월트렌드 + B 풀블리드 오피스).** 정본 `docs/design/FINAL.md`·`ai-tycoon-final.html`, 계획 `docs/feat-030-main-redesign-plan.md`.
- **완료·검증·커밋(EditMode 177 + 캡처)** — B1 토큰·B2 HUD 다이어트(크림 톱바·자원 색칩·슬림 트렌드바)·B4 도크/스마트 FAB 3상태·B5 보텀시트·버튼 2티어(핵심 CTA만 코랄)·B6 일부(결산 브리핑 재스킨). 커밋 `8719987`·`afa29e6`. 메인 화면 정적 뷰는 최종안과 일치.
- **남은** — B3 풀블리드 오피스(**feat-027 정밀 튜닝 보존 위해 블라인드 앵커 변경 보류** — 정규화 배치라 스테이지 키우면 직원 전원 이동, 캡처 보며 신중히)·B6 잔여(타임랩스/이벤트/승급 컷씬 재스킨, 컷씬 CG는 사용자가 "전기줄 저렴" 지적 — 별도 개선)·폴리시(중립 버튼 affordance 흐림·시트 높이·FAB 코랄 강도).
- 흐름 — 라이선스 확인 후 캡처 검증하며 블록 진행. 무관 변경 `ProjectSettings.asset`(activeInputHandler)은 커밋 제외 유지.

## 진행 중이던 직결 설계 — 오피스 3레이어 깊이 (스펙 미작성)
- 현 오피스 = **2레이어**(소품=뒤 / 직원=앞). 합의 = **고정 3레이어**(뒤 가구·러그 / 직원·책상 / 앞 전경이 직원 가림) + `PropSpec.Layer` 일급 속성 + 미래 에셋 레이어 규칙. 상세 `docs/design/README.md` 하단.
- 메인 화면 시안과 합쳐서 진행 — 시안 먼저 보고 3레이어를 그 방향에 맞춘다.

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
