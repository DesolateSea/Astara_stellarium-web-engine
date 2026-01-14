// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="dialogVisible" transition="dialog-top-transition" :content-class="searchDialogClass" fullscreen hide-overlay>
    <v-card v-if="dialogVisible" class="search-panel" @click.self="goBack">
      <!-- Search Header Component -->
      <search-header
        ref="searchHeader"
        :search-text.sync="searchText"
        :show-search-input="true"
        @back="goBack"
        @close="closePanel"
        @search="performSearch"
      />

      <!-- Filter Chips Bar Component -->
      <filter-chips-bar
        v-if="currentView === 'results' && searchFromView !== 'favorites'"
        :active-filters="activeFilters"
        @remove-filter="removeFilter"
        @add-filter="navigateToView('browse')"
      />

      <!-- Content Area -->
      <div class="content-area" @click.self="goBack">
        <!-- Landing View Component -->
        <landing-view
          v-if="currentView === 'landing'"
          :favorites-count="favourites.length"
          @navigate="navigateToView"
        />

        <!-- Browse View Component -->
        <browse-view
          v-else-if="currentView === 'browse'"
          :categories="browseCategories"
          @select-category="selectBrowseCategory"
        />

        <!-- Favorites View Component -->
        <results-list
          v-else-if="currentView === 'favorites'"
          :items="favourites"
          :loading="false"
          :favorites="favourites"
          :get-icon="iconForSkySource"
          :get-name="nameForSkySource"
          :get-subtitle="getVisibilityString"
          empty-icon="mdi-heart-outline"
          empty-message="No favorites yet"
          empty-subtext="Tap the heart icon on any object to add it here"
          @select-item="sourceClicked"
          @toggle-favorite="toggleFavourite"
        />

        <!-- Recents View Component -->
        <results-list
          v-else-if="currentView === 'recents'"
          :items="recents"
          :loading="false"
          :favorites="favourites"
          :get-icon="iconForSkySource"
          :get-name="nameForSkySource"
          :get-subtitle="getVisibilityString"
          empty-icon="mdi-history"
          empty-message="No recent searches"
          @select-item="sourceClicked"
          @toggle-favorite="toggleFavourite"
        />

        <!-- Search Results View Component -->
        <results-list
          v-else-if="currentView === 'results'"
          :items="filteredResults"
          :loading="loading"
          :favorites="favourites"
          :get-icon="iconForSkySource"
          :get-name="nameForSkySource"
          :get-subtitle="getVisibilityString"
          empty-icon="mdi-magnify"
          empty-message="No results found"
          @select-item="sourceClicked"
          @toggle-favorite="toggleFavourite"
        />
      </div>

      <!-- Filter Dialog Component -->
      <filter-dialog
        :visible.sync="showFilterDialog"
        :categories="browseCategories"
        :active-filters="activeFilters"
        @select-category="addFilter"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import swh from '@/assets/sw_helpers.js'
import _ from 'lodash'
import SearchHeader from './search-panel/SearchHeader.vue'
import FilterChipsBar from './search-panel/FilterChipsBar.vue'
import LandingView from './search-panel/LandingView.vue'
import BrowseView from './search-panel/BrowseView.vue'
import ResultsList from './search-panel/ResultsList.vue'
import FilterDialog from './search-panel/FilterDialog.vue'

