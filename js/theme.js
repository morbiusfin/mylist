/* ===== Mylist — temas (claro/escuro + 12 cores) ===== */
(function () {
  "use strict";
  const KEY = "mylist_theme";

  // 12 cores (base ~600 p/ ler bem no claro e brilhar no escuro)
  const COLORS = [
    { id: "verde",    nome: "Verde",    hex: "#22c55e" },
    { id: "teal",     nome: "Teal",     hex: "#0d9488" },
    { id: "azul",     nome: "Azul",     hex: "#2563eb" },
    { id: "indigo",   nome: "Índigo",   hex: "#4f46e5" },
    { id: "roxo",     nome: "Roxo",     hex: "#9333ea" },
    { id: "rosa",     nome: "Rosa",     hex: "#db2777" },
    { id: "vermelho", nome: "Vermelho", hex: "#dc2626" },
    { id: "laranja",  nome: "Laranja",  hex: "#ea580c" },
    { id: "ambar",    nome: "Âmbar",    hex: "#d97706" },
    { id: "limao",    nome: "Limão",    hex: "#65a30d" },
    { id: "ciano",    nome: "Ciano",    hex: "#0891b2" },
    { id: "grafite",  nome: "Grafite",  hex: "#475569" }
  ];

  const MODES = {
    dark: {
      bg: "#0b0d11", bg2: "#111419", card: "#171b22", card2: "#1e232c",
      line: "rgba(255,255,255,.09)", text: "#eef1f5", muted: "#98a4b0",
      title1: "#ffffff", headerBg: "rgba(13,16,20,.82)", tabBg: "rgba(13,16,20,.9)",
      money: "#f59e0b", moneyD: "#d97706", softA: 0.16, lineA: 0.28, glowA: 0.14, shA: 0.34
    },
    light: {
      bg: "#f3f5f8", bg2: "#ffffff", card: "#ffffff", card2: "#eef2f6",
      line: "rgba(15,23,42,.10)", text: "#111721", muted: "#5b6673",
      title1: "#0b0d11", headerBg: "rgba(255,255,255,.86)", tabBg: "rgba(255,255,255,.93)",
      money: "#c2610a", moneyD: "#9a4c08", softA: 0.12, lineA: 0.30, glowA: 0.10, shA: 0.26
    }
  };

  /* --- cor helpers --- */
  const hexRgb = (h) => { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (r, g, b) => "#" + [r, g, b].map(x => clamp(x).toString(16).padStart(2, "0")).join("");
  const darken = (hex, f) => { const [r, g, b] = hexRgb(hex); return toHex(r * (1 - f), g * (1 - f), b * (1 - f)); };
  const rgba = (hex, a) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };
  const lum = (hex) => { const [r, g, b] = hexRgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

  function palette(colorId) { return COLORS.find(c => c.id === colorId) || COLORS[0]; }

  function apply(theme) {
    const mode = theme.mode === "light" ? "light" : "dark";
    const col = palette(theme.color);
    const M = MODES[mode];
    const a = col.hex;
    // texto sobre o accent: escolhe branco ou escuro pelo MAIOR contraste (WCAG)
    const cWhite = 1.05 / (lum(a) + 0.05);
    const cDark = (lum(a) + 0.05) / (lum("#0b0d11") + 0.05);
    const onAccent = cDark >= cWhite ? "#0b0d11" : "#ffffff";
    const r = document.documentElement, s = r.style;
    const set = (k, v) => s.setProperty(k, v);

    set("--bg", M.bg); set("--bg2", M.bg2); set("--card", M.card); set("--card2", M.card2);
    set("--line", M.line); set("--text", M.text); set("--muted", M.muted);
    set("--header-bg", M.headerBg); set("--tab-bg", M.tabBg);
    set("--orange", M.money); set("--orange-d", M.moneyD);

    set("--green", a); set("--green-d", darken(a, 0.16)); set("--green-dd", darken(a, 0.4));
    set("--on-accent", onAccent);
    set("--title-1", M.title1); set("--title-2", a);
    set("--accent-soft", rgba(a, M.softA)); set("--accent-softer", rgba(a, 0.05));
    set("--accent-line", rgba(a, M.lineA)); set("--accent-shadow", rgba(a, M.shA));
    set("--glow-a", rgba(a, M.glowA)); set("--glow-b", rgba(M.money, 0.06));

    r.dataset.mode = mode; r.dataset.accent = col.id;
    r.style.colorScheme = mode;
  }

  function get() {
    try { const t = JSON.parse(localStorage.getItem(KEY)); if (t && t.color) return { mode: t.mode || "dark", color: t.color }; } catch (e) {}
    return { mode: "dark", color: "verde" };
  }
  function save(theme) { try { localStorage.setItem(KEY, JSON.stringify(theme)); } catch (e) {} apply(theme); }

  apply(get()); // aplica na hora (antes do body renderizar → sem flash)

  window.MyTheme = { COLORS, get, save, apply, darken, rgba };
})();
