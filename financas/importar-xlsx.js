/* Leitor da planilha da família (.xlsx) — roda 100% no aparelho, nada é enviado para a internet.
   Abre planilhas com senha do Excel (criptografia "Agile", Office 2010+): a senha é usada só aqui, na memória. */
(() => {
"use strict";
const CARTOES_PADRAO = ["Santander Bi", "Santander Tom", "Credicard", "Itaú Tom", "Carrefour Tom"];
const FIX_CAT = {
  "Alimentação/Lanches": "Alimentação/Lanche", "Allimentação/Lanches": "Alimentação/Lanche",
  "Alimentacao/Lanches": "Alimentação/Lanche", "Alimentção/Lanche": "Alimentação/Lanche",
  "Aimentação/Refeição": "Refeição", "Alimentação/Refeição": "Refeição", "Almoço": "Refeição",
  "Alimetação/Mercado": "Alimentação/Mercado", "Abastecimaneto": "Abastecimento",
  "Aniversários": "Aniversário", "Medicamento": "Medicamentos",
  "Manuteção Casa": "Manutenção Casa", "Dizimo": "Dízimo",
  "Ajuste Cartão": "Ajuste", "Diferença": "Ajuste", "Desconto": "Ajuste",
};

/* ---------- bytes ---------- */
const u8 = b => b instanceof Uint8Array ? b : new Uint8Array(b);
const concat = (...a) => { const o = new Uint8Array(a.reduce((s, x) => s + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const le32 = n => new Uint8Array([n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255]);
const sha512 = async d => new Uint8Array(await crypto.subtle.digest("SHA-512", d));
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const utf16 = s => { const o = new Uint8Array(s.length * 2); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); o[2 * i] = c & 255; o[2 * i + 1] = c >> 8; } return o; };
const iguais = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const ehCriptografado = buf => { const b = u8(buf); return b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0; };

/* AES-CBC "cru" (sem padding) usando WebCrypto: acrescenta um bloco de padding válido e descarta depois */
async function aesDec(chave, iv, dados) {
  const pad = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv: dados.slice(dados.length - 16) }, chave, new Uint8Array(0)));
  const r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", iv }, chave, concat(dados, pad)));
  return r.slice(0, dados.length);
}
const importaAes = k => crypto.subtle.importKey("raw", k, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]);

async function descriptografar(buf, senha) {
  const X = window.XLSX;
  const cfb = X.CFB.read(u8(buf), { type: "array" });
  const info = X.CFB.find(cfb, "EncryptionInfo"), pkg = X.CFB.find(cfb, "EncryptedPackage");
  if (!info || !pkg) throw new Error("Este arquivo não é uma planilha do Excel protegida por senha.");
  const ei = u8(info.content);
  if (!(ei[0] === 4 && ei[2] === 4)) throw new Error("A senha desta planilha usa um formato antigo do Excel. Abra no Excel, tire a senha, salve e envie de novo.");
  const xml = new TextDecoder().decode(ei.slice(8));
  const doc = new DOMParser().parseFromString(xml.slice(xml.indexOf("<")), "application/xml");
  const kd = doc.getElementsByTagNameNS("*", "keyData")[0], ek = doc.getElementsByTagNameNS("*", "encryptedKey")[0];
  if (!kd || !ek) throw new Error("Não entendi a proteção desta planilha.");
  for (const el of [kd, ek]) if (el.getAttribute("hashAlgorithm") !== "SHA512" || el.getAttribute("cipherAlgorithm") !== "AES" || el.getAttribute("cipherChaining") !== "ChainingModeCBC")
    throw new Error("Esta proteção não é suportada. Tire a senha no Excel e envie de novo.");

  const salt = b64(ek.getAttribute("saltValue")), spin = +ek.getAttribute("spinCount"), bits = +ek.getAttribute("keyBits");
  let h = await sha512(concat(salt, utf16(senha)));
  for (let i = 0; i < spin; i++) h = await sha512(concat(le32(i), h));
  const derivar = async bloco => { const hf = await sha512(concat(h, new Uint8Array(bloco))); const k = new Uint8Array(bits / 8).fill(0x36); k.set(hf.slice(0, k.length)); return importaAes(k); };

  // confere a senha
  const verIn = await aesDec(await derivar([0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79]), salt, b64(ek.getAttribute("encryptedVerifierHashInput")));
  const verVal = await aesDec(await derivar([0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e]), salt, b64(ek.getAttribute("encryptedVerifierHashValue")));
  const hv = await sha512(verIn.slice(0, +ek.getAttribute("saltSize")));
  if (!iguais(hv, verVal.slice(0, hv.length))) throw new Error("Senha incorreta.");

  const chaveBruta = (await aesDec(await derivar([0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6]), salt, b64(ek.getAttribute("encryptedKeyValue")))).slice(0, bits / 8);
  const chave = await importaAes(chaveBruta), kdSalt = b64(kd.getAttribute("saltValue"));
  const p = u8(pkg.content), tam = p[0] + p[1] * 2 ** 8 + p[2] * 2 ** 16 + p[3] * 2 ** 24 + (p[4] + p[5] * 2 ** 8) * 2 ** 32;
  const dados = p.slice(8), partes = [];
  for (let i = 0, off = 0; off < dados.length; i++, off += 4096) {
    const iv = (await sha512(concat(kdSalt, le32(i)))).slice(0, 16);
    partes.push(await aesDec(chave, iv, dados.slice(off, off + 4096)));
  }
  return concat(...partes).slice(0, tam);
}

