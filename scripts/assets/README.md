# Astara app icon

`astara-icon.svg` is the editable source for the launcher and web icons. Its
foreground sits inside the central adaptive-icon safe area; the background is
the same deep navy as Android's `ic_launcher_background` color.

Regenerate from the repository root (offline; requires Python and Pillow):

```sh
python3 scripts/generate_android_icons.py
python3 -m unittest discover -s scripts/tests
```

The generator updates all Android density PNGs, the adaptive foreground vector,
the Android 13 themed monochrome vector, web PNGs, and the favicon. Its SVG
renderer deliberately supports only absolute `M`, `L`, `C`, `Z` paths and circles.
Keep the background color resource in sync when editing the SVG background.
Decorative shading and highlights marked `data-themed="false"` are omitted from
the monochrome icon, keeping themed launchers readable instead of merging all
the colored details into a solid blob.
