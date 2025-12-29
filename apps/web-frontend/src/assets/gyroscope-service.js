// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

/**
 * Gyroscope Service for Sky View Control
 * Controls the Stellarium view direction based on device orientation sensors.
 *
 * Uses Web DeviceOrientation API since @capacitor/motion doesn't provide
 * device orientation (alpha/beta/gamma) - it only provides accelerometer data.
 */

const GyroscopeService = {
  isActive: false,
  stelCore: null,
  onOrientationBound: null,
  lastUpdate: 0,
  updateInterval: 16, // ~60fps throttle

  /**
     * Request motion sensor permission (required for iOS 13+)
     * @returns {Promise<boolean>} true if permission granted
     */
  async requestPermission () {
    console.log('[GyroService] Requesting permission...')
    try {
      // iOS 13+ requires explicit permission request
      if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission()
        console.log('[GyroService] iOS permission result:', result)
        return result === 'granted'
      }
      // Android and other browsers - permission not needed
      console.log('[GyroService] No permission request needed (Android/Web)')
      return true
    } catch (e) {
      console.log('[GyroService] Permission request error:', e)
      return true // Assume granted on error
    }
  },

  /**
     * Start gyroscope-controlled view mode
     * @param {Object} stelCore - The Stellarium engine core ($stel.core)
     * @returns {Promise<boolean>} true if started successfully
     */
  async start (stelCore) {
    console.log('[GyroService] start() called')

    if (this.isActive) {
      console.log('[GyroService] Already active, returning true')
      return true
    }

    if (!stelCore) {
      console.error('[GyroService] stelCore is null/undefined!')
      return false
    }

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      console.warn('[GyroService] Permission denied')
      return false
    }

    this.stelCore = stelCore
    this.isActive = true

    // Bind the handler to preserve 'this' context
    this.onOrientationBound = this.onDeviceOrientation.bind(this)

    // Use deviceorientationabsolute for absolute compass heading (Android)
    // Fall back to deviceorientation (iOS and others)
    if ('ondeviceorientationabsolute' in window) {
      console.log('[GyroService] Using deviceorientationabsolute event')
      window.addEventListener('deviceorientationabsolute', this.onOrientationBound, true)
    } else {
      console.log('[GyroService] Using deviceorientation event')
      window.addEventListener('deviceorientation', this.onOrientationBound, true)
    }

    console.log('[GyroService] Gyroscope view control STARTED successfully')
    return true
  },

  /**
     * Stop gyroscope-controlled view mode
     */
  async stop () {
    console.log('[GyroService] stop() called')

    if (!this.isActive) {
      console.log('[GyroService] Not active, nothing to stop')
      return
    }

    this.isActive = false

    if (this.onOrientationBound) {
      window.removeEventListener('deviceorientationabsolute', this.onOrientationBound, true)
      window.removeEventListener('deviceorientation', this.onOrientationBound, true)
      this.onOrientationBound = null
    }

    this.stelCore = null
    console.log('[GyroService] Gyroscope view control STOPPED')
  },

  /**
     * Handle device orientation event
     * @param {DeviceOrientationEvent} event
     */
  onDeviceOrientation (event) {
    if (!this.stelCore || !this.isActive) return

    // Throttle updates for performance
    const now = Date.now()
    if (now - this.lastUpdate < this.updateInterval) return
    this.lastUpdate = now

    // Get orientation values
    let alpha = event.alpha // Compass heading (0-360)
    const beta = event.beta // Front-back tilt (-180 to 180)
    const gamma = event.gamma // Left-right tilt (-90 to 90)

    // Use webkitCompassHeading for iOS if available (more accurate)
    if (event.webkitCompassHeading !== undefined) {
      alpha = event.webkitCompassHeading
    }

    console.log('[GyroService] Orientation:', 'alpha=' + alpha, 'beta=' + beta, 'gamma=' + gamma)

    if (alpha === null || beta === null) {
      console.log('[GyroService] alpha or beta is null, skipping')
      return
    }

    // Convert to Stellarium's coordinate system
    // azimuth (yaw): horizontal direction, 0 = North
    // For webkitCompassHeading, 0 = North, increases clockwise (correct)
    // For standard alpha, 0 = North, increases counterclockwise, so negate
    const azimuthDeg = event.webkitCompassHeading !== undefined ? alpha : (360 - alpha)
    const azimuthRad = azimuthDeg * Math.PI / 180

    // altitude (pitch): vertical angle
    // When phone vertical (beta=90), user looks at horizon (pitch=0)
    // When phone tilted up (beta decreases), looking up at sky
    const altitudeDeg = Math.max(-90, Math.min(90, 90 - beta))
    const altitudeRad = altitudeDeg * Math.PI / 180

    // Update Stellarium observer view
    try {
      this.stelCore.observer.yaw = azimuthRad
      this.stelCore.observer.pitch = altitudeRad
    } catch (e) {
      console.warn('[GyroService] Error updating view:', e)
    }
  }
}

export default GyroscopeService
