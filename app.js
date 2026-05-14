/* ============================================================
   scriptie — werkruimte
   Vandaag · Stelling · Gesprekken · Praktijk · Instellingen
   Pure HTML/CSS/JS · localStorage · niets verlaat dit toestel
   ============================================================ */

/* ---------- storage keys ---------- */
const KEY = {
  stelling:  "scriptie_stelling_v1",
  gespreks:  "scriptie_gesprekken_v1",
  praktijk:  "scriptie_praktijk_v1",
  themas:    "scriptie_themas_v1",
  activity:  "scriptie_activity_v1",
  meta:      "scriptie_meta_v1",
};

const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- default themas (with TR + NL + EN keywords) ---------- */
const DEFAULT_THEMAS = [
  { tag: "#articulatie", keywords: ["articulatie", "articulation", "prompt", "tarif", "uitleg", "verbaliseren", "verwoorden", "ifade"] },
  { tag: "#partner",     keywords: ["partner", "samen", "co-creatief", "co-creative", "collaboratie", "samenwerking", "meedenken", "ortak"] },
  { tag: "#multimodaal", keywords: ["multimodaal", "multimodal", "gesture", "jest", "voice", "stem", "drawing", "tekenen", "tablet", "ses"] },
  { tag: "#ambacht",     keywords: ["ambacht", "craft", "sezgi", "intuition", "el-göz", "hand-eye", "pre-linguistic", "gevoel"] },
  { tag: "#methodologie", keywords: ["methodologie", "methode", "methodology", "aanpak", "research-through-design", "RTD", "yöntem"] },
  { tag: "#pedagogie",   keywords: ["pedagogie", "pedagogy", "onderwijs", "lesgeven", "teach", "curriculum", "öğret"] },
  { tag: "#kritiek",     keywords: ["kritiek", "critique", "criticism", "Stikker", "Rasch", "macht", "frictie", "ethiek", "dataïsme"] },
  { tag: "#illustrator", keywords: ["illustrator", "jsx", "extendscript", "osascript", "bridge", "köprü", "vector", "vektör"] },
  { tag: "#proces",      keywords: ["proces", "iteratie", "iteration", "schets", "sketch", "feedback loop", "iterasyon"] },
];

/* ---------- storage helpers ---------- */
const store = {
  load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  save(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

/* ---------- state ---------- */
let state = {
  stellingen: store.load(KEY.stelling, []),     // [{version, content, date}]
  gespreks:   store.load(KEY.gespreks,  []),    // [{id, titel, datum, bron, inhoud, themas}]
  praktijk:   store.load(KEY.praktijk,  []),    // [{id, titel, datum, probeerde, werkte, leerde, implicatie, themas}]
  themas:     store.load(KEY.themas,    null) ?? DEFAULT_THEMAS,
  activity:   store.load(KEY.activity,  []),    // [{date, type, action, refId}]
  meta:       store.load(KEY.meta, { lastSuggestionIdx: 0, suggestionShownDate: null }),
  currentTab: "vandaag",
  searchQuery: "",
  filterTheme: "",
};

// First-run: persist default themas
if (!store.load(KEY.themas, null)) store.save(KEY.themas, state.themas);

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
};
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
);

function showToast(msg, ms = 2200) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 200);
  }, ms);
}

/* ---------- activity log ---------- */
function logActivity(type, action, refId = null) {
  state.activity.push({ date: new Date().toISOString(), type, action, refId });
  // keep last 200
  if (state.activity.length > 200) state.activity = state.activity.slice(-200);
  store.save(KEY.activity, state.activity);
}

/* ---------- auto-tag (silent) ---------- */
function autoTag(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const t of state.themas) {
    for (const kw of (t.keywords || [])) {
      const k = kw.toLowerCase().trim();
      if (k && lower.includes(k)) {
        found.add(t.tag);
        break;
      }
    }
  }
  return Array.from(found);
}

/* ---------- tabs ---------- */
function switchTab(tab) {
  state.currentTab = tab;
  $$(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".panel").forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== tab));

  if (tab === "vandaag") renderVandaag();
  else if (tab === "stelling") renderStelling();
  else if (tab === "gesprekken") renderGesprekken();
  else if (tab === "praktijk") renderPraktijk();
  else if (tab === "instellingen") renderInstellingen();
}

/* ============ VANDAAG ============ */

