// src/views/Result.tsx
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameStore } from "@/store/game";
import { resetTheme } from "@/services/wordManager";
import { playerEmoji } from "@/utils/playerEmoji";

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

  const impostorIndices = round?.impostorIndices ?? [];
  const groupWon = round?.winner === "group";

  useEffect(() => {
    if (!groupWon) return;

    const fire = (opts: confetti.Options) =>
      confetti({ colors: ["#ef4444", "#fca5a5", "#ffffff", "#f87171", "#fee2e2"], ...opts });

    const t1 = setTimeout(() => {
      fire({ particleCount: 50, angle: 60,  spread: 55, origin: { x: 0,   y: 0.8 } });
      fire({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1,   y: 0.8 } });
    }, 250);

    const t2 = setTimeout(() => {
      fire({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.75 } });
    }, 500);

    const t3 = setTimeout(() => {
      fire({ particleCount: 40, spread: 100, startVelocity: 20, decay: 0.92, origin: { x: 0.25, y: 0.65 } });
      fire({ particleCount: 40, spread: 100, startVelocity: 20, decay: 0.92, origin: { x: 0.75, y: 0.65 } });
    }, 750);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [groupWon]);

  const onResetHistory = async () => {
    if (!theme) return;
    const ok = confirm(`Repor histórico do tema "${theme}"?`);
    if (!ok) return;
    await resetTheme(theme);
    alert(`Histórico do tema "${theme}" reposto.`);
  };

  return (
    <div className="app-container">
      <main className="screen flex-1 px-4 flex flex-col items-center pt-8 pb-4">

        {/* Outcome — big and dramatic */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
        >
          <div className="text-8xl mb-4">{groupWon ? "🎉" : "😈"}</div>
          <h1 className={`text-4xl font-bold tracking-tight ${groupWon ? "text-emerald-400" : "text-rose-400"}`}>
            {groupWon ? "Grupo venceu!" : "Impostor venceu!"}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-white/40 max-w-xs mx-auto"
          >
            {groupWon
              ? "Encontraram o impostor! Bom trabalho de equipa. 🔍"
              : "O impostor enganou toda a gente. Boa sorte da próxima!"}
          </motion.p>
        </motion.div>

        {/* Impostor reveal card */}
        <motion.div
          className="w-full max-w-md mt-8 card overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35, ease: "easeOut" }}
        >
          {/* Impostor header */}
          <div className={`px-5 py-5 text-center border-b border-white/[0.07] ${groupWon ? "bg-emerald-500/[0.07]" : "bg-rose-500/[0.07]"}`}>
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/35 mb-3">
              {impostorIndices.length > 1 ? "Os impostores eram" : "O impostor era"}
            </p>
            <div className="flex items-center justify-center gap-4">
              {impostorIndices.map((idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="text-4xl">{playerEmoji(idx)}</div>
                  <p className="text-lg font-bold">{players?.[idx] ?? `Jogador ${idx + 1}`}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-white/40 shrink-0">Palavra real</span>
              <span className="text-sm font-semibold text-right">{round?.realWord ?? "—"}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-white/40 shrink-0">
                {mode === "normal" ? "Pista do impostor" : "Modo cego"}
              </span>
              <span className="text-sm font-semibold text-right">
                {mode === "normal" ? (round?.impostorWord ?? "—") : "Impostor jogou no escuro"}
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="screen px-4 pb-6 pt-3 flex flex-col gap-2.5"
      >
        <button
          className={`w-full py-4 rounded-2xl font-bold text-[15px] transition active:scale-[0.97]
            ${groupWon ? "bg-emerald-500 hover:bg-emerald-400" : "bg-brand hover:bg-brand-600"}`}
          style={{ boxShadow: groupWon ? "0 6px 24px rgba(16,185,129,0.40)" : "0 6px 24px rgba(239,68,68,0.40)" }}
          onClick={startGame}
        >
          🔄  Jogar novamente
        </button>
        <div className="flex gap-2">
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/[0.09] bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.97] transition text-sm"
            onClick={reset}
          >
            Nova sala
          </button>
          <button
            className="flex-1 py-3 rounded-2xl font-semibold border border-white/[0.09] bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.97] transition text-sm text-white/50"
            onClick={onResetHistory}
          >
            Repor histórico
          </button>
        </div>
      </motion.footer>
    </div>
  );
}
