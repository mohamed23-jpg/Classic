/* ===== Inventory System ===== */
const Inventory = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";

  function load() {
    const player = App.getPlayer();
    if (!player) return;
    renderSkins(player.inventory?.cardSkins || []);
    renderFrames(player.inventory?.nameFrames || []);
    renderTitles(player.inventory?.unlockedTitles || [], player.activeTitle);
    loadCustomSettings(player.settings);
    renderLegendaryToggle(player.level);
  }

  function renderSkins(skins) {
    const el = document.getElementById("inv-skins");
    if (!el) return;
    if (skins.length === 0) {
      el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-dim)">لا توجد حزم بطاقات. اشترِ من السوق!</div>`;
      return;
    }
    el.innerHTML = skins.map((s) => `
      <div class="inv-item ${s.equipped ? "equipped" : ""}" onclick="Inventory.equip('cardSkin','${s.skinId}')">
        <div class="inv-item-preview" style="${s.css || "background:var(--bg3)"}"></div>
        <div class="inv-item-name">${s.skinId}</div>
        <div class="inv-item-status">${s.equipped ? '<span style="color:var(--green)">مجهزة</span>' : 'غير مجهزة'}</div>
      </div>
    `).join("");
  }

  function renderFrames(frames) {
    const el = document.getElementById("inv-frames");
    if (!el) return;
    if (frames.length === 0) {
      el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-dim)">لا توجد إطارات. اشترِ من السوق!</div>`;
      return;
    }
    const frameNames = { fire: "ناري", ice: "جليدي", diamond: "ماسي", crystal: "كريستالي" };
    el.innerHTML = frames.map((f) => `
      <div class="inv-item ${f.equipped ? "equipped" : ""}" onclick="Inventory.equip('nameFrame','${f.frameId}')">
        <div class="inv-item-preview" style="display:flex;align-items:center;justify-content:center;font-size:2rem">${getFrameIcon(f.frameId)}</div>
        <div class="inv-item-name">${frameNames[f.frameId] || f.frameId}</div>
        <div class="inv-item-status">${f.equipped ? '<span style="color:var(--green)">مجهز</span>' : 'غير مجهز'}</div>
      </div>
    `).join("");
  }

  function getFrameIcon(id) {
    const icons = { fire: "&#x1F525;", ice: "&#x2744;&#xFE0F;", diamond: "&#x1F48E;", crystal: "&#x1F52E;" };
    return icons[id] || "&#x2B50;";
  }

  function renderTitles(titles, activeTitle) {
    const el = document.getElementById("inv-titles");
    if (!el) return;
    const allTitles = ["مبتدئ","متعلم","محترف","خبير","أسطورة","بطل","فارس","سيد","أسطورة حية","مختم اللعبة"];
    // إظهار الألقاب المملوكة فقط (إخفاء المقفلة)
    const ownedTitles = allTitles.filter((t) => titles.includes(t));
    if (ownedTitles.length === 0) {
      el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-dim)">لا توجد ألقاب مفتوحة بعد. العب أكثر!</div>`;
      return;
    }
    el.innerHTML = ownedTitles.map((t) => {
      const isActive = t === activeTitle;
      return `
        <div class="title-item ${isActive ? "active-title" : ""}" onclick="Inventory.equip('title','${t}')">
          <div class="title-text">${t}</div>
          ${isActive ? '<span style="color:var(--green);font-size:0.75rem">نشط</span>' : '<span style="color:var(--text-dim);font-size:0.75rem">تفعيل</span>'}
        </div>
      `;
    }).join("");
  }

  function renderLegendaryToggle(level) {
    const row = document.getElementById("legendary-notif-row");
    if (row) {
      row.style.display = level >= 98 ? "flex" : "none";
    }
  }

  function loadCustomSettings(settings) {
    if (!settings) return;
    const setCheck = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = val !== false;
    };
    setCheck("set-legendary-notif", settings.legendaryNotification);
    setCheck("set-sound-effects", settings.soundEffects);
    setCheck("set-vibration", settings.vibration);
    setCheck("set-push-notif", settings.pushNotifications);
    const vol = document.getElementById("set-volume");
    const volDisplay = document.getElementById("volume-display");
    if (vol) { vol.value = settings.volume ?? 80; }
    if (volDisplay) volDisplay.textContent = `${settings.volume ?? 80}%`;
  }

  async function equip(type, id) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/players/me/equip`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json();
      if (data.success) {
        UI.toast("تم التجهيز بنجاح", "success");
        await App.refreshPlayer();
        load();
      } else UI.toast(data.error, "error");
    } catch { UI.toast("خطأ في التجهيز", "error"); }
  }

  async function saveSettings(settings) {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/players/me/settings`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      UI.toast("تم حفظ الإعدادات", "success");
    } catch {}
  }

  function bindCustomSettings() {
    const checkMap = {
      "set-legendary-notif": "legendaryNotification",
      "set-sound-effects": "soundEffects",
      "set-vibration": "vibration",
      "set-push-notif": "pushNotifications",
    };
    Object.entries(checkMap).forEach(([elemId, key]) => {
      const el = document.getElementById(elemId);
      if (!el) return;
      el.addEventListener("change", () => {
        const settings = JSON.parse(localStorage.getItem("settings") || "{}");
        settings[key] = el.checked;
        localStorage.setItem("settings", JSON.stringify(settings));
        saveSettings({ [key]: el.checked });
        if (key === "soundEffects") Audio.setMuted(!el.checked);
      });
    });
    const vol = document.getElementById("set-volume");
    const volDisplay = document.getElementById("volume-display");
    if (vol) {
      vol.addEventListener("input", () => {
        const v = parseInt(vol.value);
        if (volDisplay) volDisplay.textContent = `${v}%`;
        Audio.setVolume(v / 100);
        saveSettings({ volume: v });
      });
    }
  }

  return { load, equip, saveSettings, bindCustomSettings };
})();
