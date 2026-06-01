import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteConfig = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

describe("v0.21 build configuration", () => {
  it("splits vendor and data modules so alpha builds avoid one oversized entry chunk", () => {
    expect(viteConfig).toContain("manualChunks");
    expect(viteConfig).toContain("react-vendor");
    expect(viteConfig).toContain("game-data");
  });

  it("v0.99 splits game logic into its own chunk so the entry stays under the 500 kB warning", () => {
    expect(viteConfig).toContain("game-logic");
    expect(viteConfig).toMatch(/src\/game/);
  });
});
