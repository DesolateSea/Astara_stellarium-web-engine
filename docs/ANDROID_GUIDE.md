# Android Integration Guide

This document covers Android-specific implementation details, build configuration, and customizations for the Stellarium Web mobile app.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Build Configuration](#build-configuration)
- [Capacitor Integration](#capacitor-integration)
- [Android-Specific Features](#android-specific-features)
- [Performance Optimizations](#performance-optimizations)
- [Asset Management](#asset-management)
- [Build and Deployment](#build-and-deployment)

## Overview

The Android app is built using **Capacitor**, which wraps the Vue.js web application in a native Android WebView. This approach allows:

- Single codebase for web and mobile
- Access to native Android APIs
- Offline functionality with bundled assets
- Native performance for UI

**App Details:**
- **Package ID**: `com.stellariumlabs.stellaweb`
- **App Name**: Stella
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: 33 (Android 13)
- **Capacitor Version**: 8.0.0

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Capacitor** | 8.0.0 | Native wrapper framework |
| **Android Gradle** | 7.x | Build system |
| **AndroidX** | Latest | Android support libraries |
| **WebView** | System | Web content rendering |

### Key Dependencies

```gradle
dependencies {
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
}
```

## Project Structure

```
apps/web-frontend/android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/          # Web app assets
│   │       │       ├── index.html
│   │       │       ├── js/
│   │       │       ├── css/
│   │       │       └── skydata/     # Astronomical data
│   │       ├── java/
│   │       │   └── com/stellariumlabs/stellaweb/
│   │       │       └── MainActivity.java
│   │       ├── res/
│   │       │   ├── values/
│   │       │   ├── drawable/
│   │       │   └── mipmap/          # App icons
│   │       └── AndroidManifest.xml
│   ├── build.gradle                 # App-level build config
│   └── capacitor.build.gradle       # Capacitor config
├── build.gradle                     # Project-level build config
├── gradle.properties                # Gradle properties
├── settings.gradle                  # Project settings
└── variables.gradle                 # Version variables
```

## Build Configuration

### App-Level build.gradle

**File**: [`apps/web-frontend/android/app/build.gradle`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/android/app/build.gradle)

```gradle
apply plugin: 'com.android.application'

android {
    namespace = "com.stellariumlabs.stellaweb"
    compileSdk = rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.stellariumlabs.stellaweb"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        
        aaptOptions {
            // Prevent asset compression for data files
            ignoreAssetsPattern = ''
        }
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 
                          'proguard-rules.pro'
        }
    }
}
```

### Version Variables

**File**: [`apps/web-frontend/android/variables.gradle`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/android/variables.gradle)

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 33
    targetSdkVersion = 33
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    coreSplashScreenVersion = '1.0.0'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    junitVersion = '4.13.2'
}
```

### Capacitor Configuration

**File**: [`apps/web-frontend/capacitor.config.json`](file:///d:/test/stellarium-web-engine-master/apps/web-frontend/capacitor.config.json)

```json
{
    "appId": "com.stellariumlabs.stellaweb",
    "appName": "Stella",
    "webDir": "dist",
    "bundledWebRuntime": false,
    "server": {
        "androidScheme": "https"
    },
    "android": {
        "allowMixedContent": true,
        "webContentsDebuggingEnabled": true
    }
}
```

**Key Settings:**
- `webDir`: Points to Vue.js build output
- `androidScheme`: Uses HTTPS for security
- `allowMixedContent`: Allows loading mixed HTTP/HTTPS content
- `webContentsDebuggingEnabled`: Enables Chrome DevTools debugging

## Capacitor Integration

### MainActivity

**File**: `apps/web-frontend/android/app/src/main/java/com/stellariumlabs/stellaweb/MainActivity.java`

```java
package com.stellariumlabs.stellaweb;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register custom plugins here if needed
        // registerPlugin(MyCustomPlugin.class);
    }
}
```

### Capacitor Plugins

The app uses these Capacitor plugins:

| Plugin | Purpose |
|--------|---------|
| `@capacitor/core` | Core Capacitor functionality |
| `@capacitor/android` | Android platform support |
| `@capacitor/device` | Device information API |

**Usage Example:**
```javascript
import { Device } from '@capacitor/device';

const info = await Device.getInfo();
console.log('Platform:', info.platform);
console.log('Model:', info.model);
```

## Android-Specific Features

### 1. Offline Data Access

All astronomical data is bundled in the APK for offline use:

```
app/src/main/assets/public/skydata/
├── stars/
│   └── hip.dat
├── dso/
│   └── dso.eph
├── satellites/
│   └── tle_satellite.dat
├── constellations/
├── skycultures/
└── name_index_compact.json
```

**Asset Loading:**
```javascript
// Assets are served from the bundled web directory
const response = await fetch('/skydata/name_index_compact.json');
const data = await response.json();
```

### 2. WebView Configuration

**AndroidManifest.xml Permissions:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**WebView Settings:**
- **Hardware Acceleration**: Enabled for WebGL
- **JavaScript**: Enabled
- **DOM Storage**: Enabled
- **File Access**: Enabled for local assets

### 3. Splash Screen

Uses AndroidX Core Splash Screen API:

**themes.xml:**
```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:windowSplashScreenBackground">@color/splash_background</item>
    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash</item>
</style>
```

### 4. Status Bar and Navigation Bar

Configured in Vue.js app:

```javascript
// src/App.vue
import { StatusBar } from '@capacitor/status-bar';

// Set status bar style
await StatusBar.setStyle({ style: Style.Dark });
await StatusBar.setBackgroundColor({ color: '#000000' });
```

### 5. Back Button Handling

Custom back button behavior:

```javascript
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    App.exitApp();
  }
});
```

## Performance Optimizations

### 1. Asset Compression

**Disabled for Data Files:**
```gradle
aaptOptions {
    // Don't compress data files
    ignoreAssetsPattern = ''
    // Optionally specify no-compress extensions
    // noCompress 'dat', 'eph', 'json', 'wasm'
}
```

This ensures data files are accessible without decompression overhead.

### 2. WebGL Optimization

**Hardware Acceleration:**
```xml
<application
    android:hardwareAccelerated="true">