const SUGGESTIONS = [
  {
    title: "Eerste stelling schrijven",
    detail: "Eén zin die je nu zou verdedigen. Wordt over een week alweer anders — dat is goed.",
    action: () => { switchTab("stelling"); openStellingModal(); },
    when: () => state.stellingen.length === 0,
  },
  {
    title: "Stelling herlezen",
    detail: "Lees je huidige versie. Eén woord aanpassen mag, hoeft niet.",
    action: () => { switchTab("stelling"); },
    when: () => state.stellingen.length > 0,
  },
  {
    title: "Een gesprek plakken",
    detail: "Plak je laatste Claude-conversatie. Thema's komen vanzelf, jij hoeft niets te taggen.",
    action: () => { switchTab("gesprekken"); openGesprekModal(); },
  },
  {
    title: "Korte praktijk-sessie loggen",
    detail: "Vijf zinnen over wat je deze week probeerde. Wat werkte, wat leerde je.",
    action: () => { switchTab("praktijk"); openPraktijkModal(); },
  },
  {
    title: "Laatste praktijk-entry herlezen",
    detail: "Open je vorige experiment. Voeg een gedachte toe als die nu beschikbaar is.",
    action: () => { switchTab("praktijk"); },
    when: () => state.praktijk.length > 0,
  },
  {
    title: "Onbeantwoorde vraag opschrijven",
    detail: "Wat zit er in je hoofd waar je geen antwoord op hebt? Schrijf het kort op in een praktijk-entry als reflectie.",
    action: () => { switchTab("praktijk"); openPraktijkModal(); },
  },
  {
    title: "Stelling-versies vergelijken",
    detail: "Je eerste versus je huidige. Wat veranderde, en waarom?",
    action: () => { switchTab("stelling"); },
    when: () => state.stellingen.length >= 2,
  },
  {
    title: "Zoek door je gesprekken",
    detail: "Eén woord typen in zoekbalk — zie wat je over dat onderwerp al hebt gedacht.",
    action: () => { switchTab("gesprekken"); $("#gesprek-search").focus(); },
    when: () => state.gespreks.length > 0,
  },
];

function pickSuggestion() {
  // Filter by `when` predicate (default: always applicable)
  const eligible = SUGGESTIONS.filter((s) => !s.when || s.when());

  // If new day, rotate; else show same
  const today = todayISO();
  if (state.meta.suggestionShownDate !== today) {
    state.meta.lastSuggestionIdx = (state.meta.lastSuggestionIdx + 1) % eligible.length;
    state.meta.suggestionShownDate = today;
    store.save(KEY.meta, state.meta);
  }
  return eligible[state.meta.lastSuggestionIdx % eligible.length];
}

function nextSuggestion() {
  state.meta.lastSuggestionIdx += 1;
  store.save(KEY.meta, state.meta);
  renderSuggestion();
}

let _currentSuggestion = null;
function renderSuggestion() {
  const s = pickSuggestion();
  _currentSuggestion = s;
  $("#suggestion-title").textContent = s.title;
  $("#suggestion-detail").textContent = s.detail;
}

function renderVandaag() {
  // Stelling banner
  const latest = state.stellingen[state.stellingen.length - 1];
  if (latest) {
    $("#stelling-display").textContent = latest.content;
    $("#stelling-version").textContent = "v" + latest.version;
  } else {
    $("#stelling-display").innerHTML = "Nog geen stelling geformuleerd. Klik op <em>stelling</em> om te beginnen.";
    $("#stelling-version").textContent = "v0";
  }

  renderSuggestion();
  renderMomentum();
  renderRecentActivity();
}

