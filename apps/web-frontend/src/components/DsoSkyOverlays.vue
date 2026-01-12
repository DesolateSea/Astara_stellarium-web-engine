// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div style="display: none"></div>
</template>

<script>
import { getOverlayList } from '@/constants/dsoHips'

export default {
  name: 'DsoSkyOverlays',
  data: function () {
    return {
      // DSO HiPS configurations - imported from constants for full sky coverage (182 objects)
      dsoHips: getOverlayList(),
      hipsSurveys: [],
      dsoLayer: null,
      initialized: false
    }
  },
  computed: {
    fov: function () {
      return this.$store.state.stel ? this.$store.state.stel.fov * 180 / Math.PI : 120
    }
  },
  watch: {
    fov: function (newFov) {
      if (!this.initialized) return
      this.updateVisibility(newFov)
    }
  },
  methods: {
    initOverlays: async function () {
      if (this.initialized || !this.$stel || !this.$stel.core) return

      try {
        const layerId = 'dsolayer'
        this.dsoLayer = this.$stel.createLayer({ id: layerId, z: -100, visible: true, interactive: false })
        // Base path for HiPS
        const baseUrl = window.location.origin + '/hips'

        for (const config of this.dsoHips) {
          try {
            // trailing slash is REQUIRED for HiPS/directory structure?
            // Android Capacitor plugin fails with double slashes (//), so we try without it.
            // The engine likely appends a slash if needed or simply concatenates.
            const absoluteUrl = baseUrl + '/' + config.id

            // Create a separate DSS object for each survey and attach to layer
            // Note: createObj creates unparented object, use layer.add to attach
            const dssObj = this.dsoLayer.add('dss', {
              id: config.id,
              visible: true
            })

            if (dssObj) {
              dssObj.addDataSource({
                url: absoluteUrl,
                key: config.id,
                name: config.name,
                visible: true,
                alpha: 1.0
              })
              this.hipsSurveys.push({
                id: config.id,
                name: config.name,
                obj: dssObj,
                showAtFov: config.showAtFov
              })
            } else {
              console.error('DsoSkyOverlays: Failed to create DSS object for ' + config.id)
            }
          } catch (err) {
            console.error('DsoSkyOverlays: Error adding source ' + config.id, err)
          }
          // Safety delay
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        this.initialized = true
        // Trigger initial visibility update
        this.updateVisibility(this.fov)
      } catch (e) {
        console.error('DsoSkyOverlays: Outer initialization error:', e)
      }
    },

    updateVisibility: function (fov) {
      if (!this.hipsSurveys.length) return
      for (const survey of this.hipsSurveys) {
        const shouldBeVisible = fov < survey.showAtFov
        if (survey.obj) {
          // Check if visibility actually changed to avoid redundant calls
          if (survey.obj.visible !== shouldBeVisible) {
            survey.obj.visible = shouldBeVisible
            // console.log(`DsoSkyOverlays: Toggled ${survey.id} visibility to ${shouldBeVisible} (FOV: ${fov.toFixed(1)})`)
          }
        }
      }
    }
  },

  mounted: function () {
    // Wait for engine to stabilize (3s is sufficient now with DSS module)
    setTimeout(() => {
      this.initOverlays()
    }, 3000)
  },

  beforeDestroy: function () {
    for (const survey of this.hipsSurveys) {
      if (this.dsoLayer && survey.obj) {
        try {
          this.dsoLayer.remove(survey.obj)
          survey.obj.destroy()
        } catch (e) {
          console.error('DsoSkyOverlays: Cleanup error for ' + survey.id, e)
        }
      }
    }
    this.hipsSurveys = []
    if (this.dsoLayer) {
      if (this.$stel) {
        try {
          this.$stel.removeLayer(this.dsoLayer)
        } catch (e) {}
      }
      this.dsoLayer = null
    }
    this.initialized = false
  }
}
</script>
