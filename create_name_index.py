import json
import csv
from pathlib import Path
from collections import defaultdict

# Greek letter mapping: symbol -> (english name, abbreviation)
GREEK_LETTERS = {
    'α': ('alpha', 'alf'),
    'β': ('beta', 'bet'),
    'γ': ('gamma', 'gam'),
    'δ': ('delta', 'del'),
    'ε': ('epsilon', 'eps'),
    'ζ': ('zeta', 'zet'),
    'η': ('eta', 'eta'),
    'θ': ('theta', 'the'),
    'ι': ('iota', 'iot'),
    'κ': ('kappa', 'kap'),
    'λ': ('lambda', 'lam'),
    'μ': ('mu', 'mu'),
    'ν': ('nu', 'nu'),
    'ξ': ('xi', 'ksi'),
    'ο': ('omicron', 'omi'),
    'π': ('pi', 'pi'),
    'ρ': ('rho', 'rho'),
    'σ': ('sigma', 'sig'),
    'τ': ('tau', 'tau'),
    'υ': ('upsilon', 'ups'),
    'φ': ('phi', 'phi'),
    'χ': ('chi', 'chi'),
    'ψ': ('psi', 'psi'),
    'ω': ('omega', 'ome'),
    # Uppercase variants
    'Α': ('Alpha', 'Alf'),
    'Β': ('Beta', 'Bet'),
    'Γ': ('Gamma', 'Gam'),
    'Δ': ('Delta', 'Del'),
    'Ε': ('Epsilon', 'Eps'),
    'Ζ': ('Zeta', 'Zet'),
    'Η': ('Eta', 'Eta'),
    'Θ': ('Theta', 'The'),
    'Ι': ('Iota', 'Iot'),
    'Κ': ('Kappa', 'Kap'),
    'Λ': ('Lambda', 'Lam'),
    'Μ': ('Mu', 'Mu'),
    'Ν': ('Nu', 'Nu'),
    'Ξ': ('Xi', 'Ksi'),
    'Ο': ('Omicron', 'Omi'),
    'Π': ('Pi', 'Pi'),
    'Ρ': ('Rho', 'Rho'),
    'Σ': ('Sigma', 'Sig'),
    'Τ': ('Tau', 'Tau'),
    'Υ': ('Upsilon', 'Ups'),
    'Φ': ('Phi', 'Phi'),
    'Χ': ('Chi', 'Chi'),
    'Ψ': ('Psi', 'Psi'),
    'Ω': ('Omega', 'Ome'),
}

# Greek abbreviation mapping: abbrev -> full english name
GREEK_ABBREV_TO_FULL = {
    'alf': 'alpha',
    'bet': 'beta',
    'gam': 'gamma',
    'del': 'delta',
    'eps': 'epsilon',
    'zet': 'zeta',
    'eta': 'eta',
    'the': 'theta',
    'iot': 'iota',
    'kap': 'kappa',
    'lam': 'lambda',
    'mu': 'mu',
    'nu': 'nu',
    'ksi': 'xi',
    'xi': 'xi',
    'omi': 'omicron',
    'pi': 'pi',
    'rho': 'rho',
    'sig': 'sigma',
    'tau': 'tau',
    'ups': 'upsilon',
    'phi': 'phi',
    'chi': 'chi',
    'psi': 'psi',
    'ome': 'omega',
}

