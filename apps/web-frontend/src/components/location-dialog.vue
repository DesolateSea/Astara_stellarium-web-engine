// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
<v-dialog
  max-width="600"
  v-model="$store.state.showLocationDialog"
  fullscreen
  transition="dialog-bottom-transition"
>
  <v-card v-if="$store.state.showLocationDialog" class="location-dialog-card">
    <!-- Header -->
    <v-toolbar dark flat class="location-header">
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('Location') }}</v-toolbar-title>
    </v-toolbar>

    <!-- Auto Location Toggle -->
    <div class="auto-location-section">
      <div class="auto-location-row">
        <span class="auto-location-label">{{ $t('Use autolocation') }}</span>
        <v-switch
          v-model="useAutoLocation"
          hide-details
          class="auto-location-switch"
          color="primary"
        ></v-switch>
      </div>
    </div>

    <!-- Location Manager Component -->
    <div class="location-content">
      <location-mgr
        v-on:locationSelected="setLocation"
        v-on:manualLocationSelected="disableAutoLocation"
        :knownLocations="[]"
        :startLocation="$store.state.currentLocation"
        :realLocation="$store.state.autoDetectedLocation"
      ></location-mgr>
    </div>
  </v-card>
</v-dialog>
</template>

<script>
import LocationMgr from '@/components/location-mgr.vue'

export default {
  data: function () {
    return {
    }
  },
  computed: {
    useAutoLocation: {
      get: function () {
        return this.$store.state.useAutoLocation
      },
      set: function (b) {
        this.$store.commit('setUseAutoLocation', b)
      }
    }
  },
  mounted: function () {
  },
  methods: {
    setLocation: function (loc) {
      this.$store.commit('setCurrentLocation', loc)
      this.$store.commit('toggleBool', 'showLocationDialog')
    },
    closeDialog: function () {
      this.$store.commit('toggleBool', 'showLocationDialog')
    },
    disableAutoLocation: function () {
      this.$store.commit('setUseAutoLocation', false)
    }
  },
  watch: {
    '$store.state.showLocationDialog': function (newVal) {
      if (newVal) {
        // Clear selected object when location dialog opens
        this.$store.commit('setSelectedObject', undefined)
      }
    }
  },
  components: { LocationMgr }
}
</script>

<style scoped>
.location-dialog-card {
  background: #1a1a2e !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.location-header {
  background: #2d2d44 !important;
  flex: 0 0 auto;
}

.location-header .v-toolbar__title {
  font-size: 18px;
  font-weight: 500;
}

.auto-location-section {
  background: #2d2d44;
  padding: 0;
  flex: 0 0 auto;
}

.auto-location-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.auto-location-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.auto-location-switch {
  margin: 0 !important;
  padding: 0 !important;
}

.location-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* Ensure the location manager fills the space */
.location-content >>> .location-picker {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.location-content >>> .map-container {
  flex: 1;
  min-height: 250px;
}
</style>
