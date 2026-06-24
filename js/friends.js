/* ===== Friends System ===== */
const Friends = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";

  async function load() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/players/me/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      renderFriendsList(data.friends || [], data.pinned || []);
      renderRequests(data.requests || []);
    } catch {}
  }

  function renderFriendsList(friends, pinned) {
    const list = document.getElementById("friends-list");
    if (!list) return;
    if (friends.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-dim)">لا يوجد أصدقاء بعد</div>`;
      return;
    }
    list.innerHTML = friends.map((f) => {
      const isPinned = pinned.includes(f.playerId);
      const statusClass = f.isOnline ? (f.currentRoom ? "status-busy" : "status-online") : "status-offline";
      const statusText = f.isOnline ? (f.currentRoom ? "مشغول - في غرفة" : "متصل") : "غير متصل";
      const statusDot = f.isOnline ? (f.currentRoom ? "🟡" : "🟢") : "🔴";
      return `
        <div class="friend-item" data-id="${f.playerId}">
          <div class="friend-avatar">${Effects.buildAvatarSvg(f.avatar, 36)}</div>
          <div class="friend-info">
            <div class="friend-name">
              ${isPinned ? '<span class="pinned-badge">★ </span>' : ''}
              ${f.nickname}
              ${f.isDev ? '<span style="color:var(--gold);font-size:0.65rem">[Dev]</span>' : ''}
            </div>
            <div class="friend-status ${statusClass}">${statusDot} ${statusText}</div>
            <div class="friend-level">LV.${f.level} · ${f.activeTitle || ""}</div>
          </div>
          <div class="friend-actions">
            <button class="friend-action-btn" onclick="Friends.viewProfile('${f.playerId}')" title="عرض الملف">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button class="friend-action-btn" onclick="Friends.pin('${f.playerId}')" title="${isPinned ? "إلغاء التثبيت" : "تثبيت"}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${isPinned ? "var(--gold)" : "none"}" stroke="var(--gold)" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
            <button class="friend-action-btn" onclick="Friends.removeFriend('${f.playerId}')" title="حذف" style="color:var(--red)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderRequests(requests) {
    const el = document.getElementById("requests-count");
    if (el) el.textContent = requests.length;
    const list = document.getElementById("friends-requests");
    if (!list) return;
    if (requests.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-dim)">لا توجد طلبات</div>`;
      return;
    }
    list.innerHTML = requests.map((r) => `
      <div class="request-item">
        <div class="friend-avatar">${Effects.buildAvatarSvg(r.avatar, 36)}</div>
        <div class="request-info">
          <div class="request-name">${r.nickname}</div>
          <div style="font-size:0.7rem;color:var(--text-dim)">${UI.timeAgo(r.sentAt)}</div>
        </div>
        <div class="request-actions">
          <button class="btn btn-sm btn-primary" onclick="Friends.respondRequest('${r.from}','accept')">قبول</button>
          <button class="btn btn-sm btn-ghost" onclick="Friends.respondRequest('${r.from}','reject')">رفض</button>
        </div>
      </div>
    `).join("");
  }

  async function searchPlayer() {
    const id = document.getElementById("friend-search-id").value.trim();
    if (!id || id.length < 8) { UI.toast("أدخل معرف صالح", "error"); return; }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://uuuuu-rup4.onrender.com/api/players/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { UI.toast("اللاعب غير موجود", "error"); return; }
      const player = await res.json();
      const result = document.getElementById("friend-search-result");
      result.classList.remove("hidden");
      result.innerHTML = `
        <div class="friend-item">
          <div class="friend-avatar">${Effects.buildAvatarSvg(player.avatar, 36)}</div>
          <div class="friend-info">
            <div class="friend-name">${player.nickname}</div>
            <div class="friend-level">LV.${player.level} · ${player.activeTitle || ""}</div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="Friends.sendRequest('${player.playerId}')">إضافة</button>
        </div>
      `;
    } catch { UI.toast("خطأ في البحث", "error"); }
  }

  async function sendRequest(targetId) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://uuuuu-rup4.onrender.com/api/players/${targetId}/friend-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) UI.toast("تم إرسال طلب الصداقة", "success");
      else UI.toast(data.error, "error");
    } catch { UI.toast("خطأ في إرسال الطلب", "error"); }
  }

  async function respondRequest(fromId, action) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://uuuuu-rup4.onrender.com/api/players/friend-request/${fromId}/respond`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        UI.toast(action === "accept" ? "تم قبول الطلب" : "تم رفض الطلب", "success");
        load();
      }
    } catch {}
  }

  async function removeFriend(targetId) {
    if (!confirm("هل تريد حذف هذا الصديق؟")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`https://uuuuu-rup4.onrender.com/api/players/${targetId}/friend`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      UI.toast("تم حذف الصديق", "info");
      load();
    } catch {}
  }

  async function pin(targetId) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://uuuuu-rup4.onrender.com/api/players/${targetId}/pin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { load(); }
      else UI.toast(data.error, "error");
    } catch {}
  }

  async function viewProfile(playerId) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://uuuuu-rup4.onrender.com/api/players/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const player = await res.json();
      const content = document.getElementById("player-profile-content");
      if (!content) return;
      content.innerHTML = `
        <div class="profile-avatar">${Effects.buildAvatarSvg(player.avatar, 70)}</div>
        <div class="profile-name">${player.nickname} ${player.isDev ? '<span style="color:var(--gold);font-size:0.75rem">[Dev]</span>' : ''}</div>
        <div class="profile-id">ID: ${player.playerId}</div>
        <div class="profile-level">المستوى ${player.level}</div>
        <div class="profile-title">${player.activeTitle || ""}</div>
        <div class="profile-stats">
          <div><div class="profile-stat-value">${player.stats?.gamesPlayed || 0}</div><div class="profile-stat-label">مباريات</div></div>
          <div><div class="profile-stat-value">${player.stats?.gamesWon || 0}</div><div class="profile-stat-label">انتصار</div></div>
          <div><div class="profile-stat-value">${player.stats?.correctGuesses || 0}</div><div class="profile-stat-label">تخمين صح</div></div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-sm btn-danger" onclick="Friends.block('${player.playerId}');UI.hideModal('modal-player-profile')">حظر</button>
        </div>
      `;
      UI.showModal("modal-player-profile");
    } catch {}
  }

  async function block(targetId) {
    if (!confirm("هل تريد حظر هذا اللاعب؟")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`https://uuuuu-rup4.onrender.com/api/players/${targetId}/block`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      UI.toast("تم حظر اللاعب", "info");
      load();
    } catch {}
  }

  return { load, searchPlayer, sendRequest, respondRequest, removeFriend, pin, viewProfile, block };
})();
