// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
<v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="$store.state.showAboutDialog">
  <v-card v-if="$store.state.showAboutDialog" style="padding-top: 32px !important;">
    <v-toolbar flat color="transparent" style="padding-top: 16px !important;">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('About Astara') }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p><strong>Astara</strong> {{ $t('is an open-source mobile planetarium application that transforms your Android device into a powerful astronomical tool. Point at the sky to identify stars, planets, constellations, and deep sky objects in real-time.') }}</p>

      <h3>{{ $t('Our Contributions') }}</h3>
      <p>{{ $t('Built on top of the Stellarium Web Engine, our team added:') }}
        <ul class="about-credits">
          <li>{{ $t('Gyroscope-based sky tracking') }}</li>
          <li>{{ $t('AR Camera Overlay with live camera feed') }}</li>
          <li>{{ $t('Direction Tracking visual guides') }}</li>
          <li>{{ $t('Multiple Sky Cultures (Indian, Chinese, Arabic, etc.)') }}</li>
          <li>{{ $t('Astronomical Calendar with moon phases, eclipses, conjunctions') }}</li>
          <li>{{ $t('Offline-first mobile app design') }}</li>
          <li>{{ $t('Android integration via Capacitor') }}</li>
        </ul>
      </p>

      <h3>{{ $t('Powered By') }}</h3>
      <p><strong>Stellarium Web Engine</strong> {{ $t('- A high-performance astronomical rendering engine by Stellarium Labs SRL.') }}<br>
      <a href="https://github.com/Stellarium/stellarium-web-engine" target="_blank" rel="noopener">https://github.com/Stellarium/stellarium-web-engine</a></p>

      <h3>{{ $t('Source Code') }}</h3>
      <p><a href="https://github.com/DesolateSea/Astara_stellarium-web-engine" target="_blank" rel="noopener">https://github.com/DesolateSea/Astara_stellarium-web-engine</a></p>

      <div v-if="!isNativeApp" class="mb-4">
        <h3>{{ $t('Download Mobile App') }}</h3>
        <p>{{ $t('Get Astara on your Android device for gyroscope-based sky tracking, AR camera overlay, and offline star maps.') }}</p>
        <v-btn
          outlined
          color="primary"
          href="https://github.com/DesolateSea/Astara_stellarium-web-engine/releases/download/v1.0.0/app-release.apk"
          target="_blank"
          rel="noopener"
        >
          <v-icon left size="20">mdi-download</v-icon>
          {{ $t('Download APK from GitHub') }}
        </v-btn>
      </div>

      <h3>{{ $t('User Manual') }}</h3>
      <p>{{ $t('For detailed usage instructions, see the') }} <a href="https://github.com/DesolateSea/Astara_stellarium-web-engine/blob/master/docs/user_manual.md" target="_blank" rel="noopener">{{ $t('User Manual') }}</a> {{ $t('in the repository.') }}</p>

      <h3>{{ $t('Data Credits') }}</h3>
      <p>{{ $t('Astara uses astronomical data from multiple sources including Gaia, Hipparcos, HyperLeda, and more.') }}</p>
      <v-btn small outlined color="primary" @click="openDataCredits" class="mb-4">
        {{ $t('View Data Credits') }}
      </v-btn>

      <h3>{{ $t('License') }}</h3>
      <p>{{ $t('Astara is licensed under the') }} <strong>GNU Affero General Public License v3.0</strong> {{ $t('(AGPL-3.0), inherited from Stellarium Web Engine. This means the source code is freely available and any modifications must also be open-sourced under the same license.') }}</p>
      <p><br></p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer><v-btn text class="blue--text darken-1" @click.native="$store.state.showAboutDialog = false">{{ $t('Close') }}</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
export default {
  name: 'AboutDialog',
  computed: {
    isNativeApp () {
      return typeof window !== 'undefined' &&
        window.Capacitor &&
        window.Capacitor.isNativePlatform &&
        window.Capacitor.isNativePlatform()
    }
  },
  methods: {
    goBack () {
      this.$store.state.showAboutDialog = false
      this.$store.state.showSettingsPanel = true
    },
    openDataCredits () {
      this.$store.state.showAboutDialog = false
      this.$store.state.showDataCreditsDialog = true
    }
  }
}
</script>

<style>
.about-credits {
  padding-left: 30px;
}
a {
  color: #82b1ff;
}
</style>
