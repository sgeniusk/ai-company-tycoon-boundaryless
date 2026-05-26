import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_summary.md");
const sessionIds = ["01", "02", "03", "04", "05"];
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const pendingStatus = "예정";
const completedStatus = "완료";
const requiredCheckpointLabels = ["첫 10초", "첫 3분", "첫 10분", "첫 15분", "첫 20분", "첫 30분"];
const requiredExitQuestionChecks = [
  { label: "종료 질문 1", bullet: "처음 본 게임 인상" },
  { label: "종료 질문 2", bullet: "첫 5분 목표 이해" },
  { label: "종료 질문 3", bullet: "제일 재밌었던 순간" },
  { label: "종료 질문 4", bullet: "제일 헷갈렸던 순간" },
  { label: "종료 질문 5", bullet: "다시 해보고 싶은 마음" },
];
const noIssueValues = new Set(["없음", "없음.", "none", "해당 없음", "해당없음", "n/a", "-"]);

function hasOpenIssue(value) {
  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.length > 0 && !noIssueValues.has(normalizedValue);
}

function getBulletValue(content, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`^- ${escapedLabel}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function getCheckpointObservation(content, label) {
  const line = content.split("\n").find((candidate) => candidate.trim().startsWith(`| ${label} |`));
  if (!line) {
    return "";
  }

  const cells = line.split("|").map((cell) => cell.trim());
  return cells[3] ?? "";
}

function readSession(id) {
  const fileName = `v0_56_blind_playtest_session_${id}.md`;
  const filePath = path.join(playtestDir, fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const status = content.match(/^Status:[ \t]*(.+)$/m)?.[1]?.trim() ?? "unknown";
  const p0Line = content.match(/^- P0:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";
  const p1Line = content.match(/^- P1:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";
  const hasRealOutcome = status === completedStatus;
  const hasUnrecognizedStatus = status !== pendingStatus && status !== completedStatus;
  const hasRecordedP0 = !hasRealOutcome || p0Line.length > 0;
  const hasOpenP0 = hasRealOutcome && hasRecordedP0 && hasOpenIssue(p0Line);
  const hasOpenP1 = hasRealOutcome && hasOpenIssue(p1Line);
  const evidenceChecks = [
    { label: "테스터 대상", value: getBulletValue(content, "대상") },
    { label: "테스트 방식", value: getBulletValue(content, "방식") },
    { label: "시작 URL", value: getBulletValue(content, "시작 URL") },
    { label: "날짜/시간", value: getBulletValue(content, "날짜/시간") },
    { label: "환경", value: getBulletValue(content, "환경") },
    ...requiredCheckpointLabels.map((label) => ({ label, value: getCheckpointObservation(content, label) })),
    ...requiredExitQuestionChecks.map((check) => ({ label: check.label, value: getBulletValue(content, check.bullet) })),
  ];
  const missingEvidenceLabels = hasRealOutcome
    ? evidenceChecks.filter((check) => check.value.length === 0).map((check) => check.label)
    : [];
  const missingEvidence = missingEvidenceLabels.length > 0;
  const evidenceLabel = hasRealOutcome
    ? missingEvidence
      ? `누락: ${missingEvidenceLabels.join(", ")}`
      : "OK"
    : "-";

  return {
    id,
    fileName,
    status,
    hasRealOutcome,
    hasUnrecognizedStatus,
    hasRecordedP0,
    hasOpenP0,
    hasOpenP1,
    missingEvidence,
    evidenceLabel,
    p0Line: hasRealOutcome ? p0Line || "미기록" : "-",
    p1Line: hasRealOutcome ? p1Line || "미기록" : "-",
  };
}

const sessions = sessionIds.map(readSession);
const realSessionCount = sessions.filter((session) => session.hasRealOutcome).length;
const openP0Count = sessions.filter((session) => session.hasOpenP0).length;
const openP1Count = sessions.filter((session) => session.hasOpenP1).length;
const missingP0Count = sessions.filter((session) => session.hasRealOutcome && !session.hasRecordedP0).length;
const unrecognizedStatusCount = sessions.filter((session) => session.hasUnrecognizedStatus).length;
const missingEvidenceCount = sessions.filter((session) => session.missingEvidence).length;
const artGateReady =
  realSessionCount === sessions.length &&
  unrecognizedStatusCount === 0 &&
  missingP0Count === 0 &&
  missingEvidenceCount === 0 &&
  openP0Count === 0;
const statusLabel = artGateReady
  ? "아트 투입 준비"
  : realSessionCount === 0
    ? unrecognizedStatusCount > 0
      ? "상태 확인 필요"
      : "실제 세션 대기"
    : unrecognizedStatusCount > 0
      ? "상태 확인 필요"
      : missingP0Count > 0
        ? "P0 기록 필요"
        : missingEvidenceCount > 0
          ? "세션 증거 필요"
          : "P0/P1 정리 필요";
const artGateLabel = artGateReady ? "가능" : "대기";

const markdown = `# v0.56 Blind Playtest Summary

Status: ${statusLabel}
작성일: ${todayKst}

## 판정

- 실제 세션: ${realSessionCount}/5
- 열린 P0: ${openP0Count}
- 열린 P1: ${openP1Count}
- P0 미기록: ${missingP0Count}
- 상태 미인정: ${unrecognizedStatusCount}
- 증거 미기록: ${missingEvidenceCount}
- 아트 투입 판정: ${artGateLabel}
- 원칙: P0 닫힘 전에는 최종 그래픽 에셋 투입 금지
- P1 원칙: 열린 P1은 후속 튜닝 후보로 집계하되, P0/증거 게이트를 통과하면 아트 투입을 막지 않음
- 브리프: \`docs/ANTIGRAVITY_ART_BRIEF.md\`

## 세션 파일

| Session | Status | P0 | P1 | 증거 | File |
|---:|---|---|---|---|---|
${sessions.map((session) => `| ${session.id} | ${session.status} | ${session.p0Line} | ${session.p1Line} | ${session.evidenceLabel} | \`${session.fileName}\` |`).join("\n")}

## 다음 행동

1. 실제 사람 세션을 진행하면 각 파일의 \`Status\`를 \`완료\`로 바꾸고 테스터 프로필, \`P0\`, \`P1\`, 체크포인트 관찰, 종료 질문 답변을 채운다.
2. 다시 \`npm run qa:blind-summary\`를 실행한다.
3. \`실제 세션: 5/5\`, \`열린 P0: 0\`, \`P0 미기록: 0\`, \`상태 미인정: 0\`, \`증거 미기록: 0\`이 되면 최종 그래픽 에셋 투입을 시작한다.
4. 에셋 투입은 \`npm run assets:v053\`, \`npm run assets:v054\`, \`npm run qa:office-visuals:screenshots\` 순서로 검증한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Real sessions: ${realSessionCount}/5`);
console.log(`Open P0: ${openP0Count}`);
console.log(`Open P1: ${openP1Count}`);
console.log(`Missing P0: ${missingP0Count}`);
console.log(`Unrecognized status: ${unrecognizedStatusCount}`);
console.log(`Missing evidence: ${missingEvidenceCount}`);
console.log(`Art gate: ${artGateLabel}`);
