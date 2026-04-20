import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "./store/game";
import Setup from "./views/Setup";
import Assign from "./views/Assign";
import Round from "./views/Round";
import Vote from "./views/Vote";
import Result from "./views/Result";

const PHASE_ORDER = ["setup", "assign", "round", "vote", "result"] as const;

const variants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 28, scale: 0.99 }),
  animate: { opacity: 1, x: 0, scale: 1 },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -18, scale: 0.99 }),
};

export default function App() {
  const phase   = useGameStore((s) => s.ui.phase);
  const prevRef = useRef(phase);

  const prevIdx  = PHASE_ORDER.indexOf(prevRef.current);
  const phaseIdx = PHASE_ORDER.indexOf(phase);
  const dir      = phaseIdx >= prevIdx ? 1 : -1;
  prevRef.current = phase;

  return (
    <AnimatePresence mode="wait" custom={dir}>
      <motion.div
        key={phase}
        custom={dir}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ height: "100%" }}
      >
        {phase === "setup"  && <Setup />}
        {phase === "assign" && <Assign />}
        {phase === "round"  && <Round />}
        {phase === "vote"   && <Vote />}
        {phase === "result" && <Result />}
      </motion.div>
    </AnimatePresence>
  );
}
