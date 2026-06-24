/* ===== Audio Manager ===== */
const Audio = (() => {
  const sounds = {};
  let volume = 0.8;
  let muted = false;

  const SOUND_FILES = [
    "click", "hint", "correct", "wrong", "black", "win", "lose",
    "card-flip", "join", "leave", "turn-start", "level-up",
    "notification", "legendary-join", "dev-join"
  ];

  function init() {
    volume = parseFloat(localStorage.getItem("volume") || "0.8");
    muted = localStorage.getItem("muted") === "true";

    SOUND_FILES.forEach((name) => {
      const audio = new window.Audio();
      audio.src = `assets/sounds/${name}.mp3`;
      audio.preload = "auto";
      audio.volume = volume;
      sounds[name] = audio;
    });
  }

  function play(name) {
    if (muted) return;
    const s = sounds[name];
    if (!s) return;
    try {
      s.currentTime = 0;
      s.volume = volume;
      s.play().catch(() => {});
    } catch {}
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    localStorage.setItem("volume", volume);
    Object.values(sounds).forEach((s) => (s.volume = volume));
  }

  function setMuted(v) {
    muted = v;
    localStorage.setItem("muted", v);
  }

  function isMuted() { return muted; }
  function getVolume() { return volume; }

  return { init, play, setVolume, setMuted, isMuted, getVolume };
})();
