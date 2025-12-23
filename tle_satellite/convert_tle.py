import json
import os
from datetime import datetime, timedelta

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_FILE = os.path.join(BASE_DIR, 'tle_satellite', 'tle_base.txt')
OUTPUT_FILE = os.path.join(BASE_DIR, 'apps', 'web-frontend', 'public', 'skydata', 'tle_satellite.jsonl')

# Filtering Settings
MAX_AGE_DAYS = 60  # Only include TLEs updated in the last 60 days
FILTER_OPERATIONAL = True  # Try to exclude debris and rocket bodies

def parse_tle_epoch(tle_line1):
    """Extract epoch from TLE line 1: YYDDD.DDDDDDDD"""
    try:
        epoch_str = tle_line1[18:32].strip()
        year_part = int(epoch_str[:2])
        # Assumes 1957-2056 range
        year = year_part + 2000 if year_part < 57 else year_part + 1900
        day_of_year = float(epoch_str[2:])
        
        # Calculate the date
        epoch = datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
        return epoch
    except Exception:
        return None

def is_operational(name):
    """
    Heuristic to check if a satellite is likely operational.
    Excludes known debris and rocket body markers.
    """
    name = name.upper()
    exclude_markers = [' DEB', ' R/B', ' DEBRIS', ' ROCKET BODY']
    for marker in exclude_markers:
        if marker in name:
            return False
    return True

def alphatoneumeric(char):
    """Convert Alpha-5 character to base-10 prefix"""
    if char.isdigit():
        return int(char)
    val = ord(char.upper())
    if 65 <= val <= 90: # A-Z
        return val - 55 # A is 10, B is 11...
    return 0

def parse_norad_id(id_str):
    """Parse NORAD ID string, handling Alpha-5 format"""
    id_str = id_str.strip()
    if id_str.isdigit():
        return int(id_str)
    
    # Handle Alpha-5 (e.g. T0000)
    try:
        prefix = alphatoneumeric(id_str[0])
        suffix = int(id_str[1:])
        return prefix * 10000 + suffix
    except Exception:
        return 0

def get_launch_date(designation):
    """
    Extract launch year from designation (COSPAR ID: YYNNNSSS)
    Example: 63014D -> 1963
    """
    designation = designation.strip()
    if not designation or len(designation) < 2:
        return None
    
    try:
        year_part = int(designation[:2])
        year = year_part + 2000 if year_part < 57 else year_part + 1900
        return datetime(year, 1, 1)
    except Exception:
        return None

def get_group(name):
    """Heuristic to group satellites based on their name"""
    name = name.upper()
    if "STARLINK" in name:
        return ["Starlink"]
    if "ONEWEB" in name:
        return ["OneWeb"]
    if "GLONASS" in name:
        return ["Glonass"]
    if "GPS" in name:
        return ["GPS"]
    if "COSMOS" in name:
        return ["Cosmos"]
    if "BEIDOU" in name:
        return ["Beidou"]
    if "IRIDIUM" in name:
        return ["Iridium"]
    if "ISS" in name or "ZARYA" in name:
        return ["ISS"]
    return ["Satellites"]

def convert_and_filter():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file not found at {INPUT_FILE}")
        return

    current_date = datetime.now()
    stats = {
        'total': 0,
        'converted': 0,
        'filtered_age': 0,
        'filtered_status': 0,
        'filtered_tba': 0,
        'errors': 0
    }

    print(f"Starting conversion from {INPUT_FILE}...")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f_in, \
         open(OUTPUT_FILE, 'w', encoding='utf-8') as f_out:
        
        lines = f_in.readlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            
            # Check if this is Line 0 (Name)
            if (i+1 < len(lines) and lines[i+1].startswith('1 ')) and \
               (i+2 < len(lines) and lines[i+2].startswith('2 ')):
                
                line0 = line
                line1 = lines[i+1].strip()
                line2 = lines[i+2].strip()
                i += 3
            else:
                i += 1
                continue

            stats['total'] += 1
            
            try:
                # 1. Clean up name (Line 0)
                name = line0[2:].strip() if line0.startswith('0 ') else line0.strip()
                
                # Filter out TBA (To Be Assigned)
                if name.upper() == "TBA - TO BE ASSIGNED" or "TBA" in name.upper():
                    stats['filtered_tba'] += 1
                    continue

                # 2. Extract Metadata from TLE
                norad_str = line1[2:7]
                norad_number = parse_norad_id(norad_str)
                designation = line1[9:17].strip()
                
                # 3. TLE Time Filter (Data freshness)
                epoch = parse_tle_epoch(line1)
                if not epoch:
                    stats['errors'] += 1
                    continue
                    
                age_days = (current_date - epoch).days
                if age_days > MAX_AGE_DAYS:
                    stats['filtered_age'] += 1
                    continue
                
                # 4. Operational Filter (Heuristic)
                if FILTER_OPERATIONAL and not is_operational(name):
                    stats['filtered_status'] += 1
                    continue

                # 5. Build JSON Object
                launch_date_dt = get_launch_date(designation)
                sat_obj = {
                    "types": ["Asa"],
                    "model": "tle_satellite",
                    "model_data": {
                        "norad_number": norad_number,
                        "designation": designation,
                        "tle": [line1, line2],
                        "group": get_group(name),
                        "status": "Operational",
                        "owner": "Unknown",
                        "launch_date": launch_date_dt.strftime('%Y-%m-%d') if launch_date_dt else "Unknown"
                    },
                    "names": [f"NAME {name}", f"NORAD {norad_number}"],
                    "short_name": name,
                    "interest": 1.0
                }

                f_out.write(json.dumps(sat_obj, ensure_ascii=False) + '\n')
                stats['converted'] += 1
            except Exception as e:
                print(f"Error processing {line0}: {e}")
                stats['errors'] += 1

    print("\n=== Conversion Summary ===")
    print(f"Total objects processed: {stats['total']}")
    print(f"Successfully converted: {stats['converted']}")
    print(f"Filtered out (TLE too old): {stats['filtered_age']}")
    print(f"Filtered out (not operational): {stats['filtered_status']}")
    print(f"Filtered out (TBA): {stats['filtered_tba']}")
    print(f"Errors: {stats['errors']}")
    print(f"\nResult saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    convert_and_filter()
