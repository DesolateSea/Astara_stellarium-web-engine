# Astara

**Open-Source Mobile Planetarium App for Android**

An open source mobile planetarium application built on [Stellarium Web Engine](https://github.com/Stellarium/stellarium-web-engine) for Android. Astara provides a high-performance, offline-first sky map that fits in your pocket.

### Notable Features

- **Gyroscope Mode** — Point your phone to scan the sky in real-time using device sensors.
- **AR Camera Overlay** — Seamlessly overlay star maps onto your camera feed for easy identification.
- **Direction Tracking** — Intuitive visual guides help you locate specific celestial objects.
- **Comprehensive Database** — Search over 60,000 stars, planets, DSOs, and satellites.
- **Offline First** — No internet connection required; all sky data is bundled locally.
- **Privacy Focused** — Completely open-source with no tracking or ads.
For all features, see [docs/features.md](docs/features.md).

---

## Documentation

Explore the technical details and user guides:

- [Documentation Index](docs/index.md) — Complete documentation overview
- [User Manual](docs/user_manual.md) — comprehensive guide to using Astara
- [High-Level Design](docs/hld.md) — System architecture and design choices
- [Low-Level Design](docs/lld.md) — Detailed technical specifications and implementation
- [Architecture](docs/architecture.md) — Codebase structure and component interaction
- [Frontend Guide](docs/frontend.md) — Vue.js components, services, and state management
- [Setup Guide](docs/setup.md) — Detailed build instructions (Docker, Web, Android)
- [Upstream Relationship](docs/upstream.md) — Differences from Stellarium Web Engine

---

## Quick Start (Docker)

The recommended way to build Astara is using Docker, which handles all dependencies (Emscripten, Node.js, etc.) automatically.

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/DesolateSea/Astara_stellarium-web-engine.git astara
    cd astara
    ```

2.  **Install emscripten SDK**:
    ```bash
    git clone https://github.com/emscripten-core/emsdk.git
    ```

3.  **Setup and Build**
    ```bash
    cd apps/web-frontend

    # Compile the engine and install frontend dependencies
    sudo -E make setup
    
    # Builds the production web frontend
    sudo -E make build
    ```

4.  **Create Android APK**
   
    Set required environment variables:

    ```bash
    export CAPACITOR_ANDROID_STUDIO_PATH=/path/to/android-studio/bin/studio.sh
    ```
    ```bash
    export JAVA_HOME=/path/to/java-21-openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    ```

    Sync with Capacitor:

    ```bash
    make sync-android
    ```

    Build the debug APK:

    ```bash
    make build-apk
    ```

For a detailed guide, please refer to the [Setup Guide](docs/setup.md).

---

## Contributing

We welcome contributions! Please see the upstream [Stellarium Web CLA](doc/cla/sign-cla.md) before submitting pull requests.

For questions, feature requests, or bug reports, please open a GitHub issue.

---

## License

Astara is licensed under the **AGPL-3.0**, inherited from Stellarium Web Engine.

See [LICENSE-AGPL-3.0.txt](LICENSE-AGPL-3.0.txt) for the full license text.
