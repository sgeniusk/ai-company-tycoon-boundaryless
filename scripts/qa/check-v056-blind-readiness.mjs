import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_readiness.md");
const sessionIds = ["01", "02", "03", "04", "05"];
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function readFile(fileName) {
  return fs.readFileSync(path.join(playtestDir, fileName), "utf8");
}

function getStatus(content) {
  return content.match(/^Status:[ \t]*(.+)$/m)?.[1]?.trim() ?? "unknown";
}

function sessionState(id) {
  const fileName = `v0_56_blind_playtest_session_${id}.md`;
  const content = readFile(fileName);
  const status = getStatus(content);
  const p0 = content.match(/^- P0:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";
  const p1 = content.match(/^- P1:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";

  return {
    id,
    fileName,
    status,
    untouched: status === "예정" && p0.length === 0 && p1.length === 0,
  };
}

const requestPacket = readFile("v0_56_blind_playtest_request_packet.md");
const agyOutbox = readFile("v0_56_blind_playtest_agy_outbox.md");
const dispatchLog = readFile("v0_56_blind_playtest_dispatch_log.md");
const summary = readFile("v0_56_blind_playtest_summary.md");
const sessions = sessionIds.map(sessionState);

const requestPacketReady = getStatus(requestPacket) === "준비됨 / 발송 전";
const agyOutboxReady = getStatus(agyOutbox) === "발송 준비 / 실제 발송 미확인";
const dispatchLogReady = getStatus(dispatchLog) === "발송 대기 / 실제 발송 미확인";
const sessionsUntouched = sessions.every((session) => session.untouched);
const summaryStillWaiting =
  summary.includes("실제 세션: 0/5") &&
  summary.includes("열린 P0: 0") &&
  summary.includes("열린 P1: 0") &&
  summary.includes("아트 투입 판정: 대기");
const readyToSend = requestPacketReady && agyOutboxReady && dispatchLogReady && sessionsUntouched && summaryStillWaiting;

const markdown = `# v0.56 Blind Playtest Readiness

Status: ${readyToSend ? "발송 준비" : "점검 필요"}
작성일: ${todayKst}

## 판정

- 실제 세션: 0/5
- 요청 패킷: ${requestPacketReady ? "OK" : "점검 필요"}
- AGY 발송문: ${agyOutboxReady ? "OK" : "점검 필요"}
- 발송 로그: ${dispatchLogReady ? "OK" : "점검 필요"}
- 세션 결과 조작 없음: ${sessionsUntouched ? "OK" : "점검 필요"}
- 요약 게이트: ${summaryStillWaiting ? "OK" : "점검 필요"}
- 아트 투입 판정: 대기

## 발송 자료

- 요청 패킷: \`v0_56_blind_playtest_request_packet.md\`
- AGY 발송문: \`v0_56_blind_playtest_agy_outbox.md\`
- 발송 로그: \`v0_56_blind_playtest_dispatch_log.md\`
- 원격/튜토리얼 preflight: \`npm run qa:blind-preflight\`
- 요약 게이트 재실행: \`npm run qa:blind-summary\`

## 세션 파일 상태

| Session | Status | 결과 미기입 | File |
|---:|---|---|---|
${sessions.map((session) => `| ${session.id} | ${session.status} | ${session.untouched ? "OK" : "점검 필요"} | \`${session.fileName}\` |`).join("\n")}

## 다음 행동

1. 외부/AGY 세션이면 \`PLAYTEST_BASE_URL=https://...\`와 함께 \`npm run qa:blind-preflight\`를 먼저 실행한다.
2. AGY 또는 실제 진행자에게 \`v0_56_blind_playtest_agy_outbox.md\`를 보낸다.
3. 실제 세션 완료 후 해당 세션 파일의 \`Status\`를 \`완료\`로 바꾼다.
4. \`npm run qa:blind-summary\`를 실행한다.
5. \`실제 세션: 5/5\`, \`열린 P0: 0\`, \`P0 미기록: 0\`, \`상태 미인정: 0\`, \`증거 미기록: 0\`, \`아트 투입 판정: 가능\`일 때만 최종 그래픽 에셋 투입을 시작한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Ready to send: ${readyToSend ? "yes" : "no"}`);
console.log(`Sessions untouched: ${sessionsUntouched ? "yes" : "no"}`);
console.log("Real sessions: 0/5");
console.log("Art gate: 대기");
