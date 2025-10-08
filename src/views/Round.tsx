// src/views/Round.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

/**
 * Round.tsx — Fase da ronda (temporizador + votar)
 * Layout mobile “espalhado”:
 *  - Topo: título + chip “Começa:”
 *  - Secção 1 (top): nome de quem começa
 *  - Secção 2 (meio): temporizador centrado verticalmente
 *  - Secção 3 (fundo): pausa/retoma + nota
 *  - Botão “Votar” fixo na bottom bar
 */

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
  const [ding, setDing] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const vibratedRef = useRef(false);

  const hasTimer = seconds >= 0 && timerSetting > 0;

  const vibrate = (ms = 20) => { try { navigator.vibrate?.(ms); } catch {} };

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
          window.setTimeout(() => setDing(false), 1500);
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

  return (
    <div className="app-container">
      {/* TOPO */}
      <header className="screen pt-2 text-center px-4">
        <p className="text-xs opacity-70">Fase</p>
        <h1 className="text-xl font-semibold tracking-tight">Ronda</h1>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
          <span className="opacity-75">Começa:</span>
          <span className="font-semibold text-brand">{firstPlayerName}</span>
        </div>
      </header>

      {/* CONTEÚDO – distribuído em 3 blocos */}
      <main className="screen flex-1 px-4 pb-28 flex flex-col">
        {/* 1) Nome em grande (topo da coluna) */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="text-center mt-6 md:mt-8"
        >
          <div className="font-extrabold tracking-tight text-[clamp(24px,8vw,48px)]">
            {firstPlayerName}
          </div>
        </motion.div>

        {/* Espaçador para empurrar o relógio para o meio */}
        <div className="flex-1" />

        {/* 2) Temporizador — CENTRADO verticalmente no “meio” */}
        <div className="relative w-full select-none">
          <motion.div
            key={timeStr}
            initial={{ scale: 0.985, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 22 }}
            aria-live="polite"
            aria-atomic
            onClick={() => hasTimer && setRunning((r) => !r)}
            className="cursor-default mx-auto w-fit text-center"
          >
            {/* 72px em XS, cresce com 26vw e limita-se a 168px em ecrãs grandes */}
            <div className="leading-[0.9] font-black tabular-nums text-[clamp(72px,26vw,168px)]">
              {hasTimer ? timeStr : "--:--"}
            </div>
            {hasTimer && (
              <p className="mt-3 text-xs opacity-60">Toque para pausar/retomar</p>
            )}
          </motion.div>

          <AnimatePresence>
            {ding && (
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/15"
              >
                Tempo esgotado
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Espaçador para afastar dos controlos */}
        <div className="flex-1" />

        {/* 3) Controlos + nota (fundo da coluna) */}
        <div className="mt-2 mb-4 flex flex-col items-center">
          {hasTimer && (
            <button
              className="px-5 py-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur hover:bg-white/10 active:scale-[0.98] transition text-sm"
              onClick={() => setRunning((r) => !r)}
              aria-pressed={running}
            >
              {running ? "Pausar" : "Retomar"}
            </button>
          )}
          <p className="mt-4 text-[11px] opacity-60 text-center max-w-xs">
            O temporizador não avança automaticamente a fase. Usa o botão abaixo
            quando a discussão terminar.
          </p>
        </div>
      </main>

      {/* BOTÃO FIXO */}
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
