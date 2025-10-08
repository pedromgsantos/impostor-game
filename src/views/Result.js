import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/views/Result.tsx
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game"; // se não usares alias "@", troca para: "../../store/game"
import { resetTheme } from "@/services/wordManager"; // ou "../../services/wordManager"
export default function Result() {
    const toPhase = useGameStore((s) => s.toPhase);
    const players = useGameStore((s) => s.room.players);
    const mode = useGameStore((s) => s.room.mode);
    const theme = useGameStore((s) => s.room.theme);
    const round = useGameStore((s) => s.round);
    const startGame = useGameStore((s) => s.startGame);
    const reset = useGameStore((s) => s.reset);
    const setRoom = useGameStore((s) => s.setRoom);
    // Guarda: se não houver ronda válida, volta ao setup
    useEffect(() => {
        if (!round || !players || players.length < 3) {
            toPhase("setup");
        }
    }, [round, players, toPhase]);
    const impostorName = useMemo(() => (round ? players[round.impostorIndex] : "—"), [players, round]);
    const groupWon = round?.winner === "group";
    const onPlayAgain = () => {
        startGame(); // mesma sala, novas palavras → vai para 'assign'
    };
    const onNewRoom = () => {
        reset(); // volta a 'setup'
        setRoom({ players: [] }); // limpa jogadores (nova sala)
    };
    const onResetHistory = async () => {
        const ok = confirm(`Repor histórico do tema "${theme}"?`);
        if (!ok)
            return;
        await resetTheme(theme);
        alert(`Histórico do tema "${theme}" reposto.`);
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-950 via-black to-black text-white flex flex-col px-safe pt-safe pb-safe", children: [_jsxs("header", { className: "px-4 pt-4 text-center", children: [_jsx("p", { className: "text-sm opacity-70", children: "Fase" }), _jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Resultado" })] }), _jsxs("main", { className: "flex-1 px-4 py-6 flex flex-col items-center", children: [_jsxs(motion.div, { initial: { y: 16, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { type: "spring", stiffness: 300, damping: 26 }, className: "w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-xl", children: [_jsx("p", { className: "text-sm uppercase tracking-widest opacity-70", children: "Vencedor" }), _jsx("h2", { className: `mt-1 text-2xl font-bold ${groupWon ? "text-emerald-300" : "text-rose-300"}`, children: groupWon ? "Grupo venceu 🎉" : "Impostor venceu 😈" }), _jsxs("div", { className: "mt-5 text-left space-y-2", children: [_jsxs("p", { children: [_jsx("span", { className: "opacity-70", children: "Impostor:" }), " ", _jsx("span", { className: "font-semibold", children: impostorName })] }), _jsxs("p", { children: [_jsx("span", { className: "opacity-70", children: "Palavra real:" }), " ", _jsx("span", { className: "font-semibold", children: round?.realWord ?? "—" })] }), _jsxs("p", { children: [_jsx("span", { className: "opacity-70", children: mode === "normal" ? "Palavra do impostor:" : "Modo cego:" }), " ", _jsx("span", { className: "font-semibold", children: mode === "normal"
                                                    ? (round?.impostorWord ?? "—")
                                                    : "Impostor jogou no escuro" })] })] })] }), _jsx("p", { className: "mt-4 text-[11px] opacity-60 text-center max-w-sm", children: "Podes jogar novamente com a mesma sala ou criar uma nova sala." })] }), _jsxs("footer", { className: "px-4 pb-5 pt-3 flex flex-col gap-2 max-w-md mx-auto w-full", children: [_jsx("button", { className: "w-full py-3 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] transition shadow-lg", onClick: onPlayAgain, children: "Jogar novamente" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "flex-1 py-3 rounded-2xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition", onClick: onNewRoom, children: "Nova sala" }), _jsx("button", { className: "flex-1 py-3 rounded-2xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition", onClick: onResetHistory, children: "Repor hist\u00F3rico" })] })] })] }));
}
