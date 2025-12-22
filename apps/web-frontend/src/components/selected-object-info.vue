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
    <div class="drag-handle-container">
      <div class="drag-handle"></div>
    </div>

    <div class="sheet-scroll-container">
      <!-- Minimized Bar Content -->
      <div class="minimized-header">
        <div class="obj-identity">
          <div class="obj-icon-container" @click="isExpanded = true">
            <div class="obj-type-dot"></div>
          </div>
          <div class="obj-title-group" @click="isExpanded = true">
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
            <button class="close-btn-circle" @click.stop="unselect">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Expanded Content Section -->
      <transition name="fade">
        <div v-if="isExpanded" class="expanded-body">
          <!-- Data Table -->
          <div class="data-table">
            <div v-if="constellation" class="data-row">
              <span class="data-label">Constellation</span>
              <div class="data-value-group">
                <span class="data-value">{{ constellation }}</span>
                <div class="nav-arrows">
                  <span class="chevron">&lt;</span>
                  <span class="chevron">&gt;</span>
                </div>
              </div>
            </div>
            <div v-if="magnitude()" class="data-row">
              <span class="data-label">Magnitude</span>
              <span class="data-value">{{ magnitude() }}</span>
            </div>
            <div v-if="distance()" class="data-row">
              <span class="data-label">Distance</span>
              <span class="data-value" v-html="distance()"></span>
            </div>
            <div class="data-row">
              <span class="data-label">RA/Dec</span>
              <span class="data-value mono" v-html="radecFormatted()"></span>
            </div>
            <div class="data-row">
              <span class="data-label">Az/Alt</span>
              <span class="data-value mono" v-html="azaltFormatted()"></span>
            </div>
          </div>

          <!-- Wiki Section -->
          <div v-if="wikipediaDescription" class="wiki-section">
            <p class="wiki-paragraph">
              <span class="wiki-highlight">{{ title }}</span>
              <span v-if="shortName" class="wiki-dim">({{ shortName }})</span>
              {{ wikipediaDescription }}
            </p>
            <a v-if="wikipediaUrl" :href="wikipediaUrl" target="_blank" class="wiki-link-more">more on Wikipedia</a>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import swh from '@/assets/sw_helpers.js'

export default {
  data: function () {
    return {
      isExpanded: false,
      wikipediaDescription: null,
      wikipediaUrl: null,
      zoomTimeout: null,
      timer: null,
      // Touch state
      touchStartY: 0,
      swipeThreshold: 50
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
    }
  },
  watch: {
    selectedObject: function (s) {
      this.wikipediaDescription = null
      this.wikipediaUrl = null
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (!s) {
        return
      }
      this.fetchWikipediaInfo()
      this.timer = setInterval(() => { this.$forceUpdate() }, 100)
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
      if (!d || isNaN(d)) return null
      const ly = d * swh.astroConstants.ERFA_AULT / swh.astroConstants.ERFA_DAYSEC / swh.astroConstants.ERFA_DJY
      if (ly >= 0.1) return ly.toFixed(2) + ' <span class="unit-dim">ly</span>'
      if (d >= 0.1) return d.toFixed(2) + ' <span class="unit-dim">AU</span>'
      const meter = d * swh.astroConstants.ERFA_DAU
      return meter >= 1000 ? (meter / 1000).toFixed(2) + ' <span class="unit-dim">km</span>' : meter.toFixed(2) + ' <span class="unit-dim">m</span>'
    },
    radecFormatted: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const posCIRS = this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'JNOW', obj.getInfo('radec'))
      const radecCIRS = this.$stel.c2s(posCIRS)
      const ra = this.$stel.anp(radecCIRS[0])
      const dec = this.$stel.anpm(radecCIRS[1])
      return this.formatRA(ra) + '&nbsp;&nbsp;' + this.formatDec(dec)
    },
    azaltFormatted: function () {
      if (!this.$stel || !this.$stel.core.selection) return ''
      const obj = this.$stel.core.selection
      const azalt = this.$stel.c2s(this.$stel.convertFrame(this.$stel.core.observer, 'ICRF', 'OBSERVED', obj.getInfo('radec')))
      return this.formatAz(this.$stel.anp(azalt[0])) + '&nbsp;&nbsp;' + this.formatDec(this.$stel.anpm(azalt[1]))
    },
    // Pointer Gestures
    handlePointerStart: function (e) {
      this.touchStartY = e.clientY
    },
    handlePointerMove: function (e) {
      // Avoid browser scrolling while swiping panel
      if (this.isExpanded && this.$el.querySelector('.sheet-scroll-container').scrollTop > 0) {}
      // Optional: Visual dragging feedback could be added here
    },
    handlePointerEnd: function (e) {
      const touchEndY = e.clientY
      const deltaY = this.touchStartY - touchEndY

      if (deltaY > this.swipeThreshold && !this.isExpanded) {
        this.isExpanded = true
      } else if (deltaY < -this.swipeThreshold && this.isExpanded) {
        this.isExpanded = false
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
    }
  },
  mounted: function () {
    window.addEventListener('pointerup', () => this.stopZoom())
    // Start update timer if object is already selected on mount
    if (this.selectedObject) {
      this.timer = setInterval(() => { this.$forceUpdate() }, 100)
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
}

.obj-identity {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.obj-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}

.obj-type-dot {
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
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

/* Wiki Section */
.wiki-section {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.wiki-paragraph {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.wiki-highlight {
  color: #5AC8FA;
  font-weight: 600;
}

.wiki-dim {
  color: #5AC8FA;
  opacity: 0.8;
}

.wiki-link-more {
  display: block;
  text-align: right;
  color: #5AC8FA;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
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
</style>
