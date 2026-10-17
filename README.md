# Star Chart Portfolio

Scroll-driven intro that flies through a spacecraft window and lands on an
interactive star chart. Fifteen of the stars are real portfolio entries.

```
index.html                     page shell, both acts
assets/css/site.css            tokens + all styling (design spec §6)
assets/js/data.js              star catalogue, constellation figures, THE 15 NODES
assets/js/frames.manifest.js   generated — frame count + paths
assets/js/scroll-video.js      scroll-scrubbed frame sequence engine
assets/js/star-chart.js        the interactive chart
assets/js/main.js              approach → chart handoff
assets/frames/{desktop,mobile} the JPEG sequence
media/approach.mp4             source clip
assets/js/window-track.js      generated — window position/scale per frame
assets/js/pointer-drift.js     cursor-reactive scene drift
assets/js/story.js             the "Read more" write-up modal
assets/img/                    card + modal artwork
tools/make-art.py              regenerates the generated panels
tools/build-frames.sh          regenerates the sequence
tools/track-window.py          regenerates window-track.js
tools/README-tracking.md       how the tracking works
```

Run it from a local server (the frames are fetched, so `file://` will not work):

```bash
./tools/serve.sh          # or: python3 -m http.server 8080
```

## Deploying

It is a static site with no build step — point any host at the repo root.

`vercel.json` sets the cache headers, which matter more here than on a
typical site: one visit pulls hundreds of frames. Frames and artwork get 30
days with `stale-while-revalidate`; CSS/JS always revalidate so a push is
visible immediately. The frames are cached hard but deliberately **not**
`immutable` — their filenames are stable, so an immutable header would pin
a stale intro for anyone who had visited before a `build-frames.sh` rerun.

`.vercelignore` keeps `media/`, `tools/` and this README out of the deploy:
the clip is only an input to the frame build, never played at runtime.
Deployed payload is ~64MB, essentially all frame sequence.

On Vercel, import the repo at vercel.com/new and deploy with framework
preset **Other** and no build command. Pushes to `main` then redeploy on
their own.

## The loading screen

The first thing anyone sees: `hi, im thip.` centred on black, in Fraunces
with its `SOFT` axis at 100. It is the page's `<h1>`.

The words arrive one at a time — each is its own `<span>` with a staggered
`animation-delay` (100 / 380 / 660ms). Because the not-yet-visible words
still occupy their space, nothing reflows as they land; they fade in place.

Underneath is a thin progress bar. It tracks progress toward being able to
**start**, not toward the whole sequence: scrubbing begins after the first
coarse pass, roughly 6% of the payload, and a bar that crept to 6% and then
vanished would read as broken. Two things gate the start — enough frames,
and `MIN_LOADER_MS` (2000ms, long enough for the words to finish) — so the
bar shows the lesser of the two and lands on 100% exactly as the screen
lifts. An 8s safety timer dismisses it regardless, so a failed fetch cannot
strand anyone.

To change the words, edit the spans inside `#loader` in `index.html`.

## Grain

`#grain` is a fixed overlay of `feTurbulence` noise (an inline SVG data URI,
no image file) that jitters on a 0.7s step animation. It covers the whole
experience, at two strengths: full over the loading screen and the clip
(`GRAIN`, 0.5), easing down to a lighter dusting once the chart has landed
(`GRAIN_CHART`, 0.35). The ease runs across the same dissolve as the chart
fade, so there is no step at the moment of the swap.

The chart keeps grain rather than clearing it, which keeps the texture
continuous — but it is the one surface where grain competes with content,
since the proximity mesh draws at ~8% opacity. If the faint lines start
reading as noise, lower `GRAIN_CHART` rather than `GRAIN`.

Three things have to be right or the grain is invisible on a near-black
page. All three were wrong in the first version:

1. **`feTurbulence` writes noise into the alpha channel**, not just RGB, so
   the raw filter output is mostly transparent — measured alpha topped out
   at 99/255. The `feColorMatrix` pipes the red channel into R/G/B and
   forces alpha to 1.
2. **`overlay` blend is useless here.** Overlay multiplies into a dark
   backdrop, and this scene is near-black almost everywhere, so the grain
   cancelled itself out. It uses `screen`.
3. **A gamma transfer keeps the mean low while widening the spread.** Without
   it, opaque noise averages ~0.39 luma and screen-blending hazes the blacks
   grey. At exponent 6 the mean drops to ~0.14 while contrast stays high.

