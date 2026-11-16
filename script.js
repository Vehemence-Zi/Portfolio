/* ========================================================
   Tactical Menu Interactive JavaScript Module (script.js)
   ======================================================== */
document.addEventListener("DOMContentLoaded", () => {

  // ========================================================
  // 1. P3R-Inspired Crystalline Water & Glass UI Synthesizer
  // ========================================================
  let sfxEnabled = localStorage.getItem("p3r_sfx") !== "off";
  const sfxToggleBtn = document.getElementById("sfx-toggle");
  let audioCtx = null;

  function playUiSound(type) {
    if (!sfxEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      if (type === "hover") {
        // Crisp P3R Menu Cursor Tick (High-frequency water droplet blip)
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = "sine";
        osc2.type = "triangle";

        // Quick upward water-bubble pitch snap
        osc1.frequency.setValueAtTime(1150, now);
        osc1.frequency.exponentialRampToValueAtTime(1850, now + 0.032);

        osc2.frequency.setValueAtTime(2300, now);
        osc2.frequency.exponentialRampToValueAtTime(2950, now + 0.032);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.038);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.04);
        osc2.stop(now + 0.04);

      } else if (type === "select") {
        // P3R Crystalline Confirm Chime (Shimmering two-note major fifth)
        const notes = [1318.51, 1975.53]; // E6 -> B6 crystalline chime
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const startTime = now + idx * 0.042;

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.015, startTime + 0.16);

          gain.gain.setValueAtTime(0.065, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.18);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.19);
        });
      }
    } catch (err) {
      // Ignore if browser blocks audio before user gesture
    }
  }

  if (sfxToggleBtn) {
    sfxToggleBtn.textContent = sfxEnabled ? "SFX: ON" : "SFX: OFF";
    sfxToggleBtn.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      localStorage.setItem("p3r_sfx", sfxEnabled ? "on" : "off");
      sfxToggleBtn.textContent = sfxEnabled ? "SFX: ON" : "SFX: OFF";
      if (sfxEnabled) playUiSound("select");
    });
  }

  // ========================================================
  // 2. Live Calendar Date, Moon Phase & Midnight Clock
  // ========================================================
  const hudDate = document.getElementById("hud-date");
  const hudWeekday = document.getElementById("hud-weekday");
  const hudPeriod = document.getElementById("hud-time-period");
  const moonState = document.getElementById("moon-phase-name");
  const clockElement = document.getElementById("live-clock");

  function updateSystemTime() {
    const now = new Date();
    const hour = now.getHours();

    if (hudDate) {
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

      hudDate.textContent = `${month}/${day}`;
      hudWeekday.textContent = days[now.getDay()];

      if (hour === 0) hudPeriod.textContent = "DARK HOUR";
      else if (hour < 12) hudPeriod.textContent = "MORNING";
      else if (hour < 17) hudPeriod.textContent = "AFTERNOON";
      else if (hour < 21) hudPeriod.textContent = "EVENING";
      else hudPeriod.textContent = "NIGHT";

      const knownNewMoon = new Date("2026-01-18T00:00:00Z").getTime();
      const cycleMs = 29.53058867 * 24 * 60 * 60 * 1000;
      const phaseRatio = ((now.getTime() - knownNewMoon) % cycleMs) / cycleMs;

      if (phaseRatio < 0.06 || phaseRatio > 0.94) moonState.textContent = "NEW MOON";
      else if (phaseRatio < 0.22) moonState.textContent = "WAXING CRESCENT";
      else if (phaseRatio < 0.28) moonState.textContent = "FIRST QUARTER";
      else if (phaseRatio < 0.47) moonState.textContent = "WAXING GIBBOUS";
      else if (phaseRatio < 0.53) moonState.textContent = "FULL MOON";
      else if (phaseRatio < 0.72) moonState.textContent = "WANING GIBBOUS";
      else if (phaseRatio < 0.78) moonState.textContent = "LAST QUARTER";
      else moonState.textContent = "WANING CRESCENT";
    }

    if (clockElement) {
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      if (hour === 0) {
        clockElement.textContent = `TIME STAMP: ${timeStr} [ THE DARK HOUR - ACTIVE ]`;
        clockElement.classList.add("dark-hour-alert");
      } else {
        clockElement.textContent = `TIME STAMP: ${timeStr} [ TARTARUS STANDBY ]`;
        clockElement.classList.remove("dark-hour-alert");
      }
    }
  }
  updateSystemTime();
  setInterval(updateSystemTime, 1000);

  // ========================================================
  // 3. Command Blade & Nav Link Audio + Hover Previews
  // ========================================================
  const cmdBlades = document.querySelectorAll(".cmd-blade");
  const previewText = document.getElementById("cmd-preview-text");

  if (cmdBlades.length > 0 && previewText) {
    cmdBlades.forEach((blade) => {
      blade.addEventListener("mouseenter", () => {
        playUiSound("hover");
        cmdBlades.forEach((b) => b.classList.remove("active-blade"));
        blade.classList.add("active-blade");
        const msg = blade.getAttribute("data-preview");
        if (msg) previewText.textContent = msg;
      });
      blade.addEventListener("click", () => {
        playUiSound("select");
      });
    });
  }

  const navLinks = document.querySelectorAll(".main-nav a");
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => playUiSound("hover"));
  });

  // ========================================================
  // 4. Persona Switcher + localStorage Cross-Page Memory
  // ========================================================
  const personas = [
    {
      shortName: "THE FOOL",
      level: "LV. 04",
      role: "ROOKIE // OPERATOR",
      tag: "ARCANA 0",
      name: "THE FOOL • THE NOVICE",
      hp: 28,
      sp: 22
    },
    {
      shortName: "THE CHARIOT",
      level: "LV. 07",
      role: "STREAM // STRIKER",
      tag: "ARCANA VII",
      name: "THE CHARIOT • THE BROADCASTER",
      hp: 45,
      sp: 35
    },
    {
      shortName: "THE MAGICIAN",
      level: "LV. 06",
      role: "CYBER // TACTICIAN",
      tag: "ARCANA I",
      name: "THE MAGICIAN • THE APPRENTICE",
      hp: 38,
      sp: 52
    }
  ];

  let savedPersonaIdx = parseInt(localStorage.getItem("p3r_persona_idx") || "0", 10);
  if (isNaN(savedPersonaIdx) || savedPersonaIdx < 0 || savedPersonaIdx >= personas.length) {
    savedPersonaIdx = 0;
  }

  const equippedBadge = document.getElementById("equipped-badge");
  if (equippedBadge) {
    equippedBadge.textContent = `[ EQUIPPED: ${personas[savedPersonaIdx].shortName} ]`;
  }

  const personaCards = document.querySelectorAll(".persona-selectable");
  const hudLevel = document.getElementById("hud-level");
  const hudRole = document.getElementById("hud-role");
  const arcanaTag = document.getElementById("arcana-tag");
  const arcanaName = document.getElementById("arcana-name");
  const fillHp = document.getElementById("fill-hp");
  const valHp = document.getElementById("val-hp");
  const fillSp = document.getElementById("fill-sp");
  const valSp = document.getElementById("val-sp");
  const summonBtn = document.getElementById("summon-btn");

  function equipPersona(index, silent) {
    const p = personas[index];
    if (!p || !hudLevel) return;

    localStorage.setItem("p3r_persona_idx", String(index));
    if (!silent) playUiSound("select");

    hudLevel.textContent = p.level;
    hudRole.textContent = p.role;
    arcanaTag.textContent = p.tag;
    arcanaName.textContent = p.name;

    fillHp.style.width = `${p.hp}%`;
    valHp.textContent = `${p.hp}/100`;
    fillSp.style.width = `${p.sp}%`;
    valSp.textContent = `${p.sp}/100`;

    personaCards.forEach((card, idx) => {
      card.classList.toggle("persona-equipped", idx === index);
    });
  }

  if (personaCards.length > 0) {
    equipPersona(savedPersonaIdx, true);

    personaCards.forEach((card, idx) => {
      card.addEventListener("click", () => {
        savedPersonaIdx = idx;
        equipPersona(savedPersonaIdx, false);
      });
    });

    if (summonBtn) {
      summonBtn.addEventListener("click", () => {
        savedPersonaIdx = (savedPersonaIdx + 1) % personas.length;
        equipPersona(savedPersonaIdx, false);
      });
    }
  }

  // ========================================================
  // 5. Interactive Skill Filter Tabs (Resume.htm)
  // ========================================================
  const filterBtns = document.querySelectorAll(".filter-btn");
  const xpItems = document.querySelectorAll(".xp-item");

  if (filterBtns.length > 0 && xpItems.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        playUiSound("select");
        filterBtns.forEach((b) => b.classList.remove("active-filter"));
        btn.classList.add("active-filter");

        const category = btn.getAttribute("data-filter");
        xpItems.forEach((item) => {
          if (category === "all" || item.getAttribute("data-category") === category) {
            item.classList.remove("hidden-skill");
          } else {
            item.classList.add("hidden-skill");
          }
        });
      });
    });
  }

  // ========================================================
  // 6. Interactive Slideshow & Lightbox (Interests.htm)
  // ========================================================
  const slides = document.querySelectorAll(".slide-item");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.getElementById("slide-prev");
  const nextBtn = document.getElementById("slide-next");
  let currentSlide = 0;

  function showSlide(index) {
    if (slides.length === 0) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("active-slide", idx === currentSlide));
    dots.forEach((d, idx) => d.classList.toggle("active-dot", idx === currentSlide));
  }

  if (slides.length > 0) {
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        playUiSound("hover");
        showSlide(currentSlide - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        playUiSound("hover");
        showSlide(currentSlide + 1);
      });
    }
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        playUiSound("hover");
        showSlide(idx);
      });
    });

    const lbModal = document.getElementById("lightbox-modal");
    const lbImg = document.getElementById("lb-img");
    const lbTitle = document.getElementById("lb-title");
    const lbDesc = document.getElementById("lb-desc");
    const lbClose = document.getElementById("lb-close");

    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        if (!lbModal) return;
        playUiSound("select");
        const img = slide.querySelector("img");
        lbImg.src = img ? img.src : "";
        lbImg.alt = img ? img.alt : "Preview";
        lbTitle.textContent = slide.getAttribute("data-title") || "";
        lbDesc.textContent = slide.getAttribute("data-desc") || "";
        lbModal.classList.add("open");
      });
    });

    if (lbClose && lbModal) {
      lbClose.addEventListener("click", () => {
        playUiSound("hover");
        lbModal.classList.remove("open");
      });
      lbModal.addEventListener("click", (e) => {
        if (e.target === lbModal) lbModal.classList.remove("open");
      });
    }
  }

  // ========================================================
  // 7. Payment Auto-Formatting & Live Receipt (Donate.htm)
  // ========================================================
  const ccInput = document.getElementById("cc-num");
  const expInput = document.getElementById("exp-date");
  const donateForm = document.getElementById("donate-form");
  const receiptBox = document.getElementById("receipt-modal");
  const receiptDetails = document.getElementById("receipt-details");
  const closeReceiptBtn = document.getElementById("close-receipt");

  if (ccInput) {
    ccInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "").substring(0, 16);
      let formatted = digits.match(/.{1,4}/g);
      e.target.value = formatted ? formatted.join(" ") : "";
    });
  }

  if (expInput) {
    expInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 4);
      if (val.length >= 3) {
        e.target.value = `${val.substring(0, 2)}/${val.substring(2)}`;
      } else {
        e.target.value = val;
      }
    });
  }

  if (donateForm && receiptBox) {
    donateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      playUiSound("select");
      const firstName = document.getElementById("first-name").value;
      const lastName = document.getElementById("last-name").value;
      const amount = parseFloat(document.getElementById("price").value).toFixed(2);
      const lastFour = ccInput.value.replace(/\s/g, "").slice(-4);

      receiptDetails.innerHTML = `
        <strong>SPONSOR:</strong> ${firstName} ${lastName}<br>
        <strong>CONTRIBUTION:</strong> $${amount} USD<br>
        <strong>CARD ENDING IN:</strong> •••• ${lastFour}<br>
        <strong>STATUS:</strong> AUTHORIZED &amp; LOGGED
      `;
      receiptBox.classList.add("active");
    });

    if (closeReceiptBtn) {
      closeReceiptBtn.addEventListener("click", () => {
        playUiSound("hover");
        receiptBox.classList.remove("active");
        donateForm.reset();
      });
    }
  }
});