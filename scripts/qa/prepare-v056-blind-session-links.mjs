import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const requestPacketPath = path.join(playtestDir, "v0_56_blind_playtest_request_packet.md");
const agyOutboxPath = path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md");
const reportPath = path.join(playtestDir, "v0_56_blind_playtest_session_links.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const sessionIds = ["01", "02", "03", "04", "05"];

function isLocalUrl(value) {
  return /https?:\/\/(127\.0\.0\.1|localhost|\[::1\]|::1)/i.test(value);
}

function getBaseArg() {
  const index = process.argv.indexOf("--base");
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalizeRemoteBase(value) {
  const raw = value?.trim();
  if (!raw) return undefined;

  try {
    const base = new URL(raw.replace(/\/+$/, "") + "/");
    if (!/^https?:$/.test(base.protocol) || isLocalUrl(base.toString())) return undefined;
    return base;
  } catch {
    return undefined;
  }
}

function withQuery(base, entries) {
  const url = new URL(base.toString());
  for (const [key, value] of Object.entries(entries)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function extractUrls(content) {
  return [...content.matchAll(/https?:\/\/[^\s`<>]+/g)].map((match) => match[0].replace(/[),.]+$/, ""));
}

function remoteBaseFromPacket(content) {
  for (const rawUrl of extractUrls(content)) {
    if (isLocalUrl(rawUrl)) continue;
    try {
      const url = new URL(rawUrl);
      if (url.searchParams.get("scenario") !== "fresh") continue;
      if (url.searchParams.has("playtest")) continue;
      url.search = "";
      url.hash = "";
      return normalizeRemoteBase(url.toString());
    } catch {
      // Ignore non-URL fragments; the packet may contain example placeholders.
    }
  }
  return undefined;
}

function readStatus(sessionId) {
  const fileName = `v0_56_blind_playtest_session_${sessionId}.md`;
  const filePath = path.join(playtestDir, fileName);
  if (!fs.existsSync(filePath)) return "Status: 파일 없음";

  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^Status:\s*(.+)$/m);
  return match ? `Status: ${match[1].trim()}` : "Status: 미기록";
}

function writeRemoteNeededReport() {
  fs.mkdirSync(playtestDir, { recursive: true });
  fs.writeFileSync(
    reportPath,
    `# v0.56 Blind Playtest Session Links

Status: 원격 URL 필요
작성일: ${todayKst}

## 필요한 조치

\`PLAYTEST_BASE_URL\` 또는 \`--base\`에 localhost가 아닌 URL을 지정하거나, 먼저 \`npm run qa:blind-url-sync\`로 request packet을 원격 URL에 맞춘다.

\`\`\`bash
PLAYTEST_BASE_URL=https://preview.example.com/ai-company npm run qa:blind-url-sync
npm run qa:blind-session-links
\`\`\`
`,
  );
}

const requestPacket = fs.existsSync(requestPacketPath) ? fs.readFileSync(requestPacketPath, "utf8") : "";
const agyOutbox = fs.existsSync(agyOutboxPath) ? fs.readFileSync(agyOutboxPath, "utf8") : "";
const remoteBase = normalizeRemoteBase(getBaseArg() ?? process.env.PLAYTEST_BASE_URL) ?? remoteBaseFromPacket(requestPacket);

if (!remoteBase) {
  writeRemoteNeededReport();
  console.error("Remote non-local PLAYTEST_BASE_URL, --base, or synced request packet URL is required.");
  process.exit(1);
}

const playerUrl = withQuery(remoteBase, { scenario: "fresh" });
const observerUrlFor = (sessionNumber) =>
  withQuery(remoteBase, { scenario: "fresh", playtest: "v056", session: String(sessionNumber) });
const observerTemplateUrl = observerUrlFor(1).replace("session=1", "session=<세션번호>");
const urlsSynced =
  requestPacket.includes(playerUrl) &&
  requestPacket.includes(observerUrlFor(1)) &&
  agyOutbox.includes(playerUrl) &&
  agyOutbox.includes(observerTemplateUrl);
const allSessionsPending = sessionIds.every((sessionId) => readStatus(sessionId) === "Status: 예정");
const status = urlsSynced && allSessionsPending ? "세션 링크 준비" : "점검 필요";

const rows = sessionIds
  .map((sessionId, index) => {
    const sessionNumber = index + 1;
    return `| ${sessionId} | ${readStatus(sessionId)} | \`${playerUrl}\` | \`${observerUrlFor(sessionNumber)}\` | \`v0_56_blind_playtest_session_${sessionId}.md\` |`;
  })
  .join("\n");

const markdown = `# v0.56 Blind Playtest Session Links

Status: ${status}
작성일: ${todayKst}

## 공통 URL

- 플레이어 공통 URL: \`${playerUrl}\`
- 진행자 관찰 URL 형식: \`${observerTemplateUrl}\`
- request packet / AGY outbox URL: ${urlsSynced ? "동기화 완료" : "동기화 필요"}
- 세션 파일 상태: ${allSessionsPending ? "모두 Status: 예정" : "점검 필요"}

## 세션별 링크

| Session | Record status | Player URL | Facilitator observer URL | Record file |
|---:|---|---|---|---|
${rows}

## 진행자 주의

- 플레이어에게 관찰 HUD를 보여주지 않는다.
- 플레이어에게 게임 설명을 하지 않는다.
- 진행자만 해당 세션의 observer URL을 열고 체크포인트를 기록한다.
- 세션이 끝난 뒤에만 해당 파일을 \`Status: 완료\`로 바꾼다.
- \`P0:\`는 \`없음\` 또는 구체적인 P0로 반드시 채운다.

## 발송 전 명령

\`\`\`bash
PLAYTEST_BASE_URL=${remoteBase.toString().replace(/\/$/, "")} npm run qa:blind-preflight
npm run qa:blind-readiness
npm run qa:asset-handoff
\`\`\`

\`qa:asset-handoff\`는 실제 세션 5/5와 P0/evidence 게이트가 열릴 때까지 계속 \`AGY 발송 금지\`를 보여야 한다.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown);

console.log(`Wrote ${path.relative(root, reportPath)}`);
console.log(`Status: ${status}`);
console.log(`Player URL: ${playerUrl}`);