def convert_greek_to_english(name):
    """
    Convert Greek letter abbreviations in a name to full English names.
    Handles formats like 'alf And' -> 'alpha And', 'bet CMa' -> 'beta CMa'
    Also handles Greek symbols if present.
    Returns a list of alternative names.
    """
    alternatives = []
    
    # Check for Greek symbols first (α, β, etc.)
    has_greek_symbol = False
    for greek_char in GREEK_LETTERS:
        if greek_char in name:
            has_greek_symbol = True
            break
    
    if has_greek_symbol:
        full_english = name
        abbrev_english = name
        for greek_char, (full_name, abbrev) in GREEK_LETTERS.items():
            if greek_char in name:
                full_english = full_english.replace(greek_char, full_name)
                abbrev_english = abbrev_english.replace(greek_char, abbrev)
        if full_english != name:
            alternatives.append(full_english)
        if abbrev_english != name and abbrev_english != full_english:
            alternatives.append(abbrev_english)
    
    # Check for Greek abbreviations (alf, bet, etc.)
    # Names like "alf And", "bet CMa", "gam Ori"
    name_lower = name.lower()
    for abbrev, full_name in GREEK_ABBREV_TO_FULL.items():
        # Check if name starts with Greek abbrev followed by space or digit
        if name_lower.startswith(abbrev + ' ') or name_lower.startswith(abbrev + '0') or name_lower.startswith(abbrev + '1') or name_lower.startswith(abbrev + '2'):
            # Create full English version
            full_english = full_name + name[len(abbrev):]
            if full_english not in alternatives and full_english != name:
                alternatives.append(full_english)
            break
    
    return alternatives

def extract_star_names(star_data_file):
    """Extract all star names from the star data JSON file"""
    print("Loading star data...")
    with open(star_data_file, 'r', encoding='utf-8') as f:
        stars = json.load(f)
    
    print(f"Processing {len(stars)} stars...")
    
    star_names = []
    name_to_info = {}
    greek_alternatives_added = 0
    
    for star in stars:
        hip = star.get('hip')
        hd = star.get('hd')
        vmag = star.get('vmag')
        ra = star.get('ra')
        de = star.get('de')
        ids = star.get('ids', '').strip()
        
        # Collect all names for this star
        names = []
        
        # If star has named IDs, parse them
        if ids:
            # IDs can be pipe-separated or comma-separated
            # Examples: "* CG And", "Sirius|* alf CMa|HIP 32349"
            id_parts = ids.replace('|', ',').split(',')
            for part in id_parts:
                part = part.strip()
                if part and not part.startswith('HIP') and not part.startswith('HD'):
                    # Remove common prefixes for cleaner names
                    clean_name = part.replace('* ', '').strip()
                    if clean_name:
                        names.append(clean_name)
                        # Add Greek letter alternatives
                        greek_alts = convert_greek_to_english(clean_name)
                        for alt in greek_alts:
                            if alt not in names:
                                names.append(alt)
                                greek_alternatives_added += 1
        
        # Always add HIP number as fallback name
        if hip:
            hip_name = f"HIP {hip}"
            names.append(hip_name)
        
        # Add HD number as alternative
        if hd:
            hd_name = f"HD {hd}"
            names.append(hd_name)
        
        # Store each name with its info
        primary_name = names[0] if names else (f"HIP {hip}" if hip else "Unknown")
        for name in names:
            if name not in name_to_info:
                name_to_info[name] = {
                    'name': name,
                    'type': 'star',
                    'hip': hip,
                    'hd': hd,
                    'vmag': vmag,
                    'ra': ra,
                    'de': de,
                    'primary_name': primary_name
                }
    
    print(f"  Extracted {len(name_to_info)} unique star names")
    print(f"  Added {greek_alternatives_added} Greek letter alternatives")
    return name_to_info

