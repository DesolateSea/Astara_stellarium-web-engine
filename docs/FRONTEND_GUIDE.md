# Frontend Guide

This document covers the Vue.js frontend application architecture, components, state management, and development practices.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Stellarium Integration](#stellarium-integration)
- [Key Features](#key-features)
- [Development Workflow](#development-workflow)

## Overview

The frontend is a single-page application (SPA) built with Vue.js 2.6 and Vuetify 2.x, providing a modern, responsive UI for the Stellarium Web Engine.

**Key Characteristics:**
- Component-based architecture
- Reactive state management with Vuex
- Material Design UI (Vuetify)
- Responsive design (mobile and desktop)
- Internationalization (i18n) support

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 2.6.14 | Progressive JavaScript framework |
| **Vuetify** | 2.6.10 | Material Design component library |
| **Vuex** | 3.x | State management |
| **Vue Router** | 3.x | Client-side routing |
| **Vue I18n** | 8.x | Internationalization |
| **Moment.js** | 2.29.4 | Date/time manipulation |
| **Leaflet** | 1.7.1 | Location map |
| **satellite.js** | 6.0.1 | Satellite calculations |

## Project Structure

```
apps/web-frontend/
├── public/
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   ├── skydata/                # Astronomical data
│   └── hips/                   # HiPS imagery
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── js/
│   │   │   ├── sw_helpers.js   # Stellarium helpers
│   │   │   └── name_index_loader.js
│   │   └── css/
│   ├── components/
│   │   ├── search-panel.vue
│   │   ├── selected-object-info.vue
│   │   ├── settings-panel.vue
│   │   ├── bottom-bar.vue
│   │   └── ... (32 components)
│   ├── locales/                # i18n translations
│   ├── plugins/
│   │   └── vuetify.js
│   ├── store/
│   │   └── index.js            # Vuex store
│   ├── App.vue                 # Root component
│   └── main.js                 # Entry point
├── package.json
└── vue.config.js
```

## Component Architecture

### Root Component: App.vue

**File**: [`apps/web-frontend/src/App.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/App.vue)

```vue
<template>
  <v-app>
    <stel-canvas ref="stelCanvas"/>
    <toolbar/>
    <search-panel/>
    <settings-panel/>
    <selected-object-info/>
    <bottom-bar/>
    <progress-bars/>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.initStellariumEngine();
  },
  methods: {
    async initStellariumEngine() {
      // Initialize WebAssembly engine
      const StelWebEngine = await import('./assets/js/stellarium-web-engine.js');
      // ... initialization code
    }
  }
}
</script>
```

### Major Components

#### 1. Search Panel

**File**: [`search-panel.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/components/search-panel.vue)

**Features:**
- Full-screen search interface
- Real-time search with 59,000+ objects
- Category filtering (stars, planets, DSOs, satellites)
- Recent searches and favorites
- Browse by category

**Structure:**
```vue
<template>
  <v-navigation-drawer v-model="showSearchPanel" app right>
    <search-header @search="handleSearch"/>
    <filter-chips-bar :active-filters="activeFilters"/>
    <results-list :results="searchResults"/>
    <browse-view v-if="!searchQuery"/>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      activeFilters: []
    }
  },
  methods: {
    async handleSearch(query) {
      const results = await swh.querySkySources(query, 50);
      this.searchResults = results;
    }
  }
}
</script>
```

#### 2. Selected Object Info

**File**: [`selected-object-info.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/components/selected-object-info.vue)

**Features:**
- Object details (name, type, coordinates)
- Magnitude and distance
- Rise/set times
- Favorite toggle
- Center and zoom actions

**Key Methods:**
```javascript
methods: {
  async updateObjectInfo(obj) {
    if (!obj) return;
    
    // Get object information
    const info = await swh.getObjectInfo(obj);
    this.objectName = info.name;
    this.objectType = info.type;
    this.ra = info.ra;
    this.dec = info.dec;
    this.magnitude = info.vmag;
    // ...
  },
  
  centerOnObject() {
    swh.core.selection = this.selectedObject;
    swh.core.lock = this.selectedObject;
  },
  
  toggleFavorite() {
    this.$store.commit('toggleFavorite', this.selectedObject);
  }
}
```

#### 3. Settings Panel

**File**: [`settings-panel.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/components/settings-panel.vue)

**Features:**
- Display settings (atmosphere, grids, labels)
- Sky culture selection
- Light pollution (Bortle scale)
- Star rendering options
- Language selection

**Settings Binding:**
```javascript
computed: {
  atmosphereVisible: {
    get() { return this.$stel.atmosphere.visible },
    set(val) { this.$stel.atmosphere.visible = val }
  },
  
  constellationLines: {
    get() { return this.$stel.constellations.lines_visible },
    set(val) { this.$stel.constellations.lines_visible = val }
  }
}
```

#### 4. Bottom Bar

**File**: [`bottom-bar.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/components/bottom-bar.vue)

**Features:**
- Time controls (play/pause, speed)
- Date/time picker
- Location selector
- Quick settings menu

**Time Control:**
```javascript
methods: {
  toggleTimeFlow() {
    if (this.$stel.core.time_speed === 0) {
      this.$stel.core.time_speed = 1; // Real-time
    } else {
      this.$stel.core.time_speed = 0; // Paused
    }
  },
  
  setTimeSpeed(speed) {
    this.$stel.core.time_speed = speed;
  },
  
  setDateTime(dateTime) {
    const mjd = swh.dateTimeToMJD(dateTime);
    this.$stel.observer.tt = mjd;
  }
}
```

## State Management

### Vuex Store

**File**: [`apps/web-frontend/src/store/index.js`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/store/index.js)

**State:**
```javascript
state: {
  stel: null,                    // Stellarium engine instance
  initComplete: false,
  
  // UI state
  showSearchPanel: false,
  showSettingsPanel: false,
  showLocationDialog: false,
  selectedObject: undefined,
  
  // User data
  favourites: [],                // Loaded from localStorage
  recents: [],                   // Loaded from localStorage (6h expiry)
  
  // Location
  currentLocation: {
    short_name: 'Unknown',
    lat: 0,
    lng: 0,
    alt: 0
  },
  useAutoLocation: true,
  
  // Display options
  nightmode: false,
  fullscreen: false
}
```

**Mutations:**
```javascript
mutations: {
  setValue(state, { varName, newValue }) {
    _.set(state, varName, newValue);
  },
  
  setSelectedObject(state, newValue) {
    state.selectedObject = newValue;
  },
  
  toggleFavourite(state, object) {
    const index = state.favourites.findIndex(/* ... */);
    if (index === -1) {
      state.favourites.push(object);
    } else {
      state.favourites.splice(index, 1);
    }
    localStorage.setItem('stel_favourites', JSON.stringify(state.favourites));
  },
  
  addToRecents(state, object) {
    state.recents.unshift(object);
    if (state.recents.length > 20) {
      state.recents = state.recents.slice(0, 20);
    }
    localStorage.setItem('stel_recents', JSON.stringify(state.recents));
    localStorage.setItem('stel_recents_timestamp', Date.now().toString());
  }
}
```

**Usage in Components:**
```javascript
computed: {
  ...mapState(['selectedObject', 'favourites']),
  showSearchPanel: {
    get() { return this.$store.state.showSearchPanel },
    set(val) { this.$store.commit('setValue', { varName: 'showSearchPanel', newValue: val }) }
  }
},

methods: {
  selectObject(obj) {
    this.$store.commit('setSelectedObject', obj);
    this.$store.commit('addToRecents', obj);
  }
}
```

## Stellarium Integration

### Engine Initialization

**In main.js:**
```javascript
import StelWebEngine from './assets/js/stellarium-web-engine.js';

async function initStellarium() {
  const Module = await StelWebEngine();
  
  // Create global Stellarium instance
  const stel = Module.createObj('core');
  
  // Make available globally
  Vue.prototype.$stel = stel;
  
  // Initialize canvas
  const canvas = document.getElementById('stel-canvas');
  stel.init(canvas);
  
  return stel;
}
```

### Helper Functions

**File**: [`sw_helpers.js`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/assets/sw_helpers.js)

**Key Functions:**
```javascript
const swh = {
  // Search sky objects
  async querySkySources(query, limit) {
    // Priority: constellations → planets → stars → DSOs
    const results = [];
    
    // Search constellations
    results.push(...this.searchConstellations(query));
    
    // Search planets
    results.push(...this.searchPlanets(query));
    
    // Search name index (stars + DSOs)
    const indexResults = await this.searchNameIndex(query);
    results.push(...indexResults);
    
    return results.slice(0, limit);
  },
  
  // Get object information
  async getObjectInfo(obj) {
    const info = {};
    info.name = obj.names ? obj.names[0] : 'Unknown';
    info.type = obj.types ? obj.types[0] : '';
    info.vmag = obj.vmag || null;
    // ... more properties
    return info;
  },
  
  // Convert date/time to MJD
  dateTimeToMJD(dateTime) {
    const moment = require('moment');
    const m = moment(dateTime);
    const jd = m.valueOf() / 86400000 + 2440587.5;
    return jd - 2400000.5; // Convert to MJD
  }
};
```

### Canvas Component

**Custom Canvas Wrapper:**
```vue
<template>
  <canvas ref="canvas" id="stel-canvas"></canvas>
</template>

<script>
export default {
  mounted() {
    this.initCanvas();
    this.startRenderLoop();
  },
  
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      this.$stel.init(canvas);
    },
    
    startRenderLoop() {
      const render = () => {
        this.$stel.core.update();
        this.$stel.core.render();
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }
  }
}
</script>
```

## Key Features

### 1. Search System

**Implementation:**
- Name index with 59,703 objects
- Fuzzy matching (exact, starts-with, contains)
- Category filtering
- Priority-based results

**Search Flow:**
```javascript
async search(query) {
  // Load name index (lazy, cached)
  const index = await loadNameIndex();
  
  // Filter by active categories
  let results = index.filter(obj => 
    this.activeFilters.includes(obj.type)
  );
  
  // Match query
  results = results.filter(obj => 
    obj.names.some(name => 
      name.toLowerCase().includes(query.toLowerCase())
    )
  );
  
  // Sort by relevance
  results.sort((a, b) => {
    const aExact = a.names.some(n => n.toLowerCase() === query.toLowerCase());
    const bExact = b.names.some(n => n.toLowerCase() === query.toLowerCase());
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
  
  return results;
}
```

### 2. Favorites System

**Storage:**
```javascript
// Save to localStorage
localStorage.setItem('stel_favourites', JSON.stringify(favourites));

// Load from localStorage
const favourites = JSON.parse(localStorage.getItem('stel_favourites') || '[]');
```

**Comparison:**
```javascript
function isSameObject(obj1, obj2) {
  // Compare by name
  if (obj1.names && obj2.names && obj1.names[0] === obj2.names[0]) {
    return true;
  }
  
  // Compare satellites by NORAD number
  if (obj1.model_data?.norad_number && 
      obj2.model_data?.norad_number &&
      obj1.model_data.norad_number === obj2.model_data.norad_number) {
    return true;
  }
  
  return false;
}
```

### 3. HiPS Overlays

**Component**: [`DsoSkyOverlays.vue`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/src/components/DsoSkyOverlays.vue)

**Configuration:**
```javascript
data() {
  return {
    dsoHips: [
      {
        id: 'm31',
        name: 'Andromeda Galaxy (M31)',
        fov_threshold: 15,  // degrees
        path: '/hips/m31'
      },
      {
        id: 'm42',
        name: 'Orion Nebula (M42)',
        fov_threshold: 8,
        path: '/hips/m42'
      }
      // ... more DSOs
    ]
  }
},

methods: {
  updateOverlays() {
    const fov = this.$stel.core.fov * 180 / Math.PI;
    
    this.dsoHips.forEach(hips => {
      if (fov < hips.fov_threshold) {
        this.showHips(hips);
      } else {
        this.hideHips(hips);
      }
    });
  }
}
```

### 4. Responsive Design

**Breakpoints:**
```javascript
computed: {
  isMobile() {
    return this.$vuetify.breakpoint.mobile;
  },
  
  isTablet() {
    return this.$vuetify.breakpoint.smAndDown;
  }
}
```

**Conditional Rendering:**
```vue
<template>
  <v-navigation-drawer
    v-model="showPanel"
    :temporary="isMobile"
    :permanent="!isMobile"
    :width="isMobile ? '100%' : '400'">
    <!-- Content -->
  </v-navigation-drawer>
</template>
```

## Development Workflow

### Running Dev Server

```bash
cd apps/web-frontend
npm run dev
```

**Hot Module Replacement:**
- Changes to `.vue` files reload automatically
- Changes to JavaScript reload automatically
- Changes to CSS reload without page refresh

### Building for Production

```bash
npm run build
```

**Output:** `dist/` directory

**Optimizations:**
- Code splitting
- Minification
- Tree shaking
- Asset optimization

### Linting

```bash
npm run lint
```

**ESLint Configuration:**
- Vue.js essential rules
- Standard JavaScript style
- Vuetify-specific rules

### Testing

**Unit Tests:**
```bash
npm run test:unit
```

**E2E Tests:**
```bash
npm run test:e2e
```

---

**Next Steps:**
- See [API Reference](API_REFERENCE.md) for Stellarium API
- Check [Android Guide](ANDROID_GUIDE.md) for mobile development
- Read [Setup Guide](SETUP_GUIDE.md) for environment setup
