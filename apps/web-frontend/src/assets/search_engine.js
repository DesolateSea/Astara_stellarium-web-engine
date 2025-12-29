// Stellarium Web - Search Engine Module
// Separated for optimization and testing
// Copyright (c) 2022 - Stellarium Labs SRL

import Vue from 'vue'
import optimizedLoader from './optimized_index_loader'
// We only import constellationLoader to avoid loading the massive name index
import { constellationLoader } from './name_index_loader'

/**
 * Normalize a string for search comparison
 * - Removes spaces, punctuation
 * - Converts to uppercase
 * - Strips "NAME " prefix
 */
export function normalize (s) {
  if (!s) return ''
  let n = s.toUpperCase().replace(/[\s.,\-'"]+/g, '')
  if (n.startsWith('NAME')) n = n.substring(4)
  return n
}

/**
 * Default search filters configuration
 */
export const defaultFilters = {
  planets: true,
  stars: true,
  constellations: true,
  dsos: true,
  satellites: true,
  comets: true,
  minorPlanets: true,
  favourites: false,
  favouritesList: []
}

/**
 * Main search function - queries sky sources based on string and filters
 * @param {string} str - Search query
 * @param {number} limit - Maximum results
 * @param {object} filters - Filter options
 * @param {object} dataProviders - Object providing cached data (satellites, comets, etc.)
 * @returns {Promise<Array>} Search results
 */
export async function querySkySources (str, limit = 10, filters = {}, dataProviders = {}) {
  const useFilters = { ...defaultFilters, ...filters }
  const $stel = Vue.prototype.$stel
  if (!$stel) {
    return []
  }
  console.log('initialize')
  const results = []
  const seenNames = new Set()
  const searchNorm = normalize(str)

  let searchingGlobals = false
  let headerAdded = false
  let favCount = 0

  // Helper to add result with deduplication
  // Returns true if added, false if duplicate
  const addResult = (ss) => {
    const primaryName = ss.names && ss.names[0] ? ss.names[0] : ss.match
    const normName = normalize(primaryName)
    // Use model + type for disambiguation (e.g., "dso" vs "constellation" vs "tle_satellite")
    const typeKey = ss.types && ss.types[0] ? ss.types[0] : ''
    const modelKey = ss.model || 'unknown'

    if (searchingGlobals && favCount > 0 && !headerAdded) {
      const uniqueKey = normName + '|' + modelKey + '|' + typeKey
      if (!seenNames.has(uniqueKey)) {
        results.push({ header: true, text: 'Other Results' })
        headerAdded = true
      }
    }

    const uniqueKey = normName + '|' + modelKey + '|' + typeKey
    if (!seenNames.has(uniqueKey)) {
      seenNames.add(uniqueKey)
      results.push(ss)
      return true
    }
    return false
  }

  // 1. Search Favourites First
  if (useFilters.favouritesList && useFilters.favouritesList.length > 0) {
    for (const fav of useFilters.favouritesList) {
      const nameMatch = !searchNorm || fav.names.some(n => {
        const nNorm = normalize(n)
        return nNorm.includes(searchNorm) || searchNorm.includes(nNorm)
      })
      if (!nameMatch) continue

      const t = fav.types ? fav.types[0] : 'unknown'
      let typeMatch = false
      if (['Sun', 'Moo', 'Pla'].includes(t) && useFilters.planets) typeMatch = true
      else if (t === 'Star' && useFilters.stars) typeMatch = true
      else if (t === 'Con' && useFilters.constellations) typeMatch = true
      else if (['Asa'].includes(t) && useFilters.satellites) typeMatch = true
      else if (t === 'dso' && useFilters.dsos) typeMatch = true
      else if (!['Sun', 'Moo', 'Pla', 'Star', 'Con', 'Asa'].includes(t) && useFilters.dsos) typeMatch = true

      if (typeMatch) addResult(fav)
    }
  }

  favCount = results.length
  searchingGlobals = true
  const globalLimit = limit + favCount

  // 2. Search Planets
  if (useFilters.planets) {
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Moon', 'Sun']
    for (const planet of planets) {
      if (results.length >= globalLimit) break
      if (normalize(planet).includes(searchNorm)) {
        const obj = $stel.getObj('NAME ' + planet)
        if (obj) {
          addResult({
            names: [planet],
            types: [planet === 'Sun' ? 'Sun' : (planet === 'Moon' ? 'Moo' : 'Pla')],
            model: 'jpl_sso',
            match: planet
          })
        }
      }
    }
  }

  // 3 & 4. Parallel Search: Stars & DSOs (Index) and Constellations
  const searchPromises = []

  // Promise for Index Search (Stars & DSOs)
  if ((useFilters.stars || useFilters.dsos) && results.length < globalLimit) {
    searchPromises.push(
      optimizedLoader.search(searchNorm, limit * 3, useFilters)
        .then(res => ({ type: 'index', results: res }))
        .catch(e => {
          console.log('Optimized index search failed:', e)
          return { type: 'index', results: [] }
        })
    )
  }

  // Promise for Constellation Search
  if (useFilters.constellations && results.length < globalLimit) {
    searchPromises.push(
      constellationLoader.searchConstellations(str, limit * 2)
        .then(res => ({ type: 'constellation', results: res }))
        .catch(e => {
          console.log('Constellation search failed:', e)
          return { type: 'constellation', results: [] }
        })
    )
  }

  if (searchPromises.length > 0) {
    const searchResults = await Promise.all(searchPromises)

    for (const batch of searchResults) {
      if (results.length >= globalLimit) break

      if (batch.type === 'index') {
        for (const res of batch.results) {
          if (results.length >= globalLimit) break

          let obj = null
          const lookupName = res.name
          const lookupAttempts = [lookupName, 'NAME ' + lookupName, lookupName.replace(/\./g, '')]
          if (res.name.startsWith('HIP ')) lookupAttempts.push(lookupName)

          for (const attempt of lookupAttempts) {
            obj = $stel.getObj(attempt)
            if (obj) break
          }

          if (obj) {
            const ss = obj.jsonData || {}
            ss.names = ss.names || obj.designations() || [lookupName]
            ss.types = ss.types || [(res.type === 'star' ? '*' : 'dso')]
            ss.model = (res.type === 'star') ? 'star' : 'dso'
            ss.match = lookupName
            addResult(ss)
          }
        }
      } else if (batch.type === 'constellation') {
        for (const con of batch.results) {
          if (results.length >= globalLimit) break
          const searchNormalized = normalize(str)
          let matchedName = con.english || con.native || con.iau

          const allNames = [con.english, con.native, con.iau].filter(n => n)
          for (const name of allNames) {
            if (normalize(name).includes(searchNormalized) || searchNormalized.includes(normalize(name))) {
              matchedName = name
              break
            }
          }

          addResult({
            names: [matchedName, con.english, con.native, con.iau].filter(n => n),
            types: ['Con'],
            model: 'constellation',
            model_data: { iau_abbreviation: con.iau, con_id: con.id },
            match: matchedName
          })
        }
      }
    }
  }

  // 6. Search Satellites
  if (useFilters.satellites && results.length < globalLimit && dataProviders.satellites) {
    for (const sat of dataProviders.satellites) {
      if (results.length >= globalLimit) break
      const nameMatch = sat.names.some(n => {
        const satNorm = normalize(n)
        return satNorm.includes(searchNorm) || searchNorm.includes(satNorm)
      })
      if (nameMatch) {
        addResult({
          model_data: sat.model_data,
          names: [...sat.names],
          types: sat.types,
          model: 'tle_satellite',
          match: sat.names[0]
        })
      }
    }
  }

  // 7. Search Comets
  if (useFilters.comets && results.length < globalLimit && dataProviders.comets) {
    for (const comet of dataProviders.comets) {
      if (results.length >= globalLimit) break
      const names = comet.names || [comet.match]
      const nameMatch = names.some(n => {
        const cNorm = normalize(n)
        return cNorm.includes(searchNorm) || searchNorm.includes(cNorm)
      })
      if (nameMatch) addResult(comet)
    }
  }

  // 8. Search Minor Planets
  if (useFilters.minorPlanets && results.length < globalLimit && dataProviders.minorPlanets) {
    for (const mp of dataProviders.minorPlanets) {
      if (results.length >= globalLimit) break
      const names = mp.names || [mp.match]
      const nameMatch = names.some(n => {
        const mNorm = normalize(n)
        return mNorm.includes(searchNorm) || searchNorm.includes(mNorm)
      })
      if (nameMatch) addResult(mp)
    }
  }

  // Fallback: Direct object lookup
  if (results.length === favCount) {
    const directObj = $stel.getObj(str) || $stel.getObj('NAME ' + str)
    if (directObj) {
      const ss = directObj.jsonData || {}
      ss.names = ss.names || directObj.designations() || [str]
      ss.types = ss.types || [directObj.type || 'unknown']
      ss.match = str

      let include = false
      const t = ss.types[0]
      if (['Sun', 'Moo', 'Pla'].includes(t) && useFilters.planets) include = true
      else if (t === 'Star' && useFilters.stars) include = true
      else if (t === 'Con' && useFilters.constellations) include = true
      else if (['Asa'].includes(t) && useFilters.satellites) include = true
      else if (useFilters.dsos) include = true

      if (include) addResult(ss)
    }
  }

  return results.slice(0, globalLimit + 1)
}

export default {
  normalize,
  querySkySources,
  defaultFilters
}
