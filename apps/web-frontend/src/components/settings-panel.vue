// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="dialogVisible" max-width="400" transition="dialog-top-transition" content-class="settings-dialog">
    <v-card v-if="dialogVisible" class="settings-panel">
      <!-- Main Settings View -->
      <div v-if="currentView === 'main'">
        <div class="settings-header">
          <v-btn icon @click="closePanel" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Settings</span>
        </div>

        <v-list dense class="settings-list">
          <v-list-item @click="toggleSensors">
            <v-list-item-icon>
              <v-icon color="grey">mdi-compass-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sensors</v-list-item-title>
              <v-list-item-subtitle>{{ sensorsEnabled ? 'Enabled' : 'Disabled' }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch :input-value="sensorsEnabled" @click.stop="toggleSensors"></v-switch>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="toggleArMode">
            <v-list-item-icon>
              <v-icon color="grey">mdi-camera</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Augmented Reality</v-list-item-title>
              <v-list-item-subtitle>{{ arEnabled ? 'Enabled' : 'Disabled' }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch :input-value="arEnabled" @click.stop="toggleArMode"></v-switch>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="currentView = 'location'">
            <v-list-item-icon>
              <v-icon color="grey">mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Location</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="currentView = 'sky-culture'">
            <v-list-item-icon>
              <v-icon color="grey">mdi-creation</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Sky Culture</v-list-item-title>
              <v-list-item-subtitle>{{ currentSkyCultureName }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="currentView = 'advanced'">
            <v-list-item-icon>
              <v-icon color="grey">mdi-cog</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Advanced</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="currentView = 'ar'">
            <v-list-item-icon>
              <v-icon color="grey">mdi-camera-metering-center</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Camera Settings</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <!-- Display Settings Section -->
          <v-subheader class="settings-subheader">Lines</v-subheader>

          <v-list-item @click="meridianOn = !meridianOn">
            <v-list-item-content>
              <v-list-item-title>Meridian Line</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox v-model="meridianOn" hide-details @click.stop></v-checkbox>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="eclipticOn = !eclipticOn">
            <v-list-item-content>
              <v-list-item-title>Ecliptic Line</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox v-model="eclipticOn" hide-details @click.stop></v-checkbox>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <v-list-item @click="resetSettings">
            <v-list-item-icon>
              <v-icon color="grey">mdi-restore</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Reset settings</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <!-- Location View -->
      <div v-else-if="currentView === 'location'">
        <div class="settings-header">
          <v-btn icon @click="currentView = 'main'" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Location</span>
        </div>

        <v-list dense class="settings-list">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Use autolocation</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="useAutoLocation"></v-switch>
            </v-list-item-action>
          </v-list-item>

          <template v-if="!useAutoLocation">
            <v-list-item @click="openCoordEditor('latitude')">
              <v-list-item-content>
                <v-list-item-title>Latitude</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <span class="location-value">{{ formatLatitudeValue(customLat) }}</span>
              </v-list-item-action>
            </v-list-item>

            <v-list-item @click="openCoordEditor('longitude')">
              <v-list-item-content>
                <v-list-item-title>Longitude</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <span class="location-value">{{ formatLongitudeValue(customLng) }}</span>
              </v-list-item-action>
            </v-list-item>
          </template>

        <!-- Display only when autolocation is on -->
        <template v-else>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Latitude</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <span class="location-value">{{ formatLatitude }}</span>
            </v-list-item-action>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Longitude</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <span class="location-value">{{ formatLongitude }}</span>
            </v-list-item-action>
          </v-list-item>
        </template>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Name/City</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <span class="location-value">{{ cityName }}</span>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>

    <!-- Coordinate Editor View -->
    <div v-else-if="currentView === 'edit-coordinate'">
      <coordinate-editor
        :type="editCoordType"
        :value="editCoordValue"
        @input="updateCoord"
        @back="currentView = 'location'"
      />
    </div>

      <!-- Sky Culture View -->
      <div v-else-if="currentView === 'sky-culture'">
        <div class="settings-header">
          <v-btn icon @click="currentView = 'main'" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Sky Culture</span>
        </div>

        <v-list dense class="settings-list sky-culture-list">
          <v-list-item
            v-for="culture in skyCultureOptions"
            :key="culture.key"
            @click="selectSkyCulture(culture.key)"
            :class="{ 'selected-culture': currentSkyCulture === culture.key }"
          >
            <v-list-item-content>
              <v-list-item-title>{{ culture.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action v-if="currentSkyCulture === culture.key">
              <v-icon color="primary">mdi-check</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>

      <!-- AR View -->
      <div v-else-if="currentView === 'ar'">
        <div class="settings-header">
          <v-btn icon @click="currentView = 'main'" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Camera Settings</span>
        </div>

        <v-list dense class="settings-list">
          <v-subheader class="settings-subheader">Field of View</v-subheader>

          <!-- Fixed Wide FOV Toggle (for Stellarium view) -->
          <v-list-item @click="arFullFov = !arFullFov">
            <v-list-item-content>
              <v-list-item-title>Fixed Wide FOV</v-list-item-title>
              <v-list-item-subtitle>Lock Stellarium view to wide angle</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch :input-value="arFullFov" @click.stop="arFullFov = !arFullFov"></v-switch>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-2"></v-divider>
          <v-subheader class="settings-subheader">Camera</v-subheader>

          <!-- Camera Zoom Slider (always visible, controls camera zoom) -->
          <v-list-item class="slider-item">
            <v-list-item-content>
              <div class="d-flex justify-space-between align-center">
                <v-list-item-title>Camera Zoom</v-list-item-title>
                <span class="sensitivity-value">{{ arZoom.toFixed(1) }}x</span>
              </div>
              <v-slider
                v-model="arZoom"
                :min="1.0"
                :max="5.0"
                :step="0.1"
                thumb-label
                hide-details
                class="settings-slider"
              ></v-slider>
            </v-list-item-content>
          </v-list-item>

          <v-divider class="my-2"></v-divider>
          <v-subheader class="settings-subheader">Display</v-subheader>

          <!-- Opacity Slider -->
          <v-list-item class="slider-item">
            <v-list-item-content>
              <div class="d-flex justify-space-between align-center">
                <v-list-item-title>Overlay Opacity</v-list-item-title>
                <span class="sensitivity-value">{{ Math.round(arOpacity * 100) }}%</span>
              </div>
              <v-slider
                v-model="arOpacity"
                :min="0.1"
                :max="1.0"
                :step="0.05"
                thumb-label
                hide-details
                class="settings-slider"
              ></v-slider>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <!-- Advanced View -->
      <div v-else-if="currentView === 'advanced'">
        <div class="settings-header">
          <v-btn icon @click="currentView = 'main'" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Advanced</span>
        </div>

        <v-list dense class="settings-list">
          <!-- Touch Controls Section -->
          <v-subheader class="settings-subheader">Touch Controls</v-subheader>

          <v-list-item class="slider-item">
            <v-list-item-content>
              <div class="d-flex justify-space-between align-center">
                <v-list-item-title>Mouse Sensitivity</v-list-item-title>
                <span class="sensitivity-value">{{ Math.round(touchPanSensitivity * 100) }}%</span>
              </div>
              <v-slider
                v-model="touchPanSensitivity"
                :min="0.1"
                :max="5.0"
                :step="0.1"
                thumb-label
                hide-details
                class="settings-slider"
              ></v-slider>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Invert Y Axis</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="touchPanInvertY" hide-details class="mt-0"></v-switch>
            </v-list-item-action>
          </v-list-item>

          <v-divider class="my-2"></v-divider>

          <!-- Display Section -->
          <v-subheader class="settings-subheader">Display</v-subheader>

          <v-list-item @click="milkyWayOn = !milkyWayOn">
            <v-list-item-content>
              <v-list-item-title>Milky Way</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox v-model="milkyWayOn" hide-details @click.stop></v-checkbox>
            </v-list-item-action>
          </v-list-item>

          <v-list-item @click="dssOn = !dssOn">
            <v-list-item-content>
              <v-list-item-title>DSS (Deep Sky Survey)</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-checkbox v-model="dssOn" hide-details @click.stop></v-checkbox>
            </v-list-item-action>
          </v-list-item>

        </v-list>
      </div>

    </v-card>
  </v-dialog>
</template>

<script>
import CoordinateEditor from './coordinate-editor.vue'
import GyroscopeService from '@/assets/gyroscope-service.js'

export default {
  components: {
    CoordinateEditor
  },
  data: function () {
    return {
      currentView: 'main',
      customLat: 0,
      customLng: 0,
      editCoordType: 'latitude',
      touchPanSensitivityValue: 1.0,
      touchPanInvertYValue: false,
      selectedSkyCulture: 'western',
      skyCultureOptions: [
        { key: 'western', name: 'Western' },
        { key: 'belarusian', name: 'Belarusian' }
      ]
    }
  },
  computed: {
    editCoordValue () {
      return this.editCoordType === 'latitude' ? this.customLat : this.customLng
    },
    sensorsEnabled () {
      return this.$store.state.sensorsEnabled
    },
    showAtmosphere: {
      get () {
        return this.$store.state.stel && this.$store.state.stel.landscape.atmosphere_visible
      },
      set (val) {
        this.$store.commit('setValue', { varName: 'stel.landscape.atmosphere_visible', newValue: val })
      }
    },
    arFullFov: {
      get () {
        return this.$store.state.arFullFov
      },
      set (val) {
        this.$store.commit('setArFullFov', val)
      }
    },
    arEnabled: {
      get () {
        return this.$store.state.arModeActive
      },
      set (val) {
        this.$store.commit('setArModeActive', val)
      }
    },
    arZoom: {
      get () {
        return this.$store.state.arZoom || 1.0
      },
      set (val) {
        this.$store.commit('setArZoom', val)
      }
    },
    arOpacity: {
      get () {
        return this.$store.state.arOpacity
      },
      set (val) {
        this.$store.commit('setArOpacity', val)
      }
    },
    dialogVisible: {
      get: function () {
        return this.$store.state.showSettingsPanel
      },
      set: function (val) {
        this.$store.commit('setValue', { varName: 'showSettingsPanel', newValue: val })
      }
    },
    touchPanSensitivity: {
      get: function () {
        return this.touchPanSensitivityValue
      },
      set: function (val) {
        this.touchPanSensitivityValue = val
        if (this.$stel) {
          this.$stel.setValue('touch_pan_sensitivity', val)
        }
        // Persist to localStorage
        this.saveTouchSettings()
      }
    },
    touchPanInvertY: {
      get: function () {
        return this.touchPanInvertYValue
      },
      set: function (val) {
        this.touchPanInvertYValue = val
        if (this.$stel) {
          this.$stel.setValue('touch_pan_invert_y', val)
        }
        // Persist to localStorage
        this.saveTouchSettings()
      }
    },
    useAutoLocation: {
      get: function () {
        return this.$store.state.useAutoLocation
      },
      set: function (b) {
        this.$store.commit('setUseAutoLocation', b)
        if (!b) {
          // When switching to manual, copy current location values
          this.customLat = this.currentLocation.lat
          this.customLng = this.currentLocation.lng
        }
      }
    },
    currentLocation: function () {
      return this.$store.state.currentLocation
    },
    formatLatitude: function () {
      const lat = this.currentLocation.lat
      const deg = Math.floor(Math.abs(lat))
      const min = Math.floor((Math.abs(lat) - deg) * 60)
      return deg + '° ' + min + "' " + (lat >= 0 ? 'N' : 'S')
    },
    formatLongitude: function () {
      const lng = this.currentLocation.lng
      const deg = Math.floor(Math.abs(lng))
      const min = Math.floor((Math.abs(lng) - deg) * 60)
      return deg + '° ' + min + "' " + (lng >= 0 ? 'E' : 'W')
    },
    cityName: function () {
      return this.currentLocation.short_name || 'Unknown'
    },
    currentSkyCulture: {
      get: function () {
        return this.selectedSkyCulture
      },
      set: function (newValue) {
        this.selectedSkyCulture = newValue
        if (this.$stel && this.$stel.core && this.$stel.core.skycultures) {
          const baseUrl = '/'
          const url = baseUrl + 'skydata/skycultures/' + newValue
          this.$stel.core.skycultures.addDataSource({ url: url, key: newValue })
          this.$stel.core.skycultures.current_id = newValue
          localStorage.setItem('stellarium-skyculture', newValue)
        }
      }
    },
    currentSkyCultureName: function () {
      const culture = this.skyCultureOptions.find(c => c.key === this.selectedSkyCulture)
      return culture ? culture.name : 'Western'
    },
    dssOn: {
      get: function () {
        return this.$store.state.stel && this.$store.state.stel.dss ? this.$store.state.stel.dss.visible : false
      },
      set: function (newValue) {
        if (this.$stel && this.$stel.core && this.$stel.core.dss) {
          this.$stel.core.dss.visible = newValue
        }
      }
    },
    milkyWayOn: {
      get: function () {
        return this.$store.state.stel && this.$store.state.stel.milkyway ? this.$store.state.stel.milkyway.visible : false
      },
      set: function (newValue) {
        if (this.$stel && this.$stel.core && this.$stel.core.milkyway) {
          this.$stel.core.milkyway.visible = newValue
        }
      }
    },
    meridianOn: {
      get: function () {
        return this.$store.state.stel && this.$store.state.stel.lines && this.$store.state.stel.lines.meridian ? this.$store.state.stel.lines.meridian.visible : false
      },
      set: function (newValue) {
        if (this.$stel && this.$stel.core && this.$stel.core.lines && this.$stel.core.lines.meridian) {
          this.$stel.core.lines.meridian.visible = newValue
        }
      }
    },
    eclipticOn: {
      get: function () {
        return this.$store.state.stel && this.$store.state.stel.lines && this.$store.state.stel.lines.ecliptic ? this.$store.state.stel.lines.ecliptic.visible : false
      },
      set: function (newValue) {
        if (this.$stel && this.$stel.core && this.$stel.core.lines && this.$stel.core.lines.ecliptic) {
          this.$stel.core.lines.ecliptic.visible = newValue
        }
      }
    }
  },
  watch: {
    dialogVisible: function (val) {
      if (!val) {
        this.currentView = 'main'
      }
    },
    currentView: function (val) {
      if (val === 'advanced') {
        this.loadTouchSettings()
      }
    }
  },
  mounted: function () {
    // Load saved sky culture preference
    const savedCulture = localStorage.getItem('stellarium-skyculture')
    if (savedCulture) {
      this.selectedSkyCulture = savedCulture
    }
  },
  methods: {
    loadTouchSettings: function () {
      // Load from localStorage first
      try {
        const saved = JSON.parse(localStorage.getItem('stellarium-touch-settings'))
        if (saved) {
          this.touchPanSensitivityValue = saved.sensitivity !== undefined ? saved.sensitivity : 1.0
          this.touchPanInvertYValue = saved.invertY !== undefined ? saved.invertY : false
        }
      } catch (e) {
        // Use defaults if localStorage fails
        this.touchPanSensitivityValue = 1.0
        this.touchPanInvertYValue = false
      }
      // Apply to engine
      if (this.$stel) {
        this.$stel.setValue('touch_pan_sensitivity', this.touchPanSensitivityValue)
        this.$stel.setValue('touch_pan_invert_y', this.touchPanInvertYValue)
      }
    },
    saveTouchSettings: function () {
      try {
        localStorage.setItem('stellarium-touch-settings', JSON.stringify({
          sensitivity: this.touchPanSensitivityValue,
          invertY: this.touchPanInvertYValue
        }))
      } catch (e) {
        // Ignore localStorage errors
      }
    },
    closePanel: function () {
      this.dialogVisible = false
    },
    toggleSensors: function () {
      const newVal = !this.$store.state.sensorsEnabled
      this.$store.commit('setSensorsEnabled', newVal)
      // If turning off sensors, also stop any active gyro
      if (!newVal && this.$store.state.gyroModeActive) {
        GyroscopeService.stop()
        this.$store.commit('setGyroModeActive', false)
      }
    },
    toggleArMode: async function () {
      const newVal = !this.arEnabled
      if (newVal) {
        this.$store.commit('setSensorsEnabled', true)

        // Ensure Gyro is active
        let gyroActive = this.$store.state.gyroModeActive
        if (!gyroActive && this.$stel && this.$stel.core) {
          const success = await GyroscopeService.start(this.$stel.core, this.$store, () => {
            this.$store.commit('setGyroModeActive', false)
          })
          if (success) {
            this.$store.commit('setGyroModeActive', true)
            gyroActive = true
          }
        }

        if (gyroActive) {
          this.$store.commit('setArModeActive', true)
        }
      } else {
        this.$store.commit('setArModeActive', false)
      }
    },
    selectSkyCulture: function (key) {
      this.currentSkyCulture = key
      this.currentView = 'main'
    },
    updateLocation: function () {
      const lat = Math.max(-90, Math.min(90, this.customLat))
      const lng = Math.max(-180, Math.min(180, this.customLng))
      const newLoc = {
        ...this.currentLocation,
        lat: lat,
        lng: lng,
        short_name: 'Custom'
      }
      this.$store.commit('setCurrentLocation', newLoc)
    },
    openCoordEditor (type) {
      this.editCoordType = type
      this.currentView = 'edit-coordinate'
    },
    updateCoord (val) {
      if (this.editCoordType === 'latitude') {
        this.customLat = val
      } else {
        this.customLng = val
      }
      this.updateLocation()
    },
    formatLatitudeValue (lat) {
      const absLat = Math.abs(lat)
      const deg = Math.floor(absLat)
      const min = Math.floor((absLat - deg) * 60)
      return deg + '° ' + min + "' " + (lat >= 0 ? 'N' : 'S')
    },
    formatLongitudeValue (lng) {
      const absLng = Math.abs(lng)
      const deg = Math.floor(absLng)
      const min = Math.floor((absLng - deg) * 60)
      return deg + '° ' + min + "' " + (lng >= 0 ? 'E' : 'W')
    },
    resetSettings: function () {
      this.sensorsEnabled = false
      if (this.$stel && this.$stel.core) {
        // Reset labels
        if (this.$stel.core.stars) this.$stel.core.stars.hints_mag_offset = 2.0
        if (this.$stel.core.planets) this.$stel.core.planets.hints_mag_offset = 2.0
        if (this.$stel.core.dsos) this.$stel.core.dsos.hints_mag_offset = 2.0
        if (this.$stel.core.satellites) this.$stel.core.satellites.hints_mag_offset = 2.0

        // Reset display flags
        if (this.$stel.core.atmosphere) this.$stel.core.atmosphere.visible = true
        if (this.$stel.core.landscapes) this.$stel.core.landscapes.visible = true
        if (this.$stel.core.constellations) {
          this.$stel.core.constellations.lines_visible = true
          this.$stel.core.constellations.labels_visible = true
          this.$stel.core.constellations.images_visible = false
          this.$stel.core.constellations.bounds_visible = false
        }
        if (this.$stel.core.lines) {
          this.$stel.core.lines.ecliptic.visible = false
          this.$stel.core.lines.azimuthal.visible = false
        }
        this.$stel.core.bortle_index = 3
      }
      this.$store.commit('setUseAutoLocation', true)
      this.$store.commit('setValue', { varName: 'nightmode', newValue: false })
      if (window.navigator.userAgent.indexOf('Edge') > -1) {
        document.getElementById('nightmode').style.opacity = '0'
      }
      document.getElementById('nightmode').style.visibility = 'hidden'

      // Reset touch settings
      this.touchPanSensitivity = 1.0
      this.touchPanInvertY = false
      try {
        localStorage.removeItem('stellarium-touch-settings')
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }
}
</script>

<style scoped>
.settings-panel {
  background: rgba(30, 30, 30, 0.98) !important;
  padding-top: env(safe-area-inset-top, 24px);
}

.settings-header {
  display: flex;
  align-items: center;
  padding: 16px 8px;
  background: rgba(40, 40, 40, 0.95);
}

.back-btn {
  color: white !important;
}

.settings-title {
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin-left: 16px;
}

.settings-list {
  background: transparent !important;
}

.settings-list .v-list-item {
  min-height: 56px;
}

.settings-subheader {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider-item .v-list-item-content {
  padding: 8px 0;
}

.settings-slider {
  margin-top: 8px;
}

.sensitivity-value {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  min-width: 50px;
  text-align: right;
}

.location-value {
  color: rgba(255, 255, 255, 0.7);
}

.slider-action {
  min-width: 150px;
}

.startup-select {
  max-width: 150px;
}

.input-action {
  min-width: 120px;
}

.coord-input {
  max-width: 100px;
}

.coord-input >>> input {
  text-align: right;
  color: white !important;
}

.submenu-wrapper {
  padding: 16px;
}

.sky-culture-list .v-list-item {
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.sky-culture-list .selected-culture {
  background: rgba(33, 150, 243, 0.15) !important;
  border-left-color: #2196F3;
}

.sky-culture-list .v-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>

<style>
/* Global styles for dialog positioning at top */
.settings-dialog {
  align-self: flex-start !important;
  margin-top: 0 !important;
}
</style>
