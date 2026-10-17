/* =====================================================================
   !! STALE — measured against the PREVIOUS clip, not the current one.

   The clip was replaced with one whose window is a large rectangular
   screen rather than the small dark pentagon these numbers describe, and
   tools/track-window.py cannot fit the new one: its heuristic looks for
   the largest dark blob that is not frame-wide, and in the new clip the
   opening already dominates frame 0. Re-tune the detector (or measure by
   hand) before trusting anything below.

   Nothing on the site reads this today — the window-anchored greeting is
   parked via SHOW_GREETING in main.js, which warns if you switch it on
   while `stale` is still true.
   ===================================================================== */

window.WINDOW_TRACK = (function () {
  const W0 = 0.1640, RATE = 1.00421;      // width = W0 * RATE^i
  const CX0 = 0.5079, CX_SLOPE = 3.234e-05; // centre drift per frame
  const CY0 = 0.4935, CY_SLOPE = -7.948e-05;
  const HOLD = 280;                       // last reliably tracked frame

  return {
    stale: true,        // see banner above
    width: i => W0 * Math.pow(RATE, i),
    cx:    i => CX0 + CX_SLOPE * Math.min(i, HOLD),
    cy:    i => CY0 + CY_SLOPE * Math.min(i, HOLD),

    // Greeting text width as a fraction of the opening. 0.55 keeps it
    // clear of the chevron struts that frame the opening's narrow waist.
    fill: 0.55,

    // Fade the greeting out as we pass through the opening, finishing
    // well before the star chart begins its own dissolve.
    fadeFrom: 0.75,
    fadeTo:   1.25
  };
})();
