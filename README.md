# Astara

An advanced mobile planetarium application built on [Stellarium Web Engine](https://github.com/Stellarium/stellarium-web-engine).

Point your phone at the sky and see what's out there.

---

## Notable Features

- **Gyroscope mode** — Point your phone, see the sky in real-time
- **AR camera overlay** — Stars overlaid on your camera feed
- **Direction tracking** — Visual indicator guides you to objects
- **Offline operation** — All sky data bundled locally
- **60,000+ searchable objects** — Stars, planets, DSOs, satellites

---

## Documentation

- [Documentation Index](docs/INDEX.md) — Complete documentation overview
- [User Manual](docs/USER_MANUAL.md) — How to use Astara
- [High-Level Design](docs/HLD.md) — System architecture
- [Low-Level Design](docs/LLD.md) — Detailed technical specifications
- [Architecture](docs/architecture.md) — How the app is structured
- [Frontend Guide](docs/frontend.md) — Vue components and services
- [Setup Guide](docs/setup.md) — Build instructions (web + Android)
- [Upstream Relationship](docs/upstream.md) — What changed from Stellarium Web Engine

---

## Quick Start

### Prerequisites

- Node.js 22
- Emscripten 1.40.1
- scons
- Docker (for engine build)
- Android Studio (for APK)

### Build

```bash
# 1. Build the engine
source /path/to/emsdk/emsdk_env.sh
make
cp build/stellarium-web-engine.* apps/web-frontend/src/assets/js/

# 2. Build the frontend
cd apps/web-frontend
npm install --legacy-peer-deps
export NODE_OPTIONS=--openssl-legacy-provider
npm run dev

# 3. Build android apk
npm run build
make sync-android
make build-apk
```

See [docs/setup.md](docs/setup.md) for full instructions.

---

## Contributing

See the upstream [Stellarium Web CLA](doc/cla/sign-cla.md).

For questions or issues, open a GitHub issue.

---

## License

AGPL-3.0 (inherited from Stellarium Web Engine)

See [LICENSE-AGPL-3.0.txt](LICENSE-AGPL-3.0.txt).

---

*Developed by the Astara Team*
