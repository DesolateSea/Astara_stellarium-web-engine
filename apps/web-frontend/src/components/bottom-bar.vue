// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="bottom-bar-container">
    <!-- Left section: Menu trigger -->
    <div class="bottom-bar-left">
      <v-btn icon class="menu-trigger" @click="toggleMenuPanel">
        <v-icon>mdi-layers-outline</v-icon>
      </v-btn>
    </div>

    <!-- Center section: Compass -->
    <div class="bottom-bar-center" @click="onCompassClick">
      <!-- FOV Display (Fixed position, does not rotate) -->
      <transition name="fade">
        <div class="fov-display" v-show="showFov">
          FOV {{ currentFov }}°
        </div>
      </transition>

      <div class="compass-container" :style="{ transform: 'rotate(' + (-azimuthDegrees) + 'deg)' }">
        <div class="compass-pointer" ref="compassNeedle">
          <div class="pointer-north"></div>
          <div class="pointer-south"></div>
        </div>
        <span class="compass-letter compass-n" :class="{ active: isNorth }">N</span>
        <span class="compass-letter compass-e" :class="{ active: isEast }">E</span>
        <span class="compass-letter compass-s" :class="{ active: isSouth }">S</span>
        <span class="compass-letter compass-w" :class="{ active: isWest }">W</span>
      </div>
    </div>

    <!-- Right section: Time -->
    <div class="bottom-bar-right" @click="showTimePicker = !showTimePicker">
      <div class="time-display">
        {{ time }}
      </div>
    </div>

    <transition name="slide-up">
      <div class="menu-overlay" v-if="showMenuPanel" @click.self="closeMenu">
        <BottomMenuPanel />
      </div>
    </transition>

    <!-- Time picker dialog -->
    <v-dialog v-model="showTimePicker" max-width="400">
      <date-time-picker v-model="pickerDate" :location="$store.state.currentLocation"></date-time-picker>
    </v-dialog>

    <!-- Gyro Activation Dialog - Pill Banner -->
    <transition name="fade">
      <div v-if="showGyroDialog" class="gyro-pill-container">
        <div class="gyro-pill" @click.stop>
          <v-icon size="28" color="white">mdi-compass</v-icon>
          <span class="gyro-pill-text">Point your device up!</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import DateTimePicker from '@/components/date-time-picker.vue'
import BottomMenuPanel from '@/components/bottom-menu/BottomMenuPanel.vue'
import Moment from 'moment'
import GyroscopeService from '@/assets/gyroscope-service.js'

