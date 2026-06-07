/* =========================================================================
   Giorgio Maria Maioli — interactions (vanilla)
   ========================================================================= */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("gm-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  function toggleTheme() {
    const cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("gm-theme", next);
    syncThemeIcon();
  }
  function syncThemeIcon() {
    const light = root.getAttribute("data-theme") === "light";
    $$(".theme-toggle .sun").forEach(e => e.style.display = light ? "none" : "block");
    $$(".theme-toggle .moon").forEach(e => e.style.display = light ? "block" : "none");
  }
  window.addEventListener("DOMContentLoaded", () => {
    syncThemeIcon();
    $$(".theme-toggle").forEach(b => b.addEventListener("click", toggleTheme));
  });

  /* ---------- Custom cursor ---------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring";
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const hov = "a, button, .country, image-slot, .card, .trk, [data-magnetic]";
    addEventListener("mouseover", e => { if (e.target.closest(hov)) document.body.classList.add("cur-hover"); });
    addEventListener("mouseout",  e => { if (e.target.closest(hov)) document.body.classList.remove("cur-hover"); });
    addEventListener("mousedown", () => document.body.classList.add("cur-down"));
    addEventListener("mouseup",   () => document.body.classList.remove("cur-down"));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce) {
    $$("[data-magnetic]").forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Nav: scrolled + active link ---------- */
  const nav = $(".nav");
  const onScroll = () => { nav.classList.toggle("scrolled", scrollY > 40); };
  onScroll(); addEventListener("scroll", onScroll, { passive: true });

  const navLinks = $$(".nav-links a");
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if (sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = "#" + en.target.id;
          navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Reveal + triggers ---------- */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      // bars
      $$(".bar > i, .cmp-bar > i", en.target).forEach(b => {
        if (b.dataset.w) b.style.width = b.dataset.w;
      });
      // elevation line
      if (en.target.classList.contains("elev")) en.target.classList.add("in");
      // count-up
      $$("[data-count]", en.target).forEach(countUp);
      revObs.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  $$(".reveal, .bar > i, .cmp-bar > i, .elev, [data-count]").forEach(el => {
    // observe nearest reveal container or the element itself
    revObs.observe(el);
  });

  // dev escape-hatch: ?reveal=all forces everything visible (for screenshots)
  if (location.search.indexOf("reveal=all") > -1) {
    $$(".reveal").forEach(e => e.classList.add("in"));
    $$(".bar > i, .cmp-bar > i").forEach(b => { if (b.dataset.w) b.style.width = b.dataset.w; });
    $$(".elev").forEach(e => e.classList.add("in"));
    $$("[data-count]").forEach(el => {
      el.textContent = (el.dataset.prefix || "") + el.dataset.count + (el.dataset.suffix || "");
    });
    const m = location.search.match(/to=([\w-]+)/);
    if (m) { const t = document.getElementById(m[1]); if (t) { document.documentElement.style.scrollBehavior = "auto"; setTimeout(() => scrollTo(0, t.offsetTop - 20), 60); } }
  }

  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = reduce ? 0 : 1100;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Hero line reveal ---------- */
  window.addEventListener("DOMContentLoaded", () => {
    if (reduce) return;
    $$(".hero-name .ln > span").forEach((s, i) => {
      s.style.transform = "translateY(105%)";
      s.style.transition = "transform 1s cubic-bezier(0.22,1,0.36,1)";
      s.style.transitionDelay = (0.12 + i * 0.09) + "s";
      requestAnimationFrame(() => requestAnimationFrame(() => { s.style.transform = "translateY(0)"; }));
    });
  });

  /* ---------- Last.fm (optional live data) ----------
     To go live: set username + a public API key below.
     Until then a curated fallback list renders so the section never looks broken. */
  const LASTFM = {
    user: "giooooo11",
    key:  "426d38ea661c3a0408dc588f669c4d5a",
  };
  const fallbackTracks = [
    { name: "Syncing with Last.fm…", artist: "@giooooo11", when: "", art: "", url: "https://www.last.fm/user/giooooo11" },
  ];

  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  function renderRecent(list) {
    const wrap = $(".recent-list");
    if (!wrap) return;
    wrap.innerHTML = list.map(t => `
      <a class="trk${t.nowplaying ? " playing" : ""}" href="${t.url || "#"}" target="_blank" rel="noopener">
        <div class="ti">${t.art ? `<img src="${t.art}" alt="" loading="lazy">` : ""}</div>
        <div class="tn"><b>${escapeHtml(t.name)}</b><span>${escapeHtml(t.artist)}</span></div>
        <div class="tt">${t.nowplaying ? "● now" : escapeHtml(t.when)}</div>
      </a>`).join("");
  }
  function setRecentState(txt){ const s = $(".recent-state"); if (s) s.textContent = txt; }

  async function loadLastfm() {
    renderRecent(fallbackTracks);
    if (!LASTFM.user || !LASTFM.key) return;
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM.user}&api_key=${LASTFM.key}&format=json&limit=4`;
      const r = await fetch(url);
      const data = await r.json();
      const items = (data.recenttracks?.track || []).map(t => ({
        name: t.name,
        artist: t.artist?.["#text"] || t.artist?.name || "",
        art: (t.image?.find(i => i.size === "large")?.["#text"]) || "",
        url: t.url || "",
        nowplaying: t["@attr"]?.nowplaying === "true",
        when: t["@attr"]?.nowplaying ? "now" : timeAgo(t.date?.uts),
      }));
      if (items.length) {
        setRecentState(items[0].nowplaying ? "Now playing" : "Last 3 scrobbles");
        renderRecent(items.slice(0, 3));
      } else lastfmUnavailable();
    } catch (e) { lastfmUnavailable(); }
  }
  function lastfmUnavailable() {
    setRecentState("Recently");
    renderRecent([{ name: "Last.fm history paused right now", artist: "the music never stops though", when: "", art: "", url: "https://www.last.fm/user/giooooo11" }]);
  }
  function timeAgo(uts) {
    if (!uts) return "—";
    const s = Date.now() / 1000 - Number(uts);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }
  loadLastfm();

  /* ---------- Album wall (music.json — "on heavy rotation") ---------- */
  async function loadAlbums() {
    const wall = document.getElementById("album-wall");
    if (!wall) return;
    try {
      const r = await fetch("music.json");
      const albums = await r.json();
      wall.innerHTML = albums.map((a, i) => {
        const title = String(a.album).replace(/\s*\([^)]*\)\s*$/, "").trim();
        const cover = a.cover
          ? `<img src="${a.cover}" alt="${escapeHtml(title)}" loading="lazy">`
          : `<span class="album-ph">${escapeHtml(a.artist)}</span>`;
        const genre = a.macroGenre ? `<span class="album-genre">${escapeHtml(a.macroGenre)}</span>` : "";
        return `
        <a class="album" href="${a.lastfm}" target="_blank" rel="noopener" style="--i:${i}">
          <div class="album-cover">
            ${cover}
            <span class="album-rating">${a.rating}</span>
            ${genre}
          </div>
          <div class="album-meta">
            <b>${escapeHtml(title)}</b>
            <span>${escapeHtml(a.artist)} · ${a.year}</span>
          </div>
        </a>`;
      }).join("");
    } catch (e) {
      wall.innerHTML = `<p class="albums-fail">Album list couldn't load right now — see <a href="https://www.last.fm/user/giooooo11" target="_blank" rel="noopener">@giooooo11</a>.</p>`;
    }
  }
  loadAlbums();

  /* ---------- Card glow tracking ---------- */
  $$(".card").forEach(c => {
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      c.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  });

  /* ---------- Year ---------- */
  $$(".year").forEach(e => e.textContent = new Date().getFullYear());
})();
