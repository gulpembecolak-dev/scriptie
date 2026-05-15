/* ============================================================
   scriptie · kick-start + dossiers
   Geen API, geen tokens. localStorage + IndexedDB (lokale blobs).
   ============================================================ */

const KEY = {
  state:     "scriptie_v2_state",       // kick-start state
  dossiers:  "scriptie_v3_dossiers",    // dossier list + items (geen blobs hier)
  meta:      "scriptie_v3_meta",        // { activeDossierId, currentView }
};

/* ============ PLAN — 30 dagen, bevroren content ============ */
const PLAN = [
  { d: 1,  date: "vr 15 mei",
    topic: "AI als curator — niet langer producent",
    source: { name: "Flanders DC Magazine — interviews Base Design Brussel & studio kpot", url: "https://www.flandersdc.be/nl/magazine/ai-grafisch-ontwerper-base-design-kpot", note: "longread, NL · ca. 15 min" },
    q: "Past de zin \"minder produceren, meer cureren\" bij jouw eigen werkweek? Geef één concreet voorbeeld." },
  { d: 2,  date: "za 16 mei",
    topic: "Iedereen is creatief — wat verliest creativiteit dan?",
    source: { name: "Tim Brys (VUB AI Lab) — \"Met AI is iedereen creatief, dus is niemand het nog\"", url: "https://ai.vub.ac.be/de-standaard-met-ai-is-iedereen-creatief-dus-is-niemand-het-nog/", note: "opinie-essay · ca. 10 min" },
    q: "Ga je mee met het idee dat democratisering creativiteit devalueert? Neem een kant — geen \"ja, maar\"." },
  { d: 3,  date: "zo 17 mei",
    topic: "Wat verandert er feitelijk in productie?",
    source: { name: "MediaComm — \"AI in grafisch ontwerp: hoe AI creativiteit verandert\"", url: "https://www.mediacomm.be/ai-in-grafisch-ontwerp-hoe-kunstmatige-intelligentie/", note: "praktijkartikel · ca. 8 min" },
    q: "Welke workflow zou jij anders inrichten met AI? Schrijf drie stappen op die je morgen al kunt proberen." },
  { d: 4,  date: "ma 18 mei",
    topic: "Synthese — Vlaamse week",
    source: { name: "(geen nieuwe bron) — herlees je notities van dag 1-3", url: "", note: "10-15 min reflectie" },
    q: "Is er een gedeelde lijn in wat Brusselse studio's en Vlaamse kritiek zeggen? Vat in 3 zinnen samen." },
  { d: 5,  date: "di 19 mei",
    topic: "AI als meer-dan-menselijke partner",
    source: { name: "Iohanna Nicenboim — \"Designing-with AI\" (PhD, TU Delft) — samenvatting + stellingen", url: "https://repository.tudelft.nl/file/File_97af0bb3-27fb-493f-9682-b518fc2f8191", note: "academisch PDF · focus op samenvatting" },
    q: "Wat betekent voor jou \"meer-dan-menselijk\" partner? Geef één voorbeeld uit je eigen praktijk." },
  { d: 6,  date: "wo 20 mei",
    topic: "Een vocabulaire om met AI te ontwerpen",
    source: { name: "Elisa Giaccardi e.a. — \"Rethink Design: A vocabulary for designing with AI\"", url: "https://www.tudelft.nl/en/2024/ide/november/rethink-design-a-vocabulary-for-designing-with-ai", note: "TU Delft open access · lees eerste 5 termen" },
    q: "Welke term raakt jouw werk het meest? Pas hem toe op één bestaand project van jezelf." },
  { d: 7,  date: "do 21 mei",
    topic: "AI als ontwerpmateriaal",
    source: { name: "Maaike Harbers — \"Verantwoord ontwerp van toepassingen met AI\" (lectorale rede, Hogeschool Rotterdam)", url: "https://www.hogeschoolrotterdam.nl/onderzoek/projecten-en-publicaties/creating-010/design-in-the-21st-century/Verantwoord-ontwerp-van-toepassingen-met-kunstmatige-intelligentie/", note: "NL · lectorale rede" },
    q: "Welk fysiek materiaal gedraagt zich het meest zoals AI — klei, water, taal, glas? Waarom?" },
  { d: 8,  date: "vr 22 mei",
    topic: "Zachte waarden die AI niet vat",
    source: { name: "Het Nieuwe Instituut — \"Onmetelijk belangrijk\" (TANGRAM)", url: "https://nieuweinstituut.nl/projects/onmetelijk-belangrijk", note: "project-dossier · architectuur, maar overdraagbaar" },
    q: "Lijst 3 \"zachte waarden\" in grafisch ontwerp die AI volgens jou nooit zal vatten." },
  { d: 9,  date: "za 23 mei",
    topic: "Macht — wie bezit de tools die jij gebruikt?",
    source: { name: "Marleen Stikker (Waag) — \"Uiteindelijk draait het om macht\"", url: "https://www.decreatievecoalitie.nl/nieuws/ai-deskundige-marleen-stikker-uiteindelijk-draait-het-om-macht", note: "interview-longread · ca. 12 min" },
    q: "Wat kun jij op studentenschaal concreet doen? Drie acties — klein mag." },
  { d: 10, date: "zo 24 mei",
    topic: "Praktische ethiek — een manifest",
    source: { name: "De Creatieve Coalitie — \"Werken met AI: Hulpmiddel, geen vervanger\"", url: "https://www.decreatievecoalitie.nl/nieuws/werken-met-ai-hulpmiddel-geen-vervanger", note: "richtlijnen / manifest" },
    q: "Schrijf 3 eigen regels voor jouw omgang met AI — kort, scherp, gebiedende wijs." },
  { d: 11, date: "ma 25 mei",
    topic: "Wanneer maakt AI je dommer?",
    source: { name: "De Groene Amsterdammer — \"Dommer dan AI\"", url: "https://www.groene.nl/artikel/dommer-dan-ai", note: "opinie-essay · NL" },
    q: "Beschrijf één moment waarin AI je dommer maakte — wat kon je achteraf niet meer zelf?" },
  { d: 12, date: "di 26 mei",
    topic: "Empirie — wat zegt 2026 echt?",
    source: { name: "Boekman #143 — \"Kunst en AI\" (themanummer)", url: "https://www.boekman.nl/tijdschrift/boekman-143-kunst-en-ai/", note: "inleiding + enquête onder 713 makers" },
    q: "Welke 3 cijfers raken jou het meest? Schrijf voor elk één zin: wat zegt dit?" },
  { d: 13, date: "wo 27 mei",
    topic: "Jouw positie in 2028",
    source: { name: "Boekman-enquête — vervolg, focus op resultaten", url: "https://www.boekman.nl/tijdschrift/boekman-143-kunst-en-ai/", note: "diepere lectuur van de cijfers" },
    q: "1 op 5 makers heeft minder werk door GenAI. Hoe positioneer jij jezelf als afstudeerder in 2028? 8-10 zinnen." },
  { d: 14, date: "do 28 mei",
    topic: "Synthese — kritische stem",
    source: { name: "(geen nieuwe bron) — herlees notities dag 9-13", url: "", note: "10-15 min" },
    q: "Schrijf een korte dialoog (½ pagina) tussen Stikker en Nicenboim over de toekomst van AI in design." },
  { d: 15, date: "vr 29 mei",
    topic: "De verborgen kost van AI",
    source: { name: "VPRO Tegenlicht — \"De prijs van AI\" (doc, 50 min)", url: "https://tegenlicht.vpro.nl/artikelen/de-prijs-van-ai-1", note: "documentaire · 50 min" },
    q: "Welke tool gebruik je dagelijks? Hoe verandert deze doc je kijk op die specifieke tool?" },
  { d: 16, date: "za 30 mei",
    topic: "Creativiteit en de design industrie",
    source: { name: "Pakhuis de Zwijger — \"Hoe AI ons creatiever kan maken\" met Bas van de Poel (Modem)", url: "https://dezwijger.nl/programma/hoe-kunstmatige-intelligentie-ons-creatiever-maakt", note: "opgenomen talk · online te bekijken" },
    q: "Eén uitspraak van Van de Poel die blijft hangen + jouw eerlijke reactie. Was hij overtuigend of te enthousiast?" },
  { d: 17, date: "zo 31 mei",
    topic: "Filosoof vs ontwerper — wie kijkt scherper?",
    source: { name: "De Nieuwe Wereld — podcast met Ad Verbrugge & Julia Janssen", url: "https://www.denieuwewereld.tv/", note: "podcast · ca. 90 min" },
    q: "Verbrugge is filosoof, Janssen ontwerper. Welk perspectief is waardevoller voor JOUW scriptie? Argumenteer met 2 redenen." },
  { d: 18, date: "ma 1 juni",
    topic: "Wat is originaliteit eigenlijk?",
    source: { name: "Universiteit van Nederland — Maarten Lamers, \"Kan AI een originele hit schrijven?\"", url: "https://www.universiteitvannederland.nl/podcast/kan-ai-een-originele-hit-schrijven", note: "korte college-podcast · 15-20 min" },
    q: "Schrijf JOUW definitie van originaliteit in grafisch ontwerp anno 2026 — formuleer 3 criteria." },
  { d: 19, date: "di 2 juni",
    topic: "Frictie als waarde (Rasch — deel 1)",
    source: { name: "Miriam Rasch — \"Frictie. Ethiek in tijden van dataïsme\" (inleiding + h.1)", url: "https://www.debezigebij.nl/boek/frictie/", note: "boek · leesfragment beschikbaar, fragment in /KAYNAK" },
    q: "Beschrijf één recent ontwerpproces waarin wrijving je werk verbeterde, en één waarin gladheid het verpestte." },
  { d: 20, date: "wo 3 juni",
    topic: "Frictie als waarde (Rasch — deel 2)",
    source: { name: "Rasch — \"Frictie\" (h.2 en 3, of vervolg van fragment)", url: "https://www.debezigebij.nl/boek/frictie/", note: "boek · diepgang" },
    q: "Hoe bouw je in een AI-workflow bewust tegenwicht tegen onthechting? Drie concrete voorstellen." },
  { d: 21, date: "do 4 juni",
    topic: "Wie maakte het internet? — context (Stikker boek)",
    source: { name: "Marleen Stikker — \"Het internet is stuk\" (inleiding)", url: "https://singeluitgeverijen.nl/de-geus/boek/het-internet-is-stuk/", note: "boek · NL · /KAYNAK" },
    q: "Dezelfde machtspatronen als 2010, andere technologie? Vergelijk Big Tech 2010 vs AI-tijdperk in 2 alinea's." },
  { d: 22, date: "vr 5 juni",
    topic: "Tussen 2019 en 2026 — wat veranderde echt?",
    source: { name: "Jarno Duursma — \"Machines met verbeeldingskracht\" (rapport)", url: "https://jarnoduursma.nl/app/uploads/2019/09/Jarno-Duursma-Machines-met-verbeeldingskracht.pdf", note: "rapport · gratis PDF · /KAYNAK" },
    q: "Wat zou Duursma in 2026 anders schrijven? Schrijf 5 zinnen alsof jij zijn 2026-update bent." },
  { d: 23, date: "za 6 juni",
    topic: "Hoe noem JIJ AI?",
    source: { name: "AIxDesign (Nadia Piet) — about-pagina + 1 essay", url: "https://aixdesign.co", note: "platform · NL/EN essays" },
    q: "Piet noemt AI vaak \"ontwerpmateriaal\". Wat zou JIJ AI noemen — gereedschap, partner, materiaal, gesprekspartner, iets anders? Argumenteer in 10 zinnen." },
  { d: 24, date: "zo 7 juni",
    topic: "Een ontwerper-onderzoeker als voorbeeld",
    source: { name: "Studio Julia Janssen — kies één project en lees de projectomschrijving", url: "https://studiojuliajanssen.com", note: "studio-portfolio · NL" },
    q: "Wat doet Janssen anders dan een typische \"AI-kunstenaar\"? Vergelijk visie en methode in 2 alinea's." },
  { d: 25, date: "ma 8 juni",
    topic: "Eerste manifest — jouw positie v1",
    source: { name: "(geen leeswerk) — alleen schrijven", url: "", note: "30 min voor jezelf" },
    q: "Schrijf in 200-300 woorden je eerste eigen positie: wat is AI voor jou in ontwerp? Geen citaten — eigen woorden. Dit vergelijk je later met dag 30." },
  { d: 26, date: "di 9 juni",
    topic: "Conceptmap — auteurs en ideeën verbinden",
    source: { name: "Blader door alle notities van dag 1-25", url: "", note: "papier + pen · 20 min" },
    q: "Teken op papier een conceptmap die auteurs en ideeën aan elkaar verbindt. Welke 3 verbindingen verbazen je?" },
  { d: 27, date: "wo 10 juni",
    topic: "Methodologie — wat ga jij doen?",
    source: { name: "Nicenboim methodologie-hoofdstuk (PhD)", url: "https://repository.tudelft.nl/file/File_97af0bb3-27fb-493f-9682-b518fc2f8191", note: "academisch · focus op methode" },
    q: "Welke onderzoeksmethode zou je in je scriptie toepassen? Beschrijf hoe je het zou aanpassen aan grafisch ontwerp." },
  { d: 28, date: "do 11 juni",
    topic: "Stem-balans — empirie + theorie + kritiek",
    source: { name: "Open je notities — geen nieuwe bron", url: "", note: "reflectie" },
    q: "Welke 3 auteurs/stemmen wil je ZEKER citeren? Voor elk: 1 zin waarom + welke plek in je scriptie." },
  { d: 29, date: "vr 12 juni",
    topic: "Open vragen — wat weet je nog niet?",
    source: { name: "(geen bron)", url: "", note: "een lijst maken · 15 min" },
    q: "Lijst 5 open vragen die je nog niet kunt beantwoorden. Welke is het belangrijkst om eerst aan te pakken?" },
  { d: 30, date: "za 13 juni",
    topic: "Eindmanifest — jouw positie v2",
    source: { name: "Lees je eigen tekst van dag 25 (manifest v1) terug", url: "", note: "30-45 min voor de tweede versie" },
    q: "Schrijf nu een tweede versie van JOUW positie — 300-400 woorden. Wat is veranderd na 30 dagen? Dit is een eerste serieuze draft voor je scriptie-inleiding." },
];

