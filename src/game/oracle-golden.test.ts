// 시뮬 엔진을 TS 정답지로 박제하는 골든 오라클 — C# 포팅(P2)의 패리티 기준.
//   생성: GEN_GOLDEN=1 npx vitest run src/game/oracle-golden.test.ts
//   검증: npm test (골든 존재 시 현재 출력 == 골든 회귀 검사 + 결정성 항상 검사)
// 엔진이 순수·결정적(시드 해시, Math.random 0)이라 같은 시드+시나리오는 항상 동일.
import { describe, expect, it } from "vitest";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { advanceMonth, createInitialState } from "./simulation";
import type { GameState } from "./types";

const SEED = "oracle-fixed-001";
const GOLDEN_DIR = fileURLToPath(new URL("../../oracle/golden/", import.meta.url));
// @types/node 미설치 — process 전역은 globalThis 경유 캐스트로 접근.
const GENERATE = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.GEN_GOLDEN === "1";

type Step = { label: string; state: unknown };

// 키 정렬 재귀 — TS/C# 직렬화 키 순서 차이를 제거해 필드 단위 대조를 안정화.
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function snapshot(state: GameState): unknown {
  return sortKeys(JSON.parse(JSON.stringify(state)));
}

// 캐노니컬 시나리오 (고정 시드). P2.2 코어 스파인(createInitialState + advanceMonth) 커버.
// 액션 시나리오(고용·출시·덱)는 해당 서브시스템 포팅 시 추가.
const SCENARIOS: Record<string, () => Step[]> = {
  fresh: () => [{ label: "init", state: snapshot(createInitialState({ seed: SEED })) }],
  "idle-12": () => {
    const steps: Step[] = [];
    let s = createInitialState({ seed: SEED });
    steps.push({ label: "m1", state: snapshot(s) });
    for (let i = 0; i < 12; i += 1) {
      s = advanceMonth(s);
      steps.push({ label: `advanced-m${s.month}`, state: snapshot(s) });
    }
    return steps;
  },
};

describe("oracle golden (TS engine = parity reference for C# port)", () => {
  for (const [name, run] of Object.entries(SCENARIOS)) {
    it(`${name}: deterministic${GENERATE ? " + writes golden" : " + golden parity"}`, () => {
      const first = run();
      const second = run();
      // 결정성 — 같은 시드/시나리오는 항상 동일 (오라클의 전제)
      expect(JSON.stringify(second)).toBe(JSON.stringify(first));

      const file = `${GOLDEN_DIR}${name}.json`;
      const current = JSON.stringify(first, null, 2);
      if (GENERATE) {
        mkdirSync(GOLDEN_DIR, { recursive: true });
        writeFileSync(file, `${current}\n`);
        return;
      }
      let golden: string | null = null;
      try {
        golden = readFileSync(file, "utf8");
      } catch {
        golden = null;
      }
      if (golden === null) {
        // eslint-disable-next-line no-console
        console.warn(`[oracle] golden 없음: ${name} — GEN_GOLDEN=1 npx vitest run src/game/oracle-golden.test.ts 로 생성`);
        return;
      }
      // 회귀 — 골든이 있으면 현재 TS 출력이 골든과 일치(엔진 드리프트 감지)
      expect(current).toBe(golden.replace(/\n$/, ""));
    });
  }
});
