// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="landing-container">
    <div class="segmented-menu">
      <v-list dark class="segmented-list">
        <v-list-item @click="$emit('navigate', 'favorites')">
          <v-list-item-icon>
            <v-icon color="white">mdi-heart</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Favorites</v-list-item-title>
            <v-list-item-subtitle v-if="favoritesCount > 0" class="text-caption">
              {{ favoritesCount }} {{ favoritesCount === 1 ? 'item' : 'items' }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="segment-divider"></v-divider>

        <v-list-item @click="$emit('navigate', 'recents')">
          <v-list-item-icon>
            <v-icon color="white">mdi-history</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Recents</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="segment-divider"></v-divider>

        <v-list-item @click="$emit('navigate', 'browse')">
          <v-list-item-icon>
            <v-icon color="white">mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Browse</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-chevron-right</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingView',
  props: {
    favoritesCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.landing-container {
  padding-top: 16px;
  background: transparent;
}

.segmented-menu {
  background: rgb(58, 58, 58);
  backdrop-filter: blur(20px);
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.segmented-list {
  background: transparent !important;
  padding: 0;
}

.segment-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.segmented-list .v-list-item {
  border-bottom: none;
  transition: background 0.2s ease;
}
</style>

<style>
/* Override Vuetify defaults for transparent background */
.landing-container .v-list-item {
  background: transparent !important;
}

.landing-container .v-list-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}
</style>
