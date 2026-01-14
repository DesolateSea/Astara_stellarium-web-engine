// Name Index Loader for optimized sky object search
// Loads and caches the name index for fast autocomplete

class NameIndexLoader {
  constructor () {
    this.index = null
    this.loading = false
    this.loadPromise = null
  }

  /**
           * Load the name index (lazy loading with caching)
           * @returns {Promise<Object>} The name index object
           */
  async load () {
    // Return cached index if already loaded
    if (this.index) {
      return Promise.resolve(this.index)
    }

    // Return existing promise if currently loading
    if (this.loading && this.loadPromise) {
      return this.loadPromise
    }

    // Start loading
    this.loading = true
    this.loadPromise = fetch('skydata/name_index_compact.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load name index')
        }
        return response.json()
      })
      .then(data => {
        this.index = data
        this.loading = false
        console.log('Name index loaded:', {
          stars: this.index.stars.length,
          dsos: this.index.dsos.length,
          total: this.index.all.length
        })
        return this.index
      })
      .catch(error => {
        this.loading = false
        this.loadPromise = null
        console.error('Failed to load name index:', error)
        // Return empty index on error
        this.index = { stars: [], dsos: [], all: [] }
        return this.index
      })

    return this.loadPromise
  }

  /**
       * Normalize a string for search comparison
       * - Removes all spaces and punctuation (. , - ' ")
       * - Converts to uppercase
       * - Strips "NAME " prefix if present
       * @param {string} str - String to normalize
       * @returns {string} Normalized string
       */
  normalize (str) {
    if (!str) return ''
    // Remove spaces, periods, and common punctuation
    let normalized = str.toUpperCase().replace(/[\s.,\-'"]+/g, '')
    // Remove NAME prefix for matching
    if (normalized.startsWith('NAME')) {
      normalized = normalized.substring(4)
    }
    return normalized
  }

  /**
         * Search for names matching a query
         * @param {string} query - Search query
         * @param {Array<string>} nameList - List of names to search
         * @param {number} limit - Maximum results
         * @returns {Array<string>} Matching names
         */
  searchNames (query, nameList, limit = 10) {
    if (!query || !nameList || nameList.length === 0) {
      return []
    }

    // Normalize query: remove spaces, uppercase, strip NAME prefix
    const queryNorm = this.normalize(query)
    if (!queryNorm) return []

    const exactMatches = []
    const startsWithMatches = []
    const containsMatches = []

    // Categorize matches by relevance
    for (const name of nameList) {
      if (exactMatches.length + startsWithMatches.length + containsMatches.length >= limit * 3) {
        break // Stop early if we have enough candidates
      }

      // Normalize name for comparison
      const nameNorm = this.normalize(name)

      if (nameNorm === queryNorm) {
        exactMatches.push(name)
      } else if (nameNorm.startsWith(queryNorm)) {
        startsWithMatches.push(name)
      } else if (nameNorm.includes(queryNorm)) {
        containsMatches.push(name)
      }
    }

    // Combine results in priority order
    return [
      ...exactMatches,
      ...startsWithMatches,
      ...containsMatches
    ].slice(0, limit)
  }

  /**
           * Search stars by name
           * @param {string} query - Search query
           * @param {number} limit - Maximum results
           * @returns {Promise<Array<string>>} Matching star names
           */
  async searchStars (query, limit = 10) {
    const index = await this.load()
    return this.searchNames(query, index.stars, limit)
  }

  /**
           * Search DSOs by name
           * @param {string} query - Search query
           * @param {number} limit - Maximum results
           * @returns {Promise<Array<string>>} Matching DSO names
           */
  async searchDSOs (query, limit = 10) {
    const index = await this.load()
    return this.searchNames(query, index.dsos, limit)
  }

  /**
     * Search all objects by name
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array<string>>} Matching object names
     */
  async searchAll (query, limit = 10) {
    const index = await this.load()
    return this.searchNames(query, index.all, limit)
  }

  /**
     * Check if index is loaded
     * @returns {boolean} True if loaded
     */
  isLoaded () {
    return this.index !== null
  }

  /**
     * Preload the index (call this on app startup)
     * @returns {Promise<void>}
     */
  async preload () {
    await this.load()
  }
}

/**
 * Constellation Index Loader
 * Loads constellation data from skycultures
 */
class ConstellationLoader {
  constructor () {
    this.constellations = null
    this.loading = false
    this.loadPromise = null
  }

  async load () {
    if (this.constellations) {
      return Promise.resolve(this.constellations)
    }

    if (this.loading && this.loadPromise) {
      return this.loadPromise
    }

    this.loading = true
    this.loadPromise = fetch('skydata/constellation_index.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load constellation index')
        }
        return response.json()
      })
      .then(data => {
        this.constellations = data
        this.loading = false
        console.log('Constellation index loaded:', this.constellations.length, 'constellations')
        return this.constellations
      })
      .catch(error => {
        this.loading = false
        this.loadPromise = null
        console.error('Failed to load constellation index:', error)
        this.constellations = []
        return this.constellations
      })

    return this.loadPromise
  }

  normalize (str) {
    if (!str) return ''
    return str.toUpperCase().replace(/[\s.,\-'"]+/g, '')
  }

  /**
     * Search constellations by name
     * @param {string} query - Search query
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Matching constellation objects
     */
  async searchConstellations (query, limit = 10) {
    const constellations = await this.load()
    if (!query || constellations.length === 0) {
      return []
    }

    const queryNorm = this.normalize(query)
    if (!queryNorm) return []

    // Get current skyculture from Vue store (or default to western)
    let currentCulture = 'western'
    try {
      const Vue = (await import('vue')).default
      if (Vue.prototype.$stel && Vue.prototype.$stel.core && Vue.prototype.$stel.core.skycultures) {
        currentCulture = Vue.prototype.$stel.core.skycultures.current_id || 'western'
      }
    } catch (e) {
      // Fallback to western if can't get current culture
    }

    // IMPORTANT: Only show constellations from the CURRENT active culture
    // The engine's getObj() only works for constellations in the active skyculture
    const allowedCulture = currentCulture

    const exactMatches = []
    const startsWithMatches = []
    const containsMatches = []

    for (const con of constellations) {
      if (exactMatches.length + startsWithMatches.length + containsMatches.length >= limit * 3) {
        break
      }

      // Only show constellations from the current active culture
      if (con.culture && con.culture !== allowedCulture) {
        continue
      }

      // Check all names from the 'names' array (includes english, native, pronounce, iau)
      // Also check individual fields for backwards compatibility
      const allNames = [
        ...(con.names || []),
        con.native,
        con.english,
        con.iau,
        con.pronounce
      ].filter(n => n)

      let matchType = null

      for (const name of allNames) {
        const nameNorm = this.normalize(name)
        if (nameNorm === queryNorm) {
          matchType = 'exact'
          break
        } else if (!matchType && nameNorm.startsWith(queryNorm)) {
          matchType = 'startsWith'
        } else if (!matchType && nameNorm.includes(queryNorm)) {
          matchType = 'contains'
        }
      }

      if (matchType === 'exact') {
        exactMatches.push(con)
      } else if (matchType === 'startsWith') {
        startsWithMatches.push(con)
      } else if (matchType === 'contains') {
        containsMatches.push(con)
      }
    }

    return [
      ...exactMatches,
      ...startsWithMatches,
      ...containsMatches
    ].slice(0, limit)
  }
}

// Export singleton instances
const nameIndexLoader = new NameIndexLoader()
const constellationLoader = new ConstellationLoader()
export default nameIndexLoader
export { constellationLoader }
