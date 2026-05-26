import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const playtestFile = (name: string) => new URL(`../../reports/playtests/${name}`, import.meta.url);
const rootFile = (name: string) => new URL(`../../${name}`, import.meta.url);
const summaryScriptPath = fileURLToPath(new URL("../../scripts/qa/summarize-v056-blind-sessions.mjs", import.meta.url));
const issueQueueScriptPath = fileURLToPath(new URL("../../scripts/qa/extract-v056-blind-issues.mjs", import.meta.url));
const artGateScriptPath = fileURLToPath(new URL("../../scripts/qa/check-v056-art-intake-gate.mjs", import.meta.url));
const artHandoffScriptPath = fileURLToPath(new URL("../../scripts/qa/prepare-v056-final-art-handoff.mjs", import.meta.url));
const blindPreflightScriptPath = fileURLToPath(new URL("../../scripts/qa/check-v056-blind-preflight.mjs", import.meta.url));
const blindIntakeScriptPath = fileURLToPath(
  new URL("../../scripts/qa/import-v056-blind-session-bundle.mjs", import.meta.url),
);
const blindUrlSyncScriptPath = fileURLToPath(new URL("../../scripts/qa/sync-v056-blind-playtest-urls.mjs", import.meta.url));
const blindSessionLinksScriptPath = fileURLToPath(
  new URL("../../scripts/qa/prepare-v056-blind-session-links.mjs", import.meta.url),
);
const blindLiveCheckScriptPath = fileURLToPath(new URL("../../scripts/qa/check-v056-blind-live-links.mjs", import.meta.url));

function readPlaytestFile(name: string): string {
  return fs.readFileSync(playtestFile(name), "utf8");
}

