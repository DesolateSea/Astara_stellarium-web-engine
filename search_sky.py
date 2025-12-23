"""
Quick search tool for DSOs and Stars
Usage: python search_sky.py <query>
Examples:
  python search_sky.py M31
  python search_sky.py Pleiades
  python search_sky.py "HIP 677"
  python search_sky.py NGC
"""

import sqlite3
import sys
from pathlib import Path

def format_coords(ra, de):
    """Format coordinates in a readable way"""
    if ra is None or de is None:
        return "N/A"
    
    # Convert RA to hours
    ra_hours = ra / 15.0
    ra_h = int(ra_hours)
    ra_m = int((ra_hours - ra_h) * 60)
    ra_s = ((ra_hours - ra_h) * 60 - ra_m) * 60
    
    # Convert Dec to degrees
    de_sign = '+' if de >= 0 else '-'
    de = abs(de)
    de_d = int(de)
    de_m = int((de - de_d) * 60)
    de_s = ((de - de_d) * 60 - de_m) * 60
    
    return f"RA {ra_h:02d}h{ra_m:02d}m{ra_s:04.1f}s  Dec {de_sign}{de_d:02d}°{de_m:02d}'{de_s:04.1f}\""

def search_dsos(query, db_file, limit=20):
    """Search DSO database"""
    if not Path(db_file).exists():
        return []
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Search in all text fields
    search_term = f"%{query.upper()}%"
    cursor.execute('''
        SELECT type, vmag, ra, de, smax, short_name, ids
        FROM dsos
        WHERE search_text LIKE ? OR UPPER(morpho) LIKE ?
        ORDER BY vmag ASC
        LIMIT ?
    ''', (search_term, search_term, limit))
    
    results = cursor.fetchall()
    conn.close()
    
    return results

def search_stars(query, db_file, limit=20):
    """Search star database"""
    if not Path(db_file).exists():
        return []
    
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Try to parse as HIP or HD number
    hip_num = None
    hd_num = None
    if query.upper().startswith('HIP'):
        try:
            hip_num = int(query.upper().replace('HIP', '').strip())
        except:
            pass
    elif query.upper().startswith('HD'):
        try:
            hd_num = int(query.upper().replace('HD', '').strip())
        except:
            pass
    elif query.isdigit():
        # If just a number, try both HIP and HD
        hip_num = int(query)
        hd_num = int(query)
    
    if hip_num or hd_num:
        cursor.execute('''
            SELECT hip, hd, vmag, ra, de, bv, ids
            FROM stars
            WHERE hip = ? OR hd = ?
            ORDER BY vmag ASC
            LIMIT ?
        ''', (hip_num, hd_num, limit))
    else:
        # Text search
        search_term = f"%{query.upper()}%"
        cursor.execute('''
            SELECT hip, hd, vmag, ra, de, bv, ids
            FROM stars
            WHERE search_text LIKE ?
            ORDER BY vmag ASC
            LIMIT ?
        ''', (search_term, limit))
    
    results = cursor.fetchall()
    conn.close()
    
    return results

def display_dso_results(results):
    """Display DSO search results"""
    if not results:
        print("No DSOs found.")
        return
    
    print(f"\n{'='*100}")
    print(f"DEEP SKY OBJECTS ({len(results)} results)")
    print(f"{'='*100}\n")
    
    for i, (obj_type, vmag, ra, de, smax, short_name, ids) in enumerate(results, 1):
        print(f"{i}. {short_name or 'Unnamed'}")
        print(f"   Type: {obj_type or 'N/A'}  |  Magnitude: {vmag:.2f if vmag else 'N/A'}")
        print(f"   Coordinates: {format_coords(ra, de)}")
        if smax:
            print(f"   Size: {smax:.2f}°")
        if ids:
            # Show first few IDs
            id_list = ids.split('|')[:5]
            print(f"   IDs: {', '.join(id_list)}")
        print()

def display_star_results(results):
    """Display star search results"""
    if not results:
        print("No stars found.")
        return
    
    print(f"\n{'='*100}")
    print(f"STARS ({len(results)} results)")
    print(f"{'='*100}\n")
    
    for i, (hip, hd, vmag, ra, de, bv, ids) in enumerate(results, 1):
        name = ids if ids else f"HIP {hip}" if hip else f"HD {hd}" if hd else "Unnamed"
        print(f"{i}. {name}")
        print(f"   HIP: {hip or 'N/A'}  |  HD: {hd or 'N/A'}  |  Magnitude: {vmag:.2f if vmag else 'N/A'}")
        print(f"   Coordinates: {format_coords(ra, de)}")
        if bv is not None:
            color = "Blue" if bv < 0 else "White" if bv < 0.5 else "Yellow" if bv < 1.0 else "Orange" if bv < 1.5 else "Red"
            print(f"   Color: {color} (B-V = {bv:.2f})")
        print()

def main():
    if len(sys.argv) < 2:
        print("Usage: python search_sky.py <query>")
        print("\nExamples:")
        print("  python search_sky.py M31")
        print("  python search_sky.py Pleiades")
        print("  python search_sky.py \"HIP 677\"")
        print("  python search_sky.py NGC")
        print("  python search_sky.py Andromeda")
        return
    
    query = ' '.join(sys.argv[1:])
    
    print(f"\nSearching for: '{query}'")
    
    # Search DSOs
    dso_db = Path('dso_extracted/dso_search.db')
    dso_results = search_dsos(query, dso_db)
    
    # Search stars
    star_db = Path('stars_extracted/star_search.db')
    star_results = search_stars(query, star_db)
    
    # Display results
    if dso_results:
        display_dso_results(dso_results)
    
    if star_results:
        display_star_results(star_results)
    
    if not dso_results and not star_results:
        print("\nNo results found.")
        print("\nTips:")
        print("  - Try searching for Messier objects: M1, M31, M42")
        print("  - Try NGC catalog: NGC 224, NGC 7000")
        print("  - Try star names: Sirius, Betelgeuse, Vega")
        print("  - Try catalog numbers: HIP 677, HD 224801")

if __name__ == "__main__":
    main()