/* ============ helpers ============ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
);
function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(1) + " MB";
}
function fmtTime(ms) {
  return new Date(ms).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function toast(msg, ms = 1800) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.classList.add("hidden"), 200); }, ms);
}

/* ============ kick-start state ============ */
function loadKickState() {
  try { return JSON.parse(localStorage.getItem(KEY.state)) ?? { currentDay: null, notes: {}, done: [] }; }
  catch { return { currentDay: null, notes: {}, done: [] }; }
}
function saveKickState() { localStorage.setItem(KEY.state, JSON.stringify(kickState)); }
let kickState = loadKickState();

function todayDayIndex() {
  const start = new Date(2026, 4, 15);
  const today = new Date(); today.setHours(0,0,0,0); start.setHours(0,0,0,0);
  const diff = Math.floor((today - start) / 86400000);
  if (diff < 0) return 1;
  if (diff >= PLAN.length) return PLAN.length;
  return diff + 1;
}
function ensureCurrentDay() {
  if (kickState.currentDay == null) kickState.currentDay = todayDayIndex();
  kickState.currentDay = Math.max(1, Math.min(PLAN.length, kickState.currentDay));
  saveKickState();
}

function renderKick() {
  ensureCurrentDay();
  const day = PLAN.find((p) => p.d === kickState.currentDay) ?? PLAN[0];

  $("#day-tag").textContent = "DAG " + String(day.d).padStart(2, "0");
  $("#day-date").textContent = day.date;
  $("#day-topic").textContent = day.topic;

  if (day.source.url) {
    $("#source-link").textContent = day.source.name;
    $("#source-link").href = day.source.url;
    $("#source-link").style.pointerEvents = "auto";
  } else {
    $("#source-link").textContent = day.source.name;
    $("#source-link").removeAttribute("href");
    $("#source-link").style.pointerEvents = "none";
  }
  $("#source-meta").textContent = day.source.note || "";
  $("#day-question-text").textContent = day.q;
  $("#day-note").value = kickState.notes[day.d] || "";

  const isDone = kickState.done.includes(day.d);
  $("#btn-done").classList.toggle("done", isDone);
  $("#btn-done").textContent = isDone ? "klaar voor vandaag ✓" : "klaar voor vandaag";
  $("#done-state").textContent = isDone ? "afgevinkt" : "";
  $("#btn-prev").disabled = day.d <= 1;
  $("#btn-next").disabled = day.d >= PLAN.length;

  const total = PLAN.length;
  const doneN = kickState.done.length;
  $("#progress-text").textContent = `${doneN} / ${total}`;
  $("#progress-fill").style.width = (doneN / total * 100) + "%";

  renderGrid();
  document.querySelector(".card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGrid() {
  const grid = $("#day-grid");
  grid.innerHTML = "";
  for (const p of PLAN) {
    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (kickState.done.includes(p.d)) cell.classList.add("done");
    if (p.d === kickState.currentDay) cell.classList.add("current");
    if (kickState.notes[p.d] && kickState.notes[p.d].trim()) cell.classList.add("has-note");
    cell.textContent = p.d;
    cell.title = `Dag ${p.d} · ${p.date} · ${p.topic}`;
    cell.addEventListener("click", () => { kickState.currentDay = p.d; saveKickState(); renderKick(); });
    grid.appendChild(cell);
  }
}

/* ============ DOSSIERS state ============ */
let dossiers = (function () {
  try { return JSON.parse(localStorage.getItem(KEY.dossiers)) ?? []; }
  catch { return []; }
})();
let meta = (function () {
  try { return JSON.parse(localStorage.getItem(KEY.meta)) ?? { activeDossierId: null, currentView: "vandaag" }; }
  catch { return { activeDossierId: null, currentView: "vandaag" }; }
})();
function saveDossiers() { localStorage.setItem(KEY.dossiers, JSON.stringify(dossiers)); }
function saveMeta() { localStorage.setItem(KEY.meta, JSON.stringify(meta)); }

/* ============ IndexedDB blob store ============ */
const DB_NAME = "scriptie_files";
const DB_STORE = "blobs";

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = (e) => res(e.target.result);
    req.onerror = (e) => rej(e.target.error);
  });
}
async function putBlob(id, blob) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(blob, id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function getBlob(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction(DB_STORE).objectStore(DB_STORE).get(id);
    req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error);
  });
}
async function deleteBlob(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}