Composited over `#050505`, the current setup measures **sd 15.2** against the
first version's **sd 2.2** — roughly 7x, and the reason the original read as
"no grain at all" rather than "subtle grain".

The jitter animates `background-position`, not `transform`: a transform
animation needs its own compositing layer, and promoting the element can drop
`mix-blend-mode` against the backdrop entirely in some engines.

Strength is `GRAIN` / `GRAIN_CHART` in `main.js`; `GRAIN` must match the
`--grain` fallback in `site.css`. To retune, change the `exponent` in the
data URI for contrast and the two constants for strength. Reduced motion
opens straight on the chart at `GRAIN_CHART`, and keeps the grain but stops
it moving.

## Editing content

Everything a person needs to change lives in `assets/js/data.js`:
`NODES` (the experiences) and `LINKS` (footer). Each node's `star` must
match a name in `CAT` — that is what positions it on the sky.

Per node: `title`, `desc` (one line), `role`, `year`, `tags`, `pts`
(bullets), `href` and an optional `cta` to relabel the link. The card
collapses any block you leave empty rather than rendering an empty shell,
so a half-written entry degrades quietly. `href` values starting with
`http` open in a new tab.

The hint copy counts the entries itself ("Ten of these stars are his"), so
adding or removing one cannot leave the number wrong.

`LINKS` drives the footer. Any entry still set to `"#"` is **removed** from
the footer rather than rendered as a dead link — currently Résumé, GitHub
and "All experiences" are hidden for that reason. Fill one in and it
reappears.

### Two entries still need copy

`SV Robotics` has a one-line description and no bullets; `Castle Lane
Digital` has only a title and artwork. Both render without breaking — and
neither offers a "Read more", since there is nothing behind it yet.

## Artwork

`thumb` on each node points at `assets/img/`. One is a real photograph
(`tks.webp`); the rest are **generated line art** from
`tools/make-art.py` — thin white strokes on near-black with a single gold
accent, so a card with generated art and a card with a photo still read as
one set.

They are generated rather than sourced on purpose: press shots, company
marketing and agency imagery all carry their own licences, and putting them
on a personal portfolio is someone else's copyright. Swap any panel for a
real photo by pointing that node's `thumb` at it — nothing else changes,
and the mix is designed to tolerate photos and drawings side by side.

```bash
python3 tools/make-art.py      # regenerate all panels
```

## The write-up modal

Each card carries the short version — a one-liner and bullets. "Read more"
opens `#story`, which holds the full prose, the artwork at full width, and
the outbound link. Cards whose node has an empty `story` hide the button.

Prose lives in `story` as one string per paragraph, and supports
`[label](url)` links plus list items — a paragraph written as `- …` becomes
an `<li>`, and consecutive ones group into a single `<ul>`. Nothing else. `story.js` renders those by building
real DOM nodes — it never assigns `innerHTML` — so an angle bracket in the
copy is text rather than markup, and only `http(s)`, `mailto` and `#`
targets are turned into links. Content can be edited without thinking about
escaping.

While the modal is open the page scroll is locked. That matters more here
than on a typical site: the body scroll is what scrubs the intro clip, so
without the lock a scroll inside the modal would run the film backwards
behind it. Hovering other nodes is also suppressed, or the article would
swap out from under the reader. Escape closes the modal before the card,
tab is trapped inside the panel, and focus returns to the node on close.

### Picking stars

Stars are chosen for spread, not meaning — but **not every star is safe**.
Because the chart is matched to the clip's framing it overflows the viewport
on anything narrower than ~16:9, and a node near the left or right edge of
the sky can land off-screen entirely. Castle Lane Digital was originally on
Fomalhaut (RA 22.96) and sat ~70px past the right edge at 4:3.

`placeChart()` now guards against this: it measures the outermost node and,
if the filmed framing would push one off-screen, shrinks the chart just
enough to bring it back, keeping the aspect exact. At 16:9 it never engages.
At 820x800 it shrinks the chart 21% and all ten nodes stay reachable. Still,
prefer stars roughly between RA 4h and 21h so the guard rarely has to fire.

## The frame sequence

The source clip is **121 real frames** (5.04s @ 24fps, 3844×2156). Anything
above 121 is motion-interpolated by ffmpeg, not recovered detail.

Rebuild at any count:

