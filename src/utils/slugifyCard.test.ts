import { describe, it, expect } from "vitest";
import { slugifyCard } from "./slugifyCard";

describe("slugifyCard", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugifyCard("Goblin Cage")).toBe("goblin-cage");
  });

  it("collapses runs of non-alphanumerics into a single hyphen", () => {
    expect(slugifyCard("P.E.K.K.A")).toBe("p-e-k-k-a");
    expect(slugifyCard("Mega   Knight")).toBe("mega-knight");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyCard("  Witch  ")).toBe("witch");
    expect(slugifyCard("'Royal Chef'")).toBe("royal-chef");
  });

  it("strips accents-adjacent symbols but keeps alphanumerics", () => {
    expect(slugifyCard("X-Bow 3000")).toBe("x-bow-3000");
  });
});
