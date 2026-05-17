import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteConfig = readFileSync(new URL("../../vite.config.ts", import.meta.url), "utf8");

describe("v0.21 build configuration", () => {
  it("splits vendor and data modules so alpha builds avoid one oversized entry chunk", () => {
    expect(viteConfig).toContain("manualChunks");
    expect(viteConfig).toContain("react-vendor");
    expect(viteConfig).toContain("game-data");
  });
});
