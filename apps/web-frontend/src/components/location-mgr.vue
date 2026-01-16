// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="location-picker">
    <!-- Map Section -->
    <div class="map-container">
      <l-map
        class="location-map"
        ref="myMap"
        :center="mapCenter"
        :zoom="mapZoom"
        :options="{ zoomControl: false }"
        @click="onMapClick"
      >
        <l-control-zoom position="topright"></l-control-zoom>
        <l-tile-layer
          :url="tileUrl"
          :attribution="attribution"
        ></l-tile-layer>

        <!-- Current position marker -->
        <l-marker
          v-if="pickLocation"
          :lat-lng="[pickLocation.lat, pickLocation.lng]"
          :draggable="true"
          @dragend="onMarkerDrag"
        >
          <l-icon
            :icon-url="markerIcon"
            :icon-size="[32, 32]"
            :icon-anchor="[16, 32]"
          ></l-icon>
        </l-marker>

        <!-- GPS accuracy circle -->
        <l-circle
          v-if="realLocation && realLocation.accuracy > 0"
          :lat-lng="[realLocation.lat, realLocation.lng]"
          :radius="realLocation.accuracy"
          :options="{
            stroke: true,
            color: '#4CAF50',
            weight: 2,
            fillColor: '#4CAF50',
            fillOpacity: 0.1
          }"
        ></l-circle>
      </l-map>

      <!-- GPS Button -->
      <v-btn
        fab
        small
        class="gps-btn"
        @click="centerOnRealPosition"
        :loading="isLocating"
      >
        <v-icon>mdi-crosshairs-gps</v-icon>
      </v-btn>
    </div>

    <!-- Location Details Panel -->
    <div class="location-details">
      <!-- Location Name -->
      <div class="detail-row" @click="showSearchDialog = true">
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

    <!-- Search Dialog -->
    <v-dialog v-model="showSearchDialog" max-width="500">
      <v-card class="search-dialog">
        <v-card-title>{{ $t('Search Location') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="searchQuery"
            :label="$t('Enter city or place name')"
            prepend-inner-icon="mdi-magnify"
            outlined
            dense
            autofocus
            @keyup.enter="searchLocation"
            :loading="isSearching"
          ></v-text-field>

          <v-list v-if="searchResults.length > 0" class="search-results">
            <v-list-item
              v-for="(result, index) in searchResults"
              :key="index"
              @click="selectSearchResult(result)"
            >
            <v-list-item-icon>
              <v-icon>mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
                <v-list-item-title>{{ result.display_name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showSearchDialog = false">{{ $t('Cancel') }}</v-btn>
          <v-btn color="primary" @click="searchLocation">{{ $t('Search') }}</v-btn>
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
import { LMap, LTileLayer, LMarker, LCircle, LControlZoom, LIcon } from 'vue2-leaflet'

export default {
  data: function () {
    return {
      pickLocation: null,
      mapCenter: [25.0, 81.0],
      mapZoom: 4,
      isLocating: false,
      isSearching: false,
      showSearchDialog: false,
      showCoordDialog: false,
      searchQuery: '',
      searchResults: [],
      coordEditMode: 'lat',
      coordEditValue: '',
      locationName: 'Unknown',
      locationCountry: '',
      timezoneOffset: 0,
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://osm.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      markerIcon: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#2196F3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>')
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
        if (loc) {
          this.setPickLocation(loc)
        }
      }
    }
  },
  mounted: function () {
    var that = this
    if (this.startLocation) {
      this.setPickLocation(this.startLocation)
    }
    this.$nextTick(function () {
      if (that.$refs.myMap) {
        var map = that.$refs.myMap.mapObject
        if (map) {
          map.invalidateSize()
        }
      }
    })
  },
  methods: {
    setPickLocation: function (loc) {
      this.pickLocation = {
        lat: loc.lat,
        lng: loc.lng,
        alt: loc.alt || 0,
        accuracy: loc.accuracy || 0
      }
      this.mapCenter = [loc.lat, loc.lng]

      if (loc.short_name && loc.short_name !== 'Unknown') {
        this.locationName = loc.short_name
        this.locationCountry = loc.country || ''
      } else {
        this.reverseGeocode(loc.lat, loc.lng)
      }

      this.calculateTimezone(loc.lat, loc.lng)
    },

    onMapClick: function (event) {
      var lat = event.latlng.lat
      var lng = event.latlng.lng
      this.pickLocation = {
        lat: lat,
        lng: lng,
        alt: 0,
        accuracy: 0
      }
      this.reverseGeocode(lat, lng)
      this.calculateTimezone(lat, lng)
    },

    onMarkerDrag: function (event) {
      var lat = event.target._latlng.lat
      var lng = event.target._latlng.lng
      this.pickLocation = {
        lat: lat,
        lng: lng,
        alt: 0,
        accuracy: 0
      }
      this.reverseGeocode(lat, lng)
      this.calculateTimezone(lat, lng)
    },

    centerOnRealPosition: function () {
      var that = this
      if (this.realLocation) {
        this.setPickLocation(this.realLocation)
        this.mapZoom = 10
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
              that.mapZoom = 10
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

    reverseGeocode: function (lat, lng) {
      var that = this
      fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=10&addressdetails=1',
        {
          headers: {
            'Accept-Language': navigator.language || 'en'
          }
        }
      )
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          if (data && data.address) {
            var addr = data.address
            var cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state_district
            var stateName = addr.state
            var countryName = addr.country

            if (cityName) {
              that.locationName = cityName
              if (stateName && stateName !== cityName) {
                that.locationCountry = stateName + ', ' + (countryName || '')
              } else {
                that.locationCountry = countryName || ''
              }
            } else if (stateName) {
              that.locationName = stateName
              that.locationCountry = countryName || ''
            } else if (countryName) {
              that.locationName = countryName
              that.locationCountry = ''
            } else {
              that.locationName = lat.toFixed(4) + ', ' + lng.toFixed(4)
              that.locationCountry = ''
            }
          } else {
            that.locationName = lat.toFixed(4) + ', ' + lng.toFixed(4)
            that.locationCountry = ''
          }
        })
        .catch(function (error) {
          console.error('Reverse geocoding failed:', error)
          that.locationName = lat.toFixed(4) + ', ' + lng.toFixed(4)
          that.locationCountry = ''
        })
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

    searchLocation: function () {
      var that = this
      if (!this.searchQuery.trim()) return

      this.isSearching = true
      fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(this.searchQuery) + '&limit=10',
        {
          headers: {
            'Accept-Language': navigator.language || 'en'
          }
        }
      )
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          that.searchResults = data
          that.isSearching = false
        })
        .catch(function (error) {
          console.error('Search failed:', error)
          that.searchResults = []
          that.isSearching = false
        })
    },

    selectSearchResult: function (result) {
      var lat = parseFloat(result.lat)
      var lng = parseFloat(result.lon)

      this.pickLocation = {
        lat: lat,
        lng: lng,
        alt: 0,
        accuracy: 0
      }
      this.mapCenter = [lat, lng]
      this.mapZoom = 10

      var parts = result.display_name.split(',')
      this.locationName = parts[0].trim()
      this.locationCountry = parts.slice(1).join(',').trim()

      this.calculateTimezone(lat, lng)
      this.showSearchDialog = false
      this.searchQuery = ''
      this.searchResults = []
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

      this.mapCenter = [this.pickLocation.lat, this.pickLocation.lng]
      this.reverseGeocode(this.pickLocation.lat, this.pickLocation.lng)
      this.calculateTimezone(this.pickLocation.lat, this.pickLocation.lng)
      this.showCoordDialog = false
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
  },
  components: { LMap, LTileLayer, LMarker, LCircle, LControlZoom, LIcon }
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
  height: 300px;
  width: 100%;
}

.location-map {
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
.search-dialog,
.coord-dialog {
  background: #2d2d44 !important;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  background: transparent !important;
}

.search-results .v-list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-results .v-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Leaflet overrides */
.location-map >>> .leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.location-map >>> .leaflet-control-zoom a {
  background: white !important;
  color: #333 !important;
}

.location-map >>> .leaflet-control-zoom a:hover {
  background: #f0f0f0 !important;
}
</style>