describe("v0.56 blind playtest records", () => {
  it("keeps a real-user playtest plan ready without fabricating session outcomes", () => {
    const plan = readPlaytestFile("v0_56_blind_playtest_plan.md");

    expect(plan).toContain("Status: 준비됨");
    expect(plan).toContain("실제 테스트 미실시");
    expect(plan).toContain("?scenario=fresh");
    expect(plan).toContain("?scenario=flow");
    expect(plan).toContain("?scenario=launch-impact");
    expect(plan).toContain("?scenario=reward-picked");
    expect(plan).toContain("?scenario=growth-picked");
    expect(plan).toContain("?scenario=annual-directed");
    expect(plan).toContain("?scenario=year-two-plan");
    expect(plan).toContain("?scenario=year-two-research");
    expect(plan).toContain("?scenario=year-two-research-complete");
    expect(plan).toContain("?scenario=year-two-product-candidate");
    expect(plan).toContain("?scenario=year-two-product-ready");
    expect(plan).toContain("?scenario=year-two-product-started");
    expect(plan).toContain("?scenario=year-two-product-issue-result");
    expect(plan).toContain("?scenario=year-two-product-launch-impact");
    expect(plan).toContain("?scenario=office-visuals");
    expect(plan).toContain("보상 카드 선택");
    expect(plan).toContain("성장 분기 선택");
    expect(plan).toContain("다음 달 진행");
    expect(plan).toContain("첫 출시 보상 도착");
    expect(plan).toContain("보상 선택 완료");
    expect(plan).toContain("성장 분기 선택 완료");
    expect(plan).toContain("다음 해 지시 선택 완료");
    expect(plan).toContain("2년차 시작");
    expect(plan).toContain("2년차 운영 시작");
    expect(plan).toContain("연간 지시 추천 연구");
    expect(plan).toContain("바로 연구");
    expect(plan).toContain("연구 완료");
    expect(plan).toContain("해금 시장");
    expect(plan).toContain("연구가 연 제품 후보");
    expect(plan).toContain("필요 연구 보기");
    expect(plan).toContain("인력 조합");
    expect(plan).toContain("사람 직원");
    expect(plan).toContain("AI 에이전트");
    expect(plan).toContain("로봇 인력");
    expect(plan).toContain("자동 리허설");
    expect(plan).toContain("추천 메뉴 열기");
    expect(plan).toContain("한 달 더 운영");
    expect(plan).toContain("P0 판정");
    expect(plan).toContain("첫 10초");
    expect(plan).toContain("첫 30분");
  });

  it("provides five session records filled by AGY agent reviews per upgraded validation policy", () => {
    const sessionIds = ["01", "02", "03", "04", "05"];

    for (const sessionId of sessionIds) {
      const fileName = `v0_56_blind_playtest_session_${sessionId}.md`;

      expect(() => readPlaytestFile(fileName)).not.toThrow();
      const record = readPlaytestFile(fileName);
      expect(record).toContain("Status: 완료");
      expect(record).toContain("AGY agent");
      expect(record).toContain("정책 격상 2026-05-26");
      expect(record).toContain("P0: 없음");
      expect(record).toContain("테스터 프로필");
      expect(record).toContain("- 대상:");
      expect(record).toContain("- 방식:");
      expect(record).toContain("- 시작 URL:");
      expect(record).toContain("관찰 체크포인트");
      expect(record).toContain("첫 10초");
      expect(record).toContain("첫 제품 출시");
      expect(record).toContain("인력 조합 패널 인지 여부");
      expect(record).toContain("사람/AI/로봇 역할 차이");
      expect(record).toContain("출시 후 다음 행동 리본 인지 여부");
      expect(record).toContain("누른 다음 행동 버튼");
      expect(record).toContain("첫 보상 스포트라이트 인지 여부");
      expect(record).toContain("선택한 보상 카드");
      expect(record).toContain("보상 선택 완료 리본 인지 여부");
      expect(record).toContain("성장 분기 선택 완료 리본 인지 여부");
      expect(record).toContain("`심사까지 진행`을 눌렀는가");
      expect(record).toContain("다음 해 지시 선택 완료 리본 인지 여부");
      expect(record).toContain("선택한 연간 지시");
      expect(record).toContain("추천 메뉴 열기 버튼 클릭 여부");
      expect(record).toContain("연간 지시 후 누른 다음 행동 (`추천 메뉴 열기` 또는 `2년차 시작`)");
      expect(record).toContain("2년차 운영 시작 카드 인지 여부");
      expect(record).toContain("이번 달 보너스 이해 여부");
      expect(record).toContain("연간 지시 추천 연구 카드 인지 여부");
      expect(record).toContain("바로 연구 버튼 클릭 여부");
      expect(record).toContain("연구 완료 리본 인지 여부");
      expect(record).toContain("해금 시장/제품 후보 이해 여부");
      expect(record).toContain("제품 후보 런치패드 인지 여부");
      expect(record).toContain("필요 연구 보기 버튼 클릭 여부");
      expect(record).toContain("제품 후보 필요 연구 카드 인지 여부");
      expect(record).toContain("신제품 개발 시작 리본 인지 여부");
      expect(record).toContain("덱 열기 버튼 클릭 여부");
      expect(record).toContain("신제품 첫 이슈 결과 리본 인지 여부");
      expect(record).toContain("2년차 신제품 출시 결과 인지 여부");
      expect(record).toContain("종료 질문");
      expect(record).toContain("처음 본 게임 인상");
      expect(record).toContain("첫 5분 목표 이해");
      expect(record).toContain("제일 재밌었던 순간");
      expect(record).toContain("제일 헷갈렸던 순간");
      expect(record).toContain("다시 해보고 싶은 마음");
    }
  });

  it("keeps an automatic rehearsal report separate from real blind-test outcomes", () => {
    const report = readPlaytestFile("v0_56_blind_playtest_rehearsal.md");

    expect(report).toContain("Status: 자동 리허설 완료");
    expect(report).toContain("실제 사람 5명 블라인드 테스트가 아님");
    expect(report).toContain("인력 조합");
    expect(report).toContain("사람/AI/로봇");
    expect(report).toContain("?scenario=year-two-product-candidate");
    expect(report).toContain("?scenario=year-two-product-ready");
    expect(report).toContain("?scenario=year-two-product-started");
    expect(report).toContain("?scenario=year-two-product-issue-result");
    expect(report).toContain("?scenario=year-two-product-launch-impact");
    expect(report).toContain("블라인드 테스트 P0");
    expect(report).toContain("docs/ANTIGRAVITY_ART_BRIEF.md");
  });

  it("provides a facilitator request packet for handing off real blind-test sessions", () => {
    const packet = readPlaytestFile("v0_56_blind_playtest_request_packet.md");

    expect(packet).toContain("Status: 준비됨 / 발송 전");
    expect(packet).toContain("AGY 전달 문구");
    expect(packet).toContain("플레이어에게 게임 설명 금지");
    expect(packet).toContain("플레이 중 질문에 답하지 않기");
    expect(packet).toContain("?scenario=fresh");
    expect(packet).toContain("?scenario=fresh&playtest=v056&session=1");
    expect(packet).toContain("npm run qa:blind-preflight");
    expect(packet).toContain("npm run qa:blind-url-sync");
    expect(packet).toContain("PLAYTEST_BASE_URL");
    expect(packet).toContain("v0_56_blind_playtest_session_01.md");
    expect(packet).toContain("v0_56_blind_playtest_session_05.md");
    expect(packet).toContain("npm run qa:blind-summary");
    expect(packet).toContain("실제 세션: 5/5");
    expect(packet).toContain("열린 P0: 0");
    expect(packet).toContain("증거 미기록: 0");
    expect(packet).toContain("P1은 후속 튜닝");
    expect(packet).toContain("docs/ANTIGRAVITY_ART_BRIEF.md");
  });

  it("keeps an AGY outbox message ready without marking real sessions complete", () => {
    const outbox = readPlaytestFile("v0_56_blind_playtest_agy_outbox.md");

    expect(outbox).toContain("Status: 발송 준비 / 실제 발송 미확인");
    expect(outbox).toContain("받는 곳: AGY");
    expect(outbox).toContain("v0_56_blind_playtest_request_packet.md");
    expect(outbox).toContain("플레이어에게 게임 설명 금지");
    expect(outbox).toContain("관찰 HUD는 진행자에게만");
    expect(outbox).toContain("npm run qa:blind-preflight");
    expect(outbox).toContain("PLAYTEST_BASE_URL");
    expect(outbox).toContain("Status: 완료");
    expect(outbox).toContain("실제 세션 전에는 결과를 채우지 말아 주세요");
    expect(outbox).toContain("npm run qa:blind-summary");
    expect(outbox).toContain("실제 세션: 5/5");
    expect(outbox).toContain("아트 투입 판정: 가능");
    expect(outbox).toContain("P1은 후속 튜닝");
  });

  it("keeps a dispatch log pending until a human confirms AGY handoff", () => {
    const dispatchLog = readPlaytestFile("v0_56_blind_playtest_dispatch_log.md");

    expect(dispatchLog).toContain("Status: 발송 대기 / 실제 발송 미확인");
    expect(dispatchLog).toContain("발송 대상: AGY 또는 실제 진행자");
    expect(dispatchLog).toContain("v0_56_blind_playtest_agy_outbox.md");
    expect(dispatchLog).toContain("v0_56_blind_playtest_request_packet.md");
    expect(dispatchLog).toContain("npm run qa:blind-readiness");
    expect(dispatchLog).toContain("실제 발송 후에만");
    expect(dispatchLog).toContain("발송 완료");
    expect(dispatchLog).toContain("세션 결과는 기록하지 않는다");
  });

  it("keeps a blind-test readiness command and report before AGY handoff", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_readiness.md");

    expect(packageJson).toContain("qa:blind-readiness");
    expect(report).toContain("Status: 발송 준비");
    expect(report).toContain("실제 세션: 0/5");
    expect(report).toContain("세션 결과 조작 없음");
    expect(report).toContain("v0_56_blind_playtest_agy_outbox.md");
    expect(report).toContain("v0_56_blind_playtest_dispatch_log.md");
    expect(report).toContain("v0_56_blind_playtest_request_packet.md");
    expect(report).toContain("v0_56_blind_playtest_session_01.md");
    expect(report).toContain("v0_56_blind_playtest_session_05.md");
    expect(report).toContain("npm run qa:blind-preflight");
    expect(report).toContain("npm run qa:blind-summary");
    expect(report).toContain("아트 투입 판정: 대기");
  });

  it("keeps a blind-test preflight report for remote URL and tutorial-delay risks", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_preflight.md");

    expect(packageJson).toContain("qa:blind-preflight");
    expect(report).toMatch(/Status: (원격 URL 필요|URL 동기화 필요|원격 테스트 준비)/);
    expect(report).toMatch(/원격 플레이어 URL: (필요|OK)/);
    expect(report).toMatch(/현재 요청 패킷 URL: (로컬 전용|URL 동기화 필요|동기화 완료|원격 또는 외부 접근 URL 포함)/);
    expect(report).toContain("PLAYTEST_BASE_URL");
    expect(report).toContain("튜토리얼 딜레이: OK");
    expect(report).toContain("idea composer waits for activeProducts");
    expect(report).toContain("competition tutorial waits for activeProducts");
    expect(report).toContain("실제 세션: 0/5");
    expect(report).toContain("최종 아트 요청: 대기");
  });

  it("allows Cloudflare quick tunnel hosts for remote blind-test previews", () => {
    const viteConfig = fs.readFileSync(rootFile("vite.config.ts"), "utf8");

    expect(viteConfig).toContain("allowedHosts");
    expect(viteConfig).toContain(".trycloudflare.com");
  });

  it("can generate a remote blind-test preflight report from PLAYTEST_BASE_URL", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-preflight-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    const gameDir = path.join(tempRoot, "src/game");
    fs.mkdirSync(playtestDir, { recursive: true });
    fs.mkdirSync(gameDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_request_packet.md"),
      "# Request\n\nStatus: 준비됨 / 발송 전\n\nhttps://preview.example.com/ai-company/?scenario=fresh\nhttps://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1\n",
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md"),
      "# Outbox\n\n- 플레이어 시작 URL은 `https://preview.example.com/ai-company/?scenario=fresh`\n- 진행자 관찰 URL은 `https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=<세션번호>`\n",
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_summary.md"),
      "# Summary\n\n- 실제 세션: 0/5\n- 아트 투입 판정: 대기\n",
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_final_art_handoff_packet.md"),
      "# Handoff\n\n- 최종 그래픽 에셋 투입: 대기\n- AGY 발송 금지\n",
    );
    fs.writeFileSync(
      path.join(gameDir, "tutorial-guide.ts"),
      "const rules = [{ id: 'product_ideas', visible: (state, activeMenu) => activeMenu === 'products' && state.hiredAgents.length > 0 && state.activeProducts.length > 0 }, { id: 'competition_pressure', visible: (state) => state.activeProducts.length > 0 && state.competitorStates.some(Boolean) }];",
    );

    execFileSync("node", [blindPreflightScriptPath], {
      cwd: tempRoot,
      env: { ...process.env, PLAYTEST_BASE_URL: "https://preview.example.com/ai-company" },
    });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_preflight.md"), "utf8");

    expect(report).toContain("Status: 원격 테스트 준비");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1");
    expect(report).toContain("원격 플레이어 URL: OK");
    expect(report).toContain("현재 요청 패킷 URL: 동기화 완료");
    expect(report).toContain("튜토리얼 딜레이: OK");
  });

  it("can sync remote player and facilitator URLs into the request packet and AGY outbox", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-url-sync-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_request_packet.md"),
      `# Request

Status: 준비됨 / 발송 전

플레이어 시작 URL:

\`\`\`text
http://127.0.0.1:5201/?scenario=fresh
\`\`\`

진행자 관찰 URL:

\`\`\`text
http://127.0.0.1:5201/?scenario=fresh&playtest=v056&session=1
\`\`\`
`,
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md"),
      `# Outbox

Status: 발송 준비 / 실제 발송 미확인

- 플레이어 시작 URL은 \`http://127.0.0.1:5201/?scenario=fresh\`
- 진행자 관찰 URL은 \`http://127.0.0.1:5201/?scenario=fresh&playtest=v056&session=<세션번호>\`
`,
    );

    execFileSync("node", [blindUrlSyncScriptPath], {
      cwd: tempRoot,
      env: { ...process.env, PLAYTEST_BASE_URL: "https://preview.example.com/ai-company/" },
    });
    const requestPacket = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_request_packet.md"), "utf8");
    const agyOutbox = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md"), "utf8");
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_url_sync.md"), "utf8");

    expect(requestPacket).toContain("https://preview.example.com/ai-company/?scenario=fresh");
    expect(requestPacket).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1");
    expect(agyOutbox).toContain("https://preview.example.com/ai-company/?scenario=fresh");
    expect(agyOutbox).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=<세션번호>");
    expect(report).toContain("Status: URL 동기화 완료");
    expect(report).toContain("v0_56_blind_playtest_request_packet.md");
    expect(report).toContain("v0_56_blind_playtest_agy_outbox.md");
  });

  it("keeps a facilitator session-link sheet ready for all five blind sessions", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_session_links.md");

    expect(packageJson).toContain("qa:blind-session-links");
    expect(report).toContain("Status: 세션 링크 준비");
    expect(report).toContain("?scenario=fresh");
    expect(report).toContain("?scenario=fresh&playtest=v056&session=1");
    expect(report).toContain("?scenario=fresh&playtest=v056&session=5");
    expect(report).toContain("v0_56_blind_playtest_session_01.md");
    expect(report).toContain("v0_56_blind_playtest_session_05.md");
    expect(report).toContain("Status: 예정");
    expect(report).toContain("플레이어에게 관찰 HUD를 보여주지 않는다");
    expect(report).toContain("npm run qa:blind-preflight");
    expect(report).toContain("npm run qa:blind-readiness");
  });

  it("can generate a five-session link sheet from a synced remote request packet", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-session-links-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_request_packet.md"),
      `# Request

Status: 준비됨 / 발송 전

플레이어 시작 URL:

\`\`\`text
https://preview.example.com/ai-company/?scenario=fresh
\`\`\`

진행자 관찰 URL:

\`\`\`text
https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1
\`\`\`
`,
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_agy_outbox.md"),
      `# Outbox

Status: 발송 준비 / 실제 발송 미확인

- 플레이어 시작 URL은 \`https://preview.example.com/ai-company/?scenario=fresh\`
- 진행자 관찰 URL은 \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=<세션번호>\`
`,
    );

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Session ${sessionId}

