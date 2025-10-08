import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/views/Vote.tsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
/**
 * Vote.tsx — Votação (mobile-first)
 * - Cartões grandes e tocáveis (44px+)
 * - Destaque claro do selecionado (ring + chip)
 * - Modal de confirmação com animação
 * - Overlay de “suspense” antes do resultado
 */
export default function Vote() {
    const toPhase = useGameStore((s) => s.toPhase);
    const players = useGameStore((s) => s.room.players);
    const round = useGameStore((s) => s.round);
    const voteSuspect = useGameStore((s) => s.voteSuspect);
    const [selected, setSelected] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [revealing, setRevealing] = useState(false);
    // Guarda: se não houver ronda válida, volta ao setup
    useEffect(() => {
        if (!round || !players || players.length < 3) {
            toPhase("setup");
        }
    }, [round, players, toPhase]);
    const canConfirm = useMemo(() => selected !== null, [selected]);
    const vibrate = (ms = 10) => { try {
        navigator.vibrate?.(ms);
    }
    catch { } };
    const onConfirm = () => {
        if (selected === null)
            return;
        setConfirmOpen(false);
        setRevealing(true);
        vibrate(15);
        window.setTimeout(() => {
            voteSuspect(selected); // store muda para 'result'
        }, 1100);
    };
    return (_jsxs("div", { className: "app-container", children: [_jsxs("header", { className: "screen pt-3 text-center px-4", children: [_jsx("p", { className: "text-xs opacity-70", children: "Fase" }), _jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Vota\u00E7\u00E3o" }), _jsx("p", { className: "mt-1 text-xs opacity-60", children: "Escolham 1 suspeito e confirmem." })] }), _jsx("main", { className: "screen flex-1 px-4 py-3", children: _jsx("div", { role: "radiogroup", "aria-label": "Lista de suspeitos", className: "max-w-md mx-auto space-y-3", children: players?.map((name, i) => {
                        const isSelected = selected === i;
                        return (_jsx("button", { role: "radio", "aria-checked": isSelected, onClick: () => { setSelected(i); vibrate(5); }, className: `w-full text-left rounded-2xl border transition shadow-sm
                  px-4 py-4 active:scale-[0.99]
                  ${isSelected
                                ? "border-amber-400/50 ring-2 ring-amber-400/60 bg-white/5"
                                : "border-white/10 bg-white/5 hover:bg-white/8"}`, children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: `grid place-items-center w-9 h-9 rounded-full
                        ${isSelected ? "bg-amber-500" : "bg-white/10"} text-white text-sm font-bold`, children: name?.[0]?.toUpperCase() ?? "?" }), _jsx("span", { className: "font-semibold truncate", children: name })] }), _jsx("span", { className: `text-[11px] px-2 py-1 rounded-full border
                      ${isSelected
                                            ? "border-amber-400/60 bg-amber-400/10"
                                            : "border-white/10 bg-white/5 opacity-70"}`, children: isSelected ? "Selecionado" : "Suspeito" })] }) }, i));
                    }) }) }), _jsx("div", { className: "bottom-bar", children: _jsx("div", { className: "bottom-inner max-w-md mx-auto w-full", children: _jsx("button", { className: "btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed", disabled: !canConfirm, onClick: () => setConfirmOpen(true), children: "Confirmar suspeito" }) }) }), _jsx(AnimatePresence, { children: confirmOpen && (_jsxs(motion.div, { className: "fixed inset-0 z-50 grid place-items-center p-4", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: () => setConfirmOpen(false) }), _jsxs(motion.div, { initial: { y: 22, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 12, opacity: 0 }, transition: { type: "spring", stiffness: 300, damping: 24 }, className: "relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Confirmar suspeito?" }), _jsxs("p", { className: "text-sm opacity-80 mt-2", children: ["Tens a certeza que querem acusar", " ", _jsx("span", { className: "font-semibold", children: selected !== null ? players[selected] : "—" }), "?"] }), _jsxs("div", { className: "mt-5 flex items-center justify-end gap-2", children: [_jsx("button", { className: "px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm", onClick: () => setConfirmOpen(false), children: "Voltar" }), _jsx("button", { className: "px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 font-semibold text-sm", onClick: onConfirm, children: "Avan\u00E7ar" })] })] })] })) }), _jsx(AnimatePresence, { children: revealing && (_jsx(motion.div, { className: "fixed inset-0 z-50 grid place-items-center bg-black", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm opacity-70 mb-2", children: "A revelar..." }), _jsx("div", { className: "text-3xl font-bold tracking-wider", children: "\uD83E\uDD2B" }), _jsxs("div", { className: "mt-3 flex items-center justify-center gap-2 opacity-70", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white animate-pulse" }), _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse [animation-delay:120ms]" }), _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse [animation-delay:240ms]" })] })] }) })) })] }));
}
