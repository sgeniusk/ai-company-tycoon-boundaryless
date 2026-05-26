import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const sessionLinksPath = path.join(playtestDir, "v0_56_blind_playtest_session_links.md");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_live_check.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
const sessionIds = ["01", "02", "03", "04", "05"];
const noNetwork = !process.argv.includes("--network") || process.argv.includes("--no-network");

function isLocalUrl(value) {
  return /https?:\/\/(127\.0\.0\.1|localhost|\[::1\]|::1)/i.test(value);
}

function extractUrls(content) {
  return [...content.matchAll(/https?:\/\/[^\s`<>|]+/g)].map((match) => match[0].replace(/[),.]+$/, ""));
}

function readStatus(sessionId) {
  const filePath = path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`);
  if (!fs.existsSync(filePath)) return "Status: 파일 없음";
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^Status:\s*(.+)$/m);
  return match ? `Status: ${match[1].trim()}` : "Status: 미기록";
}

function classifyUrls(urls) {
  const playerUrls = new Set();
  const observerBySession = new Map();

  for (const rawUrl of urls) {
    if (isLocalUrl(rawUrl)) continue;

    try {
      const url = new URL(rawUrl);
      if (url.searchParams.get("scenario") !== "fresh") continue;
      const playtest = url.searchParams.get("playtest");
      const session = url.searchParams.get("session");
      if (playtest === "v056" && session) {
        observerBySession.set(session, url.toString());
      } else if (!playtest) {
        playerUrls.add(url.toString());
      }
    } catch {
      // Ignore malformed snippets.
    }
  }

  return {
    playerUrl: [...playerUrls][0],
    observerBySession,
  };
}

async function headCheck(url) {
  try {
    const output = execFileSync(
      "curl",
      ["-I", "-L", "--max-time", "8", "-s", "-o", "/dev/null", "-w", "%{http_code}", url],
      { encoding: "utf8" },
    );
    const statusCode = Number(output.trim());
    return {
      ok: statusCode >= 200 && statusCode < 400,
      status: Number.isFinite(statusCode) ? statusCode : 0,
      note: statusCode >= 200 && statusCode < 400 ? "OK" : `HTTP ${output.trim() || "unknown"}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      note: error instanceof Error ? error.message.split("\n")[0] : "request failed",
    };
  }
}

if (!fs.existsSync(sessionLinksPath)) {
  fs.mkdirSync(playtestDir, { recursive: true });
  fs.writeFileSync(
    outputPath,
    `# v0.56 Blind Playtest Live Link Check

Status: 점검 필요
작성일: ${todayKst}

## 오류

\`v0_56_blind_playtest_session_links.md\`가 없다. 먼저 \`npm run qa:blind-session-links\`를 실행한다.
`,
  );
  console.error("Session link sheet is missing.");
  process.exit(1);
}

const sessionLinks = fs.readFileSync(sessionLinksPath, "utf8");
const { playerUrl, observerBySession } = classifyUrls(extractUrls(sessionLinks));
const sessionStatuses = sessionIds.map((sessionId) => [sessionId, readStatus(sessionId)]);
const allSessionsPending = sessionStatuses.every(([, status]) => status === "Status: 예정");
const expectedObserverUrls = sessionIds.map((sessionId, index) => [sessionId, observerBySession.get(String(index + 1))]);
const allObserverUrlsPresent = expectedObserverUrls.every(([, url]) => Boolean(url));
const structureReady = Boolean(playerUrl) && allObserverUrlsPresent && allSessionsPending;
const urlsToCheck = [playerUrl, ...expectedObserverUrls.map(([, url]) => url)].filter(Boolean);

const networkResults = noNetwork
  ? urlsToCheck.map((url) => ({ url, ok: true, status: 0, note: "skipped" }))
  : await Promise.all(urlsToCheck.map(async (url) => ({ url, ...(await headCheck(url)) })));
const allLive = networkResults.every((result) => result.ok);
const status = !structureReady ? "점검 필요" : noNetwork ? "링크 구조 준비" : allLive ? "원격 링크 정상" : "점검 필요";

const linkRows = expectedObserverUrls
  .map(([sessionId, url], index) => {
    const sessionNumber = index + 1;
    return `| ${sessionId} | ${readStatus(sessionId)} | \`${playerUrl ?? "missing"}\` | \`${url ?? `missing session=${sessionNumber}`}\` |`;
  })
  .join("\n");
const networkRows = networkResults
  .map((result) => `| \`${result.url}\` | ${result.note} | ${result.status || "-"} |`)
  .join("\n");

const markdown = `# v0.56 Blind Playtest Live Link Check

Status: ${status}
작성일: ${todayKst}

## 판정

- 링크 시트: \`v0_56_blind_playtest_session_links.md\`
- 플레이어 URL: ${playerUrl ? "OK" : "점검 필요"}
- 세션 링크 수: ${expectedObserverUrls.filter(([, url]) => Boolean(url)).length}/5
- 세션 파일 상태: ${allSessionsPending ? "모두 Status: 예정" : "점검 필요"}
- Remote check: ${noNetwork ? "skipped; run direct curl -I for HTTP evidence in this sandbox" : allLive ? "OK" : "점검 필요"}

## 세션별 링크

| Session | Record status | Player URL | Facilitator observer URL |
|---:|---|---|---|
${linkRows}

## 원격 응답

| URL | Result | HTTP |
|---|---|---:|
${networkRows}

## 운영 경계

- 플레이어에게는 player URL만 준다.
- 진행자만 observer URL을 사용한다.
- 실제 세션 전에는 세션 파일을 \`Status: 예정\`으로 유지한다.
- 최종 그래픽 에셋 요청은 아직 금지한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Status: ${status}`);
console.log(`Remote check: ${noNetwork ? "skipped" : allLive ? "OK" : "check required"}`);
