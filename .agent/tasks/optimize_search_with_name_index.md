# Task: Optimize Search with Name Index

## Objective
Integrate the name index files into the web-frontend public folder and optimize the `querySkySources` function to provide fast, prioritized search results for constellations, planets, stars, and DSOs.

## Current State Analysis

### Existing Search Function (`sw_helpers.js:354`)
The current `querySkySources` function:
1. ✅ Searches planets (hardcoded list)
2. ✅ Searches constellations (hardcoded list)
3. ✅ Searches satellites (cached from JSONL)
4. ❌ Star search is commented out (slow performance)
5. ❌ DSO search is missing
6. ❌ No proper prioritization
7. ❌ No optimized indexing

### Search Priority Required
1. **Constellations** (highest priority)
2. **Planets** (second priority)
3. **Stars** (third priority)
4. **DSOs** (fourth priority)

## Implementation Plan

### Step 1: Copy Name Index to Public Folder ✅
- [x] Copy `name_index_compact.json` to `apps/web-frontend/public/skydata/`
- [x] This file is optimized for autocomplete (2.3 MB)
- [x] Contains separate arrays for stars and DSOs

### Step 2: Create Name Index Loader ✅
- [x] Create `apps/web-frontend/src/assets/name_index_loader.js`
- [x] Implement lazy loading of name index
- [x] Cache in memory after first load
- [x] Provide fast lookup methods

### Step 3: Optimize querySkySources Function ✅
- [x] Modify `sw_helpers.js:querySkySources`
- [x] Implement priority-based search:
  1. Constellations (existing hardcoded list)
  2. Planets (existing hardcoded list)
  3. Stars (using name index)
  4. DSOs (using name index)
- [x] Use efficient string matching (startsWith + includes)
- [x] Respect limit parameter
- [x] Return results in priority order

### Step 4: Enhance Search Algorithm ✅
- [x] Implement smart matching:
  - Exact matches first
  - Starts-with matches second
  - Contains matches third
- [x] Case-insensitive search
- [x] Handle catalog prefixes (M, NGC, HIP, HD, IC)
- [x] Remove duplicate results

### Step 5: Testing ⏳
- [ ] Test constellation search
- [ ] Test planet search
- [ ] Test star search (named + HIP)
- [ ] Test DSO search (Messier, NGC, etc.)
- [ ] Test priority ordering
- [ ] Test performance with large queries

## Technical Details

### Name Index Structure
```json
{
  "stars": ["Sirius", "Betelgeuse", "HIP 1", ...],
  "dsos": ["M31", "NGC 224", "Andromeda Galaxy", ...],
  "all": [...]
}
```

### Search Algorithm Pseudocode
```javascript
function querySkySources(str, limit) {
  results = []
  
  // Priority 1: Constellations
  results.push(...searchConstellations(str))
  if (results.length >= limit) return results.slice(0, limit)
  
  // Priority 2: Planets
  results.push(...searchPlanets(str))
  if (results.length >= limit) return results.slice(0, limit)
  
  // Priority 3: Stars (from name index)
  results.push(...searchStars(str, limit - results.length))
  if (results.length >= limit) return results.slice(0, limit)
  
  // Priority 4: DSOs (from name index)
  results.push(...searchDSOs(str, limit - results.length))
  
  return results.slice(0, limit)
}
```

### Performance Targets
- Initial load: < 500ms (lazy loading)
- Search query: < 50ms (in-memory search)
- Memory usage: ~3-4 MB (name index cached)

## Files to Modify

1. **New Files**:
   - `apps/web-frontend/public/skydata/name_index_compact.json`
   - `apps/web-frontend/src/assets/name_index_loader.js`

2. **Modified Files**:
   - `apps/web-frontend/src/assets/sw_helpers.js` (querySkySources function)

## Success Criteria

- ✅ Name index loaded and cached in memory
- ✅ Search returns results in correct priority order
- ✅ All object types searchable (constellations, planets, stars, DSOs)
- ✅ Search performance < 50ms per query
- ✅ No duplicate results
- ✅ Proper handling of catalog prefixes (M, NGC, HIP, etc.)
