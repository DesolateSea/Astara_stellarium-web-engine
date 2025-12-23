import struct
import zlib

f = open(r'apps\web-frontend\public\skydata\dso\Norder0\Dir0\Npix0.eph', 'rb')
data = f.read()
f.close()

offset = 8
chunk_data = data[offset+8:offset+8+struct.unpack('<I', data[offset+4:offset+8])[0]]

# Tile header
tile_version = struct.unpack('<I', chunk_data[0:4])[0]
print(f"Tile version: {tile_version}")

hdr_offset = 12
flags = struct.unpack('<I', chunk_data[hdr_offset:hdr_offset+4])[0]
row_size = struct.unpack('<I', chunk_data[hdr_offset+4:hdr_offset+8])[0]
n_col = struct.unpack('<I', chunk_data[hdr_offset+8:hdr_offset+12])[0]
n_row = struct.unpack('<I', chunk_data[hdr_offset+12:hdr_offset+16])[0]

print(f"Flags: {flags}, Row size: {row_size}, Columns: {n_col}, Rows: {n_row}\n")

# Read columns
col_offset = 16
columns = []
for i in range(n_col):
    col_name = chunk_data[col_offset:col_offset+4].decode('ascii', errors='ignore').rstrip('\x00')
    col_type = chunk_data[col_offset+4:col_offset+8].decode('ascii', errors='ignore').rstrip('\x00')
    col_unit = struct.unpack('<I', chunk_data[col_offset+8:col_offset+12])[0]
    col_start = struct.unpack('<I', chunk_data[col_offset+12:col_offset+16])[0]
    col_size = struct.unpack('<I', chunk_data[col_offset+16:col_offset+20])[0]
    
    columns.append({
        'name': col_name,
        'type': col_type[0] if col_type else '',  # Take first character only
        'unit': col_unit,
        'start': col_start,
        'size': col_size
    })
    print(f"Column {i}: name='{col_name}', type='{col_type[0] if col_type else ''}', start={col_start}, size={col_size}")
    
    col_offset += 20

# Decompress data
cb_offset = 16 + n_col * 20
zlib_start = chunk_data.find(b'\x78\x9c', cb_offset)
compressed = chunk_data[zlib_start:]
table_data = zlib.decompress(compressed)

print(f"\nDecompressed {len(table_data)} bytes")

# Unshuffle
if flags & 1:
    print("Unshuffling data...")
    unshuffled = bytearray(row_size * n_row)
    for i in range(n_row):
        for j in range(row_size):
            unshuffled[i * row_size + j] = table_data[j * n_row + i]
    table_data = bytes(unshuffled)

# Read first row
print("\nFirst DSO:")
row_data = table_data[0:row_size]
for col in columns:
    if col['type'] == 'f':
        value = struct.unpack('<f', row_data[col['start']:col['start']+4])[0]
        if col['name'] in ['ra', 'de']:
            value = value * 180.0 / 3.14159265359
        print(f"  {col['name']:10s} = {value}")
    elif col['type'] == 's':
        value = row_data[col['start']:col['start']+col['size']].decode('utf-8', errors='ignore').rstrip('\x00')
        print(f"  {col['name']:10s} = '{value}'")
