import '@mdi/font/css/materialdesignicons.css'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import i18n from '@/i18n'
import { languages } from '@/locale'

Vue.use(Vuetify)

const bundledLocales = require.context('vuetify/es5/locale', false, /\.js$/)
const locales = {}
languages.forEach(language => {
  const key = './' + (language.vuetify || language.value) + '.js'
  locales[language.value] = bundledLocales(bundledLocales.keys().includes(key) ? key : './en.js').default
})

export default new Vuetify({
  rtl: languages.find(language => language.value === i18n.locale).dir === 'rtl',
  lang: {
    locales,
    current: i18n.locale
  },
  theme: {
    dark: true
  }
})
