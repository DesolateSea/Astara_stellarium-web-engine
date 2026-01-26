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
      <v-toolbar-title>About Astara</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <p><strong>Astara</strong> is an open-source mobile planetarium application that transforms your Android device into a powerful astronomical tool. Point at the sky to identify stars, planets, constellations, and deep sky objects in real-time.</p>

      <h3>Our Contributions</h3>
      <p>Built on top of the Stellarium Web Engine, our team added:
        <ul class="about-credits">
          <li>Gyroscope-based sky tracking</li>
          <li>AR Camera Overlay with live camera feed</li>
          <li>Direction Tracking visual guides</li>
          <li>Multiple Sky Cultures (Indian, Chinese, Arabic, etc.)</li>
          <li>Astronomical Calendar with moon phases, eclipses, conjunctions</li>
          <li>Offline-first mobile app design</li>
          <li>Android integration via Capacitor</li>
        </ul>
      </p>

      <h3>Powered By</h3>
      <p><strong>Stellarium Web Engine</strong> - A high-performance astronomical rendering engine by Stellarium Labs SRL.<br>
      <a href="https://github.com/Stellarium/stellarium-web-engine" target="_blank" rel="noopener">https://github.com/Stellarium/stellarium-web-engine</a></p>

      <h3>Source Code</h3>
      <p><a href="https://github.com/DesolateSea/Astara_stellarium-web-engine" target="_blank" rel="noopener">https://github.com/DesolateSea/Astara_stellarium-web-engine</a></p>

      <h3>User Manual</h3>
      <p>For detailed usage instructions, see the <a href="https://github.com/DesolateSea/Astara_stellarium-web-engine/blob/master/docs/user_manual.md" target="_blank" rel="noopener">User Manual</a> in the repository.</p>

      <h3>Data Credits</h3>
      <p>Astara uses astronomical data from multiple sources including Gaia, Hipparcos, HyperLeda, and more.</p>
      <v-btn small outlined color="primary" @click="openDataCredits" class="mb-4">
        View Data Credits
      </v-btn>

      <h3>License</h3>
      <p>Astara is licensed under the <strong>GNU Affero General Public License v3.0</strong> (AGPL-3.0), inherited from Stellarium Web Engine. This means the source code is freely available and any modifications must also be open-sourced under the same license.</p>
      <p><br></p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer><v-btn text class="blue--text darken-1" @click.native="$store.state.showAboutDialog = false">Close</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
export default {
  name: 'AboutDialog',
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
