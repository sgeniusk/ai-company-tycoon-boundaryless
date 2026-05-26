import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const requestPacketPath = path.join(playtestDir, "v0_56_blind_playtest_request_packet.md");
const agyOutboxPath = path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md");
const reportPath = path.join(playtestDir, "v0_56_blind_playtest_url_sync.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

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

function replaceFreshUrl(content, replacement, sessionPattern) {
  const escapedSession = sessionPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp("https?:\\/\\/[^\\s`]+\\?scenario=fresh&playtest=v056&session=" + escapedSession, "g");
  return content.replace(pattern, replacement);
}

function replacePlayerUrl(content, replacement) {
  return content.replace(/https?:\/\/[^\s`]+\?scenario=fresh(?!&)/g, replacement);
}

function updateFile(filePath, updater) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = updater(before);
  fs.writeFileSync(filePath, after);
  return before !== after;
}

const remoteBase = normalizeRemoteBase(getBaseArg() ?? process.env.PLAYTEST_BASE_URL);
if (!remoteBase) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `# v0.56 Blind Playtest URL Sync

Status: 원격 URL 필요
작성일: ${todayKst}

## 오류

\`PLAYTEST_BASE_URL\` 또는 \`--base\`에 localhost가 아닌 http(s) URL을 지정해야 한다.

예:

\`\`\`bash
PLAYTEST_BASE_URL=https://preview.example.com/ai-company npm run qa:blind-url-sync
\`\`\`
`,
  );
  console.error("Remote non-local PLAYTEST_BASE_URL or --base is required.");
  process.exit(1);
}

const playerUrl = withQuery(remoteBase, { scenario: "fresh" });
const observerUrl = withQuery(remoteBase, { scenario: "fresh", playtest: "v056", session: "1" });
const observerTemplateUrl = observerUrl.replace("session=1", "session=<세션번호>");

const requestChanged = updateFile(requestPacketPath, (content) =>
  replacePlayerUrl(replaceFreshUrl(content, observerUrl, "1"), playerUrl),
);
const outboxChanged = updateFile(agyOutboxPath, (content) =>
  replacePlayerUrl(replaceFreshUrl(content, observerTemplateUrl, "<세션번호>"), playerUrl),
);

const markdown = `# v0.56 Blind Playtest URL Sync

Status: URL 동기화 완료
작성일: ${todayKst}

## URL

- 플레이어 URL: \`${playerUrl}\`
- 진행자 URL: \`${observerUrl}\`
- AGY 세션 템플릿 URL: \`${observerTemplateUrl}\`

## 갱신 파일

| File | Changed |
|---|---|
| \`v0_56_blind_playtest_request_packet.md\` | ${requestChanged ? "yes" : "no"} |
| \`v0_56_blind_playtest_agy_outbox.md\` | ${outboxChanged ? "yes" : "no"} |

## 다음 행동

1. \`npm run qa:blind-preflight\`를 같은 \`PLAYTEST_BASE_URL\`로 실행한다.
2. \`npm run qa:blind-readiness\`로 세션 파일이 아직 \`예정\`인지 확인한다.
3. 원격 URL이 맞으면 요청 패킷 또는 AGY outbox를 실제 진행자에게 보낸다.
`;

fs.writeFileSync(reportPath, markdown);

console.log(`Wrote ${path.relative(root, reportPath)}`);
console.log(`Player URL: ${playerUrl}`);
console.log(`Observer URL: ${observerUrl}`);
