// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
<v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="$store.state.showDataCreditsDialog">
  <v-card v-if="$store.state.showDataCreditsDialog" style="padding-top: 32px !important;">
    <v-toolbar flat color="transparent" style="padding-top: 16px !important;">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('Data Credits') }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <h3>{{ $t('Stars') }}</h3>
      <p>{{ $t('Combination of the following catalogues:') }}
        <ul class="data-credits">
          <li>Gaia DR2: <i>{{ $t('creditsGaiaStart') }}<a href="https://www.cosmos.esa.int/gaia" target="_blank" rel="noopener">https://www.cosmos.esa.int/gaia</a>{{ $t('creditsGaiaProcessing') }} <a href="https://www.cosmos.esa.int/web/gaia/dpac/consortium" target="_blank" rel="noopener">https://www.cosmos.esa.int/web/gaia/dpac/consortium</a>{{ $t('creditsGaiaFunding') }}</i>
          <br>Gaia Collaboration et al. (<a href="https://gea.esac.esa.int/archive/documentation/GDR2/bib.html#bib173" target="_blank" rel="noopener">2016</a>{{ $t('creditsGaiaMission') }}
          <br>Gaia Collaboration et al. (<a href="https://gea.esac.esa.int/archive/documentation/GDR2/bib.html#bib15" target="_blank" rel="noopener">2018b</a>{{ $t('creditsGaiaSurvey') }}
          </li>
          <li>{{ $t('creditsHipparcos') }}<br>
          ref. ESA, 1997, The Hipparcos and Tycho Catalogues, ESA SP-1200
          <a href="http://cdsweb.u-strasbg.fr/ftp/cats/I/239" target="_blank" rel="noopener">http://cdsweb.u-strasbg.fr/ftp/cats/I/239</a></li>
          <li>{{ $t('creditsBrightStars') }}<br>
          <a href="http://cdsarc.u-strasbg.fr/ftp/pub/cats/V/50/" target="_blank" rel="noopener">http://cdsarc.u-strasbg.fr/ftp/pub/cats/V/50/</a></li>
        </ul>
      </p>
      <h3>{{ $t('Deep Sky Objects') }}</h3>
      <p>{{ $t('Combination of the following catalogues:') }}
        <ul class="data-credits">
          <li>{{ $t('creditsHyperLeda') }} <i>Makarov et al.</i> <a href="http://adsabs.harvard.edu/abs/2014A%26A...570A..13M" target="_blank" rel="noopener">2014, A&A, 570, A13</a>: <a href="http://leda.univ-lyon1.fr" target="_blank" rel="noopener">http://leda.univ-lyon1.fr</a>.</li>
          <li>{{ $t('creditsSimbadQueries') }} <i>{{ $t('creditsSimbadAcknowledgment') }}</i><br>
          <a href="http://adsabs.harvard.edu/abs/2000A%26AS..143....9W" target="_blank" rel="noopener">2000,A&AS,143,9</a>, "The SIMBAD astronomical database", Wenger et al.</li>
          <li>{{ $t('creditsOpenNGC') }} <a href="https://github.com/mattiaverga/OpenNGC" target="_blank" rel="noopener">https://github.com/mattiaverga/OpenNGC</a></li>
          <li>{{ $t('creditsCaldwell') }} <a href="https://fr.wikipedia.org/wiki/Liste_des_objets_de_Caldwell" target="_blank" rel="noopener">{{ $t('from wikipedia') }}</a></li>
          <li>{{ $t('Descriptions and some data taken from wikipedia') }}</li>
        </ul>
      </p>
      <h3>{{ $t('Background Image') }}</h3>
      <p>{{ $t('creditsDSS') }}
        <ul class="data-credits">
          <li>STScI/NASA <a href="http://archive.stsci.edu/dss/copyright.html" target="_blank" rel="noopener">http://archive.stsci.edu/dss/copyright.html</a>{{ $t('creditsDSSProcessing') }}</li>
          <li><i>{{ $t('creditsDSSAcknowledgment') }}</i></li>
        </ul>
      </p>
      <h3>{{ $t('Planets Image') }}</h3>
      <p>{{ $t('All images from NASA & JPL under public domain license:') }} <a href="http://www.jpl.nasa.gov/images/policy/index.cfm" target="_blank" rel="noopener">http://www.jpl.nasa.gov/images/policy/index.cfm</a></p>
      <p><br>
      </p>
      <h3>{{ $t('Minor Planets') }}</h3>
      <p>{{ $t('All data comes from the IAU Minor Planet Center') }} <a href="https://www.minorplanetcenter.net/data" target="_blank" rel="noopener">https://www.minorplanetcenter.net/data</a>. <i>{{ $t('creditsMPCAcknowledgment') }}</i></p>
      <h3>{{ $t('Others') }}</h3>
      <p>{{ $t('Landscape images by Fabien Chereau') }}</p>
      <p>{{ $t('Constellation lines by Fabien Chereau') }}</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer><v-btn text class="blue--text darken-1" @click.native="$store.state.showDataCreditsDialog = false">{{ $t('Close') }}</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
export default {
  methods: {
    goBack () {
      this.$store.state.showDataCreditsDialog = false
      this.$store.state.showAboutDialog = true
    }
  }
}
</script>

<style>
.data-credits {
  padding-left: 30px;
}
a {
  color: #82b1ff;
}
</style>