/* ============ object URL bookkeeping (memory) ============ */
const liveURLs = new Set();
function makeURL(blob) { const u = URL.createObjectURL(blob); liveURLs.add(u); return u; }
function clearURLs() { for (const u of liveURLs) URL.revokeObjectURL(u); liveURLs.clear(); }

/* ============ DOSSIERS render ============ */
function activeDossier() {
  return dossiers.find((d) => d.id === meta.activeDossierId) || dossiers[0] || null;
}

function renderDossiers() {
  const tabsEl = $("#dossier-tabs");
  tabsEl.innerHTML = "";

  if (dossiers.length === 0) {
    $("#dossier-empty").classList.remove("hidden");
    $("#dossier-body").classList.add("hidden");
    $("#dossier-actions").classList.add("hidden");
    return;
  }
  $("#dossier-empty").classList.add("hidden");
  $("#dossier-body").classList.remove("hidden");
  $("#dossier-actions").classList.remove("hidden");

  // Ensure activeDossierId points to existing
  if (!dossiers.some((d) => d.id === meta.activeDossierId)) {
    meta.activeDossierId = dossiers[0].id;
    saveMeta();
  }

  // Render dossier tabs — all visible. Click handler is delegated on parent.
  for (const d of dossiers) {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "dossier-tab";
    tab.dataset.dossierId = d.id;
    if (d.id === meta.activeDossierId) tab.classList.add("active");
    const itemCount = (d.items || []).length;
    tab.innerHTML = `
      <span class="dossier-tab-title">${escapeHtml(d.title || "(zonder titel)")}</span>
      <span class="dossier-tab-count">${itemCount}</span>
    `;
    tab.title = d.title || "(zonder titel)";
    tabsEl.appendChild(tab);
  }

  const d = activeDossier();
  if (!d) return;

  const count = (d.items || []).length;
  const metaTxt = `${count} stuk${count === 1 ? "" : "s"} · aangepast ${fmtTime(d.updatedAt || d.createdAt)}`;
  $("#dossier-meta-top").textContent = metaTxt;
  $("#dossier-meta").textContent = metaTxt;

  renderItems(d);
}

