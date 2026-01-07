// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <bottom-menu-submenu title="Landscape" subtitle="Select landscape" :in-settings="inSettings" @back="$emit('back')">
    <div class="landscape-content">
      <!-- Landscape Carousel Selector -->
      <div class="landscape-carousel">
        <div class="landscape-header">
          <v-btn icon class="nav-btn" @click="prevLandscape" :disabled="currentIndex <= 0">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div class="landscape-name">{{ currentLandscapeData.name }}</div>
          <v-btn icon class="nav-btn" @click="nextLandscape" :disabled="currentIndex >= availableLandscapes.length - 1">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <div class="landscape-description" v-html="currentDescription"></div>
      </div>

      <!-- Dots indicator -->
      <div class="dots-indicator">
        <span
          v-for="(landscape, index) in availableLandscapes"
          :key="landscape.key"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="selectLandscapeByIndex(index)"
        ></span>
      </div>
    </div>
  </bottom-menu-submenu>
</template>

<script>
import BottomMenuSubmenu from './BottomMenuSubmenu.vue'

export default {
  name: 'LandscapeSubmenu',
  components: { BottomMenuSubmenu },
  props: {
    inSettings: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      availableLandscapes: [
        { key: 'guereins', name: 'Guéreins (France)', descriptionFile: 'guereins/description.en.html' },
        { key: 'ocean', name: 'Ocean', descriptionFile: 'ocean/description.en.html' },
        { key: 'hurricane', name: 'Hurricane Ridge', descriptionFile: 'hurricane/description.en.html' },
        { key: 'zero', name: 'Zero Horizon', description: 'A simple polygonal landscape that just covers the area below the horizon' }
      ],
      descriptions: {}
    }
  },
  computed: {
    landscapeVisible: {
      get () { return this.$store.state.stel?.landscapes?.visible || false },
      set (v) { this.$stel.core.landscapes.visible = v }
    },
    currentLandscape () {
      return this.$store.state.stel?.landscapes?.current_id || 'guereins'
    },
    currentIndex () {
      const idx = this.availableLandscapes.findIndex(l => l.key === this.currentLandscape)
      return idx >= 0 ? idx : 0
    },
    currentLandscapeData () {
      return this.availableLandscapes[this.currentIndex] || this.availableLandscapes[0]
    },
    currentDescription () {
      // Use inline description if available (for zero landscape)
      if (this.currentLandscapeData.description) {
        return this.currentLandscapeData.description
      }
      const desc = this.descriptions[this.currentLandscapeData.key]
      if (!desc) return 'Loading...'
      // Extract just the paragraph text, strip h2 tags
      return desc.replace(/<h2>.*?<\/h2>/gi, '').trim()
    }
  },
  mounted () {
    this.loadDescriptions()
  },
  methods: {
    async loadDescriptions () {
      for (const landscape of this.availableLandscapes) {
        // Skip landscapes with inline descriptions
        if (landscape.description || !landscape.descriptionFile) continue
        try {
          const url = '/skydata/landscapes/' + landscape.descriptionFile
          const response = await fetch(url)
          if (response.ok) {
            const text = await response.text()
            this.$set(this.descriptions, landscape.key, text)
          }
        } catch (e) {
          console.warn('Failed to load description for ' + landscape.key + ':', e)
        }
      }
    },
    selectLandscape (key) {
      if (this.$stel && this.$stel.core && this.$stel.core.landscapes) {
        this.$stel.core.landscapes.current_id = key
        if (!this.landscapeVisible) {
          this.$stel.core.landscapes.visible = true
        }
      }
    },
    selectLandscapeByIndex (index) {
      if (index >= 0 && index < this.availableLandscapes.length) {
        this.selectLandscape(this.availableLandscapes[index].key)
      }
    },
    prevLandscape () {
      if (this.currentIndex > 0) {
        this.selectLandscapeByIndex(this.currentIndex - 1)
      }
    },
    nextLandscape () {
      if (this.currentIndex < this.availableLandscapes.length - 1) {
        this.selectLandscapeByIndex(this.currentIndex + 1)
      }
    }
  }
}
</script>

<style scoped>
.landscape-content {
  padding: 8px 0 0 0;
}

.toggle-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.toggle-row.visibility-toggle {
  padding: 8px 0;
}

.toggle-label {
  font-size: 14px;
  color: white;
  margin-left: 8px;
}

.landscape-carousel {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  margin: 0 -16px;
}

.landscape-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.nav-btn {
  color: white !important;
  flex-shrink: 0;
}

.nav-btn.v-btn--disabled {
  color: rgba(255, 255, 255, 0.3) !important;
}

.landscape-name {
  font-size: 18px;
  font-weight: 500;
  color: white;
  text-align: center;
  flex: 1;
}

.landscape-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  height: 78px;
  overflow-y: auto;
  padding: 0 8px;
  text-align: center;
}

.landscape-description::-webkit-scrollbar {
  width: 4px;
}

.landscape-description::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.landscape-description::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.landscape-description :deep(p) {
  margin: 0;
}

.dots-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 0 0 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.2s ease;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.dot.active {
  background: #64b5f6;
}
</style>
