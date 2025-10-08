import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/views/Setup.tsx
import { useMemo } from "react";
import { useGameStore } from "@/store/game";
const TIMER_STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240];
function labelTime(s) {
    if (s === 0)
        return "Sem temporizador";
    const m = Math.floor(s / 60)
        .toString()
        .padStart(1, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
}
export default function Setup() {
    const room = useGameStore((s) => s.room);
    const setRoom = useGameStore((s) => s.setRoom);
    const startGame = useGameStore((s) => s.startGame);
    const canPlay = useMemo(() => room.players.filter((p) => p.trim()).length >= 3, [room.players]);
    const onAddPlayer = () => {
        const next = `Jogador ${room.players.length + 1}`;
        setRoom({ players: [...room.players, next] });
    };
    const onRemove = (i) => {
        setRoom({ players: room.players.filter((_, j) => j !== i) });
    };
    return (_jsxs("div", { className: "app-container", children: [_jsxs("header", { className: "screen pt-4", children: [_jsx("h1", { className: "app-title", children: "Impostor Game" }), _jsx("p", { className: "mt-1 text-sm opacity-60", children: "Configura a sala e come\u00E7a a jogar no telem\u00F3vel. \uD83C\uDF89" })] }), _jsxs("main", { className: "screen flex-1 pb-28 pt-4 space-y-4", children: [_jsxs("section", { className: "card p-4", children: [_jsx("div", { className: "section-title", children: "Jogadores" }), _jsxs("div", { className: "space-y-2", children: [room.players.map((p, i) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { className: "input flex-1", value: p, inputMode: "text", autoComplete: "off", onChange: (e) => {
                                                    const arr = [...room.players];
                                                    arr[i] = e.target.value;
                                                    setRoom({ players: arr });
                                                } }), _jsx("button", { className: "icon-btn", "aria-label": `Remover ${p || `Jogador ${i + 1}`}`, onClick: () => onRemove(i), children: "\u2715" })] }, i))), _jsx("button", { className: "btn-secondary w-full", onClick: onAddPlayer, children: "+ Adicionar" })] })] }), _jsxs("section", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "card p-4", children: [_jsx("div", { className: "section-title", children: "Modo" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { className: `btn w-full ${room.mode === "normal"
                                                    ? "border border-brand/50 bg-brand/10"
                                                    : "btn-secondary"}`, "aria-pressed": room.mode === "normal", onClick: () => setRoom({ mode: "normal" }), children: "Normal" }), _jsx("button", { className: `btn w-full ${room.mode === "cego"
                                                    ? "border border-brand/50 bg-brand/10"
                                                    : "btn-secondary"}`, "aria-pressed": room.mode === "cego", onClick: () => setRoom({ mode: "cego" }), children: "Cego" })] }), _jsxs("p", { className: "mt-2 text-[11px] opacity-60", children: ["No modo ", _jsx("span", { className: "font-medium", children: "Cego" }), ", o impostor n\u00E3o v\u00EA nenhuma palavra e ", _jsx("span", { className: "font-medium", children: "nunca" }), " ", "come\u00E7a a falar."] })] }), _jsxs("div", { className: "card p-4", children: [_jsx("div", { className: "section-title", children: "Tema" }), _jsxs("select", { className: "select", value: room.theme, onChange: (e) => setRoom({ theme: e.target.value }), children: [_jsx("option", { value: "classic", children: "Classic" }), _jsx("option", { value: "celebrities", children: "Celebrities" }), _jsx("option", { value: "spicy", children: "Spicy (+18)" }), _jsx("option", { value: "food", children: "Food" })] }), _jsx("p", { className: "mt-2 text-[11px] opacity-60", children: "O jogo evita repetir palavras no mesmo tema at\u00E9 esgotar." })] })] }), _jsxs("section", { className: "card p-4", children: [_jsx("div", { className: "section-title", children: "Tempo por ronda" }), _jsx("div", { className: "flex items-center gap-2", children: _jsx("select", { className: "select", value: room.timerSec, onChange: (e) => setRoom({ timerSec: Number(e.target.value) }), children: TIMER_STEPS.map((s) => (_jsx("option", { value: s, children: labelTime(s) }, s))) }) }), _jsx("p", { className: "mt-2 text-[11px] opacity-60", children: "0 desactiva o temporizador." })] })] }), _jsx("div", { className: "bottom-bar", children: _jsxs("div", { className: "bottom-inner", children: [_jsx("button", { className: "btn-primary w-full", disabled: !canPlay, "aria-disabled": !canPlay, onClick: startGame, children: "Jogar" }), !canPlay && (_jsx("p", { className: "mt-2 text-center text-[11px] opacity-60", children: "S\u00E3o necess\u00E1rios pelo menos 3 jogadores." }))] }) })] }));
}
