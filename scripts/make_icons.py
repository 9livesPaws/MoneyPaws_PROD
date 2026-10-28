"""Draws the MoneyPaws cat-miner app icon into resources/android-res/ (run once; PNGs are committed)."""
import os
from PIL import Image, ImageDraw

BG = (15, 23, 42, 255)       # #0F172A
SS = 4                        # supersampling for smooth edges

def curve(p0, p1, p2, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts

def draw_cat(d, cx, cy, k):
    """Cat face from the in-app SVG. (cx, cy) = canvas point for SVG (50, 50); k = pixels per SVG unit."""
    def P(x, y): return (cx + (x - 50) * k, cy + (y - 50) * k)
    def poly(pts, fill, outline=None, w=0): d.polygon([P(*p) for p in pts], fill=fill, outline=outline, width=w)
    def ell(x, y, rx, ry, fill): d.ellipse([P(x - rx, y - ry), P(x + rx, y + ry)], fill=fill)
    orange, cream, pink = (245, 158, 11, 255), (253, 230, 138, 255), (253, 164, 175, 255)
    poly([(20, 44), (27, 14), (47, 30)], orange); poly([(80, 44), (73, 14), (53, 30)], orange)
    poly([(26, 38), (29, 22), (40, 31)], pink); poly([(74, 38), (71, 22), (60, 31)], pink)
    ell(50, 60, 33, 28, orange); ell(50, 70, 17, 12, cream)
    hat = curve((22, 46), (50, 6), (78, 46)) + [(22, 46)]
    d.polygon([P(*p) for p in hat], fill=(250, 204, 21, 255), outline=(202, 138, 4, 255), width=int(2 * k))
    d.rounded_rectangle([P(17, 44), P(83, 51)], radius=3.5 * k, fill=(234, 179, 8, 255), outline=(202, 138, 4, 255), width=int(1.5 * k))
    ell(50, 27, 6, 6, (255, 251, 235, 255)); ell(50, 27, 2.6, 2.6, (253, 224, 71, 255))
    ell(37, 62, 3.6, 4.6, (15, 23, 42, 255)); ell(63, 62, 3.6, 4.6, (15, 23, 42, 255))
    ell(38.4, 60.4, 1.2, 1.2, (255, 255, 255, 255)); ell(64.4, 60.4, 1.2, 1.2, (255, 255, 255, 255))
    poly([(46.5, 68), (53.5, 68), (50, 72.5)], (244, 114, 182, 255))
    brown = (120, 53, 15, 255)
    for pts in (curve((50, 72.5), (46, 78), (41, 75)), curve((50, 72.5), (54, 78), (59, 75))):
        d.line([P(*p) for p in pts], fill=brown, width=max(1, int(1.6 * k)))
    for a, b in (((30, 70), (14, 67)), ((30, 74), (14, 76)), ((70, 70), (86, 67)), ((70, 74), (86, 76))):
        d.line([P(*a), P(*b)], fill=brown, width=max(1, int(1.3 * k)))

def render(size, cat_frac, shape):
    """shape: 'foreground' (transparent), 'square' (rounded), 'round'."""
    S = size * SS
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if shape == 'square':
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.22, fill=BG)
    elif shape == 'round':
        d.ellipse([0, 0, S - 1, S - 1], fill=BG)
    # cat is ~66 SVG units wide; scale so it spans cat_frac of the canvas
    k = (S * cat_frac) / 66.0
    draw_cat(d, S / 2, S / 2 + 2 * k, k)
    return img.resize((size, size), Image.LANCZOS)

OUT = os.path.join(os.path.dirname(__file__), '..', 'resources', 'android-res')
LEGACY = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}
ADAPT = {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}
for dens in LEGACY:
    folder = os.path.join(OUT, f'mipmap-{dens}')
    os.makedirs(folder, exist_ok=True)
    render(LEGACY[dens], 0.74, 'square').save(os.path.join(folder, 'ic_launcher.png'))
    render(LEGACY[dens], 0.70, 'round').save(os.path.join(folder, 'ic_launcher_round.png'))
    render(ADAPT[dens], 0.50, 'foreground').save(os.path.join(folder, 'ic_launcher_foreground.png'))
render(512, 0.74, 'square').save(os.path.join(OUT, '..', 'play-store-icon-512.png'))
print('icons written')
