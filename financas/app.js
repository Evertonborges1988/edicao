/* Finanças Borges — app de finanças da família (PWA, sem dependências) */
(() => {
"use strict";

/* =============== utilidades =============== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = n => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = n => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const pad = n => String(n).padStart(2, "0");
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const mesDe = s => (s || hoje()).slice(0, 7);
const addMes = (m, n) => { let [y, mo] = m.split("-").map(Number); mo += n; y += Math.floor((mo - 1) / 12); mo = ((mo - 1) % 12 + 12) % 12 + 1; return `${y}-${pad(mo)}`; };
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MES3 = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mesNome = m => `${MESES[+m.slice(5) - 1]} ${m.slice(0, 4)}`;
const diasNoMes = (y, m) => new Date(y, m, 0).getDate();
const addMesData = (data, n) => { // soma meses mantendo o dia (limita ao fim do mês)
  const [y, m, d] = data.split("-").map(Number); const nm = addMes(`${y}-${pad(m)}`, n);
  const [ny, nmo] = nm.split("-").map(Number); return `${nm}-${pad(Math.min(d, diasNoMes(ny, nmo)))}`;
};
const fmtDia = s => s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "";
const uid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 12) : Math.random().toString(36).slice(2, 14));
const parseNum = s => { s = String(s ?? "").trim().replace(/[^\d,.\-]/g, ""); if (!s) return 0; if (s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); return parseFloat(s) || 0; };
const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + "…" : s;

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V11M12 20V4M19 20v-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
};

/* =============== dados =============== */
const LS_ITEMS = "fin.items.v1", LS_CFG = "fin.cfg.v1";
const CFG_PADRAO = {
  metas: { dizimo: 10, fixas: 40, variaveis: 30, guardar: 20 }, // % da receita (aba "Resultados" da planilha)
  cartoes: ["Santander Bi", "Santander Tom", "Credicard", "Itaú Tom", "Carrefour Tom"],
  tema: "auto",
  supa: { url: "", key: "", email: "", access: "", refresh: "", exp: 0, lastPush: 0, lastPull: 0 },
};
const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch { return padrao; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { aviso("Sem espaço para salvar no aparelho."); } };

let items = ler(LS_ITEMS, []);
let cfg = Object.assign({}, CFG_PADRAO, ler(LS_CFG, {}));
cfg.metas = Object.assign({}, CFG_PADRAO.metas, cfg.metas);
cfg.supa = Object.assign({}, CFG_PADRAO.supa, cfg.supa);

const salvarItens = () => { gravar(LS_ITEMS, items); agendarSync(); };
const salvarCfg = () => gravar(LS_CFG, cfg);
const vivos = () => items.filter(x => !x._del);
const isCartao = f => cfg.cartoes.includes(f);

/* índices recalculados quando os dados mudam */
let IDX = null;
function indices() {
  if (IDX) return IDX;
  const ds = vivos().filter(x => x.k === "d");
  const catN = {}, fornN = {}, ultimaDesc = {}, diaCartao = {};
  for (const x of ds) {
    if (x.cat && !x.transf) catN[x.cat] = (catN[x.cat] || 0) + 1;
    if (x.forn) fornN[x.forn] = (fornN[x.forn] || 0) + 1;
    const key = norm(x.desc);
    if (key && (!ultimaDesc[key] || (x.venc || "") >= (ultimaDesc[key].venc || ""))) ultimaDesc[key] = x;
    if (isCartao(x.forn) && x.venc) { const dd = x.venc.slice(8, 10); (diaCartao[x.forn] ||= {})[dd] = ((diaCartao[x.forn] || {})[dd] || 0) + 1; }
  }
  const topo = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const dia = {}; for (const c in diaCartao) dia[c] = +topo(diaCartao[c])[0];
  IDX = { cats: topo(catN), forns: topo(fornN), ultimaDesc, diaCartao: dia, descs: Object.values(ultimaDesc).map(x => x.desc) };
  return IDX;
}
const invalidar = () => { IDX = null; };

/* agregações de um mês */
function resumoMes(m) {
  const li = vivos().filter(x => x.mes === m);
  const rec = li.filter(x => x.k === "r");
  const des = li.filter(x => x.k === "d");
  const sum = a => r2(a.reduce((s, x) => s + (x.valor || 0), 0));
  const receitas = sum(rec.filter(x => !x.carry));
  const saldoAnt = sum(rec.filter(x => x.carry));
  const gastos = des.filter(x => !x.transf);
  const guardado = sum(des.filter(x => x.transf));
  const fixas = sum(gastos.filter(x => x.tipo === "Fixo" && x.cat !== "Dízimo"));
  const dizimo = sum(gastos.filter(x => x.cat === "Dízimo"));
  const variaveis = sum(gastos.filter(x => x.tipo !== "Fixo"));
  const despesas = sum(gastos);
  const pago = sum(gastos.filter(x => x.pago));
  return { receitas, saldoAnt, despesas, guardado, fixas, dizimo, variaveis, pago, pendente: r2(despesas - pago),
    sobra: r2(saldoAnt + receitas - despesas - guardado), gastos };
}
function porCategoria(gastos) {
  const o = {}; for (const x of gastos) { const c = x.cat || "Sem categoria"; o[c] = (o[c] || 0) + x.valor; }
  return Object.entries(o).map(([nome, v]) => [nome, r2(v)]).sort((a, b) => b[1] - a[1]);
}
function porForn(gastos) {
  const o = {}; for (const x of gastos) if (isCartao(x.forn)) o[x.forn] = (o[x.forn] || 0) + x.valor;
  return Object.entries(o).map(([n, v]) => [n, r2(v)]).sort((a, b) => b[1] - a[1]);
}

/* =============== estado de tela =============== */
let view = "home";
let mes = mesDe(hoje());
let filtro = { q: "", tipo: "todos", cat: "", forn: "" };
let faixa = "12"; // análise: 6 | 12 | prox
let F = null; // formulário aberto

/* =============== componentes visuais =============== */
function hbar(nome, valor, max, { sub = "", cor = "", data = "" } = {}) {
  const w = max > 0 ? Math.max(2, Math.round(valor / max * 100)) : 0;
  return `<button class="hbar" ${data}><span class="nome">${esc(nome)}</span><span class="val num">${brl(valor)}</span>
    <span class="trilho"><i style="width:${w}%;${cor ? `background:${cor}` : ""}"></i></span>${sub ? `<span class="sub">${sub}</span>` : ""}</button>`;
}

/* gráfico de colunas (agrupadas ou empilhadas) em SVG */
function colChart(meses, series, { empilhar = false, id = "c" } = {}) {
  const W = 340, H = 200, L = 34, R = 6, T = 8, B = 34;
  const n = meses.length, cw = (W - L - R) / n;
  const tot = i => empilhar ? series.reduce((s, se) => s + se.vals[i], 0) : Math.max(...series.map(se => se.vals[i]));
  let max = Math.max(1, ...meses.map((_, i) => tot(i)));
  const passo = [500, 1000, 2000, 2500, 5000, 10000, 20000].find(p => max / p <= 4) || 50000;
  max = Math.ceil(max / passo) * passo;
  const y = v => T + (H - T - B) * (1 - v / max);
  const kfmt = v => v >= 1000 ? (v / 1000).toString().replace(".", ",") + " mil" : String(v);
  let g = "";
  for (let v = 0; v <= max; v += passo) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 5}" y="${y(v) + 3.5}" text-anchor="end">${kfmt(v)}</text>`;
  let bars = "", hits = "";
  const ns = series.length, gap = 2;
  meses.forEach((m, i) => {
    const x0 = L + i * cw;
    g += `<text x="${x0 + cw / 2}" y="${H - 16}" text-anchor="middle">${MES3[+m.slice(5) - 1]}</text>`;
    if (m.slice(5) === "01" || i === 0) g += `<text x="${x0 + cw / 2}" y="${H - 5}" text-anchor="middle" style="font-weight:700">&#8217;${m.slice(2, 4)}</text>`;
    if (empilhar) {
      const bw = Math.min(26, cw * .62), bx = x0 + (cw - bw) / 2; let acc = 0;
      series.forEach((se, si) => {
        const v = se.vals[i]; if (v <= 0) return;
        const yt = y(acc + v), yb = y(acc);
        const topo = si === series.length - 1 || series.slice(si + 1).every(s2 => s2.vals[i] <= 0);
        const h = Math.max(1, yb - yt - (acc > 0 ? 2 : 0));
        bars += `<rect x="${bx}" y="${yt}" width="${bw}" height="${h}" rx="${topo ? 4 : 0}" fill="var(--${se.cor})"/>`; acc += v;
      });
    } else {
      const bw = Math.min(16, (cw * .78 - gap * (ns - 1)) / ns), tw = bw * ns + gap * (ns - 1), bx = x0 + (cw - tw) / 2;
      series.forEach((se, si) => {
        const v = se.vals[i]; if (v <= 0) return; const h = Math.max(1, y(0) - y(v));
        bars += `<rect x="${bx + si * (bw + gap)}" y="${y(v)}" width="${bw}" height="${h}" rx="4" fill="var(--${se.cor})"/>`;
      });
    }
    const tip = `${mesNome(m)}\n` + series.map(se => `${se.nome}: ${brl(se.vals[i])}`).join("\n") + (empilhar ? `\nTotal: ${brl(tot(i))}` : "");
    hits += `<rect class="hit" x="${x0}" y="${T}" width="${cw}" height="${H - T - B}" data-tip="${esc(tip)}" data-mes="${m}"/>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico mensal">${g}${bars}${hits}</svg>
    <div class="legenda">${series.map(se => `<span><i style="background:var(--${se.cor})"></i>${esc(se.nome)}</span>`).join("")}</div>`;
}

function badgeVar(delta) {
  if (Math.abs(delta) < 1) return `<span class="badge">= igual</span>`;
  const sobe = delta > 0;
  return `<span class="badge ${sobe ? "warn" : "good"}">${sobe ? ICON.up : ICON.down}${sobe ? "+" : "−"}${brl0(Math.abs(delta))}</span>`;
}

/* =============== telas =============== */
function topbar(titulo, mostrarMes = true) {
  if (!mostrarMes) return `<div class="topbar"><div class="wrap"><div class="mes-nav"><div class="titulo">${titulo}</div></div></div></div>`;
  const atual = mes === mesDe(hoje());
  return `<div class="topbar"><div class="wrap"><div class="mes-nav">
    <button class="icon-btn" data-act="mes" data-n="-1" aria-label="Mês anterior">${ICON.left}</button>
    <button class="titulo" data-act="mes-hoje" aria-label="Voltar para o mês atual">${MESES[+mes.slice(5) - 1]} ${mes.slice(0, 4)}<small>${atual ? "mês atual" : "toque para voltar ao mês atual"}</small></button>
    <button class="icon-btn" data-act="mes" data-n="1" aria-label="Próximo mês">${ICON.right}</button></div></div></div>`;
}

function telaInicio() {
  const R = resumoMes(mes);
  const vazio = !vivos().some(x => x.mes === mes);
  const pct = R.despesas > 0 ? Math.min(100, Math.round(R.pago / R.despesas * 100)) : 0;
  const sobra = R.sobra;
  const bd = Math.abs(sobra) < 0.5 ? `<span class="badge good">${ICON.check}Tudo distribuído</span>`
    : sobra > 0 ? `<span class="badge good">${ICON.up}Sobrando</span>` : `<span class="badge crit">${ICON.alert}No vermelho</span>`;
  const cats = porCategoria(R.gastos); const maxC = cats[0]?.[1] || 0;
  const topC = cats.slice(0, 6), resto = r2(cats.slice(6).reduce((s, c) => s + c[1], 0));
  const cartoes = porForn(R.gastos);
  const venc = vivos().filter(x => x.k === "d" && x.mes === mes && !x.pago && !x.transf && x.valor > 0)
    .sort((a, b) => (a.venc || "").localeCompare(b.venc || ""));
  const base = R.receitas || 0;
  const metas = [
    ["Dízimo", R.dizimo, cfg.metas.dizimo], ["Despesas fixas", R.fixas, cfg.metas.fixas],
    ["Despesas variáveis", R.variaveis, cfg.metas.variaveis], ["Guardado / investido", R.guardado, cfg.metas.guardar, true],
  ];
  return `${topbar()}<div class="wrap">
    <div class="card hero">
      <div class="rotulo">Sobra do mês</div>
      <div class="valor num">${brl(sobra)}</div>
      ${bd}
      <div class="conta" style="margin-top:8px">${R.saldoAnt ? `Saldo anterior ${brl(R.saldoAnt)} + ` : ""}receitas ${brl(R.receitas)} − despesas ${brl(R.despesas)}${R.guardado ? ` − guardado ${brl(R.guardado)}` : ""}</div>
      <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <div class="prog-txt"><span>Pago ${brl(R.pago)} (${pct}%)</span><span>Falta pagar ${brl(R.pendente)}</span></div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="t"><i style="background:var(--s1)"></i>Receitas</div><div class="v num">${brl0(R.receitas)}</div></div>
      <div class="kpi"><div class="t"><i style="background:var(--s2)"></i>Despesas</div><div class="v num">${brl0(R.despesas)}</div></div>
      <div class="kpi"><div class="t"><i style="background:var(--s3)"></i>Guardado</div><div class="v num">${brl0(R.guardado)}</div></div>
    </div>
    ${vazio ? `<div class="card vazio" style="margin-top:12px">Nenhum lançamento neste mês.<br>Toque no <b>+</b> para começar.</div>` : ""}
    ${venc.length ? `<h2>A pagar neste mês</h2><div class="lista">${venc.slice(0, 6).map(linhaItem).join("")}</div>
      ${venc.length > 6 ? `<button class="chip" style="margin-top:10px" data-act="ver-pendentes">Ver os ${venc.length} pendentes</button>` : ""}` : ""}
    ${base > 0 ? `<h2>Metas do mês <span style="text-transform:none;letter-spacing:0;font-weight:500">(% das receitas)</span></h2><div class="card">
      ${metas.map(([nome, v, meta, minimo]) => {
        const p = v / base * 100, alvo = meta;
        const estourou = minimo ? p < alvo : p > alvo;
        const w = Math.min(100, p / Math.max(alvo * 1.5, p, 1) * 100), mk = Math.min(100, alvo / Math.max(alvo * 1.5, p, 1) * 100);
        const msg = minimo ? (p >= alvo ? "meta batida" : `faltam ${brl0(base * alvo / 100 - v)}`) : (p <= alvo ? "dentro da meta" : `${brl0(v - base * alvo / 100)} acima`);
        const cor = !estourou ? "ok" : (minimo ? "" : "over");
        return `<div class="hbar meta-row"><span class="nome">${nome}</span><span class="val num">${brl0(v)} · ${p.toFixed(0)}%</span>
          <span class="trilho"><i class="${cor}" style="width:${w}%;${cor === "" ? "background:var(--s4)" : ""}"></i><span class="meta-mark" style="left:${mk}%"></span></span>
          <span class="sub">meta ${alvo}% (${brl0(base * alvo / 100)}) · <b style="color:var(--${estourou ? (minimo ? "warn" : "crit") : "good"})">${msg}</b></span></div>`;
      }).join("")}</div>` : ""}
    ${cats.length ? `<h2>Para onde foi o dinheiro</h2><div class="card">
      ${topC.map(([n, v]) => hbar(n, v, maxC, { sub: `${(v / R.despesas * 100).toFixed(0)}% das despesas`, data: `data-act="cat" data-cat="${esc(n)}"` })).join("")}
      ${resto > 0 ? `<div class="hbar"><span class="nome muted">Outras ${cats.length - 6} categorias</span><span class="val num muted">${brl(resto)}</span></div>` : ""}</div>` : ""}
    ${cartoes.length ? `<h2>Cartões do mês</h2><div class="card">${cartoes.map(([n, v]) => hbar(n, v, cartoes[0][1], { data: `data-act="cartao" data-forn="${esc(n)}"` })).join("")}</div>` : ""}
  </div>`;
}

function linhaItem(x) {
  const atraso = !x.pago && x.venc && x.venc < hoje();
  const rec = x.k === "r";
  const parcela = x.tparc > 1 ? ` · ${x.parc}/${x.tparc}` : "";
  const sub = rec ? `<span class="tag">Receita</span>${x.carry ? "saldo anterior" : x.pago ? "recebido" : "a receber"}`
    : `${x.cat ? `<span class="tag">${esc(x.cat)}</span>` : ""}${esc(x.forn || "")}${parcela}${x.venc ? ` · vence ${fmtDia(x.venc)}` : ""}${atraso ? ` · <b>atrasado</b>` : ""}`;
  return `<div class="item ${x.pago ? "" : "pend"} ${atraso ? "atraso" : ""}" data-act="editar" data-id="${x.id}" role="button" tabindex="0">
    <span class="chk ${rec ? "rec" : ""} ${x.pago ? "on" : ""}" data-act="pagar" data-id="${x.id}" role="checkbox" aria-checked="${!!x.pago}" aria-label="${rec ? "Marcar como recebido" : "Marcar como pago"}">${ICON.check}</span>
    <span class="meio"><div class="d">${esc(x.desc || x.cat || "(sem descrição)")}</div><div class="s">${sub}</div></span>
    <span class="v num ${rec ? "rec" : ""}">${rec ? "+" : ""}${brl(x.valor)}</span></div>`;
}

function listaFiltrada() {
  const q = norm(filtro.q);
  return vivos().filter(x => x.mes === mes).filter(x => {
    if (filtro.tipo === "d" && x.k !== "d") return false;
    if (filtro.tipo === "r" && x.k !== "r") return false;
    if (filtro.tipo === "pend" && (x.pago || x.valor <= 0)) return false;
    if (filtro.cat && x.cat !== filtro.cat) return false;
    if (filtro.forn && x.forn !== filtro.forn) return false;
    if (q && !norm(`${x.desc} ${x.cat} ${x.forn}`).includes(q)) return false;
    return true;
  }).sort((a, b) => (a.venc || a.mes + "-01").localeCompare(b.venc || b.mes + "-01") || (a.k < b.k ? 1 : -1));
}
function htmlLista() {
  const li = listaFiltrada();
  if (!li.length) return `<div class="vazio">Nada encontrado.</div>`;
  const grupos = []; let atual = null;
  for (const x of li) {
    const dia = x.venc || x.mes + "-01";
    if (!atual || atual.dia !== dia) { atual = { dia, itens: [] }; grupos.push(atual); }
    atual.itens.push(x);
  }
  const hojeS = hoje();
  const nomeDia = s => { const d = new Date(s + "T12:00:00"); return `${["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][d.getDay()]}, ${fmtDia(s)}${s === hojeS ? " · hoje" : ""}`; };
  const tD = r2(li.filter(x => x.k === "d").reduce((s, x) => s + x.valor, 0)), tR = r2(li.filter(x => x.k === "r").reduce((s, x) => s + x.valor, 0));
  return grupos.map(g => `<div class="dia">${nomeDia(g.dia)}</div><div class="lista">${g.itens.map(linhaItem).join("")}</div>`).join("")
    + `<div class="total-bar"><span>${li.length} lançamentos</span><span class="num">${tR ? `+${brl(tR)} · ` : ""}−${brl(tD)}</span></div>`;
}
function telaLancamentos() {
  const mesItens = vivos().filter(x => x.mes === mes);
  const cats = [...new Set(mesItens.map(x => x.cat).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));
  const forns = [...new Set(mesItens.map(x => x.forn).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));
  const tipos = [["todos", "Todos"], ["pend", "Pendentes"], ["d", "Despesas"], ["r", "Receitas"]];
  return `${topbar()}<div class="wrap">
    <div class="busca">${ICON.search}<input id="q" type="search" placeholder="Buscar: mercado, Netflix, Bi…" value="${esc(filtro.q)}" autocomplete="off"></div>
    <div class="chips">${tipos.map(([k, n]) => `<button class="chip ${filtro.tipo === k ? "on" : ""}" data-act="ftipo" data-k="${k}">${n}</button>`).join("")}</div>
    <div class="sel-row">
      <select class="sel" id="fcat" aria-label="Categoria"><option value="">Categoria: todas</option>${cats.map(c => `<option ${filtro.cat === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      <select class="sel" id="fforn" aria-label="Cartão ou fornecedor"><option value="">Cartão: todos</option>${forns.map(c => `<option ${filtro.forn === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
    </div>
    <div id="lista">${htmlLista()}</div></div>`;
}

function serieMeses() {
  const hojeM = mesDe(hoje());
  const ms = faixa === "prox" ? Array.from({ length: 6 }, (_, i) => addMes(hojeM, i)) : Array.from({ length: +faixa }, (_, i) => addMes(hojeM, i - (+faixa - 1)));
  return ms.map(m => ({ m, R: resumoMes(m) }));
}
function telaAnalise() {
  const S = serieMeses(); const ms = S.map(s => s.m);
  const R = resumoMes(mes), ant = resumoMes(addMes(mes, -1));
  const cA = Object.fromEntries(porCategoria(R.gastos)), cB = Object.fromEntries(porCategoria(ant.gastos));
  const todas = [...new Set([...Object.keys(cA), ...Object.keys(cB)])].map(c => [c, cA[c] || 0, cB[c] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const dTot = R.despesas - ant.despesas;
  const cartoes = porForn(R.gastos);
  const mediaFixas = S.filter(s => s.R.despesas > 0).reduce((a, s, _, arr) => a + s.R.fixas / arr.length, 0);
  return `${topbar()}<div class="wrap">
    <div class="card"><div style="font-size:13px;color:var(--ink-3)">${mesNome(mes)} comparado com ${mesNome(addMes(mes, -1))}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;gap:10px">
        <div><div class="muted sm">Despesas</div><div class="num" style="font-size:26px;font-weight:700">${brl(R.despesas)}</div></div>
        <div style="text-align:right">${ant.despesas ? badgeVar(dTot) : '<span class="badge">sem mês anterior</span>'}<div class="muted sm" style="margin-top:4px">antes: ${brl(ant.despesas)}</div></div></div></div>
    <button class="btn" style="margin-top:12px" data-act="analise">✨ Analisar este mês com o Claude</button>
    <h2>Evolução</h2>
    <div class="seg" style="margin-bottom:10px"><button class="${faixa === "6" ? "on" : ""}" data-act="faixa" data-k="6">6 meses</button><button class="${faixa === "12" ? "on" : ""}" data-act="faixa" data-k="12">12 meses</button><button class="${faixa === "prox" ? "on" : ""}" data-act="faixa" data-k="prox">Próximos 6</button></div>
    <div class="card"><div class="rot">Receitas × despesas</div>${colChart(ms, [{ nome: "Receitas", cor: "s1", vals: S.map(s => s.R.receitas) }, { nome: "Despesas", cor: "s2", vals: S.map(s => s.R.despesas) }])}</div>
    <div class="card"><div class="rot">Despesas fixas × variáveis${faixa === "prox" ? " (previstas)" : ""}</div>${colChart(ms, [{ nome: "Fixas", cor: "s3", vals: S.map(s => s.R.fixas + s.R.dizimo) }, { nome: "Variáveis", cor: "s4", vals: S.map(s => s.R.variaveis) }], { empilhar: true })}
      <div class="muted sm">Média de fixas no período: <b class="num">${brl0(mediaFixas)}</b> por mês</div></div>
    <h2>Categorias: este mês × anterior</h2>
    <div class="card">${todas.length ? todas.map(([c, a, b]) => `<div class="delta"><span class="n">${esc(c)}</span><span class="v num">${brl0(a)}</span>${badgeVar(a - b)}</div>`).join("") : '<div class="vazio">Sem dados neste mês.</div>'}
      <div class="muted sm" style="margin-top:6px">▲ gastou mais que no mês anterior · ▼ gastou menos</div></div>
    ${cartoes.length ? `<h2>Fatura por cartão</h2><div class="card">${cartoes.map(([n, v]) => hbar(n, v, cartoes[0][1])).join("")}</div>` : ""}
    <h2>Tabela do período</h2>
    <div class="card"><div class="scroll-x"><table class="tab"><thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th><th>Guardado</th><th>Sobra</th></tr></thead><tbody>
      ${S.map(s => `<tr><td>${MES3[+s.m.slice(5) - 1]}/${s.m.slice(2, 4)}</td><td class="num">${brl0(s.R.receitas)}</td><td class="num">${brl0(s.R.despesas)}</td><td class="num">${brl0(s.R.guardado)}</td><td class="num">${brl0(s.R.sobra)}</td></tr>`).join("")}
    </tbody></table></div></div></div>`;
}

function telaAjustes() {
  const sp = cfg.supa, conectado = !!sp.refresh;
  const total = vivos().length;
  return `${topbar("Ajustes", false)}<div class="wrap">
    <h2>Sincronizar com a esposa</h2>
    <div class="card">
      <div class="status-sync"><span class="dot ${conectado ? "on" : ""}"></span><span>${conectado ? "Conectado — os dois celulares usam os mesmos dados" : "Não conectado — dados só neste celular"}</span></div>
      ${conectado ? `<div class="muted sm" style="margin-bottom:12px">${esc(sp.email)} · ${syncMsg || "pronto"} · ${items.length} lançamentos · v4</div>
        <button class="btn sec" data-act="sync-agora">Sincronizar agora</button>
        <button class="btn sec" style="margin-top:8px" data-act="desconectar">Desconectar</button>`
      : `<div class="muted sm" style="margin-bottom:12px">Veja o passo a passo no arquivo <b>LEIA-ME.md</b> (leva ~10 min, uma vez só).</div>
        <div class="campo"><label for="s-url">Endereço do projeto (URL)</label><input id="s-url" value="${esc(sp.url)}" placeholder="https://xxxx.supabase.co" inputmode="url" autocapitalize="off"></div>
        <div class="campo"><label for="s-key">Chave pública (anon key)</label><input id="s-key" value="${esc(sp.key)}" placeholder="eyJ..." autocapitalize="off" autocomplete="off"></div>
        <div class="campo"><label for="s-email">E-mail da família</label><input id="s-email" type="email" value="${esc(sp.email)}" autocapitalize="off"></div>
        <div class="campo"><label for="s-pass">Senha</label><input id="s-pass" type="password" autocomplete="current-password"></div>
        <div class="erro" id="s-erro" hidden></div>
        <button class="btn" data-act="conectar">Conectar</button>`}
    </div>
    <h2>Metas (% das receitas)</h2>
    <div class="card">${[["dizimo", "Dízimo"], ["fixas", "Despesas fixas"], ["variaveis", "Despesas variáveis"], ["guardar", "Guardar (investir + emergência + viagem + mesada)"]].map(([k, n]) =>
      `<div class="linha-cfg"><label for="m-${k}">${n}</label><input id="m-${k}" data-meta="${k}" inputmode="numeric" value="${cfg.metas[k]}" style="width:72px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--card);text-align:center"></div>`).join("")}
      <div class="muted sm" style="margin-top:8px">Padrão vindo da sua planilha: 10% + 40% + 30% + 20%.</div></div>
    <h2>Cartões</h2>
    <div class="card"><div class="campo" style="margin:0"><label for="cartoes">Nomes separados por vírgula (aparecem em “Fatura por cartão”)</label><input id="cartoes" value="${esc(cfg.cartoes.join(", "))}"></div></div>
    <h2>Aparência</h2>
    <div class="card"><div class="seg">${[["auto", "Automático"], ["light", "Claro"], ["dark", "Escuro"]].map(([k, n]) => `<button class="${cfg.tema === k ? "on" : ""}" data-act="tema" data-k="${k}">${n}</button>`).join("")}</div></div>
    <h2>Dados (${total} lançamentos)</h2>
    <div class="card">
      <button class="btn" data-act="importar-xlsx">Importar a planilha (.xlsx)</button>
      <input type="file" id="arq-xlsx" hidden>
      <div class="muted sm" style="margin:8px 4px 12px">Escolha o arquivo da planilha do Excel, com ou sem senha. Ele é lido só neste celular. Pode importar de novo quando a planilha for atualizada: o que veio da planilha é atualizado, e o que você lançou aqui no app fica como está.</div>
      <button class="btn sec" data-act="importar">Restaurar backup do app (.json)</button>
      <input type="file" id="arq" hidden>
      <button class="btn sec" style="margin-top:8px" data-act="exportar">Baixar backup (.json)</button>
      <button class="btn sec" style="margin-top:8px" data-act="exportar-csv">Baixar tudo em planilha (.csv)</button>
      <button class="btn perigo" style="margin-top:8px" data-act="apagar">Apagar dados deste celular</button></div>
    <p class="muted sm" style="text-align:center;margin:20px 0">Finanças Borges · funciona sem internet</p></div>`;
}

/* =============== render =============== */
function render() {
  const telas = { home: telaInicio, lanc: telaLancamentos, ana: telaAnalise, cfg: telaAjustes };
  const y = window.scrollY;
  $("#app").innerHTML = telas[view]() + navHtml();
  window.scrollTo(0, y);
}
function navHtml() {
  const t = (v, ic, n) => `<button class="tab ${view === v ? "on" : ""}" data-act="nav" data-v="${v}" ${view === v ? 'aria-current="page"' : ""}>${ICON[ic]}<span>${n}</span></button>`;
  return `<nav class="bottom"><div class="in">${t("home", "home", "Início")}${t("lanc", "list", "Lançamentos")}
    <button class="fab" data-act="novo" aria-label="Novo lançamento">${ICON.plus}</button>${t("ana", "chart", "Análise")}${t("cfg", "gear", "Ajustes")}</div></nav>`;
}

/* =============== formulário (novo / editar) =============== */
function novoForm(k = "d", base = null) {
  const h = hoje();
  F = base ? { ...base, valorTxt: String(base.valor).replace(".", ","), editando: true, modo: "vista", n: 2 } : {
    k, id: null, valorTxt: "", desc: "", cat: "", forn: "", tipo: "Variável", comp: h, venc: h, pago: true,
    modo: "vista", n: 2, ehParcela: false, editando: false, vencManual: false,
  };
  F.erro = ""; renderSheet();
}
function sugerirVenc() { // usa o dia de vencimento usual do cartão
  if (F.vencManual || F.editando || !F.forn) return;
  const dia = indices().diaCartao[F.forn]; if (!dia || !isCartao(F.forn)) return;
  let [y, m] = F.comp.split("-").map(Number); let d = Math.min(dia, diasNoMes(y, m));
  let venc = `${y}-${pad(m)}-${pad(d)}`;
  if (venc < F.comp) { const nm = addMes(`${y}-${pad(m)}`, 1).split("-").map(Number); venc = `${nm[0]}-${pad(nm[1])}-${pad(Math.min(dia, diasNoMes(nm[0], nm[1])))}`; }
  F.venc = venc; F.pago = venc <= hoje();
}
function renderSheet() {
  const el = $("#sheet"); if (!F) { el.hidden = true; el.innerHTML = ""; document.body.style.overflow = ""; return; }
  const ix = indices(), d = F.k === "d";
  const chipCats = [...new Set([F.cat, ...ix.cats].filter(Boolean))].slice(0, 14);
  const chipForn = [...new Set([F.forn, ...cfg.cartoes, ...ix.forns].filter(Boolean))].slice(0, 12);
  const v = parseNum(F.valorTxt);
  let calc = "";
  if (!F.editando && F.modo === "parc" && v > 0) { const p = F.ehParcela ? v : r2(v / F.n); calc = `${F.n}× de ${brl(p)} = ${brl(F.ehParcela ? v * F.n : v)}`; }
  if (!F.editando && F.modo === "mensal" && v > 0) calc = `${brl(v)} por mês, por ${F.n} meses`;
  el.hidden = false; document.body.style.overflow = "hidden";
  el.innerHTML = `<div class="folha" role="dialog" aria-modal="true" aria-label="${F.editando ? "Editar" : "Novo"} lançamento">
    <div class="puxador"></div>
    <div class="cab"><b>${F.editando ? "Editar lançamento" : "Novo lançamento"}</b><button class="icon-btn" data-act="fechar" aria-label="Fechar">${ICON.x}</button></div>
    ${F.editando ? "" : `<div class="seg" style="margin-bottom:6px"><button class="${d ? "on" : ""}" data-act="fk" data-k="d">Despesa</button><button class="${!d ? "on" : ""}" data-act="fk" data-k="r">Receita</button></div>`}
    <div class="valor-big"><div class="rs">R$</div><input id="f-valor" inputmode="decimal" placeholder="0,00" value="${esc(F.valorTxt)}" autocomplete="off" aria-label="Valor"><div class="calc num">${calc}</div></div>
    <div class="campo"><label for="f-desc">${d ? "O que foi?" : "De onde veio?"}</label><input id="f-desc" list="dl-desc" value="${esc(F.desc)}" placeholder="${d ? "Ex.: Mercado, Netflix, Gasolina…" : "Ex.: Salário Tom"}" autocomplete="off"><datalist id="dl-desc">${ix.descs.slice(0, 400).map(s => `<option value="${esc(s)}">`).join("")}</datalist></div>
    ${d ? `<div class="campo"><span class="rot">Categoria</span><div class="chips wrap-chips">${chipCats.map(c => `<button class="chip ${F.cat === c ? "on" : ""}" data-act="fcat" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <input id="f-cat" list="dl-cat" placeholder="Outra categoria…" value="${chipCats.includes(F.cat) ? "" : esc(F.cat)}" style="margin-top:8px"><datalist id="dl-cat">${ix.cats.map(c => `<option value="${esc(c)}">`).join("")}</datalist></div>
      <div class="campo"><span class="rot">Pago com / Fornecedor</span><div class="chips wrap-chips">${chipForn.map(c => `<button class="chip ${F.forn === c ? "on" : ""}" data-act="fforn" data-v="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <input id="f-forn" list="dl-forn" placeholder="Outro (Pix, dinheiro, loja…)" value="${chipForn.includes(F.forn) ? "" : esc(F.forn)}" style="margin-top:8px"><datalist id="dl-forn">${ix.forns.map(c => `<option value="${esc(c)}">`).join("")}</datalist></div>
      <div class="campo"><span class="rot">Tipo</span><div class="seg"><button class="${F.tipo === "Fixo" ? "on" : ""}" data-act="ftipo2" data-v="Fixo">Fixo</button><button class="${F.tipo !== "Fixo" ? "on" : ""}" data-act="ftipo2" data-v="Variável">Variável</button></div></div>` : ""}
    <div class="duas">
      ${d ? `<div class="campo"><label for="f-comp">Data da compra</label><input type="date" id="f-comp" value="${F.comp || ""}"></div>` : ""}
      <div class="campo" ${d ? "" : 'style="grid-column:1/-1"'}><label for="f-venc">${d ? "Vence em" : "Data"}</label><input type="date" id="f-venc" value="${F.venc || ""}"></div></div>
    ${F.editando ? "" : `<div class="campo"><span class="rot">Repetição</span><div class="seg"><button class="${F.modo === "vista" ? "on" : ""}" data-act="fmodo" data-v="vista">${d ? "À vista" : "Uma vez"}</button>${d ? `<button class="${F.modo === "parc" ? "on" : ""}" data-act="fmodo" data-v="parc">Parcelado</button>` : ""}<button class="${F.modo === "mensal" ? "on" : ""}" data-act="fmodo" data-v="mensal">Todo mês</button></div>
      ${F.modo !== "vista" ? `<div class="stepper" style="margin-top:10px"><button data-act="fn" data-d="-1" aria-label="Menos">−</button><b>${F.n}</b><button data-act="fn" data-d="1" aria-label="Mais">+</button><span class="muted sm">${F.modo === "parc" ? "parcelas" : "meses"}</span></div>` : ""}
      ${F.modo === "parc" ? `<button class="tgl" style="margin:10px 0 0" data-act="fpar"><span>O valor digitado é de <b>cada parcela</b></span><span class="sw ${F.ehParcela ? "on" : ""}"></span></button>` : ""}</div>`}
    <button class="tgl" data-act="fpago"><span>${d ? "Já foi pago" : "Já foi recebido"}</span><span class="sw ${F.pago ? "on" : ""}"></span></button>
    ${F.erro ? `<div class="erro" role="alert">${esc(F.erro)}</div>` : ""}
    <button class="btn" data-act="salvar">${F.editando ? "Salvar alterações" : "Salvar"}</button>
    ${F.editando ? `<button class="btn perigo" style="margin-top:10px" data-act="excluir">Excluir lançamento</button>` : ""}
  </div>`;
  if (!F.editando && !F.valorTxt && !F._foc) { F._foc = 1; setTimeout(() => $("#f-valor")?.focus(), 60); }
}
function aplicarAutofill() { // escolheu uma descrição já conhecida → preenche o resto
  const u = indices().ultimaDesc[norm(F.desc)]; if (!u || F.editando) return;
  if (F.k === "d") { F.cat ||= u.cat; F.forn ||= u.forn; if (u.tipo) F.tipo = u.tipo; }
  if (!parseNum(F.valorTxt) && u.valor) F.valorTxt = String(u.valor).replace(".", ",");
  sugerirVenc();
}
function salvarForm() {
  const valor = parseNum(F.valorTxt); const d = F.k === "d";
  if (!(valor > 0)) return erroForm("Digite o valor.");
  const desc = F.desc.trim() || F.cat.trim();
  if (!desc) return erroForm(d ? "Diga o que foi (ou escolha uma categoria)." : "Diga de onde veio.");
  if (!F.venc) return erroForm("Escolha a data.");
  const agora = Date.now(), h = hoje();
  const base = { k: F.k, desc, tipo: d ? F.tipo : undefined, cat: d ? F.cat.trim() : undefined, forn: d ? F.forn.trim() : undefined };
  if (F.editando) {
    const it = items.find(x => x.id === F.id); if (!it) return;
    Object.assign(it, { desc, valor, venc: F.venc, mes: mesDe(F.venc), pago: F.pago, pgto: F.pago ? (it.pgto || h) : null, _u: agora });
    if (d) Object.assign(it, { tipo: F.tipo, cat: F.cat.trim(), forn: F.forn.trim(), comp: F.comp });
  } else {
    const n = F.modo === "vista" ? 1 : F.n;
    const parcela = F.modo === "parc" ? (F.ehParcela ? valor : r2(valor / n)) : valor;
    for (let i = 0; i < n; i++) {
      const venc = addMesData(F.venc, i), pagoI = i === 0 && F.pago;
      let val = parcela; if (F.modo === "parc" && !F.ehParcela && i === n - 1) val = r2(valor - parcela * (n - 1)); // fecha centavos
      items.push({ id: uid(), ...base, mes: mesDe(venc), venc, comp: d ? (i === 0 ? F.comp : venc) : undefined, valor: val,
        parc: F.modo === "parc" ? i + 1 : 0, tparc: F.modo === "parc" ? n : 0, pago: pagoI, pgto: pagoI ? h : null, _u: agora });
    }
    mes = mesDe(F.venc);
  }
  invalidar(); salvarItens();
  const msg = F.editando ? "Alterações salvas" : (F.modo === "vista" ? "Lançamento salvo" : `${F.n} lançamentos criados`);
  F = null; renderSheet(); render(); aviso(msg);
}
const erroForm = m => { F.erro = m; renderSheet(); };

/* =============== ações =============== */
function aviso(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(aviso._t); aviso._t = setTimeout(() => t.hidden = true, 2200); }
function mostrarTip(el) {
  const t = $("#tip"); t.textContent = el.dataset.tip; t.hidden = false;
  const r = el.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
  t.style.top = Math.max(8, r.top - h - 6 + 40) + "px";
  clearTimeout(mostrarTip._t); mostrarTip._t = setTimeout(() => t.hidden = true, 3500);
}
function pagar(id) {
  const it = items.find(x => x.id === id); if (!it) return;
  it.pago = !it.pago; it.pgto = it.pago ? hoje() : null; it._u = Date.now(); salvarItens(); render();
}
function baixar(nome, texto, tipo) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([texto], { type: tipo })); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
/* ---------- análise aprofundada com o Claude ---------- */
let AN = null;
const t$ = n => brl(n).replace(/ /g, " ");
const sgn = n => (n > 0 ? "+" : n < 0 ? "−" : "") + t$(Math.abs(n));
const pct = (a, b) => b > 0 ? (a / b * 100).toFixed(0) + "%" : "–";

function gerarRelatorio(m, { lanc = true, pergunta = "" } = {}) {
  const R = resumoMes(m), ant = resumoMes(addMes(m, -1));
  const hist = Array.from({ length: 12 }, (_, i) => addMes(m, i - 11)).map(x => ({ m: x, R: resumoMes(x) }));
  const com = hist.filter(h => h.m < m && (h.R.despesas > 0 || h.R.receitas > 0));
  const media = (campo, n) => { const a = com.slice(-n); return a.length ? a.reduce((s, h) => s + h.R[campo], 0) / a.length : 0; };
  const emAndamento = m >= mesDe(hoje());
  const L = [];
  const P = (...x) => L.push(x.join(""));

  P("# PAPEL");
  P("Você é meu analista financeiro familiar (sou o Tom; minha esposa é a Bi). Analise com rigor, em português do Brasil, sem inventar nada que não esteja nos dados abaixo. Se faltar informação, diga o que falta e pergunte.");
  P("Depois da análise, continue disponível: vou fazer perguntas sobre estes números. Responda sempre com base nos dados, mostrando as contas. Se precisar de mais detalhe (ex.: outro mês, uma categoria, um cartão), peça que eu envio.");
  P("");
  P("# O QUE EU QUERO NA ANÁLISE");
  P("1. Diagnóstico do mês: como fechamos, o que está bom e o que preocupa (com números).");
  P("2. O que mudou em relação ao mês anterior e à média dos últimos 6 meses, e a provável causa de cada mudança relevante.");
  P("3. Gastos fora do padrão, possíveis duplicidades, lançamentos suspeitos ou categorias mal classificadas.");
  P("4. Aderência às metas (dízimo " + cfg.metas.dizimo + "%, fixas " + cfg.metas.fixas + "%, variáveis " + cfg.metas.variaveis + "%, guardar " + cfg.metas.guardar + "% da receita) e o quanto falta/sobra em reais.");
  P("5. Compromissos futuros: parcelas e contas já previstas para os próximos meses, quando ficam mais apertados e quando respiramos.");
  P("6. Cartões: qual pesa mais, e se há concentração de risco.");
  P("7. Plano de ação: 5 ações práticas e priorizadas para o próximo mês, com impacto estimado em reais.");
  P("8. Perguntas que você faria para entender melhor nossos hábitos.");
  P("");
  P("# COMO LER OS DADOS");
  P("- Valores em R$. \"Despesas\" NÃO inclui \"Guardado\" (transferências entre contas e sobra enviada à poupança, fornecedor \"Casa dos Borges\"); guardado é tratado à parte.");
  P("- Sobra = saldo anterior + receitas − despesas − guardado. Nos meses fechados costuma ser R$ 0,00 porque tudo é distribuído; sobra negativa em mês futuro/andamento significa que falta cobrir.");
  P("- \"Fixas\" = despesas do tipo Fixo (sem o dízimo); \"Variáveis\" = tipo Variável. Dízimo é separado.");
  P("- Cartões (fatura entra no mês do vencimento): " + cfg.cartoes.join(", ") + ".");
  P("- Mês analisado: " + mesNome(m) + ". Hoje é " + fmtDia(hoje()) + "/" + hoje().slice(0, 4) + "." + (emAndamento ? " ATENÇÃO: este mês ainda não terminou/está em planejamento, então os números podem estar incompletos." : ""));
  P("");

  P("# 1. RESUMO DE " + mesNome(m).toUpperCase());
  P("Receitas: ", t$(R.receitas), (R.saldoAnt ? ` (+ saldo anterior ${t$(R.saldoAnt)})` : ""));
  P("Despesas: ", t$(R.despesas), ` — fixas ${t$(R.fixas)}, dízimo ${t$(R.dizimo)}, variáveis ${t$(R.variaveis)}`);
  P("Guardado/transferido: ", t$(R.guardado));
  P("Sobra: ", t$(R.sobra));
  P("Já pago: ", t$(R.pago), " (", pct(R.pago, R.despesas), " das despesas) | Falta pagar: ", t$(R.pendente));
  P("Metas sobre a receita (", t$(R.receitas), "): dízimo ", pct(R.dizimo, R.receitas), " (meta ", cfg.metas.dizimo, "%) | fixas ", pct(R.fixas, R.receitas), " (meta ", cfg.metas.fixas, "%) | variáveis ", pct(R.variaveis, R.receitas), " (meta ", cfg.metas.variaveis, "%) | guardado ", pct(R.guardado, R.receitas), " (meta ", cfg.metas.guardar, "%)");
  P("");

  P("# 2. HISTÓRICO DOS ÚLTIMOS 12 MESES");
  P("mês | receitas | despesas | fixas+dízimo | variáveis | guardado | sobra");
  for (const h of hist) P(h.m, " | ", t$(h.R.receitas), " | ", t$(h.R.despesas), " | ", t$(h.R.fixas + h.R.dizimo), " | ", t$(h.R.variaveis), " | ", t$(h.R.guardado), " | ", t$(h.R.sobra));
  P("Médias (meses com dados): despesas 3m ", t$(media("despesas", 3)), " | 6m ", t$(media("despesas", 6)), " | 12m ", t$(media("despesas", 12)), "; receitas 6m ", t$(media("receitas", 6)), "; variáveis 6m ", t$(media("variaveis", 6)), "; guardado 6m ", t$(media("guardado", 6)));
  P("");

  P("# 3. CATEGORIAS: MÊS × MÊS ANTERIOR × MÉDIA 6 MESES");
  const ms6 = com.slice(-6).map(h => Object.fromEntries(porCategoria(h.R.gastos)));
  const cAt = Object.fromEntries(porCategoria(R.gastos)), cAn = Object.fromEntries(porCategoria(ant.gastos));
  const cats = [...new Set([...Object.keys(cAt), ...Object.keys(cAn), ...ms6.flatMap(o => Object.keys(o))])].map(c => {
    const med = ms6.length ? ms6.reduce((s, o) => s + (o[c] || 0), 0) / ms6.length : 0; return [c, cAt[c] || 0, cAn[c] || 0, med];
  }).sort((a, b) => Math.max(b[1], b[3]) - Math.max(a[1], a[3])).slice(0, 18);
  P("categoria | mês | % das despesas | mês anterior | média 6m | diferença vs média");
  for (const [c, a, b, md] of cats) P(c, " | ", t$(a), " | ", pct(a, R.despesas), " | ", t$(b), " | ", t$(md), " | ", sgn(a - md));
  P("");

  P("# 4. CARTÕES (FATURA DO MÊS)");
  const fA = Object.fromEntries(porForn(R.gastos)), fB = Object.fromEntries(porForn(ant.gastos));
  for (const c of [...new Set([...Object.keys(fA), ...Object.keys(fB)])]) P(c, ": ", t$(fA[c] || 0), " (mês anterior ", t$(fB[c] || 0), ")");
  P("");

  P("# 5. MAIORES DESPESAS DO MÊS");
  const lin = x => `${fmtDia(x.venc)} | ${x.cat || "-"} | ${x.forn || "-"} | ${x.desc}${x.tparc > 1 ? ` (${x.parc}/${x.tparc})` : ""} | ${t$(x.valor)}`;
  R.gastos.slice().sort((a, b) => b.valor - a.valor).slice(0, 15).forEach(x => P(lin(x)));
  P("");

  P("# 6. CONTAS FIXAS DO MÊS (com variação sobre o mês anterior)");
  const antFix = new Map(ant.gastos.filter(x => x.tipo === "Fixo").map(x => [norm(x.desc) + "|" + norm(x.forn), x.valor]));
  R.gastos.filter(x => x.tipo === "Fixo").sort((a, b) => b.valor - a.valor).forEach(x => {
    const a = antFix.get(norm(x.desc) + "|" + norm(x.forn)); P(x.desc, " (", x.forn || "-", "): ", t$(x.valor), a == null ? " [novo/sem correspondente]" : ` [mês anterior ${t$(a)}, ${sgn(x.valor - a)}]`);
  });
  P("");

  P("# 7. PARCELAMENTOS E COMPROMISSOS FUTUROS");
  const parc = R.gastos.filter(x => x.tparc > 1 && x.parc <= x.tparc).sort((a, b) => b.valor - a.valor);
  const restante = parc.reduce((s, x) => s + (x.tparc - x.parc) * x.valor, 0);
  P("Parcelas ativas neste mês: ", parc.length, " somando ", t$(parc.reduce((s, x) => s + x.valor, 0)), " por mês. Ainda a pagar depois deste mês (estimativa = parcelas restantes × valor atual): ", t$(restante));
  P("descrição | cartão/fornecedor | parcela | valor da parcela | parcelas restantes | total restante");
  parc.slice(0, 40).forEach(x => P(x.desc, " | ", x.forn || "-", " | ", x.parc, "/", x.tparc, " | ", t$(x.valor), " | ", x.tparc - x.parc, " | ", t$((x.tparc - x.parc) * x.valor)));
  P("Previsão já lançada na planilha para os próximos meses (pode estar incompleta; só inclui o que já foi lançado):");
  for (let i = 1; i <= 6; i++) { const mm = addMes(m, i), r = resumoMes(mm); P(mm, ": receitas ", t$(r.receitas), " | despesas ", t$(r.despesas), " | guardado ", t$(r.guardado), " | sobra ", t$(r.sobra)); }
  P("");

  P("# 8. PENDENTES (NÃO PAGAS) DE " + mesNome(m).toUpperCase());
  const pend = R.gastos.filter(x => !x.pago && x.valor > 0).sort((a, b) => (a.venc || "").localeCompare(b.venc || ""));
  if (!pend.length) P("Nenhuma."); pend.forEach(x => P(lin(x), x.venc && x.venc < hoje() ? " [ATRASADA]" : ""));
  P("");

  P("# 9. RECEITAS DO MÊS");
  vivos().filter(x => x.k === "r" && x.mes === m).sort((a, b) => (a.venc || "").localeCompare(b.venc || "")).forEach(x => P(fmtDia(x.venc), " | ", x.desc, " | ", t$(x.valor), x.carry ? " [saldo anterior]" : "", x.pago ? "" : " [a receber]"));
  P("");

  if (lanc) {
    P("# 10. TODOS OS LANÇAMENTOS DO MÊS (data | tipo | categoria | cartão/fornecedor | descrição | valor | pago)");
    vivos().filter(x => x.mes === m).sort((a, b) => (a.venc || "").localeCompare(b.venc || "")).forEach(x =>
      P(fmtDia(x.venc), " | ", x.k === "r" ? "Receita" : (x.transf ? "Guardado" : x.tipo), " | ", x.cat || "-", " | ", x.forn || "-", " | ", x.desc, x.tparc > 1 ? ` (${x.parc}/${x.tparc})` : "", " | ", t$(x.valor), " | ", x.pago ? "sim" : "não"));
    P("");
  }
  if (pergunta.trim()) { P("# MINHA PERGUNTA / FOCO"); P(pergunta.trim()); P(""); }
  P("# AGORA");
  P("Faça a análise completa seguindo os 8 pontos acima, destacando primeiro o mais importante. Termine perguntando o que eu quero aprofundar.");
  return L.join("\n");
}

function abrirAnalise() { AN = { m: mes, lanc: true, pergunta: "" }; renderAnalise(); }
function renderAnalise() {
  const el = $("#sheet"); el.hidden = false; document.body.style.overflow = "hidden";
  const txt = gerarRelatorio(AN.m, AN);
  AN.txt = txt;
  el.innerHTML = `<div class="folha" role="dialog" aria-modal="true" aria-label="Analisar com o Claude">
    <div class="puxador"></div>
    <div class="cab"><b>Analisar com o Claude</b><button class="icon-btn" data-act="fechar-imp" aria-label="Fechar">${ICON.x}</button></div>
    <div class="card" style="margin-bottom:14px"><div style="font-weight:650">${mesNome(AN.m)}</div>
      <div class="muted sm" style="margin-top:4px">Gera um relatório completo (resumo, 12 meses, categorias, cartões, parcelas, pendências e metas) e já pede ao Claude que atue como seu analista e responda suas perguntas.</div></div>
    <div class="campo"><label for="an-perg">Sua pergunta ou foco (opcional)</label>
      <input id="an-perg" value="${esc(AN.pergunta)}" placeholder="Ex.: Por que gastamos mais com mercado? Dá para guardar mais?" autocomplete="off"></div>
    <button class="tgl" data-act="an-lanc"><span>Incluir todos os lançamentos do mês</span><span class="sw ${AN.lanc ? "on" : ""}"></span></button>
    <div class="muted sm" id="an-tam" style="margin:0 4px 12px"></div>
    <button class="btn" data-act="an-copiar">Copiar relatório</button>
    ${navigator.share ? `<button class="btn sec" style="margin-top:8px" data-act="an-share">Compartilhar…</button>` : ""}
    <div class="card" style="margin-top:14px"><b>Como usar</b><ol class="sm" style="margin:8px 0 0;padding-left:20px;line-height:1.6">
      <li>Toque em <b>Copiar relatório</b>.</li><li>Abra o app do <b>Claude</b> e inicie uma conversa nova.</li><li><b>Cole</b> e envie. Ele analisa e depois você faz suas perguntas ali mesmo.</li></ol>
      <div class="muted sm" style="margin-top:8px">Os dados só saem do app quando você cola no Claude.</div></div>
    <details style="margin-top:10px"><summary>Ver o texto que será copiado</summary><textarea id="an-txt" readonly style="width:100%;height:220px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:10px;font-size:12px"></textarea></details></div>`;
  $("#an-txt").value = txt; atualizarTamanhoRelatorio();
}
function atualizarTamanhoRelatorio() {
  if (!AN) return; AN.txt = gerarRelatorio(AN.m, AN);
  const t = $("#an-tam"), ta = $("#an-txt"); if (ta) ta.value = AN.txt;
  if (t) t.textContent = `${AN.txt.split("\n").length} linhas · ${(AN.txt.length / 1000).toFixed(0)} mil caracteres`;
}
async function copiarRelatorio() {
  atualizarTamanhoRelatorio();
  try { await navigator.clipboard.writeText(AN.txt); aviso("Copiado! Cole no Claude."); }
  catch { const ta = $("#an-txt"); ta.parentElement.open = true; ta.focus(); ta.select(); try { document.execCommand("copy"); aviso("Copiado! Cole no Claude."); } catch { aviso("Selecione o texto e copie manualmente."); } }
}
async function compartilharRelatorio() {
  atualizarTamanhoRelatorio();
  try { await navigator.share({ title: `Finanças ${mesNome(AN.m)}`, text: AN.txt }); } catch { /* cancelado */ }
}

/* ---------- importar a planilha .xlsx (lida no próprio aparelho) ---------- */
let IMP = null;
const carregarScript = src => new Promise((ok, falha) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok;
  s.onerror = () => falha(new Error("Não consegui carregar o leitor de planilhas. Confira a internet e tente de novo."));
  document.head.appendChild(s);
});
async function abrirImportacao(arq) {
  let buf; try { buf = await arq.arrayBuffer(); } catch { return aviso("Não consegui abrir o arquivo."); }
  const b = new Uint8Array(buf.slice(0, 4));
  const cript = b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0;
  const xlsx = b[0] === 0x50 && b[1] === 0x4b;
  if (!cript && !xlsx) return aviso("Esse arquivo não é uma planilha .xlsx.");
  IMP = { buf, nome: arq.name, cript, rodando: false };
  const el = $("#sheet"); el.hidden = false; document.body.style.overflow = "hidden";
  el.innerHTML = `<div class="folha" role="dialog" aria-modal="true" aria-label="Importar planilha">
    <div class="puxador"></div>
    <div class="cab"><b>Importar planilha</b><button class="icon-btn" data-act="fechar-imp" aria-label="Fechar">${ICON.x}</button></div>
    <div class="card" style="margin-bottom:14px"><div style="font-weight:600;word-break:break-all">${esc(arq.name)}</div><div class="muted sm">${(arq.size / 1024).toFixed(0)} KB${cript ? " · protegida por senha" : ""}</div></div>
    ${cript ? `<div class="campo"><label for="imp-senha">Senha da planilha</label><input id="imp-senha" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Digite a senha"></div>
      <div class="muted sm" style="margin:-6px 4px 14px">A senha é usada só para abrir o arquivo neste celular. Ela não é salva nem enviada para a internet.</div>` : ""}
    <div class="erro" id="imp-erro" role="alert" hidden></div>
    <div class="muted sm" id="imp-status" style="margin:0 4px 12px" hidden></div>
    <button class="btn" data-act="imp-go" id="imp-btn">Importar</button></div>`;
  if (cript) setTimeout(() => $("#imp-senha")?.focus(), 80);
}
async function rodarImportacao() {
  if (!IMP || IMP.rodando) return;
  const senha = $("#imp-senha")?.value || "", err = $("#imp-erro"), st = $("#imp-status"), btn = $("#imp-btn");
  if (IMP.cript && !senha) { err.hidden = false; err.textContent = "Digite a senha."; return; }
  err.hidden = true; IMP.rodando = true; btn.disabled = true; btn.textContent = "Abrindo…";
  st.hidden = false; st.textContent = IMP.cript ? "Abrindo a planilha. Isso pode levar até 30 segundos, aguarde…" : "Lendo a planilha…";
  await new Promise(r => setTimeout(r, 50)); // deixa a mensagem aparecer
  try {
    if (!window.XLSX) await carregarScript("vendor/xlsx.full.min.js");
    if (!window.FinImport) await carregarScript("importar-xlsx.js");
    const r = await window.FinImport.ler(IMP.buf, senha, { cartoes: cfg.cartoes, mesAtual: mesDe(hoje()) });
    const novos = [...r.despesas, ...r.receitas];
    const agora = Date.now(), ids = new Set(novos.map(x => x.id)); let removidos = 0;
    for (const x of items) if (x.src === "xlsx" && !x._del && !ids.has(x.id)) { x._del = true; x._u = agora; removidos++; }
    const mapa = new Map(items.map(x => [x.id, x]));
    for (const x of novos) { x.src = "xlsx"; x._u = agora; mapa.set(x.id, x); }
    items = [...mapa.values()]; invalidar(); salvarItens();
    IMP = null; const el = $("#sheet"); el.hidden = true; el.innerHTML = ""; document.body.style.overflow = "";
    mes = mesDe(hoje()); view = "home"; render(); window.scrollTo(0, 0);
    aviso(`Pronto! ${r.despesas.length} despesas e ${r.receitas.length} receitas de ${r.meses} meses${removidos ? ` (${removidos} removidos)` : ""}`);
  } catch (e) {
    IMP.rodando = false; btn.disabled = false; btn.textContent = "Importar"; st.hidden = true;
    err.hidden = false; err.textContent = e.message || "Não consegui importar.";
  }
}
function importarJson(txt) {
  let j; try { j = JSON.parse(txt); } catch { return aviso("Arquivo inválido."); }
  const novos = [...(j.despesas || []), ...(j.receitas || [])];
  if (!novos.length) return aviso("Nenhum lançamento no arquivo.");
  const agora = Date.now(); const mapa = new Map(items.map(x => [x.id, x]));
  for (const x of novos) { x._u = agora; mapa.set(x.id, x); }
  items = [...mapa.values()]; invalidar(); salvarItens(); render(); aviso(`${novos.length} lançamentos importados`);
}

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); const tip = e.target.closest("[data-tip]");
  if (tip) mostrarTip(tip); else $("#tip").hidden = true;
  if (!el) { if (e.target.id === "sheet") { F = null; renderSheet(); } return; }
  const a = el.dataset.act;
  if (a === "pagar") { e.stopPropagation(); return pagar(el.dataset.id); }
  const A = {
    nav: () => { view = el.dataset.v; render(); window.scrollTo(0, 0); },
    mes: () => { mes = addMes(mes, +el.dataset.n); render(); },
    "mes-hoje": () => { mes = mesDe(hoje()); render(); },
    novo: () => novoForm("d"),
    editar: () => { const it = items.find(x => x.id === el.dataset.id); if (it) novoForm(it.k, { ...it, cat: it.cat || "", forn: it.forn || "", comp: it.comp || it.venc }); },
    fechar: () => { F = null; renderSheet(); },
    fk: () => { F.k = el.dataset.k; renderSheet(); },
    fcat: () => { F.cat = F.cat === el.dataset.v ? "" : el.dataset.v; renderSheet(); },
    fforn: () => { F.forn = F.forn === el.dataset.v ? "" : el.dataset.v; sugerirVenc(); renderSheet(); },
    ftipo2: () => { F.tipo = el.dataset.v; renderSheet(); },
    fmodo: () => { F.modo = el.dataset.v; if (F.modo === "mensal" && F.n < 12) F.n = 12; if (F.modo === "parc" && F.n > 36) F.n = 2; if (F.modo === "mensal") F.tipo = "Fixo"; renderSheet(); },
    fn: () => { F.n = Math.max(2, Math.min(60, F.n + +el.dataset.d)); renderSheet(); },
    fpar: () => { F.ehParcela = !F.ehParcela; renderSheet(); },
    fpago: () => { F.pago = !F.pago; renderSheet(); },
    salvar: salvarForm,
    excluir: () => { if (confirm("Excluir este lançamento?")) { const it = items.find(x => x.id === F.id); if (it) { it._del = true; it._u = Date.now(); } invalidar(); salvarItens(); F = null; renderSheet(); render(); aviso("Lançamento excluído"); } },
    ftipo: () => { filtro.tipo = el.dataset.k; render(); },
    cat: () => { filtro = { q: "", tipo: "d", cat: el.dataset.cat, forn: "" }; view = "lanc"; render(); window.scrollTo(0, 0); },
    cartao: () => { filtro = { q: "", tipo: "d", cat: "", forn: el.dataset.forn }; view = "lanc"; render(); window.scrollTo(0, 0); },
    "ver-pendentes": () => { filtro = { q: "", tipo: "pend", cat: "", forn: "" }; view = "lanc"; render(); window.scrollTo(0, 0); },
    faixa: () => { faixa = el.dataset.k; render(); },
    tema: () => { cfg.tema = el.dataset.k; salvarCfg(); aplicarTema(); render(); },
    importar: () => $("#arq").click(),
    "importar-xlsx": () => $("#arq-xlsx").click(),
    "imp-go": () => rodarImportacao(),
    "fechar-imp": () => { IMP = null; AN = null; F = null; renderSheet(); },
    analise: () => abrirAnalise(),
    "an-lanc": () => { AN.lanc = !AN.lanc; renderAnalise(); },
    "an-copiar": () => copiarRelatorio(),
    "an-share": () => compartilharRelatorio(),
    exportar: () => baixar(`financas-backup-${hoje()}.json`, JSON.stringify({ versao: 1, despesas: vivos().filter(x => x.k === "d"), receitas: vivos().filter(x => x.k === "r") }), "application/json"),
    "exportar-csv": () => {
      const cab = ["tipo", "mes", "vencimento", "data_compra", "tipo_despesa", "categoria", "fornecedor", "descricao", "parcela", "total_parcelas", "valor", "pago"];
      const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const linhas = vivos().sort((a, b) => a.mes.localeCompare(b.mes)).map(x => [x.k === "d" ? "Despesa" : "Receita", x.mes, x.venc, x.comp, x.tipo, x.cat, x.forn, x.desc, x.parc, x.tparc, String(x.valor).replace(".", ","), x.pago ? "Sim" : "Não"].map(q).join(";"));
      baixar(`financas-${hoje()}.csv`, "﻿" + [cab.join(";"), ...linhas].join("\n"), "text/csv;charset=utf-8");
    },
    apagar: () => { if (confirm("Apagar TODOS os dados deste celular? (se estiver sincronizado, eles voltam do servidor)") && confirm("Tem certeza?")) { items = []; invalidar(); gravar(LS_ITEMS, []); cfg.supa.lastPull = 0; cfg.supa.lastPush = 0; salvarCfg(); render(); } },
    conectar: conectarSupa, desconectar: () => { cfg.supa = { ...CFG_PADRAO.supa, url: cfg.supa.url, key: cfg.supa.key, email: cfg.supa.email }; salvarCfg(); render(); },
    "sync-agora": () => sincronizar(true),
  };
  A[a]?.();
});
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('.item[data-act="editar"]')) { e.preventDefault(); e.target.click(); } if (e.key === "Escape" && F) { F = null; renderSheet(); } });
document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "an-perg") { AN.pergunta = t.value; atualizarTamanhoRelatorio(); return; }
  if (t.id === "q") { filtro.q = t.value; $("#lista").innerHTML = htmlLista(); return; }
  if (!F) return;
  if (t.id === "f-valor") { F.valorTxt = t.value; const c = $(".calc"); if (c) { const v = parseNum(t.value); c.textContent = !F.editando && F.modo === "parc" && v > 0 ? `${F.n}× de ${brl(F.ehParcela ? v : r2(v / F.n))}` : (!F.editando && F.modo === "mensal" && v > 0 ? `${brl(v)} por mês, por ${F.n} meses` : ""); } }
  else if (t.id === "f-desc") F.desc = t.value;
  else if (t.id === "f-cat") F.cat = t.value;
  else if (t.id === "f-forn") F.forn = t.value;
  else if (t.id === "f-comp") { F.comp = t.value; sugerirVenc(); }
  else if (t.id === "f-venc") { F.venc = t.value; F.vencManual = true; F.pago = F.venc <= hoje() ? F.pago : false; }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "fcat") { filtro.cat = t.value; $("#lista").innerHTML = htmlLista(); }
  else if (t.id === "fforn") { filtro.forn = t.value; $("#lista").innerHTML = htmlLista(); }
  else if (t.id === "arq" && t.files[0]) { t.files[0].text().then(importarJson); t.value = ""; }
  else if (t.id === "arq-xlsx" && t.files[0]) { abrirImportacao(t.files[0]); t.value = ""; }
  else if (t.dataset?.meta) { cfg.metas[t.dataset.meta] = Math.max(0, Math.min(100, parseNum(t.value))); salvarCfg(); }
  else if (t.id === "cartoes") { cfg.cartoes = t.value.split(",").map(s => s.trim()).filter(Boolean); salvarCfg(); invalidar(); }
  // Atenção: nestes casos NÃO redesenhar a folha — o "change" dispara ao sair do campo, no meio do toque
  // no próximo botão, e redesenhar fazia esse toque se perder. Só atualizamos os campos no lugar.
  else if (F && (t.id === "f-desc")) { aplicarAutofill(); patchForm(); }
  else if (F && (t.id === "f-forn" || t.id === "f-cat")) { sugerirVenc(); patchForm(); }
  else if (F && (t.id === "f-comp" || t.id === "f-venc")) patchForm();
});
function patchForm() {
  const folha = $("#sheet .folha"); if (!folha) return;
  const set = (id, v) => { const el = $("#" + id); if (el && document.activeElement !== el && el.value !== v) el.value = v; };
  set("f-valor", F.valorTxt); set("f-comp", F.comp || ""); set("f-venc", F.venc || "");
  folha.querySelectorAll('[data-act="fcat"]').forEach(b => b.classList.toggle("on", b.dataset.v === F.cat));
  folha.querySelectorAll('[data-act="fforn"]').forEach(b => b.classList.toggle("on", b.dataset.v === F.forn));
  folha.querySelectorAll('[data-act="ftipo2"]').forEach(b => b.classList.toggle("on", (b.dataset.v === "Fixo") === (F.tipo === "Fixo")));
  const sw = folha.querySelector('[data-act="fpago"] .sw'); if (sw) sw.classList.toggle("on", !!F.pago);
  const c = $(".calc"), v = parseNum(F.valorTxt);
  if (c) c.textContent = !F.editando && F.modo === "parc" && v > 0 ? `${F.n}× de ${brl(F.ehParcela ? v : r2(v / F.n))}` : "";
}

