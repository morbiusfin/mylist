/* ===== Mylist — nuvem (conta compartilhada via Supabase) =====
   INERTE até configurar. Preencha CONFIG com os dados do seu projeto Supabase:
     url  = Project URL   (ex.: https://xxxx.supabase.co)
     anon = anon public key (pode ficar no código — é pública)
   E rode sql/schema.sql no SQL Editor do Supabase. */
(function () {
  "use strict";

  const CONFIG = {
    url:  "https://bpkiiwtxjtqyvuamyuzf.supabase.co",
    anon: "sb_publishable_69wtpOAXEtsuA4XWyhSugA_yY5LWKwN"   // publishable key (pública; RLS protege os dados)
  };

  const state = { client: null, user: null, grupoId: null, channel: null, ready: false };
  const isConfigured = () => !!(CONFIG.url && CONFIG.anon);
  let onRemoteCb = null, onAuthCb = null;

  async function loadLib() {
    const m = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
    return m.createClient;
  }

  async function init() {
    if (!isConfigured() || state.ready) return isConfigured();
    try {
      const createClient = await loadLib();
      state.client = createClient(CONFIG.url, CONFIG.anon, { auth: { persistSession: true, autoRefreshToken: true } });
      const { data } = await state.client.auth.getSession();
      state.user = data && data.session ? data.session.user : null;
      state.client.auth.onAuthStateChange((_e, session) => {
        state.user = session ? session.user : null;
        if (!state.user) { state.grupoId = null; if (state.channel) { try { state.client.removeChannel(state.channel); } catch (e) {} state.channel = null; } }
        if (onAuthCb) onAuthCb(state.user);
      });
      state.ready = true;
      return true;
    } catch (e) { console.warn("[cloud] init falhou", e); return false; }
  }

  const isLoggedIn = () => !!state.user;
  const email = () => state.user ? state.user.email : null;

  async function signUp(mail, pw) {
    try { const { data, error } = await state.client.auth.signUp({ email: mail, password: pw }); if (error) throw error; return { ok: true, needsConfirm: !data.session }; }
    catch (e) { return { ok: false, error: e.message || String(e) }; }
  }
  async function signIn(mail, pw) {
    try { const { error } = await state.client.auth.signInWithPassword({ email: mail, password: pw }); if (error) throw error; return { ok: true }; }
    catch (e) { return { ok: false, error: e.message || String(e) }; }
  }
  async function signOut() { try { await state.client.auth.signOut(); } catch (e) {} state.grupoId = null; }

  // acha meu grupo (conta compartilhada) ou cria um
  async function ensureGrupo() {
    if (!state.user) return null;
    try {
      const { data: mine } = await state.client.from("membros").select("grupo_id").eq("user_id", state.user.id).limit(1);
      if (mine && mine.length) { state.grupoId = mine[0].grupo_id; return state.grupoId; }
      const { data: g, error } = await state.client.from("grupos").insert({ criado_por: state.user.id }).select("id").single();
      if (error) throw error;
      await state.client.from("membros").insert({ grupo_id: g.id, user_id: state.user.id, papel: "dono" });
      state.grupoId = g.id; return state.grupoId;
    } catch (e) { console.warn("[cloud] ensureGrupo", e); return null; }
  }

  async function pull() {
    if (!state.grupoId) return null;
    try { const { data, error } = await state.client.from("grupos").select("data").eq("id", state.grupoId).single(); if (error) throw error; return data ? data.data : null; }
    catch (e) { console.warn("[cloud] pull", e); return null; }
  }
  async function push(doc) {
    if (!state.grupoId) return { ok: false };
    try { const { error } = await state.client.from("grupos").update({ data: doc, updated_at: new Date().toISOString(), updated_by: state.user.id }).eq("id", state.grupoId); if (error) throw error; return { ok: true }; }
    catch (e) { console.warn("[cloud] push", e); return { ok: false, error: e.message }; }
  }

  function subscribe(cb) {
    onRemoteCb = cb;
    if (!state.grupoId || state.channel) return;
    try {
      state.channel = state.client
        .channel("grupo-" + state.grupoId)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "grupos", filter: "id=eq." + state.grupoId },
          (payload) => {
            const row = payload.new;
            if (!row) return;
            if (row.updated_by && state.user && row.updated_by === state.user.id) return; // fui eu
            if (onRemoteCb) onRemoteCb(row.data);
          })
        .subscribe();
    } catch (e) { console.warn("[cloud] subscribe", e); }
  }

  async function gerarConvite() {
    if (!state.grupoId) return null;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    try { const { error } = await state.client.from("convites").insert({ codigo: code, grupo_id: state.grupoId, criado_por: state.user.id }); if (error) throw error; return code; }
    catch (e) { console.warn("[cloud] convite", e); return null; }
  }
  async function entrarPorCodigo(code) {
    try {
      const { data, error } = await state.client.rpc("entrar_por_codigo", { p_codigo: (code || "").trim().toUpperCase() });
      if (error) throw error;
      state.grupoId = data; return { ok: true, grupoId: data };
    } catch (e) { return { ok: false, error: e.message || String(e) }; }
  }

  async function memberCount() {
    if (!state.grupoId) return 0;
    try { const { count } = await state.client.from("membros").select("*", { count: "exact", head: true }).eq("grupo_id", state.grupoId); return count || 0; }
    catch (e) { return 0; }
  }

  window.MyCloud = {
    isConfigured, init, isLoggedIn, email,
    signUp, signIn, signOut,
    ensureGrupo, pull, push, subscribe, gerarConvite, entrarPorCodigo, memberCount,
    onAuth: (cb) => { onAuthCb = cb; }
  };
})();
