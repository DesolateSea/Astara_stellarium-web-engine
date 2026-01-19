# Astara - High-Level Design (HLD) Document

**Version:** 1.0  
**Date:** January 2026  
**Classification:** RESTRICTED  
**Organization:** Astara Development Team

---

## 1. Executive Summary

**Astara** is an advanced mobile planetarium application. Built on the Stellarium Web Engine, it provides real-time sky visualization with sensor-based interaction, augmented reality overlays, and comprehensive offline astronomical data.

### 1.1 Purpose

Astara enables field personnel and aviation crews to:
- Identify celestial objects by pointing their device at the sky
- Navigate using astronomical references
- Access comprehensive star catalogs and deep sky object data offline
- Plan observations based on astronomical events and visibility

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Gyroscope Mode** | Point device to view corresponding sky region |
| **AR Camera Overlay** | Stars overlaid on live camera feed |
| **Direction Tracking** | Visual guide to locate specific objects |
| **Offline Operation** | 60,000+ objects bundled locally |
| **Astronomical Calendar** | Moon phases, eclipses, conjunctions |
| **Multi-Constellation Support** | Multiple sky cultures (IAU, Indian, etc.) |

---

## 2. System Architecture

### 2.1 Architecture Overview

Astara follows a three-layer architecture that separates platform concerns from computational logic:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NATIVE MOBILE RUNTIME                        │
│                (Capacitor / Android Platform)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Sensors   │  │   Camera    │  │   Platform Services     │  │
│  │ (Gyroscope) │  │   (AR)      │  │ (Permissions, Storage)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    WEB APPLICATION LAYER                        │
│                      (Vue.js Frontend)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Components  │  │  Services   │  │      Vuex Store         │  │
│  │  (UI/UX)    │  │ (Platform)  │  │   (State Management)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                  STELLARIUM WEB ENGINE CORE                     │
│               (C / WebAssembly Computational Core)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Modules   │  │ Projections │  │   Algorithms (ERFA)     │  │
│  │  (Sky Obj)  │  │ (Rendering) │  │   (Ephemeris Calc)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Layer Descriptions

#### 2.2.1 Native Mobile Runtime (Capacitor Layer)

The outermost layer provides native platform integration:

- **Capacitor Shell**: Wraps the web app as a native Android application
- **Sensor Access**: Gyroscope, accelerometer, compass via Capacitor plugins
- **Camera Integration**: Native camera feed for AR mode
- **Permissions**: Location, camera, sensor permissions
- **Window Management**: Fullscreen, orientation lock, immersive mode

#### 2.2.2 Web Application Layer (Vue.js Frontend)

The presentation and interaction layer:

- **Vue 2 Framework**: Component-based UI architecture
- **Vuex State Management**: Centralized state for app and engine sync
- **Services**: Platform abstraction modules (gyroscope, camera, search)
- **Components**: Reusable UI elements (menus, panels, dialogs)

#### 2.2.3 Stellarium Web Engine Core (WASM)

The computational core compiled from C to WebAssembly:

- **Astronomical Algorithms**: Position calculations via ERFA library
- **Rendering Engine**: OpenGL ES-based sky visualization
- **Module System**: Extensible sky object management (stars, planets, DSOs)
- **Projection System**: Multiple view projections (perspective, stereographic)

---

## 3. Technology Stack

### 3.1 Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Engine** | C/C++ | Astronomical calculations |
| **Compilation** | Emscripten 1.40.1 | C to WebAssembly compilation |
| **Runtime** | WebAssembly | Cross-platform execution |
| **Frontend** | Vue.js 2.x | User interface framework |
| **State** | Vuex | Application state management |
| **Styling** | CSS/SCSS | User interface styling |
| **Build** | Webpack | Module bundling |
| **Mobile** | Capacitor 4.x | Native Android wrapper |
| **Platform** | Android 8.0+ | Mobile operating system |

### 3.2 Astronomical Libraries

