// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

/**
 * Fullscreen Service for Android Immersive Mode
 * Always enables fullscreen (hides status bar and navigation bar).
 * Uses SystemBars API from @capacitor/core (Capacitor 8+).
 * Re-hides bars automatically when user swipes to reveal them.
 */

const FullscreenService = {
  SystemBars: null,
  SystemBarType: null,
  SystemBarsStyle: null,
  isCapacitor: false,
  rehideTimeout: null,
  rehideDelay: 2000, // Re-hide after 2 seconds

  /**
   * Initialize the service and enable fullscreen
   * Should be called on app startup
   */
  async init () {
    // Check if running in Capacitor
    this.isCapacitor = typeof window !== 'undefined' &&
      window.Capacitor &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()

    console.log('[FullscreenService] init() - isCapacitor:', this.isCapacitor)

    if (this.isCapacitor) {
      try {
        // SystemBars is built into @capacitor/core in Capacitor 8+
        const { SystemBars, SystemBarType, SystemBarsStyle } = await import('@capacitor/core')
        this.SystemBars = SystemBars
        this.SystemBarType = SystemBarType
        this.SystemBarsStyle = SystemBarsStyle
        console.log('[FullscreenService] SystemBars API loaded successfully')
      } catch (e) {
        console.warn('[FullscreenService] Failed to load SystemBars API:', e)
      }
    }

    // Always enable fullscreen
    await this.enable()

    // Set up listener to re-hide bars when user interaction ends
    this.setupRehideListener()
  },

  /**
   * Set up listener to re-hide bars after user swipes to reveal them
   */
  setupRehideListener () {
    if (!this.isCapacitor) return

    // Re-hide bars on any touch end (user finished interacting)
    document.addEventListener('touchend', () => {
      this.scheduleRehide()
    }, { passive: true })

    // Also re-hide periodically to catch any missed events
    setInterval(() => {
      this.enable()
    }, 5000)
  },

  /**
   * Schedule re-hiding of system bars after a delay
   */
  scheduleRehide () {
    if (this.rehideTimeout) {
      clearTimeout(this.rehideTimeout)
    }
    this.rehideTimeout = setTimeout(() => {
      this.enable()
    }, this.rehideDelay)
  },

  /**
   * Enable fullscreen/immersive mode (hide both status bar and navigation bar)
   */
  async enable () {
    if (this.SystemBars && this.SystemBarType) {
      try {
        // Set dark style (light icons on dark background)
        await this.SystemBars.setStyle({ style: this.SystemBarsStyle.Dark })
      } catch (e) {
        // Ignore style errors
      }

      try {
        // Hide status bar (top)
        await this.SystemBars.hide({ bar: this.SystemBarType.StatusBar })
      } catch (e) {
        console.warn('[FullscreenService] Failed to hide status bar:', e)
      }

      try {
        // Hide navigation bar (bottom)
        await this.SystemBars.hide({ bar: this.SystemBarType.NavigationBar })
      } catch (e) {
        console.warn('[FullscreenService] Failed to hide navigation bar:', e)
      }
    }

    // Also try web Fullscreen API for non-Capacitor environments
    if (!this.isCapacitor && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (e) {
        // User gesture may be required
      }
    }
  }
}

export default FullscreenService
