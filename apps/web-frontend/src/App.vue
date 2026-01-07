// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>

<v-app>
  <v-navigation-drawer v-model="nav" app stateless width="300">
    <v-layout column fill-height>
      <v-list dense>
        <template v-for="(item,i) in menuItems">
          <template v-if="$store.state[item.store_show_menu_item] === false"></template>
          <v-subheader v-else-if="item.header" v-text="item.header" class="grey--text text--darken-1" :key="'header-' + i"/>
          <v-divider class="divider_menu" v-else-if="item.divider" :key="'divider-' + i"/>
          <v-list-item v-else-if="item.switch" @click.stop="toggleStoreValue(item.store_var_name)" :key="'switch-' + i">
            <v-list-item-action>
              <v-switch value :input-value="getStoreValue(item.store_var_name)" label=""></v-switch>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <template v-else>
            <v-list-item v-if='item.link' target="_blank" rel="noopener" :href='item.link' :key="'link-' + i">
              <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
              <v-list-item-title v-text="item.title"/>
              <v-icon disabled>mdi-open-in-new</v-icon>
            </v-list-item>
            <v-list-item v-else-if='item.footer===undefined' @click.stop="toggleStoreValue(item.store_var_name)" :key="'menu-' + i">
              <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
              <v-list-item-title v-text="item.title"/>
            </v-list-item>
          </template>
        </template>
      </v-list>
      <div v-for="(item,i) in menuComponents" :key="'comp-' + i">
        <component :is="item"></component>
      </div>
      <v-spacer></v-spacer>
      <v-list dense>
        <v-divider class="divider_menu"/>
        <template v-for="(item,i) in menuItems">
          <v-list-item v-if='item.footer' @click.stop="toggleStoreValue(item.store_var_name)" :key="i">
            <v-list-item-icon><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
            <v-list-item-title v-text="item.title"/>
          </v-list-item>
        </template>
      </v-list>
    </v-layout>
  </v-navigation-drawer>

  <v-main>
    <v-container class="fill-height" fluid style="padding: 0">
      <div id="stel" v-bind:class="{ right_panel: $store.state.showSidePanel, 'ar-transparent': arModeActive }">
        <div style="position: relative; width: 100%; height: 100%">
          <ARCameraPreview />
          <component v-bind:is="guiComponent"></component>
          <dso-sky-overlays v-if="guiComponent === 'Gui'"></dso-sky-overlays>
          <canvas id="stel-canvas" ref='stelCanvas' :style="arCanvasStyle"></canvas>
        </div>
      </div>
    </v-container>
    <v-snackbar v-model="gpsErrorSnackbar" :timeout="-1" color="warning">
      GPS access failed. Using default location.
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="gpsErrorSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-main>

</v-app>

</template>

<script>

import _ from 'lodash'
import Gui from '@/components/gui.vue'
import GuiLoader from '@/components/gui-loader.vue'
import DsoSkyOverlays from '@/components/DsoSkyOverlays.vue'
import swh from '@/assets/sw_helpers.js'
import Moment from 'moment'
import FullscreenService from '@/assets/fullscreen-service.js'

