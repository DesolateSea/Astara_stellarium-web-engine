// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <bottom-menu-submenu title="Labels" subtitle="Labels" :in-settings="inSettings" @back="$emit('back')">
    <div class="labels-content">
      <div class="slider-row">
        <span class="slider-label">Stars</span>
        <v-slider
          v-model="starsLabels"
          :min="0"
          :max="10"
          step="1"
          color="primary"
          track-color="grey"
          hide-details
          class="slider"
        />
      </div>

      <div class="slider-row">
        <span class="slider-label">Solar System</span>
        <v-slider
          v-model="planetsLabels"
          :min="0"
          :max="10"
          step="1"
          color="primary"
          track-color="grey"
          hide-details
          class="slider"
        />
      </div>

      <div class="slider-row">
        <span class="slider-label">Deep sky</span>
        <v-slider
          v-model="dsosLabels"
          :min="0"
          :max="10"
          step="1"
          color="primary"
          track-color="grey"
          hide-details
          class="slider"
        />
      </div>

      <div class="slider-row">
        <span class="slider-label">Satellites</span>
        <v-slider
          v-model="satellitesLabels"
          :min="0"
          :max="10"
          step="1"
          color="primary"
          track-color="grey"
          hide-details
          class="slider"
        />
      </div>

      <div class="reset-row" @click="resetLabels">
        <v-icon small class="reset-icon">mdi-refresh</v-icon>
        <span class="reset-text">Reset</span>
      </div>
    </div>
  </bottom-menu-submenu>
</template>

<script>
import BottomMenuSubmenu from './BottomMenuSubmenu.vue'

export default {
  name: 'LabelsSubmenu',
  components: { BottomMenuSubmenu },
  props: {
    inSettings: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      defaultValues: {
        stars: 5,
        planets: 5,
        dsos: 5,
        satellites: 5
      }
    }
  },
  computed: {
    starsLabels: {
      get () {
        const sats = this.$store.state.stel?.stars
        if (!sats || !sats.visible) return 0
        return Math.round(sats.hints_mag_offset / 2 + 5)
      },
      set (v) {
        if (this.$stel && this.$stel.core && this.$stel.core.stars) {
          this.$stel.core.stars.visible = v > 0
          this.$stel.core.stars.hints_mag_offset = (v - 5) * 2
        }
      }
    },
    planetsLabels: {
      get () {
        const sats = this.$store.state.stel?.planets
        if (!sats || !sats.visible) return 0
        return Math.round(sats.hints_mag_offset / 2 + 5)
      },
      set (v) {
        if (this.$stel && this.$stel.core && this.$stel.core.planets) {
          this.$stel.core.planets.visible = v > 0
          this.$stel.core.planets.hints_mag_offset = (v - 5) * 2
        }
      }
    },
    dsosLabels: {
      get () {
        const sats = this.$store.state.stel?.dsos
        if (!sats || !sats.visible) return 0
        return Math.round(sats.hints_mag_offset / 2 + 5)
      },
      set (v) {
        if (this.$stel && this.$stel.core && this.$stel.core.dsos) {
          this.$stel.core.dsos.visible = v > 0
          this.$stel.core.dsos.hints_mag_offset = (v - 5) * 2
        }
      }
    },
    satellitesLabels: {
      get () {
        const sats = this.$store.state.stel?.satellites
        if (!sats || !sats.visible) return 0
        return Math.round(sats.hints_mag_offset / 3 + 5)
      },
      set (v) {
        if (this.$stel && this.$stel.core && this.$stel.core.satellites) {
          this.$stel.core.satellites.visible = v > 0
          this.$stel.core.satellites.hints_visible = v > 2
          this.$stel.core.satellites.hints_mag_offset = (v - 5) * 3
        }
      }
    }
  },
  methods: {
    resetLabels () {
      this.starsLabels = this.defaultValues.stars
      this.planetsLabels = this.defaultValues.planets
      this.dsosLabels = this.defaultValues.dsos
      this.satellitesLabels = this.defaultValues.satellites
    }
  }
}
</script>

<style scoped>
.labels-content {
  padding: 8px 0;
}

.slider-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.slider-label {
  font-size: 14px;
  color: white;
  min-width: 100px;
}

.slider {
  flex: 1;
  margin-left: 16px;
}

.reset-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.reset-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.reset-icon {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 8px;
}

.reset-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
