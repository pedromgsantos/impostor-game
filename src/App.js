import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from "./store/game"; // troca para "@/store/game" se usares alias
import Setup from "./views/Setup";
import Assign from "./views/Assign";
import Round from "./views/Round";
import Vote from "./views/Vote";
import Result from "./views/Result";
export default function App() {
    const phase = useGameStore((s) => s.ui.phase);
    return (_jsxs(_Fragment, { children: [phase === "setup" && _jsx(Setup, {}), phase === "assign" && _jsx(Assign, {}), phase === "round" && _jsx(Round, {}), phase === "vote" && _jsx(Vote, {}), phase === "result" && _jsx(Result, {})] }));
}
