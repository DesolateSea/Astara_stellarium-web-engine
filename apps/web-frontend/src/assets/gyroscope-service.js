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
  smoothRoll: null,
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
    this.smoothRoll = null

    // Save current roll and set ideal FOV for AR/gyro mode (~45°)
    this.savedRoll = stelCore.observer.roll
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

    // Reset roll to 0 when gyro is disabled
    if (this.stelCore) {
      this.stelCore.observer.roll = 0
    }

    this.stelCore = null
    this.smoothYaw = null
    this.smoothPitch = null
    this.smoothRoll = null
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

    // Apply smoothing
    this.smoothYaw = this.smoothAngle(yaw, this.smoothYaw, this.smoothingFactor)
    this.smoothPitch = this.lowPass(pitch, this.smoothPitch, this.smoothingFactor)
    this.smoothRoll = this.smoothAngle(data.roll, this.smoothRoll, this.smoothingFactor)

    // Clamp pitch
    this.smoothPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.smoothPitch))

    try {
      this.stelCore.observer.yaw = this.smoothYaw
      this.stelCore.observer.pitch = this.smoothPitch
      this.stelCore.observer.roll = this.smoothRoll
    } catch (e) {
      console.warn('[GyroService] Error updating view:', e)
    }
  }
}

export default GyroscopeService
