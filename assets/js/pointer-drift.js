/* =====================================================================
   POINTER DRIFT — the scene trails the cursor, like elastic being pulled.

   Position-driven, not velocity-driven. The cursor's offset from the
   centre of the viewport sets a TARGET, and the scene is pulled toward it
   by a critically damped spring. Move left and the scene follows left and
   stays there; move back and it eases back. It never springs past the
   target and never oscillates.

   (An earlier version drove this from pointer velocity, which gives a
   snappy kick-and-recoil. That reads as a jerk, not as elastic — velocity
   impulses are spiky by nature, and no amount of softening removes the
   fundamental snap. Position + spring is the calm version.)

   Damping is derived from stiffness rather than set by hand: a discrete
   spring is critically damped near damp = 1 - 2*sqrt(stiff). Tuning the
   two independently is how the first attempt ended up overshooting its
   target by ~30% and bouncing.

   Offsets are published as --jx / --jy on :root; each layer opts in by
   translating with them. The loading screen deliberately does NOT.

   Skipped entirely for touch (no cursor) and for reduced motion.
   ===================================================================== */

(function () {
  "use strict";

  const TUNE = {
    stiff: 0.035,   // the speed dial — lower is slower, heavier
    maxX:  14,      // px of travel at the left/right edge of the viewport
    maxY:  8,       // px at top/bottom — smaller, this effect reads L/R
    sleep: 0.01     // below this the spring is parked and the loop stops
  };

  /* Critical damping, solved rather than approximated.

     For this integrator (v' = d*(v + k*(t-x)); x' = x + v') the error
     system is [[1-dk, d], [-dk, d]], whose characteristic polynomial is
     L^2 - (1+d-dk)L + d. It is critically damped where the discriminant
     vanishes: (1+d-dk)^2 = 4d. The discriminant falls monotonically in d
     over (0,1), so a bisection nails it.

     The textbook shortcut `1 - 2*sqrt(k)` is a continuous-time result and
     is noticeably over-damped once discretised — at stiff 0.012 it settled
     in 1.0s where the exact value does it in 0.75s, for free. Solving it
     also means `stiff` can be changed on its own without reintroducing
     overshoot. */
  const DAMP = (function (k) {
    const disc = d => Math.pow(1 + d - d * k, 2) - 4 * d;
    let lo = 1e-4, hi = 1 - 1e-4;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (disc(mid) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  })(TUNE.stiff);

  function PointerDrift() {
    const root = document.documentElement;
    let x = 0, y = 0, vx = 0, vy = 0;
    let tx = 0, ty = 0;                 // target, set by cursor position
    let raf = 0;

    const api = { x: 0, y: 0, enabled: false };

    function write() {
      root.style.setProperty("--jx", x.toFixed(2) + "px");
      root.style.setProperty("--jy", y.toFixed(2) + "px");
      api.x = x; api.y = y;
    }

    function step() {
      raf = 0;
      vx = DAMP * (vx + (tx - x) * TUNE.stiff);
      vy = DAMP * (vy + (ty - y) * TUNE.stiff);
      x += vx;
      y += vy;
      write();

      // Park once it has arrived. Note this settles ON the target, not at
      // zero — resting the cursor off-centre leaves the scene held there,
      // which is the whole point of an elastic being held taut.
      const busy = Math.abs(tx - x) > TUNE.sleep || Math.abs(ty - y) > TUNE.sleep ||
                   Math.abs(vx) > TUNE.sleep || Math.abs(vy) > TUNE.sleep;
      if (busy) raf = requestAnimationFrame(step);
      else { x = tx; y = ty; vx = vy = 0; write(); }
    }

    function wake() { if (!raf) raf = requestAnimationFrame(step); }

    function onMove(e) {
      const hw = window.innerWidth / 2, hh = window.innerHeight / 2;
      if (!hw || !hh) return;
      tx = Math.max(-1, Math.min(1, (e.clientX - hw) / hw)) * TUNE.maxX;
      ty = Math.max(-1, Math.min(1, (e.clientY - hh) / hh)) * TUNE.maxY;
      wake();
    }

    // Cursor gone: let the elastic relax back to centre.
    function onLeave() { tx = ty = 0; wake(); }

    api.start = function () {
      if (api.enabled) return;
      api.enabled = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave, { passive: true });
      window.addEventListener("blur", onLeave, { passive: true });
    };

    api.stop = function () {
      api.enabled = false;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      x = y = vx = vy = tx = ty = 0;
      write();
    };

    api.tune = TUNE;
    api.damp = DAMP;
    return api;
  }

  const drift = PointerDrift();
  window.PointerDrift = drift;

  const fine   = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (fine && !reduce) drift.start();
})();