function renderMomentum() {
  const strip = $("#momentum-strip");
  strip.innerHTML = "";
  const today = todayISO();

  // count activity per day for last 14 days
  const byDay = {};
  for (const a of state.activity) {
    const day = a.date.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const iso = d.toISOString().slice(0, 10);
    const count = byDay[iso] || 0;
    const dot = document.createElement("span");
    dot.className = "momentum-dot";
    if (count >= 1) dot.classList.add("active-low");
    if (count >= 3) dot.classList.add("active-mid");
    if (count >= 5) dot.classList.add("active-high");
    if (iso === today) dot.classList.add("today");
    dot.title = `${iso} · ${count} actie${count === 1 ? "" : "s"}`;
    strip.appendChild(dot);
  }

  // stats
  const last30 = state.activity.filter((a) => Date.now() - new Date(a.date).getTime() < 30 * DAY_MS);
  const last30Days = new Set(last30.map((a) => a.date.slice(0, 10))).size;
  const stelTotal = state.stellingen.length;
  const gesTotal = state.gespreks.length;
  const prakTotal = state.praktijk.length;

  $("#momentum-stats").textContent =
    `${last30Days} actieve dagen / 30  ·  ${stelTotal} stelling-versie${stelTotal === 1 ? "" : "s"}  ·  ${gesTotal} gesprek${gesTotal === 1 ? "" : "ken"}  ·  ${prakTotal} praktijk-sessie${prakTotal === 1 ? "" : "s"}`;
}

function renderRecentActivity() {
  const ul = $("#activity-list");
  ul.innerHTML = "";
  const recent = [...state.activity].slice(-8).reverse();
  if (recent.length === 0) {
    ul.innerHTML = '<li class="muted small">Nog geen activiteit. Begin met de stelling of plak een gesprek.</li>';
    return;
  }
  for (const a of recent) {
    const li = document.createElement("li");
    const d = new Date(a.date);
    const when = d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) +
                 " · " + d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
    li.innerHTML = `<span class="when">${escapeHtml(when)}</span><span class="what">${escapeHtml(a.action)}</span>`;
    ul.appendChild(li);
  }
}

/* ============ STELLING ============ */

