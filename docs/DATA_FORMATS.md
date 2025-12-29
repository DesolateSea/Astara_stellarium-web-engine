# Data Formats & Processing

This document describes all data formats used in Stellarium Web Engine and the tools for processing them.

## Table of Contents

- [Overview](#overview)
- [Star Data](#star-data)
- [Deep Sky Objects](#deep-sky-objects)
- [Satellite Data](#satellite-data)
- [Search Index](#search-index)
- [HiPS Surveys](#hips-surveys)
- [Sky Cultures](#sky-cultures)
- [Data Processing Tools](#data-processing-tools)

## Overview

Stellarium Web Engine uses various data formats optimized for web delivery and WebAssembly processing:

| Data Type | Source Format | Processed Format | Size | Location |
|-----------|--------------|------------------|------|----------|
| **Stars** | HIP catalog | Binary `.inl` + HiPS tiles | ~600KB | `src/hip.inl`, HiPS |
| **DSOs** | EPH binary | EPH binary | ~2MB | `public/skydata/dso.eph` |
| **Satellites** | TLE (3LE) | JSONL + `.dat` | ~500KB | `public/skydata/tle_satellite.dat` |
| **Search Index** | Generated | JSON | ~2.3MB | `public/skydata/name_index_compact.json` |
| **HiPS** | Remote/Local | WebP tiles | Variable | `public/hips/` |
| **Sky Cultures** | JSON + Images | JSON + Images | ~5MB | `public/skycultures/` |

## Star Data

### HIP Catalog

**Source**: Hipparcos catalog (118,218 stars)

**Embedded Data**: [`src/hip.inl`](file:///d:/test/stellarium-web-engine-master/src/hip.inl)

**Format**: C array of star structures
```c
static const struct {
    int hip;           // HIP number
    float ra, dec;     // J2000 coordinates (radians)
    float vmag;        // Visual magnitude
    float plx;         // Parallax (mas)
    float pra, pdec;   // Proper motion (mas/year)
    // ... more fields
} hip_stars[] = {
    {1, 0.0, 1.089, 9.10, 3.54, -5.20, -1.88},
    // ... 118,218 entries
};
```

**Extraction Script**: [`extract_star_data.py`](file:///d:/test/stellarium-web-engine-master/extract_star_data.py)

```bash
python extract_star_data.py
```

**Output Files:**
- `stars_extracted/stars_data.json` - Full star data
- `stars_extracted/stars_data.csv` - Spreadsheet format
- `stars_extracted/stars_data.txt` - Plain text
- `stars_extracted/stars_stats.json` - Statistics

### HiPS Star Tiles

**Additional Stars**: Fainter stars loaded from HiPS tiles

**Tile Structure:**
```
hips/stars/
├── Norder0/Dir0/Npix*.fits
├── Norder1/Dir0/Npix*.fits
└── properties
```

**Properties File:**
```
hips_tile_format = fits
dataproduct_type = catalog
hips_frame = equatorial
```

## Deep Sky Objects

### EPH Format

**Source**: Custom binary format

**File**: `public/skydata/dso.eph`

**Structure:**
```
Header (32 bytes)
├── Magic: "EPH1"
├── Version: uint32
├── Object count: uint32
└── Reserved

Object Chunks (variable size)
├── Chunk header
│   ├── Type: uint32 (e.g., 'DSO ')
│   ├── Size: uint32
│   └── Count: uint32
└── Object data
    ├── RA, Dec (double)
    ├── Type (4 bytes)
    ├── Magnitude (float)
    ├── Size (float)
    └── Names (variable)
```

**Extraction Script**: [`extract_dso_data.py`](file:///d:/test/stellarium-web-engine-master/extract_dso_data.py)

```bash
python extract_dso_data.py
```

**Output Files:**
- `dso_extracted/dso_data.json` - Full DSO data (35,633 objects)
- `dso_extracted/dso_data.csv` - Spreadsheet format
- `dso_extracted/dso_data.txt` - Plain text
- `dso_extracted/dso_stats.json` - Statistics

**JSON Format:**
```json
{
  "types": ["G"],
  "model": "dso",
  "names": ["M 31", "NGC 224", "Andromeda Galaxy"],
  "short_name": "M 31",
  "model_data": {
    "ra": 0.7122,
    "de": 0.7206,
    "smax": 10800.0,
    "smin": 3600.0,
    "angle": 35.0,
    "vmag": 3.4
  }
}
```

## Satellite Data

### TLE Format

**Source**: [Space-Track.org](https://www.space-track.org)

**Input Format**: 3-Line Element (3LE)
```
0 STARLINK-1083
1 44939U 20001AB  20029.50001157  .00111291  00000-0  78686-3 0  9997
2 44939  52.9968 285.3893 0001218  70.8095  81.0718 15.73196118  1906
```

**Line 0**: Satellite name  
**Line 1**: Orbital elements (part 1)  
**Line 2**: Orbital elements (part 2)

### Processing Pipeline

**Step 1: Convert to JSONL**

**Script**: [`tle_satellite/convert_tle.py`](file:///d:/test/stellarium-web-engine-master/tle_satellite/convert_tle.py)

```bash
cd tle_satellite
python convert_tle.py
```

**Input**: `tle_base.txt` (3LE format)  
**Output**: `tle_satellite.jsonl`

**JSONL Format:**
```json
{
  "types": ["Asa"],
  "model": "tle_satellite",
  "model_data": {
    "norad_number": 44939,
    "designation": "20001AB",
    "tle": [
      "1 44939U 20001AB  20029.50001157  .00111291  00000-0  78686-3 0  9997",
      "2 44939  52.9968 285.3893 0001218  70.8095  81.0718 15.73196118  1906"
    ],
    "group": ["Starlink"],
    "status": "Operational",
    "owner": "United States",
    "launch_date": "2020-01-07"
  },
  "names": ["NAME STARLINK-1083", "NORAD 44939"],
  "short_name": "STARLINK-1083",
  "interest": 3.1
}
```

**Step 2: Remove Errors**

**Script**: [`tle_satellite/remove_error_satellites.py`](file:///d:/test/stellarium-web-engine-master/tle_satellite/remove_error_satellites.py)

Filters out satellites that cause SGP4 propagation errors.

**Step 3: Compress**

**Script**: [`tle_satellite/compress_sat.py`](file:///d:/test/stellarium-web-engine-master/tle_satellite/compress_sat.py)

```bash
python compress_sat.py
```

**Output**: `tle_satellite.dat` (gzipped JSONL)

**Deployment:**
```bash
cp tle_satellite.dat ../apps/web-frontend/public/skydata/
```

### Satellite Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `norad_number` | int | NORAD catalog number |
| `designation` | string | International designator |
| `tle` | array | Two-line elements |
| `group` | array | Categories (e.g., "Starlink") |
| `status` | string | Operational status |
| `owner` | string | Operating country/organization |
| `launch_date` | string | Launch date (ISO format) |

## Search Index

### Name Index Format

**File**: `public/skydata/name_index_compact.json`

**Generation Script**: [`create_name_index.py`](file:///d:/test/stellarium-web-engine-master/create_name_index.py)

```bash
python create_name_index.py
```

**Structure:**
```json
[
  {
    "names": ["Sirius", "Alpha CMa", "HIP 32349"],
    "type": "star",
    "model": "star",
    "hip": 32349,
    "vmag": -1.46
  },
  {
    "names": ["M 31", "NGC 224", "Andromeda Galaxy"],
    "type": "dso",
    "model": "dso",
    "vmag": 3.4
  }
]
```

**Statistics:**
- Total names: 59,703
- Stars: 24,070 (4,134 named + 9,968 HIP-only)
- DSOs: 35,633
- File size: 2.3 MB (compact), 12 MB (full)

### Search Algorithm

**Priority Order:**
1. Constellations
2. Planets
3. Stars
4. DSOs

**Matching:**
1. Exact match (highest priority)
2. Starts with query
3. Contains query

**Example:**
```javascript
function searchIndex(query, index) {
  const results = index.filter(obj => 
    obj.names.some(name => 
      name.toLowerCase().includes(query.toLowerCase())
    )
  );
  
  // Sort by relevance
  results.sort((a, b) => {
    const aExact = a.names.some(n => n.toLowerCase() === query);
    const bExact = b.names.some(n => n.toLowerCase() === query);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = a.names.some(n => n.toLowerCase().startsWith(query));
    const bStarts = b.names.some(n => n.toLowerCase().startsWith(query));
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return 0;
  });
  
  return results;
}
```

## HiPS Surveys

### HiPS Structure

**Format**: Hierarchical Progressive Survey

**Directory Structure:**
```
hips/<survey_name>/
├── Norder0/
│   └── Dir0/
│       ├── Npix0.webp
│       ├── Npix1.webp
│       └── ...
├── Norder1/
│   └── Dir0/
│       └── Npix*.webp
├── Norder2/
│   ├── Dir0/
│   └── Dir1024/
└── properties
```

**Properties File:**
```
hips_tile_format = webp
dataproduct_type = image
hips_frame = equatorial
hips_order = 5
hips_tile_width = 512
```

### HiPS Tile Naming

**Healpix Indexing:**
- `Norder`: Resolution level (0-29)
- `Npix`: Healpix pixel number
- `Dir`: Directory grouping (Npix / 10000 * 10000)

**Example:**
- Order 3, Pixel 42 → `Norder3/Dir0/Npix42.webp`
- Order 5, Pixel 12345 → `Norder5/Dir10000/Npix12345.webp`

### Downloading HiPS Data

**Script**: [`apps/web-frontend/download_dso_hips.py`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/download_dso_hips.py)

```bash
cd apps/web-frontend
python download_dso_hips.py
```

**Configuration:**
```python
DSO_HIPS = [
    {
        'id': 'm31',
        'name': 'Andromeda Galaxy',
        'ra': 10.68,    # degrees
        'dec': 41.27,   # degrees
        'size': 3.0,    # degrees
        'max_order': 5,
        'base_url': 'http://alasky.u-strasbg.fr/DSS/DSS2Merged'
    }
]
```

**Output**: `public/hips/m31/`

## Sky Cultures

### Sky Culture Format

**Directory Structure:**
```
public/skycultures/<culture_id>/
├── index.json              # Metadata
├── constellations.json     # Constellation data
├── star_names.json         # Star names
├── description.md          # Description
└── images/
    └── *.webp             # Constellation artwork
```

**index.json:**
```json
{
  "id": "western",
  "name": "Western",
  "author": "Stellarium Team",
  "description": "Modern IAU constellations",
  "fallback_to_international": true
}
```

**constellations.json:**
```json
{
  "constellations": [
    {
      "id": "AND",
      "name": "Andromeda",
      "lines": [
        ["HIP 677", "HIP 3092"],
        ["HIP 3092", "HIP 5447"]
      ],
      "boundaries": [/* ... */]
    }
  ]
}
```

**star_names.json:**
```json
{
  "HIP 677": "Alpheratz",
  "HIP 3092": "Mirach",
  "HIP 5447": "Almach"
}
```

## Data Processing Tools

### Star Data Extraction

**Script**: `extract_star_data.py`

**Features:**
- Extracts from embedded HIP catalog
- Generates JSON, CSV, TXT formats
- Computes statistics
- Filters by magnitude

**Usage:**
```bash
python extract_star_data.py --max-mag 6.0 --output stars_bright.json
```

### DSO Data Extraction

**Script**: `extract_dso_data.py`

**Features:**
- Parses EPH binary format
- Handles compression (zlib/deflate)
- Extracts all object types
- Generates multiple formats

**Usage:**
```bash
python extract_dso_data.py --input public/skydata/dso.eph
```

### Name Index Creation

**Script**: `create_name_index.py`

**Features:**
- Combines star and DSO data
- Creates searchable index
- Generates compact and full versions
- Computes statistics

**Usage:**
```bash
python create_name_index.py
```

**Output:**
- `name_index/name_index.json` (12 MB)
- `name_index/name_index_compact.json` (2.3 MB)
- `name_index/name_index.csv`
- `name_index/name_index.txt`
- `name_index/name_index_stats.json`

### Satellite Data Processing

**Scripts:**
1. `tle_satellite/convert_tle.py` - Convert 3LE to JSONL
2. `tle_satellite/remove_error_satellites.py` - Filter errors
3. `tle_satellite/compress_sat.py` - Compress to .dat

**Full Pipeline:**
```bash
cd tle_satellite
python convert_tle.py
python remove_error_satellites.py
python compress_sat.py
cp tle_satellite.dat ../apps/web-frontend/public/skydata/
```

### HiPS Download

**Script**: `apps/web-frontend/download_dso_hips.py`

**Features:**
- Downloads HiPS tiles for DSOs
- Configurable resolution
- Parallel downloads
- Progress tracking

**Usage:**
```bash
python download_dso_hips.py --dso m31 --max-order 5
```

## Data Update Workflow

### Updating Star Data

1. Update HIP catalog (if needed)
2. Run `extract_star_data.py`
3. Rebuild engine: `make js`

### Updating DSO Data

1. Update EPH file
2. Run `extract_dso_data.py`
3. Rebuild search index: `python create_name_index.py`
4. Copy to frontend: `cp name_index/name_index_compact.json apps/web-frontend/public/skydata/`

### Updating Satellite Data

1. Download latest TLE from Space-Track
2. Save as `tle_satellite/tle_base.txt`
3. Run processing pipeline (see above)
4. Deploy to frontend and Android

### Updating Search Index

1. Ensure star and DSO data are current
2. Run `python create_name_index.py`
3. Copy to frontend
4. Rebuild frontend: `npm run build`

---

**Next Steps:**
- See [Tools Guide](TOOLS_GUIDE.md) for detailed tool documentation
- Check [Setup Guide](SETUP_GUIDE.md) for build environment
- Read [API Reference](API_REFERENCE.md) for data access APIs
