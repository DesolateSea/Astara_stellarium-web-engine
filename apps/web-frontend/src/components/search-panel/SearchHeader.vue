// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="search-header">
    <v-btn icon @click="$emit('back')" class="back-btn">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-text-field
      v-if="showSearchInput"
      ref="searchInput"
      :value="searchText"
      @input="$emit('update:searchText', $event)"
      placeholder="Search"
      hide-details
      single-line
      dense
      class="search-input"
      @keyup.native.enter="$emit('search')"
      @keyup.native.esc="$emit('close')"
    ></v-text-field>
    <v-btn icon v-if="searchText" @click="$emit('update:searchText', '')" class="clear-btn">
      <v-icon small color="grey darken-1">mdi-close-circle</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SearchHeader',
  props: {
    searchText: {
      type: String,
      default: ''
    },
    showSearchInput: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    focus () {
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus()
        }
      })
    }
  }
}
</script>

<style scoped>
.search-header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: rgb(58, 58, 58) !important;
  height: 46px;
  border-radius: 10px;
  gap: 8px;
}

.back-btn {
  color: white !important;
  flex-shrink: 0;
}

.clear-btn {
  flex-shrink: 0;
}

/* Light colored search input - key feature */
.search-input {
  flex: 1;
  border-radius: 0;
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
</style>
