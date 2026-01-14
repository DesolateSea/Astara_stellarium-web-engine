// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="dialogVisible" max-width="400" transition="slide-x-transition" content-class="settings-dialog-left">
    <v-card v-if="dialogVisible" class="settings-panel">
      <div class="settings-header">
        <v-btn icon @click="handleBack" class="back-btn">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="settings-title">{{ currentViewTitle }}</span>
      </div>

      <div class="settings-content">
        <transition :name="transitionName" mode="out-in">
          <div :key="currentView" class="view-wrapper">
        <!-- Main Settings View -->
        <div v-if="currentView === 'main'" class="settings-main">
          <!-- Quick Settings Section -->
          <div class="settings-section">
            <div class="section-header">Quick Settings</div>
            <div class="section-card">
              <div class="settings-item toggle-row" @click="toggleSensors">
                <div class="item-icon sensors-icon">
                  <v-icon size="22">mdi-compass-outline</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">Sensors</div>
                  <div class="item-subtitle" :class="{ 'status-enabled': sensorsEnabled }">{{ sensorsEnabled ? 'Enabled' : 'Disabled' }}</div>
                </div>
                <div class="item-action">
                  <v-switch :input-value="sensorsEnabled" @click.stop="toggleSensors" color="#4FC3F7" hide-details class="custom-switch"></v-switch>
                </div>
              </div>

              <div class="item-divider"></div>

              <div class="settings-item toggle-row" @click="toggleArMode">
                <div class="item-icon ar-icon">
                  <v-icon size="22">mdi-camera</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">Augmented Reality</div>
                  <div class="item-subtitle" :class="{ 'status-enabled': arEnabled }">{{ arEnabled ? 'Enabled' : 'Disabled' }}</div>
                </div>
                <div class="item-action">
                  <v-switch :input-value="arEnabled" @click.stop="toggleArMode" color="#4FC3F7" hide-details class="custom-switch"></v-switch>
                </div>
              </div>
            </div>
          </div>

          <!-- Personalization Section -->
          <div class="settings-section">
            <div class="section-header">Personalization</div>
            <div class="section-card">
              <div class="settings-item nav-row" @click="navigateTo('location')">
                <div class="item-icon location-icon">
                  <v-icon size="22">mdi-map-marker</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">Location</div>
                </div>
                <div class="item-action">
                  <v-icon size="20" color="rgba(255,255,255,0.4)">mdi-chevron-right</v-icon>
                </div>
              </div>

              <div class="item-divider"></div>

              <div class="settings-item nav-row" @click="navigateTo('sky-culture')">
                <div class="item-icon culture-icon">
                  <v-icon size="22">mdi-creation</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">Sky Culture</div>
                  <div class="item-subtitle">{{ currentSkyCultureName }}</div>
                </div>
                <div class="item-action">
                  <v-icon size="20" color="rgba(255,255,255,0.4)">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- More Options Section -->
          <div class="settings-section">
            <div class="section-header">More Options</div>
            <div class="section-card">
              <div class="settings-item nav-row" @click="navigateTo('advanced')">
                <div class="item-icon advanced-icon">
                  <v-icon size="22">mdi-cog</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">Advanced</div>
                </div>
                <div class="item-action">
                  <v-icon size="20" color="rgba(255,255,255,0.4)">mdi-chevron-right</v-icon>
                </div>
              </div>

              <div class="item-divider"></div>

              <div class="settings-item nav-row" @click="navigateTo('ar')">
                <div class="item-icon ar-settings-icon">
                  <v-icon size="22">mdi-camera-metering-center</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">AR Camera Settings</div>
                </div>
                <div class="item-action">
                  <v-icon size="20" color="rgba(255,255,255,0.4)">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone Section -->
          <div class="settings-section">
            <div class="section-card danger-card">
              <div class="settings-item danger-row" @click="resetSettings">
                <div class="item-icon reset-icon">
                  <v-icon size="22">mdi-restore</v-icon>
                </div>
                <div class="item-content">
                  <div class="item-title danger-text">Reset Settings</div>
                  <div class="item-subtitle">Restore all defaults</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <!-- Location View -->
      <div v-else-if="currentView === 'location'">
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
          </div>
        </transition>
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
      previousView: null,
      transitionDirection: 'forward',
      customLat: 0,
      customLng: 0,
      editCoordType: 'latitude',
      touchPanSensitivityValue: 1.0,
      touchPanInvertYValue: false,
      selectedSkyCulture: 'western',
      skyCultureOptions: []
    }
  },
  computed: {
    transitionName () {
      return this.transitionDirection === 'forward' ? 'slide-left' : 'slide-right'
    },
    currentViewTitle () {
      const titles = {
        main: 'Settings',
        location: 'Location',
        'sky-culture': 'Sky Culture',
        advanced: 'Advanced',
        ar: 'AR Camera',
        'edit-coordinate': this.editCoordType === 'latitude' ? 'Latitude' : 'Longitude'
      }
      return titles[this.currentView] || 'Settings'
    },
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
          // Update store for reactive tracking
          this.$store.commit('setCurrentSkyCultureId', newValue)

          // Switch font based on culture language requirements
          if (newValue.includes('chinese')) {
            // Use Noto Sans SC for Chinese cultures
            this.$stel.setFont('regular', baseUrl + 'fonts/NotoSansSC-Regular.ttf', 1.38)
            this.$stel.setFont('bold', baseUrl + 'fonts/NotoSansSC-Bold.ttf', 1.38)
          } else {
            // Use Noto Sans for others (covers Latin, Indian, etc.)
            this.$stel.setFont('regular', baseUrl + 'fonts/NotoSans-Regular.ttf', 1.38)
            this.$stel.setFont('bold', baseUrl + 'fonts/NotoSans-Bold.ttf', 1.38)
          }

          // Always ensure Western skyculture is loaded for cross-culture searches
          if (newValue !== 'western') {
            this.$stel.core.skycultures.addDataSource({ url: baseUrl + 'skydata/skycultures/western', key: 'western' })
          }
        }
      }
    },
    currentSkyCultureName: function () {
      // Read from Vuex store for reactive updates
      const cultureId = this.$store.state.currentSkyCultureId || 'western'
      const culture = this.skyCultureOptions.find(c => c.key === cultureId)
      console.log(cultureId, culture)
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
      } else {
        // Sync selectedSkyCulture with engine's current value when panel opens
        if (this.$stel && this.$stel.core && this.$stel.core.skycultures) {
          const engineCulture = this.$stel.core.skycultures.current_id
          if (engineCulture && engineCulture !== this.selectedSkyCulture) {
            this.selectedSkyCulture = engineCulture
          }
        }
      }
    },
    currentView: function (val) {
      if (val === 'advanced') {
        this.loadTouchSettings()
      }
      // Sync selectedSkyCulture when navigating to sky-culture view
      if (val === 'sky-culture' && this.$stel && this.$stel.core && this.$stel.core.skycultures) {
        const engineCulture = this.$stel.core.skycultures.current_id
        if (engineCulture && engineCulture !== this.selectedSkyCulture) {
          this.selectedSkyCulture = engineCulture
        }
      }
    }
  },
  mounted: function () {
    // Load available sky cultures from index.json
    this.loadSkyCultures()

    // Load saved sky culture preference
    const savedCulture = localStorage.getItem('stellarium-skyculture')
    console.log(savedCulture)
    if (savedCulture) {
      this.selectedSkyCulture = savedCulture
      this.$store.commit('setCurrentSkyCultureId', savedCulture)
    }
  },
  methods: {
    handleBack () {
      if (this.currentView === 'main') {
        this.closePanel()
      } else if (this.currentView === 'edit-coordinate') {
        this.navigateTo('location', 'back')
      } else {
        this.navigateTo('main', 'back')
      }
    },
    navigateTo (view, direction = 'forward') {
      this.transitionDirection = direction
      this.previousView = this.currentView
      this.currentView = view
    },
    closePanel: function () {
      this.dialogVisible = false
    },
    async loadSkyCultures () {
      try {
        const baseUrl = '/'
        const response = await fetch(baseUrl + 'skydata/skycultures/index.json')
        const data = await response.json()

        // index.json is an array of culture keys
        this.skyCultureOptions = data.map(key => ({
          key: key,
          name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }))
      } catch (e) {
        console.error('Failed to load sky cultures:', e)
        // Fallback to hardcoded list
        this.skyCultureOptions = [
          { key: 'western', name: 'Western' },
          { key: 'belarusian', name: 'Belarusian' }
        ]
      }
    },
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
  max-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  padding: 16px 8px;
  background: rgba(40, 40, 40, 0.95);
  flex-shrink: 0;
}

