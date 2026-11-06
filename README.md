# Star Chart Portfolio

A self-playing intro that flies through a spacecraft window and lands on an
interactive star chart. Eight of the stars are real portfolio entries.

```
index.html                     page shell, both acts
assets/css/site.css            tokens + all styling (design spec §6)
assets/js/data.js              star catalogue, constellation figures, THE 15 NODES
assets/js/frames.manifest.js   generated — frame count + paths
assets/js/scroll-video.js      scroll-scrubbed frame sequence engine
assets/js/star-chart.js        the interactive chart
assets/js/main.js              playback → chart handoff
assets/frames/{desktop,mobile} the JPEG sequence
media/approach.mp4             source clip
assets/js/pointer-drift.js     cursor-reactive scene drift
assets/js/story.js             the "Read more" write-up modal
assets/img/                    card + modal artwork
tools/make-art.py              regenerates the generated panels
tools/build-frames.sh          regenerates the sequence
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

## Playback

The clip is **not** scroll-driven. The page is exactly one viewport tall and
never scrolls: once the loading bar fills, `play()` in `main.js` runs the
frame sequence on a clock (`DURATION`, 4800ms — close to the clip's own
5.04s) and hands over to the chart at the end.

`progress` is the single value driving everything — the frame, the chart
dissolve and the grain level. Anywhere the old build read scroll position,
it now reads that.

Two things worth knowing:

- **A click, tap, Escape, Enter or Space skips to the end.** An intro you
  cannot leave gets old by the second visit.
- **A backgrounded tab pauses it.** `rAF` is suspended there but a wall
  clock is not, so without this the intro would jump forward on return;
  `visibilitychange` restarts the run from wherever it actually got to.

Reduced motion skips playback entirely and opens on the chart.

## The loading screen

There isn't one. The clip is the loading screen: it plays from the first
frame that lands, and the only chrome over it is a ring at the bottom.

The ring counts **one monotonic value** so it never travels backwards —
frames arriving take the first 18% (`LOAD_SHARE` in `main.js`), the run
toward the chart takes the rest. It retires when the chart lands. An 8s
safety timer starts playback regardless, so a slow fetch cannot strand
anyone on a still frame.

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

## Images

Every entry has a real image in `assets/img/`, except cont'd, which gets
the one generated panel (`tools/make-art.py`). SkyWatch is a live capture of
skywatch.com/explore cropped above its cookie banner; thip-ins is a capture
of the thip-ins site itself.

The hero defaults to 16:9 with `cover`. Three per-record overrides handle
images that don't suit that:

- `thumbRatio` — the shape. LiveEO's banner is 4:1, so it uses `4 / 1` and
  shows whole; the about portrait uses `4 / 3`.
- `thumbFit: "contain"` — show the whole image on paper rather than crop.
  Used for the CubeSat photo (only 327px wide; cropping and upscaling it
  went soft) and the String Hoopers poster (portrait format; a 16:9 band
  cut the title off).
- `thumbFocus` — a `background-position` choosing what a crop keeps.

All three apply to both the card and the modal.

## About me

The filled orange button at the top right opens `window.ABOUT` through the
write-up modal, which has an about-only mode:

- **A photo collage** (`photos`) in place of the single hero — taped
  polaroids, tilted, hard shadows, dropping in one at a time. This is
  thip-ins' scrapbook language. It is deliberately kept off the chart,
  where a tilted card beside a precise star reads as a bug, but on a page
  about a person the mess is the point. Up to six photos; the first is
  largest. Slots are spaced so a lower photo always starts below the
  caption of anything above it — overlapping photos is the look, burying
  captions is not. On phones the collage becomes a tilted two-column grid.
- **A pull quote** (`quote`), **the story**, a **"right now" list**
  (`now`, supports links) and **link buttons** (`links`).

Every sentence of the story is Thip's own, lifted from the write-ups — none
of his voice was invented.

**Only the first photo is actually of him.** The other four are stand-ins
from his projects until real photos of him are added.

## Editing content

Everything a person needs to change lives in `assets/js/data.js`:
`NODES` (the experiences) and `LINKS` (footer). Each node's `star` must
match a name in `CAT` — that is what positions it on the sky.

Per node: `title`, `desc`, `role`, `year`, `tags`, `story`, `href` and an
optional `cta` to relabel the link. `desc` is a
full paragraph — in practice one lifted from `story` — and the card clamps
it to five lines, with "read more" carrying the rest. The card
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

Each card carries the opening paragraph. "Read more" opens `#story`, which holds the full prose, the artwork at full width, and
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

## Hover and touch

Hover is decided **per pointer, not per media query**. `(hover: none)`
matches on plenty of machines that do have a mouse — a laptop with a
touchscreen is the common case — and gating the handlers on it meant those
visitors got no hover at all: pointing at a star did nothing.

The node listeners are `pointerenter` / `pointerleave` filtered on
`pointerType === "mouse"`, so a hybrid device gets hover from its mouse and
tap-to-toggle from its finger. The hint copy uses `(any-hover: hover)` for
the same reason.

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

## Design system

Typography and palette are carried over from **thip-ins**:

| | |
|---|---|
| Display / body | Figtree 400-700 |
| Technical register | Space Mono 400/700 - star ids, years, pills, tick labels, footer |
| Background | `#16130f` |
| Ink | `#f3ecdc` |
| Accent | `#ff7a3d` |
| Card / paper | `#211c15` / `#2a241b` |

thip-ins is light by default with a dark variant. A star chart has to be
dark, so the **dark variant** is the one used here: the same warm
near-black, cream and orange, in place of the neutral grey and gold this
started with. Its other signature is hard offset shadows with no blur
(`4px 6px 0`), which the card and the modal now use, and rounded bordered
pills for tags.

The one thing deliberately **not** carried across is thip-ins' slight
rotations (`rotate(-1.2deg)` on its stickers and panels). That belongs to
its scrapbook layout; tilting a card anchored to a specific star reads as a
mistake rather than a flourish.

`tools/make-art.py` draws the generated panels from the same tokens, so
regenerating keeps them in step.

### Matching the clip to the palette

The clip was shot against a neutral near-black (measured `(3,3,3)` on its
final frame) while the site sits on a warm `(22,19,15)`. Cross-fading
between those showed the ground lift and warm at the handoff.

`#floor` is a full-bleed layer over the canvas with
`mix-blend-mode: lighten`, which takes the per-channel maximum: it pins the
clip's black floor to exactly the page background and leaves anything
brighter (the cockpit metal, the stars) untouched. Cheaper and far more
tunable than regrading 1,200 frames, and because it reads `var(--bg)` it
follows the palette automatically.

## Lower case

The whole site renders lower case via a single `text-transform` on `body`
in `site.css`. It is done in CSS rather than in the copy so the source text
keeps its real capitalisation: delete that one line and everything reverts,
including the long-form writing in the modals.

Form controls carry their own UA `text-transform`, which blocks the
inherited value, so `button,input,select,textarea{text-transform:inherit}`
is what keeps the "read more" button in line with the rest.

## Notes

- `prefers-reduced-motion` skips the approach entirely and opens on the chart.
- Press `F` to hide the hint, footer, greeting and scroll cue — a clean frame for video capture.
- Visited nodes persist in `localStorage` under `sc.visited`.
- Typography comes from thip-ins (see **Design system**), which supersedes
  both the League Gothic placeholder and design spec 5's condensed technical
  grotesque. Space Mono covers the register that spec was reaching for.

