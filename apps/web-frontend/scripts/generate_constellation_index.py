#!/usr/bin/env python3
"""
Generate a comprehensive constellation_index.json that includes
constellations from ALL skycultures for cross-culture search support.
"""

import json
import os
from pathlib import Path

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    skycultures_dir = base_dir / "public" / "skydata" / "skycultures"
    output_file = base_dir / "public" / "skydata" / "constellation_index.json"
    
    # Load skycultures index
    cultures_index_file = skycultures_dir / "index.json"
    with open(cultures_index_file, 'r', encoding='utf-8') as f:
        cultures = json.load(f)
    
    print(f"Found {len(cultures)} skycultures: {cultures}")
    
    all_constellations = []
    
    for culture in cultures:
        culture_dir = skycultures_dir / culture
        culture_index = culture_dir / "index.json"
        
        if not culture_index.exists():
            print(f"  Skipping {culture}: no index.json found")
            continue
        
        try:
            with open(culture_index, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"  Error loading {culture}: {e}")
            continue
        
        constellations = data.get("constellations", [])
        print(f"  {culture}: {len(constellations)} constellations")
        
        for con in constellations:
            con_id = con.get("id", "")
            common_name = con.get("common_name", {})
            
            # Extract names
            english = common_name.get("english", "")
            native = common_name.get("native", "")
            pronounce = common_name.get("pronounce", "")
            iau = con.get("iau", "")
            
            # Build list of searchable names
            names = []
            if english:
                names.append(english)
            if native and native != english:
                names.append(native)
            if pronounce and pronounce not in names:
                names.append(pronounce)
            if iau and iau not in names:
                names.append(iau)
            
            # Create entry
            entry = {
                "id": con_id,
                "culture": culture,
                "names": names
            }
            
            # Add optional fields if they exist
            if iau:
                entry["iau"] = iau
            if english:
                entry["english"] = english
            if native:
                entry["native"] = native
            if pronounce:
                entry["pronounce"] = pronounce
            
            all_constellations.append(entry)
    
    print(f"\nTotal constellations: {len(all_constellations)}")
    
    # Sort by culture, then by id
    all_constellations.sort(key=lambda x: (x["culture"], x["id"]))
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_constellations, f, indent=2, ensure_ascii=False)
    
    print(f"Written to: {output_file}")
    
    # Show summary by culture
    print("\nSummary by culture:")
    from collections import Counter
    culture_counts = Counter(c["culture"] for c in all_constellations)
    for culture, count in sorted(culture_counts.items()):
        print(f"  {culture}: {count}")

if __name__ == "__main__":
    main()