def extract_dso_names(dso_data_file):
    """Extract all DSO names from the DSO data JSON file"""
    print("\nLoading DSO data...")
    with open(dso_data_file, 'r', encoding='utf-8') as f:
        dsos = json.load(f)
    
    print(f"Processing {len(dsos)} DSOs...")
    
    name_to_info = {}
    greek_alternatives_added = 0
    
    for dso in dsos:
        obj_type = dso.get('type', 'Unknown')
        vmag = dso.get('vmag')
        ra = dso.get('ra')
        de = dso.get('de')
        short_name = dso.get('short_name', '').strip()
        ids = dso.get('ids', '').strip()
        
        # Collect all names for this DSO
        names = []
        
        # Add short name if available
        if short_name:
            names.append(short_name)
            # Add Greek alternatives for short name
            greek_alts = convert_greek_to_english(short_name)
            for alt in greek_alts:
                if alt not in names:
                    names.append(alt)
                    greek_alternatives_added += 1
        
        # Parse IDs field
        if ids:
            # IDs are pipe-separated
            # Examples: "M 31|NGC 224|Andromeda Galaxy"
            id_parts = ids.split('|')
            for part in id_parts:
                part = part.strip()
                if part and part not in names:
                    names.append(part)
                    # Add Greek alternatives
                    greek_alts = convert_greek_to_english(part)
                    for alt in greek_alts:
                        if alt not in names:
                            names.append(alt)
                            greek_alternatives_added += 1
        
        # Store each name with its info
        primary_name = names[0] if names else 'Unnamed DSO'
        for name in names:
            if name not in name_to_info:
                name_to_info[name] = {
                    'name': name,
                    'type': 'dso',
                    'dso_type': obj_type,
                    'vmag': vmag,
                    'ra': ra,
                    'de': de,
                    'primary_name': primary_name
                }
    
    print(f"  Extracted {len(name_to_info)} unique DSO names")
    print(f"  Added {greek_alternatives_added} Greek letter alternatives")
    return name_to_info

