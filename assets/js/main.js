/* ============================================================
   MAIN — portfolio frontend logic, sounds, animations
   ============================================================ */
(function () {
  const data = window.PortfolioStore.load();

  /* ---------- RENDER SKILLS ---------- */
  const skillsGrid = document.getElementById("skillsGrid");
  if (skillsGrid) {
    skillsGrid.innerHTML = data.skills
      .map((s) => `<div class="skill reveal" data-sound="hover">${escapeHtml(s)}</div>`)
      .join("");
  }

  /* ---------- RENDER PROJECTS ---------- */
  const projectsGrid = document.getElementById("projectsGrid");
  if (projectsGrid) {
    projectsGrid.innerHTML = data.projects
      .map(
        (p) => `
      <article class="project reveal" data-sound="hover">
        <div class="project__media ${p.image ? "" : "project__media--placeholder"}">
          ${
            p.image
              ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.title)}" />`
              : `<span>${escapeHtml(p.emoji || "✦")}</span>`
          }
        </div>
        <div class="project__body">
          <span class="project__tag">${escapeHtml(p.tag || "Project")}</span>
          <h3 class="project__title">${escapeHtml(p.title)}</h3>
          <p class="project__desc">${escapeHtml(p.description || "")}</p>
          ${
            p.stack && p.stack.length
              ? `<div class="project__stack">${p.stack
                  .map((t) => `<span>${escapeHtml(t)}</span>`)
                  .join("")}</div>`
              : ""
          }
          <div class="project__links">
            ${
              p.repo
                ? `<a href="${escapeAttr(p.repo)}" target="_blank" rel="noopener" data-sound="click">GitHub →</a>`
                : ""
            }
            ${
              p.live
                ? `<a href="${escapeAttr(p.live)}" target="_blank" rel="noopener" data-sound="click">Live →</a>`
                : ""
            }
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  /* ---------- RENDER EXPERIENCE ---------- */
  const tl = document.getElementById("timelineList");
  if (tl) {
    tl.innerHTML = data.experience
      .map(
        (x) => `
      <div class="tl-item reveal">
        <div class="tl-item__period">${escapeHtml(x.period)}</div>
        <div class="tl-item__role">${escapeHtml(x.role)}</div>
        <div class="tl-item__company">${escapeHtml(x.company)}</div>
        ${
          x.bullets && x.bullets.length
            ? `<ul>${x.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`
      )
      .join("");
  }

  /* ---------- YEAR ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV STATE ---------- */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- ACTIVE LINK ON SCROLL ---------- */
  const navLinks = document.querySelectorAll(".nav__links a");
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => navObs.observe(s));

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- COUNTERS ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const dur = 1400;
          const start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(eased * target);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          }
          requestAnimationFrame(tick);
          ob.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    ob.observe(el);
  });

  /* ---------- POINTER-FOLLOW GLOW (cards) ---------- */
  document.addEventListener("mousemove", (e) => {
    document.querySelectorAll(".project, .skill").forEach((el) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", mx + "%");
      el.style.setProperty("--my", my + "%");
    });
  });

  /* ---------- SOUND ENGINE (WebAudio, no external files) ---------- */
  const sound = (function () {
    let ctx = null;
    let enabled = localStorage.getItem("tk_sound") !== "off";

    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    }
    function tone({ freq = 600, dur = 0.12, type = "sine", vol = 0.06, slide = 0 }) {
      if (!enabled) return;
      ensure();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    }
    return {
      hover() { tone({ freq: 880, dur: 0.08, type: "sine", vol: 0.025 }); },
      click() {
        tone({ freq: 520, dur: 0.05, type: "triangle", vol: 0.05 });
        setTimeout(() => tone({ freq: 1040, dur: 0.08, type: "sine", vol: 0.04, slide: 200 }), 35);
      },
      isOn: () => enabled,
      toggle() {
        enabled = !enabled;
        localStorage.setItem("tk_sound", enabled ? "on" : "off");
        if (enabled) {
          ensure();
          tone({ freq: 660, dur: 0.1, type: "sine", vol: 0.05 });
          setTimeout(() => tone({ freq: 990, dur: 0.12, type: "sine", vol: 0.05 }), 90);
        }
        return enabled;
      }
    };
  })();

  document.body.addEventListener(
    "mouseover",
    (e) => {
      const t = e.target.closest("[data-sound='hover']");
      if (t && t.dataset.lastHover !== "1") {
        t.dataset.lastHover = "1";
        sound.hover();
        setTimeout(() => (t.dataset.lastHover = "0"), 180);
      }
    },
    true
  );
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("[data-sound='click'], [data-sound='hover']")) sound.click();
  });

  const soundBtn = document.getElementById("soundToggle");
  function reflectSound() {
    if (!soundBtn) return;
    soundBtn.classList.toggle("is-on", sound.isOn());
    soundBtn.classList.toggle("is-off", !sound.isOn());
  }
  reflectSound();
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      sound.toggle();
      reflectSound();
    });
  }

  /* ---------- AMBIENT PARTICLES ---------- */
  (function particles() {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, parts;
    function resize() {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }
    function init() {
      parts = Array.from({ length: 38 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        a: Math.random() * 0.5 + 0.2
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grd.addColorStop(0, `rgba(212,175,55,${p.a})`);
        grd.addColorStop(1, "rgba(212,175,55,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    init();
    tick();
    window.addEventListener("resize", () => { resize(); init(); });
  })();

  /* ---------- HELPERS ---------- */
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
