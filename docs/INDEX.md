# Astara Documentation Index

**Version:** 1.0  
**Date:** January 2026  
**Classification:** RESTRICTED  
**Organization:** Astara Development Team

---

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

### Design Documents

| Document | Description | Status |
|----------|-------------|--------|
| [HLD.md](HLD.md) | High-Level Design - System architecture, components, and data flow | ✅ Complete |
| [LLD.md](LLD.md) | Low-Level Design - Detailed code specifications and algorithms | ✅ Complete |

### User Guides

| Document | Description | Status |
|----------|-------------|--------|
| [USER_MANUAL.md](USER_MANUAL.md) | Complete user guide for operating Astara | ✅ Complete |
| [setup.md](setup.md) | Build and installation instructions | ✅ Complete |

### Architecture & Technical

| Document | Description | Status |
|----------|-------------|--------|
| [architecture.md](architecture.md) | System architecture overview | ✅ Complete |
| [frontend.md](frontend.md) | Vue.js frontend guide | ✅ Complete |
| [upstream.md](upstream.md) | Relationship with Stellarium Web Engine | ✅ Complete |

### Engine Documentation

| Document | Description | Status |
|----------|-------------|--------|
| [internals.md](../doc/internals.md) | Stellarium Web Engine internals | ✅ Complete |

---

## Quick Links

### For Users

1. **Getting Started** → [USER_MANUAL.md](USER_MANUAL.md#3-quick-start-guide)
2. **Features** → [USER_MANUAL.md](USER_MANUAL.md#5-core-features)
3. **Troubleshooting** → [USER_MANUAL.md](USER_MANUAL.md#10-troubleshooting)

### For Developers

1. **Architecture** → [HLD.md](HLD.md#2-system-architecture)
2. **Build Setup** → [setup.md](setup.md)
3. **Code Structure** → [LLD.md](LLD.md#1-project-structure)
4. **Services** → [LLD.md](LLD.md#4-service-layer-design)

### For Administrators

1. **Installation** → [setup.md](setup.md)
2. **Configuration** → [LLD.md](LLD.md#5-state-management)

---

## Document Summary

### HLD.md - High-Level Design

The High-Level Design document provides:
- Executive summary and purpose
- Three-layer architecture (Native, Web, Engine)
- Technology stack details
- Component design overview
- Data flow diagrams
- Deployment architecture
- Security considerations
- Performance optimization strategies

### LLD.md - Low-Level Design

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

### USER_MANUAL.md - User Manual

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
3. Update INDEX.md when adding documents
4. Keep technical accuracy with code

---

## Contact

For questions or issues regarding Astara documentation, contact the development team through official IAF channels.

---

*Astara Development Team*  
*Astara Development Team*
