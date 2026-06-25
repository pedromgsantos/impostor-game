import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the word source so startGame is deterministic and synchronous-ish.
vi.mock("@/services/wordManager", () => ({
  getNextWords: vi.fn(async () => ({
    real: "praia",
    impostor: "piscina",
    exhausted: false,
  })),
}));

import { useGameStore, type RoundState } from "./game";
import { getNextWords } from "@/services/wordManager";

const flush = () => new Promise((r) => setTimeout(r, 0));

function resetStore(overrides: Partial<ReturnType<typeof useGameStore.getState>> = {}) {
  useGameStore.setState({
    ui: { phase: "setup" },
    room: {
      players: [],
      mode: "normal",
      theme: "classic",
      timerSec: 60,
      lastChance: false,
      twoImpostors: false,
    },
    round: null,
    toast: null,
    lang: "pt",
    ...overrides,
  });
}

// Build a round with explicit impostor indices for voting tests.
function seedRound(patch: Partial<RoundState>): RoundState {
  const round: RoundState = {
    impostorIndices: [1],
    caughtImpostorIndices: [],
    realWord: "praia",
    impostorWord: "piscina",
    firstPlayerIndex: 0,
    revealOrder: [0, 1, 2, 3],
    chosenSuspect: null,
    winner: null,
    ...patch,
  };
  useGameStore.setState({ round, ui: { phase: "vote" } });
  return round;
}

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe("startGame", () => {
  it("does nothing with fewer than 3 players", async () => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B"] } });
    useGameStore.getState().startGame();
    await flush();
    expect(useGameStore.getState().round).toBeNull();
    expect(useGameStore.getState().ui.phase).toBe("setup");
    expect(getNextWords).not.toHaveBeenCalled();
  });

  it("assigns exactly one impostor and advances to assign", async () => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"] } });
    useGameStore.getState().startGame();
    await flush();
    const { round, ui } = useGameStore.getState();
    expect(ui.phase).toBe("assign");
    expect(round?.impostorIndices).toHaveLength(1);
    expect(round?.realWord).toBe("praia");
    expect(round?.impostorWord).toBe("piscina");
    // The active language is threaded through to the word source.
    expect(getNextWords).toHaveBeenCalledWith("classic", "normal", "pt");
  });

  it("passes the active language to getNextWords", async () => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C"] }, lang: "en" });
    useGameStore.getState().startGame();
    await flush();
    expect(getNextWords).toHaveBeenCalledWith("classic", "normal", "en");
  });

  it("assigns two distinct impostors when twoImpostors is on and players >= 5", async () => {
    resetStore({
      room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D", "E"], twoImpostors: true },
    });
    useGameStore.getState().startGame();
    await flush();
    const idxs = useGameStore.getState().round!.impostorIndices;
    expect(idxs).toHaveLength(2);
    expect(new Set(idxs).size).toBe(2);
  });

  it("ignores twoImpostors with fewer than 5 players", async () => {
    resetStore({
      room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"], twoImpostors: true },
    });
    useGameStore.getState().startGame();
    await flush();
    expect(useGameStore.getState().round!.impostorIndices).toHaveLength(1);
  });

  it("never lets the impostor speak first in blind mode", async () => {
    for (let i = 0; i < 20; i++) {
      resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"], mode: "cego" } });
      useGameStore.getState().startGame();
      await flush();
      const round = useGameStore.getState().round!;
      expect(round.impostorWord).toBeNull();
      expect(round.impostorIndices).not.toContain(round.firstPlayerIndex);
    }
  });

  it("shows a localized toast when the theme pool is exhausted", async () => {
    (getNextWords as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      real: "praia",
      impostor: "piscina",
      exhausted: true,
    });
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C"] }, lang: "en" });
    useGameStore.getState().startGame();
    await flush();
    await flush();
    expect(useGameStore.getState().toast?.message).toBe(
      "Theme exhausted — reset the history or switch themes."
    );
  });
});

