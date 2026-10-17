/* =====================================================================
   STAR CHART — the interactive homepage surface.

   Everything except the faint field stars is real geometry: an
   equirectangular projection of epoch-J2000 RA/Dec. The fifteen nodes sit
   on fifteen of the Apollo navigation stars. Field stars are seeded, so
   the chart is byte-identical on every load and matches the intro video's
   final frame.
   ===================================================================== */

(function () {
  "use strict";

  const W = 1200, H = 640, M = 32;      // canvas + ruler band
  const DEC_MAX = 72, DEC_MIN = -72;    // visible declination window

  const x = ra  => M + (ra / 24) * (W - 2 * M);
  const y = dec => M + ((DEC_MAX - dec) / (DEC_MAX - DEC_MIN)) * (H - 2 * M);

  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a = {}) => {
    const n = document.createElementNS(NS, t);
    for (const k in a) n.setAttribute(k, a[k]);
    return n;
  };

  // Deterministic PRNG — field stars identical on every load.
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const RING = { 1: 12, 2: 10, 3: 8.5 };
  const CORE = { 1: 3.4, 2: 2.8, 3: 2.4 };
  const MESH = { K: 3, MAXD: 165, LONG: 26 };
  const STORE = "sc.visited";

  function StarChart(root) {
    const svg  = root.querySelector("#chart");
    const card = root.querySelector("#card");
    const hint = root.querySelector("#hint");
    const rnd  = mulberry32(0x5A17);

    const CAT = window.CAT, FIGURES = window.FIGURES, NODES = window.NODES;
    const S = Object.fromEntries(CAT.map(s => [s[0], { ra: s[1], dec: s[2], mag: s[3] }]));
    const ALL_PTS = [];
    const g = id => root.querySelector("#" + id);

    /* ---- 1. ruler frame + ticks ---- */
    (function frame() {
      const t = g("g-frame");
      t.appendChild(el("rect", { x: M, y: M, width: W - 2 * M, height: H - 2 * M, class: "rule" }));
      t.appendChild(el("rect", { x: M - 11, y: M - 11, width: W - 2 * M + 22, height: H - 2 * M + 22, class: "rule", opacity: ".5" }));
      for (let i = 0; i <= 144; i++) {                       // RA: 10-minute ticks
        const px = x(i / 6), maj = i % 6 === 0, len = maj ? 9 : 5;
        t.appendChild(el("line", { x1: px, y1: M, x2: px, y2: M - len, class: "tick" + (maj ? " major" : "") }));
        t.appendChild(el("line", { x1: px, y1: H - M, x2: px, y2: H - M + len, class: "tick" + (maj ? " major" : "") }));
      }
      for (let d = DEC_MIN; d <= DEC_MAX; d += 2) {          // Dec: 2-degree ticks
        const py = y(d), maj = d % 10 === 0, len = maj ? 9 : 5;
        t.appendChild(el("line", { x1: M, y1: py, x2: M - len, y2: py, class: "tick" + (maj ? " major" : "") }));
        t.appendChild(el("line", { x1: W - M, y1: py, x2: W - M + len, y2: py, class: "tick" + (maj ? " major" : "") }));
      }
    })();

    /* ---- 2. quadrant cross + ecliptic ---- */
    (function axes() {
      const t = g("g-axes");
      t.appendChild(el("line", { x1: W / 2, y1: M, x2: W / 2, y2: H - M, class: "axis" }));
      t.appendChild(el("line", { x1: M, y1: H / 2, x2: W - M, y2: H / 2, class: "axis" }));
      // True ecliptic in equatorial coordinates — the bow comes for free.
      const e = 23.439 * Math.PI / 180, segs = [[]];
      for (let L = 0; L <= 360; L += 1) {
        const l = L * Math.PI / 180;
        const dec = Math.asin(Math.sin(e) * Math.sin(l)) * 180 / Math.PI;
        let ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) * 12 / Math.PI;
        if (ra < 0) ra += 24;
        const cur = segs[segs.length - 1], prev = cur[cur.length - 1];
        if (prev && Math.abs(ra - prev[0]) > 12) segs.push([[ra, dec]]); else cur.push([ra, dec]);
      }
      segs.forEach(s => {
        if (s.length < 2) return;
        t.appendChild(el("path", {
          d: "M" + s.map(p => x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1)).join(" L "),
          class: "ecliptic"
        }));
      });
    })();

    /* ---- 3. constellation figures ---- */
    (function figures() {
      const t = g("g-lines");
      FIGURES.forEach(([a, b]) => {
        const A = S[a], B = S[b];
        if (!A || !B) return;
        if (Math.abs(A.ra - B.ra) > 12) return;               // don't draw across the seam
        if (A.dec > DEC_MAX || A.dec < DEC_MIN || B.dec > DEC_MAX || B.dec < DEC_MIN) return;
        t.appendChild(el("line", { x1: x(A.ra), y1: y(A.dec), x2: x(B.ra), y2: y(B.dec), class: "constline" }));
      });
    })();

    /* ---- 4. seeded field stars ---- */
    (function field() {
      const t = g("g-field"), pad = M + 6;
      for (let i = 0; i < 220; i++) {
        const px = pad + rnd() * (W - 2 * pad), py = pad + rnd() * (H - 2 * pad);
        const r = 0.5 + rnd() * rnd() * 2.0;                  // biased small
        t.appendChild(el("circle", {
          cx: px.toFixed(1), cy: py.toFixed(1), r: r.toFixed(2),
          class: "fieldstar", opacity: (0.22 + rnd() * 0.62).toFixed(2)
        }));
        ALL_PTS.push([px, py]);
      }
    })();

    /* ---- 5. catalogue stars, sized by real magnitude ---- */
    const nodeStars = new Set(NODES.map(n => n.star));
    (function cat() {
      const t = g("g-cat");
      CAT.forEach(([name, ra, dec, mag]) => {
        if (dec > DEC_MAX || dec < DEC_MIN) return;
        ALL_PTS.push([x(ra), y(dec)]);                        // node stars join the mesh too
        if (nodeStars.has(name)) return;                      // but are drawn in layer 6
        t.appendChild(el("circle", {
          cx: x(ra).toFixed(1), cy: y(dec).toFixed(1),
          r: Math.max(1.0, 2.9 - mag * 0.55).toFixed(2),
          class: "catstar", opacity: (0.95 - mag * 0.09).toFixed(2)
        }));
      });
    })();

    /* ---- 5b. proximity mesh ----------------------------------------
       Not astronomy: a k-nearest-neighbour graph over every drawn star.
       It supplies the field-of-connections texture; real asterisms sit on
       top at higher opacity so the actual figures still read.
       ---------------------------------------------------------------- */
    (function mesh() {
      const t = g("g-net"), seen = new Set(), edges = [];
      const key = (a, b) => a < b ? a + ":" + b : b + ":" + a;
      ALL_PTS.forEach((p, i) => {
        const near = [];
        ALL_PTS.forEach((q, j) => {
          if (i === j) return;
          const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
          if (d < MESH.MAXD) near.push([d, j]);
        });
        near.sort((a, b) => a[0] - b[0]);
        near.slice(0, MESH.K).forEach(([, j]) => {
          const k = key(i, j);
          if (seen.has(k)) return;
          seen.add(k); edges.push([i, j]);
        });
      });
      for (let n = 0; n < MESH.LONG; n++) {                   // a few long spans for scale
        const i = Math.floor(rnd() * ALL_PTS.length), j = Math.floor(rnd() * ALL_PTS.length);
        if (i === j) continue;
        const k = key(i, j);
        if (seen.has(k)) continue;
        seen.add(k); edges.push([i, j]);
      }
      edges.forEach(([i, j]) => {
        const a = ALL_PTS[i], b = ALL_PTS[j];
        t.appendChild(el("line", {
          x1: a[0].toFixed(1), y1: a[1].toFixed(1),
          x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: "netline"
        }));
      });
    })();

    /* ---- 6. the fifteen ---- */
    let visited;
    try { visited = new Set(JSON.parse(localStorage.getItem(STORE) || "[]")); }
    catch (e) { visited = new Set(); }

    (function nodes() {
      const t = g("g-nodes");
      // Tab order is chronological, not spatial.
      const order = [...NODES].sort((a, b) => a.year.localeCompare(b.year));
      NODES.forEach(n => {
        const s = S[n.star], px = x(s.ra), py = y(s.dec);
        const a = el("a", {
          class: "node", "data-star": n.star, tabindex: order.indexOf(n) + 1,
          role: "button", "aria-label": n.title
        });
        const grp = el("g", { class: "grp" });
        grp.appendChild(el("circle", { cx: px, cy: py, r: RING[n.w] + 7, class: "halo" }));
        grp.appendChild(el("circle", { cx: px, cy: py, r: RING[n.w], class: "ring" }));
        grp.appendChild(el("circle", { cx: px, cy: py, r: CORE[n.w], class: "core" }));
        a.appendChild(grp);
        a.appendChild(el("circle", { cx: px, cy: py, r: 24, class: "hit" }));
        if (visited.has(n.star)) a.classList.add("visited");
        a._n = n; a._p = { px, py };
        t.appendChild(a);
      });
    })();

    /* How far the outermost node sits from the chart's centre, as a
       fraction of the chart, including its hit radius. main.js uses this
       to guarantee the video-matched framing never crops a node off the
       screen — real content put one on Fomalhaut, which landed outside
       the viewport entirely at 4:3. */
    (function extent() {
      let ex = 0, ey = 0;
      NODES.forEach(n => {
        const s = S[n.star];
        if (!s) return;
        ex = Math.max(ex, Math.abs(x(s.ra) / W - 0.5) + 24 / W);
        ey = Math.max(ey, Math.abs(y(s.dec) / H - 0.5) + 24 / H);
      });
      this.nodeExtent = { x: ex, y: ey };
    }).call(this);

    /* ---- 7. card ---- */
    let open = null;

    // Real entries have real gaps — an experience with no write-up yet, a
    // year that was never pinned down. Every block below collapses rather
    // than rendering an empty shell.
    function fill(n) {
      card.querySelector(".sid").textContent = n.star.toUpperCase();
      card.querySelector("h2").textContent = n.title;

      const desc = card.querySelector(".desc");
      desc.textContent = n.desc || "";
      desc.hidden = !n.desc;

      const thumb = card.querySelector(".thumb");
      thumb.style.backgroundImage = n.thumb ? `url("${n.thumb}")` : "";
      thumb.classList.toggle("has-img", !!n.thumb);

      const meta = card.querySelector(".meta");
      meta.textContent = "";
      [n.role, ...(n.tags || [])].filter(Boolean).forEach(txt => {
        const s = document.createElement("span");
        s.className = "pill"; s.textContent = txt;
        meta.appendChild(s);
      });
      if (n.year) {
        const yr = document.createElement("span");
        yr.className = "yr"; yr.textContent = n.year;
        meta.appendChild(yr);
      }
      meta.hidden = !meta.childElementCount;

      const ul = card.querySelector("ul");
      ul.textContent = "";
      (n.pts || []).forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        ul.appendChild(li);
      });
      ul.hidden = !ul.childElementCount;

      // "Read more" opens the full write-up; the outbound link lives in
      // there rather than on the card, so the card has one clear action.
      // Entries with nothing written yet simply do not offer it.
      const more = card.querySelector(".more");
      more.hidden = !(n.story && n.story.length);
    }

    // Pure geometry: flip side by node position, clamp vertically to viewport.
    function place(node) {
      if (window.innerWidth <= 720) return;                   // bottom sheet handles itself
      const b = svg.getBoundingClientRect();
      const s = Math.min(b.width / W, b.height / H);
      const ox = b.left + (b.width - W * s) / 2;
      const oy = b.top + (b.height - H * s) / 2;
      const cx = ox + node._p.px * s, cy = oy + node._p.py * s;
      const cw = card.offsetWidth || 296, ch = card.offsetHeight || 320, gap = 22;

      let left = cx + gap;
      if (left + cw > window.innerWidth - 16) left = cx - gap - cw;
      left = Math.max(16, Math.min(left, window.innerWidth - cw - 16));

      let top = cy - ch / 2;
      top = Math.max(16, Math.min(top, window.innerHeight - ch - 16));

      // The card carries the same --jx/--jy transform as the chart, and the
      // rect above was measured AFTER that transform — so remove it here or
      // the drift lands twice and the card creeps away from its node.
      const d = window.PointerDrift;
      if (d) { left -= d.x; top -= d.y; }

      card.style.left = left + "px";
      card.style.top = top + "px";
    }

    function show(node) {
      if (open && open !== node) open.classList.remove("open");
      open = node;
      node.classList.add("open");
      fill(node._n);
      card.classList.add("on");
      place(node);
      if (hint) hint.style.opacity = 0;
    }

    function hide() {
      card.classList.remove("on");
      if (open) { open.classList.remove("open"); open = null; }
    }

    function markVisited(node) {
      node.classList.add("visited");
      visited.add(node._n.star);
      try { localStorage.setItem(STORE, JSON.stringify([...visited])); } catch (e) {}
    }

    const touch = window.matchMedia("(hover:none)").matches;
    root.querySelectorAll(".node").forEach(node => {
      if (!touch) {
        node.addEventListener("mouseenter", () => {
          if (window.StoryModal && window.StoryModal.isOpen()) return;
          show(node);
        });
        node.addEventListener("mouseleave", e => {
          if (card.contains(e.relatedTarget)) return;
          setTimeout(() => { if (!card.matches(":hover")) hide(); }, 60);
        });
      }
      node.addEventListener("focus", () => show(node));
      node.addEventListener("click", e => {
        e.preventDefault();
        markVisited(node);
        if (open === node && touch) hide(); else show(node);
      });
      node.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault(); markVisited(node); show(node);
        }
      });
    });

    card.querySelector(".more").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      if (open && window.StoryModal) window.StoryModal.show(open._n);
    });

    card.addEventListener("mouseleave", () => {
      // Not while the modal is up: the pointer has legitimately left the
      // card, but closing it would drop the node the modal belongs to.
      if (touch) return;
      if (window.StoryModal && window.StoryModal.isOpen()) return;
      hide();
    });
    document.addEventListener("click", e => {
      if (window.StoryModal && window.StoryModal.isOpen()) return;
      if (e.target.closest("#story")) return;
      if (!e.target.closest(".node") && !e.target.closest("#card")) hide();
    });
    document.addEventListener("keydown", e => {
      // Escape closes the modal first, then the card.
      if (e.key === "Escape" && !(window.StoryModal && window.StoryModal.isOpen())) hide();
      // Clean frame for video export.
      if (e.key === "f" || e.key === "F") document.body.classList.toggle("framed");
    });
    window.addEventListener("resize", () => { if (open) place(open); }, { passive: true });

    /* ---- 8. one load sequence, then never again ---- */
    this.reveal = function () {
      const layers = ["g-frame", "g-axes", "g-net", "g-lines", "g-field", "g-cat", "g-nodes"]
        .map(g).filter(Boolean);
      const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
      layers.forEach((l, i) => {
        if (reduce) { l.classList.add("in"); return; }
        setTimeout(() => l.classList.add("in"), 120 + i * 160);
      });
    };

    // The chart arrives out of a dissolve, so layers are already visible.
    this.revealInstant = function () {
      ["g-frame", "g-axes", "g-net", "g-lines", "g-field", "g-cat", "g-nodes"]
        .map(g).filter(Boolean).forEach(l => l.classList.add("in"));
    };

    this.hideCard = hide;
  }

  window.StarChart = StarChart;
})();
