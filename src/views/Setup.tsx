import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

const TIMER_STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240] as const;

function labelTime(s: number) {
  if (s === 0) return "Sem temporizador";
  const m   = Math.floor(s / 60).toString();
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

const sectionVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: "easeOut" as const },
  }),
};

export default function Setup() {
  const room      = useGameStore((s) => s.room);
  const setRoom   = useGameStore((s) => s.setRoom);
  const startGame = useGameStore((s) => s.startGame);

  const isRoyale = room.theme === "royale";

  const canPlay = useMemo(
    () => room.players.filter((p) => p.trim()).length >= 3,
    [room.players]
  );

  const onAddPlayer = () => {
    setRoom({ players: [...room.players, `Jogador ${room.players.length + 1}`] });
  };

  const onRemove = (i: number) => {
    setRoom({ players: room.players.filter((_, j) => j !== i) });
  };

  return (
    <div className="app-container">
      {/* cabeçalho */}
      <motion.header
        className="screen pt-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="app-title">Impostor Game</h1>
        <p className="mt-1 text-sm text-white/50">
          Configura a sala e começa a jogar.
        </p>
      </motion.header>

      <main className="screen flex-1 pb-28 pt-4 space-y-4">
        {/* jogadores */}
        <motion.section
          className="card p-4"
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="section-title">Jogadores</div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {room.players.map((p, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  {/* avatar inicial */}
                  <div className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-white/8 border border-white/10 text-sm font-bold text-white/70">
                    {p?.[0]?.toUpperCase() ?? (i + 1)}
                  </div>
                  <input
                    className="input flex-1"
                    value={p}
                    inputMode="text"
                    autoComplete="off"
                    onChange={(e) => {
                      const arr = [...room.players];
                      arr[i] = e.target.value;
                      setRoom({ players: arr });
                    }}
                  />
                  <button
                    className="icon-btn shrink-0 text-white/50 hover:text-white/80"
                    aria-label={`Remover ${p || `Jogador ${i + 1}`}`}
                    onClick={() => onRemove(i)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <button className="btn-secondary w-full mt-1" onClick={onAddPlayer}>
              + Adicionar jogador
            </button>
          </div>
        </motion.section>

        {/* modo e tema */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {/* modo */}
          <div className="card p-4">
            <div className="section-title">Modo</div>

            <div className="grid grid-cols-2 gap-2">
              {(["normal", "cego"] as const).map((m) => {
                const active = room.mode === m;
                return (
                  <button
                    key={m}
                    className={`btn w-full text-sm capitalize ${
                      active
                        ? "border border-brand/50 bg-brand/10 text-white"
                        : "btn-secondary text-white/70"
                    }`}
                    aria-pressed={active}
                    disabled={isRoyale && m === "normal"}
                    aria-disabled={isRoyale && m === "normal"}
                    onClick={() => {
                      if (isRoyale && m === "normal") return;
                      setRoom({ mode: m });
                    }}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px] text-white/45 leading-relaxed">
              No modo Cego o impostor não vê nenhuma palavra e nunca começa a falar.
            </p>

            {isRoyale && (
              <p className="mt-1.5 text-[11px] text-amber-300/80">
                O tema Royale só funciona em modo Cego.
              </p>
            )}
          </div>

          {/* tema */}
          <div className="card p-4">
            <div className="section-title">Tema</div>

            <select
              className="select"
              value={room.theme}
              onChange={(e) => {
                const value = e.target.value;
                setRoom(value === "royale"
                  ? { theme: "royale", mode: "cego" }
                  : { theme: value }
                );
              }}
            >
              <option value="classic">Classic</option>
              <option value="celebrities">Celebrities</option>
              <option value="food">Food</option>
              <option value="royale">Royale Heheheha</option>
            </select>

            <p className="mt-3 text-[11px] text-white/45">
              O jogo evita repetir palavras até esgotar todas.
            </p>
          </div>
        </motion.section>

        {/* temporizador */}
        <motion.section
          className="card p-4"
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="section-title">Tempo por ronda</div>

          <select
            className="select"
            value={room.timerSec}
            onChange={(e) => setRoom({ timerSec: Number(e.target.value) })}
          >
            {TIMER_STEPS.map((s) => (
              <option key={s} value={s}>{labelTime(s)}</option>
            ))}
          </select>

          <p className="mt-3 text-[11px] text-white/45">
            0 desactiva o temporizador.
          </p>
        </motion.section>
      </main>

      <div className="bottom-bar">
        <div className="bottom-inner">
          <button
            className="btn-primary w-full"
            disabled={!canPlay}
            aria-disabled={!canPlay}
            onClick={startGame}
          >
            Jogar
          </button>

          <AnimatePresence>
            {!canPlay && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 text-center text-[11px] text-white/45 overflow-hidden"
              >
                São necessários pelo menos 3 jogadores.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