async function renderItems(d) {
  clearURLs();
  const ul = $("#item-list");
  ul.innerHTML = "";
  const items = [...(d.items || [])].sort((a, b) => b.createdAt - a.createdAt);

  if (items.length === 0) {
    ul.innerHTML = '<li class="item-empty muted">Nog niets in dit dossier. Voeg iets toe met de knoppen hierboven.</li>';
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "item item-" + item.type;
    li.dataset.id = item.id;

    if (item.type === "text") {
      li.innerHTML = `
        <div class="item-head">
          <span class="kicker">tekst · ${fmtTime(item.createdAt)}</span>
          <div class="item-actions">
            <button class="icon-btn" data-act="edit-text">✎</button>
            <button class="icon-btn" data-act="del">✕</button>
          </div>
        </div>
        <div class="item-text" data-role="text">${escapeHtml(item.content)}</div>
      `;
    } else if (item.type === "image") {
      let url = "";
      try {
        const blob = await getBlob(item.blobId);
        if (blob) url = makeURL(blob);
      } catch {}
      li.innerHTML = `
        <div class="item-head">
          <span class="kicker">afbeelding · ${escapeHtml(item.filename)} · ${fmtBytes(item.size)} · ${fmtTime(item.createdAt)}</span>
          <div class="item-actions">
            <button class="icon-btn" data-act="del">✕</button>
          </div>
        </div>
        ${url ? `<img class="item-image" src="${url}" alt="${escapeHtml(item.filename)}" />`
              : `<p class="muted small">(afbeelding niet teruggevonden)</p>`}
        ${item.caption ? `<p class="item-caption">${escapeHtml(item.caption)}</p>` : ""}
      `;
    } else if (item.type === "file") {
      let url = "";
      try {
        const blob = await getBlob(item.blobId);
        if (blob) url = makeURL(blob);
      } catch {}
      li.innerHTML = `
        <div class="item-head">
          <span class="kicker">bestand · ${fmtBytes(item.size)} · ${fmtTime(item.createdAt)}</span>
          <div class="item-actions">
            <button class="icon-btn" data-act="del">✕</button>
          </div>
        </div>
        <div class="item-file">
          <span class="file-icon">📄</span>
          ${url
            ? `<a href="${url}" download="${escapeHtml(item.filename)}" class="file-name">${escapeHtml(item.filename)}</a>`
            : `<span class="muted">${escapeHtml(item.filename)} (niet beschikbaar)</span>`}
        </div>
      `;
    }
    ul.appendChild(li);
  }

  // wire actions
  ul.querySelectorAll("button[data-act]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const itemEl = b.closest(".item");
      const itemId = itemEl.dataset.id;
      const act = b.dataset.act;
      if (act === "del") deleteItem(itemId);
      else if (act === "edit-text") editTextItem(itemId, itemEl);
    });
  });
}

