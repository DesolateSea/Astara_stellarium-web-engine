<template>
  <transition name="fade">
    <div v-if="showOverlay" class="gyro-direction-overlay">
      <!-- Circular guide with arrow -->
      <div class="direction-circle">
        <svg class="direction-svg" viewBox="-30 -30 240 240" style="overflow: visible;">
          <!-- Outer circle (main guide) - reduced radius, thicker stroke -->
          <circle cx="90" cy="90" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="5"/>

          <!-- Triangle outside circle (dynamic base width) - fades based on FOV -->
          <g v-if="triangleOpacity > 0" :transform="`rotate(${arrowRotation}, 90, 90)`" :opacity="triangleOpacity">
            <polygon :points="trianglePoints" fill="rgba(255,255,255,0.15)"/>
          </g>

          <!-- Angle text near triangle (inside circumference), always horizontal - fades with triangle -->
          <g v-if="triangleOpacity > 0" :transform="`rotate(${arrowRotation}, 90, 90)`" :opacity="triangleOpacity">
            <text
              x="90"
              y="45"
              text-anchor="middle"
              dominant-baseline="middle"
              :transform="`rotate(${-arrowRotation}, 90, 45)`"
              fill="rgba(255,255,255,0.85)"
              font-size="14"
              font-weight="400"
            >{{ angleToTarget }}°</text>
          </g>
        </svg>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'GyroDirectionOverlay',
  data () {
    return {
      arrowRotation: 0,
      angleToTarget: 0,
      updateInterval: null
    }
  },
  computed: {
    gyroModeActive () {
      return this.$store.state.gyroModeActive
    },
    targetObject () {
      return this.$store.state.gyroTargetObject
    },
    showOverlay () {
      return this.gyroModeActive && this.targetObject
    },
    // Get current FOV in degrees
    currentFovDegrees () {
      const fovRad = this.$store.state.stel?.fov || (60 * Math.PI / 180)
      return fovRad * 180 / Math.PI
    },
    // Outer radius: where fade starts (tip of triangle touches outer circle)
    fadeOuterAngle () {
      return this.currentFovDegrees / 2
    },
    // Inner radius: where fade completes (object is fully "inside")
    fadeInnerAngle () {
      return this.currentFovDegrees / 4
    },
    // Calculate opacity: 1 when angle >= outerAngle, 0 when angle <= innerAngle
    triangleOpacity () {
      const angle = this.angleToTarget
      const outer = this.fadeOuterAngle
      const inner = this.fadeInnerAngle

      if (angle >= outer) return 1
      if (angle <= inner) return 0

      // Linear fade between inner and outer
      return (angle - inner) / (outer - inner)
    },
    // Dynamic triangle base width based on angle
    // At 180°: equilateral (base = height, ratio 1:1)
    // At 0°: wide (base = 4x height, ratio 4:1)
    // Linear interpolation between
    triangleBaseRatio () {
      const angle = this.angleToTarget
      // Clamp angle to 0-180
      const clampedAngle = Math.max(0, Math.min(180, angle))
      // At 0° -> ratio = 4, at 180° -> ratio = 1
      // Linear: ratio = 4 - (3 * angle / 180) = 4 - angle / 60
      return 4 - (3 * clampedAngle / 180)
    },
    // Calculate triangle points dynamically
    // Triangle is positioned outside circle (radius 60, so edge at y=30 from center at 90)
    // With gap of 15 units, triangle base at y=15, tip further up
    trianglePoints () {
      const height = 30
      const baseWidth = height * this.triangleBaseRatio
      const halfBase = baseWidth / 2

      // Position triangle with gap from circle
      // Circle edge at y = 90 - 60 = 30, gap of 15 -> base at y = 15
      const baseY = 15
      const tipY = baseY - height // tipY = -15

      const tipX = 90
      const leftX = 90 - halfBase
      const rightX = 90 + halfBase

      return tipX + ',' + tipY + ' ' + leftX + ',' + baseY + ' ' + rightX + ',' + baseY
    }
  },
  watch: {
    showOverlay (newVal) {
      if (newVal) {
        this.startUpdating()
      } else {
        this.stopUpdating()
      }
    },
    // Watch for target object changes to update direction immediately
    targetObject (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        // Trigger immediate update when target changes
        this.$nextTick(() => {
          this.updateDirection()
        })
      }
    }
  },
  methods: {
    startUpdating () {
      // Use requestAnimationFrame for smoother updates synced with browser repaint
      const update = () => {
        if (!this.showOverlay) return // Stop if overlay is hidden
        this.updateDirection()
        this.updateInterval = requestAnimationFrame(update)
      }
      // Initial update
      this.updateDirection()
      this.updateInterval = requestAnimationFrame(update)
    },
    stopUpdating () {
      if (this.updateInterval) {
        cancelAnimationFrame(this.updateInterval)
        this.updateInterval = null
      }
    },
    updateDirection () {
      if (!this.targetObject || !this.$stel || !this.$stel.core) return

      try {
        const observer = this.$stel.core.observer
        const target = this.targetObject

        // Get target's position in ICRF (cartesian unit vector)
        let targetRadec = null

        // First, try to use the current Stellarium selection if it matches our target
        if (this.$stel.core.selection) {
          targetRadec = this.$stel.core.selection.getInfo('radec')
        }

        // If no selection or it failed, try to look up by name
        if (!targetRadec && target.names && target.names.length > 0) {
          const obj = this.$stel.getObjByName(target.names[0])
          if (obj) {
            targetRadec = obj.getInfo('radec')
          }
        }

        // Fallback: use stored RA/Dec from model_data
        if (!targetRadec && target.model_data) {
          if (target.model_data.ra !== undefined && target.model_data.dec !== undefined) {
            // RA in hours, Dec in degrees
            const raRad = target.model_data.ra * 15 * Math.PI / 180
            const decRad = target.model_data.dec * Math.PI / 180
            targetRadec = this.$stel.s2c([raRad, decRad])
          }
        }

        if (!targetRadec) return

        // Convert target from ICRF to OBSERVED frame
        // OBSERVED frame: X = North, Y = East, Z = Zenith (up)
        const targetObsRaw = this.$stel.convertFrame(observer, 'ICRF', 'OBSERVED', targetRadec)

        // Normalize target vector 't'
        const tLen = Math.sqrt(targetObsRaw[0] ** 2 + targetObsRaw[1] ** 2 + targetObsRaw[2] ** 2)
        const t = [targetObsRaw[0] / tLen, targetObsRaw[1] / tLen, targetObsRaw[2] / tLen]

        // Get observer view angles
        const yaw = observer.yaw // Azimuth: 0 = North, positive = East
        const pitch = observer.pitch // Elevation: 0 = horizon, positive = up
        const roll = observer.roll || 0 // Roll: rotation of screen around view axis

        const cosPitch = Math.cos(pitch)
        const sinPitch = Math.sin(pitch)
        const cosYaw = Math.cos(yaw)
        const sinYaw = Math.sin(yaw)

        // View direction 'o' in OBSERVED frame
        const o = [
          cosPitch * cosYaw, // North component
          cosPitch * sinYaw, // East component
          sinPitch // Up component
        ]

        // Calculate angular distance: angle = acos(t · o)
        const tDotO = t[0] * o[0] + t[1] * o[1] + t[2] * o[2]
        const angle = Math.acos(Math.max(-1, Math.min(1, tDotO))) * 180 / Math.PI
        this.angleToTarget = Math.round(angle)

        // --- Planar Projection (More accurate than t - o) ---
        // Project target 't' onto the plane perpendicular to view 'o'
        // v_proj = t - (t·o)o
        const tProj = [
          t[0] - tDotO * o[0],
          t[1] - tDotO * o[1],
          t[2] - tDotO * o[2]
        ]

        // Handle case where target is directly forward or backward
        if (Math.abs(tDotO) > 0.9999) {
          // Keep arrow rotation as is or zero it
          return
        }

        // --- Horizon Basis Vectors (Device Roll = 0) ---
        // Right vector in horizontal plane (perpendicular to view)
        // Original logic: rx = sinYaw (East-ish), but used with negation later
        const rx = sinYaw
        const ry = -cosYaw
        const rz = 0

        // Up vector: perpendicular to both forward and right
        const ux = ry * o[2] - rz * o[1]
        const uy = rz * o[0] - rx * o[2]
        const uz = rx * o[1] - ry * o[0]

        // Project onto Horizon-aligned screen plane
        // Negate horizontal component to match screen coordinates (East is Right)
        const xHoriz = -(tProj[0] * rx + tProj[1] * ry + tProj[2] * rz)
        const yHoriz = tProj[0] * ux + tProj[1] * uy + tProj[2] * uz

        // --- Apply Roll Correction ---
        // Rotate the 2D vector (xHoriz, yHoriz) by +roll to compensate for screen rotation
        // If device rotates CW (roll > 0), we must rotate arrow CCW (positive angle)
        const cosRoll = Math.cos(roll)
        const sinRoll = Math.sin(roll)

        const xScreen = xHoriz * cosRoll - yHoriz * sinRoll
        const yScreen = xHoriz * sinRoll + yHoriz * cosRoll

        // Arrow angle: 0° = up, 90° = right (CW from up)
        const arrowAngle = Math.atan2(xScreen, yScreen) * 180 / Math.PI
        this.arrowRotation = arrowAngle
      } catch (e) {
        console.warn('[GyroDirection] Error calculating direction:', e)
      }
    }
  },
  mounted () {
    if (this.showOverlay) {
      this.startUpdating()
    }
  },
  beforeDestroy () {
    this.stopUpdating()
  }
}
</script>

<style scoped>
.gyro-direction-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 50;
}

.direction-circle {
  position: relative;
  width: 660px;
  height: 660px;
}

.direction-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
