import struct

f = open(r'apps\web-frontend\public\skydata\dso\Norder0\Dir0\Npix0.eph', 'rb')
data = f.read()
f.close()

offset = 8
chunk_data = data[offset+8:offset+8+struct.unpack('<I', data[offset+4:offset+8])[0]]

hdr_offset = 12
n_col = struct.unpack('<I', chunk_data[hdr_offset+8:hdr_offset+12])[0]

print(f"Number of columns: {n_col}\n")

col_offset = 16
for i in range(n_col):
    col_name_bytes = chunk_data[col_offset:col_offset+4]
    col_type_bytes = chunk_data[col_offset+4:col_offset+8]
    col_unit = struct.unpack('<I', chunk_data[col_offset+8:col_offset+12])[0]
    col_start = struct.unpack('<I', chunk_data[col_offset+12:col_offset+16])[0]
    col_size = struct.unpack('<I', chunk_data[col_offset+16:col_offset+20])[0]
    
    col_name = col_name_bytes.decode('ascii', errors='ignore').rstrip('\x00')
    col_type = col_type_bytes.decode('ascii', errors='ignore').rstrip('\x00')
    
    print(f"Column {i}:")
    print(f"  Name bytes: {col_name_bytes.hex()} = '{col_name}'")
    print(f"  Type bytes: {col_type_bytes.hex()} = '{col_type}'")
    print(f"  Unit: {col_unit}, Start: {col_start}, Size: {col_size}")
    
    col_offset += 20
