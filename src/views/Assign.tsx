// src/views/Assign.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

/**
 * Assign.tsx — Atribuição de papéis/palavra (mobile-first)
 * - Cartão principal: praticamente opaco (bg-slate-900/98)
 * - Cartão secreto: muito opaco (impostor/grupo com /90)
 * - Máscara de revelação densa (from-black/90)
 * - “Tocar & Manter” VISÍVEL logo abaixo do cartão
 * - Instruções escondem quando o cartão secreto está visível (para não colidir)
 */

export default function Assign() {
  const phase   = useGameStore((s) => s.ui.phase);
  const players = useGameStore((s) => s.room.players);
  const mode    = useGameStore((s) => s.room.mode); // 'normal' | 'cego'
  const toPhase = useGameStore((s) => s.toPhase);
  const round   = useGameStore((s) => s.round);

  // Índice interno do jogador actual (NÃO apresentado no UI)
  const [idx, setIdx]                 = useState(0);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [isHolding, setIsHolding]     = useState(false);
  const [dragY, setDragY]             = useState(0);
  const holdTimerRef                  = useRef<number | null>(null);
  const surfaceRef                    = useRef<HTMLDivElement | null>(null);

  // Guarda
  useEffect(() => {
    if (phase !== "assign") return;
    if (!players || players.length < 3) {
      useGameStore.getState().toPhase("setup");
    }
  }, [phase, players]);

  const currentName = useMemo(
    () => players?.[idx] ?? `Jogador ${idx + 1}`,
    [players, idx]
  );

  const isImpostor = useMemo(
    () => round?.impostorIndex === idx,
    [round?.impostorIndex, idx]
  );

  const revealText = useMemo(() => {
    const normal = mode === "normal";
    if (isImpostor) {
      if (normal) return round?.impostorWord ?? "IMPOSTOR";
      return "Boa sorte 😈"; // modo cego
    }
    return round?.realWord ?? "PALAVRA";
  }, [isImpostor, mode, round?.impostorWord, round?.realWord]);

  const subtitle = useMemo(() => {
    if (isImpostor) return mode === "normal" ? "És o impostor" : "Jogas no escuro";
    return "És do grupo";
  }, [isImpostor, mode]);

  // Visibilidade do cartão secreto
  const cardVisible = isHolding && (dragY <= -24 || holdTimerRef.current === -1);

  const vibrate = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };

  // Long-press
  const startHoldTimer = () => {
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      holdTimerRef.current = -1; // flag de hold
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
    const deltaY = e.clientY - centerY; // negativo quando arrasta para cima
    setDragY(deltaY);
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
    holdTimerRef.current = -1; // visível imediatamente
    vibrate(8);
  };
  const onTapHoldButtonUp = () => {
    setIsHolding(false);
    setHasRevealed(true);
    setDragY(0);
    clearHoldTimer();
    vibrate(6);
  };

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="screen pt-2 text-center px-4">
        <p className="text-xs opacity-70">Fase</p>
        <h1 className="text-xl font-semibold tracking-tight">Atribuição Secreta</h1>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
          <span className="opacity-75">Agora:</span>
          <span className="font-semibold text-brand">{currentName}</span>
          <span className="opacity-60">vê se é impostor ou não</span>
        </div>
      </header>

      {/* Conteúdo distribuído com respiros */}
      <main className="screen flex-1 px-4 flex flex-col">
        {/* respiro topo */}
        <div className="flex-1" />

        {/* Cartão principal (bem opaco) */}
        <div className="mx-auto w-full max-w-[520px]">
          <div
            ref={surfaceRef}
            role="button"
            aria-label="Arrasta para cima e mantém para ver o teu papel"
            aria-live="polite"
            className="relative w-full h-[min(56vh,520px)] rounded-[28px] bg-slate-900/98 backdrop-blur-md border border-white/20 shadow-[0_28px_80px_-12px_rgba(0,0,0,0.70)] overflow-hidden touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Nome do jogador dentro do cartão */}
            <div className="absolute top-6 inset-x-0 text-center pointer-events-none">
              <div className="font-extrabold tracking-tight text-[clamp(22px,7.2vw,40px)]">
                {currentName}
              </div>
            </div>

            {/* Instruções (escondem quando o cartão é mostrado) */}
            {!cardVisible && (
              <motion.div
                className="absolute inset-0 grid place-items-center p-6"
                animate={{ y: Math.max(-12, Math.min(0, dragY * 0.15)) }}
                transition={{ type: "spring", stiffness: 250, damping: 24 }}
              >
                <div className="text-center space-y-3">
                  <p className="text-[13px] md:text-sm opacity-80">
                    <span className="opacity-70">Só</span>{" "}
                    <span className="font-semibold">{currentName}</span>{" "}
                    <span className="opacity-70">deve ver agora</span>
                  </p>
                  <p className="text-[13px] md:text-sm opacity-80">
                    Arrasta para cima e mantém
                  </p>
                  <p className="text-xs opacity-60">ou usa “Tocar &amp; Manter” abaixo</p>
                  <div className="mt-2 flex items-center justify-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cartão secreto (muito opaco e contrastado) */}
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
                    className={`mx-5 w-full rounded-2xl border px-5 py-6 text-center shadow-xl
                      ${isImpostor
                        ? "bg-rose-600/90 border-rose-300/50"
                        : "bg-emerald-600/90 border-emerald-300/50"
                      } text-white`}
                  >
                    <p className="text-[11px] uppercase tracking-widest/ wide">
                      Para: <span className="font-semibold">{currentName}</span>
                    </p>
                    <p className="mt-1 text-xs/relaxed opacity-90">O teu papel</p>
                    <p className="mt-1 text-[13px] opacity-95">{subtitle}</p>
                    <p className="mt-4 text-[clamp(28px,8.2vw,40px)] font-bold break-words leading-tight">
                      {revealText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Máscara de revelação bem densa */}
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
              style={{ transformOrigin: "bottom" }}
              animate={{ scaleY: Math.max(0, Math.min(1, 1 - Math.max(0, -dragY) / 200)) }}
            />

            {/* Aviso anti-batota */}
            <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center">
              <p className="text-[11px] text-center opacity-70">
                ⚠️ Jogo justo: sem espreitar, sem screenshots.
              </p>
            </div>
          </div>
        </div>

        {/* Botão alternativo: Tocar & Manter (logo abaixo do cartão) */}
        <div className="mt-4 mb-6 flex items-center justify-center">
          <button
            className="px-4 py-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 active:scale-[0.98] transition text-sm"
            aria-label="Tocar e manter para ver o teu papel"
            onPointerDown={onTapHoldButtonDown}
            onPointerUp={onTapHoldButtonUp}
            onPointerCancel={onTapHoldButtonUp}
          >
            Tocar &amp; Manter
          </button>
        </div>

        {/* respiro antes da bottom bar */}
        <div className="flex-1" />
      </main>

      {/* Bottom bar */}
      <div className="bottom-bar">
        <div className="bottom-inner">
          <button
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            aria-disabled={!hasRevealed}
            disabled={!hasRevealed}
            onClick={onContinue}
          >
            {idx < (players?.length ?? 0) - 1 ? "Continuar" : "Começar ronda"}
          </button>
          <p className="mt-2 text-center text-[11px] opacity-50">
            Nada fica visível quando largas o ecrã.
          </p>
        </div>
      </div>
    </div>
  );
}
