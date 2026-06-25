import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";
import { useT } from "@/i18n";
import { playerEmoji } from "@/utils/playerEmoji";
import type { Lang } from "@/i18n";

const TIMER_STEPS = [0, 30, 60, 90, 120, 150, 180, 210, 240] as const;

function ToggleRow({
  label, description, checked, onChange, disabled = false,
}: {
  label: string; description: string;
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full flex items-center justify-between gap-4 card px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.98]
        ${disabled ? "opacity-35 cursor-not-allowed" : "hover:bg-white/[0.06]"}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white leading-tight">{label}</p>
        <p className="text-[11px] text-white/38 mt-0.5 leading-snug">{description}</p>
      </div>
      <div className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${checked && !disabled ? "bg-brand" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked && !disabled ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </button>
  );
}

const THEMES = [
  { id: "classic",     emoji: "🌍" },
  { id: "celebrities", emoji: "⭐" },
  { id: "food",        emoji: "🍕" },
  { id: "royale",      emoji: "👑" },
] as const;

const LANGS: { id: Lang; flag: string; label: string }[] = [
  { id: "pt", flag: "🇵🇹", label: "PT" },
  { id: "en", flag: "🇬🇧", label: "EN" },
];

function labelTime(s: number) {
  if (s === 0) return "∞";
  const m   = Math.floor(s / 60).toString();
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function Setup() {
  const room      = useGameStore((s) => s.room);
  const setRoom   = useGameStore((s) => s.setRoom);
  const startGame = useGameStore((s) => s.startGame);
  const lang      = useGameStore((s) => s.lang);
  const setLang   = useGameStore((s) => s.setLang);
  const t         = useT();

  const isRoyale = room.theme === "royale";

  const canPlay = useMemo(
    () => room.players.filter((p) => p.trim()).length >= 3,
    [room.players]
  );

  const onAddPlayer = () => {
    setRoom({ players: [...room.players, t("common.playerFallback", { n: room.players.length + 1 })] });
  };

  const onRemove = (i: number) => {
    setRoom({ players: room.players.filter((_, j) => j !== i) });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <motion.header
        className="screen pt-6 pb-2 text-center relative"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <div className="absolute right-0 top-6 flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-0.5" aria-label={t("setup.language")}>
          {LANGS.map((l) => {
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                aria-pressed={active}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors duration-200
                  ${active ? "bg-brand text-white" : "text-white/40 hover:text-white/70"}`}
              >
                <span className="text-sm leading-none">{l.flag}</span>
                {l.label}
              </button>
            );
          })}
        </div>
        <motion.div
          className="text-5xl mb-3 inline-block"
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
        >
          🕵️
        </motion.div>
        <h1 className="app-title">Impostor Game</h1>
        <p className="mt-1.5 text-sm text-white/40">
          {t("app.tagline")}
        </p>
      </motion.header>

      <main className="screen flex-1 min-h-0 pb-32 pt-4 space-y-5 overflow-y-auto scrollbar-none">

        {/* Jogadores */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.28 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="section-title mb-0">{t("setup.players")}</span>
              {room.players.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/20 text-brand text-[10px] font-bold">
                  {room.players.length}
                </span>
              )}
            </div>
            {room.players.length > 0 && (
              <button
                className="text-[11px] text-white/30 hover:text-rose-400 transition-colors"
                onClick={() => setRoom({ players: [] })}
              >
                {t("setup.clear")}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {room.players.map((p, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, scale: 0.93, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.91, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex items-center gap-3 card px-3 py-2.5"
                >
                  <span className="text-2xl shrink-0">{playerEmoji(i)}</span>
                  <input
                    className="flex-1 bg-transparent text-white text-[15px] font-medium outline-none placeholder-white/20"
                    value={p}
                    inputMode="text"
                    autoComplete="off"
                    placeholder={t("setup.playerPlaceholder", { n: i + 1 })}
                    onChange={(e) => {
                      const arr = [...room.players];
                      arr[i] = e.target.value;
                      setRoom({ players: arr });
                    }}
                  />
                  <button
                    className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/35 transition-all duration-150 text-xs flex items-center justify-center"
                    aria-label={t("setup.removePlayer", { n: i + 1 })}
                    onClick={() => onRemove(i)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              className="w-full py-3 rounded-2xl border border-dashed border-white/12 hover:border-brand/30 text-white/35 hover:text-white/65 text-sm font-medium transition-all duration-200 hover:bg-white/[0.03]"
              onClick={onAddPlayer}
            >
              {t("setup.addPlayer")}
            </button>
          </div>
        </motion.section>

        {/* Tema */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11, duration: 0.28 }}
        >
          <div className="section-title">{t("setup.theme")}</div>
          <div className="grid grid-cols-2 gap-2.5">
            {THEMES.map((theme) => {
              const active = room.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() =>
                    setRoom(
                      theme.id === "royale"
                        ? { theme: "royale", mode: "cego" }
                        : { theme: theme.id }
                    )
                  }
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border py-4 transition-all duration-200 active:scale-[0.96]
                    ${active
                      ? "border-brand/40 bg-brand/[0.09] shadow-[0_0_28px_rgba(239,68,68,0.14)]"
                      : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]"
                    }`}
                >
                  <span className="text-3xl leading-none">{theme.emoji}</span>
                  <span className={`text-[13px] font-semibold ${active ? "text-brand" : "text-white/50"}`}>
                    {t(`setup.theme.${theme.id}`)}
                  </span>
                  {active && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>
          {isRoyale && (
            <p className="mt-2 text-[11px] text-amber-300/65 px-0.5">
              {t("setup.royaleNote")}
            </p>
          )}
        </motion.section>

        {/* Modo */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.28 }}
        >
          <div className="section-title">{t("setup.mode")}</div>
          <div className="grid grid-cols-2 gap-2">
            {(["normal", "cego"] as const).map((m) => {
              const active = room.mode === m;
              const locked = isRoyale && m === "normal";
              return (
                <button
                  key={m}
                  disabled={locked}
                  onClick={() => { if (!locked) setRoom({ mode: m }); }}
                  className={`py-3.5 rounded-2xl border text-sm font-semibold transition-all duration-200 active:scale-[0.96]
                    ${active
                      ? "border-brand/40 bg-brand/[0.09] text-white shadow-[0_0_18px_rgba(239,68,68,0.10)]"
                      : "border-white/[0.08] bg-white/[0.04] text-white/45 hover:bg-white/[0.07]"
                    }
                    ${locked ? "opacity-25 cursor-not-allowed" : ""}`}
                >
                  {m === "normal" ? t("setup.mode.normal") : t("setup.mode.cego")}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-white/30 px-0.5">
            {room.mode === "cego"
              ? t("setup.mode.cegoDesc")
              : t("setup.mode.normalDesc")}
          </p>
        </motion.section>

        {/* Extras */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17, duration: 0.28 }}
        >
          <div className="section-title">{t("setup.extras")}</div>
          <div className="space-y-2">
            <ToggleRow
              label={t("setup.lastChance")}
              description={t("setup.lastChanceDesc")}
              checked={room.lastChance}
              onChange={(v) => setRoom({ lastChance: v })}
            />
            <ToggleRow
              label={t("setup.twoImpostors")}
              description={room.players.length < 5 ? t("setup.twoImpostorsNeed") : t("setup.twoImpostorsDesc")}
              checked={room.twoImpostors}
              onChange={(v) => setRoom({ twoImpostors: v })}
              disabled={room.players.length < 5}
            />
          </div>
        </motion.section>

        {/* Temporizador */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.20, duration: 0.28 }}
        >
          <div className="section-title">{t("setup.timer")}</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {TIMER_STEPS.map((s) => {
              const active = room.timerSec === s;
              return (
                <button
                  key={s}
                  onClick={() => setRoom({ timerSec: s })}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95
                    ${active
                      ? "bg-brand text-white shadow-[0_4px_16px_rgba(239,68,68,0.40)]"
                      : "border border-white/[0.09] bg-white/[0.05] text-white/50 hover:bg-white/[0.09]"
                    }`}
                >
                  {labelTime(s)}
                </button>
              );
            })}
          </div>
        </motion.section>

      </main>

      <div className="bottom-bar">
        <div className="bottom-inner">
          <motion.button
            className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-colors duration-300
              ${canPlay
                ? "bg-brand text-white"
                : "bg-white/[0.05] text-white/25 cursor-not-allowed border border-white/[0.07]"
              }`}
            animate={canPlay ? {
              boxShadow: [
                "0 6px 24px rgba(239,68,68,0.35)",
                "0 8px 36px rgba(239,68,68,0.58)",
                "0 6px 24px rgba(239,68,68,0.35)",
              ],
            } : { boxShadow: "none" }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            disabled={!canPlay}
            onClick={startGame}
          >
            {canPlay ? t("setup.start") : t("setup.needPlayers")}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
