# Crops a photo to the 4:5 frame used by product images and strips metadata (EXIF).
# Run with: python3 -I scripts/crop-demo-photo.py <source.jpg> <dest.jpg> <top offset in px>
import sys
from PIL import Image
# usage: crop.py <source> <dest> <top offset in px>
src, dest, top = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
w, h = im.size
target_h = round(w * 5 / 4)            # 4:5 frame
top = max(0, min(top, h - target_h))
out = im.crop((0, top, w, top + target_h))
# a fresh save drops EXIF and other embedded metadata
out.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
print(dest.split('/')[-1], out.size, "ratio", round(out.size[0] / out.size[1], 3), "crop top", top)
