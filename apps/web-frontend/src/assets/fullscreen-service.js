// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

/**
 * Fullscreen Service for Android Immersive Mode
 * Hides the status bar and navigation bar for a true fullscreen experience.
 * Uses SystemBars API from @capacitor/core (Capacitor 8+).
 */

const STORAGE_KEY = 'stellarium-fullscreen'

const FullscreenService = {
  isEnabled: true, // Enabled by default
  SystemBars: null,
  SystemBarType: null,
  isCapacitor: false,

  /**
   * Initialize the service
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
        const { SystemBars, SystemBarType } = await import('@capacitor/core')
        this.SystemBars = SystemBars
        this.SystemBarType = SystemBarType
        console.log('[FullscreenService] SystemBars API loaded successfully')
      } catch (e) {
        console.warn('[FullscreenService] Failed to load SystemBars API:', e)
      }
    }

    // Load saved preference (default is true/enabled)
    this.loadPreference()

    // Apply initial state
    if (this.isEnabled) {
      await this.enable()
    }

    return this.isEnabled
  },

  /**
   * Load fullscreen preference from localStorage
   */
  loadPreference () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        this.isEnabled = saved === 'true'
      } else {
        // Default to enabled
        this.isEnabled = true
      }
    } catch (e) {
      this.isEnabled = true
    }
    console.log('[FullscreenService] Loaded preference:', this.isEnabled)
  },

  /**
   * Save fullscreen preference to localStorage
   */
  savePreference () {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.isEnabled))
    } catch (e) {
      // Ignore storage errors
    }
  },

  /**
   * Enable fullscreen/immersive mode (hide both status bar and navigation bar)
   */
  async enable () {
    this.isEnabled = true
    this.savePreference()

    if (this.SystemBars && this.SystemBarType) {
      try {
        // Hide status bar (top)
        await this.SystemBars.hide({ bar: this.SystemBarType.StatusBar })
        console.log('[FullscreenService] Status bar hidden')
      } catch (e) {
        console.warn('[FullscreenService] Failed to hide status bar:', e)
      }

      try {
        // Hide navigation bar (bottom)
        await this.SystemBars.hide({ bar: this.SystemBarType.NavigationBar })
        console.log('[FullscreenService] Navigation bar hidden')
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

    return true
  },

  /**
   * Disable fullscreen/immersive mode (show system bars)
   */
  async disable () {
    this.isEnabled = false
    this.savePreference()

    if (this.SystemBars && this.SystemBarType) {
      try {
        // Show status bar
        await this.SystemBars.show({ bar: this.SystemBarType.StatusBar })
        console.log('[FullscreenService] Status bar shown')
      } catch (e) {
        console.warn('[FullscreenService] Failed to show status bar:', e)
      }

      try {
        // Show navigation bar
        await this.SystemBars.show({ bar: this.SystemBarType.NavigationBar })
        console.log('[FullscreenService] Navigation bar shown')
      } catch (e) {
        console.warn('[FullscreenService] Failed to show navigation bar:', e)
      }
    }

    // Exit web fullscreen if active
    if (!this.isCapacitor && document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (e) {
        // Ignore
      }
    }

    return true
  },

  /**
   * Toggle fullscreen mode
   * @returns {Promise<boolean>} New state
   */
  async toggle () {
    if (this.isEnabled) {
      await this.disable()
    } else {
      await this.enable()
    }
    return this.isEnabled
  },

  /**
   * Get current fullscreen state
   * @returns {boolean}
   */
  getState () {
    return this.isEnabled
  }
}

export default FullscreenService
