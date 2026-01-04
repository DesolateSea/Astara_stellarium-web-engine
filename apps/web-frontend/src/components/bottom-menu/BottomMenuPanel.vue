// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="bottom-menu-panel">
    <transition name="slide-fade" mode="out-in">
      <!-- Main Menu Grid -->
      <div v-if="!activeSubmenu" key="main" class="menu-grid">
        <div class="menu-item"
             @pointerdown="startLongPress('gridsLines')"
             @pointerup="endPress('gridsLines', toggleGridsLines)"
             @pointerleave="cancelLongPress"
             @contextmenu.prevent>
          <div class="menu-icon" :class="{ active: gridsLinesActive }">
            <v-icon large>mdi-grid</v-icon>
          </div>
          <div class="menu-label">Grids & Lines</div>
        </div>

        <div class="menu-item"
             @pointerdown="startLongPress('constellations')"
             @pointerup="endPress('constellations', toggleConstellations)"
             @pointerleave="cancelLongPress"
             @contextmenu.prevent>
          <div class="menu-icon" :class="{ active: constellationsActive }">
            <v-icon large>mdi-creation</v-icon>
          </div>
          <div class="menu-label">Constellations</div>
        </div>

        <!-- Landscape: Simple toggle only -->
        <div class="menu-item" @click="toggleLandscape">
          <div class="menu-icon" :class="{ active: landscapeVisible }">
            <v-icon large>mdi-image</v-icon>
          </div>
          <div class="menu-label">Landscape</div>
        </div>

        <div class="menu-item"
             @pointerdown="startLongPress('atmosphere')"
             @pointerup="endPress('atmosphere', toggleAtmosphere)"
             @pointerleave="cancelLongPress"
             @contextmenu.prevent>
          <div class="menu-icon" :class="{ active: atmosphereVisible }">
            <v-icon large>mdi-weather-partly-cloudy</v-icon>
          </div>
          <div class="menu-label">Atmosphere</div>
        </div>

        <div class="menu-item"
             @pointerdown="startLongPress('labels')"
             @pointerup="endPress('labels', toggleLabels)"
             @pointerleave="cancelLongPress"
             @contextmenu.prevent>
          <div class="menu-icon" :class="{ active: labelsActive }">
            <v-icon large>{{ labelsActive ? 'mdi-label' : 'mdi-label-outline' }}</v-icon>
          </div>
          <div class="menu-label">Labels</div>
        </div>

        <!-- Night Mode: Simple toggle only -->
        <div class="menu-item" @click="toggleNightMode">
          <div class="menu-icon" :class="{ active: nightModeActive }">
            <v-icon large>mdi-eye</v-icon>
          </div>
          <div class="menu-label">Night mode</div>
        </div>
      </div>

      <!-- Submenus -->
      <grids-lines-submenu v-else-if="activeSubmenu === 'gridsLines'" key="gridsLines" @back="activeSubmenu = null" />
      <constellations-submenu v-else-if="activeSubmenu === 'constellations'" key="constellations" @back="activeSubmenu = null" />
      <atmosphere-submenu v-else-if="activeSubmenu === 'atmosphere'" key="atmosphere" @back="activeSubmenu = null" />
      <labels-submenu v-else-if="activeSubmenu === 'labels'" key="labels" @back="activeSubmenu = null" />
    </transition>
  </div>
</template>

<script>
import GridsLinesSubmenu from './GridsLinesSubmenu.vue'
import ConstellationsSubmenu from './ConstellationsSubmenu.vue'
import AtmosphereSubmenu from './AtmosphereSubmenu.vue'
import LabelsSubmenu from './LabelsSubmenu.vue'

