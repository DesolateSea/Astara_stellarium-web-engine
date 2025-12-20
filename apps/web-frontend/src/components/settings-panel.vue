// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="dialogVisible" max-width="400" transition="dialog-top-transition">
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
              <v-switch v-model="sensorsEnabled" @click.stop></v-switch>
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

          <!-- Custom Lat/Long inputs when autolocation is off -->
          <template v-if="!useAutoLocation">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Latitude</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="input-action">
                <v-text-field
                  v-model.number="customLat"
                  type="number"
                  dense
                  hide-details
                  suffix="°"
                  class="coord-input"
                  @change="updateLocation"
                ></v-text-field>
              </v-list-item-action>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Longitude</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="input-action">
                <v-text-field
                  v-model.number="customLng"
                  type="number"
                  dense
                  hide-details
                  suffix="°"
                  class="coord-input"
                  @change="updateLocation"
                ></v-text-field>
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

      <!-- Advanced View -->
      <div v-else-if="currentView === 'advanced'">
        <div class="settings-header">
          <v-btn icon @click="currentView = 'main'" class="back-btn">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <span class="settings-title">Advanced</span>
        </div>

        <v-list dense class="settings-list">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Time at startup</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-select
                v-model="startupTime"
                :items="startupTimeOptions"
                dense
                hide-details
                class="startup-select"
              ></v-select>
            </v-list-item-action>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Star Brightness</v-list-item-title>
              <v-list-item-subtitle>{{ starBrightness.toFixed(1) }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action class="slider-action">
              <v-slider
                v-model="starBrightness"
                :min="0.5"
                :max="4"
                :step="0.1"
                hide-details
              ></v-slider>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: function () {
    return {
      currentView: 'main',
      sensorsEnabled: false,
      startupTime: 'At night',
      startupTimeOptions: ['At night', 'Current time', 'Last used'],
      customLat: 0,
      customLng: 0
    }
  },
  computed: {
    dialogVisible: {
      get: function () {
        return this.$store.state.showSettingsPanel
      },
      set: function (val) {
        this.$store.commit('setValue', { varName: 'showSettingsPanel', newValue: val })
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
    starBrightness: {
      get: function () {
        if (this.$stel && this.$stel.core && this.$stel.core.stars) {
          return this.$stel.core.stars.hints_mag_offset || 2.0
        }
        return 2.0
      },
      set: function (val) {
        if (this.$stel && this.$stel.core && this.$stel.core.stars) {
          this.$stel.core.stars.hints_mag_offset = val
        }
      }
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
    }
  },
  watch: {
    dialogVisible: function (val) {
      if (!val) {
        this.currentView = 'main'
      }
    }
  },
  methods: {
    closePanel: function () {
      this.dialogVisible = false
    },
    toggleSensors: function () {
      this.sensorsEnabled = !this.sensorsEnabled
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
    resetSettings: function () {
      this.sensorsEnabled = false
      this.startupTime = 'At night'
      if (this.$stel && this.$stel.core && this.$stel.core.stars) {
        this.$stel.core.stars.hints_mag_offset = 2.0
      }
      this.$store.commit('setUseAutoLocation', true)
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
</style>
