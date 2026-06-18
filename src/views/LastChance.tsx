import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
import { playerEmoji } from "@/utils/playerEmoji";

type Step = "warning" | "input" | "reveal";

export default function LastChance() {
  const round             = useGameStore((s) => s.round);
  const players           = useGameStore((s) => s.room.players);
  const resolveLastChance = useGameStore((s) => s.resolveLastChance);

  const [step, setStep]   = useState<Step>("warning");
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState<boolean | null>(null);

  const accusedIdx  = round?.chosenSuspect ?? 0;
  const accusedName = players?.[accusedIdx] ?? `Jogador ${accusedIdx + 1}`;

  const onSubmit = () => {
    if (!guess.trim()) return;
    const norm = (s: string) =>
      s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const isCorrect = norm(guess) === norm(round?.realWord ?? "");
    setCorrect(isCorrect);
    setStep("reveal");
    setTimeout(() => resolveLastChance(guess), 2000);
  };

  return (
    <div className="app-container">
      <main className="screen flex-1 px-4 flex flex-col items-center justify-center gap-6 py-10">

        <AnimatePresence mode="wait">

          {step === "warning" && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-sm text-center"
            >
              <div className="text-6xl mb-5">🙈</div>
              <h1 className="text-2xl font-bold tracking-tight">Última Chance</h1>
              <p className="mt-2 text-sm text-white/45 max-w-xs mx-auto">
                Outros jogadores, não espreitem! O impostor vai tentar adivinhar a palavra secreta.
              </p>

              <div className="mt-8 card px-5 py-5 flex flex-col items-center gap-2">
                <div className="text-4xl">{playerEmoji(accusedIdx)}</div>
                <p className="font-bold text-lg">{accusedName}</p>
                <p className="text-xs text-white/40 mt-1">Apanhado em flagrante — mas ainda há esperança 😈</p>
              </div>

              <button
                className="btn-primary w-full mt-6"
                onClick={() => setStep("input")}
              >
                Estou pronto
              </button>
            </motion.div>
          )}

          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🤫</div>
                <h2 className="text-xl font-bold">Qual era a palavra?</h2>
                <p className="mt-1.5 text-sm text-white/40">
                  Escreve a tua resposta sem que ninguém veja.
                </p>
              </div>

              <div className="card px-4 py-3 flex items-center gap-3">
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-white text-[16px] font-semibold outline-none placeholder-white/20"
                  placeholder="a tua resposta..."
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <button
                className={`btn-primary w-full mt-4 ${!guess.trim() ? "opacity-30 cursor-not-allowed" : ""}`}
                disabled={!guess.trim()}
                onClick={onSubmit}
              >
                Revelar resposta
              </button>
            </motion.div>
          )}

          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="w-full max-w-sm text-center"
            >
              <motion.div
                className="text-7xl mb-5"
                animate={{ rotate: [0, -12, 12, -6, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {correct ? "🎭" : "🕵️"}
              </motion.div>

              <h2 className={`text-3xl font-black ${correct ? "text-rose-400" : "text-emerald-400"}`}>
                {correct ? "Correto!" : "Errado!"}
              </h2>
              <p className="mt-2 text-sm text-white/45">
                {correct
                  ? "O impostor adivinhou a palavra. Impostor vence!"
                  : "A resposta estava errada. O grupo vence!"}
              </p>

              <div className="mt-6 card px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-white/40">Palavra real</span>
                <span className="text-sm font-bold">{round?.realWord ?? "—"}</span>
              </div>

              <p className="mt-5 text-xs text-white/25">A revelar resultado...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
