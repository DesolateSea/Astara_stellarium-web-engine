
import axios from 'axios'

const INDEX_URL = 'skydata/search_index.json'

let indexData = null
let loadingPromise = null

// Binary search implementation for prefix matching
function binarySearchRange (arr, prefix) {
  let start = 0
  let end = arr.length - 1
  let firstIndex = -1

  // Find first occurrence
  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    const entry = arr[mid]
    // Entry format: "NORMALIZED|Original Name..."
    // We compare up to the prefix length
    const sepIndex = entry.indexOf('|')
    const normName = entry.substring(0, sepIndex)

    if (normName.startsWith(prefix)) {
      firstIndex = mid
      end = mid - 1 // Try to find earlier match
    } else if (normName < prefix) {
      start = mid + 1
    } else {
      end = mid - 1
    }
  }

  if (firstIndex === -1) return []

  // Collect all matches
  const results = []
  // Go forward from firstIndex
  for (let i = firstIndex; i < arr.length; i++) {
    const entry = arr[i]
    const sepIndex = entry.indexOf('|')
    const normName = entry.substring(0, sepIndex)

    if (normName.startsWith(prefix)) {
      results.push(entry)
      // Limit internal results if needed, but usually we filter later
      if (results.length > 50) break
    } else {
      break
    }
  }

  return results
}

function parseEntry (entry, typeOverride = null) {
  const parts = entry.split('|')
  const norm = parts[0]
  const name = parts[1]
  const type = typeOverride || (parts.length > 2 ? parts[2] : 'star') // Default to star if no type provided
  return {
    name: name,
    norm: norm,
    type: type,
    id: name // Using name as ID for consistency with old system for now
  }
}

export default {
  async loadIndex () {
    if (indexData) return indexData
    if (loadingPromise) return loadingPromise

    loadingPromise = axios.get(INDEX_URL).then(response => {
      indexData = response.data
      return indexData
    }).catch(err => {
      console.error('Failed to load search index', err)
      loadingPromise = null
      throw err
    })

    return loadingPromise
  },

  async search (normalizedQuery, limit = 10, filters = {}) {
    if (!indexData) await this.loadIndex()
    if (!normalizedQuery) return []

    const results = []

    // Search Stars
    if (filters.stars) {
      const matches = binarySearchRange(indexData.stars, normalizedQuery)
      for (const m of matches) {
        results.push(parseEntry(m, 'star'))
        if (results.length >= limit) break
      }
    }

    if (results.length >= limit) return results.slice(0, limit)

    // Search DSOs
    // Check specific DSO sub-filters
    const searchAllDsos = filters.dsos && !filters.dsoGalaxies && !filters.dsoNebulae && !filters.dsoClusters && !filters.dsoOther

    const dsoCategories = []
    if (searchAllDsos || filters.dsos) {
      // If 'dsos' main filter is on, we might want to include all unless sub-filters are specific
      // But usually if main is on and no sub-filters, we check all.
      // If sub-filters are present, we check them.
      if (filters.dsoGalaxies || searchAllDsos) dsoCategories.push('galaxies')
      if (filters.dsoNebulae || searchAllDsos) dsoCategories.push('nebulae')
      if (filters.dsoClusters || searchAllDsos) dsoCategories.push('clusters')
      if (filters.dsoOther || searchAllDsos) dsoCategories.push('other')
    } else {
      // If dsos is FALSE, we verify individual flags just in case (though typically parent flag handles it)
      if (filters.dsoGalaxies) dsoCategories.push('galaxies')
      if (filters.dsoNebulae) dsoCategories.push('nebulae')
      if (filters.dsoClusters) dsoCategories.push('clusters')
      if (filters.dsoOther) dsoCategories.push('other')
    }

    // We can prioritize based on categories or mix them
    for (const cat of dsoCategories) {
      const matches = binarySearchRange(indexData.dsos[cat], normalizedQuery)
      for (const m of matches) {
        results.push(parseEntry(m)) // Type is in the entry string
        if (results.length >= limit * 2) break // Collect a bit more to sort later
      }
    }

    // Deduplicate?
    // Sorting by relevance? (Exact match first)
    // For now, simple return
    return results.slice(0, limit)
  }
}
