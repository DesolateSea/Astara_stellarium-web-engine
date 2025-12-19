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

## Build Setup Using Docker (Complete Guide)

This project requires the Stellarium Web Engine files (`stellarium-web-engine.js` and `stellarium-web-engine.wasm`) to run. These are compiled from C source code using Emscripten and Docker.

### Prerequisites

- **Docker** installed and running ([Get Docker](https://www.docker.com/get-started/))
- **Node.js** v14-v20 (for local development after engine build)
- **npm** (comes with Node.js)

### Step 1: Build the Engine Files (One-Time Setup)

Navigate to the web-frontend directory and run:

```bash
cd apps/web-frontend
make setup
```

**What this command does:**
1. Builds a Docker image (`swe-dev`) with Emscripten compiler
2. Compiles the Stellarium Web Engine from C source to WebAssembly
3. Copies `stellarium-web-engine.js` and `stellarium-web-engine.wasm` to `src/assets/js/`
4. Builds a Node.js Docker image for the web frontend
5. Runs `yarn install` inside the container

> ⏱️ **Note:** This can take 10-30+ minutes on first run depending on your machine.

### Step 2: Handle Node.js Version Mismatch (If Needed)

If `make setup` fails at the `yarn install` step with an error like:
```
error @capacitor/cli@8.0.0: The engine "node" is incompatible with this module. Expected version ">=22.0.0". Got "12.10.0"
```

**Don't worry!** The engine files were still built successfully. You can run locally instead:

```bash
# Install dependencies locally (outside Docker)
npm install

# Run development server
export NODE_OPTIONS=--openssl-legacy-provider && npm run dev
```

The app will be available at `http://localhost:8080`

### Step 3: Run the Development Server

**Option A: Using Docker**
```bash
make dev
```

**Option B: Using npm directly (recommended if you hit Node version issues)**
```bash
export NODE_OPTIONS=--openssl-legacy-provider && npm run dev
```

---

## Make Commands Reference

| Command | Description |
|---------|-------------|
| `make setup` | One-time setup: build Docker images and compile engine files |
| `make dev` | Run development server via Docker (http://localhost:8080) |
| `make build` | Compile production version with minification |
| `make start` | Host production build on test server (http://localhost:7070) |
| `make update-engine` | Rebuild only the engine files (after C source changes) |
| `make lint` | Run linter |

---

## Troubleshooting

### Missing Engine Files Error
```
These dependencies were not found:
* @/assets/js/stellarium-web-engine.js
* @/assets/js/stellarium-web-engine.wasm
```

**Solution:** Run `make setup` to build the engine files, or `make update-engine` if you only need to rebuild them.

### OpenSSL Legacy Provider Error
If you see OpenSSL-related errors when running `npm run dev`:

```bash
# macOS / Linux
export NODE_OPTIONS=--openssl-legacy-provider && npm run dev

# Windows (PowerShell)
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev
```

### Docker Not Found
Ensure Docker Desktop is installed and running. Download from [docker.com/get-started](https://www.docker.com/get-started/).

---

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
