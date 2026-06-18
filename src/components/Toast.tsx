import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game";

const ICONS: Record<string, string> = { warning: "⚠️", success: "✅", info: "ℹ️" };
const COLORS: Record<string, string> = {
  warning: "border-amber-400/40 bg-amber-400/15 text-amber-200",
  success: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  info:    "border-white/20 bg-white/10 text-white/80",
};

const AUTO_DISMISS_MS = 3500;

export default function Toast() {
  const toast      = useGameStore((s) => s.toast);
  const clearToast = useGameStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast?.id, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          onClick={clearToast}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60]
            flex items-center gap-2 px-4 py-2.5 rounded-full border
            text-sm font-medium shadow-xl backdrop-blur-sm cursor-pointer
            max-w-[calc(100vw-2rem)] whitespace-nowrap
            ${COLORS[toast.type]}`}
          style={{ marginTop: "env(safe-area-inset-top)" }}
        >
          <span>{ICONS[toast.type]}</span>
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
