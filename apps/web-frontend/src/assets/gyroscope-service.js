/**
 * Gyroscope Service for Sky View Control
 *
 * Tracks where the device's BACK CAMERA is pointing and maps it to Stellarium's view.
 *
 * Stellarium OBSERVED frame (from frames.h):
 *   X = North, Y = East, Z = Zenith (up)
 *   yaw = atan2(East, North), pitch = altitude above horizon
 *   yaw=0 is North, yaw=π/2 is East
 *
 * W3C DeviceOrientation:
 *   alpha = rotation around Z (compass, 0=North, counterclockwise)
 *   beta = rotation around X (front-back tilt, -180 to 180)
 *   gamma = rotation around Y (left-right tilt, -90 to 90)
 *   Rotation order: Z-X'-Y'' (intrinsic Tait-Bryan)
 *
 * Device coordinate system:
 *   x = right, y = up (top of screen), z = out of screen (toward user)
 *   Back camera points along -Z axis
 */

import { ScreenOrientation } from '@capacitor/screen-orientation'

const DEG_TO_RAD = Math.PI / 180

const GyroscopeService = {
  isActive: false,
  stelCore: null,
  onOrientationBound: null,
  onTouchStartBound: null,
  onTouchMoveBound: null,
  onResizeBound: null,
  touchStartX: null,
  touchStartY: null,
  lastUpdate: 0,
  updateInterval: 16, // ~60fps
  onStopCallback: null,

  // Adaptive Smoothing Parameters
  // Uses exponential adaptive gain: factor = minFactor + (maxFactor - minFactor) * (1 - e^(-k * (|diff| - d0)))
  // Small movements → strong smoothing (stable)
  // Large movements → weak smoothing (responsive)
  smoothYaw: null,
  smoothPitch: null,
  minFactor: 0.06, // Strong smoothing when still (prevents jitter)
  maxFactor: 0.7, // Fast response when moving
  k: 4.0, // Sensitivity - how quickly factor ramps up
  d0: 0.02, // Dead-zone threshold (~1.1°) - below this, use minFactor

  async requestPermission () {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission()
        console.log('[GyroService] iOS permission result:', result)
        return result === 'granted'
      }
      return true
    } catch (e) {
      console.log('[GyroService] Permission error:', e)
      return true
    }
  },

  async start (stelCore, store, onStopCallback) {
    console.log('[GyroService] start() called')

    if (this.isActive) {
      console.log('[GyroService] Already active')
      return true
    }

    if (!stelCore) {
      console.error('[GyroService] stelCore is null!')
      return false
    }

    if (!await this.requestPermission()) {
      console.warn('[GyroService] Permission denied')
      return false
    }

    // Check if device is in landscape orientation - don't start gyro in landscape
    const isLandscape = window.innerWidth > window.innerHeight
    if (isLandscape) {
      console.warn('[GyroService] Cannot start in landscape mode. Please rotate to portrait.')
      return false
    }

    this.stelCore = stelCore
    this.store = store
    this.isActive = true
    this.onStopCallback = onStopCallback
    this.smoothYaw = null
    this.smoothPitch = null

    // Lock to portrait mode
    try {
      await ScreenOrientation.lock({ type: 'portrait' })
    } catch (e) {
      console.warn('[GyroService] Failed to lock orientation:', e)
    }

    // Save current roll
    this.savedRoll = stelCore.observer.roll

    // Set ideal FOV for AR mode only if AR is active and matching enabled, otherwise default to 45°
    if (this.store && this.store.state.arModeActive && this.store.state.arFullFov) {
      stelCore.fov = 32.7 * Math.PI / 180
    } else {
      stelCore.fov = 45 * Math.PI / 180
    }

    this.onOrientationBound = this.onDeviceOrientation.bind(this)

    if ('ondeviceorientationabsolute' in window) {
      console.log('[GyroService] Using deviceorientationabsolute')
      window.addEventListener('deviceorientationabsolute', this.onOrientationBound, true)
    } else {
      console.log('[GyroService] Using deviceorientation')
      window.addEventListener('deviceorientation', this.onOrientationBound, true)
    }

    // Add touch listeners to detect swipe (single-finger pan only, not tap or pinch)
    this.onTouchStartBound = this.onTouchStart.bind(this)
    this.onTouchMoveBound = this.onTouchMove.bind(this)
    const canvas = document.getElementById('stel-canvas')
    if (canvas) {
      canvas.addEventListener('touchstart', this.onTouchStartBound, { passive: true })
      canvas.addEventListener('touchmove', this.onTouchMoveBound, { passive: true })
    }

    // Add resize listener to stop gyro if screen rotates to landscape
    this.onResizeBound = this.onResize.bind(this)
    window.addEventListener('resize', this.onResizeBound)

    console.log('[GyroService] Started successfully')
    return true
  },

  async stop () {
    console.log('[GyroService] stop() called')

    if (!this.isActive) return

    this.isActive = false

    if (this.onOrientationBound) {
      window.removeEventListener('deviceorientationabsolute', this.onOrientationBound, true)
      window.removeEventListener('deviceorientation', this.onOrientationBound, true)
      this.onOrientationBound = null
    }

    // Remove touch listeners
    const canvas = document.getElementById('stel-canvas')
    if (canvas) {
      if (this.onTouchStartBound) {
        canvas.removeEventListener('touchstart', this.onTouchStartBound)
        this.onTouchStartBound = null
      }
      if (this.onTouchMoveBound) {
        canvas.removeEventListener('touchmove', this.onTouchMoveBound)
        this.onTouchMoveBound = null
      }
    }
    this.touchStartX = null
    this.touchStartY = null

    // Remove resize listener
    if (this.onResizeBound) {
      window.removeEventListener('resize', this.onResizeBound)
      this.onResizeBound = null
    }

    // Reset roll to 0 when gyro is disabled
    if (this.stelCore) {
      this.stelCore.observer.roll = 0
      // Reset FOV to default 45 degrees ONLY if AR mode was active
      if (this.store && this.store.state.arModeActive) {
        this.stelCore.fov = 45 * Math.PI / 180
      }
    }

    // Unlock orientation
    try {
      await ScreenOrientation.unlock()
    } catch (e) {
      console.warn('[GyroService] Failed to unlock orientation:', e)
    }

    this.stelCore = null
    this.store = null
    this.smoothYaw = null
    this.smoothPitch = null
    this.onStopCallback = null
    console.log('[GyroService] Stopped')
  },

  /**
   * Transform the device's -Z axis (back camera direction) to world coordinates.
   * Also calculates the roll angle (rotation around the view axis) for horizon alignment.
   *
   * Using W3C rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
   * The -Z axis [0, 0, -1] transforms to the third column of R, negated.
   *
   * Returns the direction in world frame where:
   *   World X = East, World Y = North, World Z = Up
   *   (This is the standard geographic frame from W3C spec)
   */
  getOrientationData (alpha, beta, gamma) {
    const a = alpha * DEG_TO_RAD
    const b = beta * DEG_TO_RAD
    const g = gamma * DEG_TO_RAD

    const cA = Math.cos(a)
    const sA = Math.sin(a)
    const cB = Math.cos(b)
    const sB = Math.sin(b)
    const cG = Math.cos(g)
    const sG = Math.sin(g)

    // Full rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
    // From W3C spec Example A.2
    // const m11 = cA * cG - sA * sB * sG
    const m12 = -sA * cB
    // const m21 = sA * cG + cA * sB * sG
    const m22 = cA * cB

    // Third column of R gives where device +Z goes in world coords
    // We want -Z (back camera), so negate
    const m13 = cA * sG + sA * sB * cG
    const m23 = sA * sG - cA * sB * cG
    const m33 = cB * cG

    // Back camera direction (-Z axis) in world frame: X=East, Y=North, Z=Up
    const east = -m13
    const north = -m23
    const up = -m33

    // Calculate roll: the rotation of the device's "up" (+Y axis) around the view axis
    // Device +Y axis in world coordinates:
    const devUpEast = m12
    const devUpNorth = m22
    const devUpUp = sB // m32 = sin(beta)

    // Project device up onto the plane perpendicular to view direction
    // and calculate angle relative to world up projected onto same plane
    // This gives us the roll angle for horizon alignment

    // For roll calculation, we need to find the angle between:
    // 1. The device's "up" vector projected perpendicular to view direction
    // 2. The world "up" vector projected perpendicular to view direction

    // Simplified roll calculation using the device's orientation relative to gravity
    // When looking at the sky, roll is how much the horizon should rotate
    const viewHorizontal = Math.sqrt(east * east + north * north)

    let roll = 0
    if (viewHorizontal > 0.01) {
      // Calculate the "right" vector of the view (perpendicular to view direction in horizontal plane)
      const rightEast = -north / viewHorizontal
      const rightNorth = east / viewHorizontal

      // Project device up onto the horizontal plane and calculate angle
      const devUpHorizEast = devUpEast
      const devUpHorizNorth = devUpNorth

      // Roll is the angle of device up relative to the "up" direction in view space
      // Cross product component gives sin of angle, dot product gives cos
      const dotRight = devUpHorizEast * rightEast + devUpHorizNorth * rightNorth
      const dotUp = devUpUp

      // Negate to correct the roll direction
      roll = -Math.atan2(dotRight, dotUp)
    } else {
      // Looking straight up or down - use gamma for roll
      roll = g
    }

    return { east, north, up, roll }
  },

  /**
   * Adaptive smooth angle with wraparound handling
   * Uses exponential adaptive gain - small movements get heavy smoothing,
   * large movements get light smoothing for responsiveness
   */
  adaptiveSmoothAngle (newAngle, oldAngle) {
    if (oldAngle === null) return newAngle

    // Handle angle wraparound
    let diff = newAngle - oldAngle
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI

    const absDiff = Math.abs(diff)

    // Calculate adaptive factor
    let factor
    if (absDiff < this.d0) {
      // Below dead-zone: use minimum factor (stable, prevents jitter)
      factor = this.minFactor
    } else {
      // Exponential adaptive gain: ramps up smoothly from minFactor to maxFactor
      const t = absDiff - this.d0
      const response = 1 - Math.exp(-this.k * t)
      factor = this.minFactor + (this.maxFactor - this.minFactor) * response
    }

    return oldAngle + factor * diff
  },

  /**
   * Adaptive smooth for pitch (no wraparound needed since pitch is bounded to ±π/2)
   * Uses the same adaptive gain principle as adaptiveSmoothAngle
   */
  adaptiveSmoothPitch (newPitch, oldPitch) {
    if (oldPitch === null) return newPitch

    const diff = newPitch - oldPitch
    const absDiff = Math.abs(diff)

    // Calculate adaptive factor
    let factor
    if (absDiff < this.d0) {
      // Below dead-zone: use minimum factor (stable, prevents jitter)
      factor = this.minFactor
    } else {
      // Exponential adaptive gain: ramps up smoothly from minFactor to maxFactor
      const t = absDiff - this.d0
      const response = 1 - Math.exp(-this.k * t)
      factor = this.minFactor + (this.maxFactor - this.minFactor) * response
    }

    return oldPitch + factor * diff
  },

  /**
   * Track touch start position (only single-finger touches)
   */
  onTouchStart (event) {
    // Only track single-finger touches (not pinch-zoom)
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX
      this.touchStartY = event.touches[0].clientY
    } else {
      // Multi-touch - reset, this is a pinch
      this.touchStartX = null
      this.touchStartY = null
    }
  },

  /**
   * Detect swipe: single finger moved more than threshold
   */
  onTouchMove (event) {
    // Only trigger on single-finger swipe, not pinch-zoom
    if (event.touches.length !== 1) {
      this.touchStartX = null
      this.touchStartY = null
      return
    }

    if (this.touchStartX === null || this.touchStartY === null) return

    const dx = event.touches[0].clientX - this.touchStartX
    const dy = event.touches[0].clientY - this.touchStartY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // If moved more than 20px, it's a swipe - disable gyro
    if (distance > 20) {
      console.log('[GyroService] Swipe detected, disabling gyro')
      if (this.onStopCallback) {
        this.onStopCallback()
      }
      this.stop()
    }
  },

  /**
   * Detect screen rotation to landscape and stop gyro
   */
  onResize () {
    // If screen rotates to landscape, stop gyro
    if (window.innerWidth > window.innerHeight) {
      console.log('[GyroService] Screen rotated to landscape, disabling gyro')
      if (this.onStopCallback) {
        this.onStopCallback()
      }
      this.stop()
    }
  },

  onDeviceOrientation (event) {
    if (!this.isActive || !this.stelCore) return

    const now = Date.now()
    if (now - this.lastUpdate < this.updateInterval) return
    this.lastUpdate = now

    let { alpha, beta, gamma } = event

    if (alpha === null || beta === null || gamma === null) return

    // iOS: webkitCompassHeading is clockwise from North (0-360)
    // Standard alpha is counterclockwise from North
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      alpha = 360 - event.webkitCompassHeading
      if (alpha < 0) alpha += 360
      if (alpha >= 360) alpha -= 360
    }

    // Get orientation data including roll for horizon alignment
    const data = this.getOrientationData(alpha, beta, gamma)

    // Convert to Stellarium's coordinate system
    // Stellarium: X=North, Y=East, Z=Up
    // W3C World: X=East, Y=North, Z=Up
    // So: stel_X = world_Y (North), stel_Y = world_X (East), stel_Z = world_Z (Up)
    const stelX = data.north // North component
    const stelY = data.east // East component
    const stelZ = data.up // Up component

    // Calculate yaw and pitch using Stellarium's convention
    // yaw = atan2(Y, X) = atan2(East, North)
    // pitch = atan2(Z, sqrt(X² + Y²))
    const yaw = Math.atan2(stelY, stelX)
    const horizontalDist = Math.sqrt(stelX * stelX + stelY * stelY)
    const pitch = Math.atan2(stelZ, horizontalDist)

    // Apply adaptive smoothing to yaw and pitch (not roll)
    this.smoothYaw = this.adaptiveSmoothAngle(yaw, this.smoothYaw)
    this.smoothPitch = this.adaptiveSmoothPitch(pitch, this.smoothPitch)

    // Clamp pitch
    this.smoothPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.smoothPitch))

    try {
      this.stelCore.observer.yaw = this.smoothYaw
      this.stelCore.observer.pitch = this.smoothPitch
      this.stelCore.observer.roll = data.roll

      // Lock FOV to 32.7 degrees ONLY if AR mode is active AND Sky Match (Fixed FOV) is enabled
      // 'arFullFov' in store corresponds to "Fixed Wide FOV" in UI which actually means matching the camera FOV (approx 32.7)
      if (this.store && this.store.state.arModeActive && this.store.state.arFullFov) {
        this.stelCore.fov = 32.7 * Math.PI / 180
      }
    } catch (e) {
      console.warn('[GyroService] Error updating view:', e)
    }
  }
}

export default GyroscopeService
