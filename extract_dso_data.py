"""
Extract DSO (Deep Sky Objects) data from Stellarium .eph files to human-readable formats.
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
    # The actual zlib compressed data starts 20 bytes after the size headers
    # There seem to be some additional fields we're skipping
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

def parse_dso_chunk(chunk_data):
    """Parse DSO chunk data"""
    offset = 0
    
    # Read tile header (12 bytes)
    version = struct.unpack('<I', chunk_data[offset:offset+4])[0]
    nuniq = struct.unpack('<Q', chunk_data[offset+4:offset+12])[0]
    order = int((nuniq // 4).bit_length() / 2) if nuniq > 0 else 0
    pix = nuniq - 4 * (1 << (2 * order)) if nuniq > 0 else 0
    offset = 12
    
    # Read table header (16 bytes, not 4!)
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
                    if col['name'] in ['ra', 'de', 'smax', 'smin', 'angl']:
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

def extract_dso_data(dso_dir, output_dir):
    """Extract all DSO data from .eph files"""
    dso_path = Path(dso_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    all_dsos = []
    
    # Find all .eph files
    eph_files = list(dso_path.rglob('*.eph'))
    print(f"Found {len(eph_files)} .eph files\n")
    
    for eph_file in eph_files:
        print(f"Processing: {eph_file.name}")
        try:
            version, chunks = read_eph_file(eph_file)
            
            for chunk in chunks:
                if chunk['type'] == 'DSO ':
                    try:
                        columns, rows = parse_dso_chunk(chunk['data'])
                        all_dsos.extend(rows)
                        print(f"  Extracted {len(rows)} DSOs")
                    except Exception as e:
                        print(f"  Error parsing DSO chunk: {e}")
        
        except Exception as e:
            print(f"  Error: {e}")
    
    if not all_dsos:
        print("\nNo DSO data found!")
        return
    
    print(f"\n{'='*80}")
    print(f"Total DSOs extracted: {len(all_dsos)}")
    print(f"{'='*80}\n")
    
    # Save to JSON
    json_file = output_path / 'dso_data.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(all_dsos, f, indent=2)
    print(f"Saved to {json_file}")
    
    # Save to CSV
    if all_dsos:
        csv_file = output_path / 'dso_data.csv'
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=all_dsos[0].keys())
            writer.writeheader()
            writer.writerows(all_dsos)
        print(f"Saved to {csv_file}")
    
    # Save to readable text
    txt_file = output_path / 'dso_data.txt'
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write(f"Deep Sky Objects Data\n")
        f.write(f"{'='*80}\n\n")
        f.write(f"Total objects: {len(all_dsos)}\n\n")
        
        for i, dso in enumerate(all_dsos, 1):
            f.write(f"Object #{i}\n")
            f.write(f"{'-'*40}\n")
            for key, value in dso.items():
                if value is not None:
                    f.write(f"  {key:10s}: {value}\n")
            f.write(f"\n")
    
    print(f"Saved to {txt_file}")
    
    return all_dsos

if __name__ == "__main__":
    dso_dir = r'apps\web-frontend\public\skydata\dso'
    output_dir = r'dso_extracted'
    
    print("Extracting DSO data from .eph files...\n")
    dsos = extract_dso_data(dso_dir, output_dir)
    
    if dsos:
        print(f"\n{'='*80}")
        print(f"SUCCESS! Extracted {len(dsos)} Deep Sky Objects")
        print(f"{'='*80}")
        print(f"\nFiles created:")
        print(f"  - dso_data.json  (JSON format)")
        print(f"  - dso_data.csv   (CSV spreadsheet)")
        print(f"  - dso_data.txt   (Human-readable text)")
        print(f"\nSample DSO:")
        if dsos:
            print(json.dumps(dsos[0], indent=2))
