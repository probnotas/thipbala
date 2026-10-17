#!/usr/bin/env python3
"""
Generate the card/modal artwork for experiences that have no photograph.

Deliberately not stock photography: these are drawn in the chart's own
language (thin white line work on near-black, one gold accent) so a card
with generated art and a card with a real photo still feel like one set.
Replace any of them by pointing that node's `thumb` at a real image.
"""
import math, os

W, H = 320, 180
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")

BG     = "#0A0A0A"
LINE   = "rgba(242,242,240,.55)"
FAINT  = "rgba(242,242,240,.22)"
DIM    = "rgba(242,242,240,.10)"
ACCENT = "#E8B84B"


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
        out.append(f'<circle cx="{x}" cy="{y}" r="{r:.2f}" fill="#F2F2F0" opacity="{o:.2f}"/>')
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

# --- LotusFlare: a mast throwing signal arcs across a grid of devices ---
arcs = "".join(
    f'<path d="M{160 - r} 118 A {r} {r} 0 0 1 {160 + r} 118" fill="none" '
    f'stroke="{LINE if i == 0 else FAINT}" stroke-width="{1.1 if i == 0 else .8}" '
    f'opacity="{1 - i * .18:.2f}"/>'
    for i, r in enumerate((22, 40, 58, 76, 94)))
devices = "".join(f'<rect x="{x}" y="128" width="9" height="15" rx="2" fill="none" stroke="{FAINT}"/>'
                  for x in (40, 72, 228, 260))
art["lotusflare"] = grid() + stars(11) + arcs + devices + (
    f'<line x1="160" y1="118" x2="160" y2="58" stroke="{LINE}" stroke-width="1.4"/>'
    f'<circle cx="160" cy="54" r="4" fill="{ACCENT}"/>'
    f'<line x1="150" y1="150" x2="170" y2="150" stroke="{FAINT}"/>')

# --- SkyWatch: a satellite downlinking a swath onto the ground track ---
art["skywatch"] = grid() + stars(23) + (
    f'<path d="M-10 168 Q 160 120 330 168" fill="none" stroke="{LINE}" stroke-width="1.2"/>'
    f'<path d="M-10 176 Q 160 128 330 176" fill="none" stroke="{FAINT}" stroke-width=".7"/>'
    f'<path d="M40 44 Q 160 18 280 44" fill="none" stroke="{FAINT}" stroke-dasharray="4 5"/>'
    f'<g transform="translate(160 32)">'
    f'<rect x="-7" y="-6" width="14" height="12" fill="none" stroke="{LINE}" stroke-width="1.2"/>'
    f'<rect x="-23" y="-4" width="13" height="8" fill="none" stroke="{FAINT}"/>'
    f'<rect x="10" y="-4" width="13" height="8" fill="none" stroke="{FAINT}"/></g>'
    f'<path d="M153 40 L118 146 L202 146 L167 40 Z" fill="{ACCENT}" opacity=".07"/>'
    f'<line x1="153" y1="40" x2="118" y2="146" stroke="{ACCENT}" stroke-width=".8" opacity=".55"/>'
    f'<line x1="167" y1="40" x2="202" y2="146" stroke="{ACCENT}" stroke-width=".8" opacity=".55"/>')

# --- ESSENCE: the 3U cube, wireframe, on an orbit ---
def cube(ox, oy, w, h, d):
    p = []
    p.append(f'<rect x="{ox}" y="{oy}" width="{w}" height="{h}" fill="none" stroke="{LINE}" stroke-width="1.2"/>')
    p.append(f'<path d="M{ox} {oy} l{d} {-d} h{w} l{-d} {d}" fill="none" stroke="{LINE}" stroke-width="1.1"/>')
    p.append(f'<path d="M{ox+w} {oy} l{d} {-d} v{h} l{-d} {d}" fill="none" stroke="{LINE}" stroke-width="1.1"/>')
    for i in (1, 2):
        p.append(f'<line x1="{ox}" y1="{oy + h*i/3:.0f}" x2="{ox+w}" y2="{oy + h*i/3:.0f}" stroke="{FAINT}"/>')
    return "".join(p)

art["essence"] = grid() + stars(37) + (
    f'<ellipse cx="160" cy="96" rx="128" ry="46" fill="none" stroke="{FAINT}" stroke-dasharray="5 6"/>'
    + cube(138, 62, 44, 64, 13) +
    f'<circle cx="160" cy="142" r="3" fill="{ACCENT}"/>'
    f'<path d="M30 150 Q 160 176 290 150" fill="none" stroke="{FAINT}" stroke-width="1"/>')

# --- LiveEO: towers, spans, and a scan sweeping the corridor ---
towers = []
for x in (46, 118, 190, 262):
    towers.append(f'<path d="M{x} 136 l-9 22 M{x} 136 l9 22 M{x} 136 v-44 M{x-11} 104 h22 M{x-8} 116 h16" '
                  f'fill="none" stroke="{LINE}" stroke-width="1.1"/>')
spans = "".join(f'<path d="M{a} 96 Q {(a+b)/2} 112 {b} 96" fill="none" stroke="{FAINT}"/>'
                for a, b in ((46, 118), (118, 190), (190, 262)))
art["liveeo"] = grid() + stars(5) + "".join(towers) + spans + (
    f'<rect x="96" y="26" width="128" height="132" fill="{ACCENT}" opacity=".05"/>'
    f'<line x1="96" y1="26" x2="96" y2="158" stroke="{ACCENT}" stroke-width=".9" opacity=".6"/>'
    f'<line x1="224" y1="26" x2="224" y2="158" stroke="{ACCENT}" stroke-width=".9" opacity=".6"/>'
    f'<path d="M-6 164 Q 80 152 160 162 T 326 156" fill="none" stroke="{FAINT}" stroke-width=".8"/>')

