// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div v-if="selectedObject"
       class="stel-bottom-sheet"
       :class="{ 'is-expanded': isExpanded }"
       @pointerdown="handlePointerStart"
       @pointermove="handlePointerMove"
       @pointerup="handlePointerEnd"
       @pointercancel="handlePointerEnd">

    <!-- Top Pull Bar / Drag Handle -->
    <div class="drag-handle-container" @click="toggleExpand">
      <div class="drag-handle"></div>
    </div>

    <div class="sheet-scroll-container">
      <!-- Minimized Bar Content -->
      <div class="minimized-header">
        <div class="obj-identity">
          <div class="obj-icon-container" @click.stop="toggleFavourite">
            <img :src="icon" class="obj-type-icon" :alt="type"/>
            <div v-if="isFavourite" class="fav-badge">
              <v-icon x-small color="white">mdi-heart</v-icon>
            </div>
          </div>
          <div class="obj-title-group" @click="toggleExpand">
            <h1 class="obj-name">{{ title }}</h1>
            <p class="obj-meta">{{ type }}</p>
          </div>
        </div>

        <div class="header-actions">
          <!-- Center Button (Shows when not centered/locked) -->
          <div v-if="showPointToButton" class="center-button-wrapper" @click.stop="lockToSelection">
            <div class="center-btn-large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="5"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="5" y2="12"/>
                <line x1="19" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <span class="center-label">Center</span>
          </div>

          <!-- Zoom Controls (Shows only when centered) -->
          <div v-else class="zoom-controls-wrapper">
            <div class="zoom-controls">
              <button class="icon-btn" @pointerdown.stop="zoomOutButtonClicked" @pointerup.stop="stopZoom" @pointercancel.stop="stopZoom">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
              <span class="zoom-label">Zoom</span>
              <button class="icon-btn" @pointerdown.stop="zoomInButtonClicked" @pointerup.stop="stopZoom" @pointercancel.stop="stopZoom">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Expanded Content Section -->
      <transition name="fade">
        <div v-if="isExpanded" class="expanded-body">
          <!-- Other Names / Aliases at the top -->
          <div v-if="allNames().length > 1" class="aliases-container">
            <div class="aliases-scroll">
              <span v-for="name in allNames().slice(1)" :key="name" class="alias-chip">
                {{ name }}
              </span>
            </div>
          </div>

          <!-- Data Table -->
          <div class="data-table">
            <div v-if="constellation" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-star-cluster</v-icon>Constellation
              </span>
              <span class="data-value">{{ constellation }}</span>
            </div>
            <div v-if="magnitude()" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-brightness-5</v-icon>Magnitude
              </span>
              <span class="data-value">{{ magnitude() }}</span>
            </div>
            <div v-if="distance() && !isSatellite" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-ruler</v-icon>Distance
              </span>
              <span class="data-value" v-html="distance()"></span>
            </div>
            <div v-if="phase()" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-moon-waning-crescent</v-icon>Phase
              </span>
              <span class="data-value">{{ phase() }}</span>
            </div>
            <div v-if="angularSize()" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-unfold-more-horizontal</v-icon>Angular Size
              </span>
              <span class="data-value">{{ angularSize() }}</span>
            </div>
            <div v-if="spectralType()" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-palette-swatch-outline</v-icon>Spectral Type
              </span>
              <span class="data-value">{{ spectralType() }}</span>
            </div>
            <div class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-rhombus-split</v-icon>RA (J2000)
              </span>
              <span class="data-value mono" v-html="raFormatted()"></span>
            </div>
            <div class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-rhombus-split-outline</v-icon>Dec (J2000)
              </span>
              <span class="data-value mono" v-html="decFormatted()"></span>
            </div>
            <div class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-compass-outline</v-icon>Az/Alt
              </span>
              <span class="data-value mono" v-html="azaltFormatted()"></span>
            </div>
            <div class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-eye-outline</v-icon>Visibility
              </span>
              <span class="data-value" :class="visibilityClass()">{{ visibility() }}</span>
            </div>
            <div v-if="riseSetTimes()" class="data-row">
              <span class="data-label">
                <v-icon small class="mr-2">mdi-weather-sunset</v-icon>Rise / Set
              </span>
              <span class="data-value">{{ riseSetTimes() }}</span>
            </div>

            <!-- Satellite Specific Info -->
            <template v-if="isSatellite">
              <div v-if="nextPassCountdown" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-clock-outline</v-icon>Next Pass
                </span>
                <span class="data-value" :class="{ 'visible-yes': isVisibleNow }">{{ nextPassCountdown }}</span>
              </div>
              <div v-if="satelliteRange" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-map-marker-distance</v-icon>Range
                </span>
                <span class="data-value">{{ satelliteRange }} <span class="unit-dim">km</span></span>
              </div>
              <div v-if="satelliteError" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-alert-circle-outline</v-icon>Est. Error (~age)
                </span>
                <span class="data-value">{{ satelliteError }} <span class="unit-dim">km</span></span>
              </div>
              <div v-if="satelliteInfo.norad_number" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-numeric</v-icon>NORAD ID
                </span>
                <span class="data-value">{{ satelliteInfo.norad_number }}</span>
              </div>
              <div v-if="satelliteInfo.designation" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-identifier</v-icon>Designation
                </span>
                <span class="data-value">{{ satelliteInfo.designation }}</span>
              </div>
              <div v-if="satelliteInfo.group && satelliteInfo.group.length" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-folder-outline</v-icon>Group
                </span>
                <span class="data-value">{{ satelliteInfo.group.join(', ') }}</span>
              </div>
              <div v-if="satelliteInfo.launch_date && satelliteInfo.launch_date !== 'Unknown'" class="data-row">
                <span class="data-label">
                  <v-icon small class="mr-2">mdi-rocket-launch-outline</v-icon>Launch Date
                </span>
                <span class="data-value">{{ satelliteInfo.launch_date }}</span>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import swh from '@/assets/sw_helpers.js'
import * as satellite from 'satellite.js'

export default {
  data: function () {
    return {
      isExpanded: false,
      zoomTimeout: null,
      timer: null,
      // Touch state
      touchStartY: 0,
      swipeThreshold: 40,
      nextPassTime: null
    }
  },
  computed: {
    selectedObject: function () {
      return this.$store.state.selectedObject
    },
    stelSelectionId: function () {
      return this.$store.state.stel && this.$store.state.stel.selection ? this.$store.state.stel.selection : undefined
    },
    title: function () {
      return this.selectedObject ? swh.namesForSkySource(this.selectedObject, 26)[0] : 'Selection'
    },
    shortName: function () {
      if (!this.selectedObject || !this.selectedObject.names) return null
      for (const name of this.selectedObject.names) {
        if (name.length <= 8 && name !== this.title) return swh.cleanupOneSkySourceName(name)
      }
      return null
    },
    type: function () {
      if (!this.selectedObject) return 'Unknown'
      let morpho = ''
      if (this.selectedObject.model_data && this.selectedObject.model_data.morpho) {
        morpho = swh.nameForGalaxyMorpho(this.selectedObject.model_data.morpho)
        if (morpho) morpho = morpho + ' '
      }
      return morpho + swh.nameForSkySourceType(this.selectedObject.types[0])
    },
    icon: function () {
      return swh.iconForSkySource(this.selectedObject)
    },
    showPointToButton: function () {
      if (!this.$store.state.stel.lock) return true
      if (this.$store.state.stel.lock !== this.$store.state.stel.selection) return true
      return false
    },
    constellation: function () {
      if (!this.selectedObject || !this.selectedObject.model_data) return null
      return this.selectedObject.model_data.constellation || (this.selectedObject.types.includes('Con') ? this.title : null)
    },
    isSatellite: function () {
      return this.selectedObject && (this.selectedObject.model === 'tle_satellite' || this.selectedObject.types.includes('Asa'))
    },
    satelliteInfo: function () {
      return this.isSatellite ? this.selectedObject.model_data : {}
    },
    satelliteRange: function () {
      if (!this.isSatellite || !this.satelliteInfo.tle || this.satelliteInfo.tle.length < 2) return null
      try {
        const tle = this.satelliteInfo.tle
        const satrec = satellite.twoline2satrec(tle[0], tle[1])
        const now = new Date()
        const positionAndVelocity = satellite.propagate(satrec, now)
        const positionEci = positionAndVelocity.position

        if (!positionEci) return null

        const gmst = satellite.gstime(now)
        const positionEcf = satellite.eciToEcf(positionEci, gmst)
        const location = this.$store.state.currentLocation
        const observerGd = {
          longitude: satellite.degreesToRadians(location.lng),
          latitude: satellite.degreesToRadians(location.lat),
          height: (location.alt || 0) / 1000
        }

        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)
        return lookAngles.rangeSat.toFixed(2)
      } catch (e) {
        console.error('Failed to calculate satellite range', e)
        return null
      }
    },
    satelliteError: function () {
      if (!this.isSatellite || !this.satelliteInfo.tle || this.satelliteInfo.tle.length < 1) return null
      try {
        const line1 = this.satelliteInfo.tle[0]
        // TLE Epoch is at chars 18-32 of Line 1: YYDOY.FRAC
        const epochStr = line1.substring(18, 32).trim()
        const yearShort = parseInt(epochStr.substring(0, 2))
        const dayOfYear = parseFloat(epochStr.substring(2))

        const year = yearShort < 57 ? 2000 + yearShort : 1900 + yearShort
        const epochDate = new Date(year, 0)
        epochDate.setMilliseconds((dayOfYear - 1) * 24 * 60 * 60 * 1000)

        const now = new Date()
        const ageDays = (now - epochDate) / (1000 * 60 * 60 * 24)

        // Rough estimate: SGP4 TLEs drift 1-3km per day depending on altitude/drag
        // We'll use 2km/day as a conservative average for the UI
        const estError = Math.max(0, ageDays * 2.0)

        if (estError > 100) return '>100'
        return estError.toFixed(1)
      } catch (e) {
        return null
      }
    },
    isVisibleNow: function () {
      if (!this.isSatellite || !this.satelliteInfo.tle) return false
      try {
        const tle = this.satelliteInfo.tle
        const satrec = satellite.twoline2satrec(tle[0], tle[1])
        const now = new Date()
        const positionAndVelocity = satellite.propagate(satrec, now)
        const positionEci = positionAndVelocity.position
        if (!positionEci) return false
        const gmst = satellite.gstime(now)
        const positionEcf = satellite.eciToEcf(positionEci, gmst)
        const location = this.$store.state.currentLocation
        const observerGd = {
          longitude: satellite.degreesToRadians(location.lng),
          latitude: satellite.degreesToRadians(location.lat),
          height: (location.alt || 0) / 1000
        }
        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)
        return lookAngles.elevation > 0
      } catch (e) {
        return false
      }
    },
    nextPassCountdown: function () {
      if (this.isVisibleNow) return 'VISIBLE NOW'
      if (!this.nextPassTime) return null

      const diff = this.nextPassTime.getTime() - (new Date()).getTime()
      if (diff <= 0) {
        // Trigger a re-calculation soon
        return 'Starting...'
      }

      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)

      if (hours > 0) return hours + 'h ' + mins + 'm'
      if (mins > 0) return mins + 'm ' + secs + 's'
      return secs + 's'
    },
    isFavourite: function () {
      if (!this.selectedObject) return false
      const favs = this.$store.state.favourites || []
      return favs.some(fav =>
        (fav.names && this.selectedObject.names && fav.names[0] === this.selectedObject.names[0]) ||
        (fav.model_data && this.selectedObject.model_data && fav.model_data.norad_number && fav.model_data.norad_number === this.selectedObject.model_data.norad_number)
      )
    }
  },
  watch: {
    selectedObject: function (s) {
      this.isExpanded = false
      this.nextPassTime = null
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (!s) {
        return
      }
      if (this.isSatellite) {
        this.calculateNextPass()
      }
      this.timer = setInterval(() => { this.$forceUpdate() }, 1000)
    },
    stelSelectionId: function (s) {
      if (!this.$stel.core.selection) {
        this.$store.commit('setSelectedObject', 0)
        return
      }
      swh.sweObj2SkySource(this.$stel.core.selection).then(res => {
        this.$store.commit('setSelectedObject', res)
      }, err => {
        console.log("Couldn't find info for object " + s + ':' + err)
        this.$store.commit('setSelectedObject', 0)
      })
    }
  },
  methods: {
    toggleExpand: function () {
      this.isExpanded = !this.isExpanded
    },
    magnitude: function () {
      if (!this.$stel || !this.$stel.core.selection) return null
      const v = this.$stel.core.selection.getInfo('vmag')
      return (v !== undefined && !isNaN(v)) ? v.toFixed(2) : null
    },
    distance: function () {
      if (!this.$stel || !this.$stel.core.selection) return null
      const d = this.$stel.core.selection.getInfo('distance')
      if (d === undefined || isNaN(d) || d <= 0) return null
      const ly = d * swh.ERFA_AULT / swh.ERFA_DAYSEC / swh.ERFA_DJY
      if (ly >= 0.1) return ly.toFixed(2) + ' <span class="unit-dim">ly</span>'
      if (d >= 0.1) return d.toFixed(2) + ' <span class="unit-dim">AU</span>'
      const meter = d * swh.ERFA_DAU
      return meter >= 1000 ? (meter / 1000).toFixed(2) + ' <span class="unit-dim">km</span>' : meter.toFixed(2) + ' <span class="unit-dim">m</span>'
    },
    raFormatted: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const posCIRS = this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'JNOW', obj.getInfo('radec'))
      const radecCIRS = this.$stel.c2s(posCIRS)
      const ra = this.$stel.anp(radecCIRS[0])
      return this.formatRA(ra)
    },
    decFormatted: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const posCIRS = this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'JNOW', obj.getInfo('radec'))
      const radecCIRS = this.$stel.c2s(posCIRS)
      const dec = this.$stel.anpm(radecCIRS[1])
      return this.formatDec(dec)
    },
    azaltFormatted: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const azalt = this.$stel.c2s(this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'OBSERVED', obj.getInfo('radec')))
      return this.formatAz(this.$stel.anp(azalt[0])) + '&nbsp;&nbsp;' + this.formatDec(this.$stel.anpm(azalt[1]))
    },
    phase: function () {
      if (!this.$stel || !this.$stel.core.selection) return null
      const p = this.$stel.core.selection.getInfo('phase')
      if (p === undefined || isNaN(p)) return null
      return (p * 100).toFixed(1) + '%'
    },
    angularSize: function () {
      if (!this.$stel || !this.$stel.core.selection) return null
      const s = this.$stel.core.selection.getInfo('radius')
      if (!s || isNaN(s) || s <= 0) return null
      // Radius is in radians, convert to arc-seconds or arc-minutes
      const arcSec = s * 180 / Math.PI * 3600
      if (arcSec >= 60) {
        return (arcSec / 60).toFixed(1) + "'"
      }
      return arcSec.toFixed(1) + '"'
    },
    spectralType: function () {
      if (!this.selectedObject || !this.selectedObject.model_data) return null
      return this.selectedObject.model_data.spect_type || null
    },
    visibility: function () {
      if (!this.$stel || !this.$stel.core.selection) return 'Unknown'
      const obj = this.$stel.core.selection
      const azalt = this.$stel.c2s(this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'OBSERVED', obj.getInfo('radec')))
      const altDeg = this.$stel.anpm(azalt[1]) * 180 / Math.PI

      if (altDeg > 0) {
        return 'Above horizon (' + altDeg.toFixed(1) + '°)'
      } else {
        return 'Below horizon (' + altDeg.toFixed(1) + '°)'
      }
    },
    visibilityClass: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const azalt = this.$stel.c2s(this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'OBSERVED', obj.getInfo('radec')))
      const altDeg = this.$stel.anpm(azalt[1]) * 180 / Math.PI
      return altDeg > 0 ? 'visible-yes' : 'visible-no'
    },
    riseSetTimes: function () {
      if (!this.$stel || !this.$stel.core.selection) return null

      try {
        const obj = this.$stel.core.selection
        const observer = this.$stel.core.observer

        // Get object RA/Dec (in radians)
        const radec = obj.getInfo('radec')
        if (!radec) return null
        const pos = this.$stel.c2s(radec)
        const ra = this.$stel.anp(pos[0]) // Right Ascension (0 to 2π)
        const dec = this.$stel.anpm(pos[1]) // Declination (-π/2 to π/2)

        // Get observer latitude (in radians)
        const lat = observer.latitude * Math.PI / 180

        // Calculate hour angle at rise/set
        // cos(H) = -tan(lat) * tan(dec)
        const cosH = -Math.tan(lat) * Math.tan(dec)

        // Check if object never rises or never sets
        if (cosH < -1) {
          return 'Circumpolar (always visible)'
        }
        if (cosH > 1) {
          return 'Never rises'
        }

        const H = Math.acos(cosH) // Hour angle in radians
        const Hhours = H * 12 / Math.PI // Convert to hours

        // Get current time and calculate LST
        const now = new Date()
        const hours = now.getHours() + now.getMinutes() / 60

        // Approximate Local Sidereal Time (simplified)
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
        const lng = observer.longitude
        const lst = (100.46 + 0.985647 * dayOfYear + lng + 15 * hours) % 360
        const lstHours = lst / 15

        // RA in hours
        const raHours = ra * 12 / Math.PI

        // Transit time (when object is at meridian)
        let transitHours = raHours - lstHours + hours
        if (transitHours < 0) transitHours += 24
        if (transitHours >= 24) transitHours -= 24

        // Rise and set times
        let riseHours = transitHours - Hhours
        let setHours = transitHours + Hhours
        if (riseHours < 0) riseHours += 24
        if (setHours >= 24) setHours -= 24

        const formatTime = (h) => {
          const hrs = Math.floor(h)
          const mins = Math.floor((h - hrs) * 60)
          return String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0')
        }

        return formatTime(riseHours) + ' / ' + formatTime(setHours)
      } catch (e) {
        console.log('Rise/set calculation error:', e)
        return null
      }
    },
    allNames: function () {
      if (!this.selectedObject || !this.selectedObject.names) return []
      return this.selectedObject.names.map(n => swh.cleanupOneSkySourceName(n))
    },
    // Pointer Gestures
    handlePointerStart: function (e) {
      this.touchStartY = e.clientY
    },
    handlePointerMove: function (e) {
      // Optional: Visual dragging feedback could be added here
    },
    handlePointerEnd: function (e) {
      const touchEndY = e.clientY
      const deltaY = this.touchStartY - touchEndY
      const scrollContainer = this.$el.querySelector('.sheet-scroll-container')

      if (Math.abs(deltaY) < this.swipeThreshold) return

      if (deltaY > 0 && !this.isExpanded) {
        this.isExpanded = true
      } else if (deltaY < 0 && this.isExpanded) {
        // Only collapse if at the top of the scroll content
        if (!scrollContainer || scrollContainer.scrollTop <= 0) {
          this.isExpanded = false
        }
      }
    },
    formatInt: function (num, padLen) {
      return ('000' + num).slice(-padLen)
    },
    formatRA: function (a) {
      const r = this.$stel.a2tf(a, 1)
      return '<span>' + this.formatInt(r.hours, 2) + '</span><sub>h</sub> <span>' + this.formatInt(r.minutes, 2) + '</span><sub>m</sub> <span>' + this.formatInt(r.seconds, 2) + '.' + r.fraction + '</span><sub>s</sub>'
    },
    formatAz: function (a) {
      const r = this.$stel.a2af(a, 1)
      const deg = r.degrees < 0 ? r.degrees + 180 : r.degrees
      return '<span>' + this.formatInt(deg, 3) + '</span>° <span>' + this.formatInt(r.arcminutes, 2) + '</span>\' <span>' + this.formatInt(r.arcseconds, 2) + '.' + r.fraction + '</span>"'
    },
    formatDec: function (a) {
      const r = this.$stel.a2af(a, 1)
      return r.sign + '<span>' + this.formatInt(r.degrees, 2) + '</span>° <span>' + this.formatInt(r.arcminutes, 2) + '</span>\' <span>' + this.formatInt(r.arcseconds, 2) + '.' + r.fraction + '</span>"'
    },
    fetchWikipediaInfo: function () {
      // Disabled for offline/secure deployment - no external API calls
      this.wikipediaDescription = null
      this.wikipediaUrl = null
    },
    unselect: function () {
      this.$stel.core.selection = 0
    },
    lockToSelection: function () {
      if (this.$stel.core.selection) this.$stel.pointAndLock(this.$stel.core.selection, 0.5)
    },
    zoomInButtonClicked: function () {
      const fov = this.$store.state.stel.fov * 180 / Math.PI
      this.$stel.zoomTo(fov * 0.3 * Math.PI / 180, 0.4)
      this.zoomTimeout = setTimeout(() => this.zoomInButtonClicked(), 300)
    },
    zoomOutButtonClicked: function () {
      const fov = this.$store.state.stel.fov * 180 / Math.PI
      this.$stel.zoomTo(fov * 3 * Math.PI / 180, 0.6)
      this.zoomTimeout = setTimeout(() => this.zoomOutButtonClicked(), 200)
    },
    stopZoom: function () {
      if (this.zoomTimeout) { clearTimeout(this.zoomTimeout); this.zoomTimeout = null }
    },
    calculateNextPass: function () {
      if (!this.isSatellite || !this.satelliteInfo.tle || this.satelliteInfo.tle.length < 2) return

      try {
        const tle = this.satelliteInfo.tle
        const satrec = satellite.twoline2satrec(tle[0], tle[1])
        const location = this.$store.state.currentLocation
        const observerGd = {
          longitude: satellite.degreesToRadians(location.lng),
          latitude: satellite.degreesToRadians(location.lat),
          height: (location.alt || 0) / 1000
        }

        const now = new Date()
        const stepMins = 2
        const maxIter = (24 * 60) / stepMins

        for (let i = 0; i < maxIter; i++) {
          const checkTime = new Date(now.getTime() + i * stepMins * 60000)
          const positionAndVelocity = satellite.propagate(satrec, checkTime)
          const positionEci = positionAndVelocity.position
          if (!positionEci) continue

          const gmst = satellite.gstime(checkTime)
          const positionEcf = satellite.eciToEcf(positionEci, gmst)
          const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)

          if (lookAngles.elevation > satellite.degreesToRadians(5)) {
            this.nextPassTime = checkTime
            return
          }
        }
      } catch (e) {
        console.error('Next pass calculation failed', e)
      }
    },
    toggleFavourite: function () {
      if (!this.selectedObject) return
      this.$store.commit('toggleFavourite', this.selectedObject)
    }
  },
  mounted: function () {
    window.addEventListener('pointerup', () => this.stopZoom())
    // Start update timer if object is already selected on mount
    if (this.selectedObject) {
      if (this.isSatellite) this.calculateNextPass()
      this.timer = setInterval(() => { this.$forceUpdate() }, 1000)
    }
  },
  beforeDestroy: function () {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
</script>

<style scoped>
.stel-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(28, 28, 30, 0.85);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: 20px 20px 0 0;
  color: #fff;
  z-index: 1000;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  transition: height 0.3s cubic-bezier(0.2, 0, 0, 1);
  padding-bottom: env(safe-area-inset-bottom, 20px);
  height: 112px; /* Balanced height to prevent clipping with safe area */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.stel-bottom-sheet.is-expanded {
  height: auto;
  max-height: 70vh;
  border-radius: 24px 24px 0 0;
}

.sheet-scroll-container {
  overflow-y: auto;
  flex: 1;
}

.drag-handle-container {
  width: 100%;
  padding: 4px 0 2px 0;
  cursor: pointer;
  touch-action: none;
}

.drag-handle {
  width: 32px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  margin: 0 auto;
}

/* Minimized Header */
.minimized-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px 16px;
  touch-action: none;
}

