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
      <div class="landscape-carousel"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <div class="landscape-description" v-html="currentDescription"></div>
        <div class="landscape-nav">
          <v-btn icon class="nav-btn" @click="prevLandscape" :disabled="currentIndex <= 0">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
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
          <v-btn icon class="nav-btn" @click="nextLandscape" :disabled="currentIndex >= availableLandscapes.length - 1">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
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
      availableLandscapes: [],
      descriptions: {},
      loading: true,
      touchStartX: 0,
      touchStartY: 0
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
      if (this.availableLandscapes.length === 0) return null
      return this.availableLandscapes[this.currentIndex] || this.availableLandscapes[0]
    },
    currentDescription () {
      if (!this.currentLandscapeData) return ''
      const desc = this.descriptions[this.currentLandscapeData.key]
      return desc || ''
    }
  },
  mounted () {
    this.loadLandscapes()
  },
  methods: {
    async loadLandscapes () {
      this.loading = true
      try {
        const response = await fetch('/skydata/landscapes/index.json')
        const keys = await response.json()

        // Build landscape list and load descriptions
        const landscapes = []
        for (const key of keys) {
          landscapes.push({ key })
          // Load description for each landscape
          try {
            const descUrl = '/skydata/landscapes/' + key + '/description.en.html'
            const descResponse = await fetch(descUrl)
            if (descResponse.ok) {
              const text = await descResponse.text()
              this.$set(this.descriptions, key, text)
            }
          } catch (e) {
            // No description available
          }
        }
        this.availableLandscapes = landscapes
      } catch (e) {
        console.warn('Failed to load landscapes index:', e)
        // Fallback
        this.availableLandscapes = [{ key: 'guereins' }, { key: 'zero' }]
      }
      this.loading = false
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
    },
    onTouchStart (e) {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
    },
    onTouchEnd (e) {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchEndX - this.touchStartX
      const deltaY = touchEndY - this.touchStartY

      // Only trigger if horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          // Swipe left -> next
          this.nextLandscape()
        } else {
          // Swipe right -> prev
          this.prevLandscape()
        }
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
  padding: 8px 0 0 0;
  margin: 0 -16px;
}

.landscape-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: -18px;
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

.landscape-counter {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  min-width: 60px;
}

.dots-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(156, 129, 129, 0.3);
  cursor: pointer;
  transition: background 0.2s ease;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.dot.active {
  background: #64b5f6;
}

.landscape-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  height: 91px;
  overflow-y: auto;
  padding: 0 16px;
  text-align: left;
}

.landscape-description :deep(h2) {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0 0 8px 0;
}

.landscape-description :deep(p) {
  margin: 0;
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
</style>
