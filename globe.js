/* =========================================================================
   Rotating globe — real country outlines (d3-geo + world-atlas)
   visited = grey · lived-in = accent · NL = flashing
   ========================================================================= */
(function () {
  "use strict";
  const canvas = document.getElementById("globe-canvas");
  if (!canvas || typeof d3 === "undefined" || typeof topojson === "undefined") {
    if (canvas) canvas.closest(".globe-wrap")?.classList.add("globe-failed");
    return;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SIZE = 200;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = SIZE * dpr; canvas.height = SIZE * dpr;
  canvas.style.width = canvas.style.height = SIZE + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // ISO 3166-1 numeric codes
  const VISITED = new Set([818,792,40,56,100,191,233,246,276,300,348,380,428,440,499,528,578,616,620,674,703,724,826,336]);
  const LIVED = new Set([380, 440, 528]); // Italy, Lithuania, Netherlands
  const HERE = 528;                        // Netherlands — flashing

  const ACCENT_FALLBACK = "#EA8A3E";
  function accent() {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return v.startsWith("#") ? v : ACCENT_FALLBACK;
  }

  const projection = d3.geoOrthographic().scale(94).translate([100, 100]).clipAngle(90).rotate([-10, -24, 0]);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();
  const sphere = { type: "Sphere" };
  let countries = null, raf = null, t0 = performance.now();

  function draw(now) {
    const t = (now - t0) / 1000;
    if (!reduce) projection.rotate([-10 + t * 7, -22 + Math.sin(t * 0.25) * 7, 0]);
    ctx.clearRect(0, 0, SIZE, SIZE);

    // ocean / sphere — off-white
    ctx.beginPath(); path(sphere); ctx.fillStyle = "#f3eee3"; ctx.fill();
    // subtle shading for dimensionality
    const g = ctx.createRadialGradient(74, 66, 10, 100, 100, 130);
    g.addColorStop(0, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(120,108,86,0.16)");
    ctx.beginPath(); path(sphere); ctx.fillStyle = g; ctx.fill();
    // graticule
    ctx.beginPath(); path(graticule); ctx.strokeStyle = "rgba(120,110,92,0.16)"; ctx.lineWidth = 0.5; ctx.stroke();

    if (countries) {
      const acc = accent();
      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 3.4));
      for (const f of countries) {
        const id = +f.id;
        ctx.beginPath(); path(f);
        if (id === HERE) { ctx.globalAlpha = pulse; ctx.fillStyle = acc; ctx.fill(); ctx.globalAlpha = 1; }
        else if (LIVED.has(id)) { ctx.fillStyle = acc; ctx.fill(); }
        else if (VISITED.has(id)) { ctx.fillStyle = "#9a9286"; ctx.fill(); }
        else { ctx.fillStyle = "#dcd3c2"; ctx.fill(); }
        ctx.strokeStyle = "rgba(86,78,62,0.34)"; ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
    // disc edge
    ctx.beginPath(); path(sphere); ctx.strokeStyle = "rgba(70,62,50,0.45)"; ctx.lineWidth = 1; ctx.stroke();

    if (!reduce) raf = requestAnimationFrame(draw);
  }

  d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
    .then(topo => {
      countries = topojson.feature(topo, topo.objects.countries).features;
      if (reduce) draw(performance.now());
      else raf = requestAnimationFrame(draw);
    })
    .catch(err => {
      console.warn("globe data failed", err);
      canvas.closest(".globe-wrap")?.classList.add("globe-failed");
    });

  // pause when off-screen (battery)
  if (!reduce && "IntersectionObserver" in window) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !raf && countries) { t0 = performance.now(); raf = requestAnimationFrame(draw); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }), { threshold: 0 }).observe(canvas);
  }
})();
