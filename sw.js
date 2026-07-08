/* Service Worker — network-first (sempre busca a versão nova; cache só p/ offline) */
const CACHE = "mylist-v9";
const EMOJIS = [
  "abacate","abacaxi","aceno","alho","bacon","batata","biscoito","brilho","brocolis","burrito",
  "cachorroquente","cafe","carrinho","cebola","cenoura","cereja","cha","check","cogumelo","donut",
  "estrela","festa","foguete","folhas","frango","hamburguer","kiwi","laranja","limao","maca",
  "macarrao","mamadeira","manga","melancia","milho","morango","ovofrito","panqueca","pao","peixe",
  "pepino","pera","pimentao","pipoca","pizza","pretzel","queijo","sal","salada","salivando",
  "sorvete","suco","taco","tomate","torta","uva","vinho"
];
const ASSETS = [
  "./", "./index.html", "./privacidade.html", "./termos.html",
  "./css/styles.css",
  "./js/theme.js", "./js/emojidb.js", "./js/data.js", "./js/cloud.js", "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png"
].concat(EMOJIS.map(n => "./emoji/" + n + ".webp"));

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // CDN versionado (supabase-js) → cache-first (conteúdo imutável)
  if (url.hostname === "cdn.jsdelivr.net") {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res;
    })));
    return;
  }
  // qualquer outra origem (ex.: API REST/Realtime do Supabase) → direto pra rede, SEM cache
  if (url.origin !== self.location.origin) return;
  // network-first: pega a versão mais nova; se offline, usa cache
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(hit =>
      hit || (e.request.mode === "navigate" ? caches.match("./index.html") : new Response("", { status: 404 }))))
  );
});
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });
