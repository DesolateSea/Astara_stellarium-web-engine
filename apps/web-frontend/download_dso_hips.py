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

# ============================================
# CURATED 80 DSO CATALOG - Beautiful Full Sky Coverage
# Synchronized with src/constants/dsoHips.js
# ============================================

dsos = [
    # RA 0h-2h - Andromeda, Triangulum, Sculptor (7 objects)
    {"id": "m31", "name": "Andromeda Galaxy", "ra": 10.7, "dec": 41.3, "fov": 5.0},
    {"id": "m33", "name": "Triangulum Galaxy", "ra": 23.4, "dec": 30.6, "fov": 2.0},
    {"id": "ngc253", "name": "Sculptor Galaxy", "ra": 11.9, "dec": -25.3, "fov": 1.5},
    {"id": "smc", "name": "Small Magellanic Cloud", "ra": 13.2, "dec": -72.8, "fov": 5.0},
    {"id": "47tuc", "name": "47 Tucanae", "ra": 6.0, "dec": -72.1, "fov": 0.8},
    {"id": "ngc281", "name": "Pacman Nebula", "ra": 13.5, "dec": 56.6, "fov": 1.5},
    {"id": "m74", "name": "Phantom Galaxy", "ra": 24.2, "dec": 15.8, "fov": 0.6},

    # RA 2h-4h - Perseus, Heart/Soul (6 objects)
    {"id": "ngc869", "name": "Double Cluster", "ra": 34.8, "dec": 57.1, "fov": 1.0},
    {"id": "ic1805", "name": "Heart Nebula", "ra": 38.2, "dec": 61.5, "fov": 3.5},
    {"id": "ic1848", "name": "Soul Nebula", "ra": 43.0, "dec": 60.4, "fov": 3.0},
    {"id": "ngc1499", "name": "California Nebula", "ra": 60.2, "dec": 36.4, "fov": 4.0},
    {"id": "ngc1365", "name": "Great Barred Spiral", "ra": 53.4, "dec": -36.1, "fov": 0.8},
    {"id": "ngc1333", "name": "NGC 1333 Nebula", "ra": 52.3, "dec": 31.3, "fov": 0.8},

    # RA 4h-6h - Orion Belt Region (10 objects)
    {"id": "m45", "name": "Pleiades", "ra": 56.7, "dec": 24.1, "fov": 3.0},
    {"id": "m1", "name": "Crab Nebula", "ra": 83.6, "dec": 22.0, "fov": 0.3},
    {"id": "m42", "name": "Orion Nebula", "ra": 83.8, "dec": -5.4, "fov": 2.0},
    {"id": "ic434", "name": "Horsehead Nebula", "ra": 85.2, "dec": -2.5, "fov": 1.5},
    {"id": "ngc2024", "name": "Flame Nebula", "ra": 85.4, "dec": -1.9, "fov": 1.0},
    {"id": "ic2118", "name": "Witch Head Nebula", "ra": 81.0, "dec": -7.2, "fov": 4.0},
    {"id": "ic405", "name": "Flaming Star Nebula", "ra": 81.5, "dec": 34.3, "fov": 1.5},
    {"id": "lmc", "name": "Large Magellanic Cloud", "ra": 80.9, "dec": -69.8, "fov": 10.0},
    {"id": "ngc2070", "name": "Tarantula Nebula", "ra": 84.7, "dec": -69.1, "fov": 1.5},
    {"id": "sim147", "name": "Simeis 147 SNR", "ra": 84.0, "dec": 28.0, "fov": 4.0},

    # RA 6h-8h - Monoceros, Puppis (7 objects)
    {"id": "rosette", "name": "Rosette Nebula", "ra": 98.0, "dec": 5.0, "fov": 3.0},
    {"id": "ngc2264", "name": "Cone Nebula", "ra": 100.2, "dec": 9.9, "fov": 1.5},
    {"id": "ic443", "name": "Jellyfish Nebula", "ra": 94.2, "dec": 22.7, "fov": 1.5},
    {"id": "ngc2359", "name": "Thor's Helmet", "ra": 109.6, "dec": -13.2, "fov": 0.5},
    {"id": "m35", "name": "M35 Cluster", "ra": 92.2, "dec": 24.3, "fov": 0.8},
    {"id": "gum12", "name": "Gum 12 Nebula", "ra": 121.2, "dec": -44.6, "fov": 3.0},
    {"id": "puppisa", "name": "Puppis A SNR", "ra": 125.5, "dec": -43.0, "fov": 1.5},

    # RA 8h-10h - Vela, Cancer (6 objects)
    {"id": "vela_snr", "name": "Vela SNR", "ra": 128.8, "dec": -45.2, "fov": 8.0},
    {"id": "ngc2736", "name": "Pencil Nebula", "ra": 136.4, "dec": -45.9, "fov": 0.8},
    {"id": "m44", "name": "Beehive Cluster", "ra": 130.1, "dec": 19.7, "fov": 2.0},
    {"id": "m81", "name": "Bode's Galaxy", "ra": 148.9, "dec": 69.1, "fov": 1.5},
    {"id": "m82", "name": "Cigar Galaxy", "ra": 148.9, "dec": 69.7, "fov": 0.8},
    {"id": "ngc2903", "name": "NGC 2903 Galaxy", "ra": 143.0, "dec": 21.5, "fov": 0.8},

    # RA 10h-12h - Leo, Carina (7 objects)
    {"id": "m65", "name": "Leo Triplet M65", "ra": 169.7, "dec": 13.1, "fov": 0.6},
    {"id": "m66", "name": "Leo Triplet M66", "ra": 170.1, "dec": 12.9, "fov": 0.6},
    {"id": "ngc3628", "name": "Hamburger Galaxy", "ra": 170.1, "dec": 13.6, "fov": 0.8},
    {"id": "ngc3372", "name": "Eta Carinae Nebula", "ra": 161.2, "dec": -59.7, "fov": 3.0},
    {"id": "ngc3576", "name": "Statue of Liberty", "ra": 168.1, "dec": -61.3, "fov": 1.0},
    {"id": "ic2944", "name": "Running Chicken", "ra": 176.0, "dec": -63.0, "fov": 2.0},
    {"id": "ngc3132", "name": "Eight-Burst Nebula", "ra": 151.8, "dec": -40.4, "fov": 0.3},

    # RA 12h-14h - Virgo, Centaurus (8 objects)
    {"id": "ngc4038", "name": "Antennae Galaxies", "ra": 180.5, "dec": -18.9, "fov": 0.5},
    {"id": "m104", "name": "Sombrero Galaxy", "ra": 190.0, "dec": -11.6, "fov": 0.6},
    {"id": "ngc4565", "name": "Needle Galaxy", "ra": 189.1, "dec": 25.9, "fov": 1.0},
    {"id": "m64", "name": "Black Eye Galaxy", "ra": 194.2, "dec": 21.7, "fov": 0.6},
    {"id": "m51", "name": "Whirlpool Galaxy", "ra": 202.5, "dec": 47.2, "fov": 0.8},
    {"id": "ngc5139", "name": "Omega Centauri", "ra": 201.7, "dec": -47.5, "fov": 1.0},
    {"id": "ngc5128", "name": "Centaurus A", "ra": 201.4, "dec": -43.0, "fov": 1.0},
    {"id": "coalsack", "name": "Coalsack Nebula", "ra": 192.0, "dec": -64.0, "fov": 7.0},

    # RA 14h-16h - Boötes, Lupus (5 objects)
    {"id": "m101", "name": "Pinwheel Galaxy", "ra": 210.8, "dec": 54.3, "fov": 1.5},
    {"id": "m3", "name": "M3 Cluster", "ra": 205.5, "dec": 28.4, "fov": 0.5},
    {"id": "m5", "name": "M5 Cluster", "ra": 229.6, "dec": 2.1, "fov": 0.5},
    {"id": "m106", "name": "M106 Galaxy", "ra": 184.7, "dec": 47.3, "fov": 1.0},
    {"id": "ngc5822", "name": "NGC 5822 Cluster", "ra": 226.0, "dec": -54.3, "fov": 0.5},

    # RA 16h-18h - Scorpius, Ophiuchus (8 objects)
    {"id": "ngc6334", "name": "Cat's Paw Nebula", "ra": 260.8, "dec": -36.0, "fov": 1.5},
    {"id": "ngc6357", "name": "Lobster Nebula", "ra": 262.0, "dec": -34.2, "fov": 2.0},
    {"id": "ic4628", "name": "Prawn Nebula", "ra": 254.0, "dec": -40.4, "fov": 2.0},
    {"id": "ngc6188", "name": "Fighting Dragons", "ra": 250.5, "dec": -48.8, "fov": 2.0},
    {"id": "m13", "name": "Hercules Cluster", "ra": 250.4, "dec": 36.5, "fov": 0.5},
    {"id": "ngc6543", "name": "Cat's Eye Nebula", "ra": 269.6, "dec": 66.6, "fov": 0.2},
    {"id": "rho_oph", "name": "Rho Ophiuchi Cloud", "ra": 247.0, "dec": -24.0, "fov": 5.0},
    {"id": "m4", "name": "M4 Cluster", "ra": 245.9, "dec": -26.5, "fov": 0.5},

    # RA 18h-20h - Sagittarius, Aquila (8 objects)
    {"id": "m8", "name": "Lagoon Nebula", "ra": 271.1, "dec": -24.4, "fov": 2.5},
    {"id": "m20", "name": "Trifid Nebula", "ra": 270.6, "dec": -23.0, "fov": 1.5},
    {"id": "m16", "name": "Eagle Nebula", "ra": 274.7, "dec": -13.8, "fov": 2.0},
    {"id": "m17", "name": "Omega Nebula", "ra": 275.2, "dec": -16.1, "fov": 2.0},
    {"id": "m57", "name": "Ring Nebula", "ra": 283.4, "dec": 33.0, "fov": 0.3},
    {"id": "m27", "name": "Dumbbell Nebula", "ra": 299.9, "dec": 22.7, "fov": 0.5},
    {"id": "ngc6726", "name": "Corona Australis", "ra": 285.3, "dec": -36.9, "fov": 1.5},
    {"id": "m22", "name": "M22 Cluster", "ra": 279.1, "dec": -23.9, "fov": 0.5},

    # RA 20h-22h - Cygnus Region (10 objects)
    {"id": "ngc7000", "name": "North America Nebula", "ra": 314.8, "dec": 44.3, "fov": 4.0},
    {"id": "ic5070", "name": "Pelican Nebula", "ra": 312.8, "dec": 44.4, "fov": 2.5},
    {"id": "ngc6960", "name": "Western Veil Nebula", "ra": 311.4, "dec": 30.7, "fov": 4.0},
    {"id": "ngc6992", "name": "Eastern Veil Nebula", "ra": 314.5, "dec": 31.7, "fov": 3.0},
    {"id": "ngc6888", "name": "Crescent Nebula", "ra": 303.1, "dec": 38.4, "fov": 0.5},
    {"id": "ic1318", "name": "Gamma Cygni Nebula", "ra": 305.3, "dec": 40.2, "fov": 4.0},
    {"id": "ic1396", "name": "Elephant Trunk", "ra": 324.7, "dec": 57.5, "fov": 4.0},
    {"id": "sh2_129", "name": "Flying Bat Nebula", "ra": 315.5, "dec": 60.5, "fov": 4.0},
    {"id": "ngc7023", "name": "Iris Nebula", "ra": 315.6, "dec": 68.2, "fov": 0.5},
    {"id": "ngc6946", "name": "Fireworks Galaxy", "ra": 308.7, "dec": 60.2, "fov": 0.8},

    # RA 22h-24h - Cepheus, Pegasus (6 objects)
    {"id": "ngc7293", "name": "Helix Nebula", "ra": 337.4, "dec": -20.8, "fov": 1.0},
    {"id": "ngc7635", "name": "Bubble Nebula", "ra": 350.2, "dec": 61.2, "fov": 0.5},
    {"id": "ngc7380", "name": "Wizard Nebula", "ra": 341.8, "dec": 58.1, "fov": 1.0},
    {"id": "sh2_155", "name": "Cave Nebula", "ra": 343.0, "dec": 62.6, "fov": 1.5},
    {"id": "ngc7331", "name": "NGC 7331 Galaxy", "ra": 339.3, "dec": 34.4, "fov": 0.7},
    {"id": "stephans_quintet", "name": "Stephan's Quintet", "ra": 339.0, "dec": 33.9, "fov": 0.3},
]