export default {
  components: {
    DateTimePicker,
    BottomMenuPanel
  },
  data: function () {
    return {
      showMenuPanel: false,
      showTimePicker: false,
      rafId: null,
      showFov: false,
      fovTimeout: null,
      showGyroDialog: false,
      pitchListener: null
    }
  },
  computed: {
    time: {
      get: function () {
        return this.getLocalTime().format('HH:mm')
      }
    },
    date: {
      get: function () {
        return this.getLocalTime().format('YYYY-MM-DD')
      }
    },
    pickerDate: {
      get: function () {
        const t = this.getLocalTime()
        t.milliseconds(0)
        return t.format()
      },
      set: function (v) {
        const m = Moment(v)
        m.local()
        m.milliseconds(this.getLocalTime().milliseconds())
        this.$stel.core.observer.utc = m.toDate().getMJD()
      }
    },
    currentFov: function () {
      const fovRad = this.$store.state.stel?.fov || 0
      return (fovRad * 180 / Math.PI).toFixed(1)
    },
    // Azimuth in degrees (0-360), 0 = North, 90 = East, 180 = South, 270 = West
    azimuthDegrees: function () {
      const yaw = this.$store.state.stel?.observer?.yaw || 0
      // Convert radians to degrees and normalize to 0-360
      let degrees = (yaw * 180 / Math.PI) % 360
      if (degrees < 0) degrees += 360
      return degrees
    },
    // Direction detection (within 45 degrees of each cardinal direction)
    isNorth: function () {
      const az = this.azimuthDegrees
      return az >= 315 || az < 45
    },
    isEast: function () {
      const az = this.azimuthDegrees
      return az >= 45 && az < 135
    },
    isSouth: function () {
      const az = this.azimuthDegrees
      return az >= 135 && az < 225
    },
    isWest: function () {
      const az = this.azimuthDegrees
      return az >= 225 && az < 315
    }
  },
  watch: {
    currentFov: function () {
      this.showFov = true
      if (this.fovTimeout) clearTimeout(this.fovTimeout)
      this.fovTimeout = setTimeout(() => {
        this.showFov = false
      }, 2000)
    }
  },
  methods: {
    getLocalTime: function () {
      var d = new Date()
      d.setMJD(this.$store.state.stel.observer.utc)
      const m = Moment(d)
      m.local()
      return m
    },
    toggleMenuPanel () {
      this.showMenuPanel = !this.showMenuPanel
    },
    closeMenu () {
      this.showMenuPanel = false
    },
    onCompassClick () {
      // If sensors are disabled in settings, do nothing
      if (!this.$store.state.sensorsEnabled) return

      // If gyro is already active, do nothing (swipe will disable it)
      if (this.$store.state.gyroModeActive) return

      // Show the dialog and start listening for pitch
      this.showGyroDialog = true
      this.pitchListener = this.onPitchCheck.bind(this)
      window.addEventListener('deviceorientation', this.pitchListener, true)
    },
    onPitchCheck (event) {
      // Calculate the angle between device's back camera direction and vertical (zenith)
      // Using device orientation: beta = front-back tilt, gamma = left-right tilt
      const beta = event.beta
      const gamma = event.gamma
      if (beta === null || gamma === null) return

      // Convert to radians
      const betaRad = beta * Math.PI / 180
      const gammaRad = gamma * Math.PI / 180

      // Calculate the z-component (vertical) of the back camera direction vector
      // When device screen faces up (back camera points down): z = -1
      // When device is upright (back camera points forward): z = 0
      // z = cos(beta) * cos(gamma) for back camera direction
      const zComponent = Math.cos(betaRad) * Math.cos(gammaRad)

      // Zenith angle = angle from vertical axis = acos(|z|)
      // But we want angle from UP direction, so we use -z (since back camera points down when screen faces sky)
      // Actually when screen faces sky, beta ≈ 0, gamma ≈ 0, so cos(0)*cos(0) = 1
      // The back camera points in -Z direction of screen, which is DOWN when screen faces sky
      // So zenith angle = acos(zComponent) when zComponent > 0 means screen facing up

      const zenithAngleDeg = Math.acos(Math.abs(zComponent)) * 180 / Math.PI

      console.log('[GyroActivation] Zenith angle:', zenithAngleDeg.toFixed(1) + '°')

      // If zenith angle < 60°, device is pointed up enough
      if (zenithAngleDeg < 60) {
        this.activateGyro()
      }
    },
    cancelGyroDialog () {
      this.showGyroDialog = false
      if (this.pitchListener) {
        window.removeEventListener('deviceorientation', this.pitchListener, true)
        this.pitchListener = null
      }
    },
    async activateGyro () {
      // Stop listening for pitch
      if (this.pitchListener) {
        window.removeEventListener('deviceorientation', this.pitchListener, true)
        this.pitchListener = null
      }
      this.showGyroDialog = false

      // Start gyroscope service
      if (this.$stel && this.$stel.core) {
        const success = await GyroscopeService.start(this.$stel.core, () => {
          // Callback when gyro auto-stops (on touch)
          this.$store.commit('setGyroModeActive', false)
        })
        if (success) {
          this.$store.commit('setGyroModeActive', true)
        }
      }
    },
    initCompass () {
      let latestHeading = 0
      let smoothHeading = 0

      this.onOrientation = (e) => {
        let heading = null

        // iOS has direct compass heading
        if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
          heading = e.webkitCompassHeading
        } else if (e.absolute && e.alpha !== null) {
          // On Android, alpha represents the compass heading directly
          // 0 = North, 90 = East, 180 = South, 270 = West
          heading = e.alpha
        }

        if (heading !== null) {
          latestHeading = heading
        }
      }

      window.addEventListener(
        'deviceorientationabsolute',
        this.onOrientation,
        true
      )

      const update = () => {
        // Low-pass filter for smooth rotation
        smoothHeading += (latestHeading - smoothHeading)

        const needle = this.$refs.compassNeedle
        if (needle) {
          // Counter-rotate by azimuthDegrees to compensate for container rotation
          const azimuth = this.$store.state.stel?.observer?.yaw || 0
          const azimuthDeg = (azimuth * 180 / Math.PI) % 360
          const finalRotation = smoothHeading + azimuthDeg
          needle.style.transform = 'translate(-50%, -50%) rotate(' + finalRotation + 'deg)'
        }
        this.rafId = requestAnimationFrame(update)
      }

      update()
    }
  },
  mounted () {
    this.initCompass()
  },
  beforeDestroy () {
    if (this.onOrientation) {
      window.removeEventListener('deviceorientationabsolute', this.onOrientation)
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}
</script>

<style scoped>
.bottom-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 24px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.bottom-bar-left,
.bottom-bar-center,
.bottom-bar-right {
  pointer-events: auto;
}

.bottom-bar-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.bottom-bar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.bottom-bar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.menu-trigger {
  background: transparent !important;
  color: white !important;
  width: 56px !important;
  height: 56px !important;
}

.menu-trigger .v-icon {
  font-size: 36px !important;
}

.compass-container {
  position: relative;
  width: 60px;
  height: 60px;
  transition: transform 0.1s ease-out;
}

.compass-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  will-change: transform;
}

.pointer-north {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid rgba(255, 255, 255, 0.8);
}

.pointer-south {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.4);
}

.compass-letter {
  position: absolute;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;
}

.compass-letter.active {
  color: #ff6b6b;
  font-weight: 700;
}

.compass-n {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.compass-e {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.compass-s {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.compass-w {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.time-display {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.menu-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.3);
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.fov-display {
  position: absolute;
  top: -40px; /* Moved up slightly since it's now relative to center container */
  left: 50%;
  transform: translateX(-50%); /* Use transform for centering instead of margin */
  width: 80px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

/* Gyro Activation Pill Banner */
.gyro-pill-container {
  position: fixed;
  top: 45%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 60;
  pointer-events: none;
}

.gyro-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(31, 17, 181, 0.404);
  border-radius: 20px;
  padding: 12px 24px 12px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.gyro-pill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.gyro-pill-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
}
</style>
