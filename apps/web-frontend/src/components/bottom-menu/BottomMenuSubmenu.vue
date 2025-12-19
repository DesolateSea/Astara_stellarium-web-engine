// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="bottom-menu-submenu">
    <div class="submenu-header">
      <v-btn icon @click="$emit('back')" class="back-btn">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="submenu-title-container">
        <div class="submenu-title">{{ title }}</div>
        <div class="submenu-subtitle" v-if="subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <div class="submenu-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomMenuSubmenu',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.bottom-menu-submenu {
  background: rgba(30, 30, 35, 0.95);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  width: 100%;
  max-width: 400px;
}

.submenu-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back-btn {
  margin-right: 8px;
  color: white !important;
}

.submenu-title-container {
  display: flex;
  flex-direction: column;
}

.submenu-title {
  font-size: 18px;
  font-weight: 500;
  color: white;
}

.submenu-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.submenu-content {
  padding: 8px 0;
}
</style>
