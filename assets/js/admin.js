/* ============================================================
   ADMIN — login, CRUD, settings, import/export
   ============================================================ */
(function () {
  const PASS_KEY = "tk_admin_pass";
  const SESSION_KEY = "tk_admin_session";
  const DEFAULT_PASS = "tamar2026";

  const Store = window.PortfolioStore;
  let data = Store.load();

  /* ---------- LOGIN ---------- */
  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashView");
  const loginForm = document.getElementById("loginForm");
  const loginPass = document.getElementById("loginPass");

  function getPass() {
    return localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
  }
  function setPass(p) {
    localStorage.setItem(PASS_KEY, p);
  }
  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function showDash() {
    loginView.style.display = "none";
    dashView.style.display = "grid";
    bootDashboard();
  }
  function showLogin() {
    loginView.style.display = "grid";
    dashView.style.display = "none";
  }

  if (isLoggedIn()) showDash();
  else showLogin();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (loginPass.value === getPass()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      toast("✦ კეთილი იყოს თქვენი მობრძანება");
      showDash();
    } else {
      const card = loginForm;
      card.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 350 }
      );
      loginPass.value = "";
      toast("არასწორი პაროლი", "error");
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  /* ---------- TAB NAV ---------- */
  function bootDashboard() {
    const navBtns = document.querySelectorAll("#adminNav button[data-tab]");
    const panels = document.querySelectorAll(".panel");
    const titleEl = document.getElementById("panelTitle");

    const labels = {
      overview: "Overview",
      profile: "პროფილი",
      projects: "პროექტები",
      experience: "გამოცდილება",
      skills: "სქილები",
      settings: "პარამეტრები"
    };

    navBtns.forEach((b) =>
      b.addEventListener("click", () => {
        navBtns.forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        panels.forEach((p) => p.classList.remove("is-active"));
        const id = "panel-" + b.dataset.tab;
        document.getElementById(id)?.classList.add("is-active");
        titleEl.textContent = labels[b.dataset.tab] || "";
      })
    );

    refresh();
    bindProfile();
    bindProjects();
    bindExperience();
    bindSkills();
    bindSettings();
  }

  /* ---------- COMMON ---------- */
  function persist() {
    Store.save(data);
  }
  function refresh() {
    data = Store.load();
    document.getElementById("cntProjects").textContent = data.projects.length;
    document.getElementById("cntExp").textContent = data.experience.length;
    document.getElementById("cntSkills").textContent = data.skills.length;
    renderProjects();
    renderExperience();
    renderSkills();
    fillProfile();
  }

  function toast(msg, kind) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.style.borderColor = kind === "error" ? "rgba(220,60,60,.6)" : "var(--gold-2)";
    el.style.color = kind === "error" ? "#ffb8b8" : "var(--gold-1)";
    el.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-show"), 2400);
  }

  /* ---------- PROFILE ---------- */
  function fillProfile() {
    const f = document.getElementById("profileForm");
    if (!f) return;
    Object.entries(data.profile).forEach(([k, v]) => {
      const inp = f.elements[k];
      if (inp) inp.value = v;
    });
  }
  function bindProfile() {
    const f = document.getElementById("profileForm");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      ["tagline", "email", "phone", "city", "github", "lead", "body"].forEach((k) => {
        data.profile[k] = (fd.get(k) || "").toString().trim();
      });
      persist();
      toast("პროფილი შენახულია ✦");
    });
  }

  /* ---------- PROJECTS ---------- */
  function renderProjects() {
    const list = document.getElementById("projectList");
    if (!list) return;
    if (!data.projects.length) {
      list.innerHTML = `<p style="color:var(--ink-mute);font-size:13px">ჯერჯერობით არცერთი პროექტი.</p>`;
      return;
    }
    list.innerHTML = data.projects
      .map((p) => `
        <div class="admin-row">
          <div class="admin-row__thumb">${
            p.image ? `<img src="${esc(p.image)}" alt="">` : esc(p.emoji || "✦")
          }</div>
          <div class="admin-row__info">
            <div class="admin-row__title">${esc(p.title)}</div>
            <div class="admin-row__meta">${esc(p.tag || "")} ${
              p.repo ? `· <a href="${esc(p.repo)}" target="_blank" style="color:var(--gold-1)">repo</a>` : ""
            }</div>
          </div>
          <div class="admin-row__actions">
            <button class="btn-icon" data-action="edit" data-id="${esc(p.id)}" title="რედაქტირება">✎</button>
            <button class="btn-icon btn-icon--danger" data-action="del" data-id="${esc(p.id)}" title="წაშლა">✕</button>
          </div>
        </div>
      `)
      .join("");
  }

  function bindProjects() {
    const form = document.getElementById("projectForm");
    const titleEl = document.getElementById("projFormTitle");
    const list = document.getElementById("projectList");
    const upload = document.getElementById("projImageUpload");
    const resetBtn = document.getElementById("projResetBtn");

    upload?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        form.elements.image.value = reader.result;
        toast("სურათი მზადაა შესანახად");
      };
      reader.readAsDataURL(file);
    });

    function resetForm() {
      form.reset();
      form.elements.id.value = "";
      titleEl.textContent = "პროექტის დამატება";
    }

    resetBtn.addEventListener("click", resetForm);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const obj = {
        id: (fd.get("id") || slug(fd.get("title"))).toString(),
        title: (fd.get("title") || "").trim(),
        tag: (fd.get("tag") || "").trim(),
        description: (fd.get("description") || "").trim(),
        repo: (fd.get("repo") || "").trim(),
        live: (fd.get("live") || "").trim(),
        emoji: (fd.get("emoji") || "✦").trim(),
        image: (fd.get("image") || "").trim(),
        stack: (fd.get("stack") || "")
          .toString()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      };
      const idx = data.projects.findIndex((p) => p.id === obj.id);
      if (idx >= 0) data.projects[idx] = obj;
      else data.projects.push(obj);
      persist();
      refresh();
      resetForm();
      toast("პროექტი შენახულია ✦");
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      const p = data.projects.find((x) => x.id === id);
      if (!p) return;

      if (btn.dataset.action === "edit") {
        Object.entries(p).forEach(([k, v]) => {
          const inp = form.elements[k];
          if (!inp) return;
          inp.value = Array.isArray(v) ? v.join(", ") : v;
        });
        titleEl.textContent = `რედაქტირება: ${p.title}`;
        document.getElementById("panel-projects").scrollIntoView({ behavior: "smooth" });
      }

      if (btn.dataset.action === "del") {
        if (!confirm(`წაიშალოს "${p.title}"?`)) return;
        data.projects = data.projects.filter((x) => x.id !== id);
        persist();
        refresh();
        toast("პროექტი წაშლილია");
      }
    });
  }

  /* ---------- EXPERIENCE ---------- */
  function renderExperience() {
    const list = document.getElementById("experienceList");
    if (!list) return;
    if (!data.experience.length) {
      list.innerHTML = `<p style="color:var(--ink-mute);font-size:13px">ჩანაწერი არ არის.</p>`;
      return;
    }
    list.innerHTML = data.experience
      .map(
        (x, i) => `
      <div class="admin-row">
        <div class="admin-row__thumb">${i + 1}</div>
        <div class="admin-row__info">
          <div class="admin-row__title">${esc(x.role)}</div>
          <div class="admin-row__meta">${esc(x.period)} · ${esc(x.company || "")}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn-icon" data-action="edit" data-i="${i}" title="რედაქტირება">✎</button>
          <button class="btn-icon" data-action="up" data-i="${i}" title="ზემოთ">↑</button>
          <button class="btn-icon" data-action="down" data-i="${i}" title="ქვემოთ">↓</button>
          <button class="btn-icon btn-icon--danger" data-action="del" data-i="${i}" title="წაშლა">✕</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  function bindExperience() {
    const form = document.getElementById("experienceForm");
    const titleEl = document.getElementById("expFormTitle");
    const list = document.getElementById("experienceList");
    const resetBtn = document.getElementById("expResetBtn");

    function resetForm() {
      form.reset();
      form.elements.index.value = "";
      titleEl.textContent = "გამოცდილების დამატება";
    }
    resetBtn.addEventListener("click", resetForm);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const obj = {
        period: (fd.get("period") || "").trim(),
        role: (fd.get("role") || "").trim(),
        company: (fd.get("company") || "").trim(),
        bullets: (fd.get("bullets") || "")
          .toString()
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      };
      const idx = fd.get("index");
      if (idx !== "" && idx !== null) data.experience[parseInt(idx, 10)] = obj;
      else data.experience.unshift(obj);
      persist();
      refresh();
      resetForm();
      toast("გამოცდილება შენახულია ✦");
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const i = parseInt(btn.dataset.i, 10);
      const item = data.experience[i];
      if (btn.dataset.action === "edit") {
        form.elements.index.value = i;
        form.elements.period.value = item.period;
        form.elements.role.value = item.role;
        form.elements.company.value = item.company || "";
        form.elements.bullets.value = (item.bullets || []).join("\n");
        titleEl.textContent = `რედაქტირება: ${item.role}`;
        document.getElementById("panel-experience").scrollIntoView({ behavior: "smooth" });
      }
      if (btn.dataset.action === "del") {
        if (!confirm(`წაიშალოს "${item.role}"?`)) return;
        data.experience.splice(i, 1);
        persist();
        refresh();
        toast("ჩანაწერი წაშლილია");
      }
      if (btn.dataset.action === "up" && i > 0) {
        [data.experience[i - 1], data.experience[i]] = [data.experience[i], data.experience[i - 1]];
        persist();
        refresh();
      }
      if (btn.dataset.action === "down" && i < data.experience.length - 1) {
        [data.experience[i + 1], data.experience[i]] = [data.experience[i], data.experience[i + 1]];
        persist();
        refresh();
      }
    });
  }

  /* ---------- SKILLS ---------- */
  function renderSkills() {
    const list = document.getElementById("skillList");
    if (!list) return;
    if (!data.skills.length) {
      list.innerHTML = `<p style="color:var(--ink-mute);font-size:13px">ჩანაწერი არ არის.</p>`;
      return;
    }
    list.innerHTML = data.skills
      .map(
        (s, i) => `
      <div class="admin-row">
        <div class="admin-row__thumb">⚡</div>
        <div class="admin-row__info">
          <div class="admin-row__title">${esc(s)}</div>
        </div>
        <div class="admin-row__actions">
          <button class="btn-icon btn-icon--danger" data-i="${i}" title="წაშლა">✕</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  function bindSkills() {
    const form = document.getElementById("skillForm");
    const bulkForm = document.getElementById("skillBulkForm");
    const list = document.getElementById("skillList");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = form.elements.skill.value.trim();
      if (!v) return;
      data.skills.push(v);
      persist();
      refresh();
      form.reset();
      toast("სქილი დამატებულია ✦");
    });

    bulkForm.elements.bulk.value = data.skills.join("\n");
    bulkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      data.skills = bulkForm.elements.bulk.value
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      persist();
      refresh();
      toast("სქილების სია განახლდა ✦");
    });

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-i]");
      if (!btn) return;
      const i = parseInt(btn.dataset.i, 10);
      data.skills.splice(i, 1);
      persist();
      refresh();
      bulkForm.elements.bulk.value = data.skills.join("\n");
      toast("წაშლილია");
    });
  }

  /* ---------- SETTINGS ---------- */
  function bindSettings() {
    document.getElementById("passwordForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.elements.pass.value !== f.elements.pass2.value) {
        toast("პაროლები არ ემთხვევა", "error");
        return;
      }
      setPass(f.elements.pass.value);
      f.reset();
      toast("პაროლი შეცვლილია ✦");
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      if (!confirm("ნამდვილად გადავტვირთო ყველაფერი ნაგულისხმევზე?")) return;
      data = Store.reset();
      refresh();
      toast("გადატვირთულია");
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("ექსპორტი მზადაა ✦");
    });

    document.getElementById("importFile").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          data = Object.assign({}, Store.DEFAULTS, parsed);
          persist();
          refresh();
          toast("იმპორტი წარმატებული ✦");
        } catch (err) {
          toast("ფაილის წაკითხვა ვერ მოხერხდა", "error");
        }
      };
      reader.readAsText(file);
    });
  }

  /* ---------- HELPERS ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6);
  }
})();
