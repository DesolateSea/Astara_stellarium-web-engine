# Sky Object Name Index

This directory contains comprehensive name index files extracted from Stellarium's star and DSO (Deep Sky Object) data.

## 📊 Statistics

- **Total unique names**: 59,703
- **Stars**: 24,070 names
  - Named stars: 4,134
  - HIP/HD catalog only: 9,968
- **DSOs**: 35,633 names

## 📁 Files

### `name_index.json`
**Full index with complete metadata**
- Size: ~12 MB
- Format: JSON array of objects
- Contains: name, type, coordinates (RA/Dec), magnitude, catalog IDs, etc.
- Use case: Complete reference, database import, detailed lookups

Example entry:
```json
{
  "name": "Sirius",
  "type": "star",
  "hip": 32349,
  "hd": 48915,
  "vmag": -1.46,
  "ra": 101.287,
  "de": -16.716,
  "primary_name": "Sirius"
}
```

### `name_index_compact.json`
**Compact index for autocomplete**
- Size: ~2.3 MB
- Format: JSON object with three arrays
- Contains: Simple name lists organized by type
- Use case: Autocomplete, quick search, name validation

Structure:
```json
{
  "stars": ["Sirius", "Betelgeuse", "HIP 1", ...],
  "dsos": ["M31", "NGC 224", "Andromeda Galaxy", ...],
  "all": ["Sirius", "M31", "HIP 1", ...]
}
```

### `name_index.csv`
**Spreadsheet format**
- Size: ~4.6 MB
- Format: CSV with headers
- Columns: name, type, primary_name, vmag, ra, de, hip, hd, dso_type
- Use case: Excel/spreadsheet analysis, database import, manual review

### `name_index.txt`
**Plain text list**
- Size: ~720 KB
- Format: Plain text, organized by type
- Contains: Simple alphabetical lists
- Use case: Quick reference, grep searches, human reading

### `name_index_stats.json`
**Statistics summary**
- Size: ~1 KB
- Format: JSON object
- Contains: Counts by type, DSO type breakdown
- Use case: Quick overview, documentation

## 🌟 Star Naming Convention

Stars are indexed with the following priority:

1. **Proper names** (e.g., "Sirius", "Betelgeuse")
2. **Bayer designations** (e.g., "alf CMa", "bet Ori")
3. **Flamsteed numbers** (e.g., "1 And", "61 Cyg")
4. **HIP numbers** (e.g., "HIP 32349") - **Used as default for unnamed stars**
5. **HD numbers** (e.g., "HD 48915")

**Important**: For stars without proper names or traditional designations, the format `HIP <number>` is used as the primary identifier.

## 🌌 DSO Naming Convention

DSOs include multiple catalog identifiers:

- **Messier** (M1-M110)
- **NGC** (New General Catalogue)
- **IC** (Index Catalogue)
- **Common names** (e.g., "Andromeda Galaxy", "Pleiades")
- **Other catalogs** (e.g., "Cl Melotte 22")

## 🔍 Usage Examples

### JavaScript/TypeScript (Autocomplete)
```javascript
// Load compact index for autocomplete
const index = await fetch('name_index_compact.json').then(r => r.json());

// Search function
function searchSkyObjects(query) {
  const q = query.toLowerCase();
  return index.all.filter(name => 
    name.toLowerCase().includes(q)
  ).slice(0, 10);
}

// Example: searchSkyObjects("sirius") → ["Sirius", ...]
```

### Python (Full metadata lookup)
```python
import json

# Load full index
with open('name_index.json', 'r', encoding='utf-8') as f:
    index = json.load(f)

# Create lookup dictionary
lookup = {item['name'].lower(): item for item in index}

# Search
def find_object(name):
    return lookup.get(name.lower())

# Example
obj = find_object("M31")
print(f"{obj['name']} at RA={obj['ra']}, Dec={obj['de']}")
```

### SQL Database Import
```sql
-- Create table
CREATE TABLE sky_objects (
    name TEXT PRIMARY KEY,
    type TEXT,
    primary_name TEXT,
    vmag REAL,
    ra REAL,
    de REAL,
    hip INTEGER,
    hd INTEGER,
    dso_type TEXT
);

-- Import from CSV
.mode csv
.import name_index.csv sky_objects

-- Query examples
SELECT * FROM sky_objects WHERE name LIKE '%Sirius%';
SELECT * FROM sky_objects WHERE type = 'dso' AND vmag < 6.0;
SELECT * FROM sky_objects WHERE name LIKE 'HIP %' LIMIT 10;
```

## 📝 DSO Types

Common DSO types in the index:

- **GiG** (10,605): Galaxy in Group
- **G** (6,808): Galaxy
- **GiP** (3,276): Galaxy in Pair
- **LIN** (3,241): LINER-type Active Galaxy Nucleus
- **EmG** (2,077): Emission-line galaxy
- **OpC** (1,303): Open Cluster
- **Sy2** (1,102): Seyfert 2 Galaxy
- **rG** (1,067): Radio Galaxy
- **AGN** (794): Active Galaxy Nucleus
- **IG** (651): Irregular Galaxy
- **GiC** (651): Galaxy in Cluster
- **PN** (567): Planetary Nebula
- **Cl*** (542): Star Cluster
- **BiC** (511): Binary Cluster
- **LSB** (477): Low Surface Brightness Galaxy
- **H2G** (359): HII Galaxy
- **GlC** (351): Globular Cluster
- And many more...

## 🔧 Generation

These files were generated using `create_name_index.py` from the extracted star and DSO data.

To regenerate:
```bash
python create_name_index.py
```

## 📚 Source Data

- **Stars**: Extracted from `apps/web-frontend/public/skydata/stars/*.eph`
- **DSOs**: Extracted from `apps/web-frontend/public/skydata/dso/*.eph`

## 🎯 Use Cases

1. **Autocomplete in search boxes**: Use `name_index_compact.json`
2. **Object lookup by name**: Use `name_index.json` with a dictionary/map
3. **Database population**: Import `name_index.csv` into SQL database
4. **Quick reference**: View `name_index.txt`
5. **Analytics**: Use `name_index_stats.json` for overview

## 💡 Tips

- For **fast autocomplete**, load `name_index_compact.json` into memory
- For **detailed lookups**, create a hash map from `name_index.json`
- For **SQL queries**, import `name_index.csv` into SQLite/PostgreSQL
- **HIP numbers** are the most reliable identifiers for stars
- **Multiple names** may point to the same object (e.g., "M31" and "NGC 224")
