// Conteúdo relacionado a um versículo: citações, livros e vídeos.
// Curadoria em data/related.json, chave "livro.capitulo.versiculo" (livro = índice 0-65). Ex.: "42.3.16" = João 3:16.
// Sem curadoria, cada aba mostra um atalho de busca (YouTube / Google Livros) e um convite para adicionar conteúdo.
import { refLabel, getVerse } from "./bible.js";

let curated = {};
export async function loadRelated() {
  try { curated = await (await fetch("data/related.json")).json(); } catch { curated = {}; }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function renderRelated(el, b, c, v) {
  // Prioridade: versículo > capítulo; livros gerais por testamento entram se nada específico existir.
  const own = { ...(curated[`${b}.${c}`] || {}), ...(curated[`${b}.${c}.${v}`] || {}) };
  const gen = curated._default?.[b < 39 ? "AT" : "NT"] || {};
  const d = { ...own, books: [...(own.books || []), ...(gen.books || [])] };
  const ref = refLabel(b, c, v);
  const q = encodeURIComponent(`${ref} explicação estudo`);
  const tabs = {
    quotes: { label: "Citações", html: (d.quotes || []).map((x) => `<blockquote class="card"><p>“${esc(x.text)}”</p><footer>— ${esc(x.author)}${x.source ? `, <em>${esc(x.source)}</em>` : ""}</footer></blockquote>`).join("") || empty("Ainda não há citações curadas para este versículo.") },
    books: { label: "Livros", html: (d.books || []).map((x) => `<div class="card"><strong>${esc(x.title)}</strong><span>${esc(x.author)}</span>${x.note ? `<p>${esc(x.note)}</p>` : ""}</div>`).join("") + `<a class="card link" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=bks&q=${q}">Buscar “${esc(ref)}” em Google Livros ↗</a>` },
    videos: { label: "Vídeos", html: (d.videos || []).map((x) => `<div class="card video"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${esc(x.id)}" title="${esc(x.title)}" allowfullscreen></iframe><span>${esc(x.title)}${x.channel ? ` · ${esc(x.channel)}` : ""} · <a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(x.id)}">abrir no YouTube ↗</a></span></div>`).join("") + `<a class="card link" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${q}">Buscar vídeos sobre ${esc(ref)} no YouTube ↗</a>` },
  };
  el.innerHTML = `<div class="tabs" role="tablist">${Object.entries(tabs).map(([k, t], i) => `<button role="tab" data-tab="${k}" aria-selected="${i === 0}">${t.label}</button>`).join("")}</div><div class="tabpanel cards"></div>`;
  const panel = el.querySelector(".tabpanel");
  const show = (k) => { panel.innerHTML = tabs[k].html; el.querySelectorAll("[role=tab]").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === k)); };
  el.querySelectorAll("[role=tab]").forEach((t) => (t.onclick = () => show(t.dataset.tab)));
  show("quotes");
}
const empty = (m) => `<p class="empty">${m}</p>`;
