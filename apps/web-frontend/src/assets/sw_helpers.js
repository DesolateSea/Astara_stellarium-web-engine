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
        lstel.onValueChanged(function (path, value) {
          const tree = store.state.stel
          _.set(tree, path, value)
          store.commit('replaceStelWebEngine', tree)
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
    } else if (ss.model === 'constellation' && ss.model_data.iau_abbreviation) {
      const id = 'CON western ' + ss.model_data.iau_abbreviation
      obj = $stel.getObj(id)
    }
    if (!obj) {
      obj = $stel.getObj(ss.names[0])
    }
    if (!obj && ss.names[0].startsWith('Gaia DR2 ')) {
      const gname = ss.names[0].replace(/^Gaia DR2 /, 'GAIA ')
      obj = $stel.getObj(gname)
    }
    if (obj === null) return undefined
    return obj
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
      const obj = $stel.getObj('NAME ' + name) || $stel.getObj(name)
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

  querySkySources: function (str, limit) {
    if (!limit) {
      limit = 10
    }
    const $stel = Vue.prototype.$stel
    if (!$stel) {
      return Promise.resolve([])
    }

    // Use local Stellarium engine search
    return new Promise((resolve) => {
      const results = []
      const searchStr = str.toUpperCase()

      // Try direct object lookup first
      const directObj = $stel.getObj(str)
      if (directObj) {
        console.log('Direct object lookup:', directObj.jsonData)
        const ss = directObj.jsonData || {}
        ss.names = ss.names || directObj.designations() || [str]
        ss.types = ss.types || [directObj.type || 'unknown']
        ss.match = str
        results.push(ss)
      }

      // Search in stars catalog
      // if (results.length < limit) {
      //   try {
      //     const obs = $stel.observer
      //     const starFilter = function (obj) {
      //       const names = obj.designations()
      //       for (const name of names) {
      //         if (name.toUpperCase().includes(searchStr)) {
      //           return true
      //         }
      //       }
      //       return false
      //     }
      //     const stars = $stel.core.stars.listObjs(obs, 1, starFilter)
      //     for (const star of stars) {
      //       if (results.length >= limit) break
      //       const names = star.designations()
      //       const ss = star.jsonData || {
      //         names: names,
      //         types: ['*'],
      //         model: 'star'
      //       }
      //       ss.names = names
      //       ss.match = names[0]
      //       // Check if already in results
      //       const isDuplicate = results.some(r => r.names && r.names[0] === ss.names[0])
      //       if (!isDuplicate) {
      //         results.push(ss)
      //       }
      //       star.destroy()
      //     }
      //   } catch (e) {
      //     console.log('Star search error:', e)
      //   }
      // }

      // Search satellites (JS-based)
      if (results.length < limit) {
        if (!swh._cachedSatellites) {
          swh._loadSatellites()
        }
        if (swh._cachedSatellites) {
          const searchSat = searchStr.toUpperCase().replace(/\s/g, '')
          const cleanSearch = 'NAME' + searchSat

          for (const sat of swh._cachedSatellites) {
            if (results.length >= limit) break
            // Improved search: check original and cleaned (no prefix, no space) names
            const nameMatch = sat.names.some(n => {
              const upperN = n.toUpperCase().replace(/\s/g, '')
              return (cleanSearch.length > 0 && upperN.includes(cleanSearch)) || (searchSat.length > 0 && upperN.includes(searchSat))
            })

            if (nameMatch) {
              // Clone to avoid modifying cache
              const ss = {
                model_data: sat.model_data,
                names: [...sat.names],
                types: sat.types,
                model: 'tle_satellite',
                match: sat.names[0] // Approximation
              }

              const isDuplicate = results.some(r => r.names && r.names[0] === ss.names[0])
              if (!isDuplicate) {
                results.push(ss)
              }
            }
          }
        }
      }

      // Search planets
      const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Moon', 'Sun']
      for (const planet of planets) {
        if (results.length >= limit) break
        if (planet.toUpperCase().includes(searchStr)) {
          const obj = $stel.getObj('NAME ' + planet)
          if (obj) {
            results.push({
              names: [planet],
              types: [planet === 'Sun' ? 'Sun' : (planet === 'Moon' ? 'Moo' : 'Pla')],
              model: 'jpl_sso',
              match: planet
            })
          }
        }
      }

      // Search constellations
      const constellations = [
        'Orion', 'Ursa Major', 'Ursa Minor', 'Leo', 'Scorpius', 'Sagittarius',
        'Cassiopeia', 'Cygnus', 'Lyra', 'Aquila', 'Perseus', 'Andromeda',
        'Pegasus', 'Gemini', 'Taurus', 'Aries', 'Pisces', 'Aquarius',
        'Capricornus', 'Virgo', 'Libra', 'Cancer', 'Draco', 'Hercules',
        'Bootes', 'Canis Major', 'Canis Minor', 'Centaurus', 'Cetus', 'Corona Borealis'
      ]
      for (const con of constellations) {
        if (results.length >= limit) break
        if (con.toUpperCase().includes(searchStr)) {
          results.push({
            names: [con],
            types: ['Con'],
            model: 'constellation',
            match: con
          })
        }
      }

      resolve(results.slice(0, limit))
    })
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
          console.log('System GPS localization successful')
          resolve(pos)
        }, function (error) {
          console.log('Could not get location from browser:', error.message)
          console.log('Using default location: 25N 81E')
          resolve(defaultPos)
        }, { enableHighAccuracy: true, timeout: 5000 })
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
    console.log('Geocoding position... ')
    const ll = ctx.$t('Lat {0}° Lon {1}°', [pos.lat.toFixed(3), pos.lng.toFixed(3)])
    var loc = {
      short_name: pos.accuracy > 500 ? ctx.$t('Near {0}', [ll]) : ll,
      country: 'Unknown',
      lng: pos.lng,
      lat: pos.lat,
      alt: pos.alt ? pos.alt : 0,
      accuracy: pos.accuracy,
      street_address: ''
    }
    return fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + pos.lat + '&lon=' + pos.lng,
      { headers: { 'Content-Type': 'application/json; charset=UTF-8' } }).then(response => {
      if (response.ok) {
        return response.json().then(res => {
          const city = res.address.city ? res.address.city : (res.address.village ? res.address.village : res.name)
          loc.short_name = pos.accuracy > 500 ? ctx.$t('Near {0}', [city]) : city
          loc.country = res.address.country
          if (pos.accuracy < 50) {
            loc.street_address = res.address.road ? res.address.road : res.display_name
          }
          return loc
        })
      } else {
        console.log('Geocoder failed due to: ' + response.statusText)
        return loc
      }
    })
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
}

export default swh
