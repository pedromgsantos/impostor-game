// src/services/wordManager.ts
import { get, set, del, keys } from "idb-keyval";
// cache na memória para não refazer fetch
const cache = new Map();
const usedKey = (theme, bucket) => `wg:used:${theme}:${bucket}`;
async function loadTheme(theme) {
    if (cache.has(theme))
        return cache.get(theme);
    // Respeita o BASE_URL (ex.: quando a app está servida num subpath)
    const url = `${import.meta.env.BASE_URL}data/${theme}.json`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Não encontrei ${url} (HTTP ${res.status})`);
    }
    const json = await res.json();
    // aceita tanto {type, items} como um array simples
    const file = Array.isArray(json)
        ? { type: "single", items: json }
        : json;
    cache.set(theme, file);
    return file;
}
async function getUsed(theme, bucket) {
    return (await get(usedKey(theme, bucket))) ?? [];
}
async function setUsed(theme, bucket, arr) {
    await set(usedKey(theme, bucket), Array.from(new Set(arr)));
}
export async function resetTheme(theme) {
    await del(usedKey(theme, "pairs"));
    await del(usedKey(theme, "single"));
}
export async function resetAllThemes() {
    const ks = await keys();
    await Promise.all(ks
        .filter((k) => String(k).startsWith("wg:used:"))
        .map((k) => del(k)));
}
export async function getNextWords(theme, mode) {
    const data = await loadTheme(theme);
    if (data.type === "pairs") {
        const used = await getUsed(theme, "pairs");
        const free = [...Array(data.items.length).keys()].filter((i) => !used.includes(i));
        const exhausted = free.length === 0;
        const index = exhausted
            ? Math.floor(Math.random() * data.items.length)
            : free[Math.floor(Math.random() * free.length)];
        if (!exhausted)
            await setUsed(theme, "pairs", [...used, index]);
        const [real, impostor] = data.items[index];
        return { real, impostor, exhausted };
    }
    // type === 'single'
    const used = await getUsed(theme, "single");
    const free = [...Array(data.items.length).keys()].filter((i) => !used.includes(i));
    // em modo cego precisamos de 1 palavra; em normal, 2 distintas
    const exhausted = mode === "cego" ? free.length === 0 : free.length <= 1;
    let realIdx;
    let impostorIdx = null;
    if (exhausted) {
        // escolhe algo aleatório para não bloquear o jogo; alerta será mostrado fora
        realIdx = Math.floor(Math.random() * (data.items.length || 1));
        if (mode === "normal" && data.items.length > 1) {
            do {
                impostorIdx = Math.floor(Math.random() * data.items.length);
            } while (impostorIdx === realIdx);
        }
    }
    else {
        // escolhe real
        const pick = (arr) => arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
        const pool = [...free];
        realIdx = pick(pool);
        if (mode === "normal") {
            impostorIdx = pool.length > 0 ? pick(pool) : null;
        }
        await setUsed(theme, "single", [
            ...used,
            realIdx,
            ...(impostorIdx !== null ? [impostorIdx] : []),
        ]);
    }
    const real = data.items[realIdx];
    const impostor = mode === "normal" ? data.items[impostorIdx] : null;
    return { real, impostor, exhausted };
}
