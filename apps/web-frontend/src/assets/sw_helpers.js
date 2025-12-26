// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

import Vue from 'vue'
import _ from 'lodash'
import StelWebEngine from '@/assets/js/stellarium-web-engine.js'
import Moment from 'moment'

var DDDate = Date
DDDate.prototype.getJD = function () {
  return (this.getTime() / 86400000) + 2440587.5
}

DDDate.prototype.setJD = function (jd) {
  this.setTime((jd - 2440587.5) * 86400000)
}

DDDate.prototype.getMJD = function () {
  return this.getJD() - 2400000.5
}

DDDate.prototype.setMJD = function (mjd) {
  this.setJD(mjd + 2400000.5)
}

const swh = {
  initStelWebEngine: function (store, wasmFile, canvasElem, callBackOnDone) {
    StelWebEngine({
      wasmFile: wasmFile,
      canvas: canvasElem,
      translateFn: function (domain, str) {
        return str
        // return i18next.t(str, {ns: domain});
      },
      onReady: function (lstel) {
        store.commit('replaceStelWebEngine', lstel.getTree())
        // Initial sync of the tree
        store.commit('replaceStelWebEngine', lstel.getTree())

        // Throttled sync of essential state
        let lastUpdateTime = 0
        let throttleTimer = null

        lstel.onValueChanged(function (path, value) {
          // Data synchronization filtering removed by user request (allow all)
          // const essentialPaths = ['fov', 'observer.utc', 'observer.latitude', 'observer.longitude']
          // const allowedPrefixes = ['observer.', 'lines.', 'constellations.', 'landscapes.', 'atmosphere.', 'stars.', 'planets.', 'dsos.', 'satellites.', 'night_mode', 'selection']
          // if (!essentialPaths.includes(path) && !allowedPrefixes.some(prefix => path.startsWith(prefix))) return
          const tree = store.state.stel
          if (!tree) return
          _.set(tree, path, value)

          const now = Date.now()
          if (now - lastUpdateTime > 66) { // ~15 fps is enough for labels
            store.commit('replaceStelWebEngine', { ...tree })
            lastUpdateTime = now
            if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null }
          } else if (!throttleTimer) {
            throttleTimer = setTimeout(() => {
              store.commit('replaceStelWebEngine', { ...tree })
              lastUpdateTime = Date.now()
              throttleTimer = null
            }, 100)
          }
        })
        Vue.prototype.$stel = lstel
        Vue.prototype.$selectionLayer = lstel.createLayer({ id: 'slayer', z: 50, visible: true })
        Vue.prototype.$observingLayer = lstel.createLayer({ id: 'obslayer', z: 40, visible: true })
        Vue.prototype.$skyHintsLayer = lstel.createLayer({ id: 'skyhintslayer', z: 38, visible: true })
        callBackOnDone()
      }
    })
  },

  monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],

  astroConstants: {
    AU: 149597870700.0,
    R_Earth: 6378137.0
  },

  _cachedSatellites: null,
  _loadSatellites: function () {
    if (this._loadingSatellites) return
    this._loadingSatellites = true
    fetch('skydata/tle_satellite.jsonl')
      .then(r => r.text())
      .then(text => {
        const lines = text.split('\n')
        this._cachedSatellites = []
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const sat = JSON.parse(line)
            if (sat.names) {
              this._cachedSatellites.push(sat)
            }
          } catch (e) {
            // ignore bad lines
          }
        }
        console.log('Loaded ' + this._cachedSatellites.length + ' satellites for search cache')
      })
      .catch(e => console.error('Failed to load satellites for search', e))
      .finally(() => { this._loadingSatellites = false })
  },
  // Light time for 1 au in s
  ERFA_AULT: 499.004782,
  // Seconds per day
  ERFA_DAYSEC: 86400.0,
  // Days per Julian year
  ERFA_DJY: 365.25,
  // Astronomical unit in m
  ERFA_DAU: 149597870000,

  iconForSkySourceTypes: function (skySourceTypes) {
    // Array sorted by specificity, i.e. the most generic names at the end
    const iconForType = {
      // Stars
      'Pec?': 'star',
      '**?': 'double_star',
      '**': 'double_star',
      'V*': 'variable_star',
      'V*?': 'variable_star',
      '*': 'star',

      // Candidates
      'As?': 'group_of_stars',
      'SC?': 'group_of_galaxies',
      'Gr?': 'group_of_galaxies',
      'C?G': 'group_of_galaxies',
      'G?': 'galaxy',

      // Multiple objects
      reg: 'region_defined_in_the_sky',
      SCG: 'group_of_galaxies',
      ClG: 'group_of_galaxies',
      GrG: 'group_of_galaxies',
      IG: 'interacting_galaxy',
      PaG: 'pair_of_galaxies',
      'C?*': 'open_galactic_cluster',
      'Gl?': 'globular_cluster',
      GlC: 'globular_cluster',
      OpC: 'open_galactic_cluster',
      'Cl*': 'open_galactic_cluster',
      'As*': 'group_of_stars',
      mul: 'multiple_objects',

      // Interstellar matter
      'PN?': 'planetary_nebula',
      PN: 'planetary_nebula',
      SNR: 'planetary_nebula',
      'SR?': 'planetary_nebula',
      ISM: 'interstellar_matter',

      // Galaxies
      PoG: 'part_of_galaxy',
      QSO: 'quasar',
      G: 'galaxy',

      dso: 'deep_sky',

      // Solar System
      Asa: 'artificial_satellite',
      Moo: 'moon',
      Sun: 'sun',
      Pla: 'planet',
      DPl: 'planet',
      Com: 'comet',
      MPl: 'minor_planet',
      SSO: 'minor_planet',

      Con: 'constellation'
    }
    for (const i in skySourceTypes) {
      if (skySourceTypes[i] in iconForType) {
        return process.env.BASE_URL + 'images/svg/target_types/' + iconForType[skySourceTypes[i]] + '.svg'
      }
    }
    return process.env.BASE_URL + 'images/svg/target_types/unknown.svg'
  },

  iconForSkySource: function (skySource) {
    return swh.iconForSkySourceTypes(skySource.types)
  },

  iconForObservation: function (obs) {
    if (obs && obs.target) {
      return this.iconForSkySource(obs.target)
    } else {
      return this.iconForSkySourceTypes(['reg'])
    }
  },

  cleanupOneSkySourceName: function (name, flags) {
    flags = flags || 4
    return Vue.prototype.$stel.designationCleanup(name, flags)
  },

  nameForSkySource: function (skySource) {
    if (!skySource || !skySource.names) {
      return '?'
    }
    return this.cleanupOneSkySourceName(skySource.names[0])
  },

  culturalNameToList: function (cn) {
    const res = []

    const formatNative = function (_cn) {
      if (cn.name_native && cn.name_pronounce) {
        return cn.name_native + ', <i>' + cn.name_pronounce + '</i>'
      }
      if (cn.name_native) {
        return cn.name_native
      }
      if (cn.name_pronounce) {
        return cn.name_pronounce
      }
    }

    const nativeName = formatNative(cn)
    if (cn.user_prefer_native && nativeName) {
      res.push(nativeName)
    }
    if (cn.name_translated) {
      res.push(cn.name_translated)
    }
    if (!cn.user_prefer_native && nativeName) {
      res.push(nativeName)
    }
    return res
  },

  namesForSkySource: function (ss, flags) {
    // Return a list of cleaned up names
    if (!ss || !ss.names) {
      return []
    }
    if (!flags) flags = 10
    let res = []
    if (ss.culturalNames) {
      for (const i in ss.culturalNames) {
        res = res.concat(this.culturalNameToList(ss.culturalNames[i]))
      }
    }
    res = res.concat(ss.names.map(n => Vue.prototype.$stel.designationCleanup(n, flags)))
    // Remove duplicates, this can happen between * and V* catalogs
    res = res.filter(function (v, i) { return res.indexOf(v) === i })
    res = res.filter(function (v, i) { return !v.startsWith('CON ') })
    return res
  },

  nameForSkySourceType: function (otype) {
    const $stel = Vue.prototype.$stel
    const res = $stel.otypeToStr(otype)
    return res || 'Unknown Type'
  },

  nameForGalaxyMorpho: function (morpho) {
    const galTab = {
      E: 'Elliptical',
      SB: 'Barred Spiral',
      SAB: 'Intermediate Spiral',
      SA: 'Spiral',
      S0: 'Lenticular',
      S: 'Spiral',
      Im: 'Irregular',
      dSph: 'Dwarf Spheroidal',
      dE: 'Dwarf Elliptical'
    }
    for (const morp in galTab) {
      if (morpho.startsWith(morp)) {
        return galTab[morp]
      }
    }
    return ''
  },

  getShareLink: function (context) {
    let link = 'https://stellarium-web.org/'
    if (context.$store.state.selectedObject) {
      link += 'skysource/' + this.cleanupOneSkySourceName(context.$store.state.selectedObject.names[0], 5).replace(/\s+/g, '')
    }
    link += '?'
    link += 'fov=' + (context.$store.state.stel.fov * 180 / Math.PI).toPrecision(5)
    const d = new Date()
    d.setMJD(context.$stel.core.observer.utc)
    link += '&date=' + new Moment(d).utc().format()
    link += '&lat=' + (context.$stel.core.observer.latitude * 180 / Math.PI).toFixed(2)
    link += '&lng=' + (context.$stel.core.observer.longitude * 180 / Math.PI).toFixed(2)
    link += '&elev=' + context.$stel.core.observer.elevation
    if (!context.$store.state.selectedObject) {
      link += '&az=' + (context.$stel.core.observer.yaw * 180 / Math.PI).toPrecision(5)
      link += '&alt=' + (context.$stel.core.observer.pitch * 180 / Math.PI).toPrecision(5)
    }
    return link
  },

  // Return a SweObj matching a passed sky source JSON object if it's already instanciated in SWE
  skySource2SweObj: function (ss) {
    if (!ss || !ss.model) {
      return undefined
    }
    const $stel = Vue.prototype.$stel
    let obj
    if (ss.model === 'tle_satellite') {
      const id = 'NORAD ' + ss.model_data.norad_number
      obj = $stel.getObj(id)
    } else if (ss.model === 'constellation' && ss.model_data) {
      // Try direct con_id first, then construct from iau_abbreviation
      if (ss.model_data.con_id) {
        obj = $stel.getObj(ss.model_data.con_id)
      }
      if (!obj && ss.model_data.iau_abbreviation) {
        const id = 'CON western ' + ss.model_data.iau_abbreviation
        obj = $stel.getObj(id)
      }
    }
    if (!obj && ss.names && ss.names.length) {
      const name = ss.names[0]
      // Try direct lookup first
      obj = $stel.getObj(name)

      // Try with '* ' prefix for Bayer/Flamsteed designations
      if (!obj) {
        obj = $stel.getObj('* ' + name)
      }

      // Try with 'NAME ' prefix
      if (!obj) {
        obj = $stel.getObj('NAME ' + name)
      }

      // Try without period (mu. CMa -> mu CMa)
      if (!obj && name.includes('.')) {
        const noPeriod = name.replace(/\./g, '')
        obj = $stel.getObj('* ' + noPeriod) || $stel.getObj(noPeriod)
      }

      // If match is a different name, also try that
      if (!obj && ss.match && ss.match !== name) {
        obj = $stel.getObj(ss.match) || $stel.getObj('* ' + ss.match) || $stel.getObj('NAME ' + ss.match)
      }
    }
    if (!obj && ss.names && ss.names[0] && ss.names[0].startsWith('Gaia DR2 ')) {
      const gname = ss.names[0].replace(/^Gaia DR2 /, 'GAIA ')
      obj = $stel.getObj(gname)
    }
    if (obj === null) return undefined
    return obj
  },

  // Monkey patch to fix a bug in Stellarium Web Engine where /properties is requested instead of /properties.txt
  // This is a temporary fix until the engine is updated.
  initMonkeyPatches: function () {
    const originalFetch = window.fetch
    window.fetch = function (input, init) {
      const url = (typeof input === 'string') ? input : (input instanceof URL ? input.href : (input && input.url))

      // Log every fetch tailored to our debug needs
      if (typeof url === 'string' && url.includes('/hips/')) {
        console.log('sw_helpers (Fetch): Requesting HiPS asset: ' + url)
      }

      if (typeof url === 'string' && url.includes('/properties') && !url.includes('/properties.txt')) {
        const newUrl = url.replace(/\/+properties(\?|$)/, '/properties.txt$1')
        console.log('sw_helpers (Fetch): Redirecting properties to ' + newUrl)
        if (typeof input === 'string') input = newUrl
        else if (input instanceof URL) input = new URL(newUrl)
      }
      return originalFetch(input, init)
    }

    const originalOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      if (typeof url === 'string' && url.includes('/hips/')) {
        console.log('sw_helpers (XHR): Requesting HiPS asset: ' + url)
      }

      if (typeof url === 'string' && url.includes('/properties') && !url.includes('/properties.txt')) {
        const newUrl = url.replace(/\/+properties(\?|$)/, '/properties.txt$1')
        console.log('sw_helpers (XHR): Redirecting properties to ' + newUrl)
        url = newUrl
      }
      return originalOpen.call(this, method, url, ...args)
    }
  },

  lookupSkySourceByName: function (name) {
    const ENABLE_API_LOOKUP = false

    if (ENABLE_API_LOOKUP) {
      return fetch(process.env.VUE_APP_NOCTUASKY_API_SERVER + '/api/v1/skysources/name/' + name)
        .then(function (response) {
          if (!response.ok) {
            throw response.body
          }
          return response.json()
        }, err => {
          console.warn('API lookup failed for ' + name + ', trying local implementation.', err)
          return this._lookupSkySourceLocal(name)
        })
    } else {
      return this._lookupSkySourceLocal(name)
    }
  },

  _lookupSkySourceLocal: function (name) {
    const $stel = Vue.prototype.$stel
    if ($stel) {
      console.log('lookupSkySourceByName: ' + name)
      const obj = $stel.getObj('NAME ' + name) || $stel.getObj(name)
      console.log('lookupSkySourceByName: ' + obj)
      if (obj) {
        const ss = obj.jsonData || {}
        ss.names = ss.names || obj.designations() || [name]
        ss.culturalNames = obj.culturalDesignations()

        // Ensure model/types for proper icon display if missing
        if (!ss.types || !ss.types.length) {
          const t = obj.getInfo('type')
          ss.types = t ? [t] : ['Star']
        }
        if (!ss.model) {
          const type = ss.types[0]
          if (['Sun', 'Moo', 'Pla'].includes(type)) ss.model = 'jpl_sso'
          else if (type === 'Star') ss.model = 'star'
          else ss.model = 'dso' // fallback
        }

        return Promise.resolve(ss)
      }
    }
    return Promise.reject(new Error('Object not found locally: ' + name))
  },

  querySkySources: async function (str, limit, filters) {
    if (!limit) {
      limit = 10
    }
    // Default filters
    const defaultFilters = {
      planets: true,
      stars: true,
      constellations: true,
      dsos: true,
      satellites: true,
      favourites: false,
      favouritesList: []
    }
    const useFilters = { ...defaultFilters, ...(filters || {}) }

    const $stel = Vue.prototype.$stel
    if (!$stel) {
      return Promise.resolve([])
    }

    const results = []
    const seenNames = new Set() // Track seen names to avoid duplicates

    // Normalize helper
    const normalize = (s) => {
      if (!s) return ''
      let n = s.toUpperCase().replace(/[\s.,\-'"]+/g, '')
      if (n.startsWith('NAME')) n = n.substring(4)
      return n
    }

    const searchNorm = normalize(str)
    // if (!searchNorm) return results // Allow empty search for browsing if filters are set

    let searchingGlobals = false
    let headerAdded = false
    let favCount = 0

    // Helper to add result
    const addResult = (ss) => {
      const primaryName = ss.names && ss.names[0] ? ss.names[0] : ss.match
      const normName = normalize(primaryName)

      // If we are switching to globals and have favs, inject header once
      if (searchingGlobals && favCount > 0 && !headerAdded) {
        // Only inject if this item is NOT a duplicate of a favorite
        if (!seenNames.has(normName)) {
          results.push({ header: true, text: 'Other Results' })
          headerAdded = true
        }
      }

      if (!seenNames.has(normName)) {
        seenNames.add(normName)
        results.push(ss)
        return true
      }
      return false
    }

    // 1. Search Favourites First
    if (useFilters.favouritesList && useFilters.favouritesList.length > 0) {
      const favs = useFilters.favouritesList
      for (const fav of favs) {
        let nameMatch = false
        if (!searchNorm) {
          nameMatch = true // Match all if empty query
        } else {
          nameMatch = fav.names.some(n => {
            const nNorm = normalize(n)
            return nNorm.includes(searchNorm) || searchNorm.includes(nNorm)
          })
        }
        if (!nameMatch) continue

        // Check types
        const t = fav.types ? fav.types[0] : 'unknown'
        let typeMatch = false
        // Determine active type filters. If all specific filters are OFF, we might strictly filter?
        // But usually standard search defaults to specific types ON.

        if (['Sun', 'Moo', 'Pla'].includes(t) && useFilters.planets) typeMatch = true
        else if (t === 'Star' && useFilters.stars) typeMatch = true
        else if (t === 'Con' && useFilters.constellations) typeMatch = true
        else if (['Asa'].includes(t) && useFilters.satellites) typeMatch = true
        else if (t === 'dso' && useFilters.dsos) typeMatch = true
        else if (!['Sun', 'Moo', 'Pla', 'Star', 'Con', 'Asa'].includes(t) && useFilters.dsos) typeMatch = true

        if (typeMatch) {
          addResult(fav)
        }
      }
    }

    favCount = results.length
    searchingGlobals = true

    // We increase limit because we might have added favorites.
    // Wait, if favorites fill the limit, should we stop?
    // User wants "add other types below".
    // So we should try to fetch at least some globals if possible, but keep total reasonable.
    // Let's cap total at limit + favCount to be generous, or just limit.
    // Let's stick to strict `limit` for globals part?
    // If I have 5 favorites, and limit is 10. I can add 5 globals.
    // If I have 15 favorites, and limit is 10.
    // I should probably show all matched favorites?
    // Let's assume we want to show `limit` amount of globals + whatever favorites matched?
    // Or just adhere to total `limit`?
    // User says "add other types heading below".
    // If I only show favorites due to limit, user won't see "others".
    // I will interpret `limit` as "limit for globals", or ensure we fetch at least a few globals.
    // Lets use `results.length < limit + favCount`?
    // Actually, `swh.querySkySources` caller sets limit=20.
    // If I return 25 items it's fine.

    const globalLimit = limit + favCount

    // PRIORITY 1: Search planets
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

    // PRIORITY 2: Search stars
    if (useFilters.stars && results.length < globalLimit) {
      try {
        const nameIndexLoader = (await import('@/assets/name_index_loader.js')).default
        // We ask for more candidates
        const starNames = await nameIndexLoader.searchStars(str, limit * 3)

        for (const starName of starNames) {
          if (results.length >= globalLimit) break

          // Lookup strategies
          let obj = null
          const lookupAttempts = [
            starName,
            '* ' + starName,
            'NAME ' + starName,
            starName.replace(/\./g, ''),
            '* ' + starName.replace(/\./g, '')
          ]
          if (starName.startsWith('HIP ')) lookupAttempts.push(starName)

          for (const attempt of lookupAttempts) {
            obj = $stel.getObj(attempt)
            if (obj) break
          }

          if (obj) {
            const ss = obj.jsonData || {}
            ss.names = ss.names || obj.designations() || [starName]
            ss.types = ss.types || ['*']
            ss.model = ss.model || 'star'
            ss.match = starName
            addResult(ss)
          }
        }
      } catch (e) {
        console.log('Star search via name index failed:', e)
      }
    }

    // PRIORITY 3: Search constellations
    if (useFilters.constellations && results.length < globalLimit) {
      try {
        const { constellationLoader } = await import('@/assets/name_index_loader.js')
        const conMatches = await constellationLoader.searchConstellations(str, limit * 2)

        for (const con of conMatches) {
          if (results.length >= globalLimit) break

          const displayName = con.native || con.english || con.iau
          addResult({
            names: [displayName, con.english, con.iau].filter(n => n),
            types: ['Con'],
            model: 'constellation',
            model_data: {
              iau_abbreviation: con.iau,
              con_id: con.id
            },
            match: displayName
          })
        }
      } catch (e) {
        console.log('Constellation search failed:', e)
      }
    }

    // PRIORITY 4: Search DSOs
    if (useFilters.dsos && results.length < globalLimit) {
      try {
        const nameIndexLoader = (await import('@/assets/name_index_loader.js')).default
        const dsoNames = await nameIndexLoader.searchDSOs(str, limit * 3)

        for (const dsoName of dsoNames) {
          if (results.length >= globalLimit) break

          let obj = null
          const lookupAttempts = [
            dsoName,
            'NAME ' + dsoName,
            dsoName.replace(/\./g, '')
          ]

          for (const attempt of lookupAttempts) {
            obj = $stel.getObj(attempt)
            if (obj) break
          }

          if (obj) {
            const ss = obj.jsonData || {}
            ss.names = ss.names || obj.designations() || [dsoName]
            ss.types = ss.types || ['dso']
            ss.model = ss.model || 'dso'
            ss.match = dsoName
            addResult(ss)
          }
        }
      } catch (e) {
        console.log('DSO search via name index failed:', e)
      }
    }

    // PRIORITY 5: Search satellites
    if (useFilters.satellites && results.length < globalLimit) {
      if (!swh._cachedSatellites) {
        swh._loadSatellites()
      }
      if (swh._cachedSatellites) {
        for (const sat of swh._cachedSatellites) {
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
    }

    // Fallback: Direct object lookup
    if (results.length === (headerAdded ? 1 : 0) && !searchingGlobals) { // Logic check: if no matches found at all
      // Actually checking if we found ANYTHING via global search
      // But we can just run this fallback if we want.
    }
    // Original fallback logic was "if results.length === 0"
    // Now we might have favorites.
    // If no favorites and no global results, try direct lookup.
    if (results.length === favCount) { // No globals added
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

        if (include) {
          addResult(ss)
        }
      }
    }

    return results.slice(0, globalLimit + 1) // +1 just to be safe with header
  },

  sweObj2SkySource: function (obj) {
    const names = obj.designations()
    const that = this

    if (!names || !names.length) {
      throw new Error("Can't find object without names")
    }

    // Several artifical satellites share the same common name, so we use
    // the unambiguous NORAD number instead
    for (const j in names) {
      if (names[j].startsWith('NORAD ')) {
        const tmpName = names[0]
        names[0] = names[j]
        names[j] = tmpName
      }
    }

    const printErr = function (n) {
      console.log("Couldn't find online skysource data for name: " + n)

      const ss = obj.jsonData
      if (!ss.model_data) {
        ss.model_data = {}
      }
      // Names fixup
      let i
      for (i in ss.names) {
        if (ss.names[i].startsWith('GAIA')) {
          ss.names[i] = ss.names[i].replace(/^GAIA /, 'Gaia DR2 ')
        }
      }
      ss.culturalNames = obj.culturalDesignations()
      return ss
    }

    return that.lookupSkySourceByName(names[0]).then(res => {
      return res
    }, () => {
      if (names.length === 1) return printErr(names)
      return that.lookupSkySourceByName(names[1]).then(res => {
        return res
      }, () => {
        if (names.length === 2) return printErr(names)
        return that.lookupSkySourceByName(names[2]).then(res => {
          return res
        }, () => {
          return printErr(names[2])
        })
      })
    }).then(res => {
      res.culturalNames = obj.culturalDesignations()
      return res
    })
  },

  setSweObjAsSelection: function (obj) {
    const $stel = Vue.prototype.$stel
    $stel.core.selection = obj
    $stel.pointAndLock(obj)
  },

  getGeolocation: function () {
    console.log('Getting geolocalization')
    const defaultPos = {
      lat: 25.0,
      lng: 81.0,
      accuracy: 20000,
      usedDefault: true
    }

    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(function (position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            usedDefault: false
          }
          console.log('GPS localization successful: ' + pos.lat.toFixed(6) + ', ' + pos.lng.toFixed(6) + ' (accuracy: ' + pos.accuracy + 'm)')
          resolve(pos)
        }, function (error) {
          console.log('GPS error code: ' + error.code + ', message: ' + error.message)
          console.log('Using default location: 25N 81E')
          resolve(defaultPos)
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
      })
    } else {
      console.log('Geolocation not supported. Using default location: 25N 81E')
      return Promise.resolve(defaultPos)
    }
  },

  delay: function (t, v) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null, v), t)
    })
  },

  geoCodePosition: function (pos, ctx) {
    // Return location with GPS coordinates - no network request needed for offline use
    const ll = ctx.$t('Lat {0}° Lon {1}°', [pos.lat.toFixed(3), pos.lng.toFixed(3)])
    var loc = {
      short_name: ll,
      country: '',
      lng: pos.lng,
      lat: pos.lat,
      alt: pos.alt ? pos.alt : 0,
      accuracy: pos.accuracy,
      street_address: ''
    }
    return Promise.resolve(loc)
  },

  getDistanceFromLatLonInM: function (lat1, lon1, lat2, lon2) {
    var deg2rad = function (deg) {
      return deg * (Math.PI / 180)
    }
    var R = 6371000 // Radius of the earth in m
    var dLat = deg2rad(lat2 - lat1)
    var dLon = deg2rad(lon2 - lon1)
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c // Distance in m
    return d
  },

  // Look for the next time starting from now on when the night Sky is visible
  // i.e. when sun is more than 10 degree below horizon.
  // If no such time was found (e.g. in a northern country in summer),
  // we default to current time.
  getTimeAfterSunset: function (stel) {
    const sun = stel.getObj('NAME Sun')
    const obs = stel.observer.clone()
    const utc = Math.floor(obs.utc * 24 * 60 / 5) / (24 * 60 / 5)
    let i
    for (i = 0; i < 24 * 60 / 5 + 1; i++) {
      obs.utc = utc + 1.0 / (24 * 60) * (i * 5)
      const sunRadec = sun.getInfo('RADEC', obs)
      const azalt = stel.convertFrame(obs, 'ICRF', 'OBSERVED', sunRadec)
      const alt = stel.anpm(stel.c2s(azalt)[1])
      if (alt < -13 * Math.PI / 180) {
        break
      }
    }
    if (i === 0 || i === 24 * 60 / 5 + 1) {
      return stel.observer.utc
    }
    return obs.utc
  },

  // Get the list of circumpolar stars in a given magnitude range
  //
  // Arguments:
  //   obs      - An observer.
  //   maxMag   - The maximum magnitude above which objects are discarded.
  //   filter   - a function called for each object returning false if the
  //              object must be filtered out.
  //
  // Return:
  //   An array SweObject. It is the responsibility of the caller to properly
  //   destroy all the objects of the list when they are not needed, by calling
  //   obj.destroy() on each of them.
  //
  // Example code:
  //   // Return all cicumpolar stars between mag -2 and 4
  //   let res = swh.getCircumpolarStars(this.$stel.observer, -2, 4)
  //   // Do something with the stars
  //   console.log(res.length)
  //   // Destroy the objects (don't forget this line!)
  //   res.map(e => e.destroy())
  getCircumpolarStars: function (obs, minMag, maxMag) {
    const $stel = Vue.prototype.$stel
    const filter = function (obj) {
      if (obj.getInfo('vmag', obs) <= minMag) {
        return false
      }
      const posJNOW = $stel.convertFrame(obs, 'ICRF', 'JNOW', obj.getInfo('radec'))
      const radecJNOW = $stel.c2s(posJNOW)
      const decJNOW = $stel.anpm(radecJNOW[1])
      if (obs.latitude >= 0) {
        return decJNOW >= Math.PI / 2 - obs.latitude
      } else {
        return decJNOW <= -Math.PI / 2 + obs.latitude
      }
    }
    return $stel.core.stars.listObjs(obs, maxMag, filter)
  },

  circumpolarMask: undefined,
  showCircumpolarMask: function (obs, show) {
    if (show === undefined) {
      show = true
    }
    const layer = Vue.prototype.$skyHintsLayer
    const $stel = Vue.prototype.$stel
    if (this.circumpolarMask) {
      layer.remove(this.circumpolarMask)
      this.circumpolarMask = undefined
    }
    if (show) {
      const diam = 2.0 * Math.PI - Math.abs(obs.latitude) * 2
      const shapeParams = {
        pos: [0, 0, obs.latitude > 0 ? -1 : 1, 0],
        frame: $stel.FRAME_JNOW,
        size: [diam, diam],
        color: [0.1, 0.1, 0.1, 0.8],
        border_color: [0.1, 0.1, 0.6, 1]
      }
      this.circumpolarMask = layer.add('circle', shapeParams)
    }
  }
  // startDeviceOrientation: function (callback) {
  //   if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
  //     // iOS 13+ requires user interaction to request permission
  //     return DeviceOrientationEvent.requestPermission()
  //       .then(permissionState => {
  //         if (permissionState === 'granted') {
  //           window.addEventListener('deviceorientation', callback)
  //           return true
  //         }
  //         return false
  //       })
  //       .catch(console.error)
  //   } else {
  //     // Android and standard browsers
  //     window.addEventListener('deviceorientation', callback)
  //     if ('ondeviceorientationabsolute' in window) {
  //       window.addEventListener('deviceorientationabsolute', callback)
  //     }
  //     return Promise.resolve(true)
  //   }
  // },

  // stopDeviceOrientation: function (callback) {
  //   window.removeEventListener('deviceorientation', callback)
  //   if ('ondeviceorientationabsolute' in window) {
  //     window.removeEventListener('deviceorientationabsolute', callback)
  //   }
  // }
}

export default swh
