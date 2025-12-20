// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="dialogVisible" transition="dialog-top-transition" content-class="search-dialog">
    <v-card v-if="dialogVisible" class="search-panel">
      <!-- Header with back arrow and search field -->
      <div class="search-header">
        <v-btn icon @click="closePanel" class="back-btn">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-text-field
          ref="searchInput"
          v-model="searchText"
          placeholder="Search"
          hide-details
          single-line
          dense
          class="search-input"
          @keyup.native.esc="closePanel"
        ></v-text-field>
      </div>

      <!-- Search Results -->
      <v-list v-if="searchText && autoCompleteChoices.length > 0" dense class="search-results">
        <v-list-item v-for="source in autoCompleteChoices" :key="source.names[0]" @click="sourceClicked(source)">
          <v-list-item-action>
            <img :src="iconForSkySource(source)" width="24" height="24"/>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ nameForSkySource(source) }}</v-list-item-title>
            <v-list-item-subtitle>{{ typeToName(source.types[0]) }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Categories when not searching -->
      <v-list v-else dense class="category-list">
        <v-list-item @click="showFavorites">
          <v-list-item-icon>
            <v-icon color="grey">mdi-heart</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Favorites</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="showRecents">
          <v-list-item-icon>
            <v-icon color="grey">mdi-history</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Recents</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="showBrowse">
          <v-list-item-icon>
            <v-icon color="grey">mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Browse</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-chevron-right</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
import swh from '@/assets/sw_helpers.js'
import _ from 'lodash'

export default {
  data: function () {
    return {
      searchText: '',
      autoCompleteChoices: [],
      lastQuery: undefined
    }
  },
  computed: {
    dialogVisible: {
      get: function () {
        return this.$store.state.showSearchPanel
      },
      set: function (val) {
        this.$store.commit('setValue', { varName: 'showSearchPanel', newValue: val })
      }
    }
  },
  watch: {
    dialogVisible: function (val) {
      if (val) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus()
          }
        })
      } else {
        this.searchText = ''
        this.autoCompleteChoices = []
      }
    },
    searchText: function () {
      if (this.searchText === '') {
        this.autoCompleteChoices = []
        this.lastQuery = undefined
        return
      }
      this.refresh()
    }
  },
  methods: {
    closePanel: function () {
      this.dialogVisible = false
    },
    sourceClicked: function (source) {
      let obj = swh.skySource2SweObj(source)
      if (!obj) {
        obj = this.$stel.createObj(source.model, source)
        this.$selectionLayer.add(obj)
      }
      if (obj) {
        swh.setSweObjAsSelection(obj)
      }
      this.closePanel()
    },
    showFavorites: function () {
      console.log('Show favorites')
    },
    showRecents: function () {
      console.log('Show recents')
    },
    showBrowse: function () {
      console.log('Show browse')
    },
    refresh: _.debounce(function () {
      var that = this
      let str = that.searchText
      str = str.toUpperCase()
      str = str.replace(/\s+/g, '')
      if (this.lastQuery === str) {
        return
      }
      this.lastQuery = str
      swh.querySkySources(str, 10).then(results => {
        if (str !== that.lastQuery) {
          return
        }
        that.autoCompleteChoices = results
      }, err => { console.log(err) })
    }, 200),
    nameForSkySource: function (s) {
      const cn = swh.cleanupOneSkySourceName(s.match)
      const n = swh.nameForSkySource(s)
      if (cn === n) {
        return n
      } else {
        return cn + ' (' + n + ')'
      }
    },
    typeToName: function (t) {
      return swh.nameForSkySourceType(t)
    },
    iconForSkySource: function (s) {
      return swh.iconForSkySource(s)
    }
  }
}
</script>

<style scoped>
.search-panel {
  background: rgba(30, 30, 30, 0.98) !important;
  padding-top: env(safe-area-inset-top, 32px);
  border-radius: 0 0 16px 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 12px 8px 12px 4px;
  background: rgba(50, 50, 50, 0.9);
  border-radius: 8px;
  margin: 16px 16px 8px 16px;
}

.back-btn {
  color: white !important;
}

.search-input {
  flex: 1;
  margin-left: 8px;
}

.search-input >>> .v-input__slot {
  background: transparent !important;
}

.search-input >>> input {
  color: white !important;
}

.search-input >>> input::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

.category-list {
  background: rgba(40, 40, 40, 0.95) !important;
  margin: 8px 16px 16px 16px;
  border-radius: 12px;
}

.category-list .v-list-item {
  min-height: 56px;
}

.search-results {
  background: transparent !important;
  max-height: 40vh;
  overflow-y: auto;
  margin: 0 16px 16px 16px;
}
</style>

<style>
/* Global styles for dialog positioning */
.search-dialog {
  align-self: flex-start !important;
  margin: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
}
</style>
