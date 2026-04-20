// src/views/Result.tsx
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game";
import { resetTheme } from "@/services/wordManager";

export default function Result() {
  const toPhase   = useGameStore((s) => s.toPhase);
  const players   = useGameStore((s) => s.room.players);
  const mode      = useGameStore((s) => s.room.mode);
  const theme     = useGameStore((s) => s.room.theme);
  const round     = useGameStore((s) => s.round);
  const startGame = useGameStore((s) => s.startGame);
  const reset     = useGameStore((s) => s.reset);

  useEffect(() => {
    if (!round || !players || players.length < 3) toPhase("setup");
  }, [round, players, toPhase]);

  const impostorName = useMemo(() => {
    if (!round || !players?.length) return "—";
    return players[round.impostorIndex] ?? "—";
  }, [players, round]);

  const groupWon = round?.winner === "group";

  const onNewRoom = () => {
    reset();
  };

  const onResetHistory = async () => {
    if (!theme) return;
    const ok = confirm(`Repor histórico do tema "${theme}"?`);
    if (!ok) return;
    await resetTheme(theme);
    alert(`Histórico do tema "${theme}" reposto.`);
  };

  const infoItems = [
    { label: "Impostor",        value: impostorName },
    { label: "Palavra real",    value: round?.realWord ?? "—" },
    {
      label: mode === "normal" ? "Palavra do impostor" : "Modo cego",
      value: mode === "normal" ? (round?.impostorWord ?? "—") : "Impostor jogou no escuro",
    },
  ];

  return (
    <div className="app-container">
      <header className="screen pt-4 text-center px-4">
        <p className="text-xs text-white/50">Fase</p>
        <h1 className="text-2xl font-semibold tracking-tight">Resultado</h1>
      </header>

      <main className="screen flex-1 px-4 py-6 flex flex-col items-center">
        {/* cartão do vencedor */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.97 }}
          animate={{ y: 0,  opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="w-full max-w-md"
        >
          <div className={`rounded-3xl border p-6 text-center shadow-2xl ${
            groupWon
              ? "border-emerald-500/25 bg-emerald-500/[0.08]"
              : "border-rose-500/25 bg-rose-500/[0.08]"
          }`}>
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Vencedor</p>
            <h2 className={`text-3xl font-black tracking-tight ${
              groupWon ? "text-emerald-300" : "text-rose-300"
            }`}>
              {groupWon ? "Grupo venceu 🎉" : "Impostor venceu 😈"}
            </h2>
          </div>
        </motion.div>

        {/* informação da ronda */}
        <div className="w-full max-w-md mt-4 card p-5 space-y-3">
          {infoItems.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.08, duration: 0.28 }}
              className="flex items-start justify-between gap-3"
            >
              <span className="text-sm text-white/50 shrink-0">{label}</span>
              <span className="text-sm font-semibold text-right">{value}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 text-[11px] text-white/40 text-center max-w-sm"
        >
          Podes jogar novamente com a mesma sala ou criar uma nova.
        </motion.p>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        className="screen px-4 pb-6 pt-3 flex flex-col gap-2"
      >
        <button
          className="w-full py-3.5 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] transition shadow-lg"
          style={{ boxShadow: "0 4px 20px rgba(16,185,129,.30)" }}
          onClick={startGame}
        >
          Jogar novamente
        </button>
        <div className="flex gap-2">
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/12 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition text-sm"
            onClick={onNewRoom}
          >
            Nova sala
          </button>
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/12 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition text-sm"
            onClick={onResetHistory}
          >
            Repor histórico
          </button>
        </div>
      </motion.footer>
    </div>
  );
}
