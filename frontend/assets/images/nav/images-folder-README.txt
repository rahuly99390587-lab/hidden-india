Nav bar background images
===========================

This folder holds the images that fill the top navbar (left to right),
side by side, like a photo strip. There are 5 image slots.

Put your image files here and name them EXACTLY:

  nav-1.jpg
  nav-2.jpg
  nav-3.jpg
  nav-4.jpg
  nav-5.jpg

Each image fills an equal-width slice of the navbar and is auto-cropped
(center-cropped, not stretched) to fit — so photos won't look distorted.

To change a photo later, just replace the file with a new one using the
SAME name (e.g. replace nav-3.jpg) — no code changes needed.

Want fewer or more images (not exactly 5)?
Tell Claude / edit app.js — search for "nav-image-strip" and
add/remove <img> lines there (keep the file naming pattern nav-N.jpg).

Tips:
- Landscape/wide photos work best since each slot is short and wide.
- Compress images (jpg, under ~300-500KB each) so the site stays fast.
- If a slot is empty (file missing), that slice of the bar will look broken —
  make sure all 5 files exist, or remove the matching <img> line in app.js.
