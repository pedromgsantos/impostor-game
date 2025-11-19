// src/views/Result.tsx
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game";
import { resetTheme } from "@/services/wordManager";

// ecrã de resultado da ronda
export default function Result() {
  const toPhase   = useGameStore((s) => s.toPhase);
  const players   = useGameStore((s) => s.room.players);
  const mode      = useGameStore((s) => s.room.mode);
  const theme     = useGameStore((s) => s.room.theme);
  const round     = useGameStore((s) => s.round);
  const startGame = useGameStore((s) => s.startGame);
  const reset     = useGameStore((s) => s.reset);
  const setRoom   = useGameStore((s) => s.setRoom);

  // guarda: se não houver ronda válida, volta ao setup
  useEffect(() => {
    if (!round || !players || players.length < 3) {
      toPhase("setup");
    }
  }, [round, players, toPhase]);

  // nome do impostor, com fallback seguro
  const impostorName = useMemo(
    () => {
      if (!round || !players || !players.length) return "—";
      return players[round.impostorIndex] ?? "—";
    },
    [players, round]
  );

  // se o grupo ganhou
  const groupWon = round?.winner === "group";

  // recomeça o jogo com a mesma sala
  const onPlayAgain = () => {
    startGame();
  };

  // cria uma nova sala e volta ao setup
  const onNewRoom = () => {
    reset();
    setRoom({ players: [] });
  };

  // repõe o histórico de palavras do tema actual
  const onResetHistory = async () => {
    if (!theme) return;
    const ok = confirm(`Repor histórico do tema "${theme}"?`);
    if (!ok) return;
    await resetTheme(theme);
    alert(`Histórico do tema "${theme}" reposto.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-black text-white flex flex-col px-safe pt-safe pb-safe">
      <header className="px-4 pt-4 text-center">
        <p className="text-sm opacity-70">Fase</p>
        <h1 className="text-2xl font-semibold tracking-tight">Resultado</h1>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col items-center">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-xl"
        >
          <p className="text-sm uppercase tracking-widest opacity-70">
            Vencedor
          </p>
          <h2
            className={`mt-1 text-2xl font-bold ${
              groupWon ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {groupWon ? "Grupo venceu 🎉" : "Impostor venceu 😈"}
          </h2>

          <div className="mt-5 text-left space-y-2">
            <p>
              <span className="opacity-70">Impostor:</span>{" "}
              <span className="font-semibold">{impostorName}</span>
            </p>
            <p>
              <span className="opacity-70">Palavra real:</span>{" "}
              <span className="font-semibold">
                {round?.realWord ?? "—"}
              </span>
            </p>
            <p>
              <span className="opacity-70">
                {mode === "normal" ? "Palavra do impostor:" : "Modo cego:"}
              </span>{" "}
              <span className="font-semibold">
                {mode === "normal"
                  ? (round?.impostorWord ?? "—")
                  : "Impostor jogou no escuro"}
              </span>
            </p>
          </div>
        </motion.div>

        <p className="mt-4 text-[11px] opacity-60 text-center max-w-sm">
          Podes jogar novamente com a mesma sala ou criar uma nova sala.
        </p>
      </main>

      <footer className="px-4 pb-5 pt-3 flex flex-col gap-2 max-w-md mx-auto w-full">
        <button
          className="w-full py-3 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition shadow-lg"
          onClick={onPlayAgain}
        >
          Jogar novamente
        </button>
        <div className="flex gap-2">
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition"
            onClick={onNewRoom}
          >
            Nova sala
          </button>
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition"
            onClick={onResetHistory}
          >
            Repor histórico
          </button>
        </div>
      </footer>
    </div>
  );
}
