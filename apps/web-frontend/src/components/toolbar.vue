// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div id="toolbar-image">
    <v-toolbar class="transparent" dense flat>
      <v-btn icon @click="openSettings" class="menu-btn">
        <v-icon size="28">mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="openSearch" class="search-btn">
        <v-icon size="28">mdi-magnify</v-icon>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  data: function () {
    return {}
  },
  methods: {
    openSettings: function () {
      this.$store.commit('setValue', { varName: 'showSettingsPanel', newValue: true })
    },
    openSearch: function () {
      this.$store.commit('setValue', { varName: 'showSearchPanel', newValue: true })
    }
  }
}
</script>

<style>
#toolbar-image {
  background: transparent;
  height: 56px;
  z-index: 10;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  padding-top: env(safe-area-inset-top, 24px);
}

#toolbar-image .v-toolbar {
  background: transparent !important;
}

.menu-btn, .search-btn {
  color: white !important;
}
</style>
