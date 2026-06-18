// src/views/Assign.tsx
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
import { slugifyCard } from "@/utils/slugifyCard";
import { playerEmoji } from "@/utils/playerEmoji";

export default function Assign() {
  const phase   = useGameStore((s) => s.ui.phase);
  const players = useGameStore((s) => s.room.players);
  const mode    = useGameStore((s) => s.room.mode);
  const theme   = useGameStore((s) => s.room.theme);
  const toPhase = useGameStore((s) => s.toPhase);
  const round   = useGameStore((s) => s.round);

  const [idx, setIdx]                 = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isHolding, setIsHolding]     = useState(false);
  const [dragY, setDragY]             = useState(0);
  const holdTimerRef                  = useRef<number | null>(null);
  const surfaceRef                    = useRef<HTMLDivElement | null>(null);

  const isClashTheme = theme === "royale";

  useEffect(() => {
    if (phase !== "assign") return;
    if (!players || players.length < 3) {
      useGameStore.getState().toPhase("setup");
    }
  }, [phase, players]);

  const order = round?.revealOrder ?? [];
  const actualIndex = order[idx] ?? idx;
  const currentName = players?.[actualIndex] ?? `Jogador ${actualIndex + 1}`;
  const isImpostor = (round?.impostorIndices ?? []).includes(actualIndex);

  const revealText = useMemo(() => {
    const normal = mode === "normal";
    if (isImpostor) {
      if (normal) return round?.impostorWord ?? "IMPOSTOR";
      return "Boa sorte 😈";
    }
    return round?.realWord ?? "PALAVRA";
  }, [isImpostor, mode, round?.impostorWord, round?.realWord]);

  const subtitle = useMemo(() => {
    if (isImpostor) return mode === "normal" ? "És o impostor" : "Jogas no escuro";
    return "És do grupo";
  }, [isImpostor, mode]);

  const cardImageSrc = useMemo(() => {
    if (!isClashTheme || isImpostor || !revealText) return null;
    const slug = slugifyCard(revealText);
    return `${import.meta.env.BASE_URL}cards/${slug}.png`;
  }, [isClashTheme, isImpostor, revealText]);

  const cardVisible = isHolding && (dragY <= -24 || holdTimerRef.current === -1);

  const vibrate = (ms = 10) => {
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  };

  const startHoldTimer = () => {
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = -1;
      setIsHolding(true);
      vibrate(8);
    }, 450);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current && holdTimerRef.current > 0) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsHolding(true);
    setDragY(0);
    startHoldTimer();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isHolding) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerY = rect.top + rect.height / 2;
    setDragY(e.clientY - centerY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const revealedOnce = cardVisible || holdTimerRef.current === -1;
    setIsHolding(false);
    setDragY(0);
    clearHoldTimer();
    if (revealedOnce) {
      setHasRevealed(true);
      vibrate(6);
    }
  };

  useEffect(() => () => clearHoldTimer(), []);

  const onContinue = () => {
    if (idx < (players?.length ?? 0) - 1) {
      setIdx((v) => v + 1);
      setHasRevealed(false);
      setIsHolding(false);
      setDragY(0);
      vibrate(5);
      return;
    }
    toPhase("round");
  };

  const onTapHoldButtonDown = () => {
    setIsHolding(true);
    holdTimerRef.current = -1;
    vibrate(8);
  };

  const onTapHoldButtonUp = () => {
    setIsHolding(false);
    setHasRevealed(true);
    setDragY(0);
    clearHoldTimer();
    vibrate(6);
  };

  const total = players?.length ?? 0;

  return (
    <div className="app-container">
      {/* Header com progress */}
      <header className="screen pt-4 text-center px-4">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {players?.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === idx ? 24 : i < idx ? 16 : 6,
                opacity: i < idx ? 0.4 : i === idx ? 1 : 0.2,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`h-1.5 rounded-full ${i <= idx ? "bg-brand" : "bg-white/20"}`}
            />
          ))}
        </div>

        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.09] bg-white/[0.05] px-4 py-2"
        >
          <span className="text-xl leading-none">{playerEmoji(actualIndex)}</span>
          <span className="font-semibold text-[15px]">{currentName}</span>
          <span className="text-white/30 text-xs">·</span>
          <span className="text-white/45 text-xs">{idx + 1} de {total}</span>
        </motion.div>
      </header>

      {/* Corpo principal */}
      <main className="screen flex-1 px-4 pb-28 flex flex-col">
        <div className="flex-1" />

        <div className="mx-auto w-full max-w-[520px]">
          <div
            ref={surfaceRef}
            role="button"
            aria-label="Arrasta para cima e mantém para ver o teu papel"
            aria-live="polite"
            className="relative w-full h-[min(54vh,500px)] rounded-2xl bg-[#18131f]/95 border border-white/[0.12] shadow-[0_24px_60px_-8px_rgba(0,0,0,0.70)] overflow-hidden touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Nome + avatar no topo do cartão */}
            <div className="absolute top-6 inset-x-0 text-center pointer-events-none">
              <div className="text-4xl mb-1">{playerEmoji(actualIndex)}</div>
              <div className="font-bold tracking-tight text-[clamp(20px,6.5vw,36px)]">
                {currentName}
              </div>
            </div>

            {/* Instruções */}
            {!cardVisible && (
              <motion.div
                className="absolute inset-0 grid place-items-center p-6"
                animate={{ y: Math.max(-12, Math.min(0, dragY * 0.15)) }}
                transition={{ type: "spring", stiffness: 250, damping: 24 }}
              >
                <div className="text-center space-y-3 mt-16">
                  <p className="text-[13px] opacity-60">
                    Só <span className="font-semibold text-white/90">{currentName}</span> deve ver
                  </p>
                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                      className="text-2xl opacity-50"
                    >
                      ☝️
                    </motion.div>
                    <p className="text-xs text-white/40">Arrasta para cima e mantém</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cartão secreto */}
            <AnimatePresence>
              {cardVisible && (
                <motion.div
                  key="card"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="absolute inset-0 grid place-items-center"
                >
                  <div
                    className={`mx-4 w-full rounded-3xl border shadow-2xl overflow-hidden text-white
                      ${isImpostor
                        ? "bg-rose-600 border-rose-400/40"
                        : "bg-emerald-600 border-emerald-400/40"
                      }`}
                  >
                    {/* Header */}
                    <div className="px-6 pt-7 pb-4 text-center">
                      <div className="text-5xl mb-3">{playerEmoji(actualIndex)}</div>
                      <p className="text-[10px] uppercase tracking-[0.15em] opacity-60">Para</p>
                      <p className="font-bold text-lg mt-0.5">{currentName}</p>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 h-px bg-white/25" />

                    {/* Word */}
                    <div className="px-6 py-7 text-center">
                      {isClashTheme && isImpostor ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-5xl">😈</span>
                          <p className="text-[clamp(24px,7vw,36px)] font-black">Boa sorte</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-[clamp(34px,10vw,52px)] font-black break-words leading-none tracking-tight">
                            {revealText}
                          </p>
                          {isClashTheme && cardImageSrc && (
                            <div className="mt-4 flex justify-center">
                              <img
                                src={cardImageSrc}
                                alt={revealText}
                                loading="lazy"
                                className="h-24 md:h-28 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer badge */}
                    <div className="pb-6 text-center">
                      <span className="text-xs px-3 py-1 rounded-full bg-black/20 border border-white/20">
                        {subtitle}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Máscara de revelação */}
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
              style={{ transformOrigin: "bottom" }}
              animate={{
                scaleY: Math.max(0, Math.min(1, 1 - Math.max(0, -dragY) / 200)),
              }}
            />

            {/* Aviso anti-batota */}
            <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center">
              <p className="text-[11px] text-center opacity-50">
                ⚠️ Jogo justo — sem espreitar nem screenshots
              </p>
            </div>
          </div>
        </div>

        {/* Botão tocar & manter */}
        <div className="mt-4 mb-4 flex items-center justify-center">
          <button
            className="px-5 py-2.5 rounded-2xl border border-white/15 bg-white/8 hover:bg-white/12 active:scale-[0.97] transition text-sm text-white/70"
            aria-label="Tocar e manter para ver o teu papel"
            onPointerDown={onTapHoldButtonDown}
            onPointerUp={onTapHoldButtonUp}
            onPointerCancel={onTapHoldButtonUp}
          >
            👆 Tocar &amp; Manter
          </button>
        </div>

        <div className="flex-1" />
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner">
          <button
            className="btn-primary w-full disabled:opacity-35 disabled:cursor-not-allowed"
            aria-disabled={!hasRevealed}
            disabled={!hasRevealed}
            onClick={onContinue}
          >
            {idx < (players?.length ?? 0) - 1 ? "Continuar →" : "Começar ronda 🎮"}
          </button>
          <p className="mt-2 text-center text-[11px] opacity-35">
            Nada fica visível quando largas o ecrã.
          </p>
        </div>
      </div>
    </div>
  );
}
