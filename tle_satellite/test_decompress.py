import struct
import zlib

f = open(r'apps\web-frontend\public\skydata\dso\Norder0\Dir0\Npix0.eph', 'rb')
data = f.read()
f.close()

offset = 8
chunk_data = data[offset+8:offset+8+struct.unpack('<I', data[offset+4:offset+8])[0]]

hdr_offset = 12
n_col = struct.unpack('<I', chunk_data[hdr_offset+8:hdr_offset+12])[0]
cb_offset = 16 + n_col*20

uncomp_size = struct.unpack('<I', chunk_data[cb_offset:cb_offset+4])[0]
comp_size = struct.unpack('<I', chunk_data[cb_offset+4:cb_offset+8])[0]

print(f'Uncompressed: {uncomp_size}, Compressed: {comp_size}')
print(f'Data at cb_offset: {chunk_data[cb_offset:cb_offset+40].hex()}')

# Find zlib header (78 9c)
zlib_start = chunk_data.find(b'\x78\x9c', cb_offset)
if zlib_start != -1:
    print(f'Found zlib header at offset {zlib_start} (cb_offset + {zlib_start - cb_offset})')
    compressed = chunk_data[zlib_start:]
    print(f'Compressed data length: {len(compressed)}')
    
    try:
        result = zlib.decompress(compressed)
        print(f'SUCCESS! Decompressed {len(result)} bytes')
    except Exception as e:
        print(f'Error: {e}')
else:
    print('Zlib header not found!')
