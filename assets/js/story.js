/* =====================================================================
   STORY MODAL — the full write-up behind a card's "Read more".

   Prose is authored as plain strings with [label](url) links and nothing
   else. The renderer below builds real DOM nodes for those; it never
   assigns innerHTML, so a stray angle bracket in the copy is text, not
   markup, and the content can be edited by someone who is not thinking
   about escaping.
   ===================================================================== */

(function () {
  "use strict";

  const LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

  // Only http(s), mailto and in-page anchors get to be links.
  function safeHref(url) {
    return /^(https?:|mailto:|#)/i.test(url) ? url : null;
  }

  function renderParagraph(text) {
    const p = document.createElement("p");
    let last = 0, m;
    LINK.lastIndex = 0;
    while ((m = LINK.exec(text)) !== null) {
      if (m.index > last) p.appendChild(document.createTextNode(text.slice(last, m.index)));
      const href = safeHref(m[2]);
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = m[1];
        if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        p.appendChild(a);
      } else {
        p.appendChild(document.createTextNode(m[1]));   // drop the unsafe url
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) p.appendChild(document.createTextNode(text.slice(last)));
    return p;
  }

  /* Move every child across. Not childNodes.forEach(appendChild): that
     iterates a LIVE list while emptying it, so it skips every other node —
     a list item with a link mid-sentence would silently lose pieces. */
  function moveChildren(from, to) {
    while (from.firstChild) to.appendChild(from.firstChild);
  }

  function Story() {
    const root   = document.getElementById("story");
    if (!root) return null;
    const panel  = root.querySelector(".story-panel");
    const hero   = root.querySelector(".story-hero");
    const kicker = root.querySelector(".story-kicker");
    const title  = root.querySelector("#story-title");
    const meta   = root.querySelector(".story-meta");
    const prose  = root.querySelector(".story-prose");
    const link   = root.querySelector(".story-link");
    const collage = root.querySelector(".story-collage");
    const quote  = root.querySelector(".story-quote");
    const now    = root.querySelector(".story-now");
    const links  = root.querySelector(".story-links");

    /* Where each polaroid lands, as % of the collage box: [left, top,
       width, tilt]. Two loose rows with the first slot largest, so the
       portrait leads. A record with fewer photos uses the first N.

       Photos may overlap — that is the scrapbook — but a lower photo must
       start below the CAPTION of anything above it, or the caption is the
       part that gets buried. The rows are spaced for that, which is why
       the box is 720:560 rather than something flatter. */
    const SLOTS = [
      [ 2,  4, 34, -5  ],
      [36,  0, 27,  3  ],
      [64,  6, 30, -2.5],
      [14, 53, 28,  4  ],
      [48, 51, 29, -3  ],
      [77, 56, 21,  5  ]
    ];

    function renderCollage(photos) {
      collage.textContent = "";
      photos.slice(0, SLOTS.length).forEach((ph, i) => {
        const [l, t, w, r] = SLOTS[i];
        const fig = document.createElement("figure");
        fig.className = "polaroid";
        fig.style.left = l + "%";
        fig.style.top = t + "%";
        fig.style.width = w + "%";
        fig.style.setProperty("--tilt", r + "deg");
        fig.style.setProperty("--i", i);

        const img = document.createElement("img");
        img.src = ph.src;
        img.alt = ph.caption || "";
        img.loading = "lazy";
        img.decoding = "async";
        if (ph.pos) img.style.objectPosition = ph.pos;
        fig.appendChild(img);

        if (ph.caption) {
          const cap = document.createElement("figcaption");
          cap.textContent = ph.caption;
          fig.appendChild(cap);
        }
        collage.appendChild(fig);
      });
      collage.hidden = !photos.length;
    }
    const closeBtn = root.querySelector(".story-close");

    let lastFocus = null;
    let open = false;

    function fill(n) {
      hero.style.backgroundImage = n.thumb ? `url("${n.thumb}")` : "";
      /* A 16:9 hero suits the wide line-art panels, but it only ever shows
         56% of a square portrait's height — enough for a face, not for a
         head and shoulders. A record can pick its own shape, and say which
         part of the crop to keep. */
      hero.style.aspectRatio = n.thumbRatio || "";
      hero.style.backgroundPosition = n.thumbFocus || "center";
      hero.style.backgroundSize = n.thumbFit === "contain" ? "contain" : "cover";
      // A record with photos gets the collage in place of a single hero.
      const photos = n.photos || [];
      hero.classList.toggle("none", !n.thumb || photos.length > 0);
      renderCollage(photos);

      quote.textContent = n.quote || "";
      quote.hidden = !n.quote;

      kicker.textContent = n.star ? n.star.toUpperCase() : "";
      title.textContent = n.title || "";

      meta.textContent = "";
      [n.role, ...(n.tags || [])].filter(Boolean).forEach(t => {
        const s = document.createElement("span");
        s.className = "pill"; s.textContent = t;
        meta.appendChild(s);
      });
      if (n.year) {
        const y = document.createElement("span");
        y.className = "yr"; y.textContent = n.year;
        meta.appendChild(y);
      }
      meta.hidden = !meta.childElementCount;

      /* A paragraph written as "- …" is a list item, and consecutive ones
         group into a single <ul>. Keeps a genuine list in the source copy
         from being flattened into prose. */
      prose.textContent = "";
      const paras = n.story && n.story.length ? n.story : (n.desc ? [n.desc] : []);
      let list = null;
      paras.forEach(t => {
        if (t.startsWith("- ")) {
          if (!list) { list = document.createElement("ul"); prose.appendChild(list); }
          const li = document.createElement("li");
          moveChildren(renderParagraph(t.slice(2)), li);
          list.appendChild(li);
        } else {
          list = null;
          prose.appendChild(renderParagraph(t));
        }
      });

      const nowList = now.querySelector("ul");
      nowList.textContent = "";
      (n.now || []).forEach(t => {
        const li = document.createElement("li");
        moveChildren(renderParagraph(t), li);
        nowList.appendChild(li);
      });
      now.hidden = !nowList.childElementCount;

      links.textContent = "";
      (n.links || []).forEach(l => {
        const href = safeHref(l.href);
        if (!href) return;
        const a = document.createElement("a");
        a.href = href;
        a.textContent = l.label;
        if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        links.appendChild(a);
      });
      links.hidden = !links.childElementCount;

      const href = n.href || "#";
      const external = /^https?:/i.test(href);
      link.hidden = !external || links.childElementCount > 0;
      if (external) {
        link.href = href;
        link.textContent = n.cta || "Learn more";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }

    /* Locking the page matters more here than usual: the body scroll is
       what scrubs the intro clip, so without this a scroll inside the
       modal would run the film backwards behind it. */
    let scrollLock = null;
    function lockPage() {
      const el = document.documentElement;
      const bar = window.innerWidth - el.clientWidth;
      scrollLock = {
        overflow: el.style.overflow,
        pad: document.body.style.paddingRight,
        y: window.scrollY            // see unlockPage
      };
      el.style.overflow = "hidden";
      if (bar > 0) document.body.style.paddingRight = bar + "px";
    }
    function unlockPage() {
      if (!scrollLock) return;
      document.documentElement.style.overflow = scrollLock.overflow;
      document.body.style.paddingRight = scrollLock.pad;
      /* Restore the offset explicitly. Toggling overflow on the scrolling
         element can drop it to 0, and here that is not a cosmetic jump:
         scroll position IS the intro's playhead, so closing the modal
         would rewind the film to the first frame. */
      window.scrollTo(0, scrollLock.y);
      scrollLock = null;
    }

    function show(n) {
      if (!n) return;
      lastFocus = document.activeElement;
      fill(n);
      root.hidden = false;
      lockPage();
      panel.scrollTop = 0;
      requestAnimationFrame(() => root.classList.add("on"));
      open = true;
      closeBtn.focus({ preventScroll: true });
    }

    function hide() {
      if (!open) return;
      open = false;
      root.classList.remove("on");
      root.classList.add("closing");
      const done = () => {
        root.hidden = true;
        root.classList.remove("closing");
        unlockPage();
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        lastFocus = null;
      };
      const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
      if (reduce) done(); else setTimeout(done, 280);
    }

    root.querySelectorAll("[data-story-close]").forEach(el =>
      el.addEventListener("click", hide));

    document.addEventListener("keydown", e => {
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); hide(); return; }
      // Keep tabbing inside the panel while it is modal.
      if (e.key !== "Tab") return;
      const f = panel.querySelectorAll('a[href],button:not([disabled])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    return { show, hide, isOpen: () => open };
  }

  window.StoryModal = Story();
})();
