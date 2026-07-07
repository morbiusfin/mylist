/* ===== Mylist — lógica de UI ===== */
(function () {
  "use strict";
  const S = window.MyStore;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const APP_VERSION = "1.1.0";
  const VERSION_NOTES = "Emoji pra tudo + 12 temas 🎨";
  const CHANGELOG = [
    {
      v: "1.1.0",
      itens: [
        "Agora <b>qualquer coisa</b> que você digitar ganha um emoji pelo nome — comida, produto de limpeza, pet, o que for. Se não achar igual, pega o <b>mais parecido</b> 🎯",
        "Busca de emoji entende <b>português e inglês</b> (“maçã” ou “apple”)",
        "<b>Aparência</b> nova (menu → Aparência): modo <b>claro ou escuro</b> + <b>12 cores</b> de tema pra deixar do seu jeito 🎨"
      ]
    },
    {
      v: "1.0.0",
      itens: [
        "Chegou o <b>Mylist</b>! Sua lista de compras com emojis de comida animados 🍕🥦🍓",
        "Cada item ganha um <b>emoji automático</b> pelo nome — digite “tomate” e veja 🍅",
        "Marque o que já foi pro carrinho e <b>coloque o preço</b> na hora",
        "<b>Finalize a compra</b> escolhendo o mercado e a data",
        "<b>Histórico por mês</b> e <b>por mercado</b>: veja quanto gastou e onde",
        "Tudo fica <b>no seu aparelho</b> — com backup pra exportar quando quiser"
      ]
    }
  ];

  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const money = (v) => BRL.format(+v || 0);
  const moneyShort = (v) => {
    v = +v || 0;
    if (v >= 1000) return "R$ " + (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(".", ",") + "k";
    return "R$ " + Math.round(v);
  };

  /* ---------- emoji render (webp animado c/ fallback pro char) ---------- */
  function emojiFallback(img) {
    const span = document.createElement("span");
    span.className = "ce";
    span.textContent = img.getAttribute("data-char") || "🛒";
    span.style.cssText = "display:inline-block;line-height:1";
    img.replaceWith(span);
  }
  function emojiHTML(em) {
    if (em.webp) return `<img class="emoji-anim" src="emoji/${em.webp}.webp" alt="" draggable="false" data-char="${em.char}" onerror="MyApp.emojiFallback(this)">`;
    return `<span class="ce">${em.char}</span>`;
  }
  const esc = (s) => (s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- datas ---------- */
  function ymLabel(ym) {
    const [y, m] = ym.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
  function dLabel(iso) { const [y, m, d] = iso.split("-"); return `${d}/${m}`; }
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const thisYM = () => todayISO().slice(0, 7);

  /* =========================================================
     TELA: LISTA
  ========================================================= */
  function renderLista() {
    const lista = S.raw.lista;
    const cont = $("#listItems");
    const empty = $("#listEmpty");

    // ordena: não comprados primeiro (ordem de inserção), comprados no fim
    const ord = [...lista].sort((a, b) => (a.comprado === b.comprado) ? 0 : (a.comprado ? 1 : -1));

    if (!lista.length) { cont.innerHTML = ""; empty.classList.remove("hidden"); }
    else {
      empty.classList.add("hidden");
      cont.innerHTML = ord.map(it => {
        const em = S.matchEmoji(it.nome);
        return `<div class="item ${it.comprado ? "done" : ""}" data-id="${it.id}">
          <button class="item-check" data-act="toggle" aria-label="Marcar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
          </button>
          <span class="item-emoji">${emojiHTML(em)}</span>
          <div class="item-body">
            <div class="item-name">${esc(it.nome)}</div>
            <div class="item-meta">${it.qtd > 1 ? it.qtd + " un" : "1 un"}</div>
          </div>
          ${it.comprado
            ? `<input class="item-price" data-act="price" inputmode="decimal" placeholder="R$" value="${it.preco != null ? String(it.preco).replace(".", ",") : ""}">`
            : `<button class="item-del" data-act="del" aria-label="Remover">✕</button>`}
        </div>`;
      }).join("");
    }

    // resumo
    const done = lista.filter(i => i.comprado);
    const parcial = done.reduce((s, i) => s + (i.preco || 0) * i.qtd, 0);
    $("#lsCount").textContent = lista.length;
    $("#lsDone").textContent = done.length;
    $("#lsTotal").textContent = moneyShort(parcial);

    // FAB finalizar
    const fab = $("#btnFinalizar");
    if (done.length) { fab.classList.remove("hidden"); $("#finCount").textContent = done.length; }
    else fab.classList.add("hidden");
  }

  function onListClick(e) {
    const row = e.target.closest(".item"); if (!row) return;
    const id = row.dataset.id;
    const act = e.target.closest("[data-act]") && e.target.closest("[data-act]").dataset.act;
    if (act === "toggle") { S.toggleItem(id); renderLista(); }
    else if (act === "del") { S.removeItem(id); renderLista(); }
  }
  function onListInput(e) {
    const inp = e.target.closest(".item-price"); if (!inp) return;
    const id = e.target.closest(".item").dataset.id;
    S.setPrice(id, (inp.value || "").replace(",", "."));
    // atualiza só o resumo (não re-renderiza pra não perder foco)
    const lista = S.raw.lista, done = lista.filter(i => i.comprado);
    $("#lsTotal").textContent = moneyShort(done.reduce((s, i) => s + (i.preco || 0) * i.qtd, 0));
    $("#finCount").textContent = done.length;
  }

  function addFromInput() {
    const inp = $("#addInput");
    const v = inp.value.trim();
    if (!v) return;
    S.addItem(v);
    inp.value = "";
    updateAddEmoji();
    renderLista();
    inp.focus();
  }
  function updateAddEmoji() {
    const v = $("#addInput").value.trim();
    const em = v ? S.matchEmoji(v) : { char: "🛒", webp: "carrinho" };
    $("#addEmoji").innerHTML = emojiHTML(em);
  }

  /* =========================================================
     TELA: HISTÓRICO
  ========================================================= */
  let histFilter = null; // mercado selecionado (null = todos)

  function renderHist() {
    const compras = S.comprasSorted();
    const empty = $("#histEmpty");
    const list = $("#histList");

    // KPIs
    $("#hkMonth").textContent = moneyShort(S.monthTotal(thisYM()));
    $("#hkMonthLbl").textContent = ymLabel(thisYM());
    $("#hkAll").textContent = moneyShort(S.grandTotal());

    // filtros por mercado
    const mercs = S.mercados();
    const chips = $("#histFilters");
    if (mercs.length) {
      chips.innerHTML = `<button class="chip ${histFilter === null ? "active" : ""}" data-merc="">Todos</button>` +
        mercs.map(m => `<button class="chip ${histFilter === m ? "active" : ""}" data-merc="${esc(m)}">${esc(m)}</button>`).join("");
    } else chips.innerHTML = "";

    const filtered = histFilter ? compras.filter(c => c.mercado === histFilter) : compras;

    if (!filtered.length) { list.innerHTML = ""; empty.classList.remove("hidden"); return; }
    empty.classList.add("hidden");

    // agrupa por mês
    const groups = {};
    filtered.forEach(c => { const ym = c.data.slice(0, 7); (groups[ym] || (groups[ym] = [])).push(c); });
    const yms = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    list.innerHTML = yms.map(ym => {
      const arr = groups[ym];
      const tot = arr.reduce((s, c) => s + c.total, 0);
      const cards = arr.map(c => {
        const em = S.matchEmoji(c.itens[0] ? c.itens[0].nome : "");
        return `<div class="compra-card" data-id="${c.id}">
          <span class="compra-badge">${emojiHTML(em)}</span>
          <div class="compra-info">
            <div class="compra-merc">${esc(c.mercado)}</div>
            <div class="compra-sub">${dLabel(c.data)} · ${c.itens.length} ${c.itens.length === 1 ? "item" : "itens"}</div>
          </div>
          <div class="compra-total">${money(c.total)}</div>
        </div>`;
      }).join("");
      return `<div class="month-group">
        <div class="month-head"><span class="month-title">${ymLabel(ym)}</span><span class="month-total">${money(tot)}</span></div>
        ${cards}
      </div>`;
    }).join("");
  }

  function onHistClick(e) {
    const chip = e.target.closest(".chip");
    if (chip) { histFilter = chip.dataset.merc || null; renderHist(); return; }
    const card = e.target.closest(".compra-card");
    if (card) openCompra(card.dataset.id);
  }

  /* =========================================================
     TELA: MERCADOS
  ========================================================= */
  function renderMerc() {
    const stats = S.mercadoStats();
    const list = $("#mercList");
    const empty = $("#mercEmpty");
    if (!stats.length) { list.innerHTML = ""; empty.classList.remove("hidden"); return; }
    empty.classList.add("hidden");
    list.innerHTML = stats.map(m => `<div class="merc-card" data-merc="${esc(m.nome)}">
      <div class="merc-top">
        <div class="merc-name"><span class="merc-ic">🏪</span>${esc(m.nome)}</div>
        <div class="merc-big">${money(m.total)}</div>
      </div>
      <div class="merc-stats">
        <div class="merc-stat"><b>${m.n}</b><span>compras</span></div>
        <div class="merc-stat"><b>${money(m.ticket)}</b><span>média</span></div>
        <div class="merc-stat"><b>${dLabel(m.ultima)}</b><span>última</span></div>
      </div>
    </div>`).join("");
  }
  function onMercClick(e) {
    const card = e.target.closest(".merc-card"); if (!card) return;
    histFilter = card.dataset.merc;
    switchScreen("scrHist");
    renderHist();
  }

  /* =========================================================
     FINALIZAR COMPRA (modal)
  ========================================================= */
  function openFinalizar() {
    const done = S.raw.lista.filter(i => i.comprado);
    if (!done.length) { toast("Marque o que você comprou primeiro 🛒"); return; }
    $("#finData").value = todayISO();
    $("#finMercado").value = "";
    // sugestões de mercado (datalist + chips dos usados)
    const mercs = S.mercados();
    $("#mercadosDL").innerHTML = mercs.map(m => `<option value="${esc(m)}">`).join("");
    $("#finMercChips").innerHTML = mercs.slice(0, 8).map(m => `<button type="button" class="chip" data-merc="${esc(m)}">${esc(m)}</button>`).join("");
    // preview
    const total = done.reduce((s, i) => s + (i.preco || 0) * i.qtd, 0);
    $("#finPvCount").textContent = `${done.length} ${done.length === 1 ? "item" : "itens"}`;
    $("#finPvTotal").textContent = money(total);
    $("#finPvItems").innerHTML = done.map(i => {
      const em = S.matchEmoji(i.nome);
      const sub = (i.preco || 0) * i.qtd;
      return `<div class="fpv-row"><span class="fpv-emoji">${emojiHTML(em)}</span>
        <span class="fpv-name">${esc(i.nome)}${i.qtd > 1 ? ` ×${i.qtd}` : ""}</span>
        <span class="fpv-val">${sub ? money(sub) : "—"}</span></div>`;
    }).join("");
    openModal("#finModal");
  }
  function confirmFinalizar() {
    const merc = $("#finMercado").value.trim();
    if (!merc) { toast("Diz o nome do mercado 🏪"); $("#finMercado").focus(); return; }
    const c = S.finalizarCompra(merc, $("#finData").value || todayISO());
    if (!c) { closeModal("#finModal"); return; }
    closeModal("#finModal");
    renderLista(); renderHist(); renderMerc();
    celebrate(`Compra salva em ${esc(merc)}! ${money(c.total)} 🎉`);
  }

  /* =========================================================
     DETALHE DA COMPRA (modal)
  ========================================================= */
  let curCompra = null;
  function openCompra(id) {
    const c = S.raw.compras.find(x => x.id === id); if (!c) return;
    curCompra = id;
    $("#cmTitle").textContent = c.mercado;
    $("#cmMeta").innerHTML =
      `<div class="cm-pill">📅 ${dLabel(c.data)}/${c.data.slice(0, 4)}</div>
       <div class="cm-pill">🛒 ${c.itens.length} ${c.itens.length === 1 ? "item" : "itens"}</div>
       <div class="cm-pill">Total <b>${money(c.total)}</b></div>`;
    $("#cmItems").innerHTML = c.itens.map(it => {
      const em = S.matchEmoji(it.nome);
      const sub = (it.preco || 0) * it.qtd;
      return `<div class="cm-item"><span class="cm-emoji">${emojiHTML(em)}</span>
        <span class="cm-name">${esc(it.nome)}${it.qtd > 1 ? ` ×${it.qtd}` : ""}</span>
        <span class="cm-val">${sub ? money(sub) : "—"}</span></div>`;
    }).join("");
    openModal("#compraModal");
  }

  /* =========================================================
     MENU / BACKUP
  ========================================================= */
  function exportBackup() {
    const blob = new Blob([S.exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mylist-backup-${todayISO()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Backup exportado 💾");
  }
  function importBackup(file) {
    const r = new FileReader();
    r.onload = () => {
      try { S.importData(r.result); renderAll(); closeModal("#menuModal"); toast("Backup restaurado ✅"); }
      catch (e) { toast("Arquivo inválido 😕"); }
    };
    r.readAsText(file);
  }

  /* =========================================================
     NOVIDADES + UPDATE
  ========================================================= */
  function showWhatsNew() {
    const cl = CHANGELOG[0];
    $("#wnTitle").textContent = "Novidades " + cl.v;
    $("#wnBody").innerHTML = "<ul>" + cl.itens.map(t => `<li>${t}</li>`).join("") + "</ul>";
    openModal("#wnModal");
  }
  function maybeShowWhatsNew() {
    const last = S.raw.meta.lastVersion;
    if (last !== APP_VERSION) {
      S.raw.meta.lastVersion = APP_VERSION; S.save();
      if (last) showWhatsNew(); // não mostra na 1ª instalação
    }
  }

  let updShown = false;
  async function checkProdVersion() {
    try {
      const r = await fetch("version.json?_=" + Date.now(), { cache: "no-store" });
      const j = await r.json();
      if (j && j.version && j.version !== APP_VERSION && !updShown) { updShown = true; openModal("#updModal"); }
    } catch (e) {}
  }

  /* =========================================================
     MODAIS / TOAST / NAV
  ========================================================= */
  function openModal(sel) { $(sel).classList.remove("hidden"); }
  function closeModal(sel) { $(sel).classList.add("hidden"); }
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 2600);
  }
  function celebrate(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 3200);
  }

  /* ---------- aparência (tema) ---------- */
  function openTheme() { renderTheme(); openModal("#themeModal"); }
  function renderTheme() {
    const cur = window.MyTheme.get();
    $$("#modeSeg .seg-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === cur.mode));
    $("#swatches").innerHTML = window.MyTheme.COLORS.map(c =>
      `<button class="swatch ${c.id === cur.color ? "active" : ""}" data-color="${c.id}">
        <span class="swatch-dot" style="background:${c.hex}"></span>
        <span class="swatch-name">${c.nome}</span>
      </button>`).join("");
  }

  function switchScreen(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.scr === id));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function renderAll() { renderLista(); renderHist(); renderMerc(); }

  /* ---------- mascote rotativo (comida animada) ---------- */
  const MASCOTS = ["salivando", "pizza", "hamburguer", "sorvete", "taco", "morango", "cafe", "donut", "carrinho"];
  const SUBS = ["sua feira, organizada", "bora fazer compras?", "sem esquecer nada 🧠", "quanto você gasta, na real"];
  function rollMascot() {
    const m = MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    $("#hdrMascot").src = "emoji/" + m + ".webp";
    $("#hdrSub").textContent = SUBS[Math.floor(Math.random() * SUBS.length)];
  }

  /* =========================================================
     INIT
  ========================================================= */
  function init() {
    // nav tabs
    $$(".tab").forEach(t => t.addEventListener("click", () => switchScreen(t.dataset.scr)));
    // lista
    $("#addBtn").addEventListener("click", addFromInput);
    $("#addInput").addEventListener("keydown", e => { if (e.key === "Enter") addFromInput(); });
    $("#addInput").addEventListener("input", updateAddEmoji);
    $("#listItems").addEventListener("click", onListClick);
    $("#listItems").addEventListener("input", onListInput);
    // finalizar
    $("#btnFinalizar").addEventListener("click", openFinalizar);
    $("#finConfirm").addEventListener("click", confirmFinalizar);
    $("#finMercChips").addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) $("#finMercado").value = c.dataset.merc; });
    // histórico / mercados
    $("#histFilters").addEventListener("click", onHistClick);
    $("#histList").addEventListener("click", onHistClick);
    $("#mercList").addEventListener("click", onMercClick);
    // compra detalhe
    $("#cmDelete").addEventListener("click", () => {
      if (curCompra && confirm("Excluir esta compra do histórico?")) { S.deleteCompra(curCompra); closeModal("#compraModal"); renderAll(); toast("Compra excluída"); }
    });
    $("#cmRepetir").addEventListener("click", () => {
      if (curCompra) { S.repetirCompra(curCompra); closeModal("#compraModal"); switchScreen("scrLista"); renderLista(); toast("Itens adicionados na lista 🛒"); }
    });
    // menu
    $("#btnMenu").addEventListener("click", () => openModal("#menuModal"));
    $("#miExport").addEventListener("click", exportBackup);
    $("#miImport").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", e => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ""; });
    $("#miClear").addEventListener("click", () => { if (confirm("Limpar a lista atual? (o histórico não é afetado)")) { S.clearLista(); renderLista(); closeModal("#menuModal"); toast("Lista limpa 🧹"); } });
    $("#miTheme").addEventListener("click", () => { closeModal("#menuModal"); openTheme(); });
    $("#modeSeg").addEventListener("click", e => { const b = e.target.closest(".seg-btn"); if (b) { window.MyTheme.save({ ...window.MyTheme.get(), mode: b.dataset.mode }); renderTheme(); } });
    $("#swatches").addEventListener("click", e => { const b = e.target.closest(".swatch"); if (b) { window.MyTheme.save({ ...window.MyTheme.get(), color: b.dataset.color }); renderTheme(); } });
    $("#miNews").addEventListener("click", () => { closeModal("#menuModal"); showWhatsNew(); });
    $("#miAbout").addEventListener("click", () => { toast("Mylist v" + APP_VERSION + " · " + VERSION_NOTES); });
    $("#miVersion").textContent = "v" + APP_VERSION;
    // whats new / update
    $("#wnClose").addEventListener("click", () => closeModal("#wnModal"));
    $("#updBtn").addEventListener("click", async () => {
      try { const reg = await navigator.serviceWorker.getRegistration(); if (reg && reg.waiting) reg.waiting.postMessage("skipWaiting"); } catch (e) {}
      location.reload();
    });
    $("#updLater").addEventListener("click", () => closeModal("#updModal"));
    // fechar modais (backdrop + botão X)
    $$(".modal").forEach(m => {
      m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) m.classList.add("hidden"); });
    });

    updateAddEmoji();
    rollMascot();
    renderAll();
    maybeShowWhatsNew();

    // service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").then(reg => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller && !updShown) { updShown = true; openModal("#updModal"); }
          });
        });
      }).catch(() => {});
    }
    checkProdVersion();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) checkProdVersion(); });
  }

  window.MyApp = { emojiFallback };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
