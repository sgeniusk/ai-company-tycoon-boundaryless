# v1.0-beta 릴리스 리포트 — AI Company Tycoon: Boundaryless

작성일: 2026-06-02
작성자: Claude Code (편집장 트랙)
대상 빌드: `main` @ `39b0056` (게이트 직전 코드는 `ab4e8cc`)

## 한 줄 요약

상용 픽셀아트 폴리시 트랙(v0.96~v0.99)이 전부 출시·검증됐고, 프리뷰 배포까지 완료했다. v1.0-beta 동결 기준을 충족한다. 프로덕션 승격·최종 아트·실사용자 테스트는 사용자 판단을 기다린다.

## 배포

- 프리뷰 URL — `https://ai-company-tycoon-rgrdmgcle-gomgomee-s-projects.vercel.app`
- Inspector — `https://vercel.com/gomgomee-s-projects/ai-company-tycoon/5HFe7z1XUno6NepyDAsT4LByf5VR`
- 프로젝트 — `ai-company-tycoon` (Vercel, team gomgomee-s-projects). `vercel.json`: vite / `npm run build` / `dist`.
- 보호 — Vercel SSO Deployment Protection 적용(HTTP 401). 익명/헤드리스 접근 차단, **로그인한 소유자는 브라우저에서 정상 열람**. 외부 공유가 필요하면 Vercel 대시보드에서 해당 배포 보호를 해제하거나 프로덕션 승격.
- 검증 — 인증된 `vercel curl` 로 받은 배포 `index.html` 이 로컬 `dist/index.html` 과 동일(동일 청크 해시). 그 빌드는 로컬 preview 스모크에서 첫화면 6 actors/overflow 0, 오버레이 3/3 통과.

## 이번 사이클 출시 (v0.96–v0.99)

| 버전 | 내용 | 커밋 |
|------|------|------|
| v0.96 | 첫 화면 구성 — 오피스 우선 스테이지 + 이벤트 레일 오버레이 계약 고정, 혼잡 가드, 첫뷰포트 스모크 | `d11eb13` |
| v0.97 #1 | 데스크톱 자원 HUD 재설계 — 픽셀 아이콘 + 델타 복원(오버플로 0) | `4d0978b` |
| v0.97 #2 | 픽셀 토큰 통일 — `--pixel-radius`(35), `--pixel-steps`(19), 도형 보존 | `ba5b0b0` |
| v0.98 #1 | 오버레이 디스미스 어포던스(hover/active/focus-visible) + drain-dismiss 신뢰성 스모크 | `c2e1503` |
| v0.98 #2 | Escape 디스미스 + 초기 포커스 | `f2b503e` |
| v0.99 | game-logic 청크 분리 — 엔트리 505→202kB, 청크 경고 제거, SMOKE_INDEX.md | `ab4e8cc` |

- 게이트 — `npm run harness:gate < /dev/null` PASS, **53 files / 648 tests**, 빌드 청크 경고 없음.
- 전 구간 visual/additive — `simulation.ts`/`types.ts`/세이브/`data` 불변. 결정론 유지.
- 검증 방식 — Codex 가 CSS/TSX + 단위 테스트, Claude 가 실서버/프리뷰 브라우저 스모크·스크린샷·게이트·커밋(샌드박스가 Codex 의 브라우저를 막기 때문). 스모크 인덱스 `reports/qa/SMOKE_INDEX.md`.

## 알려진 이슈 / 의도된 보류

1. 프리뷰 SSO 보호 — 익명 열람 불가(팀 기본값). 소유자 열람은 정상. 공개 공유 시 보호 해제 필요.
2. 데스크톱 자원 HUD 는 콤팩트(작은 픽셀 아이콘 + 값 + 작은 델타). 더 큰 아이콘은 HUD 영역 확장 재설계가 필요 — 보류.
3. v0.97 그라디언트 평탄화 — 가치 낮아 보류(soft shadow 는 이미 픽셀 하드라 작업 불필요였음).
4. v0.98 포커스 복원(닫을 때 이전 포커스 복귀) — 후속 후보.
5. 최종 소스 아트 미요청 — AGY 게이트 `npm run qa:asset-handoff`, 브리프 `docs/ANTIGRAVITY_ART_BRIEF.md`.
6. 실사용자 블라인드 플레이테스트 — 캘린더 바운드, 미진행.
7. Vercel CLI 구버전(54.0.0 → 54.7.1) — 동작 무관, 권장 업그레이드.

## 다음 DLC / 콘텐츠 후보 (post-1.0, 전부 데이터 주도)

- 런 모디파이어 축 확장 — 도시/세계관/시장/창업자 옵션 추가(엔진은 무한 조합 지원, JSON 만으로 확장).
- 연중 세계 이벤트 풀 확장, 신규 아키타입(파생 규칙) 추가.
- 멀티 엔딩 분기 추가(v0.67 엔진 위에).
- 난이도 티어/도전 변형 추가.
- 신규 산업/시너지/콤보(v0.60 패턴).

## 프로덕션 승격

준비되면 — `vercel deploy --prod` (또는 Vercel 대시보드에서 이 배포를 Promote). 승격 전 권장: 소유자 브라우저로 프리뷰 URL 에서 첫 화면·오버레이·키보드 디스미스 육안 확인.
