/* ===== Reconnection System ===== */
const Reconnection = (() => {
  let pendingRoom = null;
  let countdownInterval = null;

  function savePendingRoom(code) {
    pendingRoom = code;
    localStorage.setItem("pendingRoom", code);
  }

  function clearPendingRoom() {
    pendingRoom = null;
    localStorage.removeItem("pendingRoom");
  }

  function checkPendingRoom() {
    const code = localStorage.getItem("pendingRoom");
    if (!code) return;
    pendingRoom = code;
    // تأخير بسيط للتأكد من جاهزية الـ socket
    setTimeout(() => showReconnectPrompt(code), 1000);
  }

  function showReconnectPrompt(code) {
    const overlay = document.getElementById("overlay-reconnect");
    if (!overlay) return;
    overlay.classList.remove("hidden");
  }

  function showDisconnected() {
    UI.toast("انقطع الاتصال... جاري إعادة الاتصال", "error", 10000);
  }

  function attemptReconnect() {
    const code = pendingRoom || localStorage.getItem("pendingRoom");
    if (!code) return;
    const player = App.getPlayer();
    if (!player) return;

    const socket = SocketClient.getSocket();
    if (!socket) return;

    UI.hideOverlay("overlay-reconnect");
    UI.toast("جاري الاستكمال...", "info");

    socket.emit("reconnect_room", { code, playerId: player.playerId }, (response) => {
      if (response.success) {
        Game.onReconnected(response);
        UI.showScreen("lobby");
        clearPendingRoom();
      } else {
        UI.toast(response.error || "لم تعد الغرفة موجودة", "error");
        clearPendingRoom();
        UI.showScreen("menu");
      }
    });
  }

  function cancel() {
    clearPendingRoom();
    UI.hideOverlay("overlay-reconnect");
  }

  return { savePendingRoom, clearPendingRoom, checkPendingRoom, showDisconnected, attemptReconnect, cancel };
})();