/* ============ DOSSIER ops ============ */
function newDossier() {
  const title = prompt("Naam voor dit dossier:", "naamloos dossier");
  if (title == null) return;
  const id = uid();
  dossiers.push({ id, title: title.trim() || "naamloos dossier", items: [], createdAt: Date.now(), updatedAt: Date.now() });
  meta.activeDossierId = id;
  saveDossiers(); saveMeta();
  renderDossiers();
  toast("Dossier aangemaakt");
}

function renameDossier() {
  const d = activeDossier();
  if (!d) return;
  const title = prompt("Nieuwe naam:", d.title);
  if (title == null) return;
  d.title = title.trim() || "naamloos dossier";
  d.updatedAt = Date.now();
  saveDossiers();
  renderDossiers();
}

async function deleteDossier() {
  const d = activeDossier();
  if (!d) return;
  if (!confirm(`Verwijder dossier "${d.title}" met al z'n inhoud?`)) return;
  // remove blobs
  for (const it of (d.items || [])) {
    if (it.blobId) { try { await deleteBlob(it.blobId); } catch {} }
  }
  dossiers = dossiers.filter((x) => x.id !== d.id);
  meta.activeDossierId = dossiers[0]?.id || null;
  saveDossiers(); saveMeta();
  renderDossiers();
  toast("Verwijderd");
}

