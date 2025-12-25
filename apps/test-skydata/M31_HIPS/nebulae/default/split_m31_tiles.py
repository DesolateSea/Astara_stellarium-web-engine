"""
Split M31 image into 2x2 tiles for better spherical projection alignment.
Each tile will have its own calibration parameters.
"""

from PIL import Image
import os

# Paths
INPUT_IMAGE = "m31.png"
OUTPUT_DIR = "m31_tiles"

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load image
img = Image.open(INPUT_IMAGE)
width, height = img.size
print(f"Original image size: {width}x{height}")

# Calculate tile sizes
tile_w = width // 2
tile_h = height // 2

# Define tiles: (row, col) -> (left, top, right, bottom)
tiles = {
    "m31_tile_00.png": (0, 0, tile_w, tile_h),               # Top-left
    "m31_tile_01.png": (tile_w, 0, width, tile_h),           # Top-right
    "m31_tile_10.png": (0, tile_h, tile_w, height),          # Bottom-left
    "m31_tile_11.png": (tile_w, tile_h, width, height),      # Bottom-right
}

# Extract and save tiles
for name, box in tiles.items():
    tile = img.crop(box)
    output_path = os.path.join(OUTPUT_DIR, name)
    tile.save(output_path, "PNG")
    print(f"Saved: {output_path} ({tile.size[0]}x{tile.size[1]})")

print("\nDone! Tiles saved to:", OUTPUT_DIR)

# Calculate corner coordinates for each tile
# M31 world coordinates from textures.json:
# BL: [12.6537, 39.8284]  BR: [8.9795, 39.6673]
# TL: [12.5152, 42.6567]  TR: [8.6791, 42.4868]

bl = (12.6537, 39.8284)
br = (8.9795, 39.6673)
tl = (12.5152, 42.6567)
tr = (8.6791, 42.4868)

def lerp(a, b, t):
    """Linear interpolation between two points"""
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

# Calculate mid-points
mid_bottom = lerp(bl, br, 0.5)
mid_top = lerp(tl, tr, 0.5)
mid_left = lerp(bl, tl, 0.5)
mid_right = lerp(br, tr, 0.5)
center = lerp(mid_bottom, mid_top, 0.5)

print("\n=== Tile Coordinates ===")
print(f"Bottom-Left: {bl}")
print(f"Bottom-Right: {br}")
print(f"Top-Left: {tl}")
print(f"Top-Right: {tr}")
print(f"Mid-Bottom: {mid_bottom}")
print(f"Mid-Top: {mid_top}")
print(f"Mid-Left: {mid_left}")
print(f"Mid-Right: {mid_right}")
print(f"Center: {center}")

# Calculate calibration for each tile
tile_configs = {
    "m31_tile_00.png": {  # Top-left
        "corners": [mid_left, center, mid_top, tl],
        "center": lerp(lerp(tl, mid_top, 0.5), lerp(mid_left, center, 0.5), 0.5)
    },
    "m31_tile_01.png": {  # Top-right
        "corners": [center, mid_right, tr, mid_top],
        "center": lerp(lerp(mid_top, tr, 0.5), lerp(center, mid_right, 0.5), 0.5)
    },
    "m31_tile_10.png": {  # Bottom-left
        "corners": [bl, mid_bottom, center, mid_left],
        "center": lerp(lerp(bl, mid_bottom, 0.5), lerp(mid_left, center, 0.5), 0.5)
    },
    "m31_tile_11.png": {  # Bottom-right
        "corners": [mid_bottom, br, mid_right, center],
        "center": lerp(lerp(mid_bottom, br, 0.5), lerp(center, mid_right, 0.5), 0.5)
    },
}

print("\n=== Tile Calibration Data ===")
for name, data in tile_configs.items():
    center_ra, center_dec = data["center"]
    # Calculate approximate angular size per tile (half the full image)
    # Full image is ~4 degrees, each tile is ~2 degrees
    # For tile size pixels (half of original), calculate pixscale
    angular_size_deg = 2.0  # Approximate for each tile
    pixscale = (angular_size_deg * 3600) / tile_w
    
    print(f"\n{name}:")
    print(f"  ra: {center_ra:.4f}")
    print(f"  dec: {center_dec:.4f}")
    print(f"  pixscale: {pixscale:.2f}")
    print(f"  orientation: 37")  # Same orientation for all
