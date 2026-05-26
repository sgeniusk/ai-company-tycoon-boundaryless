import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const outputPath = path.join(playtestDir, "v0_56_blind_playtest_preflight.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function readRelative(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function isLocalUrl(value) {
  return /https?:\/\/(127\.0\.0\.1|localhost|\[::1\]|::1)/i.test(value);
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

function tutorialDelayState(source) {
  const productIdeasDelayed = /id:\s*["']product_ideas["'][\s\S]{0,700}activeProducts\.length\s*>\s*0/.test(source);
  const competitionDelayed = /id:\s*["']competition_pressure["'][\s\S]{0,900}activeProducts\.length\s*>\s*0/.test(source);
  return {
    productIdeasDelayed,
    competitionDelayed,
    ok: productIdeasDelayed && competitionDelayed,
  };
}

const requestPacket = readRelative("reports/playtests/v0_56_blind_playtest_request_packet.md");
const agyOutbox = readRelative("reports/playtests/v0_56_blind_playtest_agy_outbox.md");
const summary = readRelative("reports/playtests/v0_56_blind_playtest_summary.md");
const handoff = readRelative("reports/playtests/v0_56_final_art_handoff_packet.md");
const tutorialGuide = readRelative("src/game/tutorial-guide.ts");

const remoteBase = normalizeRemoteBase(process.env.PLAYTEST_BASE_URL);
const playerUrl = remoteBase ? withQuery(remoteBase, { scenario: "fresh" }) : undefined;
const observerUrl = remoteBase ? withQuery(remoteBase, { scenario: "fresh", playtest: "v056", session: "1" }) : undefined;
const observerTemplateUrl = observerUrl?.replace("session=1", "session=<세션번호>");
const requestPacketLocalOnly = isLocalUrl(requestPacket) || isLocalUrl(agyOutbox);
const handoffUrlsSynced = Boolean(
  playerUrl &&
    observerUrl &&
    observerTemplateUrl &&
    requestPacket.includes(playerUrl) &&
    requestPacket.includes(observerUrl) &&
    agyOutbox.includes(playerUrl) &&
    agyOutbox.includes(observerTemplateUrl),
);
const requestPacketUrlState = !remoteBase
  ? requestPacketLocalOnly
    ? "로컬 전용"
    : "원격 또는 외부 접근 URL 포함"
  : handoffUrlsSynced
    ? "동기화 완료"
    : "URL 동기화 필요";
const tutorialDelay = tutorialDelayState(tutorialGuide);
const realSessionsWaiting = summary.includes("실제 세션: 0/5");
const finalArtBlocked =
  (summary.includes("아트 투입 판정: 대기") || handoff.includes("최종 그래픽 에셋 투입: 대기")) &&
  handoff.includes("AGY 발송 금지");
const remoteReady = Boolean(remoteBase);
const ready = remoteReady && handoffUrlsSynced && tutorialDelay.ok && realSessionsWaiting && finalArtBlocked;
const status = ready ? "원격 테스트 준비" : !remoteReady ? "원격 URL 필요" : !handoffUrlsSynced ? "URL 동기화 필요" : "점검 필요";
const remoteUrlGuidance = handoffUrlsSynced
  ? "현재 request packet과 AGY outbox는 위 원격 URL로 동기화되어 있다. 세션 전에는 이 URL이 계속 열리는지만 다시 확인한다."
  : "현재 request packet 또는 AGY outbox가 위 원격 URL과 맞지 않는다. 외부 진행자나 AGY에 실제 세션을 맡기기 전에는 터널 또는 preview URL을 `PLAYTEST_BASE_URL`로 지정하고 `npm run qa:blind-url-sync`로 이 리포트의 URL을 요청 패킷과 동기화한다.";

const markdown = `# v0.56 Blind Playtest Preflight

Status: ${status}
작성일: ${todayKst}

## 판정

- 원격 플레이어 URL: ${remoteReady ? "OK" : "필요"}
- 현재 요청 패킷 URL: ${requestPacketUrlState}
- 튜토리얼 딜레이: ${tutorialDelay.ok ? "OK" : "점검 필요"}
- 실제 세션: ${realSessionsWaiting ? "0/5" : "점검 필요"}
- 최종 아트 요청: ${finalArtBlocked ? "대기" : "점검 필요"}

## 원격 URL

- 환경 변수: \`PLAYTEST_BASE_URL\`
- 플레이어 URL: ${playerUrl ? `\`${playerUrl}\`` : "`PLAYTEST_BASE_URL` 필요"}
- 진행자 URL: ${observerUrl ? `\`${observerUrl}\`` : "`PLAYTEST_BASE_URL` 필요"}

${remoteUrlGuidance}

## 튜토리얼 딜레이 점검

- idea composer waits for activeProducts: ${tutorialDelay.productIdeasDelayed ? "OK" : "점검 필요"}
- competition tutorial waits for activeProducts: ${tutorialDelay.competitionDelayed ? "OK" : "점검 필요"}

이 점검은 첫 제품 개발 전 \`아이디어 조합실\` 또는 \`경쟁사\` 튜토리얼이 추천 첫 제품 카드 위로 끼어들지 않도록 유지하는 preflight다.

## 잠금 확인

- 실제 사람 세션 파일은 아직 0/5 상태여야 한다.
- 최종 그래픽 에셋 요청은 \`qa:asset-handoff\`가 가능을 내기 전까지 보내지 않는다.
- AGY 에이전트 리뷰는 실제 사람 세션을 대체하지 않는다.

## 다음 행동

1. 원격 테스트를 진행할 때는 \`PLAYTEST_BASE_URL=https://...\`와 함께 \`npm run qa:blind-url-sync\`를 먼저 실행한다.
2. 같은 \`PLAYTEST_BASE_URL\`로 \`npm run qa:blind-preflight\`를 다시 실행해 URL 동기화와 튜토리얼 딜레이를 확인한다.
3. \`qa:blind-readiness\`와 \`qa:asset-handoff\`를 다시 실행해 세션/아트 잠금을 확인한다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Status: ${status}`);
console.log(`Remote player URL: ${playerUrl ?? "required"}`);
console.log(`Tutorial delay: ${tutorialDelay.ok ? "OK" : "check required"}`);