function renderStelling() {
  const cur = state.stellingen[state.stellingen.length - 1];
  if (cur) {
    $("#stelling-display-big").textContent = cur.content;
    $("#stelling-version-big").textContent = "v" + cur.version;
    $("#stelling-date").textContent = fmtDate(cur.date);
  } else {
    $("#stelling-display-big").textContent = "Nog niets geformuleerd.";
    $("#stelling-version-big").textContent = "v0";
    $("#stelling-date").textContent = "—";
  }

  const ol = $("#version-list");
  ol.innerHTML = "";
  const older = [...state.stellingen].slice(0, -1).reverse();
  if (older.length === 0) {
    ol.innerHTML = '<li class="muted small">Geen vorige versies.</li>';
    return;
  }
  for (const s of older) {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="ver-tag">v${s.version} · ${escapeHtml(fmtDate(s.date))}</div>
      <div class="ver-content">${escapeHtml(s.content)}</div>
    `;
    ol.appendChild(li);
  }
}

function openStellingModal() {
  const latest = state.stellingen[state.stellingen.length - 1];
  $("#stelling-input").value = latest ? latest.content : "";
  $("#modal-stelling").classList.remove("hidden");
  setTimeout(() => $("#stelling-input").focus(), 50);
}
function closeStellingModal() { $("#modal-stelling").classList.add("hidden"); }

function saveStelling() {
  const content = $("#stelling-input").value.trim();
  if (!content) { showToast("Tekst is leeg"); return; }
  const latest = state.stellingen[state.stellingen.length - 1];
  if (latest && latest.content === content) {
    showToast("Geen verandering t.o.v. vorige versie");
    closeStellingModal();
    return;
  }
  const version = (latest?.version || 0) + 1;
  state.stellingen.push({ version, content, date: new Date().toISOString() });
  store.save(KEY.stelling, state.stellingen);
  logActivity("stelling", `Stelling v${version} opgeslagen`, version);
  closeStellingModal();
  renderStelling();
  showToast("Stelling v" + version + " opgeslagen");
}

/* ============ GESPREKKEN ============ */

function renderGesprekken() {
  // populate filter dropdown with active themes from existing gespreks
  const filter = $("#gesprek-filter");
  const inUse = new Set();
  state.gespreks.forEach((g) => (g.themas || []).forEach((t) => inUse.add(t)));
  const opts = ['<option value="">alle thema\'s</option>'].concat(
    Array.from(inUse).sort().map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
  );
  filter.innerHTML = opts.join("");
  filter.value = state.filterTheme;

  const q = state.searchQuery.toLowerCase().trim();
  let items = [...state.gespreks].sort((a, b) => (b.datum || "").localeCompare(a.datum || ""));
  if (state.filterTheme) items = items.filter((g) => (g.themas || []).includes(state.filterTheme));
  if (q) items = items.filter((g) =>
    (g.titel || "").toLowerCase().includes(q) ||
    (g.inhoud || "").toLowerCase().includes(q) ||
    (g.bron || "").toLowerCase().includes(q)
  );

  const ul = $("#gesprek-list");
  if (items.length === 0) {
    ul.innerHTML = state.gespreks.length === 0
      ? '<li class="empty muted">Nog geen gesprekken. Klik op <em>+ nieuw gesprek</em> om er een te plakken.</li>'
      : '<li class="empty muted">Geen resultaten voor deze zoekopdracht.</li>';
    return;
  }
  ul.innerHTML = "";
  for (const g of items) {
    const li = document.createElement("li");
    li.className = "gesprek-item";
    li.dataset.id = g.id;
    const snippet = (g.inhoud || "").slice(0, 220);
    const tags = (g.themas || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    li.innerHTML = `
      <div class="gesprek-item-title">${escapeHtml(g.titel || "(geen titel)")}</div>
      <div class="gesprek-item-meta">
        <span class="date">${escapeHtml(fmtDate(g.datum))}</span>
        ${g.bron ? `<span class="muted small">via ${escapeHtml(g.bron)}</span>` : ""}
        <span class="tag-row">${tags}</span>
      </div>
      ${snippet ? `<p class="gesprek-item-snippet">${escapeHtml(snippet)}</p>` : ""}
    `;
    li.addEventListener("click", () => openViewGesprek(g.id));
    ul.appendChild(li);
  }
}

let _editingGesprekId = null;
function openGesprekModal(existing = null) {
  _editingGesprekId = existing?.id || null;
  $("#modal-gesprek-title").textContent = existing ? "Gesprek bewerken" : "Nieuw gesprek";
  $("#gesprek-titel").value = existing?.titel || "";
  $("#gesprek-datum").value = existing?.datum || todayISO();
  $("#gesprek-bron").value = existing?.bron || "Claude Code";
  $("#gesprek-inhoud").value = existing?.inhoud || "";
  $("#tags-preview").classList.add("hidden");
  $("#tag-row").innerHTML = "";
  $("#modal-gesprek").classList.remove("hidden");
  setTimeout(() => $("#gesprek-titel").focus(), 50);

  // live preview tags as user types/pastes
  const ta = $("#gesprek-inhoud");
  const updateTagPreview = () => {
    const text = (ta.value || "") + " " + ($("#gesprek-titel").value || "");
    const tags = autoTag(text);
    const row = $("#tag-row");
    if (tags.length) {
      row.innerHTML = tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      $("#tags-preview").classList.remove("hidden");
    } else {
      $("#tags-preview").classList.add("hidden");
    }
  };
  ta.oninput = updateTagPreview;
  $("#gesprek-titel").oninput = updateTagPreview;
  updateTagPreview();
}

function closeGesprekModal() {
  $("#modal-gesprek").classList.add("hidden");
  _editingGesprekId = null;
}

function saveGesprek() {
  const titel = $("#gesprek-titel").value.trim();
  const inhoud = $("#gesprek-inhoud").value.trim();
  if (!inhoud) { showToast("Inhoud is leeg"); return; }
  const datum = $("#gesprek-datum").value || todayISO();
  const bron = $("#gesprek-bron").value.trim();
  const themas = autoTag(inhoud + " " + titel);

  if (_editingGesprekId) {
    const i = state.gespreks.findIndex((g) => g.id === _editingGesprekId);
    if (i !== -1) {
      state.gespreks[i] = { ...state.gespreks[i], titel, datum, bron, inhoud, themas };
      logActivity("gesprek", `Gesprek "${titel || "(zonder titel)"}" bijgewerkt`, _editingGesprekId);
    }
  } else {
    const g = { id: uid(), titel, datum, bron, inhoud, themas, createdAt: Date.now() };
    state.gespreks.push(g);
    logActivity("gesprek", `Gesprek "${titel || "(zonder titel)"}" toegevoegd${themas.length ? " (" + themas.join(", ") + ")" : ""}`, g.id);
  }
  store.save(KEY.gespreks, state.gespreks);
  closeGesprekModal();
  renderGesprekken();
  showToast("Opgeslagen");
}

function openViewGesprek(id) {
  const g = state.gespreks.find((x) => x.id === id);
  if (!g) return;
  $("#view-titel").textContent = g.titel || "(geen titel)";
  $("#view-meta").textContent = `${fmtDate(g.datum)}${g.bron ? " · via " + g.bron : ""}`;
  $("#view-tags").innerHTML = (g.themas || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  $("#view-inhoud").textContent = g.inhoud || "";
  $("#modal-view-gesprek").classList.remove("hidden");

  $("#btn-edit-view").onclick = () => {
    $("#modal-view-gesprek").classList.add("hidden");
    openGesprekModal(g);
  };
  $("#btn-delete-view").onclick = () => deleteGesprek(g.id);
}

function deleteGesprek(id) {
  const g = state.gespreks.find((x) => x.id === id);
  if (!g) return;
  if (!confirm(`Verwijderen: "${g.titel || "(geen titel)"}"?`)) return;
  state.gespreks = state.gespreks.filter((x) => x.id !== id);
  store.save(KEY.gespreks, state.gespreks);
  logActivity("gesprek", `Gesprek "${g.titel}" verwijderd`);
  $("#modal-view-gesprek").classList.add("hidden");
  renderGesprekken();
  showToast("Verwijderd");
}

/* ============ PRAKTIJK ============ */

function renderPraktijk() {
  const ul = $("#praktijk-list");
  const items = [...state.praktijk].sort((a, b) => (b.datum || "").localeCompare(a.datum || ""));
  if (items.length === 0) {
    ul.innerHTML = '<li class="empty muted">Nog geen praktijk-entries. Begin met je eerste experiment.</li>';
    return;
  }
  ul.innerHTML = "";
  for (const p of items) {
    const li = document.createElement("li");
    li.className = "praktijk-item";
    li.dataset.id = p.id;
    const tags = (p.themas || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    li.innerHTML = `
      <div class="gesprek-item-title">${escapeHtml(p.titel || "(geen titel)")}</div>
      <div class="gesprek-item-meta">
        <span class="date">${escapeHtml(fmtDate(p.datum))}</span>
        <span class="tag-row">${tags}</span>
      </div>
      ${p.leerde ? `<p class="gesprek-item-snippet"><strong>leerde:</strong> ${escapeHtml(p.leerde.slice(0, 180))}</p>` : ""}
    `;
    li.addEventListener("click", () => openViewPraktijk(p.id));
    ul.appendChild(li);
  }
}

let _editingPraktijkId = null;
function openPraktijkModal(existing = null) {
  _editingPraktijkId = existing?.id || null;
  $("#modal-praktijk-title").textContent = existing ? "Praktijk-sessie bewerken" : "Nieuwe praktijk-sessie";
  $("#praktijk-titel").value = existing?.titel || "";
  $("#praktijk-datum").value = existing?.datum || todayISO();
  $("#praktijk-probeerde").value = existing?.probeerde || "";
  $("#praktijk-werkte").value = existing?.werkte || "";
  $("#praktijk-leerde").value = existing?.leerde || "";
  $("#praktijk-implicatie").value = existing?.implicatie || "";
  $("#praktijk-themas").value = (existing?.themas || []).join(" ");
  $("#modal-praktijk").classList.remove("hidden");
  setTimeout(() => $("#praktijk-titel").focus(), 50);

  // live auto-tag as user types
  const fields = ["#praktijk-titel", "#praktijk-probeerde", "#praktijk-werkte", "#praktijk-leerde", "#praktijk-implicatie"];
  const update = () => {
    const allText = fields.map((s) => $(s).value).join(" ");
    const auto = autoTag(allText);
    // Only auto-populate if user hasn't typed in themas field yet
    if (!$("#praktijk-themas").dataset.userEdited && !existing) {
      $("#praktijk-themas").value = auto.join(" ");
    }
  };
  fields.forEach((s) => { $(s).oninput = update; });
  $("#praktijk-themas").oninput = () => { $("#praktijk-themas").dataset.userEdited = "1"; };
  if (!existing) delete $("#praktijk-themas").dataset.userEdited;
  update();
}

function closePraktijkModal() {
  $("#modal-praktijk").classList.add("hidden");
  _editingPraktijkId = null;
}

function savePraktijk() {
  const titel = $("#praktijk-titel").value.trim();
  const probeerde = $("#praktijk-probeerde").value.trim();
  if (!titel) { showToast("Titel is leeg"); return; }

  const datum = $("#praktijk-datum").value || todayISO();
  const werkte = $("#praktijk-werkte").value.trim();
  const leerde = $("#praktijk-leerde").value.trim();
  const implicatie = $("#praktijk-implicatie").value.trim();

  // Parse themas: split on whitespace, ensure # prefix
  const themas = $("#praktijk-themas").value
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : "#" + t));

  if (_editingPraktijkId) {
    const i = state.praktijk.findIndex((p) => p.id === _editingPraktijkId);
    if (i !== -1) {
      state.praktijk[i] = { ...state.praktijk[i], titel, datum, probeerde, werkte, leerde, implicatie, themas };
      logActivity("praktijk", `Praktijk "${titel}" bijgewerkt`, _editingPraktijkId);
    }
  } else {
    const p = { id: uid(), titel, datum, probeerde, werkte, leerde, implicatie, themas, createdAt: Date.now() };
    state.praktijk.push(p);
    logActivity("praktijk", `Praktijk "${titel}" toegevoegd`, p.id);
  }
  store.save(KEY.praktijk, state.praktijk);
  closePraktijkModal();
  renderPraktijk();
  showToast("Opgeslagen");
}

function openViewPraktijk(id) {
  const p = state.praktijk.find((x) => x.id === id);
  if (!p) return;
  $("#view-praktijk-titel").textContent = p.titel || "(geen titel)";
  $("#view-praktijk-meta").textContent = fmtDate(p.datum);
  $("#view-praktijk-tags").innerHTML = (p.themas || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const det = $("#view-praktijk-detail");
  det.innerHTML = `
    ${p.probeerde ? `<h4>wat probeerde ik?</h4><p>${escapeHtml(p.probeerde)}</p>` : ""}
    ${p.werkte ? `<h4>wat werkte / niet?</h4><p>${escapeHtml(p.werkte)}</p>` : ""}
    ${p.leerde ? `<h4>wat leerde ik?</h4><p>${escapeHtml(p.leerde)}</p>` : ""}
    ${p.implicatie ? `<div class="implicatie"><h4>implicatie voor stelling</h4><p>${escapeHtml(p.implicatie)}</p></div>` : ""}
  `;
  $("#modal-view-praktijk").classList.remove("hidden");

  $("#btn-delete-praktijk").onclick = () => {
    if (!confirm(`Verwijderen: "${p.titel}"?`)) return;
    state.praktijk = state.praktijk.filter((x) => x.id !== id);
    store.save(KEY.praktijk, state.praktijk);
    logActivity("praktijk", `Praktijk "${p.titel}" verwijderd`);
    $("#modal-view-praktijk").classList.add("hidden");
    renderPraktijk();
    showToast("Verwijderd");
  };
}

/* ============ INSTELLINGEN ============ */

function renderInstellingen() {
  const ul = $("#thema-list");
  ul.innerHTML = "";
  for (const t of state.themas) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="thema-name">${escapeHtml(t.tag)}</span>
      <span class="thema-keywords">${escapeHtml((t.keywords || []).join(", "))}</span>
      <button class="icon-btn" data-tag="${escapeHtml(t.tag)}" title="verwijder">✕</button>
    `;
    ul.appendChild(li);
  }
  ul.querySelectorAll("button[data-tag]").forEach((b) => {
    b.onclick = () => {
      const tag = b.dataset.tag;
      if (!confirm(`Thema ${tag} verwijderen?`)) return;
      state.themas = state.themas.filter((x) => x.tag !== tag);
      store.save(KEY.themas, state.themas);
      renderInstellingen();
    };
  });
}

