// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="browse-view">
    <v-list dark class="browse-list">
      <v-list-item
        v-for="cat in categories"
        :key="cat.label"
        @click="$emit('select-category', cat)"
      >
        <v-list-item-icon>
          <v-icon>{{ cat.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ cat.label }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="cat.hasSub">
          <v-icon>mdi-chevron-right</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'BrowseView',
  props: {
    categories: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.browse-view {
  height: 100%;
}

.view-header {
  background: rgba(30, 40, 60, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.browse-list {
  background: transparent !important;
  padding: 0;
}

.v-list-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  min-height: 64px;
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
</style>
