// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <bottom-menu-submenu title="Constellations" subtitle="Constellations" @back="$emit('back')">
    <div class="constellations-content">
      <div class="toggle-grid">
        <div class="toggle-row">
          <v-switch v-model="linesVisible" dense hide-details color="primary" />
          <span class="toggle-label">Lines</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="labelsVisible" dense hide-details color="primary" />
          <span class="toggle-label">Labels</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="drawingsVisible" dense hide-details color="primary" />
          <span class="toggle-label">Drawings</span>
        </div>
        <div class="toggle-row">
          <v-switch v-model="boundariesVisible" dense hide-details color="primary" />
          <span class="toggle-label">Boundaries</span>
        </div>
      </div>
      <div class="toggle-row full-width">
        <v-switch v-model="centeredOnly" dense hide-details color="primary" />
        <span class="toggle-label">Centered only</span>
      </div>
    </div>
  </bottom-menu-submenu>
</template>

<script>
import BottomMenuSubmenu from './BottomMenuSubmenu.vue'

export default {
  name: 'ConstellationsSubmenu',
  components: { BottomMenuSubmenu },
  computed: {
    linesVisible: {
      get () { return this.$store.state.stel?.constellations?.lines_visible || false },
      set (v) { this.$stel.core.constellations.lines_visible = v }
    },
    labelsVisible: {
      get () { return this.$store.state.stel?.constellations?.labels_visible || false },
      set (v) { this.$stel.core.constellations.labels_visible = v }
    },
    drawingsVisible: {
      get () { return this.$store.state.stel?.constellations?.images_visible || false },
      set (v) { this.$stel.core.constellations.images_visible = v }
    },
    boundariesVisible: {
      get () { return this.$store.state.stel?.constellations?.bounds_visible || false },
      set (v) { this.$stel.core.constellations.bounds_visible = v }
    },
    centeredOnly: {
      get () { return false }, // TODO: Map to actual property when available
      set (v) { /* TODO: Implement when property is available */ }
    }
  }
}
</script>

<style scoped>
.constellations-content {
  padding: 8px 0;
}

.toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}

.toggle-row {
  display: flex;
  align-items: center;
}

.toggle-row.full-width {
  margin-top: 12px;
}

.toggle-label {
  font-size: 14px;
  color: white;
  margin-left: 8px;
}
</style>
