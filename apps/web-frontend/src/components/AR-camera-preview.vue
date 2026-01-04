<template>
  <transition name="fade">
    <div v-if="arModeActive" class="ar-camera-preview">
      <video
        ref="cameraVideo"
        class="camera-video"
        :class="{ 'is-playing': isPlaying }"
        autoplay
        playsinline
        webkit-playsinline
        muted
        @playing="onPlaying"
      ></video>
    </div>
  </transition>
</template>

<script>
import CameraService from '@/assets/camera-service.js'

export default {
  name: 'ARCameraPreview',
  data () {
    return {
      isPlaying: false
    }
  },
  computed: {
    arModeActive () {
      return this.$store.state.arModeActive
    },
    arZoom () {
      return this.$store.state.arZoom
    }
  },
  watch: {
    arModeActive (newVal) {
      if (newVal) {
        this.startCamera()
      } else {
        this.stopCamera()
      }
    },
    arZoom () {
      this.updateZoom()
    }
  },
  beforeDestroy () {
    this.removeVisibilityListener()
    this.stopCamera()
  },
  methods: {
    onPlaying () {
      this.isPlaying = true
    },
    async startCamera () {
      this.isPlaying = false
      // Wait for video element to be rendered
      await this.$nextTick()

      const videoEl = this.$refs.cameraVideo
      if (!videoEl) {
        console.warn('[ARCameraPreview] Video element not found')
        return
      }

      this.addVisibilityListener()

      const success = await CameraService.start(videoEl)
      if (!success) {
        console.warn('[ARCameraPreview] Failed to start camera, disabling AR mode')
        this.$store.commit('setArModeActive', false)
      } else {
        // Apply initial zoom
        this.updateZoom()
      }
    },
    stopCamera () {
      CameraService.stop()
      this.removeVisibilityListener()
    },
    updateZoom () {
      // Camera zoom is controlled directly by the arZoom setting
      CameraService.setZoom(this.arZoom)
    },
    addVisibilityListener () {
      if (!this._visibilityHandler) {
        this._visibilityHandler = () => {
          if (document.hidden) {
            CameraService.pause()
          } else {
            CameraService.resume()
          }
        }
        document.addEventListener('visibilitychange', this._visibilityHandler)
      }
    },
    removeVisibilityListener () {
      if (this._visibilityHandler) {
        document.removeEventListener('visibilitychange', this._visibilityHandler)
        this._visibilityHandler = null
      }
    }
  }
}
</script>

<style scoped>
.ar-camera-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -20; /* Behind the canvas (-10) */
  background: #000;
  overflow: hidden;
  pointer-events: none; /* Allow clicks to pass through */
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Fill the screen */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.camera-video.is-playing {
  opacity: 1;
}

/* Hide default video controls */
video::-webkit-media-controls {
  display: none !important;
}
video::-webkit-media-controls-start-playback-button {
  display: none !important;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