.obj-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fav-btn {
  margin-left: -4px; /* Adjust as needed */
}

.obj-icon-container {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.fav-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #E91E63;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1E1E1E; /* Match background */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.obj-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.obj-type-icon {
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.obj-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.obj-meta {
  font-size: 13px;
  color: #5AC8FA;
  margin: 0;
  font-weight: 500;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.center-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding-top: 4px;
}

.center-btn-large {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.center-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.zoom-controls-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 2px 6px;
}

.zoom-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 8px;
  font-weight: 500;
}

.icon-btn {
  background: none;
  border: none;
  color: #fff;
  padding: 6px;
  display: flex;
  cursor: pointer;
}

.close-btn-circle {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Expanded Content */
.expanded-body {
  padding: 2px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.pill-action {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.pill-action.active {
  background: rgba(10, 132, 255, 0.2);
  border-color: #0A84FF;
  color: #0A84FF;
}

.pill-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-action {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-action.favored {
  color: #FF2D55;
  border-color: #FF2D55;
  background: rgba(255, 45, 85, 0.1);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Data Table (shared styles) */
.data-table {
  margin-bottom: 6px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.data-value {
  font-size: 15px;
  font-weight: 500;
}

.data-value.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 14px;
}

.data-value-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-arrows {
  display: flex;
  gap: 4px;
}

.chevron {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* Names List - New Chip UI */
.aliases-container {
  margin: 10px 0 16px 0;
  width: 100%;
}

.aliases-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none; /* Firefox */
}

.aliases-scroll::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.alias-chip {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  backdrop-filter: blur(5px);
}

/* Units */
sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  vertical-align: baseline;
  position: relative;
  top: 0.2em;
  margin-left: 1px;
}

.unit-dim {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

/* Visibility Status */
.visible-yes {
  color: #30D158;
}

.visible-no {
  color: #FF453A;
}
</style>
