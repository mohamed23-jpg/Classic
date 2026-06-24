/* ===== UI Manager ===== */
const UI = (() => {
  // عرض toast
  function toast(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-10px)";
      el.style.transition = "all 0.3s";
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // نافذة تأكيد CSS (بدلاً من confirm())
  function confirmDialog(message) {
    return new Promise((resolve) => {
      const modal = document.getElementById("modal-confirm");
      const msgEl = document.getElementById("confirm-message");
      const yesBtn = document.getElementById("confirm-yes");
      const noBtn = document.getElementById("confirm-no");
      if (!modal) { resolve(true); return; }
      if (msgEl) msgEl.textContent = message;
      modal.classList.remove("hidden");
      const cleanup = () => {
        modal.classList.add("hidden");
        yesBtn.onclick = null;
        noBtn.onclick = null;
      };
      yesBtn.onclick = () => { cleanup(); resolve(true); };
      noBtn.onclick = () => { cleanup(); resolve(false); };
    });
  }

  // نافذة إدخال CSS (بدلاً من prompt())
  function promptDialog(message, placeholder = "") {
    return new Promise((resolve) => {
      const modal = document.getElementById("modal-prompt");
      const msgEl = document.getElementById("prompt-message");
      const input = document.getElementById("prompt-input");
      const yesBtn = document.getElementById("prompt-ok");
      const noBtn = document.getElementById("prompt-cancel");
      if (!modal) { resolve(null); return; }
      if (msgEl) msgEl.textContent = message;
      if (input) { input.value = ""; input.placeholder = placeholder || message; }
      modal.classList.remove("hidden");
      if (input) setTimeout(() => input.focus(), 50);
      const cleanup = () => {
        modal.classList.add("hidden");
        yesBtn.onclick = null;
        noBtn.onclick = null;
        if (input) input.onkeydown = null;
      };
      const confirm = () => {
        const val = input?.value.trim() || "";
        cleanup();
        resolve(val || null);
      };
      yesBtn.onclick = confirm;
      noBtn.onclick = () => { cleanup(); resolve(null); };
      if (input) input.onkeydown = (e) => { if (e.key === "Enter") confirm(); };
    });
  }

  // إظهار/إخفاء modal
  function showModal(id) {
    document.getElementById(id)?.classList.remove("hidden");
    document.getElementById(id)?.classList.add("active");
  }
  function hideModal(id) {
    document.getElementById(id)?.classList.add("hidden");
    document.getElementById(id)?.classList.remove("active");
  }

  // إظهار/إخفاء panel
  function showPanel(id) {
    document.querySelectorAll(".side-panel").forEach((p) => {
      if (p.id !== id) p.classList.add("hidden");
    });
    document.getElementById(id)?.classList.remove("hidden");
    Audio.play("click");
  }
  function hidePanel(id) {
    document.getElementById(id)?.classList.add("hidden");
  }

  // إظهار overlay
  function showOverlay(id) {
    document.getElementById(id)?.classList.remove("hidden");
  }
  function hideOverlay(id) {
    document.getElementById(id)?.classList.add("hidden");
  }

  // تبديل الشاشة الرئيسية
  function showScreen(name) {
    document.querySelectorAll(".screen").forEach((s) => {
      s.classList.add("hidden");
      s.classList.remove("active");
    });
    const target = document.getElementById(`screen-${name}`);
    if (target) {
      target.classList.remove("hidden");
      target.classList.add("active");
    }
    App.setCurrentScreen(name);
  }

  // تبديل تبويبات لوحة
  function initPanelTabs(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.querySelectorAll(".panel-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab;
        panel.querySelectorAll(".panel-tab").forEach((t) => t.classList.remove("active"));
        panel.querySelectorAll(".panel-tab-content").forEach((c) => {
          c.classList.remove("active");
          c.classList.add("hidden");
        });
        tab.classList.add("active");
        const content = panel.querySelector(`#${tabName}`);
        if (content) { content.classList.add("active"); content.classList.remove("hidden"); }
      });
    });
  }

  // تحديث شريط XP
  function updateXPBar(barId, textId, xp, xpNeeded) {
    const bar = document.getElementById(barId);
    const text = document.getElementById(textId);
    if (bar) bar.style.width = `${Math.min(100, (xp / xpNeeded) * 100)}%`;
    if (text) text.textContent = `${xp} / ${xpNeeded} XP`;
  }

  // بناء بطاقة أفاتار
  function buildAvatarEl(el, avatarType, customAvatar, size = 40) {
    if (!el) return;
    if (customAvatar) {
      el.innerHTML = `<img src="${customAvatar}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover" />`;
    } else {
      el.innerHTML = Effects.buildAvatarSvg(avatarType, size);
    }
  }

  // تنسيق الوقت
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return "الآن";
    const m = Math.floor(s / 60);
    if (m < 60) return `منذ ${m} دقيقة`;
    const h = Math.floor(m / 60);
    if (h < 24) return `منذ ${h} ساعة`;
    return `منذ ${Math.floor(h / 24)} يوم`;
  }

  // ربط أزرار إغلاق
  function bindCloseButtons() {
    document.querySelectorAll(".modal-close[data-modal]").forEach((btn) => {
      btn.addEventListener("click", () => hideModal(btn.dataset.modal));
    });
    document.querySelectorAll(".panel-close[data-panel]").forEach((btn) => {
      btn.addEventListener("click", () => hidePanel(btn.dataset.panel));
    });
    document.querySelectorAll(".overlay-close[data-overlay]").forEach((btn) => {
      btn.addEventListener("click", () => hideOverlay(btn.dataset.overlay));
    });
    document.querySelectorAll("[data-overlay]").forEach((btn) => {
      if (btn.tagName === "BUTTON" && !btn.classList.contains("overlay-close")) {
        btn.addEventListener("click", () => hideOverlay(btn.dataset.overlay));
      }
    });
    // إغلاق modal بالنقر خارجه
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal && modal.id !== "modal-confirm" && modal.id !== "modal-prompt") {
          hideModal(modal.id);
        }
      });
    });
  }

  return {
    toast, confirmDialog, promptDialog,
    showModal, hideModal, showPanel, hidePanel,
    showOverlay, hideOverlay, showScreen, initPanelTabs,
    updateXPBar, buildAvatarEl, timeAgo, bindCloseButtons,
  };
})();
