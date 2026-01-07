import os
import requests
import numpy as np

try:
    from astropy_healpix import HEALPix
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

# DSO List provided by user
dsos = [
    {"id": "rosette", "name": "Rosette Nebula", "ra": 98.0, "dec": 5.0, "fov": 3.0},
    {"id": "ngc1499", "name": "California Nebula", "ra": 60.2, "dec": 36.4, "fov": 4.0},
    {"id": "ngc7000", "name": "North America Nebula", "ra": 314.8, "dec": 44.3, "fov": 4.0},
    {"id": "m16", "name": "Eagle Nebula", "ra": 274.7, "dec": -13.8, "fov": 2.0},
    {"id": "m17", "name": "Omega Nebula", "ra": 275.2, "dec": -16.1, "fov": 2.0},
    {"id": "m8", "name": "Lagoon Nebula", "ra": 271.1, "dec": -24.4, "fov": 2.5},
    {"id": "m20", "name": "Trifid Nebula", "ra": 270.6, "dec": -23.0, "fov": 1.5},
    {"id": "ngc7293", "name": "Helix Nebula", "ra": 337.4, "dec": -20.8, "fov": 1.0},
    {"id": "ngc6960", "name": "Veil Nebula", "ra": 311.4, "dec": 30.7, "fov": 4.0},
    {"id": "ngc3372", "name": "Eta Carinae", "ra": 161.2, "dec": -59.7, "fov": 3.0},
    {"id": "m33", "name": "Triangulum Galaxy", "ra": 23.4, "dec": 30.6, "fov": 2.0},
    {"id": "m45", "name": "Pleiades", "ra": 56.7, "dec": 24.1, "fov": 3.0},
]

# Base HiPS URL (DSS2 Color)
BASE_URL = "http://alasky.u-strasbg.fr/DSS/DSSColor"
OUTPUT_BASE = "apps/web-frontend/public/hips"
BASE_PROPERTIES = None

def get_base_properties():
    global BASE_PROPERTIES
    if BASE_PROPERTIES:
        return BASE_PROPERTIES
    
    url = f"{BASE_URL}/properties"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            BASE_PROPERTIES = resp.text
            return BASE_PROPERTIES
    except Exception as e:
        print(f"Failed to fetch base properties: {e}")
    return ""

def get_max_order(fov_deg):
    """
    Determine the maximum order to download based on FOV.
    """
    if fov_deg >= 6.0: return 3
    if fov_deg >= 3.0: return 4
    if fov_deg >= 1.5: return 5
    if fov_deg >= 0.8: return 6
    return 7

def download_file(url, filepath):
    if os.path.exists(filepath):
        return
    
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(resp.content)
            # print(f"Downloaded: {filepath}")
        elif resp.status_code == 404:
            pass
        else:
            print(f"Failed {url}: {resp.status_code}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def create_properties(dso, output_dir, max_order):
    base_props = get_base_properties()
    
    modified_props = []
    
    # Defaults if base fetch fails
    base_map = {
        "hips_tile_format": "jpg",
        "hips_frame": "equatorial",
        "hips_order": str(max_order),
        "hips_pixel_scale": "0.01" # Placeholder
    }
    
    if base_props:
        for line in base_props.splitlines():
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                base_map[key] = val.strip()

    # Overwrite/Add specific fields
    base_map["creator_did"] = f"ivo://CDS/P/DSS2/color/{dso['id']}"
    base_map["obs_title"] = dso['name']
    base_map["hips_initial_ra"] = str(dso['ra'])
    base_map["hips_initial_dec"] = str(dso['dec'])
    base_map["hips_initial_fov"] = str(dso['fov'])
    base_map["hips_order"] = str(max_order)
    
    # Construct new file content
    content = ""
    for k, v in base_map.items():
        content += f"{k} = {v}\n"
    
    # Write to both properties and properties.txt
    for filename in ["properties", "properties.txt"]:
        path = os.path.join(output_dir, filename)
        with open(path, "w") as f:
            f.write(content)
    
    print(f"  Created properties files for {dso['name']}")

def process_dso(dso):
    print(f"Processing {dso['name']} ({dso['id']})...")
    
    out_dir = os.path.join(OUTPUT_BASE, dso['id'])
    os.makedirs(out_dir, exist_ok=True)
    
    max_order = get_max_order(dso['fov'])
    create_properties(dso, out_dir, max_order)
    
    # HiPS uses NESTED ordering.
    
    center = SkyCoord(ra=dso['ra']*u.deg, dec=dso['dec']*u.deg)
    radius = (dso['fov'] / 2.0 * 1.5) * u.deg # 1.5x buffer

    for order in range(max_order + 1):
        nside = 2**order
        hp = HEALPix(nside=nside, order='nested', frame='icrs')
        
        pixels = hp.cone_search_skycoord(center, radius)
        
        print(f"  Order {order}: {len(pixels)} tiles")
        
        for pix in pixels:
            # HiPS directory structure: DirD/NpixP.jpg where D = (P // 10000) * 10000
            dir_idx = (pix // 10000) * 10000
            
            rel_path = f"Norder{order}/Dir{dir_idx}/Npix{pix}.jpg"
            url = f"{BASE_URL}/{rel_path}"
            local_path = os.path.join(out_dir, rel_path)
            
            download_file(url, local_path)

if __name__ == "__main__":
    if not HAS_DEPS:
        print("Missing dependencies. Please run:")
        print("pip install astropy-healpix requests")
    else:
        # Pre-fetch base properties
        get_base_properties()
        for dso in dsos:
            process_dso(dso)
