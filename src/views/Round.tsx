import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
import { useT } from "@/i18n";
import { playerEmoji } from "@/utils/playerEmoji";

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
  const t              = useT();

  const firstPlayerName = useMemo(
    () => players?.[firstPlayerIdx] ?? t("common.playerFallback", { n: firstPlayerIdx + 1 }),
    [players, firstPlayerIdx, t]
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
          window.setTimeout(() => setDing(false), 2500);
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
    ? "text-white/20"
    : isLow
    ? "text-rose-400"
    : !running
    ? "text-white/35"
    : "text-white";

  return (
    <div className="app-container">
      {/* Header */}
      <motion.header
        className="screen pt-5 pb-2 text-center px-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <motion.div
          className="text-4xl mb-3 inline-block"
          animate={{ rotate: [0, -6, 6, -3, 0] }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeInOut" }}
        >
          💬
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">{t("round.title")}</h1>
        <p className="mt-1 text-sm text-white/40">{t("round.subtitle")}</p>
      </motion.header>

      <main className="screen flex-1 px-4 pb-28 flex flex-col items-center">
        {/* Quem começa */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.28 }}
          className="mt-4 flex flex-col items-center gap-2"
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">{t("round.startsSpeaking")}</p>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-brand/30 bg-brand/[0.07] px-4 py-2 shadow-[0_0_18px_rgba(239,68,68,0.10)]">
            <span className="text-xl leading-none">{playerEmoji(firstPlayerIdx)}</span>
            <span className="font-semibold text-[15px] text-white">{firstPlayerName}</span>
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.22, type: "spring", stiffness: 260, damping: 20 }}
          className="relative flex flex-col items-center"
        >
          {/* Anel de progresso visual (só quando tem timer) */}
          {hasTimer && (
            <div className="relative">
              <AnimatePresence>
                {isLow && !isDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)",
                      transform: "scale(1.6)",
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.button
                key={isDone ? "done" : running ? "running" : "paused"}
                aria-live="polite"
                aria-label={running ? t("round.pauseAria") : t("round.resumeAria")}
                onClick={() => hasTimer && !isDone && setRunning((r) => !r)}
                className={`relative tabular-nums font-black leading-none select-none transition-colors duration-300
                  text-[clamp(80px,28vw,172px)] ${timerColor}
                  ${isLow && running && !isDone ? "drop-shadow-[0_0_28px_rgba(239,68,68,0.50)]" : ""}
                  ${hasTimer && !isDone ? "cursor-pointer" : "cursor-default"}`}
                animate={isLow && running && !isDone ? {
                  scale: [1, 1.015, 1],
                } : { scale: 1 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
              >
                {hasTimer ? timeStr : "--:--"}
              </motion.button>
            </div>
          )}

          {!hasTimer && (
            <div className="tabular-nums font-black leading-none select-none text-white/20 text-[clamp(80px,28vw,172px)]">
              --:--
            </div>
          )}

          {/* Hint de tap */}
          {hasTimer && !isDone && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-xs text-white/35"
            >
              {running ? t("round.tapToPause") : t("round.tapToResume")}
            </motion.p>
          )}

          {/* Toast de tempo esgotado */}
          <AnimatePresence>
            {ding && (
              <motion.div
                initial={{ y: 12, opacity: 0, scale: 0.9 }}
                animate={{ y: 0,  opacity: 1, scale: 1 }}
                exit={{ y: -8,   opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="mt-4 px-4 py-2 rounded-full border border-rose-500/40 bg-rose-500/15 text-rose-300 text-sm font-semibold"
              >
                {t("round.timeUp")}
              </motion.div>
            )}
          </AnimatePresence>

          {isDone && !ding && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-white/30"
            >
              {t("round.timeToVote")}
            </motion.p>
          )}
        </motion.div>

        <div className="flex-1" />
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner">
          <motion.button
            className="btn-primary w-full"
            whileTap={{ scale: 0.97 }}
            onClick={() => toPhase("vote")}
          >
            {t("round.vote")}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
