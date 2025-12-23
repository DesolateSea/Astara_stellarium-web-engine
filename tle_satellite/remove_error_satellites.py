import json
import re

# List of satellites with position errors from your log
error_satellites = [
    "STARLINK-1083", "Starlink M", "STARLINK-1093", "DIWATA-1", "STARLINK-1118",
    "RADIX", "SHENZHOU11 MOD", "STARLINK-1072", "Starlink J", "STARLINK-1082",
    "STARLINK-1107", "STARLINK-1117", "Starlink AS", "STARLINK-1061", "NSIGHT",
    "STARLINK-1039", "STARLINK-1071", "BATSU-CS1 (IRAZU)", "STARLINK-1040",
    "STARLINK-1059", "CXO", "STARLINK-1091", "STARLINK-1050", "STARLINK-1069",
    "STARLINK-1028", "STARLINK-1089", "STARLINK-1007", "STARLINK-1080", "Starlink AM",
    "STARLINK-1017", "STARLINK-1090", "STARLINK-1115", "Starlink X", "Iridium 96 ?",
    "FALCON 9 DEB", "STARLINK-1125", "Starlink BD", "1998-067PK", "AEROCUBE 8B",
    "STARLINK-1057", "GPS 2-05 r1", "STARLINK-1067", "STARLINK-1026", "STARLINK-1077",
    "STARLINK-1087", "STARLINK-1046", "Starlink AQ", "Starlink AV", "STARLINK-1066",
    "STARLINK-1076", "AEROCUBE 8A", "STARLINK-1086", "DEBRISSAT-2", "Integral",
    "Starlink L", "STARLINK-1065", "STARLINK-1112", "STARLINK-1075", "STARLINK-1085",
    "STARLINK-1095", "ASTERIA", "TANUSHA-3", "TECHEDSAT 8", "STARLINK-1064",
    "STARLINK-1074", "STARLINK-1121", "STARLINK-1109", "STARLINK-1094", "STARLINK-1100",
    "STARLINK-1012", "Starlink P"
]

# Also extract NORAD numbers from the error satellites
# We'll match by short_name primarily

import os

# Base directory of the project
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
skydata_dir = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata')

input_file = os.path.join(skydata_dir, 'tle_satellite.jsonl')
output_file = os.path.join(skydata_dir, 'tle_satellite_cleaned.jsonl')
backup_file = os.path.join(skydata_dir, 'tle_satellite_backup.jsonl')
removed_file = os.path.join(skydata_dir, 'tle_satellite_removed.jsonl')

# Read the input file
satellites = []
removed_satellites = []
total_count = 0
removed_count = 0

print("Reading satellite data...")
with open(input_file, 'r', encoding='utf-8') as f:
    for line in f:
        total_count += 1
        try:
            sat = json.loads(line.strip())
            short_name = sat.get('short_name', '')
            
            # Check if this satellite should be removed
            if short_name in error_satellites:
                removed_satellites.append(sat)
                removed_count += 1
                print(f"Removing: {short_name}")
            else:
                satellites.append(sat)
        except json.JSONDecodeError as e:
            print(f"Error parsing line {total_count}: {e}")

print(f"\nTotal satellites read: {total_count}")
print(f"Satellites to remove: {removed_count}")
print(f"Satellites to keep: {len(satellites)}")

# Create backup of original file
print("\nCreating backup...")
import shutil
shutil.copy2(input_file, backup_file)
print(f"Backup created: {backup_file}")

# Write cleaned data
print("\nWriting cleaned data...")
with open(output_file, 'w', encoding='utf-8') as f:
    for sat in satellites:
        f.write(json.dumps(sat, ensure_ascii=False) + '\n')
print(f"Cleaned data written to: {output_file}")

# Write removed satellites for reference
print("\nWriting removed satellites...")
with open(removed_file, 'w', encoding='utf-8') as f:
    for sat in removed_satellites:
        f.write(json.dumps(sat, ensure_ascii=False) + '\n')
print(f"Removed satellites written to: {removed_file}")

print("\n=== Summary ===")
print(f"Original file: {total_count} satellites")
print(f"Removed: {removed_count} satellites")
print(f"Remaining: {len(satellites)} satellites")
print(f"\nNext steps:")
print(f"1. Review the cleaned file: {output_file}")
print(f"2. If satisfied, replace the original file")
print(f"3. Copy to other locations (dist, android, etc.)")
