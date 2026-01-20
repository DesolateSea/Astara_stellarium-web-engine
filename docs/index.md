# Astara Documentation Index

## Overview

Astara is an advanced mobile planetarium application. Built on the Stellarium Web Engine, it provides real-time sky visualization with sensor-based interaction, augmented reality overlays, and comprehensive offline astronomical data.

### Key Features

- 🔭 **Gyroscope Mode** - Point your device to identify stars
- 📷 **AR Camera Overlay** - Stars overlaid on live camera feed
- 🧭 **Direction Tracking** - Visual guide to locate objects
- ✈️ **Offline Operation** - 60,000+ objects bundled locally
- 📅 **Astronomical Calendar** - Moon phases, eclipses, conjunctions
- 🌍 **Multi-Culture Support** - IAU, Indian, Chinese sky cultures

---

## Documentation Map

### Architecture & Technical

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | System architecture overview |
| [features.md](features.md) | Complete list of Astara features |
| [frontend.md](frontend.md) | Vue.js frontend guide |
| [upstream.md](upstream.md) | Relationship with Stellarium Web Engine |

### Design Documents

| Document | Description |
|----------|-------------|
| [hld.md](hld.md) | High-Level Design - System architecture, components, and data flow |
| [lld.md](lld.md) | Low-Level Design - Detailed code specifications and algorithms |

### User Guides

| Document | Description |
|----------|-------------|
| [user_manual.md](user_manual.md) | Complete user guide for operating Astara |
| [setup.md](setup.md) | Build and installation instructions |

### Engine Documentation

| Document | Description |
|----------|-------------|
| [internals.md](../doc/internals.md) | Stellarium Web Engine internals |

---

## Quick Links

### For Users

1. **Getting Started** → [user_manual.md](user_manual.md#3-quick-start-guide)
2. **Features** → [user_manual.md](user_manual.md#5-core-features)
3. **Troubleshooting** → [user_manual.md](user_manual.md#10-troubleshooting)

### For Developers

1. **Architecture** → [hld.md](hld.md#2-system-architecture)
2. **Build Setup** → [setup.md](setup.md)
3. **Code Structure** → [lld.md](lld.md#1-project-structure)
4. **Services** → [lld.md](lld.md#4-service-layer-design)

### For Administrators

1. **Installation** → [setup.md](setup.md)
2. **Configuration** → [lld.md](lld.md#5-state-management)

---

## Document Summary

### hld.md - High-Level Design

The High-Level Design document provides:
- Executive summary and purpose
- Three-layer architecture (Native, Web, Engine)
- Technology stack details
- Component design overview
- Data flow diagrams
- Deployment architecture
- Security considerations
- Performance optimization strategies

### lld.md - Low-Level Design

The Low-Level Design document covers:
- Complete project structure
- Engine object system (C/WASM)
- Module registration and rendering pipeline
- Frontend Vue.js architecture
- Service layer implementations (Gyroscope, Search, Astronomy)
- Vuex state management
- Component specifications with code
- Algorithm specifications
- Data format specifications
- Build system configuration
- Testing specifications

### user_manual.md - User Manual

The User Manual includes:
- Introduction and system requirements
- Installation guide
- Quick start guide
- User interface explanation
- Core features (Gyroscope, AR, Constellations, Time)
- Search and navigation
- Settings and configuration
- Astronomical calendar
- Advanced features (DSO overlays, Satellites)
- Troubleshooting guide
- Reference appendices

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Engine | C + WebAssembly | Astronomical calculations |
| Frontend | Vue.js 2 + Vuex | User interface |
| Mobile | Capacitor 4 | Android wrapper |
| Sensors | Device APIs | Gyroscope, Camera |
| Data | JSON + Binary | Star catalogs |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2026 | Initial documentation release |

---

## Contributing

For documentation updates:

1. Follow existing document structure
2. Use markdown formatting consistently
3. Update index.md when adding documents
4. Keep technical accuracy with code