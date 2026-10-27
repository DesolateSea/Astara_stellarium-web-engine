import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import en from 'vuetify/es5/locale/en'
import de from 'vuetify/es5/locale/de'
import fr from 'vuetify/es5/locale/fr'
import zhHans from 'vuetify/es5/locale/zh-Hans'
import i18n from '@/i18n'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { en, de, fr, 'zh-Hans': zhHans },
    current: i18n.locale
  },
  theme: {
    dark: true
  }
})
