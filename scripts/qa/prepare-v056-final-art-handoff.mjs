import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const playtestDir = path.join(root, "reports/playtests");
const gatePath = path.join(playtestDir, "v0_56_final_art_intake_gate.md");
const outputPath = path.join(playtestDir, "v0_56_final_art_handoff_packet.md");
const todayKst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

function getBulletValue(content, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`^- ${escapedLabel}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

const gate = fs.readFileSync(gatePath, "utf8");
const finalArtIntake = getBulletValue(gate, "최종 그래픽 에셋 투입") || "대기";
const realSessions = getBulletValue(gate, "실제 세션") || "0/5";
const p0Queue = getBulletValue(gate, "P0 큐") || "0";
const p1Queue = getBulletValue(gate, "P1 큐") || "0";
const openP1 = getBulletValue(gate, "열린 P1") || "0";
const sendable = finalArtIntake === "가능";
const status = sendable ? "아트 요청 가능" : "아트 요청 대기";
const sendLabel = sendable ? "AGY 발송 가능" : "AGY 발송 금지";
const lockNotice = sendable
  ? "발송 전에도 최신 `npm run qa:asset-handoff` 결과를 다시 확인한다."
  : "실제 세션 5/5 전 발송 금지. `최종 그래픽 에셋 투입: 가능` 전에는 제작 착수 요청을 보내지 않는다.";

const markdown = `# v0.56 Final Art Handoff Packet

Status: ${status}
작성일: ${todayKst}

## 발송 판정

- ${sendLabel}
- 최종 그래픽 에셋 투입: ${finalArtIntake}
- 실제 세션: ${realSessions}
- P0 큐: ${p0Queue}
- P1 큐: ${p1Queue}
- 열린 P1: ${openP1}
- 잠금 문구: ${lockNotice}
- 기준 브리프: \`docs/ANTIGRAVITY_ART_BRIEF.md\`
- 임포트 기준: \`docs/ART_INTAKE.md\`

## AGY 요청 요약

한국 시골 차고에서 시작한 작은 AI 회사가 사람 직원, AI 에이전트, 로봇 인력과 함께 첫 제품을 출시하는 고해상도 픽셀아트 등각 사무실을 만든다. 귀엽지만 너무 장식적이지 않고, 게임 화면에서 직원과 장비가 바로 읽혀야 한다.

## 1차 납품 원본 체크리스트

| Asset | Required Source | Runtime Output | Import Command |
|---|---:|---:|---|
| Character event-pose sheet | 1152×9600 RGBA PNG | 576×4800 PNG | \`npm run assets:v053 -- --source <character-source>\` |
| Office object sheet | 2560×1920 RGBA PNG | 1280×960 PNG | \`npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>\` |
| Isometric office backdrop | 5120×2880 RGBA PNG | 2560×1440 PNG | \`npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>\` |

## 제작 조건

- 투명 배경이 필요한 시트는 RGBA PNG로 납품한다.
- 캐릭터 시트는 3열 × 25행, 총 75프레임 계약을 유지한다.
- 캐릭터 포즈는 \`idle\`, \`work\`, \`card_use\`, \`cheer\`, \`alert\`가 구분되어야 한다.
- 사람 직원, AI 에이전트, 로봇 인력의 실루엣 차이가 작게라도 보여야 한다.
- 배경은 차고/작은 사무실/AI 회사 단서가 첫 10초 안에 읽혀야 한다.
- 열린 P1/P1 큐는 후속 튜닝 후보로 유지하되, P0/증거 게이트를 통과하면 에셋 발송을 막지 않는다.

## 수령 후 검증

1. \`npm run assets:v053 -- --source <character-source>\`
2. \`npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>\`
3. \`npm run qa:office-visuals:screenshots\`
4. \`npm run harness:gate\`

## 발송 전 최종 확인

1. \`npm run qa:asset-handoff\`를 다시 실행한다.
2. 이 파일의 \`Status\`가 \`아트 요청 가능\`인지 확인한다.
3. \`최종 그래픽 에셋 투입: 가능\`이 아닐 경우 AGY에 발송하지 않는다.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown);

console.log(`Wrote ${path.relative(root, outputPath)}`);
console.log(`Final art intake: ${finalArtIntake}`);
console.log(`Send status: ${sendLabel}`);