function setActiveDossier(id) {
  meta.activeDossierId = id;
  saveMeta();
  renderDossiers();
}

/* ============ ITEM ops ============ */
function addTextItem() {
  const d = activeDossier();
  if (!d) return;
  $("#adder-text-input").value = "";
  $("#adder-text").classList.remove("hidden");
  setTimeout(() => $("#adder-text-input").focus(), 50);
}
function saveTextItem() {
  const d = activeDossier();
  if (!d) return;
  const content = $("#adder-text-input").value.trim();
  if (!content) { $("#adder-text").classList.add("hidden"); return; }
  d.items = d.items || [];
  d.items.push({ id: uid(), type: "text", content, createdAt: Date.now() });
  d.updatedAt = Date.now();
  saveDossiers();
  $("#adder-text").classList.add("hidden");
  $("#adder-text-input").value = "";
  renderDossiers();
  toast("Tekst toegevoegd");
}
function cancelTextItem() {
  $("#adder-text").classList.add("hidden");
}

async function addFilesItem(filelist) {
  const d = activeDossier();
  if (!d) return;
  d.items = d.items || [];
  let count = 0;
  for (const f of filelist) {
    const blobId = uid();
    try {
      await putBlob(blobId, f);
      const isImage = (f.type || "").startsWith("image/");
      d.items.push({
        id: uid(),
        type: isImage ? "image" : "file",
        blobId,
        filename: f.name,
        mime: f.type || "",
        size: f.size,
        createdAt: Date.now(),
      });
      count++;
    } catch (e) {
      console.error("blob save failed", e);
      toast("Kon bestand niet opslaan (te groot?)");
    }
  }
  d.updatedAt = Date.now();
  saveDossiers();
  renderDossiers();
  if (count) toast(count + " toegevoegd");
}

