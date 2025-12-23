"""
Create optimized search index for DSOs and Stars
This creates SQLite databases for fast searching
"""

import sqlite3
import json
from pathlib import Path

def create_dso_index(json_file, db_file):
    """Create searchable DSO database"""
    print(f"Creating DSO search index from {json_file}...")
    
    # Load DSO data
    with open(json_file, 'r', encoding='utf-8') as f:
        dsos = json.load(f)
    
    # Create database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dsos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            vmag REAL,
            bmag REAL,
            ra REAL,
            de REAL,
            smax REAL,
            smin REAL,
            angle REAL,
            morpho TEXT,
            short_name TEXT,
            ids TEXT,
            search_text TEXT
        )
    ''')
    
    # Create index for fast searching
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_search ON dsos(search_text)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_vmag ON dsos(vmag)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_type ON dsos(type)')
    
    # Insert data
    for dso in dsos:
        # Create searchable text (all names and IDs)
        search_parts = []
        if dso.get('snam'):
            search_parts.append(dso['snam'])
        if dso.get('ids'):
            search_parts.extend(dso['ids'].split('|'))
        search_text = ' '.join(search_parts).upper()
        
        cursor.execute('''
            INSERT INTO dsos (type, vmag, bmag, ra, de, smax, smin, angle, morpho, short_name, ids, search_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dso.get('type'),
            dso.get('vmag'),
            dso.get('bmag'),
            dso.get('ra'),
            dso.get('de'),
            dso.get('smax'),
            dso.get('smin'),
            dso.get('angl'),
            dso.get('morp'),
            dso.get('snam'),
            dso.get('ids'),
            search_text
        ))
    
    conn.commit()
    conn.close()
    
    print(f"✓ Created DSO index with {len(dsos)} objects")
    print(f"  Database: {db_file}\n")

def create_star_index(json_file, db_file):
    """Create searchable star database"""
    print(f"Creating star search index from {json_file}...")
    
    # Load star data
    with open(json_file, 'r', encoding='utf-8') as f:
        stars = json.load(f)
    
    # Create database
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hip INTEGER,
            hd INTEGER,
            vmag REAL,
            ra REAL,
            de REAL,
            plx REAL,
            pra REAL,
            pde REAL,
            bv REAL,
            ids TEXT,
            search_text TEXT
        )
    ''')
    
    # Create indexes for fast searching
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_hip ON stars(hip)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_hd ON stars(hd)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_vmag ON stars(vmag)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_search ON stars(search_text)')
    
    # Insert data
    for star in stars:
        # Create searchable text
        search_parts = []
        if star.get('hip'):
            search_parts.append(f"HIP {star['hip']}")
        if star.get('hd'):
            search_parts.append(f"HD {star['hd']}")
        if star.get('ids'):
            search_parts.append(star['ids'])
        search_text = ' '.join(search_parts).upper()
        
        cursor.execute('''
            INSERT INTO stars (hip, hd, vmag, ra, de, plx, pra, pde, bv, ids, search_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            star.get('hip'),
            star.get('hd'),
            star.get('vmag'),
            star.get('ra'),
            star.get('de'),
            star.get('plx'),
            star.get('pra'),
            star.get('pde'),
            star.get('bv'),
            star.get('ids'),
            search_text
        ))
    
    conn.commit()
    conn.close()
    
    print(f"✓ Created star index with {len(stars)} stars")
    print(f"  Database: {db_file}\n")

if __name__ == "__main__":
    print("="*80)
    print("Creating Search Indexes for DSOs and Stars")
    print("="*80 + "\n")
    
    # Create DSO index
    dso_json = Path('dso_extracted/dso_data.json')
    dso_db = Path('dso_extracted/dso_search.db')
    if dso_json.exists():
        create_dso_index(dso_json, dso_db)
    else:
        print(f"⚠ DSO data not found: {dso_json}")
    
    # Create star index
    star_json = Path('stars_extracted/star_data.json')
    star_db = Path('stars_extracted/star_search.db')
    if star_json.exists():
        create_star_index(star_json, star_db)
    else:
        print(f"⚠ Star data not found: {star_json}")
    
    print("="*80)
    print("Search indexes created successfully!")
    print("="*80)
    print("\nUse 'python search_sky.py <query>' to search")
