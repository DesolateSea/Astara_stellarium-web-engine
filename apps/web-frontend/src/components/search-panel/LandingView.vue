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
      <!-- Favorites -->
      <div class="menu-item" @click="$emit('navigate', 'favorites')">
        <div class="item-icon favorites-icon">
          <v-icon size="20">mdi-heart</v-icon>
        </div>
        <div class="item-content">
          <div class="item-title">Favorites</div>
          <div v-if="favoritesCount > 0" class="item-subtitle">
            {{ favoritesCount }} {{ favoritesCount === 1 ? 'item' : 'items' }}
          </div>
        </div>
      </div>

      <div class="item-divider"></div>

      <!-- Recents -->
      <div class="menu-item" @click="$emit('navigate', 'recents')">
        <div class="item-icon recents-icon">
          <v-icon size="20">mdi-history</v-icon>
        </div>
        <div class="item-content">
          <div class="item-title">Recents</div>
        </div>
      </div>

      <div class="item-divider"></div>

      <!-- Browse -->
      <div class="menu-item" @click="$emit('navigate', 'browse')">
        <div class="item-icon browse-icon">
          <v-icon size="20">mdi-format-list-bulleted</v-icon>
        </div>
        <div class="item-content">
          <div class="item-title">Browse</div>
        </div>
        <div class="item-action">
          <v-icon size="20" color="rgba(255,255,255,0.4)">mdi-chevron-right</v-icon>
        </div>
      </div>
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
  padding: 16px;
  background: transparent;
}

.segmented-menu {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* Menu Item - matches settings panel */
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Item Divider */
.item-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin-left: 56px;
}

/* Icon Containers - Subtle monochrome style matching settings */
.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
}

.favorites-icon {
  background: rgba(239, 83, 80, 0.15);
}
.favorites-icon .v-icon {
  color: #EF5350 !important;
}

.recents-icon {
  background: rgba(79, 195, 247, 0.15);
}
.recents-icon .v-icon {
  color: #4FC3F7 !important;
}

.browse-icon {
  background: rgba(144, 164, 174, 0.15);
}
.browse-icon .v-icon {
  color: #90A4AE !important;
}

/* Item Content */
.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
}

.item-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 1px;
}

/* Item Action */
.item-action {
  flex-shrink: 0;
  margin-left: 12px;
  display: flex;
  align-items: center;
}
</style>
