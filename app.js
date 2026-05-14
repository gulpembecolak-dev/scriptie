/* ============================================================
   scriptie — Claude Code stijl chatpaneel (links)
   Berichten worden lokaal opgeslagen. Geen AI nog — fase A.
   ============================================================ */

const KEY = "scriptie_cc_messages_v1";

const stream = document.getElementById("cc-stream");
const form   = document.getElementById("cc-form");
const input  = document.getElementById("cc-input");

let messages = loadMessages();

function loadMessages() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}
function saveMessages() {
  localStorage.setItem(KEY, JSON.stringify(messages));
}

function timeLabel(d) {
  return new Date(d).toLocaleString("nl-NL", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function render() {
  // hide welcome if there are messages
  const welcome = stream.querySelector(".cc-welcome");
  if (welcome) welcome.style.display = messages.length ? "none" : "";

  // clear & re-render messages (after welcome)
  stream.querySelectorAll(".cc-msg").forEach((n) => n.remove());

  for (const m of messages) {
    const div = document.createElement("div");
    div.className = "cc-msg " + (m.role || "user");
    div.textContent = m.text;
    const ts = document.createElement("span");
    ts.className = "cc-msg-time";
    ts.textContent = timeLabel(m.at);
    div.appendChild(ts);
    stream.appendChild(div);
  }

  // scroll to bottom
  stream.scrollTop = stream.scrollHeight;
}

function addMessage(text, role = "user") {
  if (!text || !text.trim()) return;
  messages.push({ text: text.trim(), role, at: Date.now() });
  saveMessages();
  render();
}

/* auto-resize textarea */
function autoResize() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, window.innerHeight * 0.3) + "px";
}
input.addEventListener("input", autoResize);

/* submit on Enter (Shift+Enter = newline) */
form.addEventListener("submit", (e) => e.preventDefault());
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const text = input.value;
    if (!text.trim()) return;
    addMessage(text, "user");
    input.value = "";
    autoResize();
  }
});

/* initial render */
render();
input.focus();