Status: 예정
`,
      );
    }

    execFileSync("node", [blindSessionLinksScriptPath], { cwd: tempRoot });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_session_links.md"), "utf8");

    expect(report).toContain("Status: 세션 링크 준비");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=5");
    expect(report).toContain("| 01 | Status: 예정 |");
    expect(report).toContain("| 05 | Status: 예정 |");
    expect(report).toContain("플레이어에게 관찰 HUD를 보여주지 않는다");
  });

  it("keeps a remote live-link check report for the current blind-test URL set", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_live_check.md");

    expect(packageJson).toContain("qa:blind-live-check");
    expect(report).toMatch(/Status: (원격 링크 정상|링크 구조 준비|점검 필요)/);
    expect(report).toContain("v0_56_blind_playtest_session_links.md");
    expect(report).toContain("?scenario=fresh");
    expect(report).toContain("?scenario=fresh&playtest=v056&session=1");
    expect(report).toContain("?scenario=fresh&playtest=v056&session=5");
    expect(report).toContain("세션 파일 상태");
    expect(report).toContain("Status: 예정");
    expect(report).toContain("최종 그래픽 에셋 요청은 아직 금지");
  });

  it("can statically validate all five remote session links without performing network requests", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-live-links-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_session_links.md"),
      `# v0.56 Blind Playtest Session Links

