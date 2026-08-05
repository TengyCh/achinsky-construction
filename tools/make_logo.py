"""Crop the Achinsky logo artboard and convert the white background to alpha.

Technique: alpha = 255 - min(r,g,b), then un-premultiply the colour.
For a logo drawn on white this keeps saturated brand colour fully opaque,
and turns the soft drop shadows into low-alpha grey instead of grey blobs.
"""
from PIL import Image
import numpy as np
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "source", "achinsky-logo-original.jpg")
OUT = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
arr = np.asarray(im).astype(np.int16)

MARK_ROWS = (783, 2210)      # swirl only
WORD_ROWS = (2320, 2598)     # "achinsky" wordmark
FULL_ROWS = (783, 2598)      # complete lockup


def bbox_cols(r0, r1):
    band = arr[r0:r1]
    m = band.max(axis=2) < 245
    cols = np.where(m.any(axis=0))[0]
    return int(cols[0]), int(cols[-1]) + 1


def cut(r0, r1, pad_ratio=0.04):
    c0, c1 = bbox_cols(r0, r1)
    a = arr[r0:r1, c0:c1].astype(np.float64)

    alpha = 255.0 - a.min(axis=2)                     # white -> 0, colour -> ~255
    safe = np.maximum(alpha, 1.0)[..., None] / 255.0
    rgb = np.clip((a - (255.0 - alpha[..., None])) / safe, 0, 255)

    out = np.zeros(a.shape[:2] + (4,), dtype=np.uint8)
    out[..., :3] = rgb.round().astype(np.uint8)
    out[..., 3] = np.clip(alpha, 0, 255).round().astype(np.uint8)

    img = Image.fromarray(out, "RGBA")
    pad = int(max(img.size) * pad_ratio)
    canvas = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad))
    return canvas


def save(img, name, width):
    h = round(img.height * width / img.width)
    r = img.resize((width, h), Image.LANCZOS)
    p = os.path.join(OUT, name)
    r.save(p, optimize=True)
    print(f"{name:22} {r.width}x{r.height}  {os.path.getsize(p)/1024:6.1f} KB")


mark = cut(*MARK_ROWS)
full = cut(*FULL_ROWS)

save(mark, "logo-mark.png", 256)      # header (displayed ~38px, 6x for retina)
save(full, "logo.png", 700)           # full lockup, for reuse

# square icon for favicon / social
side = max(mark.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
save(sq, "favicon.png", 180)
