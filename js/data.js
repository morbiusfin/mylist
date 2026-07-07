/* ===== Mylist — modelo de dados + persistência local ===== */
(function () {
  "use strict";
  const KEY = "mylist_data_v1";

  const DEFAULT = { lista: [], compras: [], meta: { lastVersion: null } };

  let DATA = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT);
      const d = JSON.parse(raw);
      d.lista = Array.isArray(d.lista) ? d.lista : [];
      d.compras = Array.isArray(d.compras) ? d.compras : [];
      d.meta = d.meta || { lastVersion: null };
      return d;
    } catch (e) { return structuredClone(DEFAULT); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DATA)); } catch (e) {} }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- normalização p/ matching de emoji ---------- */
  function norm(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }

  /* ---------- dicionário food-emoji ----------
     webp = arquivo animado em /emoji (existe) | null = usa só o char (emoji do sistema) */
  const FOODMAP = [
    // prontos / lanches (antes dos ingredientes p/ evitar falso-positivo)
    { kw: ["pizza"], char: "🍕", webp: "pizza" },
    { kw: ["hamburguer", "hamburger", "burger", "xburguer", "xis"], char: "🍔", webp: "hamburguer" },
    { kw: ["cachorro-quente", "cachorroquente", "hotdog", "salsicha", "vina"], char: "🌭", webp: "cachorroquente" },
    { kw: ["taco"], char: "🌮", webp: "taco" },
    { kw: ["burrito", "wrap"], char: "🌯", webp: "burrito" },
    { kw: ["batata frita", "fritas", "chips"], char: "🍟", webp: null },
    { kw: ["sanduiche", "misto", "sanduba"], char: "🥪", webp: null },
    { kw: ["salada", "alface", "rucula", "verdura"], char: "🥗", webp: "salada" },
    { kw: ["sopa", "caldo", "creme"], char: "🍲", webp: null },
    { kw: ["sushi", "temaki", "sashimi"], char: "🍣", webp: null },
    { kw: ["pipoca"], char: "🍿", webp: "pipoca" },
    { kw: ["macarrao", "espaguete", "spaghetti", "miojo", "lasanha", "nhoque", "penne", "massa"], char: "🍝", webp: "macarrao" },
    { kw: ["panqueca", "pancake"], char: "🥞", webp: "panqueca" },
    { kw: ["ovo frito", "ovos", "ovo"], char: "🍳", webp: "ovofrito" },
    // padaria
    { kw: ["pao", "paes", "paozinho", "baguete", "frances", "bisnaga", "torrada"], char: "🍞", webp: "pao" },
    { kw: ["croissant"], char: "🥐", webp: null },
    { kw: ["pretzel", "rosca"], char: "🥨", webp: "pretzel" },
    { kw: ["bolo", "torta doce"], char: "🍰", webp: null },
    { kw: ["torta", "quiche", "empada"], char: "🥧", webp: "torta" },
    { kw: ["biscoito", "bolacha", "cookie"], char: "🍪", webp: "biscoito" },
    { kw: ["donut", "rosquinha", "sonho"], char: "🍩", webp: "donut" },
    // frutas
    { kw: ["maca", "macas"], char: "🍎", webp: "maca" },
    { kw: ["banana", "bananas"], char: "🍌", webp: null },
    { kw: ["uva", "uvas"], char: "🍇", webp: "uva" },
    { kw: ["morango", "morangos"], char: "🍓", webp: "morango" },
    { kw: ["melancia"], char: "🍉", webp: "melancia" },
    { kw: ["melao"], char: "🍈", webp: null },
    { kw: ["laranja", "laranjas", "tangerina", "mexerica"], char: "🍊", webp: "laranja" },
    { kw: ["limao", "limoes", "lima"], char: "🍋", webp: "limao" },
    { kw: ["abacaxi"], char: "🍍", webp: "abacaxi" },
    { kw: ["pera", "peras"], char: "🍐", webp: "pera" },
    { kw: ["pessego", "nectarina"], char: "🍑", webp: null },
    { kw: ["cereja", "cerejas"], char: "🍒", webp: "cereja" },
    { kw: ["manga", "mangas"], char: "🥭", webp: "manga" },
    { kw: ["kiwi"], char: "🥝", webp: "kiwi" },
    { kw: ["coco"], char: "🥥", webp: null },
    { kw: ["abacate"], char: "🥑", webp: "abacate" },
    { kw: ["mamao", "papaya"], char: "🥭", webp: "manga" },
    // legumes / verduras
    { kw: ["tomate", "tomates"], char: "🍅", webp: "tomate" },
    { kw: ["cenoura", "cenouras"], char: "🥕", webp: "cenoura" },
    { kw: ["milho", "espiga"], char: "🌽", webp: "milho" },
    { kw: ["batata", "batatas", "inglesa"], char: "🥔", webp: "batata" },
    { kw: ["cebola", "cebolas"], char: "🧅", webp: "cebola" },
    { kw: ["alho"], char: "🧄", webp: "alho" },
    { kw: ["brocolis", "brocoli"], char: "🥦", webp: "brocolis" },
    { kw: ["couve", "espinafre", "folha", "folhas", "acelga"], char: "🥬", webp: "folhas" },
    { kw: ["pepino"], char: "🥒", webp: "pepino" },
    { kw: ["cogumelo", "champignon", "shitake"], char: "🍄", webp: "cogumelo" },
    { kw: ["pimentao", "pimenta"], char: "🫑", webp: "pimentao" },
    { kw: ["berinjela"], char: "🍆", webp: null },
    { kw: ["amendoim", "castanha", "nozes"], char: "🥜", webp: null },
    // proteínas
    { kw: ["frango", "galinha", "peito", "coxa", "ave"], char: "🍗", webp: "frango" },
    { kw: ["carne", "boi", "bife", "picanha", "alcatra", "moida", "costela", "acem"], char: "🥩", webp: null },
    { kw: ["bacon", "toucinho"], char: "🥓", webp: "bacon" },
    { kw: ["peixe", "tilapia", "salmao", "sardinha", "atum", "merluza"], char: "🐟", webp: "peixe" },
    { kw: ["camarao", "frutos do mar"], char: "🍤", webp: null },
    { kw: ["linguica", "calabresa"], char: "🌭", webp: "cachorroquente" },
    // laticínios / básicos
    { kw: ["queijo", "mussarela", "muçarela", "parmesao", "requeijao", "ricota"], char: "🧀", webp: "queijo" },
    { kw: ["leite", "iogurte", "yogurt", "coalhada"], char: "🥛", webp: null },
    { kw: ["manteiga", "margarina"], char: "🧈", webp: null },
    { kw: ["arroz"], char: "🍚", webp: null },
    { kw: ["feijao", "lentilha", "grao", "grao-de-bico"], char: "🫘", webp: null },
    { kw: ["sal", "tempero"], char: "🧂", webp: "sal" },
    { kw: ["mel"], char: "🍯", webp: null },
    { kw: ["acucar", "adocante"], char: "🍬", webp: null },
    { kw: ["oleo", "azeite", "vinagre"], char: "🫒", webp: null },
    { kw: ["farinha", "fuba", "amido"], char: "🌾", webp: null },
    // bebidas
    { kw: ["cafe"], char: "☕", webp: "cafe" },
    { kw: ["cha"], char: "🍵", webp: "cha" },
    { kw: ["suco", "sucos", "polpa"], char: "🧃", webp: "suco" },
    { kw: ["refrigerante", "refri", "coca", "guarana", "soda"], char: "🥤", webp: null },
    { kw: ["agua", "mineral"], char: "💧", webp: null },
    { kw: ["cerveja", "breja", "chopp"], char: "🍺", webp: null },
    { kw: ["vinho", "espumante"], char: "🍷", webp: "vinho" },
    { kw: ["achocolatado", "chocolate", "nescau", "toddy"], char: "🍫", webp: null },
    // doces
    { kw: ["sorvete", "picole", "gelato"], char: "🍦", webp: "sorvete" },
    { kw: ["bala", "doce", "goma"], char: "🍬", webp: null },
    { kw: ["pirulito"], char: "🍭", webp: null },
    // higiene / limpeza / casa
    { kw: ["papel higienico", "papel", "guardanapo", "toalha"], char: "🧻", webp: null },
    { kw: ["sabonete", "sabao", "detergente"], char: "🧼", webp: null },
    { kw: ["esponja", "bucha"], char: "🧽", webp: null },
    { kw: ["shampoo", "condicionador", "creme dental", "pasta de dente", "escova"], char: "🧴", webp: null },
    { kw: ["fralda", "mamadeira", "bebe"], char: "🍼", webp: "mamadeira" },
    { kw: ["racao", "pet", "cachorro", "gato"], char: "🦴", webp: null }
  ];
  const DEFAULT_EMOJI = { char: "🛒", webp: "carrinho" };

  function matchEmoji(nome) {
    const n = norm(nome);
    if (!n) return DEFAULT_EMOJI;
    const tokens = n.split(/[^a-z0-9]+/).filter(Boolean);
    for (const e of FOODMAP) {
      for (const kwRaw of e.kw) {
        const kw = norm(kwRaw);
        // frase com espaço → substring direto
        if (kw.includes(" ")) { if (n.includes(kw)) return e; continue; }
        for (const t of tokens) {
          if (t === kw) return e;
          if (kw.length >= 4 && t.startsWith(kw)) return e;
          if (kw.length >= 5 && t.includes(kw)) return e;
        }
      }
    }
    return DEFAULT_EMOJI;
  }

  /* ---------- parse "2 tomate" / "tomate x3" / "3x leite" ---------- */
  function parseEntry(raw) {
    let s = (raw || "").trim();
    let qtd = 1;
    let m = s.match(/^(\d{1,3})\s*x?\s+(.+)$/i);           // "2 tomate" | "2x tomate"
    if (m) { qtd = parseInt(m[1], 10); s = m[2].trim(); }
    else { m = s.match(/^(.+?)\s*x\s*(\d{1,3})$/i); if (m) { s = m[1].trim(); qtd = parseInt(m[2], 10); } } // "tomate x3"
    if (!qtd || qtd < 1) qtd = 1;
    return { nome: s, qtd: Math.min(qtd, 999) };
  }

  /* ---------- operações: LISTA ---------- */
  function addItem(raw) {
    const { nome, qtd } = parseEntry(raw);
    if (!nome) return null;
    // se já existe (mesmo nome, não comprado), soma quantidade
    const ex = DATA.lista.find(i => !i.comprado && norm(i.nome) === norm(nome));
    if (ex) { ex.qtd += qtd; save(); return ex; }
    const it = { id: uid(), nome, qtd, comprado: false, preco: null };
    DATA.lista.push(it); save(); return it;
  }
  function findItem(id) { return DATA.lista.find(i => i.id === id); }
  function toggleItem(id) { const i = findItem(id); if (i) { i.comprado = !i.comprado; if (!i.comprado) i.preco = null; save(); } return i; }
  function setPrice(id, v) { const i = findItem(id); if (i) { i.preco = (v === "" || v == null || isNaN(v)) ? null : Math.max(0, +v); save(); } return i; }
  function setQty(id, q) { const i = findItem(id); if (i) { i.qtd = Math.max(1, Math.min(999, parseInt(q, 10) || 1)); save(); } return i; }
  function removeItem(id) { DATA.lista = DATA.lista.filter(i => i.id !== id); save(); }
  function clearLista() { DATA.lista = []; save(); }

  /* ---------- finalizar compra ---------- */
  function finalizarCompra(mercado, dataISO) {
    const comprados = DATA.lista.filter(i => i.comprado);
    if (!comprados.length) return null;
    const itens = comprados.map(i => ({ nome: i.nome, qtd: i.qtd, preco: i.preco == null ? 0 : i.preco }));
    const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
    const compra = {
      id: uid(),
      mercado: (mercado || "Mercado").trim() || "Mercado",
      data: dataISO || new Date().toISOString().slice(0, 10),
      ts: Date.now(),
      itens, total
    };
    DATA.compras.push(compra);
    DATA.lista = DATA.lista.filter(i => !i.comprado); // não comprados ficam na lista
    save(); return compra;
  }
  function deleteCompra(id) { DATA.compras = DATA.compras.filter(c => c.id !== id); save(); }
  function repetirCompra(id) {
    const c = DATA.compras.find(x => x.id === id); if (!c) return;
    c.itens.forEach(it => {
      const ex = DATA.lista.find(i => !i.comprado && norm(i.nome) === norm(it.nome));
      if (ex) ex.qtd += it.qtd;
      else DATA.lista.push({ id: uid(), nome: it.nome, qtd: it.qtd, comprado: false, preco: null });
    });
    save();
  }

  /* ---------- agregações ---------- */
  function comprasSorted() { return [...DATA.compras].sort((a, b) => (b.data + b.ts).localeCompare(a.data + a.ts)); }
  function mercados() {
    const set = [...new Set(DATA.compras.map(c => c.mercado))];
    return set.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  function mercadoStats() {
    const map = {};
    DATA.compras.forEach(c => {
      const m = map[c.mercado] || (map[c.mercado] = { nome: c.mercado, total: 0, n: 0, ultima: "" });
      m.total += c.total; m.n++; if (c.data > m.ultima) m.ultima = c.data;
    });
    return Object.values(map).map(m => ({ ...m, ticket: m.n ? m.total / m.n : 0 }))
      .sort((a, b) => b.total - a.total);
  }
  function monthTotal(ym) { return DATA.compras.filter(c => c.data.slice(0, 7) === ym).reduce((s, c) => s + c.total, 0); }
  function grandTotal() { return DATA.compras.reduce((s, c) => s + c.total, 0); }

  /* ---------- backup ---------- */
  function exportData() { return JSON.stringify({ app: "mylist", v: 1, exportedAt: new Date().toISOString(), data: DATA }, null, 2); }
  function importData(json) {
    const obj = JSON.parse(json);
    const d = obj && obj.data ? obj.data : obj;
    if (!d || !Array.isArray(d.compras)) throw new Error("arquivo inválido");
    DATA.lista = Array.isArray(d.lista) ? d.lista : [];
    DATA.compras = d.compras;
    DATA.meta = d.meta || { lastVersion: null };
    save();
  }

  window.MyStore = {
    get raw() { return DATA; },
    save,
    addItem, findItem, toggleItem, setPrice, setQty, removeItem, clearLista,
    finalizarCompra, deleteCompra, repetirCompra,
    comprasSorted, mercados, mercadoStats, monthTotal, grandTotal,
    matchEmoji, parseEntry, norm,
    exportData, importData
  };
})();
