import json
from datetime import datetime, timedelta

def parse_tle_epoch(tle_line1):
    """Extract epoch from TLE line 1"""
    # TLE epoch is in format YYDDD.DDDDDDDD (year + day of year)
    epoch_str = tle_line1[18:32].strip()
    year = int(epoch_str[:2])
    # Convert 2-digit year to 4-digit (assumes 1957-2056 range)
    year = year + 2000 if year < 57 else year + 1900
    day_of_year = float(epoch_str[2:])
    
    # Calculate the date
    epoch = datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
    return epoch

def filter_satellites(input_file, output_file, max_age_days=365):
    """Filter satellites with TLE data older than max_age_days"""
    current_date = datetime.now()
    kept_count = 0
    removed_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as f_in:
        with open(output_file, 'w', encoding='utf-8') as f_out:
            for line in f_in:
                line = line.strip()
                if not line:
                    continue
                    
                try:
                    sat_data = json.loads(line)
                    tle = sat_data.get('model_data', {}).get('tle', [])
                    
                    if len(tle) >= 2:
                        epoch = parse_tle_epoch(tle[0])
                        age_days = (current_date - epoch).days
                        
                        if age_days <= max_age_days:
                            f_out.write(line + '\n')
                            kept_count += 1
                        else:
                            removed_count += 1
                            print(f"Removed {sat_data.get('short_name', 'Unknown')}: {age_days} days old")
                    else:
                        removed_count += 1
                        
                except Exception as e:
                    print(f"Error processing line: {e}")
                    removed_count += 1
    
    print(f"\nSummary:")
    print(f"Kept: {kept_count} satellites")
    print(f"Removed: {removed_count} satellites (TLE data older than {max_age_days} days)")

if __name__ == "__main__":
    import os
    # Base directory of the project
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skydata_dir = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata')

    input_file = os.path.join(skydata_dir, 'tle_satellite.jsonl')
    output_file = os.path.join(skydata_dir, 'tle_satellite_filtered.jsonl')
    
    # Filter satellites older than 1 year
    # Since your data is from 2020, this will remove ALL satellites
    # You can set this to a very high number to keep them all, but they won't work
    filter_satellites(input_file, output_file, max_age_days=365)
    
    print(f"\nFiltered data saved to: {output_file}")
    print("Note: If all satellites were removed, you need to download fresh TLE data!")
