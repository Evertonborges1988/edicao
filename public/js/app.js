import { BOOKS, parseRef, parseBook } from "./books.js";
import * as B from "./bible.js";
import { CONFIG } from "./config.js";
import { loadRelated, renderRelated } from "./related.js";

const $ = (s) => document.querySelector(s);
const main = $("#main"), side = $("#side");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const link = (b, c, v) => `#/${b}/${c}${v ? "/" + v : ""}`;

function buildSide() {
  const group = (t, title) => `<h3>${title}</h3>` + BOOKS.filter((b) => b.testament === t).map((b) =>
    `<div class="book" data-b="${b.id}"><button>${b.name}</button><div class="chips"></div></div>`).join("");
  side.innerHTML = group("AT", "Antigo Testamento") + group("NT", "Novo Testamento");
  side.onclick = (e) => {
    const btn = e.target.closest(".book > button");
    if (btn) expandBook(+btn.parentElement.dataset.b, null, null, true);
    else if (e.target.closest("a")) document.body.classList.remove("menu");
  };
}

// Expande o livro mostrando capítulos; se houver capítulo ativo, mostra também os versículos.
function expandBook(b, c, v, toggle) {
  document.querySelectorAll(".book.open").forEach((el) => { if (+el.dataset.b !== b || !toggle) el.classList.remove("open"); });
  const el = side.querySelector(`.book[data-b="${b}"]`);
  if (toggle && el.classList.contains("open") && !c) return el.classList.remove("open");
  el.classList.add("open");
  let h = Array.from({ length: B.chapterCount(b) }, (_, i) => `<a href="${link(b, i + 1)}" class="${i + 1 === c ? "cur" : ""}">${i + 1}</a>`).join("");
  if (c) h += `<span class="vlabel">Versículos de ${BOOKS[b].name} ${c}</span>` +
    Array.from({ length: B.verseCount(b, c) }, (_, i) => `<a href="${link(b, c, i + 1)}" class="${i + 1 === v ? "cur" : ""}">${i + 1}</a>`).join("");
  el.querySelector(".chips").innerHTML = h;
  if (c) el.scrollIntoView({ block: "nearest" });
}

function showChapter(b, c, v) {
  if (!(c >= 1 && c <= B.chapterCount(b))) return notFound();
  const verses = B.getChapter(b, c);
  if (v && !(v >= 1 && v <= verses.length)) v = null;
  const prev = c > 1 ? link(b, c - 1) : b > 0 ? link(b - 1, B.chapterCount(b - 1)) : null;
  const next = c < B.chapterCount(b) ? link(b, c + 1) : b < 65 ? link(b + 1, 1) : null;
  const pager = `<div class="pager"><span>${prev ? `<a href="${prev}">← Anterior</a>` : ""}</span><span>${next ? `<a href="${next}">Próximo →</a>` : ""}</span></div>`;
  main.innerHTML = `<h1>${BOOKS[b].name} ${c}</h1><p class="hint">${CONFIG.versionLabel} · toque em um versículo para estudá-lo</p>` +
    (v ? `<section class="focus"><p>${esc(verses[v - 1])}</p><cite>${BOOKS[b].name} ${c}:${v}</cite></section><div id="related"></div>` : "") +
    `<article>${verses.map((t, i) => `<a class="verse ${i + 1 === v ? "sel" : ""}" id="v${i + 1}" href="${link(b, c, i + 1)}"><sup>${i + 1}</sup>${esc(t)}</a>`).join("")}</article>` + pager;
  if (v) renderRelated($("#related"), b, c, v);
  expandBook(b, c, v, false);
  v ? window.scrollTo({ top: 0 }) : window.scrollTo({ top: 0 });
}

function showSearch(q) {
  const r = B.search(q);
  const re = new RegExp("(" + r.terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
  main.innerHTML = `<h1>Resultados para “${esc(q)}”</h1><p class="hint">${r.total} versículo(s)${r.total > r.hits.length ? ` — mostrando os ${r.hits.length} primeiros` : ""}</p>` +
    r.hits.map((x) => `<a class="hit" href="${link(x.b, x.c, x.v)}"><b>${BOOKS[x.b].name} ${x.c}:${x.v}</b><br>${esc(x.t).replace(re, "<mark>$1</mark>")}</a>`).join("");
  window.scrollTo({ top: 0 });
}

const notFound = () => (main.innerHTML = `<h1>Não encontrado</h1><p>Tente outra referência, como <a href="#/42/3/16">João 3:16</a>.</p>`);

function home() {
  main.innerHTML = `<h1>Palavra Viva</h1><p>Busque uma referência (“João 3:16”, “Sl 23”) ou uma palavra, ou escolha um livro no menu. Cada versículo abre com citações, livros e vídeos relacionados.</p>
  <div class="welcome">${[[42, 3, 16], [18, 23, 1], [44, 8, 28], [49, 4, 13], [19, 3, 5]].map(([b, c, v]) => `<a href="${link(b, c, v)}">${BOOKS[b].name} ${c}:${v}<br><small>${esc(B.getVerse(b, c, v)).slice(0, 70)}…</small></a>`).join("")}</div>`;
}

function route() {
  const m = location.hash.match(/^#\/(?:search\/(.+)|(\d+)\/(\d+)(?:\/(\d+))?)$/);
  document.body.classList.remove("menu");
  if (!m) return home();
  if (m[1]) return showSearch(decodeURIComponent(m[1]));
  const b = +m[2];
  if (b > 65) return notFound();
  showChapter(b, +m[3], m[4] ? +m[4] : null);
}

$("#searchForm").onsubmit = (e) => {
  e.preventDefault();
  const q = $("#q").value.trim();
  if (!q) return;
  const r = parseRef(q);
  if (r) {
    const last = B.verseCount(r.book.id, r.chapter);
    return (location.hash = link(r.book.id, r.chapter, r.verse && r.verse <= last ? r.verse : null));
  }
  const bk = parseBook(q);
  location.hash = bk ? link(bk.id, 1) : "#/search/" + encodeURIComponent(q);
};
$("#menuBtn").onclick = () => document.body.classList.toggle("menu");

try {
  main.textContent = "Carregando a Bíblia…";
  await Promise.all([B.loadBible(), loadRelated()]);
  buildSide();
  addEventListener("hashchange", route);
  route();
} catch (e) {
  main.innerHTML = `<h1>Erro</h1><p>${esc(e.message)}. Sirva a pasta por HTTP (ex.: <code>npm start</code>).</p>`;
}
