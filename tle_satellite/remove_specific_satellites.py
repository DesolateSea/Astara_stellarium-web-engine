import json
import shutil

# NORAD numbers of satellites to remove
satellites_to_remove = [
    43466,  # 1KUNS-PF
    44937,  # STARLINK-1079
    44951,  # STARLINK-1126
    44743,  # STARLINK-1038
    44956,  # STARLINK-1070
]

import os

# Base directory of the project
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
skydata_dir = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata')

input_file = os.path.join(skydata_dir, 'tle_satellite.jsonl')
output_file = os.path.join(skydata_dir, 'tle_satellite_temp.jsonl')
backup_file = os.path.join(skydata_dir, 'tle_satellite.jsonl.backup2')

# Create backup
shutil.copy(input_file, backup_file)
print(f"Backup created: {backup_file}\n")

removed_count = 0
kept_count = 0
removed_satellites = []

# Read and filter
with open(input_file, 'r', encoding='utf-8') as f_in:
    with open(output_file, 'w', encoding='utf-8') as f_out:
        for line in f_in:
            line = line.strip()
            if not line:
                continue
            
            try:
                sat_data = json.loads(line)
                norad = sat_data.get('model_data', {}).get('norad_number')
                short_name = sat_data.get('short_name', 'Unknown')
                
                if norad in satellites_to_remove:
                    removed_count += 1
                    removed_satellites.append((norad, short_name))
                    print(f"Removing: {short_name} (NORAD {norad})")
                else:
                    f_out.write(line + '\n')
                    kept_count += 1
                    
            except Exception as e:
                print(f"Error processing line: {e}")
                f_out.write(line + '\n')
                kept_count += 1

# Replace original file with filtered version
shutil.move(output_file, input_file)

print(f"\n{'='*60}")
print(f"SUMMARY")
print(f"{'='*60}")
print(f"Removed: {removed_count} satellites")
print(f"Kept: {kept_count} satellites")
print(f"\nRemoved satellites:")
for norad, name in removed_satellites:
    print(f"  - {name} (NORAD {norad})")

print(f"\n{'='*60}")
print(f"File updated successfully!")
print(f"Next step: Run 'python compress_sat.py' to update the .dat file")
print(f"{'='*60}")
