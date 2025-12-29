
import json
import csv
import re

# File paths
NAME_INDEX_PATH = 'apps/web-frontend/public/skydata/name_index_compact.json'
DSO_DATA_PATH = 'dso_extracted/dso_data.csv'
OUTPUT_PATH = 'apps/web-frontend/public/skydata/search_index.json'

def normalize(s):
    if not s:
        return ""
    # Remove spaces, punctuation, convert to uppercase
    n = s.upper()
    n = re.sub(r'[\s.,\-\'"]+', '', n)
    if n.startswith('NAME'):
        n = n[4:]
    return n

def load_dso_types():
    dso_types = {}
    with open(DSO_DATA_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map IDs to type
            # IDs in name_index might be primary name or other designations
            # We'll map all known IDs to the type
            obj_type = row.get('type', 'dso')
            ids_str = row.get('ids', '')
            if ids_str:
                ids = ids_str.split('|')
                for i in ids:
                    dso_types[i] = obj_type
            
            # Also map the primary 'snam'
            snam = row.get('snam', '')
            if snam:
                dso_types[snam] = obj_type
                
    return dso_types

def categorize_dso(dso_type):
    # Mapping based on previous analysis
    galaxies = ['G', 'GiG', 'GiP', 'LIN', 'EmG', 'rG', 'GiC', 'IG', 'AGN', 'BiC', 'LSB', 'H2G', 'Sy1', 'Sy2', 'SyG', 'SBG', 'PaG', 'bCG', 'PoG', 'GrG', 'Gal']
    nebulae = ['Neb', 'PN', 'RNe', 'BNe', 'GNe', 'HII', 'SNR', 'ISM', 'SFR', 'Cld', 'EmO']
    clusters = ['OpC', 'GlC', 'Cl*', 'PoC', 'As*', 'MGr']
    
    if dso_type in galaxies:
        return 'galaxies'
    elif dso_type in nebulae:
        return 'nebulae'
    elif dso_type in clusters:
        return 'clusters'
    else:
        return 'other'

def main():
    print("Loading DSO data...")
    dso_type_map = load_dso_types()
    
    print("Loading existing name index...")
    with open(NAME_INDEX_PATH, 'r', encoding='utf-8') as f:
        old_index = json.load(f)
    
    new_index = {
        "version": 2,
        "stars": [],
        "dsos": {
            "galaxies": [],
            "nebulae": [],
            "clusters": [],
            "other": []
        },
        "constellations": [] # If we want to move constellations here too later
    }
    
    print("Processing Stars...")
    # Stars are simple strings in the old index
    # To save space but allow binary search, we'll keep them as sorted list
    # But we'll pre-normalize them in a parallel list or object structure? 
    # Actually, for the new loader, simple sorted list of objects {n: "Name", i: "Normalized"} is good for binary search
    # But that doubles size. 
    # Let's keep array of strings for stars to keep it compact, 
    # but make sure they are sorted by normalized version for binary search?
    # No, traditional binary search needs sorted keys.
    # Let's try listing objects [n, norm] arrays to save key bytes.
    
    # Actually, standard binary search on the normalized string is best.
    # We can store: ["NormalizedName|OriginalName", ...]
    # Or just Objects. JSON overhead is high for repeated keys.
    # Let's stick to ["Original Name"] but sorted by normalized value.
    # Then we can binary search if we normalize on the fly? No, we want to avoid runtime normalization.
    # Approach: Store ["NORMALIZED|Original Name"] strings.
    # This allows O(log n) binary search on the prefix.
    
    processed_stars = []
    for star in old_index.get('stars', []):
        norm = normalize(star)
        processed_stars.append(f"{norm}|{star}")
    
    processed_stars.sort() # sort by normalized part
    new_index['stars'] = processed_stars
    
    print("Processing DSOs...")
    processed_dsos = {
        "galaxies": [],
        "nebulae": [],
        "clusters": [],
        "other": []
    }
    
    # The old index 'dsos' is just a list of names. We need to look up their types.
    # Be careful: The name in the index might not be the primary key in dso_data
    # But dso_type_map has all IDs mapped.
    
    for dso_name in old_index.get('dsos', []):
        # Default to 'other' (or generic dso)
        d_type = 'dso'
        
        # Try to find type
        # 1. Direct match
        if dso_name in dso_type_map:
            d_type = dso_type_map[dso_name]
        # 2. Try variations (remove NAME)
        elif dso_name.startswith('NAME ') and dso_name[5:] in dso_type_map:
            d_type = dso_type_map[dso_name[5:]]
        
        category = categorize_dso(d_type)
        norm = normalize(dso_name)
        
        # Store as "NORMALIZED|Original Name|Type"
        entry = f"{norm}|{dso_name}|{d_type}"
        processed_dsos[category].append(entry)
        
    # Sort each category
    for cat in processed_dsos:
        processed_dsos[cat].sort()
        new_index['dsos'][cat] = processed_dsos[cat]
        
    print(f"Stats:")
    print(f"Stars: {len(new_index['stars'])}")
    for cat in new_index['dsos']:
        print(f"DSO {cat}: {len(new_index['dsos'][cat])}")
        
    print(f"Writing to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(new_index, f)
    
    print("Done.")

if __name__ == '__main__':
    main()
