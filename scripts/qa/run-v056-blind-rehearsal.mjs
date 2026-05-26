import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const reportPath = path.join(root, "reports/playtests/v0_56_blind_playtest_rehearsal.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

const checkpoints = [
  ["첫 10초", "AI 회사 경영 판타지와 첫 제품 출시 목표가 첫 화면에 있음", "`?scenario=fresh`", "미나 안내와 첫 화면 신호 중 무엇을 먼저 읽었는가"],
  ["첫 3분", "추천 첫 제품 카드와 개발 시작 버튼이 제품 메뉴에 있음", "`?scenario=staffing`", "추천 첫 제품 카드와 첫 제품 개발 시작 버튼을 스스로 찾았는가"],
  ["첫 10분", "첫 출시 결과와 다음 행동 리본이 있음", "`?scenario=launch-impact`, `?scenario=flow`", "출시 결과가 보상감 있는 순간으로 읽혔고 다음 행동을 골랐는가"],
  ["첫 15분", "개발 이슈, 카드 영향, 보상/성장 확인 리본이 있음", "`?scenario=deck`, `?scenario=deck-result`, `?scenario=reward-picked`, `?scenario=growth-picked`", "카드/보상/성장 선택이 숫자와 다음 목표를 바꿨다고 말할 수 있는가"],
  ["첫 20분", "`인력 조합` 패널과 경쟁사/직원 사건이 화면 사건으로 보임", "`?scenario=office-visuals`", "경쟁사 압박과 직원 사건을 구분하고 사람/AI/로봇 역할 차이를 말할 수 있는가"],
  ["첫 30분", "연간 심사 후 지시, 2년차 운영, 연구, 제품 후보, 신제품 착수, 이슈 결과, 출시 결과 흐름이 있음", "`?scenario=annual-directed`, `?scenario=year-two-plan`, `?scenario=year-two-research`, `?scenario=year-two-research-complete`, `?scenario=year-two-product-candidate`, `?scenario=year-two-product-ready`, `?scenario=year-two-product-started`, `?scenario=year-two-product-issue-result`, `?scenario=year-two-product-launch-impact`", "연간 지시가 운영 보너스와 연구/제품 후보/신제품 착수/이슈 결과/출시 결과로 이어진다고 이해했는가"],
];

const markdown = `# v0.56 Blind Playtest Rehearsal

Status: 자동 리허설 완료
작성일: ${todayKst}
대상: \`v0.56-alpha-playtest-slice-lock\`

## 경계

이 문서는 실제 사람 5명 블라인드 테스트가 아님. 실제 관찰 결과는 \`reports/playtests/v0_56_blind_playtest_session_01.md\`부터 \`session_05.md\`에만 기록한다.

## 판정

- 자동 리허설 판정: \`ready_for_human_blind_test\`
- 실제 사람 세션 기록 수: 0
- 실제 세션 상태: 5개 모두 \`예정\`

## 체크포인트

| Time | 자동 확인 | QA routes | 사람에게 볼 질문 |
|---:|---|---|---|
${checkpoints.map((row) => `| ${row.join(" | ")} |`).join("\n")}

## 남은 실제 사람 리스크

- 첫 개발 이슈/결과 리본이 설명 없이 카드 영향으로 읽히는지
- 첫 출시 후 다음 행동 리본이 보상 카드와 성장 분기로 실제 클릭을 유도하는지
- 인력 조합 패널과 사무실 벽의 TEAM/AI OPS/ROBOT 요약이 직원/AI/로봇 차이로 읽히는지
- 경쟁사/직원 사건 패널이 압박으로 읽히면서 흐름을 과하게 끊지 않는지
- 연구 완료 후 제품 후보, 필요 연구 보기, 신제품 착수 리본, 이슈 결과, 출시 결과가 다음 목표로 읽히는지
- 첫 30분 뒤 한 판 더 해볼 마음이 생기는지

## 스크린샷 증거

- Fresh desktop: \`reports/qa/screenshots/v0_56_workforce_mix_fresh_desktop.png\`
- Fresh mobile: \`reports/qa/screenshots/v0_56_workforce_mix_fresh_mobile.png\`
- Office visuals desktop: \`reports/qa/screenshots/v0_56_workforce_mix_office_visuals_desktop.png\`
- Office visuals mobile: \`reports/qa/screenshots/v0_56_workforce_mix_office_visuals_mobile.png\`

## 그래픽 에셋 투입 시점

최종 그래픽 에셋은 v0.56 블라인드 테스트 P0가 닫힌 뒤 넣는다. 지금은 최종 제작을 시작하기 전에 안티그래비티에 넘길 규격과 스타일 브리프를 고정하는 단계다.

- 브리프 위치: \`docs/ANTIGRAVITY_ART_BRIEF.md\`
- 캐릭터 원본: \`1152x9600 RGBA character event-pose sheet\`
- 오피스 오브젝트 원본: \`2560x1920 RGBA office object sheet\`
- 오피스 배경 원본: \`5120x2880 RGBA isometric office backdrop\`

## 다음 행동

1. 5명 실제 블라인드 테스트를 진행한다.
2. 세션 기록의 P0/P1을 분류한다.
3. P0가 닫히면 안티그래비티 또는 외부 제작자가 \`docs/ANTIGRAVITY_ART_BRIEF.md\` 기준으로 최종 원본을 제작한다.
4. 원본 수급 후 \`npm run assets:v053\`, \`npm run assets:v054\`, \`npm run qa:office-visuals:screenshots\`를 실행한다.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown);

console.log(`Wrote ${path.relative(root, reportPath)}`);
console.log("Automatic rehearsal only. Real human session files remain 예정.");
