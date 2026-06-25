import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory stand-in for IndexedDB. Hoisted so the vi.mock factory can see it.
const { memStore } = vi.hoisted(() => ({ memStore: new Map<string, unknown>() }));

vi.mock("idb-keyval", () => ({
  get: async (k: string) => memStore.get(k),
  set: async (k: string, v: unknown) => { memStore.set(k, v); },
  del: async (k: string) => { memStore.delete(k); },
  keys: async () => [...memStore.keys()],
}));

import { getNextWords, resetTheme } from "./wordManager";

type FetchPayload = Record<string, unknown> | unknown[];
const themeData: Record<string, FetchPayload> = {};

beforeEach(() => {
  memStore.clear();
  for (const key of Object.keys(themeData)) delete themeData[key];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const theme = url.split("/").pop()!.replace(".json", "");
      const data = themeData[theme];
      if (!data) return { ok: false, status: 404 } as Response;
      return { ok: true, status: 200, json: async () => data } as unknown as Response;
    })
  );
});

describe("getNextWords — pairs theme", () => {
  it("returns a real/impostor pair and does not repeat until exhausted", async () => {
    // Unique theme name avoids the module-level fetch cache colliding across tests.
    themeData["pairs-a"] = { type: "pairs", items: [["praia", "piscina"], ["sol", "lua"]] };

    const first = await getNextWords("pairs-a", "normal");
    const second = await getNextWords("pairs-a", "normal");

    expect(new Set([first.real, second.real])).toEqual(new Set(["praia", "sol"]));
    expect(first.exhausted).toBe(false);
    expect(second.exhausted).toBe(false);

    const third = await getNextWords("pairs-a", "normal");
    expect(third.exhausted).toBe(true);
  });

  it("pairs the right impostor word with each real word", async () => {
    themeData["pairs-b"] = { type: "pairs", items: [["praia", "piscina"]] };
    const { real, impostor } = await getNextWords("pairs-b", "normal");
    expect(real).toBe("praia");
    expect(impostor).toBe("piscina");
  });
});

describe("getNextWords — single-list theme", () => {
  it("returns two distinct words in normal mode", async () => {
    themeData["single-a"] = ["a", "b", "c", "d"];
    const { real, impostor } = await getNextWords("single-a", "normal");
    expect(impostor).not.toBeNull();
    expect(real).not.toBe(impostor);
  });

  it("returns no impostor word in blind mode", async () => {
    themeData["single-b"] = ["a", "b", "c"];
    const { real, impostor } = await getNextWords("single-b", "cego");
    expect(real).toBeTruthy();
    expect(impostor).toBeNull();
  });

  it("does not repeat words across blind-mode draws until exhausted", async () => {
    themeData["single-c"] = ["a", "b", "c"];
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const { real, exhausted } = await getNextWords("single-c", "cego");
      if (!exhausted) seen.add(real);
    }
    expect(seen.size).toBe(3);
    const after = await getNextWords("single-c", "cego");
    expect(after.exhausted).toBe(true);
  });
});

describe("getNextWords — language selection", () => {
  it("loads the .en.json file for English and the base file for Portuguese", async () => {
    themeData["loc"] = { type: "pairs", items: [["praia", "piscina"]] };
    themeData["loc.en"] = { type: "pairs", items: [["beach", "pool"]] };

    const pt = await getNextWords("loc", "normal", "pt");
    const en = await getNextWords("loc", "normal", "en");

    expect(pt.real).toBe("praia");
    expect(en.real).toBe("beach");
  });

  it("keeps separate history per language so they do not exhaust each other", async () => {
    themeData["sep"] = { type: "pairs", items: [["a", "b"]] };
    themeData["sep.en"] = { type: "pairs", items: [["x", "y"]] };

    // Exhaust the PT deck only.
    await getNextWords("sep", "normal", "pt");
    expect((await getNextWords("sep", "normal", "pt")).exhausted).toBe(true);

    // EN deck is still fresh.
    expect((await getNextWords("sep", "normal", "en")).exhausted).toBe(false);
  });

  it("ignores language for royale (always the base file)", async () => {
    themeData["royale"] = ["mega knight", "hog rider", "log"];
    const en = await getNextWords("royale", "cego", "en");
    expect(["mega knight", "hog rider", "log"]).toContain(en.real);
  });
});

describe("resetTheme", () => {
  it("clears history so words become available again", async () => {
    themeData["pairs-reset"] = { type: "pairs", items: [["praia", "piscina"]] };
    await getNextWords("pairs-reset", "normal");
    expect((await getNextWords("pairs-reset", "normal")).exhausted).toBe(true);

    await resetTheme("pairs-reset");
    expect((await getNextWords("pairs-reset", "normal")).exhausted).toBe(false);
  });
});

describe("getNextWords — error handling", () => {
  it("throws a helpful error when the theme file is missing", async () => {
    await expect(getNextWords("does-not-exist", "normal")).rejects.toThrow(/does-not-exist/);
  });
});
