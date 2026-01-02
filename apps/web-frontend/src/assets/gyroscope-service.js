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

const DEG_TO_RAD = Math.PI / 180

const GyroscopeService = {
  isActive: false,
  stelCore: null,
  onOrientationBound: null,
  lastUpdate: 0,
  updateInterval: 16, // ~60fps

  // Smoothing
  smoothYaw: null,
  smoothPitch: null,
  smoothingFactor: 0.35,

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
    this.smoothYaw = null
    this.smoothPitch = null

    // Set ideal FOV for AR/gyro mode (~45°)
    stelCore.fov = 45 * Math.PI / 180

    this.onOrientationBound = this.onDeviceOrientation.bind(this)

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
    this.smoothYaw = null
    this.smoothPitch = null
    console.log('[GyroService] Stopped')
  },

  /**
   * Transform the device's -Z axis (back camera direction) to world coordinates.
   *
   * Using W3C rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
   * The -Z axis [0, 0, -1] transforms to the third column of R, negated.
   *
   * Returns the direction in world frame where:
   *   World X = East, World Y = North, World Z = Up
   *   (This is the standard geographic frame from W3C spec)
   */
  getBackCameraDirection (alpha, beta, gamma) {
    const a = alpha * DEG_TO_RAD
    const b = beta * DEG_TO_RAD
    const g = gamma * DEG_TO_RAD

    const cA = Math.cos(a)
    const sA = Math.sin(a)
    const cB = Math.cos(b)
    const sB = Math.sin(b)
    const cG = Math.cos(g)
    const sG = Math.sin(g)

    // Rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
    // Third column of R gives where device +Z goes in world coords
    // We want -Z (back camera), so negate
    //
    // R[0][2] = cA*sG + sA*sB*cG  -> for -Z: -(cA*sG + sA*sB*cG)
    // R[1][2] = sA*sG - cA*sB*cG  -> for -Z: -(sA*sG - cA*sB*cG)
    // R[2][2] = cB*cG             -> for -Z: -cB*cG
    //
    // These are in W3C world frame: X=East, Y=North, Z=Up

    const worldX = -(cA * sG + sA * sB * cG) // East
    const worldY = -(sA * sG - cA * sB * cG) // North
    const worldZ = -(cB * cG) // Up

    return { east: worldX, north: worldY, up: worldZ }
  },

  /**
   * Smooth angle with wraparound handling
   */
  smoothAngle (newAngle, oldAngle, factor) {
    if (oldAngle === null) return newAngle

    let diff = newAngle - oldAngle
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI

    return oldAngle + factor * diff
  },

  /**
   * Low-pass filter
   */
  lowPass (newVal, oldVal, factor) {
    if (oldVal === null) return newVal
    return oldVal + factor * (newVal - oldVal)
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

    // Get back camera direction in world coordinates
    const dir = this.getBackCameraDirection(alpha, beta, gamma)

    // Convert to Stellarium's coordinate system
    // Stellarium: X=North, Y=East, Z=Up
    // W3C World: X=East, Y=North, Z=Up
    // So: stel_X = world_Y (North), stel_Y = world_X (East), stel_Z = world_Z (Up)
    const stelX = dir.north // North component
    const stelY = dir.east // East component
    const stelZ = dir.up // Up component

    // Calculate yaw and pitch using Stellarium's convention
    // yaw = atan2(Y, X) = atan2(East, North)
    // pitch = atan2(Z, sqrt(X² + Y²))
    const yaw = Math.atan2(stelY, stelX)
    const horizontalDist = Math.sqrt(stelX * stelX + stelY * stelY)
    const pitch = Math.atan2(stelZ, horizontalDist)

    // Apply smoothing
    this.smoothYaw = this.smoothAngle(yaw, this.smoothYaw, this.smoothingFactor)
    this.smoothPitch = this.lowPass(pitch, this.smoothPitch, this.smoothingFactor)

    // Clamp pitch
    this.smoothPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.smoothPitch))

    try {
      this.stelCore.observer.yaw = this.smoothYaw
      this.stelCore.observer.pitch = this.smoothPitch
    } catch (e) {
      console.warn('[GyroService] Error updating view:', e)
    }
  }
}

export default GyroscopeService
