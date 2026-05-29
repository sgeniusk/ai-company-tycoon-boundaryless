# v0.61 공개 웹 알파 — 소개 자료 (intro copy + 스크린샷 shot-list)

작성일: 2026-05-29
대상: `v0.61-alpha-public-web-alpha` 블록 #4
용도: 공개 웹 알파 배포 시 사용할 소개 문구 + 수동 스크린샷 촬영 계획

## 한 줄 소개 (tagline)

- KO — "차고에서 시작한 AI 스타트업을 10년 안에 세계적 기업으로. 소프트웨어를 넘어 물리 산업까지, 경계 없이 확장하라."
- EN — "Grow a garage AI startup into a global company in 10 years. Expand beyond software into the physical world — boundlessly."

## 짧은 소개 (store/landing 문단)

### KO
AI Company Tycoon: Boundaryless는 브라우저에서 바로 즐기는 전략 경영 시뮬레이션이다. 사람과 AI 에이전트를 한 팀으로 묶어 제품을 만들고, 능력을 연구하고, 전략 카드 덱을 짜고, 살아 움직이는 13개 경쟁사와 시장을 두고 다툰다. 파운데이션 모델에서 시작해 개발자 도구·로봇·모빌리티·반도체를 거쳐 제조·물류·에너지 같은 물리 산업까지 진출하며, 10년 캠페인의 매 선택이 회사의 운명을 바꾼다. 설치 불필요, 한국어·영어 지원.

### EN
AI Company Tycoon: Boundaryless is a browser strategy-management sim. Pair humans with AI agents to ship products, research capabilities, build a strategy-card deck, and fight 13 living competitors for market share. Start with foundation models and expand through developer tools, robotics, mobility, and semiconductors into physical industries like manufacturing, logistics, and energy — every choice across the 10-year campaign reshapes your company. No install; Korean and English.

## 핵심 특징 (highlights)

- 살아 움직이는 시장과 경쟁사 — 점유율 시각화, 라이벌 성향·약점, 대형 사건 팝업, 대응 카드
- 전략 카드 덱빌딩 — 희귀도·시너지·아키타입, 카드 → 효과 시각화
- 10년 캠페인 — 연간 심사·지시 선택, 캠페인 충격, 런 간 메타 진행
- 진짜 AI 자원 경제 — 연산·데이터·인재가 맞물린 경제, 연산 부하 가시화
- 경계 없는 산업 확장 — 15개 산업, 산업 간 시너지 10개 + 고위험·대박 조합 10개
- 어디서나 — 브라우저 실행, 한국어·영어, 모바일 대응

## 시작하는 법 (how to start)

1. 브라우저로 접속 (설치 없음). 진행은 자동 저장되고, 다시 들어오면 이어서 플레이된다.
2. 차고에서 첫 팀원을 채용하고 첫 제품을 출시한다. 도우미 "미나"의 튜토리얼이 첫 흐름을 안내한다.
3. 출시 보상 카드로 전략을 정하고, 연구로 새 산업을 열고, 경쟁사 압박에 대응한다.
4. 10년(120개월) 캠페인의 엔딩까지 회사를 키운다.

## 스크린샷 shot-list (수동 촬영 — Playwright 부재로 자동화 불가)

`npm run dev -- --port 5201` 후 아래 시나리오를 데스크톱 + 모바일(390×844) 2종으로 촬영. `npm run qa:office-visuals:screenshots`도 사무실 씬 캡처에 활용.

| # | 장면 | 경로 | 캡션 |
|---|---|---|---|
| 1 | 사무실/첫 화면 | `?scenario=office-visuals` | "사람 + AI 에이전트 팀과 사무실" |
| 2 | 시장 점유율 | `?scenario=market-share` | "살아 움직이는 13개 경쟁사" |
| 3 | 대형 사건 | `?scenario=big-event` | "도전자 등장 팝업" |
| 4 | AI 자원 가시화 | `?scenario=resource-visibility` | "연산·데이터 경제" |
| 5 | 물리 산업 | `?scenario=physical-industries` | "제조·물류·에너지로 확장" |
| 6 | 덱/보상 | `?scenario=reward` | "전략 카드 덱빌딩" |

## 상태 / 근거

- 현재 v0.61-alpha, harness:gate 43 files / 437 tests.
- 공개 알파의 가장 위험한 두 축(저장/불러오기 무손실, 전 전략 10년 완주)은 v0.61 #1·#2에서 테스트로 증명됨.
- 스크린샷 실제 촬영 + 최종 아트는 베타 단계 작업으로 남김.
- 상세 현황/홍보는 `reports/v0_60_status_and_promo.html` 참조.
