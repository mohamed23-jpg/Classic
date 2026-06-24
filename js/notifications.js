/* ===== Notifications System ===== */
const Notifications = (() => {
  const API = "https://uuuuu-rup4.onrender.com/api";
  let notifications = [];

  async function load() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      notifications = data.notifications || [];
      updateBadge(data.unread || 0);
      renderList();
    } catch {}
  }

  function updateBadge(count) {
    const badge = document.getElementById("notif-count");
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  function renderList() {
    const list = document.getElementById("notifications-list");
    if (!list) return;
    if (notifications.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-dim)">لا توجد إشعارات</div>`;
      return;
    }
    list.innerHTML = notifications.map((n) => `
      <div class="notif-item ${n.isRead ? "" : "unread"}" data-id="${n._id}">
        <div class="notif-content">
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${UI.timeAgo(n.createdAt)}</div>
        </div>
        <button class="notif-del" onclick="Notifications.delete('${n._id}')">×</button>
      </div>
    `).join("");

    list.querySelectorAll(".notif-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.classList.contains("notif-del")) return;
        markRead(item.dataset.id);
        item.classList.remove("unread");
      });
    });
  }

  async function markRead(id) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const notif = notifications.find((n) => n._id === id);
      if (notif) notif.isRead = true;
      const unread = notifications.filter((n) => !n.isRead).length;
      updateBadge(unread);
    } catch {}
  }

  async function markAllRead() {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      notifications.forEach((n) => (n.isRead = true));
      updateBadge(0);
      renderList();
    } catch {}
  }

  async function deleteNotif(id) {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      notifications = notifications.filter((n) => n._id !== id);
      const unread = notifications.filter((n) => !n.isRead).length;
      updateBadge(unread);
      renderList();
    } catch {}
  }

  function onNewNotification(data) {
    Audio.play("notification");
    UI.toast(data.message || "إشعار جديد", "info");
    notifications.unshift({ ...data, isRead: false, createdAt: new Date() });
    const unread = notifications.filter((n) => !n.isRead).length;
    updateBadge(unread);
    renderList();
  }

  return { load, markAllRead, delete: deleteNotif, onNewNotification };
})();
