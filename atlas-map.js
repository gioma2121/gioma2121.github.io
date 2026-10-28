/* =========================================================================
   Atlas map: Europe in focus + a small world map for the rest.
   visited = grey · lived-in = accent · Kosovo has no ISO numeric id, matched by name
   ========================================================================= */
(function () {
  "use strict";
  const host = document.getElementById("atlas-map");
  if (!host || typeof d3 === "undefined" || typeof topojson === "undefined") return;

  const VISITED = new Set([818,792,40,56,100,191,233,246,276,300,348,380,428,440,499,528,578,616,620,674,703,724,826,336,762,860,417,784]);
  const VISITED_NAMES = new Set(["Kosovo"]);
  const LIVED = new Set([380, 440, 528]);
  const CITIES = [
    { n: "Rome", c: [12.5, 41.9], dx: -8, dy: 4, a: "end" },
    { n: "Vilnius", c: [25.28, 54.69], dx: 8, dy: 4, a: "start" },
    { n: "Eindhoven", c: [5.48, 51.44], dx: -8, dy: -6, a: "end", now: true },
  ];
  const EU_BOX = { type: "MultiPoint", coordinates: [[-11, 35], [42, 35], [-11, 70], [42, 70], [15, 35], [15, 70], [-11, 52], [42, 52]] };

  function cls(f) {
    const id = +f.id, name = f.properties && f.properties.name;
    if (LIVED.has(id)) return "m-c lived";
    if (VISITED.has(id) || VISITED_NAMES.has(name)) return "m-c visited";
    return "m-c";
  }

  d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json").then(topo => {
    const features = topojson.feature(topo, topo.objects.countries).features;
    const W = 600, H = 520;

    // ---- Europe
    const eu = d3.select("#map-europe").attr("viewBox", `0 0 ${W} ${H}`);
    const proj = d3.geoConicConformal().rotate([-15, 0]).parallels([38, 62]).fitExtent([[6, 6], [W - 6, H - 6]], EU_BOX);
    const path = d3.geoPath(proj);
    eu.append("g").selectAll("path").data(features).join("path").attr("class", cls).attr("d", path)
      .append("title").text(f => f.properties.name);
    const pins = eu.append("g");
    CITIES.forEach(ci => {
      const [x, y] = proj(ci.c);
      pins.append("circle").attr("class", "m-pin" + (ci.now ? " now" : "")).attr("cx", x).attr("cy", y).attr("r", ci.now ? 5 : 4);
      pins.append("text").attr("class", "m-lbl").attr("x", x + ci.dx).attr("y", y + ci.dy).attr("text-anchor", ci.a).text(ci.n);
    });

    // ---- World (small), with the Europe frame
    const wW = 600, wH = 300;
    const wd = d3.select("#map-world").attr("viewBox", `0 0 ${wW} ${wH}`);
    const wp = d3.geoNaturalEarth1().fitExtent([[2, 2], [wW - 2, wH - 2]], { type: "Sphere" });
    const wpath = d3.geoPath(wp);
    wd.append("g").selectAll("path").data(features).join("path").attr("class", cls).attr("d", wpath);
    const frame = { type: "Polygon", coordinates: [[[-11, 35], [42, 35], [42, 70], [-11, 70], [-11, 35]]] };
    wd.append("path").attr("class", "m-frame").attr("d", wpath(frame));
    host.classList.add("ready");
  }).catch(err => { console.warn("atlas map failed", err); host.classList.add("failed"); });
})();
