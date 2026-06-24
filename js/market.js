/* ===== Market System ===== */
const Market = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";
  let items = null;

  async function load() {
    const player = App.getPlayer();
    const marketContent = document.getElementById("market-content");
    const marketLocked = document.getElementById("market-locked");

    if (player.level < 8) {
      marketLocked?.classList.remove("hidden");
      marketContent?.classList.add("hidden");
      if (marketLocked) {
        marketLocked.innerHTML = `
          <div class="market-lock-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p>السوق يُفتح عند المستوى 8</p>
          <p style="color:var(--text-dim);font-size:0.8rem">مستواك الحالي: ${player.level}</p>
        `;
      }
      return;
    }

    marketLocked?.classList.add("hidden");
    marketContent?.classList.remove("hidden");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/market`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      items = data;
      renderSkins(data.cardSkins || [], player.inventory?.cardSkins || []);
      renderFrames(data.nameFrames || [], player.inventory?.nameFrames || []);
    } catch { UI.toast("فشل تحميل السوق", "error"); }
  }

  function renderSkins(skins, owned) {
    const el = document.getElementById("market-skins");
    if (!el) return;
    el.innerHTML = skins.map((s) => {
      const isOwned = owned.some((o) => o.skinId === s.id);
      return `
        <div class="market-item" onclick="${isOwned ? "" : `Market.buy('cardSkin','${s.id}')`}">
          <div class="market-item-preview" style="${s.css || "background:linear-gradient(135deg,var(--bg3),var(--bg2))"}"></div>
          <div class="market-item-name">${s.name}</div>
          <div class="inv-item-rarity rarity-${s.rarity}">${s.rarityAr}</div>
          ${isOwned
            ? '<div class="market-item-owned">تمتلكها</div>'
            : `<div class="market-item-price"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="var(--gold)"/></svg>${s.price.toLocaleString()}</div>`
          }
          ${!isOwned ? '<button class="btn btn-sm btn-warning">شراء</button>' : ''}
        </div>
      `;
    }).join("");
  }

  function renderFrames(frames, owned) {
    const el = document.getElementById("market-frames");
    if (!el) return;
    const frameIcons = { fire: "&#x1F525;", ice: "&#x2744;&#xFE0F;", diamond: "&#x1F48E;", crystal: "&#x1F52E;" };
    el.innerHTML = frames.map((f) => {
      const isOwned = owned.some((o) => o.frameId === f.id);
      return `
        <div class="market-item" onclick="${isOwned ? "" : `Market.buy('nameFrame','${f.id}')`}">
          <div class="market-item-preview" style="display:flex;align-items:center;justify-content:center;font-size:3rem">${frameIcons[f.id] || "&#x2B50;"}</div>
          <div class="market-item-name">${f.name}</div>
          <div class="inv-item-rarity rarity-${f.rarity}">${f.rarityAr}</div>
          ${isOwned
            ? '<div class="market-item-owned">تمتلكه</div>'
            : `<div class="market-item-price"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="var(--gold)"/></svg>${f.price.toLocaleString()}</div>`
          }
          ${!isOwned ? '<button class="btn btn-sm btn-warning">شراء</button>' : ''}
        </div>
      `;
    }).join("");
  }

  async function buy(itemType, itemId) {
    const player = App.getPlayer();
    const item = itemType === "cardSkin"
      ? items?.cardSkins?.find((s) => s.id === itemId)
      : items?.nameFrames?.find((f) => f.id === itemId);
    if (!item) return;

    if (player.coins < item.price) {
      UI.toast(`تحتاج إلى ${item.price.toLocaleString()} عملة. لديك ${player.coins.toLocaleString()}`, "error");
      return;
    }

    const ok = await UI.confirmDialog(`هل تريد شراء "${item.name}" بـ ${item.price.toLocaleString()} عملة؟`);
    if (!ok) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/market/buy`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId }),
      });
      const data = await res.json();
      if (data.success) {
        UI.toast(data.message, "success");
        Audio.play("level-up");
        await App.refreshPlayer();
        load();
      } else {
        UI.toast(data.error, "error");
      }
    } catch { UI.toast("خطأ في الشراء", "error"); }
  }

  return { load, buy };
})();
