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
    }
  },
  methods: {
    startUpdating () {
      // Update direction every 100ms
      this.updateInterval = setInterval(() => {
        this.updateDirection()
      }, 100)
      // Initial update
      this.updateDirection()
    },
    stopUpdating () {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
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
        if (target.getInfo) {
          targetRadec = target.getInfo('radec')
        } else if (target.model_data && target.model_data.ra !== undefined) {
          const raRad = target.model_data.ra * 15 * Math.PI / 180
          const decRad = target.model_data.dec * Math.PI / 180
          targetRadec = this.$stel.s2c([raRad, decRad])
        }

        if (!targetRadec) return

        // Convert target from ICRF to OBSERVED frame
        const targetObsRaw = this.$stel.convertFrame(observer, 'ICRF', 'OBSERVED', targetRadec)

        // Normalize target vector 't' for consistent vector math
        const tLen = Math.sqrt(targetObsRaw[0] * targetObsRaw[0] + targetObsRaw[1] * targetObsRaw[1] + targetObsRaw[2] * targetObsRaw[2])
        const t = [targetObsRaw[0] / tLen, targetObsRaw[1] / tLen, targetObsRaw[2] / tLen]

        // Observer vec = 'o'
        const yaw = observer.yaw
        const pitch = observer.pitch

        // Use standard yaw (positive).
        const mathYaw = yaw

        const cp = Math.cos(pitch)
        const sp = Math.sin(pitch)
        const cy = Math.cos(mathYaw)
        const sy = Math.sin(mathYaw)

        // View direction (o)
        const o = [
          cp * cy,
          cp * sy,
          sp
        ]

        // Direction d = t - o
        const d = [
          t[0] - o[0],
          t[1] - o[1],
          t[2] - o[2]
        ]

        // Screen Basis Vectors (Camera Frame)
        const rx = sy
        const ry = -cy
        const rz = 0

        const ux = ry * o[2] - rz * o[1]
        const uy = rz * o[0] - rx * o[2]
        const uz = rx * o[1] - ry * o[0]

        // Project direction 'd' onto screen plane
        // Negate screenX to fix horizontal mirroring (Left/Right swap)
        const screenX = -(d[0] * rx + d[1] * ry + d[2] * rz)
        const screenY = d[0] * ux + d[1] * uy + d[2] * uz

        // Calculate arrow angle: atan2(screenX, screenY) -> 0° = up, 90° = right (CW)
        const arrowAngle = Math.atan2(screenX, screenY) * 180 / Math.PI
        this.arrowRotation = arrowAngle

        // Calculate angular distance: angle = acos(t . o)
        const cosAngle = t[0] * o[0] + t[1] * o[1] + t[2] * o[2]
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI
        this.angleToTarget = Math.round(angle)
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
