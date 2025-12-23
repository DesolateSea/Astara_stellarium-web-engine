// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <bottom-menu-submenu title="Atmosphere" subtitle="Atmosphere" :in-settings="inSettings" @back="$emit('back')">
    <div class="atmosphere-content">
      <div class="slider-section">
        <div class="slider-label">Light Pollution</div>
        <v-slider
          v-model="lightPollution"
          :min="1"
          :max="9"
          step="1"
          thumb-label
          color="primary"
          track-color="grey"
          hide-details
        />
        <div class="slider-value">{{ lightPollutionDescription }}</div>
      </div>

      <div class="toggle-row">
        <v-switch v-model="fogVisible" dense hide-details color="primary" />
        <span class="toggle-label">Fog</span>
      </div>
    </div>
  </bottom-menu-submenu>
</template>

<script>
import BottomMenuSubmenu from './BottomMenuSubmenu.vue'

export default {
  name: 'AtmosphereSubmenu',
  components: { BottomMenuSubmenu },
  props: {
    inSettings: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    lightPollution: {
      get () {
        // Get bortle_index from the engine (1-9 scale)
        return this.$store.state.stel?.bortle_index || 1
      },
      set (v) {
        // Set the bortle_index on the engine
        if (this.$stel && this.$stel.core) {
          this.$stel.core.bortle_index = v
        }
      }
    },
    fogVisible: {
      get () { return this.$store.state.stel?.atmosphere?.visible || false },
      set (v) { this.$stel.core.atmosphere.visible = v }
    },
    lightPollutionDescription () {
      const descriptions = [
        '',
        '1: Excellent dark-sky site',
        '2: Typical dark site',
        '3: Rural sky',
        '4: Rural/suburban transition',
        '5: Suburban sky',
        '6: Bright suburban sky',
        '7: Suburban/urban transition',
        '8: City sky',
        '9: Inner-city sky'
      ]
      return descriptions[this.lightPollution] || ''
    }
  }
}
</script>

<style scoped>
.atmosphere-content {
  padding: 8px 0;
}

.slider-section {
  margin-bottom: 20px;
}

.slider-label {
  font-size: 14px;
  color: white;
  margin-bottom: 8px;
}

.slider-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 4px;
}

.toggle-row {
  display: flex;
  align-items: center;
}

.toggle-label {
  font-size: 14px;
  color: white;
  margin-left: 8px;
}
</style>
