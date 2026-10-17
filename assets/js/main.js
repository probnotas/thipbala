/* =====================================================================
   MAIN — drives the approach and hands off to the star chart.

   The handoff: the intro clip's final frame IS the star chart, so the
   live SVG is cross-dissolved in over the last stretch of scroll. By the
   time the canvas reaches its final frame the chart is fully opaque on
   top of it, and the swap is invisible.
   ===================================================================== */

(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const root = document.documentElement;
  // Grain strength: full over the clip, easing down to a lighter dusting once
  // the chart has landed rather than clearing entirely, so the texture stays
  // continuous across the handoff. GRAIN must match --grain in site.css.
  const GRAIN = 0.5;
  const GRAIN_CHART = 0.35;

  // The window-anchored greeting is parked, not deleted: flip this to true
  // to bring it back. NOTE: window-track.js was measured against the
  // PREVIOUS clip — re-run tools/track-window.py before re-enabling, or
  // the text will not sit on the window.
  const SHOW_GREETING = false;

  const approach = document.getElementById("approach");
  const canvas   = document.getElementById("frames");
  const loader   = document.getElementById("loader");
  const bar      = loader.querySelector(".bar i");
  const cue      = document.getElementById("cue");
  const greeting = document.getElementById("greeting");
  const stage    = document.getElementById("chart-stage");
  const footer   = document.getElementById("footer");
  const hint     = document.getElementById("hint");

  // Where in the scroll track the chart begins and finishes dissolving in.
  const FADE_START = 0.88, FADE_END = 0.99;

  /* ---- footer links from data.js ----
     A link with no destination is removed rather than rendered as a dead
     "#" — better an absent Résumé than one that goes nowhere. Fill the
     entry in LINKS and it comes back. */
  document.querySelectorAll("[data-link]").forEach(a => {
    const href = (window.LINKS || {})[a.dataset.link];
    if (href && href !== "#") a.href = href;
    else a.remove();
  });

  /* The count comes from the data, so adding or removing an experience can
     never leave the copy claiming the wrong number. "Hover" is also wrong
     on a touch device, where the chart pans instead. */
  const WORDS = ["zero","one","two","three","four","five","six","seven","eight",
                 "nine","ten","eleven","twelve","thirteen","fourteen","fifteen",
                 "sixteen","seventeen","eighteen","nineteen","twenty"];
  const n = (window.NODES || []).length;
  const count = WORDS[n] || String(n);
  const lead = count.charAt(0).toUpperCase() + count.slice(1);
  hint.textContent = window.matchMedia("(hover:none)").matches
    ? `${lead} of these stars are his. Swipe to explore, tap one.`
    : `${lead} of these stars are his. Hover one.`;

  /* ---- build the chart up front; it is just invisible until needed ---- */
  const chart = new window.StarChart(document);
  chart.revealInstant();

  /* ---- match the chart to the clip's final frame ---------------------
     The clip ends on a shot of this very chart, but the canvas paints
     frames `cover` — so on anything but ~16:9 the last frame is cropped
     and zoomed while a `meet`-fitted SVG would sit letterboxed and
     smaller. Cross-fading between those two reads as a jump.

     So the chart is sized from the frame's own rendered rect instead of
     the viewport: it lands wherever the final frame puts it, at any
     aspect ratio. The rect below was measured off frame 600 by detecting
     the ruler's tick lines (see tools/README-tracking.md). The clip
     stretches the chart ~1.7% off true aspect; rather than distort the
     star field to match, the difference is split, leaving both axes
     within 0.9% of the filmed framing at exactly the right aspect.
     -------------------------------------------------------------------- */
  const CHART_IN_FRAME = { w: 0.9780, h: 0.9307 };
  const svgEl = document.getElementById("chart");

  // Declared here, assigned further down: the reduced-motion path never
  // builds one, and calls placeChart() before that point.
  let video = null;

  // Portrait phones pan the chart, so overflow there is wanted, not a bug.
  const PANS = window.matchMedia("(max-width:720px) and (orientation:portrait)");

  function placeChart() {
    const r = video && video.frameRect();
    if (!r) return;                      // no frame yet: CSS default applies

    let w = CHART_IN_FRAME.w * r.w;
    let h = CHART_IN_FRAME.h * r.h;

    /* Safety net. Matching the clip means the chart is wider than the
       viewport on anything narrower than ~16:9, which is fine for the
       ruler but not for the nodes — an outer node can land past the edge
       and simply be unreachable. If that would happen, shrink the chart
       (keeping aspect) just enough to bring every node back on screen.
       At 16:9 this never engages, so the filmed framing is untouched. */
    const ext = chart.nodeExtent;
    if (ext && !PANS.matches) {
      const EDGE = 10;                   // px of breathing room
      const kx = ext.x > 0 ? (window.innerWidth  / 2 - EDGE) / (ext.x * w) : 1;
      const ky = ext.y > 0 ? (window.innerHeight / 2 - EDGE) / (ext.y * h) : 1;
      const k = Math.min(1, kx, ky);
      if (k < 1) { w *= k; h *= k; }
    }

    svgEl.style.width  = w + "px";
    svgEl.style.height = h + "px";
  }

  // On phones the chart is wider than the viewport and pans horizontally
  // (see site.css). Open it centred, which is the framing the clip's final
  // frame already shows.
  function overflow() { return stage.scrollWidth - stage.clientWidth; }

  function centrePan() {
    const over = overflow();
    if (over > 0) stage.scrollLeft = over / 2;
    updateEdges();
  }

  // Fade the edge the chart continues past, so it reads as pannable.
  function updateEdges() {
    const over = overflow();
    stage.classList.toggle("can-l", over > 0 && stage.scrollLeft > 4);
    stage.classList.toggle("can-r", over > 0 && stage.scrollLeft < over - 4);
  }

  /* ---- drag / swipe to pan ------------------------------------------
     Pointer events rather than native overflow scrolling, so touch and
     mouse behave identically and the gesture is ours to tune. A drag past
     the slop threshold swallows the click that follows it, otherwise
     panning off a node would also open that node's card.
     ------------------------------------------------------------------ */
  function initPan() {
    // MAX_V caps a flick at ~2.2 px/ms (a fast but human swipe), so an
    // unusually quick gesture cannot fling the chart end to end.
    const SLOP = 6, FRICTION = 0.94, MIN_V = 0.015, MAX_V = 2.2;
    let down = false, moved = false;
    let startX = 0, startLeft = 0, lastX = 0, lastT = 0, vel = 0, glideRaf = 0;

    const clamp = v => Math.max(0, Math.min(v, overflow()));

    stage.addEventListener("pointerdown", e => {
      if (overflow() <= 0) return;
      down = true; moved = false;
      startX = lastX = e.clientX;
      startLeft = stage.scrollLeft;
      lastT = performance.now();
      vel = 0;
      cancelAnimationFrame(glideRaf);
    });

    stage.addEventListener("pointermove", e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > SLOP) {
        moved = true;
        // Take the pointer only once it is clearly a pan, so a plain tap
        // still reaches the node underneath.
        try { stage.setPointerCapture(e.pointerId); } catch (err) {}
        chart.hideCard();
      }
      if (!moved) return;
      stage.scrollLeft = clamp(startLeft - dx);
      const now = performance.now(), dt = now - lastT;
      if (dt > 0) {
        const v = (e.clientX - lastX) / dt;
        vel = Math.max(-MAX_V, Math.min(MAX_V, v));
      }
      lastX = e.clientX; lastT = now;
      updateEdges();
      e.preventDefault();
    });

    function release(e) {
      if (!down) return;
      down = false;
      try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
      if (moved) glide();
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);

    function glide() {
      vel *= FRICTION;
      if (Math.abs(vel) < MIN_V) { updateEdges(); return; }
      const next = clamp(stage.scrollLeft - vel * 16);
      if (next === stage.scrollLeft) { updateEdges(); return; }   // hit an end
      stage.scrollLeft = next;
      updateEdges();
      glideRaf = requestAnimationFrame(glide);
    }

    // Capture phase: kill the synthetic click that ends a drag.
    stage.addEventListener("click", e => {
      if (!moved) return;
      e.stopPropagation();
      e.preventDefault();
      moved = false;
    }, true);

    stage.addEventListener("scroll", updateEdges, { passive: true });
  }
  initPan();

  let handedOver = false;
  function setHandover(on) {
    if (on === handedOver) return;
    handedOver = on;
    stage.classList.toggle("live", on);
    footer.classList.toggle("on", on);
    hint.classList.toggle("on", on);
    if (on) { placeChart(); centrePan(); } else chart.hideCard();
  }

  /* ---- reduced motion: skip the approach entirely ---- */
  if (reduce) {
    approach.style.setProperty("--track", "100svh");
    root.style.setProperty("--grain", String(GRAIN_CHART));
    greeting.classList.add("off");
    loader.classList.add("gone");
    cue.style.opacity = 0;
    stage.style.opacity = 1;
    stage.classList.add("on");
    setHandover(true);
    requestAnimationFrame(centrePan);
    return;
  }

  /* ---- greeting ------------------------------------------------------
     The text lives on the window plane, so it is positioned and sized
     from the tracked opening rather than from the viewport: both its
     centre and its width are fractions of the RENDERED frame, which is
     what keeps it welded to the window through the `cover` crop at any
     aspect ratio. Width is converted to a font-size via the type's own
     measured width, so it holds regardless of which face is loaded.
     -------------------------------------------------------------------- */
  const TRACK = window.WINDOW_TRACK;
  let natWidth = 0;                       // text width at font-size 100px

  function measureGreeting() {
    greeting.style.fontSize = "100px";
    greeting.style.opacity = "0";
    natWidth = greeting.getBoundingClientRect().width;
  }

  function placeGreeting(frame) {
    if (!SHOW_GREETING || !natWidth) return;
    const r = video.frameRect();
    if (!r) return;

    const w = TRACK.width(frame);
    const target = TRACK.fill * w * r.w;              // desired text width, px

    greeting.style.fontSize = (100 * target / natWidth) + "px";
    greeting.style.left = (r.x + TRACK.cx(frame) * r.w) + "px";
    greeting.style.top  = (r.y + TRACK.cy(frame) * r.h) + "px";

    const f = (w - TRACK.fadeFrom) / (TRACK.fadeTo - TRACK.fadeFrom);
    greeting.style.opacity = String(Math.max(0, Math.min(1, 1 - f)));
  }

  /* ---- the scroll-scrubbed sequence ---- */
  /* ---- loading screen -------------------------------------------------
     The bar tracks progress toward being able to START, not toward the
     whole sequence — scrubbing begins after the first coarse pass, about
     6% of the payload, and a bar that crept to 6% and then vanished would
     read as broken. Two things gate the start: enough frames, and a
     minimum on-screen time that lets the words finish arriving. Progress
     is the lesser of the two, so the bar lands on 100% exactly as the
     screen lifts.
     -------------------------------------------------------------------- */
  const MIN_LOADER_MS = 2000;          // covers the staggered word reveal
  const started = performance.now();
  let dismissed = false;
  let loadFrac = 0;

  function loaderProgress() {
    const byTime = (performance.now() - started) / MIN_LOADER_MS;
    return Math.max(0, Math.min(1, Math.min(loadFrac, byTime)));
  }

  function tickLoader() {
    if (loader.classList.contains("gone")) return;
    bar.style.width = (loaderProgress() * 100).toFixed(1) + "%";
    requestAnimationFrame(tickLoader);
  }
  requestAnimationFrame(tickLoader);

  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;
    const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - started));
    setTimeout(() => {
      bar.style.width = "100%";
      loader.classList.add("gone");
      update();
    }, wait);
  }

  video = new window.ScrollVideo(canvas, {
    onProgress(p) { loadFrac = Math.min(1, p / video.readyAt); },
    onReady() { dismissLoader(); }
  });
  video.load();
  setTimeout(dismissLoader, 8000);          // safety net: never strand anyone

  // The greeting is sized from its own rendered width, so it must be
  // measured in the real face — not the fallback — or it jumps on swap.
  if (SHOW_GREETING) {
    if (TRACK && TRACK.stale) {
      console.warn("[greeting] window-track.js was measured against a " +
                   "previous clip — re-run tools/track-window.py or the " +
                   "text will not sit on the window.");
    }
    measureGreeting();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measureGreeting(); update(); });
    }
  } else {
    greeting.classList.add("off");
  }

  // rAF-coalesced scroll. The pending id is tracked rather than a boolean
  // latch: a browser that drops the callback (backgrounded tab, hidden
  // pane) would otherwise leave the latch stuck and kill scrolling for the
  // rest of the session. visibilitychange clears it and resyncs.
  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; update(); });
  }
  document.addEventListener("visibilitychange", () => {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    update();
  });

  function update() {
    const rect = approach.getBoundingClientRect();
    const total = approach.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;

    video.seek(p);
    placeChart();
    placeGreeting(p * (window.FRAME_MANIFEST.count - 1));

    // Chart dissolves in over the tail of the approach.
    const f = Math.max(0, Math.min(1, (p - FADE_START) / (FADE_END - FADE_START)));
    stage.style.opacity = f;
    // Eases from the clip's grain to the chart's lighter one across the
    // same dissolve, so there is no step at the moment of the swap.
    root.style.setProperty("--grain",
      (GRAIN + (GRAIN_CHART - GRAIN) * f).toFixed(3));
    stage.classList.toggle("on", f > 0);
    setHandover(f >= 1);

    cue.style.opacity = p > 0.02 ? 0 : 1;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // The browser may restore a scroll offset on reload.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  update();
})();
