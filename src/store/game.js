// src/store/game.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getNextWords } from "@/services/wordManager";
const initialRoom = {
    players: [],
    mode: "normal",
    theme: "classic",
    timerSec: 60,
};
// util: Fisher-Yates
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
export const useGameStore = create()(persist((set, get) => ({
    ui: { phase: "setup" },
    room: initialRoom,
    round: null,
    setRoom: (patch) => set((s) => ({ room: { ...s.room, ...patch } })),
    toPhase: (p) => set((s) => ({ ui: { ...s.ui, phase: p } })),
    startGame: () => {
        const { room } = get();
        const n = room.players.length;
        if (n < 3)
            return;
        (async () => {
            try {
                const { real, impostor, exhausted } = await getNextWords(room.theme, room.mode);
                // sorteios
                const impostorIndex = Math.floor(Math.random() * n);
                // quem começa a falar:
                //  - normal: qualquer um
                //  - cego: nunca o impostor
                let firstPlayerIndex = Math.floor(Math.random() * n);
                if (room.mode === "cego") {
                    while (firstPlayerIndex === impostorIndex) {
                        firstPlayerIndex = Math.floor(Math.random() * n);
                    }
                }
                // ordem de revelação aleatória (por índice dos jogadores)
                const revealOrder = shuffle([...Array(n).keys()]);
                set({
                    round: {
                        impostorIndex,
                        realWord: real,
                        impostorWord: room.mode === "normal" ? impostor : null,
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
            }
            catch (e) {
                console.error("Erro ao obter palavras:", e);
            }
        })();
    },
    voteSuspect: (i) => {
        const r = get().round;
        if (!r)
            return;
        const winner = i === r.impostorIndex ? "group" : "impostor";
        set({
            round: { ...r, chosenSuspect: i, winner },
            ui: { phase: "result" },
        });
    },
    reset: () => set({ ui: { phase: "setup" }, round: null }),
}), {
    name: "impostor-game-store",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({ ui: s.ui, room: s.room }),
}));