# Base HiPS URL (DSS2 Color)
BASE_URL = "http://alasky.u-strasbg.fr/DSS/DSSColor"
OUTPUT_BASE = "public/hips"
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
    if fov_deg >= 10.0: return 2
    if fov_deg >= 6.0: return 3
    if fov_deg >= 3.0: return 4
    if fov_deg >= 1.5: return 5
    if fov_deg >= 0.8: return 6
    return 7

def is_already_downloaded(dso_id):
    out_dir = os.path.join(OUTPUT_BASE, dso_id)
    properties_path = os.path.join(out_dir, "properties")
    return os.path.exists(properties_path)

def download_file(url, filepath):
    if os.path.exists(filepath):
        return True
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(resp.content)
            return True
        elif resp.status_code == 404:
            return False
        else:
            print(f"Failed {url}: {resp.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def create_properties(dso, output_dir, max_order):
    base_props = get_base_properties()
    base_map = {
        "hips_tile_format": "jpg",
        "hips_frame": "equatorial",
        "hips_order": str(max_order),
        "hips_pixel_scale": "0.01"
    }
    if base_props:
        for line in base_props.splitlines():
            if "=" in line:
                key, val = line.split("=", 1)
                base_map[key.strip()] = val.strip()

    base_map["creator_did"] = f"ivo://CDS/P/DSS2/color/{dso['id']}"
    base_map["obs_title"] = dso['name']
    base_map["hips_initial_ra"] = str(dso['ra'])
    base_map["hips_initial_dec"] = str(dso['dec'])
    base_map["hips_initial_fov"] = str(dso['fov'])
    base_map["hips_order"] = str(max_order)
    
    content = "".join(f"{k} = {v}\n" for k, v in base_map.items())
    for filename in ["properties", "properties.txt"]:
        with open(os.path.join(output_dir, filename), "w") as f:
            f.write(content)
    print(f"  Created properties for {dso['name']}")

def process_dso(dso, force=False):
    if not force and is_already_downloaded(dso['id']):
        print(f"SKIP {dso['name']} ({dso['id']}) - already downloaded")
        return False
    
    print(f"Processing {dso['name']} ({dso['id']})...")
    out_dir = os.path.join(OUTPUT_BASE, dso['id'])
    os.makedirs(out_dir, exist_ok=True)
    
    max_order = get_max_order(dso['fov'])
    create_properties(dso, out_dir, max_order)
    
    center = SkyCoord(ra=dso['ra']*u.deg, dec=dso['dec']*u.deg)
    radius = (dso['fov'] / 2.0 * 1.5) * u.deg

    tiles_downloaded = 0
    for order in range(max_order + 1):
        nside = 2**order
        hp = HEALPix(nside=nside, order='nested', frame='icrs')
        pixels = hp.cone_search_skycoord(center, radius)
        print(f"  Order {order}: {len(pixels)} tiles")
        
        for pix in pixels:
            dir_idx = (pix // 10000) * 10000
            rel_path = f"Norder{order}/Dir{dir_idx}/Npix{pix}.jpg"
            url = f"{BASE_URL}/{rel_path}"
            local_path = os.path.join(out_dir, rel_path)
            if download_file(url, local_path):
                tiles_downloaded += 1
    
    print(f"  Completed {dso['name']}: {tiles_downloaded} tiles")
    return True

def main():
    if not HAS_DEPS:
        print("Missing dependencies. Run: pip install astropy-healpix requests")
        return
    if not os.path.exists("public"):
        print("Run this script from apps/web-frontend directory.")
        return
    
    get_base_properties()
    
    already = [d for d in dsos if is_already_downloaded(d['id'])]
    to_dl = [d for d in dsos if not is_already_downloaded(d['id'])]
    
    print("=" * 50)
    print(f"DSO HiPS Download - 80 Curated Objects")
    print("=" * 50)
    print(f"Total: {len(dsos)} | Downloaded: {len(already)} | New: {len(to_dl)}")
    print("=" * 50)
    
    if not to_dl:
        print("\nAll DSOs already downloaded!")
        return
    
    print(f"\nDownloading {len(to_dl)} new DSOs...\n")
    
    ok, fail = 0, 0
    for i, dso in enumerate(to_dl, 1):
        print(f"\n[{i}/{len(to_dl)}] ", end="")
        try:
            if process_dso(dso): ok += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            fail += 1
    
    print("\n" + "=" * 50)
    print(f"Done! Success: {ok} | Failed: {fail} | Total: {len(already)+ok}")
    print("=" * 50)

if __name__ == "__main__":
    main()
