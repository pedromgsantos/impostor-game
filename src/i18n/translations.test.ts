import { describe, it, expect } from "vitest";
import { translations, translate } from "./translations";

describe("translations", () => {
  it("pt and en define exactly the same keys", () => {
    const ptKeys = Object.keys(translations.pt).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(enKeys).toEqual(ptKeys);
  });

  it("has no empty strings in either locale", () => {
    for (const lang of ["pt", "en"] as const) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value, `${lang}.${key} should be non-empty`).toBeTruthy();
      }
    }
  });
});

describe("translate", () => {
  it("returns the string for the requested language", () => {
    expect(translate("en", "common.cancel")).toBe("Cancel");
    expect(translate("pt", "common.cancel")).toBe("Cancelar");
  });

  it("interpolates named variables", () => {
    expect(translate("en", "common.playerFallback", { n: 3 })).toBe("Player 3");
    expect(translate("pt", "common.playerFallback", { n: 3 })).toBe("Jogador 3");
  });

  it("interpolates multiple variables", () => {
    expect(translate("en", "assign.counter", { n: 2, total: 5 })).toBe("2 of 5");
  });

  it("leaves unknown placeholders untouched", () => {
    // realWord has no placeholder; passing vars should not corrupt it.
    expect(translate("en", "result.realWord", { foo: "bar" })).toBe("Real word");
  });

  it("falls back to Portuguese for an unknown language", () => {
    // @ts-expect-error intentionally passing an invalid language
    expect(translate("de", "common.cancel")).toBe("Cancelar");
  });
});
