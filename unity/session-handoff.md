# 세션 핸드오프 — Unity Port

≤80줄. 큰 증거는 링크.

## 현재 목표 (Current Objective)
- 목표 — Godot 프로토타입을 Unity 6 모바일 타이쿤으로 재설계. 핵심 루프·시스템·연출 완비, 지금은 **비주얼/UX 격상 + 디자인 주도 재설계** 국면.
- 현재 상태 — **feat-029까지 완결, origin 푸시 완료.** main = `f06a9d4`. EditMode **177/177**.
- 브랜치 — `main` (origin 동기화됨). push는 사용자 확인 후.

## ★ 다음 세션 1순위 — 클로드 디자인 시안 구현 (디자인 임포트)
- 사용자가 **클로드 디자인**(claude.ai/design 프로젝트 `7b982813-...`)에서 UI/UX 시안 3개를 받았다. **DesignSync MCP는 데스크톱 앱에서 인증 불가**(/design-login 인터랙티브 터미널 필요 — 메모리 `claude-design-mcp-desktop-limit` 참조)라, **사용자가 새 세션에서 스탠드얼론 HTML을 직접 붙여넣는다.**
- 대상 — UIUX 시안 / 메인 (추천안) / 프로토타입 3개 HTML. 수령 가이드·작업 흐름 `docs/design/README.md`.
- 흐름 — HTML 읽기 → 제안 구성(HUD·도크·오피스·모달·인터랙션) 파악 → 현 Unity 화면(`Logs/shots/01-main.png` 등)과 매핑 → brainstorming→writing-plans→subagent-driven 구현.

## 진행 중이던 직결 설계 — 오피스 3레이어 깊이 (스펙 미작성)
- 현 오피스 = **2레이어**(소품=뒤 / 직원=앞). 합의 = **고정 3레이어**(뒤 가구·러그 / 직원·책상 / 앞 전경이 직원 가림) + `PropSpec.Layer` 일급 속성 + 미래 에셋 레이어 규칙. 상세 `docs/design/README.md` 하단.
- 메인 화면 시안과 합쳐서 진행 — 시안 먼저 보고 3레이어를 그 방향에 맞춘다.

## 이번 세션 한 일 (2026-06-27~28)
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
