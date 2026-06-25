import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getNextWords } from "@/services/wordManager";
import { translate, type Lang } from "@/i18n/translations";

export type Phase = "setup" | "assign" | "round" | "vote" | "vote2" | "lastchance" | "result";

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
  caughtImpostorIndices: number[];
  realWord: string | null;
  impostorWord: string | null;
  firstPlayerIndex: number;
  revealOrder: number[];
  chosenSuspect: number | null;
  winner: "group" | "impostor" | null;
}

export type ToastType = "info" | "warning" | "success";
export interface Toast { message: string; type: ToastType; id: number; }

export interface GameState {
  ui: UIState;
  room: RoomState;
  round: RoundState | null;
  toast: Toast | null;
  lang: Lang;

  setLang: (lang: Lang) => void;
  setRoom: (patch: Partial<RoomState>) => void;
  toPhase: (p: Phase) => void;
  startGame: () => void;
  voteSuspect: (i: number) => void;
  resolveLastChance: (guessedWord: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
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
      toast: null,
      lang: "pt",

      setLang: (lang) => set({ lang }),

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
              effectiveMode,
              get().lang
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
                caughtImpostorIndices: [],
                realWord: real,
                impostorWord: effectiveMode === "normal" ? impostor : null,
                firstPlayerIndex,
                revealOrder,
                chosenSuspect: null,
                winner: null,
              },
              ui: { phase: "assign" },
            });

            if (exhausted) {
              const msg = translate(get().lang, "toast.themeExhausted");
              setTimeout(() => get().showToast(msg, "warning"), 0);
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

        if (!isImpostor) {
          set({
            round: { ...round, chosenSuspect: i, winner: "impostor" },
            ui: { phase: "result" },
          });
          return;
        }

        // Impostor apanhado — verificar se faltam mais
        const newCaught = [...(round.caughtImpostorIndices ?? []), i];
        const allCaught = round.impostorIndices.every((idx) => newCaught.includes(idx));

        if (!allCaught) {
          // Ainda falta apanhar mais um impostor → segunda votação
          set({
            round: { ...round, chosenSuspect: i, caughtImpostorIndices: newCaught },
            ui: { phase: "vote2" },
          });
          return;
        }

        // Todos os impostores apanhados
        if (room.lastChance) {
          set({
            round: { ...round, chosenSuspect: i, caughtImpostorIndices: newCaught },
            ui: { phase: "lastchance" },
          });
        } else {
          set({
            round: { ...round, chosenSuspect: i, caughtImpostorIndices: newCaught, winner: "group" },
            ui: { phase: "result" },
          });
        }
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

      showToast: (message, type = "info") =>
        set({ toast: { message, type, id: Date.now() } }),

      clearToast: () => set({ toast: null }),

      reset: () =>
        set({
          ui: { phase: "setup" },
          round: null,
        }),
    }),
    {
      name: "impostor-game-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ui: s.ui, room: s.room, round: s.round, lang: s.lang }),
    }
  )
);