| Library | Source | Function |
|---------|--------|----------|
| **ERFA** | IAU Reference | Earth rotation, star positions |
| **SGP4** | NORAD | Satellite orbit propagation |
| **HiPS** | CDS/IVOA | Hierarchical Progressive Surveys |
| **Hipparcos** | ESA | Star catalog (~120,000 stars) |

### 3.3 Data Formats

| Format | Usage |
|--------|-------|
| `.eph` | Binary ephemeris data (stars, DSOs) |
| `.json` | Configuration, name indices |
| `.png` | Textures (Milky Way, planets) |
| `.geojson` | Constellation boundaries |

---

## 4. Component Design

### 4.1 Frontend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.vue                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Canvas (Engine View)                     ││
│  │         ┌─────────────────────────────────────────┐         ││
│  │         │         Stellarium Rendering            │         ││
│  │         └─────────────────────────────────────────┘         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                       Overlay Layer                         ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  ││
│  │  │ Gyro Direction│  │  AR Camera    │  │  DSO Overlays   │  ││
│  │  │   Overlay     │  │   Preview     │  │                 │  ││
│  │  └───────────────┘  └───────────────┘  └─────────────────┘  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                        UI Layer                             ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  ││
│  │  │  Bottom Bar   │  │ Search Panel  │  │ Settings Panel  │  ││
│  │  │  (Controls)   │  │               │  │                 │  ││
│  │  └───────────────┘  └───────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Service Architecture

| Service | File | Responsibility |
|---------|------|----------------|
| **GyroscopeService** | `gyroscope-service.js` | Device orientation to sky coordinates |
| **CameraService** | `camera-service.js` | Camera feed management for AR |
| **FullscreenService** | `fullscreen-service.js` | Immersive mode control |
| **SearchEngine** | `search_engine.js` | Sky object search and filtering |
| **AstronomyService** | `astronomy-service.js` | Event calculations (eclipses, phases) |
| **CalendarService** | `calendar-service.js` | Astronomical calendar events |

### 4.3 Engine Modules

The Stellarium engine is organized into modules, each handling a specific category of sky objects:

| Module | File | Objects Handled |
|--------|------|-----------------|
| **Stars** | `stars.c` | Hipparcos catalog stars |
| **Planets** | `planets.c` | Solar system bodies |
| **DSO** | `dso.c` | Galaxies, nebulae, clusters |
| **Constellations** | `constellations.c` | Constellation lines and art |
| **Satellites** | `satellites.c` | Artificial satellites (TLE) |
| **Comets** | `comets.c` | Comets and asteroids |
| **Milky Way** | `milkyway.c` | Galactic panorama texture |
| **Atmosphere** | `atmosphere.c` | Sky gradient and refraction |
| **Landscape** | `landscape.c` | Horizon panoramas |

---

## 5. Data Flow

### 5.1 Sensor to View Pipeline

```
┌─────────────────┐
│  Device Sensors │
│  (Gyroscope,    │
│   Accelerometer)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GyroscopeService│
│ (Orientation    │
│  Quaternion)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vue/Vuex      │
│ (State Update)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Engine Observer │
│ (set azimuth,   │
│  altitude)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Engine Render   │
│ (Sky View)      │
└─────────────────┘
```

### 5.2 Search Flow

```
┌─────────────────┐
│   User Input    │
│   "Orion"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SearchEngine   │
│  querySkySources│
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────┐              ┌─────────────────┐
│ Engine      │              │  Name Index     │
│ (live query)│              │  (JSON offline) │
└─────┬───────┘              └────────┬────────┘
      │                               │
      └───────────┬───────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Merge & Rank   │
         │  Results        │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Display List   │
         │  to User        │
         └─────────────────┘
```

---

## 6. Deployment Architecture