```bash
./tools/build-frames.sh 600 1920 960 5     # frames, desktop px, mobile px, jpeg q
```

### Why 600 and not 5,000

Measured on this clip, at 1920px wide:

| frames | desktop payload | build time |
|-------:|----------------:|-----------:|
|    300 |          ~23 MB |     ~4 min |
|    600 |          ~45 MB |     ~8 min |
|  5,000 |        ~375 MB |    ~50 min |

5,000 frames over a 5.04s clip is ~990 fps — roughly 41 synthetic frames
per real one. It costs ~8× the bytes of the current build without adding
motion information the source does not contain.

More to the point, frame count is **not** what caps smoothness here.
`scroll-video.js` cross-fades between the two nearest loaded frames using
the fractional scroll position, so motion is continuous rather than
quantised to the file count. 600 files already render sub-pixel-smooth
motion across the scroll track.

If you want 5,000 anyway, the command above takes the number directly —
nothing else in the build needs to change.

### How loading works

Frames arrive in passes of increasing density (every 16th, then 8th, 4th,
2nd, all), with the final frame pulled to the front of the queue. The
sequence becomes scrubbable after the first pass — about 6% of the payload
— and sharpens as the rest lands. Nothing blocks on the full download.

## Matching the chart to the last frame

The clip ends on a shot of this chart, so the handoff is a cross-fade. The
catch: the canvas paints frames **cover**, so on anything but ~16:9 the last
frame is cropped and zoomed, while a `meet`-fitted SVG sits letterboxed and
smaller. Fading between those reads as a jump — at 4:3 the frame loses ~12%
off each side while the SVG gains black bars.

So the chart is sized from the *frame's own rendered rect* rather than from
the viewport (`CHART_IN_FRAME` in `main.js`), which makes it land wherever
the final frame puts it at any aspect ratio. The rect was measured off
frame 600 by detecting the ruler's tick lines; re-measure it whenever the
clip changes.

The clip stretches the chart ~1.9% off true aspect. Rather than distort the
star field to match, that difference is split: both axes land within 0.9% of
the filmed framing at exactly the right 1.875 aspect. Measured at 1024x768,
every edge agrees with the filmed chart to under 0.5%.

**Trade-off worth knowing:** matching the clip means the tick border is
cropped on viewports much narrower than 16:9, which design spec §2 says to
avoid ("letterbox, never crop the tick border"). At ~16:9 nothing is cropped
— the chart sits at 98% width, 93% height. To go back to the spec's
letterbox behaviour, delete the `placeChart()` calls in `main.js`; the CSS
fallback already does the right thing, which is also what reduced motion
gets, since there is no clip to match.

## The greeting

**Currently off.** `SHOW_GREETING` at the top of `main.js` is `false`; flip
it to `true` to bring it back. Everything it needs is still in place. While
it is off the `<h1>` stays in the DOM, visually hidden, so the page keeps
its heading for screen readers.


When on, it is the page's `<h1>`, anchored to the cockpit window
opening and scales with it, so it reads as painted on the window while the
camera pushes through.

That anchoring is measured, not eyeballed. `tools/track-window.py` detects
the dark opening across the frames where it is fully on screen and fits its
width and centre; the result is `assets/js/window-track.js`. The opening
grows exponentially at 0.42%/frame (constant-velocity approach to a plane),
fitting to 1.7% mean error. See `tools/README-tracking.md` to re-derive it.

Both the position and the size are fractions of the **rendered frame**, not
the viewport, which is what keeps the text welded to the window through the
canvas `cover` crop at any aspect ratio — including a portrait phone, where
the frame is cropped hard horizontally.

Size is set as `font-size` rather than `transform: scale()` so the type
re-rasterises and stays crisp as it grows past 5x. It is derived from the
type's own measured width, so swapping `--display` for the real chart face
will not break the fit.

To change the wording, edit the `<h1>` in `index.html`. To change how big it
sits in the window or when it fades, edit `fill` / `fadeFrom` / `fadeTo` at
the bottom of `window-track.js` — but note the tracking script rewrites
those to defaults, so re-apply them after regenerating.

## Pointer drift

The scene trails the cursor like elastic being pulled: move left and it
follows left, slowly, and stays there; move back and it eases back. It runs
over the clip and the chart — but **not** the loading screen, which is why
`#loader` is a sibling of `.sticky` rather than a child of it.

