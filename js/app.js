/* ===== Mylist — lógica de UI ===== */
(function () {
  "use strict";
  const S = window.MyStore;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const APP_VERSION = "1.9.1";
  const VERSION_NOTES = "Barra de abas nova + botão voltar redondo";
  const CHANGELOG = [
    {
      v: "1.9.1",
      itens: [
        "Barra de baixo repaginada: a aba <b>ativa</b> ganha um destaque arredondado 🎯",
        "Botão <b>voltar</b> nas telas de Privacidade e Termos virou uma <b>bolinha</b> no canto ↩️"
      ]
    },
    {
      v: "1.9.0",
      itens: [
        "Nos <b>Insights</b>, agora dá pra escolher o <b>período</b>: 7, 14, 30, 60, 90 dias, tudo ou <b>personalizado</b> (você escolhe as datas) 📅",
        "Tudo (total, gráficos, mercados, campeões) recalcula pro período escolhido",
        "Ícone do abacaxi 🍍 mais bonito (emoji da biblioteca)"
      ]
    },
    {
      v: "1.8.0",
      itens: [
        "Topo e a barra de baixo agora ficam <b>sempre fixos</b> — só a lista rola no meio 📱",
        "Preço com <b>máscara automática</b>: é só digitar os números que ele vira <b>1.234,56</b> sozinho 💰",
        "Novo <b>ícone do app</b>: um abacaxi 🍍"
      ]
    },
    {
      v: "1.7.0",
      itens: [
        "Nova aba <b>Insights</b> 📊 — gráfico de <b>gasto por mês</b>, barras <b>por mercado</b>, seus <b>itens campeões</b> e frases com sacadas dos seus gastos",
        "Cards do topo (itens / no carrinho / parcial) mais <b>bonitos e profissionais</b> ✨",
        "KPIs de total gasto, nº de compras e ticket médio"
      ]
    },
    {
      v: "1.6.0",
      itens: [
        "<b>Tela de conta</b> nova, com a cara do Mylist 🛒 — bem-vindo, mostrar senha e “esqueci minha senha”",
        "<b>Convite com prazo</b>: convide alguém por <b>1 dia, 7, 30 dias ou sem limite</b>. Quando vence, a pessoa perde o acesso sozinha ⏳",
        "Pode ter <b>várias pessoas</b> na mesma lista, cada uma com sua conta",
        "Sua lista continua <b>no seu aparelho</b> — a conta é só pra compartilhar"
      ]
    },
    {
      v: "1.5.0",
      itens: [
        "O app <b>aprende</b>: ao digitar, sugere itens que você já usou, e o <b>preço vem sozinho</b> do histórico — você quase não digita valor 🧠",
        "Tela de <b>Conta compartilhada</b> repaginada, mais bonita e espaçada — e dá pra ter <b>várias pessoas</b> na mesma lista 👥",
        "Botão <b>Finalizar compra</b> mais bonito e sem texto quebrado",
        "Quando abre uma janela, o fundo <b>não rola mais</b> junto"
      ]
    },
    {
      v: "1.4.0",
      itens: [
        "Novo botão de <b>lixeira</b> 🗑️ no topo: toque, <b>escolha os itens</b> e exclua vários de uma vez",
        "Antes de apagar, o app <b>pergunta “Tem certeza?”</b> — sem sustos",
        "Apagou sem querer? Aparece <b>“Desfazer”</b> na horinha pra voltar tudo ↩️",
        "Dá pra <b>selecionar tudo</b> num toque"
      ]
    },
    {
      v: "1.3.0",
      itens: [
        "<b>Toque em qualquer item</b> pra editar: muda o <b>nome</b>, a <b>quantidade</b> (com − e +) e o <b>preço</b> 🎯",
        "<b>Adicionar ficou mais fácil</b>: agora o botão ➕ e o “Enter” do teclado funcionam de primeira no celular",
        "A lista mostra o <b>subtotal</b> de cada item (quantidade × preço)",
        "Corrigido um item “fantasma” que aparecia embaixo da lista"
      ]
    },
    {
      v: "1.2.0",
      itens: [
        "<b>Conta compartilhada</b> chegou! Entre com email e senha (menu → Conta compartilhada) e divida a <b>mesma lista e histórico</b> com outra pessoa 👥",
        "É <b>ao vivo</b>: um adiciona “leite”, aparece no outro na hora ☁️",
        "Pra convidar: gere um <b>código</b> e mande pro seu par — ele entra no mesmo espaço",
        "Sem conta, tudo continua igual, <b>salvo no seu aparelho</b>"
      ]
    },
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
  // máscara de moeda: digita só números → 0,00 → 1.234,56 (dígitos = centavos)
  const fmtCentsBR = (cents) => (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function maskMoney(el) { const d = (el.value || "").replace(/\D/g, ""); el.value = d ? fmtCentsBR(parseInt(d, 10)) : ""; }
  const parseMoneyStr = (s) => { const d = (s || "").replace(/\D/g, ""); return d ? parseInt(d, 10) / 100 : 0; };
  const fmtPrice = (n) => (n != null ? fmtCentsBR(Math.round(n * 100)) : "");

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
  function mShort(ym) { const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""); }
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
        const sub = (it.preco || 0) * it.qtd;
        const meta = (it.qtd > 1 ? it.qtd + " un" : "1 un") + (it.preco != null ? " · " + money(sub) : "");
        return `<div class="item ${it.comprado ? "done" : ""}${selectMode && selected.has(it.id) ? " selected" : ""}" data-id="${it.id}">
          <button class="item-check" data-act="toggle" aria-label="Marcar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
          </button>
          <span class="item-emoji">${emojiHTML(em)}</span>
          <button class="item-body" data-act="edit" aria-label="Editar ${esc(it.nome)}">
            <div class="item-name">${esc(it.nome)}</div>
            <div class="item-meta">${meta}</div>
          </button>
          ${it.comprado
            ? `<input class="item-price" data-act="price" inputmode="numeric" placeholder="R$" value="${fmtPrice(it.preco)}">`
            : ``}
          <span class="item-go" data-act="edit" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
          </span>
        </div>`;
      }).join("");
    }

    // resumo
    const done = lista.filter(i => i.comprado);
    const parcial = done.reduce((s, i) => s + (i.preco || 0) * i.qtd, 0);
    $("#lsCount").textContent = lista.length;
    $("#lsDone").textContent = done.length;
    $("#lsTotal").textContent = moneyShort(parcial);

    // modo seleção + FAB finalizar
    $("#listItems").classList.toggle("selecting", selectMode);
    const fab = $("#btnFinalizar");
    if (!selectMode && done.length) { fab.classList.remove("hidden"); $("#finCount").textContent = done.length; }
    else fab.classList.add("hidden");
  }

  function onListClick(e) {
    const row = e.target.closest(".item"); if (!row) return;
    const id = row.dataset.id;
    if (selectMode) { toggleSelect(id); return; }
    const act = e.target.closest("[data-act]") && e.target.closest("[data-act]").dataset.act;
    if (act === "toggle") {
      const it = S.toggleItem(id);
      if (it && it.comprado && it.preco == null) { const lp = S.lastPrice(it.nome); if (lp != null) S.setPrice(id, lp); }
      renderLista();
    }
    else if (act === "del") { S.removeItem(id); renderLista(); }
    else if (act === "edit") { openItemEdit(id); }
  }
  function onListInput(e) {
    const inp = e.target.closest(".item-price"); if (!inp) return;
    maskMoney(inp);
    const id = e.target.closest(".item").dataset.id;
    S.setPrice(id, inp.value.trim() === "" ? "" : parseMoneyStr(inp.value));
    // atualiza só o resumo (não re-renderiza pra não perder foco)
    const lista = S.raw.lista, done = lista.filter(i => i.comprado);
    $("#lsTotal").textContent = moneyShort(done.reduce((s, i) => s + (i.preco || 0) * i.qtd, 0));
    $("#finCount").textContent = done.length;
  }

  function addFromInput() {
    const inp = $("#addInput");
    const v = inp.value.trim();
    if (!v) return;
    const it = S.addItem(v);
    if (it && it.preco == null) { const lp = S.lastPrice(it.nome); if (lp != null) S.setPrice(it.id, lp); } // aprende o preço
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

  /* ---------- editar item (modal) ---------- */
  let curItem = null;
  function openItemEdit(id) {
    const it = S.findItem(id); if (!it) return;
    curItem = id;
    $("#ieName").value = it.nome;
    $("#ieQty").value = it.qtd;
    const pref = it.preco != null ? it.preco : S.lastPrice(it.nome);   // valor aprendido (não precisa digitar)
    $("#iePrice").value = fmtPrice(pref);
    updateIeEmoji(); updateIeSub();
    openModal("#itemModal");
  }
  function updateIeEmoji() { $("#ieEmoji").innerHTML = emojiHTML(S.matchEmoji($("#ieName").value || "")); }
  const ieQtyVal = () => Math.max(1, Math.min(999, parseInt($("#ieQty").value, 10) || 1));
  const iePriceVal = () => parseMoneyStr($("#iePrice").value);
  function updateIeSub() { $("#ieSub").textContent = money(ieQtyVal() * iePriceVal()); }

  /* ---------- seleção / excluir vários + desfazer ---------- */
  let selectMode = false;
  const selected = new Set();
  function enterSelect() { selectMode = true; selected.clear(); renderLista(); updateSelBar(); $("#selBar").classList.remove("hidden"); }
  function exitSelect() { selectMode = false; selected.clear(); $("#selBar").classList.add("hidden"); renderLista(); }
  function toggleSelect(id) {
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    const row = document.querySelector('.item[data-id="' + id + '"]');
    if (row) row.classList.toggle("selected", selected.has(id));
    updateSelBar();
  }
  function updateSelBar() {
    const n = selected.size, total = S.raw.lista.length;
    $("#selCount").textContent = n + (n === 1 ? " selecionado" : " selecionados");
    $("#selDelete").disabled = n === 0;
    $("#selAll").textContent = (n === total && total > 0) ? "Nenhum" : "Tudo";
  }
  function toggleSelectAll() {
    if (selected.size === S.raw.lista.length) selected.clear();
    else S.raw.lista.forEach(i => selected.add(i.id));
    renderLista(); updateSelBar();
  }
  function askDeleteSelected() {
    const n = selected.size; if (!n) return;
    showConfirm("Excluir " + n + (n === 1 ? " item" : " itens") + "?", "Some da sua lista — mas dá pra desfazer logo depois.", () => {
      const ids = [...selected];
      const removed = S.removeItems(ids);
      exitSelect();
      showSnackbar(n + (n === 1 ? " item excluído" : " itens excluídos"), () => { S.restoreItems(removed); renderLista(); });
    });
  }

  /* ---------- confirmar ---------- */
  let confirmCb = null;
  function showConfirm(title, msg, onYes) {
    $("#confirmTitle").textContent = title;
    $("#confirmMsg").textContent = msg || "";
    confirmCb = onYes;
    openModal("#confirmModal");
  }

  /* ---------- snackbar (desfazer) ---------- */
  let snackTimer = null, snackCb = null;
  function showSnackbar(text, onUndo) {
    $("#snackText").textContent = text;
    snackCb = onUndo;
    $("#snackbar").classList.remove("hidden");
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { $("#snackbar").classList.add("hidden"); snackCb = null; }, 6000);
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
     TELA: INSIGHTS (com período)
  ========================================================= */
  const INS_PERIODS = [{ v: 7, l: "7 dias" }, { v: 14, l: "14 dias" }, { v: 30, l: "30 dias" }, { v: 60, l: "60 dias" }, { v: 90, l: "90 dias" }, { v: "all", l: "Tudo" }, { v: "custom", l: "Personalizado" }];
  let insPeriod = 30, insCustom = null;

  function insRange() {
    const today = todayISO();
    if (insPeriod === "all") return { from: "0000-01-01", to: today, label: "Desde o começo" };
    if (insPeriod === "custom" && insCustom && insCustom.from && insCustom.to) {
      const a = insCustom.from <= insCustom.to ? insCustom.from : insCustom.to;
      const b = insCustom.from <= insCustom.to ? insCustom.to : insCustom.from;
      return { from: a, to: b, label: `${dLabel(a)} a ${dLabel(b)}` };
    }
    const d = new Date(); d.setDate(d.getDate() - (insPeriod - 1));
    return { from: d.toISOString().slice(0, 10), to: today, label: `Últimos ${insPeriod} dias` };
  }
  function monthBuckets(fromISO, toISO) {
    const endD = new Date(toISO + "T00:00:00"), fromYm = fromISO.slice(0, 7), out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endD.getFullYear(), endD.getMonth() - i, 1);
      const ym = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      if (ym >= fromYm) out.push(ym);
    }
    return out;
  }
  function renderPeriodChips() {
    $("#insPeriodChips").innerHTML = INS_PERIODS.map(p =>
      `<button class="chip ${p.v === insPeriod ? "active" : ""}" data-p="${p.v}">${p.l}</button>`).join("");
    $("#insCustomRow").classList.toggle("hidden", insPeriod !== "custom");
  }

  function renderInsights() {
    const all = S.raw.compras;
    if (!all.length) { $("#insEmpty").classList.remove("hidden"); $("#insContent").classList.add("hidden"); return; }
    $("#insEmpty").classList.add("hidden"); $("#insContent").classList.remove("hidden");
    renderPeriodChips();

    const rg = insRange();
    $("#insPeriodLbl").textContent = rg.label;
    const fil = all.filter(c => c.data >= rg.from && c.data <= rg.to);

    const total = fil.reduce((s, c) => s + c.total, 0), n = fil.length;
    $("#insTotal").textContent = moneyShort(total);
    $("#insCount").textContent = n;
    $("#insAvg").textContent = moneyShort(n ? total / n : 0);

    // gasto por mês (dentro do período)
    const monT = monthBuckets(rg.from, rg.to).map(ym => ({ ym, total: fil.filter(c => c.data.slice(0, 7) === ym).reduce((s, c) => s + c.total, 0) }));
    const maxV = Math.max(1, ...monT.map(m => m.total));
    $("#insMonths").innerHTML = monT.map(m => {
      const h = m.total ? Math.max(Math.round(m.total / maxV * 100), 5) : 0;
      return `<div class="bar-col"><span class="bar-val">${m.total ? moneyShort(m.total) : ""}</span>
        <div class="bar-track"><div class="bar-fill" style="height:${h}%"></div></div>
        <span class="bar-lbl">${mShort(m.ym)}</span></div>`;
    }).join("");

    // por mercado (período)
    const mmap = {};
    fil.forEach(c => { mmap[c.mercado] = (mmap[c.mercado] || 0) + c.total; });
    const ms = Object.keys(mmap).map(k => ({ nome: k, total: mmap[k] })).sort((a, b) => b.total - a.total).slice(0, 6);
    const maxM = Math.max(1, ...ms.map(m => m.total));
    $("#insMarkets").innerHTML = ms.length ? ms.map(m => `<div class="hbar-row">
      <span class="hbar-name">${esc(m.nome)}</span>
      <div class="hbar-track"><div class="hbar-fill" style="width:${Math.max(Math.round(m.total / maxM * 100), 6)}%"></div></div>
      <span class="hbar-val">${money(m.total)}</span></div>`).join("") : `<p class="ins-none">Nada nesse período.</p>`;

    // top itens (período)
    const imap = {};
    fil.forEach(c => c.itens.forEach(it => { const k = S.norm(it.nome); if (!k) return; const o = imap[k] || (imap[k] = { nome: it.nome, vezes: 0, gasto: 0 }); o.vezes++; o.gasto += (it.preco || 0) * it.qtd; }));
    const tops = Object.values(imap).sort((a, b) => b.vezes - a.vezes || b.gasto - a.gasto).slice(0, 5);
    $("#insTop").innerHTML = tops.length ? tops.map(t => {
      const em = S.matchEmoji(t.nome);
      return `<div class="top-row"><span class="top-emoji">${emojiHTML(em)}</span>
        <span class="top-name">${esc(t.nome)}</span><span class="top-count">${t.vezes}×</span>
        <span class="top-gasto">${t.gasto ? money(t.gasto) : ""}</span></div>`;
    }).join("") : `<p class="ins-none">Nada nesse período.</p>`;

    // texto
    const bits = [];
    if (!n) bits.push("Nenhuma compra nesse período. 🤷");
    else {
      const best = [...monT].sort((a, b) => b.total - a.total)[0];
      if (best && best.total) bits.push(`📈 Maior gasto em <b>${ymLabel(best.ym)}</b> (${money(best.total)}).`);
      if (ms[0]) bits.push(`🏪 Você mais gastou no <b>${esc(ms[0].nome)}</b> — ${money(ms[0].total)}.`);
      if (tops[0]) bits.push(`🏆 Item campeão: <b>${esc(tops[0].nome)}</b>, ${tops[0].vezes}×.`);
      bits.push(`🧾 Foram <b>${n}</b> ${n === 1 ? "compra" : "compras"}, total <b>${money(total)}</b>.`);
    }
    $("#insText").innerHTML = bits.map(b => `<p>${b}</p>`).join("");
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
  function syncScrollLock() {
    const anyOpen = !!document.querySelector(".modal:not(.hidden)");
    const main = document.querySelector(".app-main");
    if (main) main.style.overflowY = anyOpen ? "hidden" : "auto";
  }
  function openModal(sel) { $(sel).classList.remove("hidden"); syncScrollLock(); }
  function closeModal(sel) { $(sel).classList.add("hidden"); syncScrollLock(); }
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

  /* ---------- nuvem / conta compartilhada ---------- */
  let cloudActive = false, applyingRemote = false, pushT = null;

  const docFromLocal = () => ({ lista: S.raw.lista, compras: S.raw.compras });
  function mergeDoc(remote) {
    if (!remote) return;
    const byId = (arr) => { const m = {}; (arr || []).forEach(x => { if (x && x.id) m[x.id] = x; }); return m; };
    const rl = byId(remote.lista), ll = byId(S.raw.lista);
    const lista = [...new Set([...Object.keys(rl), ...Object.keys(ll)])].map(id => rl[id] || ll[id]);
    const rc = byId(remote.compras), lc = byId(S.raw.compras);
    const compras = [...new Set([...Object.keys(rc), ...Object.keys(lc)])].map(id => rc[id] || lc[id]);
    S.replaceAll({ lista, compras });
  }
  function schedulePush() {
    if (!cloudActive || applyingRemote) return;
    clearTimeout(pushT);
    pushT = setTimeout(() => { window.MyCloud.push(docFromLocal()); }, 700);
  }
  function onRemote(data) { applyingRemote = true; mergeDoc(data); applyingRemote = false; renderAll(); toast("Lista atualizada ☁️"); }
  async function activateCloud() {
    const g = await window.MyCloud.ensureGrupo(); if (!g) return;
    applyingRemote = true; mergeDoc(await window.MyCloud.pull()); applyingRemote = false;
    renderAll(); cloudActive = true;
    window.MyCloud.push(docFromLocal());          // semeia a nuvem com o merge local
    window.MyCloud.subscribe(onRemote);
    refreshContaUI();
  }
  function refreshContaUI() {
    if (!$("#contaModal")) return;
    const logged = window.MyCloud.isLoggedIn();
    $("#authOut").classList.toggle("hidden", logged);
    $("#authIn").classList.toggle("hidden", !logged);
    if (logged) {
      $("#cWho").textContent = window.MyCloud.email() || "";
      const cm = $("#cMembers"); if (cm) { cm.textContent = ""; window.MyCloud.memberCount().then(n => { cm.textContent = n > 1 ? (n + " contas nesta lista 👥") : "Só você por enquanto — convide alguém 👆"; }); }
    }
    $("#cInvite").value = ""; $("#cMsg").textContent = "";
  }
  function initCloud() {
    if (!(window.MyCloud && window.MyCloud.isConfigured())) return;   // inerte se não configurado
    $("#miConta").classList.remove("hidden");
    S.setOnSave(schedulePush);
    window.MyCloud.init().then(async (ok) => {
      if (!ok) return;
      window.MyCloud.onAuth(() => { if (!window.MyCloud.isLoggedIn()) cloudActive = false; refreshContaUI(); });
      if (window.MyCloud.isLoggedIn()) await activateCloud();
    });
    $("#miConta").addEventListener("click", () => { closeModal("#menuModal"); refreshContaUI(); openModal("#contaModal"); });
    $("#cLogin").addEventListener("click", async () => {
      const r = await window.MyCloud.signIn($("#cEmail").value.trim(), $("#cPass").value);
      if (r.ok) { await activateCloud(); toast("Conectado ☁️"); } else $("#cMsg").textContent = "Não entrou: " + r.error;
    });
    $("#cSignup").addEventListener("click", async () => {
      const r = await window.MyCloud.signUp($("#cEmail").value.trim(), $("#cPass").value);
      $("#cMsg").textContent = r.ok ? (r.needsConfirm ? "Confirme o email e depois entre." : "Conta criada! Toque em Entrar.") : ("Erro: " + r.error);
    });
    $("#cGenInvite").addEventListener("click", async () => {
      const h = parseInt($("#cInviteDur").value, 10) || 0;
      $("#cInvite").value = "…";
      const c = await window.MyCloud.gerarConvite(h);
      $("#cInvite").value = c || "erro";
      if (c) toast(h ? "Código gerado — acesso por " + (h >= 720 ? "30 dias" : h >= 168 ? "7 dias" : "1 dia") + " ⏳" : "Código gerado — sem prazo");
    });
    // olho da senha
    $("#cEye").addEventListener("click", () => {
      const p = $("#cPass"); const show = p.type === "password";
      p.type = show ? "text" : "password"; $("#cEye").classList.toggle("on", show);
    });
    // esqueci minha senha
    $("#cForgot").addEventListener("click", async () => {
      const mail = $("#cEmail").value.trim();
      if (!mail) { $("#cMsg").textContent = "Digite seu email primeiro."; return; }
      const r = await window.MyCloud.resetPassword(mail);
      $("#cMsg").textContent = r.ok ? "Enviamos um link de redefinição pro seu email 📧" : ("Erro: " + r.error);
    });
    $("#cJoin").addEventListener("click", async () => {
      const r = await window.MyCloud.entrarPorCodigo($("#cJoinCode").value);
      if (r.ok) { applyingRemote = true; mergeDoc(await window.MyCloud.pull()); applyingRemote = false; renderAll(); cloudActive = true; window.MyCloud.subscribe(onRemote); toast("Entrou na conta compartilhada 🎉"); closeModal("#contaModal"); }
      else toast("Código inválido 😕");
    });
    $("#cLogout").addEventListener("click", async () => { await window.MyCloud.signOut(); cloudActive = false; refreshContaUI(); toast("Saiu da conta"); });
  }

  function switchScreen(id) {
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.scr === id));
    const m = document.querySelector(".app-main"); if (m) m.scrollTop = 0;
  }

  function refreshItemNames() {
    const dl = $("#itemNames"); if (!dl) return;
    dl.innerHTML = S.learnedNames().slice(0, 200).map(n => `<option value="${esc(n)}"></option>`).join("");
  }
  function renderAll() { renderLista(); renderHist(); renderMerc(); renderInsights(); refreshItemNames(); }

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
    $("#addForm").addEventListener("submit", e => { e.preventDefault(); addFromInput(); });
    $("#addBtn").addEventListener("mousedown", e => e.preventDefault()); // não tira o foco do input antes do clique (mobile)
    $("#addInput").addEventListener("input", updateAddEmoji);
    $("#listItems").addEventListener("click", onListClick);
    $("#listItems").addEventListener("input", onListInput);
    // editar item (modal)
    $("#ieName").addEventListener("input", updateIeEmoji);
    $("#ieMinus").addEventListener("click", () => { $("#ieQty").value = Math.max(1, ieQtyVal() - 1); updateIeSub(); });
    $("#iePlus").addEventListener("click", () => { $("#ieQty").value = Math.min(999, ieQtyVal() + 1); updateIeSub(); });
    $("#ieQty").addEventListener("input", updateIeSub);
    $("#iePrice").addEventListener("input", () => { maskMoney($("#iePrice")); updateIeSub(); });
    $("#ieSave").addEventListener("click", () => {
      if (!curItem) return;
      S.renameItem(curItem, $("#ieName").value);
      S.setQty(curItem, ieQtyVal());
      S.setPrice(curItem, ($("#iePrice").value || "").trim() === "" ? "" : iePriceVal());
      closeModal("#itemModal"); renderLista(); renderHist(); renderMerc(); toast("Item atualizado ✏️");
    });
    $("#ieDelete").addEventListener("click", () => { if (curItem) { S.removeItem(curItem); closeModal("#itemModal"); renderLista(); toast("Item removido"); } });
    // seleção / excluir vários
    $("#btnTrash").addEventListener("click", () => { if (selectMode) exitSelect(); else if (!S.raw.lista.length) toast("Lista vazia 🛒"); else enterSelect(); });
    $("#selCancel").addEventListener("click", exitSelect);
    $("#selAll").addEventListener("click", toggleSelectAll);
    $("#selDelete").addEventListener("click", askDeleteSelected);
    $("#confirmYes").addEventListener("click", () => { closeModal("#confirmModal"); const cb = confirmCb; confirmCb = null; if (cb) cb(); });
    $("#confirmNo").addEventListener("click", () => { closeModal("#confirmModal"); confirmCb = null; });
    $("#snackUndo").addEventListener("click", () => { clearTimeout(snackTimer); $("#snackbar").classList.add("hidden"); const cb = snackCb; snackCb = null; if (cb) { cb(); toast("Restaurado 👍"); } });
    // finalizar
    $("#btnFinalizar").addEventListener("click", openFinalizar);
    $("#finConfirm").addEventListener("click", confirmFinalizar);
    $("#finMercChips").addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) $("#finMercado").value = c.dataset.merc; });
    // histórico / mercados
    $("#histFilters").addEventListener("click", onHistClick);
    $("#histList").addEventListener("click", onHistClick);
    $("#mercList").addEventListener("click", onMercClick);
    // insights: período
    $("#insPeriodChips").addEventListener("click", e => {
      const c = e.target.closest(".chip"); if (!c) return;
      const v = c.dataset.p; insPeriod = (v === "all" || v === "custom") ? v : parseInt(v, 10);
      if (insPeriod === "custom") {
        if (!$("#insTo").value) $("#insTo").value = todayISO();
        if (!$("#insFrom").value) { const d = new Date(); d.setDate(d.getDate() - 29); $("#insFrom").value = d.toISOString().slice(0, 10); }
      }
      renderInsights();
    });
    $("#insApply").addEventListener("click", () => { insCustom = { from: $("#insFrom").value, to: $("#insTo").value }; insPeriod = "custom"; renderInsights(); });
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
    $("#miAbout").addEventListener("click", () => { toast("Mylist v" + APP_VERSION + " · um app MorbiusFin 🛒"); });
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
      m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) { m.classList.add("hidden"); syncScrollLock(); } });
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
    initCloud();
  }

  window.MyApp = { emojiFallback };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