/* =============== sincronização (Supabase, opcional) =============== */
let syncMsg = "", syncTimer = null, syncando = false;
const sp = () => cfg.supa;
async function supaAuth(body, tipo) {
  const r = await fetch(`${sp().url.replace(/\/$/, "")}/auth/v1/token?grant_type=${tipo}`, { method: "POST", headers: { apikey: sp().key, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error_description || j.msg || j.message || `Erro ${r.status}`);
  sp().access = j.access_token; sp().refresh = j.refresh_token; sp().exp = Date.now() + (j.expires_in - 60) * 1000; salvarCfg();
}
async function token() { if (Date.now() > sp().exp) await supaAuth({ refresh_token: sp().refresh }, "refresh_token"); return sp().access; }
async function supaReq(path, opt = {}) {
  const r = await fetch(`${sp().url.replace(/\/$/, "")}/rest/v1/${path}`, { ...opt, headers: { apikey: sp().key, Authorization: `Bearer ${await token()}`, "Content-Type": "application/json", ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 120)}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}
async function conectarSupa() {
  const g = id => $("#" + id).value.trim(); const err = $("#s-erro");
  Object.assign(sp(), { url: g("s-url"), key: g("s-key"), email: g("s-email") }); salvarCfg();
  try {
    if (!sp().url || !sp().key || !sp().email || !$("#s-pass").value) throw new Error("Preencha todos os campos.");
    await supaAuth({ email: sp().email, password: $("#s-pass").value }, "password");
    await sincronizar(true); render(); aviso("Conectado!");
  } catch (e) { err.hidden = false; err.textContent = "Não consegui conectar: " + e.message; }
}
function agendarSync() { if (!sp().refresh) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => sincronizar(false), 1500); }
async function sincronizar(manual) {
  if (!sp().refresh || syncando || !navigator.onLine) return; syncando = true;
  try {
    syncMsg = "sincronizando…"; if (view === "cfg") render();
    const sujos = items.filter(x => (x._u || 0) > sp().lastPush);
    for (let i = 0; i < sujos.length; i += 400) {
      const lote = sujos.slice(i, i + 400).map(x => { const { _u, _del, ...dados } = x; return { id: x.id, dados, atualizado: _u, apagado: !!_del }; });
      await supaReq("lancamentos?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(lote) });
    }
    if (sujos.length) sp().lastPush = Math.max(...sujos.map(x => x._u));
    // paginação por offset com ordem estável (atualizado, id): muitas linhas podem ter o mesmo "atualizado"
    // (ex.: importação inicial), e "gt" sozinho parava após a 1ª página de 1000.
    const base = sp().lastPull; let desde = base, mudou = 0, off = 0;
    for (;;) {
      const rows = await supaReq(`lancamentos?select=id,dados,atualizado,apagado&atualizado=gte.${base}&order=atualizado.asc,id.asc&limit=1000&offset=${off}`);
      if (!rows?.length) break;
      const mapa = new Map(items.map(x => [x.id, x]));
      for (const r of rows) { const l = mapa.get(r.id); if (!l || r.atualizado > (l._u || 0)) { mapa.set(r.id, { ...r.dados, _u: r.atualizado, _del: r.apagado }); mudou++; } desde = Math.max(desde, r.atualizado); }
      items = [...mapa.values()]; if (rows.length < 1000) break;
      off += rows.length;
    }
    sp().lastPull = desde; if (mudou) { invalidar(); gravar(LS_ITEMS, items); }
    salvarCfg(); syncMsg = `última sincronização às ${new Date().toTimeString().slice(0, 5)}`;
    if (mudou && !F) render(); else if (view === "cfg" && !F) render();
    if (manual) aviso(mudou ? `${mudou} novidades recebidas` : "Tudo em dia");
  } catch (e) { syncMsg = "erro: " + e.message; if (manual) aviso("Falha ao sincronizar"); if (view === "cfg" && !F) render(); }
  finally { syncando = false; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sincronizar(false); });
window.addEventListener("online", () => sincronizar(false));

/* =============== inicialização =============== */
function aplicarTema() { if (cfg.tema === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", cfg.tema); }
aplicarTema(); render(); sincronizar(false);
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