It is **position**-driven: the cursor's offset from the centre of the
viewport sets a target, and a critically damped spring pulls the scene
toward it. `pointer-drift.js` publishes the offset as `--jx` / `--jy` on
`:root`, and each layer opts in with
`transform: translate3d(var(--jx,0px),var(--jy,0px),0)`.

Three things this went through, worth not re-discovering:

- **Velocity-driven was the wrong model.** Driving it from pointer velocity
  gives a kick-and-recoil that reads as a jerk. Velocity impulses are spiky
  by nature and softening them does not remove the snap — the calm version
  has to come from following a position, not a movement.
- **Damping is solved from stiffness, not tuned separately.** Setting the
  two by hand is how an early attempt overshot its target by ~30% and
  bounced. The module now solves for critical damping directly: for this
  integrator the error system's characteristic polynomial is
  `L^2 - (1+d-dk)L + d`, critically damped where `(1+d-dk)^2 = 4d`, which a
  bisection finds exactly. The textbook `1 - 2*sqrt(k)` shortcut is a
  continuous-time result and comes out noticeably over-damped once
  discretised — at the same stiffness it settled in 1.0s where the exact
  value does it in 0.75s, for free. Overshoot is exactly 0 either way, and
  `stiff` can now be changed on its own without reintroducing bounce.
- **The card subtracts the drift before positioning.** It carries the same
  transform as the chart, but `place()` measures the chart *after* that
  transform, so without compensation the offset lands twice and the card
  creeps off its node. Verified: at a drift of 7.6px the card still sits
  exactly 22px from its node with 0 vertical offset.

Grain is deliberately **not** drifted. It belongs to the lens, not the
scene, so it stays locked to the screen while everything under it moves.

Tuning is `TUNE` at the top of `pointer-drift.js`. As shipped: 14px of
travel at the left/right edge of the viewport (8px vertical — smaller, since
the effect is meant to read left/right), reaching 63% of the way in ~0.18s
and 95% in ~0.45s. `stiff` is the speed dial — **lower is slower**, and
damping is re-solved from it automatically, so no value of `stiff` can make
it bounce. `maxX` / `maxY` are the travel limits; set `maxY: 0` for strictly
horizontal.

| stiff | 63% | 95% |
|---:|---:|---:|
| 0.012 | 0.33s | 0.75s |
| 0.020 | 0.25s | 0.58s |
| 0.028 | 0.22s | 0.50s |
| **0.035** | **0.18s** | **0.45s** |
| 0.045 | 0.17s | 0.40s |

Off entirely for touch (`hover:none` — no cursor to track) and for
`prefers-reduced-motion`. The rAF loop parks once the spring reaches its
target, so a still cursor costs nothing.

## The handoff

The clip's final frame *is* the star chart, so the live SVG cross-dissolves
in over the last 11% of the scroll track (`FADE_START`/`FADE_END` in
`main.js`). The chart only takes pointer events once the dissolve completes.

## Phones

The chart is wider than a phone screen, so it **pans by swiping**. The gesture
is driven by pointer events in `main.js` (`initPan`) rather than native
overflow scrolling, so touch and mouse behave identically:

- swipe left/right to move across the chart, with inertia on release
- a drag past 6px swallows the click that follows it, so panning across a
  node never opens that node's card
- flick velocity is capped so a fast swipe cannot fling the chart end to end
- the edge fade shows only on the side the chart continues past
- it opens centred — the same framing the clip's final frame lands on

Vertical swipes are intentionally inert once the chart is live (`touch-action:
none`), so a stray gesture cannot rewind the intro while you are aiming at a
star. Change that in the portrait media query in `site.css` if you would
rather allow it.

## Notes

- `prefers-reduced-motion` skips the approach entirely and opens on the chart.
- Press `F` to hide the hint, footer, greeting and scroll cue — a clean frame for video capture.
- Visited nodes persist in `localStorage` under `sc.visited`.
- Typography is split: **titles** run in Fraunces with its `SOFT` axis at 100
  (`--display` + `--soft`), everything else — body, metadata, links, footer —
  runs in a plain system sans (`--meta`), which costs no extra webfont request.
  This replaces the League Gothic placeholder and departs from design spec §5,
  which called for a condensed technical grotesque throughout.
- `assets/js/window-track.js` is **stale**: it was measured against the previous
  clip. Nothing reads it while the greeting is parked, and the file says so.
