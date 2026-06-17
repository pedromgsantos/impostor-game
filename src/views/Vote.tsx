// src/views/Vote.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
import { playerEmoji } from "@/utils/playerEmoji";

export default function Vote() {
  const toPhase     = useGameStore((s) => s.toPhase);
  const players     = useGameStore((s) => s.room.players);
  const round       = useGameStore((s) => s.round);
  const voteSuspect = useGameStore((s) => s.voteSuspect);

  const [selected, setSelected]       = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revealing, setRevealing]     = useState(false);

  useEffect(() => {
    if (!round || !players || players.length < 3) toPhase("setup");
  }, [round, players, toPhase]);

  const canConfirm = useMemo(() => selected !== null, [selected]);

  const vibrate = (ms = 10) => {
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  };

  const onConfirm = () => {
    if (selected === null) return;
    setConfirmOpen(false);
    setRevealing(true);
    vibrate(15);
    window.setTimeout(() => voteSuspect(selected), 1100);
  };

  return (
    <div className="app-container">
      <header className="screen pt-5 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-4xl mb-3"
        >
          🗳️
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">Votação</h1>
        <p className="mt-1 text-sm text-white/40">
          Quem é o impostor?
        </p>
      </header>

      <main className="screen flex-1 px-4 py-4 pb-28">
        <div role="radiogroup" aria-label="Lista de suspeitos" className="space-y-2.5 max-w-md mx-auto">
          {players?.map((name, i) => {
            const isSelected = selected === i;
            return (
              <motion.button
                key={i}
                role="radio"
                aria-checked={isSelected}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: "easeOut" }}
                onClick={() => { setSelected(i); vibrate(5); }}
                className={`w-full text-left rounded-2xl border transition-all duration-200 px-4 py-4 active:scale-[0.97]
                  ${isSelected
                    ? "border-brand/45 bg-brand/[0.08] shadow-[0_0_24px_rgba(239,68,68,0.14)]"
                    : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <motion.span
                      className="text-2xl shrink-0"
                      animate={isSelected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {playerEmoji(i)}
                    </motion.span>
                    <span className={`font-semibold text-[15px] truncate transition-colors duration-150 ${isSelected ? "text-white" : "text-white/75"}`}>
                      {name}
                    </span>
                  </div>

                  <motion.span
                    className={`text-[11px] px-2.5 py-1 rounded-full border shrink-0 font-medium transition-all duration-150
                      ${isSelected
                        ? "border-brand/50 bg-brand/15 text-brand"
                        : "border-white/10 bg-white/5 text-white/35"
                      }`}
                    animate={isSelected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {isSelected ? "Selecionado" : "Suspeito?"}
                  </motion.span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner max-w-md mx-auto w-full">
          <motion.button
            className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-300
              ${canConfirm
                ? "bg-brand text-white"
                : "bg-white/[0.05] text-white/25 cursor-not-allowed border border-white/[0.07]"
              }`}
            animate={canConfirm ? {
              boxShadow: [
                "0 6px 24px rgba(239,68,68,0.35)",
                "0 8px 36px rgba(239,68,68,0.55)",
                "0 6px 24px rgba(239,68,68,0.35)",
              ],
            } : { boxShadow: "none" }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            disabled={!canConfirm}
            onClick={() => setConfirmOpen(true)}
          >
            {canConfirm ? "⚖️  Confirmar suspeito" : "Seleciona um suspeito"}
          </motion.button>
        </div>
      </div>

      {/* Modal de confirmação */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmOpen(false)}
            />
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1525]/97 p-6 shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {selected !== null ? playerEmoji(selected) : "🤔"}
                </div>
                <h2 className="text-lg font-bold">
                  {selected !== null ? players?.[selected] : "—"}
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Têm a certeza que querem acusar esta pessoa?
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-600 font-bold text-sm transition shadow-[0_4px_16px_rgba(239,68,68,0.35)]"
                  onClick={onConfirm}
                >
                  Acusar 🔍
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ecrã de suspense */}
      <AnimatePresence>
        {revealing && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                🔍
              </motion.div>
              <p className="text-sm text-white/50 mb-4">A revelar...</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-brand/60 animate-pulse [animation-delay:130ms]" />
                <div className="w-2 h-2 rounded-full bg-brand/35 animate-pulse [animation-delay:260ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
