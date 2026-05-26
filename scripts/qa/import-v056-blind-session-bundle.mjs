import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_intake.md");
const sessionIds = ["01", "02", "03", "04", "05"];
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const completedStatus = "완료";

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return "";
  }
  return process.argv[index + 1] ?? "";
}

function getStatus(content) {
  return content.match(/^Status:[ \t]*(.+)$/m)?.[1]?.trim() ?? "unknown";
}

function getLineValue(content, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`^- ${escapedLabel}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function sessionFileName(id) {
  return `v0_56_blind_playtest_session_${id}.md`;
}

function writeReport({ statusLabel, sourceLabel, importedCount, rejectedCount, rows, notes }) {
  const rowMarkdown = rows
    .map((row) => `| ${row.id} | ${row.result} | ${row.reason} | \`${row.fileName}\` |`)
    .join("\n");
  const noteMarkdown = notes.length > 0 ? notes.map((note) => `- ${note}`).join("\n") : "- 특이사항 없음";
  const markdown = `# v0.56 Blind Playtest Intake

Status: ${statusLabel}
작성일: ${todayKst}

## 목적

AGY 또는 실제 진행자가 돌려준 세션 파일을 로컬 블라인드 테스트 기록으로 가져온다. 실제 세션 파일만 받으며, 미완료 파일이나 \`P0:\`가 비어 있는 파일은 반영하지 않는다.

## 사용법

- 수신 폴더: \`${sourceLabel}\`
- 실행: \`npm run qa:blind-intake -- --source <folder>\`
- 후속 요약: \`npm run qa:blind-summary\`
- 후속 이슈 큐: \`npm run qa:blind-issues\`

## 판정

- 가져온 세션: ${importedCount}
- 거부된 세션: ${rejectedCount}
- 원칙: \`Status: 완료\`와 \`P0:\` 기록이 있는 세션만 가져온다
- 세션 결과가 없는 파일은 기존 로컬 세션 파일을 건드리지 않는다

## 세션 수신 상태

| Session | Result | 사유 | File |
|---:|---|---|---|
${rowMarkdown}

## 참고 세션 파일

- \`v0_56_blind_playtest_session_01.md\`
- \`v0_56_blind_playtest_session_02.md\`
- \`v0_56_blind_playtest_session_03.md\`
- \`v0_56_blind_playtest_session_04.md\`
- \`v0_56_blind_playtest_session_05.md\`

## 특이사항

${noteMarkdown}

## 다음 행동

1. 수신 반영 후 \`npm run qa:blind-summary\`를 실행한다.
2. 이어서 \`npm run qa:blind-issues\`를 실행해 P0/P1 큐를 확인한다.
3. 실제 세션 5/5, 열린 P0 0, P0 큐 0, 증거 미기록 0이 될 때까지 최종 그래픽 에셋 요청은 보내지 않는다.
`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown);
}

function waitingRows() {
  return sessionIds.map((id) => ({
    id,
    fileName: sessionFileName(id),
    result: "미수신",
    reason: "아직 수신 폴더가 지정되지 않음",
  }));
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

const sourceDir = getArg("--source") || getArg("-s");

if (!sourceDir) {
  writeReport({
    statusLabel: "수신 대기",
    sourceLabel: "미지정",
    importedCount: 0,
    rejectedCount: 0,
    rows: waitingRows(),
    notes: ["AGY 또는 실제 진행자가 세션 파일을 돌려주면 `--source`로 폴더를 지정한다."],
  });
  console.log(`Wrote ${path.relative(root, outputPath)}`);
  console.log("Blind intake: waiting for source folder");
  process.exit(0);
}

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  writeReport({
    statusLabel: "수신 점검 필요",
    sourceLabel: sourceDir,
    importedCount: 0,
    rejectedCount: 0,
    rows: waitingRows(),
    notes: [`수신 폴더를 찾을 수 없음: ${sourceDir}`],
  });
  fail(`Source folder does not exist: ${sourceDir}`);
  process.exit();
}

const rows = [];
const candidates = [];
const rejected = [];

for (const id of sessionIds) {
  const fileName = sessionFileName(id);
  const sourcePath = path.join(sourceDir, fileName);

  if (!fs.existsSync(sourcePath)) {
    rows.push({ id, fileName, result: "미수신", reason: "수신 폴더에 파일 없음" });
    continue;
  }

  const content = fs.readFileSync(sourcePath, "utf8");
  const status = getStatus(content);
  const p0 = getLineValue(content, "P0");

  if (status !== completedStatus) {
    rejected.push({ id, fileName, reason: `Status가 완료가 아님: ${status}` });
    rows.push({ id, fileName, result: "거부", reason: `Status가 완료가 아님: ${status}` });
    continue;
  }

  if (p0.length === 0) {
    rejected.push({ id, fileName, reason: "P0 미기록" });
    rows.push({ id, fileName, result: "거부", reason: "P0 미기록" });
    continue;
  }

  candidates.push({ id, fileName, content });
  rows.push({ id, fileName, result: "수신 반영", reason: "완료 세션 확인" });
}

if (rejected.length > 0) {
  writeReport({
    statusLabel: "수신 점검 필요",
    sourceLabel: sourceDir,
    importedCount: 0,
    rejectedCount: rejected.length,
    rows,
    notes: rejected.map((entry) => `${entry.fileName}: ${entry.reason}`),
  });
  fail(`Rejected ${rejected.length} returned session file(s).`);
  process.exit();
}

const backupDir = path.join(
  playtestDir,
  "intake",
  `v0_56_blind_intake_backup_${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}`,
);

for (const candidate of candidates) {
  const destinationPath = path.join(playtestDir, candidate.fileName);
  if (fs.existsSync(destinationPath)) {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(destinationPath, path.join(backupDir, candidate.fileName));
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, candidate.content.endsWith("\n") ? candidate.content : `${candidate.content}\n`);
}

const statusLabel = candidates.length > 0 ? "수신 반영" : "수신 없음";
const notes = candidates.length > 0 ? [`기존 파일 백업 위치: ${path.relative(root, backupDir)}`] : ["수신 폴더에서 세션 파일을 찾지 못함"];

writeReport({
  statusLabel,
  sourceLabel: sourceDir,
  importedCount: candidates.length,
  rejectedCount: 0,
  rows,
  notes,
});

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Imported sessions: ${candidates.length}`);
console.log("Rejected sessions: 0");