### 6.1 Build Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                        BUILD PIPELINE                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐         ┌─────────────┐         ┌────────────┐  │
│  │   C Source  │  make   │   WASM +    │  copy   │  Frontend  │  │
│  │   (Engine)  │ ──────► │   JS Glue   │ ──────► │   Assets   │  │
│  └─────────────┘         └─────────────┘         └─────┬──────┘  │
│                                                        │         │
│  ┌─────────────┐                                       │         │
│  │  Vue Source │                                       │         │
│  │  (Frontend) │                                       │         │
│  └──────┬──────┘                                       │         │
│         │                                              │         │
│         └──────────────────────┬───────────────────────┘         │
│                                │                                 │
│                                ▼                                 │
│                        ┌─────────────┐                           │
│                        │  npm build  │                           │
│                        │  (Webpack)  │                           │
│                        └──────┬──────┘                           │
│                               │                                  │
│                               ▼                                  │
│                        ┌─────────────┐                           │
│                        │  Capacitor  │                           │
│                        │    Sync     │                           │
│                        └──────┬──────┘                           │
│                               │                                  │
│                               ▼                                  │
│                        ┌─────────────┐                           │
│                        │  Android    │                           │
│                        │    APK      │                           │
│                        └─────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Output Artifacts

| Artifact | Location | Size |
|----------|----------|------|
| `stellarium-web-engine.wasm` | `apps/web-frontend/src/assets/js/` | ~3 MB |
| `stellarium-web-engine.js` | `apps/web-frontend/src/assets/js/` | ~200 KB |
| `dist/` | `apps/web-frontend/dist/` | ~50 MB |
| `app-debug.apk` | `android/app/build/outputs/apk/debug/` | ~80 MB |

---

## 7. Security Considerations

### 7.1 Data Security

| Concern | Mitigation |
|---------|------------|
| Offline data integrity | Data bundled at build time, not downloaded |
| Location privacy | Location stored locally only, not transmitted |
| No network dependency | All calculations performed locally |

### 7.2 Permission Model

| Permission | Purpose | Required |
|------------|---------|----------|
| CAMERA | AR overlay mode | Optional |
| ACCESS_FINE_LOCATION | Observer position | Optional |
| INTERNET | Not required for operation | No |

---

## 8. Performance Considerations

### 8.1 Rendering Optimization

- **60 FPS target** on mid-range devices
- **Level-of-detail** for star rendering based on magnitude
- **Tile-based loading** for HiPS surveys
- **Lazy loading** for DSO images

### 8.2 Memory Management

| Resource | Strategy |
|----------|----------|
| Star catalog | Binary format, memory-mapped |
| Textures | Loaded on demand, cached |
| Search index | Lazy-loaded on first search |
| DSO HiPS | Progressive loading |

### 8.3 Battery Optimization

- Sensor polling rate adjustable
- Frame rate reduction when idle
- Camera disabled when not in AR mode

---

## 9. Scalability

### 9.1 Data Extensibility

| Extension Point | Method |
|-----------------|--------|
| Additional stars | Add to `.eph` files |
| New DSO catalogs | Extend name index |
| Custom landscapes | Add panorama images |
| Sky cultures | Add constellation data |

### 9.2 Platform Extensibility

- **iOS support**: Capacitor-ready architecture
- **Web deployment**: No platform-specific code in frontend
- **Desktop**: Electron wrapper possible

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **DSO** | Deep Sky Object (galaxies, nebulae, clusters) |
| **ERFA** | Essential Routines for Fundamental Astronomy (IAU library) |
| **HiPS** | Hierarchical Progressive Surveys (sky image format) |
| **TLE** | Two-Line Element (satellite orbit format) |
| **WASM** | WebAssembly (portable binary format) |
| **Ephemeris** | Table of celestial object positions over time |
| **Azimuth** | Horizontal angle from north (compass direction) |
| **Altitude** | Vertical angle above horizon |
| **Magnitude** | Logarithmic brightness scale (lower = brighter) |
| **Right Ascension** | Celestial longitude (hours/minutes/seconds) |
| **Declination** | Celestial latitude (degrees) |

---

## 11. References

1. Stellarium Web Engine - https://github.com/Stellarium/stellarium-web-engine
2. ERFA Library - https://github.com/liberfa/erfa
3. Capacitor Documentation - https://capacitorjs.com/docs
4. HiPS Standard - https://www.ivoa.net/documents/HiPS/
5. Hipparcos Catalog - https://www.cosmos.esa.int/web/hipparcos

---

*Document prepared by: Astara Development Team*  
*Last updated: January 2026*
