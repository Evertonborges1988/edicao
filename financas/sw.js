// Cache do app para funcionar sem internet. Os dados ficam no aparelho (localStorage).
const V = "financas-v3";
const ARQUIVOS = ["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest",
  "./importar-xlsx.js", "./vendor/xlsx.full.min.js", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return; // Supabase etc. passam direto
  // rede primeiro (pega versão nova), cai para o cache se estiver offline
  e.respondWith(fetch(r).then(res => {
    const copia = res.clone();
    caches.open(V).then(c => c.put(r, copia));
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
});