export default {
  components: {
    SearchHeader,
    FilterChipsBar,
    LandingView,
    BrowseView,
    ResultsList,
    FilterDialog
  },
  data: function () {
    return {
      searchText: '',
      currentView: 'landing', // landing, browse, favorites, recents, results
      autoCompleteChoices: [],
      lastQuery: undefined,
      loading: false,
      showFilterDialog: false,
      activeFilters: [],
      browseCategories: [
        { label: 'Planet', icon: 'mdi-earth', typeFilter: { planets: true } },
        { label: 'Star', icon: 'mdi-star-four-points', typeFilter: { stars: true } },
        // DSO with sub-categories (clicking arrow expands, clicking main selects all DSOs)
        {
          label: 'Deep Sky Object',
          icon: 'mdi-weather-night',
          typeFilter: { dsos: true },
          subCategories: [
            { label: 'Galaxy', icon: 'mdi-blur', typeFilter: { dsoGalaxies: true } },
            { label: 'Nebula', icon: 'mdi-cloud', typeFilter: { dsoNebulae: true } },
            { label: 'Star Cluster', icon: 'mdi-google-circles-extended', typeFilter: { dsoClusters: true } },
            { label: 'Other DSO', icon: 'mdi-orbit', typeFilter: { dsoOther: true } }
          ]
        },
        { label: 'Artificial Satellite', icon: 'mdi-satellite-uplink', typeFilter: { satellites: true } },
        { label: 'Constellation', icon: 'mdi-vector-polyline', typeFilter: { constellations: true } },
        { label: 'Minor Planet', icon: 'mdi-chart-bubble', typeFilter: { minorPlanets: true } },
        { label: 'Comet', icon: 'mdi-weather-windy-variant', typeFilter: { comets: true } }
      ],
      searchFromView: null
    }
  },
  computed: {
    searchDialogClass () {
      return this.currentView === 'landing' ? 'search-dialog search-dialog-transparent' : 'search-dialog search-dialog-black'
    },
    dialogVisible: {
      get: function () {
        return this.$store.state.showSearchPanel
      },
      set: function (val) {
        this.$store.commit('setValue', { varName: 'showSearchPanel', newValue: val })
      }
    },
    favourites () {
      return this.$store.state.favourites || []
    },
    recents () {
      return this.$store.state.recents || []
    },

    filteredResults () {
      if (this.activeFilters.length === 0) return this.autoCompleteChoices
      return this.autoCompleteChoices.filter(item => this.matchesFilters(item))
    }
  },
  watch: {
    dialogVisible: function (val) {
      if (val) {
        this.$nextTick(() => {
          if (this.$refs.searchHeader) {
            this.$refs.searchHeader.focus()
          }
        })
        this.currentView = 'landing'
        this.searchFromView = null
        this.searchText = ''
        this.activeFilters = []
      } else {
        this.searchText = ''
        this.autoCompleteChoices = []
        this.activeFilters = []
        this.searchFromView = null
      }
    },
    searchText: function (val) {
      if (val && val.length > 0) {
        if (this.currentView !== 'results') {
          this.searchFromView = this.currentView
        }
        this.currentView = 'results'
        this.refresh()
      } else if (this.currentView === 'results') {
        // If user clears text while in results, go back to previous view or landing
        // UNLESS we have active filters (browsing mode)
        if (this.activeFilters.length === 0) {
          this.currentView = this.searchFromView || 'landing'
          this.searchFromView = null
        } else {
          this.refresh()
        }
      }
    }
  },
  methods: {
    navigateToView (viewName) {
      this.currentView = viewName
    },
    goBack () {
      if (this.currentView === 'landing') {
        this.closePanel()
      } else {
        this.currentView = 'landing'
        this.searchText = ''
        this.activeFilters = []
      }
    },
    closePanel () {
      this.dialogVisible = false
    },
    toggleFavourite (source) {
      this.$store.commit('toggleFavourite', source)
    },
    addFilter (category) {
      // Single selection mode
      this.activeFilters = [{
        id: Date.now(),
        label: category.label,
        icon: category.icon,
        typeFilter: category.typeFilter
      }]
      this.showFilterDialog = false
    },
    removeFilter (filterId) {
      this.activeFilters = this.activeFilters.filter(f => f.id !== filterId)
    },
    isFilterActive (category) {
      return this.activeFilters.some(f => f.label === category.label)
    },
    matchesFilters (item) {
      if (item.header) return true
      // If no filters, show all
      if (this.activeFilters.length === 0) return true

      // Item must match at least one filter
      return this.activeFilters.some(filter => {
        const typeFilter = filter.typeFilter
        // Check if item matches the filter criteria
        if (typeFilter.planets && (item.types.includes('Pla') || item.types.includes('Sun') || item.types.includes('Moo'))) {
          return true
        }
        if (typeFilter.stars && item.types.includes('*')) {
          return true
        }
        // DSO Sub-category filters
        const galaxyTypes = ['G', 'GiG', 'GiP', 'LIN', 'EmG', 'rG', 'GiC', 'IG', 'AGN', 'BiC', 'LSB', 'H2G', 'Sy1', 'Sy2', 'SyG', 'SBG', 'PaG', 'bCG', 'PoG', 'GrG', 'Gal']
        const nebulaTypes = ['Neb', 'PN', 'RNe', 'BNe', 'GNe', 'HII', 'SNR', 'ISM', 'SFR', 'Cld', 'EmO']
        const clusterTypes = ['OpC', 'GlC', 'Cl*', 'PoC', 'As*', 'MGr']
        const otherDsoTypes = ['dso', 'QSO', 'Q?', 'Bla', 'BLL', 'MoC', 'C?*', 'HH', 'sh', 'CGb', 'cor', 'reg']

        if (typeFilter.dsoGalaxies && item.types.some(t => galaxyTypes.includes(t))) {
          return true
        }
        if (typeFilter.dsoNebulae && item.types.some(t => nebulaTypes.includes(t))) {
          return true
        }
        if (typeFilter.dsoClusters && item.types.some(t => clusterTypes.includes(t))) {
          return true
        }
        if (typeFilter.dsoOther && item.types.some(t => otherDsoTypes.includes(t))) {
          return true
        }
        // Backwards compatibility: dsos: true matches all DSO types
        if (typeFilter.dsos) {
          const allDsoTypes = [...galaxyTypes, ...nebulaTypes, ...clusterTypes, ...otherDsoTypes]
          if (item.types.some(t => allDsoTypes.includes(t))) {
            return true
          }
        }
        if (typeFilter.satellites && item.model === 'tle_satellite') {
          return true
        }
        if (typeFilter.constellations && item.types.includes('Con')) {
          return true
        }
        if (typeFilter.comets && item.types.includes('Com')) {
          return true
        }
        if (typeFilter.minorPlanets && (item.types.includes('MPl') || item.types.includes('Asteroid'))) {
          return true
        }

        return false
      })
    },
    selectBrowseCategory (cat) {
      // Add this category as a filter and switch to results view
      this.addFilter(cat)
      this.currentView = 'results'
      // Trigger a search with empty string to show all items of this type
      if (!this.searchText) {
        this.searchText = ' '
        this.$nextTick(() => {
          this.searchText = ''
        })
      }
    },
    performSearch () {
      // Triggered on Enter
    },
    async sourceClicked (source) {
      const $stel = this.$stel
      if (!$stel) {
        this.closePanel()
        return
      }

      // Add to recents
      this.$store.commit('addToRecents', source)

      // For constellations, check if we need to switch skyculture
      let cultureSwitched = false
      if (source.model === 'constellation' && source.model_data && source.model_data.culture) {
        const targetCulture = source.model_data.culture
        const currentCulture = $stel.core.skycultures.current_id

        if (targetCulture !== currentCulture) {
          // Switch to the constellation's culture
          const baseUrl = '/'
          $stel.core.skycultures.addDataSource({ url: baseUrl + 'skydata/skycultures/' + targetCulture, key: targetCulture })
          $stel.core.skycultures.current_id = targetCulture
          localStorage.setItem('stellarium-skyculture', targetCulture)
          // Update store for reactive tracking
          this.$store.commit('setCurrentSkyCultureId', targetCulture)
          cultureSwitched = true
        }
      }

      // Use swh helper to resolve the object
      let obj = swh.skySource2SweObj(source)
      // If culture was switched and object not found, retry with delays
      if (!obj && cultureSwitched) {
        for (let attempt = 0; attempt < 10; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          obj = swh.skySource2SweObj(source)
          if (obj) break
        }
      }

      if (obj) {
        $stel.core.selection = obj

        // In gyro mode: don't center, just set as target for direction overlay
        if (this.$store.state.gyroModeActive) {
          this.$store.commit('setGyroTargetObject', obj)
        } else {
          // Normal mode: center on object
          $stel.pointAndLock(obj)
        }
      } else {
        console.warn('Could not resolve object for:', source)
      }

      this.closePanel()
    },
    getVisibilityString (item) {
      // Placeholder for visibility calculation shown in screenshot (e.g. "Visible from 21:06 to 06:06")
      // This requires complex astronomical calculation.
      // For now returning type or generic info.
      return this.typeToName(item.types[0])
    },
    refresh: _.debounce(function () {
      var that = this
      let str = that.searchText || ''
      str = str.toUpperCase()
      str = str.replace(/\s+/g, '')

      if (this.lastQuery === str) {
        return
      }
      this.lastQuery = str
      this.loading = true

      let options = {}
      if (that.searchFromView === 'favorites') {
        options = { favouritesList: that.favourites }
      }
      // Search all with favourites priority only if configured
      swh.querySkySources(str, 20, options).then(results => {
        if (str !== that.lastQuery) {
          return
        }
        that.autoCompleteChoices = results
        that.loading = false
      }, _err => {
        // Search failed silently (error intentionally not logged)
        that.loading = false
      })
    }, 200),
    nameForSkySource (s) {
      const n = swh.nameForSkySource(s)
      if (!s.match) return n
      const cn = swh.cleanupOneSkySourceName(s.match)
      if (cn === n) {
        return n
      } else {
        return cn + ' (' + n + ')'
      }
    },
    typeToName (t) {
      return swh.nameForSkySourceType(t)
    },
    iconForSkySource (s) {
      return swh.iconForSkySource(s)
    }
  }
}
</script>

<style scoped>
.search-panel {
  background: transparent !important;
  padding-top: 33px !important;
  border-radius: 20px !important;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  min-height: 60px;
}

.back-btn {
  color: white !important;
  margin-right: 8px;
}

.clear-btn {
  margin-left: 4px;
}

/* Light colored search input - key feature */
.search-input {
  background: rgba(130, 140, 170, 0.25) !important; /* Light grayish-blue background */
  border-radius: 20px; /* More rounded like in the reference */
  padding: 0 16px;
}

.search-input >>> .v-input__slot {
  margin-bottom: 0;
  background: transparent !important;
}

.search-input >>> .v-input__slot:before,
.search-input >>> .v-input__slot:after {
  display: none !important;
}

.search-input >>> input {
  color: white !important;
  padding: 10px 0;
}

.search-input >>> input::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Filter Chips Bar */
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

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-panel >>> .v-ripple__container {
  display: none !important;
}
</style>

<style>
.search-dialog-transparent {
  background: transparent !important;
  box-shadow: none !important;
}
.search-dialog-black {
  background: rgb(23, 23, 23) !important;
}
</style>
