"""Turn the raw phone photos in Downloads/Site Files into web-ready gallery images.

- crops the finished "after" panel out of the 2x2 before/after collages
- fixes EXIF rotation, resizes to 4:3 (matching the gallery card aspect)
- saves optimised progressive JPEG, targeting < 400 KB
"""
from PIL import Image, ImageOps
import os

SRC = r"C:\Users\tengi\Downloads\Site Files"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

M = "Messenger_creation_"

# out_name: (source file, crop, vertical framing)
#   crop None      -> use whole image
#   crop "r,c"     -> take that cell of a 2x2 collage (row, col, 0-indexed)
#   framing 0.0    -> keep the top of the frame, 0.5 = centre, 1.0 = keep the bottom.
#                     Interiors usually want a bias upward so the shot isn't all floor.
JOBS = {
    # --- commercial ---
    "salon.jpg":               (M + "4357C3DA-776E-4CC4-92D9-A5B6DF89F7D9.jpeg", "1,0", 0.40),
    "luma-head-spa.jpg":       (M + "B71DAB29-8500-4B37-BCD6-2F6B1470ACD4.jpeg", None,  0.42),
    "blue-kale-cafe.jpg":      ("Blue Kale.jpeg",                                 None,  0.50),
    "shalom-nail-salon.jpg":   ("salon pic.jpg",                                  None,  0.38),
    # --- residential ---
    "kitchen-glenview.jpg":    (M + "9518B0B6-9E9D-44CB-9084-FC20D0566CBF.jpeg", "1,1", 0.45),
    # the collage's own "AFTER" panels have that word burned into the pixels, so use
    # the pre-cropped clean version even though it is lower resolution
    "bathroom-chicago.jpg":    (M + "9468F35F-0E7F-44A6-9313-739F54007C7D_edited.jpg", None, 0.45),
    "living-chicago.jpg":      (M + "A2EDAED4-E0FE-4A7F-85F3-49BF45528E10.jpeg", "1,1", 0.45),
    "kitchen-skokie.jpg":      (M + "ED455162-94EF-456C-B872-B97EE3354D1A.jpeg", None,  0.42),
    "garage-morton-grove.jpg": (M + "573046CB-DC8A-493B-8CDF-3A8AADE44371.jpeg", "1,0", 0.25),
    "living-ulaanbaatar.jpg":  (M + "510F301B-87DE-4070-B327-9305AB90EF5A.jpeg", None,  0.50),
}

# 4:3, matching the gallery card. Cards render ~285-380px wide, so 1200px still
# covers 3x retina without upscaling the smaller collage-panel sources.
TARGET_W, TARGET_H = 1200, 900
MAX_KB = 400


def quadrant(im, spec):
    r, c = (int(x) for x in spec.split(","))
    w, h = im.size
    return im.crop((c * w // 2, r * h // 2, (c + 1) * w // 2, (r + 1) * h // 2))


def save_jpeg(im, path):
    """Step quality down until the file is comfortably small."""
    for q in (86, 82, 78, 74, 70):
        im.save(path, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(path) / 1024 <= MAX_KB:
            return q
    return q


for name, (src_file, crop, framing) in JOBS.items():
    src = os.path.join(SRC, src_file)
    if not os.path.exists(src):
        print(f"!! MISSING {src_file}")
        continue

    im = Image.open(src)
    im = ImageOps.exif_transpose(im)      # honour phone rotation
    im = im.convert("RGB")

    if crop:
        im = quadrant(im, crop)

    # Never upscale — a small source blown up just looks soft. Shrink the 4:3 box
    # to whatever the source can actually fill; CSS sizes the card either way.
    w = min(TARGET_W, im.width, im.height * TARGET_W // TARGET_H)
    h = w * TARGET_H // TARGET_W

    im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, framing))

    dst = os.path.join(OUT, name)
    q = save_jpeg(im, dst)
    print(f"{name:26} {im.size[0]}x{im.size[1]}  q{q}  {os.path.getsize(dst)/1024:6.1f} KB")
