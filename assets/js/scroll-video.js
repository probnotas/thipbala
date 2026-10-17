/* =====================================================================
   SCROLL VIDEO — scrubs a JPEG frame sequence from scroll position.

   Two ideas do the heavy lifting:

   1. PROGRESSIVE LOADING. Frames arrive in passes of increasing density
      (every 16th, then 8th, 4th, 2nd, all). The sequence is scrubbable
      from the first pass, so nothing blocks on the full payload; it just
      sharpens in time as the rest lands.

   2. SUB-FRAME BLENDING. The renderer cross-fades between the two nearest
      LOADED frames using the fractional part of the frame index. Motion is
      therefore continuous rather than quantised to the file count — the
      perceived smoothness is decoupled from how many JPEGs exist, which is
      what keeps the payload sane.
   ===================================================================== */

(function () {
  "use strict";

  const M = window.FRAME_MANIFEST;

  // DPR is capped at 2 to match the canvas backing store, so a 3x phone
  // does not get pushed onto the heavy desktop set for no visible gain.
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

  function pickSet() {
    const w = window.innerWidth * DPR();
    return M.sets.find(s => w <= s.maxViewport) || M.sets[M.sets.length - 1];
  }

  class ScrollVideo {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: false });
      this.count = M.count;
      this.set = pickSet();
      this.images = new Array(this.count);
      this.loaded = new Uint8Array(this.count);
      this.loadedCount = 0;
      // Fraction of the sequence that must land before scrubbing can start;
      // the loading bar is scaled against this, not against the full set.
      this.readyAt = Math.ceil(this.count / 16) / this.count;
      this.index = 0;           // fractional frame position
      this.dirty = true;
      this.onProgress = opts.onProgress || function () {};
      this.onReady = opts.onReady || function () {};
      this.ready = false;
      this._raf = null;
      this._resize = this._resize.bind(this);
      this._tick = this._tick.bind(this);
      window.addEventListener("resize", this._resize, { passive: true });
      this._resize();
    }

    /* ---- loading ---------------------------------------------------- */

    load() {
      // Pass strides, coarse to fine. First pass also pins the last frame,
      // since that is the one the star chart has to dissolve out of.
      const strides = [16, 8, 4, 2, 1];
      this._queue = [];
      const seen = new Set();
      for (const stride of strides) {
        for (let i = 0; i < this.count; i += stride) {
          if (!seen.has(i)) { seen.add(i); this._queue.push(i); }
        }
      }
      // The last frame is the dissolve target for the star chart, so it
      // jumps the queue regardless of which pass would have caught it.
      const last = this.count - 1;
      const at = this._queue.indexOf(last);
      if (at !== -1) this._queue.splice(at, 1);
      this._queue.unshift(last);

      // Modest concurrency: enough to saturate a connection, not so much
      // that the first (coarse) pass gets starved behind later ones.
      const CONC = 6;
      this._cursor = 0;
      for (let i = 0; i < CONC; i++) this._pump();
    }

    _pump() {
      if (this._cursor >= this._queue.length) return;
      const idx = this._queue[this._cursor++];
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (img.naturalWidth) {
          if (!this.iw) { this.iw = img.naturalWidth; this.ih = img.naturalHeight; }
          this.images[idx] = img;
          this.loaded[idx] = 1;
          this.loadedCount++;
          this.dirty = true;
          this.onProgress(this.loadedCount / this.count);
          // Usable as soon as the coarse pass plus the final frame are in.
          if (!this.ready && this.loadedCount >= this.readyAt * this.count) {
            this.ready = true;
            this.onReady();
          }
        }
        this._pump();
      };
      img.src = M.path(this.set.name, idx);
    }

    /* ---- rendering -------------------------------------------------- */

    // Nearest loaded frame at or before i, and at or after i.
    _bracket(i) {
      let lo = Math.floor(i), hi = Math.ceil(i);
      while (lo >= 0 && !this.loaded[lo]) lo--;
      while (hi < this.count && !this.loaded[hi]) hi++;
      if (lo < 0) lo = hi;
      if (hi >= this.count) hi = lo;
      return [lo, hi];
    }

    seek(frac) {
      const i = Math.max(0, Math.min(1, frac)) * (this.count - 1);
      if (i !== this.index) { this.index = i; this.dirty = true; }
      this._schedule();
    }

    _schedule() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(this._tick);
    }

    _tick() {
      this._raf = null;
      if (!this.dirty) return;
      this.dirty = false;
      this._draw();
    }

    _draw() {
      const [lo, hi] = this._bracket(this.index);
      const a = this.images[lo];
      if (!a) return;
      const ctx = this.ctx;
      this._cover(ctx, a, 1);
      if (hi !== lo && this.images[hi]) {
        // Fractional position between the two loaded neighbours.
        const t = (this.index - lo) / (hi - lo);
        if (t > 0.001) this._cover(ctx, this.images[hi], t);
      }
    }

    // Where the frame is actually painted, in CSS px. Overlays anchored to
    // frame content (the greeting) need this to survive the `cover` crop.
    frameRect() {
      if (!this.iw) return null;
      const cw = this.canvas.width, ch = this.canvas.height, dpr = DPR();
      const s = Math.max(cw / this.iw, ch / this.ih);
      const w = this.iw * s, h = this.ih * s;
      return { x: (cw - w) / 2 / dpr, y: (ch - h) / 2 / dpr, w: w / dpr, h: h / dpr };
    }

    // Draw img as a background-size:cover fill at the given alpha.
    _cover(ctx, img, alpha) {
      const cw = this.canvas.width, ch = this.canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      ctx.globalAlpha = 1;
    }

    _resize() {
      const dpr = DPR();
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (this.canvas.width === w && this.canvas.height === h) return;
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx.fillStyle = "#050505";
      this.ctx.fillRect(0, 0, w, h);
      // A wider viewport may cross into the larger frame set.
      const next = pickSet();
      if (next.name !== this.set.name && this.loadedCount === 0) this.set = next;
      this.dirty = true;
      this._schedule();
    }

    destroy() {
      window.removeEventListener("resize", this._resize);
      if (this._raf) cancelAnimationFrame(this._raf);
    }
  }

  window.ScrollVideo = ScrollVideo;
})();
