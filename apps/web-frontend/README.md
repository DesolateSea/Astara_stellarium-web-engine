# Stellarium Web frontend

This directory contains the Graphical User Interface for using
Stellarium Web Engine in a web page.

This is a Vuejs project, which can generate a fully static webpage with webpack.

Official page: [stellarium-web.org](https://stellarium-web.org)

---

## Prerequisites

- **Node.js** (v14-v20 recommended, NOT v22+)
- **npm** (comes with Node.js)
- **Android Studio** (for Android APK builds)

---

## Quick Start (Development)

### macOS / Linux

```bash
# Install dependencies
npm install

# Run development server (with legacy OpenSSL fix)
export NODE_OPTIONS=--openssl-legacy-provider && npm run dev
```

### Windows (PowerShell)

```powershell
# Install dependencies
npm install

# Run development server (with legacy OpenSSL fix)
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev
```

### Windows (Command Prompt)

```cmd
# Install dependencies
npm install

# Run development server (with legacy OpenSSL fix)
set NODE_OPTIONS=--openssl-legacy-provider && npm run dev
```

The app will be available at `http://localhost:8080`

---

## Build for Production

### macOS / Linux

```bash
export NODE_OPTIONS=--openssl-legacy-provider && npm run build
```

### Windows (PowerShell)

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run build
```

The production files will be in the `dist/` folder.

---

## Build Android APK

### Step 1: Build Web Assets

```bash
# macOS / Linux
export NODE_OPTIONS=--openssl-legacy-provider && npm run build

# Windows (PowerShell)
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run build
```

### Step 2: Copy Assets to Android

```bash
# macOS / Linux
rm -rf android/app/src/main/assets/public
mkdir -p android/app/src/main/assets/public
cp -r dist/* android/app/src/main/assets/public/
cp capacitor.config.json android/app/src/main/assets/

# Windows (PowerShell)
Remove-Item -Recurse -Force android\app\src\main\assets\public -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path android\app\src\main\assets\public
Copy-Item -Recurse dist\* android\app\src\main\assets\public\
Copy-Item capacitor.config.json android\app\src\main\assets\
```

### Step 3: Build APK

```bash
cd android

# macOS / Linux
./gradlew assembleDebug

# Windows
gradlew.bat assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## OTA Development (Live Reload on Device)

For testing on a real device with hot reload:

1. Edit `capacitor.config.json`:
```json
{
    "server": {
        "androidScheme": "https",
        "url": "http://YOUR_IP:8080",
        "cleartext": true
    }
}
```

2. Run the dev server and rebuild the Android app.

> **Note:** Remember to remove the `url` property before building the final APK for offline use.

---

## Build setup using Docker

Make sure docker is installed, then:

```bash
# generate the docker image and build engine WASM/js files
make setup

# build and run the web GUI (go to http://localhost:8080)
make dev

# Compile production version with minification
make build

# Host on test server (http://localhost:8000)
make start

# Update the engine
make update-engine
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
