#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PriSincera OG 이미지 제너레이터 — 메인 히어로 'Star Prism Identity' 기반.

기본(og-image.png) + 카테고리 변형(relearn/builders-log/sylphio)을 생성한다.
사용: python3 ci/gen_og_images.py [--all | relearn builders sylphio]
필요: Pillow (pip install Pillow). 출력: public/og-*.png (1200x630)
"""
import os, sys, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 2
W, H = 1200 * S, 630 * S
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")

GLASS = (150, 160, 205); EDGE = (205, 212, 240)
GOLD = (216, 178, 112); WHITE = (255, 255, 255); PERI = (150, 160, 205)

VARIANTS = {
    "default":  {"file": "og-image.png",      "kicker": "STAR PRISM IDENTITY",      "accent": GOLD,
                 "line": [("Sincerity, ", WHITE), ("Prioritized.", GOLD)]},
    "relearn":  {"file": "og-relearn.png",    "kicker": "RELEARN — LEARN · RUN · REFLECT", "accent": (34, 211, 238),
                 "line": [("Learn from zero, ", WHITE), ("run again.", (34, 211, 238))]},
    "builders": {"file": "og-builderslog.png","kicker": "BUILDER'S LOG",            "accent": (165, 180, 252),
                 "line": [("Engineering, ", WHITE), ("in the open.", (165, 180, 252))]},
    "sylphio":  {"file": "og-sylphio.png",    "kicker": "SYLPHIO — AI INTERPRETER", "accent": (135, 169, 236),
                 "line": [("Real-time AI, ", WHITE), ("on your Mac.", (135, 169, 236))]},
}

def font(size, bold=True):
    cands = (["/System/Library/Fonts/Avenir Next.ttc", "/System/Library/Fonts/HelveticaNeue.ttc",
              "/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else
             ["/System/Library/Fonts/HelveticaNeue.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"])
    for p in cands:
        try: return ImageFont.truetype(p, size)
        except Exception: continue
    return ImageFont.load_default()

def render(v):
    def glow(color, cx, cy, rad, alpha, blur):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(L).ellipse([cx-rad, cy-rad, cx+rad, cy+rad], fill=tuple(color)+(alpha,))
        return L.filter(ImageFilter.GaussianBlur(blur))

    base = Image.new("RGB", (W, H))
    px = base.load()
    top, bot = (9, 10, 16), (13, 11, 12)
    for y in range(H):
        t = y/(H-1)
        row = tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3))
        for x in range(W): px[x, y] = row
    base = base.convert("RGBA")
    ac = v["accent"]
    warm = tuple(int(c*0.3) for c in ac)
    base = Image.alpha_composite(base, glow(warm, int(W*0.52), int(H*1.06), 620*S, 150, 210*S))
    base = Image.alpha_composite(base, glow((44, 50, 82), int(W*0.50), int(H*0.30), 360*S, 95, 180*S))
    base = Image.alpha_composite(base, glow(warm, int(W*0.86), int(H*0.82), 240*S, 70, 150*S))

    rnd = random.Random(11)
    sf = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sf)
    for _ in range(140):
        x, y = rnd.randint(0, W), rnd.randint(0, H)
        a = rnd.randint(18, 95); s = rnd.choice([1, 1, 1, 2]) * S
        col = rnd.choice([(255, 250, 240), (255, 250, 240), (230, 200, 150), (200, 210, 240)])
        sd.ellipse([x, y, x+s, y+s], fill=col+(a,))
    base = Image.alpha_composite(base, sf.filter(ImageFilter.GaussianBlur(0.4*S)))

    cx, cy = int(W*0.50), int(H*0.325)
    Rc = 132 * S
    def pt(deg, r):
        a = math.radians(deg); return (cx + r*math.cos(a), cy + r*math.sin(a))
    r_in = Rc/math.sqrt(3)
    up = [pt(-90, Rc), pt(30, Rc), pt(150, Rc)]
    down = [pt(90, Rc), pt(-30, Rc), pt(210, Rc)]
    hexp = [pt(a, r_in) for a in (-60, 0, 60, 120, 180, 240)]

    base = Image.alpha_composite(base, glow((110, 120, 180), cx, cy, 180*S, 60, 90*S))
    for tri in (up, down):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(L).polygon(tri, fill=GLASS+(76,))
        base = Image.alpha_composite(base, L)

    d = ImageDraw.Draw(base)
    for vx in up + down:
        d.line([(cx, cy), vx], fill=EDGE+(45,), width=max(1, S))
    d.polygon(hexp, outline=EDGE+(70,), width=max(1, S))
    for tri in (up, down):
        d.line([tri[0], tri[1], tri[2], tri[0]], fill=EDGE+(120,), width=max(1, S), joint="curve")

    acc_tri = [pt(30, Rc), pt(0, r_in), pt(60, r_in)]
    base = Image.alpha_composite(base, glow(ac, int((acc_tri[0][0]+cx)/2), int((acc_tri[0][1]+cy)/2), 70*S, 90, 34*S))
    d = ImageDraw.Draw(base)
    d.polygon(acc_tri, fill=tuple(ac)+(235,))

    orbit_r = int(Rc*1.34)
    d.ellipse([cx-orbit_r, cy-orbit_r, cx+orbit_r, cy+orbit_r], outline=EDGE+(55,), width=max(1, S))
    cdx, cdy = pt(-52, orbit_r)
    base = Image.alpha_composite(base, glow((235, 240, 255), int(cdx), int(cdy), 22*S, 200, 12*S))
    base = Image.alpha_composite(base, glow((240, 245, 255), cx, cy, 40*S, 210, 20*S))
    d = ImageDraw.Draw(base)
    d.ellipse([cx-6*S, cy-6*S, cx+6*S, cy+6*S], fill=(255, 255, 255, 255))

    def dlen(t, f): return d.textlength(t, font=f)
    def sparkle(pxx, pyy, r, col):
        rr = r*0.34
        d.polygon([(pxx, pyy-r), (pxx+rr, pyy-rr), (pxx+r, pyy), (pxx+rr, pyy+rr),
                   (pxx, pyy+r), (pxx-rr, pyy+rr), (pxx-r, pyy), (pxx-rr, pyy-rr)], fill=col)

    fk = font(23*S); ky = int(H*0.545); tr = int(4*S); kick = v["kicker"]
    tw = sum(dlen(c, fk) for c in kick) + tr*(len(kick)-1)
    mark, gap = 9*S, 16*S
    x = (W - (mark*2 + gap + tw))/2
    sparkle(x + mark, ky + int(fk.size*0.42), mark, PERI+(235,))
    x += mark*2 + gap
    for c in kick:
        d.text((x, ky), c, font=fk, fill=PERI+(235,)); x += dlen(c, fk) + tr

    fw = font(78*S)
    wt = "PriSincera"
    d.text(((W - dlen(wt, fw))/2, int(H*0.605)), wt, font=fw, fill=WHITE+(255,))

    ft = font(46*S)
    total = sum(dlen(t, ft) for t, _ in v["line"])
    x = (W - total)/2
    for t, col in v["line"]:
        d.text((x, int(H*0.775)), t, font=ft, fill=tuple(col)+(255,)); x += dlen(t, ft)

    out = os.path.join(OUT_DIR, v["file"])
    base.convert("RGB").resize((1200, 630), Image.LANCZOS).save(out, "PNG", optimize=True)
    print("saved", out)

if __name__ == "__main__":
    args = sys.argv[1:] or ["relearn", "builders", "sylphio"]
    keys = VARIANTS.keys() if "--all" in args else args
    for k in keys:
        render(VARIANTS[k])
