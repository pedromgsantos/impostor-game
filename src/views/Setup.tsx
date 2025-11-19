import { useMemo } from "react";
import { useGameStore } from "@/store/game";

const TIMER_STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240] as const;

// formata o tempo do temporizador
function labelTime(s: number) {
  if (s === 0) return "Sem temporizador";
  const m = Math.floor(s / 60).toString();
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ecrã de configuração
export default function Setup() {
  const room = useGameStore((s) => s.room);
  const setRoom = useGameStore((s) => s.setRoom);
  const startGame = useGameStore((s) => s.startGame);

  const isRoyale = room.theme === "royale";

  // verifica nº de jogadores válidos
  const canPlay = useMemo(
    () => room.players.filter((p) => p.trim()).length >= 3,
    [room.players]
  );

  // adiciona um jogador com nome genérico
  const onAddPlayer = () => {
    const next = `Jogador ${room.players.length + 1}`;
    setRoom({ players: [...room.players, next] });
  };

  // remove jogador pelo índice
  const onRemove = (i: number) => {
    setRoom({ players: room.players.filter((_, j) => j !== i) });
  };

  return (
    <div className="app-container">
      {/* cabeçalho */}
      <header className="screen pt-4">
        <h1 className="app-title">Impostor Game</h1>
        <p className="mt-1 text-sm opacity-60">
          Configura a sala e começa a jogar no telemóvel. 🎉
        </p>
      </header>

      {/* conteúdo */}
      <main className="screen flex-1 pb-28 pt-4 space-y-4">
        {/* bloco jogadores */}
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

        {/* modo e tema */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* modo de jogo */}
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
                disabled={isRoyale}
                aria-disabled={isRoyale}
                onClick={() => {
                  // tema royale não suporta modo normal
                  if (isRoyale) return;
                  setRoom({ mode: "normal" });
                }}
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
              No modo Cego, o impostor não vê nenhuma palavra e nunca começa a
              falar.
            </p>

            {isRoyale && (
              <p className="mt-1 text-[11px] text-amber-300/90">
                O tema Royale só funciona em modo Cego.
              </p>
            )}
          </div>

          {/* seleção de tema */}
          <div className="card p-4">
            <div className="section-title">Tema</div>

            <select
              className="select"
              value={room.theme}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "royale") {
                  // ao escolher Royale, forçamos logo modo Cego
                  setRoom({ theme: "royale", mode: "cego" });
                } else {
                  setRoom({ theme: value });
                }
              }}
            >
              <option value="classic">Classic</option>
              <option value="celebrities">Celebrities</option>
              <option value="royale">Royale Heheheha</option>
              <option value="food">Food</option>
            </select>

            <p className="mt-2 text-[11px] opacity-60">
              O jogo evita repetir palavras no mesmo tema até esgotar.
            </p>
          </div>
        </section>

        {/* temporizador */}
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

      {/* botão jogar */}
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
