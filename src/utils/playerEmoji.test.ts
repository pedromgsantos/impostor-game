import { describe, it, expect } from "vitest";
import { playerEmoji } from "./playerEmoji";

describe("playerEmoji", () => {
  it("returns a non-empty emoji for index 0", () => {
    expect(playerEmoji(0)).toBeTruthy();
  });

  it("is deterministic for the same index", () => {
    expect(playerEmoji(3)).toBe(playerEmoji(3));
  });

  it("wraps around when the index exceeds the palette length", () => {
    // Two indices that differ by exactly the palette size map to the same emoji.
    expect(playerEmoji(0)).toBe(playerEmoji(72));
    expect(playerEmoji(5)).toBe(playerEmoji(77));
  });
});
