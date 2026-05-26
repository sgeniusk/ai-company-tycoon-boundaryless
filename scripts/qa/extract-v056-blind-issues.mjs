import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_issue_queue.md");
const sessionIds = ["01", "02", "03", "04", "05"];
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const pendingStatus = "예정";
const completedStatus = "완료";
const noIssueValues = new Set(["없음", "없음.", "none", "해당 없음", "해당없음", "n/a", "-"]);

function hasOpenIssue(value) {
  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.length > 0 && !noIssueValues.has(normalizedValue);
}

function getLineValue(content, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`^- ${escapedLabel}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function readSession(id) {
  const fileName = `v0_56_blind_playtest_session_${id}.md`;
  const filePath = path.join(playtestDir, fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const status = content.match(/^Status:[ \t]*(.+)$/m)?.[1]?.trim() ?? "unknown";
  const hasRealOutcome = status === completedStatus;
  const p0 = getLineValue(content, "P0");
  const p1 = getLineValue(content, "P1");
  const nextFix = getLineValue(content, "다음 수정 후보");
  const confusedMoment = getLineValue(content, "제일 헷갈렸던 순간");

  return {
    id,
    fileName,
    status,
    hasRealOutcome,
    hasUnrecognizedStatus: status !== pendingStatus && status !== completedStatus,
    p0,
    p1,
    nextFix,
    confusedMoment,
    hasOpenP0: hasRealOutcome && hasOpenIssue(p0),
    hasOpenP1: hasRealOutcome && hasOpenIssue(p1),
  };
}

function issueRows(sessions, severity) {
  return sessions
    .filter((session) => (severity === "P0" ? session.hasOpenP0 : session.hasOpenP1))
    .map((session) => ({
      session: session.id,
      fileName: session.fileName,
      severity,
      issue: severity === "P0" ? session.p0 : session.p1,
      nextFix: hasOpenIssue(session.nextFix) ? session.nextFix : "-",
      confusedMoment: hasOpenIssue(session.confusedMoment) ? session.confusedMoment : "-",
    }));
}

const sessions = sessionIds.map(readSession);
const p0Queue = issueRows(sessions, "P0");
const p1Queue = issueRows(sessions, "P1");
const realSessionCount = sessions.filter((session) => session.hasRealOutcome).length;
const unrecognizedStatusCount = sessions.filter((session) => session.hasUnrecognizedStatus).length;
const statusLabel =
  unrecognizedStatusCount > 0
    ? "상태 확인 필요"
    : p0Queue.length > 0
      ? "P0 수정 필요"
      : p1Queue.length > 0
        ? "P1 튜닝 후보"
        : realSessionCount === 0
          ? "실제 세션 대기"
          : realSessionCount < sessions.length
            ? "실제 세션 진행 중"
            : "이슈 큐 비어 있음";
const queueRows = [...p0Queue, ...p1Queue];
const queueTable =
  queueRows.length > 0
    ? queueRows
        .map(
          (row) =>
            `| ${row.session} | ${row.severity} | ${row.issue} | ${row.nextFix} | ${row.confusedMoment} | \`${row.fileName}\` |`,
        )
        .join("\n")
    : "| - | - | - | - | - | - |";

const markdown = `# v0.56 Blind Playtest Issue Queue

Status: ${statusLabel}
작성일: ${todayKst}

## 판정

- 실제 세션: ${realSessionCount}/5
- P0 큐: ${p0Queue.length}
- P1 큐: ${p1Queue.length}
- 상태 미인정: ${unrecognizedStatusCount}
- 최종 그래픽 에셋 전에는 P0 큐가 0이어야 한다
- P1 원칙: P1 큐는 후속 튜닝 후보로 유지하되, P0/증거 게이트를 통과하면 에셋 투입을 막지 않음
- 요약 게이트: \`npm run qa:blind-summary\`

## 세션 상태

| Session | Status | File |
|---:|---|---|
${sessions.map((session) => `| ${session.id} | ${session.status} | \`${session.fileName}\` |`).join("\n")}

## 수정 큐

| Session | Severity | Issue | 다음 수정 후보 | 제일 헷갈렸던 순간 | File |
|---:|---|---|---|---|---|
${queueTable}

## 다음 행동

1. 실제 세션 완료 후 \`Status: 완료\`, \`P0\`, \`P1\`, 종료 질문을 채운다.
2. \`npm run qa:blind-summary\`와 \`npm run qa:blind-issues\`를 함께 실행한다.
3. P0 큐가 있으면 최종 그래픽 에셋 투입 전에 코드/문구/흐름 수정을 먼저 한다.
4. P1 큐는 v0.56 후속 튜닝 후보로 남기고, 에셋 투입 여부는 요약 게이트의 P0/증거 판정으로 결정한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Real sessions: ${realSessionCount}/5`);
console.log(`P0 queue: ${p0Queue.length}`);
console.log(`P1 queue: ${p1Queue.length}`);
console.log(`Unrecognized status: ${unrecognizedStatusCount}`);
