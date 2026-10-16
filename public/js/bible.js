// Carrega o texto bíblico. A fonte é configurável em config.js (ver README).
import { CONFIG } from "./config.js";
import { BOOKS, norm } from "./books.js";

let data = null;
let flat = null;

export async function loadBible() {
  const res = await fetch(CONFIG.bibleFile);
  if (!res.ok) throw new Error("Não foi possível carregar o texto bíblico");
  data = await res.json(); // [livro][capítulo][versículo]
  return data;
}

export const chapterCount = (b) => data[b].length;
export const verseCount = (b, c) => data[b][c - 1]?.length ?? 0;
export const getChapter = (b, c) => data[b][c - 1] ?? null;
export const getVerse = (b, c, v) => data[b][c - 1]?.[v - 1] ?? null;

export function search(query, limit = 200) {
  if (!flat) {
    flat = [];
    data.forEach((chs, b) => chs.forEach((vs, c) => vs.forEach((t, v) => flat.push({ b, c: c + 1, v: v + 1, t, n: norm(t) }))));
  }
  const terms = norm(query).split(" ").filter((t) => t.length > 1);
  if (!terms.length) return { total: 0, hits: [], terms };
  const hits = flat.filter((x) => terms.every((t) => x.n.includes(t)));
  return { total: hits.length, hits: hits.slice(0, limit), terms };
}

export const refLabel = (b, c, v) => `${BOOKS[b].name} ${c}${v ? ":" + v : ""}`;
