/* ===== Visual Effects ===== */
const Effects = (() => {
  let particlesCtx = null;
  let particlesArr = [];
  let animFrame = null;

  // ===== جزيئات الخلفية =====
  function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    particlesCtx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    createParticles();
    animate();
  }

  function resize() {
    const canvas = document.getElementById("particles-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particlesArr = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      particlesArr.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: ["#ff0040", "#00d4ff", "#ffd700", "#b829dd", "#00ff88"][Math.floor(Math.random() * 5)],
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function animate() {
    if (!particlesCtx) return;
    const canvas = document.getElementById("particles-canvas");
    particlesCtx.clearRect(0, 0, canvas.width, canvas.height);

    particlesArr.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const pulsedAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
      particlesCtx.save();
      particlesCtx.globalAlpha = pulsedAlpha;
      particlesCtx.fillStyle = p.color;
      particlesCtx.shadowBlur = 8;
      particlesCtx.shadowColor = p.color;
      particlesCtx.beginPath();
      particlesCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particlesCtx.fill();
      particlesCtx.restore();
    });

    animFrame = requestAnimationFrame(animate);
  }

  // ===== تعبئة شبكة الأفاتارات =====
  function populateAvatarGrid() {
    document.querySelectorAll(".avatar-option[data-avatar]").forEach((opt) => {
      const type = opt.dataset.avatar;
      const svgDiv = opt.querySelector(".avatar-svg");
      if (svgDiv) svgDiv.innerHTML = buildAvatarSvg(type, 44);
    });
  }

  // ===== إشعار الأسطوري =====
  function showLegendaryJoin(data) {
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");
    if (settings.legendaryNotification === false) return;
    if ((data.level || 0) < 98) return;

    const overlay = document.getElementById("overlay-legendary");
    const nameEl = document.getElementById("legendary-player-name");
    const avatarEl = document.getElementById("legendary-avatar-display");

    if (nameEl) nameEl.textContent = data.nickname;
    if (avatarEl) avatarEl.innerHTML = buildAvatarSvg(data.avatar, 60);

    spawnGoldenParticles();
    overlay.classList.remove("hidden");
    Audio.play("legendary-join");

    setTimeout(() => overlay.classList.add("hidden"), 3000);
  }

  function spawnGoldenParticles() {
    const container = document.getElementById("legendary-particles");
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "golden-particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 0.5}s`;
      p.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
      container.appendChild(p);
    }
  }

  // ===== ألعاب نارية =====
  function launchFireworks(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const colors = ["#ff0040", "#00d4ff", "#ffd700", "#b829dd", "#00ff88"];

    for (let burst = 0; burst < 6; burst++) {
      setTimeout(() => {
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * (canvas.height * 0.6);
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2;
          const speed = 2 + Math.random() * 4;
          particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1, color, size: 2 + Math.random() * 2,
          });
        }
      }, burst * 400);
    }

    let fwFrame;
    const fwAnimate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.alpha -= 0.015;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      });
      particles.forEach((p, i) => { if (p.alpha <= 0) particles.splice(i, 1); });
      if (particles.length > 0) fwFrame = requestAnimationFrame(fwAnimate);
    };
    fwAnimate();
  }

  // ===== تأثيرات البطاقات =====
  function flashCard(cardEl, type) {
    const classes = { correct: "flash-green", wrong: "flash-red", black: "flash-black", neutral: "flash-neutral" };
    const cls = classes[type] || "flash-green";
    cardEl.classList.add(cls);
    setTimeout(() => cardEl.classList.remove(cls), 600);
  }

  function shakeScreen() {
    document.body.classList.add("screen-shake");
    setTimeout(() => document.body.classList.remove("screen-shake"), 300);
  }

  // ===== الأفاتارات (8 فقط - بدون حيوانات) =====
  function buildAvatarSvg(type, size = 40) {
    const s = size;
    const avatarSvgs = {
      spy: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="spybg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#1a1a3e"/><stop offset="100%" stop-color="#0a0a1e"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#spybg_${s})"/>
        <circle cx="50" cy="44" r="20" fill="#e8c898"/>
        <rect x="26" y="26" width="48" height="12" rx="6" fill="#111"/>
        <ellipse cx="50" cy="27" rx="20" ry="10" fill="#222"/>
        <rect x="24" y="35" width="52" height="5" rx="2" fill="#0a0a0a"/>
        <rect x="30" y="50" width="16" height="6" rx="3" fill="#000" opacity="0.85"/>
        <rect x="54" y="50" width="16" height="6" rx="3" fill="#000" opacity="0.85"/>
        <rect x="44" y="52" width="12" height="3" fill="#333"/>
        <circle cx="38" cy="52" r="2.5" fill="#00d4ff" opacity="0.5"/>
        <circle cx="62" cy="52" r="2.5" fill="#00d4ff" opacity="0.5"/>
        <path d="M44 60 Q50 65 56 60" fill="none" stroke="#a08060" stroke-width="2"/>
        <rect x="26" y="66" width="48" height="22" rx="5" fill="#111"/>
        <rect x="44" y="62" width="12" height="6" fill="#e8c898"/>
        <rect x="46" y="60" width="8" height="12" fill="#cc0020"/>
        <ellipse cx="50" cy="72" rx="8" ry="4" fill="#1a1a2e"/>
      </svg>`,

      detective: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="detbg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#2a1a0a"/><stop offset="100%" stop-color="#0a0800"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#detbg_${s})"/>
        <circle cx="46" cy="46" r="20" fill="#e8c898"/>
        <ellipse cx="32" cy="30" rx="8" ry="14" fill="#5a3a18" transform="rotate(-15,32,30)"/>
        <ellipse cx="60" cy="30" rx="8" ry="14" fill="#5a3a18" transform="rotate(15,60,30)"/>
        <ellipse cx="46" cy="28" rx="18" ry="10" fill="#7a5228"/>
        <rect x="28" y="33" width="36" height="8" rx="2" fill="#5a3a18"/>
        <circle cx="40" cy="44" r="5" fill="#1a0800"/>
        <circle cx="52" cy="44" r="5" fill="#1a0800"/>
        <circle cx="41" cy="42" r="2" fill="#fff"/>
        <circle cx="53" cy="42" r="2" fill="#fff"/>
        <path d="M40 56 Q46 62 52 56" fill="none" stroke="#a07850" stroke-width="2.5"/>
        <ellipse cx="46" cy="57" rx="7" ry="4" fill="#c89a70"/>
        <rect x="66" y="52" width="18" height="18" rx="9" fill="none" stroke="#ffd700" stroke-width="2.5"/>
        <line x1="74" y1="52" x2="80" y2="46" stroke="#ffd700" stroke-width="3" stroke-linecap="round"/>
        <rect x="22" y="68" width="44" height="20" rx="5" fill="#5a3a18"/>
      </svg>`,

      manager: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="mgrbg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#0a1a3e"/><stop offset="100%" stop-color="#050a1e"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#mgrbg_${s})"/>
        <circle cx="50" cy="42" r="20" fill="#f0d8b0"/>
        <rect x="26" y="64" width="48" height="24" rx="5" fill="#1a3a6e"/>
        <rect x="44" y="60" width="12" height="6" fill="#f0d8b0"/>
        <rect x="47" y="55" width="6" height="20" fill="#e00030"/>
        <polygon points="47,55 53,55 56,70 50,75 44,70" fill="#b80028"/>
        <circle cx="40" cy="38" r="5" fill="#1a0800"/>
        <circle cx="60" cy="38" r="5" fill="#1a0800"/>
        <circle cx="41" cy="36" r="2" fill="#fff"/>
        <circle cx="61" cy="36" r="2" fill="#fff"/>
        <path d="M42 52 Q50 58 58 52" fill="none" stroke="#c4956a" stroke-width="2"/>
        <rect x="26" y="66" width="20" height="18" fill="#1a3a6e"/>
        <rect x="54" y="66" width="20" height="18" fill="#1a3a6e"/>
        <rect x="20" y="58" width="10" height="12" rx="5" fill="#1a3a6e"/>
        <rect x="70" y="58" width="10" height="12" rx="5" fill="#1a3a6e"/>
      </svg>`,

      samurai: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="sambg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#1a0a00"/><stop offset="100%" stop-color="#0a0500"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#sambg_${s})"/>
        <circle cx="50" cy="54" r="22" fill="#e8c898"/>
        <ellipse cx="50" cy="34" rx="26" ry="18" fill="#1a0a00"/>
        <ellipse cx="50" cy="30" rx="22" ry="14" fill="#cc2200"/>
        <rect x="24" y="36" width="52" height="10" fill="#1a0a00"/>
        <rect x="18" y="38" width="10" height="18" rx="4" fill="#1a0a00"/>
        <rect x="72" y="38" width="10" height="18" rx="4" fill="#1a0a00"/>
        <rect x="32" y="38" width="36" height="8" fill="#cc2200" opacity="0.6"/>
        <line x1="50" y1="30" x2="50" y2="18" stroke="#ffd700" stroke-width="3"/>
        <circle cx="50" cy="16" r="5" fill="#ffd700"/>
        <circle cx="41" cy="50" r="5" fill="#1a0800"/>
        <circle cx="59" cy="50" r="5" fill="#1a0800"/>
        <circle cx="42" cy="48" r="2" fill="#fff"/>
        <circle cx="60" cy="48" r="2" fill="#fff"/>
        <path d="M42 62 Q50 68 58 62" fill="none" stroke="#c4956a" stroke-width="2"/>
        <rect x="30" y="74" width="40" height="16" rx="3" fill="#cc2200"/>
      </svg>`,

      mafia: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="mafbg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#0d0d0d"/><stop offset="100%" stop-color="#050505"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#mafbg_${s})"/>
        <circle cx="50" cy="54" r="22" fill="#d4a870"/>
        <rect x="26" y="28" width="48" height="8" rx="3" fill="#1a1a1a"/>
        <ellipse cx="50" cy="28" rx="20" ry="12" fill="#222"/>
        <rect x="22" y="34" width="56" height="5" rx="2" fill="#111"/>
        <circle cx="40" cy="51" r="5" fill="#1a0800"/>
        <circle cx="60" cy="51" r="5" fill="#1a0800"/>
        <circle cx="41" cy="49" r="2" fill="#fff"/>
        <circle cx="61" cy="49" r="2" fill="#fff"/>
        <path d="M42 62 Q50 68 58 62" fill="none" stroke="#a07040" stroke-width="2.5"/>
        <line x1="56" y1="44" x2="68" y2="62" stroke="#cc5533" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="24" y="74" width="52" height="18" rx="5" fill="#111"/>
        <rect x="44" y="68" width="12" height="8" fill="#d4a870"/>
        <rect x="46" y="66" width="8" height="6" fill="#cc2200"/>
      </svg>`,

      spy_f: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="spyfbg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#1a0a2e"/><stop offset="100%" stop-color="#0a0514"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#spyfbg_${s})"/>
        <circle cx="50" cy="48" r="22" fill="#f0c8a8"/>
        <path d="M28 36 Q32 18 50 20 Q68 18 72 36 Q68 28 50 30 Q32 28 28 36z" fill="#1a0a2e"/>
        <path d="M28 36 Q24 42 26 48 Q28 52 22 54 Q16 52 18 44 Q20 38 28 36z" fill="#1a0a2e"/>
        <path d="M72 36 Q76 42 74 48 Q72 52 78 54 Q84 52 82 44 Q80 38 72 36z" fill="#1a0a2e"/>
        <rect x="30" y="47" width="16" height="9" rx="4.5" fill="#111" opacity="0.92"/>
        <rect x="54" y="47" width="16" height="9" rx="4.5" fill="#111" opacity="0.92"/>
        <rect x="44" y="50" width="12" height="3" fill="#333"/>
        <circle cx="38" cy="51" r="3" fill="#ff0060" opacity="0.35"/>
        <circle cx="62" cy="51" r="3" fill="#ff0060" opacity="0.35"/>
        <path d="M42 62 Q50 68 58 62" fill="none" stroke="#c4856a" stroke-width="2"/>
        <rect x="28" y="74" width="44" height="18" rx="5" fill="#2a1a3e"/>
        <rect x="44" y="68" width="12" height="8" fill="#f0c8a8"/>
        <rect x="46" y="66" width="8" height="6" fill="#aa0060"/>
      </svg>`,

      ninja: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="ninjabg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#060606"/><stop offset="100%" stop-color="#000"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#ninjabg_${s})"/>
        <circle cx="50" cy="50" r="22" fill="#e0b890"/>
        <rect x="24" y="22" width="52" height="28" rx="10" fill="#111"/>
        <line x1="24" y1="34" x2="76" y2="34" stroke="#1f1f1f" stroke-width="2"/>
        <rect x="24" y="44" width="52" height="12" rx="5" fill="#0a0a0a"/>
        <circle cx="40" cy="50" r="5" fill="#8b0000"/>
        <circle cx="60" cy="50" r="5" fill="#8b0000"/>
        <circle cx="41" cy="48" r="2" fill="#ff4040"/>
        <circle cx="61" cy="48" r="2" fill="#ff4040"/>
        <rect x="24" y="66" width="52" height="22" rx="5" fill="#111"/>
        <line x1="36" y1="66" x2="36" y2="88" stroke="#1a1a1a" stroke-width="2"/>
        <line x1="64" y1="66" x2="64" y2="88" stroke="#1a1a1a" stroke-width="2"/>
        <line x1="50" y1="66" x2="50" y2="88" stroke="#ff0040" stroke-width="1.5" opacity="0.6"/>
      </svg>`,

      alien: `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="alienbg_${s}" cx="50%" cy="40%"><stop offset="0%" stop-color="#001a08"/><stop offset="100%" stop-color="#000a04"/></radialGradient></defs>
        <circle cx="50" cy="50" r="48" fill="url(#alienbg_${s})"/>
        <ellipse cx="50" cy="46" rx="28" ry="34" fill="#3adc60"/>
        <ellipse cx="50" cy="46" rx="28" ry="34" fill="none" stroke="#00ff44" stroke-width="1.5" opacity="0.5"/>
        <ellipse cx="38" cy="42" rx="10" ry="13" fill="#001800"/>
        <ellipse cx="62" cy="42" rx="10" ry="13" fill="#001800"/>
        <ellipse cx="38" cy="40" rx="7" ry="9" fill="#00ff88" opacity="0.4"/>
        <ellipse cx="62" cy="40" rx="7" ry="9" fill="#00ff88" opacity="0.4"/>
        <circle cx="38" cy="42" r="5" fill="#000"/>
        <circle cx="62" cy="42" r="5" fill="#000"/>
        <circle cx="36" cy="40" r="2" fill="#00ffaa"/>
        <circle cx="60" cy="40" r="2" fill="#00ffaa"/>
        <path d="M43 62 Q50 70 57 62" fill="none" stroke="#00cc44" stroke-width="2.5"/>
        <ellipse cx="50" cy="22" rx="5" ry="3" fill="#00ff44" opacity="0.5"/>
        <line x1="24" y1="50" x2="14" y2="58" stroke="#3adc60" stroke-width="2"/>
        <line x1="76" y1="50" x2="86" y2="58" stroke="#3adc60" stroke-width="2"/>
        <ellipse cx="50" cy="58" rx="8" ry="4" fill="#2aff60" opacity="0.4"/>
      </svg>`,
    };

    return avatarSvgs[type] || avatarSvgs["spy"];
  }

  return {
    initParticles, showLegendaryJoin, launchFireworks,
    flashCard, shakeScreen, buildAvatarSvg, populateAvatarGrid,
  };
})();

window.buildAvatarSvg = Effects.buildAvatarSvg;
