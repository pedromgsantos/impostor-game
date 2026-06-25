import { useGameStore } from "@/store/game";
import {
  translate,
  translations,
  type Lang,
  type TranslationKey,
  type TVars,
} from "./translations";

export { translate, translations };
export type { Lang, TranslationKey, TVars };

export type TFunction = (key: TranslationKey, vars?: TVars) => string;

// React hook: returns a `t` bound to the current language and re-renders on change.
export function useT(): TFunction {
  const lang = useGameStore((s) => s.lang);
  return (key, vars) => translate(lang, key, vars);
}
