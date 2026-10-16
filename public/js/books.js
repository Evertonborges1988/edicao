// Livros na ordem do cânon protestante: [nome, abreviação, ...apelidos]
export const BOOKS = [
  ["Gênesis","Gn"],["Êxodo","Êx","ex"],["Levítico","Lv"],["Números","Nm"],["Deuteronômio","Dt"],
  ["Josué","Js"],["Juízes","Jz"],["Rute","Rt"],["1 Samuel","1Sm"],["2 Samuel","2Sm"],
  ["1 Reis","1Rs"],["2 Reis","2Rs"],["1 Crônicas","1Cr"],["2 Crônicas","2Cr"],["Esdras","Ed","esd"],
  ["Neemias","Ne"],["Ester","Et","est"],["Jó","Jó","jo"],["Salmos","Sl","salmo"],["Provérbios","Pv","prov"],
  ["Eclesiastes","Ec"],["Cantares","Ct","cantares de salomao","cantico dos canticos"],["Isaías","Is"],["Jeremias","Jr"],["Lamentações","Lm"],
  ["Ezequiel","Ez"],["Daniel","Dn"],["Oseias","Os","oséias"],["Joel","Jl"],["Amós","Am"],
  ["Obadias","Ob"],["Jonas","Jn"],["Miqueias","Mq","miquéias"],["Naum","Na"],["Habacuque","Hc"],
  ["Sofonias","Sf"],["Ageu","Ag"],["Zacarias","Zc"],["Malaquias","Ml"],
  ["Mateus","Mt"],["Marcos","Mc"],["Lucas","Lc"],["João","Jo","joao"],["Atos","At","atos dos apostolos"],
  ["Romanos","Rm"],["1 Coríntios","1Co"],["2 Coríntios","2Co"],["Gálatas","Gl"],["Efésios","Ef"],
  ["Filipenses","Fp","fl"],["Colossenses","Cl"],["1 Tessalonicenses","1Ts"],["2 Tessalonicenses","2Ts"],
  ["1 Timóteo","1Tm"],["2 Timóteo","2Tm"],["Tito","Tt"],["Filemom","Fm"],["Hebreus","Hb"],
  ["Tiago","Tg"],["1 Pedro","1Pe"],["2 Pedro","2Pe"],["1 João","1Jo"],["2 João","2Jo"],
  ["3 João","3Jo"],["Judas","Jd"],["Apocalipse","Ap"],
].map(([name, abbr, ...alias], i) => ({ id: i, name, abbr, alias, testament: i < 39 ? "AT" : "NT" }));

export const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

const INDEX = new Map();
for (const b of BOOKS)
  for (const k of [b.name, b.abbr, ...b.alias]) {
    const n = norm(k);
    INDEX.set(n, b);
    INDEX.set(n.replace(/ /g, ""), b);
  }
// "jo" é ambíguo (João/Jó): prevalece João; Jó = "jó"/"job"
INDEX.set("jo", BOOKS[42]);
INDEX.set("job", BOOKS[17]);

// "Jó" (com acento) é o livro de Jó; sem acento, "jo" é João
const fixJob = (q) => q.trim().toLowerCase().replace(/^jó(?![a-zà-ú])/, "job");

// Interpreta "João 3:16", "1 co 13:4-7", "sl 23", "Gênesis 1". Retorna null se não for referência.
export function parseRef(q) {
  q = fixJob(q);
  const m = norm(q).match(/^((?:[123]\s*)?[a-z]+(?:\s[a-z]+){0,3}?)\s*(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const book = INDEX.get(m[1]) || INDEX.get(m[1].replace(/ /g, ""));
  if (!book) return null;
  return { book, chapter: +m[2], verse: m[3] ? +m[3] : null, end: m[4] ? +m[4] : null };
}

// Se a busca for só um nome de livro ("Romanos")
export function parseBook(q) {
  q = fixJob(q);
  const n = norm(q);
  return INDEX.get(n) || INDEX.get(n.replace(/ /g, "")) || null;
}
