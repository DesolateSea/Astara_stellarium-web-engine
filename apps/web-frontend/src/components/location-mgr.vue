// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="location-picker">
    <!-- Offline Map Section -->
    <div class="map-container" ref="mapContainer" @click="onMapClick" @touchend="onMapTouch">
      <img
        ref="mapImage"
        :src="mapImageSrc"
        class="world-map"
        alt="World Map"
        draggable="false"
      />
      <!-- Marker overlay -->
      <div
        v-if="pickLocation"
        class="map-marker"
        :style="markerStyle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="#2196F3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
      <!-- GPS Button -->
      <v-btn
        fab
        small
        class="gps-btn"
        @click.stop="centerOnRealPosition"
        :loading="isLocating"
      >
        <v-icon>mdi-crosshairs-gps</v-icon>
      </v-btn>
    </div>

    <!-- Location Details Panel -->
    <div class="location-details">
      <!-- Location Name -->
      <div class="detail-row" @click="showNameEditor = true">
        <div class="detail-label">{{ $t('Name/City') }}</div>
        <div class="detail-value">
          <span class="location-name">{{ locationName }}</span>
          <span class="location-country" v-if="locationCountry">{{ locationCountry }}</span>
        </div>
        <v-icon small class="detail-arrow">mdi-chevron-right</v-icon>
      </div>

      <!-- Latitude -->
      <div class="detail-row" @click="showCoordinateEditor('lat')">
        <div class="detail-label">{{ $t('Latitude') }}</div>
        <div class="detail-value">{{ formatLatitude(pickLocation ? pickLocation.lat : 0) }}</div>
        <v-icon small class="detail-arrow">mdi-chevron-right</v-icon>
      </div>

      <!-- Longitude -->
      <div class="detail-row" @click="showCoordinateEditor('lng')">
        <div class="detail-label">{{ $t('Longitude') }}</div>
        <div class="detail-value">{{ formatLongitude(pickLocation ? pickLocation.lng : 0) }}</div>
        <v-icon small class="detail-arrow">mdi-chevron-right</v-icon>
      </div>

      <!-- UTC Offset -->
      <div class="detail-row">
        <div class="detail-label">{{ $t('UTC offset') }}</div>
        <div class="detail-value">
          <span class="timezone-auto">Auto</span>
          <span class="timezone-offset">UTC {{ formattedTimezoneOffset }}</span>
        </div>
        <v-icon small class="detail-arrow">mdi-chevron-right</v-icon>
      </div>
    </div>

    <!-- Use Location Button -->
    <div class="action-section">
      <v-btn
        block
        large
        color="primary"
        class="use-location-btn"
        @click="useLocation"
      >
        <v-icon left>mdi-check</v-icon>
        {{ $t('Use this location') }}
      </v-btn>
    </div>

    <!-- Name Editor Dialog -->
    <v-dialog v-model="showNameEditor" max-width="400">
      <v-card class="coord-dialog">
        <v-card-title>{{ $t('Edit Location Name') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editNameValue"
            :label="$t('Location name')"
            outlined
            dense
            autofocus
            @keyup.enter="applyNameEdit"
          ></v-text-field>
          <v-text-field
            v-model="editCountryValue"
            :label="$t('Country/Region (optional)')"
            outlined
            dense
            @keyup.enter="applyNameEdit"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showNameEditor = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="applyNameEdit">{{ $t('Apply') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Coordinate Editor Dialog -->
    <v-dialog v-model="showCoordDialog" max-width="400">
      <v-card class="coord-dialog">
        <v-card-title>{{ coordEditMode === 'lat' ? $t('Edit Latitude') : $t('Edit Longitude') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="coordEditValue"
            :label="coordEditMode === 'lat' ? $t('Latitude (-90 to 90)') : $t('Longitude (-180 to 180)')"
            type="number"
            :min="coordEditMode === 'lat' ? -90 : -180"
            :max="coordEditMode === 'lat' ? 90 : 180"
            step="0.0001"
            outlined
            dense
            autofocus
            @keyup.enter="applyCoordEdit"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCoordDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="applyCoordEdit">{{ $t('Apply') }}</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      pickLocation: null,
      isLocating: false,
      showCoordDialog: false,
      showNameEditor: false,
      coordEditMode: 'lat',
      coordEditValue: '',
      editNameValue: '',
      editCountryValue: '',
      locationName: 'Unknown',
      locationCountry: '',
      timezoneOffset: 0,
      mapImageSrc: process.env.BASE_URL + 'images/world_map.jpg'
    }
  },
  props: ['showMyLocation', 'knownLocations', 'startLocation', 'realLocation'],
  computed: {
    formattedTimezoneOffset: function () {
      var offset = this.timezoneOffset
      var sign = offset >= 0 ? '+' : ''
      var hours = Math.floor(Math.abs(offset))
      var minutes = Math.round((Math.abs(offset) - hours) * 60)
      if (minutes === 0) {
        return sign + offset
      }
      return sign + Math.floor(offset) + ':' + String(minutes).padStart(2, '0')
    },
    markerStyle: function () {
      if (!this.pickLocation || !this.$refs.mapContainer) {
        return { display: 'none' }
      }
      // Convert lat/lng to pixel position on the map
      // Map is an equirectangular projection (simple lat/lng to x/y)
      var container = this.$refs.mapContainer
      var width = container.offsetWidth
      var height = container.offsetHeight

      // Longitude: -180 to 180 maps to 0 to width
      var x = ((this.pickLocation.lng + 180) / 360) * width
      // Latitude: 90 to -90 maps to 0 to height
      var y = ((90 - this.pickLocation.lat) / 180) * height

      return {
        left: (x - 16) + 'px',
        top: (y - 32) + 'px'
      }
    }
  },
  watch: {
    startLocation: {
      immediate: true,
      handler: function (loc) {
        if (loc) {
          this.setPickLocation(loc)
        }
      }
    }
  },
  mounted: function () {
    if (this.startLocation) {
      this.setPickLocation(this.startLocation)
    }
  },
  methods: {
    setPickLocation: function (loc) {
      this.pickLocation = {
        lat: loc.lat,
        lng: loc.lng,
        alt: loc.alt || 0,
        accuracy: loc.accuracy || 0
      }

      if (loc.short_name && loc.short_name !== 'Unknown') {
        this.locationName = loc.short_name
        this.locationCountry = loc.country || ''
      } else {
        // Set name based on coordinates (offline)
        this.setOfflineLocationName(loc.lat, loc.lng)
      }

      this.calculateTimezone(loc.lat, loc.lng)
    },

    onMapClick: function (event) {
      var container = this.$refs.mapContainer
      var rect = container.getBoundingClientRect()
      var x = event.clientX - rect.left
      var y = event.clientY - rect.top
      var width = container.offsetWidth
      var height = container.offsetHeight

      // Convert pixel position to lat/lng
      // Longitude: 0 to width maps to -180 to 180
      var lng = (x / width) * 360 - 180
      // Latitude: 0 to height maps to 90 to -90
      var lat = 90 - (y / height) * 180

      // Clamp values
      lat = Math.max(-90, Math.min(90, lat))
      lng = Math.max(-180, Math.min(180, lng))

      this.pickLocation = {
        lat: lat,
        lng: lng,
        alt: 0,
        accuracy: 0
      }
      this.setOfflineLocationName(lat, lng)
      this.calculateTimezone(lat, lng)
    },

    onMapTouch: function (event) {
      if (event.changedTouches && event.changedTouches.length > 0) {
        var touch = event.changedTouches[0]
        var container = this.$refs.mapContainer
        var rect = container.getBoundingClientRect()
        var x = touch.clientX - rect.left
        var y = touch.clientY - rect.top
        var width = container.offsetWidth
        var height = container.offsetHeight

        var lng = (x / width) * 360 - 180
        var lat = 90 - (y / height) * 180

        lat = Math.max(-90, Math.min(90, lat))
        lng = Math.max(-180, Math.min(180, lng))

        this.pickLocation = {
          lat: lat,
          lng: lng,
          alt: 0,
          accuracy: 0
        }
        this.setOfflineLocationName(lat, lng)
        this.calculateTimezone(lat, lng)
      }
    },

    centerOnRealPosition: function () {
      var that = this
      if (this.realLocation) {
        this.setPickLocation(this.realLocation)
      } else {
        this.isLocating = true
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function (position) {
              var loc = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                alt: position.coords.altitude || 0
              }
              that.setPickLocation(loc)
              that.isLocating = false
            },
            function (error) {
              console.error('Geolocation error:', error)
              that.isLocating = false
            },
            { enableHighAccuracy: true, timeout: 15000 }
          )
        } else {
          this.isLocating = false
        }
      }
    },

    setOfflineLocationName: function (lat, lng) {
      // Simple offline location naming based on coordinates
      // Uses rough geographic regions
      var name = this.getRegionName(lat, lng)
      this.locationName = name.city || (lat.toFixed(2) + '°, ' + lng.toFixed(2) + '°')
      this.locationCountry = name.country || ''
    },

    getRegionName: function (lat, lng) {
      // Simple offline region detection
      // Major countries/regions based on bounding boxes

      // India
      if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
        return { city: 'India', country: '' }
      }
      // China
      if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) {
        return { city: 'China', country: '' }
      }
      // USA (continental)
      if (lat >= 24 && lat <= 49 && lng >= -125 && lng <= -66) {
        return { city: 'United States', country: '' }
      }
      // Brazil
      if (lat >= -34 && lat <= 5 && lng >= -74 && lng <= -32) {
        return { city: 'Brazil', country: '' }
      }
      // Russia
      if (lat >= 41 && lat <= 82 && lng >= 19 && lng <= 180) {
        return { city: 'Russia', country: '' }
      }
      // Australia
      if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 155) {
        return { city: 'Australia', country: '' }
      }
      // Europe
      if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) {
        return { city: 'Europe', country: '' }
      }
      // Africa
      if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) {
        return { city: 'Africa', country: '' }
      }
      // Japan
      if (lat >= 24 && lat <= 46 && lng >= 123 && lng <= 146) {
        return { city: 'Japan', country: '' }
      }
      // Indonesia
      if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
        return { city: 'Indonesia', country: '' }
      }
      // Middle East
      if (lat >= 12 && lat <= 42 && lng >= 25 && lng <= 63) {
        return { city: 'Middle East', country: '' }
      }
      // Canada
      if (lat >= 41 && lat <= 84 && lng >= -141 && lng <= -52) {
        return { city: 'Canada', country: '' }
      }
      // Mexico
      if (lat >= 14 && lat <= 33 && lng >= -118 && lng <= -86) {
        return { city: 'Mexico', country: '' }
      }
      // Argentina
      if (lat >= -55 && lat <= -21 && lng >= -73 && lng <= -53) {
        return { city: 'Argentina', country: '' }
      }

      // Default: show coordinates
      return { city: null, country: null }
    },

    calculateTimezone: function (lat, lng) {
      var offset = Math.round(lng / 15)
      offset = Math.max(-12, Math.min(14, offset))

      // India: UTC+5:30
      if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
        offset = 5.5
      } else if (lat >= 26 && lat <= 30.5 && lng >= 80 && lng <= 88.5) {
        // Nepal: UTC+5:45
        offset = 5.75
      } else if (lat >= 25 && lat <= 40 && lng >= 44 && lng <= 63) {
        // Iran: UTC+3:30
        offset = 3.5
      } else if (lat >= 29 && lat <= 38.5 && lng >= 60 && lng <= 75) {
        // Afghanistan: UTC+4:30
        offset = 4.5
      } else if (lat >= 9.5 && lat <= 28.5 && lng >= 92 && lng <= 101.5) {
        // Myanmar: UTC+6:30
        offset = 6.5
      } else if (lat >= -45 && lat <= -10 && lng >= 129 && lng <= 141) {
        // Australia (Central): UTC+9:30
        offset = 9.5
      } else if (lat >= 46 && lat <= 52 && lng >= -60 && lng <= -52) {
        // Newfoundland: UTC-3:30
        offset = -3.5
      } else if (lat >= -44.5 && lat <= -43.5 && lng >= -177 && lng <= -176) {
        // Chatham Islands: UTC+12:45
        offset = 12.75
      }

      this.timezoneOffset = offset
    },

    showCoordinateEditor: function (mode) {
      this.coordEditMode = mode
      if (this.pickLocation) {
        this.coordEditValue = mode === 'lat'
          ? this.pickLocation.lat.toFixed(6)
          : this.pickLocation.lng.toFixed(6)
      } else {
        this.coordEditValue = '0'
      }
      this.showCoordDialog = true
    },

    applyCoordEdit: function () {
      var value = parseFloat(this.coordEditValue)
      if (isNaN(value)) {
        this.showCoordDialog = false
        return
      }

      if (this.coordEditMode === 'lat') {
        var lat = Math.max(-90, Math.min(90, value))
        if (this.pickLocation) {
          this.pickLocation.lat = lat
        } else {
          this.pickLocation = { lat: lat, lng: 0, alt: 0, accuracy: 0 }
        }
      } else {
        var lng = Math.max(-180, Math.min(180, value))
        if (this.pickLocation) {
          this.pickLocation.lng = lng
        } else {
          this.pickLocation = { lat: 0, lng: lng, alt: 0, accuracy: 0 }
        }
      }

      this.setOfflineLocationName(this.pickLocation.lat, this.pickLocation.lng)
      this.calculateTimezone(this.pickLocation.lat, this.pickLocation.lng)
      this.showCoordDialog = false
    },

    applyNameEdit: function () {
      this.locationName = this.editNameValue || 'Custom Location'
      this.locationCountry = this.editCountryValue || ''
      this.showNameEditor = false
    },

    formatLatitude: function (lat) {
      var abs = Math.abs(lat)
      var deg = Math.floor(abs)
      var minFloat = (abs - deg) * 60
      var min = Math.floor(minFloat)
      var sec = Math.round((minFloat - min) * 60)
      var dir = lat >= 0 ? 'N' : 'S'
      return deg + '\u00B0 ' + min + '\' ' + sec + '" ' + dir
    },

    formatLongitude: function (lng) {
      var abs = Math.abs(lng)
      var deg = Math.floor(abs)
      var minFloat = (abs - deg) * 60
      var min = Math.floor(minFloat)
      var sec = Math.round((minFloat - min) * 60)
      var dir = lng >= 0 ? 'E' : 'W'
      return deg + '\u00B0 ' + min + '\' ' + sec + '" ' + dir
    },

    useLocation: function () {
      var loc = {
        short_name: this.locationName,
        country: this.locationCountry,
        lng: this.pickLocation.lng,
        lat: this.pickLocation.lat,
        alt: this.pickLocation.alt || 0,
        accuracy: this.pickLocation.accuracy || 0,
        timezoneOffset: this.timezoneOffset
      }
      this.$emit('locationSelected', loc)
    }
  }
}
</script>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a2e;
}

.map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background: #000;
  cursor: crosshair;
}

.world-map {
  width: 100%;
  height: 100%;
  object-fit: fill;
  user-select: none;
  -webkit-user-drag: none;
}

.map-marker {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.gps-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 100;
  background: white !important;
}

.gps-btn .v-icon {
  color: #333;
}

.location-details {
  padding: 0;
  background: #2d2d44;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.detail-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.detail-row:active {
  background: rgba(255, 255, 255, 0.1);
}

.detail-label {
  flex: 0 0 120px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.detail-value {
  flex: 1;
  text-align: right;
  padding-right: 8px;
  color: white;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.location-name {
  font-weight: 500;
}

.location-country {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.timezone-auto {
  font-weight: 500;
}

.timezone-offset {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.detail-arrow {
  color: rgba(255, 255, 255, 0.3) !important;
  margin-left: 4px;
}

.action-section {
  padding: 16px;
  background: #1a1a2e;
}

.use-location-btn {
  background: linear-gradient(135deg, #2196F3, #1976D2) !important;
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
}

/* Dialog styles */
.coord-dialog {
  background: #2d2d44 !important;
}
</style>
