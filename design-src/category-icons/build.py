import sys, math, os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage as ndi
import cv2

SRC = sys.argv[1]
OUT = sys.argv[2]
SIZE = 432          # final square size (72 css px x 6)
PEEL = 5
SMOOTH_BOTTOM = {'kadin', 'kitap', 'erkek'}
GRAD = 8
STRIP_H = 9
STRIP_MIN = 196
NO_STRIP = {'elektronik', 'kitap', 'kadin', 'ev'}
FIT = 0.985         # how much of the circle the icon may use

im = Image.open(SRC).convert('RGBA')
A = np.array(im).astype(np.float32)
al_full = A[..., 3]
lab, n = ndi.label(al_full > 60)
objs = ndi.find_objects(lab)
sizes = ndi.sum(al_full > 60, lab, range(1, n + 1))
comps = [(i + 1, objs[i]) for i in range(n) if sizes[i] > 20000]
def band(sl):
    c = (sl[0].start + sl[0].stop) / 2
    return 0 if c < 400 else (1 if c < 700 else 2)
comps.sort(key=lambda c: (band(c[1]), c[1][1].start))
names = ['erkek','kadin','anne-cocuk','ev','supermarket','kozmetik','saat','elektronik','spor','kitap','otomobil']

PEEL_ICONS = {'supermarket', 'kozmetik', 'saat', 'elektronik', 'spor', 'otomobil', 'erkek'}

def cut(idx, sl, name):
    y0, y1 = sl[0].start - 6, sl[0].stop + 6
    x0, x1 = sl[1].start - 6, sl[1].stop + 6
    crop = A[y0:y1, x0:x1].copy()
    rgb = crop[..., :3]; a = crop[..., 3]
    comp = (lab[y0:y1, x0:x1] == idx)
    mx = rgb.max(-1); mn = rgb.min(-1)
    platformish = (mn >= 188) & ((mx - mn) <= 18) & (a > 8)
    lum = rgb.mean(-1)
    g = np.hypot(ndi.sobel(lum, 1), ndi.sobel(lum, 0)) / 8
    cand = platformish & (g < 5.5)
    ys = np.where(comp.any(1))[0]; ybot = ys.max()
    seed = np.zeros_like(cand)
    seed[max(0, ybot - int((ybot - ys.min()) * 0.06)):ybot + 1] = True
    seed &= cand
    plat, _ = ndi.label(cand)
    ids = np.unique(plat[seed]); ids = ids[ids > 0]
    pm0 = np.isin(plat, ids)
    pm = ndi.binary_dilation(pm0, iterations=2)
    # the soft gradient right under an object is darker than the flat floor:
    # claim the grey-ish pixels within a few pixels of the floor as well
    grayish = (mn >= 140) & ((mx - mn) <= 26)
    g_it = 16 if name == 'otomobil' else GRAD
    if name == 'otomobil':
        grayish = (mn >= 100) & ((mx - mn) <= 26)
    pm = pm | (ndi.binary_dilation(pm0, iterations=g_it) & grayish)
    keep = (a >= 150) & (~pm)
    l2, n2 = ndi.label(keep)
    sz = ndi.sum(keep, l2, range(1, n2 + 1))
    good = [i + 1 for i, s in enumerate(sz) if s > 0.03 * sz.max()]
    keep = np.isin(l2, good)
    # peel thin pale wisps (leftover floor shadow) that touch the outside
    pl = (mn >= 200) & ((mx - mn) <= 20)
    yy, xx = np.ogrid[-PEEL:PEEL + 1, -PEEL:PEEL + 1]
    disk = (xx * xx + yy * yy) <= PEEL * PEEL
    thin = pl & ~ndi.binary_opening(pl, structure=disk) & keep
    if name not in PEEL_ICONS:
        thin = thin & False
    for _ in range(3):
        reach = ndi.binary_propagation(~keep, mask=(thin | ~keep))
        keep = keep & ~(reach & thin)
        thin = thin & keep
    # also peel thin horizontal strips of pale floor shadow (thin in height)
    if name not in NO_STRIP:
        plv = (mn >= STRIP_MIN) & ((mx - mn) <= 22)
        vopen = ndi.binary_opening(plv, structure=np.ones((STRIP_H, 1), bool))
        thin_v = plv & ~vopen & keep
        for _ in range(4):
            reach = ndi.binary_propagation(~keep, mask=(thin_v | ~keep))
            keep = keep & ~(reach & thin_v)
            thin_v = thin_v & keep
    l3, n3 = ndi.label(keep)
    sz3 = ndi.sum(keep, l3, range(1, n3 + 1))
    keep = np.isin(l3, [i + 1 for i, v in enumerate(sz3) if v > 0.03 * sz3.max()])
    filled = ndi.binary_fill_holes(keep)
    hole_lab, hn = ndi.label(filled & ~keep)
    if hn:
        hs = ndi.sum(filled & ~keep, hole_lab, range(1, hn + 1))
        small = [i + 1 for i, v in enumerate(hs) if v < 250]
        keep = keep | np.isin(hole_lab, small)
    if name in SMOOTH_BOTTOM:
        ys2 = np.where(keep.any(1))[0]
        cut_y = ys2.max() - int((ys2.max() - ys2.min()) * 0.2)
        yy2, xx2 = np.ogrid[-3:4, -3:4]
        opened = ndi.binary_opening(keep, structure=(xx2 * xx2 + yy2 * yy2) <= 9)
        keep[cut_y:] = opened[cut_y:]
        l4, n4 = ndi.label(keep)
        sz4 = ndi.sum(keep, l4, range(1, n4 + 1))
        keep = np.isin(l4, [i + 1 for i, v in enumerate(sz4) if v > 0.03 * sz4.max()])
    soft = ndi.gaussian_filter(keep.astype(np.float32), 0.7)
    alpha = np.clip(soft * 255, 0, 255)
    return Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')

