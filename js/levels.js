/* ===== Levels Tree System ===== */
const Levels = (() => {
  const PER_ROW = 4;

  function xpForLevel(n) {
    if (n <= 1) return 0;
    return Math.floor(80 * Math.pow(n - 1, 1.6));
  }

  function totalXpForLevel(n) {
    let total = 0;
    for (let i = 2; i <= n; i++) total += xpForLevel(i);
    return total;
  }

  const REWARDS = {
    3:  { coins: 200,  title: null,            note: "مكافأة البداية" },
    5:  { coins: 500,  title: null,            note: "مكافأة المبتدئ" },
    8:  { coins: 800,  title: null,            note: "🔓 فتح السوق" },
    10: { coins: 1000, title: "متعلم",         note: "لقب جديد" },
    15: { coins: 1500, title: null,            note: "مكافأة عملات" },
    20: { coins: 2000, title: "محترف",         note: "لقب جديد" },
    25: { coins: 3000, title: null,            note: "مكافأة عملات" },
    30: { coins: 4000, title: "خبير",          note: "لقب جديد" },
    35: { coins: 5000, title: null,            note: "مكافأة عملات" },
    40: { coins: 5000, title: null,            note: "مكافأة عملات" },
    45: { coins: 6000, title: null,            note: "مكافأة عملات" },
    50: { coins:10000, title: "بطل",           note: "لقب + مكافأة كبرى" },
    55: { coins: 8000, title: null,            note: "مكافأة عملات" },
    60: { coins:10000, title: "فارس",          note: "لقب نادر" },
    65: { coins:12000, title: null,            note: "مكافأة عملات" },
    70: { coins:15000, title: "سيد",           note: "لقب نادر" },
    75: { coins:15000, title: null,            note: "مكافأة عملات" },
    80: { coins:20000, title: null,            note: "مكافأة ذهبية" },
    85: { coins:20000, title: null,            note: "مكافأة ذهبية" },
    90: { coins:25000, title: "أسطورة حية",   note: "لقب أسطوري" },
    95: { coins:30000, title: null,            note: "مكافأة الأسطوري" },
    98: { coins:35000, title: null,            note: "🌟 إشعار الأسطوري مُفعّل" },
    100:{ coins:50000, title: "مختم اللعبة",  note: "اللقب النهائي + حزمة إلهية" },
  };

  function render() {
    const player = App.getPlayer();
    const playerLevel = player?.level || 1;
    const container = document.getElementById("levels-tree");
    if (!container) return;

    let html = '<div class="levels-path">';

    const rows = Math.ceil(100 / PER_ROW);
    for (let row = 0; row < rows; row++) {
      const isReversed = row % 2 === 1;
      let levels = [];
      for (let i = 0; i < PER_ROW; i++) {
        const lv = row * PER_ROW + i + 1;
        if (lv <= 100) levels.push(lv);
      }
      if (isReversed) levels.reverse();

      html += `<div class="levels-row ${isReversed ? "row-reversed" : ""}">`;
      levels.forEach((lv, idx) => {
        const reward = REWARDS[lv];
        const isUnlocked = lv <= playerLevel;
        const isCurrent = lv === playerLevel;
        const xpNeeded = xpForLevel(lv);
        let nodeClass = "level-node";
        if (isUnlocked) nodeClass += " lvl-unlocked";
        if (isCurrent) nodeClass += " lvl-current";
        if (!isUnlocked) nodeClass += " lvl-locked";
        if (reward) nodeClass += " lvl-has-reward";

        html += `
          <div class="${nodeClass}" data-level="${lv}" onclick="Levels.showDetail(${lv})">
            ${reward ? '<div class="lvl-reward-dot"></div>' : ""}
            <div class="lvl-circle">
              <span class="lvl-num">${lv}</span>
            </div>
            ${reward ? `<div class="lvl-reward-label">${reward.note}</div>` : ""}
          </div>`;

        if (idx < levels.length - 1) {
          html += `<div class="lvl-connector ${isReversed ? "conn-rtl" : ""}"></div>`;
        }
      });
      html += `</div>`;

      if ((row + 1) * PER_ROW < 100) {
        const side = isReversed ? "conn-v-right" : "conn-v-left";
        html += `<div class="lvl-row-spacer">
          <div class="lvl-v-connector ${side}"></div>
        </div>`;
      }
    }

    html += '</div>';
    container.innerHTML = html;

    const currentEl = container.querySelector(".lvl-current");
    if (currentEl) setTimeout(() => currentEl.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
  }

  function showDetail(level) {
    const reward = REWARDS[level];
    const xpNeeded = xpForLevel(level);
    const total = totalXpForLevel(level);
    const player = App.getPlayer();
    const playerLevel = player?.level || 1;
    const isUnlocked = level <= playerLevel;

    let rewardText = "";
    if (reward) {
      if (reward.coins) rewardText += `<div class="lvl-detail-reward"><svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffd700"/></svg> +${reward.coins.toLocaleString()} عملة</div>`;
      if (reward.title) rewardText += `<div class="lvl-detail-reward"><span class="detail-title-badge">${reward.title}</span> لقب جديد</div>`;
    }

    const panel = document.getElementById("lvl-detail-popup");
    if (panel) {
      document.getElementById("lvl-detail-num").textContent = `المستوى ${level}`;
      document.getElementById("lvl-detail-xp").textContent = level > 1 ? `${xpNeeded.toLocaleString()} XP للوصول من ${level - 1}` : "نقطة البداية";
      document.getElementById("lvl-detail-total").textContent = `${total.toLocaleString()} XP إجمالي`;
      document.getElementById("lvl-detail-rewards").innerHTML = rewardText || '<span style="color:var(--text-dim)">لا توجد مكافأة خاصة</span>';
      document.getElementById("lvl-detail-status").textContent = isUnlocked ? "✅ مفتوح" : "🔒 لم تصله بعد";
      document.getElementById("lvl-detail-status").style.color = isUnlocked ? "var(--green)" : "var(--text-dim)";
      panel.classList.remove("hidden");
    }
  }

  return { render, showDetail, xpForLevel, totalXpForLevel, REWARDS };
})();
