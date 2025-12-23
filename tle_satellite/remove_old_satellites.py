import json
from datetime import datetime, timedelta

def parse_tle_epoch(tle_line1):
    """Extract epoch from TLE line 1"""
    try:
        # TLE epoch is in format YYDDD.DDDDDDDD (year + day of year)
        epoch_str = tle_line1[18:32].strip()
        year = int(epoch_str[:2])
        # Convert 2-digit year to 4-digit (assumes 1957-2056 range)
        year = year + 2000 if year < 57 else year + 1900
        day_of_year = float(epoch_str[2:])
        
        # Calculate the date
        epoch = datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
        return epoch
    except:
        return None

def clean_satellite_file(input_file, output_file, max_age_days=90):
    """Remove satellites with TLE data older than max_age_days"""
    current_date = datetime.now()
    kept_satellites = []
    removed_satellites = []
    
    print(f"Current date: {current_date.strftime('%Y-%m-%d')}")
    print(f"Removing satellites with TLE data older than {max_age_days} days\n")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
                
            try:
                sat_data = json.loads(line)
                tle = sat_data.get('model_data', {}).get('tle', [])
                short_name = sat_data.get('short_name', 'Unknown')
                norad = sat_data.get('model_data', {}).get('norad_number', 'Unknown')
                
                if len(tle) >= 2:
                    epoch = parse_tle_epoch(tle[0])
                    if epoch:
                        age_days = (current_date - epoch).days
                        
                        if age_days <= max_age_days:
                            kept_satellites.append(line)
                        else:
                            removed_satellites.append({
                                'name': short_name,
                                'norad': norad,
                                'age_days': age_days,
                                'epoch': epoch.strftime('%Y-%m-%d')
                            })
                    else:
                        removed_satellites.append({
                            'name': short_name,
                            'norad': norad,
                            'age_days': 'Unknown',
                            'epoch': 'Invalid'
                        })
                else:
                    removed_satellites.append({
                        'name': short_name,
                        'norad': norad,
                        'age_days': 'N/A',
                        'epoch': 'Missing TLE'
                    })
                    
            except Exception as e:
                print(f"Error processing line {line_num}: {e}")
    
    # Write kept satellites to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        for sat_line in kept_satellites:
            f.write(sat_line + '\n')
    
    # Print summary
    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"Total satellites processed: {len(kept_satellites) + len(removed_satellites)}")
    print(f"Kept: {len(kept_satellites)} satellites")
    print(f"Removed: {len(removed_satellites)} satellites")
    
    if removed_satellites:
        print(f"\n{'='*70}")
        print(f"REMOVED SATELLITES (showing first 20):")
        print(f"{'='*70}")
        for i, sat in enumerate(removed_satellites[:20], 1):
            print(f"{i:3d}. {sat['name']:30s} (NORAD {str(sat['norad']):6s}) - "
                  f"Epoch: {sat['epoch']:12s} (Age: {str(sat['age_days'])} days)")
        
        if len(removed_satellites) > 20:
            print(f"\n... and {len(removed_satellites) - 20} more satellites")
    
    return len(kept_satellites), len(removed_satellites)

if __name__ == "__main__":
    import os
    # Base directory of the project
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    skydata_dir = os.path.join(base_dir, 'apps', 'web-frontend', 'public', 'skydata')

    input_file = os.path.join(skydata_dir, 'tle_satellite.jsonl')
    output_file = os.path.join(skydata_dir, 'tle_satellite.jsonl')
    backup_file = os.path.join(skydata_dir, 'tle_satellite.jsonl.backup')
    
    # Create backup first
    import shutil
    shutil.copy(input_file, backup_file)
    print(f"Backup created: {backup_file}\n")
    
    # Clean the file (90 days = ~3 months, adjust as needed)
    # Since your data is from 2020, this will likely remove ALL satellites
    # You can increase this to keep them, but they won't work properly
    kept, removed = clean_satellite_file(input_file, output_file, max_age_days=90)
    
    print(f"\n{'='*70}")
    if kept == 0:
        print("WARNING: All satellites were removed!")
        print("Your TLE data is from 2020 (5+ years old).")
        print("\nYou need to download fresh TLE data from:")
        print("  - https://celestrak.org/NORAD/elements/")
        print("  - https://www.space-track.org/ (requires free registration)")
        print("\nRestoring backup...")
        shutil.copy(backup_file, input_file)
        print("Backup restored. File unchanged.")
    else:
        print(f"File updated successfully!")
        print(f"\nDon't forget to run: python compress_sat.py")
    print(f"{'='*70}")