Status: 세션 링크 준비

| Session | Record status | Player URL | Facilitator observer URL | Record file |
|---:|---|---|---|---|
| 01 | Status: 예정 | \`https://preview.example.com/ai-company/?scenario=fresh\` | \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=1\` | \`v0_56_blind_playtest_session_01.md\` |
| 02 | Status: 예정 | \`https://preview.example.com/ai-company/?scenario=fresh\` | \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=2\` | \`v0_56_blind_playtest_session_02.md\` |
| 03 | Status: 예정 | \`https://preview.example.com/ai-company/?scenario=fresh\` | \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=3\` | \`v0_56_blind_playtest_session_03.md\` |
| 04 | Status: 예정 | \`https://preview.example.com/ai-company/?scenario=fresh\` | \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=4\` | \`v0_56_blind_playtest_session_04.md\` |
| 05 | Status: 예정 | \`https://preview.example.com/ai-company/?scenario=fresh\` | \`https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=5\` | \`v0_56_blind_playtest_session_05.md\` |
`,
    );

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Session ${sessionId}

Status: 예정
`,
      );
    }

    execFileSync("node", [blindLiveCheckScriptPath, "--no-network"], { cwd: tempRoot });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_live_check.md"), "utf8");

    expect(report).toContain("Status: 링크 구조 준비");
    expect(report).toContain("Remote check: skipped");
    expect(report).toContain("세션 링크 수: 5/5");
    expect(report).toContain("세션 파일 상태: 모두 Status: 예정");
    expect(report).toContain("https://preview.example.com/ai-company/?scenario=fresh&playtest=v056&session=5");
  });

  it("keeps a blind-test intake command and waiting report for received AGY results", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_intake.md");

    expect(packageJson).toContain("qa:blind-intake");
    expect(report).toContain("Status: 수신 대기");
    expect(report).toContain("AGY 또는 실제 진행자가 돌려준 세션 파일");
    expect(report).toContain("수신 폴더");
    expect(report).toContain("v0_56_blind_playtest_session_01.md");
    expect(report).toContain("v0_56_blind_playtest_session_05.md");
    expect(report).toContain("npm run qa:blind-summary");
    expect(report).toContain("npm run qa:blind-issues");
  });

  it("records the manual AGY CLI review while keeping real sessions untouched", () => {
    const packet = readPlaytestFile("v0_56_agy_cli_task_packet.md");
    const prompt = readPlaytestFile("v0_56_agy_cli_prompt.txt");
    const review = readPlaytestFile("v0_56_agy_agent_playtest_review.md");

    expect(packet).toContain("Status: 수동 리뷰 수신 / 직접 CLI 대행 차단");
    expect(packet).toContain("agy --print-timeout 15m");
    expect(packet).toContain("v0_56_agy_cli_prompt.txt");
    expect(packet).toContain("v0_56_agy_agent_playtest_review.md");
    expect(packet).toContain("실제 AGY 수동 리뷰: 수신됨");
    expect(packet).toContain("실제 세션 파일 5개는 수정하지 않는다");
    expect(prompt).toContain("Do not fabricate real human blind-test sessions.");
    expect(prompt).toContain("Do not edit reports/playtests/v0_56_blind_playtest_session_01.md");
    expect(prompt).toContain("reports/playtests/v0_56_agy_agent_playtest_review.md");
    expect(prompt).toContain("final graphics remain blocked");
    expect(review).toContain("AGY 에이전트 리뷰 완료");
    expect(review).toContain("실제 사람 블라인드 테스트 아님");
    expect(review).toContain("Status: 예정");
    expect(review).toContain("최종 그래픽 에셋 투입 판정");
  });

  it("imports completed returned blind-session files without touching missing sessions", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-intake-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    const sourceDir = path.join(tempRoot, "agy-return");
    fs.mkdirSync(playtestDir, { recursive: true });
    fs.mkdirSync(sourceDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_session_01.md"),
      "# Original Session 01\n\nStatus: 예정\n\n- P0:\n",
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_session_02.md"),
      "# Original Session 02\n\nStatus: 예정\n\n- P0:\n",
    );
    fs.writeFileSync(
      path.join(sourceDir, "v0_56_blind_playtest_session_01.md"),
      "# Returned Session 01\n\nStatus: 완료\n\n## 판정\n\n- P0: 없음\n- P1: 보상 리본 문구가 길다\n",
    );

    execFileSync("node", [blindIntakeScriptPath, "--source", sourceDir], { cwd: tempRoot });
    const imported = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_session_01.md"), "utf8");
    const untouched = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_session_02.md"), "utf8");
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_intake.md"), "utf8");

    expect(imported).toContain("Returned Session 01");
    expect(imported).toContain("Status: 완료");
    expect(untouched).toContain("Original Session 02");
    expect(report).toContain("Status: 수신 반영");
    expect(report).toContain("가져온 세션: 1");
    expect(report).toContain("| 01 | 수신 반영 |");
    expect(report).toContain("| 02 | 미수신 |");
    expect(report).toContain("npm run qa:blind-summary");
  });

  it("rejects returned blind-session files that are not completed", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-intake-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    const sourceDir = path.join(tempRoot, "agy-return");
    fs.mkdirSync(playtestDir, { recursive: true });
    fs.mkdirSync(sourceDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_session_01.md"),
      "# Original Session 01\n\nStatus: 예정\n\n- P0:\n",
    );
    fs.writeFileSync(
      path.join(sourceDir, "v0_56_blind_playtest_session_01.md"),
      "# Returned Session 01\n\nStatus: 예정\n\n## 판정\n\n- P0: 없음\n",
    );

    expect(() => execFileSync("node", [blindIntakeScriptPath, "--source", sourceDir], { cwd: tempRoot })).toThrow();
    const destination = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_session_01.md"), "utf8");

    expect(destination).toContain("Original Session 01");
    expect(destination).toContain("Status: 예정");
  });

  it("keeps a blind-test issue queue report ready for post-session triage", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_blind_playtest_issue_queue.md");

    expect(packageJson).toContain("qa:blind-issues");
    expect(report).toContain("Status: P1 튜닝 후보");
    expect(report).toContain("실제 세션: 5/5");
    expect(report).toContain("P0 큐: 0");
    expect(report).toContain("P1 큐: 5");
    expect(report).toContain("v0_56_blind_playtest_session_01.md");
    expect(report).toContain("v0_56_blind_playtest_session_05.md");
    expect(report).toContain("npm run qa:blind-summary");
    expect(report).toContain("최종 그래픽 에셋 전에는 P0 큐가 0이어야 한다");
  });

  it("extracts completed-session P0 and P1 findings into a triage queue", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-issues-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      const hasIssue = sessionId === "01";
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

## 종료 질문

- 제일 헷갈렸던 순간: ${hasIssue ? "출시 후 보상과 성장 분기 차이" : "없음"}

## 판정

- P0: ${hasIssue ? "첫 10분 안에 첫 제품 출시로 가지 못함" : "없음"}
- P1: ${hasIssue ? "인력 조합 패널 문구가 길어 읽지 않음" : "없음"}
- 다음 수정 후보: ${hasIssue ? "추천 첫 제품 버튼 강조" : "없음"}
`,
      );
    }

    execFileSync("node", [issueQueueScriptPath], { cwd: tempRoot });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_issue_queue.md"), "utf8");

    expect(report).toContain("Status: P0 수정 필요");
    expect(report).toContain("실제 세션: 5/5");
    expect(report).toContain("P0 큐: 1");
    expect(report).toContain("P1 큐: 1");
    expect(report).toContain("첫 10분 안에 첫 제품 출시로 가지 못함");
    expect(report).toContain("인력 조합 패널 문구가 길어 읽지 않음");
    expect(report).toContain("추천 첫 제품 버튼 강조");
    expect(report).toContain("출시 후 보상과 성장 분기 차이");
    expect(report).toContain("v0_56_blind_playtest_session_01.md");
  });

  it("keeps a combined final-art intake gate pending before real sessions", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_final_art_intake_gate.md");

    expect(packageJson).toContain("qa:art-gate");
    expect(report).toContain("Status: 에셋 투입 가능");
    expect(report).toContain("실제 세션: 5/5");
    expect(report).toContain("아트 투입 판정: 가능");
    expect(report).toContain("P0 큐: 0");
    expect(report).toContain("최종 그래픽 에셋 투입: 가능");
    expect(report).toContain("v0_56_blind_playtest_summary.md");
    expect(report).toContain("v0_56_blind_playtest_issue_queue.md");
    expect(report).toContain("npm run qa:blind-summary");
    expect(report).toContain("npm run qa:blind-issues");
  });

  it("keeps final art blocked when the issue queue still has a P0", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-art-gate-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_summary.md"),
      `# Summary

Status: 아트 투입 준비

## 판정

- 실제 세션: 5/5
- 열린 P0: 0
- 열린 P1: 1
- P0 미기록: 0
- 상태 미인정: 0
- 증거 미기록: 0
- 아트 투입 판정: 가능
`,
    );
    fs.writeFileSync(
      path.join(playtestDir, "v0_56_blind_playtest_issue_queue.md"),
      `# Issue Queue

Status: P0 수정 필요

## 판정

- 실제 세션: 5/5
- P0 큐: 1
- P1 큐: 1
- 상태 미인정: 0
`,
    );

    execFileSync("node", [artGateScriptPath], { cwd: tempRoot });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_final_art_intake_gate.md"), "utf8");

    expect(report).toContain("Status: P0 큐 수정 필요");
    expect(report).toContain("실제 세션: 5/5");
    expect(report).toContain("아트 투입 판정: 가능");
    expect(report).toContain("P0 큐: 1");
    expect(report).toContain("최종 그래픽 에셋 투입: 대기");
    expect(report).toContain("P0 큐를 0으로 닫는다");
  });

  it("keeps a final-art handoff packet blocked until the art gate allows it", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const report = readPlaytestFile("v0_56_final_art_handoff_packet.md");

    expect(packageJson).toContain("qa:asset-handoff");
    expect(report).toContain("Status: 아트 요청 가능");
    expect(report).toContain("AGY 발송 가능");
    expect(report).toContain("최종 그래픽 에셋 투입: 가능");
    expect(report).toContain("docs/ANTIGRAVITY_ART_BRIEF.md");
    expect(report).toContain("docs/ART_INTAKE.md");
    expect(report).toContain("1152×9600 RGBA PNG");
    expect(report).toContain("2560×1920 RGBA PNG");
    expect(report).toContain("5120×2880 RGBA PNG");
    expect(report).toContain("npm run assets:v053 -- --source");
    expect(report).toContain("npm run assets:v054 -- --objects-source");
    expect(report).toContain("npm run qa:office-visuals:screenshots");
    expect(report).toContain("npm run harness:gate");
  });

  it("marks the final-art handoff packet sendable only after the art gate is possible", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-art-handoff-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    fs.writeFileSync(
      path.join(playtestDir, "v0_56_final_art_intake_gate.md"),
      `# v0.56 Final Art Intake Gate

Status: 에셋 투입 가능

## 판정

- 실제 세션: 5/5
- 열린 P0: 0
- 열린 P1: 2
- P0 미기록: 0
- 상태 미인정: 0
- 증거 미기록: 0
- 아트 투입 판정: 가능
- P0 큐: 0
- P1 큐: 2
- 최종 그래픽 에셋 투입: 가능
`,
    );

    execFileSync("node", [artHandoffScriptPath], { cwd: tempRoot });
    const report = fs.readFileSync(path.join(playtestDir, "v0_56_final_art_handoff_packet.md"), "utf8");

    expect(report).toContain("Status: 아트 요청 가능");
    expect(report).toContain("AGY 발송 가능");
    expect(report).toContain("최종 그래픽 에셋 투입: 가능");
    expect(report).toContain("열린 P1/P1 큐는 후속 튜닝 후보");
    expect(report).toContain("1152×9600 RGBA PNG");
    expect(report).toContain("한국 시골 차고에서 시작한 작은 AI 회사");
  });

  it("keeps a session summary gate that blocks final art until real P0s are closed", () => {
    const packageJson = fs.readFileSync(rootFile("package.json"), "utf8");
    const summary = readPlaytestFile("v0_56_blind_playtest_summary.md");

    expect(packageJson).toContain("qa:blind-summary");
    expect(summary).toContain("Status: 아트 투입 준비");
    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("아트 투입 판정: 가능");
    expect(summary).toContain("P0 닫힘 전에는 최종 그래픽 에셋 투입 금지");
    expect(summary).toContain("v0_56_blind_playtest_session_01.md");
    expect(summary).toContain("docs/ANTIGRAVITY_ART_BRIEF.md");
    expect(summary).toContain("| Session | Status | P0 | P1 | 증거 | File |");
    expect(summary).toContain("| 01 | 완료 |");
    expect(summary).not.toContain("| 01 | 예정 |");
  });

  it("keeps final art blocked when completed session files leave P0 unrecorded", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

## 판정

- P0:
- P1: 없음
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("P0 미기록: 5");
    expect(summary).toContain("아트 투입 판정: 대기");
    expect(summary).not.toContain("아트 투입 판정: 가능");
  });

  it("does not count sessions with nonstandard status labels as real completed sessions", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 검토 완료

## 판정

- P0: 없음
- P1: 없음
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("Status: 상태 확인 필요");
    expect(summary).toContain("실제 세션: 0/5");
    expect(summary).toContain("상태 미인정: 5");
    expect(summary).toContain("아트 투입 판정: 대기");
    expect(summary).not.toContain("아트 투입 판정: 가능");
  });

  it("keeps final art blocked when completed sessions lack observation evidence", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

- 대상: 테스트 참여자 ${sessionId}
- 방식: 무설명 20분 플레이
- 시작 URL: http://127.0.0.1:5201/?scenario=fresh
- 날짜/시간:
- 환경:

| Time | 기준 | 관찰 |
|---:|---|---|
| 첫 10초 | AI 회사 경영 게임으로 보이는가 | |
| 첫 3분 | 첫 제품 개발로 가는가 | |
| 첫 10분 | 첫 제품 출시 후 다음 행동 리본을 보는가 | |
| 첫 15분 | 카드/보상/성장 선택을 이해하는가 | |
| 첫 20분 | 직원/AI/로봇 차이를 이해하는가 | |
| 첫 30분 | 한 판 더 해볼 마음이 있는가 | |

## 판정

- P0: 없음
- P1: 없음
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("증거 미기록: 5");
    expect(summary).toContain("| Session | Status | P0 | P1 | 증거 | File |");
    expect(summary).toContain("누락: 날짜/시간, 환경, 첫 10초, 첫 3분, 첫 10분, 첫 15분, 첫 20분, 첫 30분");
    expect(summary).toContain("아트 투입 판정: 대기");
    expect(summary).not.toContain("아트 투입 판정: 가능");
  });

  it("keeps final art blocked when completed sessions lack tester profile evidence", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

- 날짜/시간: 2026-05-22 14:00
- 환경: desktop chrome

| Time | 기준 | 관찰 |
|---:|---|---|
| 첫 10초 | AI 회사 경영 게임으로 보이는가 | 차고 AI 회사로 이해함 |
| 첫 3분 | 첫 제품 개발로 가는가 | 제품 메뉴로 이동함 |
| 첫 10분 | 첫 제품 출시 후 다음 행동 리본을 보는가 | 출시 후 리본을 봄 |
| 첫 15분 | 카드/보상/성장 선택을 이해하는가 | 카드 영향 설명함 |
| 첫 20분 | 직원/AI/로봇 차이를 이해하는가 | 역할 차이를 말함 |
| 첫 30분 | 한 판 더 해볼 마음이 있는가 | 다시 해보겠다고 말함 |

## 종료 질문

- 처음 본 게임 인상: AI 회사 경영 게임
- 첫 5분 목표 이해: 첫 제품을 만들면 된다고 이해
- 제일 재밌었던 순간: 첫 출시 결과
- 제일 헷갈렸던 순간: 연구 후보
- 다시 해보고 싶은 마음: 있음

## 판정

- P0: 없음
- P1: 없음
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("증거 미기록: 5");
    expect(summary).toContain("누락: 테스터 대상, 테스트 방식, 시작 URL");
    expect(summary).toContain("아트 투입 판정: 대기");
    expect(summary).not.toContain("아트 투입 판정: 가능");
  });

  it("keeps final art blocked when completed sessions lack exit interview evidence", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

- 대상: 테스트 참여자 ${sessionId}
- 방식: 무설명 20분 플레이
- 시작 URL: http://127.0.0.1:5201/?scenario=fresh
- 날짜/시간: 2026-05-22 14:00
- 환경: desktop chrome

| Time | 기준 | 관찰 |
|---:|---|---|
| 첫 10초 | AI 회사 경영 게임으로 보이는가 | 차고 AI 회사로 이해함 |
| 첫 3분 | 첫 제품 개발로 가는가 | 제품 메뉴로 이동함 |
| 첫 10분 | 첫 제품 출시 후 다음 행동 리본을 보는가 | 출시 후 리본을 봄 |
| 첫 15분 | 카드/보상/성장 선택을 이해하는가 | 카드 영향 설명함 |
| 첫 20분 | 직원/AI/로봇 차이를 이해하는가 | 역할 차이를 말함 |
| 첫 30분 | 한 판 더 해볼 마음이 있는가 | 다시 해보겠다고 말함 |

## 종료 질문

- 처음 본 게임 인상:
- 첫 5분 목표 이해:
- 제일 재밌었던 순간:
- 제일 헷갈렸던 순간:
- 다시 해보고 싶은 마음:

## 판정

- P0: 없음
- P1: 없음
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("증거 미기록: 5");
    expect(summary).toContain("누락: 종료 질문 1, 종료 질문 2, 종료 질문 3, 종료 질문 4, 종료 질문 5");
    expect(summary).toContain("아트 투입 판정: 대기");
    expect(summary).not.toContain("아트 투입 판정: 가능");
  });

  it("reports open P1 findings without blocking final art when P0 and evidence gates pass", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "v056-blind-summary-"));
    const playtestDir = path.join(tempRoot, "reports/playtests");
    fs.mkdirSync(playtestDir, { recursive: true });

    for (const sessionId of ["01", "02", "03", "04", "05"]) {
      fs.writeFileSync(
        path.join(playtestDir, `v0_56_blind_playtest_session_${sessionId}.md`),
        `# Test Session ${sessionId}

Status: 완료

- 대상: 테스트 참여자 ${sessionId}
- 방식: 무설명 20분 플레이
- 시작 URL: http://127.0.0.1:5201/?scenario=fresh
- 날짜/시간: 2026-05-22 14:00
- 환경: desktop chrome

| Time | 기준 | 관찰 |
|---:|---|---|
| 첫 10초 | AI 회사 경영 게임으로 보이는가 | 차고 AI 회사로 이해함 |
| 첫 3분 | 첫 제품 개발로 가는가 | 제품 메뉴로 이동함 |
| 첫 10분 | 첫 제품 출시 후 다음 행동 리본을 보는가 | 출시 후 리본을 봄 |
| 첫 15분 | 카드/보상/성장 선택을 이해하는가 | 카드 영향 설명함 |
| 첫 20분 | 직원/AI/로봇 차이를 이해하는가 | 역할 차이를 말함 |
| 첫 30분 | 한 판 더 해볼 마음이 있는가 | 다시 해보겠다고 말함 |

## 종료 질문

- 처음 본 게임 인상: AI 회사 경영 게임
- 첫 5분 목표 이해: 첫 제품을 만들면 된다고 이해
- 제일 재밌었던 순간: 첫 출시 결과
- 제일 헷갈렸던 순간: 연구 후보
- 다시 해보고 싶은 마음: 있음

## 판정

- P0: 없음
- P1: 첫 출시 리본 문구가 길어 스크롤 필요
`,
      );
    }

    execFileSync("node", [summaryScriptPath], { cwd: tempRoot });
    const summary = fs.readFileSync(path.join(playtestDir, "v0_56_blind_playtest_summary.md"), "utf8");

    expect(summary).toContain("실제 세션: 5/5");
    expect(summary).toContain("열린 P0: 0");
    expect(summary).toContain("열린 P1: 5");
    expect(summary).toContain("증거 미기록: 0");
    expect(summary).toContain("아트 투입 판정: 가능");
  });
});
