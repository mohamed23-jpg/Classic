/* ===== Global Chat ===== */
const GlobalChat = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";
  let messages = [];

  async function load() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/chat/global`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messages = await res.json();
      render();
    } catch {}
  }

  function render() {
    const container = document.getElementById("global-chat-messages");
    if (!container) return;
    container.innerHTML = messages.map((m) => buildBubble(m)).join("");
    container.scrollTop = container.scrollHeight;
  }

  function buildBubble(m) {
    const time = new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    return `
      <div class="chat-bubble">
        <div class="chat-bubble-avatar">${Effects.buildAvatarSvg(m.fromAvatar, 32)}</div>
        <div class="chat-bubble-content">
          <div class="chat-bubble-header">
            <span class="chat-bubble-name ${m.isDev ? "dev-name" : ""}">${m.fromNickname}${m.isDev ? " [Dev]" : ""}</span>
            <span class="chat-bubble-level">LV.${m.fromLevel}</span>
          </div>
          <div class="chat-bubble-text">${escapeHtml(m.message)}</div>
          <div class="chat-bubble-time">${time}</div>
        </div>
      </div>
    `;
  }

  async function send() {
    const input = document.getElementById("global-chat-input");
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/chat/global`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const d = await res.json();
        UI.toast(d.error, "error");
        return;
      }
      input.value = "";
    } catch { UI.toast("فشل الإرسال", "error"); }
  }

  function onNewMessage(data) {
    messages.push(data);
    if (messages.length > 500) messages.shift();
    const container = document.getElementById("global-chat-messages");
    if (!container) return;
    const bubble = document.createElement("div");
    bubble.innerHTML = buildBubble(data);
    container.appendChild(bubble.firstElementChild);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  return { load, send, onNewMessage };
})();
