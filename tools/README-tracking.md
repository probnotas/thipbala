# Re-deriving the window track

`assets/js/window-track.js` tells the page where the cockpit window opening
sits in each frame, so the "Hey I'm Thip." heading can stay welded to it
while the camera pushes through. It is **generated**, not hand-written:

```bash
python3 tools/track-window.py                 # needs: pip3 install numpy pillow
```

Re-run it whenever the source clip or the frame count changes — the numbers
are per-frame indices, so a different `--frames` changes the answer.

## How it works

1. Each sampled frame is thresholded; the dark window opening is isolated
   with a connected-component search.
2. Two blob types are discarded: the whole-frame dark background (the
   cockpit interior is nearly black too) and any blob whose centre wanders
   off the chart's centre line, which is what a spurious edge highlight
   looks like.
3. The surviving widths are fitted as `w(i) = W0 * RATE^i`. An exponential
   is the right model because a camera closing on a plane at constant speed
   makes on-screen size grow geometrically. On the current clip this holds
   to ~1.7% mean error, which is the number to watch — the script warns
   above 6%.
4. The centre is fitted linearly over the same range and held constant
   past `--last-tracked`.

## `--last-tracked`

Detection is only trustworthy while the opening is fully on screen. Past
that the rim leaves the frame, the opening merges with the surrounding
dark, and the measured width jumps. On the current clip that happens around
frame 280 of 600. If you change the clip, find the frame where the window
edges reach the frame edges and pass it as `--last-tracked`.

The heading has finished fading out well before then, so the held-constant
tail never shows.

## Tuning the heading

`fill`, `fadeFrom` and `fadeTo` at the bottom of the generated file are
design choices, not measurements — the script rewrites them to the defaults
each run, so re-apply your values after regenerating:

- `fill` — text width as a fraction of the opening's width.
- `fadeFrom` / `fadeTo` — opening width (as a fraction of frame width) at
  which the heading starts and finishes fading. Keep `fadeTo` comfortably
  below the width reached when the star chart starts its dissolve
  (`FADE_START` in `main.js`), or the two will overlap.


## The chart's framing in the final frame

`CHART_IN_FRAME` in `main.js` is a second measurement from the same clip:
where the chart sits inside frame 600, so the live SVG can be matched to it.
It was found by counting pixels above a threshold along each row and column
— the ruler's tick bands show up as lines of high density (0.89–0.97 here),
which a few bright stars cannot fake.

The border rect came out at x 0.0214..0.9786, y 0.0702..0.9325 of the frame.
Extrapolating past the border to the full viewBox (the outer rule sits at
21..1179 of 1200 and 21..619 of 640) gives x 0.0040..0.9960, y 0.0400..0.9628.

Those two axes disagree by 1.7% on scale, because the clip stretches the
chart slightly. The shipped numbers are the geometric mean of the two, which
preserves the true 1.875 aspect and leaves each axis within 0.9% of the
filmed framing. Re-measure if you re-render the clip.
