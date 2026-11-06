#!/usr/bin/env python3
"""
Generate the artwork for any experience that has no image of its own.

Deliberately not stock photography: these are drawn in the chart's own
language (thin white line work on near-black, one gold accent) so a card
with generated art and a card with a real photo still feel like one set.
Replace any of them by pointing that node's `thumb` at a real image.
"""
import math, os

W, H = 320, 180
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")

# Matches the site tokens in assets/css/site.css (carried from thip-ins):
# warm near-black ground, cream line work, orange accent.
BG     = "#1a1610"
LINE   = "rgba(243,236,220,.55)"
FAINT  = "rgba(243,236,220,.22)"
DIM    = "rgba(243,236,220,.10)"
ACCENT = "#ff7a3d"


def svg(body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" role="img" aria-label="{title}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>'
            f'{body}</svg>')


def stars(seed, n=34):
    """Seeded specks, so every panel sits in the same sky as the chart."""
    out, a = [], seed
    for _ in range(n):
        a = (a * 1103515245 + 12345) & 0x7FFFFFFF
        x = (a >> 7) % W
        a = (a * 1103515245 + 12345) & 0x7FFFFFFF
        y = (a >> 7) % H
        a = (a * 1103515245 + 12345) & 0x7FFFFFFF
        r = 0.4 + ((a >> 7) % 100) / 140
        o = 0.12 + ((a >> 11) % 100) / 220
        out.append(f'<circle cx="{x}" cy="{y}" r="{r:.2f}" fill="#f3ecdc" opacity="{o:.2f}"/>')
    return "".join(out)


def grid():
    g = []
    for i in range(1, 8):
        x = i * W / 8
        g.append(f'<line x1="{x:.0f}" y1="0" x2="{x:.0f}" y2="{H}" stroke="{DIM}" stroke-width=".5"/>')
    for i in range(1, 5):
        y = i * H / 5
        g.append(f'<line x1="0" y1="{y:.0f}" x2="{W}" y2="{y:.0f}" stroke="{DIM}" stroke-width=".5"/>')
    return "".join(g)


art = {}

# Every other entry now has a real image. This draws the one that does not.

# --- cont'd: a page of writing that runs off the edge, still going ---
rules = "".join(
    f'<line x1="44" y1="{y}" x2="{276 if i < 4 else 176}" y2="{y}" stroke="{LINE if i < 4 else FAINT}" '
    f'stroke-width="1.6" stroke-linecap="round" opacity="{1 - i*.08:.2f}"/>'
    for i, y in enumerate((46, 66, 86, 106, 126)))
margin = f'<line x1="32" y1="28" x2="32" y2="156" stroke="{FAINT}"/>'
art["contd"] = grid() + stars(149) + margin + rules + (
    # the caret where the sentence stops, and the dots that say it doesn't
    f'<rect x="186" y="117" width="3" height="18" fill="{ACCENT}"/>'
    + "".join(f'<circle cx="{204 + i*12}" cy="126" r="2.4" fill="{ACCENT}" opacity="{.85 - i*.25:.2f}"/>'
              for i in range(3)))

os.makedirs(OUT, exist_ok=True)
for name, body in art.items():
    path = os.path.join(OUT, name + ".svg")
    with open(path, "w") as f:
        f.write(svg(body, name))
    print(f"  {name}.svg  {os.path.getsize(path):>5} bytes")
print(f"\nwrote {len(art)} panels to assets/img/")