.settings-content {
  overflow-y: auto;
  flex: 1;
  background: rgba(30, 30, 30, 0.98);
}

/* Custom scrollbar styling */
.settings-content::-webkit-scrollbar {
  width: 8px;
}

.settings-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.back-btn {
  color: white !important;
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-left: 16px;
  letter-spacing: 0.3px;
}

/* Main Settings Container */
.settings-main {
  padding: 8px 16px 24px;
}

/* Section Styling */
.settings-section {
  margin-bottom: 16px;
}

.section-header {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
  padding-left: 2px;
}

.section-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.danger-card {
  background: rgba(239, 83, 80, 0.06);
  border-color: rgba(239, 83, 80, 0.12);
}

/* Settings Item */
.settings-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.settings-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.nav-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.toggle-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.danger-row:hover {
  background: rgba(244, 67, 54, 0.15);
}

.danger-row:active {
  background: rgba(244, 67, 54, 0.2);
}

/* Item Divider */
.item-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-left: 64px;
}

/* Icon Containers - Subtle monochrome style */
.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
}

.sensors-icon {
  background: rgba(79, 195, 247, 0.15);
}
.sensors-icon .v-icon {
  color: #4FC3F7 !important;
}

.ar-icon {
  background: rgba(171, 71, 188, 0.15);
}
.ar-icon .v-icon {
  color: #BA68C8 !important;
}

