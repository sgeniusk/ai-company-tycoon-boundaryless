import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const summaryPath = path.join(playtestDir, "v0_56_blind_playtest_summary.md");
const issueQueuePath = path.join(playtestDir, "v0_56_blind_playtest_issue_queue.md");
const outputPath = path.join(playtestDir, "v0_56_final_art_intake_gate.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function readReport(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function getBulletValue(content, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`^- ${escapedLabel}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function getNumber(content, label) {
  const value = getBulletValue(content, label);
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getStatusLabel(metrics) {
  if (metrics.realSessions === 0) {
    return "실제 세션 대기";
  }
  if (metrics.summaryUnrecognizedStatus > 0 || metrics.issueUnrecognizedStatus > 0) {
    return "상태 확인 필요";
  }
  if (metrics.realSessions < 5) {
    return "실제 세션 진행 중";
  }
  if (metrics.missingP0 > 0) {
    return "P0 기록 필요";
  }
  if (metrics.missingEvidence > 0) {
    return "세션 증거 필요";
  }
  if (metrics.openP0 > 0) {
    return "P0 수정 필요";
  }
  if (metrics.p0Queue > 0) {
    return "P0 큐 수정 필요";
  }
  if (metrics.summaryArtGate !== "가능") {
    return "요약 게이트 대기";
  }
  return "에셋 투입 가능";
}

const summary = readReport(summaryPath);
const issueQueue = readReport(issueQueuePath);
const metrics = {
  realSessions: getNumber(summary, "실제 세션"),
  openP0: getNumber(summary, "열린 P0"),
  openP1: getNumber(summary, "열린 P1"),
  missingP0: getNumber(summary, "P0 미기록"),
  summaryUnrecognizedStatus: getNumber(summary, "상태 미인정"),
  missingEvidence: getNumber(summary, "증거 미기록"),
  summaryArtGate: getBulletValue(summary, "아트 투입 판정") || "대기",
  p0Queue: getNumber(issueQueue, "P0 큐"),
  p1Queue: getNumber(issueQueue, "P1 큐"),
  issueUnrecognizedStatus: getNumber(issueQueue, "상태 미인정"),
};
const statusLabel = getStatusLabel(metrics);
const finalArtGate = statusLabel === "에셋 투입 가능" ? "가능" : "대기";

const markdown = `# v0.56 Final Art Intake Gate

Status: ${statusLabel}
작성일: ${todayKst}

## 판정

- 실제 세션: ${metrics.realSessions}/5
- 열린 P0: ${metrics.openP0}
- 열린 P1: ${metrics.openP1}
- P0 미기록: ${metrics.missingP0}
- 상태 미인정: ${metrics.summaryUnrecognizedStatus + metrics.issueUnrecognizedStatus}
- 증거 미기록: ${metrics.missingEvidence}
- 아트 투입 판정: ${metrics.summaryArtGate}
- P0 큐: ${metrics.p0Queue}
- P1 큐: ${metrics.p1Queue}
- 최종 그래픽 에셋 투입: ${finalArtGate}
- 원칙: 실제 세션 5/5, 요약 게이트 가능, P0 큐 0 전에는 최종 그래픽 에셋 투입 금지
- P1 원칙: 열린 P1/P1 큐는 후속 튜닝 후보로 유지하되, P0/증거 게이트를 통과하면 에셋 투입을 막지 않음

## 입력 보고서

| Report | File |
|---|---|
| 블라인드 세션 요약 | \`v0_56_blind_playtest_summary.md\` |
| 블라인드 이슈 큐 | \`v0_56_blind_playtest_issue_queue.md\` |

## 다음 행동

1. 실제 세션 기록 후 \`npm run qa:blind-summary\`를 실행한다.
2. 이어서 \`npm run qa:blind-issues\`를 실행한다.
3. P0 큐가 있으면 P0 큐를 0으로 닫는다.
4. \`최종 그래픽 에셋 투입: 가능\`이 될 때만 \`docs/ANTIGRAVITY_ART_BRIEF.md\`와 \`docs/ART_INTAKE.md\` 기준으로 최종 그래픽 에셋 준비를 시작한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Real sessions: ${metrics.realSessions}/5`);
console.log(`Summary art gate: ${metrics.summaryArtGate}`);
console.log(`P0 queue: ${metrics.p0Queue}`);
console.log(`Final art intake: ${finalArtGate}`);
