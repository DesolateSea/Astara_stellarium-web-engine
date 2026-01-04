// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'

Vue.use(Vuex)

const createStore = () => {
  var pluginsModules = {}
  for (const i in Vue.SWPlugins) {
    const plugin = Vue.SWPlugins[i]
    if (plugin.storeModule) {
      console.log('Register store module for plugin: ' + plugin.name)
      pluginsModules[plugin.name] = plugin.storeModule
    }
  }

  return new Vuex.Store({
    modules: pluginsModules,

    state: {
      stel: null,
      initComplete: false,

      showNavigationDrawer: false,
      showDataCreditsDialog: false,
      showViewSettingsDialog: false,
      showPlanetsVisibilityDialog: false,
      showLocationDialog: false,
      showSearchPanel: false,
      showSettingsPanel: false,
      selectedObject: undefined,

      // Load favourites from local storage
      favourites: (() => {
        try {
          return JSON.parse(localStorage.getItem('stel_favourites') || '[]')
        } catch (e) {
          return []
        }
      })(),

      // Load recents from local storage
      recents: (() => {
        try {
          const stored = JSON.parse(localStorage.getItem('stel_recents') || '[]')
          const lastUpdated = parseInt(localStorage.getItem('stel_recents_timestamp') || '0')
          const now = Date.now()
          // 6 hours = 6 * 60 * 60 * 1000 ms
          if (now - lastUpdated > 21600000) {
            console.log('Recents expired, clearing.')
            return []
          }
          return stored
        } catch (e) {
          return []
        }
      })(),

      showSidePanel: false,

      showMainToolBar: true,
      showLocationButton: true,
      showTimeButtons: true,
      showObservingPanelTabsButtons: true,
      showSelectedInfoButtons: true,
      showFPS: false,
      showEquatorialJ2000GridButton: false,

      fullscreen: false,
      nightmode: false,
      wasmSupport: true,

      autoDetectedLocation: {
        short_name: 'Unknown',
        country: 'Unknown',
        street_address: '',
        lat: 0,
        lng: 0,
        alt: 0,
        accuracy: 5000
      },

      currentLocation: {
        short_name: 'Unknown',
        country: 'Unknown',
        street_address: '',
        lat: 0,
        lng: 0,
        alt: 0,
        accuracy: 5000
      },

      useAutoLocation: true,

      // Sensor settings
      sensorsEnabled: true,

      // Gyroscope view control mode
      gyroModeActive: false,
      gyroTargetObject: null, // Object to track direction for in gyro mode

      // AR (Augmented Reality) camera mode - shows camera behind star view
      arModeActive: false,
      arFullFov: true,
      arZoom: 1.0,
      arOpacity: 0.5
    },
    mutations: {
      replaceStelWebEngine (state, newTree) {
        // mutate StelWebEngine state
        state.stel = newTree
      },
      toggleBool (state, varName) {
        _.set(state, varName, !_.get(state, varName))
      },
      setValue (state, { varName, newValue }) {
        _.set(state, varName, newValue)
      },
      setAutoDetectedLocation (state, newValue) {
        state.autoDetectedLocation = { ...newValue }
        if (state.useAutoLocation) {
          state.currentLocation = { ...newValue }
        }
      },
      setUseAutoLocation (state, newValue) {
        state.useAutoLocation = newValue
        if (newValue) {
          state.currentLocation = { ...state.autoDetectedLocation }
        }
      },
      setCurrentLocation (state, newValue) {
        state.useAutoLocation = false
        state.currentLocation = { ...newValue }
      },
      setSelectedObject (state, newValue) {
        state.selectedObject = newValue
        // When gyro mode is active and an object is selected, set it as the target for direction overlay
        if (state.gyroModeActive) {
          state.gyroTargetObject = newValue
        }
      },
      addToFavourites (state, object) {
        // Check if already exists
        const exists = state.favourites.some(fav =>
          (fav.names && object.names && fav.names[0] === object.names[0]) ||
          (fav.model_data && object.model_data && fav.model_data.norad_number && fav.model_data.norad_number === object.model_data.norad_number)
        )
        if (!exists) {
          state.favourites.push(object)
          localStorage.setItem('stel_favourites', JSON.stringify(state.favourites))
        }
      },
      removeFromFavourites (state, object) {
        state.favourites = state.favourites.filter(fav =>
          !((fav.names && object.names && fav.names[0] === object.names[0]) ||
            (fav.model_data && object.model_data && fav.model_data.norad_number && fav.model_data.norad_number === object.model_data.norad_number))
        )
        localStorage.setItem('stel_favourites', JSON.stringify(state.favourites))
      },
      toggleFavourite (state, object) {
        const index = state.favourites.findIndex(fav =>
          (fav.names && object.names && fav.names[0] === object.names[0]) ||
          (fav.model_data && object.model_data && fav.model_data.norad_number && fav.model_data.norad_number === object.model_data.norad_number)
        )
        if (index === -1) {
          state.favourites.push(object)
        } else {
          state.favourites.splice(index, 1)
        }
        localStorage.setItem('stel_favourites', JSON.stringify(state.favourites))
      },
      addToRecents (state, object) {
        // Remove if already exists (to move to top)
        const getId = (o) => {
          if (o.model_data && o.model_data.norad_number) return 'sat_' + o.model_data.norad_number
          if (o.names && o.names.length > 0) return o.names[0]
          if (o.match) return o.match
          return JSON.stringify(o)
        }
        const objId = getId(object)

        state.recents = state.recents.filter(item => getId(item) !== objId)

        // Add to top
        state.recents.unshift(object)
        // Limit to 20
        if (state.recents.length > 20) {
          state.recents = state.recents.slice(0, 20)
        }
        localStorage.setItem('stel_recents', JSON.stringify(state.recents))
        localStorage.setItem('stel_recents_timestamp', Date.now().toString())
      },
      setSensorsEnabled (state, value) {
        state.sensorsEnabled = value
      },
      setGyroModeActive (state, value) {
        state.gyroModeActive = value
        // Clear target and disable AR when gyro mode is disabled
        if (!value) {
          state.gyroTargetObject = null
          state.arModeActive = false
        }
      },
      setGyroTargetObject (state, value) {
        state.gyroTargetObject = value
      },
      setArModeActive (state, value) {
        // AR can only be active if gyro is active
        state.arModeActive = value && state.gyroModeActive
      },
      setArFullFov (state, value) {
        state.arFullFov = value
      },
      setArZoom (state, value) {
        state.arZoom = value
      },
      setArOpacity (state, value) {
        state.arOpacity = value
      }
    }
  })
}

export default createStore
