/**
 * Gyroscope Service for Sky View Control
 * Controls the Stellarium view direction based on device orientation.
 * Uses device orientation events to map phone orientation to sky view.
 */

const GyroscopeService = {
  isActive: false,
  stelCore: null,
  onOrientationBound: null,
  lastUpdate: 0,
  updateInterval: 16, // ~60fps

  // Smoothing
  smoothYaw: 0,
  smoothPitch: 0,
  smoothingFactor: 0.15, // Lower = smoother but more lag

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

  async start (stelCore) {
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

    this.stelCore = stelCore
    this.isActive = true

    // Initialize smooth values from current view
    this.smoothYaw = stelCore.observer.yaw || 0
    this.smoothPitch = stelCore.observer.pitch || 0

    this.onOrientationBound = this.onDeviceOrientation.bind(this)

    // Use absolute orientation if available (includes compass heading)
    if ('ondeviceorientationabsolute' in window) {
      console.log('[GyroService] Using deviceorientationabsolute')
      window.addEventListener('deviceorientationabsolute', this.onOrientationBound, true)
    } else {
      console.log('[GyroService] Using deviceorientation')
      window.addEventListener('deviceorientation', this.onOrientationBound, true)
    }

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

    this.stelCore = null
    console.log('[GyroService] Stopped')
  },

  /**
   * Handle device orientation event
   * Coordinate system:
   * - alpha: compass heading (0-360), 0 = North
   * - beta: front-back tilt (-180 to 180), 0 = flat, 90 = vertical
   * - gamma: left-right tilt (-90 to 90)
   */
  onDeviceOrientation (event) {
    if (!this.isActive || !this.stelCore) return

    // Throttle updates
    const now = Date.now()
    if (now - this.lastUpdate < this.updateInterval) return
    this.lastUpdate = now

    // Get orientation values
    let alpha = event.alpha // Compass heading (0-360)
    const beta = event.beta // Front-back tilt (-180 to 180)
    // gamma (left-right tilt) not used for basic sky viewing

    // iOS uses webkitCompassHeading (more accurate, already in correct direction)
    if (event.webkitCompassHeading !== undefined) {
      alpha = event.webkitCompassHeading
    }

    if (alpha === null || beta === null) return

    // Convert to Stellarium's coordinate system
    // Azimuth (yaw): horizontal direction
    // Standard alpha: 0 = North, increases counterclockwise
    // We need: 0 = North, increases clockwise (looking down at map)
    // webkitCompassHeading is already clockwise
    let azimuthDeg
    if (event.webkitCompassHeading !== undefined) {
      azimuthDeg = alpha
    } else {
      azimuthDeg = (360 - alpha) % 360
    }
    const targetYaw = azimuthDeg * Math.PI / 180

    // Altitude (pitch): vertical angle
    // beta = 0: phone flat, looking straight up
    // beta = 90: phone vertical, looking at horizon
    // beta = 180/-180: phone upside down flat, looking straight down
    // We want: pitch = 0 at horizon, positive = looking up, negative = looking down
    let targetPitch
    if (beta >= 0 && beta <= 180) {
      // Phone tilted from flat (0) to vertical (90) to upside down (180)
      targetPitch = (beta - 90) * Math.PI / 180
    } else {
      // beta is negative (-180 to 0)
      targetPitch = (beta - 90) * Math.PI / 180
    }

    // Clamp pitch to valid range
    targetPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetPitch))

    // Apply smoothing using exponential moving average
    // Handle yaw wraparound (0 to 2π)
    let yawDiff = targetYaw - this.smoothYaw
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI
    this.smoothYaw += yawDiff * this.smoothingFactor
    // Normalize to 0-2π
    if (this.smoothYaw < 0) this.smoothYaw += 2 * Math.PI
    if (this.smoothYaw >= 2 * Math.PI) this.smoothYaw -= 2 * Math.PI

    this.smoothPitch += (targetPitch - this.smoothPitch) * this.smoothingFactor

    // Apply to Stellarium
    try {
      this.stelCore.observer.yaw = this.smoothYaw
      this.stelCore.observer.pitch = this.smoothPitch
    } catch (e) {
      console.warn('[GyroService] Error updating view:', e)
    }
  }
}

export default GyroscopeService
