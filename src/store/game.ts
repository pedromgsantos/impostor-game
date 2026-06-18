import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getNextWords } from "@/services/wordManager";

export type Phase = "setup" | "assign" | "round" | "vote" | "lastchance" | "result";

export interface UIState {
  phase: Phase;
}

export interface RoomState {
  players: string[];
  mode: "normal" | "cego";
  theme: string;
  timerSec: number;
  lastChance: boolean;
  twoImpostors: boolean;
}

export interface RoundState {
  impostorIndices: number[];
  realWord: string | null;
  impostorWord: string | null;
  firstPlayerIndex: number;
  revealOrder: number[];
  chosenSuspect: number | null;
  winner: "group" | "impostor" | null;
}

export interface GameState {
  ui: UIState;
  room: RoomState;
  round: RoundState | null;

  setRoom: (patch: Partial<RoomState>) => void;
  toPhase: (p: Phase) => void;
  startGame: () => void;
  voteSuspect: (i: number) => void;
  resolveLastChance: (guessedWord: string) => void;
  reset: () => void;
}

const initialRoom: RoomState = {
  players: [],
  mode: "normal",
  theme: "classic",
  timerSec: 60,
  lastChance: false,
  twoImpostors: false,
};

// embaralha um array (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinct(max: number, count: number): number[] {
  const indices: number[] = [];
  while (indices.length < count) {
    const pick = Math.floor(Math.random() * max);
    if (!indices.includes(pick)) indices.push(pick);
  }
  return indices;
}

function normalize(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ui: { phase: "setup" },
      room: initialRoom,
      round: null,

      setRoom: (patch) =>
        set((s) => ({
          room: { ...s.room, ...patch },
        })),

      toPhase: (p) =>
        set((s) => ({
          ui: { ...s.ui, phase: p },
        })),

      startGame: () => {
        const { room } = get();
        const n = room.players.length;
        if (n < 3) return;

        (async () => {
          try {
            const effectiveMode: RoomState["mode"] =
              room.theme === "royale" ? "cego" : room.mode;

            const { real, impostor, exhausted } = await getNextWords(
              room.theme,
              effectiveMode
            );

            const impostorCount = room.twoImpostors && n >= 5 ? 2 : 1;
            const impostorIndices = pickDistinct(n, impostorCount);

            let firstPlayerIndex = Math.floor(Math.random() * n);
            if (effectiveMode === "cego") {
              while (impostorIndices.includes(firstPlayerIndex)) {
                firstPlayerIndex = Math.floor(Math.random() * n);
              }
            }

            const revealOrder = shuffle([...Array(n).keys()]);

            set({
              round: {
                impostorIndices,
                realWord: real,
                impostorWord: effectiveMode === "normal" ? impostor : null,
                firstPlayerIndex,
                revealOrder,
                chosenSuspect: null,
                winner: null,
              },
              ui: { phase: "assign" },
            });

            if (exhausted && typeof window !== "undefined") {
              setTimeout(() => alert("Tema esgotado, repor ou mudar."), 0);
            }
          } catch (e) {
            console.error("Erro ao obter palavras:", e);
          }
        })();
      },

      voteSuspect: (i) => {
        const { round, room } = get();
        if (!round) return;

        const isImpostor = round.impostorIndices.includes(i);

        if (isImpostor && room.lastChance) {
          set({
            round: { ...round, chosenSuspect: i },
            ui: { phase: "lastchance" },
          });
          return;
        }

        set({
          round: { ...round, chosenSuspect: i, winner: isImpostor ? "group" : "impostor" },
          ui: { phase: "result" },
        });
      },

      resolveLastChance: (guessedWord) => {
        const { round } = get();
        if (!round) return;
        const correct = normalize(guessedWord) === normalize(round.realWord ?? "");
        set({
          round: { ...round, winner: correct ? "impostor" : "group" },
          ui: { phase: "result" },
        });
      },

      reset: () =>
        set({
          ui: { phase: "setup" },
          round: null,
        }),
    }),
    {
      name: "impostor-game-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ui: s.ui, room: s.room }),
    }
  )
);
