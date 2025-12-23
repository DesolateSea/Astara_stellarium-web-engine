"""
Extract Star data from Stellarium .eph files to human-readable formats.
"""

import struct
import json
import csv
import zlib
from pathlib import Path

def read_eph_file(filepath):
    """Read and parse an .eph file"""
    with open(filepath, 'rb') as f:
        data = f.read()
    
    # Check magic string
    if data[:4] != b'EPHE':
        raise ValueError(f"Not a valid EPH file: {filepath}")
    
    version = struct.unpack('<I', data[4:8])[0]
    
    offset = 8
    chunks = []
    
    while offset < len(data):
        if offset + 8 > len(data):
            break
            
        chunk_type = data[offset:offset+4].decode('ascii', errors='ignore')
        chunk_size = struct.unpack('<I', data[offset+4:offset+8])[0]
        
        if offset + 8 + chunk_size > len(data):
            break
            
        chunk_data = data[offset+8:offset+8+chunk_size]
        chunks.append({
            'type': chunk_type,
            'size': chunk_size,
            'data': chunk_data
        })
        
        # Skip CRC (4 bytes after data)
        offset += chunk_size + 12
    
    return version, chunks

def read_compressed_block(data):
    """Read and decompress a data block"""
    zlib_start = data.find(b'\x78\x9c')  # Find zlib header
    if zlib_start == -1:
        raise Exception("Zlib header not found in compressed block")
    
    compressed_data = data[zlib_start:]
    uncompressed_data = zlib.decompress(compressed_data)
    
    return uncompressed_data

def unshuffle_bytes(data, row_size, num_rows):
    """Reverse byte shuffling"""
    total_size = row_size * num_rows
    if len(data) < total_size:
        return data
    
    unshuffled = bytearray(total_size)
    for i in range(num_rows):
        for j in range(row_size):
            unshuffled[i * row_size + j] = data[j * num_rows + i]
    
    return bytes(unshuffled)