function addTema() {
  let tag = $("#new-tema-tag").value.trim();
  const kwStr = $("#new-tema-keywords").value.trim();
  if (!tag || !kwStr) { showToast("Geef tag + trefwoorden"); return; }
  if (!tag.startsWith("#")) tag = "#" + tag;
  if (state.themas.some((t) => t.tag === tag)) {
    showToast("Thema bestaat al");
    return;
  }
  const keywords = kwStr.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  state.themas.push({ tag, keywords });
  store.save(KEY.themas, state.themas);
  $("#new-tema-tag").value = "";
  $("#new-tema-keywords").value = "";
  renderInstellingen();
  showToast("Thema toegevoegd");
}

/* ---------- import / export / reset ---------- */
function exportAll() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    stellingen: state.stellingen,
    gespreks: state.gespreks,
    praktijk: state.praktijk,
    themas: state.themas,
    activity: state.activity,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scriptie-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Geëxporteerd");
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!confirm("Importeren overschrijft je huidige werk. Doorgaan?")) return;
      if (d.stellingen) state.stellingen = d.stellingen;
      if (d.gespreks)   state.gespreks   = d.gespreks;
      if (d.praktijk)   state.praktijk   = d.praktijk;
      if (d.themas)     state.themas     = d.themas;
      if (d.activity)   state.activity   = d.activity;
      store.save(KEY.stelling, state.stellingen);
      store.save(KEY.gespreks, state.gespreks);
      store.save(KEY.praktijk, state.praktijk);
      store.save(KEY.themas,   state.themas);
      store.save(KEY.activity, state.activity);
      switchTab(state.currentTab);
      showToast("Geïmporteerd");
    } catch (e) {
      showToast("Kon bestand niet lezen");
      console.error(e);
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  if (!confirm("Echt alles wissen? Maak eerst een export voor de zekerheid.")) return;
  if (!confirm("Heel zeker?")) return;
  state.stellingen = [];
  state.gespreks = [];
  state.praktijk = [];
  state.activity = [];
  state.themas = DEFAULT_THEMAS;
  state.meta = { lastSuggestionIdx: 0, suggestionShownDate: null };
  Object.values(KEY).forEach((k) => localStorage.removeItem(k));
  store.save(KEY.themas, state.themas);
  switchTab("vandaag");
  showToast("Alles gewist");
}

