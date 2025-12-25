"""
Generate a minimal HiPS survey from a DSO image.
This is a simplified version that creates HiPS tiles without healpy.
Uses pre-computed HEALPix pixel positions for the M31 region.

For a proper HiPS generator, use Aladin Desktop or CDS Hipsgen.
"""

from PIL import Image
import os
import json
import math

# Configuration
INPUT_IMAGE = "m31.png"
OUTPUT_DIR = "../hips/m31"

# M31 world coordinates from textures.json
# BL: [12.6537, 39.8284]  BR: [8.9795, 39.6673]
# TL: [12.5152, 42.6567]  TR: [8.6791, 42.4868]
M31_RA = 10.7069    # Center RA in degrees
M31_DEC = 41.1578   # Center Dec in degrees
M31_SIZE = 4.0      # Approximate angular size in degrees

def create_directory(path):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)

def create_properties_file(output_dir, order):
    """Create the HiPS properties file."""
    properties = f"""hips_order = {order}
hips_order_min = 0
hips_tile_width = 512
hips_tile_format = png
hips_frame = equatorial
hips_release_date = 2024-12-24
dataproduct_type = image
obs_title = M31 Andromeda Galaxy
obs_collection = DSO Images
"""
    with open(os.path.join(output_dir, "properties"), "w") as f:
        f.write(properties)
    print(f"Created: {output_dir}/properties")

def create_allsky(img, output_dir, order):
    """Create a low-resolution allsky preview."""
    # For order 0, allsky should be ~64x64 per base pixel
    norder_dir = os.path.join(output_dir, f"Norder{order}")
    create_directory(norder_dir)
    
    # Create a small version of the image as allsky
    allsky_size = 64 * 4  # 256x256 for order 0
    allsky = img.copy()
    allsky.thumbnail((allsky_size, allsky_size), Image.LANCZOS)
    allsky_path = os.path.join(norder_dir, "Allsky.png")
    allsky.save(allsky_path, "PNG")
    print(f"Created: {allsky_path}")

def ra_dec_to_healpix_approx(ra, dec, order):
    """
    Approximate conversion from RA/Dec to HEALPix pixel.
    This is a simplified version - for proper HiPS use a real library.
    
    For M31 at RA~10.7, Dec~41.2:
    - At order 3, M31 falls in approximately pixel 200-210
    """
    # Simplified conversion (not exact HEALPix, just for demonstration)
    # Real HiPS would use proper healpix library
    nside = 2 ** order
    npix = 12 * nside * nside
    
    # Simple spherical to pixel (approximate)
    theta = (90 - dec) * math.pi / 180
    phi = ra * math.pi / 180
    
    # Very rough pixel estimation
    pix = int((1 - math.cos(theta)) / 2 * npix / 2 + phi / (2 * math.pi) * nside * 4)
    return pix % npix

def create_tiles(img, output_dir, max_order=3):
    """Create HiPS tiles at multiple orders."""
    width, height = img.size
    tile_size = 512
    
    for order in range(max_order + 1):
        norder_dir = os.path.join(output_dir, f"Norder{order}")
        create_directory(norder_dir)
        
        if order == 0:
            # Just create allsky for order 0
            create_allsky(img, output_dir, order)
            continue
        
        # For higher orders, create actual tiles
        # Calculate number of tiles needed
        nside = 2 ** order
        tiles_per_side = max(1, width // (tile_size * (2 ** (max_order - order))))
        
        for y in range(tiles_per_side):
            for x in range(tiles_per_side):
                # Calculate source region
                src_tile_size = width // tiles_per_side
                left = x * src_tile_size
                top = y * src_tile_size
                right = left + src_tile_size
                bottom = top + src_tile_size
                
                # Extract and resize tile
                tile = img.crop((left, top, right, bottom))
                tile = tile.resize((tile_size, tile_size), Image.LANCZOS)
                
                # Calculate approximate HEALPix pixel number
                tile_ra = M31_RA + (x - tiles_per_side/2) * M31_SIZE / tiles_per_side
                tile_dec = M31_DEC + (tiles_per_side/2 - y) * M31_SIZE / tiles_per_side
                pix = ra_dec_to_healpix_approx(tile_ra, tile_dec, order) + y * tiles_per_side + x
                
                # Create directory structure
                dir_num = (pix // 10000) * 10000
                dir_path = os.path.join(norder_dir, f"Dir{dir_num}")
                create_directory(dir_path)
                
                # Save tile
                tile_path = os.path.join(dir_path, f"Npix{pix}.png")
                tile.save(tile_path, "PNG")
                print(f"Created: {tile_path}")

def main():
    print("=== Generating HiPS for M31 ===")
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Load image
    if not os.path.exists(INPUT_IMAGE):
        print(f"ERROR: Image not found: {INPUT_IMAGE}")
        return
    
    img = Image.open(INPUT_IMAGE)
    print(f"Loaded: {INPUT_IMAGE} ({img.size[0]}x{img.size[1]})")
    
    # Create output directory
    create_directory(OUTPUT_DIR)
    
    # Create properties file
    create_properties_file(OUTPUT_DIR, 3)
    
    # Create tiles
    create_tiles(img, OUTPUT_DIR, max_order=3)
    
    print("\n=== HiPS generation complete ===")
    print(f"Output directory: {os.path.abspath(OUTPUT_DIR)}")

if __name__ == "__main__":
    main()
