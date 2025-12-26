// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="filter-chips-bar">
    <div class="chips-container">
      <v-chip
        v-for="filter in activeFilters"
        :key="filter.id"
        close
        small
        class="filter-chip"
        color="rgba(100, 120, 200, 0.3)"
        text-color="white"
        @click:close="$emit('remove-filter', filter.id)"
      >
        <v-icon left small>{{ filter.icon }}</v-icon>
        {{ filter.label }}
      </v-chip>
      <v-btn
        small
        outlined
        class="add-filter-btn"
        color="rgba(150, 100, 150, 0.5)"
        @click="$emit('add-filter')"
      >
        <v-icon left small>mdi-plus</v-icon>
        Filter
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterChipsBar',
  props: {
    activeFilters: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.filter-chips-bar {
  padding: 8px 16px 12px 16px;
  background: transparent;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-chip {
  border-radius: 16px !important;
  font-size: 13px;
  height: 28px !important;
  background: rgba(100, 120, 200, 0.25) !important;
  border: 1px solid rgba(150, 170, 255, 0.3);
}

.filter-chip >>> .v-chip__close {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}

.add-filter-btn {
  border-radius: 16px !important;
  height: 28px !important;
  border: 1px solid rgba(180, 140, 200, 0.4) !important;
  text-transform: none;
  font-size: 13px;
  background: rgba(150, 100, 150, 0.15) !important;
}

.add-filter-btn >>> .v-btn__content {
  color: rgba(220, 180, 255, 0.9);
}
</style>