describe("voteSuspect", () => {
  beforeEach(() => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"] } });
  });

  it("accusing an innocent makes the impostor win immediately", () => {
    seedRound({ impostorIndices: [1] });
    useGameStore.getState().voteSuspect(0);
    const { round, ui } = useGameStore.getState();
    expect(round?.winner).toBe("impostor");
    expect(ui.phase).toBe("result");
  });

  it("catching the only impostor makes the group win (no last chance)", () => {
    seedRound({ impostorIndices: [1] });
    useGameStore.getState().voteSuspect(1);
    const { round, ui } = useGameStore.getState();
    expect(round?.winner).toBe("group");
    expect(round?.caughtImpostorIndices).toContain(1);
    expect(ui.phase).toBe("result");
  });

  it("routes to last chance when the only impostor is caught and the twist is on", () => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"], lastChance: true } });
    seedRound({ impostorIndices: [1] });
    useGameStore.getState().voteSuspect(1);
    const { round, ui } = useGameStore.getState();
    expect(ui.phase).toBe("lastchance");
    expect(round?.winner).toBeNull();
  });

  describe("two impostors", () => {
    it("catching the first triggers a second vote", () => {
      seedRound({ impostorIndices: [1, 3] });
      useGameStore.getState().voteSuspect(1);
      const { round, ui } = useGameStore.getState();
      expect(ui.phase).toBe("vote2");
      expect(round?.winner).toBeNull();
      expect(round?.caughtImpostorIndices).toEqual([1]);
    });

    it("catching both makes the group win", () => {
      seedRound({ impostorIndices: [1, 3] });
      useGameStore.getState().voteSuspect(1);
      useGameStore.getState().voteSuspect(3);
      const { round, ui } = useGameStore.getState();
      expect(ui.phase).toBe("result");
      expect(round?.winner).toBe("group");
      expect(round?.caughtImpostorIndices).toEqual([1, 3]);
    });

    it("accusing an innocent at any point hands the win to the impostors", () => {
      seedRound({ impostorIndices: [1, 3] });
      useGameStore.getState().voteSuspect(1); // first caught -> vote2
      useGameStore.getState().voteSuspect(2); // innocent
      const { round, ui } = useGameStore.getState();
      expect(round?.winner).toBe("impostor");
      expect(ui.phase).toBe("result");
    });
  });
});

describe("resolveLastChance", () => {
  beforeEach(() => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C", "D"], lastChance: true } });
    seedRound({ realWord: "praia", chosenSuspect: 1 });
  });

  it("lets the impostor steal the win with a correct guess", () => {
    useGameStore.getState().resolveLastChance("praia");
    expect(useGameStore.getState().round?.winner).toBe("impostor");
  });

  it("matches case- and accent-insensitively", () => {
    useGameStore.setState({
      round: { ...useGameStore.getState().round!, realWord: "São Paulo" },
    });
    useGameStore.getState().resolveLastChance("sao paulo");
    expect(useGameStore.getState().round?.winner).toBe("impostor");
  });

  it("gives the group the win on a wrong guess", () => {
    useGameStore.getState().resolveLastChance("montanha");
    expect(useGameStore.getState().round?.winner).toBe("group");
  });
});

describe("setLang / reset", () => {
  it("setLang updates the language", () => {
    useGameStore.getState().setLang("en");
    expect(useGameStore.getState().lang).toBe("en");
  });

  it("reset returns to setup and clears the round but keeps the room", () => {
    resetStore({ room: { ...useGameStore.getState().room, players: ["A", "B", "C"] } });
    seedRound({});
    useGameStore.getState().reset();
    const { ui, round, room } = useGameStore.getState();
    expect(ui.phase).toBe("setup");
    expect(round).toBeNull();
    expect(room.players).toEqual(["A", "B", "C"]);
  });
});
