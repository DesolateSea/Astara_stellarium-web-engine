# Setup Guide

> **Windows users:** Use WSL (Windows Subsystem for Linux) for the build process.
> Native Windows builds are not supported.

## Table of Contents

1. [Build with Docker (Recommended)](#1-build-with-docker-recommended)
2. [Build Android APK](#2-build-android-apk)
3. [Manual Build (Alternative)](#3-manual-build-alternative)

---

## Prerequisites

Clone the Astara repository:

```bash
git clone https://github.com/DesolateSea/Astara_stellarium-web-engine.git astara
cd astara
```

Clone the Emscripten SDK:
> **Note:** Ensure it is installed in the `astara` root folder for the Docker method.

```bash
git clone https://github.com/emscripten-core/emsdk.git
```

## 1. Build with Docker (Recommended)

Ensure Docker is installed and running:

```bash
sudo systemctl status docker
# If not running:
sudo systemctl start docker
```

Navigate to the web frontend directory:

```bash
cd apps/web-frontend
```

Run the setup command. This will:
1. Build the Docker image for Emscripten compilation.
2. Compile the Stellarium Web Engine (WASM + JS) inside Docker.
3. Build the Docker image for the Node.js environment.
4. Install Node.js dependencies (using Yarn) inside Docker.

```bash
sudo -E make setup
```

Run frontend on dev server:

```bash
sudo -E make dev
```

Build the production frontend:

```bash
sudo -E make build
```

The build artifacts will be in `dist`.

---

## 2. Build Android APK

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

The APK will be located at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Sign the Release APK

Generate a keystore in the `android` directory (one-time setup):

```bash
cd android
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

Build the release APK:

```bash
./gradlew assembleRelease
```

Sign the APK using `apksigner`:

> **Note:** `apksigner` is located in `$ANDROID_HOME/build-tools/<version>/`. Use the full path if it's not in your PATH.

**macOS/Linux:**
```bash
$ANDROID_HOME/build-tools/34.0.0/apksigner sign --ks my-release-key.jks --out app-release-signed.apk app/build/outputs/apk/release/app-release.apk
```

**Windows (PowerShell/CMD):**
```powershell
%LOCALAPPDATA%\Android\Sdk\build-tools\34.0.0\apksigner sign --ks my-release-key.jks --out app-release-signed.apk app\build\outputs\apk\release\app-release.apk
```

Verify the signature:

**macOS/Linux:**
```bash
$ANDROID_HOME/build-tools/34.0.0/apksigner verify app-release-signed.apk
```

**Windows:**
```powershell
%LOCALAPPDATA%\Android\Sdk\build-tools\34.0.0\apksigner verify app-release-signed.apk
```

---

## 3. Manual Build (Alternative)

If you prefer to build web-frontend manually without Docker, follow these steps.

### 3.1. Setting Up Emscripten

Manually install and activate the Emscripten SDK:

```bash
cd emsdk
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

### 3.2. Build Stellarium Web Engine (WASM + JS)

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

### 3.3. Build Web Frontend

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

Build the production frontend:

```bash
npm run build
```