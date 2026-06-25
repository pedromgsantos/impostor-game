// src/services/wordManager.ts
import { get, set, del, keys } from "idb-keyval";
import type { Lang } from "@/i18n/translations";

type ThemePairs = { type: "pairs"; items: [string, string][] };
type ThemeSingle = { type: "single"; items: string[] };
export type ThemeFile = ThemePairs | ThemeSingle;

// Royale only ships an English/universal deck, so it ignores the language.
const LANG_AGNOSTIC_THEMES = new Set(["royale"]);

// Portuguese is the base file (`<theme>.json`); other languages use a suffix
// (`<theme>.<lang>.json`). Language-agnostic themes always use the base file.
function themeFileName(theme: string, lang: Lang): string {
  if (lang === "pt" || LANG_AGNOSTIC_THEMES.has(theme)) return theme;
  return `${theme}.${lang}`;
}

// History identity: PT and royale keep the legacy keys; other languages get
// their own bucket so switching language never mixes word indices.
function historyId(theme: string, lang: Lang): string {
  return themeFileName(theme, lang);
}

// cache em memória para não refazer fetch (por ficheiro)
const cache = new Map<string, ThemeFile>();

const usedKey = (histId: string, bucket: "pairs" | "single") =>
  `wg:used:${histId}:${bucket}`;

// carrega ficheiro de tema do /public/data
async function loadTheme(theme: string, lang: Lang): Promise<ThemeFile> {
  const fileName = themeFileName(theme, lang);
  if (cache.has(fileName)) return cache.get(fileName)!;

  const url = `${import.meta.env.BASE_URL}data/${fileName}.json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Não encontrei ${url} (HTTP ${res.status})`);
  }

  const json = await res.json();

  const file: ThemeFile = Array.isArray(json)
    ? { type: "single", items: json }
    : json;

  cache.set(fileName, file);
  return file;
}

async function getUsed(
  histId: string,
  bucket: "pairs" | "single"
): Promise<number[]> {
  return (await get<number[]>(usedKey(histId, bucket))) ?? [];
}

async function setUsed(
  histId: string,
  bucket: "pairs" | "single",
  arr: number[]
): Promise<void> {
  await set(usedKey(histId, bucket), Array.from(new Set(arr)));
}

// limpa histórico de um tema (no idioma indicado)
export async function resetTheme(theme: string, lang: Lang = "pt"): Promise<void> {
  const histId = historyId(theme, lang);
  await del(usedKey(histId, "pairs"));
  await del(usedKey(histId, "single"));
}

// limpa histórico de todos os temas
export async function resetAllThemes(): Promise<void> {
  const ks = await keys();
  await Promise.all(
    ks
      .filter((k) => String(k).startsWith("wg:used:"))
      .map((k) => del(k))
  );
}

// devolve próxima combinação de palavras
export async function getNextWords(
  theme: string,
  mode: "normal" | "cego",
  lang: Lang = "pt"
): Promise<{ real: string; impostor: string | null; exhausted: boolean }> {
  const data = await loadTheme(theme, lang);
  const histId = historyId(theme, lang);

  if (data.type === "pairs") {
    const used = await getUsed(histId, "pairs");
    const free = [...Array(data.items.length).keys()].filter(
      (i) => !used.includes(i)
    );

    const exhausted = free.length === 0;
    const index = exhausted
      ? Math.floor(Math.random() * data.items.length)
      : free[Math.floor(Math.random() * free.length)];

    if (!exhausted) {
      await setUsed(histId, "pairs", [...used, index]);
    }

    const [real, impostor] = data.items[index];
    return { real, impostor, exhausted };
  }

  // type === 'single'
  const used = await getUsed(histId, "single");
  const free = [...Array(data.items.length).keys()].filter(
    (i) => !used.includes(i)
  );

  // em modo cego precisamos de 1 palavra; em normal, 2 distintas
  const exhausted = mode === "cego" ? free.length === 0 : free.length <= 1;

  let realIdx: number;
  let impostorIdx: number | null = null;

  if (exhausted) {
    // escolhe algo aleatório para não bloquear o jogo; alerta será mostrado fora
    realIdx = Math.floor(Math.random() * (data.items.length || 1));
    if (mode === "normal" && data.items.length > 1) {
      do {
        impostorIdx = Math.floor(Math.random() * data.items.length);
      } while (impostorIdx === realIdx);
    }
  } else {
    const pick = (arr: number[]) =>
      arr.splice(Math.floor(Math.random() * arr.length), 1)[0];

    const pool = [...free];
    realIdx = pick(pool);

    if (mode === "normal") {
      impostorIdx = pool.length > 0 ? pick(pool) : null;
    }

    await setUsed(histId, "single", [
      ...used,
      realIdx,
      ...(impostorIdx !== null ? [impostorIdx] : []),
    ]);
  }

  const real = data.items[realIdx];
  const impostor =
    mode === "normal" && impostorIdx !== null
      ? data.items[impostorIdx]
      : null;

  return { real, impostor, exhausted };
}