def create_name_index(star_names, dso_names, output_dir):
    """Create index files for name suggestions"""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Combine all names
    all_names = {**star_names, **dso_names}
    
    print(f"\n{'='*80}")
    print(f"Total unique names: {len(all_names)}")
    print(f"  Stars: {len(star_names)}")
    print(f"  DSOs: {len(dso_names)}")
    print(f"{'='*80}\n")
    
    # Sort names alphabetically for better search
    sorted_names = sorted(all_names.values(), key=lambda x: x['name'].lower())
    
    # Save to JSON (full index with all metadata)
    json_file = output_path / 'name_index.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_names, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved full index to {json_file}")
    
    # Save to JSON (compact - just names for autocomplete)
    compact_json_file = output_path / 'name_index_compact.json'
    compact_data = {
        'stars': sorted([n['name'] for n in star_names.values()]),
        'dsos': sorted([n['name'] for n in dso_names.values()]),
        'all': sorted([n['name'] for n in all_names.values()])
    }
    with open(compact_json_file, 'w', encoding='utf-8') as f:
        json.dump(compact_data, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved compact index to {compact_json_file}")
    
    # Save to CSV (for easy viewing/editing)
    csv_file = output_path / 'name_index.csv'
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['name', 'type', 'primary_name', 'vmag', 'ra', 'de', 'hip', 'hd', 'dso_type']
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(sorted_names)
    print(f"✓ Saved CSV index to {csv_file}")
    
    # Save to plain text (simple list for quick reference)
    txt_file = output_path / 'name_index.txt'
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write("Sky Object Name Index\n")
        f.write(f"{'='*80}\n\n")
        f.write(f"Total names: {len(all_names)}\n")
        f.write(f"Stars: {len(star_names)}\n")
        f.write(f"DSOs: {len(dso_names)}\n\n")
        f.write(f"{'='*80}\n\n")
        
        # Group by type
        f.write("STARS\n")
        f.write(f"{'-'*80}\n")
        star_list = sorted([n for n in all_names.values() if n['type'] == 'star'], 
                          key=lambda x: x['name'].lower())
        for item in star_list:
            f.write(f"{item['name']}\n")
        
        f.write(f"\n{'='*80}\n\n")
        f.write("DEEP SKY OBJECTS\n")
        f.write(f"{'-'*80}\n")
        dso_list = sorted([n for n in all_names.values() if n['type'] == 'dso'], 
                         key=lambda x: x['name'].lower())
        for item in dso_list:
            f.write(f"{item['name']}\n")
    
    print(f"✓ Saved text list to {txt_file}")
    
    # Create statistics
    stats = {
        'total_names': len(all_names),
        'total_stars': len(star_names),
        'total_dsos': len(dso_names),
        'named_stars': len([n for n in star_names.values() if not n['name'].startswith('HIP') and not n['name'].startswith('HD')]),
        'hip_only_stars': len([n for n in star_names.values() if n['name'].startswith('HIP')]),
        'dso_types': {}
    }
    
    # Count DSO types
    for dso in dso_names.values():
        dso_type = dso.get('dso_type', 'Unknown')
        stats['dso_types'][dso_type] = stats['dso_types'].get(dso_type, 0) + 1
    
    stats_file = output_path / 'name_index_stats.json'
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
    print(f"✓ Saved statistics to {stats_file}")
    
    # Print summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total unique names: {stats['total_names']:,}")
    print(f"\nStars:")
    print(f"  - Named stars: {stats['named_stars']:,}")
    print(f"  - HIP/HD only: {stats['hip_only_stars']:,}")
    print(f"  - Total: {stats['total_stars']:,}")
    print(f"\nDSOs:")
    print(f"  - Total: {stats['total_dsos']:,}")
    print(f"  - By type:")
    for dso_type, count in sorted(stats['dso_types'].items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"    {dso_type}: {count:,}")
    print(f"{'='*80}\n")
    
    return sorted_names

def main():
    # File paths
    star_data_file = Path('stars_extracted/star_data.json')
    dso_data_file = Path('dso_extracted/dso_data.json')
    output_dir = Path('name_index')
    
    # Check if input files exist
    if not star_data_file.exists():
        print(f"ERROR: Star data file not found: {star_data_file}")
        print("Please run extract_star_data.py first")
        return
    
    if not dso_data_file.exists():
        print(f"ERROR: DSO data file not found: {dso_data_file}")
        print("Please run extract_dso_data.py first")
        return
    
    print("Creating name index for sky objects...\n")
    print(f"{'='*80}\n")
    
    # Extract names
    star_names = extract_star_names(star_data_file)
    dso_names = extract_dso_names(dso_data_file)
    
    # Create index files
    index = create_name_index(star_names, dso_names, output_dir)
    
    # Show some examples
    print("\nSample entries:")
    print(f"{'-'*80}")
    
    # Show some named stars
    named_stars = [n for n in index if n['type'] == 'star' and not n['name'].startswith('HIP')][:5]
    if named_stars:
        print("\nNamed Stars:")
        for star in named_stars:
            print(f"  {star['name']} (HIP {star.get('hip', 'N/A')}, mag {star.get('vmag', 'N/A'):.2f})")
    
    # Show some HIP stars
    hip_stars = [n for n in index if n['type'] == 'star' and n['name'].startswith('HIP')][:5]
    if hip_stars:
        print("\nHIP Stars:")
        for star in hip_stars:
            print(f"  {star['name']} (mag {star.get('vmag', 'N/A'):.2f})")
    
    # Show some DSOs
    dsos = [n for n in index if n['type'] == 'dso'][:5]
    if dsos:
        print("\nDSOs:")
        for dso in dsos:
            print(f"  {dso['name']} ({dso.get('dso_type', 'N/A')}, mag {dso.get('vmag', 'N/A'):.2f})")
    
    print(f"\n{'='*80}")
    print("SUCCESS! Name index created.")
    print(f"{'='*80}")
    print(f"\nOutput files in '{output_dir}/':")
    print(f"  - name_index.json (full index with metadata)")
    print(f"  - name_index_compact.json (compact for autocomplete)")
    print(f"  - name_index.csv (spreadsheet format)")
    print(f"  - name_index.txt (plain text list)")
    print(f"  - name_index_stats.json (statistics)")

if __name__ == "__main__":
    main()