```

**WebView Settings:**
```java
WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);
settings.setDatabaseEnabled(true);
```

### 3. Memory Management

**Heap Size:**
```xml
<application
    android:largeHeap="true">
```

Allows larger memory allocation for WebAssembly and data.

### 4. APK Size Optimization

**Techniques Used:**
- Asset compression (selective)
- ProGuard/R8 (disabled for debugging)
- Vector drawables for icons
- WebP format for images

**Current APK Size:** ~25-30 MB (with all data)

### 5. Startup Performance

**Optimizations:**
- Lazy loading of modules
- Progressive data loading
- Cached WebView
- Splash screen during initialization

## Asset Management

### Bundling Assets

**Build Process:**
```bash
# 1. Build Vue.js app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Copy additional assets (if needed)
cp -r public/skydata android/app/src/main/assets/public/
```

### Asset Updates

**For Data Updates:**
1. Update files in `public/skydata/`
2. Rebuild Vue.js app
3. Sync to Android
4. Rebuild APK

**For Code Updates:**
1. Update Vue.js code
2. Rebuild app
3. Sync to Android
4. Hot reload (development) or rebuild APK (production)

### Asset Access Patterns

**From JavaScript:**
```javascript
// Relative to public directory
const data = await fetch('/skydata/satellites/tle_satellite.dat');
```

**From WebAssembly:**
```c
// Using asset manager
const void *data;
int size;
asset_get_data("asset://skydata/stars/hip.dat", &size, NULL);
```

## Build and Deployment

### Development Build

```bash
# Terminal 1: Run Vue.js dev server
cd apps/web-frontend
npm run dev

# Terminal 2: Run on Android device
npx cap run android
```

**Live Reload:**
Configure in `capacitor.config.json`:
```json
{
  "server": {
    "url": "http://192.168.1.100:8080",
    "cleartext": true
  }
}
```

### Production Build

```bash
# 1. Build Vue.js app
cd apps/web-frontend
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK/AAB in Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Signing Configuration

**For Release:**

1. Create keystore:
```bash
keytool -genkey -v -keystore stella-release.keystore \
  -alias stella -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure in `build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("stella-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "stella"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
                          'proguard-rules.pro'
        }
    }
}
```

### Gradle Commands

```bash
# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease

# Install on device
./gradlew installDebug

# Run tests
./gradlew test
```

## Android-Specific Customizations

### 1. Custom Plugins

To add native functionality:

**Create Plugin:**
```java
@NativePlugin
public class MyPlugin extends Plugin {
    @PluginMethod
    public void myMethod(PluginCall call) {
        String value = call.getString("value");
        // Native code here
        call.resolve();
    }
}
```

**Register in MainActivity:**
```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(MyPlugin.class);
    }
}
```

**Use from JavaScript:**
```javascript
import { Plugins } from '@capacitor/core';
const { MyPlugin } = Plugins;

await MyPlugin.myMethod({ value: 'test' });
```

### 2. Orientation Handling

**Lock Orientation:**
```xml
<activity
    android:name=".MainActivity"
    android:screenOrientation="landscape">
```

**Or handle programmatically:**
```javascript
import { ScreenOrientation } from '@capacitor/screen-orientation';

await ScreenOrientation.lock({ orientation: 'landscape' });
```

### 3. Keep Screen On

```javascript
import { KeepAwake } from '@capacitor-community/keep-awake';

// Keep screen on
await KeepAwake.keepAwake();

// Allow screen to sleep
await KeepAwake.allowSleep();
```

### 4. Fullscreen Mode

```javascript
// Enter fullscreen
await StatusBar.hide();

// Exit fullscreen
await StatusBar.show();
```

## Debugging

### Chrome DevTools

1. Enable debugging in `capacitor.config.json`:
```json
{
  "android": {
    "webContentsDebuggingEnabled": true
  }
}
```

2. Open Chrome: `chrome://inspect`
3. Select device and inspect

### Android Studio Logcat

```bash
# Filter by app
adb logcat | grep "stellaweb"

# Filter by tag
adb logcat -s "Capacitor"

# Clear log
adb logcat -c
```

### Performance Profiling

**Android Studio Profiler:**
- CPU usage
- Memory allocation
- Network activity
- Energy consumption

## Common Issues

### 1. WebView Crashes

**Solution:** Increase heap size
```xml
<application android:largeHeap="true">
```

### 2. Asset Not Found

**Solution:** Check asset path and rebuild
```bash
npx cap sync android
```

### 3. CORS Errors

**Solution:** Use `androidScheme: "https"` in config

### 4. Slow Startup

**Solutions:**
- Optimize asset loading
- Use lazy loading
- Reduce initial bundle size
- Enable code splitting

## Future Enhancements

### Planned Features

- [ ] AR mode using ARCore
- [ ] Offline map tiles
- [ ] Background location tracking
- [ ] Widget support
- [ ] Wear OS companion app

### Performance Improvements

- [ ] Native rendering for critical paths
- [ ] Incremental data loading
- [ ] Better caching strategies
- [ ] WebAssembly SIMD support

---

**Next Steps:**
- See [Frontend Guide](FRONTEND_GUIDE.md) for Vue.js development
- Check [Setup Guide](SETUP_GUIDE.md) for build environment
- Read [Data Formats](DATA_FORMATS.md) for asset management
