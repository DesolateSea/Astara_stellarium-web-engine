// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog :value="visible" @input="$emit('update:visible', $event)" max-width="500" content-class="filter-dialog">
    <v-card dark class="filter-selection-card">
      <v-card-title class="text-h6">
        <v-icon left>mdi-filter-variant</v-icon>
        Add Filter
        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('update:visible', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-list dark>
          <v-list-item
            v-for="cat in categories"
            :key="cat.label"
            @click="$emit('select-category', cat)"
            :disabled="isFilterActive(cat)"
          >
            <v-list-item-icon>
              <v-icon>{{ cat.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ cat.label }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action v-if="isFilterActive(cat)">
              <v-icon color="success">mdi-check</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'FilterDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    categories: {
      type: Array,
      required: true
    },
    activeFilters: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    isFilterActive (category) {
      return this.activeFilters.some(f => f.label === category.label)
    }
  }
}
</script>

<style scoped>
.filter-selection-card {
  background: rgba(30, 40, 60, 0.95) !important;
  backdrop-filter: blur(20px);
}
</style>

<style>
.filter-dialog {
  background: transparent !important;
}
</style>