icons = {name: cut(idx, sl, name) for (idx, sl), name in zip(comps, names)}

# ---------------------------------------------------------------- faces
SS = 4
def face_layer(size, eyes, mouth, nose=None, eye_rx=5.0, eye_ry=6.2, brow=True, smile_w=3.0, tilt=0.0):
    """Draw a friendly clay-style face on a transparent layer. eyes=((x,y),(x,y)), mouth=(cx,cy,half_width,depth)."""
    W, H = size
    layer = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    def S(v): return v * SS
    # blush
    blush = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(blush)
    (lx, ly), (rx, ry) = eyes
    ew = abs(rx - lx)
    for (ex, ey, sgn) in [(lx, ly, -1), (rx, ry, 1)]:
        cx = ex + sgn * ew * 0.18; cy = ey + eye_ry * 2.5
        bd.ellipse([S(cx - ew*0.26), S(cy - ew*0.15), S(cx + ew*0.26), S(cy + ew*0.15)], fill=(255, 125, 125, 70))
    blush = blush.filter(ImageFilter.GaussianBlur(SS * 3.2))
    layer.alpha_composite(blush)
    d = ImageDraw.Draw(layer)
    # nose: soft little shadow + highlight
    if nose:
        nx, ny = nose
        sh = Image.new('RGBA', layer.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sd.ellipse([S(nx - 4.2), S(ny - 2.4), S(nx + 4.2), S(ny + 3.2)], fill=(196, 128, 100, 120))
        sh = sh.filter(ImageFilter.GaussianBlur(SS * 1.3))
        layer.alpha_composite(sh)
        d = ImageDraw.Draw(layer)
        d.ellipse([S(nx - 1.4), S(ny - 3.2), S(nx + 1.0), S(ny - 1.2)], fill=(255, 235, 220, 150))
    # eyebrows
    if brow:
        for (ex, ey, sgn) in [(lx, ly, -1), (rx, ry, 1)]:
            by = ey - eye_ry * 1.95
            pts = []
            for t in np.linspace(0, 1, 14):
                x = ex + sgn * (-eye_rx * 1.5 + t * eye_rx * 3.0) * (-1 if sgn == -1 else 1) * (1 if sgn == 1 else 1)
                pts.append((x, by - 2.6 * math.sin(t * math.pi)))
            d.line([(S(x), S(y)) for x, y in pts], fill=(70, 46, 40, 235), width=int(S(1.9)), joint='curve')
            for (x, y) in (pts[0], pts[-1]):
                d.ellipse([S(x - 0.95), S(y - 0.95), S(x + 0.95), S(y + 0.95)], fill=(70, 46, 40, 235))
    # eyes
    for (ex, ey) in eyes:
        d.ellipse([S(ex - eye_rx), S(ey - eye_ry), S(ex + eye_rx), S(ey + eye_ry)], fill=(46, 30, 28, 255))
        d.ellipse([S(ex - eye_rx * 0.1), S(ey - eye_ry * 0.62), S(ex + eye_rx * 0.62), S(ey - eye_ry * 0.05)], fill=(255, 255, 255, 245))
        d.ellipse([S(ex - eye_rx * 0.55), S(ey + eye_ry * 0.25), S(ex - eye_rx * 0.12), S(ey + eye_ry * 0.62)], fill=(255, 255, 255, 150))
    # smile: open, happy mouth (dark inside, tongue, teeth line) 
    cx, cy, hw, depth = mouth
    outline = []
    for t in np.linspace(0, 1, 40):
        x = cx - hw + 2 * hw * t
        y = cy + depth * math.sin(t * math.pi)       # lower lip curve
        outline.append((x, y))
    upper = []
    for t in np.linspace(1, 0, 40):
        x = cx - hw + 2 * hw * t
        y = cy + depth * 0.18 * math.sin(t * math.pi)  # nearly flat upper lip
        upper.append((x, y))
    poly = outline + upper
    mask = Image.new('L', layer.size, 0)
    ImageDraw.Draw(mask).polygon([(S(x), S(y)) for x, y in poly], fill=255)
    mouth_img = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    md = ImageDraw.Draw(mouth_img)
    md.polygon([(S(x), S(y)) for x, y in poly], fill=(120, 38, 40, 255))
    # tongue
    tmask = Image.new('L', layer.size, 0)
    ImageDraw.Draw(tmask).ellipse([S(cx - hw * 0.45), S(cy + depth * 0.45), S(cx + hw * 0.45), S(cy + depth * 1.25)], fill=255)
    tongue = Image.new('RGBA', layer.size, (255, 112, 124, 255))
    mouth_img.paste(tongue, (0, 0), Image.fromarray(np.minimum(np.array(mask), np.array(tmask))))
    # teeth
    teeth_mask = Image.new('L', layer.size, 0)
    ImageDraw.Draw(teeth_mask).rectangle([S(cx - hw), S(cy - 1), S(cx + hw), S(cy + depth * 0.36)], fill=255)
    teeth = Image.new('RGBA', layer.size, (255, 250, 245, 255))
    mouth_img.paste(teeth, (0, 0), Image.fromarray(np.minimum(np.array(mask), np.array(teeth_mask))))
    layer.alpha_composite(mouth_img)
    d = ImageDraw.Draw(layer)
    # lip outline
    d.line([(S(x), S(y)) for x, y in poly + [poly[0]]], fill=(120, 50, 48, 255), width=int(S(1.5)), joint='curve')
    layer = layer.resize((W, H), Image.LANCZOS)
    return layer

def add_face(img, **kw):
    lay = face_layer(img.size, **kw)
    out = img.copy(); out.alpha_composite(lay); return out

FACES = {
 'erkek':  [dict(eyes=((127, 119), (176, 119)), mouth=(151.5, 150, 17, 11), nose=(151.5, 137), eye_rx=5.0, eye_ry=6.4)],
 'kadin':  [dict(eyes=((109, 109), (151, 109)), mouth=(130, 140, 15, 10), nose=(130, 127), eye_rx=4.8, eye_ry=6.2)],
}
for k, lst in FACES.items():
    for f in lst:
        icons[k] = add_face(icons[k], **f)

# ---- anne-cocuk: Microsoft Fluent Emoji 3D (MIT) "woman feeding baby", light skin
FLUENT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fluent-woman-baby.webp')
if os.path.exists(FLUENT):
    icons['anne-cocuk'] = Image.open(FLUENT).convert('RGBA')

# ------------------------------------------------- car + motorcycle layout
car_full = icons['otomobil']
arr = np.array(car_full)
al = arr[..., 3] > 60
cols = (arr[..., 3] > 60).sum(0)
W0 = arr.shape[1]
lo, hi = int(W0 * 0.55), int(W0 * 0.85)
split = lo + int(np.argmin(cols[lo:hi]))
print('otomobil split at', split, 'of', W0, 'min col count', cols[split])
def tight(img):
    bb = Image.fromarray((np.array(img)[..., 3] > 40).astype(np.uint8) * 255).getbbox()
    return img.crop(bb)
left = Image.fromarray(arr.copy()); right = Image.fromarray(arr.copy())
la = np.array(left); la[:, split:, 3] = 0; left = Image.fromarray(la)
ra = np.array(right); ra[:, :split, 3] = 0; right = Image.fromarray(ra)
car = tight(left); moto = tight(right)

def drop_grey_shadow(img):
    arr3 = np.array(img).astype(np.int32)
    rgb3 = arr3[..., :3]; a3 = arr3[..., 3]
    lum3 = rgb3.mean(-1); chroma3 = rgb3.max(-1) - rgb3.min(-1)
    g3 = (chroma3 <= 24) & (lum3 >= 110) & (lum3 <= 245)
    solid = a3 >= 128
    reach = ndi.binary_propagation(~solid, mask=(g3 | ~solid))
    kill = ndi.binary_dilation(reach & g3, iterations=1) & g3
    solid2 = solid & ~kill
    l5, n5 = ndi.label(solid2)
    sz5 = ndi.sum(solid2, l5, range(1, n5 + 1))
    solid2 = np.isin(l5, [i + 1 for i, v in enumerate(sz5) if v > 0.05 * sz5.max()])
    soft = ndi.gaussian_filter(solid2.astype(np.float32), 0.7)
    out = np.dstack([rgb3, np.clip(soft * 255, 0, 255)]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

car = drop_grey_shadow(car)
cs, ms = 1.32, 1.42
car = car.resize((int(car.width * cs), int(car.height * cs)), Image.LANCZOS)
moto = moto.resize((int(moto.width * ms), int(moto.height * ms)), Image.LANCZOS)
CW = int(car.width * 0.74 + moto.width); CH = int(max(car.height + moto.height * 0.42, moto.height))
canvas = Image.new('RGBA', (CW + 40, CH + 40), (0, 0, 0, 0))
canvas.alpha_composite(car, (0, 0))
canvas.alpha_composite(moto, (int(car.width * 0.74), CH - moto.height + 20))
icons['otomobil'] = canvas

# ------------------------------------------------------ fit into the circle
def fit(img):
    arr = np.array(img)
    ys, xs = np.where(arr[..., 3] > 40)
    pts = np.stack([xs, ys], 1).astype(np.float32)
    (cx, cy), r = cv2.minEnclosingCircle(pts)
    side = 2 * r / FIT
    x0 = cx - side / 2; y0 = cy - side / 2
    sq = Image.new('RGBA', (int(math.ceil(side)), int(math.ceil(side))), (0, 0, 0, 0))
    sq.paste(img, (int(round(-x0)), int(round(-y0))))
    return sq.resize((SIZE, SIZE), Image.LANCZOS), (cx, cy, r)

import os
os.makedirs(OUT, exist_ok=True)
for name, img in icons.items():
    sq, info = fit(img)
    sq.save(f'{OUT}/{name}.webp', 'WEBP', quality=90, alpha_quality=100, method=6)
    print(name, 'enclosing r=%.0f' % info[2], os.path.getsize(f'{OUT}/{name}.webp') // 1024, 'KB')
