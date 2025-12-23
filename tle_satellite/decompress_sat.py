import gzip
import shutil
import os

# Base directory of the project
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

src = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata', 'tle_satellite.dat')
dst = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata', 'tle_satellite.jsonl')

if os.path.exists(src):
    with gzip.open(src, 'rb') as f_in:
        with open(dst, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    print(f"Decompressed {src} to {dst}")
else:
    print(f"Source file {src} not found")