/* ---------- leitura das abas ---------- */
const p2 = n => String(n).padStart(2, "0");
const dstr = v => { if (typeof v !== "number" || !isFinite(v)) return null; const d = new Date(Math.round((v - 25569) * 864e5)); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`; };
const num = v => typeof v === "number" ? Math.round(v * 100) / 100 : 0;
const txt = v => v == null ? "" : String(v).trim();

function lerAbas(wb, { cartoes = CARTOES_PADRAO, mesAtual } = {}) {
  const X = window.XLSX, despesas = [], receitas = [];
  mesAtual = mesAtual || `${new Date().getFullYear()}-${p2(new Date().getMonth() + 1)}`;
  const abas = [];
  for (const nome of wb.SheetNames) {
    const m = /^(\d\d)\.(\d{4})$/.exec(nome.trim()); if (!m) continue;
    const mes = `${m[2]}-${m[1]}`; abas.push(mes);
    const rows = X.utils.sheet_to_json(wb.Sheets[nome], { header: 1, raw: true, defval: null, blankrows: true });
    const head = {}; (rows[2] || []).forEach((c, i) => { if (c != null && txt(c)) head[txt(c).toUpperCase()] = i; });
    const temConta = head["P. CONTA"] != null, iData = head["DATA"];
    for (let i = 3; i < rows.length; i++) {
      const v = rows[i]; while (v.length < 17) v.push(null);
      const linha = i + 1;
      const [tipo, cat, forn, desc, parc, tparc, valor, dpg, pg] = temConta ? [v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10]] : [v[2], null, v[3], v[4], v[5], v[6], v[7], v[8], v[9]];
      if (txt(tipo) && (txt(desc) || txt(forn))) {
        despesas.push({
          id: `x-${mes}-${linha}-d`, k: "d", mes, venc: dstr(v[0]), comp: dstr(v[1]),
          tipo: txt(tipo) === "Fixo" ? "Fixo" : "Variável",
          cat: FIX_CAT[txt(cat)] || txt(cat), forn: txt(forn), desc: txt(desc),
          parc: typeof parc === "number" ? Math.round(parc) : 0, tparc: typeof tparc === "number" ? Math.round(tparc) : 0,
          valor: num(valor), pgto: dstr(dpg), pago: txt(pg).toLowerCase() === "pago", nota: typeof valor === "string" ? txt(valor) : "",
        });
      }
      if (iData != null) {
        const nome = v[iData + 1];
        if (txt(nome) && !txt(nome).startsWith("RECEITAS (-)")) {
          receitas.push({
            id: `x-${mes}-${linha}-r`, k: "r", mes, venc: dstr(v[iData]), desc: txt(nome), valor: num(v[iData + 2]),
            pago: txt(v[iData + 3]).toLowerCase() === "recebido" || mes < mesAtual, carry: /^saldo/i.test(txt(nome)),
          });
        }
      }
    }
  }
  if (!abas.length) throw new Error("Não achei abas de meses (como 10.2026) nesta planilha.");
  // meses antigos sem "P. CONTA": deduz a categoria pela descrição mais usada nos outros meses
  const porDesc = {};
  for (const x of despesas) if (x.cat) { const o = (porDesc[x.desc.toLowerCase()] ||= {}); o[x.cat] = (o[x.cat] || 0) + 1; }
  for (const x of despesas) {
    if (!x.cat) { const o = porDesc[x.desc.toLowerCase()]; x.cat = o ? Object.entries(o).sort((a, b) => b[1] - a[1])[0][0] : ""; }
    x.transf = x.forn === "Casa dos Borges";
    if (x.transf && !x.cat) x.cat = "Transferência";
    if (!x.cat) x.cat = "Sem categoria";
  }
  return { despesas, receitas, meses: abas.length };
}

async function ler(buf, senha, opcoes) {
  if (!window.XLSX) throw new Error("Leitor de planilhas não carregou.");
  let bytes = u8(buf);
  if (ehCriptografado(bytes)) {
    if (!senha) throw new Error("Esta planilha tem senha. Digite a senha.");
    bytes = await descriptografar(bytes, senha);
  }
  if (!(bytes[0] === 0x50 && bytes[1] === 0x4b)) throw new Error("Este arquivo não parece ser uma planilha .xlsx.");
  const wb = window.XLSX.read(bytes, { type: "array" });
  return lerAbas(wb, opcoes);
}

window.FinImport = { ehCriptografado, ler };
})();
