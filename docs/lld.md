# Astara - Low-Level Design (LLD) Document

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Engine Architecture](#2-engine-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Service Layer Design](#4-service-layer-design)
5. [State Management](#5-state-management)
6. [Component Specifications](#6-component-specifications)
7. [Algorithm Specifications](#7-algorithm-specifications)
8. [Data Formats](#8-data-formats)
9. [Build System](#9-build-system)
10. [Testing Specifications](#10-testing-specifications)

---

## 1. Project Structure

### 1.1 Root Directory Structure

```
astara/
├── apps/                           # Application packages
│   ├── web-frontend/               # Vue.js frontend application
│   ├── simple-html/                # Minimal test harness
│   └── test-skydata/               # Test data files
├── src/                            # Stellarium Web Engine source (C)
│   ├── algos/                      # Astronomical algorithms
│   ├── modules/                    # Sky object modules
│   ├── projections/                # Map projections
│   ├── utils/                      # Utility functions
│   └── js/                         # JavaScript bindings
├── ext_src/                        # External dependencies
│   ├── erfa/                       # ERFA astronomical library
│   ├── stb/                        # Image loading
│   └── zlib/                       # Compression
├── data/                           # Bundled astronomical data
├── scripts/                        # Python utility scripts
├── tools/                          # Build and data tools
├── doc/                            # Engine documentation
├── docs/                           # Application documentation
├── android/                        # Android Capacitor project
├── Makefile                        # Engine build
├── SConstruct                      # SCons build config
└── README.md                       # Project overview
```

### 1.2 Frontend Structure

```
apps/web-frontend/
├── src/
│   ├── App.vue                     # Root Vue component
│   ├── main.js                     # Application entry point
│   ├── assets/                     # Static assets
│   │   ├── js/                     # WASM engine files
│   │   │   ├── stellarium-web-engine.js
│   │   │   └── stellarium-web-engine.wasm
│   │   ├── images/                 # UI images
│   │   ├── gyroscope-service.js    # Sensor service
│   │   ├── camera-service.js       # AR camera service
│   │   ├── search_engine.js        # Search functionality
│   │   ├── astronomy-service.js    # Event calculations
│   │   └── fullscreen-service.js   # Fullscreen control
│   ├── components/                 # Vue components
│   │   ├── bottom-bar.vue          # Main control bar
│   │   ├── search-panel.vue        # Search interface
│   │   ├── settings-panel.vue      # Settings drawer
│   │   ├── calendar-panel.vue      # Astronomical calendar
│   │   ├── GyroDirectionOverlay.vue
│   │   ├── AR-camera-preview.vue
│   │   └── ...
│   ├── store/                      # Vuex store
│   │   └── index.js
│   ├── plugins/                    # Vue plugins
│   ├── locales/                    # i18n translations
│   └── constants/                  # Configuration constants
├── public/                         # Static public files
│   └── skydata/                    # Astronomical data
├── android/                        # Capacitor Android project
├── package.json
├── vue.config.js
└── capacitor.config.json
```

---

## 2. Engine Architecture

### 2.1 Object System

The engine uses a C-based object-oriented system centered on `obj_t`:

```c
// Base object structure
typedef struct obj_t {
    obj_klass_t *klass;        // Class definition
    char        *id;           // Unique identifier
    obj_t       *parent;       // Parent object
    obj_t       *children;     // Linked list of children
    obj_t       *next;         // Sibling link
    int         ref;           // Reference count
    
    // Position data for sky objects
    struct {
        double pvg[2][3];      // Position/velocity (geocentric)
        double unit;           // Distance unit
        double g_ra, g_dec;    // Geocentric RA/Dec
        double ra, dec;        // Apparent RA/Dec
        double az, alt;        // Azimuth/Altitude
    } pos;
} obj_t;

// Class definition
typedef struct obj_klass_t {
    const char *id;
    size_t size;
    uint32_t flags;
    
    // Virtual methods
    int (*init)(obj_t *obj, json_value *args);
    void (*del)(obj_t *obj);
    int (*update)(obj_t *obj, double dt);
    int (*render)(const obj_t *obj, const painter_t *painter);
    obj_t* (*get)(const obj_t *obj, const char *id, int flags);
    int (*list)(const obj_t *obj, observer_t *obs,
                double max_mag, uint64_t hint, void *user,
                int (*f)(void *user, obj_t *obj));
} obj_klass_t;
```

### 2.2 Module Registration

Modules are registered at compile time:

```c
// Example: Stars module registration
static obj_klass_t stars_klass = {
    .id = "stars",
    .size = sizeof(stars_t),
    .flags = OBJ_IN_JSON_TREE | OBJ_MODULE,
    .init = stars_init,
    .update = stars_update,
    .render = stars_render,
    .get = stars_get,
    .list = stars_list,
    .attributes = (attribute_t[]) {
        ATTR("visible", "b", MEMBER(stars_t, visible)),
        ATTR("hints_mag_offset", "f", MEMBER(stars_t, hints_mag_offset)),
        {}
    },
};
MODULE_REGISTER(stars, &stars_klass, 0)
```

### 2.3 Core Modules

| Module | File | Responsibility |
|--------|------|----------------|
| `core` | `core.c` | Main engine, observer, time |
| `stars` | `modules/stars.c` | Hipparcos star catalog |
| `planets` | `modules/planets.c` | Solar system bodies |
| `dso` | `modules/dso.c` | Deep sky objects |
| `constellations` | `modules/constellations.c` | Constellation lines/art |
| `satellites` | `modules/satellites.c` | TLE-based satellites |
| `lines` | `modules/lines.c` | Equatorial/azimuthal grids |
| `milkyway` | `modules/milkyway.c` | Galactic texture |
| `atmosphere` | `modules/atmosphere.c` | Sky gradient |
| `landscape` | `modules/landscape.c` | Horizon panorama |

### 2.4 Rendering Pipeline

```c
// Main render loop
void core_render(core_t *core, double aspect, void *user) {
    painter_t painter;
    
    // Setup painter
    painter_init(&painter, core->proj, core->observer);
    
    // Render in order (back to front)
    module_render(core->milkyway, &painter);
    module_render(core->dso, &painter);
    module_render(core->stars, &painter);
    module_render(core->constellations, &painter);
    module_render(core->planets, &painter);
    module_render(core->satellites, &painter);
    module_render(core->lines, &painter);
    module_render(core->atmosphere, &painter);
    module_render(core->landscape, &painter);
    module_render(core->labels, &painter);
}
```

### 2.5 Projection System

Supported projections:

```c
// Projection function signature
typedef bool (*proj_func_t)(
    const projection_t *proj,
    int flags,
    int out_dim,
    const double *v,
    double *out
);

// Available projections
typedef enum {
    PROJ_PERSPECTIVE,      // Normal camera view
    PROJ_STEREOGRAPHIC,    // Wide-angle, preserves circles
    PROJ_MERCATOR,         // Cylindrical
    PROJ_HEALPIX,          // HiPS survey projection
    PROJ_TOAST,            // TOAST survey projection
} projection_type_t;

// Projection flags
enum {
    PROJ_NO_CLIP            = 1 << 0,  // Skip clipping
    PROJ_BACKWARD           = 1 << 1,  // 2D → 3D
    PROJ_TO_NDC_SPACE       = 1 << 2,  // Output NDC
    PROJ_ALREADY_NORMALIZED = 1 << 3,  // Input normalized
};
```

---

## 3. Frontend Architecture

### 3.1 Vue Application Structure

```javascript
// main.js - Application entry point
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import store from './store'

Vue.use(Vuex)

// Initialize Stellarium engine
import StelWebEngine from '@/assets/js/stellarium-web-engine.js'

new Vue({
  store,
  render: h => h(App),
  beforeCreate() {
    // Engine initialization
    StelWebEngine({
      wasmFile: '/assets/js/stellarium-web-engine.wasm',
      onReady: (stel) => {
        this.$stel = stel
        Vue.prototype.$stel = stel
        store.commit('replaceStelWebEngine', stel)
      }
    })
  }
}).$mount('#app')
```

### 3.2 App.vue Structure

```vue
<template>
  <div id="app" :class="{ fullscreen: isFullscreen }">
    <!-- Engine canvas -->
    <canvas ref="stelCanvas" id="stel-canvas"></canvas>
    
    <!-- Overlay layers -->
    <GyroDirectionOverlay v-if="showGyroOverlay" />
    <AR-camera-preview v-if="arModeActive" />
    <DsoSkyOverlays v-if="showDsoOverlays" />
    
    <!-- UI layers -->
    <selected-object-info v-if="selectedObject" />
    <search-panel v-if="searchPanelOpen" />
    <settings-panel v-if="settingsPanelOpen" />
    <calendar-panel v-if="calendarPanelOpen" />
    
    <!-- Bottom bar (always visible) -->
    <bottom-bar />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    ...mapState([
      'gyroModeActive',
      'arModeActive',
      'selectedObject',
      'searchPanelOpen',
      'settingsPanelOpen',
      'calendarPanelOpen'
    ])
  },
  mounted() {
    this.initializeEngine()
    this.initializeSensors()
  }
}
</script>
```

---

## 4. Service Layer Design

### 4.1 Gyroscope Service

```javascript
// gyroscope-service.js

class GyroscopeService {
  constructor() {
    this.isActive = false
    this.calibrated = false
    this.quaternion = [0, 0, 0, 1]
    this.listeners = []
    
    // Sensor configuration
    this.config = {
      frequency: 60,           // Hz
      smoothingFactor: 0.2,    // Low-pass filter
      useCompass: true,        // Combine with magnetometer
    }
  }

  async start() {
    // Check for sensor support
    if (!window.DeviceOrientationEvent) {
      throw new Error('Device orientation not supported')
    }
    
    // Request permission (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Sensor permission denied')
      }
    }
    
    // Start listening
    window.addEventListener('deviceorientation', this.handleOrientation.bind(this))
    this.isActive = true
  }

  handleOrientation(event) {
    const { alpha, beta, gamma } = event
    
    // Convert Euler angles to quaternion
    const quat = this.eulerToQuaternion(alpha, beta, gamma)
    
    // Apply smoothing
    this.quaternion = this.slerp(this.quaternion, quat, this.config.smoothingFactor)
    
    // Convert to azimuth/altitude
    const { azimuth, altitude } = this.quaternionToAltAz(this.quaternion)
    
    // Notify listeners
    this.notifyListeners({ azimuth, altitude, quaternion: this.quaternion })
  }

  eulerToQuaternion(alpha, beta, gamma) {
    // Convert degrees to radians
    const a = (alpha || 0) * Math.PI / 180
    const b = (beta || 0) * Math.PI / 180
    const g = (gamma || 0) * Math.PI / 180
    
    // Standard Euler to quaternion conversion
    const c1 = Math.cos(a / 2)
    const s1 = Math.sin(a / 2)
    const c2 = Math.cos(b / 2)
    const s2 = Math.sin(b / 2)
    const c3 = Math.cos(g / 2)
    const s3 = Math.sin(g / 2)
    
    return [
      s1 * c2 * c3 - c1 * s2 * s3,
      c1 * s2 * c3 + s1 * c2 * s3,
      c1 * c2 * s3 + s1 * s2 * c3,
      c1 * c2 * c3 - s1 * s2 * s3
    ]
  }

  quaternionToAltAz(q) {
    // Convert quaternion to viewing direction
    // Returns azimuth (0-360) and altitude (-90 to 90)
    
    // Extract rotation matrix from quaternion
    const [x, y, z, w] = q
    
    // Calculate forward vector
    const fx = 2 * (x * z + w * y)
    const fy = 2 * (y * z - w * x)
    const fz = 1 - 2 * (x * x + y * y)
    
    // Convert to alt/az
    const altitude = Math.asin(-fy) * 180 / Math.PI
    let azimuth = Math.atan2(fx, fz) * 180 / Math.PI
    if (azimuth < 0) azimuth += 360
    
    return { azimuth, altitude }
  }

  stop() {
    window.removeEventListener('deviceorientation', this.handleOrientation)
    this.isActive = false
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data))
  }
}

export default new GyroscopeService()
```

### 4.2 Search Engine

```javascript
// search_engine.js

class SearchEngine {
  constructor() {
    this.nameIndex = null
    this.isLoaded = false
  }

  async loadIndex() {
    if (this.isLoaded) return
    
    const response = await fetch('/skydata/name_index_compact.json')
    this.nameIndex = await response.json()
    this.isLoaded = true
  }

  async search(query, options = {}) {
    const {
      maxResults = 50,
      categories = ['constellation', 'planet', 'star', 'dso'],
      minScore = 0.1
    } = options

    await this.loadIndex()
    
    const normalizedQuery = query.toLowerCase().trim()
    const results = []
    
    // Search priority order
    const priorities = {
      constellation: 100,
      planet: 90,
      star: 80,
      dso: 70,
      satellite: 60
    }

    // Search exact matches first
    for (const [name, data] of Object.entries(this.nameIndex)) {
      const normalizedName = name.toLowerCase()
      
      if (!categories.includes(data.type)) continue
      
      let score = 0
      
      if (normalizedName === normalizedQuery) {
        score = 1.0  // Exact match
      } else if (normalizedName.startsWith(normalizedQuery)) {
        score = 0.8  // Starts with
      } else if (normalizedName.includes(normalizedQuery)) {
        score = 0.5  // Contains
      }
      
      if (score >= minScore) {
        results.push({
          name,
          ...data,
          score: score + (priorities[data.type] || 0) / 1000
        })
      }
    }

    // Sort by score and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }

  // Query engine directly for live objects
  queryEngine(stel, query) {
    const results = []
    
    // Search planets
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']
    planets.forEach(p => {
      if (p.includes(query.toLowerCase())) {
        const obj = stel.getObj(`planet/${p}`)
        if (obj) results.push({ name: p, type: 'planet', obj })
      }
    })
    
    // Search by designation
    const obj = stel.getObjByName(query)
    if (obj) {
      results.push({ name: query, obj })
    }
    
    return results
  }
}

export default new SearchEngine()
```

### 4.3 Astronomy Service

```javascript
// astronomy-service.js

import * as Astronomy from 'astronomy-engine'

class AstronomyService {
  
  // Calculate moon phases for a month
  getMoonPhases(year, month) {
    const phases = []
    const date = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    
    while (date <= endDate) {
      const phase = Astronomy.MoonPhase(date)
      
      // Check for exact phase moments
      const newMoon = Astronomy.SearchMoonQuarter(date)
      if (newMoon && this.isSameMonth(newMoon.time.date, year, month)) {
        phases.push({
          type: this.getPhaseType(newMoon.quarter),
          date: newMoon.time.date,
          illumination: this.getMoonIllumination(newMoon.time.date)
        })
      }
      
      date.setDate(date.getDate() + 1)
    }
    
    return phases
  }

  getPhaseType(quarter) {
    const types = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter']
    return types[quarter] || 'Unknown'
  }

  getMoonIllumination(date) {
    const phase = Astronomy.MoonPhase(date)
    return (1 - Math.cos(phase * Math.PI / 180)) / 2
  }

  // Calculate eclipses
  getEclipses(startYear, endYear) {
    const eclipses = []
    
    // Search for lunar eclipses
    let lunarSearch = Astronomy.SearchLunarEclipse(new Date(startYear, 0, 1))
    while (lunarSearch.peak.date.getFullYear() <= endYear) {
      eclipses.push({
        type: 'Lunar Eclipse',
        subtype: this.getLunarEclipseType(lunarSearch.kind),
        date: lunarSearch.peak.date,
        magnitude: lunarSearch.sd_total
      })
      lunarSearch = Astronomy.NextLunarEclipse(lunarSearch.peak)
    }
    
    return eclipses.sort((a, b) => a.date - b.date)
  }

  // Calculate planet conjunctions
  getPlanetConjunctions(year) {
    const conjunctions = []
    const planets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn']
    
    for (let i = 0; i < planets.length - 1; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const conj = this.findConjunction(
          planets[i], 
          planets[j], 
          new Date(year, 0, 1), 
          new Date(year, 11, 31)
        )
        if (conj) {
          conjunctions.push({
            type: 'Conjunction',
            bodies: [planets[i], planets[j]],
            date: conj.date,
            separation: conj.separation
          })
        }
      }
    }
    
    return conjunctions
  }

  findConjunction(body1, body2, startDate, endDate) {
    // Simplified conjunction search
    let minSep = Infinity
    let conjDate = null
    
    const date = new Date(startDate)
    while (date <= endDate) {
      const pos1 = Astronomy.GeoVector(body1, date, false)
      const pos2 = Astronomy.GeoVector(body2, date, false)
      
      const sep = this.angularSeparation(pos1, pos2)
      
      if (sep < minSep && sep < 5) { // Within 5 degrees
        minSep = sep
        conjDate = new Date(date)
      }
      
      date.setDate(date.getDate() + 1)
    }
    
    if (conjDate) {
      return { date: conjDate, separation: minSep }
    }
    return null
  }

  angularSeparation(pos1, pos2) {
    // Calculate angular separation in degrees
    const dot = pos1.x * pos2.x + pos1.y * pos2.y + pos1.z * pos2.z
    const r1 = Math.sqrt(pos1.x**2 + pos1.y**2 + pos1.z**2)
    const r2 = Math.sqrt(pos2.x**2 + pos2.y**2 + pos2.z**2)
    
    const cosAngle = dot / (r1 * r2)
    return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
  }
}

export default new AstronomyService()
```

---

## 5. State Management

### 5.1 Vuex Store Structure

```javascript
// store/index.js

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // Engine reference
    stel: null,

    // UI state
    searchPanelOpen: false,
    settingsPanelOpen: false,
    calendarPanelOpen: false,
    
    // Feature state
    gyroModeActive: false,
    arModeActive: false,
    sensorsEnabled: true,
    
    // Selection
    selectedObject: null,
    
    // User preferences
    favorites: [],
    recentSearches: [],
    
    // Location
    location: {
      lat: 28.6139,  // Default: New Delhi
      lng: 77.2090,
      alt: 0,
      name: 'New Delhi'
    },
    
    // Engine state mirror
    stelState: {
      constellations: {
        lines_visible: true,
        labels_visible: true,
        art_visible: false
      },
      atmosphere: {
        visible: true
      },
      stars: {
        visible: true,
        mag_limit: 6.5
      },
      dso: {
        visible: true
      },
      planets: {
        visible: true
      },
      grids: {
        equatorial: false,
        azimuthal: false
      }
    }
  },

  mutations: {
    replaceStelWebEngine(state, stel) {
      state.stel = stel
    },
    
    setGyroModeActive(state, active) {
      state.gyroModeActive = active
    },
    
    setArModeActive(state, active) {
      state.arModeActive = active
    },
    
    setSelectedObject(state, obj) {
      state.selectedObject = obj
    },
    
    addFavorite(state, obj) {
      if (!state.favorites.find(f => f.id === obj.id)) {
        state.favorites.push(obj)
        localStorage.setItem('favorites', JSON.stringify(state.favorites))
      }
    },
    
    removeFavorite(state, id) {
      state.favorites = state.favorites.filter(f => f.id !== id)
      localStorage.setItem('favorites', JSON.stringify(state.favorites))
    },
    
    setLocation(state, location) {
      state.location = location
      if (state.stel) {
        state.stel.core.observer.latitude = location.lat * Math.PI / 180
        state.stel.core.observer.longitude = location.lng * Math.PI / 180
      }
    },
    
    updateStelState(state, { path, value }) {
      // Update mirrored engine state
      const keys = path.split('.')
      let obj = state.stelState
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
    }
  },

  actions: {
    async toggleGyroMode({ commit, state }) {
      if (state.gyroModeActive) {
        gyroscopeService.stop()
        commit('setGyroModeActive', false)
      } else {
        await gyroscopeService.start()
        commit('setGyroModeActive', true)
      }
    },
    
    async toggleArMode({ commit, state }) {
      if (state.arModeActive) {
        cameraService.stop()
        commit('setArModeActive', false)
      } else {
        await cameraService.start()
        commit('setArModeActive', true)
      }
    },
    
    selectObject({ commit, state }, obj) {
      commit('setSelectedObject', obj)
      state.recentSearches.unshift({
        id: obj.id,
        name: obj.name,
        type: obj.type
      })
      state.recentSearches = state.recentSearches.slice(0, 20)
    }
  },

  getters: {
    isObjectSelected: state => !!state.selectedObject,
    
    favoriteIds: state => state.favorites.map(f => f.id),
    
    engineReady: state => !!state.stel
  }
})
```

---

## 6. Component Specifications

### 6.1 Bottom Bar Component

```vue
<!-- bottom-bar.vue -->
<template>
  <div class="bottom-bar">
    <bottom-button
      v-for="btn in buttons"
      :key="btn.id"
      :icon="btn.icon"
      :active="btn.isActive"
      @tap="btn.onTap"
      @longpress="btn.onLongPress"
    />
  </div>
</template>

<script>
export default {
  name: 'BottomBar',
  computed: {
    buttons() {
      return [
        {
          id: 'search',
          icon: 'search',
          isActive: this.$store.state.searchPanelOpen,
          onTap: () => this.togglePanel('search'),
          onLongPress: null
        },
        {
          id: 'constellations',
          icon: 'star',
          isActive: this.constellationLinesVisible,
          onTap: () => this.toggleConstellationLines(),
          onLongPress: () => this.openConstellationSettings()
        },
        {
          id: 'gyro',
          icon: 'compass',
          isActive: this.$store.state.gyroModeActive,
          onTap: () => this.$store.dispatch('toggleGyroMode'),
          onLongPress: () => this.openSensorSettings()
        },
        {
          id: 'camera',
          icon: 'camera',
          isActive: this.$store.state.arModeActive,
          onTap: () => this.$store.dispatch('toggleArMode'),
          onLongPress: () => this.openCameraSettings()
        },
        {
          id: 'calendar',
          icon: 'calendar',
          isActive: this.$store.state.calendarPanelOpen,
          onTap: () => this.togglePanel('calendar'),
          onLongPress: null
        },
        {
          id: 'settings',
          icon: 'settings',
          isActive: this.$store.state.settingsPanelOpen,
          onTap: () => this.togglePanel('settings'),
          onLongPress: null
        }
      ]
    }
  }
}
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}
</style>
```

### 6.2 Gyro Direction Overlay

```vue
<!-- GyroDirectionOverlay.vue -->
<template>
  <div class="gyro-overlay" :class="{ active: isActive }">
    <!-- Direction arrow for off-screen objects -->
    <div
      v-if="targetOffScreen"
      class="direction-arrow"
      :style="arrowStyle"
    >
      <svg viewBox="0 0 24 24" class="arrow-icon">
        <path d="M12 2L22 12L12 22L12 14L2 14L2 10L12 10Z"/>
      </svg>
      <span class="target-name">{{ targetName }}</span>
    </div>
    
    <!-- Calibration indicator -->
    <div class="calibration-status" :class="calibrationStatus">
      <span>{{ calibrationText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GyroDirectionOverlay',
  props: {
    targetObject: Object
  },
  data() {
    return {
      calibrationLevel: 0  // 0-1
    }
  },
  computed: {
    isActive() {
      return this.$store.state.gyroModeActive
    },
    targetOffScreen() {
      if (!this.targetObject) return false
      // Check if target is outside current view
      return !this.isInView(this.targetObject)
    },
    arrowStyle() {
      if (!this.targetObject) return {}
      const angle = this.calculateDirectionAngle()
      return {
        transform: `rotate(${angle}deg)`
      }
    },
    calibrationStatus() {
      if (this.calibrationLevel > 0.8) return 'good'
      if (this.calibrationLevel > 0.5) return 'fair'
      return 'poor'
    }
  },
  methods: {
    calculateDirectionAngle() {
      // Calculate angle from center to target
      const targetAz = this.targetObject.azimuth
      const currentAz = this.$store.state.currentAzimuth
      return (targetAz - currentAz + 360) % 360
    },
    isInView(obj) {
      // Check if object is within current view frustum
      const fov = this.$stel.core.fov
      const deltaAz = Math.abs(obj.azimuth - this.$store.state.currentAzimuth)
      const deltaAlt = Math.abs(obj.altitude - this.$store.state.currentAltitude)
      return deltaAz < fov / 2 && deltaAlt < fov / 2
    }
  }
}
</script>
```

---

## 7. Algorithm Specifications

### 7.1 Sky Object Ranking

```javascript
// Search result ranking algorithm

function rankSearchResults(results, query) {
  const weights = {
    exactMatch: 100,
    startsWithMatch: 50,
    containsMatch: 20,
    typeBonus: {
      constellation: 15,
      planet: 12,
      star: 8,
      dso: 5,
      satellite: 3
    },
    magnitudeBonus: (mag) => Math.max(0, 10 - mag),  // Brighter = higher
    visibilityBonus: (alt) => alt > 0 ? 10 : 0       // Above horizon
  }

  return results.map(result => {
    let score = 0
    const name = result.name.toLowerCase()
    const q = query.toLowerCase()
    
    // Match type
    if (name === q) {
      score += weights.exactMatch
    } else if (name.startsWith(q)) {
      score += weights.startsWithMatch
    } else if (name.includes(q)) {
      score += weights.containsMatch
    }
    
    // Type bonus
    score += weights.typeBonus[result.type] || 0
    
    // Magnitude bonus (for stars/DSOs)
    if (result.magnitude !== undefined) {
      score += weights.magnitudeBonus(result.magnitude)
    }
    
    // Visibility bonus
    if (result.altitude !== undefined) {
      score += weights.visibilityBonus(result.altitude)
    }
    
    return { ...result, score }
  }).sort((a, b) => b.score - a.score)
}
```

### 7.2 Gyroscope Smoothing

```javascript
// Low-pass filter for sensor data

class SensorSmoother {
  constructor(alpha = 0.2) {
    this.alpha = alpha  // Smoothing factor (0 = no smoothing, 1 = no filtering)
    this.lastValue = null
  }

  smooth(newValue) {
    if (this.lastValue === null) {
      this.lastValue = newValue
      return newValue
    }
    
    // Exponential moving average
    this.lastValue = this.alpha * newValue + (1 - this.alpha) * this.lastValue
    return this.lastValue
  }

  // Spherical interpolation for quaternions
  slerp(q1, q2, t) {
    let dot = q1[0]*q2[0] + q1[1]*q2[1] + q1[2]*q2[2] + q1[3]*q2[3]
    
    // Ensure shortest path
    if (dot < 0) {
      q2 = q2.map(x => -x)
      dot = -dot
    }
    
    // If very close, use linear interpolation
    if (dot > 0.9995) {
      const result = q1.map((v, i) => v + t * (q2[i] - v))
      return this.normalize(result)
    }
    
    // Spherical interpolation
    const theta0 = Math.acos(dot)
    const theta = theta0 * t
    const sinTheta = Math.sin(theta)
    const sinTheta0 = Math.sin(theta0)
    
    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0
    const s1 = sinTheta / sinTheta0
    
    return q1.map((v, i) => s0 * v + s1 * q2[i])
  }

  normalize(q) {
    const len = Math.sqrt(q[0]**2 + q[1]**2 + q[2]**2 + q[3]**2)
    return q.map(v => v / len)
  }
}
```

---

## 8. Data Formats

### 8.1 Name Index Format

```json
{
  "Sirius": {
    "type": "star",
    "id": "HIP 32349",
    "mag": -1.46,
    "ra": 101.2875,
    "dec": -16.7161,
    "alt_names": ["Alpha Canis Majoris", "Dog Star"]
  },
  "M31": {
    "type": "dso",
    "id": "NGC 224",
    "mag": 3.4,
    "ra": 10.6847,
    "dec": 41.2689,
    "alt_names": ["Andromeda Galaxy", "NGC 224"]
  },
  "Orion": {
    "type": "constellation",
    "id": "Ori",
    "stars": ["HIP 26727", "HIP 27989", "..."]
  }
}
```

### 8.2 Event Data Format

```json
{
  "events": [
    {
      "type": "moon_phase",
      "subtype": "full_moon",
      "date": "2026-01-19T12:30:00Z",
      "data": {
        "illumination": 1.0
      }
    },
    {
      "type": "eclipse",
      "subtype": "lunar_total",
      "date": "2026-03-14T00:00:00Z",
      "data": {
        "magnitude": 1.2,
        "duration_minutes": 180
      }
    },
    {
      "type": "conjunction",
      "bodies": ["venus", "jupiter"],
      "date": "2026-02-20T06:00:00Z",
      "data": {
        "separation_degrees": 0.5
      }
    }
  ]
}
```

---

## 9. Build System

### 9.1 Makefile Targets

```makefile
# Main targets
make              # Build WASM engine
make debug        # Build with debug symbols
make clean        # Clean build artifacts
make sync-android # Sync web build to Capacitor
make build-apk    # Build Android APK

# Engine build (SConstruct)
scons -j4 mode=release target=wasm
scons -j4 mode=debug target=wasm
```

### 9.2 npm Scripts

```json
{
  "scripts": {
    "dev": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint",
    "android:sync": "npx cap sync android",
    "android:open": "npx cap open android"
  }
}
```

---

## 10. Testing Specifications

### 10.1 Unit Tests

```javascript
// Example: Search engine tests
describe('SearchEngine', () => {
  beforeAll(async () => {
    await searchEngine.loadIndex()
  })

  test('exact match returns highest score', async () => {
    const results = await searchEngine.search('Sirius')
    expect(results[0].name).toBe('Sirius')
    expect(results[0].score).toBeGreaterThan(0.9)
  })

  test('partial match returns results', async () => {
    const results = await searchEngine.search('sir')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.name === 'Sirius')).toBe(true)
  })

  test('category filter works', async () => {
    const results = await searchEngine.search('M', { categories: ['dso'] })
    results.forEach(r => {
      expect(r.type).toBe('dso')
    })
  })
})
```

### 10.2 Integration Tests

```javascript
// Example: Gyroscope service integration
describe('GyroscopeService Integration', () => {
  test('sensor data updates engine view', async () => {
    const mockStel = {
      core: {
        observer: {
          azimuth: 0,
          altitude: 0
        }
      }
    }

    gyroscopeService.subscribe(({ azimuth, altitude }) => {
      mockStel.core.observer.azimuth = azimuth
      mockStel.core.observer.altitude = altitude
    })

    // Simulate sensor event
    const event = new DeviceOrientationEvent('deviceorientation', {
      alpha: 180,
      beta: 45,
      gamma: 0
    })
    window.dispatchEvent(event)

    expect(mockStel.core.observer.azimuth).toBeCloseTo(180, 1)
    expect(mockStel.core.observer.altitude).toBeCloseTo(45, 1)
  })
})
```

---

*Document prepared by: Astara Development Team*  
*Last updated: January 2026*
