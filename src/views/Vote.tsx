// src/views/Vote.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

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
      <header className="screen pt-3 text-center px-4">
        <p className="text-xs text-white/50">Fase</p>
        <h1 className="text-2xl font-semibold tracking-tight">Votação</h1>
        <p className="mt-1 text-xs text-white/45">
          Escolham 1 suspeito e confirmem.
        </p>
      </header>

      <main className="screen flex-1 px-4 py-3 pb-28">
        <div role="radiogroup" aria-label="Lista de suspeitos" className="max-w-md mx-auto space-y-2.5">
          {players?.map((name, i) => {
            const isSelected = selected === i;
            return (
              <motion.button
                key={i}
                role="radio"
                aria-checked={isSelected}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.055, duration: 0.25, ease: "easeOut" }}
                onClick={() => { setSelected(i); vibrate(5); }}
                className={`w-full text-left rounded-2xl border transition-all duration-150
                  px-4 py-3.5 active:scale-[0.98]
                  ${isSelected
                    ? "border-amber-400/50 ring-2 ring-amber-400/30 bg-amber-400/[0.06]"
                    : "border-white/8 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`grid place-items-center w-9 h-9 rounded-full shrink-0 text-sm font-bold transition-colors duration-150
                        ${isSelected ? "bg-amber-500 text-white" : "bg-white/10 text-white/70"}`}>
                      {name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="font-semibold truncate">{name}</span>
                  </div>

                  <span className={`text-[11px] px-2 py-1 rounded-full border shrink-0 transition-all duration-150
                      ${isSelected
                        ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                        : "border-white/10 bg-white/5 text-white/50"
                      }`}>
                    {isSelected ? "Selecionado" : "Suspeito"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner max-w-md mx-auto w-full">
          <button
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canConfirm}
            onClick={() => setConfirmOpen(true)}
          >
            Confirmar suspeito
          </button>
        </div>
      </div>

      {/* modal de confirmação */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              onClick={() => setConfirmOpen(false)}
            />
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0,  opacity: 1, scale: 1 }}
              exit={{ y: 12,    opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold">Confirmar suspeito?</h2>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">
                Tens a certeza que querem acusar{" "}
                <span className="font-semibold text-white">
                  {selected !== null ? players[selected] : "—"}
                </span>
                ?
              </p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 text-sm transition"
                  onClick={() => setConfirmOpen(false)}
                >
                  Voltar
                </button>
                <button
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] font-semibold text-sm transition"
                  onClick={onConfirm}
                >
                  Avançar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ecrã de suspense */}
      <AnimatePresence>
        {revealing && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <p className="text-sm text-white/60 mb-3">A revelar...</p>
              <div className="text-4xl">🤫</div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse [animation-delay:130ms]" />
                <div className="w-2 h-2 rounded-full bg-white/35 animate-pulse [animation-delay:260ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
