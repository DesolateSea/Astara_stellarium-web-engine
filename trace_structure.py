import struct

f = open(r'apps\web-frontend\public\skydata\dso\Norder0\Dir0\Npix0.eph', 'rb')
data = f.read()
f.close()

print("=== FILE STRUCTURE ===\n")

# File header
print("File header (offset 0-8):")
print(f"  Magic: {data[0:4]}")
print(f"  File version: {struct.unpack('<I', data[4:8])[0]}")

# Chunk header
offset = 8
print(f"\nChunk header (offset {offset}-{offset+8}):")
chunk_type = data[offset:offset+4]
chunk_size = struct.unpack('<I', data[offset+4:offset+8])[0]
print(f"  Type: {chunk_type}")
print(f"  Size: {chunk_size}")

# Chunk data starts here
chunk_start = offset + 8
print(f"\nChunk data starts at offset {chunk_start}")

# Tile header (within chunk)
print(f"\nTile header (offset {chunk_start}-{chunk_start+12}):")
tile_version = struct.unpack('<I', data[chunk_start:chunk_start+4])[0]
nuniq = struct.unpack('<Q', data[chunk_start+4:chunk_start+12])[0]
print(f"  Tile version: {tile_version}")
print(f"  Nuniq: {nuniq}")

# Table header (within chunk, after tile header)
table_offset = chunk_start + 12
print(f"\nTable header (offset {table_offset}-{table_offset+16}):")
flags = struct.unpack('<I', data[table_offset:table_offset+4])[0]
row_size = struct.unpack('<I', data[table_offset+4:table_offset+8])[0]
n_col = struct.unpack('<I', data[table_offset+8:table_offset+12])[0]
n_row = struct.unpack('<I', data[table_offset+12:table_offset+16])[0]
print(f"  Flags: {flags}")
print(f"  Row size: {row_size}")
print(f"  Columns: {n_col}")
print(f"  Rows: {n_row}")

# Column definitions
col_offset = table_offset + 16
print(f"\nColumn definitions start at offset {col_offset}:")
for i in range(min(3, n_col)):  # Show first 3 columns
    print(f"\nColumn {i} (offset {col_offset + i*20}-{col_offset + (i+1)*20}):")
    col_name_bytes = data[col_offset + i*20:col_offset + i*20+4]
    col_type_bytes = data[col_offset + i*20+4:col_offset + i*20+8]
    col_unit = struct.unpack('<I', data[col_offset + i*20+8:col_offset + i*20+12])[0]
    col_start = struct.unpack('<I', data[col_offset + i*20+12:col_offset + i*20+16])[0]
    col_size = struct.unpack('<I', data[col_offset + i*20+16:col_offset + i*20+20])[0]
    
    col_name = col_name_bytes.decode('ascii', errors='ignore').rstrip('\x00')
    col_type = col_type_bytes.decode('ascii', errors='ignore').rstrip('\x00')
    
    print(f"  Name: '{col_name}' (bytes: {col_name_bytes.hex()})")
    print(f"  Type: '{col_type[0] if col_type else ''}' (bytes: {col_type_bytes.hex()})")
    print(f"  Unit: {col_unit}, Start: {col_start}, Size: {col_size}")
