import { useGameStore } from "./store/game"; // troca para "@/store/game" se usares alias
import Setup from "./views/Setup";
import Assign from "./views/Assign";
import Round from "./views/Round";
import Vote from "./views/Vote";
import Result from "./views/Result";

export default function App() {
  const phase = useGameStore((s) => s.ui.phase);
  return (
    <>
      {phase === "setup"  && <Setup />}
      {phase === "assign" && <Assign />}
      {phase === "round"  && <Round />}
      {phase === "vote"   && <Vote />}
      {phase === "result" && <Result />}
    </>
  );
}