.location-icon {
  background: rgba(239, 83, 80, 0.15);
}
.location-icon .v-icon {
  color: #EF5350 !important;
}

.culture-icon {
  background: rgba(255, 183, 77, 0.15);
}
.culture-icon .v-icon {
  color: #FFB74D !important;
}

.advanced-icon {
  background: rgba(144, 164, 174, 0.15);
}
.advanced-icon .v-icon {
  color: #90A4AE !important;
}

.ar-settings-icon {
  background: rgba(149, 117, 205, 0.15);
}
.ar-settings-icon .v-icon {
  color: #9575CD !important;
}

.reset-icon {
  background: rgba(239, 83, 80, 0.12);
}
.reset-icon .v-icon {
  color: #EF5350 !important;
}

/* Item Content */
.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.danger-text {
  color: #EF5350;
}

.item-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 1px;
}

.status-enabled {
  color: #4FC3F7;
}

/* Item Action */
.item-action {
  flex-shrink: 0;
  margin-left: 12px;
  display: flex;
  align-items: center;
}

/* Custom Switch Styling */
.custom-switch {
  margin: 0 !important;
  padding: 0 !important;
}

.custom-switch >>> .v-input--selection-controls__input {
  margin-right: 0;
}

/* Keep existing styles for other views */
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
/* Global styles for dialog positioning - LEFT ALIGNED DRAWER */
.settings-dialog-left {
  align-self: flex-start !important;
  margin: 0 !important;
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  height: auto !important;
  max-height: 90vh !important;
}

.settings-dialog-left .settings-panel {
  height: auto !important;
  max-height: 90vh !important;
  min-height: 300px;
  border-radius: 0 20px 20px 0 !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4) !important;
}

/* View wrapper for transitions */
.view-wrapper {
  min-height: auto;
}

/* Slide Left Transition (forward navigation) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide Right Transition (back navigation) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
