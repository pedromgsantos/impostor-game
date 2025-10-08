// src/views/Setup.tsx
import { useMemo } from "react";
import { useGameStore } from "@/store/game";

const TIMER_STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240] as const;

function labelTime(s: number) {
  if (s === 0) return "Sem temporizador";
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

  const canPlay = useMemo(
    () => room.players.filter((p) => p.trim()).length >= 3,
    [room.players]
  );

  const onAddPlayer = () => {
    const next = `Jogador ${room.players.length + 1}`;
    setRoom({ players: [...room.players, next] });
  };

  const onRemove = (i: number) => {
    setRoom({ players: room.players.filter((_, j) => j !== i) });
  };

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="screen pt-4">
        <h1 className="app-title">Impostor Game</h1>
        <p className="mt-1 text-sm opacity-60">
          Configura a sala e começa a jogar no telemóvel. 🎉
        </p>
      </header>

      {/* Conteúdo */}
      <main className="screen flex-1 pb-28 pt-4 space-y-4">
        {/* Jogadores */}
        <section className="card p-4">
          <div className="section-title">Jogadores</div>

          <div className="space-y-2">
            {room.players.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
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
                  className="icon-btn"
                  aria-label={`Remover ${p || `Jogador ${i + 1}`}`}
                  onClick={() => onRemove(i)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button className="btn-secondary w-full" onClick={onAddPlayer}>
              + Adicionar
            </button>
          </div>
        </section>

        {/* Modo e Tema */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="section-title">Modo</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`btn w-full ${
                  room.mode === "normal"
                    ? "border border-brand/50 bg-brand/10"
                    : "btn-secondary"
                }`}
                aria-pressed={room.mode === "normal"}
                onClick={() => setRoom({ mode: "normal" })}
              >
                Normal
              </button>
              <button
                className={`btn w-full ${
                  room.mode === "cego"
                    ? "border border-brand/50 bg-brand/10"
                    : "btn-secondary"
                }`}
                aria-pressed={room.mode === "cego"}
                onClick={() => setRoom({ mode: "cego" })}
              >
                Cego
              </button>
            </div>
            <p className="mt-2 text-[11px] opacity-60">
              No modo <span className="font-medium">Cego</span>, o impostor não
              vê nenhuma palavra e <span className="font-medium">nunca</span>{" "}
              começa a falar.
            </p>
          </div>

          <div className="card p-4">
            <div className="section-title">Tema</div>
            <select
              className="select"
              value={room.theme}
              onChange={(e) => setRoom({ theme: e.target.value })}
            >
              <option value="classic">Classic</option>
              <option value="celebrities">Celebrities</option>
              <option value="spicy">Spicy (+18)</option>
              <option value="food">Food</option>
            </select>

            <p className="mt-2 text-[11px] opacity-60">
              O jogo evita repetir palavras no mesmo tema até esgotar.
            </p>
          </div>
        </section>

        {/* Temporizador */}
        <section className="card p-4">
          <div className="section-title">Tempo por ronda</div>
          <div className="flex items-center gap-2">
            <select
              className="select"
              value={room.timerSec}
              onChange={(e) => setRoom({ timerSec: Number(e.target.value) })}
            >
              {TIMER_STEPS.map((s) => (
                <option key={s} value={s}>
                  {labelTime(s)}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-[11px] opacity-60">
            0 desactiva o temporizador.
          </p>
        </section>
      </main>

      {/* CTA fixo */}
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
          {!canPlay && (
            <p className="mt-2 text-center text-[11px] opacity-60">
              São necessários pelo menos 3 jogadores.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
