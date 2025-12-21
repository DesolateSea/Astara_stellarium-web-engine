// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <bottom-menu-submenu title="Grids & Lines" subtitle="Grids & Lines" @back="$emit('back')">
    <div class="grids-lines-content">
      <div class="column">
        <div class="column-title">Lines</div>
        <div class="toggle-row">
          <v-switch v-model="eclipticVisible" dense hide-details color="primary" />
          <span class="toggle-label">Ecliptic</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="meridianVisible" dense hide-details color="primary" />
          <span class="toggle-label">Meridian</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="celestialEquatorVisible" dense hide-details color="primary" />
          <span class="toggle-label">Celestial Equator</span>
        </div>
      </div>

      <div class="column">
        <div class="column-title">Grids</div>
        <div class="toggle-row">
          <v-switch v-model="azimuthalVisible" dense hide-details color="primary" />
          <span class="toggle-label">Azimuthal</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="equatorialVisible" dense hide-details color="primary" />
          <span class="toggle-label">Equatorial</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="equatorialJ2000Visible" dense hide-details color="primary" />
          <span class="toggle-label">Equatorial J2000</span>
        </div>
      </div>
    </div>
  </bottom-menu-submenu>
</template>

<script>
import BottomMenuSubmenu from './BottomMenuSubmenu.vue'

export default {
  name: 'GridsLinesSubmenu',
  components: { BottomMenuSubmenu },
  computed: {
    eclipticVisible: {
      get () { return this.$store.state.stel?.lines?.ecliptic?.visible || false },
      set (v) { this.$stel.core.lines.ecliptic.visible = v }
    },
    meridianVisible: {
      get () { return this.$store.state.stel?.lines?.meridian?.visible || false },
      set (v) { this.$stel.core.lines.meridian.visible = v }
    },
    celestialEquatorVisible: {
      get () { return this.$store.state.stel?.lines?.equator_line?.visible || false },
      set (v) { this.$stel.core.lines.equator_line.visible = v }
    },
    azimuthalVisible: {
      get () { return this.$store.state.stel?.lines?.azimuthal?.visible || false },
      set (v) { this.$stel.core.lines.azimuthal.visible = v }
    },
    equatorialVisible: {
      get () { return this.$store.state.stel?.lines?.equatorial_jnow?.visible || false },
      set (v) { this.$stel.core.lines.equatorial_jnow.visible = v }
    },
    equatorialJ2000Visible: {
      get () { return this.$store.state.stel?.lines?.equatorial?.visible || false },
      set (v) { this.$stel.core.lines.equatorial.visible = v }
    }
  }
}
</script>

<style scoped>
.grids-lines-content {
  display: flex;
  gap: 24px;
}

.column {
  flex: 1;
}

.column-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.toggle-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.toggle-label {
  font-size: 14px;
  color: white;
  margin-left: 8px;
}
</style>
