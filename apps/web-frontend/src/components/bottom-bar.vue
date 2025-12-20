// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="bottom-bar-container">
    <!-- Left section: Menu trigger -->
    <div class="bottom-bar-left">
      <v-btn icon class="menu-trigger" @click="toggleMenuPanel">
        <v-icon>mdi-layers-outline</v-icon>
      </v-btn>
    </div>

    <!-- Center section: Compass -->
    <div class="bottom-bar-center">
      <div class="compass-container" :style="{ transform: 'rotate(' + (-azimuthDegrees) + 'deg)' }">
        <!-- Compass diamond pointer -->
        <div class="compass-pointer">
          <div class="pointer-north"></div>
          <div class="pointer-south"></div>
        </div>
        <!-- Cardinal directions -->
        <span class="compass-letter compass-n" :class="{ active: isNorth }">N</span>
        <span class="compass-letter compass-e" :class="{ active: isEast }">E</span>
        <span class="compass-letter compass-s" :class="{ active: isSouth }">S</span>
        <span class="compass-letter compass-w" :class="{ active: isWest }">W</span>
      </div>
    </div>

    <!-- Right section: Time -->
    <div class="bottom-bar-right" @click="showTimePicker = !showTimePicker">
      <div class="time-display">
        {{ time }}
      </div>
    </div>

    <!-- Floating menu panel -->
    <transition name="slide-up">
      <div class="menu-overlay" v-if="showMenuPanel" @click.self="closeMenu">
        <bottom-menu-panel
          v-if="currentSubmenu === null"
          @open-submenu="openSubmenu"
        />
        <grids-lines-submenu
          v-else-if="currentSubmenu === 'grids-lines'"
          @back="currentSubmenu = null"
        />
        <constellations-submenu
          v-else-if="currentSubmenu === 'constellations'"
          @back="currentSubmenu = null"
        />
        <atmosphere-submenu
          v-else-if="currentSubmenu === 'atmosphere'"
          @back="currentSubmenu = null"
        />
        <labels-submenu
          v-else-if="currentSubmenu === 'labels'"
          @back="currentSubmenu = null"
        />
      </div>
    </transition>

    <!-- Time picker dialog -->
    <v-dialog v-model="showTimePicker" max-width="400">
      <date-time-picker v-model="pickerDate" :location="$store.state.currentLocation"></date-time-picker>
    </v-dialog>
  </div>
</template>

<script>
import DateTimePicker from '@/components/date-time-picker.vue'
import BottomMenuPanel from '@/components/bottom-menu/BottomMenuPanel.vue'
import GridsLinesSubmenu from '@/components/bottom-menu/GridsLinesSubmenu.vue'
import ConstellationsSubmenu from '@/components/bottom-menu/ConstellationsSubmenu.vue'
import AtmosphereSubmenu from '@/components/bottom-menu/AtmosphereSubmenu.vue'
import LabelsSubmenu from '@/components/bottom-menu/LabelsSubmenu.vue'
import Moment from 'moment'

export default {
  components: {
    DateTimePicker,
    BottomMenuPanel,
    GridsLinesSubmenu,
    ConstellationsSubmenu,
    AtmosphereSubmenu,
    LabelsSubmenu
  },
  data: function () {
    return {
      showMenuPanel: false,
      currentSubmenu: null,
      showTimePicker: false
    }
  },
  computed: {
    time: {
      get: function () {
        return this.getLocalTime().format('HH:mm')
      }
    },
    date: {
      get: function () {
        return this.getLocalTime().format('YYYY-MM-DD')
      }
    },
    pickerDate: {
      get: function () {
        const t = this.getLocalTime()
        t.milliseconds(0)
        return t.format()
      },
      set: function (v) {
        const m = Moment(v)
        m.local()
        m.milliseconds(this.getLocalTime().milliseconds())
        this.$stel.core.observer.utc = m.toDate().getMJD()
      }
    },
    // Azimuth in degrees (0-360), 0 = North, 90 = East, 180 = South, 270 = West
    azimuthDegrees: function () {
      const yaw = this.$store.state.stel?.observer?.yaw || 0
      // Convert radians to degrees and normalize to 0-360
      let degrees = (yaw * 180 / Math.PI) % 360
      if (degrees < 0) degrees += 360
      return degrees
    },
    // Direction detection (within 45 degrees of each cardinal direction)
    isNorth: function () {
      const az = this.azimuthDegrees
      return az >= 315 || az < 45
    },
    isEast: function () {
      const az = this.azimuthDegrees
      return az >= 45 && az < 135
    },
    isSouth: function () {
      const az = this.azimuthDegrees
      return az >= 135 && az < 225
    },
    isWest: function () {
      const az = this.azimuthDegrees
      return az >= 225 && az < 315
    }
  },
  methods: {
    getLocalTime: function () {
      var d = new Date()
      d.setMJD(this.$store.state.stel.observer.utc)
      const m = Moment(d)
      m.local()
      return m
    },
    toggleMenuPanel () {
      this.showMenuPanel = !this.showMenuPanel
      if (!this.showMenuPanel) {
        this.currentSubmenu = null
      }
    },
    closeMenu () {
      this.showMenuPanel = false
      this.currentSubmenu = null
    },
    openSubmenu (submenuName) {
      this.currentSubmenu = submenuName
    }
  }
}
</script>

<style scoped>
.bottom-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 24px;
  padding-bottom: 32px;
  pointer-events: none;
}

.bottom-bar-left,
.bottom-bar-center,
.bottom-bar-right {
  pointer-events: auto;
}

.bottom-bar-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.bottom-bar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.bottom-bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.menu-trigger {
  background: transparent !important;
  color: white !important;
  width: 56px !important;
  height: 56px !important;
}

.menu-trigger .v-icon {
  font-size: 36px !important;
}

.compass-container {
  position: relative;
  width: 60px;
  height: 60px;
  transition: transform 0.1s ease-out;
}

.compass-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
}

.pointer-north {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid rgba(255, 255, 255, 0.8);
}

.pointer-south {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.4);
}

.compass-letter {
  position: absolute;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;
}

.compass-letter.active {
  color: #ff6b6b;
  font-weight: 700;
}

.compass-n {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.compass-e {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.compass-s {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.compass-w {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.time-display {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.menu-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.3);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
