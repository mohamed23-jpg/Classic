/* ===== Admin / Dev Panel ===== */
const Admin = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";

  async function loadStats() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const grid = document.getElementById("dev-stats-grid");
      if (!grid) return;
      grid.innerHTML = `
        <div class="stat-card"><div class="stat-value">${data.totalPlayers}</div><div class="stat-label">إجمالي اللاعبين</div></div>
        <div class="stat-card"><div class="stat-value">${data.onlinePlayers}</div><div class="stat-label">متصلون الآن</div></div>
        <div class="stat-card"><div class="stat-value">${data.totalClans}</div><div class="stat-label">كلانات</div></div>
        <div class="stat-card"><div class="stat-value">${data.activeRooms}</div><div class="stat-label">غرف نشطة</div></div>
      `;
    } catch { UI.toast("فشل تحميل الإحصائيات", "error"); }
  }

  async function searchPlayers() {
    const q = document.getElementById("dev-player-search")?.value.trim();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/players?q=${encodeURIComponent(q || "")}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const players = await res.json();
      const result = document.getElementById("dev-players-result");
      if (!result) return;
      result.innerHTML = players.map((p) => `
        <div class="dev-player-item">
          <div class="dev-player-item-info">
            <div class="dev-player-name">${p.nickname} ${p.isDev ? "[Dev]" : ""}</div>
            <div class="dev-player-id">ID: ${p.playerId} · LV${p.level} · ${p.coins} عملة</div>
          </div>
          <div class="dev-player-actions">
            <button class="btn btn-sm btn-primary" onclick="Admin.openGrant('${p.playerId}','${p.nickname}')">منح</button>
            <button class="btn btn-sm btn-danger" onclick="Admin.banPlayer('${p.playerId}',${!p.isBanned})">${p.isBanned ? "رفع الحظر" : "حظر"}</button>
          </div>
        </div>
      `).join("");
    } catch { UI.toast("خطأ في البحث", "error"); }
  }

  function openGrant(playerId, nickname) {
    document.getElementById("grant-player-id").value = playerId;
    document.getElementById("grant-player-info").textContent = `منح مكافأة لـ: ${nickname}`;
    document.getElementById("grant-coins").value = 0;
    document.getElementById("grant-xp").value = 0;
    UI.showModal("modal-grant-player");
  }

  async function confirmGrant() {
    const playerId = document.getElementById("grant-player-id").value;
    const coins = parseInt(document.getElementById("grant-coins").value) || 0;
    const xp = parseInt(document.getElementById("grant-xp").value) || 0;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/players/${playerId}/grant`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ coins, xp }),
      });
      const data = await res.json();
      if (data.success) { UI.toast("تم المنح بنجاح", "success"); UI.hideModal("modal-grant-player"); }
      else UI.toast(data.error, "error");
    } catch { UI.toast("فشل المنح", "error"); }
  }

  async function banPlayer(playerId, ban) {
    let reason = "";
    if (ban) {
      reason = await UI.promptDialog("سبب الحظر:", "اكتب السبب...");
      if (!reason) return;
    }
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/admin/players/${playerId}/ban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ banned: ban, reason }),
      });
      UI.toast(ban ? "تم الحظر" : "تم رفع الحظر", "success");
      searchPlayers();
    } catch {}
  }

  async function broadcast() {
    const msg = document.getElementById("dev-broadcast-msg")?.value.trim();
    if (!msg) { UI.toast("أدخل رسالة", "error"); return; }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/broadcast`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.success) { UI.toast("تم الإرسال للجميع", "success"); document.getElementById("dev-broadcast-msg").value = ""; }
      else UI.toast(data.error || "تأكد من صلاحيات الديف", "error");
    } catch { UI.toast("فشل الإرسال", "error"); }
  }

  async function sendNotification() {
    const playerId = document.getElementById("dev-notif-player-id")?.value.trim();
    const msg = document.getElementById("dev-notif-msg")?.value.trim();
    if (!msg) { UI.toast("أدخل نص الإشعار", "error"); return; }
    const token = localStorage.getItem("token");
    try {
      const url = playerId
        ? `${API}/admin/notify/${playerId}`
        : `${API}/admin/broadcast`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, type: "system" }),
      });
      const data = await res.json();
      if (data.success) {
        UI.toast("تم إرسال الإشعار", "success");
        if (document.getElementById("dev-notif-player-id")) document.getElementById("dev-notif-player-id").value = "";
        if (document.getElementById("dev-notif-msg")) document.getElementById("dev-notif-msg").value = "";
      } else UI.toast(data.error || "فشل الإرسال", "error");
    } catch { UI.toast("فشل إرسال الإشعار", "error"); }
  }

  async function loadChallenges() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const challenges = await res.json();
      const list = document.getElementById("dev-challenges-list");
      if (!list) return;
      list.innerHTML = challenges.map((c) => `
        <div class="dev-list-item">
          <div>
            <div>${c.name}</div>
            <div style="font-size:0.7rem;color:var(--text-dim)">${c.description}</div>
          </div>
          <div style="display:flex;gap:6px">
            <span style="font-size:0.72rem;color:${c.isActive ? "var(--green)" : "var(--text-dim)"}">${c.isActive ? "نشط" : "معطل"}</span>
            <button class="btn btn-sm btn-danger" onclick="Admin.deleteChallenge('${c._id}')">حذف</button>
          </div>
        </div>
      `).join("") || '<div style="padding:20px;text-align:center;color:var(--text-dim)">لا توجد تحديات</div>';
    } catch { UI.toast("فشل تحميل التحديات", "error"); }
  }

  async function saveChallenge() {
    const token = localStorage.getItem("token");
    const body = {
      name: document.getElementById("ch-name")?.value,
      description: document.getElementById("ch-desc")?.value,
      condition: document.getElementById("ch-condition")?.value,
      conditionValue: parseInt(document.getElementById("ch-condition-value")?.value),
      rewardType: document.getElementById("ch-reward-type")?.value,
      rewardValue: parseInt(document.getElementById("ch-reward-value")?.value),
      startDate: document.getElementById("ch-start")?.value,
      endDate: document.getElementById("ch-end")?.value,
    };
    if (!body.name) { UI.toast("أدخل اسم التحدي", "error"); return; }
    try {
      const res = await fetch(`${API}/admin/challenges`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { UI.toast("تم حفظ التحدي", "success"); UI.hideModal("modal-new-challenge"); loadChallenges(); }
      else { const d = await res.json(); UI.toast(d.error || "فشل الحفظ", "error"); }
    } catch { UI.toast("فشل حفظ التحدي", "error"); }
  }

  async function deleteChallenge(id) {
    const ok = await UI.confirmDialog("هل تريد حذف هذا التحدي نهائياً؟");
    if (!ok) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/admin/challenges/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      UI.toast("تم الحذف", "info");
      loadChallenges();
    } catch {}
  }

  async function loadMissions() {
    const token = localStorage.getItem("token");
    const type = document.getElementById("dev-mission-type")?.value || "daily";
    try {
      const res = await fetch(`${API}/admin/missions?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const missions = await res.json();
      const list = document.getElementById("dev-missions-list");
      if (!list) return;
      list.innerHTML = missions.map((m) => `
        <div class="dev-list-item">
          <div>
            <div>${m.name}</div>
            <div style="font-size:0.7rem;color:var(--text-dim)">${m.description} · +${m.rewardXp || 0} XP</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="Admin.deleteMission('${m._id}')">حذف</button>
        </div>
      `).join("") || '<div style="padding:20px;text-align:center;color:var(--text-dim)">لا توجد مهام</div>';
    } catch { UI.toast("فشل تحميل المهام", "error"); }
  }

  async function saveMission() {
    const token = localStorage.getItem("token");
    const body = {
      name: document.getElementById("mis-name")?.value,
      description: document.getElementById("mis-desc")?.value,
      type: document.getElementById("mis-type")?.value || "daily",
      condition: document.getElementById("mis-condition")?.value,
      conditionValue: parseInt(document.getElementById("mis-condition-value")?.value),
      rewardXp: parseInt(document.getElementById("mis-reward-xp")?.value) || 0,
      rewardCoins: parseInt(document.getElementById("mis-reward-coins")?.value) || 0,
    };
    if (!body.name) { UI.toast("أدخل اسم المهمة", "error"); return; }
    try {
      const res = await fetch(`${API}/admin/missions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { UI.toast("تم حفظ المهمة", "success"); UI.hideModal("modal-new-mission"); loadMissions(); }
      else { const d = await res.json(); UI.toast(d.error || "فشل الحفظ", "error"); }
    } catch { UI.toast("فشل حفظ المهمة", "error"); }
  }

  async function deleteMission(id) {
    const ok = await UI.confirmDialog("هل تريد حذف هذه المهمة؟");
    if (!ok) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/admin/missions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      UI.toast("تم الحذف", "info");
      loadMissions();
    } catch {}
  }

  async function loadSkins() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/admin/card-skins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const skins = await res.json();
      const list = document.getElementById("dev-skins-list");
      if (!list) return;
      list.innerHTML = (skins || []).map((s) => `
        <div class="dev-list-item">
          <div>
            <div>${s.name || s.id}</div>
            <div style="font-size:0.7rem;color:var(--text-dim)">${s.rarityAr || s.rarity} · ${(s.price || 0).toLocaleString()} عملة</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="Admin.deleteSkin('${s.id || s._id}')">حذف</button>
        </div>
      `).join("") || '<div style="padding:20px;text-align:center;color:var(--text-dim)">لا توجد حزم</div>';
    } catch {}
  }

  async function saveSkin() {
    const token = localStorage.getItem("token");
    const rarityVal = document.getElementById("skin-rarity")?.value;
    const body = {
      id: document.getElementById("skin-id")?.value,
      name: document.getElementById("skin-name")?.value,
      price: parseInt(document.getElementById("skin-price")?.value),
      rarity: rarityVal,
      css: document.getElementById("skin-css")?.value,
      rarityAr: { rare: "نادر", epic: "فائق", legendary: "أسطوري", divine: "إلهي" }[rarityVal],
    };
    if (!body.id || !body.name) { UI.toast("أدخل ID واسم الحزمة", "error"); return; }
    try {
      const res = await fetch(`${API}/admin/card-skins`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { UI.toast("تم حفظ الحزمة", "success"); UI.hideModal("modal-new-skin"); loadSkins(); }
      else { const d = await res.json(); UI.toast(d.error || "فشل الحفظ", "error"); }
    } catch { UI.toast("فشل حفظ الحزمة", "error"); }
  }

  async function deleteSkin(id) {
    const ok = await UI.confirmDialog("هل تريد حذف هذه الحزمة؟");
    if (!ok) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/admin/card-skins/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      UI.toast("تم الحذف", "info");
      loadSkins();
    } catch {}
  }

  function setupClanIcons() {
    const icons = ["🛡", "⚔", "🔱", "⚡", "🌙", "🔥", "🌊", "🦅", "💀", "🎯"];
    const grid = document.getElementById("clan-icons-grid");
    if (!grid) return;
    grid.innerHTML = icons.map((icon, i) => `
      <div class="clan-icon-option" data-icon="${i}" onclick="Admin.selectClanIcon(this,'${icons[i]}')">
        ${icon}
      </div>
    `).join("");
  }

  function selectClanIcon(el, icon) {
    document.querySelectorAll(".clan-icon-option").forEach((o) => o.classList.remove("selected"));
    el.classList.add("selected");
    el.dataset.selectedIcon = icon;
  }

  return {
    loadStats, searchPlayers, openGrant, confirmGrant, banPlayer,
    broadcast, sendNotification,
    loadChallenges, saveChallenge, deleteChallenge,
    loadMissions, saveMission, deleteMission,
    loadSkins, saveSkin, deleteSkin,
    setupClanIcons, selectClanIcon,
  };
})();
