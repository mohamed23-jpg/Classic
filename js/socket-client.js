/* ===== Socket Client ===== */
const SERVER_URL = "https://uuuuu-rup4.onrender.com";

let socket = null;

function initSocket() {
  if (socket && socket.connected) return;

  socket = io(SERVER_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("متصل بالسيرفر:", socket.id);
    const player = App.getPlayer();
    if (player) {
      socket.emit("player_connect", { playerId: player.playerId });
    }
    Reconnection.checkPendingRoom();
  });

  socket.on("disconnect", (reason) => {
    console.log("انقطع الاتصال:", reason);
    if (App.getCurrentScreen() === "game" || App.getCurrentScreen() === "lobby") {
      Reconnection.showDisconnected();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("خطأ في الاتصال:", err.message);
  });

  // أحداث الغرف
  socket.on("rooms_update", (rooms) => Game.updateRoomsList(rooms));
  socket.on("room_update", (room) => Game.updateLobbyUI(room));
  socket.on("player_joined", (data) => {
    UI.toast(`${data.nickname} انضم للغرفة`, "info");
    Audio.play("join");
  });
  socket.on("player_left", (data) => {
    UI.toast(`${data.nickname || "لاعب"} غادر الغرفة`, "info");
    Audio.play("leave");
  });
  socket.on("player_reconnected", (data) => {
    UI.toast(`${data.nickname} عاد للمباراة!`, "success");
  });

  // أحداث اللعبة
  socket.on("game_started", (data) => Game.onGameStarted(data));
  socket.on("spymaster_view", (data) => Game.onSpymasterView(data));
  socket.on("game_update", (data) => Game.onGameUpdate(data));
  socket.on("hint_sent", (data) => Game.onHintReceived(data));
  socket.on("card_revealed", (data) => Game.onCardRevealed(data));
  socket.on("turn_changed", (data) => Game.onTurnChanged(data));
  socket.on("game_over", (data) => Game.onGameOver(data));
  socket.on("room_chat", (data) => Game.onRoomChat(data));

  // أحداث اجتماعية
  socket.on("legendary_join", (data) => Effects.showLegendaryJoin(data));
  socket.on("dev_join", (data) => {
    UI.toast(`القائد ${data.nickname} دخل الغرفة!`, "dev");
    Audio.play("dev-join");
  });
  socket.on("notification", (data) => Notifications.onNewNotification(data));
  socket.on("global_chat", (data) => GlobalChat.onNewMessage(data));
  socket.on("private_message", (data) => {
    UI.toast(`رسالة خاصة من ${data.fromNickname}`, "info");
  });
  socket.on("dev_announcement", (data) => {
    UI.toast(`إعلان: ${data.message}`, "dev", 8000);
  });
  socket.on("banned", (data) => {
    alert("تم حظرك من الخادم: " + (data.reason || "لا يوجد سبب"));
    App.logout();
  });
}

function getSocket() { return socket; }

const SocketClient = { initSocket, getSocket };