def parse_star_chunk(chunk_data):
    """Parse STAR chunk data"""
    offset = 0
    
    # Read tile header (12 bytes)
    version = struct.unpack('<I', chunk_data[offset:offset+4])[0]
    nuniq = struct.unpack('<Q', chunk_data[offset+4:offset+12])[0]
    order = int((nuniq // 4).bit_length() / 2) if nuniq > 0 else 0
    pix = nuniq - 4 * (1 << (2 * order)) if nuniq > 0 else 0
    offset = 12
    
    # Read table header (16 bytes)
    flags = struct.unpack('<I', chunk_data[offset:offset+4])[0]
    row_size = struct.unpack('<I', chunk_data[offset+4:offset+8])[0]
    n_col = struct.unpack('<I', chunk_data[offset+8:offset+12])[0]
    n_row = struct.unpack('<I', chunk_data[offset+12:offset+16])[0]
    offset = 12 + 16  # Tile header + table header = 28
    
    # Read column definitions
    columns = []
    for i in range(n_col):
        col_name = chunk_data[offset:offset+4].decode('ascii', errors='ignore').rstrip('\x00')
        col_type_str = chunk_data[offset+4:offset+8].decode('ascii', errors='ignore').rstrip('\x00')
        col_type = col_type_str[0] if col_type_str else ''  # Type is single character
        col_unit = struct.unpack('<I', chunk_data[offset+8:offset+12])[0]
        col_start = struct.unpack('<I', chunk_data[offset+12:offset+16])[0]
        col_size = struct.unpack('<I', chunk_data[offset+16:offset+20])[0]
        
        columns.append({
            'name': col_name,
            'type': col_type,
            'unit': col_unit,
            'start': col_start,
            'size': col_size
        })
        offset += 20
    
    # Read compressed data block
    table_data = read_compressed_block(chunk_data[offset:])
    
    # Unshuffle if needed
    if flags & 1:
        table_data = unshuffle_bytes(table_data, row_size, n_row)
    
    # Parse rows
    rows = []
    data_offset = 0
    for i in range(n_row):
        row = {}
        row_data = table_data[data_offset:data_offset+row_size]
        
        for col in columns:
            value = None
            try:
                if col['type'] == 'f':  # float
                    value = struct.unpack('<f', row_data[col['start']:col['start']+4])[0]
                    # Convert radians to degrees for angles
                    if col['name'] in ['ra', 'de', 'pra', 'pde']:
                        value = value * 180.0 / 3.14159265359
                elif col['type'] == 'i':  # int
                    value = struct.unpack('<i', row_data[col['start']:col['start']+4])[0]
                elif col['type'] == 'Q':  # uint64
                    value = struct.unpack('<Q', row_data[col['start']:col['start']+8])[0]
                elif col['type'] == 's':  # string
                    value = row_data[col['start']:col['start']+col['size']].decode('utf-8', errors='ignore').rstrip('\x00')
            except:
                value = None
            
            row[col['name']] = value
        
        rows.append(row)
        data_offset += row_size
    
    return columns, rows

def extract_star_data(star_dir, output_dir, max_files=None):
    """Extract all star data from .eph files"""
    star_path = Path(star_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    all_stars = []
    
    # Find all .eph files
    eph_files = list(star_path.rglob('*.eph'))
    if max_files:
        eph_files = eph_files[:max_files]
    
    print(f"Found {len(eph_files)} .eph files\n")
    
    for eph_file in eph_files:
        print(f"Processing: {eph_file.name}")
        try:
            version, chunks = read_eph_file(eph_file)
            
            for chunk in chunks:
                if chunk['type'] in ['STAR', 'STRS']:  # Both chunk types might exist
                    try:
                        columns, rows = parse_star_chunk(chunk['data'])
                        all_stars.extend(rows)
                        print(f"  Extracted {len(rows)} stars")
                    except Exception as e:
                        print(f"  Error parsing STAR chunk: {e}")
        
        except Exception as e:
            print(f"  Error: {e}")
    
    if not all_stars:
        print("\nNo star data found!")
        return
    
    print(f"\n{'='*80}")
    print(f"Total stars extracted: {len(all_stars)}")
    print(f"{'='*80}\n")
    
    # Save to JSON
    json_file = output_path / 'star_data.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(all_stars, f, indent=2)
    print(f"Saved to {json_file}")
    
    # Save to CSV
    if all_stars:
        csv_file = output_path / 'star_data.csv'
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=all_stars[0].keys())
            writer.writeheader()
            writer.writerows(all_stars)
        print(f"Saved to {csv_file}")
    
    # Save to readable text (first 1000 stars to avoid huge file)
    txt_file = output_path / 'star_data.txt'
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write(f"Star Data\n")
        f.write(f"{'='*80}\n\n")
        f.write(f"Total stars: {len(all_stars)}\n")
        f.write(f"(Showing first 1000 in text format)\n\n")
        
        for i, star in enumerate(all_stars[:1000], 1):
            f.write(f"Star #{i}\n")
            f.write(f"{'-'*40}\n")
            for key, value in star.items():
                if value is not None:
                    f.write(f"  {key:10s}: {value}\n")
            f.write(f"\n")
    
    print(f"Saved to {txt_file}")
    
    return all_stars

if __name__ == "__main__":
    star_dir = r'apps\web-frontend\public\skydata\stars'
    output_dir = r'stars_extracted'
    
    print("Extracting star data from .eph files...\n")
    print("Note: Processing first 10 files only (there are many star files)")
    print("Remove max_files parameter to extract all stars\n")
    
    stars = extract_star_data(star_dir, output_dir, max_files=10)
    
    if stars:
        print(f"\n{'='*80}")
        print(f"SUCCESS! Extracted {len(stars)} stars")
        print(f"{'='*80}")
        print(f"\nFiles created:")
        print(f"  - star_data.json  (JSON format)")
        print(f"  - star_data.csv   (CSV spreadsheet)")
        print(f"  - star_data.txt   (Human-readable text, first 1000 stars)")
        print(f"\nSample star:")
        if stars:
            print(json.dumps(stars[0], indent=2))
