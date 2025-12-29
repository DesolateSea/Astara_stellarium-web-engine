// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="browse-view">
    <!-- Back button when viewing sub-categories -->
    <v-list-item v-if="parentCategory" :ripple="false" class="back-item" @click="goBack">
      <v-list-item-icon>
        <v-icon>mdi-arrow-left</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>{{ parentCategory.label }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list dark class="browse-list">
      <v-list-item
        v-for="cat in displayCategories"
        :key="cat.label"
        :ripple="false"
        @click="handleCategoryClick(cat)"
      >
        <v-list-item-icon>
          <v-icon>{{ cat.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ cat.label }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="cat.subCategories && cat.subCategories.length > 0" @click.stop="drillDown(cat)">
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
  },
  data () {
    return {
      currentSubCategories: null,
      parentCategory: null
    }
  },
  computed: {
    displayCategories () {
      return this.currentSubCategories || this.categories
    }
  },
  methods: {
    handleCategoryClick (cat) {
      // Select this category (either parent with all DSOs, or sub-category)
      this.$emit('select-category', cat)
    },
    drillDown (cat) {
      // Navigate into sub-categories
      if (cat.subCategories && cat.subCategories.length > 0) {
        this.parentCategory = cat
        this.currentSubCategories = cat.subCategories
      }
    },
    goBack () {
      this.parentCategory = null
      this.currentSubCategories = null
    }
  },
  watch: {
    categories: {
      immediate: true,
      handler () {
        // Reset when categories prop changes
        this.parentCategory = null
        this.currentSubCategories = null
      }
    }
  }
}
</script>

<style scoped>
.browse-view {
  height: 100%;
}

.back-item {
  background: rgba(50, 60, 80, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 56px;
}

.back-item .v-list-item-title {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
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