export default {
  data (context) {
    return {
      menuItems: [
        { title: this.$t('View Settings'), icon: 'mdi-settings', store_var_name: 'showViewSettingsDialog', store_show_menu_item: 'showViewSettingsMenuItem' },
        { title: this.$t('Planets Tonight'), icon: 'mdi-panorama-fisheye', store_var_name: 'showPlanetsVisibilityDialog', store_show_menu_item: 'showPlanetsVisibilityMenuItem' },
        { divider: true }
      ].concat(this.getPluginsMenuItems()).concat([
        { title: this.$t('Data Credits'), footer: true, icon: 'mdi-copyright', store_var_name: 'showDataCreditsDialog' }
      ]),
      menuComponents: [].concat(this.getPluginsMenuComponents()),
      guiComponent: 'GuiLoader',
      startTimeIsSet: false,
      initDone: false,
      dataSourceInitDone: false,
      gpsErrorSnackbar: false
    }
  },
  components: { Gui, GuiLoader, DsoSkyOverlays, ARCameraPreview: () => import('@/components/AR-camera-preview.vue') },
  methods: {
    getPluginsMenuItems: function () {
      let res = []
      for (const i in this.$stellariumWebPlugins()) {
        const plugin = this.$stellariumWebPlugins()[i]
        if (plugin.menuItems) {
          res = res.concat(plugin.menuItems)
        }
      }
      return res
    },
    getPluginsMenuComponents: function () {
      let res = []
      for (const i in this.$stellariumWebPlugins()) {
        const plugin = this.$stellariumWebPlugins()[i]
        if (plugin.menuComponents) {
          res = res.concat(plugin.menuComponents)
        }
      }
      return res
    },
    toggleStoreValue: function (storeVarName) {
      this.$store.commit('toggleBool', storeVarName)
    },
    getStoreValue: function (storeVarName) {
      return _.get(this.$store.state, storeVarName)
    },
    setStateFromQueryArgs: function () {
      // Check whether the observing panel must be displayed
      this.$store.commit('setValue', { varName: 'showSidePanel', newValue: this.$route.path.startsWith('/p/') })

      // Set the core's state from URL query arguments such
      // as date, location, view direction & fov
      var that = this

      if (!this.initDone) {
        this.$stel.core.time_speed = 1
        let d = new Date()
        if (this.$route.query.date) {
          d = new Moment(this.$route.query.date).toDate()
          this.$stel.core.observer.utc = d.getMJD()
          this.startTimeIsSet = true
        }

        if (this.$route.query.lng && this.$route.query.lat) {
          const pos = { lat: Number(this.$route.query.lat), lng: Number(this.$route.query.lng), alt: this.$route.query.elev ? Number(this.$route.query.elev) : 0, accuracy: 1 }
          swh.geoCodePosition(pos, that).then((loc) => {
            that.$store.commit('setCurrentLocation', loc)
          }, (error) => { console.log(error) })
        }

        this.$stel.core.observer.yaw = this.$route.query.az ? Number(this.$route.query.az) * Math.PI / 180 : 0
        this.$stel.core.observer.pitch = this.$route.query.alt ? Number(this.$route.query.alt) * Math.PI / 180 : 30 * Math.PI / 180
        this.$stel.core.fov = this.$route.query.fov ? Number(this.$route.query.fov) * Math.PI / 180 : 120 * Math.PI / 180

        this.initDone = true
      }

      if (this.$route.path.startsWith('/skysource/')) {
        const name = decodeURIComponent(this.$route.path.substring(11))
        console.log('Will select object: ' + name)
        return swh.lookupSkySourceByName(name).then(ss => {
          if (!ss) {
            return
          }
          let obj = swh.skySource2SweObj(ss)
          if (!obj) {
            obj = this.$stel.createObj(ss.model, ss)
            this.$selectionLayer.add(obj)
          }
          if (!obj) {
            console.warning("Can't find object in SWE: " + ss.names[0])
          }
          swh.setSweObjAsSelection(obj)
        }, err => {
          console.log(err)
          console.log("Couldn't find skysource for name: " + name)
        })
      }
    },
    saveSettings: function () {
      const settings = {
        currentLocation: this.$store.state.currentLocation,
        useAutoLocation: this.$store.state.useAutoLocation
      }
      localStorage.setItem('stellarium-settings', JSON.stringify(settings))
    },
    loadSettings: function () {
      try {
        const settings = JSON.parse(localStorage.getItem('stellarium-settings'))
        if (settings) {
          if (settings.currentLocation) {
            this.$store.commit('setCurrentLocation', settings.currentLocation)
          }
          if (typeof settings.useAutoLocation !== 'undefined') {
            this.$store.commit('setUseAutoLocation', settings.useAutoLocation)
          }
        }
      } catch (e) {
        console.log('Error loading settings', e)
      }
    }
  },
  computed: {
    arModeActive () {
      return this.$store.state.arModeActive
    },
    useAutoLocation: function () {
      return this.$store.state.useAutoLocation
    },
    nav: {
      get: function () {
        return this.$store.state.showNavigationDrawer
      },
      set: function (v) {
        if (this.$store.state.showNavigationDrawer !== v) {
          this.$store.commit('toggleBool', 'showNavigationDrawer')
        }
      }
    },
    storeCurrentLocation: function () {
      return this.$store.state.currentLocation
    },
    arCanvasStyle () {
      if (this.arModeActive) {
        return { opacity: this.$store.state.arOpacity }
      }
      return {}
    }
  },
  watch: {
    storeCurrentLocation: function (loc) {
      const DD2R = Math.PI / 180
      this.$stel.core.observer.latitude = loc.lat * DD2R
      this.$stel.core.observer.longitude = loc.lng * DD2R
      this.$stel.core.observer.elevation = loc.alt

      // At startup, we need to wait for the location to be set before deciding which
      // startup time to set. Using actual current time for realistic day/night.
      if (!this.startTimeIsSet) {
        // Use actual current time instead of sunset time
        this.$stel.core.observer.utc = new Date().getMJD()
        this.startTimeIsSet = true
      }
      // Init of time and date is complete
      this.$store.commit('setValue', { varName: 'initComplete', newValue: true })
      this.saveSettings()
    },
    useAutoLocation: function () {
      this.saveSettings()
    },
    $route: function () {
      // react to route changes...
      this.setStateFromQueryArgs()
    }
  },
  mounted: function () {
    var that = this

    // Initialize fullscreen mode (enabled by default)
    FullscreenService.init()

    swh.initMonkeyPatches()

    for (const i in this.$stellariumWebPlugins()) {
      const plugin = this.$stellariumWebPlugins()[i]
      if (plugin.onAppMounted) {
        plugin.onAppMounted(that)
      }
    }

    import('@/assets/js/stellarium-web-engine.wasm').then(f => {
      // Initialize the StelWebEngine viewer singleton
      // After this call, the StelWebEngine state will always be available in vuex store
      // in the $store.stel object in a reactive way (useful for vue components).
      // To modify the state of the StelWebEngine, it's enough to call/set values directly on the $stel object
      try {
        swh.initStelWebEngine(that.$store, f.default, that.$refs.stelCanvas, function () {
          that.loadSettings()

          // Start auto location detection (even if we don't use it)
          swh.getGeolocation().then(p => {
            // If GPS failed (usedDefault) and we are supposed to be using Auto Location
            if (p.usedDefault && that.$store.state.useAutoLocation) {
              const currentLoc = that.$store.state.currentLocation
              // Check if we have a valid previously saved location
              if (currentLoc && (currentLoc.lat !== 0 || currentLoc.lng !== 0)) {
                console.log('GPS failed. Using saved location as fallback for Auto Location.')
                that.gpsErrorSnackbar = true

                // Construct a position object from the saved location
                // This effectively "pretends" the GPS returned the saved location
                p = {
                  lat: currentLoc.lat,
                  lng: currentLoc.lng,
                  accuracy: currentLoc.accuracy || 20000,
                  usedDefault: true
                }
              } else {
                // No saved location, and GPS failed.
                // We will fall through to using the Default (25N 81E)
                that.gpsErrorSnackbar = true
              }
            }
            return swh.geoCodePosition(p, that)
          }).then((loc) => {
            that.$store.commit('setAutoDetectedLocation', loc)
          }, (error) => { console.log(error) })

          // Determine base URL: '/' for absolute paths
          const baseUrl = '/'
          console.log('Base URL for fonts:', baseUrl, 'Capacitor:', !!window.Capacitor)
          that.$stel.setFont('regular', baseUrl + 'fonts/Roboto-Regular.ttf', 1.38)
          that.$stel.setFont('bold', baseUrl + 'fonts/Roboto-Bold.ttf', 1.38)
          // Load saved preference for centered-only constellations (defaults to true)
          const savedCenteredOnly = localStorage.getItem('stel_constellations_centered_only')
          that.$stel.core.constellations.show_only_pointed = savedCenteredOnly !== null ? savedCenteredOnly === 'true' : true

          that.setStateFromQueryArgs()
          that.guiComponent = 'Gui'

          // Hide splash screen
          const splash = document.getElementById('splash-screen')
          if (splash) {
            splash.classList.add('fade-out')
            setTimeout(() => {
              splash.remove()
            }, 500)
          }

          for (const i in that.$stellariumWebPlugins()) {
            const plugin = that.$stellariumWebPlugins()[i]
            if (plugin.onEngineReady) {
              plugin.onEngineReady(that)
            }
          }

          if (!that.dataSourceInitDone) {
            // Set all default data sources
            // Determine base URL: '/' for both web and Capacitor (since we use https://localhost)
            const dataBaseUrl = '/'
            const core = that.$stel.core
            const starsUrl = dataBaseUrl + 'skydata/stars'

            console.log('Stars URL:', JSON.stringify(starsUrl))
            core.stars.addDataSource({ url: starsUrl })

            // Allow to specify a custom path for sky culture data
            if (that.$route.query.sc) {
              const culture = that.$route.query.sc
              // Sanitize: Allow only alphanumeric keys, no paths/URLs
              if (/^[a-zA-Z0-9_-]+$/.test(culture)) {
                core.skycultures.addDataSource({ url: dataBaseUrl + 'skydata/skycultures/' + culture, key: culture })
                core.skycultures.current_id = culture
              } else {
                console.warn('Invalid sky culture key provided:', culture)
                core.skycultures.addDataSource({ url: dataBaseUrl + 'skydata/skycultures/western', key: 'western' })
              }
            } else {
              core.skycultures.addDataSource({ url: dataBaseUrl + 'skydata/skycultures/western', key: 'western' })
            }

            core.dsos.addDataSource({ url: dataBaseUrl + 'skydata/dso' })

            // Dynamically load landscapes from index.json
            fetch(dataBaseUrl + 'skydata/landscapes/index.json')
              .then(response => response.json())
              .then(landscapeKeys => {
                landscapeKeys.forEach(key => {
                  if (key === 'zero') {
                    core.landscapes.addDataSource({ key: 'zero' })
                  } else {
                    core.landscapes.addDataSource({ url: dataBaseUrl + 'skydata/landscapes/' + key, key: key })
                  }
                })
              })
              .catch(err => {
                console.warn('Failed to load landscapes index, using defaults:', err)
                core.landscapes.addDataSource({ url: dataBaseUrl + 'skydata/landscapes/guereins', key: 'guereins' })
                core.landscapes.addDataSource({ key: 'zero' })
              })

            core.milkyway.addDataSource({ url: dataBaseUrl + 'skydata/surveys/milkyway' })
            core.minor_planets.addDataSource({ url: dataBaseUrl + 'skydata/mpcorb.dat', key: 'mpc_asteroids' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/moon', key: 'moon' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/sun', key: 'sun' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/mercury', key: 'mercury' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/venus', key: 'venus' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/mars', key: 'mars' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/jupiter', key: 'jupiter' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/saturn', key: 'saturn' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/uranus', key: 'uranus' })
            core.planets.addDataSource({ url: dataBaseUrl + 'skydata/surveys/sso/neptune', key: 'neptune' })
            core.comets.addDataSource({ url: dataBaseUrl + 'skydata/CometEls.txt', key: 'mpc_comets' })
            core.satellites.addDataSource({ url: dataBaseUrl + 'skydata/tle_satellite.dat', key: 'jsonl/sat' })
          }
        })
      } catch (e) {
        this.$store.commit('setValue', { varName: 'wasmSupport', newValue: false })
      }
    })
  }
}
</script>

