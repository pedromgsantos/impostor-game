import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getNextWords } from "@/services/wordManager";

export type Phase = "setup" | "assign" | "round" | "vote" | "result";

export interface UIState {
  phase: Phase;
}

export interface RoomState {
  players: string[];
  mode: "normal" | "cego";
  theme: string;
  timerSec: number;
}

export interface RoundState {
  impostorIndex: number;
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
  reset: () => void;
}

const initialRoom: RoomState = {
  players: [],
  mode: "normal",
  theme: "classic",
  timerSec: 60,
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

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ui: { phase: "setup" },
      room: initialRoom,
      round: null,

      // altera apenas parte do estado da sala
      setRoom: (patch) =>
        set((s) => ({
          room: { ...s.room, ...patch },
        })),

      // muda de ecrã/fase
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
            // para o tema "royale" o jogo é sempre em modo cego, mesmo que a sala esteja em "normal"
            const effectiveMode: RoomState["mode"] =
              room.theme === "royale" ? "cego" : room.mode;

            const { real, impostor, exhausted } = await getNextWords(
              room.theme,
              effectiveMode
            );

            // escolhe o impostor ao acaso
            const impostorIndex = Math.floor(Math.random() * n);

            // quem começa a falar:
            //  - normal: qualquer jogador
            //  - cego: nunca o impostor
            let firstPlayerIndex = Math.floor(Math.random() * n);
            if (effectiveMode === "cego") {
              while (firstPlayerIndex === impostorIndex) {
                firstPlayerIndex = Math.floor(Math.random() * n);
              }
            }

            // ordem aleatória de revelação das cartas (índices dos jogadores)
            const revealOrder = shuffle([...Array(n).keys()]);

            set({
              round: {
                impostorIndex,
                realWord: real,
                // só há palavra do impostor quando o modo é normal
                impostorWord: effectiveMode === "normal" ? impostor : null,
                firstPlayerIndex,
                revealOrder,
                chosenSuspect: null,
                winner: null,
              },
              ui: { phase: "assign" },
            });

            // tema esgotado: avisa mas não trava o jogo
            if (exhausted && typeof window !== "undefined") {
              setTimeout(
                () => alert("Tema esgotado, repor ou mudar."),
                0
              );
            }
          } catch (e) {
            console.error("Erro ao obter palavras:", e);
          }
        })();
      },

      // regista voto e calcula vencedor
      voteSuspect: (i) => {
        const r = get().round;
        if (!r) return;
        const winner = i === r.impostorIndex ? "group" : "impostor";
        set({
          round: { ...r, chosenSuspect: i, winner },
          ui: { phase: "result" },
        });
      },

      // volta ao início, mas mantém configuração da sala
      reset: () =>
        set({
          ui: { phase: "setup" },
          round: null,
        }),
    }),
    {
      name: "impostor-game-store",
      storage: createJSONStorage(() => localStorage),
      // só persistimos o que faz sentido reter entre sessões
      partialize: (s) => ({ ui: s.ui, room: s.room }),
    }
  )
);
