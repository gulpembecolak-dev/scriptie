/* ============================================================
   scriptie · kick-start
   30 dagen, één kaart per dag. Geen API, geen tokens.
   Inhoud is bevroren in deze file — werkt offline.
   ============================================================ */

const KEY = {
  state:  "scriptie_v2_state",   // { currentDay, notes: {dayN: text}, done: [dayN, ...] }
};

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

/* ---------- state ---------- */
const $ = (s) => document.querySelector(s);
function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY.state)) ?? { currentDay: null, notes: {}, done: [] }; }
  catch { return { currentDay: null, notes: {}, done: [] }; }
}
function saveState() { localStorage.setItem(KEY.state, JSON.stringify(state)); }
let state = loadState();

/* ---------- day selection ---------- */
function todayDayIndex() {
  // 15 mei 2026 == day 1
  const start = new Date(2026, 4, 15); // month is 0-indexed (4 = mei)
  const today = new Date(); today.setHours(0,0,0,0); start.setHours(0,0,0,0);
  const diff = Math.floor((today - start) / 86400000);
  if (diff < 0) return 1;
  if (diff >= PLAN.length) return PLAN.length;
  return diff + 1;
}

function ensureCurrentDay() {
  if (state.currentDay == null) state.currentDay = todayDayIndex();
  state.currentDay = Math.max(1, Math.min(PLAN.length, state.currentDay));
  saveState();
}

/* ---------- render ---------- */
function render() {
  ensureCurrentDay();
  const day = PLAN.find((p) => p.d === state.currentDay) ?? PLAN[0];

  $("#day-tag").textContent = "DAG " + String(day.d).padStart(2, "0");
  $("#day-date").textContent = day.date;
  $("#day-topic").textContent = day.topic;

  // source
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
  $("#day-note").value = state.notes[day.d] || "";

  // done state
  const isDone = state.done.includes(day.d);
  $("#btn-done").classList.toggle("done", isDone);
  $("#btn-done").textContent = isDone ? "klaar voor vandaag ✓" : "klaar voor vandaag";
  $("#done-state").textContent = isDone ? "afgevinkt" : "";

  // nav
  $("#btn-prev").disabled = day.d <= 1;
  $("#btn-next").disabled = day.d >= PLAN.length;

  // progress
  const total = PLAN.length;
  const doneN = state.done.length;
  $("#progress-text").textContent = `${doneN} / ${total}`;
  $("#progress-fill").style.width = (doneN / total * 100) + "%";

  renderGrid();
  // scroll card to top for clarity
  document.querySelector(".card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGrid() {
  const grid = $("#day-grid");
  grid.innerHTML = "";
  for (const p of PLAN) {
    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (state.done.includes(p.d)) cell.classList.add("done");
    if (p.d === state.currentDay) cell.classList.add("current");
    if (state.notes[p.d] && state.notes[p.d].trim()) cell.classList.add("has-note");
    cell.textContent = p.d;
    cell.title = `Dag ${p.d} · ${p.date} · ${p.topic}`;
    cell.addEventListener("click", () => { state.currentDay = p.d; saveState(); render(); });
    grid.appendChild(cell);
  }
}

/* ---------- toast ---------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 200);
  }, 1800);
}

/* ---------- events ---------- */
$("#btn-prev").addEventListener("click", () => {
  state.currentDay = Math.max(1, state.currentDay - 1);
  saveState(); render();
});
$("#btn-next").addEventListener("click", () => {
  state.currentDay = Math.min(PLAN.length, state.currentDay + 1);
  saveState(); render();
});
$("#btn-jump-today").addEventListener("click", () => {
  state.currentDay = todayDayIndex();
  saveState(); render();
});

$("#btn-done").addEventListener("click", () => {
  const d = state.currentDay;
  if (state.done.includes(d)) {
    state.done = state.done.filter((x) => x !== d);
    toast("Markering verwijderd");
  } else {
    state.done.push(d);
    state.done = [...new Set(state.done)].sort((a, b) => a - b);
    toast("Klaar — fijn, tot morgen.");
  }
  saveState(); render();
});

// note persists on input (debounced)
let noteTimer;
$("#day-note").addEventListener("input", (e) => {
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    state.notes[state.currentDay] = e.target.value;
    saveState();
    renderGrid();
  }, 400);
});

// keyboard nav: ← →
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "TEXTAREA") return;
  if (e.key === "ArrowLeft") $("#btn-prev").click();
  if (e.key === "ArrowRight") $("#btn-next").click();
});

/* ---------- init ---------- */
render();