/* ============ event wiring ============ */
function bindEvents() {
  // tabs
  $$(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $$('[data-go]').forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.go)));

  // suggestion
  $("#btn-accept-suggestion").addEventListener("click", () => {
    if (_currentSuggestion) {
      logActivity("vandaag", `Suggestie geaccepteerd: ${_currentSuggestion.title}`);
      _currentSuggestion.action();
    }
  });
  $("#btn-skip-suggestion").addEventListener("click", nextSuggestion);
  $("#btn-pass-suggestion").addEventListener("click", () => {
    logActivity("vandaag", "Vandaag overgeslagen — geen schuld");
    showToast("Tot morgen.");
  });

  // stelling
  $("#btn-edit-stelling").addEventListener("click", openStellingModal);
  $("#btn-save-stelling").addEventListener("click", saveStelling);
  $("#btn-cancel-stelling").addEventListener("click", closeStellingModal);
  $("#btn-close-stelling").addEventListener("click", closeStellingModal);

  // gesprekken
  $("#btn-new-gesprek").addEventListener("click", () => openGesprekModal());
  $("#btn-save-gesprek").addEventListener("click", saveGesprek);
  $("#btn-cancel-gesprek").addEventListener("click", closeGesprekModal);
  $("#btn-close-gesprek").addEventListener("click", closeGesprekModal);
  $("#btn-close-view").addEventListener("click", () => $("#modal-view-gesprek").classList.add("hidden"));

  $("#gesprek-search").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderGesprekken();
  });
  $("#gesprek-filter").addEventListener("change", (e) => {
    state.filterTheme = e.target.value;
    renderGesprekken();
  });

  // praktijk
  $("#btn-new-praktijk").addEventListener("click", () => openPraktijkModal());
  $("#btn-save-praktijk").addEventListener("click", savePraktijk);
  $("#btn-cancel-praktijk").addEventListener("click", closePraktijkModal);
  $("#btn-close-praktijk").addEventListener("click", closePraktijkModal);
  $("#btn-close-view-praktijk").addEventListener("click", () => $("#modal-view-praktijk").classList.add("hidden"));

  // instellingen
  $("#btn-add-tema").addEventListener("click", addTema);
  $("#btn-export").addEventListener("click", exportAll);
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = "";
  });
  $("#btn-reset").addEventListener("click", resetAll);

  // close modals on backdrop click
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.add("hidden");
    });
  });

  // ESC closes any modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".modal:not(.hidden)").forEach((m) => m.classList.add("hidden"));
  });
}

/* ---------- init ---------- */
function init() {
  bindEvents();
  switchTab("vandaag");
  // first open ever → log it
  if (state.activity.length === 0) {
    logActivity("system", "Werkruimte voor het eerst geopend");
    renderRecentActivity();
  }
}
init();
