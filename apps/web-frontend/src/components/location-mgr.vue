// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="location-picker">
    <!-- Offline Map Section with Leaflet -->
    <div class="map-container" ref="mapContainer">
      <div ref="leafletMap" class="leaflet-map"></div>
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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

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
      map: null,
      marker: null,
      cities: []
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
    }
  },
  watch: {
    startLocation: {
      immediate: true,
      handler: function (loc) {
        if (loc && this.map) {
          this.setPickLocation(loc)
        }
      }
    }
  },
  mounted: function () {
    var that = this
    // Load cities database
    this.loadCities()

    // Initialize map after DOM is ready
    this.$nextTick(function () {
      that.initMap()
    })
  },
  beforeDestroy: function () {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
  methods: {
    loadCities: function () {
      var that = this
      fetch(process.env.BASE_URL + 'data/cities.json')
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          that.cities = data
        })
        .catch(function (err) {
          console.error('Failed to load cities:', err)
          that.cities = []
        })
    },

    initMap: function () {
      var that = this
      var container = this.$refs.leafletMap

      if (!container) {
        console.error('Map container not found')
        return
      }

      // Create map with offline tile layer
      this.map = L.map(container, {
        center: [20, 0],
        zoom: 2,
        minZoom: 0,
        maxZoom: 4,
        zoomControl: true,
        attributionControl: false
      })

      // Add offline tile layer (pre-downloaded tiles)
      L.tileLayer(process.env.BASE_URL + 'tiles/{z}/{x}/{y}.png', {
        maxZoom: 4,
        minZoom: 0,
        tileSize: 256,
        errorTileUrl: process.env.BASE_URL + 'tiles/0/0/0.png'
      }).addTo(this.map)

      // Add click handler
      this.map.on('click', function (e) {
        that.onMapClick(e.latlng.lat, e.latlng.lng)
      })

      // Set initial location if provided
      if (this.startLocation) {
        this.setPickLocation(this.startLocation)
      }
    },

    setPickLocation: function (loc) {
      this.pickLocation = {
        lat: loc.lat,
        lng: loc.lng,
        alt: loc.alt || 0,
        accuracy: loc.accuracy || 0
      }

      // Update marker on map
      if (this.map) {
        if (this.marker) {
          this.marker.setLatLng([loc.lat, loc.lng])
        } else {
          this.marker = L.marker([loc.lat, loc.lng], {
            draggable: true
          }).addTo(this.map)

          var that = this
          this.marker.on('dragend', function (e) {
            var pos = e.target.getLatLng()
            that.onMapClick(pos.lat, pos.lng)
          })
        }
        this.map.setView([loc.lat, loc.lng], Math.max(this.map.getZoom(), 2))
      }

      if (loc.short_name && loc.short_name !== 'Unknown') {
        this.locationName = loc.short_name
        this.locationCountry = loc.country || ''
      } else {
        // Find nearest city
        this.findNearestCity(loc.lat, loc.lng)
      }

      this.calculateTimezone(loc.lat, loc.lng)
    },

    onMapClick: function (lat, lng) {
      this.pickLocation = {
        lat: lat,
        lng: lng,
        alt: 0,
        accuracy: 0
      }

      // Update marker
      if (this.marker) {
        this.marker.setLatLng([lat, lng])
      } else if (this.map) {
        var that = this
        this.marker = L.marker([lat, lng], {
          draggable: true
        }).addTo(this.map)

        this.marker.on('dragend', function (e) {
          var pos = e.target.getLatLng()
          that.onMapClick(pos.lat, pos.lng)
        })
      }

      this.findNearestCity(lat, lng)
      this.calculateTimezone(lat, lng)
    },

    findNearestCity: function (lat, lng) {
      if (!this.cities || this.cities.length === 0) {
        this.locationName = lat.toFixed(2) + '°, ' + lng.toFixed(2) + '°'
        this.locationCountry = ''
        return
      }

      var nearest = null
      var minDist = Infinity

      for (var i = 0; i < this.cities.length; i++) {
        var city = this.cities[i]
        var dist = this.haversineDistance(lat, lng, city.lat, city.lng)

        if (dist < minDist) {
          minDist = dist
          nearest = city
        }
      }

      // Only use city name if within 200km
      if (nearest && minDist < 200) {
        this.locationName = nearest.name
        this.locationCountry = nearest.country
      } else if (nearest && minDist < 500) {
        // Show "Near [city]" if within 500km
        this.locationName = 'Near ' + nearest.name
        this.locationCountry = nearest.country
      } else {
        // Too far from any city, show coordinates
        this.locationName = lat.toFixed(2) + '°, ' + lng.toFixed(2) + '°'
        this.locationCountry = ''
      }
    },

    haversineDistance: function (lat1, lng1, lat2, lng2) {
      var R = 6371 // Earth's radius in km
      var dLat = this.toRad(lat2 - lat1)
      var dLng = this.toRad(lng2 - lng1)
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },

    toRad: function (deg) {
      return deg * Math.PI / 180
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

      var lat = this.pickLocation ? this.pickLocation.lat : 0
      var lng = this.pickLocation ? this.pickLocation.lng : 0

      if (this.coordEditMode === 'lat') {
        lat = Math.max(-90, Math.min(90, value))
      } else {
        lng = Math.max(-180, Math.min(180, value))
      }

      this.onMapClick(lat, lng)
      if (this.map) {
        this.map.setView([lat, lng], Math.max(this.map.getZoom(), 2))
      }
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
  height: 300px;
  overflow: hidden;
  background: #000;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.gps-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
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

/* Override Leaflet styles for dark theme */
::v-deep .leaflet-container {
  background: #1a1a2e;
}

::v-deep .leaflet-control-zoom a {
  background: #2d2d44 !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

::v-deep .leaflet-control-zoom a:hover {
  background: #3d3d54 !important;
}
</style>
