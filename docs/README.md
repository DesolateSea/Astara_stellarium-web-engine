# Stellarium Web Engine Documentation

Welcome to the comprehensive documentation for Stellarium Web Engine - a JavaScript planetarium renderer using WebGL that can be embedded into websites and mobile applications.

## 📚 Documentation Index

### Core Documentation

- **[Architecture Overview](ARCHITECTURE.md)** - System architecture, design patterns, and component relationships
- **[Engine Internals](ENGINE_INTERNALS.md)** - Deep dive into the C/C++ core engine implementation
- **[API Reference](API_REFERENCE.md)** - Complete API documentation for all interfaces
- **[Setup & Build Guide](SETUP_GUIDE.md)** - Development environment setup and build instructions

### Frontend & Integration

- **[Frontend Guide](FRONTEND_GUIDE.md)** - Vue.js application architecture and components
- **[JavaScript Interface](JAVASCRIPT_INTERFACE.md)** - WebAssembly bindings and JavaScript API
- **[Android Integration](ANDROID_GUIDE.md)** - Android-specific implementation and customizations

### Data & Tools

- **[Data Formats](DATA_FORMATS.md)** - Documentation of all data formats and processing pipelines
- **[Tools & Utilities](TOOLS_GUIDE.md)** - Data processing scripts and asset generation tools

## 🚀 Quick Start

### For Developers
1. Start with [Setup & Build Guide](SETUP_GUIDE.md) to set up your development environment
2. Read [Architecture Overview](ARCHITECTURE.md) to understand the system design
3. Explore [Engine Internals](ENGINE_INTERNALS.md) for C/C++ engine details
4. Check [Frontend Guide](FRONTEND_GUIDE.md) for Vue.js application development

### For Integrators
1. Review [JavaScript Interface](JAVASCRIPT_INTERFACE.md) for embedding the engine
2. Check [API Reference](API_REFERENCE.md) for available methods and properties
3. See [Android Integration](ANDROID_GUIDE.md) for mobile app development

### For Data Contributors
1. Read [Data Formats](DATA_FORMATS.md) to understand data structures
2. Use [Tools & Utilities](TOOLS_GUIDE.md) for data processing workflows

## 🏗️ Project Structure

```
stellarium-web-engine-master/
├── src/                    # C/C++ core engine source code
│   ├── modules/           # Sky object modules (stars, planets, DSOs, etc.)
│   ├── algos/             # Astronomical algorithms
│   ├── projections/       # Projection systems
│   └── utils/             # Utility functions
├── apps/
│   └── web-frontend/      # Vue.js web application
│       ├── src/           # Frontend source code
│       ├── public/        # Static assets and data
│       └── android/       # Android (Capacitor) build
├── ext_src/               # External dependencies
├── data/                  # Data files
├── tools/                 # Build and data processing tools
└── docs/                  # This documentation
```

## 🎯 Key Features

- **Atmosphere Simulation** - Realistic sky rendering with atmospheric effects
- **HiPS Surveys** - High-resolution progressive surveys rendering
- **Planets & Solar System** - Accurate planetary positions and textures
- **Deep Sky Objects** - Comprehensive DSO catalog with imagery
- **Satellites** - Real-time satellite tracking using TLE data
- **Constellations & Sky Cultures** - Multiple cultural constellation representations
- **Search System** - Fast indexed search across 59,000+ celestial objects
- **Mobile Support** - Android app via Capacitor

## 📖 Documentation Conventions

- **Code blocks** include language-specific syntax highlighting
- **File paths** use absolute paths where applicable
- **API signatures** follow C/JavaScript conventions as appropriate
- **Examples** are provided for complex concepts

## 🔗 External Resources

- [Stellarium Labs Website](https://stellarium-labs.com)
- [GitHub Repository](https://github.com/Stellarium/stellarium-web-engine)
- [ERFA Library](https://github.com/liberfa/erfa) - Astronomical algorithms
- [Emscripten](https://emscripten.org/) - C/C++ to WebAssembly compiler

## 📝 License

Stellarium Web Engine is licensed under the GNU AGPL v3 license. See [LICENSE-AGPL-3.0.txt](../LICENSE-AGPL-3.0.txt) for details.

---

**Last Updated**: 2025-12-28  
**Version**: Based on current development branch
