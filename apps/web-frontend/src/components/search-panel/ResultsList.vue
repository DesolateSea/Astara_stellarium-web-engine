// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="results-view">
    <!-- Empty State -->
    <div v-if="items.length === 0 && !loading" class="empty-state">
      <v-icon size="64" color="grey darken-2">{{ emptyIcon }}</v-icon>
      <p class="grey--text mt-4">{{ emptyMessage }}</p>
      <p v-if="emptySubtext" class="text-caption grey--text text--darken-1">{{ emptySubtext }}</p>
    </div>

    <!-- Results List -->
    <v-list dark class="results-list" v-else>
      <div v-if="items.length === 0 && loading" class="text-center mt-5 grey--text">
        Loading...
      </div>
      <template v-for="(item, index) in items">
        <v-subheader v-if="item.header" :key="'header-'+item.text" class="text-uppercase text-caption font-weight-bold grey--text text--lighten-1">
          {{ item.text }}
        </v-subheader>
        <div v-else :key="getItemKey(item, index)">
          <v-list-item :ripple="false" @click="$emit('select-item', item)">
            <v-list-item-action>
              <img :src="getIcon(item)" width="24" height="24"/>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">{{ getName(item) }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption visibility-text">
                {{ getSubtitle(item) }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon small :ripple="false" @click.stop="$emit('toggle-favorite', item)">
                <v-icon :color="isFavorite(item) ? 'red lighten-1' : 'grey darken-1'">
                  {{ isFavorite(item) ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
        </div>
      </template>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'ResultsList',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyIcon: {
      type: String,
      default: 'mdi-magnify'
    },
    emptyMessage: {
      type: String,
      default: 'No results found'
    },
    emptySubtext: {
      type: String,
      default: ''
    },
    favorites: {
      type: Array,
      default: () => []
    },
    // Helper functions passed as props
    getIcon: {
      type: Function,
      required: true
    },
    getName: {
      type: Function,
      required: true
    },
    getSubtitle: {
      type: Function,
      required: true
    }
  },
  methods: {
    getItemKey (item, index) {
      // Create unique key from name + model + type
      const name = (item.names && item.names[0]) || item.match || index
      const model = item.model || 'unknown'
      const type = (item.types && item.types[0]) || 'unknown'
      return name + '-' + model + '-' + type
    },
    isFavorite (item) {
      return this.favorites.some(fav =>
        (fav.names && item.names && fav.names[0] === item.names[0]) ||
        (fav.model_data && item.model_data && fav.model_data.norad_number && fav.model_data.norad_number === item.model_data.norad_number)
      )
    }
  }
}
</script>

<style scoped>
.results-view {
  height: 100%;
}

.results-list {
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

.visibility-text {
  color: rgba(130, 170, 255, 0.8) !important;
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}
</style>
