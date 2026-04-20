// src/views/Round.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

function formatTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Round() {
  const toPhase        = useGameStore((s) => s.toPhase);
  const timerSetting   = useGameStore((s) => s.room.timerSec);
  const players        = useGameStore((s) => s.room.players);
  const firstPlayerIdx = useGameStore((s) => s.round?.firstPlayerIndex ?? 0);

  const firstPlayerName = useMemo(
    () => players?.[firstPlayerIdx] ?? `Jogador ${firstPlayerIdx + 1}`,
    [players, firstPlayerIdx]
  );

  const [seconds, setSeconds] = useState<number>(() => Math.max(0, timerSetting));
  const [running, setRunning] = useState<boolean>(timerSetting > 0);
  const [ding, setDing]       = useState(false);

  const intervalRef  = useRef<number | null>(null);
  const vibratedRef  = useRef(false);

  const hasTimer = timerSetting > 0;
  const isLow    = hasTimer && seconds > 0 && seconds <= 10;
  const isDone   = hasTimer && seconds === 0;

  const vibrate = (ms = 20) => {
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!players || players.length < 3) toPhase("setup");
  }, [players, toPhase]);

  useEffect(() => {
    if (!hasTimer || !running) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) return 0;
        const next = prev - 1;
        if (next === 0 && !vibratedRef.current) {
          vibrate(40);
          vibratedRef.current = true;
          setDing(true);
          window.setTimeout(() => setDing(false), 2000);
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, hasTimer]);

  useEffect(() => {
    setSeconds(Math.max(0, timerSetting));
    setRunning(timerSetting > 0);
    vibratedRef.current = false;
    setDing(false);
  }, [timerSetting]);

  const timeStr = useMemo(() => formatTime(seconds), [seconds]);

  const timerColor = isDone
    ? "text-white/30"
    : isLow
    ? "text-rose-400"
    : !running
    ? "text-white/40"
    : "text-white";

  const timerGlow = isLow && running && !isDone
    ? "drop-shadow-[0_0_20px_rgba(239,68,68,.55)]"
    : "";

  return (
    <div className="app-container">
      <header className="screen pt-2 text-center px-4">
        <p className="text-xs text-white/50">Fase</p>
        <h1 className="text-xl font-semibold tracking-tight">Ronda</h1>

        <div className="phase-badge mt-2">
          <span className="text-white/60">Começa:</span>
          <span className="font-semibold text-brand">{firstPlayerName}</span>
        </div>
      </header>

      <main className="screen flex-1 px-4 pb-28 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="text-center mt-6 md:mt-8"
        >
          <div className="font-extrabold tracking-tight text-[clamp(24px,8vw,48px)]">
            {firstPlayerName}
          </div>
          <p className="mt-1 text-xs text-white/40">começa a falar</p>
        </motion.div>

        <div className="flex-1" />

        {/* temporizador */}
        <div className="relative w-full select-none">
          <motion.div
            key={timeStr}
            initial={{ scale: 0.97, opacity: 0.7 }}
            animate={{ scale: 1,    opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            aria-live="polite"
            aria-atomic
            onClick={() => hasTimer && !isDone && setRunning((r) => !r)}
            className={`cursor-default mx-auto w-fit text-center transition-colors duration-300 ${timerColor} ${timerGlow}`}
          >
            <div className="leading-[0.9] font-black tabular-nums text-[clamp(72px,26vw,168px)]">
              {hasTimer ? timeStr : "--:--"}
            </div>

            {hasTimer && !isDone && (
              <p className="mt-3 text-xs text-white/40">
                {running ? "Toque para pausar" : "Toque para retomar"}
              </p>
            )}
          </motion.div>

          {/* notificação de tempo esgotado */}
          <AnimatePresence>
            {ding && (
              <motion.div
                initial={{ y: -10, opacity: 0, scale: 0.9 }}
                animate={{ y: 0,   opacity: 1, scale: 1 }}
                exit={{ y: -10,    opacity: 0, scale: 0.9 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300"
              >
                Tempo esgotado
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        <div className="mb-4 flex flex-col items-center gap-3">
          {hasTimer && !isDone && (
            <button
              className="px-5 py-2 rounded-2xl border border-white/12 bg-white/5 hover:bg-white/10 active:scale-[0.97] transition text-sm text-white/80"
              onClick={() => setRunning((r) => !r)}
              aria-pressed={running}
            >
              {running ? "Pausar" : "Retomar"}
            </button>
          )}
          <p className="text-[11px] text-white/40 text-center max-w-xs">
            O temporizador não avança automaticamente. Usa o botão abaixo quando a discussão terminar.
          </p>
        </div>
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner">
          <button className="btn-primary w-full" onClick={() => toPhase("vote")}>
            Votar
          </button>
        </div>
      </div>
    </div>
  );
}
