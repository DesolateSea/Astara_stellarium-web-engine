#!/usr/bin/env python3
"""
Download OpenStreetMap tiles for offline use.
Downloads zoom levels 0-4 which gives a good world overview for location picking.
"""

import os
import urllib.request
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILES_DIR = os.path.join(BASE_DIR, 'public', 'tiles')

# Using ESRI World Imagery - satellite view without political boundaries
TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

# User agent to be polite to tile servers
HEADERS = {
    'User-Agent': 'StellariumWeb/1.0 (Offline Tile Download)'
}

def download_tile(z, x, y):
    """Download a single tile."""
    url = TILE_URL.format(z=z, x=x, y=y)
    tile_dir = os.path.join(TILES_DIR, str(z), str(x))
    tile_path = os.path.join(tile_dir, f'{y}.png')
    
    if os.path.exists(tile_path):
        print(f'  Skipping {z}/{x}/{y} (exists)')
        return True
    
    os.makedirs(tile_dir, exist_ok=True)
    
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=30) as response:
            with open(tile_path, 'wb') as f:
                f.write(response.read())
        print(f'  Downloaded {z}/{x}/{y}')
        return True
    except Exception as e:
        print(f'  Error downloading {z}/{x}/{y}: {e}')
        return False

def download_zoom_level(z):
    """Download all tiles for a zoom level."""
    num_tiles = 2 ** z
    total = num_tiles * num_tiles
    print(f'Downloading zoom level {z} ({total} tiles)...')
    
    success = 0
    for x in range(num_tiles):
        for y in range(num_tiles):
            if download_tile(z, x, y):
                success += 1
            # Be nice to the server
            time.sleep(0.1)
    
    print(f'  Completed: {success}/{total} tiles')
    return success

def main():
    print('Downloading OSM tiles for offline use...')
    print(f'Tiles directory: {TILES_DIR}')
    print()
    
    # Download zoom levels 0-4
    # Level 0: 1 tile
    # Level 1: 4 tiles  
    # Level 2: 16 tiles
    # Level 3: 64 tiles
    # Level 4: 256 tiles
    # Total: 341 tiles
    
    for z in range(5):
        download_zoom_level(z)
        print()
    
    print('Done!')

if __name__ == '__main__':
    main()