export default {
  name: 'BottomMenuPanel',
  components: {
    GridsLinesSubmenu,
    ConstellationsSubmenu,
    AtmosphereSubmenu,
    LabelsSubmenu
  },
  data () {
    return {
      activeSubmenu: null,
      longPressTimer: null,
      longPressTriggered: false,
      longPressDuration: 500
    }
  },
  computed: {
    gridsLinesActive () {
      const stel = this.$store.state.stel
      return (stel?.lines?.ecliptic?.visible || stel?.lines?.azimuthal?.visible) || false
    },
    constellationsActive () {
      const stel = this.$store.state.stel
      return (stel?.constellations?.lines_visible || stel?.constellations?.labels_visible ||
              stel?.constellations?.images_visible) || false
    },
    landscapeVisible () {
      return this.$store.state.stel?.landscapes?.visible || false
    },
    atmosphereVisible () {
      return this.$store.state.stel?.atmosphere?.visible || false
    },
    labelsActive () {
      const stel = this.$store.state.stel
      // Use hints_visible to check if labels are shown (not object visibility)
      return (stel?.stars?.hints_visible || stel?.planets?.hints_visible ||
              stel?.dsos?.hints_visible || stel?.satellites?.hints_visible) || false
    },
    nightModeActive () {
      return this.$store.state.nightmode || false
    }
  },
  methods: {
    // Long press handling
    startLongPress (submenu) {
      this.longPressTriggered = false
      this.longPressTimer = setTimeout(() => {
        this.longPressTriggered = true
        this.activeSubmenu = submenu
      }, this.longPressDuration)
    },
    endPress (submenu, toggleFn) {
      this.cancelLongPress()
      // Only toggle if long press wasn't triggered
      if (!this.longPressTriggered) {
        toggleFn()
      }
    },
    cancelLongPress () {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },
    // Toggle Grids & Lines (ecliptic + azimuthal)
    toggleGridsLines () {
      const newVal = !this.gridsLinesActive
      if (this.$stel && this.$stel.core) {
        this.$stel.core.lines.ecliptic.visible = newVal
        this.$stel.core.lines.azimuthal.visible = newVal
      }
    },
    // Toggle Constellations (lines, labels, drawings, centered only)
    toggleConstellations () {
      const newVal = !this.constellationsActive
      if (this.$stel && this.$stel.core) {
        this.$stel.core.constellations.lines_visible = newVal
        this.$stel.core.constellations.labels_visible = newVal
        this.$stel.core.constellations.images_visible = newVal
      }
    },
    // Toggle Landscape
    toggleLandscape () {
      const newVal = !this.landscapeVisible
      if (this.$stel && this.$stel.core) {
        this.$stel.core.landscapes.visible = newVal
      }
    },
    // Toggle Atmosphere
    toggleAtmosphere () {
      const newVal = !this.atmosphereVisible
      if (this.$stel && this.$stel.core) {
        this.$stel.core.atmosphere.visible = newVal
      }
    },
    // Toggle Labels (hints_visible for stars, planets, dsos - NOT visibility to keep Sun visible)
    toggleLabels () {
      const newVal = !this.labelsActive
      if (this.$stel && this.$stel.core) {
        if (this.$stel.core.stars) this.$stel.core.stars.hints_visible = newVal
        if (this.$stel.core.planets) this.$stel.core.planets.hints_visible = newVal
        if (this.$stel.core.dsos) this.$stel.core.dsos.hints_visible = newVal
        if (this.$stel.core.satellites) this.$stel.core.satellites.hints_visible = newVal
      }
    },
    // Toggle Night Mode
    toggleNightMode () {
      this.$store.commit('toggleBool', 'nightmode')
      const b = this.$store.state.nightmode
      if (window.navigator.userAgent.indexOf('Edge') > -1) {
        document.getElementById('nightmode').style.opacity = b ? '0.5' : '0'
      }
      document.getElementById('nightmode').style.visibility = b ? 'visible' : 'hidden'
    }
  }
}
</script>

<style scoped>
.bottom-menu-panel {
  background: rgba(30, 30, 35, 0.95);
  border-radius: 16px 16px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-width: 400px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.15);
}

.menu-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s ease;
}

.menu-icon.active {
  color: #64b5f6;
}

.menu-label {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
