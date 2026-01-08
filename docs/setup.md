# Setup Guide

> **Windows users:** Use WSL (Windows Subsystem for Linux) for the build process.
> Native Windows builds are not supported.

## Table of Contents

1. [Setting Up Emscripten and SConstruct](#1-setting-up-emscripten)
2. [Build Stellarium Web Engine (WASM + JS)](#2-build-stellarium-web-engine-wasm--js)
3. [Build Web Frontend](#3-build-web-frontend)
4. [Build Android APK](#4-build-android-apk)

## 1. Setting Up Emscripten

Clone the Emscripten SDK:

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
```

Install and activate the SDK:

```bash
./emsdk install latest
./emsdk activate latest     # writes .emscripten file 
source ./emsdk_env.sh       # Active PATH and other environment variables in current terminal
```

Install additional versions required by Stellarium:

```bash
# Get a tip-of-tree
./emsdk install tot 

# Install required emscripten version
./emsdk install 1.40.1
./emsdk activate 1.40.1
source ./emsdk_env.sh
```

> **Note:** Stellarium Web Engine is sensitive to Emscripten versions.
> Version `1.40.1` is known to work reliably.

Install `scons` (choose one):

```bash
sudo apt-get install scons        # Debian / Ubuntu
sudo dnf install scons            # Fedora
pip install scons                 # Python
```

---

## 2. Build Stellarium Web Engine (WASM + JS)

Ensure Docker is installed and running:

```bash
sudo systemctl status docker
sudo systemctl start docker
```

Clone the VayuView repository:

```bash
git clone https://github.com/DesolateSea/VayuView vayuview
cd VayuView
```

Activate Emscripten:

```bash
source /path/to/emsdk/emsdk_env.sh
```

Build the engine:

```bash
make
```

Copy the generated artifacts into the frontend:

```bash
cp build/stellarium-web-engine.* apps/web-frontend/src/assets/js/
```

This produces:

* `stellarium-web-engine.js`
* `stellarium-web-engine.wasm`

---

## 3. Build Web Frontend

Node.js **22** is recommended.

```bash
cd apps/web-frontend
npm install --legacy-peer-deps
```

Workaround for OpenSSL compatibility:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

Run the dev server:

```bash
npm run dev
```

---

## 4. Build Android APK

Set required environment variables:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH=/path/to/android-studio/bin/studio.sh
```
```bash
export JAVA_HOME=/path/to/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```

Build the production frontend:

```bash
npm run build
```

Sync with Capacitor:

```bash
make sync-android
```

Build the debug APK:

```bash
make build-apk
```

The APK will be located at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```