# --- Mammalian: one needle, and the room rippling out from it ---
rings = "".join(f'<circle cx="160" cy="104" r="{r}" fill="none" stroke="{FAINT if i else LINE}" '
                f'stroke-width="{1.2 if i == 0 else .7}" opacity="{1 - i*.17:.2f}"/>'
                for i, r in enumerate((16, 34, 52, 70, 88)))
people = "".join(f'<circle cx="{x}" cy="{y}" r="2.4" fill="#F2F2F0" opacity=".5"/>'
                 for x, y in ((64, 62), (96, 142), (232, 58), (256, 132), (44, 108), (276, 96),
                              (130, 36), (196, 166)))
art["mammalian"] = grid() + stars(53) + rings + people + (
    f'<line x1="160" y1="22" x2="160" y2="98" stroke="{ACCENT}" stroke-width="1.3"/>'
    f'<circle cx="160" cy="104" r="3.4" fill="{ACCENT}"/>')

# --- Palan Works: a film strip running under ruled lines of text ---
perf = "".join(f'<rect x="{x}" y="{y}" width="7" height="5" rx="1" fill="{FAINT}"/>'
               for y in (108, 150) for x in range(22, 300, 22))
frames = "".join(f'<rect x="{x}" y="118" width="54" height="26" fill="none" stroke="{LINE}" stroke-width="1"/>'
                 for x in (24, 92, 160, 228))
lines = "".join(f'<line x1="40" y1="{y}" x2="{280 - (i % 3) * 46}" y2="{y}" stroke="{FAINT}" stroke-width="1.4"/>'
                for i, y in enumerate((36, 50, 64, 78)))
art["palan"] = grid() + stars(71) + lines + (
    f'<rect x="14" y="104" width="292" height="54" fill="none" stroke="{FAINT}" stroke-width=".7"/>'
    + perf + frames +
    f'<rect x="92" y="118" width="54" height="26" fill="{ACCENT}" opacity=".10"/>')

# --- String Hoopers: the net, which is also a string hopper ---
mesh = []
for i in range(9):
    x = 112 + i * 12
    mesh.append(f'<path d="M{x} 92 L{x - 10} 146" stroke="{FAINT}" fill="none"/>')
    mesh.append(f'<path d="M{x} 92 L{x + 10} 146" stroke="{FAINT}" fill="none"/>')
for j, y in enumerate((106, 120, 134)):
    mesh.append(f'<line x1="{106 + j*4}" y1="{y}" x2="{214 - j*4}" y2="{y}" stroke="{FAINT}"/>')
art["stringhoopers"] = grid() + stars(89) + (
    f'<path d="M96 88 h128" stroke="{ACCENT}" stroke-width="2.4"/>'
    f'<ellipse cx="160" cy="88" rx="64" ry="9" fill="none" stroke="{ACCENT}" stroke-width="1.1" opacity=".55"/>'
    + "".join(mesh) +
    f'<path d="M30 168 Q 160 132 290 168" fill="none" stroke="{LINE}" stroke-width="1.1"/>'
    f'<line x1="160" y1="40" x2="160" y2="78" stroke="{FAINT}" stroke-dasharray="3 5"/>')

# --- SV Robotics: a small machine, taught down a wire ---
art["svrobotics"] = grid() + stars(101) + (
    f'<rect x="124" y="74" width="72" height="54" rx="6" fill="none" stroke="{LINE}" stroke-width="1.3"/>'
    f'<circle cx="146" cy="96" r="6" fill="none" stroke="{LINE}"/>'
    f'<circle cx="174" cy="96" r="6" fill="none" stroke="{LINE}"/>'
    f'<circle cx="146" cy="96" r="2" fill="{ACCENT}"/><circle cx="174" cy="96" r="2" fill="{ACCENT}"/>'
    f'<path d="M142 114 h36" stroke="{FAINT}" stroke-width="1.4"/>'
    f'<line x1="160" y1="74" x2="160" y2="58" stroke="{LINE}"/><circle cx="160" cy="54" r="3.4" fill="{ACCENT}"/>'
    f'<path d="M124 100 H70 V150" fill="none" stroke="{FAINT}"/>'
    f'<path d="M196 100 H250 V150" fill="none" stroke="{FAINT}"/>'
    + "".join(f'<circle cx="{x}" cy="150" r="2.2" fill="none" stroke="{FAINT}"/>' for x in (70, 250)) +
    "".join(f'<rect x="{x}" y="138" width="14" height="10" fill="none" stroke="{DIM}"/>' for x in (134, 172)))

# --- Castle Lane Digital: deliberately quiet, no copy to illustrate yet ---
art["castlelane"] = grid() + stars(131) + (
    f'<rect x="112" y="56" width="96" height="68" fill="none" stroke="{FAINT}" stroke-width="1"/>'
    f'<rect x="130" y="74" width="60" height="32" fill="none" stroke="{LINE}" stroke-width="1.2"/>'
    f'<line x1="160" y1="124" x2="160" y2="148" stroke="{FAINT}"/>'
    f'<circle cx="160" cy="90" r="4" fill="{ACCENT}" opacity=".8"/>')

os.makedirs(OUT, exist_ok=True)
for name, body in art.items():
    path = os.path.join(OUT, name + ".svg")
    with open(path, "w") as f:
        f.write(svg(body, name))
    print(f"  {name}.svg  {os.path.getsize(path):>5} bytes")
print(f"\nwrote {len(art)} panels to assets/img/")