async function deleteItem(itemId) {
  const d = activeDossier();
  if (!d) return;
  const item = (d.items || []).find((x) => x.id === itemId);
  if (!item) return;
  if (!confirm("Verwijderen?")) return;
  if (item.blobId) { try { await deleteBlob(item.blobId); } catch {} }
  d.items = d.items.filter((x) => x.id !== itemId);
  d.updatedAt = Date.now();
  saveDossiers();
  renderDossiers();
}

function editTextItem(itemId, itemEl) {
  const d = activeDossier();
  if (!d) return;
  const item = (d.items || []).find((x) => x.id === itemId);
  if (!item) return;
  const textEl = itemEl.querySelector('[data-role="text"]');
  // swap to textarea
  const ta = document.createElement("textarea");
  ta.value = item.content;
  ta.className = "item-edit-area";
  ta.rows = Math.min(15, Math.max(4, item.content.split("\n").length + 1));
  textEl.replaceWith(ta);

  const saveBar = document.createElement("div");
  saveBar.className = "adder-actions";
  saveBar.innerHTML = `<button class="btn-primary" id="item-save-edit">opslaan</button><button class="nav-btn" id="item-cancel-edit">annuleren</button>`;
  ta.after(saveBar);

  const cleanup = () => renderDossiers();
  $("#item-save-edit").addEventListener("click", () => {
    item.content = ta.value.trim();
    d.updatedAt = Date.now();
    saveDossiers();
    cleanup();
  });
  $("#item-cancel-edit").addEventListener("click", cleanup);
  ta.focus();
}

/* ============ view switching ============ */
function switchView(name) {
  meta.currentView = name;
  saveMeta();
  $$(".topnav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $("#view-vandaag").classList.toggle("hidden", name !== "vandaag");
  $("#view-dossiers").classList.toggle("hidden", name !== "dossiers");
  $("#progress-wrap").style.visibility = name === "vandaag" ? "visible" : "hidden";
  if (name === "vandaag") renderKick();
  else renderDossiers();
}

/* ============ event wiring ============ */
$$(".topnav-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));

$("#btn-prev").addEventListener("click", () => {
  kickState.currentDay = Math.max(1, kickState.currentDay - 1);
  saveKickState(); renderKick();
});
$("#btn-next").addEventListener("click", () => {
  kickState.currentDay = Math.min(PLAN.length, kickState.currentDay + 1);
  saveKickState(); renderKick();
});
$("#btn-jump-today").addEventListener("click", () => {
  kickState.currentDay = todayDayIndex();
  saveKickState(); renderKick();
});
$("#btn-done").addEventListener("click", () => {
  const d = kickState.currentDay;
  if (kickState.done.includes(d)) {
    kickState.done = kickState.done.filter((x) => x !== d);
    toast("Markering verwijderd");
  } else {
    kickState.done.push(d);
    kickState.done = [...new Set(kickState.done)].sort((a, b) => a - b);
    toast("Klaar — fijn, tot morgen.");
  }
  saveKickState(); renderKick();
});

let noteTimer;
$("#day-note").addEventListener("input", (e) => {
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    kickState.notes[kickState.currentDay] = e.target.value;
    saveKickState();
    renderGrid();
  }, 400);
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
  if (meta.currentView !== "vandaag") return;
  if (e.key === "ArrowLeft") $("#btn-prev").click();
  if (e.key === "ArrowRight") $("#btn-next").click();
});

/* dossier events */
$("#btn-new-dossier").addEventListener("click", newDossier);
$("#btn-rename-dossier").addEventListener("click", renameDossier);
$("#btn-delete-dossier").addEventListener("click", deleteDossier);

// Delegated click handler for dossier tabs (survives re-renders)
$("#dossier-tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".dossier-tab");
  if (!tab) return;
  const id = tab.dataset.dossierId;
  if (id) setActiveDossier(id);
});

$$('.add-btn').forEach((b) => {
  b.addEventListener("click", () => {
    if (b.dataset.add === "text") addTextItem();
    else if (b.dataset.add === "file") $("#file-picker").click();
  });
});
$("#file-picker").addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length) addFilesItem(e.target.files);
  e.target.value = "";
});
$("#adder-text-save").addEventListener("click", saveTextItem);
$("#adder-text-cancel").addEventListener("click", cancelTextItem);

/* ============ backup: export / import / reset ============ */

function blobToDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
function dataURLToBlob(dataURL) {
  const [meta, b64] = dataURL.split(",");
  const mime = (meta.match(/:(.*?);/) || [, "application/octet-stream"])[1];
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function exportAll() {
  toast("Back-up bezig…", 3000);
  const exportedDossiers = [];
  for (const d of dossiers) {
    const cleanDossier = { id: d.id, title: d.title, createdAt: d.createdAt, updatedAt: d.updatedAt, items: [] };
    for (const item of (d.items || [])) {
      const e = { id: item.id, type: item.type, createdAt: item.createdAt };
      if (item.type === "text") {
        e.content = item.content;
      } else if (item.blobId) {
        try {
          const blob = await getBlob(item.blobId);
          if (blob) {
            e.blobData = await blobToDataURL(blob);
            e.filename = item.filename;
            e.size = item.size;
            e.mime = item.mime;
            if (item.caption) e.caption = item.caption;
          }
        } catch (err) {
          console.warn("blob skip", err);
        }
      }
      cleanDossier.items.push(e);
    }
    exportedDossiers.push(cleanDossier);
  }
  const data = {
    version: 1,
    app: "scriptie",
    exportedAt: new Date().toISOString(),
    kickState,
    dossiers: exportedDossiers,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scriptie-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Geëxporteerd");
}

async function importAll(file) {
  let text;
  try { text = await file.text(); }
  catch { toast("Kon bestand niet lezen"); return; }
  let data;
  try { data = JSON.parse(text); }
  catch { toast("Geen geldig back-up bestand"); return; }
  if (!data.dossiers && !data.kickState) {
    toast("Bestand bevat geen scriptie-data");
    return;
  }
  if (!confirm("Importeren overschrijft je huidige werk. Doorgaan?")) return;

  // restore kick-start
  if (data.kickState) {
    kickState = { currentDay: null, notes: {}, done: [], ...data.kickState };
    saveKickState();
  }

  // restore dossiers
  if (Array.isArray(data.dossiers)) {
    const newDossiers = [];
    for (const d of data.dossiers) {
      const fresh = { id: d.id || uid(), title: d.title || "geïmporteerd", items: [], createdAt: d.createdAt || Date.now(), updatedAt: Date.now() };
      for (const item of (d.items || [])) {
        const ni = { id: item.id || uid(), type: item.type, createdAt: item.createdAt || Date.now() };
        if (item.type === "text") {
          ni.content = item.content || "";
        } else if (item.blobData) {
          try {
            const newBlobId = uid();
            const blob = dataURLToBlob(item.blobData);
            await putBlob(newBlobId, blob);
            ni.blobId = newBlobId;
            ni.filename = item.filename || "bestand";
            ni.size = item.size || blob.size;
            ni.mime = item.mime || blob.type;
            if (item.caption) ni.caption = item.caption;
          } catch (err) {
            console.warn("blob restore skip", err);
            continue;
          }
        }
        fresh.items.push(ni);
      }
      newDossiers.push(fresh);
    }
    dossiers = newDossiers;
    saveDossiers();
  }

  closeBackup();
  renderKick();
  renderDossiers();
  toast("Geïmporteerd");
}

async function resetAll() {
  if (!confirm("Echt alles wissen? Maak eerst een back-up.")) return;
  if (!confirm("Heel zeker? Dit kan niet ongedaan gemaakt worden.")) return;

  // delete all blobs
  for (const d of dossiers) {
    for (const item of (d.items || [])) {
      if (item.blobId) { try { await deleteBlob(item.blobId); } catch {} }
    }
  }
  // clear localStorage scriptie keys
  Object.values(KEY).forEach((k) => localStorage.removeItem(k));
  dossiers = [];
  meta = { activeDossierId: null, currentView: "vandaag" };
  kickState = { currentDay: null, notes: {}, done: [] };
  saveKickState(); saveDossiers(); saveMeta();
  closeBackup();
  switchView("vandaag");
  toast("Alles gewist");
}

function openBackup() { $("#modal-backup").classList.remove("hidden"); }
function closeBackup() { $("#modal-backup").classList.add("hidden"); }

$("#btn-open-backup").addEventListener("click", openBackup);
$("#btn-close-backup").addEventListener("click", closeBackup);
$("#btn-export-all").addEventListener("click", exportAll);
$("#btn-import-all").addEventListener("click", () => $("#import-file-picker").click());
$("#import-file-picker").addEventListener("change", (e) => {
  if (e.target.files && e.target.files[0]) importAll(e.target.files[0]);
  e.target.value = "";
});
$("#btn-reset-all").addEventListener("click", resetAll);

// close modal on backdrop / Escape
$("#modal-backup").addEventListener("click", (e) => {
  if (e.target.id === "modal-backup") closeBackup();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#modal-backup").classList.contains("hidden")) closeBackup();
});

/* ============ init ============ */
switchView(meta.currentView || "vandaag");
