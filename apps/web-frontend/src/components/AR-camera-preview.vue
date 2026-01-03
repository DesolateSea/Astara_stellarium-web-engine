<template>
  <transition name="fade">
    <div v-if="arModeActive" class="ar-camera-preview">
      <video
        ref="cameraVideo"
        class="camera-video"
        autoplay
        playsinline
        webkit-playsinline
        muted
      ></video>
    </div>
  </transition>
</template>

<script>
import CameraService from '@/assets/camera-service.js'

export default {
  name: 'ARCameraPreview',
  computed: {
    arModeActive () {
      return this.$store.state.arModeActive
    }
  },
  watch: {
    arModeActive (newVal) {
      if (newVal) {
        this.startCamera()
      } else {
        this.stopCamera()
      }
    }
  },
  methods: {
    async startCamera () {
      // Wait for video element to be rendered
      await this.$nextTick()

      const videoEl = this.$refs.cameraVideo
      if (!videoEl) {
        console.warn('[ARCameraPreview] Video element not found')
        return
      }

      const success = await CameraService.start(videoEl)
      if (!success) {
        console.warn('[ARCameraPreview] Failed to start camera, disabling AR mode')
        this.$store.commit('setArModeActive', false)
      }
    },
    stopCamera () {
      CameraService.stop()
    }
  },
  mounted () {
    if (this.arModeActive) {
      this.startCamera()
    }
  },
  beforeDestroy () {
    this.stopCamera()
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
