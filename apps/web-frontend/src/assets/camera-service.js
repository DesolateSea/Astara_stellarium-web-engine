/**
 * Camera Service for AR Mode
 *
 * Provides camera access using getUserMedia for web/Android.
 * Uses the back-facing (environment) camera for AR experience.
 */

const CameraService = {
  stream: null,
  videoElement: null,
  isActive: false,

  /**
     * Check if camera is supported on this device
     */
  isSupported () {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },

  /**
     * Start the camera and attach to a video element
     * @param {HTMLVideoElement} videoElement - The video element to display camera feed
     * @returns {Promise<boolean>} - True if camera started successfully
     */
  async start (videoElement) {
    if (this.isActive) {
      console.log('[CameraService] Already active')
      return true
    }

    if (!this.isSupported()) {
      console.warn('[CameraService] Camera not supported on this device')
      return false
    }

    if (!videoElement) {
      console.error('[CameraService] No video element provided')
      return false
    }

    try {
      // Request back camera (environment) for AR
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          // Remove specific resolution/aspect ratio to get maximal sensor area (native)
          // This helps avoid OS-level cropping for video stabilization or aspect matching
          advanced: [{ zoom: 1 }]
        },
        audio: false
      }

      console.log('[CameraService] Requesting camera with constraints:', constraints)
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)

      this.videoElement = videoElement
      videoElement.srcObject = this.stream
      videoElement.setAttribute('playsinline', 'true') // Required for iOS
      videoElement.setAttribute('autoplay', 'true')
      videoElement.muted = true

      // Wait for video to be ready (with timeout)
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Camera initialization timeout'))
        }, 10000) // 10 second timeout

        videoElement.onloadedmetadata = () => {
          clearTimeout(timeout)
          videoElement.play()
            .then(resolve)
            .catch(reject)
        }
        videoElement.onerror = (err) => {
          clearTimeout(timeout)
          reject(err)
        }
      })

      this.isActive = true
      console.log('[CameraService] Camera started successfully')
      return true
    } catch (error) {
      console.error('[CameraService] Failed to start camera:', error)
      this.stop()
      return false
    }
  },

  /**
     * Stop the camera and release resources
     */
  stop () {
    console.log('[CameraService] Stopping camera')

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
      this.videoElement = null
    }

    this.isActive = false
    console.log('[CameraService] Camera stopped')
  },

  /**
   * Check if camera is currently active
   */
  getIsActive () {
    return this.isActive
  },

  /**
   * Capture the current video frame as an image
   * @returns {string|null} - Data URL of the captured image
   */
  capture () {
    if (!this.isActive || !this.videoElement) {
      console.warn('[CameraService] Cannot capture, camera not active')
      return null
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = this.videoElement.videoWidth
      canvas.height = this.videoElement.videoHeight

      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height)

      // Convert to data URL (JPEG format)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

      // Trigger download
      const link = document.createElement('a')
      link.download = 'stellarium-ar-' + new Date().toISOString().replace(/[:.]/g, '-') + '.jpg'
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return dataUrl
    } catch (e) {
      console.error('[CameraService] Capture failed:', e)
      return null
    }
  },

  /**
   * Pause the video stream (e.g. when app goes locally background)
   */
  pause () {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause()
    }
  },

  /**
   * Resume the video stream
   */
  async resume () {
    if (this.videoElement && this.videoElement.paused) {
      try {
        await this.videoElement.play()
      } catch (e) {
        console.warn('[CameraService] Resume failed:', e)
        // If resume fails, might need to restart stream completely
        if (this.isActive) {
          // Attempt full restart if we have reference to element
          const vid = this.videoElement
          this.stop()
          await this.start(vid)
        }
      }
    }
  }
}

export default CameraService
