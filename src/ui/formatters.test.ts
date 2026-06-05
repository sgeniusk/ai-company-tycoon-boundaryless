import { describe, expect, it } from "vitest";
import { formatEffects } from "./formatters";

describe("ui formatters", () => {
  it("rounds exposed effect floats without hiding meaningful decimals", () => {
    expect(formatEffects({
      trust: 0.1 + 0.2,
      rival_momentum_delta: -1.333333333,
      users: 1200,
    })).toBe("신뢰 +0.3, 경쟁 모멘텀 -1.33, 이용자 +1,200");
  });
});