<style>

a {
  color: #82b1ff;
}

a:link {
  text-decoration-line: none;
}

.divider_menu {
  margin-top: 8px;
  margin-bottom: 8px;
}

html {
  overflow-y: visible;
}

html, body, #app {
  overflow-y: visible!important;
  overflow-x: visible;
  position: fixed!important;
  width: 100%;
  height: 100%;
  padding: 0!important;
  font-size: 14px;
}

.fullscreen {
  overflow-y: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  padding: 0!important;
}

.click-through {
  pointer-events: none;
}

.get-click {
  pointer-events: all;
}

.dialog {
  background: transparent;
}

.menu__content {
  background-color: transparent!important;
}

#stel {height: 100%; width: 100%; position: absolute;}
#stel-canvas {z-index: -10; width: 100%; height: 100%;}

.right_panel {
  padding-right: 400px;
}

.v-btn {
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 6px;
  margin-bottom: 6px;
}

.v-application--wrap {
  min-height: 100%!important;
}

/* AR Mode - Make canvas background transparent (black becomes transparent) */
.ar-transparent #stel-canvas {
  mix-blend-mode: screen;
  transition: opacity 0.3s ease-in-out;
}

.ar-transparent .v-main,
.ar-transparent .v-application,
.ar-transparent #stel {
  background: transparent !important;
}

</style>
